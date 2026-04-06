import DashboardLayout from "@/components/DashboardLayout";
import { api, getUploadUrl, type Campaign, type Donation, type User } from "@/lib/api";
import { Users, CheckCircle, AlertTriangle, DollarSign, TrendingUp, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const { toast } = useToast();
  const [pendingCampaigns, setPendingCampaigns] = useState<Campaign[]>([]);
  const [approvedCampaigns, setApprovedCampaigns] = useState<Campaign[]>([]);
  const [suspiciousDonations, setSuspiciousDonations] = useState<Donation[]>([]);
  const [refundRequests, setRefundRequests] = useState<Donation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      api.getCampaigns({ status: "pending" }),
      api.getCampaigns({ status: "approved" }),
      api.getSuspiciousDonations(),
      api.getPendingRefunds(),
      api.getUsers(),
    ])
      .then(([pending, approved, suspicious, refunds, userList]) => {
        if (cancelled) return;
        setPendingCampaigns(pending);
        setApprovedCampaigns(approved);
        setSuspiciousDonations(suspicious);
        setRefundRequests(refunds);
        setUsers(userList);
      })
      .catch((e) => {
        if (cancelled) return;
        toast({ title: "Error", description: e?.message || "Failed to load admin dashboard", variant: "destructive" });
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [toast]);

  const totalRaised = useMemo(
    () => approvedCampaigns.reduce((s, c) => s + c.currentAmount, 0),
    [approvedCampaigns]
  );

  const campaignsCount = approvedCampaigns.length + pendingCampaigns.length;

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Platform overview and management</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6 mb-8">
        {[
          { icon: TrendingUp, label: "Campaigns", value: campaignsCount.toString() },
          { icon: Clock, label: "Pending", value: pendingCampaigns.length.toString(), alert: true },
          { icon: DollarSign, label: "Total Raised", value: `₹${(totalRaised / 1000).toFixed(0)}K` },
          { icon: Users, label: "Users", value: users.length.toString() },
          { icon: AlertTriangle, label: "Suspicious", value: suspiciousDonations.length.toString(), alert: true },
          { icon: CheckCircle, label: "Refunds", value: refundRequests.length.toString() },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <s.icon className={`h-5 w-5 mb-2 ${s.alert ? "text-warning" : "text-primary"}`} />
            <p className="text-2xl font-bold text-foreground">{loading ? "…" : s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Pending Approvals</h2>
            <Link to="/admin/approvals"><Button variant="outline" size="sm">View All</Button></Link>
          </div>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : pendingCampaigns.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending campaigns</p>
          ) : (
            <div className="space-y-3">
              {pendingCampaigns.map((c) => (
                <div key={c._id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  {getUploadUrl(c.image) ? (
                    <img src={getUploadUrl(c.image)!} alt={c.title} className="h-10 w-14 rounded-md object-cover" />
                  ) : (
                    <div className="h-10 w-14 rounded-md bg-secondary" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{c.title}</p>
                    <p className="text-xs text-muted-foreground">by {c.creatorName || "Creator"}</p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-medium text-warning">Pending</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Recent Alerts</h2>
            <Link to="/admin/suspicious"><Button variant="outline" size="sm">View All</Button></Link>
          </div>
          <div className="space-y-3">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : (
              <>
                {suspiciousDonations.slice(0, 4).map((d) => (
                  <div key={d._id} className="flex items-center gap-3 p-3 rounded-lg bg-destructive/5">
                    <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">₹{d.amount} donation flagged</p>
                      <p className="text-xs text-muted-foreground">{d.userName || ""} → {d.campaignTitle}</p>
                    </div>
                  </div>
                ))}
                {refundRequests.slice(0, 4).map((d) => (
                  <div key={d._id} className="flex items-center gap-3 p-3 rounded-lg bg-warning/5">
                    <DollarSign className="h-5 w-5 text-warning shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Refund request: ₹{d.amount}</p>
                      <p className="text-xs text-muted-foreground">{d.userName || ""}</p>
                    </div>
                  </div>
                ))}
                {suspiciousDonations.length === 0 && refundRequests.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No alerts.</p>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
