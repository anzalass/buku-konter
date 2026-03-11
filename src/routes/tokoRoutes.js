import express from "express";
import {
  getTokoHandler,
  updateFotoTokoHandler,
  updateTokoHandler,
} from "../controller/tokoController.js";
import { AuthMiddleware } from "../utils/authMiddleware.js";

const router = express.Router();

router.get("/toko-user", AuthMiddleware, getTokoHandler);
router.put("/update-toko", AuthMiddleware, updateTokoHandler);
router.put("/update-foto-toko", AuthMiddleware, updateFotoTokoHandler);

export default router;
