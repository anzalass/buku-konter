import { getAllLogs } from "../service/logService.js";

export const getLogsController = async (req, res) => {
  try {
    const idToko = req.user.toko_id;

    const {
      nama = "",
      kategori = "all",
      keterangan = "",
      startDate,
      endDate,
      page = 1,
      pageSize = 10,
    } = req.query;

    const result = await getAllLogs({
      idToko,
      nama,
      kategori,
      keterangan,
      startDate,
      endDate,
      page: Number(page),
      pageSize: Number(pageSize),
    });

    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil data log",
      ...result,
    });
  } catch (error) {
    console.error("ERROR getLogsController:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Terjadi kesalahan server",
    });
  }
};
