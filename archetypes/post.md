---
title: "{{ replace .File.ContentBaseName "-" " " | title }}"
slug: "{{ .File.ContentBaseName }}"
subtitle: ""
description: ""
date: {{ .Date }}
author: "{{ with site.Params.author }}{{ . }}{{ end }}"
image: ""
showtoc: false
categories: []
tags: []
draft: true
---
