# Renders front.html and back.html to 300 dpi PNGs at the B5 page size (176 x 250 mm).
C=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
cd "$(dirname "$0")"
for n in front back; do
  $C --headless --no-sandbox --disable-gpu --hide-scrollbars --force-device-scale-factor=3.125 --window-size=665,1100 --screenshot=$PWD/$n-raw.png file://$PWD/$n.html 2>/dev/null
  python3 -c "from PIL import Image; Image.open('$n-raw.png').convert('RGB').crop((0,0,2078,2953)).save('cover-$n.png', dpi=(300,300))"
  rm -f $n-raw.png
done
