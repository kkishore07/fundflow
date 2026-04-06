import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";

const CreateCampaign = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", targetAmount: "", endDate: "" });
  const [image, setImage] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.createCampaign({
        title: form.title,
        description: form.description,
        targetAmount: Number(form.targetAmount),
        endDate: form.endDate,
        image,
      });
      toast({ title: "Campaign created!", description: "Your campaign has been submitted for review." });
      navigate("/creator/campaigns");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to create campaign";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Create Campaign</h1>
        <p className="page-subtitle">Launch a new fundraising campaign</p>
      </div>

      <div className="max-w-2xl">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Campaign Title</Label>
              <Input id="title" className="mt-1.5" placeholder="Give your campaign a compelling title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="desc">Description</Label>
              <Textarea id="desc" className="mt-1.5" rows={5} placeholder="Tell people why this campaign matters..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="target">Fundraising Goal ($)</Label>
              <Input id="target" type="number" min="1" className="mt-1.5" placeholder="10000" value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input id="endDate" type="date" className="mt-1.5" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="image">Campaign Image (optional)</Label>
              <Input id="image" type="file" className="mt-1.5" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isLoading}>{isLoading ? "Creating..." : "Create Campaign"}</Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateCampaign;
