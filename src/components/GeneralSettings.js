import { useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon } from "lucide-react";

export default function GeneralSettings() {
  const { theme, toggleTheme } = useTheme();
  const [language, setLanguage] = useState("en");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");

  return (
    <>
      <div className="settings-card">
        <h2 className="card-title">Gym Information</h2>
        <p className="card-description">Update your gym's basic information.</p>

        <div className="form-group">
          <label htmlFor="gym-name">Gym Name</label>
          <input id="gym-name" type="text" defaultValue="Muscle Factory Fitness Center" className="input-field" />
        </div>

        <div className="form-group">
          <label htmlFor="logo-upload">Logo Upload</label>
          <input id="logo-upload" type="file" accept="image/*" className="input-field" />
        </div>

        <div className="form-group">
          <label htmlFor="address">Address</label>
          <textarea id="address" rows={3} defaultValue="123 Strength Lane, Fitness Nagar, Mumbai - 400001" className="input-field" />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input id="phone" type="tel" defaultValue="+91 98765 43210" className="input-field" />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" defaultValue="admin@musclefactory.com" className="input-field" />
          </div>
          <div className="form-group">
            <label htmlFor="whatsapp">WhatsApp</label>
            <input id="whatsapp" type="tel" placeholder="Enter WhatsApp number" className="input-field" />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="hours">Opening Hours</label>
          <input id="hours" type="text" defaultValue="6:00 AM - 10:00 PM" className="input-field" />
        </div>
      </div>

      <div className="settings-card">
        <h2 className="card-title">Preferences</h2>
        <p className="card-description">Customize your app experience.</p>

        <div className="form-group">
          <div className="toggle-group">
            <div className="theme-label">
              <span>{theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}</span>
              <span>Theme: {theme === "dark" ? "Dark Mode" : "Light Mode"}</span>
            </div>
            <button 
              onClick={toggleTheme} 
              className="theme-toggle-btn"
              title="Toggle theme"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="lang">Language</label>
            <select id="lang" value={language} onChange={(e) => setLanguage(e.target.value)} className="select-field">
              <option value="en">English</option>
              <option value="hi">Hindi</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="date-fmt">Date Format</label>
            <select id="date-fmt" value={dateFormat} onChange={(e) => setDateFormat(e.target.value)} className="select-field">
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            </select>
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
          background: var(--card);
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
          background: var(--card);
          box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.1);
        }

        textarea.input-field {
          resize: vertical;
          min-height: 80px;
          font-family: inherit;
        }

        .toggle-group {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 8px;
        }

        .theme-label {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 600;
          color: var(--foreground);
        }

        .theme-label svg {
          color: var(--primary);
        }

        .theme-toggle-btn {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .theme-toggle-btn:hover {
          opacity: 0.9;
          transform: scale(1.05);
        }

        .theme-toggle-btn:active {
          transform: scale(0.95);
        }
      `}</style>
    </>
  );
}