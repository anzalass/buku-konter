import { PrismaClient } from "@prisma/client";
import { createLog } from "./logService.js";
import { getDateRange } from "./historyService.js";
const prisma = new PrismaClient();

export const getBarangKeluar = async ({
  idToko,
  periode = "harian",
  startDate,
  endDate,
  kategori = "all",
  sort = "desc",
  search = "",
}) => {
  console.log(kategori);

  try {
    const dateFilter = getDateRange({ periode, startDate, endDate });

    // =========================
    // 1. PENJUALAN
    // =========================
    const penjualan = await prisma.itemsTransaksi.groupBy({
      by: ["idProduk"],
      where: {
        idToko,
        createdAt: dateFilter,
        deletedAt: null,
        Produk: {
          ...(kategori !== "all" && {
            kategori: {
              equals: kategori,
              mode: "insensitive",
            },
          }),
          ...(search && {
            nama: { contains: search, mode: "insensitive" },
          }),
        },
      },
      _sum: {
        quantity: true,
      },
    });

    // =========================
    // 2. SERVICE
    // =========================
    const service = await prisma.sparepartServiceHP.groupBy({
      by: ["idProduk"],
      where: {
        idToko,
        createdAt: dateFilter,
        deletedAt: null,
        Produk: {
          ...(kategori !== "all" && {
            kategori: {
              equals: kategori,
              mode: "insensitive",
            },
          }),
          ...(search && {
            nama: { contains: search, mode: "insensitive" },
          }),
        },
      },
      _sum: {
        quantity: true,
      },
    });

    // =========================
    // 3. VOUCHER HARIAN 🔥
    // =========================
    const voucher = await prisma.transaksiVoucherHarian.groupBy({
      by: ["idProduk"],
      where: {
        idToko,
        createdAt: dateFilter,
        deletedAt: null,
        Produk: {
          ...(kategori !== "all" && {
            kategori: {
              equals: kategori,
              mode: "insensitive",
            },
          }),
          ...(search && {
            nama: { contains: search, mode: "insensitive" },
          }),
        },
      },
      _count: {
        id: true, // karena ga ada qty
      },
    });

    // =========================
    // 4. MERGE SEMUA
    // =========================
    const map = {};

    const addToMap = (arr, type = "qty") => {
      arr.forEach((item) => {
        if (!map[item.idProduk]) {
          map[item.idProduk] = 0;
        }

        if (type === "qty") {
          map[item.idProduk] += item._sum?.quantity || 0;
        }

        if (type === "count") {
          map[item.idProduk] += item._count?.id || 0;
        }
      });
    };

    addToMap(penjualan, "qty");
    addToMap(service, "qty");
    addToMap(voucher, "count"); // 🔥 penting

    // =========================
    // 5. AMBIL DETAIL PRODUK
    // =========================
    const produkIds = Object.keys(map);

    if (produkIds.length === 0) return [];

    const produk = await prisma.produk.findMany({
      where: {
        id: { in: produkIds },
      },
      select: {
        id: true,
        nama: true,
        kategori: true,
        brand: true,
      },
    });

    // =========================
    // 6. FORMAT RESULT
    // =========================
    const result = produk.map((p) => ({
      id: p.id,
      nama: p.nama,
      kategori: p.kategori,
      brand: p.brand,
      totalKeluar: map[p.id] || 0,
    }));

    // =========================
    // 7. SORTING
    // =========================
    result.sort((a, b) =>
      sort === "asc"
        ? a.totalKeluar - b.totalKeluar
        : b.totalKeluar - a.totalKeluar
    );

    return result;
  } catch (error) {
    console.error("ERROR getBarangKeluar:", error);
    throw new Error("Gagal mengambil data barang keluar");
  }
};
export const createTransaksi = async ({
  keranjang,
  idMember,
  type,
  user,
  namaPembeli,
  potonganHarga,
}) => {
  if (!keranjang || keranjang.length === 0) {
    throw new Error("Keranjang kosong");
  }

  return await prisma.$transaction(async (tx) => {
    let totalHarga = 0;
    let totalKeuntungan = 0;

    const produkList = await tx.produk.findMany({
      where: {
        id: { in: keranjang.map((k) => k.idProduk) },
        idToko: user.toko_id,
        isActive: true,
      },
    });

    const produkMap = new Map(produkList.map((p) => [p.id, p]));

    for (const item of keranjang) {
      const produk = produkMap.get(item.idProduk);

      if (!produk) throw new Error("Produk tidak ditemukan");

      if (produk.stok < item.qty) {
        throw new Error(`Stok ${produk.nama} tidak cukup. Sisa ${produk.stok}`);
      }

      const hargaJual =
        type === "grosir"
          ? produk.hargaGrosir ?? produk.hargaEceran
          : produk.hargaEceran;

      totalHarga += hargaJual * item.qty;
      totalKeuntungan += (hargaJual - produk.hargaModal) * item.qty;
    }

    const transaksi = await tx.transaksi.create({
      data: {
        namaPembeli: namaPembeli ? namaPembeli : null,
        totalHarga,
        User: {
          connect: {
            id: user.id,
          },
        },
        type: type,
        keuntungan: parseInt(totalKeuntungan) - parseInt(potonganHarga),
        status: "selesai",
        tanggal: new Date(),

        ...(idMember && {
          Member: {
            connect: { id: idMember },
          },
        }),

        Toko: {
          connect: { id: user.toko_id },
        },

        items: {
          create: keranjang.map((item) => {
            const produk = produkMap.get(item.idProduk);

            const hargaJual =
              type === "grosir"
                ? produk.hargaGrosir ?? produk.hargaEceran
                : produk.hargaEceran;

            return {
              quantity: item.qty,
              tanggal: new Date(),

              Produk: {
                connect: { id: item.idProduk },
              },
              Toko: {
                connect: { id: user.toko_id },
              },
            };
          }),
        },
      },
      include: {
        items: true,
      },
    });

    await Promise.all(
      keranjang.map((item) => {
        const produk = produkMap.get(item.idProduk);

        return tx.produk.update({
          where: { id: produk.id },
          data: {
            stok: { decrement: item.qty },
            terjual: { increment: item.qty },
          },
        });
      })
    );

    // 🔥 CREATE LOG
    await createLog(
      {
        kategori: "Penjualan",
        keterangan: `${user.nama} membuat transaksi`,
        nominal: transaksi.keuntungan,
        nama: user.nama,
        idToko: user.toko_id,
      },
      tx
    );

    return transaksi;
  });
};

