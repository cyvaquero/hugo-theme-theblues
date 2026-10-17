# CLAUDE.md

Guidance for Claude Code when working in this repo. The [README](README.md) is the user manual.

## Rules that apply

The owner's account instructions (`~/.claude/CLAUDE.md`) apply here: git-flow with PRs, the GitHub no-reply commit
identity, approvals, findings filed as issues, versioning, and the release and review procedures. This file adds only
what is specific to this repo. Where the two disagree, the account instructions win.

## What this is

**The Blues**, a Hugo theme (Apache-2.0) built for guyheckman.me. The site uses it as a Git submodule pinned to a
release tag. This repo is **public**:

- No links to the private repos (the site, content and root repos) or their issues in new text: code, comments and
  docs cite this repo's issues only. Released CHANGELOG entries and the historical files keep theirs.
- No personal email addresses, credentials, or anything from the site's private config.
- Nothing site-specific: a site's own templates, settings and content belong in that site. The theme reads site
  settings (README, "Site settings it reads") and offers extension points (README, "Extending from a site").

## Support statement

What the theme is built and tested for. A request outside it is an enhancement, not a bug.

- **Hugo:** the minimum in `hugo.toml` (`[module.hugoVersion] min`), which `theme.toml`'s `min_version` mirrors; keep
  the two the same. Standard or extended edition. Developed and tested on the version the site pins.
- **Languages:** one or more languages, with the theme's strings translatable through `i18n/` and an English
  fallback. A right-to-left language gets `dir="rtl"` on `<html>` and a mirrored layout (CSS logical
  properties; the `rtl` variant is the test). The previous/next arrows come from `_partials/arrow.html`, which swaps
  `&larr;` and `&rarr;` for a right-to-left language, in an `aria-hidden` span.
- **Content:** Markdown files under `content/`, with posts in the main sections and a site `title` set (the build warns without one). Content
  adapters are tested only for the fallback title of a page without one (the `adapter` variant); the rest is not.
- **Photos:** SmugMug photo URLs (`photos.smugmug.com`) for galleries, wall tiles and heroes. Only those are read for
  sizes, `srcset` and the hero preload; other hosts work without them.
- **Browsers:** the current and previous major versions of Chrome, Edge, Firefox and Safari, desktop and mobile. The
  README's Requirements section lists how older versions degrade.
- No Node, no Sass, no CSS framework, no external fonts, no CDN or inline scripts in the theme. CSS is hand-written in
  `assets/css/main.css`; Hugo Pipes minifies and fingerprints. Only the test scripts in `scripts/` use Node (its
  built-ins, no packages) and Python's standard library.

## Testing

`exampleSite/` is the fixture, and `scripts/` runs the checks of `docs/testing.md` (Hugo, POSIX sh, Python 3 and Node
only; Chrome or Chromium for the browser checks):

```bash
scripts/build-fixtures.sh <scratch>/after                       # every fixture build; -l lists them, names pick some
scripts/build-fixtures.sh -t <develop worktree> <scratch>/before  # the same with another checkout of the theme
scripts/compare.py <scratch>/before <scratch>/after              # per-file comparison, exit 0 when identical
node scripts/check-browser.mjs <scratch>/after                   # the browser checks; --list names them
```

- Every build except `dark-tokens` finishes with no warnings, and `dark-tokens` must warn; the script fails otherwise.
  The fixture's deliberate warnings are listed in `ignoreLogs` in `exampleSite/hugo.toml`.
- A change not meant to alter output leaves every fixture build byte-identical to the same build of `develop`, with
  the version, fingerprints and SRI values normalized, which `compare.py` does (it works on any Hugo output). So does
  guyheckman.me built with the branch's theme (`--themesDir`); report that comparison.
- A fix for a case the fixture doesn't exercise adds that case to the fixture (content, settings or a new variant) in
  the same branch, and `docs/testing.md` lists it.

## Conventions

- The version lives in `data/theblues.toml` (shown in the site footer) and `CHANGELOG.md`; change them together.
  Tags are the bare version (`1.4.0`).
- The theme's strings use the English-fallback idiom `(or (T "key") (partial "t.html" "key"))`, with the same keys
  in both calls and every key in `i18n/en.toml`. The fixture build checks the pairs.
- Scripts in `assets/js` are published as written, except those run as Hugo templates: `wall.js`, `comments.js`,
  `gallery.js`, `hero.js` and `search.js`. A script is a template only if its first line is `{{- /* theblues:template */ -}}`.
- Theme assets go through `layouts/_partials/asset.html` (minify and fingerprint in production).
- Docs and scripts stay out of the published output: `docs/`, `scripts/` and the README are not mounted. Never put
  them in `static/`, `layouts/` or `assets/`.
- The README is the user manual: requirements, installation, content structure, shortcodes, extending, translating,
  known limits, site settings, CSP and accessibility. Internals live under `docs/`: `layout.md` (the files and how
  the wall works), `testing.md` and `README.md` (the index and design decisions). New internal material goes there.

## Historical files

These record the retheme as it was decided. They are not kept current, are not reviewed against the code, and are
not edited except to fix a broken link (`decisions.md` opens with a note saying so):

- `docs/retheme/decisions.md`
- `docs/retheme/clean-white-inventory.md`
- `docs/retheme/mockups/` (its README and the HTML mockups)

## Git

- Rulesets: `main` and `develop` accept changes only through PRs (merge commits), release merges included, and tags
  can't be moved or deleted. Finish a release with a PR from `release/<version>` into `main`, tag after that merge,
  then merge back into `develop` with a second PR.
- Head branches are deleted automatically on merge. Re-push the release branch after its `main` merge, before
  opening the PR into `develop`. A scripted `git push --delete` of a merged head fails harmlessly.
