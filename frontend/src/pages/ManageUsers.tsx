import { useEffect, useState } from "react";
import { api, type User } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";

const ManageUsers = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .getUsers()
      .then((data) => {
        if (cancelled) return;
        setUsers(data);
      })
      .catch((e) => {
        if (cancelled) return;
        toast({ title: "Error", description: e?.message || "Failed to load users", variant: "destructive" });
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [toast]);

  const handleRoleChange = (userId: string, newRole: string) => {
    toast({
      title: "Not supported",
      description: "This backend does not expose a user-role update endpoint.",
      variant: "destructive",
    });
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Manage Users</h1>
        <p className="page-subtitle">{loading ? "Loading..." : `${users.length} registered users`}</p>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Joined</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td className="px-4 py-3 text-muted-foreground" colSpan={5}>Loading...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td className="px-4 py-3 text-muted-foreground" colSpan={5}>No users found.</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u._id} className="hover:bg-secondary/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{u.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      u.role === "admin" ? "bg-destructive/10 text-destructive" : u.role === "creator" ? "bg-primary/10 text-primary" : "bg-info/10 text-info"
                    }`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : ""}</td>
                  <td className="px-4 py-3">
                    <Select value={u.role} onValueChange={(val) => handleRoleChange(u._id, val)}>
                      <SelectTrigger className="w-28 h-8 text-xs" disabled title="Read-only: no role update endpoint">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="creator">Creator</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
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

export default ManageUsers;
