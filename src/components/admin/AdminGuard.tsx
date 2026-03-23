"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<"loading" | "ok" | "denied">("loading");

  useEffect(() => {
    const run = async () => {
      const supabase = createClient();
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
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
