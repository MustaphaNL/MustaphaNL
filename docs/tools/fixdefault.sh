#!/bin/bash
# markeert de Normal-stijl als standaard-alineastijl in een .docx
set -e
f="$1"; tmp=$(mktemp -d)
unzip -q -o "$f" -d "$tmp"
find "$tmp" -type l -delete
python3 - "$tmp/word/styles.xml" <<'PY'
import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
old = '<w:style w:type="paragraph" w:styleId="Normal">'
new = '<w:style w:type="paragraph" w:default="1" w:styleId="Normal">'
assert s.count(old) == 1, "Normal-stijl niet uniek gevonden"
open(p, "w", encoding="utf-8").write(s.replace(old, new, 1))
PY
(cd "$tmp" && rm -f out.zip && zip -qXr out.zip . -x out.zip)
mv "$tmp/out.zip" "$f"
rm -rf "$tmp"
