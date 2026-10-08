# The Blues

A responsive, accessible Hugo theme for [guyheckman.me](https://guyheckman.me). Replaces the Clean White theme.
Palette: navy `#1B3C53`, steel blue `#456882`, sand `#D2C1B6`, cream `#F9F3EF`, with light and dark modes
(`prefers-color-scheme`).

It has a hero with a wavy-underlined slogan, a full-width masonry wall (three columns from 900 px) that mixes photo tiles and
article tiles, a calm "View options" popover (filter or highlight by type, sort, group by gallery), photo posts with a masonry
gallery and a `<dialog>` lightbox, articles with a table of contents and series box, tag pages, and serif headlines. It builds
the site's real content to the same 30 URLs as Clean White with no Hugo warnings. See "Known limits" below and the
[open issues](https://github.com/cyvaquero/hugo-theme-theblues/issues).

## Requirements

- Hugo **0.163.3** or later (standard or extended). Earlier versions have published Hugo security advisories, and the theme
  uses `.Language.Locale`. Developed and tested on 0.167.0.
- No Node, no Sass: CSS and JS go through Hugo Pipes (minify and fingerprint).
- **CSS is hand-written and has one source file**, `assets/css/main.css`: commented and readable, with no framework, no
  `@import`, and no third-party or legacy stylesheets. Hugo minifies and fingerprints it at build time
  (`layouts/_partials/asset.html`): a production build (`hugo`) publishes `css/main.min.<hash>.css` with the comments
  stripped, while a development build (`hugo server`) serves the readable source unchanged. The JavaScript files follow the
  same rule.
- No external fonts, frameworks, or CDN scripts. JavaScript is three small files (`menu.js`, `wall.js`, `gallery.js`); the
  wall and gallery scripts load only where needed.

## Installation

Add the theme as a Git submodule and select it in the site config:

```bash
git submodule add https://github.com/cyvaquero/hugo-theme-theblues.git themes/hugo-theme-theblues
```

```toml
theme = "hugo-theme-theblues"
```

Pin the submodule to a release tag (for example `1.0.1`). The theme is not packaged as a Hugo Module (there is no `go.mod`).

The footer shows the Hugo version and the theme version. The theme version lives in `data/theblues.toml`; bump it
with every CHANGELOG version. A site can override it with its own `data/theblues.toml`.

## Content structure

The templates assume this layout; other structures are not supported yet.

- **Posts live in the `post` section** (`content/post/`). The home wall, section and term walls, the archive and post
  navigation only list pages in that section, and `layouts/post/page.html` is the post template. Pages outside it get no
  series box, comments, previous/next links or table of contents. Taxonomy indexes (`/tags/` and so on) count posts only and
  leave out terms used only outside the section; a term page with no posts says "No posts yet."
- **Taxonomies:** declare `series` next to the default ones:

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
- **Syntax highlighting:** the CSS assumes Hugo's inline highlighting with a light style; the site uses
  `[markup.highlight] style = "monokailight"`.
- **Favicon:** if the site has `static/img/favicon.ico`, it is linked; otherwise the page sets an empty icon.
- **Markdown links and images:** links and image sources are kept only for `http`, `https` and scheme-less paths (links
  also allow `mailto` and `tel`); a `javascript:`, `data:` or other URL renders the text with no link and the image with
  no `src`. A path to a page or page resource resolves to its permalink, as with Hugo's built-in hooks. Links to other
  hosts open in a new tab. A titled image is a `<figure>` with a caption only when it stands alone and the site sets
  `markup.goldmark.parser.wrapStandAloneImageWithinParagraph = false`; otherwise the title is the tooltip.

## Shortcodes

| Shortcode | Usage | Notes |
|---|---|---|
| `galleries` | `{{< galleries >}} … {{< /galleries >}}` | Wraps `gallery` calls in a masonry block and loads the lightbox. Use the `{{< >}}` form; the `{{% %}}` form renders nothing. Only the `gallery` photos are output; any other text or HTML between the tags is dropped. |
| `gallery` | `{{< gallery src="…/X2/i-abc-X2.jpg" title="Caption" >}}` | One photo. `src` is a SmugMug `X2` thumbnail URL; the link and the lightbox use the `X3` size. Use a named, double-quoted `src`: a positional `src` renders on the post but is not counted for the wall, covers or photo counts. `title` becomes the alt text and caption. |
| `embed` | `{{< embed "https://…" 800 600 "Title" >}}` | A sandboxed iframe (URL, width, height, optional title; positional only), meant for SmugMug gallery embeds. The build fails if the URL, width or height is missing or the URL is not `https://`. |

## Extending from a site

A site can add its own page types without overriding theme files:

- **Templates:** a site's `layouts/<section>/page.html` or `section.html` renders inside the theme's `baseof.html`. It
  fills the `main` block, and can replace the default hero by defining the `header` block. The nav, footer, stylesheet
  and menu script still come from the theme.
- **`<head>`:** `layouts/_partials/head-end.html` is empty and is included last in `<head>`. A site's own
  `layouts/_partials/head-end.html` replaces it, for example to add a stylesheet for its own sections.
- **Styles:** the custom properties at the top of `assets/css/main.css` (section 1) are the colors and fonts a site's
  CSS should use, so it follows light and dark mode: `--bg`, `--text`, `--muted`, `--link`, `--focus`, `--band`, `--bt`,
  `--line`, `--surface`, `--code`, `--on-bg`, `--on-fg`, `--serif`, `--sans`, `--wide` and `--measure`. Their names are
  kept stable; a rename or removal is called out in the CHANGELOG.

## Layout

```
assets/css/main.css        tokens (palette) and all styles
assets/js/menu.js          hamburger dropdown for the nav (820 px and narrower)
assets/js/wall.js          wall controls: type chips, filter or highlight, sort, group by gallery, popover
assets/js/gallery.js       <dialog> lightbox, only loaded on pages with a gallery
layouts/baseof.html        page shell
layouts/home.html          landing page: hero, controls, masonry wall, pagination
layouts/section.html       /post/ list (same wall)
layouts/term.html          tag, category, and series pages (hero plus the same wall)
layouts/taxonomy.html      /tags/, /categories/, /series/ (A-Z list with counts)
layouts/page.html          generic pages (About)
layouts/archive.html       pages with layout: archive
layouts/post/page.html     blog posts: photo posts (cover hero, masonry gallery) and articles (hero, TOC, series box, comments)
layouts/search/section.html  search page (placeholder until the engine is chosen)
layouts/404.html
layouts/_partials/         head, head-end, nav, hero, controls, wall, tile-photo, tile-article, photos, is-photo, smug-full, gallery-figure, cover,
                           series-info, series-box, post-nav, page-title, pagination, comments, social, footer, search, asset, tile-more, wall-tiles, wall-page
layouts/_shortcodes/       gallery, galleries (masonry), embed
layouts/_markup/           render-link, render-image
```

### How the wall works

- A post is a **photo post** if its categories include `photos` (case-insensitive) or its raw content uses the `galleries`
  shortcode; everything else is an **article**.
- A photo post becomes **image tiles for its first few photos** (default 4, `params.wall.photosPerGallery`), read from its
  `gallery` shortcodes (`src` and `title`) in source order, each linking to the post, followed by one dashed **see-all tile**
  ("Boston Gallery, 14 more photos") that links to the gallery post when photos remain. The gallery post itself shows every
  photo. An article becomes one text tile (ARTICLE label, serif title, excerpt, date, tag links, and a "Part N of M" chip
  for series posts). A photo post with no parsable photos falls back to a single article tile.
- Tiles carry `data-type`, `data-date`, `data-order` (and `data-gallery`, `data-gallery-title` on photos), which `wall.js`
  reads; they also carry `data-series`, which nothing reads yet. See-all tiles also carry `data-more` and are left out of the
  chip counts and caption. Without JavaScript the wall is complete and newest-first, and the controls stay hidden.
- The lightbox link is the `X3` size derived from the SmugMug `X2` thumbnail URL.

### Known limits

- The wall is paginated **by tile**, 24 per page (`params.wall.tilesPerPage`), so chip counts, the caption and group-by are
  per page, and a gallery can be split across two pages. With the current content (5 articles and 3 galleries) everything
  fits on one page of 20 tiles. Hugo's `.Paginate` only accepts a collection of pages, so
  `layouts/_partials/wall-page.html` paginates a stand-in collection with one entry per tile and slices the real tile list
  with the same offsets; page counts and URLs come from Hugo's own pager. It is a workaround. `pagination.pagerSize` does not
  affect wall pages.
- `photosPerGallery` applies per post: a post with several `galleries` blocks counts as one gallery.
- Without JavaScript, at 820 px and narrower the nav links are hidden and the Menu button does nothing.
- `.highlight` code blocks stay light in dark mode (Hugo's inline `monokailight` styling).
- Reduced motion is handled (all transitions are gated on `prefers-reduced-motion`). Not yet checked on real devices: touch
  devices and screen readers. An independent review (October 2026) measured contrast and keyboard behaviour; its findings
  are open issues.
- Build time grows quickly with the number of posts (the wall is rebuilt for each pager page); fine for a small site.

## Site settings it reads

It keeps the parameter names the site already uses, so `config.toml` needs little change:

- `title`, `locale` (sets `<html lang>`)
- `params`: `header_image`, `slogan`, `tagline`, `description`, `SEOTitle`, `keyword`, `social.rss|linkedin|github`,
  `image_404`, `title_404`, `search_enabled` (default off), `search_label` (default `SEARCH`), `showtoc` (site-wide default for
  the TOC; on when unset, and shown only when a post has headings), and the optional
  `[params.wall]` table: `tilesPerPage` (default 24) and `photosPerGallery` (default 4)
- `[[menus.main]]`, or the legacy `params.addtional_menus` list (Clean White's spelling) when no main menu is defined.
  A `[[menus.main]]` entry whose `pageRef` doesn't resolve to a page is left out of the nav, so a link to a category
  or section appears only once it has content.
  Legacy `href` values that are full URLs are used as is; site paths get one trailing slash and follow a sub-path `baseURL`.
- `[services.googleAnalytics] id` and `[services.disqus] shortname`. Analytics uses Hugo's internal template; Do Not Track
  applies only if the site sets `[privacy.googleAnalytics] respectDoNotTrack = true`, and even then the gtag loader is
  requested.

`header_image`, `image` and `image_404` may be absolute URLs or paths under the site root (`img/x.jpg`); the theme turns paths
into absolute URLs.

Front matter: `title`, `subtitle`, `description`, `date`, `image`, `showtoc`, `categories` (a list, or a single string),
`tags`, `series`.

## Design decisions

Decision records, the Clean White inventory and the layout mockups are in [docs/retheme/](docs/retheme/decisions.md)
(Hugo does not publish this folder; this is the canonical copy). The work is tracked on issue
cyvaquero/hugo-site-guyheckman_me#4. In short: palette B (navy, steel blue, sand, cream) with light and dark modes;
responsive with a hamburger nav at 820 px and narrower; Disqus on posts only; GA4 through Hugo's internal template; search is
a reserved slot until the engine is chosen (cyvaquero/hugo-site-guyheckman_me#3). The featured-tags cloud (D14) is
deferred.

## Credits

Started from the [Clean White](https://github.com/zhaohuabing/hugo-theme-cleanwhite) Hugo theme by Huabing Zhao
(Apache-2.0), which is based on Huxblog and Clean Blog. The layout, markup and styles have since been rewritten, and no Clean
White code remains beyond a few generic lines. See [NOTICE](NOTICE) for attribution; keep it with any copy or derivative.

## License

Apache License 2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE). Copyright (c) 2026 Guy Heckman.
