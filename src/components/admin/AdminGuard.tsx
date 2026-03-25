"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/insforge/client";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<"loading" | "ok" | "denied">("loading");

  useEffect(() => {
    const run = async () => {
      const insforge = createClient();
      const { data } = await insforge.auth.getCurrentUser();
      const user = data?.user ?? null;
      if (!user) {
        router.replace("/login");
        return;
      }
      const { data: profileRows } = await insforge.database.from("profiles").select("role").eq("id", user.id);
      const profile = Array.isArray(profileRows) ? profileRows[0] : null;
      if (profile?.role !== "super_admin") {
        setState("denied");
        router.replace("/dashboard");
        return;
      }
      setState("ok");
    };
    run();
  }, [router]);

  if (state === "loading") {
    return (
      <div className="rounded-xl border border-isf-border bg-isf-bgCard p-6 text-sm text-isf-textSecondary">
        Vérification des accès Super Admin...
      </div>
    );
  }

  if (state === "denied") {
    return null;
  }

  return <>{children}</>;
}