export const deleteTransaksi = async ({ id, user }) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Ambil transaksi + items
    const transaksi = await tx.transaksi.findFirst({
      where: {
        id,
        idToko: user.toko_id,
        deletedAt: null,
      },
      include: {
        items: true,
      },
    });

    if (!transaksi) {
      throw new Error("Transaksi tidak ditemukan / sudah dihapus");
    }

    // 2. Balikin stok & terjual
    await Promise.all(
      transaksi.items.map((item) =>
        tx.produk.update({
          where: { id: item.idProduk },
          data: {
            stok: { increment: item.quantity }, // 🔥 BALIKIN STOK
            terjual: { decrement: item.quantity }, // 🔥 BALIKIN TERJUAL
          },
        })
      )
    );

    // 3. Soft delete transaksi
    const deleted = await tx.transaksi.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: "dibatalkan", // optional tapi recommended
      },
    });

    await createLog(
      {
        kategori: "Penjualan",
        keterangan: `${user.nama} membatalkan transaksi`,
        nominal: transaksi.keuntungan,
        nama: user.nama,
        idToko: user.toko_id,
      },
      tx
    );

    return deleted;
  });
};

export const getHistoryTransaksi = async ({
  idToko,
  periode = "harian",
  startDate: startDateParam,
  endDate: endDateParam,
  kategori = "all", // 🔥 NEW
}) => {
  try {
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();

    // =========================
    // VALIDASI
    // =========================
    // VALIDASI
    // =========================
    if (periode === "custom") {
      if (!startDateParam) {
        throw new Error("startDate wajib diisi untuk custom");
      }

      // 🔥 kalau endDate kosong → default hari ini
      if (!endDateParam) {
        endDateParam = new Date().toISOString();
      }

      if (new Date(startDateParam) > new Date(endDateParam)) {
        throw new Error("startDate tidak boleh lebih besar dari endDate");
      }
    }

    // =========================
    // FILTER TANGGAL
    // =========================
    switch (periode) {
      case "harian":
        startDate.setHours(0, 0, 0, 0);
        break;

      case "mingguan":
        startDate.setDate(now.getDate() - 6);
        break;

      case "bulanan":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;

      case "custom":
        startDate = new Date(startDateParam);
        endDate = new Date(endDateParam);

        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;

      default:
        startDate = new Date(0);
        endDate = now;
    }

    const dateFilter = {
      gte: startDate,
      lte: endDate,
    };

    // =========================
    // FETCH DATA (OPTIMIZED)
    // =========================
    const [penjualan, jualanHarian, voucher, service, pengeluaran] =
      await Promise.all([
        prisma.transaksi.findMany({
          where: {
            idToko,
            deletedAt: null,
            tanggal: dateFilter,
          },
          include: {
            Member: true,
          },
        }),

        prisma.jualanHarian.findMany({
          where: {
            idToko,
            deletedAt: null,
            tanggal: dateFilter,
          },
          include: {
            Member: true,
          },
        }),

        prisma.transaksiVoucherHarian.findMany({
          where: {
            idToko,
            deletedAt: null,
            createdAt: dateFilter,
          },
          include: {
            Produk: true,
            Member: true,
          },
        }),

        prisma.serviceHP.findMany({
          where: {
            idToko,
            deletedAt: null,
            tanggal: dateFilter,
          },
          include: {
            Member: true,
          },
        }),

        prisma.uangKeluar.findMany({
          where: {
            idToko,
            tanggal: dateFilter,
          },
        }),
      ]);

    // =========================
    // SUMMARY
    // =========================
    let totalPemasukan = 0;
    let totalPengeluaran = 0;
    let totalKeuntungan = 0;

    // =========================
    // NORMALIZE DATA
    // =========================
    const result = [
      // 🔥 PENJUALAN
      ...penjualan.map((t) => {
        const keuntungan = t.keuntungan || 0;

        totalPemasukan += keuntungan;
        totalKeuntungan += keuntungan;

        return {
          id: t.id,
          type: "penjualan",
          nominal: keuntungan,
          kategori: `Penjualan - ${t.type}`,
          ts: t.tanggal,
          nama: t.Member ? `👥 - ${t.Member.nama}` : t.namaPembeli || "Umum",
        };
      }),

      // 🔥 JUALAN HARIAN
      ...jualanHarian.map((t) => {
        const nominal = t.nominal || 0;

        totalPemasukan += nominal;
        totalKeuntungan += nominal;

        return {
          id: t.id,
          type: "jualan-harian",
          nama: t.Member ? `👥 - ${t.Member.nama}` : "Umum",
          nominal,
          kategori: t.kategori,
          ts: t.tanggal,
        };
      }),

      // 🔥 VOUCHER
      ...voucher.map((v) => {
        const keuntungan = v.keuntungan || 0;

        totalPemasukan += keuntungan;
        totalKeuntungan += keuntungan;

        return {
          id: v.id,
          type: "voucher",
          nama: v.Member
            ? `👥 - ${v.Member.nama} - ${v.Produk.brand} ${v.Produk.nama}`
            : `${v.Produk.brand} ${v.Produk.nama}`,
          nominal: keuntungan,
          kategori: "Voucher Harian",
          ts: v.createdAt,
        };
      }),

      // 🔥 SERVICE
      ...service.map((s) => {
        const keuntungan = s.keuntungan || 0;

        // 🔥 HITUNG HANYA YANG SELESAI
        if (s.statusAmbil === "SudahDiambil" && s.statusServis === "Selesai") {
          totalPemasukan += keuntungan;
        }

        return {
          id: s.id,
          type: "service",
          nama: s.Member ? `👥 - ${s.Member.nama}` : s.namaPelangan || "Umum",
          nominal: keuntungan,
          kategori: "Service",
          ts: s.tanggal,
          status: s.statusServis,
          statusAmbil: s.statusAmbil, // 🔥 penting buat UI (badge)
        };
      }),

      // 🔥 PENGELUARAN
      ...pengeluaran.map((u) => {
        const jumlah = u.jumlah || 0;

        totalPengeluaran += jumlah;

        return {
          id: u.id,
          type: "pengeluaran",
          nama: u.keterangan,
          nominal: jumlah,
          kategori: "Pengeluaran",
          ts: u.tanggal,
        };
      }),
    ];

    // =========================
    // SORTING (TERBARU)
    // =========================

    // =========================
    // FILTER KATEGORI
    // =========================
    let filtered = result;

    if (kategori !== "all") {
      filtered = result.filter((item) => {
        switch (kategori) {
          case "penjualan":
            return item.type === "penjualan";

          case "jualan-harian":
            return item.type === "jualan-harian";

          case "voucher":
            return item.type === "voucher";

          case "service":
            return item.type === "service";

          case "pengeluaran":
            return item.type === "pengeluaran";

          case "pemasukan":
            return item.type !== "pengeluaran";

          default:
            return true;
        }
      });
    }

    let totalPemasukanFiltered = 0;
    let totalPengeluaranFiltered = 0;

    filtered.forEach((item) => {
      if (item.type === "pengeluaran") {
        totalPengeluaranFiltered += item.nominal;
      } else if (item.type === "service") {
        // 🔥 FILTER SERVICE DI SINI JUGA
        if (item.status === "Selesai" && item.statusAmbil === "SudahDiambil") {
          totalPemasukanFiltered += item.nominal;
        }
      } else {
        totalPemasukanFiltered += item.nominal;
      }
    });

    const sorted = filtered.sort((a, b) => new Date(b.ts) - new Date(a.ts));

    // =========================
    // RETURN FINAL
    // =========================
    return {
      summary: {
        pemasukan: totalPemasukanFiltered,
        pengeluaran: totalPengeluaranFiltered,
        keuntungan: totalPemasukanFiltered - totalPengeluaranFiltered,
      },
      data: sorted,
    };
  } catch (error) {
    console.error("ERROR getHistoryTransaksi:", error);
    throw error;
  }
};

