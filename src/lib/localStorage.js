"use client";

const MEMBERS_KEY = "mf_members";
const ATTENDANCE_KEY = "mf_attendance";
const PAYMENTS_KEY = "mf_payments";

// MEMBERS
export function getStoredMembers() {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(MEMBERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveMembers(members) {
  if (typeof window === "undefined") return;
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
}

// ATTENDANCE
export function getStoredAttendance() {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(ATTENDANCE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveAttendance(records) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(records));
}

// PAYMENTS
export function getStoredPayments() {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(PAYMENTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function savePayments(payments) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
}

// SHARED HELPERS
export function addMember(member) {
  const members = getStoredMembers();
  const updated = [member, ...members];
  saveMembers(updated);
  
  const payments = getStoredPayments();
  const nextInvoiceId = generateNextInvoiceId(payments);
  
  const initialPayment = {
    id: nextInvoiceId,
    member_id: member.id,
    member_name: member.name,
    amount: getPlanPrice(member.plan),
    payment_date: new Date().toISOString(),
    method: member.payment_mode || "Cash",
    status: "Completed",
    created_at: new Date().toISOString()
  };
  
  savePayments([initialPayment, ...payments]);
  
  return updated;
}

function getPlanPrice(plan) {
  const prices = {
    "1 Month": 999,
    "3 Months": 2699,
    "6 Months": 4999,
    "9 Months": 6999,
    "1 Year": 8999
  };
  return prices[plan] || 999;
}

export function removeMember(id) {
  // 1. Remove from members
  const members = getStoredMembers().filter(m => m.id !== id);
  saveMembers(members);
  
  // 2. Remove from attendance
  const attendance = getStoredAttendance().filter(a => a.member_id !== id);
  saveAttendance(attendance);
  
  // 3. Remove from payments
  const payments = getStoredPayments().filter(p => p.member_id !== id);
  savePayments(payments);
  
  return members;
}

export function clearAllData() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(MEMBERS_KEY);
  localStorage.removeItem(ATTENDANCE_KEY);
  localStorage.removeItem(PAYMENTS_KEY);
}

export function clearAllPayments() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PAYMENTS_KEY);
}

export function generateNextInvoiceId(payments) {
  if (!payments || payments.length === 0) return "INV-001";
  
  const ids = payments
    .map(p => p.id)
    .filter(id => id && id.startsWith("INV-"))
    .map(id => {
      const numPart = id.replace("INV-", "");
      return parseInt(numPart, 10);
    })
    .filter(n => !isNaN(n));
    
  const maxId = ids.length > 0 ? Math.max(...ids) : 0;
  return `INV-${String(maxId + 1).padStart(3, "0")}`;
}

export function repairPayments() {
  if (typeof window === "undefined") return;
  const payments = getStoredPayments();
  let changed = false;
  
  const updated = payments.map(p => {
    // If it's an old 1000 record, fix it to 600
    if (p.amount === 1000) {
      changed = true;
      return { ...p, amount: 600 };
    }
    return p;
  });
  
  if (changed) {
    savePayments(updated);
  }
}
