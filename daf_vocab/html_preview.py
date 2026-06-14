# -*- coding: utf-8 -*-
"""Render ``vocab.manifest.json`` to a static HTML page for local preview in a browser."""

from __future__ import annotations

import html
import json
import shutil
from datetime import datetime
from pathlib import Path
from typing import Any

from .docx_cards import (
    format_ipa_display,
    iter_grammar_adj_suffix_runs,
    normalize_examples_from_card,
    normalize_grammar_table,
    normalize_head_ipa_fields,
    normalize_ipa_storage,
)
from .plural_forms import format_plural_line, normalize_plural_fields
from .pos import collect_pos_options, normalize_pos, pos_label
from .heroicons import (
    chevron_double_left_icon_svg,
    chevron_double_right_icon_svg,
    chevron_left_icon_svg,
    chevron_right_icon_svg,
    play_icon_svg,
    studied_off_icon_svg,
    studied_on_icon_svg,
)


TITLE_PAGE = "daf — vocabulary"

CSS = """\
:root {
  --blue: rgb(48, 96, 140);
  --gray-en: rgb(64, 64, 64);
  --head-blue: rgb(47, 111, 184);
  --border: #e0e0e0;
  --site-content-max: 44rem;
  --site-pad-x: 1rem;
}
* { box-sizing: border-box; }
html {
  margin: 0;
  scrollbar-gutter: stable;
}
body.lightbox-open {
  overflow: hidden;
}
body {
  font-family: Calibri, "Segoe UI", Roboto, sans-serif;
  font-size: 11pt;
  line-height: 1.45;
  max-width: var(--site-content-max);
  margin: 0 auto;
  padding: 0 var(--site-pad-x) 3rem;
  color: #111;
  background: #fafafa;
}
.site-header + * {
  margin-top: 1.25rem;
}
h1 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--head-blue);
  border-bottom: 2px solid var(--head-blue);
  padding-bottom: 0.35rem;
  margin-bottom: 1.25rem;
}
.card {
  border-bottom: 1px solid var(--border);
  padding: 0.9rem 0;
}
.card:first-of-type { padding-top: 0; }
.head-line {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: wrap;
  margin-bottom: 0.35rem;
}
.head-line .head {
  margin-bottom: 0;
}
.head {
  font-weight: 700;
  margin-bottom: 0.35rem;
}
.head-ipa {
  font-weight: 400;
  font-size: 0.88em;
  color: #666;
}
.pronounce-btn {
  width: 1.65rem;
  height: 1.65rem;
  border-radius: 50%;
  border: 1px solid rgba(47, 111, 184, 0.32);
  background: rgba(241, 246, 252, 0.95);
  color: var(--head-blue);
  cursor: pointer;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  line-height: 1;
  transition: background 0.15s, border-color 0.15s, transform 0.1s;
}
.pronounce-btn:hover {
  background: #e8f0fa;
  border-color: rgba(47, 111, 184, 0.55);
}
.pronounce-btn:focus-visible {
  outline: 2px solid rgba(47, 111, 184, 0.45);
  outline-offset: 2px;
}
.pronounce-btn:active {
  transform: scale(0.92);
}
.pronounce-btn svg.heroicon {
  width: 0.95rem;
  height: 0.95rem;
  display: block;
}
.pronounce-btn svg.heroicon--solid {
  fill: currentColor;
}
.meta {
  font-size: 0.75rem;
  color: #666;
  margin-bottom: 0.5rem;
}
.meta span { margin-right: 0.75rem; }
.meta-pos { font-weight: 600; color: #2f6fb8; }
.gloss, .gloss p {
  margin: 0.35rem 0;
  padding-left: 0.6rem;
  border-left: 3px solid #ddd;
}
.notes {
  font-size: 10pt;
  font-style: italic;
  color: #404040;
  padding-left: 0.6rem;
  margin: 0.35rem 0;
}
.ex-block { margin-top: 0.45rem; padding-left: 0.6rem; }
.ex-line {
  display: flex;
  align-items: center;
  gap: 0.32rem;
  font-size: 10.5pt;
  font-style: italic;
  margin: 0.25rem 0;
}
.ex-line-text {
  flex: 1;
  min-width: 0;
}
.pronounce-btn--ex {
  width: 1.4rem;
  height: 1.4rem;
  margin-top: 0;
  flex-shrink: 0;
  align-self: center;
}
.pronounce-btn--ex svg.heroicon {
  width: 0.8rem;
  height: 0.8rem;
}
.ex-de { color: var(--blue); }
.ex-en { color: var(--gray-en); }
.chevr { color: var(--blue); margin-right: 0.15em; }
.plural-diagram {
  margin: 0.25rem 0 0.35rem 0;
  padding-left: 0.6rem;
  border-left: 3px solid #ddd;
  font-size: 11pt;
  color: #111;
}
.card-image {
  margin-top: 0.6rem;
  padding-left: 0.6rem;
}
.zoomable-image {
  display: block;
  max-width: 100%;
  padding: 0;
  border: none;
  background: none;
  cursor: zoom-in;
  text-align: left;
}
.zoomable-image:hover img {
  border-color: rgba(47, 111, 184, 0.45);
  box-shadow: 0 0 0 2px rgba(47, 111, 184, 0.12);
}
.zoomable-image img,
.card-image img {
  display: block;
  max-width: 100%;
  height: auto;
  border: 1px solid var(--border);
  border-radius: 4px;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.image-lightbox {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: none;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
  background: rgba(16, 16, 16, 0.88);
  cursor: zoom-out;
}
.image-lightbox.is-open {
  display: flex;
}
.image-lightbox-img {
  display: block;
  max-width: min(100%, 72rem);
  max-height: calc(100vh - 2.5rem);
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 4px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
  cursor: default;
}
.image-lightbox-close {
  position: absolute;
  top: 0.75rem;
  right: 0.85rem;
  width: 2.25rem;
  height: 2.25rem;
  border: none;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  font-size: 1.45rem;
  line-height: 1;
  cursor: pointer;
}
.image-lightbox-close:hover {
  background: rgba(255, 255, 255, 0.22);
}
.grammar-table-wrap {
  margin: 0.35rem 0 0.65rem 0;
  padding-left: 0.6rem;
  border-left: 3px solid transparent;
}
.grammar-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  margin: 0;
  font-size: 9.5pt;
}
.grammar-col-case {
  width: 3.25rem;
}
.grammar-adj-sfx {
  color: var(--blue);
  font-weight: 700;
}
.grammar-table th,
.grammar-table td {
  border: 1px solid var(--border);
  padding: 0.35rem 0.45rem;
  text-align: left;
  vertical-align: top;
}
.grammar-table th {
  font-weight: 600;
  background: #f1f6fc;
  color: #333;
}
footer {
  margin-top: 2rem;
  font-size: 0.8rem;
  color: #888;
}
.deck-controls {
  margin: 0 0 0.45rem;
  padding: 0.45rem 0.55rem;
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 6px;
}
.deck-controls-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem 0.55rem;
  align-items: flex-end;
}
.deck-controls label {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  font-size: 0.58rem;
  font-weight: 600;
  color: #777;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: color 0.15s;
}
.deck-controls label.is-active {
  color: var(--head-blue);
}
.deck-controls select {
  font: inherit;
  font-size: 0.78rem;
  font-weight: 400;
  text-transform: none;
  letter-spacing: normal;
  color: #222;
  padding: 0.18rem 0.32rem;
  border: 1px solid #d8d8d8;
  border-radius: 3px;
  background: #fafafa;
  min-width: 5.75rem;
  max-width: 9.5rem;
  appearance: auto;
  transition: border-color 0.15s, background 0.15s, color 0.15s, box-shadow 0.15s;
}
.deck-controls select:focus,
.deck-controls select:focus-visible,
.page-size-control select:focus,
.page-size-control select:focus-visible {
  outline: none;
  border-color: rgba(47, 111, 184, 0.45);
  box-shadow: 0 0 0 2px rgba(47, 111, 184, 0.12);
}
.deck-controls select:focus:not(:focus-visible),
.page-size-control select:focus:not(:focus-visible) {
  box-shadow: none;
  border-color: #d8d8d8;
}
.page-size-control select,
#page-size {
  font: inherit;
  font-size: 0.78rem;
  font-weight: 400;
  text-transform: none;
  letter-spacing: normal;
  color: #222;
  border: 1px solid #d8d8d8;
  border-radius: 3px;
  background: #fafafa;
  min-width: 0;
  width: 3.15rem;
  max-width: 3.75rem;
  padding: 0.18rem 0.15rem 0.18rem 0.28rem;
  text-align-last: center;
  transition: border-color 0.15s, background 0.15s, color 0.15s, box-shadow 0.15s;
}
.deck-controls label.is-active select {
  border-color: rgba(47, 111, 184, 0.52);
  background: #eef4fc;
  color: #1a4a85;
  font-weight: 600;
  box-shadow: inset 0 0 0 1px rgba(47, 111, 184, 0.14);
}
.deck-count {
  margin: 0.3rem 0 0;
  font-size: 0.72rem;
  color: #666;
}
.deck-pagination {
  position: sticky;
  top: var(--site-header-h, 4.55rem);
  z-index: 90;
  margin: 0 0 0.85rem;
  padding: 0.45rem 0.55rem;
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 6px;
}
.deck-pagination-inner {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 2.1rem;
  padding: 0.05rem 0;
}
.deck-pagination-size {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
  flex-shrink: 0;
}
.page-size-control {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  font-size: 0.58rem;
  font-weight: 600;
  color: #777;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
#page-size-controls-slot {
  display: contents;
}
.deck-pagination-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
}
.page-current {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--head-blue);
  min-width: 1.75rem;
  text-align: center;
  line-height: 1;
  padding: 0 0.15rem;
}
.card.is-hidden,
.vocab-list-item.is-hidden {
  display: none;
}
#deck .card:first-of-type {
  padding-top: 0;
}
.studied-btn {
  width: 1.65rem;
  height: 1.65rem;
  border-radius: 4px;
  border: 1px solid #c8c8c8;
  background: #fafafa;
  color: #9a9a9a;
  cursor: pointer;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  line-height: 1;
  transition: background 0.15s, border-color 0.15s, color 0.15s, transform 0.1s;
}
.studied-btn svg.heroicon {
  width: 1.05rem;
  height: 1.05rem;
}
.studied-btn svg.heroicon--outline {
  stroke: currentColor;
}
.studied-btn svg.heroicon--solid {
  fill: currentColor;
}
.studied-btn svg.studied-svg-off {
  display: block;
}
.studied-btn svg.studied-svg-on {
  display: none;
}
.studied-btn:hover {
  border-color: #8fb86e;
  color: #5f8f42;
  background: #f4faf0;
}
.studied-btn[aria-pressed="true"] {
  background: #5a9e38;
  border-color: #4a8a28;
  color: #fff;
}
.studied-btn[aria-pressed="true"] svg.studied-svg-off {
  display: none;
}
.studied-btn[aria-pressed="true"] svg.studied-svg-on {
  display: block;
}
.studied-btn:focus-visible {
  outline: 2px solid rgba(74, 138, 40, 0.45);
  outline-offset: 2px;
}
.studied-btn:active {
  transform: scale(0.92);
}
.view-pane.is-hidden {
  display: none;
}
.vocab-list {
  margin: 0 0 1rem;
  padding: 0;
  list-style: none;
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 6px;
}
.vocab-list-item {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.42rem 0.65rem;
  border-bottom: 1px solid #eee;
}
.vocab-list-item:last-child {
  border-bottom: none;
}
.vocab-list-link {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: baseline;
  gap: 0.55rem;
  color: inherit;
  text-decoration: none;
  font-size: 0.95rem;
}
.vocab-list-link:hover .vocab-list-lemma {
  color: var(--head-blue);
  text-decoration: underline;
}
.vocab-list-no {
  font-weight: 700;
  color: #888;
  min-width: 2rem;
  flex-shrink: 0;
}
.vocab-list-lemma {
  font-weight: 600;
  color: #222;
}
.vocab-list-meta {
  font-size: 0.72rem;
  color: #888;
  flex-shrink: 0;
}
.vocab-list-pos {
  color: #2f6fb8;
  font-weight: 600;
}
.vocab-list-item.is-studied .vocab-list-lemma {
  color: #555;
}
.deck-pagination-nav button.page-edge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  padding: 0;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--head-blue);
  cursor: pointer;
  transition: color 0.15s, background 0.15s;
  flex-shrink: 0;
}
.deck-pagination-nav button.page-edge--jump {
  width: auto;
  min-width: 1.75rem;
  padding: 0 0.1rem;
}
.deck-pagination-nav button.page-edge svg.heroicon {
  width: 1rem;
  height: 1rem;
  display: block;
  flex-shrink: 0;
}
.deck-pagination-nav button.page-edge svg.heroicon--double {
  width: 1.35rem;
  height: 1rem;
}
.deck-pagination-nav button.page-edge svg.heroicon--mirror-x {
  transform: scaleX(-1);
}
.deck-pagination-nav button.page-edge:not(:disabled):hover {
  background: #f1f6fc;
}
.deck-pagination-nav button.page-edge:disabled {
  cursor: default;
  color: #b8c9de;
}
.card.is-studied {
  opacity: 0.92;
}
.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff;
  border-bottom: 1px solid var(--border);
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.04);
  width: 100vw;
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
  margin-top: 0;
  margin-bottom: 0;
  padding: 0.85rem 0;
}
.site-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.2rem;
  flex-wrap: wrap;
  max-width: var(--site-content-max);
  margin: 0 auto;
  width: 100%;
  padding: 0 var(--site-pad-x);
  box-sizing: border-box;
}
.site-brand {
  display: flex;
  align-items: center;
}
.site-brand img {
  display: block;
  height: 52px;
  width: auto;
  max-width: min(56vw, 420px);
}
.site-nav {
  display: flex;
  align-items: center;
  gap: 2.25rem;
  flex-wrap: wrap;
}
.site-nav a {
  font-size: 0.92rem;
  font-weight: 600;
  color: #2b64b8;
  text-decoration: none;
}
.site-nav a:hover {
  color: #1a4f99;
}
.site-nav a.is-active {
  text-decoration: underline;
  text-decoration-color: rgba(43, 100, 184, 0.45);
  text-underline-offset: 4px;
  text-decoration-thickness: 1.5px;
}
.nav-links {
  margin: 0 0 1rem;
  font-size: 0.95rem;
}
.nav-links a {
  color: var(--head-blue);
  text-decoration: none;
  font-weight: 600;
}
.nav-links a:hover {
  text-decoration: underline;
}
.lesson-list {
  margin: 0.8rem 0 0;
  padding: 0;
  list-style: none;
}
.lesson-item {
  border: 1px solid var(--border);
  border-radius: 6px;
  background: #fff;
  padding: 0.75rem;
  margin-bottom: 0.9rem;
}
.lesson-item a {
  color: var(--head-blue);
}
.lesson-item img,
.lesson-item .zoomable-image img {
  display: block;
  width: 100%;
  max-width: 100%;
  height: auto;
  margin-top: 0.6rem;
  border: 1px solid var(--border);
  border-radius: 4px;
}
.lesson-item .zoomable-image {
  width: 100%;
  margin-top: 0;
}
.lesson-header {
  background: #ffffff;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.9rem 1rem;
  margin-bottom: 1rem;
}
.lesson-header h1 {
  margin: 0 0 0.4rem 0;
  border-bottom: none;
  padding-bottom: 0;
}
.lesson-links {
  margin: 0 0 1.25rem;
  padding: 0.85rem 1rem;
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 8px;
}
.lesson-links h2 {
  margin: 0 0 0.6rem 0;
  font-size: 1.05rem;
  color: #222;
}
.lesson-links ul {
  margin: 0;
  padding-left: 1.1rem;
}
.lesson-links li {
  margin: 0.28rem 0;
}
.lesson-preview-title {
  margin: 0 0 0.65rem;
  font-size: 1.05rem;
  color: #222;
}
@media (max-width: 640px) {
  .deck-pagination-size {
    display: none;
  }
  .deck-pagination-inner {
    min-height: 1.85rem;
  }
  .site-brand img {
    height: 44px;
  }
  .site-nav {
    gap: 1.25rem;
  }
}
"""

