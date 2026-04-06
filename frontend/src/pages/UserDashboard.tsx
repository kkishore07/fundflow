import DashboardLayout from "@/components/DashboardLayout";
import { useGlobal } from "@/context/GlobalContext";
import { api, type Donation } from "@/lib/api";
import { Heart, TrendingUp, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";

const UserDashboard = () => {
  const { user } = useGlobal();
  const { toast } = useToast();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .getMyDonations()
      .then((data) => {
        if (cancelled) return;
        setDonations(data);
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

  const totalDonated = useMemo(() => donations.reduce((s, d) => s + d.amount, 0), [donations]);
  const campaignsSupported = useMemo(() => new Set(donations.map((d) => d.campaignId)).size, [donations]);

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Welcome back, {user?.name}</h1>
        <p className="page-subtitle">Here's a summary of your activity</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        {[
          { icon: DollarSign, label: "Total Donated", value: `₹${totalDonated.toLocaleString()}` },
          { icon: Heart, label: "Donations Made", value: donations.length.toString() },
          { icon: TrendingUp, label: "Campaigns Supported", value: campaignsSupported.toString() },
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

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">Recent Donations</h2>
        <Link to="/my-donations"><Button variant="outline" size="sm">View All</Button></Link>
      </div>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Campaign</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Amount</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td className="px-4 py-3 text-muted-foreground" colSpan={4}>Loading...</td>
              </tr>
            ) : donations.length === 0 ? (
              <tr>
                <td className="px-4 py-3 text-muted-foreground" colSpan={4}>No donations yet.</td>
              </tr>
            ) : (
              donations.slice(0, 5).map((d) => (
                <tr key={d._id} className="hover:bg-secondary/50 transition-colors">
                  <td className="px-4 py-3 text-foreground">{d.campaignTitle}</td>
                  <td className="px-4 py-3 font-medium text-foreground">₹{d.amount}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(d.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      d.status === "completed" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                    }`}>
                      {d.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;
