"use client";

import { Check, Plus, Edit2, Trash2 } from "lucide-react";

const ACTUAL_PLANS = [
  {
    id: "p1",
    name: "Premium Starter",
    price: 999,
    duration: "1 Month",
    features: ["Full Gym Access", "Cardio Zone", "Beginner Orientation", "Body Check-In"],
    color: "#f97316",
  },
  {
    id: "p2",
    name: "Premium Plus",
    price: 2699,
    duration: "3 Months",
    features: ["Full Gym Access", "Cardio Zone", "Locker Access", "Diet Plan", "Free Assessment"],
    color: "#3b82f6",
  },
  {
    id: "p3",
    name: "Premium Pro",
    price: 4999,
    duration: "6 Months",
    features: ["Complete Access", "Personal Locker", "Custom Diet Plan", "2 PT Sessions", "Monthly Progress Review"],
    color: "#8b5cf6",
  },
  {
    id: "p4",
    name: "Premium Elite",
    price: 6999,
    duration: "9 Months",
    features: ["All Pro Benefits", "Priority Support", "Advanced Progress Tracking", "4 PT Sessions", "Recovery Zone Access"],
    color: "#14b8a6",
  },
  {
    id: "p5",
    name: "Premium Ultimate",
    price: 8999,
    duration: "1 Year",
    features: ["All Elite Benefits", "Annual Transformation Plan", "Unlimited Group Classes", "8 PT Sessions", "Premium Locker Access"],
    color: "#eab308",
  },
];

export default function PlansPage() {
  return (
    <div className="plans-page">
      <header className="page-header">
        <div className="header-text">
          <h1>Membership Plans</h1>
          <p>Create and manage membership tiers for Muscle Factory.</p>
        </div>
        <button className="btn-primary">
          <Plus size={20} />
          <span>Create New Plan</span>
        </button>
      </header>

      <section className="plans-grid">
        {ACTUAL_PLANS.map((plan) => (
          <div key={plan.id} className="card plan-card" style={{ borderColor: plan.color }}>
            <div className="plan-header">
              <div className="plan-title-group">
                <h2 className="plan-name">{plan.name}</h2>
                <span className="plan-duration">{plan.duration}</span>
              </div>
              <div className="plan-price">
                <span className="currency">₹</span>
                <span className="amount">{plan.price.toLocaleString()}</span>
              </div>
            </div>

            <div className="plan-features">
              <h3>What&apos;s Included:</h3>
              <ul>
                {plan.features.map((feature, index) => (
                  <li key={index}>
                    <Check size={18} className="feature-icon" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="plan-actions">
              <button className="edit-btn">
                <Edit2 size={18} />
                <span>Edit</span>
              </button>
              <button className="delete-btn">
                <Trash2 size={18} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </section>

      <style jsx>{`
        .plans-page {
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 2rem;
        }

        .header-text h1 {
          font-size: 2rem;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .header-text p {
          color: var(--muted-foreground);
          margin-top: 0.25rem;
        }

        .plans-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 2rem;
        }

        .plan-card {
          display: flex;
          flex-direction: column;
          padding: 2rem;
          border-width: 2px;
          height: 100%;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .plan-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.4);
        }

        .plan-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
        }

        .plan-name {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--foreground);
        }

        .plan-duration {
          font-size: 0.875rem;
          color: var(--muted-foreground);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .plan-price {
          text-align: right;
        }

        .currency {
          font-size: 1rem;
          font-weight: 600;
          color: var(--muted-foreground);
          vertical-align: super;
          margin-right: 2px;
        }

        .amount {
          font-size: 2rem;
          font-weight: 800;
          color: var(--primary);
        }

        .plan-features {
          flex: 1;
          margin-bottom: 2rem;
        }

        .plan-features h3 {
          font-size: 0.875rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--muted-foreground);
          margin-bottom: 1rem;
          letter-spacing: 0.05em;
        }

        .plan-features ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .plan-features li {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.9375rem;
          color: var(--foreground);
        }

        .feature-icon {
          color: #4ade80;
        }

        .plan-actions {
          display: flex;
          gap: 1rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border);
        }

        .plan-actions button {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.625rem;
          border-radius: var(--radius);
          font-size: 0.875rem;
          font-weight: 600;
          transition: all 0.2s;
        }

        .edit-btn {
          background: var(--secondary);
          color: var(--foreground);
        }

        .edit-btn:hover {
          background: #3f3f46;
        }

        .delete-btn {
          background: rgba(239, 68, 68, 0.1);
          color: #f87171;
        }

        .delete-btn:hover {
          background: rgba(239, 68, 68, 0.2);
        }



        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
           .plans-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
