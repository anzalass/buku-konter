// src/controllers/keuntunganController.js

import {
  getKeuntunganChartData,
  getKeuntunganChartDataFromTable,
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

// Route
app.get("/api/keuntungan/chart", authenticateToken, getKeuntunganChart);
