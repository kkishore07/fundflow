import { Link, useLocation } from "react-router-dom";
import { useGlobal } from "@/context/GlobalContext";
import { LogOut, LayoutDashboard, Heart, PlusCircle, BarChart3, Users, Shield, AlertTriangle, Receipt, CheckCircle, List } from "lucide-react";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useGlobal();
  const location = useLocation();

  const navItems = {
    user: [
      { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { to: "/campaigns", icon: List, label: "Browse Campaigns" },
      { to: "/my-donations", icon: Heart, label: "My Donations" },
    ],
    creator: [
      { to: "/creator/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { to: "/creator/campaigns", icon: List, label: "My Campaigns" },
      { to: "/creator/create", icon: PlusCircle, label: "Create Campaign" },
      { to: "/creator/analytics", icon: BarChart3, label: "Analytics" },
    ],
    admin: [
      { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { to: "/admin/approvals", icon: CheckCircle, label: "Approvals" },
      { to: "/admin/users", icon: Users, label: "Manage Users" },
      { to: "/admin/refunds", icon: Receipt, label: "Refund Requests" },
      { to: "/admin/suspicious", icon: AlertTriangle, label: "Suspicious Activity" },
    ],
  };

  const items = user ? navItems[user.role] || navItems.user : navItems.user;

  return (
    <div className="dashboard-layout flex">
      <aside className="dashboard-sidebar hidden md:flex flex-col justify-between">
        <div>
          <Link to="/" className="flex items-center gap-2 mb-8 px-2">
            <Shield className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold text-foreground">FundFlow</span>
          </Link>
          <nav className="space-y-1">
            {items.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="border-t border-border pt-4">
          <div className="px-3 mb-3">
            <p className="text-sm font-medium text-foreground">{user?.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Log Out
          </button>
        </div>
      </aside>
      <main className="dashboard-content flex-1 overflow-auto">{children}</main>
    </div>
  );
};

export default DashboardLayout;
