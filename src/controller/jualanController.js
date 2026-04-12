// src/handlers/transaksiHarian.handler.js
import {
  createJualanHarian,
  deleteJualanHarian,
} from "../service/jualanService.js";

// ✅ CREATE Jualan Harian
export const createJualanHarianHandler = async (req, res) => {
  try {
    const { kategori, nominal, tanggal, idMember } = req.body;
    const idToko = req.user.toko_id;
    const result = await createJualanHarian({
      kategori,
      nominal,
      idMember,
      tanggal,
      user: req.user,
      idToko,
    });
    res.status(201).json(result);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

// ✅ DELETE Jualan Harian
export const deleteJualanHarianHandler = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteJualanHarian(id, req.user);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
