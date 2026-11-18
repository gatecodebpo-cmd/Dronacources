"use client";
import { useEffect } from "react";

/**
 * Blocks the browser's right-click menu (a deterrent only – it can't stop determined copying).
 * Text fields keep it so people can still paste into forms.
 */
export function NoContextMenu() {
  useEffect(() => {
    const block = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null;
      if (el?.closest("input, textarea, [contenteditable='true']")) return;
      e.preventDefault();
    };
    document.addEventListener("contextmenu", block);
    return () => document.removeEventListener("contextmenu", block);
  }, []);
  return null;
}
