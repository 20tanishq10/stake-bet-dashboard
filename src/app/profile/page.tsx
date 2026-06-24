import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { InterestedToggle } from "./InterestedToggle";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div className="p-6">Please log in.</div>;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) return <div className="p-6">Profile not found.</div>;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <Badge variant="outline">My Profile</Badge>
        <h1 className="mt-2 text-2xl font-semibold">Account Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and view your details.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Details</CardTitle>
          <CardDescription>Your current account standing.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground font-medium">Display Name</span>
            <span>{profile.display_name}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground font-medium">Wallet Balance</span>
            <span className="font-bold text-green-600">${profile.wallet_balance?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground font-medium">Role</span>
            <span className="capitalize">{profile.role}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground font-medium">Broker Privileges</span>
            <span>{profile.is_broker || profile.role === "host" ? "Yes" : "No"}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Broker Preferences</CardTitle>
          <CardDescription>Configure how brokers can interact with your wallet.</CardDescription>
        </CardHeader>
        <CardContent>
          <InterestedToggle initialValue={profile.is_interested} />
        </CardContent>
      </Card>
    </div>
  );
}
