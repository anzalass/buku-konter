import express from "express";
import {
  createKejadianController,
  getAllKejadianController,
  getDetailKejadianController,
  updateKejadianController,
  deleteKejadianController,
} from "../controller/kejadianTakTerdugaController.js";
import { AuthMiddleware } from "../utils/authMiddleware.js";

const router = express.Router();

// 🔥 CRUD
router.post("/kejadian-tak-terduga", AuthMiddleware, createKejadianController);
router.get("/kejadian-tak-terduga", AuthMiddleware, getAllKejadianController);
router.get(
  "/kejadian-tak-terduga/:id",
  AuthMiddleware,
  getDetailKejadianController
);
router.put(
  "/kejadian-tak-terduga/:id",
  AuthMiddleware,
  updateKejadianController
);
router.delete(
  "/kejadian-tak-terduga/:id",
  AuthMiddleware,
  deleteKejadianController
);

export default router;
