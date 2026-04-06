import { useEffect, useState } from "react";
import { api, type Campaign } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { useToast } from "@/hooks/use-toast";

const Analytics = () => {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");
  const [summary, setSummary] = useState<{ totalDonations: number; totalAmount: number; averageDonation: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.getMyCampaigns(), api.getCreatorAnalytics()])
      .then(([camps, analytics]) => {
        if (cancelled) return;
        setCampaigns(camps);
        if (camps.length && !selectedCampaign) setSelectedCampaign(camps[0]._id);
        const avgDonation = analytics.totalDonations ? analytics.totalRaised / analytics.totalDonations : 0;
        setSummary({ totalDonations: analytics.totalDonations, totalAmount: analytics.totalRaised, averageDonation: avgDonation });
      })
      .catch((e) => {
        if (cancelled) return;
        toast({ title: "Error", description: e?.message || "Failed to load analytics", variant: "destructive" });
      });
    return () => {
      cancelled = true;
    };
  }, [selectedCampaign, toast]);
  const analyticsData = {
    totalDonations: 45,
    totalAmount: 12500,
    averageDonation: 277.78,
    donationsByDay: [
      { date: "Jan 1", amount: 500 },
      { date: "Jan 2", amount: 1200 },
      { date: "Jan 3", amount: 800 },
      { date: "Jan 4", amount: 2000 },
      { date: "Jan 5", amount: 1500 },
      { date: "Jan 6", amount: 3000 },
      { date: "Jan 7", amount: 3500 },
    ],
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Campaign Analytics</h1>
        <p className="page-subtitle">Track your campaign performance over time</p>
      </div>

      <div className="mb-6">
        <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
          <SelectTrigger className="w-80">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {campaigns.map((c) => (
              <SelectItem key={c._id} value={c._id}>{c.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        {[
          { label: "Total Donations", value: (summary?.totalDonations ?? analyticsData.totalDonations).toString() },
          { label: "Total Amount", value: `₹${(summary?.totalAmount ?? analyticsData.totalAmount).toLocaleString()}` },
          { label: "Average Donation", value: `₹${(summary?.averageDonation ?? analyticsData.averageDonation).toFixed(2)}` },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">Donations Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.donationsByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
              <Line type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">Daily Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.donationsByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
              <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
