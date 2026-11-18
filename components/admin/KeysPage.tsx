"use client";
import { useState } from "react";
import { KeyGenerator } from "./KeyGenerator";
import { ResourceList } from "./ResourceList";

export function KeysPage() {
  const [v, setV] = useState(0); // remount list after generating
  return (
    <>
      <KeyGenerator onDone={() => setV((x) => x + 1)} />
      <ResourceList key={v} resourceKey="keys" />
    </>
  );
}
