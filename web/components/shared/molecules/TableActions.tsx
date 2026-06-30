import type { ReactNode } from "react";

/** Horizontal group of table row actions (edit, delete, publish, …). */
export default function TableActions({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex flex-wrap items-center justify-center gap-2">
      {children}
    </div>
  );
}
