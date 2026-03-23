import type { InputHTMLAttributes } from "react";

type SearchInputProps = InputHTMLAttributes<HTMLInputElement>;

export function SearchInput(props: SearchInputProps) {
  return (
    <input
      {...props}
      className="h-10 w-full rounded-md border border-isf-border bg-isf-bgCard px-3 text-sm outline-none placeholder:text-isf-textMuted focus:border-isf-gold"
    />
  );
}
