export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-isf-borderLight p-8 text-center">
      <p className="font-serif text-lg text-isf-cream">{title}</p>
      {description ? <p className="mt-1 text-sm text-isf-textSecondary">{description}</p> : null}
    </div>
  );
}
