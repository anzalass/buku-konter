// src/routes/sparepart.route.js
import { Router } from "express";
import { getLogsController } from "../controller/logController.js";
import { AuthMiddleware } from "../utils/authMiddleware.js";

const router = Router();

// src/routes/transaksiHarian.route.js
router.get("/logs", AuthMiddleware, getLogsController);
export default router;
