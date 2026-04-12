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
router.get(
  "/produk-active",
  AuthMiddleware,
  controller.getAllProdukActiveHandler
);
router.get(
  "/produk-voucher",
  AuthMiddleware,
  controller.getAllProdukVoucherActiveHandler
);

router.get(
  "/produk-sparepart",
  AuthMiddleware,
  controller.getAllProdukSparepartActiveHandler
);
export default router;
