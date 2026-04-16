import express from "express";
import {
  detailTransaksi,
  detailServiceHP,
  detailJualanHarian,
  detailVoucherHarian,
  detailUangKeluar,
} from "../controller/detailController.js";
import { AuthMiddleware } from "../utils/authMiddleware.js";

const router = express.Router();

// 🔥 semua endpoint wajib login
router.use(AuthMiddleware);

// ==========================
// 📌 DETAIL ENDPOINT
// ==========================

router.get("/detail/transaksi/:id", detailTransaksi);

router.get("/detail/service/:id", detailServiceHP);
router.get("/detail/jualan-harian/:id", detailJualanHarian);
router.get("/detail/voucher-harian/:id", detailVoucherHarian);
router.get("/detail/uang-keluar/:id", detailUangKeluar);

export default router;
