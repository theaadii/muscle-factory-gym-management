"use client";

import { useState } from "react";
import { Settings, Shield, Bell, User, Building, MapPin, Phone, Mail, Globe, Save, Database, Download, Upload, Trash2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { getStoredMembers, saveMembers, getStoredAttendance, saveAttendance, getStoredPayments, savePayments, clearAllData } from "@/lib/localStorage";
import GeneralSettings from "@/components/GeneralSettings";
import OperationsSettings from "@/components/OperationsSettings";
import DataManagementSettings from "@/components/DataManagementSettings";
import AccessSettings from "@/components/AccessSettings";
import SecuritySettings from "@/components/SecuritySettings";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="settings-page">
      <header className="page-header">
        <div className="header-text">
          <h1>Settings</h1>
          <p>Manage your gym settings and preferences.</p>
        </div>
      </header>

      <section className="settings-container">
        <aside className="settings-sidebar">
          <nav>
            <button 
              className={`settings-nav-item ${activeTab === 'general' ? 'active' : ''}`}
              onClick={() => setActiveTab('general')}
            >
              General
            </button>
            <button 
              className={`settings-nav-item ${activeTab === 'operations' ? 'active' : ''}`}
              onClick={() => setActiveTab('operations')}
            >
              Operations
            </button>
            <button 
              className={`settings-nav-item ${activeTab === 'data' ? 'active' : ''}`}
              onClick={() => setActiveTab('data')}
            >
              Data Management
            </button>
            <button 
              className={`settings-nav-item ${activeTab === 'access' ? 'active' : ''}`}
              onClick={() => setActiveTab('access')}
            >
              Access
            </button>
            <button 
              className={`settings-nav-item ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              Security
            </button>
          </nav>
        </aside>

        <main className="settings-content">
          {activeTab === "general" && <GeneralSettings />}
          {activeTab === "operations" && <OperationsSettings />}
          {activeTab === "data" && <DataManagementSettings />}
          {activeTab === "access" && <AccessSettings />}
          {activeTab === "security" && <SecuritySettings />}
        </main>
      </section>

      <style jsx>{`
        .settings-page {
          max-width: 1200px;
          margin: 0 auto;
          animation: fadeIn 0.4s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--border);
        }

        .header-text h1 {
          font-size: 2.25rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--foreground);
        }

        .header-text p {
          color: var(--muted-foreground);
          margin-top: 0.5rem;
          font-size: 1rem;
        }

        .settings-container {
          display: flex;
          gap: 3rem;
        }

        .settings-sidebar {
          width: 240px;
          flex-shrink: 0;
        }

        .settings-sidebar nav {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          position: sticky;
          top: 2rem;
        }

        .settings-nav-item {
          display: flex;
          align-items: center;
          padding: 0.875rem 1.25rem;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--muted-foreground);
          background: transparent;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          width: 100%;
          text-align: left;
        }

        .settings-nav-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--foreground);
        }

        .settings-nav-item.active {
          background: rgba(249, 115, 22, 0.1);
          color: var(--primary);
          border-color: rgba(249, 115, 22, 0.2);
        }

        .settings-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        @media (max-width: 900px) {
          .settings-container {
            flex-direction: column;
          }
          .settings-sidebar {
            width: 100%;
          }
          .settings-sidebar nav {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            position: static;
          }
        }
      `}</style>
    </div>
  );
}
