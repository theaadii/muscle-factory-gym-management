"use client";

import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatsCard({ title, value, icon: Icon, trend, trendValue, color, isEmpty, emptyMessage, emptySubtext, actionButton }) {
  const isPositive = trend === "up";

  return (
    <div className="card stats-card" suppressHydrationWarning={true}>
      <div className="stats-info" suppressHydrationWarning={true}>
        <div className="stats-header" suppressHydrationWarning={true}>
          <p className="stats-title" suppressHydrationWarning={true}>{title}</p>
          <div className="stats-icon-wrapper" style={{ color }} suppressHydrationWarning={true}>
            <Icon size={24} />
          </div>
        </div>
        
        {isEmpty ? (
          <div className="empty-state-content" suppressHydrationWarning={true}>
            <h3 className="empty-message" suppressHydrationWarning={true}>{emptyMessage || "No data yet"}</h3>
            {emptySubtext && <p className="empty-subtext" suppressHydrationWarning={true}>{emptySubtext}</p>}
            {actionButton && <div className="empty-action" suppressHydrationWarning={true}>{actionButton}</div>}
          </div>
        ) : (
          <>
            <h3 className="stats-value" suppressHydrationWarning={true}>{value}</h3>
            <div className="stats-trend" suppressHydrationWarning={true}>
              <span className={`trend-badge ${isPositive ? 'positive' : 'negative'}`} suppressHydrationWarning={true}>
                {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {trendValue}%
              </span>
              <span className="trend-text" suppressHydrationWarning={true}>vs last month</span>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .stats-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .stats-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .stats-title {
          color: var(--muted-foreground);
          font-size: 0.875rem;
          font-weight: 500;
        }

        .stats-icon-wrapper {
          padding: 0.5rem;
          border-radius: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
        }

        .stats-value {
          font-size: 1.875rem;
          font-weight: 700;
          margin-top: 0.25rem;
        }

        .stats-trend {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .trend-badge {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.2rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .trend-badge.positive {
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
        }

        .trend-badge.negative {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .trend-text {
          font-size: 0.75rem;
          color: var(--muted-foreground);
        }
        
        .empty-state-content {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          margin-top: 0.25rem;
        }

        .empty-message {
          font-size: 1rem;
          font-weight: 700;
          color: var(--foreground);
        }

        .empty-subtext {
          font-size: 0.8125rem;
          font-weight: 500;
          color: var(--muted-foreground);
        }

        .empty-action {
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  );
}
