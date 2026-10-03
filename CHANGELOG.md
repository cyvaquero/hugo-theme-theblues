# Changelog

All notable changes to this theme are documented here. Format follows [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Planned
- Paginate the wall by tile instead of by post; favicon; tablet-width, touch, screen-reader and keyboard accessibility checks.
- The featured-tags cloud is deferred (D14).

### Added
- The chosen home layout: hero with a wavy-underlined slogan, a full-width masonry wall (three columns from 900 px, two from
  560 px) of photo tiles (one per gallery photo) and article tiles, a "View options" popover (Filter or Highlight, Sort,
  Group by gallery), type chips with counts, and a live caption; `assets/js/wall.js`.
- Photo posts with a cover hero, a masonry gallery from the existing `gallery`/`galleries` shortcodes, and a native
  `<dialog>` lightbox using the larger SmugMug size; articles with a hero, sticky table of contents, and a "Part N of M" series
  box; tag, category and series pages that reuse the wall; an A-Z `/tags/` index.
- The theme builds the site's real content to the same 30 URLs as Clean White with no theme-related Hugo warnings. There is no
  release yet: a 0.5.0 release branch was prepared on 2026-10-02, merged back into `develop` without tagging or merging to
  `main`, and dropped until the layout was built; the layout is now built on `feature/masonry-home`.
- The post byline reads the post's `author` front matter, falling back to `params.author`; the archetype no longer hardcodes a name.
- `docs/retheme/`: decision records (D1 to D14; D14 deferred), the Clean White inventory, and the layout and palette mockups.
- `layouts/_partials/asset.html`: production builds minify and fingerprint CSS and JS; development builds serve the
  readable commented source. `assets/css/main.css` is documented as the only, hand-written stylesheet.
- Apache-2.0 `LICENSE` and a `NOTICE` crediting Clean White and its upstreams.
- Initial scaffold: base layout, post, page, archive, section, taxonomy and term lists, search slot, 404.
- Navigation reads Hugo's `[[menus.main]]`; the legacy `params.addtional_menus` list (Clean White's spelling) is still accepted
  when no main menu is defined.
- Palette B tokens with light and dark modes; responsive layout with a hamburger dropdown nav below 820 px.
- Series notice and previous/next navigation, Hugo-rendered table of contents, Disqus on posts only.
- `gallery`, `galleries`, and `embed` shortcodes; gallery uses a CSS grid and a native `<dialog>` lightbox.
- Inline SVG social icons (RSS, LinkedIn, GitHub); Google Analytics through Hugo's internal template.
