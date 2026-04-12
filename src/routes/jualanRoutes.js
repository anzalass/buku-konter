// src/routes/sparepart.route.js
import { Router } from "express";
import {
  createJualanHarianHandler,
  deleteJualanHarianHandler,
} from "../controller/jualanController.js";
import { AuthMiddleware } from "../utils/authMiddleware.js";

const router = Router();

// src/routes/transaksiHarian.route.js
router.post("/jualan-harian", AuthMiddleware, createJualanHarianHandler);
router.delete("/jualan-harian/:id", AuthMiddleware, deleteJualanHarianHandler);

export default router;
