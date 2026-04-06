import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, getUploadUrl, type Campaign } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";

const EditCampaign = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    targetAmount: "",
    endDate: "",
  });

  useEffect(() => {
    let cancelled = false;
    if (!id) return;
    setLoading(true);
    api
      .getCampaign(id)
      .then((c) => {
        if (cancelled) return;
        setCampaign(c);
        setForm({
          title: c.title,
          description: c.description,
          targetAmount: String(c.targetAmount),
          endDate: c.endDate ? new Date(c.endDate).toISOString().slice(0, 10) : "",
        });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (!id) throw new Error("Missing campaign id");
      await api.updateCampaign(id, {
        title: form.title,
        description: form.description,
        targetAmount: Number(form.targetAmount),
        endDate: form.endDate,
        image,
      });
      toast({ title: "Campaign updated!", description: "Your changes have been saved." });
      navigate("/creator/campaigns");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to update campaign";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Edit Campaign</h1>
        <p className="page-subtitle">Update your campaign details</p>
      </div>

      <div className="max-w-2xl">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : !campaign ? (
            <div className="text-sm text-muted-foreground">Campaign not found.</div>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Campaign Title</Label>
              <Input id="title" className="mt-1.5" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="desc">Description</Label>
              <Textarea id="desc" className="mt-1.5" rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="target">Fundraising Goal ($)</Label>
              <Input id="target" type="number" min="1" className="mt-1.5" value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input id="endDate" type="date" className="mt-1.5" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="image">Replace Image (optional)</Label>
              {getUploadUrl(campaign.image) && (
                <div className="mt-2 rounded-lg overflow-hidden border border-border">
                  <img src={getUploadUrl(campaign.image)!} alt={campaign.title} className="w-full aspect-video object-cover" />
                </div>
              )}
              <Input id="image" type="file" className="mt-1.5" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : "Save Changes"}</Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
            </div>
          </form>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EditCampaign;
