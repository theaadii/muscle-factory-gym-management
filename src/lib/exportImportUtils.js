// Export/Import utilities for multiple formats

export function exportToJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename || `gym-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToCSV(data, filename) {
  let csv = "";
  
  if (data.members && Array.isArray(data.members)) {
    csv += "MEMBERS DATA\n";
    csv += "ID,Name,Email,Phone,Plan,Status,JoinDate\n";
    data.members.forEach(member => {
      csv += `"${member.id}","${member.name || ''}","${member.email || ''}","${member.phone || ''}","${member.plan || ''}","${member.status || ''}","${member.join_date || ''}"\n`;
    });
    csv += "\n\n";
  }
  
  if (data.invoices && Array.isArray(data.invoices)) {
    csv += "INVOICES DATA\n";
    csv += "ID,Member,Amount,Date,Status\n";
    data.invoices.forEach(invoice => {
      csv += `"${invoice.id}","${invoice.member_name || ''}","${invoice.amount || 0}","${invoice.payment_date || ''}","${invoice.status || ''}"\n`;
    });
  }

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename || `gym-backup-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToExcel(data, filename) {
  // Create HTML table structure for Excel
  let html = `<html xmlns:x="urn:schemas-microsoft-com:office:excel">
    <head>
      <style>
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f97316; color: white; font-weight: bold; }
        .header { font-size: 16px; font-weight: bold; padding: 12px 0; }
      </style>
    </head>
    <body>`;

  // Members sheet
  if (data.members && Array.isArray(data.members)) {
    html += `<div class="header">MEMBERS DATA</div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Plan</th>
            <th>Status</th>
            <th>Join Date</th>
            <th>End Period</th>
          </tr>
        </thead>
        <tbody>`;
    
    data.members.forEach(member => {
      html += `<tr>
        <td>${member.id || ''}</td>
        <td>${member.name || ''}</td>
        <td>${member.email || ''}</td>
        <td>${member.phone || ''}</td>
        <td>${member.plan || ''}</td>
        <td>${member.status || ''}</td>
        <td>${member.join_date || ''}</td>
        <td>${member.endPeriod || ''}</td>
      </tr>`;
    });
    html += `</tbody></table><br><br>`;
  }

  // Invoices sheet
  if (data.invoices && Array.isArray(data.invoices)) {
    html += `<div class="header">INVOICES DATA</div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Member</th>
            <th>Amount</th>
            <th>Payment Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>`;
    
    data.invoices.forEach(invoice => {
      html += `<tr>
        <td>${invoice.id || ''}</td>
        <td>${invoice.member_name || ''}</td>
        <td>${invoice.amount || 0}</td>
        <td>${invoice.payment_date || ''}</td>
        <td>${invoice.status || ''}</td>
      </tr>`;
    });
    html += `</tbody></table>`;
  }

  html += `</body></html>`;

  const blob = new Blob([html], { type: "application/vnd.ms-excel" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename || `gym-backup-${new Date().toISOString().split('T')[0]}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function importFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target.result;
        let data;

        if (file.name.endsWith('.json')) {
          data = JSON.parse(result);
        } else if (file.name.endsWith('.csv')) {
          data = parseCSV(result);
        } else if (file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) {
          // For Excel, we'll need basic support
          reject(new Error("Excel import requires additional library. Please use JSON or CSV format."));
          return;
        } else {
          reject(new Error("Unsupported file format. Use JSON, CSV, or Excel."));
          return;
        }

        resolve(data);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Unable to read file"));
    reader.readAsText(file);
  });
}

function parseCSV(csvText) {
  const lines = csvText.split('\n');
  const members = [];
  const invoices = [];
  let currentSection = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line === '') continue;
    if (line === 'MEMBERS DATA') {
      currentSection = 'members';
      i++; // Skip header
      continue;
    }
    if (line === 'INVOICES DATA') {
      currentSection = 'invoices';
      i++; // Skip header
      continue;
    }

    if (currentSection === 'members' && line && !line.includes('ID,Name,Email')) {
      const values = parseCSVLine(line);
      if (values.length >= 7) {
        members.push({
          id: values[0],
          name: values[1],
          email: values[2],
          phone: values[3],
          plan: values[4],
          status: values[5],
          join_date: values[6]
        });
      }
    }

    if (currentSection === 'invoices' && line && !line.includes('ID,Member,Amount')) {
      const values = parseCSVLine(line);
      if (values.length >= 5) {
        invoices.push({
          id: values[0],
          member_name: values[1],
          amount: parseFloat(values[2]) || 0,
          payment_date: values[3],
          status: values[4]
        });
      }
    }
  }

  return { members, invoices };
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === ',' && !insideQuotes) {
      result.push(current.replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.replace(/^"|"$/g, ''));
  return result;
}

export function getAutoBackupSchedules() {
  return [
    { value: 'daily', label: 'Daily (Every day at 2:00 AM)' },
    { value: 'weekly', label: 'Weekly (Every Monday at 2:00 AM)' },
    { value: 'monthly', label: 'Monthly (1st of every month at 2:00 AM)' },
  ];
}

export function getNextBackupTime(schedule) {
  const now = new Date();
  let nextBackup = new Date();
  nextBackup.setHours(2, 0, 0, 0);

  if (schedule === 'daily') {
    if (nextBackup <= now) {
      nextBackup.setDate(nextBackup.getDate() + 1);
    }
  } else if (schedule === 'weekly') {
    // Next Monday
    const dayOfWeek = nextBackup.getDay();
    const daysUntilMonday = (1 - dayOfWeek + 7) % 7 || 7;
    nextBackup.setDate(nextBackup.getDate() + daysUntilMonday);
    if (nextBackup <= now) {
      nextBackup.setDate(nextBackup.getDate() + 7);
    }
  } else if (schedule === 'monthly') {
    // 1st of next month
    nextBackup.setDate(1);
    nextBackup.setMonth(nextBackup.getMonth() + 1);
    if (nextBackup <= now) {
      nextBackup.setMonth(nextBackup.getMonth() + 1);
    }
  }

  return nextBackup;
}
