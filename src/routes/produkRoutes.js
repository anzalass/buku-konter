import express from "express";
import * as controller from "../controller/produkController.js";
import { AuthMiddleware } from "../utils/authMiddleware.js";

const router = express.Router();

// CRUD
router.post("/produk", AuthMiddleware, controller.create);
router.get("/produk", AuthMiddleware, controller.getAll);
router.get("/produk/:id", AuthMiddleware, controller.getById);
router.put("/produk/:id", AuthMiddleware, controller.update);
router.delete("/produk/:id", AuthMiddleware, controller.remove);
router.patch("/produk/:id/stok", AuthMiddleware, controller.updateStok);

export default router;