PRONOUNCE_JS = """\
(function () {
  var player = new Audio();
  function resolveAudioSrc(raw) {
    var src = (raw || "").trim();
    if (!src) return "";
    if (/^https?:\\/\\//i.test(src)) return src;
    try {
      if (src.charAt(0) === "/") {
        return new URL(src, window.location.origin).href;
      }
      return new URL(src, window.location.href).href;
    } catch (err) {
      return src;
    }
  }
  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".pronounce-btn");
    if (!btn) return;
    var src = resolveAudioSrc(btn.getAttribute("data-audio"));
    if (!src) return;
    e.preventDefault();
    e.stopPropagation();
    player.pause();
    player.src = src;
    player.load();
    player.play().catch(function (err) {
      console.warn("Pronunciation playback failed:", src, err);
    });
  });
})();
"""

IMAGE_LIGHTBOX_JS = """\
(function () {
  var lb = document.getElementById("image-lightbox");
  if (!lb) return;
  var lbImg = lb.querySelector(".image-lightbox-img");
  var closeBtn = lb.querySelector(".image-lightbox-close");
  if (!lbImg || !closeBtn) return;

  function openLightbox(src, alt) {
    lbImg.src = src;
    lbImg.alt = alt || "";
    lb.classList.add("is-open");
    lb.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
    closeBtn.focus();
  }

  function closeLightbox() {
    lb.classList.remove("is-open");
    lb.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");
    lbImg.removeAttribute("src");
    lbImg.alt = "";
  }

  document.addEventListener("click", function (e) {
    var trigger = e.target.closest(".zoomable-image");
    if (trigger) {
      e.preventDefault();
      var img = trigger.querySelector("img");
      var src = trigger.getAttribute("data-lightbox-src") || (img && img.getAttribute("src")) || "";
      var alt = img ? img.getAttribute("alt") || "" : "";
      if (src) openLightbox(src, alt);
      return;
    }
    if (lb.classList.contains("is-open") && (e.target === lb || e.target === closeBtn)) {
      closeLightbox();
    }
  });

  lbImg.addEventListener("click", function (e) {
    e.stopPropagation();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && lb.classList.contains("is-open")) closeLightbox();
  });
})();
"""


