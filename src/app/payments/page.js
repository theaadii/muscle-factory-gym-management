"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { CreditCard, DollarSign, Search, Calendar, Filter, Plus, ChevronRight, FileText, Trash2, Download } from "lucide-react";
import PaymentCharts from "@/components/PaymentCharts";
import { supabase } from "@/lib/supabaseClient";
import { getStoredPayments, savePayments, getStoredMembers, clearAllPayments } from "@/lib/localStorage";

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    monthlyRevenue: 0,
    pendingDues: 0,
    revenueGrowth: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMonth, setFilterMonth] = useState("This Month");
  const [filterStatus, setFilterStatus] = useState("All Status");

  useEffect(() => {
    fetchPaymentsData();
  }, []);

  const fetchPaymentsData = async () => {
    try {
      setLoading(true);
      
      let finalPayments = [];
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        finalPayments = data;
      } else {
        finalPayments = getStoredPayments();
      }

      setPayments(finalPayments);

      // Calculate Stats
      const members = getStoredMembers();
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      const monthlyRevenue = finalPayments
        .filter(p => {
          const d = new Date(p.payment_date);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear && p.status === "Completed";
        })
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

      // Calculate Pending Dues (Sum of plan prices for Expired members)
      const planPrices = {
        "1 Month": 999,
        "3 Months": 2699,
        "6 Months": 4999,
        "9 Months": 6999,
        "1 Year": 8999
      };

      const pendingDues = members
        .filter(m => m.status === "Expired")
        .reduce((sum, m) => sum + (planPrices[m.plan] || 999), 0);

      setStats({
        monthlyRevenue: monthlyRevenue,
        pendingDues: pendingDues,
        revenueGrowth: 12 // Simulated growth
      });

    } catch (err) {
      console.error("Payments fetch error:", err);
    } finally {
      setLoading(false);
    }
  };
  const handleDeletePayment = (id) => {
    const confirm1 = window.confirm("Are you sure you want to remove this payment record?");
    if (!confirm1) return;
    
    const confirm2 = window.confirm("Wait! This will PERMANENTLY delete the invoice. Are you absolutely sure?");
    if (!confirm2) return;

    const currentPayments = getStoredPayments();
    const updated = currentPayments.filter(p => p.id !== id);
    savePayments(updated);
    setPayments(updated);
    // Refresh stats if needed, but simple filter is enough for UI
    fetchPaymentsData(); 
  };

  const handleResetHistory = () => {
    const confirm1 = window.confirm("Are you sure you want to CLEAR ALL payment records?");
    if (!confirm1) return;
    
    const confirm2 = window.confirm("WARNING: This will permanently erase your entire billing history. Members will NOT be deleted. Proceed?");
    if (!confirm2) return;

    clearAllPayments();
    setPayments([]);
    fetchPaymentsData();
  };

  const filteredPayments = payments.filter(p => {
    // 1. Search Filter
    const searchMatch = 
      p.member_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 2. Status Filter
    const statusMatch = filterStatus === "All Status" || p.status === filterStatus;
    
    // 3. Date Filter (Simplified for This Month/Last Month)
    let dateMatch = true;
    const pDate = new Date(p.payment_date);
    const now = new Date();
    
    if (filterMonth === "This Month") {
      dateMatch = pDate.getMonth() === now.getMonth() && pDate.getFullYear() === now.getFullYear();
    } else if (filterMonth === "Last Month") {
      const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
      const lastYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      dateMatch = pDate.getMonth() === lastMonth && pDate.getFullYear() === lastYear;
    } else if (filterMonth === "This Year") {
      dateMatch = pDate.getFullYear() === now.getFullYear();
    }
    
    return searchMatch && statusMatch && dateMatch;
  });

  const resetFilters = () => {
    setSearchTerm("");
    setFilterMonth("This Month");
    setFilterStatus("All Status");
  };

  return (
    <div className="payments-page" suppressHydrationWarning={true}>
      <header className="page-header">
        <div className="header-text">
           <h1 className="gradient-text" suppressHydrationWarning={true}>Payments & Billings</h1>
          <p>Track all membership dues and transactions for Muscle Factory.</p>
        </div>
        <button className="btn-primary">
          <Plus size={20} />
          <span>Record New Payment</span>
        </button>
      </header>

      {/* Financial Summary */}
      <section className="billing-stats">
        <div className="card billing-card primary-border">
          <div className="card-info">
            <DollarSign className="billing-icon text-primary" size={28} />
            <div className="text-group">
              <span className="label">Total Revenue (MTD)</span>
              <h3 className="value">₹{stats.monthlyRevenue.toLocaleString()}</h3>
            </div>
          </div>
          <div className="card-trend positive">
            <span>+{stats.revenueGrowth}%</span>
          </div>
        </div>

        <div className="card billing-card warning-border">
          <div className="card-info">
            <CreditCard className="billing-icon text-warning" size={28} />
            <div className="text-group">
              <span className="label">Pending Dues</span>
              <h3 className="value">₹{stats.pendingDues.toLocaleString()}</h3>
            </div>
          </div>
          <div className="card-actions">
            <button className="view-link text-warning">View Unpaid <ChevronRight size={14} /></button>
          </div>
        </div>
      </section>

      {/* Payment Trends & Charts */}
      <PaymentCharts payments={payments} />

      {/* Filters and List */}
      <section className="transactions-list card">
        <div className="list-toolbar">
          <div className="search-box">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search by member name or invoice ID..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="toolbar-actions">
            {(searchTerm || filterMonth !== "This Month" || filterStatus !== "All Status") && (
              <button className="btn-ghost" onClick={resetFilters} style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f87171' }}>
                Clear Filters
              </button>
            )}
             <div className="filter-item">
              <Calendar size={18} />
              <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
                <option>All Time</option>
                <option>This Month</option>
                <option>Last Month</option>
                <option>This Year</option>
              </select>
            </div>
            <div className="filter-item">
              <Filter size={18} />
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option>All Status</option>
                <option>Completed</option>
                <option>Pending</option>
                <option>Failed</option>
              </select>
            </div>

            <div className="toolbar-separator"></div>

            <button className="icon-btn delete-btn" title="Reset History / Clear All" onClick={handleResetHistory}>
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice ID</th>
              <th>Member Name</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Method</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.length > 0 ? (
              filteredPayments.map((payment, idx) => (
                <tr key={`${payment.id}-${idx}`}>
                  <td><code className="invoice-id">{payment.id}</code></td>
                  <td><span className="member-name">{payment.member_name}</span></td>
                  <td className="amount-cell">₹{payment.amount.toLocaleString()}</td>
                  <td>{new Date(payment.payment_date).toLocaleDateString('en-GB')}</td>
                  <td>
                    <span className="method-tag">{payment.method}</span>
                  </td>
                  <td>
                    <span className={`badge ${payment.status === "Completed" ? "badge-success" : "badge-danger"}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="action-cell">
                    <div className="action-group">
                      <button className="icon-btn" title="Download Invoice">
                        <FileText size={18} />
                      </button>
                      <button 
                        className="icon-btn delete-btn" 
                        title="Delete Invoice"
                        onClick={() => handleDeletePayment(payment.id)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="empty-row">No payment records found in the database.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <style jsx>{`
        .empty-row { padding: 4rem; text-align: center; color: var(--muted-foreground); }
        .payments-page { max-width: 1200px; margin: 0 auto; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; }
        .header-text h1 { font-size: 2rem; font-weight: 800; letter-spacing: -0.02em; }
        .header-text p { color: var(--muted-foreground); margin-top: 0.25rem; }
        .billing-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
        .billing-card { padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; border-width: 2px; }
        .primary-border { border-color: var(--primary); }
        .warning-border { border-color: #fbbf24; }
        .card-info { display: flex; align-items: center; gap: 1rem; }
        .text-group { display: flex; flex-direction: column; }
        .label { font-size: 0.8125rem; font-weight: 600; color: var(--muted-foreground); text-transform: uppercase; }
        .value { font-size: 1.5rem; font-weight: 800; color: var(--foreground); }
        .card-trend.positive { color: #4ade80; font-weight: 700; font-size: 0.875rem; }
        .view-link { display: flex; align-items: center; gap: 0.25rem; font-size: 0.8125rem; font-weight: 700; text-transform: uppercase; }
        .transactions-list { padding: 0; }
        .list-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border); gap: 2rem; }
        .search-box { position: relative; flex: 1; display: flex; align-items: center; max-width: 400px; }
        .search-box svg { position: absolute; left: 1rem; color: var(--muted-foreground); }
        .search-box input { width: 100%; padding: 0.625rem 1rem 0.625rem 2.75rem; background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border); border-radius: var(--radius); color: var(--foreground); font-size: 0.875rem; }
        .toolbar-actions { display: flex; gap: 1rem; }
        .filter-item { display: flex; align-items: center; gap: 0.5rem; color: var(--muted-foreground); font-size: 0.875rem; }
        .filter-item select { padding: 0.5rem; background: transparent; border: 1px solid var(--border); border-radius: var(--radius); color: var(--foreground); }
        .data-table { width: 100%; border-collapse: collapse; text-align: left; }
        .data-table th { padding: 1rem 1.5rem; color: var(--muted-foreground); font-size: 0.8125rem; font-weight: 700; text-transform: uppercase; border-bottom: 1px solid var(--border); }
        .data-table td { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border); font-size: 0.875rem; }
        .invoice-id { font-weight: 700; color: var(--primary); }
        .member-name { font-weight: 600; }
        .amount-cell { font-family: inherit; font-weight: 700; }
        .method-tag { font-size: 0.75rem; font-weight: 600; background: rgba(255, 255, 255, 0.05); padding: 0.25rem 0.5rem; border-radius: 4px; color: var(--muted-foreground); }
        .action-cell { width: 100px; }
        .action-group { display: flex; gap: 0.5rem; }
        .icon-btn { 
          padding: 0.5rem; 
          background: rgba(255, 255, 255, 0.05); 
          border: 1px solid var(--border); 
          border-radius: 6px; 
          color: var(--muted-foreground); 
          cursor: pointer; 
          transition: all 0.2s; 
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .icon-btn:hover { background: rgba(255, 255, 255, 0.1); color: var(--foreground); }
        .delete-btn:hover { background: rgba(239, 68, 68, 0.1) !important; color: #ef4444 !important; border-color: rgba(239, 68, 68, 0.2) !important; }
        .text-primary { color: var(--primary); }
        .text-warning { color: #fbbf24; }
        .danger-text { color: #ef4444; }
        .danger-text:hover { background: rgba(239, 68, 68, 0.1); }
        .toolbar-separator { width: 1px; height: 24px; background: var(--border); margin: 0 0.5rem; opacity: 0.3; }
        @media (max-width: 900px) { .list-toolbar { flex-direction: column; align-items: stretch; gap: 1rem; } .search-box { max-width: none; } .toolbar-separator { display: none; } }
      `}</style>
    </div>
  );
}
