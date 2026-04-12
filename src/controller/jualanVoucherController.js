// src/controllers/transaksiVoucherController.js
import {
  createJualan,
  deleteTransaksiVoucher,
} from "../service/jualanVoucherService.js";

// POST /api/transaksi-voucher
export const createTransaksi = async (req, res) => {
  try {
    await createJualan(req.body, req.user);
    res.status(201).json({
      success: true,
      message: "Transaksi berhasil dibuat",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE /api/transaksi-voucher/:id
export const deleteTransaksi = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteTransaksiVoucher(id, req.user);
    return res.status(200).json({
      success: true,
      message: result.message,
      data: { restoredStok: result.restoredStok },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
