# Clean White inventory (issue #4, step 1)

Written 2026-10-01 on branch `feature/retheme`. Read-only analysis; nothing in the site repo was changed.

## Basis

| Item | Value |
|---|---|
| Theme | `zhaohuabing/hugo-theme-cleanwhite`, submodule at `themes/hugo-theme-cleanwhite` |
| Pinned commit | `91cb88a` (`2.0.0-17-g91cb88a`, 17 commits past tag 2.0.0) |
| Theme origin | Port of Huxblog (Jekyll); Bootstrap 3 + jQuery |
| Hugo | extended v0.167.0 |
| Evidence | `hugo --destination <scratch>` build (53 pages, 47 HTML files, 30 sitemap URLs, no warnings) and a grep of the built HTML. Disqus/Pagefind notes come from the built output, not the live site. |

The live site may not match what is committed (see HANDOFF.md), so "used" below means "emitted by a local build of the committed content".

> **Update 2026-10-02.** Written before any theme code existed. Since then: the decisions are in [decisions.md](decisions.md);
> a theme scaffold (`themes/hugo-theme-theblues/`, its own repo) builds the same 30 URLs with no theme-related warnings
> and none of the dead assets listed in section 2. One new finding: the live site's nav shows ALL POSTS, LIFE, PHOTOS, TECH,
> ARCHIVE, ABOUT, but the committed `config.toml` defines only ARCHIVE and ABOUT, so the live site was built from state that
> is not in the repo. Findings 1 to 8 in section 6 still describe the Clean White build.

## 1. Site overrides (what we already own)

| File | vs. theme | Why it exists | Retheme note |
|---|---|---|---|
| `layouts/_default/baseof.html` | full copy, 1 line changed | `.Site.LanguageCode` deprecated; uses `.Site.Language.Locale` | Disappears with the theme |
| `layouts/_default/list.algolia.json` | full copy | Hugo 0.167 deprecation fix | Algolia is disabled; `algolia.json` is still emitted on the home page. Drop with #3 |
| `layouts/partials/head.html` | theme + Algolia verification meta | Algolia site verification | Drop the meta; Algolia is dropped |
| `layouts/partials/nav.html` | theme + a commented-out block | Hides something in the nav (the search box) | Re-decide with #3 |
| `layouts/_default/single.html` | theme + series top/bottom + `<hr>` + "Table of Contents" label | Series feature | Series must be first-class in the new theme |
| `layouts/partials/series_top_content.html`, `series_bottom_content.html` | site only | Series notice and prev/next/list | Port. Uses `<details>`, no JS |
| `layouts/taxonomy/series.html` | site only | Renders series list via theme `category.html` | Port |
| `layouts/_default/_markup/render-link.html` | site only | External links open in a new tab | Port; add `rel="noopener"` |
| `layouts/shortcodes/gallery.html`, `galleries.html`, `embed.html` | site only | nanogallery2 and SmugMug iframe | See section 4 |
| `static/css/guyheckman_me-custom.css` | site only | Series box and `.notice-info` styles (uses CSS nesting) | Port |
| `static/img/404-bg.jpg`, `search.png` | site only | 404 header image; search icon | 404 background is used; `search.png` only by the disabled search |

Config that drives the theme (`config.toml`): `header_image`, `slogan`, `sidebar_avatar`, `sidebar_about_description`, `featured_tags`, `social.*` (only `rss`, `linkedin`, `github` are set), `addtional_menus` (Archive, About), `custom_css`, `bookmark_link` (defined but `bookmarks = false`), `[taxonomies]` incl. `series`, `[markup]` (TOC levels 1-3, highlight style `monokailight` with line numbers), `[outputs] home` incl. `Algolia`.

## 2. What the built site actually loads

Every page (32 of them) loads:

| Asset | Size | Needed? |
|---|---|---|
| `css/bootstrap.min.css` (3.3.2) | 117 KB | Layout grid, navbar, collapse. Replaced by new CSS |
| `css/hugo-theme-cleanwhite.min.css` | 20 KB | Theme look. Replaced |
| `css/font-awesome.all.min.css` (5.15.1) + `webfonts/` | 59 KB + fonts | Footer social icons, rss icon. Replace with 3 inline SVGs |
| `css/zanshang.css` | small | Reward (WeChat/Alipay) UI. Reward is off; unused |
| `js/jquery.min.js` (2.1.3) | 84 KB | Used by theme JS only |
| `js/bootstrap.min.js` | 35 KB | Navbar collapse only |
| `js/hux-blog.min.js` | small | Navbar behavior, scroll |
| `js/lazysizes.min.js` | 8 KB | Lazy loading; native `loading="lazy"` replaces it |
| `css/guyheckman_me-custom.css` | small | Series styles. Keep |

Also on every page: an inline `fastclick` loader from `cdn.jsdelivr.net` (obsolete since 2014-era mobile browsers) and the Google Analytics gtag snippet (GA4 `G-XVJ8880GDE`; the DNT check is in the emitted script).

Conditionally loaded:

| Asset | When | Notes |
|---|---|---|
| Side catalog (TOC) script + `jquery.nav.js` | pages where `showtoc` is not false (inline in footer) | Rebuild with `{{ .TableOfContents }}` and CSS `position: sticky`; no JS needed |
| `tagcloud` | `#tag_cloud` exists (tags index) | Replace with plain list or CSS-scaled list |
| nanogallery2 3.0.5 + jQuery (jsDelivr) | the 3 gallery posts | See section 4. Note `galleries.html` emits a full `<html><head><body>` inside the post body, which is invalid markup |
| Pagefind UI (`/_pagefind/pagefind-ui.*`) | `/search/` | **Broken today**: no `_pagefind/` directory is produced by a plain `hugo` build, so the search page 404s its assets. Tied to #3 |
| Disqus `embed.js` | posts | Emitted by Hugo's internal Disqus template. `disqusShortname = "/guyheckman-me"` has a leading slash, which looks like a typo. **Unconfirmed that comments work live.** Decide keep or drop |
| iDisqus, giscus, Twikoo, leancloud, Baidu push/Tongji, PlantUML | only if params set | None set. All dead code for this site |
| Mindmap (kity, kityminder), PhotoSwipe, bilibili, reward | only via their shortcodes/params | No content uses them |

