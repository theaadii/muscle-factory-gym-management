"use client";

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
import { useMemo } from "react";
import { getStoredMembers } from "@/lib/localStorage";

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

const defaultRevenueData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      label: "Monthly Revenue (₹)",
      data: [0, 0, 0, 0, 0, 0],
      borderColor: "#8b5cf6",
      backgroundColor: "rgba(139, 92, 246, 0.1)",
      fill: true,
      tension: 0.4,
    },
  ],
};

const defaultDuesData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      label: "Cleared Dues",
      data: [0, 0, 0, 0, 0, 0],
      backgroundColor: "#4ade80",
      borderRadius: 6,
    },
    {
      label: "Pending Dues",
      data: [0, 0, 0, 0, 0, 0],
      backgroundColor: "#ef4444",
      borderRadius: 6,
    },
  ],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
      labels: {
        color: "#a1a1aa",
        font: {
          family: "var(--font-inter)",
          weight: 500,
        },
      },
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
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: "#71717a",
      },
    },
    y: {
      grid: {
        color: "rgba(255, 255, 255, 0.05)",
      },
      ticks: {
        color: "#71717a",
      },
    },
  },
};

export default function PaymentCharts({ payments = [] }) {
  const chartData = useMemo(() => {
    const members = getStoredMembers();
    
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      last6Months.push({
        month: d.toLocaleString('default', { month: 'short' }),
        m: d.getMonth(),
        y: d.getFullYear()
      });
    }

    const planPrices = {
      "1 Month": 999,
      "3 Months": 2699,
      "6 Months": 4999,
      "9 Months": 6999,
      "1 Year": 8999
    };

    const revenueByMonth = last6Months.map(mInfo => {
      return payments
        .filter(p => {
          const pd = new Date(p.payment_date);
          return pd.getMonth() === mInfo.m && pd.getFullYear() === mInfo.y && p.status === "Completed";
        })
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    });

    const clearedByMonth = last6Months.map(mInfo => {
      return payments
        .filter(p => {
          const pd = new Date(p.payment_date);
          return pd.getMonth() === mInfo.m && pd.getFullYear() === mInfo.y && p.status === "Completed";
        })
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    });

    const pendingByMonth = last6Months.map(mInfo => {
      return members
        .filter(mem => {
          if (!mem.next_billing) return false;
          const nb = new Date(mem.next_billing);
          return nb.getMonth() === mInfo.m && nb.getFullYear() === mInfo.y && mem.status !== "Active";
        })
        .reduce((sum, mem) => sum + (planPrices[mem.plan] || 999), 0);
    });

    return {
      revenue: {
        labels: last6Months.map(m => m.month),
        datasets: [{
          ...defaultRevenueData.datasets[0],
          data: revenueByMonth
        }]
      },
      dues: {
        labels: last6Months.map(m => m.month),
        datasets: [
          { ...defaultDuesData.datasets[0], label: "Cleared Dues (₹)", data: clearedByMonth },
          { ...defaultDuesData.datasets[1], label: "Pending Dues (₹)", data: pendingByMonth }
        ]
      }
    };
  }, [payments]);

  return (
    <div className="payment-charts-grid" suppressHydrationWarning>
      <div className="card chart-card" suppressHydrationWarning>
        <div className="chart-header" suppressHydrationWarning>
          <h3>Revenue Overview</h3>
          <p>Monthly earnings trend for the last 6 months</p>
        </div>
        <div className="chart-container" suppressHydrationWarning>
          <Line data={chartData.revenue} options={chartOptions} />
        </div>
      </div>

      <div className="card chart-card" suppressHydrationWarning>
        <div className="chart-header" suppressHydrationWarning>
          <h3>Dues & Clearances</h3>
          <p>Tracking Cleared Transactions vs Expired Members</p>
        </div>
        <div className="chart-container" suppressHydrationWarning>
          <Bar data={chartData.dues} options={chartOptions} />
        </div>
      </div>

      <style jsx>{`
        .payment-charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .chart-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
        }

        .chart-header h3 {
          font-size: 1.125rem;
          font-weight: 600;
        }

        .chart-header p {
          font-size: 0.875rem;
          color: var(--muted-foreground);
          margin-top: 0.25rem;
        }

        .chart-container {
          height: 300px;
          width: 100%;
        }

        @media (max-width: 768px) {
          .payment-charts-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
