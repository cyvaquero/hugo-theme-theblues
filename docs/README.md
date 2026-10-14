# The Blues: working on the theme

Documentation for changing and testing the theme. The [README](../README.md) is the user manual. Hugo does not
publish this folder.

- [layout.md](layout.md): how the files are organized and how the wall is built.
- [testing.md](testing.md): the `exampleSite` fixture, its variants and checks, and how the README's images are made.

## Design decisions

Decision records, the Clean White inventory and the layout mockups are in [retheme/](retheme/decisions.md) (Hugo does
not publish this folder; this is the canonical copy). Those files are historical: they record the retheme as it was
decided and are not kept current. In short: palette B (navy, steel blue, sand, cream) with light and dark modes;
responsive with a hamburger nav at 820 px and narrower; Disqus on posts only (click to load since 1.2.0); GA4 (Do Not
Track and Global Privacy Control respected since 1.2.0); search runs in the browser over one generated JSON index (docs/layout.md, "How search works"). The
featured-tags cloud (D14) is deferred.
