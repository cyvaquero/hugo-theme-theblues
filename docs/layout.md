# Layout

How the theme's files are organized and how the wall is built, for working on the theme. The
[README](../README.md) is the user manual.

## Files

```
assets/css/main.css        tokens (palette) and all styles
assets/css/nojs.css        loaded in <noscript>: shows the nav links at 820 px and narrower, where the menu needs JavaScript
assets/js/theme.js         color theme switch (System, Light, Dark): sets data-theme and the js class on <html> before the first paint
assets/js/menu.js          hamburger dropdown for the nav (820 px and narrower; without JavaScript, assets/css/nojs.css shows the links)
assets/js/wall.js          wall controls: type chips, filter or highlight, sort, group by gallery, popover
assets/js/gallery.js       <dialog> lightbox (buttons, arrow/Home/End keys, swipe), only loaded on pages with a gallery
assets/js/hero.js          rotating hero: fades the home and term heroes through photos from the hero's data-pool (or, on pager pages 2+, data-pool-key), with a pause/play button; only on pages whose hero has two or more photos
assets/js/analytics.js     Google Analytics loader (production builds with a GA ID; skips Do Not Track and Global Privacy Control)
assets/js/comments.js      click-to-load Disqus, on posts when the site sets a shortname
assets/js/search.js        client-side search: fetches /search/index.json on first use, matches in the browser, builds the results with textContent; only on the search page and the 404 page, and only when the index is published
data/theblues.toml         the theme version shown in the footer
i18n/en.toml               the text the theme writes, in English; a site translates it with its own i18n/<language>.toml (see the README, "Translating the theme")
archetypes/post.md         front matter for `hugo new content post/<name>.md`: title from the file name without a leading YYYYMMDD-, commented showtoc and series lines
layouts/baseof.html        page shell
layouts/home.html          landing page: hero, controls, masonry wall, pagination
layouts/section.html       section lists such as /post/ (same wall, main-section pages only)
layouts/term.html          tag, category, and series pages (hero plus the same wall)
layouts/taxonomy.html      /tags/, /categories/, /series/ (A-Z list with counts)
layouts/page.html          generic pages (About)
layouts/archive.html       pages with layout: archive
layouts/post/page.html     blog posts: photo posts (cover hero, masonry gallery) and articles (hero, TOC, series box, comments)
layouts/search/section.html  search page: the search slot (_partials/search.html)
layouts/search/section.searchindex.json  the search index, /search/index.json (the searchindex output format, defined in hugo.toml)
layouts/404.html           hero, the latest five posts and, with the search index, the search of the missing address
layouts/sitemap.xml        sitemap: Hugo's embedded template plus a filter for pages that aren't written (_partials/is-written.html)
layouts/rss.xml            home, section and term feeds (main sections only on the home and term feeds)
layouts/_partials/         head, head-end, analytics-on, nav, hero, hero-style, hero-sizes, hero-pool, hero-pool-file, controls, wall, tile-photo, tile-photo-body,
                           tile-article, photos, is-photo, smug-full, smug-srcset, smug-size, smug-sizes,
                           img-size, remote-photo, gallery-figure, cover, series-info, series-box, series-items, series-item, post-nav, page-title, pagination, date,
                           comments, social, rss-icon, feed-link, footer, search, search-box, search-form, search-index, asset, script, stylesheet, tile-more, wall-tiles, wall-stand,
                           wall-pager, wall-page, term-stats, memo, build-token, dark-tokens-check, i18n-check, title-check, js-text, js-forms, t, t-en, setting-int, https-check, is-written, arrow, url-port, feed-has-items
layouts/_shortcodes/       gallery, galleries (masonry), embed
layouts/_markup/           render-link, render-image
static/                    favicon.svg, favicon.ico, apple-touch-icon.png
exampleSite/               fixture site for testing the theme (see testing.md); not used by sites
```

## Build cost

Measured on a 550-post site (about 450 pages, Hugo 0.167.0, production with `--minify --templateMetrics
--templateMetricsHints`). What the theme caches, so a page costs a lookup instead of the work:

- **Asset tags.** `head.html` and `baseof.html` call `script.html` and `stylesheet.html` with `partialCached`, keyed by the
  path, defer and any data value, so each tag is built once per build. A site that passes different data for the same
  path gets its own tag. `analytics-on.html` is cached too, since it ignores its context; a site's own copy must not
  depend on the page. `footer.html` and `nav.html` stay uncached, so a site's override can read the page.
