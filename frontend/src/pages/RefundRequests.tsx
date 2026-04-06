import { useEffect, useState } from "react";
import { api, type Donation } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";
import { CheckCircle, XCircle } from "lucide-react";

const RefundRequests = () => {
  const { toast } = useToast();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .getPendingRefunds()
      .then((data) => {
        if (cancelled) return;
        setDonations(data);
      })
      .catch((e) => {
        if (cancelled) return;
        toast({ title: "Error", description: e?.message || "Failed to load refund requests", variant: "destructive" });
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
      const updated = await api.processRefund(id, true);
      setDonations((prev) => prev.map((d) => (d._id === id ? { ...d, status: updated.status, refundRequested: true } : d)));
      toast({ title: "Refund approved", description: "The donation has been refunded." });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to process refund";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.processRefund(id, false);
      setDonations((prev) => prev.filter((d) => d._id !== id));
      toast({ title: "Refund rejected", description: "The refund request has been denied." });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to process refund";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Refund Requests</h1>
        <p className="page-subtitle">{donations.length} pending refund requests</p>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Donor</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Campaign</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Amount</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td className="px-4 py-3 text-muted-foreground" colSpan={6}>Loading...</td>
              </tr>
            ) : donations.length === 0 ? (
              <tr>
                <td className="px-4 py-3 text-muted-foreground" colSpan={6}>No pending refund requests.</td>
              </tr>
            ) : (
              donations.map((d) => (
                <tr key={d._id} className="hover:bg-secondary/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{d.userName || ""}</td>
                  <td className="px-4 py-3 text-foreground">{d.campaignTitle}</td>
                  <td className="px-4 py-3 font-medium text-foreground">₹{d.amount}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(d.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-warning/10 text-warning">Pending</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleApprove(d._id)} className="gap-1 h-7 text-xs">
                        <CheckCircle className="h-3 w-3" /> Approve
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleReject(d._id)} className="gap-1 h-7 text-xs text-destructive">
                        <XCircle className="h-3 w-3" /> Reject
                      </Button>
                    </div>
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

export default RefundRequests;
