# Changelog

All notable changes to this theme are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions are git-flow tags with no `v` prefix.

## [1.0.6] - Unreleased

### Added
- `layouts/_partials/head-end.html`, an empty partial included last in `<head>`, so a site can add its own stylesheet
  or meta tags without overriding `head.html` (cyvaquero/hugo-site-guyheckman_me#23). No other change to built output.
- README section "Extending from a site": the `header` and `main` blocks, the new partial, and the CSS custom
  properties a site's own styles should use, whose names are now kept stable.

## [1.0.5] - Unreleased

### Fixed
- The footer reads the theme version with `hugo.Data` instead of the deprecated `site.Data`, so builds no longer print
  a deprecation warning (#27).

## [1.0.4] - Unreleased

### Added
- The footer shows the Hugo version and the theme version: "Built with Hugo 0.167.0 and The Blues 1.0.4" (#25). The
  theme version comes from `data/theblues.toml`, which is bumped with every version. Verified on a build of the site:
  all 47 pages differ only by that line and the stylesheet hash; contrast 10.5:1 (light) and 14.6:1 (dark).

## [1.0.3] - Unreleased

### Changed
- References to the site repo use its new name, `hugo-site-guyheckman_me` (README, `docs/retheme/decisions.md`, a
  template comment in `search.html`). No other change to built output.

## [1.0.2] - Unreleased

Template bugs and missing defaults from review (#12).

### Changed
- `embed` shortcode: requires an `https://` URL, width and height (the build fails otherwise), takes an optional fourth
  argument for the iframe title (default "Embedded content", was "Photo gallery"), and adds `sandbox`, `referrerpolicy`
  and an `embed` class (`smugmug-gallery` is kept).
- The post archetype sets `showtoc: true`, matching the template default.
- Cover and header images (`image`, `header_image`, `image_404`) are output as absolute URLs, so relative paths work in
  heroes on nested pages and in `og:image`.
- Taxonomy indexes count posts only, matching term pages, and leave out terms with no posts.
- The search nav label can be set with `params.search_label` (default `SEARCH`).

### Fixed
- Legacy `params.addtional_menus` links no longer get a double slash (`/archive//`) or a slash after full URLs, and follow a
  sub-path `baseURL`.
- Home links (nav brand, term pages, 404) use the home page's permalink, so they work with a sub-path `baseURL` or a
  language prefix.
- `categories` given as a single string no longer breaks the build (`is-photo.html`, `post/page.html`).
- Article tile excerpts decode HTML entities (an `&` in a summary showed as `&amp;`).
- Walls and the archive show "No posts yet." instead of empty controls when there are no posts.
- Repeated spaces in the slogan no longer produce empty words in the home hero.

## [1.0.1] - 2026-10-04

Documentation, licence and metadata only; the built site is byte-identical to 1.0.0.

### Changed
- Minimum Hugo version raised from 0.146.0 to 0.163.3 (`hugo.toml`, `theme.toml`): earlier versions have published Hugo
  security advisories, and the theme uses `.Language.Locale`.
- `LICENSE` is now the standard Apache-2.0 text with this theme's copyright; Clean White's appendix and third-party notes,
  copied in 1.0.0, were removed. `NOTICE` keeps the credits and states that no upstream code remains; cavelab.dev is credited
  as an inspiration for the series partials only.
- `theme.toml` no longer says Google Analytics "respects Do Not Track" (the gtag loader is always requested).
- The post archetype no longer writes an `author` field (nothing reads it).

### Fixed
- README: release status, new Installation, Content structure and Shortcodes sections, corrected settings list
  (`services.*`, `locale`, `showtoc`) and known limits; removed the claim that posts show a byline.
- This changelog: the 1.0.0 entry rewritten in Keep a Changelog form (it described pre-release history and a byline that was
  removed before release).
- Stale text and issue references in `docs/retheme/`, and stale header comments in `wall.js`, `series-info.html`,
  `post/page.html` and `search.html`.

## [1.0.0] - 2026-10-04

First release. Known limits are listed in the README.

### Added
- Home page: a hero with a wavy-underlined slogan, then a full-width masonry wall (three columns from 900 px, two from 560 px)
  of photo tiles and article tiles. Each photo post shows its first few photos (`params.wall.photosPerGallery`, default 4)
  followed by a "see all" tile that links to the gallery post.
- Browse controls (`assets/js/wall.js`): type chips with counts, a "View options" popover (Filter or Highlight, Sort, Group by
  gallery, Reset), a Clear button and a live caption. Without JavaScript the wall is complete and the controls stay hidden.
- The wall paginates by tile (`params.wall.tilesPerPage`, default 24).
- Photo posts with a cover hero, a CSS-columns masonry gallery from the `gallery` and `galleries` shortcodes, and a native
  `<dialog>` lightbox using the larger SmugMug size. Ctrl/Cmd/Shift/middle-click on a thumbnail opens it in a new tab.
- Articles with a hero, a sticky table of contents (Hugo-rendered), and a "Part N of M" series box with previous and next
  links.
- Tag, category and series pages that reuse the wall, and an A-Z index for each taxonomy.
- Page, archive (`layout: archive`), section, search placeholder and 404 templates.
- Navigation from Hugo's `[[menus.main]]`, falling back to the legacy `params.addtional_menus` list (Clean White's spelling);
  a hamburger dropdown at 820 px and narrower.
- Palette B tokens with light and dark modes (`prefers-color-scheme`), reduced-motion support, and 44 px touch targets on
  coarse pointers.
- `gallery`, `galleries` and `embed` shortcodes. `gallery` stops the build with a clear error when `src` is missing.
- Inline SVG social links (RSS, LinkedIn, GitHub) that work when `params.social` is not set; Google Analytics and Disqus
  through Hugo's internal templates, with Disqus on posts only.
- `layouts/_partials/asset.html`: production builds minify and fingerprint CSS and JS (with Subresource Integrity);
  development builds serve the readable, commented source. `assets/css/main.css` is the only stylesheet and is hand-written.
- `docs/retheme/`: decision records (D1 to D14; D14 deferred), the Clean White inventory, and the layout and palette mockups.
- Apache-2.0 `LICENSE` and a `NOTICE` crediting Clean White and its upstreams.

[1.0.6]: https://github.com/cyvaquero/hugo-theme-theblues/compare/1.0.1...develop
[1.0.5]: https://github.com/cyvaquero/hugo-theme-theblues/compare/1.0.1...develop
[1.0.4]: https://github.com/cyvaquero/hugo-theme-theblues/compare/1.0.1...develop
[1.0.3]: https://github.com/cyvaquero/hugo-theme-theblues/compare/1.0.1...develop
[1.0.2]: https://github.com/cyvaquero/hugo-theme-theblues/compare/1.0.1...develop
[1.0.1]: https://github.com/cyvaquero/hugo-theme-theblues/compare/1.0.0...1.0.1
[1.0.0]: https://github.com/cyvaquero/hugo-theme-theblues/releases/tag/1.0.0
