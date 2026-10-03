# Retheme decision records (issue #4)

Started 2026-10-01 on branch `feature/retheme` in the site repo. Evidence is in
[clean-white-inventory.md](clean-white-inventory.md); the chosen layout mockup is
[mockups/directions/direction-c-v3.html](mockups/directions/direction-c-v3.html) (see [mockups/README.md](mockups/README.md)).
Last updated 2026-10-02.

**Status key:** `Decided` = confirmed by Guy. `Provisional` = implemented or implied by an accepted mockup but not
explicitly confirmed. `Proposed` = options written, awaiting a decision. `TBD` = deferred. Each record leads with
the current decision; the options and reasoning are kept below it as background.

| # | Decision | Status | Outcome |
|---|---|---|---|
| D1 | Starting point | Decided | New theme from scratch, using Clean White as the baseline |
| D2 | Name and location | Decided | "The Blues", its own repo `cyvaquero/hugo-theme-theblues`, cloned at `themes/hugo-theme-theblues/` |
| D3 | CSS approach and tooling | Decided | Hand-written CSS, one commented source, no old stylesheets or imports; Hugo Pipes minifies it for production, no Node |
| D4 | Palette and design basics | Decided | Palette B, light and dark, responsive with a hamburger nav |
| D5 | Sidebar and bio | Decided | Drop the sidebar and the bio from the landing page; the bio lives on the About page only |
| D6 | Table of contents | Decided | Keep, rendered by Hugo, no JavaScript |
| D7 | Gallery component | Decided | Masonry for photo posts plus a native `<dialog>` lightbox, no library (as in the chosen mockup) |
| D8 | Comments | Decided | Disqus on blog posts only; drop on pages |
| D9 | Social links and icons | Decided | Three inline SVGs with text labels: RSS, LinkedIn, GitHub; no icon font |
| D10 | Search UI | Decided | Engine chosen in #3; layout reserves a slot |
| D11 | Analytics | Decided | Keep GA4 with Do Not Track |
| D12 | Home and post layout | Decided | Direction C v3: masonry, calm popover controls, A+ hero, serif headlines |
| D13 | License | Decided | Apache-2.0, with a NOTICE crediting Clean White and its upstreams |
| D14 | Featured tags | Decided | A minimalist tag cloud in a right column on the home page (stacks above the type chips on small screens) |

---

## D1. Starting point

**Decision (2026-10-01): start from scratch, using Clean White as the baseline.** Reproduce the current look and behavior as
the reference, then replace the implementation. Keep what the inventory shows the site uses (header image, post list, post
layout, series, archive, taxonomies); leave out the Bootstrap/jQuery stack and unused features.

Background: forking Clean White would keep Bootstrap 3, jQuery and a 445-line footer; adopting another theme would swap
one upstream for another and turn series, galleries and SmugMug needs into overrides again. The site uses well under
half of Clean White's roughly 1,950 template lines. Consequence: more up-front work; the template count drops from 38
files to roughly a dozen.

## D2. Name and location

**Decision (2026-10-02): the theme is called "The Blues". It is its own repo, `cyvaquero/hugo-theme-theblues`, cloned at
`themes/hugo-theme-theblues/` inside the site project.** `config.toml` will use `theme = "hugo-theme-theblues"` and
`theme.toml` carries the display name. The directory follows Clean White's `hugo-theme-<name>` convention.

- The nested clone is **untracked in the site repo** and is not wired in until the theme is released. At release it becomes a
  submodule, replacing `themes/hugo-theme-cleanwhite` in `.gitmodules`. Do not `git add` it from the site repo before then.
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
  content-hash file name. It is the same in production and development environments; the `--minify` build flag only affects HTML.
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

- Featured tags, which used to sit in the sidebar, now live in a tag-cloud-only right column on the home page; see D14. That
  column holds nothing else (no bio, no categories).
- Categories are reachable through the taxonomy pages and the browse controls (type chips), so no categories box is carried over.
- Config consequence: `sidebar_avatar`, `sidebar_about_description`, `omit_categories`, `friends` and `bookmarks` become unused
  and are removed from `config.toml` at switch-over; `featured_tags` and `featured_condition_size` are reused by D14 once the tag cloud is built.
- The scaffold's sidebar (partial, CSS and the `sidebar_*`, `omit_categories`, `featured_*` reads) was removed on 2026-10-02, so the
  home page is a plain post list until the D12 layout and the D14 tag cloud are built.

## D6. Table of contents

