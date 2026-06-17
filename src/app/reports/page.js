"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { BarChart3, TrendingUp, Users, Clock, Download, Calendar } from "lucide-react";
import DashboardCharts from "@/components/DashboardCharts";
import { supabase } from "@/lib/supabaseClient";

export default function ReportsPage() {
  const [stats, setStats] = useState({
    retention: 0,
    growthIndex: 0,
    totalSessions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      // Fetch Real Totals for Analytics
      // 1. Total Members
      const { count: totalMembers } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true });

      // 2. Active Members
      const { count: activeMembers } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Active');

      // 3. Total Attendance Records
      const { count: attendanceCount } = await supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true });

      setStats({
        retention: totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 0,
        growthIndex: 0, 
        totalSessions: attendanceCount || 0
      });

    } catch (err) {
      console.error("Reports error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reports-page">
      <header className="page-header">
        <div className="header-text" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          
          <div>
            <h1>Analytics & Reports</h1>
            <p>In-depth performance metrics for Muscle Factory.</p>
          </div>
        </div>
        <div className="header-actions">
           <div className="date-range card">
            <Calendar size={18} />
            <span suppressHydrationWarning>{new Date().toLocaleDateString('en-GB')}</span>
          </div>
          <button className="btn-secondary">
            <Download size={18} />
            <span>Export Report</span>
          </button>
        </div>
      </header>

      {/* Overview Cards */}
      <section className="overview-stats">
        <div className="card overview-card">
          <div className="icon-box blue"><Users size={24} /></div>
          <div className="stat-info">
            <span className="label">Retention Rate</span>
            <h3 className="value">{stats.retention}%</h3>
            <span className="trend positive">Live stats from database</span>
          </div>
        </div>

        <div className="card overview-card">
          <div className="icon-box orange"><TrendingUp size={24} /></div>
          <div className="stat-info">
            <span className="label">Growth Index</span>
            <h3 className="value">1.0x</h3>
            <span className="trend positive">New software start</span>
          </div>
        </div>

        <div className="card overview-card">
          <div className="icon-box purple"><Clock size={24} /></div>
          <div className="stat-info">
            <span className="label">Total Sessions</span>
            <h3 className="value">{stats.totalSessions.toLocaleString()}</h3>
            <span className="trend positive">All-time check-ins</span>
          </div>
        </div>
      </section>

      {/* Main Charts */}
      <section className="reports-section">
        <div className="section-header">
          <h2>Growth & Tracking</h2>
          <p>Tracking high-level member metrics</p>
        </div>
        <DashboardCharts />
      </section>

      <style jsx>{`
        .reports-page { max-width: 1200px; margin: 0 auto; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2.5rem; }
        .header-text h1 { font-size: 2rem; font-weight: 800; letter-spacing: -0.02em; }
        .header-text p { color: var(--muted-foreground); margin-top: 0.25rem; }
        .header-actions { display: flex; gap: 1rem; }
        .date-range { display: flex; align-items: center; gap: 0.75rem; padding: 0.2rem 1.25rem; font-size: 0.875rem; font-weight: 600; color: var(--foreground); border-color: var(--border); }
        .btn-secondary { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.25rem; background: var(--secondary); color: var(--foreground); border-radius: var(--radius); font-weight: 600; font-size: 0.875rem; }
        .overview-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem; }
        .overview-card { padding: 1.5rem; display: flex; gap: 1.5rem; align-items: center; }
        .icon-box { width: 56px; height: 56px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .icon-box.blue { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
        .icon-box.orange { background: rgba(249, 115, 22, 0.1); color: #f97316; }
        .icon-box.purple { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
        .stat-info { display: flex; flex-direction: column; gap: 0.25rem; }
        .stat-info .label { font-size: 0.8125rem; font-weight: 600; color: var(--muted-foreground); text-transform: uppercase; }
        .stat-info .value { font-size: 1.75rem; font-weight: 800; color: var(--foreground); }
        .stat-info .trend { font-size: 0.75rem; font-weight: 600; }
        .trend.positive { color: #4ade80; }
        .reports-section { margin-bottom: 2.5rem; }
        .section-header h2 { font-size: 1.5rem; font-weight: 700; }
        .section-header p { font-size: 0.875rem; color: var(--muted-foreground); margin-bottom: 1.5rem; }
        @media (max-width: 768px) { .page-header { flex-direction: column; align-items: flex-start; gap: 1.5rem; } .header-actions { flex-direction: column; width: 100%; } }
      `}</style>
    </div>
  );
}
