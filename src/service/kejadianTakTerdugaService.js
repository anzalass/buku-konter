import { PrismaClient } from "@prisma/client";
import { createLog } from "./logService.js";

const prisma = new PrismaClient();

// 🔥 CREATE
export const createKejadian = async (data, user) => {
  const { nominal, keterangan } = data;

  if (!nominal || nominal <= 0) {
    throw new Error("Nominal wajib diisi");
  }

  const result = await prisma.kejadianTakTerduga.create({
    data: {
      nominal,
      keterangan,
      idToko: user.toko_id,
    },
  });

  // 🔥 LOG
  await createLog({
    kategori: "Pengeluaran",
    keterangan: `${user.nama} menambahkan kejadian: ${keterangan}`,
    nominal,
    nama: user.nama,
    idToko: user.toko_id,
  });

  return result;
};

// 🔥 GET ALL
export const getAllKejadian = async (query, user) => {
  const { startDate, endDate, q } = query;

  return await prisma.kejadianTakTerduga.findMany({
    where: {
      idToko: user.toko_id,

      // 🔥 filter tanggal
      ...(startDate && endDate
        ? {
            createdAt: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          }
        : {}),

      // 🔥 filter search keterangan
      ...(q
        ? {
            keterangan: {
              contains: q,
              mode: "insensitive", // biar ga case-sensitive
            },
          }
        : {}),
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};

// 🔥 GET DETAIL
export const getDetailKejadian = async (id, user) => {
  const data = await prisma.kejadianTakTerduga.findFirst({
    where: {
      id,
      idToko: user.toko_id,
    },
  });

  if (!data) throw new Error("Data tidak ditemukan");

  return data;
};

// 🔥 UPDATE
export const updateKejadian = async (id, data, user) => {
  const exist = await prisma.kejadianTakTerduga.findFirst({
    where: { id, idToko: user.toko_id },
  });

  if (!exist) throw new Error("Data tidak ditemukan");

  const result = await prisma.kejadianTakTerduga.update({
    where: { id },
    data: {
      nominal: data.nominal,
      keterangan: data.keterangan,
    },
  });

  // 🔥 LOG
  await createLog({
    kategori: "Pengeluaran",
    keterangan: `${user.nama} mengupdate kejadian: ${data.keterangan}`,
    nominal: data.nominal,
    nama: user.nama,
    idToko: user.toko_id,
  });

  return result;
};

// 🔥 DELETE
export const deleteKejadian = async (id, user) => {
  const exist = await prisma.kejadianTakTerduga.findFirst({
    where: { id, idToko: user.toko_id },
  });

  if (!exist) throw new Error("Data tidak ditemukan");

  await prisma.kejadianTakTerduga.delete({
    where: { id },
  });

  // 🔥 LOG
  await createLog({
    kategori: "Pengeluaran",
    keterangan: `${user.nama} menghapus kejadian: ${exist.keterangan}`,
    nominal: exist.nominal,
    nama: user.nama,
    idToko: user.toko_id,
  });

  return true;
};
