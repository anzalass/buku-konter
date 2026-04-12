// src/controllers/transaksiGrosirController.js
import {
  createTransaksi,
  deleteTransaksi,
  getBarangKeluar,
  getHistoryTransaksi,
  getLaporanUser,
} from "../service/transaksiVoucherService.js"; // Sesuaikan path

export const getBarangKeluarController = async (req, res) => {
  try {
    const {
      periode = "harian",
      startDate,
      endDate,
      kategori = "all",
      sort = "desc",
      search = "",
    } = req.query;

    const idToko = req.user?.toko_id;

    if (!idToko) {
      return res.status(400).json({
        success: false,
        message: "ID Toko tidak ditemukan",
      });
    }

    const data = await getBarangKeluar({
      idToko,
      periode,
      startDate,
      endDate,
      kategori,
      sort,
      search,
    });

    return res.status(200).json({
      success: true,
      message: "Berhasil ambil data barang keluar",
      data,
    });
  } catch (error) {
    console.error("ERROR CONTROLLER barang keluar:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Terjadi kesalahan server",
    });
  }
};
export const createTransaksiController = async (req, res) => {
  try {
    const user = req.user; // dari middleware auth
    const { keranjang, idMember, type, namaPembeli, potonganHarga } = req.body;

    // 🔥 VALIDASI BASIC
    if (!keranjang || !Array.isArray(keranjang) || keranjang.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Keranjang kosong",
      });
    }

    // validasi isi keranjang
    for (const item of keranjang) {
      if (!item.idProduk || !item.qty) {
        return res.status(400).json({
          success: false,
          message: "Format keranjang tidak valid",
        });
      }
    }

    const transaksi = await createTransaksi({
      keranjang,
      idMember,
      type,
      user,
      namaPembeli,
      potonganHarga,
    });

    return res.status(201).json({
      success: true,
      message: "Transaksi berhasil",
      data: transaksi,
    });
  } catch (error) {
    console.error("Error createTransaksi:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Terjadi kesalahan server",
    });
  }
};

export const getHistoryTransaksiController = async (req, res) => {
  try {
    const { periode, startDate, endDate, kategori } = req.query;

    const idToko = req.user?.toko_id;

    // =========================
    // VALIDASI BASIC
    // =========================
    if (!idToko) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - idToko tidak ditemukan",
      });
    }

    // =========================
    // CALL SERVICE
    // =========================
    const data = await getHistoryTransaksi({
      idToko,
      periode,
      startDate,
      endDate,
      kategori,
    });

    // =========================
    // RESPONSE
    // =========================
    return res.status(200).json({
      success: true,
      message: "Berhasil ambil data history",
      ...data,
    });
  } catch (error) {
    console.error("ERROR CONTROLLER getDashboardHistory:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Terjadi kesalahan server",
    });
  }
};

export const deleteTransaksiController = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user; // dari middleware auth

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID transaksi wajib diisi",
      });
    }

    const result = await deleteTransaksi({ id, user });

    return res.status(200).json({
      success: true,
      message: "Transaksi berhasil dibatalkan",
      data: result,
    });
  } catch (error) {
    console.error("❌ DELETE TRANSAKSI ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Terjadi kesalahan server",
    });
  }
};

export const getLaporanUserController = async (req, res) => {
  try {
    const { kategori, startDate, endDate } = req.query;
    const idUser = req.params.id; // 🔥 dari middleware auth

    const result = await getLaporanUser({
      idUser,
      kategori,
      startDate,
      endDate,
    });

    return res.status(200).json({
      success: true,
      message: "Berhasil ambil laporan user",
      data: result.data,
      summary: result.summary,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
