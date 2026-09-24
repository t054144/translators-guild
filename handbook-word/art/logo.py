# Cuts the Guild Translation Team wordmark out of the square logo and saves it on a transparent background,
# in white (for the purple cover) and in the Guild dark purple (for white pages). The three dots are redrawn as clean circles.
from PIL import Image, ImageDraw
import numpy as np
SRC = '/root/.claude/uploads/7d117e07-7e64-5e6c-8e91-83d6b6c25330/a45c8764-image.png'
X0, Y0, X1, Y1 = 45, 400, 1185, 960
a = np.array(Image.open(SRC).convert('RGB')).astype(float)[Y0:Y1, X0:X1]
alpha = np.clip((a[:, :, 1] - 20) / (235 - 20), 0, 1)
DOTS = [((1125, 476), (0x87, 0x56, 0xC0)), ((1125, 580), (0x86, 0x7E, 0xF6)), ((1125, 684), (0xCC, 0xCD, 0xFB))]
yy, xx = np.mgrid[Y0:Y1, X0:X1]
for (cx, cy), _ in DOTS:                        # remove the original dots
    alpha[(xx - cx) ** 2 + (yy - cy) ** 2 < 52 ** 2] = 0
def make(text_rgb, out):
    h, w = alpha.shape
    img = np.zeros((h, w, 4), dtype=np.uint8)
    img[:, :, :3] = text_rgb; img[:, :, 3] = (alpha * 255).astype(np.uint8)
    base = Image.fromarray(img, 'RGBA')
    S = 4; layer = Image.new('RGBA', (w * S, h * S), (0, 0, 0, 0)); d = ImageDraw.Draw(layer)
    for (cx, cy), col in DOTS:
        cx, cy, r = (cx - X0) * S, (cy - Y0) * S, 45 * S
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=col + (255,))
    base.alpha_composite(layer.resize((w, h), Image.LANCZOS))
    base.save(out)
make((255, 255, 255), 'art/logo-white.png')
make((0x3A, 0x2B, 0x69), 'art/logo-dark.png')
