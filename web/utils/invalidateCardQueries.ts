import type { QueryClient } from "@tanstack/react-query";

import { cardKeys } from "@/hooks/query-keys";

export function invalidateCardQueries(queryClient: QueryClient): Promise<void> {
  return queryClient.invalidateQueries({ queryKey: cardKeys.all });
}
