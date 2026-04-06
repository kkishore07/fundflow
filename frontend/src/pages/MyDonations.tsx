import { useEffect, useState } from "react";
import { api, type Donation } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";

const MyDonations = () => {
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
        toast({ title: "Error", description: e?.message || "Failed to load donations", variant: "destructive" });
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [toast]);

  const handleRefund = async (id: string) => {
    try {
      await api.requestRefund(id);
      setDonations((prev) => prev.map((d) => (d._id === id ? { ...d, refundRequested: true } : d)));
      toast({ title: "Refund requested", description: "Your refund request was submitted." });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to request refund";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">My Donations</h1>
        <p className="page-subtitle">Track all your donations and request refunds</p>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Campaign</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Amount</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Payment</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td className="px-4 py-3 text-muted-foreground" colSpan={6}>Loading...</td>
              </tr>
            ) : donations.length === 0 ? (
              <tr>
                <td className="px-4 py-3 text-muted-foreground" colSpan={6}>No donations yet.</td>
              </tr>
            ) : (
              donations.map((d) => (
                <tr key={d._id} className="hover:bg-secondary/50 transition-colors">
                  <td className="px-4 py-3 text-foreground">{d.campaignTitle}</td>
                  <td className="px-4 py-3 font-medium text-foreground">₹{d.amount}</td>
                  <td className="px-4 py-3 text-muted-foreground capitalize">{d.paymentMethod.replace("_", " ")}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(d.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      d.status === "completed" ? "bg-success/10 text-success" : d.status === "refunded" ? "bg-info/10 text-info" : "bg-warning/10 text-warning"
                    }`}>
                      {d.refundRequested && d.status !== "refunded" ? "Refund Pending" : d.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {d.status === "completed" && !d.refundRequested && (
                      <Button variant="outline" size="sm" onClick={() => handleRefund(d._id)}>
                        Request Refund
                      </Button>
                    )}
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

export default MyDonations;
