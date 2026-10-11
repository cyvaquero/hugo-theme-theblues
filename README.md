# The Blues

A responsive, accessible Hugo theme for [guyheckman.me](https://guyheckman.me). Replaces the Clean White theme.
Palette: navy `#1B3C53`, steel blue `#456882`, sand `#D2C1B6`, cream `#F9F3EF`, with light and dark modes. The mode
follows the system setting (`prefers-color-scheme`) unless the reader picks Light or Dark with the switch in the nav.

It has a hero with a wavy-underlined slogan, a full-width masonry wall (three columns from 900 px) that mixes photo tiles and
article tiles, a calm "View options" popover (filter or highlight by type, sort, group by gallery), photo posts with a masonry
gallery and a `<dialog>` lightbox, articles with a table of contents and series box, tag pages, and serif headlines. It builds
the site's real content to the same 30 URLs as Clean White with no Hugo warnings. See "Known limits" below and the
[open issues](https://github.com/cyvaquero/hugo-theme-theblues/issues).

## Requirements

- Hugo **0.163.3** or later (standard or extended). Earlier versions have published Hugo security advisories, and the theme
  uses `.Language.Locale`. Developed and tested on 0.167.0. The minimum is set in the theme's `hugo.toml`
  (`[module.hugoVersion] min`), which Hugo checks and warns about; `theme.toml`'s `min_version` only mirrors it for the
  themes gallery.
- No Node, no Sass: CSS and JS go through Hugo Pipes (minify and fingerprint).
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
  - `analytics.js`, only when the site sets a GA ID, and only in production builds;
  - `comments.js`, on posts when the site sets a Disqus shortname.

  A site CSP therefore needs no script hashes. Hugo's internal GA and Disqus templates are not used.

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
  no `src`. A path to a page or page resource resolves to its permalink, as with Hugo's built-in hooks. Links to other
  hosts open in a new tab, with visually hidden "(opens in a new tab)" text for screen readers. A titled image is a `<figure>` with a caption only when it stands alone and the site sets
  `markup.goldmark.parser.wrapStandAloneImageWithinParagraph = false`; otherwise the title is the tooltip.

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
- **Analytics:** `layouts/_partials/analytics-on.html` returns `true` when the theme loads Google Analytics on the page
  (a production build, `[services.googleAnalytics] id` set, `[privacy.googleAnalytics] disable` not set) and `false`
  otherwise. `head.html` uses the same partial, so a site that shows an analytics notice only when analytics loads
  stays in step with the theme: `{{ if partial "analytics-on.html" . }}…{{ end }}`. Its name and result are kept
  stable; a change is called out in the CHANGELOG. Theme versions before 1.2.49 don't have it; a site that must build
  with them can check `templates.Exists "_partials/analytics-on.html"` first.
- **Styles:** the custom properties at the top of `assets/css/main.css` (section 1) are the colors and fonts a site's
  CSS should use, so it follows light and dark mode: `--bg`, `--text`, `--muted`, `--link`, `--focus`, `--band`, `--bt`,
  `--line`, `--surface`, `--code`, `--on-bg`, `--on-fg`, `--hv` (the sand accent for hover and focus on dark bands),
  `--scrim` (the navy scrim over photos, as RGB channels: `rgb(var(--scrim) / .8)`), `--serif`, `--sans`, `--wide` and
  `--measure`. Their names are kept stable; a rename or removal is called out in the CHANGELOG.
  A site's own dark-mode colors should use the theme's two dark selectors, so they follow the switch as well as the
  system: `@media (prefers-color-scheme: dark) { :root:not([data-theme=light]) … }` and `:root[data-theme=dark] …`.
- **Breakpoints:** the layout changes at fixed widths, which a site's CSS can match. They are not settings (#6):
  - 560px: masonry walls and `galleries` blocks go from one column to two;
  - 700px: the View options popover becomes a 20rem panel at the right instead of spanning the controls, and the wall
    caption moves from the left to the right;
  - 821px: the full nav replaces the Menu button (`nojs.css` and `menu.js` use 820px and narrower), and articles get the
    table of contents beside the text;
  - 900px: masonry walls and `galleries` blocks get a third column.

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
                           tile-photo-parts, tile-article, photos, is-photo, smug-full, smug-srcset, img-size, gallery-figure,
                           cover, series-info, series-box, series-items, series-item, post-nav, page-title, pagination, date,
                           comments, social, footer, search, asset, script, stylesheet, tile-more, wall-tiles, wall-stand,
                           wall-pager, wall-page, term-stats
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
  for series posts). A photo post with no parsable photos falls back to a single article tile.
- Tiles carry `data-type`, `data-date`, `data-order` (and `data-gallery`, `data-gallery-title` and `data-n`, the
  gallery's photo count, on photos), which `wall.js` reads; `#stage` carries the whole list's article and photo tile
  counts (`data-articles`, `data-photos`) for the type chips. See-all tiles also carry `data-more` and are left out of the chip counts and caption. Without JavaScript the wall is complete and newest-first, and the controls stay hidden.
- The lightbox link is the `X3` size derived from the SmugMug `X2` thumbnail URL.
- Wall tiles and gallery images get `width` and `height`, read at build time by downloading each photo once with
  `resources.GetRemote` (`layouts/_partials/img-size.html`), so they keep their shape while they load and the masonry
  doesn't reflow. Hugo keeps the downloads in its `getresource` file cache (by default `:cacheDir/:project`, kept until
  cleared), so a build fetches only photos new to the cache; a build without a cache (for example on a fresh CI machine)
  fetches them all. When a photo can't be fetched (offline, a timeout, a server error) the attributes are left out
  without a warning and the tile holds a 3:2 placeholder; when the server answers that the photo doesn't exist (HTTP 404)
  or isn't an image, the build warns (warning ID `theblues-image-size`).
- When the size is known and the photo is a SmugMug `X2` URL on `photos.smugmug.com`, tiles and gallery images also get
  a `srcset` of SmugMug's M, L and XL sizes plus X2, with `sizes` matching the masonry columns, so phones and one-x
  screens load a smaller file (`layouts/_partials/smug-srcset.html`). SmugMug names each size in the URL's path segment
  and file suffix (`/X2/i-ABC-X2.jpg`, `/L/i-ABC-L.jpg`) and scales it to fit a box: M 600×450, L 800×600, XL 1024×768,
  X2 1280×960.
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
  `style-src 'unsafe-inline'` (or `style-src-attr 'unsafe-inline'`). The theme sets no referrer policy; browsers default to
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
  tile list, once for all its pager pages. 550 posts built in about 0.34 s when this was measured for 1.2.0 (#7).

## Site settings it reads

It keeps the parameter names the site already uses, so the site's `hugo.toml` (or `config.toml`) needs little change:

- `title`, `locale` (sets `<html lang>`), `mainSections` (the sections that hold posts, see Content structure)
- `params`: `header_image`, `slogan`, `tagline`, `description`, `SEOTitle`, `keyword`, `social.rss|linkedin|github`,
  `image_404`, `title_404`, `og_image` (share image for pages without their own), `search_enabled` (default off), `search_label` (default `SEARCH`), `dateFormat` (a Go layout for
  dates on posts, tiles and wall headings, default `Jan 2, 2006`; the archive's `Jan 2` and the series box's `Jan 2006`
  stay fixed), `showtoc` (site-wide default for
  the TOC; on when unset, and shown only when a post has headings within the `markup.tableOfContents` levels), and the optional
  `[params.wall]` table: `tilesPerPage` (default 24) and `photosPerGallery` (default 4), each 1 or more
- `ignoreLogs`: the theme's build warnings have IDs a site can list there to silence them: `theblues-gallery-no-title`
  (a `gallery` photo without a `title`), `theblues-undated` (a post without a `date`), `theblues-addtional-menus`
  (the deprecated legacy menu, below), `theblues-image-size` (a wall or gallery photo URL that answers 404 or isn't an
  image) and `theblues-toc-markup` (Hugo's table of contents markup changed, so the theme
  can't check or label it; better fixed than silenced), for example
  `ignoreLogs = ['theblues-undated']`.
- `[[menus.main]]`, or the legacy `params.addtional_menus` list (Clean White's spelling) when no main menu is defined.
  The legacy list is deprecated: the build warns (`theblues-addtional-menus`), and it will be removed in a future major
  version.
  A `[[menus.main]]` entry whose `pageRef` doesn't resolve to a page is left out of the nav, so a link to a category
  or section appears only once it has content.
  Legacy `href` values that are full URLs are used as is; site paths get one trailing slash and follow a sub-path `baseURL`.
- `[[menus.footer]]` (optional): links shown in the footer under the social links, in a navigation landmark named
  "Footer", for example a privacy note (`url = "/about/#privacy"`) or a page (`pageRef`).
- `[services.googleAnalytics] id`:
  - Analytics loads only in production builds, unless `[privacy.googleAnalytics] disable = true`. A site can ask the
    theme whether it loads with `layouts/_partials/analytics-on.html` (see Extending from a site).
  - A visitor who sends Do Not Track or Global Privacy Control gets nothing: no gtag.js request and no hit.
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
  - `[services.rss] limit` caps the number of items (no cap by default).
- `[markup]`: the theme works with Hugo's defaults, and these settings change what it shows:
  - `[markup.highlight] noClasses = false` lets code follow the light and dark palette (see Syntax highlighting);
  - `[markup.tableOfContents] startLevel` and `endLevel` set which headings the "On this page" box lists, and a post
    with no headings in that range has no box;
  - `[markup.goldmark.parser] wrapStandAloneImageWithinParagraph = false` turns a titled image on its own line into a
    figure with a caption (see Markdown links and images).

  The `series` taxonomy also has to be declared by the site (see Taxonomies).
- Hugo's `[privacy]` settings: the theme loads Google Analytics and Disqus with its own scripts, not Hugo's internal
  templates, so only these apply:
  - `[privacy.googleAnalytics] disable = true` leaves analytics out;
  - `[privacy.disqus] disable = true` leaves the comments out (no button, no script);
  - `[privacy.googleAnalytics] respectDoNotTrack` has no effect: Do Not Track and Global Privacy Control are always
    honored. The other `privacy.googleAnalytics` settings are for Hugo's internal template and are ignored too.

`header_image`, `image` and `image_404` may be absolute URLs or paths under the site root (`img/x.jpg`); the theme turns paths
into absolute URLs.

Front matter: `title`, `subtitle`, `description`, `date`, `image` (the page's hero image and share image; without it the
hero uses the first gallery photo, then the site's `header_image`, see Share image), `showtoc`, `categories` (a list,
or a single string), `tags`, `series`.

## Accessibility

The theme targets **WCAG 2.1 level AA**. That also covers the Revised Section 508 standards for web content, which
incorporate WCAG 2.0 AA (E205.4); [#94](https://github.com/cyvaquero/hugo-theme-theblues/issues/94) maps the review findings to both standards.

**Keyboard.** Everything works from the keyboard, with a 3px focus ring (steel on the page, sand on the navy band and
on photos):

- **Skip link:** "Skip to content" is the first stop and moves focus to the main content.
- **Nav:** at 820px and narrower, the Menu button (`aria-expanded`) opens the links; Escape closes the menu and returns
  focus to the button, and the menu also closes when focus leaves it. Without JavaScript the links show as a row.
- **Color theme switch:** three buttons, System, Light and Dark, in a group named "Color theme", with `aria-pressed`
  on the current one.
- **Wall controls:** the type chips are toggle buttons (`aria-pressed`). View options (`aria-expanded`) opens a popover
  and moves focus into it; Tab and Shift+Tab move between the button and the popover, and Escape, a click outside or
  moving focus away closes it (Escape returns focus to the button). Clear moves focus to the All chip; Reset closes the
  popover and returns to View options.
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
pages after the first have their own title.

**Color, motion and display.** Text is 4.5:1 or more in light and dark mode and in both ways of choosing a mode (the
system setting or the switch); body text is 10.5:1 (light) and 12.8:1 (dark). In forced-colors mode (Windows high
contrast) pressed chips, the current page, the theme switch and the Group switch keep a visible state. Transitions are
off unless `prefers-reduced-motion` allows them. Pages reflow to 320px wide with no horizontal scrolling, and targets
are 44px on touch screens. A print stylesheet prints black on white.

**Writing accessible content.**

- Give every `gallery` photo a `title`: it becomes the photo's alt text and is read on wall tiles. Without one the alt
  text is "Photo N" and the build warns (`theblues-gallery-no-title`).
- Write Markdown image alt text (`![alt](src)`); a title makes a captioned figure only for stand-alone images (see
  Markdown links and images).
- Keep heading levels in order in posts; the table of contents is built from them.
- Use `[markup.highlight] noClasses = false` if posts show line numbers (see Syntax highlighting).
- Give `embed` a title (the fourth argument); it names the frame.

**Known gaps.** Not yet checked with screen readers or on real touch devices. Inline-highlighted line numbers fail contrast ([#76](https://github.com/cyvaquero/hugo-theme-theblues/issues/76), documented above). Other accessibility issues are
listed under the [accessibility label](https://github.com/cyvaquero/hugo-theme-theblues/issues?q=is%3Aopen+label%3Aaccessibility).

## Testing the theme

`exampleSite/` is a small fixture site whose content exercises the cases the guyheckman.me content doesn't: an untitled
post, an undated post, a gallery with commented-out photos, a positional `gallery` call and an untitled photo, a
`{{% galleries %}}` block, the `embed` shortcode, Markdown links and images (including a dropped `javascript:` link),
a series, a code block with line numbers, a post whose headings are all below the TOC levels, a page without a title, the legacy `params.addtional_menus` nav, a footer
menu, and wall pagination past page 1 (`tilesPerPage = 4`). Hugo doesn't use it when the theme is installed in a
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
