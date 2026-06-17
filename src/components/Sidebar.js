"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  CalendarCheck, 
  BarChart3, 
  Settings, 
  Dumbbell,
  LogOut
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Members", href: "/members", icon: Users },
  { name: "Attendance", href: "/attendance", icon: CalendarCheck },
  { name: "Payments", href: "/payments", icon: CreditCard },
  { name: "Plans", href: "/plans", icon: Dumbbell },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out?")) {
      logout();
      router.push("/login");
    }
  };

  return (
    <aside className="sidebar" suppressHydrationWarning={true}>
      <div className="sidebar-header" suppressHydrationWarning={true}>
        <div className="sidebar-logo" suppressHydrationWarning={true}>
          <Image 
            src="/logo.png" 
            alt="Muscle Factory Logo" 
            width={180} 
            height={180} 
            priority
            className="brand-logo"
            style={{ objectFit: 'contain' }}
          />
        </div>
      </div>

      <nav className="sidebar-nav" suppressHydrationWarning={true}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer" suppressHydrationWarning={true}>
        <button 
          onClick={handleLogout}
          className="sidebar-nav-item sidebar-logout-btn"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
