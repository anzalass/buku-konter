import {
  getDetailTransaksi,
  getDetailServiceHP,
  getDetailJualanHarian,
  getDetailVoucherHarian,
  getDetailUangKeluar,
} from "../service/detailService.js";

// helper response biar konsisten
const success = (res, data, message = "Berhasil") => {
  return res.status(200).json({
    success: true,
    message,
    data,
  });
};

const notFound = (res) => {
  return res.status(404).json({
    success: false,
    message: "Data tidak ditemukan",
  });
};

// 🔹 DETAIL TRANSAKSI
export const detailTransaksi = async (req, res) => {
  try {
    const { id } = req.params;
    const idToko = req.user.idToko;

    const data = await getDetailTransaksi(id, idToko);
    if (!data) return notFound(res);

    success(res, data, "Detail transaksi berhasil diambil");
  } catch (err) {
    console.error("detailTransaksi:", err);
    res.status(500).json({
      success: false,
      message: "Gagal ambil detail transaksi",
    });
  }
};

// 🔹 DETAIL SERVICE HP
export const detailServiceHP = async (req, res) => {
  try {
    const { id } = req.params;
    const idToko = req.user.idToko;

    const data = await getDetailServiceHP(id, idToko);
    if (!data) return notFound(res);

    success(res, data, "Detail service berhasil diambil");
  } catch (err) {
    console.error("detailServiceHP:", err);
    res.status(500).json({
      success: false,
      message: "Gagal ambil detail service",
    });
  }
};

// 🔹 DETAIL JUALAN HARIAN
export const detailJualanHarian = async (req, res) => {
  try {
    const { id } = req.params;
    const idToko = req.user.idToko;

    const data = await getDetailJualanHarian(id, idToko);

    if (!data) {
      return res.status(404).json({
        message: "Data tidak ditemukan",
      });
    }

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Terjadi kesalahan server",
    });
  }
};

// 🔹 DETAIL VOUCHER HARIAN
export const detailVoucherHarian = async (req, res) => {
  try {
    const { id } = req.params;
    const idToko = req.user.idToko;

    const data = await getDetailVoucherHarian(id, idToko);
    if (!data) return notFound(res);

    success(res, data, "Detail voucher berhasil diambil");
  } catch (err) {
    console.error("detailVoucherHarian:", err);
    res.status(500).json({
      success: false,
      message: "Gagal ambil detail voucher",
    });
  }
};

// 🔹 DETAIL UANG KELUAR
export const detailUangKeluar = async (req, res) => {
  try {
    const { id } = req.params;
    const idToko = req.user.idToko;

    const data = await getDetailUangKeluar(id, idToko);
    if (!data) return notFound(res);

    success(res, data, "Detail uang keluar berhasil diambil");
  } catch (err) {
    console.error("detailUangKeluar:", err);
    res.status(500).json({
      success: false,
      message: "Gagal ambil detail uang keluar",
    });
  }
};
