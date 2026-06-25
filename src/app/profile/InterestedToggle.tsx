"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toggleInterestedStatus } from "@/lib/api/profile";
import { useRouter } from "next/navigation";

export function InterestedToggle({ initialValue }: { initialValue: boolean }) {
  const [isInterested, setIsInterested] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleToggle(checked: boolean) {
    setLoading(true);
    setIsInterested(checked);
    const res = await toggleInterestedStatus(checked);
    if (!res.success) {
      alert("Failed to update status: " + res.error);
      setIsInterested(!checked); // revert
    } else {
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <div className="flex items-center space-x-2">
      <Switch 
        id="interested" 
        checked={isInterested} 
        onCheckedChange={handleToggle} 
        disabled={loading} 
      />
      <Label htmlFor="interested" className="text-xs font-normal">Active Status (Allow broker betting)</Label>
    </div>
  );
}
