---
name: daf-lektion-pdf-untouched
description: >-
  In the daf repository, leaves the lesson OCR PDF unchanged. Use when working in
  daf, when paths mention lektion 1-ocr.pdf, lesson PDFs, or course PDF assets.
---

# Do not modify the lesson OCR PDF (daf)

## Verbatim rule

dont touch the @daf/lektion 1-ocr.pdf in the daf repo

## What this means for the agent

- Do **not** edit, overwrite, delete, rename, or “fix” **`lektion 1-ocr.pdf`** (repo root of **daf**).
- Do **not** add scripts or commands whose purpose is to rewrite or replace that file.
- Vocabulary and lesson work use **`vocab.docx`**, **`vocab.manifest.json`**, and related tooling—not this PDF.
- If lesson text is needed, rely on what the user pastes or on files they allow; do not treat mutating this PDF as part of the workflow.
