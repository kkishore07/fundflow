import { api, type Donation } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { AlertTriangle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

const SuspiciousDonations = () => {
  const { toast } = useToast();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .getSuspiciousDonations()
      .then((data) => {
        if (cancelled) return;
        setDonations(data);
      })
      .catch((e) => {
        if (cancelled) return;
        toast({ title: "Error", description: e?.message || "Failed to load suspicious donations", variant: "destructive" });
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
      <div className="page-header">
        <h1 className="page-title">Suspicious Activity</h1>
        <p className="page-subtitle">{donations.length} flagged donations require review</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : donations.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Shield className="mx-auto h-12 w-12 mb-3 text-success" />
          <p>No suspicious activity detected.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {donations.map((d) => (
            <div key={d._id} className="rounded-xl border border-destructive/20 bg-card p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-destructive/10 p-2.5">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">Suspicious Donation: ₹{d.amount.toLocaleString()}</h3>
                    <span className="inline-flex items-center rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive">Flagged</span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <p>Donor: {d.userName || ""}</p>
                    <p>Campaign: {d.campaignTitle}</p>
                    <p>Payment: {d.paymentMethod.replaceAll("_", " ")}</p>
                    <p>Date: {new Date(d.createdAt).toLocaleString()}</p>
                  </div>
                  <p className="mt-2 text-sm text-destructive">⚠ {d.suspiciousReason || "Unusual donation pattern detected"}</p>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="outline" disabled title="No admin action endpoint implemented in backend">Mark as Safe</Button>
                    <Button size="sm" variant="destructive" disabled title="No admin action endpoint implemented in backend">Escalate</Button>
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

export default SuspiciousDonations;
