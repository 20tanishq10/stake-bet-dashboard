"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { toggleBrokerStatus } from "@/lib/api/profile";

export function BrokerToggle({ userId, initialValue }: { userId: string, initialValue: boolean }) {
  const [isBroker, setIsBroker] = useState(initialValue);
  const [loading, setLoading] = useState(false);

  async function handleToggle(checked: boolean) {
    setLoading(true);
    setIsBroker(checked);
    const res = await toggleBrokerStatus(userId, checked);
    if (!res.success) {
      alert("Failed to update status: " + res.error);
      setIsBroker(!checked);
    }
    setLoading(false);
  }

  return (
    <Switch 
      checked={isBroker} 
      onCheckedChange={handleToggle} 
      disabled={loading} 
    />
  );
}
