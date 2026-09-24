# Builds the website QR code with the club logo in the centre, in three colourways, and checks that each one scans:
#   website-qr.png           dark purple on white, for the page inside the book
#   website-qr-light-on-dark lavender on a transparent background, for the Midnight back cover
#   website-qr-dark-on-light deep indigo on a transparent background, for the Light back cover
import qrcode, numpy as np
from PIL import Image, ImageDraw, ImageOps
from pyzbar.pyzbar import decode
URL = 'https://translators-guild.vercel.app/'
LOGO = '/root/.claude/uploads/7d117e07-7e64-5e6c-8e91-83d6b6c25330/a45c8764-image.png'   # the club's full logo
q = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H, border=0); q.add_data(URL); q.make(fit=True)
M = q.get_matrix(); n = len(M)
S, B = 64, 4                           # pixels per module, quiet-zone modules
W = (n + 2 * B) * S

def build(top, bot, bg, out):
    img = Image.new('RGBA', (W, W), bg); d = ImageDraw.Draw(img)
    top, bot = np.array(top), np.array(bot)
    col = lambda y: tuple(int(v) for v in top + (bot - top) * (y / W)) + (255,)
    finder = lambda r, c: (r < 7 and c < 7) or (r < 7 and c >= n - 7) or (r >= n - 7 and c < 7)
    for r in range(n):
        for c in range(n):
            if M[r][c] and not finder(r, c):
                x, y = (c + B) * S, (r + B) * S
                d.rounded_rectangle([x, y, x + S, y + S], radius=S * 0.18, fill=col(y))
    for r0, c0 in [(0, 0), (0, n - 7), (n - 7, 0)]:          # finder patterns: rounded ring with a solid centre
        x, y = (c0 + B) * S, (r0 + B) * S
        d.rounded_rectangle([x, y, x + 7 * S, y + 7 * S], radius=S * 1.6, fill=col(y))
        d.rounded_rectangle([x + S, y + S, x + 6 * S, y + 6 * S], radius=S * 1.1, fill=bg)
        d.rounded_rectangle([x + 2 * S, y + 2 * S, x + 5 * S, y + 5 * S], radius=S * 0.8, fill=col(y + 3 * S))
    L = int(n * S * 0.27); pad = int(S * 0.6); cx = W // 2       # logo in the centre, on a clear pad
    d.rounded_rectangle([cx - L // 2 - pad, cx - L // 2 - pad, cx + L // 2 + pad, cx + L // 2 + pad], radius=int(L * 0.28), fill=bg)
    logo = Image.open(LOGO).convert('RGBA').resize((L, L), Image.LANCZOS)
    mask = Image.new('L', (L, L), 0); ImageDraw.Draw(mask).rounded_rectangle([0, 0, L, L], radius=int(L * 0.22), fill=255)
    img.paste(logo, (cx - L // 2, cx - L // 2), mask)
    img.save(out, dpi=(600, 600))
    return img

def scans(img, backdrop):
    """Place the code on the cover colour, shrink it to print sizes, and read it (light-on-dark codes are read inverted, as phone cameras do)."""
    res = []
    for px in [1200, 600, 300]:
        flat = Image.new('RGB', img.size, backdrop); flat.paste(img, (0, 0), img)
        g = ImageOps.grayscale(flat.resize((px, px), Image.LANCZOS))
        res.append(URL in [r.data.decode() for r in decode(g)] or URL in [r.data.decode() for r in decode(ImageOps.invert(g))])
    return res

inside = build((0x6E, 0x05, 0xC9), (0x2A, 0x1F, 0x55), (255, 255, 255, 255), 'qr/website-qr.png')
midnight = build((0xFF, 0xFF, 0xFF), (0xCC, 0xCD, 0xFB), (0, 0, 0, 0), 'qr/website-qr-light-on-dark.png')
light = build((0x3A, 0x2B, 0x69), (0x1F, 0x17, 0x3F), (0, 0, 0, 0), 'qr/website-qr-dark-on-light.png')
print('inside', scans(inside, (255, 255, 255)))
print('midnight', scans(midnight, (0x2A, 0x1F, 0x55)))
print('light', scans(light, (0xF6, 0xF4, 0xFD)))
