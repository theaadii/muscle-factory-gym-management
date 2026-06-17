"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Users, UserCheck, UserMinus, UserPlus, AlertTriangle, Search, Plus, Fingerprint, CalendarCheck, Clock, Activity, ArrowRight } from "lucide-react";
import StatsCard from "@/components/StatsCard";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { getStoredMembers, getStoredAttendance, repairPayments, getStoredPayments } from "@/lib/localStorage";
import { CheckCircle2, FileText, CreditCard } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    expiredMembers: 0,
    newThisWeek: 0,
    expiringSoon: 0,
    todayAttendanceCount: 0,
    recentCheckIns: [],
    expiryList: [],
    urgentActionCount: 0,
    inactiveCount: 0
  });

  const [loading, setLoading] = useState(true);
  const [hasPayments, setHasPayments] = useState(false);
  const [hasAttendance, setHasAttendance] = useState(false);

  useEffect(() => {
    repairPayments(); // Fix legacy 1000 INR records
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const loadLocalData = () => {
      const stored = getStoredMembers();
      const localAttendance = getStoredAttendance();
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(now.getDate() + 3);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);

      const activeMembers = stored.filter(m => m.status === "Active");
      const expiredMembers = stored.filter(m => m.status === "Expired");
      const newThisWeek = stored.filter(m => new Date(m.join_date) >= sevenDaysAgo);
      const expiringSoon = stored.filter(m => {
        if (!m.next_billing) return false;
        const nb = new Date(m.next_billing);
        return nb >= now && nb <= threeDaysFromNow;
      });
      const inactive = stored.filter(m => 
        m.status === "Active" && new Date(m.join_date) <= thirtyDaysAgo
      );

      const todayAttendance = localAttendance.filter(a => a.created_at.startsWith(todayStr));
      const recentCheckIns = todayAttendance.slice(0, 5).map(a => ({
        ...a,
        member: stored.find(m => m.id === a.member_id) || { name: "Member" }
      }));

      setStats({
        totalMembers: stored.length,
        activeMembers: activeMembers.length,
        expiredMembers: expiredMembers.length,
        newThisWeek: newThisWeek.length,
        expiringSoon: expiringSoon.length,
        todayAttendanceCount: todayAttendance.length,
        recentCheckIns: recentCheckIns,
        expiryList: expiringSoon,
        urgentActionCount: expiringSoon.length,
        inactiveCount: inactive.length
      });
    };

    try {
      setLoading(true);

      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
        throw new Error("No real Supabase URL configured.");
      }

      // 1. Fetch from Supabase
      const { count: totalCount, error: totalErr } = await supabase.from('members').select('*', { count: 'exact', head: true });
      const { count: activeCount } = await supabase.from('members').select('*', { count: 'exact', head: true }).eq('status', 'Active');
      const { count: expiredCount } = await supabase.from('members').select('*', { count: 'exact', head: true }).eq('status', 'Expired');
      const { count: newCount } = await supabase.from('members').select('*', { count: 'exact', head: true }).gte('join_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      
      const today = new Date().toISOString().split('T')[0];
      const { data: attendanceData } = await supabase.from('attendance').select('*, member:members(name)').gte('created_at', `${today}T00:00:00Z`);

      // 2. If Supabase fails or is empty, use LocalStorage fallback
      if (totalErr || (totalCount === 0 || totalCount === null)) {
        loadLocalData();
      } else {
        // Use Supabase data
        setStats({
          totalMembers: totalCount || 0,
          activeMembers: activeCount || 0,
          expiredMembers: expiredCount || 0,
          newThisWeek: newCount || 0,
          expiringSoon: 0, // Simplified for now
          todayAttendanceCount: attendanceData?.length || 0,
          recentCheckIns: attendanceData?.slice(0, 5) || [],
          expiryList: [],
          urgentActionCount: 0,
          inactiveCount: 0
        });
      }
    } catch (error) {
      console.warn("Database connection issue. Loading from local storage.");
      loadLocalData();
    } finally {
      setLoading(false);
      setHasPayments(getStoredPayments().length > 0);
      setHasAttendance(getStoredAttendance().length > 0);
    }
  };

  const isGymEmpty = stats.totalMembers === 0;

  return (
    <div className="dashboard" suppressHydrationWarning={true}>
      <header className="dashboard-header" suppressHydrationWarning={true}>
        <div className="header-text" suppressHydrationWarning={true} style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        
          <div suppressHydrationWarning={true}>
            <h1 className="gradient-text" suppressHydrationWarning={true}>Welcome back, Aniket</h1>
            <p suppressHydrationWarning={true}>Here&apos;s your daily overview at Muscle Factory.</p>
          </div>
        </div>
        
        {!isGymEmpty && (
          <div className="header-actions" suppressHydrationWarning={true} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button onClick={() => router.push('/members?addNew=true')} className="btn-primary" suppressHydrationWarning={true}>
              <Plus size={18} />
              <span>Add Member</span>
            </button>
            <button onClick={() => router.push('/attendance')} className="btn-primary" suppressHydrationWarning={true} style={{ background: 'var(--secondary)', color: 'var(--foreground)' }}>
              <Fingerprint size={18} />
              <span>Mark Attendance</span>
            </button>
            <button className="btn-primary" suppressHydrationWarning={true} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
              <Search size={18} />
              <span>Search Member</span>
            </button>
          </div>
        )}
      </header>

      {/* 1. Member Stats */}
      <section className="stats-section" suppressHydrationWarning={true}>
        <h2 className="section-title">Member Stats (Real-time)</h2>
        <div className="stats-grid" suppressHydrationWarning={true}>
          <StatsCard 
            title="Total Members" 
            value={stats.totalMembers.toLocaleString()} 
            icon={Users} 
            trend="up" 
            trendValue="0" 
            color="#3b82f6"
            isEmpty={isGymEmpty}
            emptyMessage="No members yet"
            emptySubtext="Start by adding your first member"
            actionButton={<button onClick={() => router.push('/members?addNew=true')} className="btn-sm" suppressHydrationWarning={true}>Add Member</button>}
          />
          <StatsCard 
            title="Active Members" 
            value={stats.activeMembers.toLocaleString()} 
            icon={UserCheck} 
            trend="up" 
            trendValue="0" 
            color="#4ade80"
            isEmpty={isGymEmpty}
            emptyMessage="Looks quiet here 👀"
            emptySubtext="Insights will appear once you have active members"
          />
          <StatsCard 
            title="Expired Registrations" 
            value={stats.expiredMembers.toLocaleString()} 
            icon={UserMinus} 
            trend="down" 
            trendValue="0" 
            color="#f43f5e"
            isEmpty={isGymEmpty}
            emptyMessage="No alerts yet"
            emptySubtext="You're all set!"
          />
        </div>
      </section>

      <div className="dashboard-grid" suppressHydrationWarning={true}>
        {/* Left Column */}
        <div className="grid-column" suppressHydrationWarning={true}>
          {/* 2. Today's Attendance */}
          <div className="dashboard-card border-primary" suppressHydrationWarning={true}>
            <div className="card-header" suppressHydrationWarning={true}>
              <div className="header-title" suppressHydrationWarning={true}>
                <CalendarCheck className="text-primary" size={20} />
                <h3>Today&apos;s Attendance</h3>
              </div>
              <span className="badge badge-primary">{stats.todayAttendanceCount} Check-ins</span>
            </div>
            <div className="live-list" suppressHydrationWarning={true}>
              {stats.recentCheckIns.length > 0 ? (
                stats.recentCheckIns.map((item, i) => (
                  <div key={i} className="list-item">
                    <div className="item-avatar" style={{ position: 'relative', width: '32px', height: '32px' }}>
                      <Image src={item.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=User${i}`} alt="Avatar" width={32} height={32} style={{ borderRadius: '50%' }} />
                    </div>
                    <div className="item-info">
                      <p className="item-name">{item.name}</p>
                      <p className="item-sub text-success">Checked in at {item.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state-card" suppressHydrationWarning={true}>
                  <p>No attendance recorded today.</p>
                  <button onClick={() => router.push('/attendance')} className="btn-sm mt-top" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }} suppressHydrationWarning={true}>
                    Mark First Attendance
                  </button>
                </div>
              )}
            </div>
            <button onClick={() => router.push('/attendance')} className="view-all-btn">View All Check-ins <ArrowRight size={16} /></button>
          </div>

          {/* 3. Expiry Alerts */}
          <div className="dashboard-card border-danger" suppressHydrationWarning={true}>
            <div className="card-header" suppressHydrationWarning={true}>
              <div className="header-title" suppressHydrationWarning={true}>
                <AlertTriangle className="text-danger" size={20} />
                <h3>Expiry Alerts</h3>
              </div>
              <span className="badge badge-danger">{stats.expiringSoon} Urgent</span>
            </div>
            <div className="alert-message" suppressHydrationWarning={true}>
              <p suppressHydrationWarning={true}><strong>{stats.expiringSoon} members</strong> have their subscriptions expiring soon. Action required!</p>
            </div>
            <div className="live-list mt-top" suppressHydrationWarning={true}>
              {stats.expiryList.length > 0 ? (
                stats.expiryList.map((member, i) => (
                  <div key={i} className="list-item">
                    <div className="item-avatar" style={{ position: 'relative', width: '32px', height: '32px' }}>
                      <Image src={member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=Exp${i}`} alt="Avatar" width={32} height={32} style={{ borderRadius: '50%' }} />
                    </div>
                    <div className="item-info">
                      <p className="item-name">{member.name}</p>
                      <p className="item-sub text-danger">Expires: {new Date(member.next_billing).toLocaleDateString('en-GB')}</p>
                    </div>
                    <button className="btn-sm" onClick={() => router.push('/payments')}>Renew</button>
                  </div>
                ))
              ) : (
                <div className="empty-state-card" suppressHydrationWarning={true}>
                  <p>{isGymEmpty ? "No alerts yet — you're all set!" : "No memberships expiring in the next 3 days."}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="grid-column" suppressHydrationWarning={true}>
          {/* 6. Member Activity Insights */}
          <div className="dashboard-card border-info" suppressHydrationWarning={true}>
             <div className="card-header" suppressHydrationWarning={true}>
              <div className="header-title" suppressHydrationWarning={true}>
                <Activity className="text-info" size={20} />
                <h3>Member Activity Insights</h3>
              </div>
            </div>
            {isGymEmpty ? (
              <div className="empty-state-card mt-top" suppressHydrationWarning={true}>
                 <p>Insights will appear once you have active members</p>
              </div>
            ) : (
              <div className="insights-grid" suppressHydrationWarning={true}>
                <div className="insight-box">
                  <UserPlus size={24} className="text-info" />
                  <h4>{stats.newThisWeek}</h4>
                  <p>New members this week</p>
                </div>
                <div className="insight-box">
                  <Activity size={24} className="text-success" />
                  <h4>{stats.totalMembers > 0 ? Math.round((stats.activeMembers / stats.totalMembers) * 100) : 0}%</h4>
                  <p>Active vs Inactive</p>
                </div>
              </div>
            )}
          </div>

          {/* 4. Pending Actions */}
          <div className="dashboard-card border-warning" suppressHydrationWarning={true}>
             <div className="card-header" suppressHydrationWarning={true}>
              <div className="header-title" suppressHydrationWarning={true}>
                <Clock className="text-warning" size={20} />
                <h3>Pending Actions</h3>
              </div>
            </div>
            {isGymEmpty ? (
               <div className="empty-state-card mt-top" suppressHydrationWarning={true}>
                 <p>No actions pending. Let&apos;s get your gym started!</p>
               </div>
            ) : (
              <div className="action-list" suppressHydrationWarning={true}>
                <div className="action-item">
                  <div className="action-icon warning-bg"><Users size={18} /></div>
                  <div className="action-text">
                    <p><strong>{stats.expiringSoon} Members</strong> to renew this week</p>
                    <span>Follow up required</span>
                  </div>
                </div>
                <div className="action-item">
                  <div className="action-icon danger-bg"><UserMinus size={18} /></div>
                  <div className="action-text">
                    <p><strong>{stats.inactiveCount} Members</strong> inactive for 30+ days</p>
                    <span>Re-engagement campaign recommended</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard { max-width: 1200px; margin: 0 auto; padding-bottom: 2rem; }
        .dashboard-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; }
        .header-text h1 { font-size: 2rem; font-weight: 800; letter-spacing: -0.02em; }
        .header-text p { color: var(--muted-foreground); margin-top: 0.25rem; }
        
        .section-title { font-size: 1.125rem; font-weight: 700; margin-bottom: 1rem; color: var(--muted-foreground); text-transform: uppercase; letter-spacing: 0.05em; }
        .stats-section { margin-bottom: 2rem; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; }
        
        .dashboard-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        @media (max-width: 900px) { .dashboard-grid { grid-template-columns: 1fr; } .dashboard-header { flex-direction: column; align-items: flex-start; gap: 1rem; } }
        .grid-column { display: flex; flex-direction: column; gap: 1.5rem; }
        
        .dashboard-card { background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border); border-top-width: 3px; border-radius: 12px; padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }
        .border-primary { border-top-color: var(--primary); }
        .border-danger { border-top-color: #ef4444; }
        .border-warning { border-top-color: #f59e0b; }
        .border-info { border-top-color: #3b82f6; }
        
        .card-header { display: flex; justify-content: space-between; align-items: center; }
        .header-title { display: flex; align-items: center; gap: 0.5rem; }
        .header-title h3 { font-size: 1.125rem; font-weight: 700; }
        
        .text-primary { color: var(--primary); }
        .text-danger { color: #ef4444; }
        .text-warning { color: #f59e0b; }
        .text-info { color: #3b82f6; }
        .text-success { color: #4ade80; }
        
        .badge { font-size: 0.75rem; font-weight: 700; padding: 0.25rem 0.5rem; border-radius: 9999px; }
        .badge-primary { background: rgba(249, 115, 22, 0.1); color: var(--primary); }
        .badge-danger { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
        
        .live-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .mt-top { margin-top: 1rem; }
        .list-item { display: flex; align-items: center; gap: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
        .list-item:last-child { border-bottom: none; padding-bottom: 0; }
        .item-avatar img { width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.1); }
        .item-info { flex: 1; display: flex; flex-direction: column; gap: 0.1rem; }
        .item-name { font-weight: 600; font-size: 0.9375rem; color: var(--foreground); }
        .item-sub { font-size: 0.8125rem; font-weight: 600; }
        
        .btn-sm { padding: 0.35rem 0.75rem; background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 6px; font-size: 0.75rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .btn-sm:hover { background: #ef4444; color: white; }
        
        .view-all-btn { display: flex; align-items: center; justify-content: center; width: 100%; gap: 0.25rem; font-size: 0.875rem; font-weight: 600; color: var(--muted-foreground); background: transparent; border: none; margin-top: 0.5rem; cursor: pointer; transition: color 0.2s; }
        .view-all-btn:hover { color: var(--foreground); }
        
        .alert-message { padding: 0.75rem 1rem; background: rgba(239, 68, 68, 0.1); border-radius: var(--radius); border-left: 4px solid #ef4444; font-size: 0.875rem; line-height: 1.5; color: #fdf2f8; }
        
        .insights-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .insight-box { padding: 1.5rem; background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border); border-radius: 12px; display: flex; flex-direction: column; gap: 0.5rem; align-items: center; text-align: center; }
        .insight-box h4 { font-size: 1.75rem; font-weight: 800; color: var(--foreground); margin-top: 0.5rem; }
        .insight-box p { font-size: 0.75rem; font-weight: 700; color: var(--muted-foreground); text-transform: uppercase; letter-spacing: 0.05em; }
        
        .action-list { display: flex; flex-direction: column; gap: 1rem; }
        .action-item { display: flex; align-items: flex-start; gap: 1rem; padding: 1rem; background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border); border-radius: 12px; transition: border-color 0.2s; cursor: pointer; }
        .action-item:hover { border-color: rgba(255, 255, 255, 0.15); }
        .action-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .warning-bg { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
        .danger-bg { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
        .action-text { display: flex; flex-direction: column; gap: 0.2rem; }
        .action-text p { font-size: 0.9375rem; color: var(--foreground); }
        .action-text span { font-size: 0.8125rem; color: var(--muted-foreground); font-weight: 500; }
        .empty-state-card { padding: 1.5rem; text-align: center; color: var(--muted-foreground); font-size: 0.875rem; }
        
        .welcome-hero { background: linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%); padding: 3rem; text-align: center; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; margin-bottom: 2rem; }
        .welcome-content { max-width: 600px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; }
        .welcome-subtext { font-size: 1.125rem; color: var(--muted-foreground); margin-top: 0.5rem; margin-bottom: 2rem; line-height: 1.6; }
        .onboarding-steps { display: flex; flex-direction: column; gap: 1rem; width: 100%; max-width: 400px; margin-bottom: 2.5rem; text-align: left; }
        .step-item { display: flex; align-items: center; gap: 1rem; padding: 1rem; background: rgba(0,0,0,0.2); border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); transition: all 0.2s; }
        .step-item.active { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1); }
        .step-item.completed { opacity: 0.7; }
        .step-item.completed span { text-decoration: line-through; color: var(--muted-foreground); }
        .step-icon-wrapper { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; color: var(--muted-foreground); }
        .hero-actions { display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center; width: 100%; }
        @media (max-width: 600px) { .welcome-hero { padding: 2rem 1.5rem; } .hero-actions { flex-direction: column; } .hero-actions button { width: 100%; justify-content: center; } }
      `}</style>
    </div>
  );
}