Bundled but never referenced by any built page: `kity.min.js`, `kityminder.core.min.js`, `mindmap.*`, `iDisqus.*`, `jquery.js`, `jquerymigrate.js`, `production.min.js`, `bootstrap.js`, `style.css`, `custom.css`, `hugo-easy-gallery.css`, `eac.min.json`, reward images. About 1.1 MB of JS and 1.3 MB of CSS ship in `public/` because Hugo copies the whole theme `static/` folder.

## 3. Theme templates in play

Theme has 38 layout files (about 1,950 lines; `footer.html` alone is 445 lines of near-identical social-icon blocks).

| Used by this site | Theme file |
|---|---|
| Home (paginated, 5 per page) | `index.html`, `partials/posts.html`, `post_list.html`, `pagination.html`, `sidebar.html`, `header.html` |
| Post | `_default/single.html` (overridden), `partials/comments.html` |
| About (`layout: page`) | `_default/page.html` |
| Archive (`layout: archive`, `type: archive`) | `_default/archive.html` |
| Search | `search/list.html`, `partials/search-pagefind.html` |
| Taxonomy pages | `taxonomy/category.html`, `tag.html`, `terms.html`, site `series.html` (all via `partials/category.html`) |
| 404 | `404.html` |
| Every page | `baseof.html` (overridden), `head.html` (overridden), `nav.html` (overridden), `footer.html` |

Not used by this site: `section.html`, `top.html`, `top/single.html`, `portfolio.html`, `reward.html`, `page_view_counter.html`, `multilingual-sel.html`, `search-algolia.html`, shortcodes `bilibili`, `figure`, `mind`, `notice`, `post-image`, `rawhtml`, `load-photoswipe*`, and the render-image hook (check this one: images with a title may rely on it).

Sidebar content: avatar, about text, featured tags, categories/tags list, bookmark and friend links (both off).

## 4. What content requires from a theme

Front matter in use (11 posts and pages): `title`, `subtitle`, `date`, `description`, `author`, `slug`, `image`, `showtoc`, `categories`, `tags`, `series` (3 posts, one series: "How I Built This Site"), plus `layout`/`type` on About and Archive and `draft` on 3 drafts.

Shortcodes in content: `gallery` (38 uses), `galleries` (6), `embed` (2), `youtube` (9, Hugo built-in), `relref` (1, built-in).

Images are SmugMug-hosted (47 `photos.smugmug.com` URLs); the site has no local images. Header image comes from the `image` param or `header_image`. Size is chosen by the `-X2`/`-X3`/`-XL` suffix in the URL (undocumented, see docs/ gap).

Output formats: HTML, home RSS (`index.xml`), sitemap, plus the unused `algolia.json`.

## 5. URL parity checklist

The new theme must reproduce these. Built sitemap has 30 URLs, matching the live sitemap.

- `/`, `/index.xml`, `/sitemap.xml`
- `/about/`, `/archive/`, `/search/`
- Posts at `/post/<year>/<slug>/` (note: the year directory comes from the path, slug from front matter). Posts built: 2023 x4, 2025 x4.
- Taxonomies: `/categories/` (+3 terms: life, photos, tech), `/tags/` (+about 9 terms; `preserveTaxonomyNames = true` is why `food--drinks` looks the way it does), `/series/` (+`how-i-built-this-site`)
- Pagination: `/page/2/` etc. plus 15 redirect aliases `/<section>/page/1/` produced by Hugo
- `/404.html`

Regenerate the exact list with `hugo --destination <scratch>` and compare `sitemap.xml` against `docs/retheme/` baseline once one is saved (not yet done).

## 6. Findings worth acting on

1. `/search/` references Pagefind assets that are not built. Search is effectively broken until #3 lands.
2. Disqus loads on posts with a probably wrong shortname (`/guyheckman-me`). Confirm whether comments are wanted before deciding what to port.
3. The Algolia output, verification meta, and nav stub are leftovers; the 2023-era `algolia.json` is still published.
4. `galleries.html` outputs a nested `<html>` document in post bodies and loads jQuery plus nanogallery2 from a CDN on top of the theme's own jQuery.
5. The footer script loads FastClick from a CDN on every page; it has no purpose on modern mobile browsers.
6. The theme ships roughly 2.4 MB of unused or dead CSS/JS into `public/` regardless of what pages use.
7. The `showtoc` side catalog depends on jQuery plus `jquery.nav.js` (scrollspy); can become `.TableOfContents` with sticky CSS.
8. `custom_css` is rendered with `absURL`, so the stylesheet link is absolute (`https://guyheckman.me/css/...`) even in local builds. A local preview therefore pulls CSS from the live site.

## 7. Open questions for the decision records

- Keep Disqus comments, or drop them (no comments is the zero-dependency answer)?
- Keep the left/right sidebar (avatar, about, tags) or fold it into the header and About page?
- Is the side TOC worth keeping on long posts? The new layout can render it without JS.
- Keep nanogallery2 (jQuery dependency, CDN), switch to PhotoSwipe, or a CSS grid with a native `<dialog>` lightbox? The 38 `gallery` shortcode calls give the data format to preserve.
- Are the social icons just RSS, LinkedIn, and GitHub? That reduces Font Awesome to three inline SVGs.
