// src/services/serviceHP.service.js
import { PrismaClient, StatusServis } from "@prisma/client";
import { prismaErrorHandler } from "../utils/errorHandlerPrisma.js";
import { createLog } from "./logService.js";
import { toUTCFromWIBRange } from "../utils/wibMiddleware.js";

const prisma = new PrismaClient();

/**
 * Buat transaksi service HP
 * @param {Object} data - { brandHP, keterangan, status, biayaJasa, sparePart }
 */
export const createServiceHP = async (data, user) => {
  try {
    const {
      brandHP,
      keterangan,
      status,
      biayaJasa,
      sparePart = [],
      idMember,
      noHP,
      namaPelanggan,
    } = data;

    console.log(status);

    if (!brandHP || !keterangan || !status || biayaJasa == null || !noHP) {
      throw new Error("Field wajib tidak lengkap");
    }

    const generateRandomCode = (length = 8) => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      return Array.from(
        { length },
        () => chars[Math.floor(Math.random() * chars.length)]
      ).join("");
    };

    return await prisma.$transaction(async (tx) => {
      let totalHargaSparepart = 0;
      let totalKeuntunganSparepart = 0;
      const sparepartItems = [];

      for (const item of sparePart) {
        const { id, qty } = item;

        if (!id || !qty || qty <= 0) {
          throw new Error("Item sparepart tidak valid");
        }

        const sparepart = await tx.produk.findUnique({
          where: { id },
        });

        if (!sparepart) {
          throw new Error("Sparepart tidak ditemukan");
        }

        if (sparepart.stok < qty) {
          throw new Error(`Stok ${sparepart.nama} tidak cukup`);
        }

        const hargaTotal = sparepart.hargaModal * qty;
        const keuntungan = (sparepart.hargaEceran - sparepart.hargaModal) * qty;

        totalHargaSparepart += hargaTotal;
        totalKeuntunganSparepart += keuntungan;

        sparepartItems.push({
          idSparepart: sparepart.id,
          quantity: qty,
        });
      }

      const totalKeuntungan = totalKeuntunganSparepart + Number(biayaJasa);

      const service = await tx.serviceHP.create({
        data: {
          brandHP,
          keterangan,
          statusServis: status,
          tanggal: new Date(),
          noHP,
          Toko: {
            connect: { id: user.toko_id },
          },
          namaPelangan: namaPelanggan || generateRandomCode(),
          biayaJasa: Number(biayaJasa),
          hargaSparePart: totalHargaSparepart,
          keuntungan: totalKeuntungan,

          ...(idMember && {
            Member: {
              connect: { id: idMember },
            },
          }),
          User: {
            connect: { id: user.id },
          },
          Sparepart: {
            create: sparepartItems.map((item) => ({
              Produk: {
                connect: { id: item.idSparepart },
              },
              quantity: item.quantity,
              Toko: {
                connect: { id: user.toko_id },
              },
            })),
          },
        },
      });

      for (const item of sparepartItems) {
        await tx.produk.update({
          where: { id: item.idSparepart },
          data: {
            stok: { decrement: item.quantity },
          },
        });
      }

      await createLog(
        {
          kategori: "Service HP",
          keterangan: `${user.nama} menambah service HP`,
          nominal: service.keuntungan,
          nama: user.nama,
          idToko: user.toko_id,
        },
        tx
      );

      return service;
    });
  } catch (error) {
    console.error("Error createServiceHP:", error);
    throw new Error("Gagal membuat service HP");
  }
};
export const updateServiceHPStatus = async (id, payload, user) => {
  try {
    const { status, garansiDate } = payload;
    console.log(status);

    const allowedStatus = [
      "Pending",
      "Selesai",
      "Proses",
      "Gagal",
      "Batal",
      "Sudah Diambil",
    ];

    if (!allowedStatus.includes(status)) {
      throw new Error("Status tidak valid");
    }

    return await prisma.$transaction(async (tx) => {
      const service = await tx.serviceHP.findUnique({
        where: { id },
      });

      if (!service) {
        throw new Error("Service tidak ditemukan");
      }

      // 🔥 tentukan garansi
      let finalGaransi = null;

      if (status === "Sudah Diambil") {
        finalGaransi = garansiDate ? new Date(garansiDate) : null;
      }

      const updated = await tx.serviceHP.update({
        where: { id },
        data: {
          statusServis: status === "Sudah Diambil" ? "Selesai" : status, // 🔥 FIX field
          statusAmbil:
            status === "Sudah Diambil" ? "SudahDiambil" : service.statusAmbil,
          garansiBerakhir: finalGaransi, // 🔥 NEW
          garansiMulai: status === "Sudah Diambil" ? new Date() : null,
          tanggalAmbil: new Date(),
          statusGaransi: finalGaransi ? "Belum Di Klaim" : null,
        },
      });

      await createLog(
        {
          kategori: "Service HP",
          keterangan: `${user.nama} mengubah status service "${service.keterangan}" menjadi ${status}`,
          nama: user.nama,
          idToko: user.toko_id,
        },
        tx
      );

      return updated;
    });
  } catch (error) {
    console.error("Error updateServiceHPStatus:", error);
    throw new Error("Gagal update status service");
  }
};
export const deleteServiceHP = async (id, user) => {
  try {
    return await prisma.$transaction(async (tx) => {
      // =========================
      // GET SERVICE
      // =========================
      const service = await tx.serviceHP.findFirst({
        where: {
          id,
          idToko: user.toko_id,
          deletedAt: null, // 🔥 penting
        },
        include: {
          Sparepart: {
            where: {
              deletedAt: null, // 🔥 biar ga double
            },
          },
        },
      });

      if (!service) {
        throw new Error("Service tidak ditemukan / sudah dihapus");
      }

      // =========================
      // BALIKIN STOK PRODUK
      // =========================
      for (const item of service.Sparepart) {
        await tx.produk.update({
          where: { id: item.idProduk }, // ✅ FIX
          data: {
            stok: {
              increment: item.quantity,
            },
          },
        });
      }

      const now = new Date();

      // =========================
      // SOFT DELETE SPAREPART
      // =========================
      await tx.sparepartServiceHP.updateMany({
        where: {
          idServiceHP: id,
          deletedAt: null, // 🔥 biar ga ke update lagi
        },
        data: { deletedAt: now },
      });

      // =========================
      // SOFT DELETE SERVICE
      // =========================
      await tx.serviceHP.update({
        where: { id },
        data: { deletedAt: now },
      });

      // =========================
      // LOGGING
      // =========================
      await createLog(
        {
          kategori: "Service HP",
          keterangan: `${user.nama} menghapus service ${service.keterangan}`,
          nominal: service.keuntungan || 0,
          nama: user.nama,
          idToko: user.toko_id,
        },
        tx
      );

      return {
        success: true,
        message: "Service berhasil dihapus",
      };
    });
  } catch (error) {
    console.error("Error deleteServiceHP:", error);
    throw new Error(error.message || "Gagal menghapus service HP");
  }
};
// ✅ GET ALL dengan filter & pagination
export const getAllServiceHP = async ({
  page = 1,
  pageSize = 10,
  search = "",
  status,
  startDate,
  endDate,
  idToko,
  deletedFilter = "active", // ✅ tambahan
}) => {
  const skip = (Number(page) - 1) * Number(pageSize);
  const take = Number(pageSize);

  const where = {};
  where.idToko = idToko;
  if (deletedFilter === "active") {
    where.deletedAt = null;
  } else if (deletedFilter === "deleted") {
    where.deletedAt = { not: null };
  }
  // Filter pencarian (namaPembeli = brandHP di model)
  if (search) {
    where.OR = [
      { brandHP: { contains: search, mode: "insensitive" } },
      { namaPelangan: { contains: search, mode: "insensitive" } },
      { keterangan: { contains: search, mode: "insensitive" } },
    ];
  }
  // Filter status
  if (status && status !== "all") {
    where.status = status;
  }

  if (startDate || endDate) {
    const range = toUTCFromWIBRange(startDate, endDate);

    where.tanggal = {
      ...(range.gte && { gte: range.gte }),
      ...(range.lte && { lte: range.lte }),
    };
  }

  const [data, total] = await prisma.$transaction([
    prisma.serviceHP.findMany({
      where,
      // skip,
      // take,
      orderBy: { tanggal: "desc" },
      include: {
        Sparepart: {
          include: {
            Sparepart: {
              select: { nama: true, hargaModal: true, hargaJual: true },
            },
          },
        },
        Member: {
          select: {
            nama: true,
            noTelp: true,
          },
        },
      },
    }),
    prisma.serviceHP.count({ where }),
  ]);

  // Format data ke frontend
  const formatted = data.map((svc) => {
    const totalKeuntunganSparepart = svc.Sparepart.reduce((sum, item) => {
      const modal = item.Sparepart.hargaModal || 0;
      const jual = item.Sparepart.hargaJual || 0;
      return sum + item.quantity * (jual - modal);
    }, 0);

    const totalKeuntungan = totalKeuntunganSparepart + svc.biayaJasa;

    return {
      id: svc.id,
      namaPembeli: svc.namaPelangan, // frontend: namaPembeli = brandHP
      keterangan: svc.keterangan,
      brandHP: svc.brandHP,
      biayaJasa: svc.biayaJasa,
      tanggal: svc.createdAt,
      status: svc.status,
      member: svc.Member,
      noHP: svc.noHP,
      keuntungan: totalKeuntungan,
      detail: {
        itemTransaksi: svc.Sparepart.map((item) => ({
          id: item.id,
          namaProduk: item.Sparepart.nama,
          qty: item.quantity,
          hargaPokok: item.Sparepart.hargaModal || 0,
          hargaJual: item.Sparepart.hargaJual || 0,
        })),
      },
    };
  });

  return {
    data: formatted,
    meta: {
      page: Number(page),
      pageSize: take,
      total,
      totalPages: Math.ceil(total / take),
    },
  };
};

