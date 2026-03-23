"use client";

import { LogOut, User } from "lucide-react";

export function UserMenu() {
  return (
    <div className="rounded-lg border border-isf-border bg-isf-bgCard p-2 text-sm">
      <div className="mb-2 flex items-center gap-2 px-2 py-1 text-isf-textSecondary">
        <User className="h-4 w-4" />
        <span>Mon profil</span>
      </div>
      <button className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-isf-error hover:bg-white/5">
        <LogOut className="h-4 w-4" />
        Déconnexion
      </button>
    </div>
  );
}