DECK_UI_JS = """\
(function () {
  var deck = document.getElementById("deck");
  var list = document.getElementById("vocab-list");
  if (!deck) return;
  var cards = Array.from(deck.querySelectorAll(".card"));
  var listItems = list ? Array.from(list.querySelectorAll(".vocab-list-item")) : [];
  var countEl = document.getElementById("deck-count");
  var lektionSel = document.getElementById("filter-lektion");
  var levelSel = document.getElementById("filter-level");
  var posSel = document.getElementById("filter-pos");
  var studiedSel = document.getElementById("filter-studied");
  var sortSel = document.getElementById("sort-order");
  var viewSel = document.getElementById("view-mode");
  var pageSizeSel = document.getElementById("page-size");
  var pageFirst = document.getElementById("page-first");
  var pagePrev = document.getElementById("page-prev");
  var pageNext = document.getElementById("page-next");
  var pageLast = document.getElementById("page-last");
  var pageCurrent = document.getElementById("page-current");
  if (!countEl || !lektionSel || !levelSel || !posSel || !studiedSel || !sortSel || !viewSel || !pageSizeSel) return;

  var deckOrder = cards.slice();
  var listById = {};
  listItems.forEach(function (item) {
    if (item.dataset.cardId) listById[item.dataset.cardId] = item;
  });
  var currentPage = 0;
  var MOBILE_MQ = window.matchMedia("(max-width: 640px)");
  var studiedSaveFailed = false;

  function updateLayoutChrome() {
    var header = document.querySelector(".site-header");
    if (header) {
      document.documentElement.style.setProperty("--site-header-h", header.offsetHeight + "px");
    }
    var label = document.getElementById("page-size-label");
    var controlsSlot = document.getElementById("page-size-controls-slot");
    var paginationSlot = document.getElementById("page-size-slot");
    if (label && controlsSlot && paginationSlot) {
      var mobile = MOBILE_MQ.matches;
      var target = mobile ? controlsSlot : paginationSlot;
      if (label.parentElement !== target) target.appendChild(label);
    }
  }

  if (window.ResizeObserver) {
    var headerEl = document.querySelector(".site-header");
    if (headerEl) {
      new ResizeObserver(updateLayoutChrome).observe(headerEl);
    }
  }
  window.addEventListener("resize", updateLayoutChrome);
  if (MOBILE_MQ.addEventListener) {
    MOBILE_MQ.addEventListener("change", updateLayoutChrome);
  } else if (MOBILE_MQ.addListener) {
    MOBILE_MQ.addListener(updateLayoutChrome);
  }
  updateLayoutChrome();

  function cardIdFor(el) {
    return el.dataset.cardId || "";
  }

  function isStudied(id) {
    var card = document.getElementById("card-" + id);
    if (card) return card.dataset.studied === "true";
    var item = listById[id];
    return !!(item && item.dataset.studied === "true");
  }

  function setStudiedUi(id, on) {
    var card = document.getElementById("card-" + id);
    var item = listById[id];
    var btns = [];
    if (card) btns.push(card.querySelector(".studied-btn"));
    if (item) btns.push(item.querySelector(".studied-btn"));
    btns.forEach(function (btn) {
      if (!btn) return;
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.setAttribute("aria-label", on ? "Studied — click to unmark" : "Mark as studied");
      btn.setAttribute("title", on ? "Studied" : "Mark studied");
    });
    if (card) {
      card.dataset.studied = on ? "true" : "false";
      card.classList.toggle("is-studied", on);
    }
    if (item) {
      item.dataset.studied = on ? "true" : "false";
      item.classList.toggle("is-studied", on);
    }
  }

  function deckIndex(card) {
    return deckOrder.indexOf(card);
  }

  function pageSizeValue() {
    var v = pageSizeSel.value;
    if (v === "all") return 0;
    var n = parseInt(v, 10);
    return isNaN(n) || n < 1 ? 25 : n;
  }

  function filteredCards() {
    var lek = lektionSel.value;
    var lvl = levelSel.value;
    var pos = posSel.value;
    var studiedFilter = studiedSel.value;
    var sort = sortSel.value;
    var visible = cards.filter(function (card) {
      if (lek !== "all" && card.dataset.lektion !== lek) return false;
      if (lvl !== "all" && card.dataset.level !== lvl) return false;
      if (pos !== "all" && card.dataset.pos !== pos) return false;
      var id = cardIdFor(card);
      if (studiedFilter === "studied" && !isStudied(id)) return false;
      if (studiedFilter === "unstudied" && isStudied(id)) return false;
      return true;
    });
    if (sort === "date-asc") {
      visible.sort(function (a, b) {
        return (Number(a.dataset.createdMs) || 0) - (Number(b.dataset.createdMs) || 0);
      });
    } else if (sort === "date-desc") {
      visible.sort(function (a, b) {
        return (Number(b.dataset.createdMs) || 0) - (Number(a.dataset.createdMs) || 0);
      });
    } else {
      visible.sort(function (a, b) {
        return deckIndex(a) - deckIndex(b);
      });
    }
    return visible;
  }

  function cardsNeedReorder(pageSlice) {
    var shown = Array.from(deck.querySelectorAll(".card:not(.is-hidden)"));
    if (shown.length !== pageSlice.length) return true;
    for (var i = 0; i < pageSlice.length; i++) {
      if (shown[i] !== pageSlice[i]) return true;
    }
    return false;
  }

  function refreshDeckCount(visible) {
    if (!visible) visible = filteredCards();
    var studiedCount = visible.filter(function (c) { return isStudied(cardIdFor(c)); }).length;
    var size = pageSizeValue();
    var total = visible.length;
    var pages = size === 0 ? 1 : Math.max(1, Math.ceil(total / size));
    if (currentPage >= pages) currentPage = Math.max(0, pages - 1);
    var start = size === 0 ? 0 : currentPage * size;
    var end = size === 0 ? total : Math.min(start + size, total);
    var parts = [];
    if (total === 0) {
      parts.push("0 of " + cards.length + " cards");
    } else if (size === 0) {
      parts.push(total + " of " + cards.length + " cards");
    } else {
      parts.push("Showing " + (start + 1) + "\\u2013" + end + " of " + total
        + " (deck " + cards.length + ")");
    }
    if (studiedCount > 0) parts.push(studiedCount + " studied in view");
    countEl.textContent = parts.join(" \\u00b7 ");
  }

  function applyPagination(visible) {
    var size = pageSizeValue();
    var total = visible.length;
    var pages = size === 0 ? 1 : Math.max(1, Math.ceil(total / size));
    if (currentPage >= pages) currentPage = Math.max(0, pages - 1);
    var start = size === 0 ? 0 : currentPage * size;
    var end = size === 0 ? total : Math.min(start + size, total);
    var pageSlice = size === 0 ? visible : visible.slice(start, end);
    var pageIds = {};
    pageSlice.forEach(function (card) {
      pageIds[cardIdFor(card)] = true;
    });

    cards.forEach(function (card) {
      var show = pageIds[cardIdFor(card)];
      card.classList.toggle("is-hidden", !show);
    });
    if (cardsNeedReorder(pageSlice)) {
      pageSlice.forEach(function (card) {
        deck.appendChild(card);
      });
    }
    listItems.forEach(function (item) {
      item.classList.toggle("is-hidden", !pageIds[item.dataset.cardId]);
    });

    if (pageFirst) pageFirst.disabled = currentPage <= 0 || size === 0 || total === 0;
    if (pagePrev) pagePrev.disabled = currentPage <= 0 || size === 0 || total === 0;
    if (pageNext) pageNext.disabled = currentPage >= pages - 1 || size === 0 || total === 0;
    if (pageLast) pageLast.disabled = currentPage >= pages - 1 || size === 0 || total === 0;
    if (pageCurrent) {
      if (total === 0) {
        pageCurrent.textContent = "\\u2014";
        pageCurrent.removeAttribute("aria-current");
      } else if (size === 0) {
        pageCurrent.textContent = "1";
        pageCurrent.setAttribute("aria-current", "page");
      } else {
        pageCurrent.textContent = String(currentPage + 1);
        pageCurrent.setAttribute("aria-current", "page");
      }
    }
    return { total: total, start: start, end: end, pages: pages };
  }

  function apply() {
    var scrollX = window.scrollX;
    var scrollY = window.scrollY;
    var visible = filteredCards();
    var pg = applyPagination(visible);
    var view = viewSel.value;
    deck.classList.toggle("is-hidden", view !== "cards");
    if (list) list.classList.toggle("is-hidden", view !== "list");
    refreshDeckCount(visible);
    syncFilterStyles();
    window.scrollTo(scrollX, scrollY);
  }

  function syncFilterStyles() {
    var pairs = [
      [lektionSel, "all"],
      [levelSel, "all"],
      [posSel, "all"],
      [studiedSel, "all"],
      [sortSel, "deck"],
      [viewSel, "cards"],
      [pageSizeSel, "25"]
    ];
    pairs.forEach(function (pair) {
      var sel = pair[0];
      var def = pair[1];
      if (!sel) return;
      var label = sel.closest("label");
      if (label) label.classList.toggle("is-active", sel.value !== def);
    });
  }

  function toggleStudied(id) {
    if (!id) return;
    var next = !isStudied(id);
    setStudiedUi(id, next);
    if (studiedSel.value === "all") {
      refreshDeckCount();
    } else {
      apply();
    }
    fetch("/api/vocab/studied", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: id, studied: next })
    }).then(function (res) {
      if (!res.ok) throw new Error("studied save failed");
    }).catch(function () {
      setStudiedUi(id, !next);
      if (studiedSel.value === "all") {
        refreshDeckCount();
      } else {
        apply();
      }
      if (!studiedSaveFailed) {
        studiedSaveFailed = true;
        console.warn("Could not save studied flag to vocab.manifest.json (read-only host). Use: python -m daf_vocab serve");
      }
    });
  }

  function goToCard(id) {
    if (!id) return;
    viewSel.value = "cards";
    var visible = filteredCards();
    var idx = -1;
    for (var i = 0; i < visible.length; i++) {
      if (cardIdFor(visible[i]) === id) { idx = i; break; }
    }
    if (idx < 0) return;
    var size = pageSizeValue();
    if (size > 0) currentPage = Math.floor(idx / size);
    apply();
    var el = document.getElementById("card-" + id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  document.addEventListener("click", function (e) {
    var studiedBtn = e.target.closest(".studied-btn");
    if (studiedBtn) {
      e.preventDefault();
      e.stopPropagation();
      var host = studiedBtn.closest("[data-card-id]");
      if (host) toggleStudied(host.dataset.cardId);
      return;
    }
    var link = e.target.closest(".vocab-list-link");
    if (link) {
      e.preventDefault();
      var item = link.closest(".vocab-list-item");
      if (item) goToCard(item.dataset.cardId);
    }
  });

  function onFilterChange() {
    currentPage = 0;
    apply();
  }

  lektionSel.addEventListener("change", onFilterChange);
  levelSel.addEventListener("change", onFilterChange);
  posSel.addEventListener("change", onFilterChange);
  studiedSel.addEventListener("change", onFilterChange);
  sortSel.addEventListener("change", onFilterChange);
  viewSel.addEventListener("change", apply);
  pageSizeSel.addEventListener("change", function () {
    currentPage = 0;
    apply();
  });
  if (pageFirst) {
    pageFirst.addEventListener("click", function () {
      if (currentPage > 0) { currentPage = 0; apply(); }
    });
  }
  if (pagePrev) {
    pagePrev.addEventListener("click", function () {
      if (currentPage > 0) { currentPage -= 1; apply(); }
    });
  }
  if (pageNext) {
    pageNext.addEventListener("click", function () {
      currentPage += 1;
      apply();
    });
  }
  if (pageLast) {
    pageLast.addEventListener("click", function () {
      var visible = filteredCards();
      var size = pageSizeValue();
      var pages = size === 0 ? 1 : Math.max(1, Math.ceil(visible.length / size));
      if (currentPage < pages - 1) { currentPage = pages - 1; apply(); }
    });
  }

  apply();
})();
"""


