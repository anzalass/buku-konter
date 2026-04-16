// controllers/history.controller.js

import {
  getAllTransaksi,
  getAllVoucher,
  getAllServiceHP,
  getAllJualanHarian,
} from "../service/historyService.js";

// helper ambil query
const parseQuery = (req) => {
  return {
    idToko: req.user?.idToko || req.query.idToko,
    search: req.query.search || "",
    isActive: req.query.isActive !== "false",
    periode: req.query.periode || "harian",
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    page: Number(req.query.page) || 1,
    pageSize: Number(req.query.pageSize) || 10,

    // 🔥 FIX INI
    isExport: req.query.isExport === "true",
  };
};
// ==============================
// TRANSAKSI
// ==============================
export const getTransaksiController = async (req, res) => {
  try {
    const params = parseQuery(req);

    const result = await getAllTransaksi(params);

    res.json({
      success: true,
      message: "Berhasil ambil data transaksi",
      ...result,
    });
  } catch (err) {
    console.error("getTransaksi error:", err);
    res.status(500).json({
      success: false,
      message: "Gagal ambil transaksi",
    });
  }
};

// ==============================
// VOUCHER
// ==============================
export const getVoucherController = async (req, res) => {
  try {
    const params = parseQuery(req);

    const result = await getAllVoucher(params);

    res.json({
      success: true,
      message: "Berhasil ambil data voucher",
      ...result,
    });
  } catch (err) {
    console.error("getVoucher error:", err);
    res.status(500).json({
      success: false,
      message: "Gagal ambil voucher",
    });
  }
};

// ==============================
// SERVICE HP
// ==============================
export const getServiceHPController = async (req, res) => {
  try {
    const params = parseQuery(req);

    const result = await getAllServiceHP(params);

    res.json({
      success: true,
      message: "Berhasil ambil data service",
      ...result,
    });
  } catch (err) {
    console.error("getServiceHP error:", err);
    res.status(500).json({
      success: false,
      message: "Gagal ambil service",
    });
  }
};

// ==============================
// JUALAN HARIAN
// ==============================
export const getJualanHarianController = async (req, res) => {
  try {
    const params = parseQuery(req);

    const result = await getAllJualanHarian(params);

    res.json({
      success: true,
      message: "Berhasil ambil data jualan harian",
      ...result,
    });
  } catch (err) {
    console.error("getJualanHarian error:", err);
    res.status(500).json({
      success: false,
      message: "Gagal ambil jualan harian",
    });
  }
};