**Decision (2026-10-01): keep.** Render with Hugo's `.TableOfContents`, sticky beside the post on wide screens and stacked on
small ones, CSS only. `showtoc` front matter is unchanged.

## D7. Gallery component

**Decision (2026-10-03): masonry for photo posts with a native `<dialog>` lightbox**, as in the chosen mockup (D12). CSS columns keep
each photo's true proportions; the lightbox has previous/next, arrow keys, a counter, Esc to close and focus return, and uses no
jQuery or library. Keep the existing shortcode syntax so no content changes: `{{< galleries >}}` wrapping
`{{< gallery src= title= >}}`, plus `embed`. The scaffold's current shortcodes use a CSS grid with the same lightbox; the masonry
layout replaces the grid when the D12 layout is built.

Open points: SmugMug size variants are chosen from the URL suffix (X2, X3, XL), which the local docs do not cover, so thumbnails
currently load X2 and the lightbox X3; confirm Guy does not rely on nanogallery2's download and zoom buttons (they are dropped).
Background: 38 `gallery` calls in 6 `galleries` blocks across 3 posts and 2 `embed` iframes; the old shortcode emitted a nested
`<html>` document. CSS columns fill top to bottom, so reading order is column-wise.

## D8. Comments

**Decision (2026-10-01): keep Disqus on blog posts, drop it on pages** (About, Archive, Search, taxonomy pages). Clean White
includes comments on pages and term lists too, so this is a change; in The Blues only the post template includes them.

Open: `disqusShortname` is `/guyheckman-me` with a leading slash, which looks wrong. Check the real shortname in the Disqus
admin before release, and confirm whether any real comments exist on the live site (export them first if so).

## D9. Social links and icons

**Decision (2026-10-03): inline SVG icons** for the links that are set (RSS, LinkedIn, GitHub) in a footer partial, each with a visible
text label, driven by the existing `params.social` keys. The SVGs are `aria-hidden`, use `currentColor`, and take the nav and
footer hover color `#D2C1B6`. Font Awesome (about 59 KB of CSS plus webfonts) is dropped, and no icon font or icon image files
are used. The scaffold already does this (`layouts/_partials/social.html`).

## D10. Search UI

**Decision (2026-10-01): the engine is chosen in issue #3.** The theme has a search page template and a nav slot behind a
`search_enabled` param (off). `/search/` is currently broken in the Clean White build because it references Pagefind assets
that a plain `hugo` build does not produce. Pagefind needs a post-build step in both `deploy_live.sh` and CodeBuild; the
Hugo-index options (Lunr, MiniSearch, Fuse.js) do not.

## D11. Analytics

**Decision (2026-10-01): keep GA4** (`G-XVJ8880GDE`) through Hugo's internal template with `respectDoNotTrack = true`.

## D12. Home and post layout

**Decision (2026-10-02): Direction C v3.** Mockup: [mockups/directions/direction-c-v3.html](mockups/directions/direction-c-v3.html).

- **Home:** the A+ hero (header photo under a navy scrim, "guyheckman.me" kicker, "Life, *lived.*" with a decorative sand wavy
  underline, tagline), then the browse controls, then a **masonry** wall mixing photos and article tiles. No sidebar, no author strip and no bio
  (see D5); the only right-column content is the tag cloud from D14.
- **Tiles that differ by shape, icon and label, not just color:** photo tiles are image-only with a camera badge and a caption
  ("Boston gallery · 6 photos") on hover or focus, always visible on touch. Article tiles are text tiles with a sand left bar,
  an ARTICLE label with a document icon, a serif title, an excerpt, date and tags, and a "Part N of 3" chip for series posts.
- **Controls (calm Popover layout):** type chips with counts (All / Articles / Photos), one quiet "View options" button with a
  badge for non-default settings, a Clear link only when something changed, and a muted live caption. The popover holds
  Mode (Filter hides, Highlight dims the other type to 35% and outlines matches), Sort (Newest, Oldest, Galleries first,
  Articles first), Group by gallery, and Reset. It closes on Esc and outside click.
- **Typography:** system serif stack (Georgia, "Iowan Old Style", "Times New Roman", serif) for the hero, post and article
  titles, article tile titles, group headings, series titles and the nav brand; system sans for everything else.
- **Photo post:** hero with the gallery cover photo, masonry gallery, lightbox, series box, previous/next post links.
  **Article:** hero, serif title, sticky table of contents, series box ("Part 3 of 3"), Disqus placeholder.
- Hamburger nav below 820 px, light/dark, pagination, footer with text links.

