"use client";

import { useState, useEffect } from "react";
import { ArrowUpRight } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function RecentPayments() {
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('payments')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) {
          setRecentPayments([]);
        } else {
          setRecentPayments(data || []);
        }
      } catch (e) {
        setRecentPayments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRecent();
  }, []);

  return (
    <div className="card payments-card">
      <div className="card-header">
        <div className="header-info">
          <h3>Recent Payments</h3>
          <p>Latest transactions from the database</p>
        </div>
        <button className="view-all-btn">
          View All <ArrowUpRight size={16} />
        </button>
      </div>

      <div className="payments-list">
        <table className="payments-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentPayments.length > 0 ? (
              recentPayments.map((payment) => (
                <tr key={payment.id}>
                  <td>
                    <span className="member-name">{payment.member_name}</span>
                  </td>
                  <td>{new Date(payment.payment_date).toLocaleDateString('en-GB')}</td>
                  <td>₹{payment.amount.toLocaleString()}</td>
                  <td>{payment.method}</td>
                  <td>
                    <span className={`badge ${payment.status === "Completed" ? "badge-success" : "badge-danger"}`}>
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
                <tr>
                    <td colSpan="5" className="empty-row">No recent payments logged.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .empty-row { text-align: center; color: var(--muted-foreground); padding: 1rem; }
        .payments-card { margin-top: 1.5rem; padding: 1.5rem; }
        .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .header-info h3 { font-size: 1.125rem; font-weight: 600; }
        .header-info p { font-size: 0.875rem; color: var(--muted-foreground); margin-top: 0.25rem; }
        .view-all-btn { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; font-weight: 500; color: var(--primary); transition: opacity 0.2s; }
        .view-all-btn:hover { opacity: 0.8; }
        .payments-list { overflow-x: auto; }
        .payments-table { width: 100%; border-collapse: collapse; text-align: left; }
        .payments-table th { padding: 0.75rem 1rem; border-bottom: 1px solid var(--border); color: var(--muted-foreground); font-size: 0.875rem; font-weight: 500; }
        .payments-table td { padding: 1rem; border-bottom: 1px solid var(--border); font-size: 0.875rem; }
        .member-name { font-weight: 500; color: var(--foreground); }
        .payments-table tr:last-child td { border-bottom: none; }
      `}</style>
    </div>
  );
}
