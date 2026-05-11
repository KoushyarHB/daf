# DaF repository wiki

## Vocabulary: source of truth

- **`vocab.docx`** is the **primary source of truth**. Edit vocabulary in Word and save.
- **`vocab.manifest.json`** is a **derived mirror** for diffs, bulk edits, and tooling. Refresh it from the Word file whenever the JSON should match what you last saved.

**Example lines in Word:** each `DE (English)` unit is built from slash-separated strings in JSON (`a / b / c`). German runs are blue-slate italic; the parenthetical English is gray italic (`daf_vocab.docx_cards`).

## Manifest card metadata

Every object in **`vocab.manifest.json`** includes:

| Field | Meaning |
|--------|--------|
| **`createdAt`** | UTC ISO 8601 timestamp when the card first appeared; preserved when **`sync`** matches an existing **`head`**. |
| **`updatedAt`** | UTC ISO 8601 — set to “now” on every **`sync`** for each exported card. |
| **`lektion`** | Lesson number (integer) or **`null`** if not assigned. |
| **`level`** | CEFR level; default **`A1`** (`daf_vocab.docx_cards.DEFAULT_LEVEL`). |

`python -m daf_vocab build` normalizes every card (fills missing meta) and **rewrites the manifest** with stable field order; it does not render these fields into Word.

## Sync command (docx → manifest)

The command that **pulls the canonical Word file into the manifest** is:

```bash
python -m daf_vocab sync
```

Run it from the **repository root** (the folder that contains `vocab.docx` and `daf_vocab/`).

Options:

- `--docx PATH` — Word file (default: `vocab.docx` in the repo root)
- `--manifest PATH` — JSON output (default: `vocab.manifest.json` in the repo root)

Equivalent paths:

- `python -m daf_vocab export` — same behavior as `sync` (kept as a legacy name)
- `python sync_manifest_from_docx.py` — thin wrapper around the same sync

## Preview in the browser (manifest → HTML)

Regenerate a static page from the manifest and serve it locally (default **http://127.0.0.1:8765/**):

```bash
python -m daf_vocab serve
```

- `--manifest PATH` — JSON input (default: `vocab.manifest.json`)
- `--port N` — port for the built-in server (default: 8765)
- `--no-browser` — do not open your default browser automatically
- `--out PATH` — HTML file path (default: `vocab-preview/index.html` next to the manifest)

Run **`sync`** first if Word was edited so the mirror matches the document.

## Reverse direction (manifest → docx)

After editing `vocab.manifest.json` (for example prepending new cards), regenerate Word:

```bash
python -m daf_vocab build
```

## Typical workflows

1. **You edited Word only**  
   `python -m daf_vocab sync` → JSON now matches the document.

2. **You / the agent edited JSON, then rebuild Word**  
   `python -m daf_vocab build` → writes **`vocab.docx`** and rewrites **`vocab.manifest.json`** with normalized metadata.

3. **Agents updating the deck**  
   Start with `sync` so JSON reflects your hand edits, then change the manifest, then `build`.

## Dependencies

- Python with `python-docx` (see `requirements-vocab.txt`).

## Other assets

- `lektion 1-ocr.pdf` — course PDFs, etc., live alongside these files.
