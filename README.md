# The Blues

A responsive, accessible Hugo theme for [guyheckman.me](https://guyheckman.me). Replaces the Clean White theme.
Palette: navy `#1B3C53`, steel blue `#456882`, sand `#D2C1B6`, cream `#F9F3EF`, with light and dark modes
(`prefers-color-scheme`).

Status: **implemented on `develop`, not released.** (A 0.5.0 release was prepared and dropped until the layout was
built; there are no tags yet.) The chosen design is built: a hero with a wavy-underlined slogan, a full-width masonry wall
(three columns from 900 px) that mixes photo tiles and article tiles, a calm "View options" popover (filter or highlight by
type, sort, group by gallery), photo posts with a masonry gallery and a `<dialog>` lightbox, articles with a table of contents
and series box, tag pages, and serif headlines. It builds the site's real content to the same 30 URLs as Clean White with no
theme-related Hugo warnings. Known limits: see "Known limits" below. It is wired into the site's `develop` branch as a submodule
(site issue #6); production still uses Clean White until this theme is released (release tracker: issue #10).

## Requirements

- Hugo 0.146.0 or later (uses the `layouts/_partials`, `_shortcodes`, and `_markup` structure). Developed on 0.167.0.
- No Node, no Sass: CSS and JS go through Hugo Pipes (minify and fingerprint).
- **CSS is hand-written and has one source file**, `assets/css/main.css`: commented and readable, with no framework, no
  `@import`, and no third-party or legacy stylesheets. Hugo minifies and fingerprints it at build time
  (`layouts/_partials/asset.html`): a production build (`hugo`) publishes `css/main.min.<hash>.css` with the comments
  stripped, while a development build (`hugo server`) serves the readable source unchanged. The JavaScript files follow the
  same rule.
- No external fonts, frameworks, or CDN scripts. JavaScript is three small files (`menu.js`, `wall.js`, `gallery.js`); the wall and gallery scripts load only where needed.

## Layout

```
assets/css/main.css        tokens (palette) and all styles
assets/js/menu.js          hamburger dropdown for the nav (below 820 px)
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
layouts/search/section.html  search page (engine chosen in issue #3)
layouts/404.html
layouts/_partials/         head, nav, hero, controls, wall, tile-photo, tile-article, photos, is-photo, smug-full, cover,
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
- Tiles carry `data-type`, `data-date`, `data-order`, `data-series` (and `data-gallery`, `data-gallery-title` on photos);
  `wall.js` reads them; see-all tiles also carry `data-more` and are left out of the chip counts and caption. Without JavaScript the wall is complete and newest-first, and the controls stay hidden.
- The lightbox link is the `X3` size derived from the SmugMug `X2` thumbnail URL.

### Known limits

- The wall is paginated **by tile**, 24 per page (`params.wall.tilesPerPage`), so chip counts, the caption and group-by are per
  page. With the current content (5 articles and 3 galleries) everything fits on one page of 20 tiles. Hugo's `.Paginate` only
  accepts a collection of pages, so `layouts/_partials/wall-page.html` paginates a stand-in collection with one entry per tile
  and slices the real tile list with the same offsets; page counts and URLs come from Hugo's own pager. It is a workaround.
- `.highlight` code blocks stay light in dark mode (Hugo's inline `monokailight` styling).
- Not yet checked: touch devices, screen readers, reduced motion, keyboard tab order, contrast measured with a tool.

## Site settings it reads

It keeps the parameter names the site already uses, so `config.toml` needs little change: `title`, `params.header_image`,
`slogan`, `tagline`, `description`, `SEOTitle`, `keyword`, `social.rss|linkedin|github`, `[[menus.main]]` (or the legacy
`addtional_menus` list), `image_404`, `title_404`,
`googleAnalytics`, `disqusShortname`, `search_enabled` (new, default off), and the optional `[params.wall]` table:
`tilesPerPage` (default 24) and `photosPerGallery` (default 4).

Front matter: `title`, `subtitle`, `description`, `date`, `author`, `image`, `showtoc`, `categories`, `tags`, `series`.
The byline comes from each post's `author` front matter, falling back to the site's `params.author` if set; new posts made
from the archetype get `author` pre-filled from `params.author` (empty if unset).

## Design decisions

Decision records, the Clean White inventory and the layout mockups are in [docs/retheme/](docs/retheme/decisions.md)
(Hugo does not publish this folder; this is the canonical copy). The work is tracked on issue
cyvaquero/hugo-cleanwhite-guyheckman_me#4. In short: palette B
(navy, steel blue, sand, cream) with light and dark modes; responsive with a hamburger nav below 820 px; Disqus on posts
only; GA4 with Do Not Track; search is a reserved slot until the engine is chosen (issue #3). The featured-tags cloud (D14) is deferred.

## Credits

Started from the [Clean White](https://github.com/zhaohuabing/hugo-theme-cleanwhite) Hugo theme by Huabing Zhao
(Apache-2.0), which is based on Huxblog and Clean Blog. The layout has since been reworked. See [NOTICE](NOTICE) for
attribution; keep it with any copy or derivative.

## License

Apache License 2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE). Copyright (c) 2026 Guy Heckman for The Blues; the
Clean White origins are credited in NOTICE.
