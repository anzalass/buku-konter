import {
  createKejadian,
  getAllKejadian,
  getDetailKejadian,
  updateKejadian,
  deleteKejadian,
} from "../service/kejadianTakTerdugaService.js";

// CREATE
export const createKejadianController = async (req, res) => {
  try {
    const data = await createKejadian(req.body, req.user);

    res.json({
      success: true,
      message: "Berhasil tambah kejadian",
      data,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// GET ALL
export const getAllKejadianController = async (req, res) => {
  try {
    const data = await getAllKejadian(req.query, req.user);

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// GET DETAIL
export const getDetailKejadianController = async (req, res) => {
  try {
    const data = await getDetailKejadian(req.params.id, req.user);

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: err.message,
    });
  }
};

// UPDATE
export const updateKejadianController = async (req, res) => {
  try {
    const data = await updateKejadian(req.params.id, req.body, req.user);

    res.json({
      success: true,
      message: "Berhasil update",
      data,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// DELETE
export const deleteKejadianController = async (req, res) => {
  try {
    await deleteKejadian(req.params.id, req.user);

    res.json({
      success: true,
      message: "Berhasil dihapus",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