def iso_to_ms(iso: str | None) -> int:
    """Parse ISO 8601 UTC timestamps for client-side date sort."""

    if not iso or not str(iso).strip():
        return 0
    s = str(iso).strip()
    if s.endswith("Z"):
        s = s[:-1] + "+00:00"
    try:
        return int(datetime.fromisoformat(s).timestamp() * 1000)
    except ValueError:
        return 0


def collect_filter_options(cards: list[dict[str, Any]]) -> tuple[list[int], list[str], list[str]]:
    lektions: set[int] = set()
    levels: set[str] = set()
    for card in cards:
        if not isinstance(card, dict):
            continue
        lek = card.get("lektion")
        if isinstance(lek, int):
            lektions.add(lek)
        elif lek is not None:
            try:
                lektions.add(int(lek))
            except (TypeError, ValueError):
                pass
        lvl = card.get("level")
        if isinstance(lvl, str) and lvl.strip():
            levels.add(lvl.strip())
    return sorted(lektions), sorted(levels), collect_pos_options(cards)


def deck_number_for_index(index: int, total: int) -> int:
    """Display #1 on the last manifest card (oldest); #N on the first (newest prepend)."""

    return total - index


def card_dom_id(card: dict[str, Any], deck_no: int) -> str:
    raw = str(card.get("id") or "").strip()
    if raw:
        return raw
    return f"card-{deck_no}"


