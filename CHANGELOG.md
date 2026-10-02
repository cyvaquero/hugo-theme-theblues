# Changelog

All notable changes to this theme are documented here. Format follows [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Planned
- The chosen home layout: masonry wall of photo and article tiles (three columns from 1100 px wide), type chips with counts,
  a "View options" popover (Filter or Highlight, Sort, Group by gallery), the hero header, serif headlines, and a
  minimalist tag cloud in a right column (above the type chips on small screens). Photo posts open as a masonry
  gallery; articles get a sticky table of contents and a series box.
- Favicon; tablet-width and keyboard accessibility checks.

## [0.5.0] - 2026-10-02

First tagged release: a working scaffold that builds the site's real content to the same 30 URLs as Clean White with
no theme-related Hugo warnings. The chosen home layout (see Planned) is not built yet.

### Added
- The post byline reads the post's `author` front matter, falling back to `params.author`; the archetype no longer hardcodes a name.
- `docs/retheme/`: decision records (D1 to D14), the Clean White inventory, and the layout and palette mockups.
- `layouts/_partials/asset.html`: production builds minify and fingerprint CSS and JS; development builds serve the
  readable commented source. `assets/css/main.css` is documented as the only, hand-written stylesheet.
- Apache-2.0 `LICENSE` and a `NOTICE` crediting Clean White and its upstreams.
- Initial scaffold: base layout, home post list, post, page, archive, section, taxonomy and term lists, search slot, 404.
- Navigation reads Hugo's `[[menus.main]]`; the legacy `params.addtional_menus` list (Clean White's spelling) is still accepted
  when no main menu is defined.
- Palette B tokens with light and dark modes; responsive layout with a hamburger dropdown nav below 820 px.
- Series notice and previous/next navigation, Hugo-rendered table of contents, Disqus on posts only.
- `gallery`, `galleries`, and `embed` shortcodes; gallery uses a CSS grid and a native `<dialog>` lightbox.
- Inline SVG social icons (RSS, LinkedIn, GitHub); Google Analytics through Hugo's internal template.

[Unreleased]: https://github.com/cyvaquero/hugo-theme-theblues/compare/v0.5.0...HEAD
[0.5.0]: https://github.com/cyvaquero/hugo-theme-theblues/releases/tag/v0.5.0
