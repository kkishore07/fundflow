import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, getUploadUrl, type Campaign } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";

const Donate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!id) return;
    setLoading(true);
    api
      .getCampaign(id)
      .then((c) => {
        if (cancelled) return;
        setCampaign(c);
      })
      .catch((e) => {
        if (cancelled) return;
        toast({ title: "Error", description: e?.message || "Failed to load campaign", variant: "destructive" });
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, toast]);

  const pct = campaign ? Math.round((campaign.currentAmount / campaign.targetAmount) * 100) : 0;

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (!id) throw new Error("Missing campaign id");
      const result = await api.createDonation({ campaignId: id, amount: Number(amount), paymentMethod });
      if (result.warning) {
        toast({ title: "Donation submitted", description: result.warning, variant: "destructive" });
      } else {
        toast({ title: "Thank you!", description: `Your ₹${amount} donation has been processed.` });
      }
      navigate("/my-donations");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Donation failed";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      {loading ? (
        <div className="text-sm text-muted-foreground">Loading campaign...</div>
      ) : !campaign ? (
        <div className="text-sm text-muted-foreground">Campaign not found.</div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <div className="rounded-xl overflow-hidden border border-border mb-4">
              {getUploadUrl(campaign.image) ? (
                <img src={getUploadUrl(campaign.image)!} alt={campaign.title} className="w-full aspect-video object-cover" />
              ) : (
                <div className="w-full aspect-video bg-secondary" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">{campaign.title}</h1>
            <p className="text-muted-foreground mb-4">{campaign.description}</p>
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-foreground">₹{campaign.currentAmount.toLocaleString()} raised</span>
                <span className="text-muted-foreground">{pct}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-secondary">
                <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(pct, 100)}%` }} />
              </div>
              <p className="mt-1.5 text-sm text-muted-foreground">Goal: ₹{campaign.targetAmount.toLocaleString()}</p>
            </div>
            {campaign.totalRatings > 0 && (
              <div className="flex items-center gap-2 mt-3">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`h-4 w-4 ${s <= Math.round(campaign.averageRating) ? "text-warning fill-current" : "text-muted"}`} />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">({campaign.totalRatings} ratings)</span>
              </div>
            )}
          </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm h-fit">
          <h2 className="text-lg font-semibold text-foreground mb-4">Make a Donation</h2>
          <form onSubmit={handleDonate} className="space-y-4">
            <div>
              <Label>Quick Amounts</Label>
              <div className="grid grid-cols-4 gap-2 mt-1.5">
                {[25, 50, 100, 250].map((a) => (
                  <Button key={a} type="button" variant={amount === String(a) ? "default" : "outline"} size="sm" onClick={() => setAmount(String(a))}>
                    ₹{a}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="amount">Custom Amount</Label>
              <Input id="amount" type="number" min="1" placeholder="Enter amount" className="mt-1.5" value={amount} onChange={(e) => setAmount(e.target.value)} required />
            </div>
            <div>
              <Label>Payment Method</Label>
              <div className="grid grid-cols-3 gap-2 mt-1.5">
                {[{ value: "credit_card", label: "Card" }, { value: "paypal", label: "PayPal" }, { value: "bank_transfer", label: "Bank" }].map((m) => (
                  <Button key={m.value} type="button" variant={paymentMethod === m.value ? "default" : "outline"} size="sm" onClick={() => setPaymentMethod(m.value)}>
                    {m.label}
                  </Button>
                ))}
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || !amount}>
              {isLoading ? "Processing..." : `Donate ₹${amount || "0"}`}
            </Button>
          </form>
        </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Donate;