- **Hero sizes.** `hero-style.html` hands `hero-sizes.html` its own context, so a cache hit builds no key dictionary.
- **Post navigation.** `post-nav.html` keeps, with `memo.html`, the sorted posts and a map from each post's address to its
  place in the list, and finds the neighbors by place. Hugo's `Pages.Next` and `Pages.Prev` scan the list for every post.
  The saving is not measurable below several thousand posts.
- **Scripts.** `wall.js` binds the chip-hover preview to the controls (`#ctl`), not to the document, and writes a tile's
  state, the group sections and the controls only when they changed. `gallery.js` builds its `<dialog>` at the first
  click. `theme.js` sets the page's colors once at load (before the first paint) and marks the switch's buttons once the
  page is parsed.

## How search works

- **Index.** `hugo.toml` defines the output format `searchindex` (JSON, base name `index`, so `/search/index.json`).
  `layouts/search/section.searchindex.json` writes `{"v":1,"p":[row, …]}`, one list per regular page of the language
  (README, "Search", has the row format). Hugo does not merge a theme's `outputs`, so a site turns the index on by
  listing the format in the search section's outputs. Each row is made into JSON on its own and the rows are joined,
  because Hugo's `append` would flatten a slice of slices. A page is left out with `search: false`, or when it isn't published (`is-written.html`: `build.render` is `never` or `link`; or it has no address); its text is cut to
  `params.search.textLimit`. The template warns (`theblues-search-size`) over 1 MB.
- **Slot.** `search.html` (the slot `search/section.html` includes) asks `search-index.html` for the index address,
  which is empty unless the search section lists the format. With an address it writes `search-box.html`: the form
  (`search-form.html`, hidden until the script runs), a status line that is never hidden and starts empty, and an empty, hidden results list, and sets `hasSearch` in the page's Store,
  which makes `baseof.html` load `search.js`. Without an address the page keeps its "not available" paragraph and loads
  no script. `search.js` hides that paragraph and shows the form once it runs.
- **404.** `404.html` lists the latest five posts in `<section id="latest">` and, when `search-index.html` has an address,
  writes `search-box.html` with `kind` "404" (`data-kind="404"`, `data-base`, the heading, and a form that goes to the search
  page). `search.js` then does not wire the form: it takes the words of `location.pathname` (`pathWords`), searches them
  (pass 3 only for words of 3 letters or more and pages scoring 3.2 or more, so a stray word doesn't list pages that merely
  mention it), and with a match
  fills the list, puts the words in the field, hides `#latest` and says the count; otherwise it only shows the form.
- **Script.** `search.js` is a Hugo template (first-line marker) for its text (`js-text.html`, "search"). It fetches the
  address in `data-index` on first focus or at once for `?q=`, refuses another origin and any `v` other than 1, then
  builds in memory a map from each folded word to the pages it is in (words are runs of letters, digits and combining
  marks; folding is lower case, NFD and removal of the optional marks listed in the README, "How it matches"; the index,
  the query, the highlights, the snippet and the 404 address all use the same `fold()` and `TOKEN`), with the best field weight. A query tries three
  passes (every word, as a start or exactly; the same with one typo; any word) and stops at the first that finds pages.
  Results and highlights are built with `createElement`, `createTextNode` and `textContent`.

## How the rotating hero works

- **Pool.** `hero-pool.html` takes the page (home or term), its pages (the main-section posts of the site, or of the term) and
  the hero's height (246 or 416, as `hero-sizes.html` takes it: the `.phero` figure is its minimum height, and a title or slogan that wraps makes the box taller than either). Newest post first, for each photo post (`is-photo.html`) it
  walks the gallery photos `photos.html` returns, keeps a photo whose URL is a plain `https://photos.smugmug.com/` one and
  that is wider than high by `img-size.html` (the wall's own ranged read, shared through `partialCached`, so a photo is
  read once per build), asks `hero-sizes.html` for the tier size names (it now also returns `names`, the size each of the six
  tiers uses or an empty string), and returns the first photo's URL (`src`), the count and `data`, the tokens joined by
  spaces. A token is the URL without `https://photos.smugmug.com/`, then `|` and the six names joined by `,` when there
  are smaller sizes. `data` is empty below two photos. `memo.html` keeps the result in the page's Store, so the home page and
  a term build it once for all their pager pages. Hugo has already left out drafts, future and expired posts. Nothing
  random happens at build time: the order is by date and then by position in the post.
