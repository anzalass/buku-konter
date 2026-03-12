// src/services/keuntunganService.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

import cron from "node-cron";

export const generateDailyKeuntungan = async (idToko) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Hitung keuntungan per kategori
    const [trx, vd, acc, sparepart, service, grosir] = await Promise.all([
      // Transaksi Harian
      prisma.jualanHarian.aggregate({
        where: { idToko, createdAt: { gte: todayStart, lte: todayEnd } },
        _sum: { nominal: true },
      }),

      // Voucher Harian
      prisma.transaksiVoucherHarian.aggregate({
        where: { idToko, createdAt: { gte: todayStart, lte: todayEnd } },
        _sum: { keuntungan: true },
      }),

      // Aksesoris
      prisma.transaksiAksesoris.aggregate({
        where: { idToko, createdAt: { gte: todayStart, lte: todayEnd } },
        _sum: { keuntungan: true },
      }),

      // Sparepart
      prisma.transaksiSparepat.aggregate({
        where: { idToko, createdAt: { gte: todayStart, lte: todayEnd } },
        _sum: { keuntungan: true },
      }),

      // Service HP
      prisma.serviceHP.aggregate({
        where: { idToko, createdAt: { gte: todayStart, lte: todayEnd } },
        _sum: { keuntungan: true },
      }),

      // Grosir Voucher
      prisma.transaksiVoucherDownline.aggregate({
        where: { idToko, createdAt: { gte: todayStart, lte: todayEnd } },
        _sum: { keuntungan: true },
      }),
    ]);

    // Simpan ke database
    const result = await prisma.keuntungan.create({
      data: {
        idToko,
        keuntunganTransaksi: trx._sum.keuntungan || 0,
        keuntunganVoucherHarian: vd._sum.keuntungan || 0,
        keuntunganAcc: acc._sum.keuntungan || 0,
        keuntunganSparepart: sparepart._sum.keuntungan || 0,
        keuntunganService: service._sum.keuntungan || 0,
        keuntunganGrosirVoucher: grosir._sum.keuntungan || 0,
      },
    });

    console.log("✅ Keuntungan harian tersimpan:", result.id);
    return result;
  } catch (error) {
    console.error("❌ Gagal generate keuntungan:", error);
    throw error;
  }
};

export const startDailyKeuntunganCron = () => {
  cron.schedule("59 23 * * *", async () => {
    try {
      // Ambil semua toko
      const tokos = await prisma.toko.findMany({ select: { id: true } });

      // Generate keuntungan untuk setiap toko
      for (const toko of tokos) {
        await generateDailyKeuntungan(toko.id);
      }

      console.log(
        `✅ Keuntungan harian untuk ${tokos.length} toko berhasil di-generate`
      );
    } catch (error) {
      console.error("❌ Gagal jalankan cron keuntungan:", error);
    }
  });

  console.log("⏰ Cron job keuntungan harian aktif");
};

/**
 * Ambil data keuntungan berdasarkan periode
 * @param {string} idToko - ID toko
 * @param {string} periode - 'harian', 'mingguan', 'bulanan'
 * @returns {Promise<Array>} Data keuntungan
 */