def card_list_label(card: dict[str, Any]) -> str:
    head = str(card.get("head") or "").strip()
    return head or str(card.get("head") or "").strip()


def head_block_html(head_raw: str, ipa: str | None = None) -> str:
    """Lemma bold; IPA muted (same line, lighter weight and color)."""
    if ipa is not None:
        lemma = head_raw.strip()
        ipa_bare = normalize_ipa_storage(ipa)
    else:
        lemma, ipa_bare = normalize_head_ipa_fields({"head": head_raw})
    lemma_esc = html.escape(lemma)
    ipa_display = format_ipa_display(ipa_bare)
    if ipa_display:
        return (
            f'<div class="head">{lemma_esc}'
            f'<span class="head-ipa">{html.escape(ipa_display)}</span></div>'
        )
    return f'<div class="head">{html.escape(lemma)}</div>'


def card_studied_flag(card: dict[str, Any]) -> bool:
    return bool(card.get("studied"))


def studied_button_html(*, studied: bool = False) -> str:
    pressed = "true" if studied else "false"
    label = "Studied — click to unmark" if studied else "Mark as studied"
    title = "Studied" if studied else "Mark studied"
    return (
        f'<button type="button" class="studied-btn" aria-pressed="{pressed}"'
        f' aria-label="{html.escape(label)}" title="{html.escape(title)}">'
        + studied_off_icon_svg()
        + studied_on_icon_svg()
        + "</button>"
    )


def card_data_attrs(card: dict[str, Any], *, deck_no: int) -> str:
    lek = card.get("lektion")
    lek_attr = ""
    if lek is not None:
        lek_attr = str(int(lek)) if isinstance(lek, int) else html.escape(str(lek).strip())
    level = card.get("level")
    level_attr = html.escape(str(level).strip()) if level else ""
    pos_attr = html.escape(normalize_pos(card), quote=True)
    created = card.get("createdAt") or card.get("updatedAt")
    created_ms = iso_to_ms(str(created) if created else None)
    cid = html.escape(card_dom_id(card, deck_no), quote=True)
    studied = "true" if card_studied_flag(card) else "false"
    return (
        f' id="card-{cid}"'
        f' data-card-id="{cid}"'
        f' data-deck-no="{deck_no}"'
        f' data-lektion="{lek_attr}"'
        f' data-level="{level_attr}"'
        f' data-pos="{pos_attr}"'
        f' data-created-ms="{created_ms}"'
        f' data-studied="{studied}"'
    )


