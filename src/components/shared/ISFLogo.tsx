import { cn } from "@/lib/utils";

type ISFLogoProps = {
  className?: string;
  compact?: boolean;
};

export function ISFLogo({ className, compact = false }: ISFLogoProps) {
  if (compact) {
    return <span className={cn("font-serif text-xl font-semibold text-isf-gold", className)}>ISF</span>;
  }

  return (
    <span className={cn("font-serif text-2xl font-semibold tracking-wide isf-gold-gradient", className)}>
      IvoireSuiteFlow
    </span>
  );
}
