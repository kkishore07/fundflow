import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, getUploadUrl, type Campaign, type CampaignStatus } from "@/lib/api";
import { Search, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";

const CampaignsList = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | CampaignStatus>("all");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .getCampaigns()
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

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return campaigns.filter((c) => {
      const matchesSearch = !s || c.title.toLowerCase().includes(s);
      const matchesFilter = filter === "all" || c.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [campaigns, filter, search]);

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Browse Campaigns</h1>
        <p className="page-subtitle">Discover and support causes that matter to you</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search campaigns..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {(["all", "approved", "pending", "rejected"] as const).map((f) => (
            <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)} className="capitalize">
              {f}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading campaigns...</div>
        ) : filtered.length === 0 ? (
          <div className="text-sm text-muted-foreground">No campaigns found.</div>
        ) : (
        filtered.map((c) => {
          const pct = Math.round((c.currentAmount / c.targetAmount) * 100);
          const avgRating = c.totalRatings ? c.averageRating.toFixed(1) : "N/A";
          const isTargetReached = c.currentAmount >= c.targetAmount;
          const img = getUploadUrl(c.image);
          return (
            <div key={c._id} className="group rounded-xl border border-border bg-card overflow-hidden shadow-sm transition-shadow hover:shadow-md">
              <div className="aspect-video overflow-hidden relative">
                {img ? (
                  <img src={img} alt={c.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                ) : (
                  <div className="h-full w-full bg-secondary" />
                )}
                <span className={`absolute top-3 right-3 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  c.status === "approved" ? "bg-success/90 text-success-foreground" : c.status === "pending" ? "bg-warning/90 text-warning-foreground" : "bg-info/90 text-info-foreground"
                }`}>
                  {isTargetReached ? "goal reached" : c.status}
                </span>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-foreground line-clamp-1">{c.title}</h3>
                  {avgRating !== "N/A" && (
                    <span className="flex items-center gap-1 text-sm text-warning">
                      <Star className="h-3.5 w-3.5 fill-current" /> {avgRating}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{c.description}</p>
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-foreground">₹{c.currentAmount.toLocaleString()}</span>
                    <span className="text-muted-foreground">{pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">of ₹{c.targetAmount.toLocaleString()} goal</p>
                </div>
                <Link to={`/campaigns/${c._id}`}>
                  <Button className="w-full" size="sm" disabled={c.status !== "approved" || isTargetReached}>
                    {isTargetReached ? "Goal Reached" : c.status === "approved" ? "Donate Now" : c.status === "pending" ? "Pending" : "Rejected"}
                  </Button>
                </Link>
              </div>
            </div>
          );
        }))}
      </div>
    </DashboardLayout>
  );
};

export default CampaignsList;
