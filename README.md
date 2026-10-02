# The Blues

A responsive, accessible Hugo theme for [guyheckman.me](https://guyheckman.me). Replaces the Clean White theme.
Palette: navy `#1B3C53`, steel blue `#456882`, sand `#D2C1B6`, cream `#F9F3EF`, with light and dark modes
(`prefers-color-scheme`).

Status: scaffold. It builds the site with the same 30 URLs as Clean White and no Hugo warnings; styling and a
few features are still provisional (see below).

## Requirements

- Hugo 0.146.0 or later (uses the `layouts/_partials`, `_shortcodes`, and `_markup` structure). Developed on 0.167.0.
- No Node, no Sass: CSS and JS go through Hugo Pipes (minify and fingerprint).
- No external fonts, frameworks, or CDN scripts. Total JS is two small files, loaded only where needed.

## Layout

```
assets/css/main.css        tokens (palette) and all styles
assets/js/menu.js          hamburger dropdown for the nav (below 820 px)
assets/js/gallery.js       <dialog> lightbox, only loaded on pages with a gallery
layouts/baseof.html        page shell
layouts/home.html          landing page: post list + sidebar
layouts/section.html       /post/ list
layouts/term.html          tag, category, and series pages
layouts/taxonomy.html      /tags/, /categories/, /series/
layouts/page.html          generic pages (About)
layouts/archive.html       pages with layout: archive
layouts/post/page.html     blog posts (hero, series, TOC, comments)
layouts/search/section.html  search page (engine chosen in issue #3)
layouts/404.html
layouts/_partials/         head, nav, hero, post-card, pagination, sidebar, series, comments, social, footer, search
layouts/_shortcodes/       gallery, galleries, embed
layouts/_markup/           render-link, render-image
```

## Site settings it reads

It keeps the parameter names the site already uses, so `config.toml` needs little change: `title`, `params.header_image`,
`slogan`, `description`, `SEOTitle`, `keyword`, `sidebar_avatar`, `sidebar_about_description`, `featured_tags`,
`featured_condition_size`, `omit_categories`, `social.rss|linkedin|github`, `addtional_menus`, `image_404`, `title_404`,
`googleAnalytics`, `disqusShortname`, and `search_enabled` (new, default off).

Front matter: `title`, `subtitle`, `description`, `date`, `author`, `image`, `showtoc`, `categories`, `tags`, `series`.

## Design decisions

Recorded in the site project's docs (`docs/retheme/decisions.md`, issue cyvaquero/hugo-cleanwhite-guyheckman_me#4).
Still provisional here: D7 (gallery uses a CSS grid and `<dialog>`), D9 (inline SVG icons), D3 (CSS tooling).

## Credits

Started from the [Clean White](https://github.com/zhaohuabing/hugo-theme-cleanwhite) Hugo theme by Huabing Zhao
(Apache-2.0), which is based on Huxblog and Clean Blog. The layout has since been reworked. See [NOTICE](NOTICE) for
attribution; keep it with any copy or derivative.

## License

Not yet chosen. Because the theme started from Apache-2.0 work, Apache-2.0 is the straightforward choice.
