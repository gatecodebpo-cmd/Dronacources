"use client";
import { useEffect, useState } from "react";
import type { NavData } from "./data";

// One request per page view, shared by the mega menu, mobile drawer and every search box.
let cache: NavData | null = null;
let pending: Promise<NavData> | null = null;

export function loadNav(): Promise<NavData> {
  if (cache) return Promise.resolve(cache);
  pending ??= fetch("/api/nav")
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
    .then((d: NavData) => (cache = d))
    .catch((e) => {
      pending = null; // allow a retry on the next open/focus
      throw e;
    });
  return pending;
}

/** Nav data, fetched only once `enabled` becomes true (menu opened, search focused). */
export function useNav(enabled = true) {
  const [nav, setNav] = useState<NavData | null>(cache);
  useEffect(() => {
    if (!enabled || nav) return;
    let live = true;
    loadNav()
      .then((d) => live && setNav(d))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [enabled, nav]);
  return nav;
}
