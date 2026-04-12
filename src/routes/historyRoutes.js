// routes/history.routes.js

import express from "express";
import {
  getTransaksiController,
  getVoucherController,
  getServiceHPController,
  getJualanHarianController,
} from "../controller/historyController.js";

import { AuthMiddleware } from "../utils/authMiddleware.js";

const router = express.Router();

// 🔥 semua pakai auth
router.use(AuthMiddleware);

// ==============================
// HISTORY ROUTES
// ==============================
router.get("/history/transaksi", getTransaksiController);
router.get("/history/voucher", getVoucherController);
router.get("/history/service", getServiceHPController);
router.get("/history/jualan-harian", getJualanHarianController);

export default router;