export const getDetailServiceHP = async (id, user) => {
  const transaksi = await prisma.serviceHP.findUnique({
    where: { id },
    include: {
      Member: true,
      Sparepart: {
        include: {
          Sparepart: true, // ambil detail nama & harga sparepart
        },
      },
    },
  });

  if (!transaksi) {
    throw new Error("Service tidak ditemukan");
  }

  const toko = await prisma.toko.findUnique({
    where: {
      id: user.toko_id,
    },
  });

  return {
    namaToko: toko.namaToko,
    logoToko: toko.logoToko,
    alamat: toko.alamat,
    noTelp: toko.noTelp,
    transaksi,
  };
};

// 🔥 CREATE KLAIM
export const createKlaimGaransi = async (data, user) => {
  const { idService, keterangan, items = [] } = data;

  if (!idService) throw new Error("Service wajib diisi");

  return await prisma.$transaction(async (tx) => {
    const service = await tx.serviceHP.findUnique({
      where: { id: idService },
    });

    if (!service) throw new Error("Service tidak ditemukan");

    // 🔥 VALIDASI + HITUNG
    for (const item of items) {
      if (
        !item.idProduct ||
        !item.quantityProduct ||
        item.quantityProduct <= 0
      ) {
        throw new Error("Item klaim tidak valid");
      }

      const produk = await tx.produk.findUnique({
        where: { id: item.idProduct },
      });

      if (!produk) {
        throw new Error("Produk tidak ditemukan");
      }

      if (produk.stok < item.quantityProduct) {
        throw new Error(`Stok ${produk.nama} tidak cukup`);
      }
    }

    // 🔥 CREATE KLAIM
    const klaim = await tx.klaimGaransi.create({
      data: {
        ServiceHP: {
          connect: { id: idService },
        },
        Toko: {
          connect: { id: user.toko_id },
        },
        keterangan,
        item: {
          create: items.map((i) => ({
            idProduct: i.idProduct,
            quantityProduct: i.quantityProduct,
            keterangan: i.keterangan,
            idToko: user.toko_id,
            idService,
          })),
        },
      },
      include: {
        item: true,
      },
    });

    // 🔥 KURANGI STOK
    for (const item of items) {
      await tx.produk.update({
        where: { id: item.idProduct },
        data: {
          stok: { decrement: item.quantityProduct },
        },
      });
    }

    // 🔥 OPTIONAL: update status garansi
    // await tx.serviceHP.update({
    //   where: { id: idService },
    //   data: {
    //     // contoh kalau mau tandain sudah pernah klaim
    //     // (optional tergantung flow lu)
    //     // statusGaransi: "Sudah Klaim"
    //   },
    // });

    await createLog(
      {
        kategori: "Klaim Garansi",
        keterangan: `${user.nama} membuat klaim garansi`,
        nama: user.nama,
        idToko: user.toko_id,
      },
      tx
    );

    return klaim;
  });
};

export const deleteKlaimGaransi = async (id) => {
  return await prisma.$transaction(async (tx) => {
    // 1. ambil klaim + items
    const klaim = await tx.klaimGaransi.findUnique({
      where: { id },
      include: {
        item: true,
      },
    });

    if (!klaim) {
      throw new Error("Klaim tidak ditemukan");
    }

    if (klaim.deletedAt) {
      throw new Error("Klaim sudah dihapus");
    }

    // 2. balikin stok
    for (const item of klaim.item) {
      if (!item.idProduct) continue;

      await tx.produk.update({
        where: { id: item.idProduct },
        data: {
          stok: {
            increment: item.quantityProduct, // 🔥 BALIKIN
          },
        },
      });
    }

    // 3. soft delete klaim
    const deleted = await tx.klaimGaransi.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return deleted;
  });
};
