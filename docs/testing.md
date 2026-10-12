# Testing the theme

`exampleSite/` is a small fixture site whose content exercises the cases the guyheckman.me content doesn't: an untitled
post, an undated post, a gallery with commented-out photos, a positional `gallery` call and an untitled photo, a
`{{% galleries %}}` block, the `embed` shortcode, Markdown links and images (including a dropped `javascript:` link),
a series, a code block with line numbers, a post whose headings are all below the TOC levels, a post whose heading holds an external link, with the table of contents on (its names must not include "(opens in a new tab)"; the link's description must), a page without a title, an article with an inline
`gallery`, the legacy `params.addtional_menus` nav, a footer menu, wall pagination past page 1 (`tilesPerPage = 4`), a local header image (`static/img/head.jpg`), and gallery and
hero photos on `photos.smugmug.com`, which make the build read each photo's size and write `width`/`height`, `srcset`,
the hero's smaller sizes and its preload (they need a network the first time; Hugo then keeps them in its cache, and
an offline build leaves those attributes out without a warning). Hugo doesn't use it when the theme is installed in a
site. Build it from that folder:

```bash
cd exampleSite
hugo --panicOnWarning --printPathWarnings --printUnusedTemplates --themesDir ../.. -d /tmp/theblues-after
```

`hugo` builds for production by default (Hugo's `hugo server` uses development), which is what adds the Subresource
Integrity hashes and fingerprinted names. The fixture builds that way, but not minified, so the readable output can be
compared. Also build it minified, as a site is deployed, and the four variants under `exampleSite/variants/`, which
cover paths the base fixture can't hold at the same time: the primary nav from `[[menus.main]]` (the base fixture uses
the legacy `params.addtional_menus`), a second language with a partial translation (`i18n/de.toml`, content in
`content-de/`) that makes the English fallback, the per-language script names and the `theblues-i18n` check run, a
Google Analytics ID, which the theme loads in production builds only, and a right-to-left language (`rtl`: Arabic with
`direction = "rtl"` next to English, #266), whose pages must start `<html lang="ar" dir="rtl">` while the English ones
have no `dir`:

```bash
hugo --minify --panicOnWarning --printPathWarnings --themesDir ../.. -d /tmp/theblues-after-min
for v in main-menu multilingual analytics rtl; do
  hugo --config hugo.toml,variants/$v.toml --minify --panicOnWarning --printPathWarnings --themesDir ../.. -d /tmp/theblues-after-$v
done
```

(`--printUnusedTemplates` is left out of the variants, since each one leaves some templates unused on purpose.)

`--themesDir` must contain the theme as a folder (or link) named `hugo-theme-theblues`, which `../..` is in the site's
submodule checkout. Each build should finish with no warnings, and the first with no unused templates: the warnings the fixtures cause
on purpose are listed in `ignoreLogs` in `exampleSite/hugo.toml`, and any other warning fails it.

The same build with `-b http://127.0.0.1:8099/` (the base URL of the screenshot recipe below) must also pass
`--panicOnWarning`: the fixture's local hero image is the site's own file, so it gets no `theblues-insecure-photo` warning
(#257).

To check that Hugo's cache hints still work with the theme, add `--templateMetrics --templateMetricsHints` to that command. It
should finish in about a second and print the metrics table; a hang means a partial returns a resource that is still
unbuilt (#243).

The settings checks fail the build on purpose, so the fixture can't hold them. To see one, build with
`HUGO_PARAMS_WALL_TILESPERPAGE=abc` (or `HUGO_PARAMS_WALL_PHOTOSPERGALLERY=abc`, `=0` or `=-2`): the error names the setting
(#256).

The `embed` shortcode compares its URL's host with the site's as strings, so both must be plain ASCII (#272); like the
settings checks, this fails the build and the fixture can't hold it. Building the fixture with
`-b 'https://exämple.org/'` must fail with "the site's baseURL host must be plain ASCII" (its own embed is the
trigger), and `-b https://xn--exmple-cua.org/` must build as usual. With that punycode base URL, a copy of the fixture
whose embed URL is `https://exämple.org/x` must fail with "the URL's host must be plain ASCII".

Without JavaScript the wall controls and the theme switch must collapse instead of keeping their space: open the home
page in a browser with JavaScript off (in Chrome's DevTools, Command menu, "Disable JavaScript"), and the wall's first
row should sit directly under the hero, with no gap where the controls would be (#274).

The fixture build also checks the English-fallback idiom (README, "Translating the theme"): `exampleSite/hugo.toml`
mounts the theme's `layouts/` as assets, and the fixture's own `head-end.html` (`exampleSite/layouts/_partials/i18n-pairs.html`
does the work) reads them. In each template file, the keys given to `T` and to `partial "t.html"` must be the same list
in the same order, and every key must be in `i18n/en.toml`; otherwise the build warns with the ID `theblues-i18n-pair`,
which `--panicOnWarning` turns into a failure (#263). It checks the keys, not the arguments.

The dark-token check (`layouts/_partials/dark-tokens-check.html`, README, "Extending from a site") has a test of its own: the
`dark-tokens` variant builds the fixture with a stand-in `assets/css/main.css` (`exampleSite/variants/dark-tokens-assets/`)
whose two dark-token blocks differ in `--link`. That build must warn, so run it without `--panicOnWarning`:

```bash
hugo --config hugo.toml,variants/dark-tokens.toml --themesDir ../.. -d /tmp/theblues-after-dark-tokens 2>&1 | grep 'dark-token'
```

It must print `WARN  assets/css/main.css: the two dark-token blocks differ: --link (system dark #d2c1b6, picked dark
#ffffff)…`; with `--panicOnWarning` the build fails instead. No line means the check no longer finds the blocks, for
example after a format change in `main.css`, and its patterns need updating (#267). The theme's real stylesheet is the
other half of the test: the base build, with `--panicOnWarning`, passes only if both blocks are found and equal.

To check that a change leaves the output alone, build the same fixtures with the theme before the change (for example
a `git worktree` of `develop`, linked as `hugo-theme-theblues` in another folder) into `/tmp/theblues-before`, then
compare with `diff -r /tmp/theblues-before /tmp/theblues-after`. Fingerprinted file names, `integrity` hashes and the
footer's theme version change whenever a stylesheet, a script or `data/theblues.toml` does; anything else that differs
is a change in output.

The fixture's 4 tiles per page never leave a see-all tile alone on a page. To check the wall's grouped view for that case,
build with `HUGO_PARAMS_WALL_TILESPERPAGE=5` and open `/page/3/`: with Group by gallery on, the one gallery's heading has
its date and the caption ends "grouped into 1 gallery" (#252).

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
