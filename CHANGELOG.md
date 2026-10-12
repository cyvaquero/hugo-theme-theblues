# Changelog

All notable changes to this theme are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions are git-flow tags with no `v` prefix.

## [1.4.15] - 2026-10-12

### Added
- A `CLAUDE.md` with the rules for working on the theme: what this public repo must not contain (links to private
  repos, personal data, site-specific code), a support statement (Hugo minimum, translatable strings with left-to-right
  layout only, Markdown content, SmugMug photo URLs, the browser range), the test policy (the `exampleSite` builds,
  byte-identical output for changes not meant to alter it), the conventions for the version, strings and template
  scripts, which files under `docs/retheme/` are historical, and the repository's merge and branch rules. Contributor
  documentation only; the theme's output is unchanged.

## [1.4.12] - 2026-10-11

### Added
- The dark-token check has a test of its own (#267). `exampleSite/variants/dark-tokens.toml` builds the fixture with a
  stand-in stylesheet whose two dark-token blocks differ, and the build must warn `theblues-dark-tokens`, naming the
  token. If a later change to `main.css` stops the check's patterns from matching, that build prints no warning, so the
  silence is noticed. "Testing the theme" has the command. Test fixture and README only; the theme and guyheckman.me
  are unchanged.

## [1.4.11] - 2026-10-11

### Added
- The theme's test fixture covers more of what the theme documents (#265). `exampleSite/variants/` has three config
  variants for the README's test builds: the primary nav from `[[menus.main]]` (including an entry whose page doesn't
  exist, which is left out), a second language with a partial German translation as the default, which makes the English
  fallback, the per-language script names and the `theblues-i18n` check run, and a Google Analytics ID, which production
  builds load. The base fixture gets an article with an inline `gallery`, which had no coverage. "Testing the theme"
  now also builds the fixture minified and each variant, all with `--panicOnWarning`. Only the test fixture changes:
  the theme's templates, styles and scripts are untouched, and guyheckman.me's pages are identical.

## [1.4.10] - 2026-10-11

