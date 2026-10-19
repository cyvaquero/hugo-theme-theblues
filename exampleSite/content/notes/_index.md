---
title: "Questions & answers"
# Test case (docs/testing.md): a section whose address has an "&", so its feed's atom:link must escape it (#395).
url: "/q&a/"
---

A wide table and an indented (so unhighlighted) block of preformatted text in a page body (`.pb`), both wider than the column (#396). The table is wrapped in a focusable, labeled region.

| Column1-unbreakable-header | Column2-unbreakable-header | Column3-unbreakable-header | Column4-unbreakable-header | Column5-unbreakable-header | Column6-unbreakable-header | Column7-unbreakable-header | Column8-unbreakable-header |
| :---: | --- | --- | :---: | --- | --- | :---: | --- |
| cell1x1-with-text-that-does-not-wrap | cell1x2-with-text-that-does-not-wrap | cell1x3-with-text-that-does-not-wrap | cell1x4-with-text-that-does-not-wrap | cell1x5-with-text-that-does-not-wrap | cell1x6-with-text-that-does-not-wrap | cell1x7-with-text-that-does-not-wrap | cell1x8-with-text-that-does-not-wrap |
| cell2x1-with-text-that-does-not-wrap | cell2x2-with-text-that-does-not-wrap | cell2x3-with-text-that-does-not-wrap | cell2x4-with-text-that-does-not-wrap | cell2x5-with-text-that-does-not-wrap | cell2x6-with-text-that-does-not-wrap | cell2x7-with-text-that-does-not-wrap | cell2x8-with-text-that-does-not-wrap |

    $ a-very-long-line-of-unhighlighted-text --that-has-no-break --and-runs-past-the-edge-of-the-column --on-a-phone --and-a-desktop --too --and-more --and-more --and-more
    second line
