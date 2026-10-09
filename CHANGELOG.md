# Changelog

All notable changes to this theme are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions are git-flow tags with no `v` prefix.

## [1.1.18] - Unreleased

### Added
- Highlighted code blocks follow light and dark mode when the site sets `[markup.highlight] noClasses = false`. The
  theme colors Chroma's classes with the modus-operandi palette in light mode and modus-vivendi in dark, on the theme's
  code background. Every token measures 4.8:1 or more in both modes, line numbers included (on a highlighted line they
  take the text color). With Hugo's default inline styles nothing changes (computed styles compared on eight page types,
  both modes, two widths) (#5).

## [1.1.17] - Unreleased

### Changed
- Text in a photo post, around its galleries, is styled like an article: serif body text, headings, quotes, tables,
  code and code blocks, figures and captions, in a 44rem column. The galleries are unchanged, and so is every page
  whose photo posts have only galleries, which is all of them on guyheckman.me today (computed styles compared on
  eight page types, both modes, two widths) (#5).

## [1.1.16] - Unreleased

### Changed
- The heroes, photo tile badges and captions, and the lightbox take their cream, sand and scrim colors from the color
  tokens instead of repeating the hex values. Nothing looks different: the computed colors of every element on eight
  page types, in both modes, at 1280 and 375 px wide, with the lightbox open and a photo tile focused, are unchanged.
  A new `--scrim` token holds the navy scrim color for a site's own CSS (#5).

## [1.1.15] - Unreleased

### Fixed
- A post without a `date` no longer shows "Jan 1, 0001" (#36):
  - The post header, its wall tiles, the archive (under an "Undated" heading) and the series box show "Undated".
  - The build warns, naming the file.
  - Feed items have no `pubDate`. The theme's feed template now covers section and term feeds too, not just the home
    feed, and is otherwise Hugo's.
  - Undated posts sort after dated ones on the wall.

## [1.1.14] - Unreleased

### Security
- The `embed` shortcode fails the build for a URL on the site's own host. The sandbox it sets, `allow-scripts` plus
  `allow-same-origin`, lets a same-origin page lift its own sandbox, so it protects only cross-origin frames such as
  SmugMug embeds, which still work (#37).

## [1.1.13] - Unreleased

### Fixed
- Moving through the lightbox announces the position and the photo's description ("Photo 4 of 18: La Huasteca")
  instead of only the counter "4 / 18". The visible counter is unchanged (#38).

## [1.1.12] - Unreleased

### Fixed
- The see-all tile's accessible name starts with its visible text ("Boston Gallery, 14 more photos, see all 18"), so a
  voice-control user can say what they see. It was "See all 18 photos in Boston Gallery" (WCAG 2.5.3, #34).

## [1.1.11] - Unreleased

### Fixed
- Highlighted code blocks show the Chroma style's own background instead of a hard-coded `monokailight` gray
  (`#fafafa`) around them, and the README and CSS comments no longer name `monokailight`. They describe any light
  inline Chroma style, for example `modus-operandi`, which the site uses. Code blocks stay light in dark mode (#44).

## [1.1.10] - Unreleased

### Changed
- Disqus comments are click to load. Posts show a "Show comments" button, and nothing from Disqus, or the ad trackers
  it brings, is requested until a reader clicks it. Focus then moves to the comments. Development builds show a note
  instead (#16).
- The GA and Disqus loaders are small theme files (`assets/js/analytics.js`, `assets/js/comments.js`) instead of Hugo's
  inline templates, so pages have no inline scripts. A site CSP no longer needs `script-src` hashes for them (#16).

### Security
- Visitors who send Do Not Track or Global Privacy Control no longer request gtag.js from Google. Hugo's template
  loaded it for everyone and only skipped the tracking call. Analytics no longer loads in development builds (#16).
- The lightbox is built with DOM calls instead of `innerHTML`, so it works under a Trusted Types CSP (#16).

## [1.1.9] - Unreleased

### Fixed
- Photo counts, wall tiles and covers now match the photos a post actually shows (#17):
  - A positional `src` (`{{< gallery "…" >}}`) is counted.
  - Titles with an escaped quote, a `}` or a `>` are read whole.
  - Backtick-quoted arguments are read.
  - The `{{% %}}` form, which renders nothing, is no longer counted.

  A probe post with four photos was counted as 2, with one title cut to `A \`; it is now counted as 4, all titles
  intact.

### Security
- A gallery photo inside an HTML comment (`<!-- {{< gallery … >}} -->`) is no longer published on the home and term
  walls or used as the post's cover and `og:image`. The post itself never showed it (#17).

## [1.1.8] - Unreleased

### Added
- `og:locale`, `article:published_time` (posts), `twitter:title` and `twitter:description` meta tags (#2).
- `<meta name="robots" content="noindex">` on the 404 page and the search section (#2).

### Fixed
- Every page links the site's RSS feed, in the head and in the footer. Posts, About and Archive had no feed link, and
  the footer pointed at a term's own feed on term pages; term and section pages also link their own feed (#2).
- `og:image` is emitted only for an `http` or `https` URL; a `javascript:` image in front matter was output as is (#2).

## [1.1.7] - Unreleased

### Fixed
- Template edge cases (#18):
  - **`params.wall.tilesPerPage`:** a value below 1 fails the build with a clear message. `0` used to mean 24 and `-1`
    aborted with a template error.
  - **Long pagers:** they show the first and last pages and two on each side of the current page, with an ellipsis,
    instead of every page.
  - **Posts without a title:** they get one from the file name ("20250601-untitled-post.md" becomes "Untitled Post")
    in the `h1`, the wall tile, the archive and the feed, instead of empty headings and links.
  - **Empty site title:** page titles drop the trailing " | ".
  - **A to Z indexes:** sorted by the term page's title, so a retitled term no longer repeats a letter heading.
  - **`showtoc`:** `showtoc: "false"` (a string) turns the table of contents off, like `showtoc: false`.
  - **Home feed:** a theme `home.rss.xml` lists only main-section pages, so About and Archive are no longer feed items
    dated 0001. A site's own `home.rss.xml` still takes precedence.

## [1.1.6] - Unreleased

### Fixed
- Leftover defects from the code review (#13):
  - **Popover:** clicking a type chip or Clear while View options is open now closes it.
  - **Caption:** the wall's live caption is no longer announced on page load.
  - **Menu:** the hamburger menu drops its open state when the window grows past 820px.
  - **Wide content:** images, code and tables in photo-post and page bodies stay within the page width.
- Tiles no longer carry the unused `data-series` attribute, and the dead `.tile[hidden], details[hidden]` rule is gone
  (#13).

## [1.1.5] - Unreleased

### Fixed
- "Oldest first" is the exact reverse of "Newest first" for posts published on the same day, on the flat wall and for
  same-day galleries in grouped mode. A gallery's photos keep their order, and its see-all tile stays last (#32).

## [1.1.4] - Unreleased

### Fixed
- The hero's wavy-underline style (`.u`) applies only inside the home hero. It used to italicize any `class="u"`
  element on the site, such as the unit labels in SnugCut on guyheckman.me (#33).

## [1.1.3] - Unreleased

### Added
- A favicon and touch icon: a cream serif "g" on navy (#1).
  - **Files:** `favicon.svg` (the letter in the system serif), `favicon.ico` (16, 32 and 48px) and a 180px
    `apple-touch-icon.png`, all in the theme's `static/`.
  - **Overriding:** a site uses its own by adding files with the same names to its `static/`.
- `<meta name="theme-color">`: navy `#1B3C53` in light mode and `#0F2332` in dark (#1).
- `params.og_image`: the share image for pages that have no `image` of their own and no photos. The header image is
  still the fallback when it is unset (#1).
- `images/screenshot.png` and `images/tn.png` for `theme.toml` (#1).

### Changed
- The theme no longer looks for `static/img/favicon.ico` and no longer sets an empty `data:,` icon. A site that kept
  its icon there should rename it to `static/favicon.ico` (#1).

## [1.1.2] - Unreleased

### Fixed
- Accessibility gaps in the nav, the View options popover and the lightbox, and contrast over photos and in Highlight
  mode (#3). Measured in headless Chrome on guyheckman.me:
  - **Nav:**
    - Without JavaScript, at 820px and narrower the nav shows its links instead of a Menu button that does
      nothing. This uses `assets/css/nojs.css`, loaded in `<noscript>`, with no inline CSS.
    - The ☰ glyph is hidden from screen readers.
    - The open menu closes when keyboard focus leaves it.
    - The legacy `addtional_menus` links get `aria-current`.
    - The skip link focuses `main`.
  - **View options popover:**
    - Opening it moves focus to its first control.
    - It closes when focus leaves it, so it can't cover the next focused tile.
    - Keyboard focus on a type chip no longer dims the wall; only mouse hover previews.
    - The live caption changes only when its text does.
  - **Highlight mode:** non-matching tiles turn gray and their photos fade, instead of the whole tile fading to 35%.
    Their text keeps full contrast: 6.63:1 light and 5.8:1 dark, up from about 1.7–2.6:1.
  - **Text over photos:** the scrims meet AA even over a white image.
    - Home hero: .70–.85; its small "kicker" label is now cream.
    - Post hero: at least .85 behind its text.
    - Photo tile captions: at least .85.
  - **Lightbox:**
    - The counter and alt text change only when the new photo has loaded, so they always describe the photo on
      screen; the neighbors are preloaded.
    - Home and End keys, and swipe.
    - No Previous or Next buttons for a single photo.
    - The page doesn't scroll behind it.
    - It uses dynamic viewport units (`dvh`).
  - **Gallery titles:** a gallery photo without a title still gets "Photo N" alt text, and the build now warns.
  - **Post header:** categories are links.
  - **Forced colors:** the Group switch was invisible (1:1). Its knob is now 21:1 when off and 14.37:1 when on.
    Pressed chips and the current page use the system highlight.
  - **Print:** a print stylesheet prints black on white, without the nav, controls or comments.

## [1.1.1] - Unreleased

### Fixed
- Keyboard focus on the wall (#19). Measured in headless Chrome on guyheckman.me:
  - **Tile focus rings:** article tiles drew their ring in sand on the cream page, 1.59:1. Photo, see-all and article
    tiles now share a solid `--focus` ring: 5.37:1 in light mode, 8.06:1 in dark.
  - **Highlight mode:** matching tiles get a dashed outline instead of a solid sand one, so the focused tile stands out.
  - **Tag links in article tiles:** their focus ring is sand on the navy tile (6.63:1, was 1.96:1). They are 24px
    tall, up from 15px.
  - **Older browsers:** the tile rings need `:has()`. They are now applied only where it is supported, and the link
    keeps its own ring elsewhere.
  - **Clear and Reset:** they no longer drop focus to the page. Clear moves it to the "All" chip; Reset closes the
    popover and returns to "View options".
  - **Escape:** one press with the menu and the popover open closes only the popover.
  - **Accessible names:**
    - "View options" with its badge reads "View options 1 active".
    - The Group switch no longer includes its On/Off text.
    - Selected chips and group headings no longer include their ✓ and ▸/▾ glyphs.
  - **Heading outline:** a visually hidden "Posts" `h2` above the wall gives h1 > h2 > h3.
  - **Table of contents:** it is a `nav` named "Table of contents" instead of an unnamed `nav` inside a named
    `aside`. The sticky version scrolls when it is taller than the window: the Markdown cheatsheet's was 847px.
  - **External links:** they say "(opens in a new tab)" to screen readers.

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
