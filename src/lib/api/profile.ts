"use server";

import { createClient } from "@/lib/supabase/server";

export async function toggleInterestedStatus(isInterested: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { error } = await supabase
    .from("profiles")
    .update({ is_interested: isInterested })
    .eq("id", user.id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function toggleBrokerStatus(userId: string, isBroker: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  // Verify the acting user is a host
  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (currentProfile?.role !== "host") {
    return { success: false, error: "Only hosts can manage brokers" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ is_broker: isBroker })
    .eq("id", userId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}
