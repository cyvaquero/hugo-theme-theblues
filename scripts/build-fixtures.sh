#!/bin/sh
# Builds every fixture of docs/testing.md from exampleSite/ into <out>/<name>:
#   base           production build with --printUnusedTemplates (must report no unused template)
#   min            the same, minified
#   <variant>      every exampleSite/variants/*.toml except dark-tokens, minified
#   dark-tokens    must print the dark-token warning (built without --panicOnWarning)
# Every other build must finish with no warnings (--panicOnWarning). Hugo's cache and each build's log go in <out>/.cache and <out>/.logs.
#
# Usage: scripts/build-fixtures.sh [-t <theme dir>] <out> [name ...]
#   -t, or the THEME_DIR environment variable, builds another checkout of the theme (default: this one), for
#   comparing a branch with develop. Names build only those fixtures. -l lists the names.
# Exit status: 0 when every build gave the expected result, 1 when one did not, 2 on a usage error.
set -eu

usage() { echo "usage: $0 [-t <theme dir>] [-l] <out> [name ...]" >&2; exit 2; }

here=$(cd "$(dirname "$0")/.." && pwd)
theme=${THEME_DIR:-$here}
list=0
while getopts t:l opt; do
  case $opt in
    t) theme=$OPTARG ;;
    l) list=1 ;;
    *) usage ;;
  esac
done
shift $((OPTIND - 1))

[ -d "$theme/exampleSite/variants" ] || { echo "$theme is not the theme checkout (no exampleSite/variants)" >&2; exit 2; }
theme=$(cd "$theme" && pwd)

variants=
for f in "$theme"/exampleSite/variants/*.toml; do
  v=$(basename "$f" .toml)
  [ "$v" = dark-tokens ] || variants="$variants $v"
done
all="base min$variants dark-tokens"

if [ "$list" = 1 ]; then
  for n in $all; do echo "$n"; done
  exit 0
fi
[ $# -ge 1 ] || usage
out=$1
shift
if [ $# -gt 0 ]; then
  for n in "$@"; do
    case " $all " in *" $n "*) ;; *) echo "unknown fixture: $n (see -l)" >&2; exit 2 ;; esac
  done
  want="$*"
else
  want=$all
fi

mkdir -p "$out"
out=$(cd "$out" && pwd)
mkdir -p "$out/.logs"

# --themesDir needs the theme in a folder named hugo-theme-theblues.
if [ "$(basename "$theme")" = hugo-theme-theblues ]; then
  themes=$(dirname "$theme")
else
  themes=$out/.themes
  rm -rf "$themes"
  mkdir -p "$themes"
  ln -s "$theme" "$themes/hugo-theme-theblues"
fi

cd "$theme/exampleSite"
fail=0
start=$(date +%s)
for n in $want; do
  log=$out/.logs/$n.log
  rm -rf "${out:?}/$n"
  case $n in
    base) set -- --panicOnWarning --printPathWarnings --printUnusedTemplates ;;
    min) set -- --minify --panicOnWarning --printPathWarnings ;;
    dark-tokens) set -- --config hugo.toml,variants/dark-tokens.toml ;;
    *) set -- --config "hugo.toml,variants/$n.toml" --minify --panicOnWarning --printPathWarnings ;;
  esac
  rc=0
  hugo "$@" --themesDir "$themes" --cacheDir "$out/.cache" -d "$out/$n" >"$log" 2>&1 || rc=$?
  case $n in
    dark-tokens)
      if [ $rc -ne 0 ]; then
        echo "FAIL $n: hugo exited $rc (see $log)"; fail=1
      elif ! grep -q 'the two dark-token blocks differ' "$log"; then
        echo "FAIL $n: no dark-token warning (the check no longer finds the blocks; see $log)"; fail=1
      else
        echo "ok   $n (warned as expected)"
      fi ;;
    *)
      if [ $rc -ne 0 ]; then
        echo "FAIL $n: hugo exited $rc (see $log)"; fail=1
      elif grep -q '^WARN \|^ERROR ' "$log"; then
        echo "FAIL $n: warnings in $log"; fail=1
      elif [ "$n" = base ] && grep -qi 'unused templates' "$log"; then
        echo "FAIL $n: unused templates (see $log)"; fail=1
      else
        echo "ok   $n"
      fi ;;
  esac
done
echo "done in $(($(date +%s) - start)) s"
exit $fail
