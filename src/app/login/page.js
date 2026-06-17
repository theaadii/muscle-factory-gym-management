"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Lock, User } from "lucide-react";

export default function LoginPage() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { isAuthenticated, login } = useAuth();

  const quotes = [
    "Transform Your Body, Transform Your Life",
    "Every Rep Counts - Every Day Matters",
    "Strength Starts Here",
    "Your Fitness Journey Begins Now",
    "Push Your Limits, Achieve Your Dreams",
  ];

  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    if (!userId.trim()) {
      setError("Please enter your User ID");
      return;
    }

    if (!password) {
      setError("Please enter your password");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (login(userId, password)) {
      router.push("/");
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <div style={{ styles: "login-container" }}>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }

        .login-container {
          width: 100%;
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          padding: 2rem;
        }

        .login-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          width: 100%;
          max-width: 420px;
          padding: 3rem;
          animation: slideUp 0.5s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .logo-circle {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          box-shadow: 0 4px 15px rgba(249, 115, 22, 0.4);
        }

        .logo-circle svg {
          width: 32px;
          height: 32px;
          color: white;
        }

        h1 {
          font-size: 28px;
          font-weight: 700;
          color: #09090b;
          margin-bottom: 0.5rem;
        }

        .subtitle {
          color: #71717a;
          font-size: 14px;
          font-weight: 500;
          line-height: 1.6;
          min-height: 2.4em;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #09090b;
          margin-bottom: 0.5rem;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-wrapper svg {
          position: absolute;
          left: 12px;
          width: 18px;
          height: 18px;
          color: #a1a1aa;
          pointer-events: none;
        }

        input {
          width: 100%;
          padding: 12px 12px 12px 40px;
          border: 2px solid #e4e4e7;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #09090b;
          background: #f9f9fb;
          transition: all 0.2s;
        }

        input:focus {
          outline: none;
          border-color: #f97316;
          background: white;
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
        }

        input::placeholder {
          color: #a1a1aa;
        }

        .password-toggle {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          color: #a1a1aa;
        }

        .password-toggle:hover {
          color: #f97316;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #ef4444;
          font-size: 13px;
          font-weight: 500;
          margin-top: 0.75rem;
          padding: 0.75rem;
          background: rgba(239, 68, 68, 0.05);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 6px;
        }

        .login-btn {
          width: 100%;
          padding: 12px 1.5rem;
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 4px 15px rgba(249, 115, 22, 0.4);
          margin-top: 1rem;
        }

        .login-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(249, 115, 22, 0.5);
        }

        .login-btn:active {
          transform: translateY(0);
        }

        .demo-info {
          margin-top: 1.5rem;
          padding: 1rem;
          background: #f5f5f5;
          border-radius: 8px;
          font-size: 13px;
          color: #71717a;
          text-align: center;
          line-height: 1.6;
        }

        .demo-info strong {
          color: #09090b;
          display: block;
          margin-bottom: 0.5rem;
        }

        @media (max-width: 480px) {
          .login-card {
            padding: 2rem;
          }

          h1 {
            font-size: 24px;
          }

          .logo-circle {
            width: 50px;
            height: 50px;
          }

          .logo-circle svg {
            width: 28px;
            height: 28px;
          }
        }
      `}</style>

      <div className="login-card">
        <div className="login-header">
          <div className="logo-circle">
            <Lock size={32} />
          </div>
          <h1>Muscle Factory</h1>
          <p className="subtitle">{randomQuote}</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="userId">User ID</label>
            <div className="input-wrapper">
              <User size={18} />
              <input
                id="userId"
                type="text"
                placeholder="Enter your user ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock size={18} />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {error && <div className="error-message">✕ {error}</div>}

          <button type="submit" className="login-btn">
            Sign In
          </button>
        </form>

        <div className="demo-info">
          <strong>Demo Login:</strong>
          ID: admin<br />
          Password: password123
        </div>
      </div>
    </div>
  );
}
