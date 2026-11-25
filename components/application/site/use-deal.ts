"use client";

import { useEffect, useState } from "react";

import { dealFrom } from "@/components/application/site/pricing";

/**
 * The partner deal this browser opened with /deal/<code>, or null. Read after mount, so the server's
 * render (always the public price) and the first client render agree.
 */
export function useDeal() {
  const [deal, setDeal] = useState<ReturnType<typeof dealFrom>>(null);
  useEffect(() => setDeal(dealFrom(document.cookie)), []);
  return deal;
}
