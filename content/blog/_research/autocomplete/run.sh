#!/bin/bash
# usage: run.sh "seed" -> prints suggestions, one per line
q=$(python3 -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1]))' "$1")
curl -s -A "Mozilla/5.0" "https://suggestqueries.google.com/complete/search?client=firefox&hl=en&gl=us&q=$q" | python3 -c 'import sys,json
try:
  d=json.load(sys.stdin); [print(s) for s in d[1]]
except Exception as e: pass'