export const getKeuntunganChartData = async (idToko, periode = "harian") => {
  const now = new Date();

  // Tentukan rentang waktu berdasarkan periode
  let startDate, endDate;
  let groupBy;

  switch (periode) {
    case "harian":
      // 7 hari terakhir
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 6); // 7 hari termasuk hari ini
      endDate = new Date(now);
      groupBy = "day";
      break;

    case "mingguan":
      // 4 minggu terakhir
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 27); // 28 hari = 4 minggu
      endDate = new Date(now);
      groupBy = "week";
      break;

    case "bulanan":
      // 6 bulan terakhir
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 5); // 6 bulan termasuk bulan ini
      endDate = new Date(now);
      groupBy = "month";
      break;

    default:
      throw new Error(
        "Periode tidak valid. Gunakan: harian, mingguan, atau bulanan"
      );
  }

  // Pastikan tanggal awal jam 00:00:00 dan akhir jam 23:59:59
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  // Ambil semua transaksi dalam rentang waktu
  const [
    transaksiHarian,
    voucherHarian,
    aksesoris,
    sparepart,
    service,
    grosir,
  ] = await Promise.all([
    prisma.jualanHarian.findMany({
      where: { idToko, tanggal: { gte: startDate, lte: endDate } },
      select: { createdAt: true, nominal: true },
    }),
    prisma.transaksiVoucherHarian.findMany({
      where: { idToko, createdAt: { gte: startDate, lte: endDate } },
      select: { createdAt: true, keuntungan: true },
    }),
    prisma.transaksiAksesoris.findMany({
      where: { idToko, createdAt: { gte: startDate, lte: endDate } },
      select: { createdAt: true, keuntungan: true },
    }),
    prisma.transaksiSparepat.findMany({
      where: { idToko, createdAt: { gte: startDate, lte: endDate } },
      select: { createdAt: true, keuntungan: true },
    }),
    prisma.serviceHP.findMany({
      where: { idToko, createdAt: { gte: startDate, lte: endDate } },
      select: { createdAt: true, keuntungan: true },
    }),
    prisma.transaksiVoucherDownline.findMany({
      where: { idToko, createdAt: { gte: startDate, lte: endDate } },
      select: { createdAt: true, keuntungan: true },
    }),
  ]);

  // Gabungkan semua transaksi
  const allTransactions = [
    ...transaksiHarian.map((t) => ({ ...t, type: "trx" })),
    ...voucherHarian.map((t) => ({ ...t, type: "vd" })),
    ...aksesoris.map((t) => ({ ...t, type: "acc" })),
    ...sparepart.map((t) => ({ ...t, type: "sparepart" })),
    ...service.map((t) => ({ ...t, type: "service" })),
    ...grosir.map((t) => ({ ...t, type: "grosir" })),
  ];

  // Buat array tanggal berdasarkan periode
  const dateLabels = generateDateLabels(periode, startDate, endDate);

  // Hitung keuntungan per kategori per periode
  const chartData = dateLabels.map((label) => {
    const periodStart = label.startDate;
    const periodEnd = label.endDate;

    const trx = allTransactions
      .filter(
        (t) =>
          t.type === "trx" && t.tanggal >= periodStart && t.tanggal <= periodEnd
      )
      .reduce((sum, t) => sum + (t.keuntungan || 0), 0);

    const vd = allTransactions
      .filter(
        (t) =>
          t.type === "vd" && t.tanggal >= periodStart && t.tanggal <= periodEnd
      )
      .reduce((sum, t) => sum + (t.keuntungan || 0), 0);

    const acc = allTransactions
      .filter(
        (t) =>
          t.type === "acc" && t.tanggal >= periodStart && t.tanggal <= periodEnd
      )
      .reduce((sum, t) => sum + (t.keuntungan || 0), 0);

    const sparepart = allTransactions
      .filter(
        (t) =>
          t.type === "sparepart" &&
          t.tanggal >= periodStart &&
          t.tanggal <= periodEnd
      )
      .reduce((sum, t) => sum + (t.keuntungan || 0), 0);

    const service = allTransactions
      .filter(
        (t) =>
          t.type === "service" &&
          t.tanggal >= periodStart &&
          t.tanggal <= periodEnd
      )
      .reduce((sum, t) => sum + (t.keuntungan || 0), 0);

    const grosir = allTransactions
      .filter(
        (t) =>
          t.type === "grosir" &&
          t.tanggal >= periodStart &&
          t.tanggal <= periodEnd
      )
      .reduce((sum, t) => sum + (t.keuntungan || 0), 0);

    return {
      tanggal: label.label,
      keuntunganTrx: trx,
      keuntunganVd: vd,
      keuntunganAcc: acc,
      keuntunganSparepart: sparepart,
      keuntunganService: service,
      keuntunganGrosirVd: grosir,
    };
  });

  return chartData;
};

/**
 * Generate label tanggal berdasarkan periode
 */
