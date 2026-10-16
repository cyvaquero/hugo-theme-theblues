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
compared. Also build it minified, as a site is deployed, and the eight variants under `exampleSite/variants/` other than `dark-tokens` (tested on its own, below),
which cover paths the base fixture can't hold at the same time: the primary nav from `[[menus.main]]` (the base fixture uses
the legacy `params.addtional_menus`), the legacy nav with hrefs that carry a query or a fragment (`legacy-nav`, below), a second language with a partial translation (`i18n/de.toml`, content in
`content-de/`) that makes the English fallback, the per-language script names and the `theblues-i18n` check run, a
Google Analytics ID, which the theme loads in production builds only, and a right-to-left language (`rtl`: Arabic with
`direction = "rtl"` next to English, #266), whose pages must start `<html lang="ar" dir="rtl">` while the English ones
have no `dir`, and whose layout mirrors (#296): the series box, article tile, table of contents and blockquote bars are on
the right, the View options panel, skip link, photo badge and theme switch knob anchor to the other side, the lightbox
arrow keys go the other way, and code blocks stay left to right. The previous/next arrows (`_partials/arrow.html`, #340) point toward
the side their link is on: `&rarr;` before the previous link and `&larr;` after the next link, in the post navigation, the series box, the pager,
the "back to all posts" and "all tags" links of a term page and the "more photos" tile. The arrow comes in a span with `aria-hidden="true"`
that also holds the no-break space beside it, so the links' accessible names have no arrow in them ("Older", "Back to all posts"; in Chrome's accessibility
tree, `Accessibility.getFullAXTree`) and the pager's and nav's flex links keep the space between arrow and text (an arrow in a flex link beside an English-fallback
`<span lang=en>` text has the space, which a plain space there would lose). Extra Arabic posts in `exampleSite/content-rtl/` (three in a series
and a photo post, mounted by `variants/rtl.toml`) give the Arabic site those links; `grep -rho '&[lr]arr;' <out>/rtl --include=index.html` finds both on its
`/post/20260112-series-2/` and `/tags/fixtures/` pages and `&rarr;` on `/page/2/` (the wall's last page, with only the Newer link), and the English pages of that build keep `&larr;` before the previous link. The Arabic pages must not scroll sideways: in a browser at 320px and at 1280px, `document.documentElement.scrollWidth` must be at most
`clientWidth` on `/`, a post page and a term page (the off-screen skip link must add no overflow in either direction), and
after Tab from page load the skip link must show inside the window at the inline-start top corner (the right in `rtl`,
the left on the English pages) and be off screen before that. A change to `main.css` must leave a left-to-right page's
computed styles and pixels as they were. Its `exampleSite/i18n/ar.toml` also holds the cases that need a language other than English and German:
Hugo has no abbreviated Arabic month name, so the dates (`<time>`, tile and series `aria-label`s, the archive) must show
the month ("12 يناير 2026"), and the counts have all six plural forms (see "Plural forms" below):

```bash
hugo --minify --panicOnWarning --printPathWarnings --themesDir ../.. -d /tmp/theblues-after-min
for v in main-menu multilingual analytics rtl adapter legacy-nav hero-none hero-one; do
  hugo --config hugo.toml,variants/$v.toml --minify --panicOnWarning --printPathWarnings --themesDir ../.. -d /tmp/theblues-after-$v
done
```

(`--printUnusedTemplates` is left out of the variants, since each one leaves some templates unused on purpose.)

The `legacy-nav` variant (#350) replaces the legacy `params.addtional_menus` list with hrefs that carry a query or a fragment. In its
nav, `/about#team` is `/about/#team`, `/search?x=1` is `/search/?x=1`, `/archive?s=a#b` is `/archive/?s=a#b`, `/feed.xml#x` is
`/feed.xml#x` (it has an extension), and the hrefs that are only a fragment or a query, `#top` and `?page=2`, stay as written (not
`/#top/`); with `-b https://example.org/sub/` the paths gain `/sub`, and with the `multilingual` variant added to the
`--config` list they gain `/en` on the English pages (`/en/about/#team`).

The rotating hero (#356, README, "Rotating hero") has fixtures in the base build and in two variants. Photos are on
`photos.smugmug.com`, so a first build needs the network. In the **base build**, the newest photo post (`20260107`, on
`photos.example.org`) has no photo whose size can be read, so the pool is the two landscape photos of `20260104-smugmug-photos`
(its portrait photo is left out, and so is the `image` of the hero-image article, which is not a gallery photo): the home page, `/tags/photos/`,
`/tags/fixtures/` and `/categories/photos/` (and their pager pages) have `data-pool` with two tokens (`photos/i-25Xwh4F/…|M,L,X2,X2,`),
the first photo (`i-25Xwh4F`) in the hero's `--hi` and in the preload links, and a `<script src=/js/hero.…>`; `/tags/code/`, `/categories/tech/`
and the pages of the other terms, and every other page, have none of that. The **`hero-none` variant** (`variants/hero-none.toml`,
`content-hero-none/`) has landscape SmugMug photos only where no pool may take them: an article's inline gallery, `image` and Markdown image, a photo post
that is a draft, one dated in the future and one that has expired, and a photo post with only a portrait and a photo of unknown size. Every page of its build must be
byte for byte the same as the same variant built with the theme before the change (below), the footer version and the stylesheet's fingerprint aside, with no
`hero.js` in the output and every hero on `header_image`. The **`hero-one` variant** adds one photo post (`20260106-single`) with one landscape
and one portrait photo: the home page and `/tags/single/` show that photo from the build (preloaded, with its sizes) and have no `data-pool`, no button and no `hero.js`.
Because the `hero-none` content must give the old output, compare it by building the variant with a worktree of `develop`, which needs `content-hero-none/` and
`variants/hero-none.toml` copied into its `exampleSite/` (they don't exist there).

In a browser (headless Chrome over the DevTools protocol, with the guyheckman.me build, whose photos load), on a page with a pool of two or more:

- With JavaScript off, the hero shows the first photo (the computed `background-image` is its size for the viewport), `<head>` has its preload, and the page
  has no `.hr` and no `.hpp`. With JavaScript on, the hero starts on a random photo of the pool: unless it is the build's photo, its request starts at load and
  the `.hr` layer fades it in over the build's photo as soon as it has loaded. Then (with the default `hero_interval` of 30) at 25 s the next photo's request starts (one request, the size the viewport uses), at 30 s the `.hr` layer fades in
  (`opacity` rises over 1.5 s, only once the image has loaded) and the hero then holds that photo. Reloads give different start photos (from different galleries, given enough reloads)
  and different sets of five; no photo comes back before the cycle ends and the sixth photo shown is the first of the five again. To see a whole cycle sooner, scale the page's timers before it loads
  (`Page.addScriptToEvaluateOnNewDocument` wrapping `setTimeout` so a delay of 20 s or more is divided by 20; the 1.5 s fade stays as it is).
- `params.hero_interval`: the base build's `hero.js` has `SHOW = 30000`; with `--config hugo.toml,<file setting hero_interval = 15>` it has
  `SHOW = 15000` (and `7.5` gives `7500`), and `"15"`, `4` and `true` each fail the build with the `params.hero_interval` error.
- Tab reaches the pause button (after the hero's links), its accessible name is "Pause the photo rotation" (`Accessibility.getFullAXTree`), Enter changes it to
  "Play the photo rotation" and the rotation stops: no change and no request for as long as it is paused; Space and a click change it back. The button has no `aria-pressed`, the
  layer is `aria-hidden` and there is no live region in the hero. It is 44 by 44 pixels and its focus ring is the 3px sand outline.
  A tab reported hidden (`document.hidden` true, then a `visibilitychange` event) stops the rotation and a visible one restarts it.
- With `prefers-reduced-motion: reduce` (`Emulation.setEmulatedMedia`) there is no button, the layer is never shown, the hero keeps the build's photo
  (no random start) and makes no further photo request; changing the setting while the page is open starts or stops the rotation.
- The text's computed colors and the hero's `background-image` (with the URL taken out) equal those of the same page before the change, in light and dark mode; and with the
  layer shown over the hero with the hero's own photo (copy the hero's `--hi` to `--hi6` to the layer, `.on`, no transition) a screenshot of the hero is pixel for pixel the same as without it.
- Hero sizes by screen (device metrics override, `getComputedStyle(hero).backgroundImage`): the home hero's photo is X2 at 390, 412 and 427px wide at three-x and X3 at 428 and 430px wide or at four-x, in each case at least the viewport width and the hero box's height in device pixels; at two-x and one-x it is the same size as before the three-x tier (the .phero of a photo post or term keeps its X3 or X5 size at three-x).
- At 320px (and 390px) the button is inside the window, overlaps no text and the page has no horizontal scroll; in a right-to-left page it is at the left.
- Under the site's real CSP and under the README's example policy (`style-src 'self'; style-src-attr 'unsafe-inline'; img-src 'self' https://photos.smugmug.com; connect-src 'self'`), sent as a header, the
  console has no violation while the hero rotates.

The nav's search link is written only for a language that has a search page (#350): in the `multilingual` and `rtl` builds the
German and Arabic pages, whose content folder has no `search/`, have no "SEARCH" link, and the English ones keep it.
`og:locale` is written when the locale ends in a two-letter region: `HUGO_LOCALE=en-US`, `en-us` and `pt-br` give `en_US` and `pt_BR`;
`zh-Hant-TW` gives `zh_TW`; `zh-Hant`, `sr-Latn`, `es-419`, `de` and `en` give no `og:locale` (Hugo reads the environment variable
as the site's `locale`; build the fixture with it and `grep -o 'property="og:locale"[^>]*' <out>/index.html`). A front-matter `image` that
isn't a URL fails the build and names the page: in a copy of the fixture add a post with `image: "1:2/x.jpg"`; the error must start with
the post's path and say "the share image "1:2/x.jpg" is not a valid URL".

The `adapter` variant (#277) has a content adapter, `content-adapter/post/_content.gotmpl`, that adds three pages without a title
and one with a title to the post section. Its untitled pages must get distinct titles from their paths ("Adapter Note",
"Second Adapter Note", "Third Adapter Thing"; the date prefix of `20260301-adapter-note` is dropped) in the page's `<h1>`
and `<title>`, in previous/next links and in the feed, not the adapter's folder name ("Post") for all of them, and the page with a title
and the pages in `content/` keep theirs. It is the only content-adapter case the fixture covers.

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

A browser reads a port as a number, so a zero-padded port is the same port (#349); the shortcode and the link hook both read
ports through `_partials/url-port.html`. On `-b https://example.org/`, embed URLs `https://example.org:0443/x` and
`https://example.org:00443/x` fail like `:443` with "the URL is on this site's own host and port", while `:8443`, `:08443`,
`:0` (port 0, another origin) and `:000` build. On `-b https://example.org:8443/`, `:08443` fails and, on
`-b https://example.org:08443/`, `:8443` fails. For a Markdown link, `[l](https://example.org:0443/x)` on
`-b https://example.org/` is internal (no `target="_blank"`), as are `:00443` and `:443`, and `:08443` and `:0` are external.

The search fixture (README, "Search"): `exampleSite/content/search/_index.md` lists `searchindex` in its outputs, so the
build publishes `/search/index.json`, and the search page loads `search.js`. The root pages `accents.md` (accented words in
its title, description, tags and text) and `unlisted.md` (`search: false`, one rare word) are part of it, with two pages that are never published (#321): `unrendered.md`
(`build: {render: never, list: always}`, the word quokkaneverrender) and `unrendered-link.md` (`render: link`, the word wombatlinkonly), which
must have no row and whose words must find nothing (`grep -c 'Unrendered\|Link-only' <out>/search/index.json` prints 0). Neither page is in any sitemap either (#326):
`grep -rc 'unrendered' <out> --include=sitemap.xml` prints 0 for every file (`layouts/sitemap.xml` is Hugo 0.168.0's template with that
filter; recheck it against Hugo's when the Hugo version changes, README, "Upgrading Hugo"), and apart from that page's `<url>` block
the sitemaps match a build with Hugo's built-in template byte for byte, and with four pages for the marks (#320): `hindi.md` ("किताब", and
"की" in its text) and `hindi-other.md` ("कमल", "कोई", "कुछ", "करता", "के", "को", "कि"), `decomposed.md` (Latin saved in
NFD) and `vocalized.md` (Arabic with harakat; its last line holds "کتاب‌ها" with a U+200C inside), and the last lines of `accents.md` (Straße, Łódź, København, Øslo, Đan, Ærøe, cœur and the Greek capitals ΚΟΣΜΟΣ, #350). Check the build, in
`<out>/search/`: `index.json` exists, has `"v":1` and no row for the unlisted page or the two unpublished ones, and `index.xml` doesn't exist. Then serve
`<out>` (`python3 -m http.server`) and, in a browser (headless Chrome over the DevTools protocol works), on `/search/`:

- `gallery` lists the gallery posts, with the matches in `<mark>`; `code` finds the post tagged `code`; `cafe creme`,
  `Café Crème`, `naive resume`, `MUNSTER` and `brulee` all find the accents page (case and accents folded);
- `की` finds only the Hindi page that has it (not "कमल", "कोई" or "कुछ"), with the whole word in `<mark>`; `किताब` finds
  that page with the whole word marked and the snippet centered on it; `ecole` finds the decomposed page with "école"
  marked whole; `كتاب` and `كِتَابٌ` both find the Arabic page, with the whole word marked; `/की/` on the 404 page
  searches that word the same way;
- `strasse`, `lodz`, `kobenhavn`, `oslo`, `dan`, `đan`, `aeroe` and `coeur` find the accents page with Straße, Łódź, København, Øslo, Đan, Ærøe or cœur marked whole;
  `ΚΟΣ`, `κοσμος` and `ΚΟΣΜΟΣ` find it with "ΚΟΣΜΟΣ" marked (a final capital sigma lower-cases to ς, which folds to σ; before
  #350 `ΚΟΣ` found nothing); `کتابها` (no joiner), `کتاب‌ها` and `کتاب` find the Arabic page with the whole "کتاب‌ها" marked (before, the joiner split it into two words and the
  query without it found nothing). Words of fewer than four letters are not matched with a typo, so `dan` shows that Đ is folded;
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

The nav's search link (`params.search_enabled`, set in the fixture) has `aria-current="page"` on `/search/` and on no other page, with a language prefix (`/en/search/` in `multilingual`) and with a sub-path base URL (build with `-b https://example.org/sub/`: `/sub/search/`) (#333).

Feeds and feed links (#322): in `<out>/tags/fixtures/index.xml` no item is the "Unlisted note" page (outside the main sections), while the
terms used only by root pages (`/tags/münster/`, `/tags/crème-brûlée/`, `/tags/किताब/`, `/categories/food/`) have a feed with no items, no
"Subscribe via RSS" link in their header (their wall is empty too) and no `<link rel="alternate" type="application/rss+xml">` in their `<head>`
(both ask `_partials/feed-has-items.html`; #350), while `/tags/fixtures/` keeps its link in both; a section's feed (`/post/index.xml`) is unchanged. In the accessibility tree
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
- `/caf%C3%A9%/` (a lone `%`, which makes `decodeURIComponent` throw for the whole path) and `/post/caf%C3%A9-%E0%A4%A/` (a broken escape
  after a good one) put `cafe` in the field and list the accents page; each run of escapes is decoded on its own, and a byte that
  begins no character cuts a word, so no `c3`, `a9`, `e0` or `a4` words appear (#350);
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

In the `rtl` build, with Group by gallery on, the closed group's triangle (`::before` of `details.grp > summary`) is "◂" in the Arabic pages and "▸" in
the English ones, and the open one "▾" in both (#350; `getComputedStyle(summary, '::before').content`).

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
  The lightbox loads the `X2` photo where it has a pixel for each device pixel the photo fills, and `X3` otherwise: with
  the network log on, open the first photo and step through them at 390x844 (pixel ratio 1 and 3) and at 1280x800 (1 and
  2); the photo requests are `X2` at both phone ratios and at 1280x800 ratio 1, and `X3` at 1280x800 ratio 2. The link's
  `href` is `X3` in every case.
  A modifier turns the lightbox's keys off (#350): with the lightbox open, real key events (`Input.dispatchKeyEvent` with `modifiers`: 1 Alt, 2 Ctrl, 4 Meta, 8
  Shift) for Right, Left, Home and End change nothing and leave `defaultPrevented` false, so Alt+Left (Back) and Ctrl+End work; the same keys with no modifier
  still change the photo; Tab and Escape behave as before. The choice of X2 or X3 follows the window (#350): open the first photo at 390x844 (pixel ratio 1, X2), set 1280x800 at
  ratio 2 (`Emulation.setDeviceMetricsOverride`), and the lightbox asks for X3 once and shows it when it has loaded (before, X2 stayed); back at 390x844 ratio 3 it
  shows X2 again; five more resizes make no new request; opening and closing the lightbox several times leaves one `resize` and one `orientationchange`
  listener on `window` (`DOMDebugger.getEventListeners`). With the DevTools `Fetch` domain answering every `photos.smugmug.com` request with a 404, the counter
  reads "1 / 3 (image couldn’t be loaded)" and the live region "Photo 1 of 3: Landscape (image couldn’t be loaded)"; with only the `X3` request failing (the thumbnail loads)
  both read as for a photo that loaded. At 320px the longer counter wraps and Close, Previous and Next stay on screen.
  The controls stay on screen on a short viewport (#348): with a real-photo build (the author's site, whose gallery photos
  load) and device scale factor 1, set the viewport to 320x200, 320x256, 568x320, 320x640, 1280x1024 and 1920x1080
  (`Emulation.setDeviceMetricsOverride`; a plain window won't go below about 500 px), open a 3:2 photo and a 2:3 photo, wait
  until the lightbox image has loaded, and read the boxes of Close, Previous and Next. At the first three, Close (with 5 px
  around it for its focus ring), Previous and Next lie inside the viewport and the dialog has not scrolled; at the others
  the photo is the same size as before (80% of the height, or the width limit). Repeat with `dir="rtl"` on `<html>`. Tab
  moves Close, Previous, Next, Close; the arrows change the photo; Escape returns focus to the thumbnail.
  - `article`: `/post/20260105-dated-article/` at 1280x980, scrolled until the table of contents is 380 px from the top.
  - `view-options`: `/` after clicking "View options", scrolled until the controls row is 20 px from the top.
  - `tag-page`: `/tags/photos/` at the top.
  - `theme-switch`: the article page after clicking the Dark button in the nav, with the system in light mode.
  - `mobile-menu`: `/` at phone size with a clean `localStorage`, after clicking the Menu button.
