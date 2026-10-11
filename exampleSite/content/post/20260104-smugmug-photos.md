---
title: "SmugMug photos with sizes"
date: 2026-01-04
categories: ["photos"]
tags: ["fixtures", "photos"]
---
Gallery photos on photos.smugmug.com, so the build reads each photo's size (width and height attributes) and offers
the smaller SmugMug sizes (srcset and sizes): two landscape photos and a portrait one. The first photo is the cover, so
the post's hero gets the smaller sizes for phones and a preload (#193).

{{< galleries >}}
{{< gallery src="https://photos.smugmug.com/photos/i-25Xwh4F/0/LPgbbcwJRzjbBPTCGzcHwKkJhMTndzNfMFwrrZ53V/X2/i-25Xwh4F-X2.jpg" title="Landscape" >}}
{{< gallery src="https://photos.smugmug.com/photos/i-K7SKGKz/0/M63XHDkJQtn57gV5DnRvNskGSTXsDzjPGCjbhqzd2/X2/i-K7SKGKz-X2.jpg" title="Portrait" >}}
{{< gallery src="https://photos.smugmug.com/photos/i-8Nr9Vp5/0/LtqCm7STrJ5RmbT2tXzMSRJG82twnvrhqdmZ6mD2H/X2/i-8Nr9Vp5-X2.jpg" title="Another landscape" >}}
{{< /galleries >}}
