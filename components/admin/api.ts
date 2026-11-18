"use client";
import { useEffect, useState } from "react";

/** fetch JSON; GET without body, POST with body unless a method is given. Throws Error(message) on failure. */
export async function api(url: string, body?: unknown, method?: string) {
  const res = await fetch(url, {
    method: method ?? (body === undefined ? "GET" : "POST"),
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
  return data;
}

const cache = new Map<string, Promise<{ value: string; label: string }[]>>();

/** {value,label} options for a ref field's target module, cached per page load. */
export function useOptions(resourceKey?: string) {
  const [opts, setOpts] = useState<{ value: string; label: string }[]>([]);
  useEffect(() => {
    if (!resourceKey) return;
    if (!cache.has(resourceKey)) cache.set(resourceKey, api(`/api/admin/${resourceKey}?options=1`).catch(() => (cache.delete(resourceKey), [])));
    let live = true;
    cache.get(resourceKey)!.then((o) => live && setOpts(o));
    return () => {
      live = false;
    };
  }, [resourceKey]);
  return opts;
}
