export function deckCountText(
  page: number,
  pageSize: number,
  pageItems: number,
  totalItems: number,
): string {
  if (totalItems === 0) return "0 cards";
  if (pageSize >= totalItems && page === 1) {
    return `${totalItems} cards`;
  }
  const start = (page - 1) * pageSize + 1;
  const end = (page - 1) * pageSize + pageItems;
  return `Showing ${start}\u2013${end} of ${totalItems}`;
}
