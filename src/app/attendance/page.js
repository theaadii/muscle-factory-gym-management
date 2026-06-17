"use client";

import { useState, useEffect, useCallback } from "react";
import { UserCheck, Clock, Calendar, Search, Filter, Fingerprint, ArrowUpRight, ArrowDownRight, CheckCircle2, AlertCircle, BarChart3, TrendingUp } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { getStoredMembers, getStoredAttendance, saveAttendance as saveLocalAttendance } from "@/lib/localStorage";
import { getPeakHours, getMemberAttendanceStats, getInactiveMembers } from "@/lib/attendanceUtils";

export default function AttendancePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [memberIdInput, setMemberIdInput] = useState("");
  const [feedback, setFeedback] = useState({ message: "", type: "" });
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInsights, setShowInsights] = useState(false);
  const [peakHours, setPeakHours] = useState({});
  const [memberStats, setMemberStats] = useState([]);
  const [inactiveMembers, setInactiveMembers] = useState([]);
  const [allMembers, setAllMembers] = useState([]);

  // Helper to format name as "FirstName LastName" (excludes middle name)
  const formatName = (fullName) => {
    if (!fullName) return "";
    const parts = fullName.trim().split(/\s+/);
    if (parts.length <= 2) return fullName;
    return `${parts[0]} ${parts[parts.length - 1]}`;
  };

  // Helper for date ordinal (1st, 2nd, 3rd, etc.)
  const getOrdinal = (d) => {
    if (d > 3 && d < 21) return 'th';
    switch (d % 10) {
      case 1:  return "st";
      case 2:  return "nd";
      case 3:  return "rd";
      default: return "th";
    }
  };

  const formatHeaderDate = () => {
    const d = new Date();
    const dayName = d.toLocaleDateString('en-GB', { weekday: 'long' });
    const day = d.getDate();
    const month = d.toLocaleDateString('en-GB', { month: 'long' });
    const year = d.getFullYear();
    return `${dayName}, ${day}${getOrdinal(day)} ${month}, ${year}`;
  };

  // Helper to fetch attendance records
  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      let finalRecords = [];
      
      // 1. Try Supabase
      const { data, error } = await supabase
        .from('attendance')
        .select(`*, member:members(name, avatar)`)
        .gte('created_at', `${today}T00:00:00Z`)
        .lte('created_at', `${today}T23:59:59Z`)
        .order('created_at', { ascending: false });

      if (!error && data) {
        finalRecords = data;
      } else {
        // 2. Fallback to LocalStorage
        const localRecords = getStoredAttendance();
        const members = getStoredMembers();
        
        // Filter for today
        const todayRecords = localRecords.filter(r => r.created_at.startsWith(today));
        
        // Map member info
        finalRecords = todayRecords.map(r => ({
          ...r,
          member: members.find(m => m.id === r.member_id) || { name: "Local Member" }
        }));
      }
      
      setAttendanceRecords(finalRecords);
      
      // Load insights data
      const members = getStoredMembers();
      setAllMembers(members);
      setPeakHours(getPeakHours());
      setMemberStats(getMemberAttendanceStats());
      setInactiveMembers(getInactiveMembers(members, 7));
    } catch (err) {
      console.error("Attendance fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const calculateDuration = (inTime, outTime) => {
    if (!inTime || !outTime) return "-";
    if (outTime === "Currently Training" || !outTime) return "Active";

    const start = new Date(inTime);
    const end = new Date(outTime);
    const diffMs = end - start;
    const diffMins = Math.round(diffMs / 60000);
    
    const hrs = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    
    if (diffMins < 0) return "-";
    return hrs > 0 ? `${hrs}h ${mins > 0 ? `${mins}m` : ''}` : `${mins} mins`;
  };

  const handleManualAction = async () => {
    const numericId = memberIdInput.trim();
    if (!numericId) {
      setFeedback({ message: "Please enter a Roll No", type: "error" });
      return;
    }

    const formattedId = `MF-${numericId.toString().padStart(3, '0')}`;
    
    try {
      // 1. Verify member exists (Try Supabase then Local)
      let member = null;
      const { data: sbMember } = await supabase.from('members').select('*').eq('id', formattedId).single();
      
      if (sbMember) {
        member = sbMember;
      } else {
        const localMembers = getStoredMembers();
        member = localMembers.find(m => m.id === formattedId);
      }

      if (!member) {
        setFeedback({ message: `Member ID ${formattedId} not found`, type: "error" });
        return;
      }

      // 2. Check today's status
      const today = new Date().toISOString().split('T')[0];
      let currentSession = null;
      
      const { data: sbSession } = await supabase
        .from('attendance')
        .select('*')
        .eq('member_id', formattedId)
        .gte('created_at', `${today}T00:00:00Z`)
        .is('check_out', null)
        .single();
        
      if (sbSession) {
        currentSession = sbSession;
      } else {
        const localRecords = getStoredAttendance();
        currentSession = localRecords.find(r => 
          r.member_id === formattedId && 
          r.created_at.startsWith(today) && 
          !r.check_out
        );
      }

      if (!currentSession) {
        // CHECK-IN
        const newRecord = { 
          id: Date.now(),
          member_id: formattedId, 
          check_in: new Date().toISOString(),
          status: 'Present',
          created_at: new Date().toISOString()
        };
        
        const { error: inErr } = await supabase.from('attendance').insert([newRecord]);
        
        if (inErr) {
          // Fallback to Local
          const records = getStoredAttendance();
          saveLocalAttendance([newRecord, ...records]);
        }
        setFeedback({ message: `Welcome ${member.name}! Checked in.`, type: "success" });
      } else {
        // CHECK-OUT
        const checkOutTime = new Date().toISOString();
        const { error: outErr } = await supabase
          .from('attendance')
          .update({ check_out: checkOutTime })
          .eq('id', currentSession.id);
        
        if (outErr) {
          // Fallback to Local
          const records = getStoredAttendance();
          const updated = records.map(r => r.id === currentSession.id ? { ...r, check_out: checkOutTime } : r);
          saveLocalAttendance(updated);
        }
        setFeedback({ message: `Goodbye ${member.name}! Checked out.`, type: "success" });
      }

      setMemberIdInput("");
      await fetchAttendance();
      setTimeout(() => setFeedback({ message: "", type: "" }), 3000);
    } catch (err) {
      console.error("Action error:", err);
      setFeedback({ message: "Action failed. Check console.", type: "error" });
    }
  };

  const presentCount = attendanceRecords.length;

  const filteredRecords = attendanceRecords.filter(record => 
    (record.member?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
    record.member_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="attendance-page">
      <header className="page-header">
        <div className="header-text">
           <h1 className="gradient-text" suppressHydrationWarning={true}>Daily Attendance</h1>
          <p>Track check-ins and session durations for Muscle Factory.</p>
        </div>
        <div className="header-actions">
          <div className="date-picker card">
            <Calendar size={18} />
            <span suppressHydrationWarning>{formatHeaderDate()}</span>
          </div>
          <div className="event-badge animation-pulse">
             <span className="event-icon">🚩</span>
             <span className="event-text">Hanuman Janmotsav Today</span>
          </div>
        </div>
      </header>

      <section className="check-in-panel card glass">
        <div className="panel-header">
            <Fingerprint className="text-primary" size={24} />
            <h3>Front Desk Check-in</h3>
          </div>
          <div className="panel-form">
            <div className="input-group">
              <label>Member Roll No (Numeric)</label>
              <div className="prefixed-input">
                <span className="prefix">MF-</span>
                <input 
                  type="text" 
                  placeholder="e.g. 001" 
                  value={memberIdInput}
                  onChange={(e) => setMemberIdInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleManualAction()}
                />
              </div>
            </div>
            <div className="button-group">
              <button className="btn-attendance" onClick={handleManualAction}>
                <Fingerprint size={18} />
                <span>Mark Attendance</span>
              </button>
            </div>
          </div>
          {feedback.message && (
            <div className={`feedback-msg ${feedback.type}`}>
               {feedback.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{feedback.message}</span>
            </div>
          )}
      </section>

      <section className="attendance-stats">
        <div className="stat-pill primary">
          <div className="pill-icon"><UserCheck size={20} /></div>
          <div className="pill-text">
            <span className="label">Present Today</span>
            <span className="value">{presentCount} Members</span>
          </div>
        </div>
        <div className="stat-pill warning">
          <div className="pill-icon"><Clock size={20} /></div>
          <div className="pill-text">
            <span className="label">Status</span>
            <span className="value">Real-time Connected</span>
          </div>
        </div>
      </section>

      <section className="attendance-list card">
        <div className="list-toolbar">
          <div className="search-box">
            <div className="search-field">
              <Search size={14} />
              <input 
                type="text" 
                placeholder="Search by member name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <button 
            className="insights-toggle-btn"
            onClick={() => setShowInsights(!showInsights)}
          >
            <BarChart3 size={18} />
            {showInsights ? "Hide Insights" : "View Insights"}
          </button>
        </div>

        {!showInsights && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Status</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record, index) => (
                  <tr key={`${record.id}-${index}`}>
                  <td>
                    <div className="member-profile">
                      <img src={record.member?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${record.member_id}`} alt="" className="avatar-sm" />
                      <div className="info">
                        <span className="name">{formatName(record.member?.name) || "Member"}</span>
                        <span className="id">{record.member_id}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill ${record.status.toLowerCase()}`}>
                      {record.status}
                    </span>
                  </td>
                  <td>
                    <div className="time-entry">
                      <ArrowUpRight size={14} className="text-success" />
                      {new Date(record.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td>
                    <div className="time-entry">
                      <ArrowDownRight size={14} className="text-danger" />
                      <span className={!record.check_out ? "text-primary pulse" : ""}>
                        {record.check_out ? new Date(record.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Currently Training"}
                      </span>
                    </div>
                  </td>
                  <td>
                     <span className="duration-pill">
                       {calculateDuration(record.check_in, record.check_out)}
                     </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="empty-row-text">No attendance records found for today.</td>
              </tr>
            )}
          </tbody>
        </table>
        )}

        {showInsights && (
          <div className="insights-section">
            {/* Peak Hours */}
            <div className="insights-subsection">
              <h3 className="insights-title">Peak Hours Today</h3>
              <div className="peak-hours-grid">
                {Object.entries(peakHours)
                  .filter(([_, count]) => count > 0)
                  .sort(([_, a], [__, b]) => b - a)
                  .slice(0, 6)
                  .map(([hour, count]) => (
                    <div key={hour} className="peak-hour-item">
                      <div className="peak-hour-time">{hour}:00</div>
                      <div className="peak-hour-count">{count} members</div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Member Attendance Stats */}
            <div className="insights-subsection">
              <h3 className="insights-title">Top Active Members</h3>
              <div className="stats-list">
                {memberStats
                  .sort((a, b) => b.thisMonth - a.thisMonth)
                  .slice(0, 8)
                  .map(stat => (
                    <div key={stat.memberId} className="stat-row">
                      <span className="stat-name">{stat.memberName}</span>
                      <div className="stat-badges">
                        <span className="badge badge-month">{stat.thisMonth} this month</span>
                        <span className="badge badge-week">{stat.thisWeek} this week</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Inactive Members Alert */}
            {inactiveMembers.length > 0 && (
              <div className="insights-subsection alert-section">
                <h3 className="insights-title">⚠️ Inactive Members ({inactiveMembers.length})</h3>
                <div className="inactive-list">
                  {inactiveMembers.slice(0, 5).map(member => {
                    const stats = memberStats.find(s => s.memberId === member.id);
                    const lastVisitDate = stats?.lastVisit ? new Date(stats.lastVisit) : null;
                    const daysInactive = lastVisitDate 
                      ? Math.floor((Date.now() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24))
                      : null;
                    
                    return (
                      <div key={member.id} className="inactive-item">
                        <span className="inactive-name">{member.name}</span>
                        <span className="inactive-days">
                          {daysInactive ? `${daysInactive} days` : "Never visited"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      <style jsx>{`
        .empty-row-text { padding: 4rem; text-align: center; color: var(--muted-foreground); }
        .attendance-page { max-width: 1200px; margin: 0 auto; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; }
        .header-actions { display: flex; align-items: center; gap: 1rem; }
        .header-text h1 { font-size: 2rem; font-weight: 800; letter-spacing: -0.02em; }
        .header-text p { color: var(--muted-foreground); margin-top: 0.25rem; }
        .date-picker { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 1.25rem; font-size: 0.875rem; font-weight: 700; color: var(--foreground); border-color: var(--border); border-radius: 12px; background: rgba(255, 255, 255, 0.03); }
        
        .event-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          color: white;
          border-radius: 12px;
          font-size: 0.8125rem;
          font-weight: 800;
          box-shadow: 0 4px 12px rgba(234, 88, 12, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          white-space: nowrap;
        }

        .animation-pulse {
          animation: badge-pulse 2s infinite;
        }

        @keyframes badge-pulse {
          0% { transform: scale(1); box-shadow: 0 4px 12px rgba(234, 88, 12, 0.3); }
          50% { transform: scale(1.02); box-shadow: 0 4px 20px rgba(234, 88, 12, 0.5); }
          100% { transform: scale(1); box-shadow: 0 4px 12px rgba(234, 88, 12, 0.3); }
        }

        .check-in-panel { padding: 1.5rem 2rem; margin-bottom: 2rem; display: flex; flex-direction: column; gap: 1.5rem; border-color: var(--primary); }
        .panel-header { display: flex; align-items: center; gap: 0.75rem; }
        .panel-header h3 { font-size: 1.125rem; font-weight: 700; }
        .panel-form { display: flex; align-items: flex-end; gap: 1.5rem; }
        .input-group { flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
        .input-group label { font-size: 0.75rem; font-weight: 700; color: var(--muted-foreground); text-transform: uppercase; }
        .prefixed-input { display: flex; align-items: center; background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; transition: border-color 0.2s; }
        .prefixed-input:focus-within { border-color: var(--primary); }
        .prefix { padding: 0 1rem; background: rgba(255, 255, 255, 0.05); color: var(--muted-foreground); font-weight: 800; font-size: 0.9375rem; border-right: 1px solid var(--border); }
        .prefixed-input input { width: 100%; padding: 0.75rem 1rem; background: transparent; border: none; color: var(--foreground); font-size: 1rem; font-weight: 700; }
        .btn-attendance { background: var(--primary); color: white; width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.75rem 1.5rem; border-radius: var(--radius); font-weight: 700; }
        .feedback-msg { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; font-weight: 600; padding: 0.75rem 1rem; border-radius: var(--radius); }
        .feedback-msg.success { background: rgba(34, 197, 94, 0.1); color: #4ade80; }
        .feedback-msg.error { background: rgba(239, 68, 68, 0.1); color: #f87171; }
        .attendance-stats { display: flex; gap: 1.5rem; margin-bottom: 2rem; }
        .stat-pill { display: flex; align-items: center; gap: 1.25rem; padding: 1.25rem 2rem; background: var(--card); border: 1px solid var(--border); border-radius: 9999px; min-width: 260px; }
        .pill-icon { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: rgba(255, 255, 255, 0.05); }
        .pill-text { display: flex; flex-direction: column; }
        .label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--muted-foreground); letter-spacing: 0.05em; }
        .value { font-size: 1.125rem; font-weight: 800; }
        .attendance-list { padding: 0; }
        .list-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border); gap: 1rem; }
        .search-box { flex: 1; display: flex; align-items: center; max-width: 400px; }
        .search-field { position: relative; width: 100%; display: flex; align-items: center; background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border); border-radius: var(--radius); }
        .search-field svg { position: absolute; left: 1rem; color: var(--muted-foreground); pointer-events: none; }
        .search-field input { width: 100%; padding: 0.625rem 1rem 0.625rem 2.75rem; background: transparent; border: none; color: var(--foreground); font-size: 0.875rem; outline: none; }
        
        .insights-toggle-btn { 
          display: flex; 
          align-items: center; 
          gap: 0.5rem; 
          padding: 0.625rem 1.25rem; 
          background: var(--primary); 
          color: white; 
          border: none; 
          border-radius: var(--radius); 
          font-weight: 600; 
          font-size: 0.875rem; 
          cursor: pointer; 
          transition: all 0.2s;
        }
        
        .insights-toggle-btn:hover { opacity: 0.9; }
        
        .insights-section {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        
        .insights-subsection {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 1.5rem;
        }
        
        .insights-title {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: var(--foreground);
        }
        
        .peak-hours-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 1rem;
        }
        
        .peak-hour-item {
          background: var(--card);
          border: 1px solid var(--border);
          padding: 1rem;
          border-radius: 0.5rem;
          text-align: center;
        }
        
        .peak-hour-time {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--primary);
        }
        
        .peak-hour-count {
          font-size: 0.875rem;
          color: var(--muted-foreground);
          margin-top: 0.25rem;
        }
        
        .stats-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .stat-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: var(--card);
          border-radius: 0.5rem;
          border: 1px solid var(--border);
        }
        
        .stat-name {
          font-weight: 600;
        }
        
        .stat-badges {
          display: flex;
          gap: 0.5rem;
        }
        
        .badge {
          font-size: 0.75rem;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-weight: 600;
        }
        
        .badge-month {
          background: rgba(249, 115, 22, 0.15);
          color: var(--primary);
        }
        
        .badge-week {
          background: rgba(74, 222, 128, 0.15);
          color: #4ade80;
        }
        
        .alert-section {
          border-left: 3px solid #f97316;
        }
        
        .inactive-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .inactive-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          background: rgba(239, 68, 68, 0.05);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 0.5rem;
        }
        
        .inactive-name {
          font-weight: 600;
        }
        
        .inactive-days {
          font-size: 0.875rem;
          color: var(--muted-foreground);
        }
        
        .data-table { width: 100%; border-collapse: collapse; text-align: left; }
        .data-table th { padding: 1rem 1.5rem; color: var(--muted-foreground); font-size: 0.8125rem; font-weight: 700; text-transform: uppercase; border-bottom: 1px solid var(--border); }
        .data-table td { padding: 1rem 1.5rem; border-bottom: 1px solid var(--border); font-size: 0.875rem; }
        .member-profile { display: flex; align-items: center; gap: 0.75rem; }
        .avatar-sm { width: 32px; height: 32px; border-radius: 50%; }
        .status-pill { padding: 0.25rem 0.6rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
        .status-pill.present { background: rgba(34, 197, 94, 0.1); color: #4ade80; }
        .time-entry { display: flex; align-items: center; gap: 0.5rem; font-weight: 500; }
        .duration-pill { font-weight: 600; color: var(--muted-foreground); background: rgba(255, 255, 255, 0.03); padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; }
        .pulse { animation: pulse 2s infinite; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
        @media (max-width: 900px) { .page-header { flex-direction: column; align-items: flex-start; gap: 1rem; } .panel-form { flex-direction: column; align-items: stretch; } .attendance-stats { flex-direction: column; gap: 1rem; } .stat-pill { width: 100%; min-width: 0; border-radius: var(--radius); } .list-toolbar { flex-direction: column; align-items: stretch; } .search-box { max-width: 100%; } }
      `}</style>
    </div>
  );
}
