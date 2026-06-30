"use client";

import { useSyncExternalStore } from "react";

/** True after hydration — safe for portals and `document` access. */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
