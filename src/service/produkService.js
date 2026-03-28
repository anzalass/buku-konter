import { PrismaClient } from "@prisma/client";
import { prismaErrorHandler } from "../utils/errorHandlerPrisma.js";
import { createLog } from "./logService.js";
import { toUTCFromWIBRange } from "../utils/wibMiddleware.js";

const prisma = new PrismaClient();

export const createProduk = async (data, user) => {
  try {
    const produk = await prisma.produk.create({
      data: {
        nama: data.nama,
        kategori: data.kategori,
        sub_kategori: data.sub_kategori,
        brand: data.brand,
        penempatan: data.penempatan,
        hargaModal: parseInt(data.hargaModal),
        hargaGrosir: data.hargaGrosir
          ? parseInt(data.hargaGrosir)
          : parseInt(data.hargaEceran),
        hargaEceran: parseInt(data.hargaEceran),
        stok: data.stok ? parseInt(data.stok) : 0,
        idToko: user.toko_id,
      },
    });

    await createLog({
      idToko: user.toko_id,
      kategori: "Produk",
      keterangan: `${user.nama} menambahkan produk ${produk.nama}`,
      nama: user.nama,
    });

    return produk;
  } catch (error) {
    console.log(error);

    if (error instanceof Error) {
      throw error;
    }
    throw new Error(prismaErrorHandler(error));
  }
};

export const updateProduk = async (id, data, user) => {
  try {
    const produk = await prisma.produk.update({
      where: { id },
      data: {
        ...(data.nama !== undefined && { nama: data.nama }),
        ...(data.kategori !== undefined && { kategori: data.kategori }),
        ...(data.sub_kategori !== undefined && {
          sub_kategori: data.sub_kategori,
        }),
        ...(data.brand !== undefined && { brand: data.brand }),
        ...(data.penempatan !== undefined && {
          penempatan: data.penempatan,
        }),
        ...(data.hargaModal !== undefined && {
          hargaModal: data.hargaModal ? parseInt(data.hargaModal) : null,
        }),
        ...(data.hargaGrosir !== undefined && {
          hargaGrosir: data.hargaGrosir ? parseInt(data.hargaGrosir) : null,
        }),
        ...(data.hargaEceran !== undefined && {
          hargaEceran: data.hargaEceran ? parseInt(data.hargaEceran) : null,
        }),
        ...(data.stok !== undefined && {
          stok: data.stok ? parseInt(data.stok) : null,
        }),
      },
    });

    await createLog({
      idToko: user.toko_id,
      kategori: "Produk",
      keterangan: `${user.nama} mengupdate produk ${produk.nama}`,
      nama: user.nama,
    });

    return produk;
  } catch (error) {
    console.log(error);

    if (error instanceof Error) {
      throw error;
    }
    throw new Error(prismaErrorHandler(error));
  }
};

export const updateStokProduk = async (id, qty, type, user) => {
  try {
    const produk = await prisma.produk.findUnique({
      where: { id },
    });

    if (!produk) throw new Error("Produk tidak ditemukan");

    let newStok = produk.stok || 0;

    if (type === "tambah") {
      newStok += qty;
    } else if (type === "kurang") {
      if (newStok < qty) {
        throw new Error("Stok tidak cukup");
      }
      newStok -= qty;
    }

    const updated = await prisma.produk.update({
      where: { id },
      data: {
        stok: newStok,
      },
    });

    await createLog({
      idToko: user.toko_id,
      kategori: "Produk",
      keterangan: `${user.nama} update stok ${produk.nama} (${type} ${qty})`,
      nama: user.nama,
    });

    return updated;
  } catch (error) {
    console.log(error);

    if (error instanceof Error) {
      throw error;
    }
    throw new Error(prismaErrorHandler(error));
  }
};

export const deleteProduk = async (id, user) => {
  try {
    const produk = await prisma.produk.update({
      where: { id },
      data: { isActive: false },
    });

    await createLog({
      idToko: user.toko_id,
      kategori: "Produk",
      keterangan: `${user.nama} menghapus produk ${produk.nama}`,
      nama: user.nama,
    });

    return produk;
  } catch (error) {
    console.log(error);

    if (error instanceof Error) {
      throw error;
    }
    throw new Error(prismaErrorHandler(error));
  }
};

export const getProdukById = async (id) => {
  try {
    return await prisma.produk.findUnique({
      where: { id },
    });
  } catch (error) {
    console.log(error);

    if (error instanceof Error) {
      throw error;
    }
    throw new Error(prismaErrorHandler(error));
  }
};

export const getAllProduk = async ({
  page = 1,
  pageSize = 10,
  search = "",
  kategori,
  brand,
  createdStart,
  createdEnd,
  updatedStart,
  updatedEnd,
  idToko,
}) => {
  try {
    const skip = (page - 1) * pageSize;

    const createdRange = toUTCFromWIBRange(createdStart, createdEnd);
    const updatedRange = toUTCFromWIBRange(updatedStart, updatedEnd);

    const where = {
      isActive: true,
      idToko,
      AND: [
        search && {
          nama: {
            contains: search,
            mode: "insensitive",
          },
        },
        kategori && { kategori },
        brand && { brand },
        (createdStart || createdEnd) && {
          createdAt: createdRange,
        },
        (updatedStart || updatedEnd) && {
          updatedAt: updatedRange,
        },
      ].filter(Boolean),
    };

    const [data, total] = await Promise.all([
      prisma.produk.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.produk.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      pageSize,
      totalPage: Math.ceil(total / pageSize),
    };
  } catch (error) {
    console.log(error);

    if (error instanceof Error) {
      throw error;
    }
    throw new Error(prismaErrorHandler(error));
  }
};

export const getAllProdukVoucher = async (idToko) => {
  try {
    return await prisma.produk.findMany({
      where: {
        idToko,
        isActive: true,
        kategori: "Voucher",
      },
    });
  } catch (error) {
    console.log(error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(prismaErrorHandler(error));
  }
};
