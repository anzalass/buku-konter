import { PrismaClient } from "@prisma/client";
import { createLog } from "./logService.js";

const prisma = new PrismaClient();

/* =========================
   CREATE JUALAN VOUCHER
========================= */
export const createJualan = async (data, user) => {
  try {
    return await prisma.$transaction(async (tx) => {
      // 1️⃣ Ambil voucher
      console.log(user);

      const voucher = await tx.produk.findUnique({
        where: { id: data?.idVoucher },
      });

      if (!voucher) {
        throw new Error("Voucher tidak ditemukan");
      }

      if (voucher.stok <= 0) {
        throw new Error("Stok voucher habis");
      }

      const keuntungan = voucher.hargaEceran - voucher.hargaModal;

      // 2️⃣ Buat transaksi
      const transaksi = await tx.transaksiVoucherHarian.create({
        data: {
          keuntungan,
          ...(data.idMember && {
            Member: {
              connect: { id: data.idMember },
            },
          }),
          User: {
            connect: {
              id: user.id,
            },
          },

          Toko: {
            connect: { id: user.toko_id },
          },
          Produk: {
            connect: { id: voucher.id }, // ✅ ini yang benar
          },
        },
      });

      // 3️⃣ Kurangi stok
      await tx.produk.update({
        where: { id: voucher.id },
        data: {
          stok: {
            decrement: 1,
          },
          terjual: {
            increment: 1,
          },
        },
      });

      // 4️⃣ Log transaksi
      await createLog(
        {
          kategori: "Jualan Voucher Harian",
          keterangan: `${user.nama} menjual voucher ${voucher.nama}`,
          nominal: keuntungan,
          nama: user.nama,
          idToko: user.toko_id,
        },
        tx
      );

      return transaksi;
    });
  } catch (error) {
    console.error("Error createJualan:", error);
    throw new Error("Gagal membuat transaksi voucher");
  }
};

export const deleteTransaksiVoucher = async (idTransaksi, user) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const transaksi = await tx.transaksiVoucherHarian.findUnique({
        where: { id: idTransaksi },
        include: { Produk: true },
      });

      if (!transaksi) {
        throw new Error("Transaksi tidak ditemukan");
      }

      const voucher = transaksi.Produk;

      if (!voucher) {
        throw new Error("Voucher terkait tidak ditemukan");
      }

      const now = new Date();
      const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000);

      // 1️⃣ Soft delete transaksi
      await tx.transaksiVoucherHarian.update({
        where: { id: idTransaksi },
        data: {
          deletedAt: wib,
        },
      });

      // 2️⃣ Kembalikan stok
      await tx.produk.update({
        where: { id: voucher.id },
        data: {
          stok: {
            increment: 1,
          },
        },
      });

      // 3️⃣ Log
      await createLog(
        {
          kategori: "Jualan Voucher Harian",
          keterangan: `${user.nama} menghapus transaksi voucher ${voucher.nama}`,
          nominal: voucher.hargaEceran,
          nama: user.nama,
          idToko: user.toko_id,
        },
        tx
      );

      return {
        success: true,
        message: "Transaksi berhasil dihapus dan stok dikembalikan",
        restoredStok: voucher.stok + 1,
      };
    });
  } catch (error) {
    console.error("Error deleteTransaksiVoucher:", error);
    throw new Error(error.message || "Gagal menghapus transaksi");
  }
};