def vocab_list_item_html(card: dict[str, Any], deck_no: int) -> str:
    cid = html.escape(card_dom_id(card, deck_no), quote=True)
    label = html.escape(card_list_label(card))
    lek = card.get("lektion")
    studied = card_studied_flag(card)
    pos = normalize_pos(card)
    item_cls = "vocab-list-item is-studied" if studied else "vocab-list-item"
    studied_attr = "true" if studied else "false"
    lek_badge = ""
    if lek is not None:
        lek_badge = f'<span class="vocab-list-meta">L{html.escape(str(lek))}</span>'
    pos_badge = f'<span class="vocab-list-meta vocab-list-pos">{html.escape(pos_label(pos))}</span>'
    return (
        f'<li class="{item_cls}" data-card-id="{cid}" data-deck-no="{deck_no}"'
        f' data-lektion="{html.escape(str(lek)) if lek is not None else ""}"'
        f' data-pos="{html.escape(pos, quote=True)}"'
        f' data-studied="{studied_attr}">'
        + studied_button_html(studied=studied)
        + f'<a class="vocab-list-link" href="#card-{cid}">'
        f'<span class="vocab-list-no">{deck_no}</span>'
        f'<span class="vocab-list-lemma">{label}</span>'
        f"</a>{lek_badge}{pos_badge}</li>"
    )


def vocab_list_html(cards: list[dict[str, Any]]) -> str:
    valid = [c for c in cards if isinstance(c, dict) and str(c.get("head") or "").strip()]
    total = len(valid)
    items = [
        vocab_list_item_html(card, deck_number_for_index(i, total))
        for i, card in enumerate(valid)
    ]
    return '<ol id="vocab-list" class="vocab-list view-pane is-hidden">' + "".join(items) + "</ol>"


def page_size_label_html() -> str:
    return (
        '<label id="page-size-label" class="page-size-control">Per page <select id="page-size">'
        '<option value="10">10</option>'
        '<option value="25" selected>25</option>'
        '<option value="50">50</option>'
        '<option value="100">100</option>'
        '<option value="all">All</option>'
        "</select></label>"
    )


def pagination_html() -> str:
    return (
        '<nav class="deck-pagination" id="pagination" aria-label="Pagination">'
        '<div class="deck-pagination-inner">'
        '<div class="deck-pagination-size" id="page-size-slot">'
        + page_size_label_html()
        + "</div>"
        '<div class="deck-pagination-nav">'
        '<button type="button" id="page-first" class="page-edge page-edge--jump" disabled aria-label="First page">'
        + chevron_double_left_icon_svg()
        + "</button>"
        '<button type="button" id="page-prev" class="page-edge" disabled aria-label="Previous page">'
        + chevron_left_icon_svg()
        + "</button>"
        '<span class="page-current" id="page-current" aria-live="polite">1</span>'
        '<button type="button" id="page-next" class="page-edge" aria-label="Next page">'
        + chevron_right_icon_svg()
        + "</button>"
        '<button type="button" id="page-last" class="page-edge page-edge--jump" aria-label="Last page">'
        + chevron_double_right_icon_svg()
        + "</button>"
        "</div>"
        "</div>"
        "</nav>"
    )


def pronounce_button_html(audio_path: str | None, *, compact: bool = False) -> str:
    """Small round play button; ``audio_path`` like ``/audio/lemma.mp3``."""

    audio = str(audio_path or "").strip()
    if not audio:
        return ""
    src_path = audio.lstrip("/") if audio.startswith("/") else audio
    src = html.escape(src_path, quote=True)
    cls = "pronounce-btn pronounce-btn--ex" if compact else "pronounce-btn"
    return (
        f'<button type="button" class="{cls}" data-audio="'
        + src
        + '" aria-label="Play pronunciation" title="Listen">'
        + play_icon_svg()
        + "</button>"
    )


def zoomable_image_html(*, src_path: str, alt: str) -> str:
    """Thumbnail button that opens a full-size lightbox on click."""

    src = html.escape(src_path, quote=True)
    alt_esc = html.escape(alt)
    label = html.escape(f"Open image: {alt}")
    return (
        f'<button type="button" class="zoomable-image" data-lightbox-src="{src}" '
        f'aria-label="{label}">'
        f'<img src="{src}" alt="{alt_esc}" loading="lazy" />'
        "</button>"
    )


def image_lightbox_html() -> str:
    return (
        '<div id="image-lightbox" class="image-lightbox" aria-hidden="true" role="dialog" '
        'aria-modal="true" aria-label="Image preview">'
        '<button type="button" class="image-lightbox-close" aria-label="Close preview">&times;</button>'
        '<img class="image-lightbox-img" src="" alt="" />'
        "</div>"
    )


def card_image_block_html(card: dict[str, Any]) -> str:
    image = str(card.get("image") or "").strip()
    if not image:
        return ""
    src_path = image.lstrip("/") if image.startswith("/") else image
    alt = f"{str(card.get('head') or '').strip()} image"
    return (
        '<div class="card-image">'
        + zoomable_image_html(src_path=src_path, alt=alt)
        + "</div>"
    )


def deck_controls_html(lektions: list[int], levels: list[str], pos_values: list[str]) -> str:
    lek_opts = ['<option value="all">All</option>']
    for n in lektions:
        lek_opts.append(f'<option value="{n}">Lektion {n}</option>')
    lvl_opts = ['<option value="all">All</option>']
    for lv in levels:
        esc = html.escape(lv)
        lvl_opts.append(f'<option value="{esc}">{esc}</option>')
    pos_opts = ['<option value="all">All</option>']
    for pv in pos_values:
        esc = html.escape(pv)
        pos_opts.append(f'<option value="{esc}">{html.escape(pos_label(pv))}</option>')
    return (
        '<div class="deck-controls" role="region" aria-label="Filter and sort">'
        '<div class="deck-controls-row">'
        '<label>Lektion <select id="filter-lektion">'
        + "".join(lek_opts)
        + "</select></label>"
        '<label>Level <select id="filter-level">'
        + "".join(lvl_opts)
        + "</select></label>"
        '<label>Type <select id="filter-pos">'
        + "".join(pos_opts)
        + "</select></label>"
        '<label>Studied <select id="filter-studied">'
        '<option value="all">All</option>'
        '<option value="studied">Studied</option>'
        '<option value="unstudied">Not studied</option>'
        "</select></label>"
        '<label>Sort <select id="sort-order">'
        '<option value="deck">Deck order (#)</option>'
        '<option value="date-desc">Date: newest first</option>'
        '<option value="date-asc">Date: oldest first</option>'
        "</select></label>"
        '<label>View <select id="view-mode">'
        '<option value="cards">Cards</option>'
        '<option value="list">List</option>'
        "</select></label>"
        '<div id="page-size-controls-slot"></div>'
        "</div>"
        '<p class="deck-count" id="deck-count" aria-live="polite"></p>'
        "</div>"
    )


def format_grammar_phrase_cell_html(text: str) -> str:
    parts: list[str] = []
    for chunk, is_suffix in iter_grammar_adj_suffix_runs(text):
        if chunk == "":
            continue
        esc = html.escape(chunk)
        if is_suffix:
            parts.append(f'<strong class="grammar-adj-sfx">{esc}</strong>')
        else:
            parts.append(esc)
    return "".join(parts)


