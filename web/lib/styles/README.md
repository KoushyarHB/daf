# `lib/styles`

Tailwind class-string tokens — **no React components**. Consumed by atoms and page-level layout helpers.

| File | Role |
|------|------|
| `button.ts` | Button variants/sizes (`buttonClassName`, legacy `tagsTableBtn*` exports) |
| `formControls.ts` | Input/select/textarea base classes |
| `tagsPage.ts` | Admin/tags/decks page layout and table chrome |
| `pageTitle.ts` | Page heading styles |

Prefer `<Button>`, `<Input>`, etc. over importing deprecated class constants from `button.ts`.
