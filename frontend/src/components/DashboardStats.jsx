import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import "./DashboardStats.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const DashboardStats = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        setLoading(true);
        const response = await fetch(
          "http://localhost:3030/api/dashboard-stats",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        if (response.ok) {
          const json = await response.json();
          setStats(json?.payload?.datas);
        }
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [navigate]);

  if (loading) {
    return (
      <div className="dashboard-stats-wrapper">
        <div className="dashboard-loading">
          <div className="loading-pulse-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="loading-pulse-card"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const { totals, sectionBreakdown } = stats;

  // --- Stat Cards Data ---
  const statCards = [
    {
      label: "Total Section",
      value: totals.sections,
      icon: "bi-folder2-open",
      gradient: "gradient-blue",
      accent: "#3b82f6",
    },
    {
      label: "Total Level",
      value: totals.levels,
      icon: "bi-layers",
      gradient: "gradient-purple",
      accent: "#8b5cf6",
    },
    {
      label: "Soal PG",
      value: totals.soalPG,
      icon: "bi-ui-checks",
      gradient: "gradient-emerald",
      accent: "#10b981",
    },
    {
      label: "Soal Esai",
      value: totals.soalEsai,
      icon: "bi-pencil-square",
      gradient: "gradient-amber",
      accent: "#f59e0b",
    },
  ];

  // --- Doughnut Chart: Soal PG vs Esai ---
  const doughnutData = {
    labels: ["Pilihan Ganda", "Esai"],
    datasets: [
      {
        data: [totals.soalPG, totals.soalEsai],
        backgroundColor: [
          "rgba(59, 130, 246, 0.85)",
          "rgba(245, 158, 11, 0.85)",
        ],
        borderColor: ["rgba(59, 130, 246, 1)", "rgba(245, 158, 11, 1)"],
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "65%",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: "circle",
          boxWidth: 12,
          boxHeight: 12,
          font: { family: "'Inter', sans-serif", size: 13, weight: "500" },
          color: "#374151",
        },
      },
      tooltip: {
        backgroundColor: "rgba(17,24,39,0.9)",
        titleFont: { family: "'Inter', sans-serif", size: 13 },
        bodyFont: { family: "'Inter', sans-serif", size: 12 },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function (context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const pct = total > 0 ? ((context.raw / total) * 100).toFixed(1) : 0;
            return ` ${context.label}: ${context.raw} soal (${pct}%)`;
          },
        },
      },
    },
  };

  // --- Bar Chart: Level & Soal per Section ---
  const barColors = [
    { bg: "rgba(99, 102, 241, 0.7)", border: "rgba(99, 102, 241, 1)" },
    { bg: "rgba(16, 185, 129, 0.7)", border: "rgba(16, 185, 129, 1)" },
  ];

  const barData = {
    labels: sectionBreakdown.map((s) =>
      s.nama.length > 14 ? s.nama.substring(0, 14) + "…" : s.nama
    ),
    datasets: [
      {
        label: "Level",
        data: sectionBreakdown.map((s) => s.totalLevels),
        backgroundColor: barColors[0].bg,
        borderColor: barColors[0].border,
        borderWidth: 1.5,
        borderRadius: 6,
        barPercentage: 0.7,
      },
      {
        label: "Soal",
        data: sectionBreakdown.map((s) => s.totalSoal),
        backgroundColor: barColors[1].bg,
        borderColor: barColors[1].border,
        borderWidth: 1.5,
        borderRadius: 6,
        barPercentage: 0.7,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        align: "end",
        labels: {
          padding: 16,
          usePointStyle: true,
          pointStyle: "circle",
          boxWidth: 10,
          boxHeight: 10,
          font: { family: "'Inter', sans-serif", size: 12, weight: "500" },
          color: "#374151",
        },
      },
      tooltip: {
        backgroundColor: "rgba(17,24,39,0.9)",
        titleFont: { family: "'Inter', sans-serif", size: 13 },
        bodyFont: { family: "'Inter', sans-serif", size: 12 },
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          font: { family: "'Inter', sans-serif", size: 11, weight: "500" },
          color: "#6b7280",
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(229, 231, 235, 0.6)",
          drawBorder: false,
        },
        ticks: {
          font: { family: "'Inter', sans-serif", size: 11 },
          color: "#9ca3af",
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="dashboard-stats-wrapper">
      {/* Stat Cards */}
      <div className="stat-cards-grid">
        {statCards.map((card, idx) => (
          <div key={idx} className={`stat-card ${card.gradient}`}>
            <div className="stat-card-icon-wrap">
              <i className={`bi ${card.icon}`}></i>
            </div>
            <div className="stat-card-info">
              <span className="stat-card-value">{card.value}</span>
              <span className="stat-card-label">{card.label}</span>
            </div>
            <div className="stat-card-decoration"></div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-card-header">
            <h3 className="chart-card-title">
              <i className="bi bi-pie-chart-fill"></i>
              Distribusi Tipe Soal
            </h3>
            <span className="chart-card-subtitle">
              {totals.totalSoal} soal total
            </span>
          </div>
          <div className="chart-card-body doughnut-container">
            {totals.totalSoal > 0 ? (
              <Doughnut data={doughnutData} options={doughnutOptions} />
            ) : (
              <div className="chart-empty">
                <i className="bi bi-inbox"></i>
                <p>Belum ada soal</p>
              </div>
            )}
          </div>
        </div>

        <div className="chart-card chart-card-wide">
          <div className="chart-card-header">
            <h3 className="chart-card-title">
              <i className="bi bi-bar-chart-fill"></i>
              Level & Soal per Section
            </h3>
            <span className="chart-card-subtitle">
              {sectionBreakdown.length} section tersedia
            </span>
          </div>
          <div className="chart-card-body bar-container">
            {sectionBreakdown.length > 0 ? (
              <Bar data={barData} options={barOptions} />
            ) : (
              <div className="chart-empty">
                <i className="bi bi-inbox"></i>
                <p>Belum ada section</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
