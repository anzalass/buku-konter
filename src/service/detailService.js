import { PrismaClient } from "@prisma/client";
import { createLog } from "./logService.js";
const prisma = new PrismaClient();

export const getDetailTransaksi = async (id, idToko) => {
  const data = await prisma.transaksi.findFirst({
    where: {
      id,
      idToko,
    },
    include: {
      Member: {
        select: {
          id: true,
          nama: true,
        },
      },
      items: {
        include: {
          Produk: true,
        },
      },
    },
  });

  if (!data) return null;

  return {
    ...data,
    namaMember: data.Member?.nama || data.namaPembeli || "Umum",
  };
};

export const getDetailServiceHP = async (id, idToko) => {
  const data = await prisma.serviceHP.findFirst({
    where: {
      id,
      idToko,
    },
    include: {
      Member: {
        select: {
          id: true,
          nama: true,
        },
      },
      Sparepart: {
        include: {
          Produk: true,
        },
      },
      klaimGaransi: {
        include: {
          item: {
            include: {
              Product: true,
            },
          },
        },
      },
    },
  });

  if (!data) return null;

  return {
    ...data,
    namaMember: data.Member?.nama || data.namaPelangan || "Umum",
  };
};

export const getDetailJualanHarian = async (id, idToko) => {
  const data = await prisma.jualanHarian.findFirst({
    where: {
      id,
      idToko,
    },
    include: {
      Member: {
        select: {
          id: true,
          nama: true,
        },
      },
    },
  });

  if (!data) return null;

  return {
    ...data,
    namaMember: data.Member?.nama || "Umum",
  };
};
export const getDetailVoucherHarian = async (id, idToko) => {
  const data = await prisma.transaksiVoucherHarian.findFirst({
    where: {
      id,
      idToko,
      deletedAt: null,
    },
    include: {
      Produk: true,
      Member: {
        select: {
          id: true,
          nama: true,
        },
      },
    },
  });

  if (!data) return null;

  return {
    ...data,
    namaMember: data.Member?.nama || "Umum",
  };
};

export const getDetailUangKeluar = async (id, idToko) => {
  const data = await prisma.uangKeluar.findFirst({
    where: {
      id,
      idToko,
    },
  });

  if (!data) return null;

  return {
    ...data,
    namaMember: "-", // ga ada member
  };
};
