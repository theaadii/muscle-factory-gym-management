"use client";

import { useState, useEffect } from "react";
import { getStoredMembers } from "@/lib/localStorage";
import { getPeakHours, getMemberAttendanceStats, getInactiveMembers, markCheckIn, markCheckOut, getStoredAttendance } from "@/lib/attendanceUtils";
import { AlertCircle, Clock, TrendingUp, Users, LogIn, LogOut, Activity } from "lucide-react";

export default function AttendanceInsightsPage() {
  const [peakHours, setPeakHours] = useState({});
  const [memberStats, setMemberStats] = useState([]);
  const [inactiveMembers, setInactiveMembers] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [checkInMember, setCheckInMember] = useState("");
  const [checkedInToday, setCheckedInToday] = useState([]);
  const [selectedView, setSelectedView] = useState("overview");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const members = getStoredMembers();
    setAllMembers(members);
    
    const peak = getPeakHours();
    setPeakHours(peak);
    
    const stats = getMemberAttendanceStats();
    setMemberStats(stats);
    
    const inactive = getInactiveMembers(members, 7);
    setInactiveMembers(inactive);
    
    // Get today's check-ins
    const today = new Date().toISOString().split("T")[0];
    const allAttendance = getStoredAttendance();
    const todayCheckins = allAttendance.filter(a => a.date === today);
    setCheckedInToday([...new Set(todayCheckins.map(a => a.memberId))]);
  };

  const handleCheckIn = (memberId) => {
    const member = allMembers.find(m => m.id === memberId);
    if (member) {
      markCheckIn(memberId, member.name || "Unknown");
      loadData();
      setCheckInMember("");
    }
  };

  const handleCheckOut = (memberId) => {
    markCheckOut(memberId);
    loadData();
  };

  const maxPeakHourCount = Math.max(...Object.values(peakHours), 1);

  const getHeatmapColor = (count) => {
    const percentage = count / maxPeakHourCount;
    if (percentage === 0) return "#e4e4e7";
    if (percentage < 0.3) return "#bfdbfe";
    if (percentage < 0.6) return "#60a5fa";
    if (percentage < 0.8) return "#1d4ed8";
    return "#1e40af";
  };

  return (
    <div style={styles.container}>
      <style>{`
        * {
          box-sizing: border-box;
        }

        ${getGlobalStyles()}
      `}</style>

      <div style={styles.headerSection}>
        <div>
          <h1 style={styles.pageTitle}>Attendance Insights</h1>
          <p style={styles.pageSubtitle}>Track member attendance patterns and gym activity</p>
        </div>
      </div>

      <div style={styles.tabBar}>
        <button 
          style={{...styles.tabButton, ...(selectedView === "overview" ? styles.tabButtonActive : {})}}
          onClick={() => setSelectedView("overview")}
        >
          <Activity size={18} /> Overview
        </button>
        <button 
          style={{...styles.tabButton, ...(selectedView === "checkin" ? styles.tabButtonActive : {})}}
          onClick={() => setSelectedView("checkin")}
        >
          <LogIn size={18} /> Check In/Out
        </button>
        <button 
          style={{...styles.tabButton, ...(selectedView === "inactive" ? styles.tabButtonActive : {})}}
          onClick={() => setSelectedView("inactive")}
        >
          <AlertCircle size={18} /> Inactive Members
        </button>
      </div>

      {selectedView === "overview" && (
        <div>
          {/* Peak Hours Heatmap */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Peak Hours Heatmap</h2>
            <p style={styles.cardSubtitle}>When members are most active (check-ins by hour)</p>
            
            <div style={styles.heatmapContainer}>
              <div style={styles.heatmapGrid}>
                {Object.entries(peakHours).map(([hour, count]) => (
                  <div key={hour} style={styles.heatmapHourWrapper}>
                    <div
                      style={{
                        ...styles.heatmapCell,
                        backgroundColor: getHeatmapColor(count),
                        color: count / maxPeakHourCount > 0.6 ? "white" : "#09090b"
                      }}
                      title={`${hour}:00 - ${count} check-ins`}
                    >
                      {count}
                    </div>
                    <div style={styles.heatmapLabel}>{hour}:00</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div style={styles.heatmapLegend}>
              <span style={{color: "var(--muted-foreground)"}}>Low Activity</span>
              <div style={{display: "flex", gap: "4px"}}>
                {[0, 0.25, 0.5, 0.75, 1].map((val, i) => (
                  <div
                    key={i}
                    style={{
                      width: "20px",
                      height: "20px",
                      backgroundColor: getHeatmapColor(val * maxPeakHourCount),
                      borderRadius: "4px"
                    }}
                  />
                ))}
              </div>
              <span style={{color: "var(--muted-foreground)"}}>High Activity</span>
            </div>
          </div>

          {/* Key Stats */}
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <Users size={24} style={{color: "var(--primary)"}} />
              <div>
                <div style={styles.statLabel}>Total Members</div>
                <div style={styles.statValue}>{allMembers.length}</div>
              </div>
            </div>
            
            <div style={styles.statCard}>
              <LogIn size={24} style={{color: "var(--primary)"}} />
              <div>
                <div style={styles.statLabel}>Checked In Today</div>
                <div style={styles.statValue}>{checkedInToday.length}</div>
              </div>
            </div>
            
            <div style={styles.statCard}>
              <TrendingUp size={24} style={{color: "var(--primary)"}} />
              <div>
                <div style={styles.statLabel}>Peak Hour</div>
                <div style={styles.statValue}>
                  {Object.entries(peakHours).sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A"}:00
                </div>
              </div>
            </div>
            
            <div style={styles.statCard}>
              <AlertCircle size={24} style={{color: "var(--destructive)"}} />
              <div>
                <div style={styles.statLabel}>Inactive (7 days)</div>
                <div style={styles.statValue}>{inactiveMembers.length}</div>
              </div>
            </div>
          </div>

          {/* Member Attendance Table */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Member Attendance Statistics</h2>
            
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.tableCell}>Member Name</th>
                    <th style={styles.tableCell}>Total Visits</th>
                    <th style={styles.tableCell}>This Month</th>
                    <th style={styles.tableCell}>This Week</th>
                    <th style={styles.tableCell}>Avg Duration</th>
                    <th style={styles.tableCell}>Last Visit</th>
                  </tr>
                </thead>
                <tbody>
                  {memberStats.sort((a, b) => b.totalVisits - a.totalVisits).slice(0, 20).map(stat => (
                    <tr key={stat.memberId} style={styles.tableRow}>
                      <td style={styles.tableCell}>{stat.memberName}</td>
                      <td style={styles.tableCell}>
                        <span style={styles.badge}>{stat.totalVisits}</span>
                      </td>
                      <td style={styles.tableCell}>
                        <span style={{...styles.badge, background: "rgba(249, 115, 22, 0.1)", color: "var(--primary)"}}>{stat.thisMonth}</span>
                      </td>
                      <td style={styles.tableCell}>
                        <span style={{...styles.badge, background: "rgba(74, 222, 128, 0.1)", color: "#4ade80"}}>{stat.thisWeek}</span>
                      </td>
                      <td style={styles.tableCell}>
                        {stat.totalVisits > 0 ? `${Math.round(stat.totalMinutes / stat.totalVisits)} min` : "-"}
                      </td>
                      <td style={styles.tableCell}>
                        {stat.lastVisit ? new Date(stat.lastVisit).toLocaleDateString() : "Never"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {selectedView === "checkin" && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Quick Check In/Out</h2>
          
          <div style={styles.checkInSection}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Select Member</label>
              <select
                value={checkInMember}
                onChange={(e) => setCheckInMember(e.target.value)}
                style={styles.select}
              >
                <option value="">Choose a member...</option>
                {allMembers.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.name || "Unknown"} {checkedInToday.includes(member.id) ? "(✓ checked in)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.buttonGroup}>
              <button
                onClick={() => handleCheckIn(checkInMember)}
                disabled={!checkInMember}
                style={{...styles.button, ...styles.buttonGreen, opacity: checkInMember ? 1 : 0.5}}
              >
                <LogIn size={18} /> Check In
              </button>
              <button
                onClick={() => handleCheckOut(checkInMember)}
                disabled={!checkInMember}
                style={{...styles.button, ...styles.buttonOrange, opacity: checkInMember ? 1 : 0.5}}
              >
                <LogOut size={18} /> Check Out
              </button>
            </div>
          </div>

          {checkedInToday.length > 0 && (
            <div style={styles.checkedInList}>
              <h3 style={styles.subTitle}>Checked In Today ({checkedInToday.length})</h3>
              <div style={styles.memberList}>
                {allMembers
                  .filter(m => checkedInToday.includes(m.id))
                  .map(member => (
                    <div key={member.id} style={styles.memberListItem}>
                      <span>{member.name}</span>
                      <button
                        onClick={() => handleCheckOut(member.id)}
                        style={styles.checkOutSmallBtn}
                      >
                        Check Out
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {selectedView === "inactive" && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Inactive Members Alert</h2>
          <p style={styles.cardSubtitle}>Members with no check-in in the last 7 days</p>
          
          {inactiveMembers.length > 0 ? (
            <div style={styles.inactiveList}>
              {inactiveMembers.map(member => {
                const stats = memberStats.find(s => s.memberId === member.id);
                const lastVisitDate = stats?.lastVisit ? new Date(stats.lastVisit) : null;
                const daysInactive = lastVisitDate 
                  ? Math.floor((Date.now() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24))
                  : "Never visited";
                
                return (
                  <div key={member.id} style={styles.inactiveMemberCard}>
                    <div>
                      <div style={styles.inactiveMemberName}>{member.name || "Unknown"}</div>
                      <div style={styles.inactiveMemberDetails}>
                        {typeof daysInactive === 'number' 
                          ? `Last visit: ${daysInactive} days ago` 
                          : "Never visited gym"}
                      </div>
                      {stats && (
                        <div style={styles.inactiveMemberStats}>
                          Total visits: {stats.totalVisits} | Plan: {member.plan}
                        </div>
                      )}
                    </div>
                    <div style={styles.inactiveAlert}>⚠️ Follow up needed</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={styles.noDataMessage}>
              ✓ All members are active! Great engagement.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const getGlobalStyles = () => `
  :root {
    --background: #09090b;
    --foreground: #fafafa;
    --card: #121214;
    --card-foreground: #fafafa;
    --border: #27272a;
    --muted-foreground: #a1a1aa;
    --primary: #f97316;
    --destructive: #ef4444;
    --radius: 0.75rem;
  }

  [data-theme="light"] {
    --background: #ffffff;
    --foreground: #09090b;
    --card: #f5f5f5;
    --card-foreground: #09090b;
    --border: #e4e4e7;
    --muted-foreground: #71717a;
    --primary: #f97316;
    --destructive: #ef4444;
    --radius: 0.75rem;
  }
`;

const styles = {
  container: {
    padding: "2rem",
    background: "var(--background)",
    color: "var(--foreground)",
    minHeight: "100vh",
  },
  headerSection: {
    marginBottom: "2rem",
  },
  pageTitle: {
    fontSize: "2rem",
    fontWeight: "800",
    marginBottom: "0.5rem",
  },
  pageSubtitle: {
    color: "var(--muted-foreground)",
    fontSize: "0.95rem",
  },
  tabBar: {
    display: "flex",
    gap: "1rem",
    marginBottom: "2rem",
    borderBottom: "1px solid var(--border)",
    paddingBottom: "1rem",
  },
  tabButton: {
    background: "transparent",
    border: "none",
    color: "var(--muted-foreground)",
    padding: "0.75rem 1rem",
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    transition: "all 0.2s",
    borderBottom: "2px solid transparent",
  },
  tabButtonActive: {
    color: "var(--primary)",
    borderBottomColor: "var(--primary)",
  },
  card: {
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: "2rem",
    marginBottom: "2rem",
  },
  cardTitle: {
    fontSize: "1.25rem",
    fontWeight: "700",
    marginBottom: "0.5rem",
  },
  cardSubtitle: {
    color: "var(--muted-foreground)",
    fontSize: "0.9rem",
    marginBottom: "1.5rem",
  },
  heatmapContainer: {
    overflowX: "auto",
    marginBottom: "2rem",
  },
  heatmapGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))",
    gap: "1rem",
    paddingBottom: "1rem",
  },
  heatmapHourWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.5rem",
  },
  heatmapCell: {
    width: "100%",
    aspectRatio: "1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "0.5rem",
    fontWeight: "600",
    fontSize: "0.95rem",
    minWidth: "60px",
  },
  heatmapLabel: {
    fontSize: "0.8rem",
    color: "var(--muted-foreground)",
    fontWeight: "500",
  },
  heatmapLegend: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "1rem",
    padding: "1rem",
    background: "rgba(255, 255, 255, 0.02)",
    borderRadius: "0.5rem",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "1.5rem",
    marginBottom: "2rem",
  },
  statCard: {
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: "1.5rem",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  statLabel: {
    color: "var(--muted-foreground)",
    fontSize: "0.9rem",
    fontWeight: "500",
  },
  statValue: {
    fontSize: "1.75rem",
    fontWeight: "700",
    marginTop: "0.25rem",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeader: {
    background: "rgba(255, 255, 255, 0.02)",
  },
  tableRow: {
    borderBottom: "1px solid var(--border)",
  },
  tableCell: {
    padding: "1rem",
    textAlign: "left",
    fontSize: "0.9rem",
  },
  badge: {
    background: "rgba(249, 115, 22, 0.15)",
    color: "var(--primary)",
    padding: "0.25rem 0.75rem",
    borderRadius: "9999px",
    fontWeight: "600",
    fontSize: "0.85rem",
  },
  checkInSection: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  label: {
    fontWeight: "600",
    fontSize: "0.9rem",
    color: "var(--muted-foreground)",
  },
  select: {
    padding: "0.75rem 1rem",
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "0.5rem",
    color: "var(--foreground)",
    fontSize: "0.95rem",
    cursor: "pointer",
  },
  buttonGroup: {
    display: "flex",
    gap: "1rem",
  },
  button: {
    padding: "0.75rem 1.5rem",
    border: "none",
    borderRadius: "0.5rem",
    fontSize: "0.95rem",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    transition: "all 0.2s",
  },
  buttonGreen: {
    background: "#4ade80",
    color: "white",
  },
  buttonOrange: {
    background: "var(--primary)",
    color: "white",
  },
  checkedInList: {
    marginTop: "2rem",
    paddingTop: "1.5rem",
    borderTop: "1px solid var(--border)",
  },
  subTitle: {
    fontSize: "1.1rem",
    fontWeight: "600",
    marginBottom: "1rem",
  },
  memberList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  memberListItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.75rem 1rem",
    background: "rgba(255, 255, 255, 0.02)",
    borderRadius: "0.5rem",
    border: "1px solid var(--border)",
  },
  checkOutSmallBtn: {
    padding: "0.5rem 1rem",
    background: "var(--primary)",
    color: "white",
    border: "none",
    borderRadius: "0.4rem",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: "600",
  },
  inactiveList: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  inactiveMemberCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem",
    background: "rgba(239, 68, 68, 0.05)",
    border: "1px solid rgba(239, 68, 68, 0.2)",
    borderRadius: "0.5rem",
  },
  inactiveMemberName: {
    fontWeight: "600",
    fontSize: "1rem",
  },
  inactiveMemberDetails: {
    color: "var(--muted-foreground)",
    fontSize: "0.9rem",
    marginTop: "0.25rem",
  },
  inactiveMemberStats: {
    color: "var(--muted-foreground)",
    fontSize: "0.85rem",
    marginTop: "0.5rem",
  },
  inactiveAlert: {
    color: "#f97316",
    fontWeight: "600",
    fontSize: "0.9rem",
  },
  noDataMessage: {
    textAlign: "center",
    padding: "2rem",
    color: "var(--muted-foreground)",
    fontSize: "1rem",
  },
};
