# Retheme mockups

Static HTML mockups for The Blues theme (issue #4). Palette B, light and dark, hamburger nav below 820 px. They are
design sketches, not theme code: single files with inline CSS and JS, no libraries or web fonts. The photos are hotlinked
from the site's SmugMug URLs, so viewing them needs a network connection. Open them in a browser; each has a top bar with
tabs and Light/Dark buttons.

## Chosen

| File | What it is |
|---|---|
| [directions/direction-c-v3.html](directions/direction-c-v3.html) | **The chosen layout (decision D12).** Masonry home mixing photos and article tiles, calm "View options" popover controls, A+ hero, serif headlines. Tabs: Home, Photo post, Article. |

## Proposed (decision D14)

| File | What it is |
|---|---|
| [directions/direction-c-v3-tags.html](directions/direction-c-v3-tags.html) | v3 plus a "Browse by tag" section with three styles (1 Pills, 2 Tiles, 3 Tiles + pills; selector in the top bar), a Tag page tab and an All tags tab |

## Kept for reference

| File | What it is |
|---|---|
| [directions/direction-c-plus.html](directions/direction-c-plus.html) | C+ with the original (busy) controls row |
| [directions/direction-c-plus-controls.html](directions/direction-c-plus-controls.html) | Four alternative controls layouts: 1 Popover (chosen), 2 left panel, 3 right panel, 4 minimal |
| [directions/direction-c-masonry.html](directions/direction-c-masonry.html) | First masonry direction (C) |
| [directions/direction-a-plus.html](directions/direction-a-plus.html) | A+: card grid with serif headlines, 1+3 featured strip, Posts/Photos toggle, series progress dots, reading-progress bar, themed 404. Source of the v3 hero. |
| [directions/direction-a-cards.html](directions/direction-a-cards.html) | First card-grid direction (A) |
| [directions/direction-b-editorial.html](directions/direction-b-editorial.html) | Editorial direction (B) with a justified-row gallery. Dropped. |
| [palette-a.html](palette-a.html), [palette-b.html](palette-b.html), [palette-d.html](palette-d.html) | Palette comparison pages (palette C was dropped and its file removed) |
| [home.html](home.html), [post.html](post.html) | The first palette B mockups |

## Ideas from A+ not carried into v3 (candidates to revisit)

- Asymmetric featured strip (one large card plus three small).
- Posts | Photos toggle and Grid | List switch (v3 does this with the type chips instead).
- Series progress dots ("Part 3 of 3") and a thin reading-progress bar on posts (v3 shows the plain series box).
- A themed 404 page with a photo and the latest posts.
- Per-post accent color taken from the photo (would need a build-time image fetch from SmugMug).

## Known gaps in the mockups

Keyboard tab-through, reduced-motion emulation and a screen-reader pass were not done for the v3 page. The v3 chips and
"View options" button are 32 px tall (44 px is the touch-target guideline). The Hugo article excerpt and Article-tab body
are placeholder text. The script that generated the first set of mockups was not kept.
