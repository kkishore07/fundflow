import DashboardLayout from "@/components/DashboardLayout";
import { useGlobal } from "@/context/GlobalContext";
import { api, getUploadUrl, type Campaign } from "@/lib/api";
import { DollarSign, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";

const CreatorDashboard = () => {
  const { user } = useGlobal();
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .getMyCampaigns()
      .then((data) => {
        if (cancelled) return;
        setCampaigns(data);
      })
      .catch((e) => {
        if (cancelled) return;
        toast({ title: "Error", description: e?.message || "Failed to load dashboard", variant: "destructive" });
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [toast]);

  const approvedCount = useMemo(() => campaigns.filter((c) => c.status === "approved").length, [campaigns]);
  const pendingCount = useMemo(() => campaigns.filter((c) => c.status === "pending").length, [campaigns]);
  const totalRaised = useMemo(() => campaigns.reduce((s, c) => s + c.currentAmount, 0), [campaigns]);

  return (
    <DashboardLayout>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Creator Dashboard</h1>
          <p className="page-subtitle">Manage your campaigns and track performance</p>
        </div>
        <Link to="/creator/create"><Button>Create Campaign</Button></Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-8">
        {[
          { icon: TrendingUp, label: "Total Campaigns", value: campaigns.length.toString() },
          { icon: CheckCircle, label: "Approved", value: approvedCount.toString() },
          { icon: Clock, label: "Pending", value: pendingCount.toString() },
          { icon: DollarSign, label: "Total Raised", value: `₹${totalRaised.toLocaleString()}` },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2.5"><s.icon className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-semibold text-foreground mb-4">Your Campaigns</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : campaigns.length === 0 ? (
          <div className="text-sm text-muted-foreground">No campaigns yet.</div>
        ) : (
          campaigns.slice(0, 4).map((c) => {
            const pct = Math.round((c.currentAmount / c.targetAmount) * 100);
            const img = getUploadUrl(c.image);
            return (
              <div key={c._id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="flex gap-4">
                  {img ? (
                    <img src={img} alt={c.title} className="h-20 w-28 rounded-lg object-cover" />
                  ) : (
                    <div className="h-20 w-28 rounded-lg bg-secondary" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground line-clamp-1">{c.title}</h3>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        c.status === "approved" ? "bg-success/10 text-success" : c.status === "pending" ? "bg-warning/10 text-warning" : "bg-info/10 text-info"
                      }`}>{c.status}</span>
                    </div>
                    <div className="mt-2">
                      <div className="h-1.5 rounded-full bg-secondary">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(pct, 100)}%` }} />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">₹{c.currentAmount.toLocaleString()} / ₹{c.targetAmount.toLocaleString()} ({pct}%)</p>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <Link to={`/creator/edit/${c._id}`}><Button variant="outline" size="sm">Edit</Button></Link>
                      <Link to="/creator/analytics"><Button variant="ghost" size="sm">Analytics</Button></Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </DashboardLayout>
  );
};

export default CreatorDashboard;
