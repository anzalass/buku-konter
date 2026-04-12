// src/services/transaksiHarian.service.js
import { PrismaClient } from "@prisma/client";
import { createLog } from "./logService.js";

const prisma = new PrismaClient();

/* =========================
   CREATE JUALAN HARIAN
========================= */
export const createJualanHarian = async ({
  kategori,
  nominal,
  idMember,
  user,
  idToko,
}) => {
  try {
    if (!kategori || !nominal) {
      throw new Error("Kategori dan nominal wajib diisi");
    }

    return await prisma.$transaction(async (tx) => {
      const jualan = await tx.jualanHarian.create({
        data: {
          kategori,
          ...(idMember && {
            Member: {
              connect: { id: idMember },
            },
          }),

          User: {
            connect: {
              id: user.id,
            },
          },

          tanggal: new Date(),
          Toko: {
            connect: {
              id: idToko,
            },
          },
          nominal,
        },
      });

      await createLog(
        {
          kategori: "Trx Harian",
          keterangan: `${user.nama} telah melakukan transaksi harian`,
          nominal: nominal,
          nama: user.nama,
          idToko: idToko,
        },
        tx
      );

      return jualan;
    });
  } catch (error) {
    console.error("Error createJualanHarian:", error);
    throw new Error("Gagal membuat transaksi harian");
  }
};

/* =========================
   DELETE JUALAN HARIAN (SOFT DELETE)
========================= */
export const deleteJualanHarian = async (id, user) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const jualan = await tx.jualanHarian.findUnique({
        where: { id },
      });

      if (!jualan) {
        throw new Error("Transaksi harian tidak ditemukan");
      }

      await tx.jualanHarian.update({
        where: { id },
        data: {
          deletedAt: new Date(),
        },
      });

      await createLog(
        {
          kategori: "Trx Harian",
          keterangan: `${user.nama} menghapus transaksi harian`,
          nominal: jualan.nominal,
          nama: user.nama,
          idToko: user.toko_id,
        },
        tx
      );

      return true;
    });
  } catch (error) {
    console.error("Error deleteJualanHarian:", error);
    throw new Error("Gagal menghapus transaksi harian");
  }
};