### Changed
- The hero's photo setup (its smaller SmugMug sizes, and the two Store keys `head.html` reads for the preload) now lives
  in one partial, `hero-style.html`, instead of being copied into `home.html`, `term.html`, `404.html`, `post/page.html`
  and `hero.html` (#264). A change to the hero's preload or size data is one edit. The built pages are unchanged, byte
  for byte, on guyheckman.me and the exampleSite.

## [1.4.9] - 2026-10-11

### Changed
- The theme's own test build now checks the English-fallback idiom, the `(or (T "key") (partial "t.html" "key"))` pair
  that every piece of theme text uses (#263). In every template, the keys given to `T` and to `t.html` must be the same
  list in the same order, and each must be in `i18n/en.toml`; a mismatch warns with the ID `theblues-i18n-pair`, which
  fails the README's `--panicOnWarning` build. Before, a mismatch showed the wrong English text only on a site whose
  language lacked the entry. This is in the exampleSite only (its `hugo.toml` mounts the theme's layouts as assets and
  its own `head-end.html` reads them), so sites that install the theme, and guyheckman.me, are unchanged. The pair itself
  stays as it is: a wrapper partial doubled the 550-post build time (#192).

## [1.4.8] - 2026-10-11

### Changed
- A theme script is run as a Go template only when its first line is the template comment `theblues:template` (it
  renders as nothing), no longer whenever the file contains `{{` (#262). `wall.js`, `comments.js` and `gallery.js` carry
  the comment, so the built scripts are unchanged. A `{{` in a comment or string of any other script, such as `menu.js`,
  is now published as written instead of being executed. A site that overrides `wall.js`, `comments.js` or `gallery.js`
  with its own copy needs the same first line in it; a script that calls `js-text.html` without it fails the build with
  a message naming the script, instead of being published with the call unexpanded. The README says how.

## [1.4.7] - 2026-10-11

### Fixed
- A hero image given as a local path (`header_image`, a page `image`, `image_404`) no longer warns
  `theblues-insecure-photo` when the site's `baseURL` is `http://`, as under `hugo server` or the README's screenshot
  build; with `--panicOnWarning` that warning failed the build (#257). The check skips URLs under the site's own
  `baseURL`. A photo whose URL names another host over `http://`, or the site's own host over `http://` when the
  `baseURL` is `https://`, still warns. Built pages are unchanged.

## [1.4.6] - 2026-10-11

### Fixed
- A `tilesPerPage` or `photosPerGallery` that isn't a number, such as `"abc"`, now fails the build with a message that
  names the setting (`params.wall.tilesPerPage must be a whole number, 1 or more (got "abc")`), as the README promises.
  Before, Hugo's generic `unable to cast` error pointed into a theme partial (#256). Valid values and the messages for 0
  and negative values are unchanged, and so are the built pages.

## [1.4.5] - 2026-10-11

### Fixed
- "Try again" after a Disqus timeout no longer loads Disqus's `embed.js` a second time (#254). When Disqus is slow
  rather than blocked, the 15-second timeout used to remove the script tag while its request kept running, and a click
  on "Try again" added another, so the embed could run twice. The first script now stays after a timeout and the retry
  waits for it; a blocked or failed request still gets a fresh script on retry.

## [1.4.4] - 2026-10-11

### Fixed
- A SmugMug photo URL with a query string or fragment, such as `…/X2/i-1-X2.jpg?foo=1`, now gets the right large-size
  link (`…/X3/i-1-X3.jpg?foo=1`) in the lightbox, the full-size link and the feed; before, the file name kept its `X2`
  and the link pointed at a photo that doesn't exist (#253). URLs without a query string are unchanged, so
  guyheckman.me's pages are too. The exampleSite's "A photo gallery" post now has a query string on its second photo,
  which covers this case.

## [1.4.3] - 2026-10-11

### Fixed
- On a wall page whose only tile from a gallery is its "see all" tile, Group by gallery now shows the gallery's date in
  the heading and counts the gallery in the caption ("grouped into 1 gallery"), as on other pages (#252). The see-all
  tile carries the gallery's date in a new `data-shown` attribute, so the built wall pages change by that attribute and
  the `wall.js` file name; no tile moves or changes otherwise.

## [1.4.2] - 2026-10-11

### Fixed
- `hugo --templateMetrics --templateMetricsHints` finishes with the theme instead of hanging (#243). Hugo holds its
  metrics lock while it hashes the value a partial returns; for a stylesheet or script that was still waiting to be
  built, the hash ran the build, whose own partial calls then waited for the same lock. `asset.html` now builds the
  resource before it returns it. The built pages and files are unchanged. The README's "Testing the theme" says how to
  run that check (#243).

## [1.4.1] - 2026-10-11

### Security
- The build reads photo sizes only from `https://photos.smugmug.com/`, as it already did for hero images (#255). A
  `gallery` shortcode or wall photo on any other https host is no longer requested at build time, so a post can't make
  the build server fetch an internal address or a large file. Such a photo gets no width and height, like an `http://`
  photo, and no warning. Photos on SmugMug keep their sizes, so guyheckman.me's pages are unchanged. The README notes
  Hugo's `security.http.urls` allowlist for CI builders (#255).

## [1.4.0] - 2026-10-11

### Added
- The theme's text can be translated, and dates follow the site's language (#192, #249). All 100 pieces of text the
  theme writes, including the wall's caption and counts, the comment and lightbox messages, the feed's channel text and
  the date layouts, are in `i18n/en.toml`. A site translates them with its own `i18n/<language>.toml` (README,
  "Translating the theme"). Text a language has no entry for falls back to English, and a language with no theme text
  at all gets English labels and the `theblues-i18n` warning. `wall.js`, `comments.js` and `gallery.js` get their text
  at build time, with one script per language on a multilingual site. Month and day names come from Hugo's locale data
  for other languages, while English sites keep US English names (`en-GB` writes "Sep"). Hugo's English 404 title is
  replaced by the site's text. Count text picks the right singular or plural form on every build. For an English site
  the built pages are unchanged; the 550-post build takes 0.51 s against 0.49 s.
- The build checks that the two copies of the dark color tokens in `assets/css/main.css` match, and warns with the ID
  `theblues-dark-tokens`, naming each token that differs (#196).
- The README says which browsers the theme supports: the current and previous major versions of Chrome, Edge, Firefox
  and Safari. It names the oldest versions with everything working (Chrome and Edge 108, Firefox 121, Safari 16.4) and
  what degrades below them (#208, #250).
- The README has a "Content Security Policy" section listing the origins a site's policy needs for the theme, SmugMug,
  Google Analytics, Disqus, `embed` and YouTube, with an example policy, tested with every listed service (#185).
- The README says when Google Analytics loads, and that the theme has no consent step. It also explains how a site that
  needs consent can gate or replace it (#176).
- The README shows screenshots of the theme: the home wall in light and dark, a photo post, the lightbox, an article,
  the View options popover, a tag page, the color theme switch and the phone menu. There are nine WebP files, 0.84 MB
  in all, with alt text and capture steps (#209).

### Changed
- Wall tiles no longer carry a `data-order` attribute. A site's own CSS or script that reads it must take the tile's
  position from the DOM. `wall.js` sorts exactly as before, checked across 728 control states (#188).
- Rewriting a SmugMug URL to another size now happens in one partial (`smug-size.html`, with sizes in
  `smug-sizes.html`). Only the last path segment is rewritten, so a URL with an earlier `/X2/` directory keeps it
  (#190).
- Group titles on the wall, and the series box title, are headings (#172). With Group by gallery on, each group title
  is an `h3` and the article tiles become `h4`. The series box title is an `h2`. They look the same. A site's CSS that
  targets `.tile.article h3` needs `h4` too, and `.series strong.t` becomes `.series .t`.

### Fixed
- Feeds list posts newest first, so a series `weight` no longer pushes newer posts off a feed with a `limit` (#163).
- Walls, term heroes and previous/next links are right after an edit under `hugo --watch`, as under `hugo server`
  (#164, #191).
- The tag, category and series A to Z indexes show each letter heading once, with accented letters under their own
  heading (#165).
- A photos-category post with no gallery photos is an article on its own page too, with a table of contents and
  reading time (#166).
- The wall caption starts "This page:" on every page of a list that has a pager (#167).
- The lightbox no longer stays empty and busy when a photo fails to load: the counter and the announcement update, and
  the busy state ends (#168).
- The desktop nav wraps onto a second row, so a long menu or zoomed text no longer pushes the theme switch off screen.
  At 821px with eight items, everything is now in view (#171).
- Escape hides a photo tile's caption without moving the pointer or focus. An Escape that closes the View options
  popover or the mobile menu does only that (#173, #227).
- The skip link's focus ring is sand on the navy band (6.63:1, was 1.96:1) and is no longer cut off at the window's
  corner (#174).
- More links are 44px tall on touch screens: the nav brand and desktop nav links, the hero category link, the table
  of contents, the series box links and post navigation. The README lists exactly what is enlarged (#175).
- `hugo new content post/20261011-my-new-post.md` gives the title "My New Post", without the date, and the archetype
  has a commented `series` line (#179).
- The footer's LinkedIn and GitHub links tell screen readers they open in a new tab (#186).
- The table of contents label "On this page" is an `h2`, so it's in the heading list. It looks the same (#226).
- Keyboard focus on gallery thumbnails is visible. The ring is drawn on the thumbnail's frame, which used to clip it;
  without `:has()` it's drawn just inside the edge (#248).
- Documentation corrections:
  - the README's build-time figure is now about 0.5 s for 550 posts (#170);
  - what the image and link render hooks resolve (#177);
  - the "same 30 URLs" claim is dated to the switch from Clean White (#180);
  - the defaults for `slogan`, `tagline`, `title_404` and `subtitle` (#181);
  - a site-repo issue reference in the mockups README (#183);
  - posts start at `##`, and `youtube` needs a `title` (#187);
  - `theme.toml`'s `[original]` uses the themes gallery's keys (#194);
  - release tags have no `v` prefix, so a Hugo Module import gets the default branch (#195);
  - the accessibility target is stated against Section 508, including the 602 duties (#197);
  - `analytics-on.html` is a build-time value (#213).

### Security
- An `http://` gallery photo or hero image is no longer fetched in cleartext at build time. The build warns with the ID
  `theblues-insecure-photo`, naming the URL, and the URL is published as written (#184).
- A Markdown image with an `http://` source warns with the same ID, once per URL (#218).

## [1.3.0] - 2026-10-11

### Added
- An optional footer menu: `[[menus.footer]]` entries show as links under the social links, in a navigation landmark
  named "Footer", styled like the social links (44px targets, same colors). Sites without one render the same footer
  as before (cyvaquero/hugo-site-guyheckman_me#84).
- `params.dateFormat` sets how dates read on posts, wall tiles and the wall's gallery headings, as a Go layout (for
  example `2 January 2006`); without it they stay `Jan 2, 2006`. The archive's `Jan 2` and the series box's
  `Jan 2006` are unchanged. The wall script takes a gallery heading's date from the gallery's first tile instead of
  formatting it itself, so the two can't disagree. Strings stay English (#6).
- Sites can ask the theme whether Google Analytics loads on a page with `{{ if partial "analytics-on.html" . }}`, for
  example to show an analytics notice only when analytics loads. The theme's own `<head>` uses the same partial, so
  the two can't disagree, and the README lists it under "Extending from a site" as stable (#146).
- Wall tiles and gallery photos load a size that fits the screen instead of always SmugMug's 1280px X2: they offer
  SmugMug's M, L and XL sizes as well (`srcset` and `sizes`), when the build knows the photo's size. Photo bytes on
  guyheckman.me, page scrolled to the end, cache off: the home page 4.81 → 1.12 MB on a one-x screen at 375 or 1280px
  and 4.81 → 2.66 MB at 1280px on a two-x screen; the Boston gallery 8.12 → 2.23 MB and 8.12 → 4.17 MB; a three-x
  phone still loads X2, as before. The lightbox still opens the X3 size (#7).
- Every page whose hero has a photo preloads it at once, with high priority (`<link rel="preload" as="image"
  fetchpriority="high">`), at the same size the hero uses, and no other page does, so the browser never warns about an
  unused preload. On guyheckman.me with the cache off and a slow network (150 ms, 1.5 Mbit/s), median of 5: the home
  page's largest paint comes 330 ms sooner at 375 and 1280px (4.74 → 4.41 s, 7.63 → 7.31 s), About about 150 ms
  sooner, the 404 page 1.81 → 1.43 s; tag pages and photo posts 330–1,180 ms sooner at 375px than without the preload
  (photography tag 4.0 → 3.1 s, Monterrey gallery 4.3 → 3.1 s) and 110–340 ms sooner at 1280px (#7, #149).
- An "Accessibility" section in the README: the target (WCAG 2.1 AA, which also covers Section 508's WCAG 2.0 AA
  for web content), keyboard support for the skip link, nav menu, theme switch, wall controls, lightbox and comments,
  the live announcements, color, forced-colors, motion and reflow behavior, how to write accessible content (gallery
  titles, alt text, headings, line numbers, embed titles), and the known gaps with links to their issues. #94's
  mapping of WCAG 2.1 and Section 508 is linked from it (#79, #94).

### Changed
- Phones and one-x screens load a smaller SmugMug size of the hero photo, picked so it still fills the hero at the
  screen's pixel density: the hero looks the same. For example, the photography tag's X5 hero becomes L at 375px and
  X2 at 1280px, and a photo post's X3 hero becomes L and X2. On guyheckman.me with the cache off and a slow network,
  median of 5, the hero's largest paint at 375px comes sooner: About and article posts 3.2–3.7 s to 1.0 s (hero 329 KB
  to 72 KB), the home page 4.4 s to 3.1 s, the Boston gallery 7.7–7.9 s to 4.2 s (778 KB to 150 KB), and the
  photography tag 12.1–12.3 s to 4.0 s (1.57 MB to 116 KB); at 1280px the photography tag and the Monterrey gallery go
  from 14.6 s to 8.6 s (1.57 MB to 443 KB). Screens denser than two-x, wider than 1600px, or two-x wider than 640px
  keep the size the page names, as do photos on other hosts. Share images are unchanged (#149).
- Big sites build much faster. A post's photos, photo-or-article check and cover, and each list's wall tiles, are
  worked out once per build instead of being evicted from Hugo's small partial cache and recomputed; a term works out
  its hero's photo count and cover once instead of once per pager page; post navigation sorts the posts once; the
  series box renders each series' list once instead of once per post in it; and a photo tile is rendered once and
  reused on the home, tag, category and series walls. Median build with Hugo 0.167.0: 2,000 generated posts 68.5 →
  2.70 s; 550 posts 1058.3 → 454.1 ms; 80 posts 189.8 → 153.4 ms; guyheckman.me (8 posts) unchanged within noise.
  Built pages are byte-for-byte the same apart from blank lines the old term-page loop left before the hero, and under
  `hugo server` edits show up on the next rebuild (#7, #182).
- A series follows its posts' `weight` when they set one, as Hugo orders pages: weighted posts first, lowest first,
  negative weights included, then the rest, oldest first within each. The series box's list and numbering and the
  "Part N of M" tile chip use that order. Series whose posts set no weight are ordered by date as before (#6, #161).
- The home wall, section and term walls, the archive, post navigation and the taxonomy indexes list the pages in the
  site's `mainSections`, as the home feed already did, instead of only the `post` section. A site that keeps posts in
  another section (or several) sets `mainSections` and gives those pages the `post` type to get the post template;
  the README's "Content structure" shows both and says to set `mainSections = ["post"]`. guyheckman.me builds
  byte-for-byte the same (#6).
- The footer shows the site's `copyright` setting as written, when the site sets one, so a site can choose its own
  wording or a year range; the feed already used it. Without it the footer still reads "© <title> <current year>" (#6).
- The theme's build warnings have IDs, so a site can silence them with `ignoreLogs`: `theblues-gallery-no-title` for
  a `gallery` photo without a `title`, and `theblues-undated` for a post without a `date`. Hugo prints the
  `ignoreLogs` line to add under each warning, and the README lists every ID (#85).

### Deprecated
- The legacy `params.addtional_menus` nav list (Clean White's spelling). It still works when no `[[menus.main]]` is
  defined, but the build now warns once (`theblues-addtional-menus`, silenceable with `ignoreLogs`) to move to
  `[[menus.main]]`; it will be removed in a future major version (#86).

### Fixed
- "Show comments" moves keyboard and screen reader focus to a "Comments" heading and says what is happening. It used
  to focus an empty, unnamed container, announce nothing, and, if Disqus was blocked, remove the button with no way to
  try again. A polite status now reads "Loading comments…", then "Comments loaded.", or "Comments couldn't be loaded.
  Check your connection or content blocker, then try again." when Disqus is blocked or hasn't answered after 15 seconds,
  and the button comes back as "Try again" (WCAG 2.4.3 Focus Order, 4.1.3 Status Messages; #162). Disqus still loads
  only after the click, with no inline scripts, styles or handlers; the status text is 10.5:1 in light and 12.8:1 in
  dark.
- The wall and nav no longer jump when their controls appear: the wall's controls bar and, on desktop widths, the
  color theme switch keep their space, invisible, until their scripts show them, and without JavaScript they take no
  space. On guyheckman.me with the cache off and a slow network, the home page's layout shift (CLS) goes from 0.075 to
  0 at 375px and from 0.069 to 0 at 1280px, and a tag page's from 0.043 to 0 (#7, #138).
- Wall tiles and gallery photos keep their shape while they load, so the masonry no longer reshuffles as photos arrive:
  the build reads each photo's width and height (downloading it once into Hugo's resource cache) and puts them on the
  image. On guyheckman.me's home page 7 of 12 photo tiles changed height when their photo loaded and 10 to 11 tiles
  moved; on the Boston gallery 9 of 18 changed height and 15 to 16 moved (375 and 1280px). Now none do. A cold build
  of guyheckman.me (empty cache, 33 photos, 14 MB downloaded) takes about 1.5 s instead of 97 ms; with the cache warm
  it takes 100 to 101 ms. An offline build leaves the sizes out without a warning; a photo URL that answers 404 or
  isn't an image warns (`theblues-image-size`) (#7).
- On a wall split across pages, the type chips count the whole list, a gallery split across two pages is headed with
  all its photos on both, and the caption says it describes the page ("This page: 2 articles, 1 photo"). exampleSite's
  home (4 tiles per page) read "All 4", "All 3" and "All 1" on its three pages and now reads "All 8, Articles 6,
  Photos 2" on each; guyheckman.me's Boston Gallery, split at 5 tiles per page, read "4 photos" then "14 photos" and
  now reads "18 photos" on both. A one-page wall reads as before (#7).
- The page hero's small sand text (the "Article" / "Photo gallery" label and the date line) stays at 4.5:1 or more over
  a bright photo however long the title is: the darker part of the scrim starts just above the text, and the rest of
  the photo keeps a light .45 scrim. Over a white photo with an 84-character title the label is 5.86:1 at 320, 375,
  768 and 1280px in both modes, up from as low as 3.55:1 (#74).
- A post whose headings are all outside the `markup.tableOfContents` levels no longer shows an empty "On this page"
  box. If a Hugo update changes the `<nav id="TableOfContents">` wrapper the theme checks and labels, the build warns
  (`theblues-toc-markup`) instead of silently dropping the label (#87, #117).
- Wall pages after the first have their own title: `/page/2/` is "guyheckman.me – Page 2" and `/tags/x/page/2/`
  "X – Page 2 | guyheckman.me", so tabs, history and screen readers can tell them from page 1 (#78).
- Keyboard order in the wall's "View options" popover: Shift+Tab from its first control returns to View options with
  the popover still open, instead of jumping to Clear and closing it (#77).
- Long unbroken words and URLs in the body text of the archive, taxonomy index, section and search pages, and long
  term names on the taxonomy index, wrap at 320px instead of being clipped out of reach (a 100-character URL made the
  page 858px wide in a 305px viewport; now 305px) (#75).
- Hugo's `[privacy.disqus] disable = true` turns comments off: posts get no "Show comments" button and no
  `comments.js`. Before, the setting was ignored (#72).
- The note posts show instead of comments reads "Disqus comments are not loaded outside production builds", which
  matches when it appears: in any non-production build, not only in development (#84).
- A post that wraps its `gallery` calls in the `{{% galleries %}}` form, which renders no photos, no longer takes its
  hero and `og:image` from those hidden photos, and they no longer appear as wall tiles (#71).
- Tag, category and series pages whose posts have no photos show the header image when `params.header_image` is a
  relative path such as `img/head.jpg`, instead of a URL that broke under `/tags/x/` (#67).
- Feeds no longer print an empty `<lastBuildDate>` or one in year 0001 when the listed posts are missing or all
  undated; the date comes from the newest listed item, and the element is left out when there is none (#68).
- `params.wall.photosPerGallery` is validated like `tilesPerPage`: 0 or a negative value fails the build with
  "params.wall.photosPerGallery must be 1 or more (got N)", instead of 0 silently meaning 4 and a negative value
  failing with Hugo's internal error (#69).
- A missing theme stylesheet or script fails the build with `theblues: asset "css/main.css" not found in assets/`,
  instead of publishing every page without it and exiting successfully (#83).
- The build warning for a `gallery` photo without a `title` gives the photo's `src`, and for a photo inside a
  `galleries` block the block's line instead of `:1:1` (#73).
- Posts created with `hugo new` follow the site's `params.showtoc` again: the post archetype no longer writes
  `showtoc: true` (#90).

### Security
- The `embed` shortcode's same-host check can no longer be bypassed. A URL written `https:///own-host/…` (an empty
  host to Hugo, the site's host to a browser) slipped past it and loaded same-origin, where the sandbox gives no
  protection. The build now fails unless the host follows `https://` directly, with no user name, backslash or space
  before the path, and also fails when the URL's host or the site's `baseURL` host is empty (#70).

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

[1.3.0]: https://github.com/cyvaquero/hugo-theme-theblues/compare/1.2.0...1.3.0
[1.2.0]: https://github.com/cyvaquero/hugo-theme-theblues/compare/1.1.0...1.2.0
[1.1.0]: https://github.com/cyvaquero/hugo-theme-theblues/compare/1.0.0...1.1.0
[1.0.0]: https://github.com/cyvaquero/hugo-theme-theblues/releases/tag/1.0.0
