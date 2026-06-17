"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Search, Filter, ListFilter, MoreVertical, Plus, UserCheck, UserMinus, Clock, X, User, Edit2, CreditCard, PauseCircle, Trash2, Eye } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { getStoredMembers, saveMembers, addMember as addStoredMember, removeMember as removeStoredMember } from "@/lib/localStorage";
import { useSearchParams, useRouter } from "next/navigation";

export default function MembersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newMember, setNewMember] = useState({ 
    firstName: "", 
    middleName: "",
    lastName: "",
    email: "", 
    phone: "", 
    address: "",
    aadhar: "",
    photo: null,
    plan: "1 Month",
    payment_mode: "Cash",
    startPeriod: "",
    endPeriod: ""
  });
  const [formErrors, setFormErrors] = useState({});
  const [sortBy, setSortBy] = useState("recent");

  useEffect(() => {
    fetchMembers();
    // Auto-open add modal if redirected from dashboard
    if (searchParams.get('addNew') === 'true') {
      setShowAddModal(true);
    }
  }, [searchParams]);

  const fetchMembers = async () => {
    try {
      setLoading(true);

      // Try Supabase first
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== undefined) {
        const { data, error } = await supabase.from('members').select('*').order('join_date', { ascending: false });
        if (!error && data && data.length > 0) {
          setMembers(data);
          saveMembers(data); // sync to localStorage
          return;
        }
      }

      // Fallback to localStorage
      const stored = getStoredMembers();
      setMembers(stored);
    } catch (error) {
      console.warn("Database connection issue. Loading from local storage.");
      const stored = getStoredMembers();
      setMembers(stored);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members
    .filter(member => {
      const searchTerms = searchTerm.toLowerCase();
      const memberName = (member.name || "").toLowerCase();
      const memberId = (member.id || "").toLowerCase();
      const matchesSearch = memberName.includes(searchTerms) || memberId.includes(searchTerms);
      const matchesFilter = filterStatus === "All" || member.status === filterStatus;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === "name") {
        return (a.name || "").localeCompare(b.name || "");
      } else if (sortBy === "id") {
        return (a.id || "").localeCompare(b.id || "");
      } else {
        // Recent: sort by join_date or fallback to id
        const dateA = new Date(a.join_date || 0);
        const dateB = new Date(b.join_date || 0);
        return dateB - dateA;
      }
    });

  const getStatusIcon = (status) => {
    switch (status) {
      case "Active": return <UserCheck size={16} className="text-success" />;
      case "Expired": return <UserMinus size={16} className="text-danger" />;
      case "Pending": return <Clock size={16} className="text-warning" />;
      default: return null;
    }
  };

  const generateNextMemberId = () => {
    if (members.length === 0) return "MF-001";
    const ids = members
      .map(m => m.id)
      .filter(id => id && id.startsWith("MF-"))
      .map(id => parseInt(id.replace("MF-", ""), 10))
      .filter(n => !isNaN(n));
    const maxId = ids.length > 0 ? Math.max(...ids) : 0;
    return `MF-${String(maxId + 1).padStart(3, "0")}`;
  };

  const getPlanDays = (plan) => {
    switch (plan) {
      case "9 Months": return 270;
      case "1 Year": return 365;
      case "3 Months": return 90;
      case "6 Months": return 180;
      case "1 Month":
      default: return 30;
    }
  };

  const formatDisplayName = (fullName) => {
    if (!fullName) return "";
    const names = fullName.trim().split(/\s+/);
    if (names.length <= 2) return fullName;
    return `${names[0]} ${names[names.length - 1]}`;
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    
    // Validation
    const errors = {};
    if (newMember.phone.length !== 10) errors.phone = "Phone number must be 10 digits.";
    const aadharClean = newMember.aadhar.replace(/\s/g, "");
    if (aadharClean.length !== 12) errors.aadhar = "Aadhar number must be 12 digits.";
    if (!newMember.startPeriod) errors.startPeriod = "Membership start period is required.";
    if (!newMember.endPeriod) errors.endPeriod = "Membership end period is required.";
    
    // Validate start date is before end date
    if (newMember.startPeriod && newMember.endPeriod) {
      const startDate = new Date(newMember.startPeriod);
      const endDate = new Date(newMember.endPeriod);
      if (startDate >= endDate) {
        errors.endPeriod = "End date must be after start date.";
      }
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    setIsSubmitting(true);
    
    const fullName = `${newMember.firstName} ${newMember.middleName} ${newMember.lastName}`.trim().replace(/\s+/g, ' ');
    const tempId = generateNextMemberId();
    const insertData = { 
       id: tempId, 
       name: fullName, 
       email: newMember.email, 
       phone: "+91 " + newMember.phone, 
       plan: newMember.plan, 
       payment_mode: newMember.payment_mode,
       status: "Active", 
       join_date: new Date().toISOString(),
       next_billing: new Date(newMember.endPeriod).toISOString()
    };

    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL === undefined) {
         throw new Error("Local fallback required.");
      }

      // Connect to Supabase
      const { data, error } = await supabase.from('members').insert([insertData]);
      
      if (error) throw error;

      // Refresh list from database
      await fetchMembers();
    } catch (err) {
      console.warn("Saving to local storage.");
      
      // Save to localStorage for persistence
      const newMemberData = {
        ...newMember,
        name: fullName,
        id: tempId,
        phone: "+91 " + newMember.phone,
        status: "Active",
        join_date: new Date().toISOString(),
        next_billing: new Date(newMember.endPeriod).toISOString(),
        avatar: newMember.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${fullName}`
      };
      
      const updatedMembers = addStoredMember(newMemberData);
      setMembers(updatedMembers);
    } finally {
      setShowAddModal(false);
      setNewMember({ firstName: "", middleName: "", lastName: "", email: "", phone: "", address: "", aadhar: "", photo: null, plan: "1 Month", payment_mode: "Cash", startPeriod: "", endPeriod: "" });
      setIsSubmitting(false);
    }
  };

  const handleDeleteMember = async (id, name) => {
    const confirm1 = window.confirm(`Are you sure you want to remove ${name}?`);
    if (!confirm1) return;

    const confirm2 = window.confirm(`Wait! Are you absolutely sure you want to PERMANENTLY delete ${name}? This cannot be undone.`);
    if (!confirm2) return;

    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL !== undefined) {
        const { error } = await supabase.from('members').delete().eq('id', id);
        if (error) throw error;
      }
      const updated = removeStoredMember(id);
      setMembers(updated);
    } catch (err) {
      console.warn("Using local storage deletion", err);
      const updated = removeStoredMember(id);
      setMembers(updated);
    } finally {
      setActiveDropdown(null);
    }
  };

  return (
    <div className="members-page" suppressHydrationWarning={true}>
      <header className="page-header">
        <div className="header-text" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          
          <div>
             <h1 className="gradient-text" suppressHydrationWarning={true}>Members Directory</h1>
            <p>Manage and track all gym memberships in one place.</p>
          </div>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={20} />
          <span>Add New Member</span>
        </button>
      </header>

      <section className="filter-bar card">
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by name or ID" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filters">
          <div className="filter-group">
            <ListFilter size={18} className="filter-icon" />
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="recent">Recent</option>
              <option value="name">Name (A-Z)</option>
              <option value="id">ID (0-9)</option>
            </select>
          </div>

          <div className="filter-group ml-4">
            <Filter size={18} className="filter-icon" />
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Expired">Expired</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>
      </section>

      <section className="members-list card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Member ID</th>
              <th>Plan</th>
              <th>Status</th>
              <th>Joining Date</th>
              <th>Next Billing</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map((member) => (
              <tr key={member.id}>
                <td>
                  <div className="member-profile">
                    <img src={member.avatar} alt={member.name} className="avatar" />
                    <div className="info">
                      <span className="name" title={member.name}>{formatDisplayName(member.name)}</span>
                      <span className="email">{member.email}</span>
                    </div>
                  </div>
                </td>
                <td><code className="member-id">{member.id}</code></td>
                <td>
                  <span className="plan-badge">{member.plan}</span>
                </td>
                <td>
                  <div className="status-cell">
                    {getStatusIcon(member.status)}
                    <span className={`status-text ${member.status.toLowerCase()}`}>{member.status}</span>
                  </div>
                </td>
                <td>{new Date(member.join_date || Date.now()).toLocaleDateString('en-GB')}</td>
                <td>{member.next_billing ? new Date(member.next_billing).toLocaleDateString('en-GB') : 'Pending'}</td>
                <td style={{ position: 'relative' }}>
                  <button 
                    className="action-btn" 
                    onClick={() => setActiveDropdown(activeDropdown === member.id ? null : member.id)}
                  >
                    <MoreVertical size={18} />
                  </button>
                  {activeDropdown === member.id && (
                    <div className="dropdown-menu">
                      <button 
                        className="dropdown-item"
                        onClick={() => router.push(`/members/profile/${member.id}`)}
                      >
                        <Eye size={16} />
                        View Profile
                      </button>
                      <button 
                        className="dropdown-item"
                        onClick={() => { /* Open Edit Modal */ }}
                      >
                        <Edit2 size={16} />
                        Edit Member
                      </button>
                      <button 
                        className="dropdown-item"
                        onClick={() => router.push(`/payments?memberId=${member.id}`)}
                      >
                        <CreditCard size={16} />
                        Renew / Pay
                      </button>
                      <button 
                        className="dropdown-item"
                        onClick={() => router.push(`/attendance?search=${member.id}`)}
                      >
                        <Clock size={16} />
                        Attendance history
                      </button>
                      <button 
                        className="dropdown-item"
                        onClick={() => { /* Freeze logic */ }}
                      >
                        <PauseCircle size={16} />
                        Freeze Membership
                      </button>
                      <div className="dropdown-divider"></div>
                      <button 
                        className="dropdown-item danger"
                        onClick={() => handleDeleteMember(member.id, member.name)}
                      >
                        <Trash2 size={16} />
                        Delete Member
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading ? (
          <div className="empty-state">
            <p>Loading members from database...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="empty-state">
            <p>No members found matching your search.</p>
          </div>
        ) : null}
      </section>

      {/* Add Member Database Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content card">
            <div className="modal-header">
              <h2>Add New Member</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddMember} className="add-member-form">
              <div className="name-grid">
                <div className="form-group">
                  <label>First Name</label>
                  <input required type="text" placeholder="John" value={newMember.firstName} onChange={e => setNewMember({...newMember, firstName: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Middle Name</label>
                  <input type="text" placeholder="Kumar" value={newMember.middleName} onChange={e => setNewMember({...newMember, middleName: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input required type="text" placeholder="Doe" value={newMember.lastName} onChange={e => setNewMember({...newMember, lastName: e.target.value})} />
                </div>
              </div>

              <div className="form-group row-group">
                <div className="group-half">
                  <label>Phone Number</label>
                  <div className="phone-input-wrapper">
                    <span className="phone-prefix">+91</span>
                    <input 
                      required 
                      type="tel" 
                      placeholder="98765 43210" 
                      value={newMember.phone} 
                      maxLength={10}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, "");
                        setNewMember({...newMember, phone: val});
                        if (val.length === 10) setFormErrors(prev => ({...prev, phone: null}));
                      }} 
                    />
                  </div>
                  {formErrors.phone && <span className="error-text">{formErrors.phone}</span>}
                </div>
                <div className="group-half">
                  <label>Email Address</label>
                  <input required type="email" placeholder="john@example.com" value={newMember.email} onChange={e => setNewMember({...newMember, email: e.target.value})} />
                </div>
              </div>

              <div className="form-group row-group">
                <div className="group-half">
                  <label>Aadhar Card Number</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="1234 5678 9012" 
                    value={newMember.aadhar} 
                    maxLength={14}
                    onChange={e => {
                      let val = e.target.value.replace(/\D/g, "");
                      if (val.length > 12) val = val.slice(0, 12);
                      // Auto-format with spaces
                      const formatted = val.match(/.{1,4}/g)?.join(" ") || val;
                      setNewMember({...newMember, aadhar: formatted});
                      if (val.length === 12) setFormErrors(prev => ({...prev, aadhar: null}));
                    }} 
                  />
                  {formErrors.aadhar && <span className="error-text">{formErrors.aadhar}</span>}
                </div>
                <div className="group-half">
                  <label>Member Photo</label>
                  <input required type="file" accept="image/*" onChange={e => {
                    const file = e.target.files[0];
                    if (file) setNewMember({...newMember, photo: URL.createObjectURL(file)});
                  }} />
                </div>
              </div>

              <div className="form-group">
                <label>Address</label>
                <input required type="text" placeholder="Full residential address" value={newMember.address} onChange={e => setNewMember({...newMember, address: e.target.value})} />
              </div>

              <div className="form-group row-group">
                <div className="group-half">
                  <label>Membership Plan</label>
                  <select value={newMember.plan} onChange={e => setNewMember({...newMember, plan: e.target.value})}>
                    <option value="1 Month">1 Month (₹999)</option>
                    <option value="3 Months">3 Months (₹2699)</option>
                    <option value="6 Months">6 Months (₹4999)</option>
                    <option value="9 Months">9 Months (₹6999)</option>
                    <option value="1 Year">1 Year (₹8999)</option>
                  </select>
                </div>
                <div className="group-half">
                  <label>Payment Mode</label>
                  <select value={newMember.payment_mode} onChange={e => setNewMember({...newMember, payment_mode: e.target.value})}>
                    <option value="Cash">💵 Cash</option>
                    <option value="Online (UPI)">📱 Online (UPI)</option>
                  </select>
                </div>
              </div>

              <div className="form-group row-group">
                <div className="group-half">
                  <label>Membership Start Date</label>
                  <input 
                    required 
                    type="date" 
                    value={newMember.startPeriod} 
                    onChange={e => {
                      setNewMember({...newMember, startPeriod: e.target.value});
                      if (e.target.value) setFormErrors(prev => ({...prev, startPeriod: null}));
                    }} 
                  />
                  {formErrors.startPeriod && <span className="error-text">{formErrors.startPeriod}</span>}
                </div>
                <div className="group-half">
                  <label>Membership End Date</label>
                  <input 
                    required 
                    type="date" 
                    value={newMember.endPeriod} 
                    onChange={e => {
                      setNewMember({...newMember, endPeriod: e.target.value});
                      if (e.target.value) setFormErrors(prev => ({...prev, endPeriod: null}));
                    }} 
                  />
                  {formErrors.endPeriod && <span className="error-text">{formErrors.endPeriod}</span>}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add New Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .members-page {
          max-width: 1200px;
          margin: 0 auto;
        }

        .filter-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          margin-bottom: 1.5rem;
          gap: 2rem;
        }


        .filters {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--muted-foreground);
        }

        .filter-label {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--primary);
          white-space: nowrap;
        }

        .sort-select, .filter-group select {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 0.5rem 1.25rem 0.5rem 0.75rem;
          color: var(--foreground);
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .sort-select option, .filter-group select option {
          background-color: var(--card);
          color: var(--foreground);
          padding: 10px;
        }

        .sort-select:hover, .filter-group select:hover {
          border-color: var(--primary);
          background: var(--card);
        }

        .filter-icon {
          color: var(--primary);
        }

        .ml-4 { margin-left: 1rem; }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 2rem;
        }

        .header-text h1 {
          font-size: 2rem;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .header-text p {
          color: var(--muted-foreground);
          margin-top: 0.25rem;
        }

        .search-wrapper {
          flex: 1;
          display: flex;
          align-items: center;
          position: relative;
          min-width: 300px;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 0 1rem;
          height: 48px;
          transition: all 0.2s;
        }

        .search-wrapper:focus-within {
          border-color: var(--primary);
          background: var(--card);
          box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.1);
        }

        .search-icon {
          color: var(--primary);
          flex-shrink: 0;
        }

        .search-wrapper input {
          width: 100%;
          height: 100%;
          padding: 0 1rem;
          background: transparent;
          border: none;
          color: var(--foreground);
          font-size: 0.875rem;
          outline: none;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--muted-foreground);
        }

        .filter-group select {
          padding: 0.5rem 1rem;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          color: var(--foreground);
          font-size: 0.875rem;
          cursor: pointer;
        }

        .members-list {
          padding: 0;
          overflow: visible;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .data-table th {
          padding: 1rem 1.5rem;
          background: var(--card);
          border-bottom: 1px solid var(--border);
          color: var(--muted-foreground);
          font-size: 0.875rem;
          font-weight: 500;
        }

        .data-table td {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--border);
          font-size: 0.875rem;
          vertical-align: middle;
        }

        .member-profile {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--muted);
        }

        .info {
          display: flex;
          flex-direction: column;
        }

        .name {
          font-weight: 600;
          color: var(--foreground);
        }

        .email {
          font-size: 0.75rem;
          color: var(--muted-foreground);
        }

        .member-id {
          font-family: var(--font-geist-mono);
          background: var(--card);
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          font-size: 0.75rem;
        }

        .plan-badge {
          background: rgba(249, 115, 22, 0.1);
          color: var(--primary);
          padding: 0.25rem 0.6rem;
          border-radius: 9999px;
          font-weight: 600;
          font-size: 0.75rem;
        }

        .status-cell {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .status-text {
          font-weight: 500;
        }

        .status-text.active { color: #4ade80; }
        .status-text.expired { color: #f87171; }
        .status-text.pending { color: #fbbf24; }

        .action-btn {
          color: var(--muted-foreground);
          padding: 0.5rem;
          border-radius: 50%;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: background 0.2s;
        }

        .action-btn:hover {
          background: var(--card);
          color: var(--foreground);
        }

        .dropdown-menu {
          position: absolute;
          right: 0;
          top: 100%;
          margin-top: 0.5rem;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 0.5rem;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
          z-index: 100;
          min-width: 180px;
        }

        .dropdown-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.625rem 0.75rem;
          background: transparent;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.8125rem;
          font-weight: 500;
          color: var(--foreground);
          transition: all 0.2s;
        }

        .dropdown-item:hover {
          background: var(--card);
          color: var(--foreground);
        }

        .dropdown-item svg {
          color: var(--muted-foreground);
          transition: color 0.2s;
        }

        .dropdown-item:hover svg {
          color: var(--foreground);
        }

        .dropdown-item.danger {
          color: #ef4444;
        }
        .dropdown-item.danger:hover {
          background: rgba(239, 68, 68, 0.1);
        }

        .dropdown-divider {
          height: 1px;
          background: var(--border);
          margin: 0.5rem 0;
          opacity: 0.5;
        }

        .empty-state {
          padding: 4rem;
          text-align: center;
          color: var(--muted-foreground);
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
        }

        .modal-content {
          width: 100%;
          max-width: 800px;
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          animation: scaleUp 0.2s ease-out;
          max-height: 90vh;
          overflow-y: auto;
        }

        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .modal-header h2 { font-size: 1.25rem; font-weight: 700; color: var(--foreground); }
        .close-btn { background: transparent; border: none; color: var(--muted-foreground); cursor: pointer; }
        .close-btn:hover { color: var(--foreground); }

        .add-member-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .name-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 1rem;
        }

        @media (max-width: 600px) {
          .name-row {
            grid-template-columns: 1fr;
          }
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--muted-foreground);
        }

        .form-group input, .form-group select {
          padding: 0.75rem 1rem;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          color: var(--foreground);
          width: 100%;
          font-size: 0.9375rem;
          font-weight: 500;
          cursor: pointer;
        }

        .form-group select option {
          background-color: var(--card);
          color: var(--foreground);
          padding: 1rem;
        }

        .phone-input-wrapper {
          display: flex;
          align-items: center;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          overflow: hidden;
        }

        .phone-prefix {
          padding: 0.75rem 0.75rem;
          background: var(--card);
          color: var(--muted-foreground);
          font-weight: 700;
          font-size: 0.875rem;
          border-right: 1px solid var(--border);
          user-select: none;
          white-space: nowrap;
        }

        .phone-input-wrapper input {
          border: none !important;
          background: transparent !important;
          border-radius: 0 !important;
          flex: 1;
        }

        .phone-input-wrapper input:focus {
          outline: none;
        }

        .form-group input[type="file"] {
          padding: 0.6rem 1rem;
          color: var(--muted-foreground);
          font-size: 0.8125rem;
        }

        .name-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 1.25rem;
          margin-bottom: 1.25rem;
        }

        @media (max-width: 700px) {
          .name-grid {
            grid-template-columns: 1fr;
          }
        }

        .row-group {
          display: flex;
          flex-direction: row;
          gap: 1.25rem;
          margin-bottom: 1.25rem;
        }

        .group-half {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 1rem;
        }
        
        .btn-secondary {
          padding: 0.75rem 1.5rem;
          background: var(--card);
          border: 1px solid var(--border);
          color: var(--foreground);
          border-radius: var(--radius);
          font-weight: 600;
          cursor: pointer;
        }

        .payment-info {
          padding-bottom: 0.75rem;
        }

        .payment-badge {
          padding: 0.5rem 1rem;
          border-radius: var(--radius);
          font-weight: 700;
          font-size: 0.875rem;
          display: inline-block;
        }

        .payment-badge.cash {
          background: rgba(74, 222, 128, 0.1);
          color: #4ade80;
          border: 1px solid rgba(74, 222, 128, 0.2);
        }

        .payment-badge.upi {
          background: rgba(139, 92, 246, 0.1);
          color: #8b5cf6;
          border: 1px solid rgba(139, 92, 246, 0.2);
        }

        .error-text {
          color: #f87171;
          font-size: 0.75rem;
          font-weight: 500;
          margin-top: 0.25rem;
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          .filter-bar {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  );
}