def grammar_table_block_html(gt: dict[str, Any]) -> str:
    cols = gt["columns"]
    rows = gt["rows"]
    nc = len(cols)
    narrow_first_col = nc > 0 and str(cols[0]).strip() == ""
    cg_bits = ["<colgroup>"]
    if narrow_first_col:
        cg_bits.append('<col class="grammar-col-case" />')
        if nc > 1:
            cg_bits.append(f'<col span="{nc - 1}" />')
    elif nc:
        cg_bits.append(f'<col span="{nc}" />')
    cg_bits.append("</colgroup>")
    thead = "<thead><tr>" + "".join(f"<th>{html.escape(str(c))}</th>" for c in cols) + "</tr></thead>"
    tbody_parts = ["<tbody>"]
    for row in rows:
        tbody_parts.append("<tr>")
        for j in range(nc):
            raw = row[j] if j < len(row) else ""
            inner = html.escape(str(raw)) if j == 0 else format_grammar_phrase_cell_html(str(raw))
            tbody_parts.append(f"<td>{inner}</td>")
        tbody_parts.append("</tr>")
    tbody_parts.append("</tbody>")
    inner_tbl = "".join(cg_bits) + thead + "".join(tbody_parts)
    return f'<div class="grammar-table-wrap"><table class="grammar-table">{inner_tbl}</table></div>'


def render_preview_page_html(*, title: str, active: str, body: list[str]) -> str:
    """Full HTML document with shared site header and stylesheet."""

    parts: list[str] = [
        "<!DOCTYPE html>",
        '<html lang="de">',
        "<head>",
        '<meta charset="utf-8"/>',
        '<meta name="viewport" content="width=device-width, initial-scale=1"/>',
        f"<title>{html.escape(title)}</title>",
        "<style>",
        CSS,
        "</style>",
        "</head>",
        "<body>",
        site_header_html(active=active),
        *body,
        image_lightbox_html(),
        "<script>",
        IMAGE_LIGHTBOX_JS,
        "</script>",
        "</body></html>",
    ]
    return "\n".join(parts)


def render_vocab_html(cards: list[dict[str, Any]]) -> str:
    valid_cards = [c for c in cards if isinstance(c, dict) and str(c.get("head") or "").strip()]
    lektions, levels, pos_values = collect_filter_options(valid_cards)

    parts: list[str] = [
        deck_controls_html(lektions, levels, pos_values),
        pagination_html(),
        vocab_list_html(valid_cards),
        '<div id="deck" class="view-pane">',
    ]

    deck_total = len(valid_cards)
    for i, card in enumerate(valid_cards):
        deck_no = deck_number_for_index(i, deck_total)
        studied = card_studied_flag(card)
        studied_btn = studied_button_html(studied=studied)
        audio_btn = pronounce_button_html(str(card.get("audio") or ""))
        head_text = str(card.get("head") or "")
        ipa_text = str(card.get("ipa") or "").strip() or None

        lektion = card.get("lektion")
        level = card.get("level")
        meta_parts = [f"#{deck_no}"]
        if lektion is not None:
            meta_parts.append(f"Lektion {html.escape(str(lektion))}")
        if level:
            meta_parts.append(html.escape(str(level)))
        card_pos = normalize_pos(card)
        meta_html = ""
        if meta_parts or card_pos:
            spans = "".join(f"<span>{p}</span>" for p in meta_parts)
            if card_pos:
                spans += f'<span class="meta-pos">{html.escape(pos_label(card_pos))}</span>'
            meta_html = f'<div class="meta">{spans}</div>'

        parts.append(f'<article class="card{" is-studied" if studied else ""}"{card_data_attrs(card, deck_no=deck_no)}>')
        parts.append(
            '<div class="head-line">'
            + head_block_html(head_text, ipa_text)
            + studied_btn
            + (audio_btn or "")
            + "</div>"
        )
        parts.append(meta_html)

        plural_rule, plural_form = normalize_plural_fields(card)
        if plural_rule and plural_form:
            diag = format_plural_line(plural_rule, plural_form)
            parts.append(f'<div class="plural-diagram">{html.escape(diag)}</div>')

        for g in card.get("gloss") or []:
            if isinstance(g, str) and g.strip():
                parts.append(f'<p class="gloss">{html.escape(g.strip())}</p>')

        img_block = card_image_block_html(card)
        if img_block:
            parts.append(img_block)

        for n in card.get("notes") or []:
            if isinstance(n, str) and n.strip():
                parts.append(f'<div class="notes">{html.escape(n.strip())}</div>')

        gt_render = normalize_grammar_table(card.get("grammarTable"))
        if gt_render:
            parts.append(grammar_table_block_html(gt_render))

        examples = normalize_examples_from_card(card)
        if examples:
            parts.append('<div class="ex-block">')
            for ex in examples:
                de = (ex.get("german") or "").strip()
                en = ex.get("english")
                if not de and not en:
                    continue
                parts.append('<div class="ex-line">')
                ex_btn = pronounce_button_html(str(ex.get("audio") or ""), compact=True)
                if ex_btn:
                    parts.append(ex_btn)
                parts.append('<span class="ex-line-text">')
                parts.append('<span class="chevr">›</span>')
                parts.append(f'<span class="ex-de">{html.escape(de)}</span>')
                if en:
                    parts.append(" ")
                    inner = str(en).strip()
                    parts.append(f'<span class="ex-en">({html.escape(inner)})</span>')
                parts.append("</span></div>")
            parts.append("</div>")

        parts.append("</article>")

    parts.append("</div>")
    parts.append(
        '<footer>Static preview from vocab.manifest.json — run <code>python -m daf_vocab serve</code> to refresh.</footer>'
    )
    parts.append("<script>")
    parts.append(PRONOUNCE_JS)
    parts.append(DECK_UI_JS)
    parts.append("</script>")
    return render_preview_page_html(title=TITLE_PAGE, active="vocab", body=parts)


LESSON_PAGES_TITLE = "daf — lesson pages"


def render_lesson_pages_html(pages: list[tuple[str, str]]) -> str:
    items: list[str] = ['<ul class="lesson-list">']
    for label, src in pages:
        esc_label = html.escape(label)
        src_path = src.lstrip("/") if src.startswith("/") else src
        items.extend(
            [
                '<li class="lesson-item">',
                f'<div><a href="{html.escape(src_path, quote=True)}" target="_blank" rel="noopener">{esc_label} — open full image</a></div>',
                zoomable_image_html(src_path=src_path, alt=label),
                "</li>",
            ]
        )
    items.append("</ul>")
    return render_preview_page_html(title=LESSON_PAGES_TITLE, active="lessons", body=items)


def site_header_html(*, active: str) -> str:
    """Shared top header for all preview pages."""

    vocab_cls = "is-active" if active == "vocab" else ""
    lesson_cls = "is-active" if active == "lessons" else ""
    return (
        '<header class="site-header" role="banner">'
        '<div class="site-header-row">'
        '<div class="site-brand">'
        '<img src="images/header-title.png" alt="DaF kompakt — Deutsch als Fremdsprache" />'
        "</div>"
        '<nav class="site-nav" aria-label="Preview pages">'
        f'<a class="{vocab_cls}" href="index.html">Vocabulary</a>'
        f'<a class="{lesson_cls}" href="lesson-pages.html">Lesson Pages</a>'
        "</nav>"
        "</div>"
        "</header>"
    )


