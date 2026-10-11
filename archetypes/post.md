---
title: "{{ replace (.File.ContentBaseName | replaceRE `^\d{8}-` "") "-" " " | title }}"
slug: "{{ .File.ContentBaseName }}"
subtitle: ""
description: ""
date: {{ .Date }}
image: ""
# showtoc: false  # uncomment to turn off this post's table of contents; unset, the site's params.showtoc applies
categories: []
tags: []
# series: []  # uncomment to put this post in a series, for example ["My series"]; the site must declare the series taxonomy
draft: true
---
