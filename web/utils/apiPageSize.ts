export function apiPageSize(pageSize: string): number {
  if (pageSize === "all") return 100;
  const n = parseInt(pageSize, 10);
  return Number.isNaN(n) || n < 1 ? 20 : Math.min(n, 100);
}
