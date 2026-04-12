// src/routes/transaksiGrosirRoutes.js
import { Router } from "express";
import {
  getBarangKeluarController,
  createTransaksiController,
  getHistoryTransaksiController,
  deleteTransaksiController,
  getLaporanUserController,
} from "../controller/transaksiVoucherController.js";
import { AuthMiddleware } from "../utils/authMiddleware.js";

const router = Router();

router.post("/transaksi-new", AuthMiddleware, createTransaksiController);
router.get("/barang-keluar", AuthMiddleware, getBarangKeluarController);
router.get("/dashboard3", AuthMiddleware, getHistoryTransaksiController);
router.delete("/transaksi-new/:id", AuthMiddleware, deleteTransaksiController);
router.get("/laporan-user/:id", AuthMiddleware, getLaporanUserController);
export default router;