export const getLaporanUser = async ({
  idUser,
  kategori = "all",
  startDate,
  endDate,
}) => {
  try {
    if (!idUser) throw new Error("idUser wajib");

    const toLocalStart = (date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d;
    };

    const toLocalEnd = (date) => {
      const d = new Date(date);
      d.setHours(23, 59, 59, 999);
      return d;
    };

    const whereDate =
      startDate && endDate
        ? {
            gte: toLocalStart(startDate),
            lte: toLocalEnd(endDate),
          }
        : undefined;

    // =========================
    // 🔥 QUERY PARALLEL
    // =========================
    const [transaksi, service, jualan, voucher] = await Promise.all([
      prisma.transaksi.findMany({
        where: {
          idUser,
          deletedAt: null,
          ...(whereDate && { tanggal: whereDate }),
        },
        select: {
          id: true,
          tanggal: true,
          keuntungan: true,
          totalHarga: true,
          type: true,
        },
      }),

      prisma.serviceHP.findMany({
        where: {
          idUser,
          status: "Selesai",
          deletedAt: null,
          ...(whereDate && { tanggal: whereDate }),
        },
        select: {
          id: true,
          tanggal: true,
          keuntungan: true,
          biayaJasa: true,
        },
      }),

      prisma.jualanHarian.findMany({
        where: {
          idUser,
          deletedAt: null,
          ...(whereDate && { tanggal: whereDate }),
        },
        select: {
          id: true,
          tanggal: true,
          nominal: true,
          kategori: true,
        },
      }),

      prisma.transaksiVoucherHarian.findMany({
        where: {
          idUser,
          deletedAt: null,
          ...(whereDate && { createdAt: whereDate }),
        },
        select: {
          id: true,
          createdAt: true,
          keuntungan: true,
        },
      }),
    ]);

    // =========================
    // 🔥 FILTER KATEGORI
    // =========================
    const data = {
      transaksi:
        kategori === "all" || kategori === "transaksi" ? transaksi : [],
      service: kategori === "all" || kategori === "service" ? service : [],
      jualan: kategori === "all" || kategori === "jualan" ? jualan : [],
      voucher: kategori === "all" || kategori === "voucher" ? voucher : [],
    };

    // =========================
    // 🔥 SUMMARY
    // =========================
    const summary = {
      totalTransaksi:
        data.transaksi.length +
        data.service.length +
        data.jualan.length +
        data.voucher.length,

      totalKeuntungan:
        data.transaksi.reduce((a, b) => a + (b.keuntungan || 0), 0) +
        data.service.reduce((a, b) => a + (b.keuntungan || 0), 0) +
        data.jualan.reduce((a, b) => a + (b.nominal || 0), 0) +
        data.voucher.reduce((a, b) => a + (b.keuntungan || 0), 0),
    };

    return {
      data,
      summary,
    };
  } catch (error) {
    console.error("Error getLaporanUser:", error);
    throw error;
  }
};
