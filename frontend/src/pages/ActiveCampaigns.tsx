import { Link } from "react-router-dom";
import { api, getUploadUrl, type Campaign } from "@/lib/api";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

const ActiveCampaigns = () => {
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
        toast({ title: "Error", description: e?.message || "Failed to load campaigns", variant: "destructive" });
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [toast]);

  return (
    <DashboardLayout>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">My Campaigns</h1>
          <p className="page-subtitle">All your campaigns in one place</p>
        </div>
        <Link to="/creator/create"><Button>Create New</Button></Link>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Campaign</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Raised</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Goal</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Progress</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td className="px-4 py-3 text-muted-foreground" colSpan={6}>Loading...</td>
              </tr>
            ) : campaigns.length === 0 ? (
              <tr>
                <td className="px-4 py-3 text-muted-foreground" colSpan={6}>No campaigns yet.</td>
              </tr>
            ) : (
              campaigns.map((c) => {
                const pct = Math.round((c.currentAmount / c.targetAmount) * 100);
                const img = getUploadUrl(c.image);
                return (
                  <tr key={c._id} className="hover:bg-secondary/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {img ? (
                          <img src={img} alt={c.title} className="h-10 w-14 rounded-md object-cover" />
                        ) : (
                          <div className="h-10 w-14 rounded-md bg-secondary" />
                        )}
                        <span className="font-medium text-foreground line-clamp-1">{c.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        c.status === "approved" ? "bg-success/10 text-success" : c.status === "pending" ? "bg-warning/10 text-warning" : "bg-info/10 text-info"
                      }`}>{c.status}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">₹{c.currentAmount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-muted-foreground">₹{c.targetAmount.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 rounded-full bg-secondary">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{pct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/creator/edit/${c._id}`}><Button variant="outline" size="sm">Edit</Button></Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};

export default ActiveCampaigns;
