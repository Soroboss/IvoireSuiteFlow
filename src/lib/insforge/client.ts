"use client";

import { createClient as createInsforgeClient } from "@insforge/sdk";

export function createClient() {
  const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_BASE_URL;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_INSFORGE_BASE_URL manquante");
  }

  return createInsforgeClient({
    baseUrl,
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY
  });
}

