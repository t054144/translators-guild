# Builds the website QR code in the Guild colours with the club logo in the centre, and checks that it scans.
import qrcode, cv2, numpy as np
from PIL import Image, ImageDraw
URL = 'https://translators-guild.vercel.app/'
LOGO = 'qr/badge.png'   # built by qr/badge.py
q = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H, border=0); q.add_data(URL); q.make(fit=True)
M = q.get_matrix(); n = len(M)
S, B = 64, 4                        # pixels per module, quiet-zone modules
W = (n + 2 * B) * S
img = Image.new('RGB', (W, W), 'white'); d = ImageDraw.Draw(img)
top, bot = np.array([0x6E, 0x05, 0xC9]), np.array([0x2A, 0x1F, 0x55])      # Guild purple to indigo, top to bottom; dark enough to scan
col = lambda y: tuple(int(v) for v in top + (bot - top) * (y / W))
def finder(r, c):
    return (r < 7 and c < 7) or (r < 7 and c >= n - 7) or (r >= n - 7 and c < 7)
for r in range(n):
    for c in range(n):
        if M[r][c] and not finder(r, c):
            x, y = (c + B) * S, (r + B) * S
            d.rounded_rectangle([x, y, x + S, y + S], radius=S * 0.18, fill=col(y))
for r0, c0 in [(0, 0), (0, n - 7), (n - 7, 0)]:     # finder patterns: rounded rings with a solid centre
    x, y = (c0 + B) * S, (r0 + B) * S
    d.rounded_rectangle([x, y, x + 7 * S, y + 7 * S], radius=S * 1.6, fill=col(y))
    d.rounded_rectangle([x + S, y + S, x + 6 * S, y + 6 * S], radius=S * 1.1, fill='white')
    d.rounded_rectangle([x + 2 * S, y + 2 * S, x + 5 * S, y + 5 * S], radius=S * 0.8, fill=col(y + 3 * S))
# logo in the centre on a white pad, about 22% of the code's width
L = int(n * S * 0.20); pad = int(S * 0.6)
logo = Image.open(LOGO).convert('RGBA').resize((L, L), Image.LANCZOS)
mask = Image.new('L', (L, L), 0); ImageDraw.Draw(mask).rounded_rectangle([0, 0, L, L], radius=int(L * 0.22), fill=255)
cx = W // 2
d.rounded_rectangle([cx - L // 2 - pad, cx - L // 2 - pad, cx + L // 2 + pad, cx + L // 2 + pad], radius=int(L * 0.28), fill='white')
img.paste(logo, (cx - L // 2, cx - L // 2), mask)
img.save('qr/website-qr.png', dpi=(600, 600))
from pyzbar.pyzbar import decode as zdec
# scan test at the full size and at small print sizes, including after JPEG compression
det = cv2.QRCodeDetector(); ok = []
for px in [W, 1200, 600, 300, 200]:
    small = img.resize((px, px), Image.LANCZOS); small.save('/tmp/claude-0/-home-user-translators-guild/7d117e07-7e64-5e6c-8e91-83d6b6c25330/scratchpad/t.jpg', quality=70)
    a = cv2.imread('/tmp/claude-0/-home-user-translators-guild/7d117e07-7e64-5e6c-8e91-83d6b6c25330/scratchpad/t.jpg')
    v, _, _ = det.detectAndDecode(a); z = [r.data.decode() for r in zdec(Image.open('/tmp/claude-0/-home-user-translators-guild/7d117e07-7e64-5e6c-8e91-83d6b6c25330/scratchpad/t.jpg'))]
    ok.append((px, 'opencv' if v == URL else '-', 'zbar' if URL in z else '-'))
print('modules', n, 'size', W, 'scan:', ok)
