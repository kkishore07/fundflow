import { Link } from "react-router-dom";
import { useGlobal } from "@/context/GlobalContext";
import { Shield, ArrowRight, Heart, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api, getUploadUrl, type Campaign } from "@/lib/api";
import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { isLoggedIn, user } = useGlobal();
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    let cancelled = false;
    api
      .getCampaigns({ status: "approved" })
      .then((data) => {
        if (cancelled) return;
        setCampaigns(data);
      })
      .catch((e) => {
        if (cancelled) return;
        toast({ title: "Error", description: e?.message || "Failed to load campaigns", variant: "destructive" });
      });
    return () => {
      cancelled = true;
    };
  }, [toast]);

  const totalRaised = useMemo(() => campaigns.reduce((s, c) => s + c.currentAmount, 0), [campaigns]);
  const activeCampaigns = campaigns;

  const getDashboardLink = () => {
    if (!user) return "/login";
    if (user.role === "admin") return "/admin/dashboard";
    if (user.role === "creator") return "/creator/dashboard";
    return "/dashboard";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between py-4">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold text-foreground">FundFlow</span>
          </Link>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <Link to={getDashboardLink()}>
                  <Button variant="ghost" size="sm">Dashboard</Button>
                </Link>
                <Link to="/campaigns">
                  <Button variant="outline" size="sm">Browse Campaigns</Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/login"><Button variant="ghost" size="sm">Sign In</Button></Link>
                <Link to="/register"><Button size="sm">Get Started</Button></Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="mx-auto max-w-3xl animate-fade-in">
          <h1 className="text-5xl font-bold tracking-tight text-foreground md:text-6xl">
            Fund Ideas That <span className="text-primary">Matter</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
            A trusted platform connecting creators with donors. Launch campaigns, make donations, and track impact — all in one place.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link to={isLoggedIn ? "/campaigns" : "/register"}>
              <Button size="lg" className="gap-2">
                {isLoggedIn ? "Browse Campaigns" : "Start Fundraising"} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-secondary/50 py-16">
        <div className="container mx-auto grid grid-cols-1 gap-8 px-4 md:grid-cols-3">
          {[
            { icon: Heart, label: "Total Raised", value: `₹${totalRaised.toLocaleString()}` },
            { icon: TrendingUp, label: "Active Campaigns", value: activeCampaigns.length.toString() },
            { icon: Users, label: "Community Members", value: "1,200+" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <stat.icon className="mx-auto mb-3 h-8 w-8 text-primary" />
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured campaigns */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-foreground text-center mb-10">Featured Campaigns</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {activeCampaigns.slice(0, 3).map((c) => {
            const pct = Math.round((c.currentAmount / c.targetAmount) * 100);
            const img = getUploadUrl(c.image);
            return (
              <Link to={`/campaigns/${c._id}`} key={c._id} className="group rounded-xl border border-border bg-card overflow-hidden shadow-sm transition-shadow hover:shadow-md">
                <div className="aspect-video overflow-hidden">
                  {img ? (
                    <img src={img} alt={c.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  ) : (
                    <div className="h-full w-full bg-secondary" />
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-foreground line-clamp-1">{c.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{c.description}</p>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-foreground">₹{c.currentAmount.toLocaleString()}</span>
                      <span className="text-muted-foreground">{pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground">of ₹{c.targetAmount.toLocaleString()} goal</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center">
        <p className="text-sm text-muted-foreground">© 2024 FundFlow. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;
