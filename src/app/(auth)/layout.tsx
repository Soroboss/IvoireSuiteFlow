import { ISFLogo } from "@/components/shared/ISFLogo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="isf-african-pattern grid min-h-screen place-items-center bg-isf-bgDeep px-4">
      <div className="w-full max-w-md rounded-2xl border border-isf-border bg-isf-bgCard p-6 shadow-isfGlow">
        <div className="mb-6 text-center">
          <ISFLogo />
          <p className="mt-2 text-sm text-isf-textSecondary">
            Simplifiez vos opérations, valorisez vos établissements.
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
