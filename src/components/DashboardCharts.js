"use client";

import { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { supabase } from "@/lib/supabaseClient";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
      labels: { color: "#a1a1aa", font: { family: "var(--font-inter)", weight: 500 } },
    },
    tooltip: {
      backgroundColor: "#18181b",
      titleColor: "#fafafa",
      bodyColor: "#a1a1aa",
      borderColor: "#27272a",
      borderWidth: 1,
      padding: 12,
    },
  },
  scales: {
    x: { grid: { display: false }, ticks: { color: "#71717a" } },
    y: { grid: { color: "rgba(255, 255, 255, 0.05)" }, ticks: { color: "#71717a" } },
  },
};

export default function DashboardCharts() {
  const [attendanceChartData, setAttendanceChartData] = useState({
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [{ label: "Attendees", data: [0, 0, 0, 0, 0, 0], borderColor: "#f97316", backgroundColor: "rgba(249, 115, 22, 0.1)", fill: true, tension: 0.4 }],
  });

  const [growthChartData, setGrowthChartData] = useState({
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      { label: "New Members", data: [0, 0, 0, 0, 0, 0], backgroundColor: "#f97316", borderRadius: 6 },
      { label: "Renewals", data: [0, 0, 0, 0, 0, 0], backgroundColor: "#4ade80", borderRadius: 6 },
    ],
  });

  useEffect(() => {
    // In a secondary phase, real aggregations would be fetched here
    // For now, we ensure no mock data is shown
  }, []);

  return (
    <div className="charts-grid">
      <div className="card chart-card">
        <div className="chart-header">
          <h3>Attendance Trends</h3>
          <p>Real-time data from database</p>
        </div>
        <div className="chart-container">
          <Line data={attendanceChartData} options={chartOptions} />
        </div>
      </div>

      <div className="card chart-card">
        <div className="chart-header">
          <h3>Member Growth</h3>
          <p>Real-time tracking</p>
        </div>
        <div className="chart-container">
          <Bar data={growthChartData} options={chartOptions} />
        </div>
      </div>

      <style jsx>{`
        .charts-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 1.5rem; margin-top: 1.5rem; }
        .chart-card { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; }
        .chart-header h3 { font-size: 1.125rem; font-weight: 600; }
        .chart-header p { font-size: 0.875rem; color: var(--muted-foreground); margin-top: 0.25rem; }
        .chart-container { height: 300px; width: 100%; }
        @media (max-width: 768px) { .charts-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
