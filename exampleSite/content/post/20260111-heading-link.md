---
title: "A heading with an external link"
date: 2026-01-11T10:00:00-05:00
tags: ["fixtures"]
categories: ["tech"]
description: "A heading that links to another host, with the table of contents on: the heading's and the TOC entry's names must not include the new-tab notice; links with Markdown titles."
---
## [Hugo](https://gohugo.io/)

A link to another host in body text, [the Hugo docs](https://gohugo.io/documentation/), says it opens in a new tab,
and [an internal link](/about/) does not. A link with a Markdown title keeps the title and says it opens in a new tab in
one description, [the Hugo home page](https://gohugo.io/ "Hugo & friends"), and an internal one has only the title,
[the archive](/archive/ "All the posts"). The feed's copy of the post carries no `aria-describedby`.

## A heading without a link

Text.
