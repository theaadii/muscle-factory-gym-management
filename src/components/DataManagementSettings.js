import { useState } from "react";
import { Download, Upload, CheckCircle2, AlertTriangle, FileJson, FileText, Table } from "lucide-react";
import { getStoredMembers, saveMembers, getStoredPayments, savePayments } from "@/lib/localStorage";
import { exportToJSON, exportToCSV, exportToExcel, importFromFile, getAutoBackupSchedules, getNextBackupTime } from "@/lib/exportImportUtils";

export default function DataManagementSettings() {
  const [lastBackupDate, setLastBackupDate] = useState("2026-04-01");
  const [autoBackup, setAutoBackup] = useState(false);
  const [autoBackupSchedule, setAutoBackupSchedule] = useState("daily");
  const [backupStatus, setBackupStatus] = useState(null);
  const [importType, setImportType] = useState("members");

  const schedules = getAutoBackupSchedules();

  const generateBackupData = () => ({
    members: getStoredMembers(),
    invoices: getStoredPayments(),
    backupDate: new Date().toISOString(),
    version: "1.0"
  });

  const handleBackupJSON = () => {
    const data = generateBackupData();
    exportToJSON(data, `gym-backup-${new Date().toISOString().split('T')[0]}.json`);
    updateBackupDate();
  };

  const handleBackupCSV = () => {
    const data = generateBackupData();
    exportToCSV(data, `gym-backup-${new Date().toISOString().split('T')[0]}.csv`);
    updateBackupDate();
  };

  const handleBackupExcel = () => {
    const data = generateBackupData();
    exportToExcel(data, `gym-backup-${new Date().toISOString().split('T')[0]}.xls`);
    updateBackupDate();
  };

  const updateBackupDate = () => {
    setLastBackupDate(new Date().toISOString().split('T')[0]);
    setBackupStatus({ type: "success", message: "Backup downloaded successfully! Contains member details and invoices." });
    setTimeout(() => setBackupStatus(null), 3000);
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!window.confirm("This will OVERWRITE your current data. Are you sure?")) {
      return;
    }

    try {
      const data = await importFromFile(file);

      if (!data.members || !Array.isArray(data.members)) {
        throw new Error("Invalid file: missing members data.");
      }
      if (!data.invoices || !Array.isArray(data.invoices)) {
        throw new Error("Invalid file: missing invoices data.");
      }

      // Import based on selection
      if (importType === "members") {
        saveMembers(data.members);
      } else if (importType === "invoices") {
        savePayments(data.invoices);
      } else if (importType === "both") {
        saveMembers(data.members);
        savePayments(data.invoices);
      }

      setBackupStatus({
        type: "success",
        message: `Successfully imported ${importType === "both" ? "members and invoices" : importType}!`
      });
      setTimeout(() => setBackupStatus(null), 3000);
    } catch (err) {
      setBackupStatus({ type: "error", message: err.message || "Import failed. Check file format." });
      setTimeout(() => setBackupStatus(null), 4000);
    }   
  };

  return (
    <>
      {/* Backup Data Section */}
      <div className="settings-card">
        <h2 className="card-title">Backup Gym Data</h2>
        <p className="card-description">Export member details and invoices in your preferred format.</p>

        <div className="data-section">
          <div className="last-backup">
            <span className="backup-label">Last Backup Date:</span>
            <span className="backup-date">{lastBackupDate}</span>
          </div>
        </div>

        <div className="backup-formats">
          <button onClick={handleBackupJSON} className="btn btn-format btn-json">
            <FileJson size={18} />
            <span>JSON</span>
          </button>
          <button onClick={handleBackupCSV} className="btn btn-format btn-csv">
            <FileText size={18} />
            <span>CSV</span>
          </button>
          <button onClick={handleBackupExcel} className="btn btn-format btn-excel">
            <Table size={18} />
            <span>Excel</span>
          </button>
        </div>

        {backupStatus && (
          <div className={`status-msg ${backupStatus.type}`}>
            {backupStatus.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            <span>{backupStatus.message}</span>
          </div>
        )}
      </div>

      {/* Import Data Section */}
      <div className="settings-card">
        <h2 className="card-title">Import Data</h2>
        <p className="card-description">Upload a backup file to restore data. Supports JSON, CSV formats.</p>

        <div className="form-group">
          <label className="form-label">Import Type</label>
          <div className="import-type-options">
            <label className="radio-option">
              <input 
                type="radio" 
                name="importType" 
                value="members" 
                checked={importType === "members"}
                onChange={(e) => setImportType(e.target.value)}
              />
              <span>Members Only</span>
            </label>
            <label className="radio-option">
              <input 
                type="radio" 
                name="importType" 
                value="invoices" 
                checked={importType === "invoices"}
                onChange={(e) => setImportType(e.target.value)}
              />
              <span>Invoices Only</span>
            </label>
            <label className="radio-option">
              <input 
                type="radio" 
                name="importType" 
                value="both" 
                checked={importType === "both"}
                onChange={(e) => setImportType(e.target.value)}
              />
              <span>Both Members & Invoices</span>
            </label>
          </div>
        </div>

        <div className="upload-zone">
          <input type="file" accept=".json,.csv,.xls,.xlsx" onChange={handleImport} id="import-upload" hidden />
          <label htmlFor="import-upload" className="upload-label">
            <Upload size={20} />
            <span>Select File to Import</span>
          </label>
          <p className="upload-hint">Supports .json or .csv files</p>
        </div>

        <p className="warning-msg">
          <AlertTriangle size={16} />
          <strong>Warning:</strong> Importing will replace selected data with file contents.
        </p>
      </div>

      {/* Auto-Backup Section */}
      <div className="settings-card auto-backup">
        <h2 className="card-title">Auto-Backup Settings</h2>
        <p className="card-description">Enable automatic backups of all member details and invoices.</p>

        <div className="form-group">
          <div className="toggle-group">
            <label htmlFor="auto-backup">Enable Auto-Backup</label>
            <input 
              id="auto-backup" 
              type="checkbox" 
              checked={autoBackup} 
              onChange={() => setAutoBackup(!autoBackup)} 
              className="toggle-input" 
            />
          </div>
        </div>

        {autoBackup && (
          <div className="auto-backup-options">
            <div className="form-group">
              <label className="form-label">Backup Schedule</label>
              <select 
                value={autoBackupSchedule} 
                onChange={(e) => setAutoBackupSchedule(e.target.value)}
                className="form-select"
              >
                {schedules.map(schedule => (
                  <option key={schedule.value} value={schedule.value}>
                    {schedule.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="backup-info">
              <p><strong>Next Backup:</strong> {getNextBackupTime(autoBackupSchedule).toLocaleString()}</p>
              <p>Backups are stored locally in your browser storage.</p>
              <p><strong>Format:</strong> JSON (members + invoices)</p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .settings-card {
          padding: 2rem;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 16px;
          animation: slideIn 0.3s ease-out;
          margin-bottom: 1.5rem;
        }

        .auto-backup {
          background: rgba(249, 115, 22, 0.02);
          border-color: rgba(249, 115, 22, 0.2);
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .card-title {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
          color: var(--foreground);
        }

        .card-description {
          font-size: 0.875rem;
          color: var(--muted-foreground);
          margin-bottom: 1.5rem;
        }

        .data-section {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 1.5rem;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 8px;
          margin-bottom: 1.5rem;
        }

        .last-backup {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex: 1;
        }

        .backup-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--muted-foreground);
        }

        .backup-date {
          font-size: 0.875rem;
          color: var(--foreground);
          font-weight: 500;
        }

        .backup-formats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .btn-format {
          border: 1px solid var(--border);
          background: rgba(255, 255, 255, 0.02);
          color: var(--foreground);
          flex-direction: column;
          padding: 1rem;
        }

        .btn-format:hover {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }

        .btn-json { }
        .btn-csv { }
        .btn-excel { }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .form-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--foreground);
        }

        .import-type-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
        }

        .radio-option {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.875rem;
        }

        .radio-option:hover {
          background: rgba(249, 115, 22, 0.1);
          border-color: var(--primary);
        }

        .radio-option input[type="radio"] {
          cursor: pointer;
          accent-color: var(--primary);
        }

        .form-select {
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--foreground);
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .form-select:focus {
          outline: none;
          border-color: var(--primary);
          background: rgba(249, 115, 22, 0.05);
        }

        .backup-info {
          padding: 1rem;
          background: rgba(249, 115, 22, 0.05);
          border: 1px solid rgba(249, 115, 22, 0.15);
          border-radius: 8px;
          font-size: 0.875rem;
          color: var(--muted-foreground);
        }

        .backup-info p {
          margin: 0.5rem 0;
        }

        .backup-info strong {
          color: var(--foreground);
        }

        .auto-backup-options {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border);
          padding: 1.5rem;
          border-radius: 8px;
          margin-top: 1rem;
        }

        .upload-zone {
          padding: 2rem;
          background: rgba(255, 255, 255, 0.02);
          border: 2px dashed var(--border);
          border-radius: 8px;
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .upload-label {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          background: rgba(249, 115, 22, 0.1);
          border: 1px solid rgba(249, 115, 22, 0.2);
          border-radius: 8px;
          color: var(--primary);
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          width: fit-content;
          margin: 0 auto;
        }

        .upload-label:hover {
          background: var(--primary);
          color: white;
        }

        .upload-hint {
          font-size: 0.8125rem;
          color: var(--muted-foreground);
          margin-top: 0.75rem;
        }

        .status-msg {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          margin-top: 1rem;
        }

        .status-msg.success {
          background: rgba(74, 222, 128, 0.1);
          color: #4ade80;
          border: 1px solid rgba(74, 222, 128, 0.2);
        }

        .status-msg.error {
          background: rgba(248, 113, 113, 0.1);
          color: #f87171;
          border: 1px solid rgba(248, 113, 113, 0.2);
        }

        .warning-msg {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: rgba(239, 68, 68, 0.05);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 8px;
          font-size: 0.8125rem;
          color: #f87171;
          margin-top: 1rem;
        }

        .toggle-group {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border);
          border-radius: 8px;
        }

        .toggle-group label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--foreground);
          text-transform: none;
          letter-spacing: 0;
        }

        .toggle-input {
          width: 44px;
          height: 24px;
          cursor: pointer;
          accent-color: var(--primary);
        }

        @media (max-width: 768px) {
          .settings-card {
            padding: 1.5rem;
          }

          .backup-formats {
            grid-template-columns: 1fr;
          }

          .import-type-options {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}