- **Page.** `home.html` and `term.html` use `src` as the hero's photo through `hero-style.html` in place of `header_image` or
  the term's cover (so the hero keeps its inline `--hi` and `--hi1` to `--hi6`, and `head.html` preloads it as before), write `data-pool` on the
  `<header>` when there are two photos or more, and set `hasHeroPool` in the page's Store, which makes `baseof.html` load
  `hero.js`. A page with no pool writes nothing new, so its output is byte for byte what it was. On page 1 (and on a page with
  no pager) the pool reaches the page as the attribute, so that no request and no failure mode are added. On page 2 and later
  (`.Store "wall"`'s `pag.PageNumber` above 1) `hero-pool-file.html` writes the pool once per home page or term as
  `hero/pool-<key>.js` (`resources.FromString`, then minify and fingerprint as `asset.html` does in production; `<key>` is the
  first 12 characters of the MD5 of the page's path, only hex digits) and keeps its `<script src integrity defer>` tag in the
  page's Store as `heroPoolTag`; the hero gets `data-pool-key="<key>"` in place of `data-pool`, and `baseof.html` prints the tag
  just before `hero.js`'s, so the deferred scripts run in that order. The file is `(function(t){(t.pool=t.pool||{})["<key>"]="<tokens>"})(window.theblues=window.theblues||{})`:
  data only, no inline script, so a CSP needs `script-src 'self'` and no `connect-src`. It was chosen over a JSON file fetched by
  `hero.js` (a `connect-src` entry, an async path and a failure mode) and over repeating the attribute (about 50 KB per pager
  page at 500 photos). One small file per home page or term that has a pager and a pool; the cost is one request per pool per
  visitor, cached as immutable by the fingerprint. The script tag is also loaded with reduced motion, since only script can read
  that setting.
- **Script.** `hero.js` (a Hugo template for its text, `js-text.html` "hero") reads `data-pool`, or `window.theblues.pool[data-pool-key]` when there is no attribute (a file that did not load, or lacks the key, gives an empty pool: the build's photo stays, with no button and no error), drops what isn't a
  SmugMug path of the form the pool writes (a token over 512 characters, a path that doesn't end in `SIZE/stem-SIZE.ext` with the same
  size twice, or size names that aren't six known ones or empty ones; the path is split on `/`, not matched with one pattern, so a long path can't make it backtrack), picks five at random from the whole pool (a Fisher-Yates shuffle) and, unless
  the first pick is the build's photo, fetches it at once and fades it in as soon as it is ready (`cur` is -1 until then;
  `begin()` calls `advance()` with no wait), and puts `.rot` on the hero, an empty `aria-hidden` layer `.hr` as its first child and the pause button as its last. Timers
  (`SHOW` from `params.hero_interval`, 30 s by default, written in when Hugo builds the file, which fails on a value that isn't a
  number from 5 to 2147483 (a timer's longest delay in milliseconds is 2^31-1), checked before any default so that 0, `nan` and `inf` fail too; a site with no pool never builds the file, so never checks it; `LEAD` 5 s; `FADE` 1.5 s; the times below are for the default): at 25 s it asks the browser which URL the CSS would use for the next photo (it sets
  `--hi` to `--hi6` on the hidden layer and reads `--hs`, so `main.css`'s media queries stay the one place that chooses a size), loads it with
  `Image()` and waits for `decode()`; at 30 s, if it is ready, it shows the layer and adds `.on` (the opacity transition), and
  after the fade writes the same custom properties on the hero and hides the layer again; if it isn't ready it waits for it. A photo that
  fails is replaced by one of the pool not yet tried (the pool beyond the five is kept in random order for that); the five shrink only
  when none is left, and the rotation ends (no button) when fewer than two photos remain. Pause, a hidden tab (`visibilitychange`) and `prefers-reduced-motion` (also when it
  changes while the page is open) clear the timers and the pending load; a fade in progress is allowed to finish. Hiding the button (reduced motion, or fewer than
  two photos left) while it has focus first moves focus to `<main>`, the skip link's target, so focus isn't dropped to `<body>`.
- **Styles.** `.hero` and `.phero` keep their scrim in `--sc`, and `.hr` paints the same scrim over the next photo, so the layer
  covers the hero's own background but sits under its text (`z-index: -1` in the hero's own stacking context, `isolation:
  isolate` on `.rot`), and the contrast of the text is the scrim's, as before. The tier media queries also set `--hs` on `.hr`.
  The script sets a tier a photo has no size for to `initial`, since the layer would inherit the hero's.

## How the theme's text and settings are read

- **Text.** Every piece of theme text is `(or (T "key") (partial "t.html" "key"))`: the site's language, then the default
  language, then the theme's English (`t.html`, from `i18n/en.toml` mounted as data). Where the text becomes the content
  of an element, the fallback half is `partial "t-en.html"`, which returns t.html's text escaped inside
  `<span lang="en">`, so a screen reader reads it in English on a page in another language. Attribute values, the page
  `<title>`, `<option>` content, feeds, date layouts and the "Undated" text keep `t.html`, since no markup can carry a
  language there. Hugo's `T` returns the default language's text for an entry a language lacks, so when the default language is
  English the fallback half never runs for that entry and the text is English with no `lang` (README, "Translating the theme").
  `i18n-check.html` calls `t-en.html` once so an English-only fixture build sees it used. The fixture's
  pair check (`exampleSite/layouts/_partials/i18n-pairs.html`) counts both partials.
- **Script text.** `js-text.html` gives a script its text; `js-forms.html` makes a count's forms. Every map also has `en`, the
  names (the map's own keys, such as `pause`, `previousPhoto`, `photoOf`, `articleCount` or `noResults`) of the text that fell
  back to the theme's English (T had no text for the key; a count is listed when T has none for 1), and each script marks what it
  writes from them, as the templates do with `t-en.html`: `lang="en"` on an element whose whole content is that text (the hero's
  pause and play button, the lightbox's previous, next and close buttons, which also carry the name in `aria-label`, the comment
  status and its "Try again" button, the "active" note in the options badge), else a `<span lang="en">` around the text (the wall's
  caption, counts and group headings, the search status, the lightbox's announcement and counter). A sentence is split at its marks,
  so a count, the query and the photo's alt text keep their own language. The lightbox's dialog name is its `aria-label`, so
  the dialog gets `lang="en"` and its `.in` wrapper takes `<html lang>` back, which keeps the photo's alt text and the buttons in
  the page's language. The wall's On and Off sit in an `aria-hidden` span and are not marked. T gets the plain numbers
  0 to 7, 11, 12, 21, 22 and 100 to 103; when they give more than two distinct texts the script gets those texts with the
  numbers (`p`, `t`) and picks the one whose plural category (`Intl.PluralRules`) matches the count; otherwise it gets
  `one` and `other`, as before.
- **Whole-number settings.** `setting-int.html` reads `params.wall.tilesPerPage` and `params.wall.photosPerGallery` for
  `wall-pager.html` and `wall-tiles.html`, and fails the build naming the setting for anything but a whole number of 1 or
  more.
- **Dates.** `date.html` writes the full month (or weekday) name for a layout's `Jan` (`Mon`) when the locale has no
  abbreviated one.

## How the wall works

- A post is a **photo post** if its categories include `photos` (case-insensitive) or its raw content uses the `galleries`
  shortcode; everything else is an **article**.
- A photo post becomes **image tiles for its first few photos** (default 4, `params.wall.photosPerGallery`), read from its
  `gallery` shortcodes (`src` and `title`) in source order, each linking to the post, followed by one dashed **see-all tile**
  ("Boston Gallery, 14 more photos") that links to the gallery post when photos remain. The gallery post itself shows every
  photo. An article becomes one text tile (ARTICLE label, serif title, excerpt, date, tag links, and a "Part N of M" chip
  for series posts). A photo post with no parsable photos falls back to a single article tile on the wall and to the
  article layout (reading time, table of contents) on its own page.
- Tiles carry `data-type` and `data-date` (and `data-gallery`, `data-gallery-title` and `data-n`, the
  gallery's photo count, on photos), which `wall.js` reads. A tile's server order, which `wall.js` uses to break ties
  when sorting, is its position in the DOM: tiles have carried no `data-order` since 1.4.0, so a site's CSS or script
  that reads it must count the tiles itself; `#stage` carries the whole list's article and photo tile
  counts (`data-articles`, `data-photos`) for the type chips and its number of pager pages (`data-pages`), which makes the
  caption start "This page:" on a list with more than one page. See-all tiles also carry `data-more` and are left out of the chip counts and caption; they carry the gallery's date in `data-shown` for group headings, and a group with only a see-all tile on the page still counts as a group in the caption. Without JavaScript the wall is complete and newest-first, and the controls stay hidden. With JavaScript, `wall.js` leaves the tiles where the server put them while the server's order is the default one (newest first, as the theme's `wall.html` renders it), and only fills in the caption and the controls; it rebuilds the wall when a reader changes the sort or grouping, presses Clear or Reset, or when a custom `wall.html` renders another order.
- The lightbox link is the `X3` size derived from the SmugMug `X2` thumbnail URL. The lightbox shows (and preloads, for the
  next and previous photos) the thumbnail's own `X2` URL instead when `X2` has a pixel for each device pixel the photo
  fills, worked out in `gallery.js` (`big()`) from the thumbnail's `width` and `height`, the viewport, the dialog's
  padding, its 80% height limit (less on a short screen, where the controls bar takes its row first) and `devicePixelRatio`; a link or thumbnail that doesn't fit the pattern uses the link as is. A query string or fragment after the file name is kept.
- Wall tiles and gallery images get `width` and `height`, read at build time by fetching each photo once with
  `resources.GetRemote` (`layouts/_partials/img-size.html`), so they keep their shape while they load and the masonry
  doesn't reflow. The fetch asks for only the first 32 KB (a `Range` header, `layouts/_partials/remote-photo.html`, which
  the hero sizes use too), where a JPEG keeps its size; if that doesn't give a width and height, or the server ignores
  the range, the whole file is fetched. Hugo keeps the downloads in its `getresource` file cache (by default
  `:cacheDir/:project`, kept until cleared; the header is part of the cache key, so a cache filled by an earlier theme
  version is fetched again once), so a build fetches only photos new to the cache; a build without a cache (for example on a fresh CI machine)
  fetches them all. Only photos on `https://photos.smugmug.com/` are fetched, so a build never requests another host
  that a post names (a photo on any other host gets no width and height, without a request or a warning). An `http://`
  URL is never requested in cleartext, where its size could be tampered with, and a browser blocks it as mixed content
  on an https site or under a CSP that allows only `https:` images, so the build warns (warning ID
  `theblues-insecure-photo`, for a gallery photo, a hero image or a Markdown image, once per URL) and the tile and
  gallery image get no width and height; the URL is published as written, so use `https://`. A URL under the site's own `baseURL` (a local hero
  image under `hugo server` or a build with an `http://` base) is not reported (#257).
  When a photo can't be fetched (offline, a timeout, a server error) the attributes are left out
  without a warning and the tile holds a 3:2 placeholder; when the server answers that the photo doesn't exist (HTTP 404)
  or isn't an image, the build warns (warning ID `theblues-image-size`).
  A build host can also restrict what Hugo may fetch, whatever the theme asks for, with Hugo's
  [`security.http.urls`](https://gohugo.io/configuration/security/) allowlist, for example
  `[security.http]` `urls = ['^https://photos\.smugmug\.com/']` in the site's `hugo.toml`, or
  `HUGO_SECURITY_HTTP_URLS='^https://photos\.smugmug\.com/'` in the environment. The theme treats a photo outside the
  list like one it can't fetch: no request, no warning, and no width and height. Overriding `urls` also turns off
  Hugo's default check that rejects hosts resolving to private addresses.
- When the size is known and the photo is a SmugMug `X2` URL on `photos.smugmug.com`, tiles and gallery images also get
  a `srcset` of SmugMug's M, L and XL sizes plus X2, with `sizes` matching the masonry columns, so phones and one-x
  screens load a smaller file (`layouts/_partials/smug-srcset.html`). SmugMug names each size in the URL's path segment
  and file suffix (`/X2/i-ABC-X2.jpg`, `/L/i-ABC-L.jpg`) and scales it to fit a box: M 600×450, L 800×600, XL 1024×768,
  X2 1280×960 (`smug-sizes.html` holds the table, `smug-size.html` the URL rewrite that this partial, `smug-full.html`
  and `hero-sizes.html` share).
- A hero photo on `photos.smugmug.com` whose URL names a size (M, L, XL, X2, X3, X4 or X5, such as a photo post's X3
  cover or an `image` set to an X5 URL) also gets smaller sizes for phones and one-x screens
  (`layouts/_partials/hero-sizes.html`): for each of six viewport tiers in `main.css` (one-x up to 480, 800, 1280 and
  1600px wide, up to two-x up to 640px, and up to three-x up to 427px), the smallest of M, L, XL, X2 and X3 that is smaller than the URL's own size
  and still covers the hero box at that tier's widest viewport and highest pixel ratio. The three-x tier stops at 427px
  because X2's 1280px long edge covers 427 × 3 = 1281 device pixels (1px allowed) and no more; its 960px height also
  rules X2 out for the 416px photo-post hero (1248px at three-x), so there it only helps the 246px home hero. The 416px is `.phero`'s minimum height, not a bound: a title that wraps at a
  narrow viewport makes the box taller (422.7px for the fixture's deep-headings post at 320px wide), and the sizes don't
  cover that, so a tier's size can be shown slightly enlarged there.
  Denser and wider screens keep
  the URL's size, and so do other hosts and photos whose size can't be read (offline build). The preload, where a page
  has one, gives each size with the same media query, so the browser fetches the hero once. Share images (`og:image`)
  are unchanged.
