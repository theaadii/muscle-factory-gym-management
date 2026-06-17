import { useState } from "react";

export default function OperationsSettings() {
  const [autoRenew, setAutoRenew] = useState(false);
  const [trialMemberships, setTrialMemberships] = useState(false);
  const [checkInMethod, setCheckInMethod] = useState("manual");
  const [multipleCheckIns, setMultipleCheckIns] = useState(false);
  const [defaultCurrency, setDefaultCurrency] = useState("INR");
  const [paymentMethods, setPaymentMethods] = useState(["cash", "card"]);
  const [autoReceipts, setAutoReceipts] = useState(true);
  const [lateFee, setLateFee] = useState("0");

  const togglePaymentMethod = (method) => {
    setPaymentMethods(prev => 
      prev.includes(method) ? prev.filter(m => m !== method) : [...prev, method]
    );
  };

  return (
    <>
      <div className="settings-card">
        <h2 className="card-title">Membership Settings</h2>
        <p className="card-description">Configure membership and trial options.</p>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="duration">Default Membership Duration (days)</label>
            <input id="duration" type="number" defaultValue={30} className="input-field" />
          </div>
          <div className="form-group">
            <label htmlFor="grace">Grace Period (days after expiry)</label>
            <input id="grace" type="number" defaultValue={7} className="input-field" />
          </div>
        </div>

        <div className="form-group">
          <div className="toggle-group">
            <label htmlFor="auto-renew">Enable Auto-Renew</label>
            <input id="auto-renew" type="checkbox" checked={autoRenew} onChange={() => setAutoRenew(!autoRenew)} className="toggle-input" />
          </div>
        </div>

        <div className="form-group">
          <div className="toggle-group">
            <label htmlFor="trial">Enable Trial Memberships</label>
            <input id="trial" type="checkbox" checked={trialMemberships} onChange={() => setTrialMemberships(!trialMemberships)} className="toggle-input" />
          </div>
        </div>
      </div>

      <div className="settings-card">
        <h2 className="card-title">Attendance Settings</h2>
        <p className="card-description">Manage check-in and attendance options.</p>

        <div className="form-group">
          <label htmlFor="checkin">Check-In Method</label>
          <select id="checkin" value={checkInMethod} onChange={(e) => setCheckInMethod(e.target.value)} className="select-field">
            <option value="manual">Manual</option>
            <option value="qr">QR Code</option>
          </select>
        </div>

        <div className="form-group">
          <div className="toggle-group">
            <label htmlFor="multi-checkin">Allow Multiple Check-Ins Per Day</label>
            <input id="multi-checkin" type="checkbox" checked={multipleCheckIns} onChange={() => setMultipleCheckIns(!multipleCheckIns)} className="toggle-input" />
          </div>
        </div>
      </div>

      <div className="settings-card">
        <h2 className="card-title">Billing & Payments</h2>
        <p className="card-description">Set up payment preferences and billing options.</p>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="currency">Default Currency</label>
            <select id="currency" value={defaultCurrency} onChange={(e) => setDefaultCurrency(e.target.value)} className="select-field">
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="late-fee">Late Fee Amount</label>
            <input id="late-fee" type="text" value={lateFee} onChange={(e) => setLateFee(e.target.value)} placeholder="0" className="input-field" />
          </div>
        </div>

        <div className="form-group">
          <label>Payment Methods</label>
          <div className="checkbox-group">
            {["cash", "card", "mobile"].map(method => (
              <div key={method} className="checkbox-item">
                <input 
                  id={`pm-${method}`}
                  type="checkbox" 
                  checked={paymentMethods.includes(method)}
                  onChange={() => togglePaymentMethod(method)}
                  className="checkbox-input"
                />
                <label htmlFor={`pm-${method}`} className="checkbox-label">
                  {method === "cash" ? "Cash" : method === "card" ? "Card" : "Mobile Payment"}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <div className="toggle-group">
            <label htmlFor="receipts">Auto-Generate Receipts</label>
            <input id="receipts" type="checkbox" checked={autoReceipts} onChange={() => setAutoReceipts(!autoReceipts)} className="toggle-input" />
          </div>
        </div>
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

        .input-field,
        .select-field {
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--foreground);
          font-size: 0.9375rem;
          transition: all 0.2s;
        }

        .input-field:focus,
        .select-field:focus {
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

        .checkbox-group {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border);
          border-radius: 8px;
        }

        .checkbox-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
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
      `}</style>
    </>
  );
}