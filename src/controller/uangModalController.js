// src/handlers/uangModal.handler.js
import {
  getAlluangKeluar,
  createuangKeluar,
  updateuangKeluar,
  deleteuangKeluar,
} from "../service/uangModalService.js";

// GET /api/uang-modal
export const getAllUangModalHandler = async (req, res) => {
  try {
    const { page, pageSize, search, startDate, endDate } = req.query;
    const result = await getAlluangKeluar({
      page,
      pageSize,
      search,
      startDate,
      endDate,
      user: req.user,
    });
    res.json(result);
  } catch (error) {
    console.error("Get Uang Modal Error:", error);
    res.status(400).json({ error: error.message });
  }
};

// POST /api/uang-modal
export const createUangModalHandler = async (req, res) => {
  try {
    const { keterangan, tanggal, jumlah } = req.body;
    const penempatan = req.user.penempatan;
    const idUser = req.user.id;
    const result = await createuangKeluar({
      keterangan,
      tanggal,
      jumlah,
      penempatan,
      idUser,
      idToko: req.user.toko_id,
      user: req.user,
    });
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// PUT /api/uang-modal/:id
export const updateUangModalHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await updateuangKeluar(id, req.body, req.user);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// DELETE /api/uang-modal/:id
export const deleteUangModalHandler = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteuangKeluar(id, req.user);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
