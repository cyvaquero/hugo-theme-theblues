# Changelog

All notable changes to this theme are documented here. Format follows [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Planned
- The chosen home layout: masonry wall of photo and article tiles, type chips with counts, a "View options" popover
  (Filter or Highlight, Sort, Group by gallery), the hero header, and serif headlines. Photo posts open as a masonry
  gallery; articles get a sticky table of contents and a series box.
- Favicon; tablet-width and keyboard accessibility checks; a release.

### Added
- `docs/retheme/`: decision records (D1 to D14), the Clean White inventory, and the layout and palette mockups.
- `layouts/_partials/asset.html`: production builds minify and fingerprint CSS and JS; development builds serve the
  readable commented source. `assets/css/main.css` is documented as the only, hand-written stylesheet.
- Apache-2.0 `LICENSE` and a `NOTICE` crediting Clean White and its upstreams.
- Initial scaffold: base layout, home with sidebar, post, page, archive, section, taxonomy and term lists, search slot, 404.
- Palette B tokens with light and dark modes; responsive layout with a hamburger dropdown nav below 820 px.
- Series notice and previous/next navigation, Hugo-rendered table of contents, Disqus on posts only.
- `gallery`, `galleries`, and `embed` shortcodes; gallery uses a CSS grid and a native `<dialog>` lightbox.
- Inline SVG social icons (RSS, LinkedIn, GitHub); Google Analytics through Hugo's internal template.
