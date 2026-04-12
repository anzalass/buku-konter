// src/controllers/keuntunganController.js

import {
  getKeuntunganChartData,
  getKeuntunganChartDataFromTable,
  getKeuntunganDashboard,
  getKeuntunganService,
} from "../service/keuntunganService.js";

export const getKeuntunganChart = async (req, res) => {
  try {
    const { idToko } = req.user; // Ambil dari token
    const { periode = "harian" } = req.query; // harian | mingguan | bulanan

    const data = await getKeuntunganChartData(idToko, periode);

    res.status(200).json({
      success: true,
      data,
      periode,
    });
  } catch (error) {
    console.error("Error get keuntungan chart:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data keuntungan",
    });
  }
};

// Controller
export const getKeuntunganChart2 = async (req, res) => {
  try {
    const { periode = "harian" } = req.query;
    const data = await getKeuntunganChartDataFromTable(
      req.user.idToko,
      periode
    );

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getKeuntunganController = async (req, res) => {
  try {
    const { filter, startDate, endDate } = req.query;

    const idToko = req.user.toko_id;

    const result = await getKeuntunganService({
      idToko,
      filter,
      startDate,
      endDate,
    });

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Route

export const getKeuntunganDashboardController = async (req, res) => {
  try {
    const { periode = "mingguan", startDate, endDate } = req.query;

    const idToko = req.user?.toko_id; // 🔥 ambil dari auth middleware

    if (!idToko) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: idToko tidak ditemukan",
      });
    }

    // 🔥 VALIDASI CUSTOM DATE
    if (periode === "custom") {
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: "startDate dan endDate wajib diisi untuk custom range",
        });
      }
    }

    const data = await getKeuntunganDashboard({
      idToko,
      periode,
      startDate,
      endDate,
    });

    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil data keuntungan dashboard",
      data,
    });
  } catch (error) {
    console.error("Controller Error getKeuntunganDashboard:", error);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
};
