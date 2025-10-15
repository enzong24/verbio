import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, Mail, Shield } from "lucide-react";

type WhitelistEntry = {
  id: string;
  email: string;
  addedBy: string | null;
  createdAt: string;
};

export default function AdminWhitelist() {
  const [newEmail, setNewEmail] = useState("");
  const { toast } = useToast();

  const { data: whitelistData, isLoading } = useQuery<{ whitelist: WhitelistEntry[] }>({
    queryKey: ["/api/admin/whitelist"],
  });

  const addMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await apiRequest("POST", "/api/admin/whitelist/add", { email });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/whitelist"] });
      setNewEmail("");
      toast({
        title: "Email added",
        description: "Email has been added to the premium whitelist",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add email to whitelist",
        variant: "destructive",
      });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await apiRequest("POST", "/api/admin/whitelist/remove", { email });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/whitelist"] });
      toast({
        title: "Email removed",
        description: "Email has been removed from the premium whitelist",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove email from whitelist",
        variant: "destructive",
      });
    },
  });

  const handleAdd = () => {
    if (!newEmail.trim()) {
      toast({
        title: "Email required",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }
    addMutation.mutate(newEmail.trim());
  };

  const handleRemove = (email: string) => {
    removeMutation.mutate(email);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Premium Whitelist Admin</h1>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Email to Whitelist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                type="email"
                placeholder="user@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAdd();
                  }
                }}
                data-testid="input-email"
              />
              <Button
                onClick={handleAdd}
                disabled={addMutation.isPending}
                data-testid="button-add"
              >
                {addMutation.isPending ? "Adding..." : "Add"}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              Users with whitelisted emails will automatically receive premium access when they sign in.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Whitelisted Emails ({whitelistData?.whitelist.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : whitelistData?.whitelist.length === 0 ? (
              <p className="text-muted-foreground">No emails in whitelist</p>
            ) : (
              <div className="space-y-2">
                {whitelistData?.whitelist.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover-elevate"
                    data-testid={`whitelist-entry-${entry.email}`}
                  >
                    <div>
                      <p className="font-medium">{entry.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Added {new Date(entry.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(entry.email)}
                      disabled={removeMutation.isPending}
                      data-testid={`button-remove-${entry.email}`}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 p-4 rounded-lg bg-muted/50">
          <h3 className="font-semibold mb-2">How it works:</h3>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Add email addresses to the whitelist</li>
            <li>When a user signs in with a whitelisted email, they automatically get premium access</li>
            <li>No payment or Stripe subscription required</li>
            <li>This feature is disabled in production for security</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
