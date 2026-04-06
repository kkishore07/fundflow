import { useEffect, useState } from "react";
import { api, getUploadUrl, type Campaign } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";
import { CheckCircle, XCircle } from "lucide-react";

const CampaignApproval = () => {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .getCampaigns({ status: "pending" })
      .then((data) => {
        if (cancelled) return;
        setCampaigns(data);
      })
      .catch((e) => {
        if (cancelled) return;
        toast({ title: "Error", description: e?.message || "Failed to load pending campaigns", variant: "destructive" });
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [toast]);

  const handleApprove = async (id: string) => {
    try {
      await api.approveCampaign(id);
      setCampaigns((prev) => prev.filter((c) => c._id !== id));
      toast({ title: "Campaign approved", description: "The campaign is now live." });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to approve campaign";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.rejectCampaign(id);
      setCampaigns((prev) => prev.filter((c) => c._id !== id));
      toast({ title: "Campaign rejected", description: "The campaign has been rejected." });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to reject campaign";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const pending = campaigns;

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Campaign Approvals</h1>
        <p className="page-subtitle">{pending.length} campaigns awaiting review</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : pending.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <CheckCircle className="mx-auto h-12 w-12 mb-3 text-success" />
          <p>All caught up! No pending campaigns.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pending.map((c) => (
            <div key={c._id} className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="flex gap-6">
                {getUploadUrl(c.image) ? (
                  <img src={getUploadUrl(c.image)!} alt={c.title} className="h-32 w-48 rounded-lg object-cover" />
                ) : (
                  <div className="h-32 w-48 rounded-lg bg-secondary" />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">{c.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{c.description}</p>
                  <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                    <span>by {c.creatorName || "Creator"}</span>
                    <span>Goal: ₹{c.targetAmount.toLocaleString()}</span>
                    <span>Created: {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ""}</span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" onClick={() => handleApprove(c._id)} className="gap-1">
                      <CheckCircle className="h-4 w-4" /> Approve
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleReject(c._id)} className="gap-1">
                      <XCircle className="h-4 w-4" /> Reject
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default CampaignApproval;
