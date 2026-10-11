# Changelog

All notable changes to this theme are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions are git-flow tags with no `v` prefix.

## [1.2.49] - Unreleased

### Added
- Sites can ask the theme whether Google Analytics loads on a page with `{{ if partial "analytics-on.html" . }}`, for
  example to show an analytics notice only when analytics loads. The theme's own `<head>` uses the same partial, so
  the two can't disagree, and the README lists it under "Extending from a site" as stable. Built pages are unchanged
  (#146).

## [1.2.48] - Unreleased

### Fixed
- The nav links no longer jump left when the color theme switch appears: on desktop widths the switch keeps its space,
  invisible, until the theme script shows it, and without JavaScript it still takes no space. On guyheckman.me with the
  cache off and a slow network, the home and tag pages' layout shift (CLS) at 1280px goes from 0.0024 to 0 in light
  and dark; at 375px it stays 0 (#138).

## [1.2.47] - Unreleased

### Changed
- The hero photo is preloaded only where it is the page's largest paint: the home page, the default hero (About,
  Archive, Search, section pages), the 404 page and article posts. Tag, category and series pages and photo posts no
  longer preload it, since their first tiles or title paint first and the preloaded hero, a large SmugMug size, slowed
  them by 80 to 450 ms in 1.2.45. Loading those heroes sooner is left for smaller hero sizes (#7, #149).

## [1.2.46] - Unreleased

### Fixed
- On a wall split across pages, the type chips count the whole list instead of only the tiles on the page you're on:
  exampleSite's home (4 tiles per page) read "All 4, Articles 3, Photos 1", "All 3, Articles 2, Photos 1" and
  "All 1, Articles 1, Photos 0" on its three pages, and now reads "All 8, Articles 6, Photos 2" on each. The caption still
  describes the page and now says so ("This page: 2 articles, 1 photo"); a one-page wall, like every wall on
  guyheckman.me today, reads as before (#7).

## [1.2.45] - Unreleased

### Added
- A page's hero photo starts loading at once, with high priority, instead of after the stylesheet has loaded: `<head>`
  preloads it (`<link rel="preload" as="image" fetchpriority="high">`) on every page whose hero has a photo, and on no
  other page, so the browser never warns about an unused preload. On guyheckman.me with the cache off and a slow
  network (median of 5), the largest paint comes 330 ms sooner on the home page at 375 and 1280px (4.74 → 4.41 s,
  7.63 → 7.31 s) and about 150 ms sooner on About; the 404 page 1.81 → 1.43 s (median of 3). Where the largest paint
  is not the hero, the preloaded photo competes with it: a tag page's first tile paints 80 to 450 ms later and a
  gallery post's title at 1280px about 220 ms later (#7).

## [1.2.44] - Unreleased

### Added
- Wall tiles and gallery photos load a size that fits the screen instead of always SmugMug's 1280px X2: they offer
  SmugMug's M, L and XL sizes as well (`srcset` and `sizes`), when the build knows the photo's size. Photo bytes on
  guyheckman.me, page scrolled to the end, cache off: the home page 4.81 → 1.12 MB on a one-x screen at 375 or 1280px
  and 4.81 → 2.66 MB at 1280px on a two-x screen; the Boston gallery 8.12 → 2.23 MB and 8.12 → 4.17 MB; a three-x
  phone still loads X2, as before. The lightbox still opens the X3 size (#7).

## [1.2.43] - Unreleased

### Fixed
- Wall tiles and gallery photos keep their shape while they load, so the masonry no longer reshuffles as photos arrive:
  the build reads each photo's width and height (downloading it once into Hugo's resource cache) and puts them on the
  image. On guyheckman.me's home page 7 of 12 photo tiles changed height when their photo loaded and 10 to 11 tiles
  moved; on the Boston gallery 9 of 18 changed height and 15 to 16 moved (375 and 1280px). Now none do, and the loaded
  pages look the same. A cold build of guyheckman.me (empty cache, 33 photos, 14 MB downloaded) takes about 1.5 s instead of
  97 ms; with the cache warm it takes 100 to 101 ms. An offline build leaves the sizes out without a warning; a photo URL that
  answers 404 or isn't an image warns (`theblues-image-size`) (#7).

## [1.2.42] - Unreleased

### Fixed
- With "Group by gallery" on, a gallery split across two wall pages is headed with all its photos on both pages, not
  only the ones on that page: with 5 tiles per page, guyheckman.me's Boston Gallery read "4 photos" on one page and
  "14 photos" on the next, and now reads "18 photos" on both. Photo and see-all tiles carry the gallery's photo count
  as `data-n` for the wall script. Chip counts and the caption still count the tiles on the page (#7).

## [1.2.41] - Unreleased

### Fixed
- The wall no longer jumps down when its controls appear: the controls bar keeps its space, invisible, until the wall
  script shows it, and without JavaScript it still takes no space. On guyheckman.me with the cache off and a slow
  network, the home page's layout shift (CLS) goes from 0.075 to 0 at 375px and from 0.069 to 0.002 at 1280px, and a
  tag page's from 0.043 to 0 and 0.002; the 0.002 left is the nav's color theme switch appearing (#7).

## [1.2.40] - Unreleased

### Changed
- The previous and next post links sort the posts once per build instead of once for every post. Median build with
  2,000 generated posts 2.79 → 2.70 s and with 600 posts 812 → 808 ms; guyheckman.me and the fixture site are
  unchanged (within a millisecond or two). All four build byte-for-byte the same (#7).

## [1.2.39] - Unreleased

### Changed
- A tag, category or series page works out its hero's photo count and cover once per term instead of once per pager
  page, which went through every post in the term each time. Median build with 2,000 generated posts 8.9 → 2.8 s and
  with 600 posts 835 → 812 ms; guyheckman.me (96 → 95 ms) and the fixture site (84 → 84 ms) are unchanged. The built
  pages are the same apart from the blank lines the old loop left before a term page's hero, one run per post in the
  term, which are gone (#7).

## [1.2.38] - Unreleased

### Changed
- Big sites build much faster: a post's photos, its photo-or-article check and its cover, and each list's wall tiles,
  are now worked out once per build and kept with the page, instead of only in Hugo's partial cache, which holds about
  a thousand entries and on a site with a few hundred posts kept evicting them, so they were recomputed for every page
  that used them. Median build with 2,000 generated posts 68.5 → 8.9 s; with 600 posts (822 → 835 ms), guyheckman.me
  (97 → 96 ms) and the fixture site (84 → 84 ms) it is unchanged. All four build byte-for-byte the same. Under
  `hugo server` the theme still uses the partial cache, so an edited template shows up at once (#7).

## [1.2.37] - Unreleased

### Changed
- A series follows its posts' `weight` when they set one, as Hugo orders pages: weighted posts first, lowest first,
  then the rest; oldest first within each. The series box's list and numbering and the "Part N of M" tile chip use
  that order. Series whose posts set no weight are ordered by date as before (#6).

## [1.2.36] - Unreleased

### Changed
- README lists the layout's fixed breakpoints (560, 700, 821 and 900px) and what changes at each, for sites that style
  their own pages to match. They stay fixed rather than becoming settings (#6).

## [1.2.35] - Unreleased

### Changed
- The footer shows the site's `copyright` setting as written, when the site sets one, so a site can choose its own
  wording or a year range; the feed already used it. Without it the footer still reads "© <title> <current year>" (#6).

## [1.2.34] - Unreleased

### Added
- `params.dateFormat` sets how dates read on posts, wall tiles and the wall's gallery headings, as a Go layout (for
  example `2 January 2006`); without it they stay `Jan 2, 2006`. The archive's `Jan 2` and the series box's
  `Jan 2006` are unchanged. The wall script takes a gallery heading's date from the gallery's first tile instead of
  formatting it itself, so the two can't disagree. Strings stay English (#6).

## [1.2.33] - Unreleased

### Added
- The README's "Site settings it reads" covers the feed settings (`params.author`, which adds an author to the feeds
  only as a table with an `email`; `copyright`, used by the feeds but not the footer; `[services.rss] limit`) and the
  `[markup]` settings that change what the theme shows (highlighting classes, table of contents levels, stand-alone
  image figures), and says what the front matter `image` does. The built site is unchanged (#6).

## [1.2.32] - Unreleased

### Changed
- Post dates and the "Undated" fallback come from one partial, `date.html`, instead of being written out in nine
  places (post header, article and photo tiles, the see-all tile, the series box and the archive), so a change to the
  date format is made once. `wall.js` still formats its group headings itself, and the partial says to keep the two
  the same. The built site is byte-for-byte the same, and an undated post still warns (#6).

## [1.2.31] - Unreleased

### Changed
- The series box and the "Part N of M" chip on wall tiles get a post's position in its series from one partial
  (`series-info.html`, which now returns every series the post is in) instead of two copies of the same loop, so they
  can't disagree. The built site is byte-for-byte the same, including a post in two series (#6).

## [1.2.30] - Unreleased

### Changed
- The home wall, section and term walls, the archive, post navigation and the taxonomy indexes list the pages in the
  site's `mainSections`, as the home feed already did, instead of only the `post` section. A site that keeps posts in
  another section (or several) sets `mainSections` and gives those pages the `post` type to get the post template;
  the README's "Content structure" shows both. Without `mainSections`, Hugo uses the section with the most pages, so
  the README now says to set `mainSections = ["post"]`, and the fixture site does. guyheckman.me and the fixture site
  build byte-for-byte the same (#6).

## [1.2.29] - Unreleased

### Fixed
- A post whose headings are all outside the `markup.tableOfContents` levels (only `####` headings with the default
  levels, for example) no longer shows an empty "On this page" box: the TOC shows when Hugo's table of contents has a
  link, not just a list item. If a Hugo update changes the `<nav id="TableOfContents">` wrapper the theme checks and
  labels, the build warns (`theblues-toc-markup`, which stops `--panicOnWarning` builds) instead of silently dropping
  the label. The theme keeps Hugo's TOC, since templates can't read the TOC levels. On the fixture site and
  guyheckman.me every other page is byte-for-byte the same; the fixture site has a post for the case (#87, #117).

## [1.2.28] - Unreleased

### Fixed
- The page hero's small sand text (the "Article" / "Photo gallery" label and the date line) stays at 4.5:1 or more over
  a bright photo however long the title is. The darker part of the scrim now starts just above the text instead of at
  a fixed share of the hero's height, and the rest of the photo keeps a light .45 scrim. Measured over a white photo
  on the fixture site with an 84-character title, at 320, 375, 768 and 1280px in both modes: the label is 5.86:1 at
  every width, up from as low as 3.55:1 (768px) and 3.84:1 (320px); a short title with a subtitle went from 4.48:1 to
  5.86:1 on phones. With a short title the photo above the text is lighter than before (.45 to about .55 where it was
  .65 to .85). Layout and HTML are unchanged (#74).

## [1.2.27] - Unreleased

### Added
- An "Accessibility" section in the README: the target (WCAG 2.1 AA, which also covers Section 508's WCAG 2.0 AA
  for web content), keyboard support for the skip link, nav menu, theme switch, wall controls, lightbox and comments,
  the live announcements, color, forced-colors, motion and reflow behavior, how to write accessible content (gallery
  titles, alt text, headings, line numbers, embed titles), and the known gaps with links to their issues. #94's
  mapping of WCAG 2.1 and Section 508 is linked from it (#79, #94).

## [1.2.26] - Unreleased

### Added
- `exampleSite/`, a fixture site whose content exercises the theme's edge cases (untitled and undated posts,
  commented-out and positional gallery photos, a `{{% galleries %}}` block, `embed`, Markdown link and image hooks,
  the legacy menu, a footer menu and wall pagination past page 1), and a README section on building it with
  `--panicOnWarning --printPathWarnings --printUnusedTemplates` and comparing the output before and after a change. It
  builds with no warnings and no unused templates; sites that install the theme don't use it (#93).

## [1.2.25] - Unreleased

### Changed
- The visually hidden `.vh` class uses `clip-path: inset(50%)`, keeping the deprecated `clip` as a fallback. Screen
  reader text and the accessible names it supplies are unchanged (#92).

## [1.2.24] - Unreleased

### Changed
- The `theme-color` values in `head.html` and the `--band` token in `main.css` now point at each other in comments,
  and the README says a palette change updates both, so the browser-UI color can't drift from the nav band unnoticed.
  The built site is unchanged (#91).

## [1.2.23] - Unreleased

### Fixed
- Posts created with `hugo new` follow the site's `params.showtoc` again: the post archetype no longer writes
  `showtoc: true`, which overrode the site default, and offers a commented-out `showtoc: false` instead (#90).

## [1.2.22] - Unreleased

### Changed
- The README, `hugo.toml` and `theme.toml` say which minimum-Hugo setting counts: `[module.hugoVersion] min` in the
  theme's `hugo.toml`, which Hugo checks and warns about. `theme.toml`'s `min_version` is gallery metadata that mirrors
  it; both stay at 0.163.3 (#89).

## [1.2.21] - Unreleased

### Changed
- Theme script and stylesheet tags come from two partials, `script.html` and `stylesheet.html`, instead of eight
  copies of the same markup in `head.html` and `baseof.html`. The built pages are byte-for-byte the same (#88).

## [1.2.20] - Unreleased

### Deprecated
- The legacy `params.addtional_menus` nav list (Clean White's spelling). It still works when no `[[menus.main]]` is
  defined, but the build now warns once (`theblues-addtional-menus`, silenceable with `ignoreLogs`) to move to
  `[[menus.main]]`; it will be removed in a future major version (#86).

## [1.2.19] - Unreleased

### Changed
- The theme's build warnings have IDs, so a site can silence them with `ignoreLogs`: `theblues-gallery-no-title` for
  a `gallery` photo without a `title`, and `theblues-undated` for a post without a `date`. Hugo prints the
  `ignoreLogs` line to add under each warning, and the README lists both IDs (#85).

## [1.2.18] - Unreleased

### Fixed
- The note posts show instead of comments now reads "Disqus comments are not loaded outside production builds",
  which matches when it appears: in any non-production build, such as `--environment staging`, not only in
  development. The README says the same (#84).

## [1.2.17] - Unreleased

### Fixed
- A missing theme stylesheet or script fails the build with `theblues: asset "css/main.css" not found in assets/`,
  instead of publishing every page without it and exiting successfully. `asset.html` itself still returns nothing for
  a missing file, so a site's own partials can keep using it for optional files (#83).

## [1.2.16] - Unreleased

### Changed
- `docs/retheme/decisions.md` matches the theme again: superseding notes on D4 (the color theme switch), D8 (click to
  load, `privacy.disqus.disable`), D11 (the theme's own GA loader, which always honors Do Not Track and Global Privacy
  Control) and D12 (Highlight mode, tile data attributes, code blocks in dark mode), and a new D15 record for the
  color theme switch (#81).

## [1.2.15] - Unreleased

### Changed
- README corrections: the stylesheet notes mention `nojs.css` (loaded in `<noscript>`) next to `main.css`; the
  Layout list adds `nojs.css`, `analytics.js`, `comments.js`, `data/theblues.toml`, `rss.xml`, `wall-stand` and
  `static/`; undated posts sort last on the wall except with Oldest first; the positional `gallery` form takes only
  `src` and gets "Photo N" alt text; and the build-time note describes the per-list tile cache instead of a rebuild
  per pager page (#80).

## [1.2.14] - Unreleased

### Fixed
- Wall pages after the first have their own title: `/page/2/` is "guyheckman.me – Page 2" and `/tags/x/page/2/`
  "X – Page 2 | guyheckman.me", so tabs, history and screen readers can tell them from page 1. Page 1 and every other
  page are unchanged. The wall layouts now build their paginator in an `init` block that `baseof.html` runs before
  `<head>`; `wall-page.html` takes the list page as its context and reads what the new `wall-pager.html` stored (#78).

## [1.2.13] - Unreleased

### Fixed
- Keyboard order in the wall's "View options" popover: Shift+Tab from its first control returns to View options with
  the popover still open, instead of jumping to Clear and closing it. Tab now goes View options, the popover's
  controls, then Clear. The popover and controls are in the same place as before (#77).

## [1.2.12] - Unreleased

### Changed
- The README's syntax-highlighting notes say that line numbers meet contrast only with `noClasses = false`: with
  Hugo's default inline highlighting, Chroma's styles draw them in a low-contrast gray (`#7f7f7f` in most: 4.0:1 on
  white, 3.18:1 on a highlighted line, 3.71:1 in the default `monokai`), and inline styles give the theme nothing to
  override (#76).

## [1.2.11] - Unreleased

### Fixed
- Long unbroken words and URLs in the body text of the archive, taxonomy index, section and search pages wrap at
  320px instead of being clipped out of reach (a 100-character URL made the page 858px wide in a 305px viewport;
  now 305px). Long term names on the taxonomy index wrap too. Pages without such text look the same (#75).

## [1.2.10] - Unreleased

### Fixed
- The build warning for a `gallery` photo without a `title` identifies the photo: it now gives the photo's `src`, and
  for a photo inside a `galleries` block the block's line instead of `:1:1`, for example
  `photo 2 (https://…/i-2-X2.jpg) has no title … ("content/post/g.md:7:1")` (#73).

## [1.2.9] - Unreleased

### Fixed
- Hugo's `[privacy.disqus] disable = true` turns comments off: posts get no "Show comments" button and no
  `comments.js`. Before, the setting was ignored (#72).

### Changed
- The README lists which of Hugo's `[privacy]` settings apply with this theme: `privacy.googleAnalytics.disable` and
  `privacy.disqus.disable` do, while `respectDoNotTrack` and the other Google Analytics privacy settings have no effect,
  since Do Not Track and Global Privacy Control are always honored (#72).

## [1.2.8] - Unreleased

### Fixed
- A post that wraps its `gallery` calls in the `{{% galleries %}}` form, which renders no photos, no longer takes its
  hero and `og:image` from those hidden photos, and they no longer appear as wall tiles: such a post gets the site
  cover and, with no other photos, an article tile. The README's share-image and `galleries` notes say so (#71).

## [1.2.7] - Unreleased

### Security
- The `embed` shortcode's same-host check can no longer be bypassed. A URL written `https:///own-host/…` (an empty
  host to Hugo, the site's host to a browser) slipped past it and loaded same-origin, where the sandbox gives no
  protection. The build now fails unless the host follows `https://` directly, with no user name, backslash or space
  before the path, and also fails when the URL's host or the site's `baseURL` host is empty (#70).

## [1.2.6] - Unreleased

### Fixed
- `params.wall.photosPerGallery` is validated like `tilesPerPage`: 0 or a negative value fails the build with
  "params.wall.photosPerGallery must be 1 or more (got N)". Before, 0 silently meant the default of 4, and a negative
  value failed with Hugo's internal "sequence length must be non-negative". The README states the range (#69).

## [1.2.5] - Unreleased

### Fixed
- Feeds no longer print an empty `<lastBuildDate>` or one in year 0001 when the listed posts are missing or all
  undated (for example a home feed whose main sections have no dated posts while the About page has a date). The date
  now comes from the newest listed item, and the element is left out when there is none (#68).

## [1.2.4] - Unreleased

### Fixed
- Tag, category and series pages whose posts have no photos show the header image when `params.header_image` is a
  path such as `img/head.jpg`: the term hero now makes it absolute (`https://example.org/img/head.jpg`) like every
  other hero, instead of a relative URL that broke under `/tags/x/` (#67).

## [1.2.3] - Unreleased

### Removed
- An unused stylesheet rule for `<h1>` inside the archive and tag index body, which has none; the stylesheet is 72
  bytes smaller and the pages look the same (#63).

## [1.2.2] - Unreleased

### Changed
- The README and the theme's `hugo.toml` comment name the site configuration `hugo.toml`, the name Hugo's documentation
  uses; `config.toml` still works (cyvaquero/hugo-site-guyheckman_me#102).

## [1.2.1] - Unreleased

### Added
- An optional footer menu: `[[menus.footer]]` entries show as links under the social links, in a navigation landmark
  named "Footer", styled like the social links (44px targets, same colors). Sites without one render the same footer
  as before (cyvaquero/hugo-site-guyheckman_me#84).

## [1.2.0] - 2026-10-09

### Added
- A color theme switch in the nav: System (the default, follows the device setting), Light and Dark (#22).
  - Three icon buttons named System, Light and Dark, with the current one pressed (`aria-pressed`). They sit inline
    from 821px and in the hamburger menu below that, with 44px targets on touch screens, the sand focus ring and a
    Highlight state in forced-colors mode. Icon, pressed fill and outline contrast are 6.6:1 or more on the nav band.
  - The choice is kept in `localStorage`, applies before the first paint (`theme.js` is a small blocking script in
    `<head>`, so a CSP needs no hash), and keeps other open tabs in step. Where storage is blocked it still works for
    the page.
  - `color-scheme` and both `theme-color` metas follow the picked mode, and loaded Disqus comments reload to match.
  - Every element's computed colors in a picked mode match the same mode chosen by the system, so the measured
    contrast carries over. Without JavaScript the switch is hidden and the mode follows the system.
- Highlighted code blocks follow light and dark mode when the site sets `[markup.highlight] noClasses = false`: the
  theme colors Chroma's classes with the modus-operandi palette in light mode and modus-vivendi in dark, on the theme's
  code background, every token 4.8:1 or more, line numbers included. With Hugo's default inline styles, blocks show
  the chosen style's own colors and background (no hard-coded `monokailight` gray), and the README and CSS describe any
  light inline style, for example `modus-operandi` (#5, #44).
- A favicon and touch icon: a cream serif "g" on navy, as `favicon.svg`, `favicon.ico` (16, 32 and 48px) and a 180px
  `apple-touch-icon.png` in the theme's `static/`. A site uses its own by adding files with the same names to its
  `static/` (#1).
- `<meta name="theme-color">`: navy `#1B3C53` in light mode and `#0F2332` in dark (#1, #22).
- `params.og_image`: the share image for pages that have no `image` of their own and no photos. The header image is
  still the fallback when it is unset (#1).
- `images/screenshot.png` and `images/tn.png` for `theme.toml` (#1).
- `og:locale`, `article:published_time` (posts), `twitter:title` and `twitter:description` meta tags, and
  `<meta name="robots" content="noindex">` on the 404 page and the search section (#2).
- A print stylesheet: black on white, without the nav, controls or comments (#3).

### Changed
- Text in a photo post, around its galleries, is styled like an article: serif body text, headings, quotes, tables,
  code and code blocks, figures and captions, in a 44rem column. The galleries are unchanged (#5).
- The heroes, photo tile badges and captions, and the lightbox take their colors from the color tokens; nothing looks
  different (computed colors of every element on eight page types, both modes, 1280 and 375 px, unchanged). A new
  `--scrim` token holds the navy scrim color for a site's own CSS (#5).
- Faster builds for sites with many posts: the wall's tile list and pager are built once per list page instead of once
  per pager page. Median build times (Hugo 0.167.0) went from 125.1 to 114.5 ms with 80 posts and from 711.6 to
  335.8 ms with 550; guyheckman.me's 8 posts are unchanged (77.2 to 76.9 ms). The built site is byte-for-byte the same
  (#7).
- Disqus comments are click to load. Posts show a "Show comments" button, and nothing from Disqus, or the ad trackers
  it brings, is requested until a reader clicks it. Focus then moves to the comments. Development builds show a note
  instead (#16).
- The GA and Disqus loaders are small theme files (`assets/js/analytics.js`, `assets/js/comments.js`) instead of Hugo's
  inline templates, so pages have no inline scripts. A site CSP no longer needs `script-src` hashes for them (#16).
- Highlight mode turns non-matching tiles gray and fades their photos, instead of fading the whole tile to 35%. Their
  text keeps full contrast: 6.63:1 light and 5.8:1 dark, up from about 1.7–2.6:1. Matching tiles get a dashed outline,
  so a focused tile's solid ring stands out (#3, #19).
- The theme's feed template (`layouts/rss.xml`) covers the home, section and term feeds. The home feed lists only
  main-section pages, so About and Archive are no longer items dated 0001; items without a date have no `pubDate`. A
  site's own feed template still takes precedence (#18, #36).
- The theme no longer looks for `static/img/favicon.ico` and no longer sets an empty `data:,` icon. A site that kept
  its icon there should rename it to `static/favicon.ico` (#1).

### Removed
- The unused `data-series` attribute on tiles and the dead `.tile[hidden], details[hidden]` rule (#13).

### Fixed
- A post without a `title` gets one from its file name ("20250601-untitled-post.md" becomes "Untitled Post")
  everywhere it is shown or linked: the `h1`, `<title>`, wall tiles (name, caption and accessible name), see-all tiles,
  "Group by gallery" headings, the archive, the feed, post navigation and the series box (#18, #65).
- A post without a `date` shows "Undated" instead of "Jan 1, 0001" in its header, wall tiles, the archive (under an
  "Undated" heading) and the series box; the build warns, naming the file; and it sorts after dated posts on the
  newest-first wall (#36).
- Keyboard focus is visible everywhere it lands (#19, #66):
  - Photo, see-all and article tiles share a solid `--focus` ring: 5.37:1 in light mode, 8.06:1 in dark (article
    tiles drew sand on cream, 1.59:1). The tile rings need `:has()` and are applied only where it is supported.
  - Tag links in article tiles have a sand ring on the navy tile (6.63:1, was 1.96:1) and are 24px tall, up from 15px.
  - Highlighted code blocks show the 3px ring around the whole block instead of a clipped one: 5.37:1 light,
    8.06:1 dark, in both highlighting modes.
- Focus is managed in the wall controls, nav and popover (#3, #13, #19):
  - Clear moves focus to the "All" chip; Reset closes the popover and returns to "View options".
  - One Escape with the menu and popover open closes only the popover.
  - Opening the popover moves focus to its first control, and it closes when focus leaves it, or when a chip or Clear
    is clicked.
  - The open menu closes when focus leaves it, and drops its open state when the window grows past 820px.
  - The skip link focuses `main`. Keyboard focus on a type chip no longer dims the wall; only mouse hover previews.
- Accessible names and announcements (#3, #13, #19, #34, #38):
  - "View options" with its badge reads "View options 1 active"; the Group switch, selected chips and group headings
    no longer include their On/Off text or ✓ and ▸/▾ glyphs; the ☰ glyph is hidden.
  - The see-all tile's name starts with its visible text ("Boston Gallery, 14 more photos, see all 18", WCAG 2.5.3).
  - Moving through the lightbox announces "Photo 4 of 18: La Huasteca" instead of only the counter "4 / 18".
  - The wall's live caption changes only when its text does, and isn't announced on page load.
  - External links say "(opens in a new tab)" to screen readers.
  - A visually hidden "Posts" `h2` above the wall gives h1 > h2 > h3. The table of contents is a `nav` named "Table of
    contents", and the sticky version scrolls when it is taller than the window (the Markdown cheatsheet's was 847px).
- Without JavaScript, the nav shows its links at 820px and narrower instead of a Menu button that does nothing
  (`assets/css/nojs.css`, loaded in `<noscript>`, no inline CSS) (#3).
- Text over photos meets AA even over a white image: home hero scrim .70–.85 with a cream kicker, post hero at least
  .85 behind its text, photo tile captions at least .85 (#3).
- The lightbox: its counter and alt text change only when the new photo has loaded, so they describe the photo on
  screen, and the neighbors are preloaded; Home and End keys, and swipe; no Previous or Next for a single photo; the
  page doesn't scroll behind it; dynamic viewport units (`dvh`) (#3).
- A gallery photo without a title still gets "Photo N" alt text, and the build warns (#3).
- Forced colors: the Group switch knob is 21:1 off and 14.37:1 on (was 1:1); pressed chips and the current page use
  the system highlight (#3).
- Post headers link their categories (#3), and the legacy `addtional_menus` links get `aria-current` (#3).
- Photo counts, wall tiles and covers match the photos a post shows (#17):
  - A positional `src` (`{{< gallery "…" >}}`) is counted.
  - Titles with an escaped quote, a `}` or a `>` are read whole, and backtick-quoted arguments are read.
  - The `{{% %}}` form, which renders nothing, is no longer counted.

  A probe post with four photos was counted as 2, with one title cut to `A \`; it is now counted as 4, all titles
  intact.
- Every page links the site's RSS feed, in the head and in the footer; term and section pages also link their own
  feed (posts, About and Archive had none, and the footer pointed at a term's own feed on term pages) (#2).
- Template edge cases (#18):
  - **`params.wall.tilesPerPage`:** a value below 1 fails the build with a clear message (`0` meant 24 and `-1`
    aborted with a template error).
  - **Long pagers:** the first and last pages and two on each side of the current page, with an ellipsis.
  - **Empty site title:** page titles drop the trailing " | ".
  - **A to Z indexes:** sorted by the term page's title, so a retitled term no longer repeats a letter heading.
  - **`showtoc`:** `showtoc: "false"` (a string) turns the table of contents off, like `showtoc: false`.
- "Oldest first" is the exact reverse of "Newest first" for posts published on the same day, on the flat wall and for
  same-day galleries in grouped mode. A gallery's photos keep their order, and its see-all tile stays last (#32).
- Images, code and tables in photo-post and page bodies stay within the page width (#13).
- The hero's wavy-underline style (`.u`) applies only inside the home hero. It used to italicize any `class="u"`
  element on the site, such as the unit labels in SnugCut on guyheckman.me (#33).

### Security
- The `embed` shortcode fails the build for a URL on the site's own host. The sandbox it sets, `allow-scripts` plus
  `allow-same-origin`, lets a same-origin page lift its own sandbox, so it protects only cross-origin frames such as
  SmugMug embeds, which still work (#37).
- Visitors who send Do Not Track or Global Privacy Control no longer request gtag.js from Google. Hugo's template
  loaded it for everyone and only skipped the tracking call. Analytics no longer loads in development builds (#16).
- The lightbox is built with DOM calls instead of `innerHTML`, so it works under a Trusted Types CSP (#16).
- A gallery photo inside an HTML comment (`<!-- {{< gallery … >}} -->`) is no longer published on the home and term
  walls or used as the post's cover and `og:image`. The post itself never showed it (#17).
- `og:image` is emitted only for an `http` or `https` URL; a `javascript:` image in front matter was output as is (#2).

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

[1.2.27]: https://github.com/cyvaquero/hugo-theme-theblues/compare/1.2.0...develop
[1.2.26]: https://github.com/cyvaquero/hugo-theme-theblues/compare/1.2.0...develop
[1.2.25]: https://github.com/cyvaquero/hugo-theme-theblues/compare/1.2.0...develop
[1.2.24]: https://github.com/cyvaquero/hugo-theme-theblues/compare/1.2.0...develop
[1.2.23]: https://github.com/cyvaquero/hugo-theme-theblues/compare/1.2.0...develop
[1.2.22]: https://github.com/cyvaquero/hugo-theme-theblues/compare/1.2.0...develop
[1.2.21]: https://github.com/cyvaquero/hugo-theme-theblues/compare/1.2.0...develop
[1.2.20]: https://github.com/cyvaquero/hugo-theme-theblues/compare/1.2.0...develop
[1.2.19]: https://github.com/cyvaquero/hugo-theme-theblues/compare/1.2.0...develop
[1.2.18]: https://github.com/cyvaquero/hugo-theme-theblues/compare/1.2.0...develop
[1.2.17]: https://github.com/cyvaquero/hugo-theme-theblues/compare/1.2.0...develop
[1.2.16]: https://github.com/cyvaquero/hugo-theme-theblues/compare/1.2.0...develop
[1.2.15]: https://github.com/cyvaquero/hugo-theme-theblues/compare/1.2.0...develop
[1.2.14]: https://github.com/cyvaquero/hugo-theme-theblues/compare/1.2.0...develop
[1.2.13]: https://github.com/cyvaquero/hugo-theme-theblues/compare/1.2.0...develop
[1.2.12]: https://github.com/cyvaquero/hugo-theme-theblues/compare/1.2.0...develop
[1.2.11]: https://github.com/cyvaquero/hugo-theme-theblues/compare/1.2.0...develop
[1.2.10]: https://github.com/cyvaquero/hugo-theme-theblues/compare/1.2.0...develop
[1.2.9]: https://github.com/cyvaquero/hugo-theme-theblues/compare/1.2.0...develop
[1.2.8]: https://github.com/cyvaquero/hugo-theme-theblues/compare/1.2.0...develop
[1.2.7]: https://github.com/cyvaquero/hugo-theme-theblues/compare/1.2.0...develop
[1.2.6]: https://github.com/cyvaquero/hugo-theme-theblues/compare/1.2.0...develop
[1.2.5]: https://github.com/cyvaquero/hugo-theme-theblues/compare/1.2.0...develop
[1.2.4]: https://github.com/cyvaquero/hugo-theme-theblues/compare/1.2.0...develop
[1.2.3]: https://github.com/cyvaquero/hugo-theme-theblues/compare/1.2.0...develop
[1.2.2]: https://github.com/cyvaquero/hugo-theme-theblues/compare/1.2.0...develop
[1.2.1]: https://github.com/cyvaquero/hugo-theme-theblues/compare/1.2.0...develop
[1.2.0]: https://github.com/cyvaquero/hugo-theme-theblues/compare/1.1.0...1.2.0
[1.1.0]: https://github.com/cyvaquero/hugo-theme-theblues/compare/1.0.0...1.1.0
[1.0.0]: https://github.com/cyvaquero/hugo-theme-theblues/releases/tag/1.0.0
