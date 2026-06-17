import { useState } from "react";
import { Trash2 } from "lucide-react";

export default function AccessSettings() {
  const [staffAccess, setStaffAccess] = useState(false);
  const [staffList, setStaffList] = useState([{ id: 1, name: "Manager", pin: "1234" }]);
  const [newStaff, setNewStaff] = useState({ name: "", pin: "" });
  const [error, setError] = useState(null);

  const addStaff = () => {
    setError(null);

    if (!newStaff.name.trim()) {
      setError("Staff name is required.");
      return;
    }

    if (!newStaff.pin || newStaff.pin.length !== 4 || !/^\d+$/.test(newStaff.pin)) {
      setError("PIN must be exactly 4 digits.");
      return;
    }

    setStaffList([...staffList, { id: Date.now(), ...newStaff }]);
    setNewStaff({ name: "", pin: "" });
  };

  const removeStaff = (id) => {
    setStaffList(staffList.filter(staff => staff.id !== id));
  };

  return (
    <>
      <div className="settings-card">
        <h2 className="card-title">Staff Access</h2>
        <p className="card-description">Manage staff members and their access credentials.</p>

        <div className="form-group">
          <div className="toggle-group">
            <label htmlFor="staff-access">Enable Staff Access</label>
            <input 
              id="staff-access"
              type="checkbox" 
              checked={staffAccess} 
              onChange={() => setStaffAccess(!staffAccess)} 
              className="toggle-input" 
            />
          </div>
        </div>

        {staffAccess && (
          <>
            <div className="add-staff-section">
              <h3 className="subsection-title">Add New Staff Member</h3>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label htmlFor="staff-name">Staff Name</label>
                  <input
                    id="staff-name"
                    type="text"
                    placeholder="Enter staff name"
                    value={newStaff.name}
                    onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="form-group flex-1">
                  <label htmlFor="staff-pin">PIN (4 digits)</label>
                  <input
                    id="staff-pin"
                    type="password"
                    placeholder="Enter 4-digit PIN"
                    value={newStaff.pin}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                      setNewStaff({ ...newStaff, pin: val });
                    }}
                    maxLength="4"
                    className="input-field"
                  />
                </div>
              </div>

              {error && <div className="error-msg">{error}</div>}

              <button onClick={addStaff} className="btn btn-primary">
                Add Staff Member
              </button>
            </div>

            {staffList.length > 0 && (
              <div className="staff-list-section">
                <h3 className="subsection-title">Staff Members ({staffList.length})</h3>
                <div className="staff-list">
                  {staffList.map((staff) => (
                    <div key={staff.id} className="staff-item">
                      <div className="staff-info">
                        <p className="staff-name">{staff.name}</p>
                        <p className="staff-pin">PIN: {staff.pin}</p>
                      </div>
                      <button 
                        onClick={() => removeStaff(staff.id)}
                        className="btn-remove"
                        title="Remove staff"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        .settings-card {
          padding: 2rem;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 16px;
          animation: slideIn 0.3s ease-out;
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

        .form-group.flex-1 {
          flex: 1;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 1.5rem;
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

        .toggle-group {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border);
          border-radius: 8px;
        }

        .toggle-input {
          width: 44px;
          height: 24px;
          cursor: pointer;
          accent-color: var(--primary);
        }

        .add-staff-section {
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border);
          border-radius: 8px;
          margin-bottom: 1.5rem;
        }

        .subsection-title {
          font-size: 1rem;
          font-weight: 700;
          color: var(--foreground);
          margin-bottom: 1.25rem;
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
        }

        .btn-primary {
          background: var(--primary);
          color: white;
        }

        .btn-primary:hover {
          background: #f97316;
          opacity: 0.9;
        }

        .staff-list-section {
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border);
          border-radius: 8px;
        }

        .staff-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .staff-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          background: rgba(249, 115, 22, 0.05);
          border: 1px solid rgba(249, 115, 22, 0.15);
          border-radius: 8px;
          transition: all 0.2s;
        }

        .staff-item:hover {
          background: rgba(249, 115, 22, 0.1);
          border-color: rgba(249, 115, 22, 0.25);
        }

        .staff-info {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .staff-name {
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--foreground);
          margin: 0;
        }

        .staff-pin {
          font-size: 0.8125rem;
          color: var(--muted-foreground);
          margin: 0;
        }

        .btn-remove {
          padding: 0.5rem;
          background: transparent;
          border: none;
          color: #f87171;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-remove:hover {
          color: #ef4444;
        }
      `}</style>
    </>
  );
}