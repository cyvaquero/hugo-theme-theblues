# Testing the theme

`exampleSite/` is a small fixture site whose content exercises the cases the guyheckman.me content doesn't: an untitled
post, an undated post, a gallery with commented-out photos, a positional `gallery` call and an untitled photo, a
`{{% galleries %}}` block, the `embed` shortcode, Markdown links and images (including a dropped `javascript:` link),
a series (and a post in two series, whose series boxes hold two feed links that differ in their accessible names), a code block with line numbers, a post whose headings are all below the TOC levels, a post whose heading holds an external link, with the table of contents on (its names must not include "(opens in a new tab)"; the link's description must), the same post's links with Markdown titles (an external one, whose `title` and description are "Hugo & friends (opens in a new tab)" with no `aria-describedby`, and an internal one, whose title is its description; the feeds' copies of the post's links carry no `aria-describedby`), a page without a title, an article with an inline
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
compared. Also build it minified, as a site is deployed, and the four variants under `exampleSite/variants/` other than `dark-tokens` (tested on its own, below),
which cover paths the base fixture can't hold at the same time: the primary nav from `[[menus.main]]` (the base fixture uses
the legacy `params.addtional_menus`), a second language with a partial translation (`i18n/de.toml`, content in
`content-de/`) that makes the English fallback, the per-language script names and the `theblues-i18n` check run, a
Google Analytics ID, which the theme loads in production builds only, and a right-to-left language (`rtl`: Arabic with
`direction = "rtl"` next to English, #266), whose pages must start `<html lang="ar" dir="rtl">` while the English ones
have no `dir`. Its `exampleSite/i18n/ar.toml` also holds the cases that need a language other than English and German:
Hugo has no abbreviated Arabic month name, so the dates (`<time>`, tile and series `aria-label`s, the archive) must show
the month ("12 يناير 2026"), and the counts have all six plural forms (see "Plural forms" below):

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

For build-time measurements, use a scratch copy of a site scaled to a realistic size, for example a few hundred posts,
with series of up to about 25 posts (README, "Known limits"). The series box writes the whole series on each of its
posts, so a longer series measures that design, which grows with the square of the series length, not a regression.

The settings checks fail the build on purpose, so the fixture can't hold them. To see one, build with
`HUGO_PARAMS_WALL_TILESPERPAGE=abc` (or `HUGO_PARAMS_WALL_PHOTOSPERGALLERY=abc`, `=0` or `=-2`): the error names the setting
(#256). A boolean or a fractional or huge number can't come from an environment variable (Hugo turns `2.9` into 2 before
the theme sees it), so put it in a config file and add it to the build:
`printf '[params.wall]\n  tilesPerPage = 2.9\n' > <scratch>/bad.toml`, then `hugo --config hugo.toml,<scratch>/bad.toml
--themesDir ../.. -d <scratch>`. Each of `true`, `2.9`, `1e30`, `"2.9"` and `"abc"`, for `tilesPerPage` and for
`photosPerGallery`, must fail with "params.wall.tilesPerPage must be a whole number, 1 or more (got …)"; `0`, `"0"`, `"-0"` and `-2`
fail with "must be 1 or more"; `5`, `4.0` and `"7"` build, and so do `"010"` (10 tiles on page 1, not 8, since a string is read as
decimal) and `"08"` (8 tiles, not an error) (#322).

The `embed` shortcode compares its URL's host with the site's as strings, so both must be plain ASCII (#272); like the
settings checks, this fails the build and the fixture can't hold it. Building the fixture with
`-b 'https://exämple.org/'` must fail with "the site's baseURL host must be plain ASCII" (its own embed is the
trigger), and `-b https://xn--exmple-cua.org/` must build as usual. With that punycode base URL, a copy of the fixture
whose embed URL is `https://exämple.org/x` must fail with "the URL's host must be plain ASCII".

The same shortcode refuses a numeric spelling of the site's own IP address (#309). With the site on a bare IP, build with
`-b https://127.0.0.1/` (and `-b 'https://[::1]/'`) and a copy of the fixture whose embed URL is, in turn, `https://2130706433/`,
`https://0x7f.1/`, `https://0177.0.0.1/`, `https://127.1/`, `https://127.0.0.1./`, `https://127.0.0.1/x`, `https://[::1]/` and
`https://[::ffff:127.0.0.1]/`: each must fail with the shortcode's own error, no panic: "the site is served from an IP address", except
`https://127.0.0.1/x` (and `https://[::1]/` on the `[::1]` base), which is the site's own host spelled the same way and fails first
with "the URL is on this site's own host and port". Meanwhile
`https://photos.example.org/x` and `https://www.youtube-nocookie.com/x` build. On the fixture's own base URL (a domain), the numeric
URLs build as before.

The same shortcode compares ports too (#332): the site's host on another port is another origin and is allowed, and a port
that is the scheme's default (443 for https, 80 for http) counts as none. Build a copy of the fixture whose embed URL is, in
turn, as follows. On `-b https://example.org/`: `https://example.org:8443/x` builds; `https://example.org/x`,
`https://example.org:443/x` and `https://EXAMPLE.org/x` fail with "the URL is on this site's own host and port". On
`-b https://example.org:8443/`: `https://example.org/x` builds and `https://example.org:8443/x` fails the same way. On
`-b http://127.0.0.1:8099/`: `https://127.0.0.1:9443/x` and `https://127.0.0.1/x` fail with "the site is served from an IP
address" (the IP rule above runs on any port). `https://photos.example.org/x` builds everywhere.

The search fixture (README, "Search"): `exampleSite/content/search/_index.md` lists `searchindex` in its outputs, so the
build publishes `/search/index.json`, and the search page loads `search.js`. The root pages `accents.md` (accented words in
its title, description, tags and text) and `unlisted.md` (`search: false`, one rare word) are part of it, with two pages that are never published (#321): `unrendered.md`
(`build: {render: never, list: always}`, the word quokkaneverrender) and `unrendered-link.md` (`render: link`, the word wombatlinkonly), which
must have no row and whose words must find nothing (`grep -c 'Unrendered\|Link-only' <out>/search/index.json` prints 0). Neither page is in any sitemap either (#326):
`grep -rc 'unrendered' <out> --include=sitemap.xml` prints 0 for every file (`layouts/sitemap.xml` is Hugo 0.168.0's template with that
filter; recheck it against Hugo's when the Hugo version changes, README, "Upgrading Hugo"), and apart from that page's `<url>` block
the sitemaps match a build with Hugo's built-in template byte for byte, and with four pages for the marks (#320): `hindi.md` ("किताब", and
"की" in its text) and `hindi-other.md` ("कमल", "कोई", "कुछ", "करता", "के", "को", "कि"), `decomposed.md` (Latin saved in
NFD) and `vocalized.md` (Arabic with harakat). Check the build, in
`<out>/search/`: `index.json` exists, has `"v":1` and no row for the unlisted page or the two unpublished ones, and `index.xml` doesn't exist. Then serve
`<out>` (`python3 -m http.server`) and, in a browser (headless Chrome over the DevTools protocol works), on `/search/`:

- `gallery` lists the gallery posts, with the matches in `<mark>`; `code` finds the post tagged `code`; `cafe creme`,
  `Café Crème`, `naive resume`, `MUNSTER` and `brulee` all find the accents page (case and accents folded);
- `की` finds only the Hindi page that has it (not "कमल", "कोई" or "कुछ"), with the whole word in `<mark>`; `किताब` finds
  that page with the whole word marked and the snippet centered on it; `ecole` finds the decomposed page with "école"
  marked whole; `كتاب` and `كِتَابٌ` both find the Arabic page, with the whole word marked; `/की/` on the 404 page
  searches that word the same way;
- `constructor` finds the accents page (a plain object used as a set would have taken it for already seen; #322), on `/search/?q=constructor`
  and, on the 404 page, at `/constructor/`;
- `smug` finds the SmugMug posts (start of a word); `galery` finds the gallery posts (one typo);
- `zzzqx` and `zebrafish` (the unlisted page's word) find nothing and the status says "No results for …";
- `/search/?q=Café` runs on load, leaves focus on the page and keeps other parameters and the hash in the address;
- with JavaScript off, the page says "Search is not available yet." and shows no form, and the accessibility tree already holds
  the empty `role="status"` (CDP `Accessibility.getFullAXTree`), so the count written on load is announced (#322);
- with the index answered after 1.5 s (CDP `Fetch`, delay the request), the status says "Loading the search index…" after 0.4 s and is empty
  again once the load ends, with no query (focus the field) and on the 404 page with no match; an index answered with a 500 leaves the
  failure message in the status;
- a title match is bolder than the result's title (computed `font-weight` 900 against 700 in the link, 700 against 400 in a snippet);
- the status is a `role="status"` that is said once after typing pauses; Enter runs the search; Tab reaches the field, the
  button, then the first result; a long query reflows at 320px with no horizontal scroll; `mark` is 8:1 in light and dark
  (system and picked), and uses `Mark`/`MarkText` with `forced-colors: active`.

Feeds and feed links (#322): in `<out>/tags/fixtures/index.xml` no item is the "Unlisted note" page (outside the main sections), while the
terms used only by root pages (`/tags/münster/`, `/tags/crème-brûlée/`, `/tags/किताब/`, `/categories/food/`) have a feed with no items and no
"Subscribe via RSS" link in their header (their wall is empty too); a section's feed (`/post/index.xml`) is unchanged. In the accessibility tree
of `/post/20260106-untitled/` the two feed links in the series boxes are named "Subscribe via RSS : Fixture Series" and "Subscribe via RSS :
Second Fixture Series" (a link name starts with its visible text), and the term pages' links stay "Subscribe via RSS".

Links to another origin (#322): on the fixture's About page the link to `https://example.org:443/about/` is internal and the one to
`https://example.org:8443/` has `target="_blank"` and `aria-describedby="tb-newtab"`. The fixture can't hold the other base URLs, so
build a copy with a page of links, for `-b http://127.0.0.1:8099/` and `-b https://example.org/`: `http://127.0.0.1:9999/x` is external on the first and
`http://127.0.0.1:8099/y` internal; on the second, `https://example.org:443/x`, `http://example.org:80/x`, `https://EXAMPLE.org:443/q` and
`http://example.org/z` are internal and `https://example.org:8443/x` and `http://127.0.0.1:8099/y` are external.

The 404 page (`/404.html`, README, "Search") lists the latest five posts and, with the index, searches the missing address.
`python3 -m http.server` can't answer a missing address with the 404 page and its status, so a script that drives headless
Chrome answers it: with the DevTools `Fetch` domain, fulfill a request for a missing address with status 404 and the body of
`<out>/404.html`, and the page runs as it would on a host that serves its 404 page at the address. Check:

- `/post/20260104-smug/` (`post` and the number are dropped) puts `smug` in the field, lists "SmugMug photos with sizes" and
  "An article with a SmugMug hero" under "Were you looking for…" with the matches in `<mark>`, hides the latest posts, says
  "2 results" and leaves focus on the page; `/post/2026/gallry-photos/` (one typo) lists the gallery posts; `/accnts/` finds
  the accents page; Enter in the field goes to `/search/?q=smug`;
- `/2017/05/` (only numbers), `/zzzqxv/` and `/2017/05/awx-on-centos/` (no page has them; the two-letter `on` is not used
  alone) show the empty field and the latest five posts, and no result list;
- `/%3Cimg%20src=x%20onerror=alert(1)%3E/` and `/%E0%A4%A/` (a malformed escape) put nothing of the address on the page as
  markup, run no script, open no dialog and cause no console error besides the 404 response itself;
- with JavaScript off, and in a copy of the fixture whose search section leaves out `searchindex`, the 404 page is the hero,
  the home link and the latest five posts, with no field and no search script.

`params.search.textLimit` goes through the same check with a minimum of 0 (#322), so with a config file as above `true`, `2.9`, `1e30`
and `"abc"` fail with "params.search.textLimit must be a whole number, 0 or more (got …)" and `-1` with "must be 0 or more", while `0`, `5000`, `50` and `"200"`
build (the longest `text` in `index.json` is cut to 50 and 200).
Setting `HUGO_PARAMS_SEARCH_TEXTLIMIT=abc` (or `=-1`) fails the build naming the setting, `=0` keeps each page's whole text,
and a site whose index is over 1 MB warns with `theblues-search-size` (try `HUGO_PARAMS_SEARCH_TEXTLIMIT=0` on a copy whose
posts are long). A copy of the fixture without `searchindex` in the search section's outputs builds with no `index.json`,
no `search.js` on the search page and the "not available" text.

A copy of the fixture with `title` removed from `hugo.toml` builds with one `theblues-no-title` warning;
`--panicOnWarning` fails it, and listing the ID in `ignoreLogs` silences it. With the `multilingual` variant the warning
comes once for English, which takes the top-level `title`, and not for German, which sets its own; remove that one too
and each language warns once. The fixture as it is, with the top-level `title`, never warns.

The English fallback is marked as English (README, "Translating the theme"): in the `multilingual` and `rtl` builds, the
theme's English text that is the content of an element (a button, a label, a heading, a link name) is inside
`<span lang=en>…</span>`, and none is inside an attribute, a `<title>` or an `<option>`:
`find <out>/multilingual -name '*.html' | xargs grep -hoE '(aria-label|title|alt|content)="[^"]*lang='` finds nothing, and
`grep -o '<span lang=en>[^<]*</span>' <out>/multilingual/index.html` lists labels such as "View options" and "Sort". An
English build has no such span (T finds the text, so `t-en.html` isn't used). With the spans taken out, a `multilingual`
page equals the same page built without `t-en.html`: the markup is the only difference.

Plural forms: the `rtl` build's `js/wall.ar.min.<hash>.js` has `p:[0,1,2,3,…]` and `t:[…]` in each count, and the
English and German scripts have only `one` and `other`. To see the six forms pick, copy `<out>/rtl` to a scratch folder,
make pages from its `index.html` with the article tile (`<article class="tile article">…</article>`) repeated A times and a
photo tile (`<figure class="tile photo">…</figure>`, from an English page) P times in `<div class=mas>`, with
`data-articles=A data-photos=P` on `#stage`, serve the folder, and read the wall's caption (`.cap`) in headless Chrome. With
(A, P) = (0, 1), (2, 3), (5, 11), (12, 100), (21, 22), (101, 102), (103, 6) and (1, 2) the counts must read the forms the
Arabic rules (CLDR) give: 0 zero; 1 one; 2 two; 3 to 10 few; 11 to 99 many; 100 to 102 other; 103 few. The search page's
result count (`searchResultCount`) takes the same path.

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
