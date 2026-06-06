# -*- coding: utf-8 -*-
"""Inline Heroicons v2 SVG snippets (MIT) for static HTML preview.

Paths from https://heroicons.com — embedded at build time; no npm/CDN.
"""

from __future__ import annotations

_HEROICON_NS = 'xmlns="http://www.w3.org/2000/svg"'

# solid, 24×24
ICON_PLAY_SOLID = (
    '<path fill-rule="evenodd" '
    'd="M4.5 5.653c0-1.886 2.122-3.017 3.78-1.98l11.526 6.347c1.603.883 1.603 3.181 0 4.064'
    'l-11.526 6.347c-1.658 1.037-3.78-.094-3.78-1.98V5.653Z" clip-rule="evenodd" />'
)

# outline, 24×24
ICON_CIRCLE_OUTLINE = (
    '<path stroke-linecap="round" stroke-linejoin="round" '
    'd="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />'
)

# outline, 24×24 — pagination
ICON_CHEVRON_LEFT = (
    '<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />'
)
ICON_CHEVRON_RIGHT = (
    '<path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />'
)
ICON_CHEVRON_DOUBLE_RIGHT = (
    '<path stroke-linecap="round" stroke-linejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5" />'
    '<path stroke-linecap="round" stroke-linejoin="round" d="M17.25 4.5l7.5 7.5-7.5 7.5" />'
)

# solid, 24×24
ICON_CHECK_CIRCLE_SOLID = (
    '<path fill-rule="evenodd" '
    'd="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clip-rule="evenodd" />'
)


def _svg(*, paths: str, solid: bool, extra_class: str = "") -> str:
    cls = f' class="heroicon{" heroicon--solid" if solid else " heroicon--outline"}'
    if extra_class:
        cls += f" {extra_class}"
    cls += '"'
    fill = ' fill="currentColor"' if solid else ' fill="none"'
    stroke = "" if solid else ' stroke="currentColor" stroke-width="1.5"'
    return (
        f"<svg {_HEROICON_NS}{cls} viewBox=\"0 0 24 24\"{fill}{stroke} "
        'aria-hidden="true">'
        f"{paths}</svg>"
    )


def play_icon_svg() -> str:
    return _svg(paths=ICON_PLAY_SOLID, solid=True)


def studied_off_icon_svg() -> str:
    return _svg(paths=ICON_CIRCLE_OUTLINE, solid=False, extra_class="studied-svg-off")


def studied_on_icon_svg() -> str:
    return _svg(paths=ICON_CHECK_CIRCLE_SOLID, solid=True, extra_class="studied-svg-on")


def chevron_left_icon_svg() -> str:
    return _svg(paths=ICON_CHEVRON_LEFT, solid=False)


def chevron_right_icon_svg() -> str:
    return _svg(paths=ICON_CHEVRON_RIGHT, solid=False)


def chevron_double_left_icon_svg() -> str:
    """Mirror of double-right — the hand-authored left paths share a tip and cross on the right arm."""

    return _svg(
        paths=ICON_CHEVRON_DOUBLE_RIGHT,
        solid=False,
        extra_class="heroicon--double heroicon--mirror-x",
    )


def chevron_double_right_icon_svg() -> str:
    return _svg(paths=ICON_CHEVRON_DOUBLE_RIGHT, solid=False, extra_class="heroicon--double")