function generateDateLabels(periode, startDate, endDate) {
  const labels = [];
  const currentDate = new Date(startDate);

  if (periode === "harian") {
    // 7 hari terakhir
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentDate);
      date.setDate(currentDate.getDate() + i);

      if (date > endDate) break;

      labels.push({
        label: date.toLocaleDateString("id-ID", { weekday: "short" }),
        startDate: new Date(date.setHours(0, 0, 0, 0)),
        endDate: new Date(date.setHours(23, 59, 59, 999)),
      });
    }
  } else if (periode === "mingguan") {
    // 4 minggu terakhir
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() + i * 7);

      if (weekStart > endDate) break;

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      labels.push({
        label: `Minggu ${i + 1}`,
        startDate: new Date(weekStart.setHours(0, 0, 0, 0)),
        endDate: new Date(weekEnd.setHours(23, 59, 59, 999)),
      });
    }
  } else if (periode === "bulanan") {
    // 6 bulan terakhir
    const startMonth = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      1
    );
    const endMonth = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0);

    let current = new Date(startMonth);
    let count = 0;

    while (current <= endMonth && count < 6) {
      const monthStart = new Date(current.getFullYear(), current.getMonth(), 1);
      const monthEnd = new Date(
        current.getFullYear(),
        current.getMonth() + 1,
        0
      );

      labels.push({
        label: monthStart.toLocaleDateString("id-ID", {
          month: "short",
          year: "numeric",
        }),
        startDate: new Date(monthStart.setHours(0, 0, 0, 0)),
        endDate: new Date(monthEnd.setHours(23, 59, 59, 999)),
      });

      current.setMonth(current.getMonth() + 1);
      count++;
    }
  }

  return labels;
}

/**
 * Ambil data keuntungan dari tabel Keuntungan berdasarkan periode
 * @param {string} idToko - ID toko
 * @param {string} periode - 'harian', 'mingguan', 'bulanan'
 * @returns {Promise<Array>} Data siap grafik
 */
export const getKeuntunganChartDataFromTable = async (
  idToko,
  periode = "harian"
) => {
  const now = new Date();
  let startDate;

  // Tentukan tanggal mulai berdasarkan periode
  switch (periode) {
    case "harian":
      // 7 hari terakhir
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 6); // Termasuk hari ini = 7 hari
      break;
    case "mingguan":
      // 4 minggu terakhir = 28 hari
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 27); // Termasuk hari ini = 28 hari
      break;
    case "bulanan":
      // 6 bulan terakhir
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 5); // Termasuk bulan ini = 6 bulan
      break;
    default:
      throw new Error("Periode tidak valid");
  }

  // Pastikan jam 00:00:00
  startDate.setHours(0, 0, 0, 0);

  // Ambil data dari tabel Keuntungan
  const records = await prisma.keuntungan.findMany({
    where: {
      idToko,
      createdAt: {
        gte: startDate,
        lte: now,
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // Format data untuk grafik
  const chartData = records.map((record) => ({
    // Format tanggal sesuai periode
    tanggal: formatTanggal(record.createdAt, periode),

    // Konversi BigInt ke Number (aman untuk grafik)
    keuntunganTrx: Number(record.keuntunganTransaksi),
    keuntunganVd: Number(record.keuntunganVoucherHarian),
    keuntunganAcc: Number(record.keuntunganAcc),
    keuntunganSparepart: Number(record.keuntunganSparepart),
    keuntunganService: Number(record.keuntunganService),
    keuntunganGrosirVd: Number(record.keuntunganGrosirVoucher),
  }));

  return chartData;
};

/**
 * Format tanggal untuk label grafik
 */
function formatTanggal(date, periode) {
  if (periode === "harian") {
    return date.toLocaleDateString("id-ID", { weekday: "short" }); // Sen, Sel, Rab...
  }
  if (periode === "mingguan") {
    // Minggu ke-n dari awal rentang
    const weekNum = Math.ceil((date.getDate() - 1) / 7) + 1;
    return `Minggu ${weekNum}`;
  }
  if (periode === "bulanan") {
    return date.toLocaleDateString("id-ID", {
      month: "short",
      year: "numeric",
    }); // Apr 2025
  }
  return date.toISOString().split("T")[0];
}