Rejected or set aside: **A** and **A+** (card grid, featured strip, Posts|Photos toggle, series dots, themed 404; ideas worth
revisiting are listed in [mockups/README.md](mockups/README.md)); **B** (editorial, dropped); controls layouts 2 (left panel),
3 (right panel) and 4 (minimal gear) from `direction-c-plus-controls.html`; the author strip under the hero (removed).

Not yet implemented (the scaffold still has a simple list home): the masonry wall, tile types, filter, highlight, sort and
group controls, and the popover. Implementation notes for later: the photo/article split needs a rule (for example the
`photos` category or presence of a `galleries` shortcode); group by gallery needs per-photo gallery and date data (front
matter or build-time parsing of the shortcodes); CSS columns fill top to bottom, so reading order is column-wise; the
controls need data attributes on tiles and a small JS file; chips and "View options" are 32 px tall in the mockup (44 px
targets on phones is a one-line change); keyboard tab-through, reduced-motion emulation and a screen-reader pass are untested.

## D13. License

**Decision (2026-10-02): Apache-2.0**, because The Blues started from Clean White (Apache-2.0). The theme repo has `LICENSE`
(upstream's text, which carries Clean White's copyright line "2018-2019 Huabing Zhao") and a `NOTICE` that credits Clean White,
Huxblog and Clean Blog, and the cavelab.dev series snippet (license unknown). The layout has since been reworked.

---

## D14. Featured tags

**Decision (2026-10-02): move the featured tags into a right column as a minimalist tag cloud.** This replaces the three
"Browse by tag" strip styles that were mocked up (pills, image tiles, tiles plus pills). Mockup:
`mockups/directions/direction-c-v3-cloud.html`.

- **Right column, tags only:** the home page has one right column that holds only the tag cloud. There is still no bio,
  author strip or categories box (D5). On desktop the column (about 13.5 rem) is sticky beside the controls and the masonry
  wall. **The wall keeps three columns of tiles** from 1100 px wide up, by widening the page container to 86 rem (tiles are
  about 318 px at 1280 px wide and 258 px at 1100 px); between 900 and 1099 px it uses two columns, and below 900 px one
  column with the cloud moved above the type chips as a compact wrapped list, so nothing is hidden. The photo post and tag page
  use the same wider container.
- **Minimalist cloud:** plain text links only (no pills, borders or icons), sized in about three steps by post count, with the
  count in each link's accessible name (for example "travel, 3 posts") so size is not the only signal. Links navigate to tag
  pages; an "All tags" link opens an A-Z index. Tags are real links in a labeled `nav` with visible focus and large enough
  touch targets.
- **Which tags:** "featured" means tags used by more than one post (currently hugo, markdown, photography, travel, git). The
  mockup also lets you view all 10 tags, with single-post tags smallest, to compare.

Background (research, 2026-10-02; page text only, so the big sites' layout and accessibility details are unverified): Unsplash
puts a text topics row above the grid and navigates to topic pages; Pexels uses chips with thumbnails and counts plus "See
more"; Dribbble shows a ranked top 12 with an A-Z index; Ghost's Array theme shows image-backed tag cards with pinned order;
small photographer sites use a few hand-named genres. The research flagged a side column as weak against a wide masonry wall and
hidden on mobile; the stacked mobile placement above addresses the second point, and the widened container keeps the wall at three columns on common desktop widths.

Open: the exact size steps and muted color for single-post tags (contrast must stay at 4.5:1), whether "All tags" shows
single-post tags in the cloud by default, and the cap if the featured list grows. Alternatives set aside: the pills, image tiles
and tiles-plus-pills strips (mocked in `direction-c-v3-tags.html`).

## Out of scope for the theme

- Content, front matter and slugs stay unchanged (the content repo is not touched).
- URL structure stays unchanged; see the parity checklist in the inventory (30 sitemap URLs).
- Deploy scripts change only if D3 or D10 introduces a build step.

## Open items before release

- **No release yet.** A 0.5.0 release branch was prepared and dropped (merged to `develop` only; no tag, `main` untouched). The first release waits for the D12 home layout and the D14 tag cloud to be built.
- Settle D14's open details (size steps, which tags show).
- Fix or confirm the Disqus shortname (D8).
- Implement the D12 home layout in the theme; favicon; tablet-width and keyboard/accessibility checks.
- Wire the theme into the site (submodule, `config.toml`, drop the Algolia output format, the site's `layouts/` overrides and
  its `static/css/guyheckman_me-custom.css` (the series styles already live in the theme's `main.css`), update README/CLAUDE/CHANGELOG), compare the build's sitemap with the current 30 URLs.

## Changelog of this file

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
