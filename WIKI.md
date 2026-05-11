# DaF repository wiki

## Vocabulary: source of truth

- **`vocab.manifest.json`** is the **canonical deck** (what git, agents, and **GitHub Pages** use). The website is built from the **committed manifest**, not from regenerating Word on the server.
- **`vocab.docx`** is your **human editor** in Word. After you edit and save Word, run **`python -m daf_vocab pull`** so **JSON absorbs your changes** (tooling merges **content** from Word and **preserves / freshens metadata** like timestamps and `lektion` for known **`head`** strings).
- After you edit **JSON** only (prepend cards, bulk fixes), run **`python -m daf_vocab sync`** so **Word catches up** with the manifest and the manifest is normalized.

**Example lines in Word:** each `DE (English)` pair is one object in the manifest **`examples`** array: **`{ "german": "...", "english": "..." }`**. English is the full-sentence gloss **without** wrapping parentheses (tooling adds `(…)` in Word and HTML). Use **`"english": null`** for German-only lines. Legacy manifests used slash-joined strings or **`example_units`**; **`pull`** / **`sync`** normalize to objects.

## Manifest card metadata

Every object in **`vocab.manifest.json`** includes:

| Field | Meaning |
|--------|--------|
| **`examples`** | Array of **`{ "german": "…", "english": "…" \| null }`** — one **`›`** line per object in Word; English is stored without parentheses. |
| **`createdAt`** | UTC ISO 8601 timestamp when the card first appeared; preserved when **`pull`** matches an existing **`head`**. |
| **`updatedAt`** | UTC ISO 8601 — set to “now” on every **`pull`** for each exported card. |
| **`lektion`** | Lesson number (integer) or **`null`** if not assigned. |
| **`level`** | CEFR level; default **`A1`** (`daf_vocab.docx_cards.DEFAULT_LEVEL`). |

`python -m daf_vocab sync` normalizes metadata, regenerates **`vocab.docx`** from the manifest, and rewrites **`vocab.manifest.json`** with stable key order. Fields like **`lektion`** live in JSON; **`pull`** carries them forward when **`head`** still matches after a Word edit.

## Pull command (Word → manifest)

Run when you **edited and saved** **`vocab.docx`** and want the **canonical JSON** to reflect that:

```bash
python -m daf_vocab pull
```

This **updates** **`vocab.manifest.json`** from **`vocab.docx`**, reusing existing metadata for cards that still share the same **`head`**. It does **not** change the rule that JSON is canonical for what you commit and publish.

Run from the **repository root** (folder that contains `vocab.docx`, `vocab.manifest.json`, and `daf_vocab/`).

Options:

- `--docx PATH` — Word file (default: `vocab.docx` in the repo root)
- `--manifest PATH` — JSON output (default: `vocab.manifest.json` in the repo root)

Equivalent:

- **`python -m daf_vocab export`** — legacy alias for **`pull`** (same behavior)
- **`python sync_manifest_from_docx.py`** — thin wrapper around **`pull`**

**Paragraph roles when pulling:** indented lines whose text starts with **`›`** become **examples**; lines starting **`•`** (bullet) become **notes**; other indented lines become **gloss**. Every German example must begin with **`›`**. Regenerating Word with **`sync`** restores **`›`** on examples.

## Sync command (manifest → Word)

After editing **`vocab.manifest.json`**, regenerate **`vocab.docx`** so Word matches the manifest:

```bash
python -m daf_vocab sync
```

Legacy alias: **`python -m daf_vocab build`** (same as **`sync`**).

Options **`--manifest`** and **`--docx`** use repo-root defaults (`vocab.manifest.json`, `vocab.docx`).

## Preview in the browser (manifest → HTML)

Regenerate a static page from the manifest and serve it locally (default **http://127.0.0.1:8765/**):

```bash
python -m daf_vocab serve
```

- `--manifest PATH` — JSON input (default: `vocab.manifest.json`)
- `--port N` — port for the built-in server (default: 8765)
- `--no-browser` — do not open your default browser automatically
- `--out PATH` — HTML output file path (default: `vocab-preview/index.html` next to the manifest)

Run **`pull`** after Word edits to refresh the manifest; run **`sync`** after JSON-only edits to refresh Word. For the public site, **commit and push `vocab.manifest.json`** (Pages workflow reads that file).

### GitHub Pages (public URL)

The workflow **`.github/workflows/deploy-pages.yml`** renders **`vocab-preview/index.html`** from **committed `vocab.manifest.json`** on every push to **`master`** (and via **workflow dispatch**). It does **not** consume **`vocab.docx`** on GitHub — only the manifest matters for the live site.

**One-time:** **Settings → Pages → Source:** **GitHub Actions**.

If your default branch uses a different name, edit **`on.push.branches`** in that workflow file.

## Typical workflows

1. **You edited Word only**  
   **`python -m daf_vocab pull`** → JSON updated from the document → **commit `vocab.manifest.json`** (and optionally **`vocab.docx`**) so git and **Pages** match.

2. **You edited JSON only** (agents, bulk edits)  
   **`python -m daf_vocab sync`** → **`vocab.docx`** regenerated and manifest normalized → commit both as needed.

3. **Alternating**  
   Start from whichever file you changed last: **Word** → **`pull`** → commit JSON; **JSON** → **`sync`** → commit Word + JSON.

## Dependencies

- Python with `python-docx` (see `requirements-vocab.txt`).

## Other assets

- `lektion 1-ocr.pdf` — course PDFs, etc., live alongside these files.
