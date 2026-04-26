import express from "express";
import {
  create,
  getAll,
  getDetail,
  update,
  remove,
  updateSub,
  createUser,
  updateUser,
  updatePasswordUser,
  verifySuperAdmin,
} from "../controller/superAdminController.js";
import {
  AuthMiddleware,
  isSuperAdmin,
  superAdminAuth,
  SuperAdminMiddleware,
} from "../utils/authMiddleware.js";

const router = express.Router();

router.post("/super-admin/toko", AuthMiddleware, isSuperAdmin, create);
router.post(
  "/super-admin/create-user",
  AuthMiddleware,
  isSuperAdmin,
  createUser
);
router.put("/super-admin/users/:id", AuthMiddleware, isSuperAdmin, updateUser);

router.get("/super-admin/toko", AuthMiddleware, isSuperAdmin, getAll);
router.get("/super-admin/toko/:id", AuthMiddleware, isSuperAdmin, getDetail);
router.put("/super-admin/toko/:id", AuthMiddleware, isSuperAdmin, update);
router.delete("/super-admin/toko/:id", AuthMiddleware, isSuperAdmin, remove);

/* Update Subscribe */
router.put(
  "/super-admin/toko/:id/subscribe",
  AuthMiddleware,
  isSuperAdmin,
  updateSub
);
router.put(
  "/super-admin/users/:id/password",
  AuthMiddleware,
  isSuperAdmin,
  updatePasswordUser
);
router.post(
  "/super-admin-auth",
  SuperAdminMiddleware,
  isSuperAdmin,
  verifySuperAdmin
);
export default router;
