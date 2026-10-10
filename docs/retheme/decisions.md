# Retheme decision records (site issue #4)

Started 2026-10-01 on branch `feature/retheme` in the site repo (since merged and deleted). Evidence is in
[clean-white-inventory.md](clean-white-inventory.md); the current consolidated mockup is
[mockups/directions/direction-c-final.html](mockups/directions/direction-c-final.html) (see [mockups/README.md](mockups/README.md)).
Last updated 2026-10-10.

Issue references: "site issue #N" is in the site repo (`cyvaquero/hugo-site-guyheckman_me`); a bare `#N` is in this theme
repo (for example `#10`, the release tracker).

**Status key:** `Decided` = confirmed by Guy. `Provisional` = implemented or implied by an accepted mockup but not
explicitly confirmed. `Proposed` = options written, awaiting a decision. `Deferred` and `TBD` = postponed. Each record leads with
the current decision; the options and reasoning are kept below it as background.

| # | Decision | Status | Outcome |
|---|---|---|---|
| D1 | Starting point | Decided | New theme from scratch, using Clean White as the baseline |
| D2 | Name and location | Decided | "The Blues", its own repo `cyvaquero/hugo-theme-theblues`, cloned at `themes/hugo-theme-theblues/` |
| D3 | CSS approach and tooling | Decided | Hand-written CSS, one commented source, no old stylesheets or imports; Hugo Pipes minifies it for production, no Node |
| D4 | Palette and design basics | Decided | Palette B, light and dark (system setting, or the switch in D15), responsive with a hamburger nav |
| D5 | Sidebar and bio | Decided | Drop the sidebar and the bio from the landing page; the bio lives on the About page only |
| D6 | Table of contents | Decided | Keep, rendered by Hugo, no JavaScript |
| D7 | Gallery component | Decided | Masonry for photo posts plus a native `<dialog>` lightbox, no library (as in the chosen mockup) |
| D8 | Comments | Decided | Disqus on blog posts only, click to load since 1.2.0; drop on pages |
| D9 | Social links and icons | Decided | Three inline SVGs with text labels: RSS, LinkedIn, GitHub; no icon font |
| D10 | Search UI | Decided | Engine chosen in site issue #3; layout reserves a slot |
| D11 | Analytics | Decided | GA4 through the theme's own loader, which always honors Do Not Track and Global Privacy Control (since 1.2.0; was Hugo's internal template) |
| D12 | Home and post layout | Decided | Direction C v3: masonry, calm popover controls, A+ hero, serif headlines |
| D13 | License | Decided | Apache-2.0, with a NOTICE crediting Clean White and its upstreams |
| D14 | Featured tags | Deferred | The tag cloud is dropped from the home page for now; revisit later. Tags stay reachable through tag links and tag pages |
| D15 | Color theme switch | Decided | System, Light and Dark buttons in the nav; the choice is kept in `localStorage` (since 1.2.0) |

---

## D1. Starting point

**Decision (2026-10-01): start from scratch, using Clean White as the baseline.** Reproduce the current look and behavior as
the reference, then replace the implementation. Keep what the inventory shows the site uses (header image, post list, post
layout, series, archive, taxonomies); leave out the Bootstrap/jQuery stack and unused features.

Background: forking Clean White would keep Bootstrap 3, jQuery and a 445-line footer; adopting another theme would swap
one upstream for another and turn series, galleries and SmugMug needs into overrides again. The site uses well under
half of Clean White's roughly 1,950 template lines. Consequence: more up-front work. (The original estimate was "roughly a
dozen" templates; the 1.0.0 theme has about 40 layout files, most of them small partials.)

## D2. Name and location

**Decision (2026-10-02): the theme is called "The Blues". It is its own repo, `cyvaquero/hugo-theme-theblues`, cloned at
`themes/hugo-theme-theblues/` inside the site project.** `config.toml` will use `theme = "hugo-theme-theblues"` and
`theme.toml` carries the display name. The directory follows Clean White's `hugo-theme-<name>` convention.

