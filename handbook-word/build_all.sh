# Builds both editions (Word and PDF). The blank page before the back cover is kept only when it makes the page count even.
cd "$(dirname "$0")"
for c in midnight light; do
  N=Translation-Handbook-${c^}
  for nb in "" 1; do
    NOBLANK=$nb COVER=$c node build2.js >/dev/null && NOBLANK=$nb PDF=1 COVER=$c node build2.js >/dev/null
    timeout 300 python3 topdf.py $PWD/$N-pdf.docx $PWD/$N.pdf >/dev/null 2>&1
    P=$(pdfinfo $N.pdf | awk '/Pages/{print $2}')
    [ $((P % 2)) -eq 0 ] && { echo "$c: $P pages${nb:+ (no blank page)}"; break; }
  done
done
