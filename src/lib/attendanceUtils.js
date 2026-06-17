// Attendance data management functions

export function getStoredAttendance() {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem("gymAttendance");
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading attendance:", error);
    return [];
  }
}

export function saveAttendance(attendance) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("gymAttendance", JSON.stringify(attendance));
  } catch (error) {
    console.error("Error saving attendance:", error);
  }
}

export function markCheckIn(memberId, memberName) {
  const attendance = getStoredAttendance();
  const checkInTime = new Date().toISOString();
  
  attendance.push({
    id: `${memberId}-${Date.now()}`,
    memberId,
    memberName,
    checkIn: checkInTime,
    checkOut: null,
    date: new Date().toISOString().split("T")[0],
    duration: 0
  });
  
  saveAttendance(attendance);
  return true;
}

export function markCheckOut(memberId) {
  const attendance = getStoredAttendance();
  const checkOutTime = new Date().toISOString();
  
  // Find the latest check-in for this member today
  const today = new Date().toISOString().split("T")[0];
  const todayRecords = attendance.filter(a => a.date === today && a.memberId === memberId);
  
  if (todayRecords.length > 0) {
    const lastRecord = todayRecords[todayRecords.length - 1];
    if (!lastRecord.checkOut) {
      const checkInTime = new Date(lastRecord.checkIn);
      const checkOutTime2 = new Date(checkOutTime);
      const duration = Math.round((checkOutTime2 - checkInTime) / (1000 * 60)); // minutes
      
      lastRecord.checkOut = checkOutTime;
      lastRecord.duration = duration;
    }
  }
  
  saveAttendance(attendance);
  return true;
}

export function getPeakHours() {
  const attendance = getStoredAttendance();
  const hourCounts = {};
  
  // Initialize hours 6-22 (6am to 10pm)
  for (let i = 6; i <= 22; i++) {
    hourCounts[i] = 0;
  }
  
  attendance.forEach(record => {
    if (record.checkIn) {
      const hour = new Date(record.checkIn).getHours();
      if (hour >= 6 && hour <= 22) {
        hourCounts[hour]++;
      }
    }
  });
  
  return hourCounts;
}

export function getMemberAttendanceStats() {
  const attendance = getStoredAttendance();
  const members = {};
  
  attendance.forEach(record => {
    if (!members[record.memberId]) {
      members[record.memberId] = {
        memberId: record.memberId,
        memberName: record.memberName,
        totalVisits: 0,
        totalMinutes: 0,
        lastVisit: null,
        thisMonth: 0,
        thisWeek: 0
      };
    }
    
    members[record.memberId].totalVisits++;
    members[record.memberId].totalMinutes += record.duration || 0;
    
    const visitDate = new Date(record.checkIn);
    if (!members[record.memberId].lastVisit || new Date(members[record.memberId].lastVisit) < visitDate) {
      members[record.memberId].lastVisit = record.checkIn;
    }
    
    // Count this month
    const now = new Date();
    if (visitDate.getMonth() === now.getMonth() && visitDate.getFullYear() === now.getFullYear()) {
      members[record.memberId].thisMonth++;
    }
    
    // Count this week
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    if (visitDate >= weekAgo) {
      members[record.memberId].thisWeek++;
    }
  });
  
  return Object.values(members);
}

export function getInactiveMembers(allMembers, daysInactive = 7) {
  const attendance = getMemberAttendanceStats();
  const attendanceMap = {};
  
  attendance.forEach(a => {
    attendanceMap[a.memberId] = a;
  });
  
  const now = new Date();
  const inactiveThreshold = new Date(now.getTime() - daysInactive * 24 * 60 * 60 * 1000);
  
  return allMembers.filter(member => {
    const stats = attendanceMap[member.id];
    
    // If no attendance record, consider inactive
    if (!stats) {
      return true;
    }
    
    // If last visit is before threshold, consider inactive
    if (stats.lastVisit) {
      return new Date(stats.lastVisit) < inactiveThreshold;
    }
    
    return true;
  });
}