- The theme is a **submodule of the site repo** (added 2026-10-03, branch `develop`) and is wired into the site's `develop`.
  Commit and push in the theme repo first, then commit the updated pointer in the site repo. Do not merge the site's
  `develop` to `main` until the theme is released (issue #10).
- The theme repo uses git-flow; its work is on `develop`. Pushes are Guy's.
- Earlier text in this file said the theme would live inside the site repo; that was superseded when Guy created the
  separate GitHub repo.

## D3. CSS approach and tooling

**Decision (2026-10-02): hand-written CSS only.** One commented, readable source file (`assets/css/main.css` in the theme), with
no framework, no `@import`, and no old or third-party stylesheets (Clean White's Bootstrap, Font Awesome and theme CSS are not
carried over, and the site's `static/css/guyheckman_me-custom.css` is retired at switch-over). The readable copy is the
source of truth; the site uses a minified copy.

- **Hugo can do the minifying dynamically**, so no extra tooling is needed. Checked on Hugo 0.167.0: piping the source through
  Hugo Pipes `minify | fingerprint` turned 8,578 bytes with 10 comment blocks into a 7,104-byte file with no comments and a
  content-hash file name. The `--minify` build flag only affects HTML; whether CSS and JS are minified is decided by the partial
  below.
- **Production vs development:** `layouts/_partials/asset.html` returns the minified, fingerprinted resource in production
  builds (`hugo`) and the readable commented source in development (`hugo server`), so debugging stays easy. The JavaScript files
  use the same partial.
- Considered and not chosen: Sass or a utility framework, which would add a second toolchain to `deploy_live.sh` and
  CodeBuild for little gain. Native nesting and custom properties are available.
- Consequence: no `package.json`; extended Hugo stays pinned in CI.

## D4. Palette and design basics

**Decision (2026-10-02): palette B.** Navy `#1B3C53`, steel blue `#456882`, sand `#D2C1B6`, cream `#F9F3EF`, with light and dark
modes (`prefers-color-scheme`). Colors are custom properties in one place, so a palette change is a token change.
Palettes A, C (dropped) and D were compared in mockups and not chosen.

**Superseded in part (1.2.0, #22):** the mode follows `prefers-color-scheme` only until the reader picks Light or Dark
with the switch in the nav; see D15. The dark tokens are listed twice in `main.css`, once for each way of asking for dark.

| Role | Light mode | Dark mode |
|---|---|---|
| Page background | `#F9F3EF` | `#142E40` |
| Body text | `#1B3C53` (10.5:1) | `#F9F3EF` (12.8:1) |
| Links, accents | `#456882` (5.37:1) | `#D2C1B6` (8.1:1) |
| Header band, footer | `#1B3C53` with `#F9F3EF` text | `#0F2332` |
| Borders, quiet surfaces | `#D2C1B6` | `#456882` (decorative only; never used for text) |

Requirements added 2026-10-02:
- **Responsive**, mobile-first, no horizontal scroll from phone to wide desktop. The top nav collapses into a hamburger
  button with a dropdown below 820 px (it does not wrap). Check at 375 px and 768 px.
- **Nav and footer link hover and focus** color is `#D2C1B6` in both modes, with a visible focus outline.
- Palette D is the weakest on contrast (steel on pale is 4.3:1); palette A has little range; C leans indigo.

## D5. Sidebar and bio

**Decision (2026-10-02): drop the sidebar and the bio from the landing page.** This reverses the earlier 2026-10-01 decision
to keep the sidebar there. The layout chosen in D12 has no sidebar, and the author strip that briefly replaced it was removed.
The author's bio and photo live on the About page only.

- Featured tags, which used to sit in the sidebar, have no place on the home page for now: the tag cloud that was going to
  replace the sidebar is deferred (D14). The home page has no right column at all.
- Categories are reachable through the taxonomy pages and the browse controls (type chips), so no categories box is carried over.
- Config consequence: `sidebar_avatar`, `sidebar_about_description`, `omit_categories`, `friends` and `bookmarks` become unused
  and were removed from `config.toml` at switch-over, along with `featured_tags` and `featured_condition_size` (D14).
- The scaffold's sidebar (partial, CSS and the `sidebar_*`, `omit_categories`, `featured_*` reads) was removed on 2026-10-02; the
  D12 layout has since replaced the interim plain post list.

## D6. Table of contents

**Decision (2026-10-01): keep.** Render with Hugo's `.TableOfContents`, sticky beside the post on wide screens and stacked on
small ones, CSS only. `showtoc` front matter is unchanged.

## D7. Gallery component

**Decision (2026-10-03): masonry for photo posts with a native `<dialog>` lightbox**, as in the chosen mockup (D12). CSS columns keep
each photo's true proportions; the lightbox has previous/next, arrow keys, a counter, Esc to close and focus return, and uses no
jQuery or library. Keep the existing shortcode syntax so no content changes: `{{< galleries >}}` wrapping
`{{< gallery src= title= >}}`, plus `embed`. The galleries shortcode emits a CSS-columns masonry (`.mas.gal`); the earlier
scaffold's CSS grid is gone.

Follow-ups (not blocking the release): SmugMug size variants are chosen from the URL suffix (X2, X3, XL), which the local docs do
not cover, so thumbnails load X2 and the lightbox X3; nanogallery2's download and zoom buttons are dropped (restore only if
missed).
Background: 38 `gallery` calls in 6 `galleries` blocks across 3 posts and 2 `embed` iframes; the old shortcode emitted a nested
`<html>` document. CSS columns fill top to bottom, so reading order is column-wise.

## D8. Comments

**Decision (2026-10-01): keep Disqus on blog posts, drop it on pages** (About, Archive, Search, taxonomy pages). Clean White
includes comments on pages and term lists too, so this is a change; in The Blues only the post template includes them.

**Update (1.2.0, #16):** comments are click to load. Posts show a "Show comments" button, and nothing from Disqus is
requested until it is clicked; `assets/js/comments.js` replaces Hugo's internal template. Hugo's
`[privacy.disqus] disable = true` turns comments off (#72).

Site-side follow-up (not a theme change, tracked in site issue #7): the site's `[services.disqus] shortname` is
`/guyheckman-me` with a leading slash, which looks wrong. Check the real shortname in the Disqus admin, and confirm whether any
real comments exist on the live site (export them first if so).

## D9. Social links and icons

**Decision (2026-10-03): inline SVG icons** for the links that are set (RSS, LinkedIn, GitHub) in a footer partial, each with a visible
text label, driven by the existing `params.social` keys. The SVGs are `aria-hidden`, use `currentColor`, and take the nav and
footer hover color `#D2C1B6`. Font Awesome (about 59 KB of CSS plus webfonts) is dropped, and no icon font or icon image files
are used. The scaffold already does this (`layouts/_partials/social.html`).

## D10. Search UI

**Decision (2026-10-01): the engine is chosen in site issue #3.** The theme has a search page template and a nav slot behind a
`search_enabled` param (off). `/search/` is currently broken in the Clean White build because it references Pagefind assets
that a plain `hugo` build does not produce. Pagefind needs a post-build step in both `deploy_live.sh` and CodeBuild; the
Hugo-index options (Lunr, MiniSearch, Fuse.js) do not.

## D11. Analytics

**Decision (2026-10-01): keep GA4** (`G-XVJ8880GDE`) through Hugo's internal template with `respectDoNotTrack = true`.

**Superseded (1.2.0, #16):** Hugo's internal template is no longer used. `assets/js/analytics.js` loads GA4 in
production builds only, and loads nothing (no gtag.js request and no hit) for a visitor who sends Do Not Track or Global
Privacy Control, whatever the site's `respectDoNotTrack` says. `[privacy.googleAnalytics] disable = true` still leaves it
out.

Note (2026-10-04 review): with Hugo's template, Do Not Track only skips the `gtag('config')` call; the gtag loader script is still
requested from Google. A stricter privacy setup is tracked in this repo's issue #16.

## D12. Home and post layout

**Decision (2026-10-02): Direction C v3.** Mockup: [mockups/directions/direction-c-v3.html](mockups/directions/direction-c-v3.html).

- **Home:** the A+ hero (header photo under a navy scrim, "guyheckman.me" kicker, "Life, *lived.*" with a decorative sand wavy
  underline, tagline), then the browse controls, then a **masonry** wall mixing photos and article tiles. No sidebar, no right column, no author strip and no bio
  (see D5). The wall is **three columns** of tiles from 900 px wide, two from 560 px, and one below that, in the normal page
  container (about 72 rem), with the controls row above it.
- **Tiles that differ by shape, icon and label, not just color:** photo tiles are image-only with a camera badge and a caption
  ("Boston gallery · 6 photos") on hover or focus, always visible on touch. Article tiles are text tiles with a sand left bar,
  an ARTICLE label with a document icon, a serif title, an excerpt, date and tags, and a "Part N of 3" chip for series posts.
- **Controls (calm Popover layout):** type chips with counts (All / Articles / Photos), one quiet "View options" button with a
  badge for non-default settings, a Clear button only when something changed, and a muted live caption. The popover holds
  Mode (Filter hides, Highlight dims the other type and outlines matches), Sort (Newest, Oldest, Galleries first,
  Articles first), Group by gallery, and Reset. It closes on Esc and outside click.
  (Updated for #3: Highlight turns the other type gray and fades only its photos to 35%, so their text keeps full
  contrast; fading whole tiles to 35% left text at 1.66:1.)
- **Typography:** system serif stack (Georgia, "Iowan Old Style", "Times New Roman", serif) for the hero, post and article
  titles, article tile titles, group headings, series titles and the nav brand; system sans for everything else.
- **Photo post:** hero with the gallery cover photo, masonry gallery, lightbox, series box, previous/next post links.
  **Article:** hero, serif title, sticky table of contents, series box ("Part 3 of 3"), Disqus placeholder.
- Hamburger nav below 820 px, light/dark, pagination, footer with text links.

Rejected or set aside: **A** and **A+** (card grid, featured strip, Posts|Photos toggle, series dots, themed 404; ideas worth
revisiting are listed in [mockups/README.md](mockups/README.md)); **B** (editorial, dropped); controls layouts 2 (left panel),
3 (right panel) and 4 (minimal gear) from `direction-c-plus-controls.html`; the author strip under the hero (removed).

**Implemented (2026-10-03; built on `feature/masonry-home`, merged to `develop`).** The photo/article split is: categories include `photos`
(case-insensitive) or the raw content uses the `galleries` shortcode. Each photo post emits one tile per photo, parsed from its
`gallery` shortcodes (first 4 photos per gallery plus one "see all" tile linking to the gallery post when photos remain); each
article emits one text tile. Tiles carry data attributes (`data-type`, `data-date`, `data-order`,
plus `data-gallery` and `data-gallery-title` on photos, and `data-more` on see-all tiles; `data-series` was dropped) that `wall.js` uses for the chips, filter or highlight, sort and
group by gallery. Verified in headless Chrome: three columns at 1280 px, two at 700 px, one at 375 px, no horizontal overflow at
375 px, the controls and lightbox work, and the build keeps the 30 sitemap URLs (with no warnings since the site dropped the
search-index output format).
The wall paginates **by tile**, 24 per page, so chip counts, the caption and group-by are per page (today's 5 articles and 3
galleries make 20 tiles, one page); see-all tiles are excluded from the counts. Known limits: pagination uses a workaround because
Hugo's `.Paginate` only accepts pages; CSS columns fill top to bottom, so reading order is column-wise;
`.highlight` code blocks keep the highlighting style's colors in both modes unless the site sets
`[markup.highlight] noClasses = false`, which makes them follow light and dark (since 1.2.0, #5). Reduced motion is handled. Touch devices and screen readers are untested on real
hardware; keyboard behavior and contrast were measured in the October 2026 independent review, whose findings are open issues. Chips and "View options" are 32 px tall on fine pointers and 44 px on coarse pointers.

## D13. License

**Decision (2026-10-02): Apache-2.0**, because The Blues started from Clean White (Apache-2.0). `LICENSE` is the standard
Apache-2.0 text with "Copyright 2026 Guy Heckman" (2026-10-04; it was previously Clean White's file, appendix and third-party
notes included). `NOTICE` credits Clean White and its upstreams, Huxblog and Clean Blog. An independent review (2026-10-04)
found that only a few generic lines of Clean White remain, and that the series partials share only the approach, not code, with
the cavelab.dev article, so NOTICE credits it as an inspiration.

---

## D14. Featured tags

**Status: Deferred (2026-10-03). The tag cloud is dropped from the home page for now and will be revisited at a later point.** The home
page returns to the plain full-width three-column masonry wall (D12). Nothing about featured tags is built or mocked in the current
mockup.

- Tags are still reachable: tag links on article tiles and in posts open the tag pages, `/tags/` lists every tag (an A-Z index), and the
  type chips and browse controls (D12) handle filtering the wall.
- Config consequence: `featured_tags` and `featured_condition_size` were removed from the site config.
- The deferral reverses the 2026-10-02 decision to put a minimalist tag cloud in a right column (stacked above the type chips on small
  screens, with the wall widened to 86 rem to keep three columns). That design is kept as history in
  `mockups/directions/direction-c-v3-cloud.html`; the strip styles (pills, tiles, tiles plus pills) are in `direction-c-v3-tags.html`.

Background kept for when this is revisited (research, 2026-10-02; page text only, so the big sites' layout and accessibility details
are unverified): Unsplash puts a text topics row above the grid and navigates to topic pages; Pexels uses chips with thumbnails and
counts plus "See more"; Dribbble shows a ranked top 12 with an A-Z index; Ghost's Array theme shows image-backed tag cards with pinned
order; small photographer sites use a few hand-named genres. The research flagged a side column as weak against a wide masonry wall,
and a single-line scrolling row as hiding items. Open questions for later: where tags live on a wall-first page, how many to feature,
and how to size them while keeping every tag's contrast at 4.5:1.

## D15. Color theme switch

**Decision (released in 1.2.0, #22): a System / Light / Dark switch in the nav.** Three icon buttons with
`aria-pressed`, inline from 821 px and inside the hamburger menu below that. System, the default, follows
`prefers-color-scheme`; Light or Dark sets `data-theme` on `<html>` and is kept in `localStorage` under `theme` (System
removes it). `assets/js/theme.js` is a small blocking script in `<head>`, so a picked mode applies before the first paint
without an inline script; it also updates the `color-scheme` and `theme-color` metas, keeps other open tabs in step and
reloads loaded Disqus comments. Without JavaScript the switch is hidden and the mode follows the system. Every computed
color in a picked mode matches the same mode chosen by the system, so the measured contrast carries over.

## Out of scope for the theme

- Content, front matter and slugs stay unchanged (the content repo is not touched).
- URL structure stays unchanged; see the parity checklist in the inventory (30 sitemap URLs).
- Deploy scripts change only if D3 or D10 introduces a build step.

## Status at release (1.0.0)

- Done: the D12 layout is built, independently reviewed (2026-10-04) and wired into the site's `develop` (submodule,
  `config.toml`, search output format and site overrides removed, Clean White removed; 30 sitemap URLs unchanged). An earlier
  0.5.0 release branch was dropped without a tag.
- Deferred: D14 (featured tags).
- Follow-ups after release, tracked as issues in this repo: favicon (#1), accessibility and device checks (#3, #4, #19), the
  review's bug and security findings, and the Disqus shortname on the site side (D8).

## Changelog of this file

- 2026-10-10: superseding notes for D4 (the switch), D8 (click to load, `privacy.disqus.disable`), D11 (the theme's own
  GA loader, DNT and GPC always honored) and D12 (Highlight, `data-series`, code blocks in dark mode); added D15, the
  color theme switch (#81).
- 2026-10-04: release prep: D13 updated for the new LICENSE and NOTICE; stale "until D12 is built" text, the D7 grid note and
  the open-items list replaced; D11 notes the gtag loader; issue references clarified.
- 2026-10-03: the wall paginates by tile (24 per page) and shows the first 4 photos per gallery plus a see-all tile.
- 2026-10-03: D12 layout implemented in the theme on `feature/masonry-home`; known limits recorded (per-post pagination).
- 2026-10-03: layout merged to `develop`; the theme was added to the site repo as a submodule and wired into its `develop`.
- 2026-10-03: D14 deferred (tag cloud dropped from the home page); the home wall returns to three full-width columns (3 from 900 px, 2 from 560 px, 1 below); D5 and D12 updated to match.
- 2026-10-03: added `direction-c-final.html`, the consolidated mockup of D4 to D14, as the file to implement from.
- 2026-10-03: D7 decided (masonry plus `<dialog>` lightbox) and D9 decided (inline SVG icons with labels); no provisional decisions remain.
- 2026-10-02: the 0.5.0 release was merged back into develop and dropped; the first release now waits for the D12 layout and D14 tag cloud.
- 2026-10-02: home wall keeps three columns beside the tag cloud (container widened to 86 rem; two columns from 900 to 1099 px).
- 2026-10-02: D14 decided (minimalist tag cloud in a right column); D5 and D12 updated to match.
- 2026-10-02: D3 decided (hand-written CSS, readable source, Hugo-minified for production).
- 2026-10-02: D5 decided (drop sidebar and bio); added D14 (featured tags, Proposed).
- 2026-10-02: reorganized so each record leads with its decision; D2 corrected to a separate repo; D5 marked Needs
  confirmation; added D12 (layout) and D13 (license); statuses for D3, D7, D9 set to Provisional.
- 2026-10-02: palette C dropped; D4 confirmed as palette B; responsive and nav-hover requirements; hamburger nav; D2 name.
- 2026-10-01: created; recorded round 1 answers (D1, D5, D6, D8, D10, D11).