def default_lesson_pages_manifest() -> list[dict[str, Any]]:
    """Fallback lesson-page structure when no manifest exists yet."""

    return [
        {
            "lektion": 1,
            "title": "Lektion 1",
            "wordPage": {
                "label": "Words page",
                "image": "/lesson-pages/kursbuch-page-16.png",
            },
            "grammarPage": {
                "label": "Grammar page",
                "image": "/lesson-pages/kursbuch-page-17.png",
            },
        }
    ]


def load_lesson_pages_manifest(repo_root: Path) -> list[dict[str, Any]]:
    """Read lesson page metadata for scalable per-lesson rendering."""

    manifest_path = repo_root / "lesson-pages.manifest.json"
    if not manifest_path.exists():
        return default_lesson_pages_manifest()
    try:
        blob = json.loads(manifest_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return default_lesson_pages_manifest()
    if not isinstance(blob, list):
        return default_lesson_pages_manifest()
    out: list[dict[str, Any]] = []
    for item in blob:
        if not isinstance(item, dict):
            continue
        lek = item.get("lektion")
        if not isinstance(lek, int):
            try:
                lek = int(lek)
            except (TypeError, ValueError):
                continue
        title = str(item.get("title") or f"Lektion {lek}").strip() or f"Lektion {lek}"
        wp = item.get("wordPage")
        gp = item.get("grammarPage")
        if not isinstance(wp, dict) or not isinstance(gp, dict):
            continue
        wp_img = str(wp.get("image") or "").strip()
        gp_img = str(gp.get("image") or "").strip()
        if not wp_img or not gp_img:
            continue
        out.append(
            {
                "lektion": lek,
                "title": title,
                "wordPage": {
                    "label": str(wp.get("label") or "Words page").strip() or "Words page",
                    "image": wp_img,
                },
                "grammarPage": {
                    "label": str(gp.get("label") or "Grammar page").strip() or "Grammar page",
                    "image": gp_img,
                },
            }
        )
    return sorted(out, key=lambda x: int(x["lektion"])) or default_lesson_pages_manifest()


def render_lesson_hub_html(lessons: list[dict[str, Any]]) -> str:
    link_items: list[str] = []
    cards: list[str] = []
    for lesson in lessons:
        title = html.escape(str(lesson.get("title") or "").strip())
        lek = html.escape(str(lesson.get("lektion")))
        wp = lesson["wordPage"]
        gp = lesson["grammarPage"]
        wp_src = html.escape(str(wp["image"]).lstrip("/"), quote=True)
        gp_src = html.escape(str(gp["image"]).lstrip("/"), quote=True)
        wp_path = str(wp["image"]).lstrip("/")
        gp_path = str(gp["image"]).lstrip("/")
        title_plain = str(lesson.get("title") or "").strip()
        wp_lbl = html.escape(str(wp["label"]))
        gp_lbl = html.escape(str(gp["label"]))
        link_items.append(
            f'<li>{title}: <a href="{wp_src}" target="_blank" rel="noopener">{wp_lbl}</a> · '
            f'<a href="{gp_src}" target="_blank" rel="noopener">{gp_lbl}</a></li>'
        )
        cards.append(
            (
                '<li class="lesson-item">'
                f"<h2>{title}</h2>"
                f'<div class="meta"><span>Lektion {lek}</span></div>'
                '<div class="deck-controls-row">'
                "<div>"
                f'<div><a href="{wp_src}" target="_blank" rel="noopener">{wp_lbl} — open full image</a></div>'
                + zoomable_image_html(src_path=wp_path, alt=f"{title_plain} words page")
                + "</div>"
                "<div>"
                f'<div><a href="{gp_src}" target="_blank" rel="noopener">{gp_lbl} — open full image</a></div>'
                + zoomable_image_html(src_path=gp_path, alt=f"{title_plain} grammar page")
                + "</div>"
                "</div>"
                "</li>"
            )
        )
    body = [
        '<section class="lesson-links">',
        "<h2>Lesson Links</h2>",
        "<ul>",
        *link_items,
        "</ul>",
        "</section>",
        '<section class="lesson-previews">',
        '<h2 class="lesson-preview-title">Page Previews</h2>',
        '<ul class="lesson-list">',
        *cards,
        "</ul>",
        "</section>",
    ]
    return render_preview_page_html(title=LESSON_PAGES_TITLE, active="lessons", body=body)


def _copy_web_public_asset(manifest_root: Path, preview_root: Path, url_path: str) -> None:
    """Copy ``/images/…`` or ``/audio/…`` from ``web/public`` into the preview tree."""

    rel = str(url_path or "").strip().lstrip("/")
    if not rel.startswith(("images/", "audio/")):
        return
    src = manifest_root / "web" / "public" / rel
    dst = preview_root / rel
    if src.exists():
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dst)


def write_vocab_preview(
    manifest_path: Path,
    out_path: Path | None = None,
) -> Path:
    """Read manifest JSON and write ``index.html`` and ``lesson-pages.html``."""

    manifest_path = Path(manifest_path)
    if out_path is None:
        out_path = manifest_path.parent / "vocab-preview" / "index.html"
    out_path = Path(out_path)
    blob = json.loads(manifest_path.read_text(encoding="utf-8"))
    if not isinstance(blob, list):
        raise ValueError("Manifest must be a JSON array")
    html_out = render_vocab_html(blob)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    preview_root = out_path.parent
    out_path.write_text(html_out, encoding="utf-8")

    shutil.copy2(manifest_path, preview_root / "vocab.manifest.json")

    # Lesson pages hub: scalable per lesson (words + grammar).
    lessons = load_lesson_pages_manifest(manifest_path.parent)
    lesson_html = render_lesson_hub_html(lessons)
    (out_path.parent / "lesson-pages.html").write_text(lesson_html, encoding="utf-8")

    # Preview is served from vocab-preview/, so copy assets referenced by cards.
    preview_root = out_path.parent
    repo_root = manifest_path.parent
    for card in blob:
        if not isinstance(card, dict):
            continue
        _copy_web_public_asset(repo_root, preview_root, str(card.get("image") or ""))
        _copy_web_public_asset(repo_root, preview_root, str(card.get("audio") or ""))
        for ex in normalize_examples_from_card(card):
            _copy_web_public_asset(repo_root, preview_root, str(ex.get("audio") or ""))

    # Shared header logo image.
    logo_src = manifest_path.parent / "web" / "public" / "images" / "header-title.png"
    logo_dst = out_path.parent / "images" / "header-title.png"
    if logo_src.exists():
        logo_dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(logo_src, logo_dst)

    # Copy lesson page images used by the lesson-pages hub.
    for lesson in lessons:
        for block_key in ("wordPage", "grammarPage"):
            block = lesson.get(block_key)
            if not isinstance(block, dict):
                continue
            rel_raw = str(block.get("image") or "").strip()
            if not rel_raw:
                continue
            rel = rel_raw.lstrip("/")
            src = manifest_path.parent / "web" / "public" / rel
            dst = out_path.parent / rel
            if src.exists():
                dst.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(src, dst)
    return out_path
