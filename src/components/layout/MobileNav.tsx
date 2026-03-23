import Link from "next/link";
import { BedDouble, CalendarCheck, LayoutDashboard, Menu, Plus } from "lucide-react";

export function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-isf-border bg-isf-bgCard px-4 py-2 lg:hidden">
      <div className="mx-auto flex max-w-md items-center justify-between">
        <Link href="/dashboard" className="text-isf-textSecondary"><LayoutDashboard className="h-5 w-5" /></Link>
        <Link href="/rooms" className="text-isf-textSecondary"><BedDouble className="h-5 w-5" /></Link>
        <Link href="/reservations/new" className="rounded-full bg-isf-gold p-2 text-black"><Plus className="h-5 w-5" /></Link>
        <Link href="/reservations" className="text-isf-textSecondary"><CalendarCheck className="h-5 w-5" /></Link>
        <button className="text-isf-textSecondary"><Menu className="h-5 w-5" /></button>
      </div>
    </nav>
  );
}
