import * as produkService from "../service/produkService.js";

export const create = async (req, res) => {
  try {
    const data = await produkService.createProduk(req.body, req.user);
    res.json({ success: true, data });
  } catch (err) {
    console.error("createProduk:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await produkService.updateProduk(id, req.body, req.user);
    res.json({ success: true, data });
  } catch (err) {
    console.error("updateProduk:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateStok = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await produkService.updateStokProduk(
      id,
      req.body.qty,
      req.body.type,
      req.user
    );
    res.json({ success: true, data });
  } catch (err) {
    console.error("updateProduk:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    const { id } = req.params;
    await produkService.deleteProduk(id);
    res.json({ success: true });
  } catch (err) {
    console.error("deleteProduk:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await produkService.getProdukById(id);
    res.json({ success: true, data });
  } catch (err) {
    console.error("getById:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAll = async (req, res) => {
  try {
    const {
      page,
      pageSize,
      search,
      kategori,
      brand,
      createdStart,
      createdEnd,
      updatedStart,
      updatedEnd,
    } = req.query;

    const data = await produkService.getAllProduk({
      page: Number(page) || 1,
      pageSize: Number(pageSize) || 10,
      search,
      kategori,
      brand,
      createdStart,
      createdEnd,
      updatedStart,
      updatedEnd,
      idToko: req.user.toko_id,
    });

    res.json({ success: true, ...data });
  } catch (err) {
    console.error("getAllProduk:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
