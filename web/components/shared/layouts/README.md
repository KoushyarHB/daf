# Layouts

App shell only — navigation, main landmark, site footer. Not page content.

| File | Role |
|------|------|
| `primary-layout/PrimaryLayout.tsx` | Wraps routes with toast, lightbox, navbar, footer |
| `navbar/Navbar.tsx` | Top navigation |

Providers (`ToastProvider`, `QueryProvider`) live in `components/providers/`, not here.
