// src/services/log.service.js
import { PrismaClient } from "@prisma/client";
import { toUTCFromWIBRange } from "../utils/wibMiddleware.js";

const prisma = new PrismaClient();

/* =========================
   CREATE LOG
========================= */
export const createLog = async (
  { keterangan, nama, nominal, kategori, idToko },
  tx
) => {
  try {
    if (!keterangan || !nama || !kategori || !idToko) {
      throw new Error(
        "Field keterangan, nama, kategori, dan idToko wajib diisi"
      );
    }

    const db = tx ?? prisma;

    return await db.log.create({
      data: {
        keterangan,
        nama,
        kategori,
        idToko,
        nominal: nominal ? Number(nominal) : null,
      },
    });
  } catch (error) {
    console.error("Error createLog:", error);
    throw new Error(error.message || "Gagal membuat log");
  }
};
/* =========================
   GET ALL LOGS
========================= */
export const getAllLogs = async ({
  idToko,
  nama = "",
  kategori = "all",
  keterangan = "",
  startDate,
  endDate,
  page = 1,
  pageSize = 10,
}) => {
  try {
    const skip = (page - 1) * pageSize;
    const take = parseInt(pageSize);

    // =========================
    // DATE FILTER
    // =========================
    let dateFilter = undefined;

    if (startDate || endDate) {
      dateFilter = {
        gte: startDate ? new Date(startDate) : new Date(0),
        lte: endDate ? new Date(endDate) : new Date(),
      };
    }

    // =========================
    // WHERE (MODULAR FILTER)
    // =========================
    const where = {
      idToko,

      // 🔥 FILTER NAMA
      ...(nama && {
        nama: {
          contains: nama,
          mode: "insensitive",
        },
      }),

      // 🔥 FILTER KATEGORI
      ...(kategori !== "all" && {
        kategori: {
          equals: kategori,
          mode: "insensitive",
        },
      }),

      // 🔥 FILTER KETERANGAN
      ...(keterangan && {
        keterangan: {
          contains: keterangan,
          mode: "insensitive",
        },
      }),

      // 🔥 FILTER TANGGAL
      ...(dateFilter && {
        createdAt: dateFilter,
      }),
    };

    // =========================
    // QUERY
    // =========================
    const [data, total] = await Promise.all([
      prisma.log.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take,
      }),
      prisma.log.count({ where }),
    ]);

    // =========================
    // RETURN
    // =========================
    return {
      data,
      pagination: {
        total,
        page,
        pageSize,
        totalPage: Math.ceil(total / pageSize),
      },
    };
  } catch (error) {
    console.error("ERROR getLogs:", error);
    throw new Error("Gagal mengambil data log");
  }
};
