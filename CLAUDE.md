# CLAUDE.md

Guidance for Claude Code when working in this repo. The [README](README.md) is the user manual.

## Rules that apply

The owner's account instructions (`~/.claude/CLAUDE.md`) apply here: git-flow with PRs, the GitHub no-reply commit
identity, approvals, findings filed as issues, versioning, and the release and review procedures. This file adds only
what is specific to this repo. Where the two disagree, the account instructions win.

## What this is

**The Blues**, a Hugo theme (Apache-2.0) built for guyheckman.me. The site uses it as a Git submodule pinned to a
release tag. This repo is **public**:

- No links to the private repos (the site, content and root repos) or their issues, in any file, including code
  comments and docs. Cite this repo's issues only.
- No personal email addresses, credentials, or anything from the site's private config.
- Nothing site-specific: a site's own templates, settings and content belong in that site. The theme reads site
  settings (README, "Site settings it reads") and offers extension points (README, "Extending from a site").

## Support statement

What the theme is built and tested for. A request outside it is an enhancement, not a bug.

- **Hugo:** the minimum in `hugo.toml` (`[module.hugoVersion] min`), which `theme.toml`'s `min_version` mirrors; keep
  the two the same. Standard or extended edition. Developed and tested on the version the site pins.
- **Languages:** one or more languages, with the theme's strings translatable through `i18n/` and an English
  fallback. Left-to-right layout only: a right-to-left language gets `dir="rtl"` on `<html>`, but the layout is
  not mirrored.
- **Content:** Markdown files under `content/`, with posts in the main sections and a site `title` set. Content
  adapters are not tested.
- **Photos:** SmugMug photo URLs (`photos.smugmug.com`) for galleries, wall tiles and heroes. Only those are read for
  sizes, `srcset` and the hero preload; other hosts work without them.
- **Browsers:** the current and previous major versions of Chrome, Edge, Firefox and Safari, desktop and mobile. The
  README's Requirements section lists how older versions degrade.
- No Node, no Sass, no CSS framework, no external fonts, no CDN or inline scripts. CSS is hand-written in
  `assets/css/main.css`; Hugo Pipes minifies and fingerprints.

## Testing

`exampleSite/` is the fixture. Every change builds it from that folder, as the README's "Testing the theme" shows:

```bash
cd exampleSite
hugo --panicOnWarning --printPathWarnings --printUnusedTemplates --themesDir ../.. -d <scratch>/base
hugo --minify --panicOnWarning --printPathWarnings --themesDir ../.. -d <scratch>/min
for v in main-menu multilingual analytics rtl; do   # every variants/*.toml except dark-tokens
  hugo --config hugo.toml,variants/$v.toml --minify --panicOnWarning --printPathWarnings --themesDir ../.. -d <scratch>/$v
done
hugo --config hugo.toml,variants/dark-tokens.toml --themesDir ../.. -d <scratch>/dark-tokens   # must warn
```

- `--themesDir` must hold the theme in a folder named `hugo-theme-theblues`. A worktree or export elsewhere needs a
  copy or link with that name.
- Every build except `dark-tokens` finishes with no warnings. The fixture's deliberate warnings are listed in
  `ignoreLogs` in `exampleSite/hugo.toml`.
- A change not meant to alter output leaves every fixture build byte-identical to the same build of `develop`, with
  the version in `data/theblues.toml` normalized. So does guyheckman.me built with the branch's theme
  (`--themesDir`); report that comparison.
- A fix for a case the fixture doesn't exercise adds that case to the fixture (content, settings or a new variant) in
  the same branch, and the README's testing section lists it.

## Conventions

- The version lives in `data/theblues.toml` (shown in the site footer) and `CHANGELOG.md`; change them together.
  Tags are the bare version (`1.4.0`).
- The theme's strings use the English-fallback idiom `(or (T "key") (partial "t.html" "key"))`, with the same keys
  in both calls and every key in `i18n/en.toml`. The fixture build checks the pairs.
- Scripts in `assets/js` are published as written, except those run as Hugo templates: `wall.js`, `comments.js` and
  `gallery.js`. A script is a template only if its first line is `{{- /* theblues:template */ -}}`.
- Theme assets go through `layouts/_partials/asset.html` (minify and fingerprint in production).
- Docs stay out of the published output: `docs/` and the README are not mounted. Never put docs in `static/`,
  `layouts/` or `assets/`.
- The README is the user manual: requirements, installation, content structure, shortcodes, extending, translating,
  site settings, CSP and accessibility. Internals (how the layout works, design rationale, testing detail) belong
  under `docs/`; put new internal material there, not in the README.

## Historical files

These record the retheme as it was decided. They are not kept current, are not reviewed against the code, and are
not edited except to fix a broken link:

- `docs/retheme/decisions.md`
- `docs/retheme/clean-white-inventory.md`
- `docs/retheme/mockups/` (its README and the HTML mockups)

## Git

- Rulesets: `main` and `develop` accept changes only through PRs (merge commits), release merges included, and tags
  can't be moved or deleted. Finish a release with a PR from `release/<version>` into `main`, tag after that merge,
  then merge back into `develop` with a second PR.
- Head branches are deleted automatically on merge. Re-push the release branch after its `main` merge, before
  opening the PR into `develop`. A scripted `git push --delete` of a merged head fails harmlessly.
