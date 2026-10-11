# The Blues

A responsive, accessible Hugo theme for [guyheckman.me](https://guyheckman.me). Replaces the Clean White theme.
Palette: navy `#1B3C53`, steel blue `#456882`, sand `#D2C1B6`, cream `#F9F3EF`, with light and dark modes. The mode
follows the system setting (`prefers-color-scheme`) unless the reader picks Light or Dark with the switch in the nav.

It has a hero with a wavy-underlined slogan, a full-width masonry wall (three columns from 900 px) that mixes photo tiles and
article tiles, a calm "View options" popover (filter or highlight by type, sort, group by gallery), photo posts with a masonry
gallery and a `<dialog>` lightbox, articles with a table of contents and series box, tag pages, and serif headlines. It builds
the site's real content with no Hugo warnings, and at the switch from Clean White it produced the same 30 URLs. See "Known
limits" below and the [open issues](https://github.com/cyvaquero/hugo-theme-theblues/issues).

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="images/readme-home-dark.webp">
  <img src="images/readme-home-light.webp" alt="The home page in light mode: a navy hero with the slogan, filter chips and a three-column masonry wall of article tiles and photo tiles.">
</picture>

The home wall, in the mode that matches your GitHub theme (on a site it follows the reader's system, or the switch in
the nav). More views, all from the exampleSite fixture:

| | |
| --- | --- |
| ![A photo post: a hero over the cover photo, then a three-column masonry gallery.](images/readme-photo-post.webp) | ![The lightbox, a native dialog, open on the first photo with Previous, Next and Close buttons and a 1 / 3 counter.](images/readme-lightbox.webp) |
| A photo post with its masonry gallery. | The `<dialog>` lightbox. |
| ![An article with a table of contents beside the text, and the series box at the end.](images/readme-article.webp) | ![The wall's "View options" popover open, with Filter or Highlight, a Sort menu and a Group by gallery switch.](images/readme-view-options.webp) |
| An article with the table of contents and the series box. | The wall's "View options" popover. |
| ![A tag page: a hero with the tag name and counts, then a wall of that tag's photos.](images/readme-tag-page.webp) | ![An article page in dark mode, chosen with the System, Light, Dark switch at the right of the nav.](images/readme-theme-switch.webp) |
| A tag page with its hero and wall. | The color theme switch, set to Dark. |
| ![The mobile layout at phone width, with the hamburger menu open over the wall.](images/readme-mobile-menu.webp) | |
| The hamburger menu at phone width. | |

How the images were made is in "Testing the theme" below.

## Requirements

- Hugo **0.163.3** or later (standard or extended). Earlier versions have published Hugo security advisories, and the theme
  uses `.Language.Locale`. Developed and tested on 0.167.0. The minimum is set in the theme's `hugo.toml`
  (`[module.hugoVersion] min`), which Hugo checks and warns about; `theme.toml`'s `min_version` only mirrors it for the
  themes gallery.
- No Node, no Sass: CSS and JS go through Hugo Pipes (minify and fingerprint).
- **Browsers:** the current and previous major versions of Chrome, Edge, Firefox and Safari, on desktop and mobile
  (#208). The oldest versions with everything working are Chrome and Edge 105, Firefox 121 and Safari 16.4, going by
  the CSS features the theme uses (`:has()`, range media queries); they are not tested in those versions. Below them
  the pages still work, with less polish:
  - before Firefox 121 (no `:has()`), a focused wall tile and a focused code block get the browser's ring on the
    link or the `<pre>` instead of one around the whole tile or block;
  - before Chrome and Edge 104 and Safari 16.4 (no range media queries), a SmugMug hero always loads its full-size
    image instead of the smaller size for the screen;
  - before Chrome and Edge 108, Firefox 101 and Safari 15.4 (no `dvh` units), the lightbox sizes to `vh`, so on a phone
    the browser's toolbar can cover part of the photo.
- **CSS is hand-written**: `assets/css/main.css` holds every style, commented and readable, with no framework, no
  `@import`, and no third-party or legacy stylesheets. The only other stylesheet, `assets/css/nojs.css`, is a few lines
  loaded inside `<noscript>` that show the nav links when the hamburger menu can't work. Hugo minifies and fingerprints
  both at build time
  (`layouts/_partials/asset.html`): a production build (`hugo`) publishes `css/main.min.<hash>.css` with the comments
  stripped, while a development build (`hugo server`) serves the readable source unchanged. The JavaScript files follow the
  same rule.
- No external fonts, frameworks, or CDN scripts, and no inline scripts. JavaScript is six small files:
  - `theme.js` (in `<head>`, not deferred, so a picked mode applies before the first paint) and `menu.js`, on every
    page;
  - `wall.js` and `gallery.js`, only where needed;
  - `analytics.js`, only when the site sets a GA ID, and only in production builds. It has no consent step (see
    `[services.googleAnalytics] id` under "Site settings it reads");
  - `comments.js`, on posts when the site sets a Disqus shortname.

  A site CSP therefore needs no script hashes. Hugo's internal GA and Disqus templates are not used. `wall.js`,
  `comments.js` and `gallery.js` hold the text they write (captions, comment messages, lightbox labels) as a Go template
  action, which Hugo fills in from the site's language when it builds them (see "Translating the theme"); a site's own
  copy of a script is run as a template only if it contains `{{`.

## Installation

Add the theme as a Git submodule and select it in the site config:

```bash
git submodule add https://github.com/cyvaquero/hugo-theme-theblues.git themes/hugo-theme-theblues
```

```toml
theme = "hugo-theme-theblues"
```

Pin the submodule to a release tag (for example `1.1.0`). The theme is not packaged as a Hugo Module (there is no `go.mod`).

The footer shows the Hugo version and the theme version. The theme version lives in `data/theblues.toml`; bump it
with every CHANGELOG version. A site can override it with its own `data/theblues.toml`.

## Content structure

The templates assume this layout; other structures are not supported yet.

- **Posts live in the site's main sections**, `content/post/` by convention. The home wall, section and term walls, the
  archive, post navigation and the home feed list only pages in Hugo's `mainSections`. Set it in the site config:

  ```toml
  mainSections = ["post"]
  ```

  Without it, Hugo uses the one section with the most pages, which may not be the posts. `layouts/post/page.html` is
  the post template; it applies to the `post` section, and a site with posts in another main section gives them the
  `post` type, for example `[[cascade]] type = "post"` with `[cascade.target] path = "/notes/**"`. Pages that don't use
  the post template get no series box, comments, previous/next links or table of contents. Taxonomy indexes (`/tags/`
  and so on) count posts only and leave out terms used only outside the main sections; a term page with no posts says
  "No posts yet."
- **Taxonomies:** declare `series` next to the default ones. A series lists its posts oldest first; give posts a
  `weight` in their front matter to set the order instead (lowest first; posts without one follow, oldest first):

  ```toml
  [taxonomies]
    category = "categories"
    tag = "tags"
    series = "series"
  ```

- **Archive:** a page with `layout: archive` in its front matter (for example `content/archive/index.md`) lists every post by
  year.
- **Search:** `content/search/_index.md` uses `layouts/search/section.html`. Search is not implemented yet: the page is
  published (and listed in the sitemap) with the text "Search is not available yet." The nav link appears only when
  `params.search_enabled` is set.
- **Syntax highlighting:** set `[markup.highlight] noClasses = false`. Hugo then marks code with Chroma classes, and the
  theme colors them from its `--sx-*` tokens: the modus-operandi colors in light mode and modus-vivendi in dark, on the
  theme's code background, all 4.8:1 or more. The `style` setting is then unused. With Hugo's default inline highlighting
  (`noClasses = true`) the chosen style's own colors show instead, so code blocks keep them in both modes.
  **Line numbers** (`lineNos = true` or `linenos=true` on a block) meet contrast only with `noClasses = false`.
  Inline styles carry no classes the theme can target, and Chroma's styles draw line numbers in a low-contrast gray,
  `#7f7f7f` in most (for example `github`, `modus-operandi`, `monokai`): 4.0:1 on white and 3.18:1 on a highlighted
  line in light styles, 3.71:1 and 2.74:1 in the default `monokai`, and about 2.5:1 in `nord` and `gruvbox-light`,
  all below the 4.5:1 that WCAG 1.4.3 asks for.
- **Icons:** the theme ships a serif "g" monogram on navy, served from the site root:
  - `static/favicon.svg`, with the letter in the system serif;
  - `static/favicon.ico` (16, 32 and 48px);
  - `static/apple-touch-icon.png` (180px, square, since iOS rounds the corners).

  To use your own, put files with the same names in the site's `static/`, which takes precedence over the theme's. The
  `<meta name="theme-color">` is navy `#1B3C53` in light mode and `#0F2332` in dark, the nav band's colors (`--band`;
  a palette change updates both `main.css` and `head.html`, which point at each other).
- **Color theme switch:** the last item of the nav, inline from 821px and inside the hamburger menu below that. Three
  buttons, System (the default), Light and Dark, with `aria-pressed` on the current one. `theme.js` sets
  `data-theme="light"` or `"dark"` on `<html>`, keeps the choice in `localStorage` under `theme` (System removes it),
  updates `<meta name="color-scheme">` and both `theme-color` metas, keeps other open tabs in step, and reloads loaded
  Disqus comments so they match. Without JavaScript the switch is hidden and the mode follows the system.
- **Share image (`og:image`):** a page's own `image`, or the first photo the page shows from a `gallery` shortcode
  (photos Hugo doesn't render, inside an HTML comment or a `{{% galleries %}}` block, don't count). Otherwise
  `params.og_image` if set, and otherwise the cover, which is the site's `header_image`.
- **Markdown links and images:** links and image sources are kept only for `http`, `https` and scheme-less paths (links
  also allow `mailto` and `tel`); a `javascript:`, `data:` or other URL renders the text with no link and the image with
  no `src`. A link to a page or a page resource resolves to its permalink, as with Hugo's built-in hooks; an image source
  resolves to a page resource or a file in the site's `assets/`. Links to other hosts open in a new tab, with visually
  hidden "(opens in a new tab)" text for screen readers. A titled image is a `<figure>` with a caption only when it
  stands alone and the site sets `markup.goldmark.parser.wrapStandAloneImageWithinParagraph = false`; otherwise the title
  is the tooltip.

## Shortcodes

| Shortcode | Usage | Notes |
|---|---|---|
| `galleries` | `{{< galleries >}} … {{< /galleries >}}` | Wraps `gallery` calls in a masonry block and loads the lightbox. Use the `{{< >}}` form; the `{{% %}}` form renders nothing, and its photos are not shown on walls or used as covers. Only the `gallery` photos are output; any other text or HTML between the tags is dropped. |
| `gallery` | `{{< gallery src="…/X2/i-abc-X2.jpg" title="Caption" >}}` | One photo. `src` is a SmugMug `X2` thumbnail URL; the link and the lightbox use the `X3` size. `src` may be named or the first positional argument, in `"…"` or `` `…` `` quotes. The positional form takes only `src`: Hugo doesn't allow adding `title=` to it, and a second positional argument is ignored, so such a photo gets the "Photo N" alt text. Photos inside an HTML comment are not counted, shown on walls or used as covers; inside a `galleries` block, comment a photo out with `{{</* gallery … */>}}` instead, because the shortcode still runs there. `title` becomes the photo's alt text (also read out on wall tiles); it isn't shown as a visible caption. Without a title the alt text is "Photo N" and the build warns (warning ID `theblues-gallery-no-title`). |
| `embed` | `{{< embed "https://…" 800 600 "Title" >}}` | A sandboxed iframe (URL, width, height, optional title; positional only), meant for SmugMug gallery embeds. The build fails if the URL, width or height is missing, the URL is not `https://host/…` (no user name, backslash or extra slash before the host), it is on the site's own host (where the sandbox gives no protection), or the site's `baseURL` has no host to compare with. |

## Extending from a site

A site can add its own page types without overriding theme files:

- **Templates:** a site's `layouts/<section>/page.html` or `section.html` renders inside the theme's `baseof.html`. It
  fills the `main` block, and can replace the default hero by defining the `header` block. The nav, footer, stylesheet
  and menu script still come from the theme. The theme's heroes (home, About-style, 404, posts, and tag, category and
  series pages) preload their photo from `<head>` (`<link rel="preload" as="image" fetchpriority="high">`, one per
  hero size with its `media` query when the hero has smaller SmugMug sizes). A `header` block of the site's own gets no preload unless
  it records its photo's URL with `{{ .Store.Set "theblues-hero" $url }}`.
- **`<head>`:** `layouts/_partials/head-end.html` is empty and is included last in `<head>`. A site's own
  `layouts/_partials/head-end.html` replaces it, for example to add a stylesheet for its own sections.
- **Analytics:** `layouts/_partials/analytics-on.html` returns `true` when the page includes the theme's Google
  Analytics loader (`analytics.js`): a production build, `[services.googleAnalytics] id` set and
  `[privacy.googleAnalytics] disable` not set. It is `false` otherwise. It is decided per build, not per visitor: the
  loader still loads nothing for visitors who send Do Not Track or Global Privacy Control. `head.html` uses the same
  partial, so a site that shows an analytics notice only when analytics loads stays in step with the theme: `{{ if partial "analytics-on.html" . }}…{{ end }}`. Its name and result are kept
  stable; a change is called out in the CHANGELOG. Theme versions before 1.2.49 don't have it; a site that must build
  with them can check `templates.Exists "_partials/analytics-on.html"` first. The theme itself shows no notice and asks
  for no consent before it loads analytics (see `[services.googleAnalytics] id` under "Site settings it reads").
- **Styles:** the custom properties at the top of `assets/css/main.css` (section 1) are the colors and fonts a site's
  CSS should use, so it follows light and dark mode: `--bg`, `--text`, `--muted`, `--link`, `--focus`, `--band`, `--bt`,
  `--line`, `--surface`, `--code`, `--on-bg`, `--on-fg`, `--hv` (the sand accent for hover and focus on dark bands),
  `--scrim` (the navy scrim over photos, as RGB channels: `rgb(var(--scrim) / .8)`), `--serif`, `--sans`, `--wide` and
  `--measure`. Their names are kept stable; a rename or removal is called out in the CHANGELOG.
  A site's own dark-mode colors should use the theme's two dark selectors, so they follow the switch as well as the
  system: `@media (prefers-color-scheme: dark) { :root:not([data-theme=light]) … }` and `:root[data-theme=dark] …`.
  The theme's own dark tokens are written out in both of those places, and the build checks that the two copies hold
  the same declarations (`layouts/_partials/dark-tokens-check.html`, once per build): if they differ, or only one is
  found, it warns with the ID `theblues-dark-tokens` naming the tokens, and `--panicOnWarning` fails the build. It reads
  the `assets/css/main.css` the build uses, so a site that overrides the file with an edited copy is checked too; a
  stylesheet with neither block gets no warning. CSS `light-dark()`, which every supported browser has (see
  Requirements), could replace the two copies (#196).
- **Breakpoints:** the layout changes at fixed widths, which a site's CSS can match. They are not settings (#6):
  - 560px: masonry walls and `galleries` blocks go from one column to two;
  - 700px: the View options popover becomes a 20rem panel at the right instead of spanning the controls, and the wall
    caption moves from the left to the right;
  - 821px: the full nav replaces the Menu button (`nojs.css` and `menu.js` use 820px and narrower), and articles get the
    table of contents beside the text;
  - 900px: masonry walls and `galleries` blocks get a third column.

## Translating the theme

The text the theme writes is in `i18n/en.toml`, and templates read it with Hugo's `T`: labels, headings, the wall's
caption and counts, the comment and lightbox messages, the page-number text, and the three date layouts. English is the
default: text a site's language has no entry for is shown in English. Month and day names in dates follow the site's
language (the theme formats dates with `time.Format`), except that every English site gets US English names. To
translate the theme, or reword its English, for a site:

1. Copy the theme's `i18n/en.toml` to `i18n/<language>.toml` in the site, where `<language>` is the site's language code
   (`de`, `fr`, `pt-br`; the key under `[languages]`, or `defaultContentLanguage`). A site's entries replace the theme's
   one by one, so to reword the English a site's own `i18n/en.toml` needs only the entries it changes.
2. Translate the `other = "…"` values and keep the entry names and the placeholders in them (`{{ .n }}`, `{{ .part }}`,
   `{articles}` and so on). An entry with `one` and `other` is a count: `{{ .Count }}` is the number, and the language's
   plural rules pick the form. Write plain text, which the theme escapes; only `commentsHosted` is HTML.
3. An entry missing from a language's file is shown in the default language's text and, when that has none either, in
   the theme's English (`layouts/_partials/t.html`), so a partial translation still has every label.
   `hugo --printI18nWarnings` lists the missing entries. A language with no file at all uses the default language's
   file; when the default language is not English and has no file, the labels are all English and the build warns
   (`theblues-i18n`).
4. Set the site's `locale` (for example `de-DE`), which also sets `<html lang>`. The three date entries are Go layouts
   (`dateFormat` for dates on posts, tiles and wall headings unless `params.dateFormat` is set, `dateFormatDay` for the
   archive, `dateFormatMonth` for the series box), so a translation can reorder day, month and year. Month names come from
   Hugo's locale data, except on an English site (language `en` or `en-*`), which gets US English names whatever its
   `locale`: `en-GB` writes September as "Sep", not "Sept".

The scripts get their text the same way, through `layouts/_partials/js-text.html`: `wall.js`, `comments.js` and
`gallery.js` are built from `assets/js` as templates, so the HTML is the same for every language and a site with more
than one language gets a script per language (`js/wall.de.js`). The wall's group headings take their dates from the tile
captions the server wrote, so they are localized too. A count in a script uses the `one` and `other` forms and the
browser's plural rules (`Intl.PluralRules`), so a language that needs more forms gets `other` for those.

What the theme leaves as it is: text that comes from the site (menu names, `slogan`, `tagline`, `title_404`,
`search_label`, content, and the titles of the tag, category and series index pages, which Hugo takes from the taxonomy
name unless `content/tags/_index.md` and the like set a `title`); the link names RSS, LinkedIn and GitHub; the "©" and the
year of the footer line when the site sets no `copyright`; and the messages of build warnings and errors, which are for
the person building the site.

## Layout

```
assets/css/main.css        tokens (palette) and all styles
assets/css/nojs.css        loaded in <noscript>: shows the nav links at 820 px and narrower, where the menu needs JavaScript
assets/js/theme.js         color theme switch (System, Light, Dark): sets data-theme on <html> before the first paint
assets/js/menu.js          hamburger dropdown for the nav (820 px and narrower; without JavaScript, assets/css/nojs.css shows the links)
assets/js/wall.js          wall controls: type chips, filter or highlight, sort, group by gallery, popover
assets/js/gallery.js       <dialog> lightbox (buttons, arrow/Home/End keys, swipe), only loaded on pages with a gallery
assets/js/analytics.js     Google Analytics loader (production builds with a GA ID; skips Do Not Track and Global Privacy Control)
assets/js/comments.js      click-to-load Disqus, on posts when the site sets a shortname
data/theblues.toml         the theme version shown in the footer
i18n/en.toml               the text the theme writes, in English; a site translates it with its own i18n/<language>.toml (see Translating the theme)
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
layouts/_partials/         head, head-end, analytics-on, nav, hero, hero-sizes, controls, wall, tile-photo, tile-photo-body,
                           tile-article, photos, is-photo, smug-full, smug-srcset, smug-size, smug-sizes,
                           img-size, gallery-figure, cover, series-info, series-box, series-items, series-item, post-nav, page-title, pagination, date,
                           comments, social, footer, search, asset, script, stylesheet, tile-more, wall-tiles, wall-stand,
                           wall-pager, wall-page, term-stats, memo, build-token, dark-tokens-check, i18n-check, js-text, https-check
layouts/_shortcodes/       gallery, galleries (masonry), embed
layouts/_markup/           render-link, render-image
static/                    favicon.svg, favicon.ico, apple-touch-icon.png
exampleSite/               fixture site for testing the theme (see Testing the theme); not used by sites
```

### How the wall works

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
  caption start "This page:" on a list with more than one page. See-all tiles also carry `data-more` and are left out of the chip counts and caption. Without JavaScript the wall is complete and newest-first, and the controls stay hidden.
- The lightbox link is the `X3` size derived from the SmugMug `X2` thumbnail URL.
- Wall tiles and gallery images get `width` and `height`, read at build time by downloading each photo once with
  `resources.GetRemote` (`layouts/_partials/img-size.html`), so they keep their shape while they load and the masonry
  doesn't reflow. Hugo keeps the downloads in its `getresource` file cache (by default `:cacheDir/:project`, kept until
  cleared), so a build fetches only photos new to the cache; a build without a cache (for example on a fresh CI machine)
  fetches them all. Only `https://` photos are fetched: an `http://` URL is never requested in cleartext, where its size
  could be tampered with, and a browser blocks it as mixed content on an https site or under a CSP that allows only
  `https:` images, so the build warns (warning ID `theblues-insecure-photo`, for a gallery photo, a hero image or a
  Markdown image, once per URL) and the tile and gallery image get no width and height; the URL is published as
  written, so use `https://`.
  When a photo can't be fetched (offline, a timeout, a server error) the attributes are left out
  without a warning and the tile holds a 3:2 placeholder; when the server answers that the photo doesn't exist (HTTP 404)
  or isn't an image, the build warns (warning ID `theblues-image-size`).
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

### Known limits

- The wall is paginated **by tile**, 24 per page (`params.wall.tilesPerPage`). The type chips count the whole list, but
  filtering, the caption (which starts "This page:" when the list has more than one page), sorting and group-by work on
  the tiles of the current page, and a gallery can be split across two pages; its "Group by gallery" heading still counts all its photos. With the current content (5 articles and 3 galleries) everything
  fits on one page of 20 tiles. Hugo's `.Paginate` only accepts a collection of pages, so
  `layouts/_partials/wall-pager.html` paginates a stand-in collection with one entry per tile and slices the real tile list
  with the same offsets; page counts and URLs come from Hugo's own pager. It is a workaround. `pagination.pagerSize` does not
  affect wall pages.
  `tilesPerPage` and `photosPerGallery` must be 1 or more; anything else fails the build with a message naming the
  setting. The pager shows the first and last pages and two on
  each side of the current one.
- Wall pages after the first (`/page/2/`, …) have their own title ("guyheckman.me – Page 2", "Hugo – Page 2 |
  guyheckman.me"), but use page 1's canonical URL and have no `rel=prev/next` in the head. The pager links carry
  `rel=prev` and `rel=next`.
- A post without a `date` is shown as "Undated" (header, tiles, archive, series box), sorts last on the wall (first with Oldest first), has no  `pubDate` in feeds, and the build warns.
- Heroes and photo tiles set their image through a `style="--hi:url(…)"` attribute, so a site CSP still needs
  `style-src 'unsafe-inline'` (or `style-src-attr 'unsafe-inline'`); see "Content Security Policy" for the rest. The theme sets no referrer policy; browsers default to
  `strict-origin-when-cross-origin`, which a site can also send as a header.
- The 404 page and the `search` section get `<meta name="robots" content="noindex">`. To keep `/search/` out of the
  sitemap, a site sets `sitemap: {disable: true}` in `content/search/_index.md`. The theme has no `robots.txt` template
  (use Hugo's `enableRobotsTXT`) and no JSON-LD.
- The theme's feed template (`layouts/rss.xml`, used for the home, section and term feeds) lists only pages in the main
  sections on the home feed (`mainSections`, see Content structure). The `search` section still gets its own empty
  feed; a site can turn it off with `outputs: [html]` in `content/search/_index.md`.
- `photosPerGallery` applies per post: a post with several `galleries` blocks counts as one gallery.
- With Hugo's default inline highlighting, `.highlight` code blocks keep the style's own colors in dark mode; set
  `noClasses = false` to have them follow it (see Syntax highlighting).
- Reduced motion is handled (all transitions are gated on `prefers-reduced-motion`). Not yet checked on real devices: touch
  devices and screen readers. See Accessibility below.
- Build time grows with the number of posts and list pages: each list page (home, section, every term) builds its own
  tile list, once for all its pager pages. 550 posts built in about 0.5 s (median of 9 production, minified builds
  with a warm cache, Hugo 0.167.0, theme 1.3.27); times depend on the machine, so compare runs on your own.

## Site settings it reads

It keeps the parameter names the site already uses, so the site's `hugo.toml` (or `config.toml`) needs little change:

- `title`, `locale` (sets `<html lang>` and the language of month names; see Translating the theme), `mainSections` (the sections that hold posts, see Content structure)
- `params`: `header_image`, `slogan`, `tagline`, `description`, `SEOTitle`, `keyword`, `social.rss|linkedin|github`,
  `image_404`, `title_404`, `og_image` (share image for pages without their own), `search_enabled` (default off), `search_label` (default `SEARCH`, from the `searchLabel` entry of `i18n/en.toml`), `dateFormat` (a Go layout for
  dates on posts, tiles and wall headings, default `Jan 2, 2006`, from the `dateFormat` entry; the archive's `Jan 2` and
  the series box's `Jan 2006` are the `dateFormatDay` and `dateFormatMonth` entries), `showtoc` (site-wide default for
  the TOC; on when unset, and shown only when a post has headings within the `markup.tableOfContents` levels), and the optional
  `[params.wall]` table: `tilesPerPage` (default 24) and `photosPerGallery` (default 4), each 1 or more
- Defaults for the hero and 404 texts: `slogan` is the site `title` when unset; `tagline` is `params.description` when
  unset; `title_404` is the theme's "Page not found" (the `pageNotFound` entry of `i18n/en.toml`, so it is translated
  with the rest). A post's front matter `subtitle` shows only in a post's own hero, where it falls back to the post's
  `description`; every other page's hero shows its `description` alone.
- `ignoreLogs`: the theme's build warnings have IDs a site can list there to silence them: `theblues-gallery-no-title`
  (a `gallery` photo without a `title`), `theblues-undated` (a post without a `date`), `theblues-addtional-menus`
  (the deprecated legacy menu, below), `theblues-image-size` (a wall or gallery photo URL that answers 404 or isn't an
  image), `theblues-insecure-photo` (a gallery photo, hero image or Markdown image whose URL starts with `http://`;
  see the photo size bullet under "How the wall works"), `theblues-toc-markup` (Hugo's table of contents markup
  changed, so the theme can't check or label it; better fixed than silenced) and `theblues-dark-tokens` (the two copies of the dark color
  tokens in `assets/css/main.css` differ; see Styles under Extending from a site) and `theblues-i18n` (the site's
  language has no theme text, so the labels are in English; see Translating the theme), for example
  `ignoreLogs = ['theblues-undated']`.
- `[[menus.main]]`, or the legacy `params.addtional_menus` list (Clean White's spelling) when no main menu is defined.
  The legacy list is deprecated: the build warns (`theblues-addtional-menus`), and it will be removed in a future major
  version.
  A `[[menus.main]]` entry whose `pageRef` doesn't resolve to a page is left out of the nav, so a link to a category
  or section appears only once it has content.
  From 821px the links are one row; when the menu, the site title and the theme switch don't fit (many items, or a
  large text size or zoom), the row wraps onto a second line, so every link and the switch stay reachable (#171).
  Legacy `href` values that are full URLs are used as is; site paths get one trailing slash and follow a sub-path `baseURL`.
- `[[menus.footer]]` (optional): links shown in the footer under the social links, in a navigation landmark named
  "Footer", for example a privacy note (`url = "/about/#privacy"`) or a page (`pageRef`).
- `[services.googleAnalytics] id`:
  - Analytics loads only in production builds, unless `[privacy.googleAnalytics] disable = true`. A site can ask the
    theme whether it loads with `layouts/_partials/analytics-on.html` (see Extending from a site).
  - A visitor who sends Do Not Track or Global Privacy Control gets nothing: no gtag.js request and no hit.
  - **There is no consent step.** In a production build with a GA ID and `[privacy.googleAnalytics] disable` unset,
    Google Analytics loads as soon as a page is viewed, for every visitor who doesn't send Do Not Track or Global
    Privacy Control: the browser requests `gtag.js` from `www.googletagmanager.com` and Google Analytics records the
    visit. The theme has no consent banner, prompt or gate, and a visitor who sends neither signal has not agreed to
    anything. A site that needs consent (GDPR, the ePrivacy Directive) must gate or disable analytics itself: set
    `[privacy.googleAnalytics] disable = true` (or leave the GA ID out) and load Google Analytics from its own consent
    code, for example from `layouts/_partials/head-end.html`; or put its own `assets/js/analytics.js` in the site,
    which replaces the theme's and gets the ID as `data-id`, and have it wait for consent. Whether a site needs
    consent is for its owner to decide.
- `[services.disqus] shortname`: comments are click to load. Posts show a "Show comments" button, and nothing from Disqus
  loads before it is clicked. Builds for other environments (`hugo server`, `--environment staging`) show a note
  instead; analytics, likewise, loads only in production. A leading slash in the shortname is ignored. Optional front
  matter: `disqus_url`, `disqus_identifier`, `disqus_title`.
- Feeds (`layouts/rss.xml`, as in Hugo's built-in template):
  - `params.author` as a table with `email` and an optional `name` (`[params.author] name = "…" email = "…"`) fills
    the channel's `managingEditor` and `webMaster` and each item's `author`, which RSS requires to be an email
    address. A plain string, or a name without an email, adds nothing.
  - `copyright` becomes the channel's `copyright`, and the footer shows it as written (plain text, for example
    `copyright = "© 2023–2026 Jane Doe"`). Without it the footer shows "© <title> <current year>".
  - `[services.rss] limit` caps the number of items (no cap by default). Items are listed newest first by publish
    date, whatever a post's series `weight`, so the limit keeps the newest posts (the feed of a taxonomy's terms keeps
    Hugo's order).
- `[markup]`: the theme works with Hugo's defaults, and these settings change what it shows:
  - `[markup.highlight] noClasses = false` lets code follow the light and dark palette (see Syntax highlighting);
  - `[markup.tableOfContents] startLevel` and `endLevel` set which headings the "On this page" box lists, and a post
    with no headings in that range has no box;
  - `[markup.goldmark.parser] wrapStandAloneImageWithinParagraph = false` turns a titled image on its own line into a
    figure with a caption (see Markdown links and images).

  The `series` taxonomy also has to be declared by the site (see Taxonomies).
- Hugo's `[privacy]` settings: the theme loads Google Analytics and Disqus with its own scripts, not Hugo's internal
  templates, so only these apply:
  - `[privacy.googleAnalytics] disable = true` leaves analytics out (the way to switch it off for a site that needs
    consent before analytics loads);
  - `[privacy.disqus] disable = true` leaves the comments out (no button, no script);
  - `[privacy.googleAnalytics] respectDoNotTrack` has no effect: Do Not Track and Global Privacy Control are always
    honored. The other `privacy.googleAnalytics` settings are for Hugo's internal template and are ignored too.

`header_image`, `image` and `image_404` may be absolute URLs or paths under the site root (`img/x.jpg`); the theme turns paths
into absolute URLs.

Front matter: `title`, `subtitle`, `description`, `date`, `image` (the page's hero image and share image; without it the
hero uses the first gallery photo, then the site's `header_image`, see Share image), `showtoc`, `categories` (a list,
or a single string), `tags`, `series`. `hugo new content post/<name>.md` writes these from `archetypes/post.md`: the title
is the file name without a leading `YYYYMMDD-`, hyphens as spaces, title-cased (as the theme does for a post with no
title), the slug is the whole file name, and `showtoc` and `series` are there as commented lines to uncomment.

## Content Security Policy

The theme is written to run under a strict CSP: no inline scripts, no inline `<style>`, no `eval`, no `@import`, no
web fonts and no `data:` URLs. The origins a site's policy must allow are these, grouped by what needs them. Everything
else can stay at `default-src 'none'`.

**The theme itself**

| Directive | Value | Why |
|---|---|---|
| `script-src` | `'self'` | The theme's scripts are files on the site (`theme.js`, `menu.js`, `wall.js`, `gallery.js`, `comments.js`, `analytics.js`); there is nothing to hash. |
| `style-src` | `'self'` | `main.css`, and `nojs.css` inside `<noscript>`. |
| `style-src-attr` (or `style-src`) | `'unsafe-inline'` | Heroes and photo tiles set their image through a `style="--hi:url(…)"` attribute. This is only for `style=` attributes: the theme has no `<style>` element and its scripts set no styles. |
| `img-src` | `'self'` | The favicons and any local photo. A photo or hero on another host needs that host here too. |
| `base-uri`, `form-action`, `object-src` | `'none'` | The theme uses none of them. |

**Optional services**, needed only when the site uses them:

| Service | Directive | Origins |
|---|---|---|
| SmugMug photos (gallery photos, hero sizes) | `img-src` | `https://photos.smugmug.com` |
| Google Analytics (`[services.googleAnalytics] id`, production builds) | `script-src` | `https://www.googletagmanager.com` (`gtag.js`) |
| | `connect-src` | `https://*.google-analytics.com https://*.google.com https://www.googletagmanager.com` |
| | `img-src` | `https://*.google-analytics.com https://www.googletagmanager.com` |
| Disqus (`[services.disqus] shortname`) | `script-src` | `https://<shortname>.disqus.com` (`embed.js`) and `https://c.disquscdn.com` |
| | `frame-src` | `https://disqus.com` |
| | `connect-src` | `https://links.services.disqus.com` |
| | `img-src` | `https://referrer.disqus.com https://c.disquscdn.com` |
| | `style-src` | `https://c.disquscdn.com` (its `realtime` stylesheet; blocking it only costs that styling) |
| `embed` shortcode | `frame-src` | the host of each embed's URL |
| YouTube, through `embed` or Hugo's `youtube` shortcode | `frame-src` | `https://www.youtube-nocookie.com` with `[privacy.youTube] privacyEnhanced = true`, else `https://www.youtube.com` |

The theme has no YouTube shortcode of its own; both ways above give an iframe, so a video needs `frame-src` only, and
Hugo's `youtube` shortcode needs the same `style-src-attr 'unsafe-inline'` as the theme.

An example for a site with SmugMug photos, Google Analytics and Disqus (`guyheckman-me` stands for the Disqus shortname):

```
default-src 'none'; script-src 'self' https://www.googletagmanager.com https://guyheckman-me.disqus.com https://c.disquscdn.com;
style-src 'self' https://c.disquscdn.com; style-src-attr 'unsafe-inline';
img-src 'self' https://photos.smugmug.com https://www.googletagmanager.com https://*.google-analytics.com https://referrer.disqus.com https://c.disquscdn.com;
connect-src https://www.googletagmanager.com https://*.google-analytics.com https://*.google.com https://links.services.disqus.com;
frame-src https://disqus.com https://www.youtube-nocookie.com; base-uri 'none'; form-action 'none'; object-src 'none'
```

Notes:

- **Disqus loads more than it needs.** After "Show comments", Disqus's own script also tries a cleartext `http://cdn.viglink.com`
  pixel (VigLink) and LiveIntent (`d-code.liadm.com` script, `rp.liadm.com` requests, an `i.liadm.com` frame). The list
  above leaves them out on purpose: with the policy above they are blocked, the browser logs the violations, and the
  comments still load and show ("Comments loaded."). Allowing them lets those companies see your readers' visits. Disqus
  changes what it loads without notice, so expect to see violations from it in the console.
- **Google Analytics** loads only for a visitor who sends neither Do Not Track nor Global Privacy Control, so a browser
  with either signal never makes those requests. The origins are the ones Google documents for GA4 without advertising
  features (developers.google.com/tag-platform/security/guides/csp); with Google signals or ads features turned on,
  Google lists more (`https://*.g.doubleclick.net`, `https://*.google.<TLD>`, `https://pagead2.googlesyndication.com`
  and `frame-src https://www.googletagmanager.com`).
- Comments and analytics load only in production builds; a development build needs none of those origins.
- Checked with Hugo 0.167.0 and headless Chrome (CDP) on a production build of a copy of the exampleSite with a Google
  Analytics ID, the Disqus shortname above (reading an existing thread through `disqus_url`; nothing was posted),
  SmugMug photos and YouTube embeds, served with the example policy as an enforced header. The home page, a SmugMug hero,
  a gallery with the lightbox opened, the YouTube page and an article with comments loaded gave no violation from
  anything the theme loads or the lists above allow; the only violations were the VigLink pixel and the LiveIntent
  script. Without the Google, Disqus or YouTube origins, the same pages reported the violations for exactly those
  requests. In that test Chrome could not connect to `google-analytics.com`, so no analytics hit was recorded.

## Accessibility

The theme targets **WCAG 2.1 level AA**. That also covers the Revised Section 508 standards for web content, which
incorporate WCAG 2.0 AA (E205.4), and asks for more: Non-text Contrast (1.4.11), Content on Hover or Focus (1.4.13)
and Status Messages (4.1.3) are WCAG 2.1 criteria that Section 508 doesn't require, and the theme targets them too.
Section 508's software requirements (chapters 502 and 503) don't apply to web content that conforms to WCAG 2.0 AA
(the exception in 501.1). Its documentation requirements (chapter 602) do: this section is the theme's list of
accessibility and compatibility features (602.2), and the README, as electronic documentation, should itself conform
to WCAG 2.0 AA (602.3).
[#94](https://github.com/cyvaquero/hugo-theme-theblues/issues/94) (1.2.0) and
[#197](https://github.com/cyvaquero/hugo-theme-theblues/issues/197) (1.3.0) map the review findings to both
standards.

**Keyboard.** Everything works from the keyboard, with a 3px focus ring (steel on the page, sand on the navy band and
on photos):

- **Skip link:** "Skip to content" is the first stop and moves focus to the main content, and appears inset from the window corner
  with a sand ring, so the ring isn't cut off.
- **Nav:** at 820px and narrower, the Menu button (`aria-expanded`) opens the links; Escape closes the menu and returns
  focus to the button, and the menu also closes when focus leaves it. Without JavaScript the links show as a row.
- **Color theme switch:** three buttons, System, Light and Dark, in a group named "Color theme", with `aria-pressed`
  on the current one.
- **Wall controls:** the type chips are toggle buttons (`aria-pressed`). View options (`aria-expanded`) opens a popover
  and moves focus into it; Tab and Shift+Tab move between the button and the popover, and Escape, a click outside or
  moving focus away closes it (Escape returns focus to the button). Clear moves focus to the All chip; Reset closes the
  popover and returns to View options.
- **Photo tile captions:** a caption shows over the photo while the pointer or focus is on the tile; Escape hides it
  without moving either, and it comes back once the pointer and focus have left the tile and returned (WCAG 1.4.13).
  On touch screens the captions are always shown.
- **Lightbox:** Enter on a gallery photo opens a modal `<dialog>` named "Photo viewer" with focus on Close. Left and
  Right arrows, Home and End move between photos (also Previous and Next buttons, and swipe); Escape or Close returns
  focus to the photo that was opened. Modifier clicks still open the large image in a new tab.
- **Comments:** "Show comments" loads Disqus and moves focus to the "Comments" heading above them. A polite status
  announces "Loading comments…" and then "Comments loaded.", or, if Disqus is blocked or doesn't answer within 15
  seconds, "Comments couldn't be loaded…" with the button back as "Try again".

**Announcements.** The wall's caption ("Showing 5 articles, 12 photos") is a polite live region that announces changes
but not the first render; the lightbox announces "Photo 4 of 18" and the photo's alt text once the photo has loaded.
Photo tiles have names that start with their visible text ("Monterrey, Mexico Gallery, 9 photos, Feb 13, 2025. Photo 1
of 9: La Huasteca"). Each page's h1 is in its hero; wall tiles are h3 under a visually hidden "Posts" h2, and wall
pages after the first have their own title. With Group by gallery on, each group title ("Articles · 5 articles") is an
h3 inside its disclosure button and the article tiles drop to h4, so the heading list stays in order. A post's series
box title ("Part 2 of 3: Name") and the table of contents label ("On this page") are h2s.
Links that open a new tab, which are links to other hosts in post text and the footer's LinkedIn and GitHub links, end
their name with a visually hidden "(opens in a new tab)".

**Color, motion and display.** Text is 4.5:1 or more in light and dark mode and in both ways of choosing a mode (the
system setting or the switch); body text is 10.5:1 (light) and 12.8:1 (dark). In forced-colors mode (Windows high
contrast) pressed chips, the current page, the theme switch and the Group switch keep a visible state. Transitions are
off unless `prefers-reduced-motion` allows them. Pages reflow to 320px wide with no horizontal scrolling. On touch
screens (`pointer: coarse`) these are at least 44px tall: the type chips, View options, Clear, the rows of the popover
(switch and selects), the Menu button, the color theme switch, the nav links and brand, tag links (hero, tiles, lists),
the footer links, pagination, the table of contents entries, the series box's list and previous/next links, post
navigation and the category link in a post's hero. Only the height is set, so a short link stays narrow. Not enlarged:
links inside running text (post bodies, the comments note), the series name link in the series box title, and an
article tile's title link, which is covered by the tile, itself one link. A print stylesheet prints black on white.

**Writing accessible content.**

- Give every `gallery` photo a `title`: it becomes the photo's alt text and is read on wall tiles. Without one the alt
  text is "Photo N" and the build warns (`theblues-gallery-no-title`).
- Write Markdown image alt text (`![alt](src)`); a title makes a captioned figure only for stand-alone images (see
  Markdown links and images).
- Start a post's headings at `##`: the hero already holds the page's h1 (the post title), so a `#` heading in the
  body makes a second h1. Keep the levels in order below that; the table of contents is built from them.
- Use `[markup.highlight] noClasses = false` if posts show line numbers (see Syntax highlighting).
- Give `embed` a title (the fourth argument); it names the frame.
- Give Hugo's `youtube` shortcode a `title` (`{{< youtube id="…" title="…" >}}`); without one every video frame
  is named "YouTube video".

**Known gaps.** Not yet checked with screen readers or on real touch devices. Inline-highlighted line numbers fail contrast ([#76](https://github.com/cyvaquero/hugo-theme-theblues/issues/76), documented above). Other accessibility issues are
listed under the [accessibility label](https://github.com/cyvaquero/hugo-theme-theblues/issues?q=is%3Aopen+label%3Aaccessibility).

## Testing the theme

`exampleSite/` is a small fixture site whose content exercises the cases the guyheckman.me content doesn't: an untitled
post, an undated post, a gallery with commented-out photos, a positional `gallery` call and an untitled photo, a
`{{% galleries %}}` block, the `embed` shortcode, Markdown links and images (including a dropped `javascript:` link),
a series, a code block with line numbers, a post whose headings are all below the TOC levels, a page without a title, the legacy `params.addtional_menus` nav, a footer
menu, wall pagination past page 1 (`tilesPerPage = 4`), a local header image (`static/img/head.jpg`), and gallery and
hero photos on `photos.smugmug.com`, which make the build read each photo's size and write `width`/`height`, `srcset`,
the hero's smaller sizes and its preload (they need a network the first time; Hugo then keeps them in its cache, and
an offline build leaves those attributes out without a warning). Hugo doesn't use it when the theme is installed in a
site. Build it from that folder:

```bash
cd exampleSite
hugo --panicOnWarning --printPathWarnings --printUnusedTemplates --themesDir ../.. -d /tmp/theblues-after
```

`--themesDir` must contain the theme as a folder (or link) named `hugo-theme-theblues`, which `../..` is in the site's
submodule checkout. The build should finish with no warnings and no unused templates: the warnings the fixtures cause
on purpose are listed in `ignoreLogs` in `exampleSite/hugo.toml`, and any other warning fails it.

To check that a change leaves the output alone, build the same fixtures with the theme before the change (for example
a `git worktree` of `develop`, linked as `hugo-theme-theblues` in another folder) into `/tmp/theblues-before`, then
compare with `diff -r /tmp/theblues-before /tmp/theblues-after`. Fingerprinted file names, `integrity` hashes and the
footer's theme version change whenever a stylesheet, a script or `data/theblues.toml` does; anything else that differs
is a change in output.

The screenshots under `images/` (`readme-*.webp`, about 0.8 MB in all) are captured from the exampleSite, so they can be
made again. `images/screenshot.png` and `images/tn.png` are the themes gallery's own images (1500x1000 and 900x600) and
are not made this way. To recreate the README images:

- Build the fixture for production with a longer wall and a fixed base URL, since its own settings (4 tiles per page) are
  made for testing pagination: from `exampleSite`, run `HUGO_PARAMS_WALL_TILESPERPAGE=24 HUGO_PARAMS_WALL_PHOTOSPERGALLERY=4
  hugo --environment production --minify --themesDir ../.. -b http://127.0.0.1:8099/ -d <dir>`. Serve `<dir>` on port 8099
  with any static file server.
- Use headless Chrome (driven over the DevTools protocol by a script kept outside the repo) with device scale factor 1
  and a 1280x800 viewport for desktop, and 390x844 at scale factor 2 with the mobile flag for the phone. Emulate
  `prefers-color-scheme: light` (and `dark` for the dark hero), and allow network access only to `127.0.0.1` and
  `photos.smugmug.com`. Most fixture photos are on `photos.example.org`, which doesn't exist, so the script answers those
  requests with the three real SmugMug photos of the "SmugMug photos with sizes" post, one per photo.
- Wait for all images to load, then save `Page.captureScreenshot` with `format: webp` and `quality: 80` (about 35 to
  175 KB each). The pages and states:
  - `home-light`, `home-dark`: `/`, scrolled to the top, in light and dark mode.
  - `photo-post`: `/post/20260104-smugmug-photos/`, scrolled until the gallery is in view (its top 470 px below the
    viewport top).
  - `lightbox`: the same page after clicking the first gallery photo.
  - `article`: `/post/20260105-dated-article/` at 1280x980, scrolled until the table of contents is 380 px from the top.
  - `view-options`: `/` after clicking "View options", scrolled until the controls row is 20 px from the top.
  - `tag-page`: `/tags/photos/` at the top.
  - `theme-switch`: the article page after clicking the Dark button in the nav, with the system in light mode.
  - `mobile-menu`: `/` at phone size with a clean `localStorage`, after clicking the Menu button.

## Design decisions

Decision records, the Clean White inventory and the layout mockups are in [docs/retheme/](docs/retheme/decisions.md)
(Hugo does not publish this folder; this is the canonical copy). The work is tracked on issue
cyvaquero/hugo-site-guyheckman_me#4. In short: palette B (navy, steel blue, sand, cream) with light and dark modes;
responsive with a hamburger nav at 820 px and narrower; Disqus on posts only (click to load since 1.2.0); GA4 (Do Not Track and Global Privacy Control respected since 1.2.0); search is
a reserved slot until the engine is chosen (cyvaquero/hugo-site-guyheckman_me#3). The featured-tags cloud (D14) is
deferred.

## Credits

Started from the [Clean White](https://github.com/zhaohuabing/hugo-theme-cleanwhite) Hugo theme by Huabing Zhao
(Apache-2.0), which is based on Huxblog and Clean Blog. The layout, markup and styles have since been rewritten, and no Clean
White code remains beyond a few generic lines. See [NOTICE](NOTICE) for attribution; keep it with any copy or derivative.

## License

Apache License 2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE). Copyright (c) 2026 Guy Heckman.
