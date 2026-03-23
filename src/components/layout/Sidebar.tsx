import Link from "next/link";
import {
  BarChart3,
  BedDouble,
  Building2,
  CalendarCheck,
  CreditCard,
  LayoutDashboard,
  Receipt,
  Settings,
  Sparkles,
  UserCog,
  Users
} from "lucide-react";
import { ISFLogo } from "@/components/shared/ISFLogo";

const nav = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/rooms", label: "Logements", icon: BedDouble },
  { href: "/reservations", label: "Réservations", icon: CalendarCheck },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/billing", label: "Facturation", icon: Receipt },
  { href: "/housekeeping", label: "Ménage", icon: Sparkles },
  { href: "/staff", label: "Personnel", icon: UserCog },
  { href: "/reports", label: "Rapports", icon: BarChart3 },
  { href: "/settings", label: "Paramètres", icon: Settings }
];

const adminNav = [
  { href: "/admin", label: "Dashboard SaaS", icon: LayoutDashboard },
  { href: "/admin/subscribers", label: "Abonnés", icon: Building2 },
  { href: "/admin/plans", label: "Plans", icon: CreditCard }
];

export function Sidebar() {
  return (
    <aside className="hidden h-screen w-[260px] flex-col border-r border-isf-border bg-isf-bgCard p-4 lg:flex">
      <div>
        <ISFLogo />
        <p className="mt-1 text-xs text-isf-textMuted">Établissement actif: Résidence Angré</p>
      </div>
      <nav className="mt-6 space-y-1">
        {nav.map((item) => (
          <Link key={item.href} href={item.href} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-isf-textSecondary hover:bg-isf-bgHover hover:text-isf-cream">
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-8">
        <p className="mb-2 px-3 text-xs uppercase tracking-wide text-isf-textMuted">Administration SaaS</p>
        {adminNav.map((item) => (
          <Link key={item.href} href={item.href} className="mb-1 flex items-center gap-2 rounded-md px-3 py-2 text-sm text-isf-textSecondary hover:bg-isf-bgHover hover:text-isf-cream">
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </div>
      <div className="mt-auto rounded-xl border border-isf-border bg-isf-bgElevated p-3 text-sm">
        <p className="font-medium text-isf-cream">Admin IvoireSuiteFlow</p>
        <p className="text-xs text-isf-textMuted">Rôle: admin</p>
      </div>
    </aside>
  );
}
