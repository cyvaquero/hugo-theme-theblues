#!/usr/bin/env python3
"""Compares two Hugo output trees file by file (docs/testing.md, "Running the checks").

Before comparing, it normalizes what changes whenever a stylesheet, a script or the theme's version does:
  - the versions in the footer (`<p class="ver">`: the theme's, and Hugo's, since any dotted version in that paragraph),
  - 64-hex fingerprints, in file names and in contents,
  - Subresource Integrity values (sha256-, sha384- and sha512-, with the "+" and "/" spelled as Hugo or JSON escapes them).
Everything else must match byte for byte. It works on any Hugo output, not only the fixture.

Usage: compare.py [--version V]... [--skip NAME]... <before> <after>
  --version V   also replace the text V (a version) everywhere, not only in the footer paragraph.
  --skip NAME   leave out a top-level file or folder of the trees (the fixture builds' .cache, .logs and .themes
                are always left out).
Exit status: 0 identical, 1 different, 2 usage error.
"""
import argparse
import os
import re
import sys

HEX64 = re.compile(rb"(?<![0-9A-Fa-f])[0-9a-f]{64}(?![0-9A-Fa-f])")
# One base64 character as it can appear in HTML or JSON: "+" and "/" may be escaped.
_B64 = rb"(?:[A-Za-z0-9=]|\+|/|&#43;|&#x2[bB];|&#47;|&#x2[fF];|\\u002[bB]|\\/)"
_SRI_LEN = {b"256": 44, b"384": 64, b"512": 88}
SRI = re.compile(rb"sha(256|384|512)-((?:" + _B64 + rb"){43,88})")
VER_PARAGRAPH = re.compile(rb'(<p class=(?:"ver"|\'ver\'|ver)>)(.*?)(</p>)', re.S)   # minified output drops the quotes
DOTTED = re.compile(rb"\d+\.\d+\.\d+(?:\.\d+)?")
ALWAYS_SKIP = {".cache", ".logs", ".themes"}


def _sri(m):
    # Take exactly the characters of a digest of that algorithm (a base64 value is 44, 64 or 88 characters).
    want = _SRI_LEN[m.group(1)]
    n = 0
    i = 0
    s = m.group(2)
    token = re.compile(_B64)
    while n < want:
        t = token.match(s, i)
        if not t:
            return m.group(0)  # shorter than a digest: not an SRI value, leave it
        i = t.end()
        n += 1
    return b"sha" + m.group(1) + b"-<SRI>" + s[i:]


def normalize(data, versions):
    data = VER_PARAGRAPH.sub(lambda m: m.group(1) + DOTTED.sub(b"<VERSION>", m.group(2)) + m.group(3), data)
    for v in versions:
        data = data.replace(v, b"<VERSION>")
    data = SRI.sub(_sri, data)
    return HEX64.sub(b"<HASH>", data)


def normalize_name(name):
    return HEX64.sub(b"<HASH>", name.encode("utf-8", "surrogateescape")).decode("utf-8", "surrogateescape")


def files(root, skip):
    """Maps each file's normalized relative path to its real path. Same names after normalizing are told apart by order."""
    found = {}
    for dirpath, dirnames, filenames in os.walk(root):
        if dirpath == root:
            dirnames[:] = [d for d in dirnames if d not in skip]
            filenames = [f for f in filenames if f not in skip]
        dirnames.sort()
        for f in sorted(filenames):
            p = os.path.join(dirpath, f)
            key = normalize_name(os.path.relpath(p, root).replace(os.sep, "/"))
            k, i = key, 1
            while k in found:
                i += 1
                k = "%s#%d" % (key, i)
            found[k] = p
    return found


def context(a, b):
    """A short description of where two byte strings first differ."""
    i = 0
    n = min(len(a), len(b))
    while i < n and a[i] == b[i]:
        i += 1
    line = a.count(b"\n", 0, i) + 1

    def show(x):
        return x[max(0, i - 30):i + 40].decode("utf-8", "replace").replace("\n", "\\n")

    return "first difference at byte %d (line %d)\n      before: ...%s\n      after:  ...%s" % (i, line, show(a), show(b))


def main(argv):
    ap = argparse.ArgumentParser(description="Compare two Hugo output trees.", usage="%(prog)s [--version V] [--skip NAME] before after")
    ap.add_argument("before")
    ap.add_argument("after")
    ap.add_argument("--version", action="append", default=[], metavar="V")
    ap.add_argument("--skip", action="append", default=[], metavar="NAME")
    args = ap.parse_args(argv)
    for d in (args.before, args.after):
        if not os.path.isdir(d):
            print("not a folder: %s" % d, file=sys.stderr)
            return 2
    skip = ALWAYS_SKIP | set(args.skip)
    versions = [v.encode() for v in args.version if v]
    before = files(args.before, skip)
    after = files(args.after, skip)
    only_before = sorted(set(before) - set(after))
    only_after = sorted(set(after) - set(before))
    differ = []
    for k in sorted(set(before) & set(after)):
        with open(before[k], "rb") as f:
            a = normalize(f.read(), versions)
        with open(after[k], "rb") as f:
            b = normalize(f.read(), versions)
        if a != b:
            differ.append((k, context(a, b)))
    for k in only_before:
        print("only in before: %s" % k)
    for k in only_after:
        print("only in after:  %s" % k)
    for k, c in differ:
        print("differs:        %s\n    %s" % (k, c))
    total = len(set(before) | set(after))
    bad = len(only_before) + len(only_after) + len(differ)
    if bad:
        print("%d of %d files differ (%d only in before, %d only in after, %d changed)"
              % (bad, total, len(only_before), len(only_after), len(differ)))
        return 1
    print("identical: %d files" % total)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
