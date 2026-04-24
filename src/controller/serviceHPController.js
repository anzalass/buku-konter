// src/handlers/serviceHP.handler.js
import {
  createServiceHP,
  updateServiceHPStatus,
  deleteServiceHP,
  getAllServiceHP,
  getDetailServiceHP,
  createKlaimGaransi,
  deleteKlaimGaransi,
} from "../service/serviceHPService.js";

export const createServiceHPHandler = async (req, res) => {
  try {
    const {
      brandHP,
      keterangan,
      status,
      biayaJasa,
      sparePart,
      idMember,
      noHP,
      namaPelanggan,
    } = req.body;
    const penempatan = req.user.penempatan;
    const idUser = req.user.id;
    const idToko = req.user.toko_id;

    if (!brandHP || !keterangan || !status || biayaJasa == null || !noHP) {
      return res.status(400).json({ error: "Field wajib tidak lengkap" });
    }

    const result = await createServiceHP(
      {
        brandHP,
        keterangan,
        status,
        biayaJasa: Number(biayaJasa),
        sparePart,
        idMember,
        noHP,
        idUser,
        penempatan,
        namaPelanggan,
        idToko,
      },
      req.user
    );

    res.status(201).json(result);
  } catch (error) {
    console.error("Create Service HP Error:", error);
    res.status(400).json({ error: error.message });
  }
};

// ✅ UPDATE STATUS
export const updateServiceHPStatusHandler = async (req, res) => {
  try {
    const { id } = req.params;

    // if (!status) {
    //   return res.status(400).json({ error: "Status wajib diisi" });
    // }

    await updateServiceHPStatus(id, req.body, req.user);
    res.json({ success: true });
  } catch (error) {
    console.error("Update Status Error:", error);
    res.status(400).json({ error: error.message });
  }
};

// ✅ DELETE
export const deleteServiceHPHandler = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteServiceHP(id, req.user);
    res.json({ success: true });
  } catch (error) {
    console.error("Delete Service Error:", error);
    res.status(400).json({ error: error.message });
  }
};

export const getAllServiceHPHandler = async (req, res) => {
  try {
    const {
      page,
      pageSize,
      search,
      status,
      startDate,
      endDate,
      deletedFilter,
    } = req.query;
    const result = await getAllServiceHP({
      page,
      pageSize,
      search,
      status,
      startDate,
      endDate,
      deletedFilter,
      idToko: req.user.toko_id,
    });
    res.json(result);
  } catch (error) {
    console.error("Get Service Error:", error);
    res.status(400).json({ error: error.message });
  }
};

export const getDetailService = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await getDetailServiceHP(id, req.user);

    res.json({ success: true, data });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

// 🔥 CREATE
export const createKlaimGaransiController = async (req, res) => {
  try {
    const user = req.user; // dari middleware auth
    const data = req.body;

    const result = await createKlaimGaransi(data, user);

    return res.status(201).json({
      success: true,
      message: "Klaim garansi berhasil dibuat",
      data: result,
    });
  } catch (error) {
    console.error("Error createKlaimGaransi:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Gagal membuat klaim garansi",
    });
  }
};

// 🔥 DELETE (soft delete + balikin stok)
export const deleteKlaimGaransiController = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await deleteKlaimGaransi(id);

    return res.status(200).json({
      success: true,
      message: "Klaim garansi berhasil dihapus",
      data: result,
    });
  } catch (error) {
    console.error("Error deleteKlaimGaransi:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Gagal menghapus klaim garansi",
    });
  }
};
