# `components/shared`

Reusable UI for the whole app, organized by **atomic design**. Domain-specific pieces (vocabulary studied toggle, tag picker, grammar speak) live under `components/pages/<feature>/`, not here.

## Layers

| Folder | What belongs here | Examples |
|--------|-------------------|----------|
| **`atoms/`** | Single-purpose primitives with no business logic | `Button`, `Input`, `Badge`, `TextLink` |
| **`molecules/`** | Small compositions of atoms; still feature-agnostic | `FormField`, `ModalActions`, `PageHeader`, `SignInPrompt` |
| **`organisms/`** | Larger, reusable UI blocks used across routes | `ConfirmModal`, `DataTable`, `media/*` |
| **`layouts/`** | Site chrome (nav, shell, page frame) | `PrimaryLayout`, `Navbar` |

## What does **not** live here

| Location | Reason |
|----------|--------|
| `components/pages/vocabulary/` | `StudiedButton`, `PronounceButton` — deck/learning behavior |
| `components/pages/tags/` | `TagMultiSelect` — tag domain + API |
| `providers/` | `ToastProvider`, `QueryProvider` — app-wide React context |
| `hooks/` | `useIsClient` — generic hooks, not visual |
| `lib/styles/` | Tailwind class tokens (`button.ts`, `formControls.ts`) — no JSX |

## Import convention

Prefer the layer path (clear intent) over the barrel:

```tsx
import Button from "@/components/shared/atoms/Button";
import PageHeader from "@/components/shared/molecules/PageHeader";
import ConfirmModal from "@/components/shared/organisms/ConfirmModal";
```

`@/components/shared` re-exports atoms, molecules, and organisms for convenience.

## Adding a component

1. **Used in one feature only?** → `components/pages/<feature>/`
2. **Generic primitive?** → `atoms/`
3. **2–3 atoms wired together?** → `molecules/`
4. **Substantial reusable block (modal, table, media viewer)?** → `organisms/`
5. **Style-only strings** → `lib/styles/`, consumed by atoms
