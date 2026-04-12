// utils/queryHelper.js

import { PrismaClient } from "@prisma/client";
import { createLog } from "./logService.js";
const prisma = new PrismaClient();

const toUTCStartOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000);
};

const toUTCEndOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000);
};

export const getDateRange = ({ periode, startDate, endDate }) => {
  const now = new Date();
  let start;
  let end = new Date();

  switch (periode) {
    case "harian":
      start = new Date();
      start.setHours(0, 0, 0, 0);

      end.setHours(23, 59, 59, 999);
      return { gte: start, lte: end };

    case "mingguan":
      start = new Date();
      start.setDate(now.getDate() - 6);
      start.setHours(0, 0, 0, 0);

      end.setHours(23, 59, 59, 999);
      return { gte: start, lte: end };

    case "bulanan":
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      start.setHours(0, 0, 0, 0);

      end.setHours(23, 59, 59, 999);
      return { gte: start, lte: end };

    case "custom":
      return {
        gte: startDate
          ? new Date(new Date(startDate).setHours(0, 0, 0, 0))
          : new Date(0),
        lte: endDate
          ? new Date(new Date(endDate).setHours(23, 59, 59, 999))
          : new Date(),
      };

    default:
      return {};
  }
};
export const getPagination = ({ page = 1, pageSize = 10 }) => {
  const skip = (page - 1) * pageSize;
  return { skip, take: pageSize };
};

export const getAllTransaksi = async (params) => {
  const {
    idToko,
    search = "",
    isActive = true,
    periode = "mingguan",
    startDate,
    endDate,
    page = 1,
    pageSize = 10,
  } = params;

  const { skip, take } = getPagination({ page, pageSize });

  const where = {
    idToko,
    deletedAt: isActive ? null : { not: null },
    tanggal: getDateRange({ periode, startDate, endDate }),
    ...(search && {
      OR: [
        { namaPembeli: { contains: search, mode: "insensitive" } },
        { Member: { nama: { contains: search, mode: "insensitive" } } },
      ],
    }),
  };
  const [data, total, sum] = await Promise.all([
    prisma.transaksi.findMany({
      where,
      include: { Member: true },
      orderBy: { tanggal: "desc" },
      skip,
      take,
    }),
    prisma.transaksi.count({ where }),
    prisma.transaksi.aggregate({
      where,
      _sum: {
        totalHarga: true,
        keuntungan: true,
      },
    }),
  ]);

  return {
    data,
    total,
    page,
    pageSize,
    summary: {
      totalData: total,
      omset: sum._sum.totalHarga || 0,
      keuntungan: sum._sum.keuntungan || 0,
    },
  };
};
export const getAllVoucher = async (params) => {
  const {
    idToko,
    search = "",
    isActive = true,
    periode = "mingguan",
    startDate,
    endDate,
    page = 1,
    pageSize = 10,
  } = params;

  const { skip, take } = getPagination({ page, pageSize });

  const where = {
    idToko,
    deletedAt: isActive ? null : { not: null },
    createdAt: getDateRange({ periode, startDate, endDate }),
    OR: [
      { Member: { nama: { contains: search, mode: "insensitive" } } },
      { Produk: { nama: { contains: search, mode: "insensitive" } } },
    ],
  };

  const [data, total, keuntunganAgg] = await Promise.all([
    prisma.transaksiVoucherHarian.findMany({
      where,
      include: { Member: true, Produk: true },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.transaksiVoucherHarian.count({ where }),
    prisma.transaksiVoucherHarian.aggregate({
      where,
      _sum: {
        keuntungan: true,
      },
    }),
  ]);

  // 🔥 OMSET MANUAL (karena dari relasi)
  const omset = data.reduce((acc, v) => acc + (v.Produk?.hargaEceran || 0), 0);

  return {
    data,
    total,
    page,
    pageSize,
    summary: {
      totalData: total,
      omset,
      keuntungan: keuntunganAgg._sum.keuntungan || 0,
    },
  };
};

export const getAllServiceHP = async (params) => {
  const {
    idToko,
    search = "",
    isActive = true,
    periode = "mingguan",
    startDate,
    endDate,
    page = 1,
    pageSize = 10,
  } = params;

  const { skip, take } = getPagination({ page, pageSize });

  const where = {
    idToko,
    deletedAt: isActive ? null : { not: null },
    tanggal: getDateRange({ periode, startDate, endDate }),
    OR: [
      { namaPelangan: { contains: search, mode: "insensitive" } },
      { brandHP: { contains: search, mode: "insensitive" } },
      { Member: { nama: { contains: search, mode: "insensitive" } } },
    ],
  };

  const [data, total, sum] = await Promise.all([
    prisma.serviceHP.findMany({
      where,
      include: { Member: true },
      orderBy: { tanggal: "desc" },
      skip,
      take,
    }),
    prisma.serviceHP.count({ where }),
    prisma.serviceHP.aggregate({
      where,
      _sum: {
        biayaJasa: true,
        hargaSparePart: true,
        keuntungan: true,
      },
    }),
  ]);

  return {
    data,
    total,
    page,
    pageSize,
    summary: {
      totalData: total,
      omset: (sum._sum.biayaJasa || 0) + (sum._sum.hargaSparePart || 0),
      keuntungan: sum._sum.keuntungan || 0,
    },
  };
};

export const getAllJualanHarian = async (params) => {
  const {
    idToko,
    search = "",
    isActive = true,
    periode = "mingguan",
    startDate,
    endDate,
    page = 1,
    pageSize = 10,
  } = params;

  const { skip, take } = getPagination({ page, pageSize });

  const where = {
    idToko,
    deletedAt: isActive ? null : { not: null },
    createdAt: getDateRange({ periode, startDate, endDate }),
    OR: [
      { Member: { nama: { contains: search, mode: "insensitive" } } },
      { kategori: { contains: search, mode: "insensitive" } },
    ],
  };

  const [data, total, sum] = await Promise.all([
    prisma.jualanHarian.findMany({
      where,
      include: { Member: true },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.jualanHarian.count({ where }),
    prisma.jualanHarian.aggregate({
      where,
      _sum: {
        nominal: true,
      },
    }),
  ]);

  return {
    data,
    total,
    page,
    pageSize,
    summary: {
      totalData: total,
      omset: sum._sum.nominal || 0,
      keuntungan: sum._sum.nominal || 0, // opsional
    },
  };
};
