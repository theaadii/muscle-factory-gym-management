import { useState } from "react";
import { Lock, LogOut } from "lucide-react";

export default function SecuritySettings() {
  const [showPassword, setShowPassword] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChangePassword = () => {
    setError(null);
    setSuccess(false);

    if (!passwords.current) {
      setError("Current password is required.");
      return;
    }

    if (!passwords.new) {
      setError("New password is required.");
      return;
    }

    if (passwords.new.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    if (passwords.new !== passwords.confirm) {
      setError("Passwords do not match.");
      return;
    }

    // Simulate password change
    setSuccess(true);
    setPasswords({ current: "", new: "", confirm: "" });
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleLogoutAll = () => {
    if (window.confirm("Are you sure you want to log out from all devices? You will need to log in again.")) {
      alert("Logged out from all devices. Please log in again.");
      // Redirect to login page
    }
  };

  return (
    <>
      <div className="settings-card">
        <h2 className="card-title">Change Password</h2>
        <p className="card-description">Update your account password to keep it secure.</p>

        <div className="form-group">
          <label htmlFor="current-pwd">Current Password</label>
          <div className="password-input-wrapper">
            <input 
              id="current-pwd"
              type={showPassword ? "text" : "password"} 
              value={passwords.current}
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              placeholder="Enter your current password"
              className="input-field"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="new-pwd">New Password</label>
            <input 
              id="new-pwd"
              type={showPassword ? "text" : "password"} 
              value={passwords.new}
              onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
              placeholder="Enter new password"
              className="input-field"
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirm-pwd">Confirm Password</label>
            <input 
              id="confirm-pwd"
              type={showPassword ? "text" : "password"} 
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              placeholder="Confirm new password"
              className="input-field"
            />
          </div>
        </div>

        <div className="form-group">
          <div className="checkbox-item">
            <input 
              id="show-pwd"
              type="checkbox" 
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
              className="checkbox-input"
            />
            <label htmlFor="show-pwd" className="checkbox-label">Show passwords</label>
          </div>
        </div>

        {error && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">Password changed successfully!</div>}

        <button onClick={handleChangePassword} className="btn btn-primary">
          <Lock size={18} />
          Change Password
        </button>
      </div>

      <div className="settings-card danger-zone">
        <h2 className="card-title">Logout from All Devices</h2>
        <p className="card-description">Sign out from all active sessions and devices.</p>

        <div className="warning-box">
          <p>This will log you out of all devices using your account. You will need to log in again.</p>
        </div>

        <button onClick={handleLogoutAll} className="btn btn-danger">
          <LogOut size={18} />
          Logout from All Devices
        </button>
      </div>

      <style jsx>{`
        .settings-card {
          padding: 2rem;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 16px;
          animation: slideIn 0.3s ease-out;
        }

        .danger-zone {
          background: linear-gradient(to bottom right, rgba(239, 68, 68, 0.02), transparent);
          border-color: rgba(239, 68, 68, 0.2);
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

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        label {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--muted-foreground);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .input-field {
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--foreground);
          font-size: 0.9375rem;
          transition: all 0.2s;
        }

        .input-field:focus {
          outline: none;
          border-color: var(--primary);
          background: rgba(255, 255, 255, 0.04);
          box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.1);
        }

        .password-input-wrapper {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .checkbox-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border);
          border-radius: 8px;
        }

        .checkbox-input {
          width: 20px;
          height: 20px;
          cursor: pointer;
          accent-color: var(--primary);
        }

        .checkbox-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--foreground);
          cursor: pointer;
          text-transform: none;
          letter-spacing: 0;
        }

        .error-msg {
          padding: 0.75rem 1rem;
          background: rgba(248, 113, 113, 0.1);
          border: 1px solid rgba(248, 113, 113, 0.2);
          color: #f87171;
          border-radius: 8px;
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }

        .success-msg {
          padding: 0.75rem 1rem;
          background: rgba(74, 222, 128, 0.1);
          border: 1px solid rgba(74, 222, 128, 0.2);
          color: #4ade80;
          border-radius: 8px;
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }

        .warning-box {
          padding: 1rem;
          background: rgba(239, 68, 68, 0.05);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 8px;
          margin-bottom: 1.5rem;
        }

        .warning-box p {
          font-size: 0.875rem;
          color: #f87171;
          margin: 0;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          width: fit-content;
        }

        .btn-primary {
          background: var(--primary);
          color: white;
        }

        .btn-primary:hover {
          background: #f97316;
          opacity: 0.9;
        }

        .btn-danger {
          background: #ef4444;
          color: white;
        }

        .btn-danger:hover {
          background: #dc2626;
        }
      `}</style>
    </>
  );
}