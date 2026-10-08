# Changelog

All notable changes to this theme are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions are git-flow tags with no `v` prefix.

## [1.1.0] - 2026-10-08

### Added
- The footer shows the Hugo version and the theme version: "Built with Hugo 0.167.0 and The Blues 1.1.0" (#25). The
  theme version comes from `data/theblues.toml` and is read with `hugo.Data`, so builds print no deprecation warning
  (#27). Contrast 10.5:1 (light) and 14.6:1 (dark).
- `layouts/_partials/head-end.html`, an empty partial included last in `<head>`, so a site can add its own stylesheet
  or meta tags without overriding `head.html` (cyvaquero/hugo-site-guyheckman_me#23). The README's "Extending from a
  site" section documents it, the `header` and `main` blocks, and the CSS custom properties a site's styles should use
  (now including `--hv`), whose names are kept stable (cyvaquero/hugo-site-guyheckman_me#23, #35).

### Changed
- Minimum Hugo version raised from 0.146.0 to 0.163.3 (`hugo.toml`, `theme.toml`): earlier versions have published Hugo
  security advisories, and the theme uses `.Language.Locale`.
- Faster builds as the number of posts grows (#7). The partials that depend only on one post or one image URL
  (`is-photo`, `photos`, `cover`, `series-info`, `smug-full`) and the CSS/JS asset lookups are cached per post or URL
  with `partialCached` instead of re-run on every list page, and the previous/next post links use Hugo's `Pages.Next` and
  `Pages.Prev` instead of scanning every post. Measured on guyheckman.me (Hugo 0.167.0, median of 30 builds): 87.3 ms to
  83.9 ms with 8 posts; with the posts copied to 80, 431 ms to 133 ms. Built output is byte-identical apart from the
  footer's theme version; `hugo server` still picks up content edits.
- `embed` shortcode: requires an `https://` URL, width and height (the build fails otherwise), takes an optional fourth
  argument for the iframe title (default "Embedded content", was "Photo gallery"), and adds `sandbox`, `referrerpolicy`
  and an `embed` class (`smugmug-gallery` is kept) (#12).
- Cover and header images (`image`, `header_image`, `image_404`) are output as absolute URLs, so relative paths work in
  heroes on nested pages and in `og:image` (#12).
- Taxonomy indexes count posts only, matching term pages, and leave out terms with no posts (#12).
- The search nav label can be set with `params.search_label` (default `SEARCH`) (#12).
- The post archetype sets `showtoc: true`, matching the template default, and no longer writes an `author` field
  (nothing reads it) (#12).
- A titled inline Markdown image renders as an image with the title as tooltip instead of a `<figure>` inside a
  paragraph (invalid HTML); a standalone image gets the `<figure>` and caption when the site sets
  `wrapStandAloneImageWithinParagraph = false`, and keeps its `class`, `id`, `width` and `height` attributes (#11).
- `LICENSE` is the standard Apache-2.0 text with this theme's copyright; `NOTICE` keeps the credits and states that no
  upstream code remains. `theme.toml` no longer says Google Analytics "respects Do Not Track" (the gtag loader is always
  requested).
- The README matches the code: Installation, Content structure, Shortcodes and settings sections; a gallery photo's
  `title` is its alt text, not a visible caption; the hamburger shows at 820px and narrower (#35).

### Fixed
- The nav leaves out a `[[menus.main]]` entry whose `pageRef` points at a page that doesn't exist, such as a category
  with no published posts; it used to render as a link to the current page (cyvaquero/hugo-site-guyheckman_me#8).
- Legacy `params.addtional_menus` links no longer get a double slash (`/archive//`) or a slash after full URLs, and follow
  a sub-path `baseURL` (#12).
- Home links (nav brand, term pages, 404) use the home page's permalink, so they work with a sub-path `baseURL` or a
  language prefix (#12).
- `categories` given as a single string no longer breaks the build (#12).
- Article tile excerpts decode HTML entities (an `&` in a summary showed as `&amp;`) (#12).
- Walls and the archive show "No posts yet." instead of empty controls when there are no posts (#12).
- Repeated spaces in the slogan no longer produce empty words in the home hero (#12).
- Markdown links: links to other sites open in a new tab when written as `HTTPS://…` or `//host/…`, links to the
  site's own absolute URLs and `httpfoo/`-style relative paths don't; relative links and images that name a page or page
  resource (`../about.md`, `pic.png` in a page bundle) resolve to its URL, and `#fragment` links point at the post, so
  they work in list pages and the RSS feed; no stray space after every link and image (#11).

### Security
- Markdown links and images no longer publish `javascript:`, `vbscript:`, `data:` or other unsafe URLs (#11). The render
  hooks passed every destination through `safeURL`, which turned off Hugo's URL filtering, so `[x](javascript:…)` became a
  live link in the post and the RSS feed. Links now keep only `http`, `https`, `mailto`, `tel` and scheme-less URLs and
  images only `http`, `https` and scheme-less ones; anything else renders the link text with no `href` and the image with
  no `src`.
- The `galleries` shortcode no longer publishes the raw content between its tags (#15). Text or HTML in the block, such
  as `<script>` or `<img onerror=…>`, went into the post and the RSS feed as working markup even though the site has raw
  HTML turned off. It now outputs only its `gallery` photos; anything else in the block is dropped.

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

[1.1.0]: https://github.com/cyvaquero/hugo-theme-theblues/compare/1.0.0...1.1.0
[1.0.0]: https://github.com/cyvaquero/hugo-theme-theblues/releases/tag/1.0.0
