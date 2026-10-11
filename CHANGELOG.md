# Changelog

All notable changes to this theme are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions are git-flow tags with no `v` prefix.

## [1.3.38] - Unreleased

### Fixed
- The wall's script no longer ships the plural text for a count of 1 on some builds (#249). On about a third of builds
  the built `wall.*.js` had "1 photos", "1 articles" or "grouped into 1 galleries" as its one form, and the script's
  fingerprint changed between identical builds. The theme now gives Hugo one plain number for each form, so every build
  has the right one and other forms and the same file. It works for any language file: the number is swapped for the
  script's `%d` mark wherever the entry puts it. Checked: 750 calls of the text partial in three builds gave the right
  forms every time (before, 85 to 99 wrong of 250 per build); 20 builds of the example site gave one identical
  `wall.*.js`, where 6 of 20 differed before; a German site with its own `de.toml` and one without it (English text)
  both got the right forms; the wall caption shows "1 photo" and "grouped into 1 gallery". The built pages are unchanged
  apart from the script's fingerprint.

## [1.3.37] - Unreleased

### Fixed
- Keyboard focus on a gallery thumbnail is visible again (#248). The thumbnail's frame clips anything drawn outside the
  link, so Tab moved focus with no sign of where it was, on photo posts and in galleries inside articles. The 3px focus
  ring (steel on the page, sand in dark mode) is now drawn on the frame, as it is on a wall tile. In a browser without
  `:has()` (before Firefox 121) the ring is drawn just inside the thumbnail's edge, steel with a sand line inside it,
  so it shows on a light or a dark photo. Forced-colors mode keeps the ring. CSS only; the built HTML is unchanged.

## [1.3.36] - Unreleased

### Fixed
- The README's Installation section now says that release tags have no `v` prefix (`1.3.0`), which Go and Hugo Modules
  don't recognize as versions, so a site that imports the theme as a module, like the Hugo themes gallery, gets the tip
  of the default branch rather than a release (#195). Releases are used by pinning the submodule to a tag. The example
  tag is now `1.3.0`. Documentation only.

## [1.3.35] - Unreleased

### Added
- The README now shows what the theme looks like (#209): a hero picture of the home wall that switches between light
  and dark with the reader's GitHub theme, and a table with the photo post and its masonry gallery, the lightbox, an
  article with the table of contents and series box, the wall's "View options" popover, a tag page, the color theme
  switch, and the phone-width menu. Each image has alt text and the README reads the same without them. They are nine
  WebP files under `images/` (`readme-*.webp`), 34 to 175 KB each and 0.84 MB in all, captured from the exampleSite in
  headless Chrome; "Testing the theme" says how (build, viewport sizes, color scheme, pages and states, format and
  quality) so they can be made again. `images/screenshot.png` and `images/tn.png` for the themes gallery are unchanged:
  they still match the current look. The phone screenshot is shown 260px wide, so it doesn't fill the column of
  GitHub's README view. Each image was looked at after capture: photos loaded, no broken layout. No template or output
  changed.

## [1.3.34] - Unreleased

### Fixed
- The README no longer says `analytics-on.html` returns `true` when the theme "loads Google Analytics on the page" (#213),
  which reads as a per-visitor answer. It returns `true` when the page includes the theme's Google Analytics loader
  (`analytics.js`): a production build, a Google Analytics ID set, and `[privacy.googleAnalytics] disable` unset. The
  README now says that this is decided per build, and that the loader still loads nothing for visitors who send Do Not
  Track or Global Privacy Control. Checked against the partial and `assets/js/analytics.js`. Documentation only; no
  template or output changed.

## [1.3.33] - Unreleased

### Fixed
- `theme.toml`'s `[original]` table now uses the keys the Hugo themes gallery documents (#194): `author`, `homepage`
  (the original author's site) and `repo` (the original theme's source). It had `name` and a `homepage` that pointed
  at the repository. It now names Huabing Zhao, his site `https://zhaohuabing.com` (from his GitHub profile) and the Clean
  White repository; "Clean White" stays in a comment, since the spec has no name key. `demosite` is not added. Checked
  against the spec in the gohugoio/hugoThemes README, and that the file still parses as TOML (Hugo's own parser).
  `min_version` is unchanged. No template or output changed.

## [1.3.32] - Unreleased

### Fixed
- The mockups README now says "site issue #4" where it said "issue #4" (#183). Issue #4 is in the site repo
  (`cyvaquero/hugo-site-guyheckman_me`), not this one, as `docs/retheme/decisions.md` already writes it. Documentation
  only; no template or output changed.

## [1.3.31] - Unreleased

### Fixed
- The README's settings list now says what happens when the hero and 404 texts are unset (#181). `slogan` is the site
  title, `tagline` is `params.description`, and `title_404` is the theme's "Page not found" (the `pageNotFound`
  translation entry). A post's front matter `subtitle` shows only in a post's own hero, and falls back to the post's
  `description`; every other page's hero shows its `description` alone. Checked against `layouts/home.html`, `layouts/404.html`,
  `layouts/post/page.html` and `layouts/_partials/hero.html`. Documentation only; no template or output changed.

## [1.3.30] - Unreleased

### Fixed
- The README's opening no longer says the theme builds "the same 30 URLs as Clean White" as if that stayed true as
  the site grew (#180). It now says the theme builds the site's real content with no Hugo warnings, and that at the
  switch from Clean White it produced the same 30 URLs (the count `docs/retheme/clean-white-inventory.md` records).
  Documentation only; no template or output changed.

## [1.3.29] - Unreleased

### Fixed
- The README no longer says both Markdown render hooks resolve "a path to a page or page resource" (#177). Checked
  against the hooks: a link (`layouts/_markup/render-link.html`) resolves a page or a page resource, and an image
  (`layouts/_markup/render-image.html`) resolves a page resource or a file in the site's `assets/`, not a page. The
  README says that now. Documentation only; no template or output changed.

## [1.3.28] - Unreleased

### Fixed
- The README's build-time note now gives a current figure (#170). It said 550 posts built in about 0.34 s, measured for
  1.2.0, which the later entries here (0.49 to 0.51 s) contradicted. It now says about 0.5 s, the median of 9 production,
  minified builds of the 550-post site with a warm cache on Hugo 0.167.0 (range 0.49 to 0.58 s), and that times depend on
  the machine. Documentation only; no template or output changed.

## [1.3.27] - Unreleased

### Fixed
- The table of contents label ("On this page") is now an `h2` instead of a `<strong>`, so it shows in a screen reader's
  heading list as the first section of a post, ahead of the body's `##` headings (#226). The list is still a `<nav>`
  named "Table of contents". It looks the same: in headless Chrome the label's font, size, weight, spacing and color,
  and a screenshot of the box, are identical to before at 1280px and 390px, in light and dark mode. Advisory
  (WCAG 1.3.1, A).

## [1.3.26] - Unreleased

### Fixed
- The footer's LinkedIn and GitHub links now say they open in a new tab (#186). Like links to other sites in post text,
  they end with visually hidden "(opens in a new tab)" text, from the existing `opensInNewTab` entry, so a screen reader
  announces "LinkedIn (opens in a new tab)". They look the same. Checked in headless Chrome with a LinkedIn and a GitHub
  link set: the accessibility names changed from "LinkedIn" and "GitHub" to the longer ones, the links' positions and
  sizes and a screenshot of the footer are identical to before, and nothing scrolls sideways. Advisory (WCAG 3.2.5, AAA).

## [1.3.25] - Unreleased

### Fixed
- The README's accessibility section now says how its WCAG 2.1 AA target relates to Section 508 (#197). It names the
  WCAG 2.1 criteria the theme meets that Section 508's WCAG 2.0 baseline doesn't require (1.4.11, 1.4.13, 4.1.3) and
  says the software chapters (502, 503) don't apply to web content. It also gives the chapter 602 documentation
  duties: the section is the theme's list of accessibility features (602.2), and the README should itself conform to
  WCAG 2.0 AA (602.3). Documentation only.

## [1.3.24] - Unreleased

### Fixed
- The README's "Writing accessible content" list now says to start a post's headings at `##`, since the hero holds the
  page's h1 and a `#` heading in the body makes a second one, and to give Hugo's `youtube` shortcode a `title`, without
  which every video frame is named "YouTube video" (#187). Checked with Hugo 0.167.0: a body `#` heading renders as
  `<h1>`, and `youtube` without `title` gives `title="YouTube video"`. Documentation only.

## [1.3.23] - Unreleased

### Fixed
- An Escape that closes the mobile menu no longer also hides the caption of a photo tile under the pointer (#227).
  `assets/js/menu.js` now marks the Escape as handled (`preventDefault`), which the caption handler from #173 already
  respects, as it does for the View options popover. Checked in headless Chrome at 700px with the menu open and the
  pointer on a photo tile: 1.3.21 closed the menu and hid the caption; now the menu closes and the caption stays, and a
  second Escape hides it. Built HTML is unchanged apart from the footer version and the
  script's fingerprint.

## [1.3.22] - Unreleased

### Added
- The README now says which browsers the theme supports (#208): the current and previous major versions of Chrome,
  Edge, Firefox and Safari. It also names the oldest versions with everything working (Chrome and Edge 105, Firefox
  121, Safari 16.4, from the CSS features in use: `:has()` and range media queries; not tested in those versions) and
  what changes below them: the browser's own focus ring on wall tiles and code blocks without `:has()`, the full-size
  hero image without range media queries, and a lightbox sized to `vh` without `dvh` units. Documentation only; the
  built site is unchanged apart from the footer version.

## [1.3.21] - Unreleased

### Fixed
- More links are 44px tall on touch screens, and the README now says exactly which (#175). The README said "targets are
  44px on touch screens", but only chips, the View options and Clear buttons, the theme switch, tags and tile tag links
  were enlarged. The touch-target rules (coarse pointer) now also cover the nav brand, the desktop nav row's links (on
  a touch screen 821px or wider), the hero's category link, the table of contents entries, the series box's list and
  previous/next links, and the post navigation links, and the tile tag links go from 43px to 44px. Only the height is
  set. The README lists what is enlarged and what is not (links in running text, the series name link in the series
  box title, an article tile's title link, which sits inside a tile that is one link). WCAG 2.5.5 Target Size is AAA
  and not required (documentation accuracy); Section 508 602.2. Checked with Hugo 0.167.0 and headless Chrome with
  touch emulation (`pointer: coarse`) at 390px: 1.3.20 measured the hero category link 44x16, TOC links 31 tall, series
  links 25 and 28, post navigation links 28, the brand 42 and tile tag links 43; now each is 44 tall. A survey of every
  link, button and control on 16 pages (home, a series post, an untitled post, photo posts, tag, category, archive,
  About, Search, series pages, 404, a second wall page, with the popover and menu open) found nothing under 44px
  except the Group switch's checkbox (its row is 44px), article tile title links (the tile is the target), inline
  links in text and the series name link. At 1024px the desktop nav links were 35 and are now 44; the nav height on
  guyheckman.me (821px and 1024px) is unchanged. The page grows a little where lists got taller: on the test series post
  the table of contents 113px to 152px, the series box 185px to 215px, the post navigation 61px to 77px; the hero is
  unchanged (416px). Without a coarse pointer every measured height is the same as before. Built output of
  guyheckman.me and the exampleSite differs from 1.3.20 only in the fingerprints and the footer version.

## [1.3.20] - Unreleased

### Fixed
- The skip link's focus ring is now sand and no longer cut off (#174). The ring was steel blue, 1.96:1 against the navy
  band the link draws on in light mode (WCAG 1.4.11 needs 3:1), because the rule that switches the ring to sand on dark
  surfaces left `.skip` out; and the link appeared at the very corner of the window, so the top and left of the ring
  were outside it. Now `.skip` uses the sand ring, and a focused link sits `.5rem` in from the top and left. Dark mode
  was already sand. WCAG 1.4.11 Non-text Contrast (AA, 2.1 only) and 2.4.7 Focus Visible (AA); Section 508 E205.4 for
  2.4.7 only. The README's skip link entry says so. Checked with Hugo 0.167.0 and headless Chrome on the exampleSite,
  pressing Tab once, with the system set to light and to dark and the switch set to Light and to Dark: 1.3.19 drew
  rgb(69, 104, 130) on #1B3C53, 1.96:1, in both light cases, and sand on #0F2332, 9.22:1, in both dark cases, and the
  ring's outer edge was 5px outside the window (clipped) in all four; now the ring is rgb(210, 193, 182), 6.63:1 on the
  light band and 9.22:1 on the dark band, and its outer edge is 3px inside the window in all four. Built output of
  guyheckman.me and the exampleSite differs from 1.3.19 only in the fingerprints and the footer version.

## [1.3.19] - Unreleased

### Fixed
- Escape now hides a photo tile's caption (#173). A tile's caption appears over the lower part of the photo on hover or
  keyboard focus (98px of a 244px tile in the test) and had no way to dismiss it, so it could cover part of the photo
  until the pointer or focus moved away. Escape now hides it with the pointer and focus where they are; it shows again
  once both have left the tile and come back. An Escape that closes the View options popover does only that. The
  hiding rule is screen only, so a printed caption is unaffected (by the CSS; not tested). The caption is not moved. The README's keyboard list says so. WCAG 1.4.13 Content on Hover or Focus (AA, WCAG 2.1
  only; no Section 508 basis, since 508 incorporates WCAG 2.0). Checked with Hugo 0.167.0 and headless Chrome on the
  exampleSite at 1280px: in 1.3.18 the caption was opacity 1 on hover and on focus and stayed 1 after Escape; now
  Escape sets it to 0 in both cases, it stays 0 while the pointer moves within the tile, and it returns to normal (0 at
  rest, 1 on hover or focus) after the pointer leaves or focus moves away. The popover still closes on Escape.
  Built output of guyheckman.me and the exampleSite differs from 1.3.18 only in the fingerprints and the footer
  version.

## [1.3.18] - Unreleased

### Fixed
- Group titles on the wall and the series box title are now headings (#172). With "Group by gallery" on, each group
  ("Articles · 5 articles", "Boston Gallery · Jan 7, 2026 · 4 photos") was only a disclosure triangle styled like a
  heading, and the series box title ("Part 2 of 3: Name") was a `<strong>`, so a screen reader's heading list skipped
  them. Each group title is now an `<h3>` inside its `<summary>`, and `wall.js` turns the article tiles' `<h3>` into
  `<h4>` while the wall is grouped (and back when it isn't), so the outline reads h1, h2 "Posts", h3 group, h4 tile;
  the series box title is an `<h2>`. They look as before. The flat wall's markup and the series box's CSS class are
  unchanged apart from the tag. A site whose own CSS targets `.tile.article h3` needs `h4` as well, and one that
  styles `.series strong.t` needs `.series .t`. The README's accessibility section describes the outline. WCAG 1.3.1 Info and
  Relationships (A), Section 508 E205.4. Checked with Hugo 0.167.0 and headless Chrome (accessibility tree) on the
  exampleSite: 1.3.17 listed h1, h2 "Posts" and three h3 tiles, flat or grouped, and the series post had no heading
  for the box; now grouped it lists h3 "A photo gallery · Jan 7, 2026 · 4 photos", h3 "Articles · 3 articles" and the
  three tiles as h4, flat is unchanged after grouping and ungrouping, and the series post lists h2 "Part 1 of 2: Fixture
  Series". The group rows measured the same height and the same count position at 1280px and 390px (the count
  that wraps below the title at 390px now lines up with the title instead of the triangle). Built output of
  guyheckman.me and the exampleSite differs from 1.3.17 only in the series box markup of posts in a series, the
  fingerprints and the footer version.

## [1.3.17] - Unreleased

### Fixed
- The desktop nav no longer pushes the theme switch off the screen when the menu is long (#171). From 821px the nav
  links were one row that could not wrap, and `body { overflow-x: hidden }` hid whatever ran past the edge, so with
  eight menu items (or a long site title, or text zoomed to 150% to 160% on a 1280px screen) the Light and Dark
  buttons sat past the right edge of the window with no way to scroll to them. The row now wraps onto a second line
  (right-aligned, with a smaller row gap), so every link and the switch stay in view. A menu that fits looks exactly as
  before. The README's menu section says so. WCAG 1.4.4 Resize Text (AA), Section 508 E205.4. Checked with Hugo 0.167.0
  and headless Chrome on an exampleSite copy with eight menu items (nine links with the Search entry) at 821px: 1.3.15
  had System, Light and Dark at x 815 to 927 in an 821px window (page scrollWidth 930, so the last two were off
  screen); now all links and the three buttons end at x 790 or less, on two rows. At 1280px every link and button is at
  the same position as in 1.3.15. Built output of guyheckman.me and the exampleSite, in development and production
  builds, differs from 1.3.15 only in the fingerprinted stylesheet name and the footer version.

## [1.3.16] - Unreleased

### Security
- A Markdown image with an `http://` source now warns at build time (#218). `![](http://…)` was published as
  `<img src="http://…">` with no warning, which a browser blocks as mixed content on an https site or under a CSP that
  allows only `https:` images (CWE-319); the gallery and hero paths already warned (#184), Markdown images didn't. The
  image render hook now calls `https-check.html`, so the same warning (ID `theblues-insecure-photo`, naming the URL) is
  printed once per URL for a Markdown image, in any letter case of the scheme, `--panicOnWarning` fails the build, and a
  site can silence it with `ignoreLogs`. The image is kept and published as written; `https://` and relative images, and
  page resources, don't warn. The README names Markdown images next to the other cases. Checked with Hugo 0.167.0 on a
  scratch copy of the exampleSite with two posts: one with `![](http://example.com/a.jpg)` (twice),
  `HTTP://example.com/b.jpg`, an `https://` image and a page-resource image, the other repeating the first URL.
  1.3.15 built with no warning; now the build prints two warnings (one per distinct URL, none for the `https://` or
  relative image), `--panicOnWarning` stops it, and the `<img>` HTML of all 34 images is identical to 1.3.15. Built
  output of guyheckman.me and the exampleSite, production (minified, `--panicOnWarning`) and development, matched 1.3.15
  byte for byte after normalizing fingerprints, SRI hashes and the footer version (0 of 71 and 0 of 55 files differ).

## [1.3.15] - Unreleased

### Added
- The README now has a "Content Security Policy" section listing the origins a site's CSP needs (#185): what the theme
  itself needs (`'self'` for scripts and styles, no hashes, `style-src-attr 'unsafe-inline'` for the hero and tile
  `style` attributes), and per optional service the `script-src`, `connect-src`, `img-src`, `frame-src` and `style-src`
  origins for SmugMug photos, Google Analytics, Disqus, the `embed` shortcode and YouTube, with an example policy and
  notes. Documentation only. Checked with Hugo 0.167.0 and headless Chrome on a production build of an exampleSite copy
  with a Google Analytics ID, a Disqus shortname (an existing thread read through `disqus_url`, nothing posted), SmugMug
  photos and YouTube embeds, served with the example policy enforced: the home page, a SmugMug hero, a gallery with the
  lightbox open, the YouTube page and an article after "Show comments" gave no violation from anything the theme or the
  listed services load, and the comments loaded. Disqus also asked for a cleartext VigLink pixel and for LiveIntent
  (`d-code.liadm.com`); the README leaves them out, and they were blocked without breaking the comments. A first run with
  every origin withheld reported exactly the requests the lists name. Chrome could not reach `google-analytics.com` in
  the test, so no analytics hit was recorded. Built output of guyheckman.me, the 80-post and 550-post sites and the
  exampleSite, in development and production builds, is byte-identical to 1.3.14 apart from the footer version.

## [1.3.14] - Unreleased

### Security
- An `http://` photo URL is no longer fetched at build time, and the build now warns about it (#184). The size lookup
  for wall tiles and gallery images (`img-size.html`) requested any `http://` or `https://` URL, so a photo given as
  `http://` was downloaded in cleartext, where its size could be tampered with in transit (CWE-319), and the page then
  published `<img src="http://…">`, which a browser blocks as mixed content on an https site or under a CSP that allows
  only `https:` images. Now only `https://` photos are fetched, and the new partial `https-check.html` warns with the
  ID `theblues-insecure-photo`, naming the URL, for an `http://` gallery photo and for an `http://` hero image
  (`hero-sizes.html`, which only ever read `https://photos.smugmug.com`), once per URL, so a build with `--panicOnWarning`
  fails; a site can silence it with `ignoreLogs`. The URL itself is published as written, and the tile and gallery image
  get no width and height, as for a photo that can't be fetched. The README lists the ID and says so under the photo
  size bullet, and the layout list names the partial. Markdown images (`![](http://…)`) are not checked. Checked with
  Hugo 0.167.0 on a crafted post with an `http://` SmugMug-style gallery photo and a post with an `http://` `image`,
  served from a local server that logs requests (a scratch site that allows that host in `security.http`) and a fresh
  cache: 1.3.13 made one cleartext `GET` for the photo and wrote `width=960 height=300`, with no warning; now the server
  sees no request, the page has `<img src=http://… alt=Insecure>` without a size, the build prints three warnings (the
  photo, its X3 hero and the `image` hero, one each) and `--panicOnWarning` stops it. guyheckman.me, the 80-post and
  550-post sites and the exampleSite, in development and production builds (production with `--panicOnWarning`), build
  with no warning and are byte-identical to 1.3.13 apart from the footer version.

## [1.3.13] - Unreleased

### Fixed
- A site can now translate the theme's text and get localized dates without overriding templates (#192). All the text
  the theme writes (labels, headings, the wall's caption and counts, the comment and lightbox messages, the page-number
  text, the feed's channel text, the alt text "Photo N" and the three date layouts: 100 entries) is in the new
  `i18n/en.toml`, which the templates read with `T`, with `one` and `other` forms where the text picked "post" or
  "posts", "photo" or "photos" and so on. Dates use `time.Format`, so month and day names follow the site's language.
  `assets/js/wall.js`, `comments.js` and `gallery.js` get their text through the new `layouts/_partials/js-text.html`:
  `asset.html` runs a script that contains a Go template action as a template, so the HTML is the same for every
  language (no data attributes), and a site with more than one language gets a script per language (`js/wall.de.js`).
  The wall's English month list is gone: group headings take their date from the tile captions the server wrote, and a
  custom wall without captions shows no date text there instead of an English one. Hugo's English title for the 404 page
  ("404 Page not found") is replaced by the site's text. A site translates the theme with its own `i18n/<language>.toml`
  (README, "Translating the theme", which also lists what stays as it is: text that comes from the site, the link names
  RSS, LinkedIn and GitHub, the "©" and year of the footer's fallback line and build warning and error messages).
  English is the default. Text a site's language has no entry for, in the site's file or the default language's, is shown
  in English from the theme's `i18n/en.toml` (the new `layouts/_partials/t.html`, which reads it as data through a
  mount in the theme's `hugo.toml`; templates call it only when `T` comes back empty, so English pages never run it). A
  site whose language has no theme text at all gets English labels and a build warning with the ID `theblues-i18n`
  (the README lists it); the fix is to copy `i18n/en.toml` to `i18n/<language>.toml` and translate it. The same warning ID
  fires if a site's own module settings drop the theme's mount, which would leave missing text empty. Month and day
  names come from Hugo's locale data for other languages, but an English site (`en` or `en-*`) keeps US English names
  whatever its `locale`, so `en-GB` still writes "Sep", not "Sept". Checked with Hugo 0.167.0: for an English site (`en-US`) the built output of
  guyheckman.me, the 80-post and 550-post sites and the exampleSite, in development and production builds, is
  byte-identical to 1.3.11 apart from the footer version and the file names and SRI hashes of the three scripts (2,155
  files compared), and so is a crafted exampleSite copy with every month, posts that cross midnight in other time zones,
  one-photo, three-photo and four-photo galleries ("1 more photo", "2 more photos"), a one-post series and tag, an
  empty section, an embed without a title, an external link, and titles and terms with `&`, `+`, quotes and `<`. In
  headless Chrome the wall's caption, chips, badge, On/Off and group headings in 11 states on seven wall pages, the
  lightbox's labels and counter, and the comments' failure message and "Try again" button are identical to 1.3.11. A
  scratch exampleSite copy in German (`defaultContentLanguage = "de"`, `locale = "de-DE"`, a site `i18n/de.toml` that is
  not part of the theme) shows the translated labels, "Erstellt mit Hugo 0.167.0 und The Blues 1.3.13", "10. Jan. 2026"
  and "15. Dez." in the archive, "1 Beitrag" and "2 Beiträge", and a German 404 title; the wall's captions are German
  ("Hervorgehoben: 3 Artikel; 1 Foto abgeblendet auf dieser Seite, in 1 Galerie gruppiert") and its group headings read
  "A photo gallery · 7. Jan. 2026 · 4 Fotos". An English and German site builds `wall.en.js` and `wall.de.js` and each
  page loads its own. The same German copy without its `i18n/de.toml` shows every label, count and script message in
  English ("Skip to content", "4 photos", "Photo viewer") with German dates, where it had empty labels; with a
  `de.toml` of two entries those two are German and the rest English. An `en-GB` copy of the exampleSite is
  byte-identical to 1.3.11, and a September post there reads "Sep 15, 2026". The 550-post production build takes 0.51 s
  against 0.49 s before (minified, three runs each); calling the English fallback as a partial on every lookup took
  about twice as long, which is why templates try `T` first. The README's exampleSite check (`--panicOnWarning`, `--printUnusedTemplates`) passes.

## [1.3.12] - Unreleased

### Fixed
- A post made with `hugo new content post/20261011-my-new-post.md` now gets the title "My New Post" instead of "20261011
  My New Post" (#179). `archetypes/post.md` strips a leading `YYYYMMDD-` from the file name before it turns hyphens into
  spaces and title-cases it, as `page-title.html` does for a post with no title. The slug is unchanged (the whole file
  name, date included), so URLs of new posts follow the file name as before. The archetype also gets a commented
  `# series: []` line next to the commented `showtoc` one, and the README's layout list and Front matter text now describe
  `archetypes/post.md`. Checked with Hugo 0.167.0 in a scratch copy of the exampleSite: `20261011-my-new-post.md` wrote
  `title: "20261011 My New Post"` before and writes `title: "My New Post"` now, `nodate-post.md` writes `title: "Nodate
  Post"` both ways, and the only other difference in the front matter is the new commented line. The archetype is not
  part of a site's built output: guyheckman.me, the 80-post and 550-post sites and the exampleSite, in development and
  production builds, are byte-identical to 1.3.11 apart from the footer version.

## [1.3.11] - Unreleased

### Fixed
- The README now says when Google Analytics loads and that the theme has no consent step (#176). It loads as soon as
  a page is viewed, for every visitor who doesn't send Do Not Track or Global Privacy Control, in a production build
  with a GA ID and `[privacy.googleAnalytics] disable` unset; the theme has no consent banner, prompt or gate. A site
  that needs consent (GDPR, the ePrivacy Directive) must gate or disable analytics itself: set
  `[privacy.googleAnalytics] disable = true` or leave the GA ID out, and load Google Analytics from its own consent
  code (for example in `head-end.html`), or put its own `assets/js/analytics.js` in the site. The text is under
  `[services.googleAnalytics] id` in "Site settings it reads", with pointers from the JavaScript list, the Analytics
  note under "Extending from a site" and the `disable` line of the privacy settings. Documentation only. Checked
  against `head.html`, `analytics-on.html` and `analytics.js` with Hugo 0.167.0 and headless Chrome on a production
  build with a GA ID: with no signal the page requests `https://www.googletagmanager.com/gtag/js?id=…` on load and
  fills `dataLayer`, with no click or prompt; with `navigator.globalPrivacyControl` true or `navigator.doNotTrack` `"1"`
  there is no request and no `gtag`; `doNotTrack` `"0"` loads it. `disable = true` and a development build leave out
  the script tag and file, and a site's own `assets/js/analytics.js` replaces the theme's in the page and gets the ID
  as `data-id`. Built output of guyheckman.me, the 80-post and 550-post sites and the exampleSite, in development and
  production builds, is byte-identical to 1.3.10 apart from the footer version.

## [1.3.10] - Unreleased

### Added
- The build now checks that the two copies of the dark color tokens in `assets/css/main.css` match (#196). The tokens
  are written out twice, once under `@media (prefers-color-scheme: dark)` for a system that asks for dark and once for
  a reader who picked dark with the switch, and the two had to be kept the same by hand. The new partial
  `dark-tokens-check.html`, called once per build from `head.html`, reads the stylesheet the build uses (a site's own
  `assets/css/main.css` too), compares the declarations of the two blocks (comments, spacing and order don't count) and
  warns with the ID `theblues-dark-tokens`, naming each token that differs or is missing from one copy, so a build with
  `--panicOnWarning`, like the exampleSite check in the README, fails. A stylesheet with neither block gets no warning.
  The README lists the ID with the others and the layout list names the partial. Both copies stay for now: comments at
  both blocks and in the stylesheet header point to the check and to #208, where CSS `light-dark()` can replace the
  two copies once the theme sets a browser floor. Checked with Hugo 0.167.0: guyheckman.me, the 80-post and 550-post
  sites and the exampleSite build with no warning and, in production, byte-identical to 1.3.9 apart from the footer
  version; in a development build the HTML is identical and `css/main.css` differs only by the three new comments.
  With a scratch copy of the stylesheet, changing `--link` in one block gives "the two dark-token blocks differ:
  --link (system dark #D2C1B6, picked dark #D2C1B7)" and `--panicOnWarning` stops the build; a token removed from one
  block and another changed in it give one warning naming both; a block that can't be found gives a warning, and
  neither block gives none; changes to comments, spacing or order give none. On the 550-post site the check runs once
  (one warning for 682 pages when the copies differ) and the build takes 0.498 s against 0.507 s before (median of 6,
  production, minified), so it costs nothing measurable.

## [1.3.9] - Unreleased

### Changed
- Wall tiles no longer carry a `data-order` attribute. This is a markup change: a site whose own CSS or script reads
  `data-order` from `.tile` elements must take the tile's position from the DOM instead. `data-type`, `data-date`,
  `data-gallery`, `data-gallery-title`, `data-n` and `data-more` are unchanged. `assets/js/wall.js` now takes each
  tile's server order, which it uses only as the tie-breaker when sorting, from the tile's position in the DOM when the
  script starts (#188). The photo tile cache no longer renders the tile with a marker, splits the HTML around it and
  puts the order back in per wall (and falls back to uncached rendering if a photo title contained the marker): the
  tile is the same on every wall, so `tile-photo.html` caches `tile-photo-body.html` directly, keyed by page path,
  photo index and photo count. `tile-photo-parts.html` is removed, and `tile-article.html`, `tile-more.html`,
  `tile-photo-body.html` and `wall.html` no longer take an `order`; the README's layout list and tile attribute text
  are updated. Checked with Hugo 0.167.0 on a build of the old theme first: on every wall page of guyheckman.me
  (16 pages, 118 tiles), the 80-post site (60 pages, 1,180 tiles), the 550-post site (257 pages, 5,900 tiles) and the
  exampleSite (19 pages, 56 tiles), in development and production builds, `data-order` equalled the tile's index in the
  DOM, so the tie-breaker is unchanged. Against 1.3.8, the output of all four differs only by the removed `data-order`
  attributes, the `wall.js` fingerprint and `integrity` hash, and the footer version (the old output with `data-order`
  stripped is identical otherwise). In headless Chrome with a strict CSP (`script-src 'self'`, no `unsafe-inline`),
  14 wall pages of the production builds (home, section, tag, category and later pager pages, including days with
  several posts and galleries with a see-all tile) went through every combination of Newest first, Oldest first,
  Galleries first and Articles first, filter and highlight, All, Article and Photo, and Group by gallery on and off,
  then a closed group, Clear and Reset: all 728 states have the same ordered tile list and the same wall and controls
  markup as 1.3.8, with no CSP violations or script errors. The same run on 3 pages of the development builds, which
  serve `wall.js` unminified, gives 156 identical states. Forcing the order to 0 in `wall.js` makes the run report
  differences, so the comparison does see tie order. The 550-post site builds in 0.494 s against 0.513 s before (median of 6, production,
  minified).

## [1.3.8] - Unreleased

### Fixed
- Walls, term heroes and previous/next links are right after an edit under `hugo --watch`, as they already were under
  `hugo server`. A page's Store survives a rebuild in both, and the theme kept its per-list and per-site results (a
  wall's tiles, a term's photo count, the sorted posts behind the previous/next links) in it, skipping the Store only
  when `hugo.IsServer` was true, so under `--watch` they kept describing posts from before the edit (#164). The
  rule for when a kept value may be used was copied into six partials; it now lives in one new partial, `memo.html`,
  which uses a kept value only within the build that kept it, using a per-build number from the new `build-token.html`
  (Hugo drops the partial cache, and that number with it, at every rebuild). `cover.html`, `is-photo.html`,
  `photos.html`, `term-stats.html`, `post-nav.html` and `wall-pager.html` call it and no longer look at `hugo.IsServer`;
  the README lists both new partials (#191). Checked with Hugo 0.167.0 on a site with a five-photo gallery and two
  articles: after renaming photo 1 and adding a sixth, `hugo --watch` kept writing the home and photos-category walls
  with "Photo 1 of 5: Photo 1", the term hero with "5 photos" and the neighboring article's previous link with the old
  title; they now read "Photo 1 of 6: P1 edited", "6 photos" and the new title, the same as a fresh build and as
  `hugo server`, which was right before and still is. The memo reuses values: on the 550-post site the token is made
  once per build and every value is kept once (400 `is-photo`, 174 `photos`, 425 `cover`, 14 `term-stats`, 16 wall
  results and 1 `post-nav` list), and the build takes 0.50 s against 0.48 s before (median of 6, production, minified).
  Built output of guyheckman.me, the 80-post and 550-post sites and the exampleSite, in a development and a production
  build, is byte-identical to 1.3.7 apart from the footer version.

## [1.3.7] - Unreleased

### Changed
- The `exampleSite` fixtures now exercise the image-size, `srcset` and hero-size code, which none of them reached
  before (they pointed at a made-up host, and the header image `img/head.jpg` did not exist), so the README's
  before-and-after comparison of fixture output could not catch a regression in those partials (#193). Added
  `static/img/head.jpg` (9 KB), a gallery post of three real `photos.smugmug.com` photos (two landscape, one portrait)
  and an article whose `image` is a SmugMug X3 URL. A fixture build now writes `width`/`height` and a `srcset` of M, L,
  XL and X2 on 13 images, the hero's `--hi1` to `--hi4` sizes on two pages, and the matching preloads. Photos are
  fetched on the first build and then come from Hugo's cache; a fresh-cache build and a cached one give identical
  output. Nothing changes for sites that use the theme. Checked with Hugo 0.167.0: development and production builds of
  the exampleSite pass `--panicOnWarning --printPathWarnings --printUnusedTemplates`; against 1.3.6 the output differs
  only by the two new posts, their tiles, pages, feed and sitemap entries and archive, tag and category lists, the
  pager pages the extra tiles add, the previous/next links of the neighboring posts, and `img/head.jpg`. Output of
  guyheckman.me, the 80-post and 550-post sites is byte-identical to 1.3.6 apart from the footer version.

## [1.3.6] - Unreleased

### Changed
- Rewriting a SmugMug URL to another size now happens in one place. `smug-full.html` (X2 to X3 for the lightbox),
  `smug-srcset.html` (M, L, XL) and `hero-sizes.html` (the hero tiers) each carried their own copy of the path-segment and
  file-suffix rewrite, and the first two their own copy of the size boxes (M 600×450, L 800×600, XL 1024×768, X2
  1280×960). The rewrite is now the new partial `smug-size.html` and the sizes and boxes the new `smug-sizes.html`, and
  the README names both (#190). No output changes for SmugMug URLs of the form `…/SIZE/file-SIZE.ext`; only the last
  path segment is rewritten now, so a URL with an earlier `/X2/` directory in its path (which SmugMug doesn't produce)
  keeps that directory instead of having it rewritten too. Checked with Hugo 0.167.0: built output of guyheckman.me
  (105 `srcset`s, 31 hero tier sets), the 80-post and 550-post sites (1,050 and 5,250 `srcset`s) and the exampleSite, in
  a development and a production build, is byte-identical to 1.3.5 apart from the footer version and fingerprints; a
  site of galleries and covers in every size form (X2, X3, L, XL, X4, M, a query string, another host, a
  missing suffix) is identical too, except for that earlier-`/X2/` case.

## [1.3.5] - Unreleased

### Fixed
- The lightbox no longer stays empty and busy when a photo can't be loaded. If the large image failed, the viewer tried
  the thumbnail, but a failure of that too was ignored, so the dialog stayed `aria-busy="true"` with no image and an
  empty counter, and moving on from a loaded photo left the old photo showing (#168). It now finishes either way: the
  counter and the spoken "Photo N of M: caption" update, the busy state ends, and the browser's broken-image state shows.
  Checked in headless Chrome (Hugo 0.167.0, served with `script-src 'self'` and no `unsafe-inline`; no violations or
  script errors) on a gallery of three photos whose second one fails: before, opening it, or pressing Next from the first
  photo, left `aria-busy="true"`, "1 / 3" or an empty counter, and the first photo on screen; now the counter reads
  "2 / 3", the live region "Photo 2 of 3: Broken two", `aria-busy` is gone, and Next goes on to photo 3. When only the
  large image fails, the thumbnail still shows (checked with the X3 request failed and X2 served). Built output of
  guyheckman.me, the 80-post and 550-post sites and the exampleSite, in a development and a production build, differs
  from 1.3.4 only in the footer version and the gallery script's file name and content.

## [1.3.4] - Unreleased

### Fixed
- The wall caption starts "This page:" on every page of a list that has a pager. It said "Showing" on page 1 of a list
  whose first page held every counted tile, for example four photo tiles with the gallery's see-all tile on page 2
  ("Showing 0 articles, 4 photos" above a pager). The script guessed the paging from tile counts, which leave out see-all
  tiles; the build now writes the number of pager pages on the wall (`data-pages` on `#stage`) and the script uses that,
  falling back to the old comparison for a custom `wall.html` without it (#167). Checked in headless Chrome
  (Hugo 0.167.0, production build, served with `script-src 'self'` and no `unsafe-inline`; no violations or script errors
  from theme code) on a site with one five-photo gallery, 4 tiles per page and 4 photos per gallery: before, page 1 of
  the photos category and of the home page read "Showing 0 articles, 4 photos"; now "This page: 0 articles, 4 photos".
  On all 90 wall pages of guyheckman.me, the 80-post site and the exampleSite the caption prefix matches the presence of
  the pager, before and after. Built output of those sites and the 550-post site, in a development and a production
  build, differs from 1.3.3 only in the new `data-pages` attribute on each wall, the footer version and the wall
  script's file name and content.

## [1.3.3] - Unreleased

### Fixed
- A post in the photos category (or with a `galleries` shortcode) that has no gallery photos is an article everywhere.
  The wall already showed it as an article tile, but its own page used the photo layout: headed "Photo gallery", with no
  table of contents or reading time (#166). The post page now uses the photo layout only when the post has photos, as
  the wall does. Checked with Hugo 0.167.0 on a post with `categories: [Photos]`, a Markdown image and a heading and no
  gallery: the page was headed "Photo gallery" with no TOC or "min read"; it is now headed "Article", with the table
  of contents and "min read". A post with a gallery is unchanged. Built output of guyheckman.me, the 80-post and 550-post
  sites and the exampleSite, in a development and a production build, is byte-identical to 1.3.2 apart from the footer
  version and the stylesheet and script file names.

## [1.3.2] - Unreleased

### Fixed
- The tag, category and series A to Z indexes show each letter heading once. A term whose first letter has an accent
  (Ü, É) sorts among the plain ones in the site's locale order, and the list opened a new heading whenever the letter
  changed, so tags uarc, Über, ubuntu and unix gave the headings U, Ü, U (#165). The page now collects the letters first
  and lists each one's terms under its heading, in the same order; accented letters keep their own heading (U and Ü
  once each). Checked with Hugo 0.167.0 on a site with those tags plus e and É: before, the headings were E, É, U, Ü, U;
  now E, É, U (Uarc, Ubuntu, Unix), Ü (Über). Built output of guyheckman.me, the 80-post and 550-post sites and the
  exampleSite, in a development and a production build, is byte-identical to 1.3.1 apart from the footer version and the
  stylesheet and script file names.

## [1.3.1] - Unreleased

### Fixed
- Feeds list their posts newest first again. The home, section and term feeds took the posts in Hugo's default order,
  weight first, so a post with a series `weight` (the README's way to order a series) came ahead of newer ones, and with
  `[services.rss] limit` set the newest posts could fall off the feed (#163). Items are now sorted by publish date,
  newest first, before the limit applies; the feed of a taxonomy's terms keeps Hugo's order. Checked with Hugo 0.167.0 on
  a site with posts weighted -1 and 2 older than an unweighted post and `limit = 2`: `index.xml` was Series one, Series
  two (the two newest posts missing) and is now Gallery of five, Photos category no gallery; the series feed, which
  has no limit, now lists Series two before Series one. Built output of the 80-post and 550-post sites, guyheckman.me and
  the exampleSite, in a development and a production build, differs from 1.3.0 only in the order of items in 16 feeds
  of each synthetic site (every item and every channel field is the same, and every feed is in date order); guyheckman.me
  and the exampleSite are byte-identical apart from the footer version and the stylesheet and script file names.

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
