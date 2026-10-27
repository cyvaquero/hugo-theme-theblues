---
title: "Tables with attributes"
date: 2026-01-15T10:00:00-05:00
description: "Markdown tables with block attributes (the table-attributes variant)."
---
An ordinary pair of attributes:

| Item | Price |
| --- | --- |
| Pen | 2 |
{.fancy #prices}

A value that tries to leave its attribute:

| Item | Price |
| --- | --- |
| Pencil | 1 |
{title="x\" onmouseover=alert(1) y=\"" class="crafted"}

No attributes:

| Item | Price |
| --- | --- |
| Eraser | 3 |
