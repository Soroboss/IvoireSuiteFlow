"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/insforge/client";
import { clearSession } from "@/lib/auth/session";

export function SignOutButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={async () => {
        clearSession();
        try {
          const insforge = createClient();
          await insforge.auth.signOut();
        } catch {
          // ignore
        }
        router.push("/login");
        router.refresh();
      }}
      className="mt-2 w-full rounded-md border border-isf-border px-3 py-2 text-xs text-isf-textSecondary hover:bg-isf-bgHover hover:text-isf-cream"
    >
      Se déconnecter
    </button>
  );
}
