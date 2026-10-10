---
title: "A photo gallery"
date: 2026-01-07
categories: ["photos"]
tags: ["fixtures", "photos"]
---
Text around the gallery is styled like an article.

{{< galleries >}}
{{< gallery src="https://photos.example.org/g/X2/i-1-X2.jpg" title="First photo" >}}
{{< gallery src="https://photos.example.org/g/X2/i-2-X2.jpg" title="A title with a } and a > inside" >}}
{{< gallery src=`https://photos.example.org/g/X2/i-3-X2.jpg` title="Backquoted src" >}}
{{< gallery "https://photos.example.org/g/X2/i-4-X2.jpg" >}}
{{</* gallery src="https://photos.example.org/g/X2/i-commented-X2.jpg" title="Commented out inside galleries" */>}}
{{< /galleries >}}

<!-- {{< gallery src="https://photos.example.org/g/X2/i-html-comment-X2.jpg" title="In an HTML comment" >}} -->
