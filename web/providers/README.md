# `providers`

App-wide React context providers. Mounted once near the root (see `PrimaryLayout` or `app/layout.tsx`).

| File | Role |
|------|------|
| `QueryProvider.tsx` | TanStack Query client |
| `SessionProvider.tsx` | NextAuth session |
| `ToastProvider.tsx` | Ephemeral success/error toasts (`useToast`) |

Not UI components — no JSX styling primitives here.
