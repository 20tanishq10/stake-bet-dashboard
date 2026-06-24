"use client";

import { useEffect, useState } from "react";

export function ClientTime({ timeString, showDate = false }: { timeString: string; showDate?: boolean }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span className="opacity-0">{showDate ? "---, --- --, 00:00 AM" : "00:00 AM"}</span>;
  }

  const date = new Date(timeString);
  const formatted = showDate 
    ? date.toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
    : date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

  return (
    <span className="opacity-100 transition-opacity">
      {formatted}
    </span>
  );
}
