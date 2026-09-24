# Builds the Translation Team badge for the centre of the QR code: "Translation" and "Team" stacked, the three dots
# beside them and "Professional Club" below, all cut from the club's logo file, on the logo's purple gradient.
import numpy as np
from PIL import Image, ImageDraw
SRC = '/root/.claude/uploads/7d117e07-7e64-5e6c-8e91-83d6b6c25330/a45c8764-image.png'
a = np.array(Image.open(SRC).convert('RGB')).astype(float)
def word(x0, y0, x1, y1):            # white lettering from the logo as an alpha mask
    al = np.clip((a[y0:y1, x0:x1, 1] - 20) / (235 - 20), 0, 1)
    return Image.fromarray((al * 255).astype(np.uint8), 'L')
TR, TE, PC = word(136, 758, 790, 870), word(803, 758, 1130, 870), word(240, 892, 1018, 948)
N = 1000
bg = np.zeros((N, N, 3))
for y in range(N):                   # the logo's own gradient, top to bottom
    t = y / N; bg[y] = np.array([0x9D, 0x04, 0xCE]) * (1 - t) + np.array([0x5E, 0x08, 0xEE]) * t
img = Image.fromarray(bg.astype(np.uint8), 'RGB').convert('RGBA')
white = Image.new('RGBA', (N, N), (255, 255, 255, 255))
k = 1.16                             # scale of the lettering
tr = TR.resize((int(TR.width * k), int(TR.height * k)), Image.LANCZOS)
te = TE.resize((int(TE.width * k), int(TE.height * k)), Image.LANCZOS)
pc = PC.resize((int(PC.width * 0.9), int(PC.height * 0.9)), Image.LANCZOS)
dot_d, gap = 58, 14                  # dots sized to sit beside the two lines
block_w = tr.width + 30 + dot_d
x0 = (N - block_w) // 2
y0 = (N - (tr.height * 2 - 8 + 30 + pc.height)) // 2     # centre the whole block vertically
def put(mask, x, y):
    layer = Image.new('L', (N, N), 0); layer.paste(mask, (x, y)); img.paste(white, (0, 0), layer)
put(tr, x0, y0)
put(te, x0 + (tr.width - te.width) // 2, y0 + tr.height - 8)
text_h = tr.height * 2 - 8
put(pc, x0 + (tr.width - pc.width) // 2 + 20, y0 + text_h + 30)
S = 4; lay = Image.new('RGBA', (N * S, N * S), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
dx = x0 + tr.width + 30; dy = y0 + (text_h - (3 * dot_d + 2 * gap)) // 2
for i, col in enumerate([(0x87, 0x56, 0xC0), (0x86, 0x7E, 0xF6), (0xCC, 0xCD, 0xFB)]):
    y = dy + i * (dot_d + gap)
    d.ellipse([dx * S, y * S, (dx + dot_d) * S, (y + dot_d) * S], fill=col + (255,))
img.alpha_composite(lay.resize((N, N), Image.LANCZOS))
mask = Image.new('L', (N, N), 0); ImageDraw.Draw(mask).rounded_rectangle([0, 0, N - 1, N - 1], radius=220, fill=255)
out = Image.new('RGBA', (N, N), (0, 0, 0, 0)); out.paste(img, (0, 0), mask); out.save('qr/badge.png')
