// src/routes/transaksiVoucherRoutes.js
import { Router } from "express";
import {
  createTransaksi,
  deleteTransaksi,
} from "../controller/jualanVoucherController.js";
import { AuthMiddleware } from "../utils/authMiddleware.js";

const router = Router();

// CREATE transaksi
router.post("/voucher-harian", AuthMiddleware, createTransaksi);

// DELETE transaksi
router.delete("/voucher-harian/:id", AuthMiddleware, deleteTransaksi);

export default router;
