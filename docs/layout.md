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
assets/js/analytics.js     Google Analytics loader (production builds with a GA ID; skips Do Not Track and Global Privacy Control)
assets/js/comments.js      click-to-load Disqus, on posts when the site sets a shortname
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
layouts/search/section.html  search page (placeholder until the engine is chosen)
layouts/404.html
layouts/rss.xml            home, section and term feeds (main sections only on the home feed)
layouts/_partials/         head, head-end, analytics-on, nav, hero, hero-style, hero-sizes, controls, wall, tile-photo, tile-photo-body,
                           tile-article, photos, is-photo, smug-full, smug-srcset, smug-size, smug-sizes,
                           img-size, gallery-figure, cover, series-info, series-box, series-items, series-item, post-nav, page-title, pagination, date,
                           comments, social, footer, search, asset, script, stylesheet, tile-more, wall-tiles, wall-stand,
                           wall-pager, wall-page, term-stats, memo, build-token, dark-tokens-check, i18n-check, js-text, https-check
layouts/_shortcodes/       gallery, galleries (masonry), embed
layouts/_markup/           render-link, render-image
static/                    favicon.svg, favicon.ico, apple-touch-icon.png
exampleSite/               fixture site for testing the theme (see testing.md); not used by sites
```

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
  when sorting, is its position in the DOM: tiles have carried no `data-order` since 1.3.9, so a site's CSS or script
  that reads it must count the tiles itself; `#stage` carries the whole list's article and photo tile
  counts (`data-articles`, `data-photos`) for the type chips and its number of pager pages (`data-pages`), which makes the
  caption start "This page:" on a list with more than one page. See-all tiles also carry `data-more` and are left out of the chip counts and caption; they carry the gallery's date in `data-shown` for group headings, and a group with only a see-all tile on the page still counts as a group in the caption. Without JavaScript the wall is complete and newest-first, and the controls stay hidden. With JavaScript, `wall.js` leaves the tiles where the server put them while the server's order is the default one (newest first, as the theme's `wall.html` renders it), and only fills in the caption and the controls; it rebuilds the wall when a reader changes the sort or grouping, presses Clear or Reset, or when a custom `wall.html` renders another order.
- The lightbox link is the `X3` size derived from the SmugMug `X2` thumbnail URL. A query string or fragment after the file name is kept.
- Wall tiles and gallery images get `width` and `height`, read at build time by downloading each photo once with
  `resources.GetRemote` (`layouts/_partials/img-size.html`), so they keep their shape while they load and the masonry
  doesn't reflow. Hugo keeps the downloads in its `getresource` file cache (by default `:cacheDir/:project`, kept until
  cleared), so a build fetches only photos new to the cache; a build without a cache (for example on a fresh CI machine)
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
  (`layouts/_partials/hero-sizes.html`): for each of five viewport tiers in `main.css` (one-x up to 480, 800, 1280 and
  1600px wide, and up to two-x up to 640px), the smallest of M, L, XL, X2 and X3 that is smaller than the URL's own size
  and still covers the hero box at that tier's widest viewport and highest pixel ratio. Denser and wider screens keep
  the URL's size, and so do other hosts and photos whose size can't be read (offline build). The preload, where a page
  has one, gives each size with the same media query, so the browser fetches the hero once. Share images (`og:image`)
  are unchanged.
