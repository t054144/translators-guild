# Six complete cover concepts (front and back), rendered for the team to choose from.
import subprocess
from PIL import Image, ImageDraw, ImageFont
FS = lambda fonts: ''.join(f'<link rel="stylesheet" href="fs/{f}.css">' for f in fonts)
BASE = '''* { margin:0; padding:0; box-sizing:border-box; } html,body { width:665px; height:945px; overflow:hidden; }
body { position:relative; font-family:'Carlito',sans-serif; }
.abs { position:absolute; } .rtl { direction:rtl; }
ul { list-style:none; } li { padding-left:20px; position:relative; margin-bottom:8px; }
li::before { content:''; position:absolute; left:0; top:.55em; width:7px; height:7px; border-radius:50%; background:currentColor; opacity:.7; }'''
GRAD = 'linear-gradient(165deg, #8F04BC 0%, #6E05C9 50%, #5507DA 100%)'
Q = '“Words travel worlds.<br>Translators do the driving.”'
WHO = 'Anna Rusconi, translator'
BLURB = 'A step-by-step guide for complete beginners who want to translate between English and Arabic.'
LIS = '<ul><li>27 short chapters, from first steps to subtitling</li><li>Examples in both languages, with exercises and answers</li><li>Practice texts, checklists and a glossary</li></ul>'
EN = 'Translation<br>Handbook'; AR = 'دليل الترجمة'
C = {}

# 1 Classic frame: purple with a white band, centred serif titles inside a fine frame
C[1] = dict(name='Classic frame', fonts=['eb-garamond/500','eb-garamond/500-italic','amiri/arabic-700'], css=f'''
body {{ background:{GRAD}; color:#fff; }}
.band {{ left:0; right:0; bottom:0; height:176px; background:#fff; display:flex; align-items:center; justify-content:center; }}
.band img {{ height:96px; }}
.frame {{ left:34px; right:34px; top:34px; bottom:210px; border:1.5px solid rgba(255,255,255,.6); }}
.t {{ left:0; right:0; top:170px; text-align:center; }}
.en {{ font-family:'EB Garamond'; font-weight:500; font-size:76px; line-height:1; }}
.sep {{ width:60px; height:1.5px; background:#CCCDFB; margin:30px auto 22px; }}
.ar {{ font-family:'Amiri'; font-weight:700; font-size:54px; color:#F1EFFF; }}
.ed {{ left:0; right:0; bottom:236px; text-align:center; font-size:13px; letter-spacing:4px; text-transform:uppercase; color:#E6E3FF; }}
.bq {{ left:70px; right:70px; top:120px; text-align:center; font-family:'EB Garamond'; font-style:italic; font-size:36px; line-height:1.2; }}
.bw {{ left:0; right:0; top:236px; text-align:center; font-size:13px; letter-spacing:3px; text-transform:uppercase; color:#CCCDFB; }}
.bb {{ left:80px; right:80px; top:300px; text-align:center; font-size:16.5px; line-height:1.5; }}
.bb ul {{ display:inline-block; text-align:left; margin-top:16px; font-size:15.5px; }}''',
 front=f'<div class="abs frame"></div><div class="abs t"><div class="en">{EN}</div><div class="sep"></div><div class="ar rtl">{AR}</div></div><div class="abs ed">First edition · 2026</div><div class="abs band"><img src="logo-dark.png"></div>',
 back=f'<div class="abs frame"></div><div class="abs bq">{Q}</div><div class="abs bw">{WHO}</div><div class="abs bb">{BLURB}<br>{LIS}</div><div class="abs band"><img src="logo-dark.png"></div>')

# 2 Midnight: deep Guild indigo, three brand-colour stripes down the spine side, white logo
C[2] = dict(name='Midnight', fonts=['playfair-display/700','playfair-display/400-italic','amiri/arabic-700'], css='''
body { background:linear-gradient(170deg,#3A2B69 0%,#2A1F55 60%,#1F173F 100%); color:#fff; }
.stripes { top:0; bottom:0; left:0; display:flex; } .stripes i { width:14px; height:100%; }
.s1 { background:#8756C0; } .s2 { background:#867EF6; } .s3 { background:#CCCDFB; }
.t { left:92px; right:56px; top:120px; }
.en { font-family:'Playfair Display'; font-weight:700; font-size:72px; line-height:1.03; }
.hr { width:84px; height:3px; background:#867EF6; margin:34px 0 26px; }
.ar { font-family:'Amiri'; font-weight:700; font-size:52px; color:#CCCDFB; text-align:left; }
.logo { left:92px; bottom:58px; height:92px; }
.ed { right:56px; bottom:70px; text-align:right; font-size:13px; letter-spacing:3px; text-transform:uppercase; color:#CCCDFB; line-height:1.7; }
.bs { left:auto; right:0; }
.bq { left:56px; right:92px; top:110px; font-family:'Playfair Display'; font-style:italic; font-size:33px; line-height:1.25; }
.bw { left:56px; top:208px; font-size:13px; letter-spacing:3px; text-transform:uppercase; color:#867EF6; }
.bb { left:56px; right:110px; top:268px; font-size:16.5px; line-height:1.5; color:#EDEBFA; } .bb ul { margin-top:16px; font-size:15.5px; }
.blogo { left:56px; bottom:58px; height:92px; }''',
 front=f'<div class="abs stripes"><i class="s1"></i><i class="s2"></i><i class="s3"></i></div><div class="abs t"><div class="en">{EN}</div><div class="hr"></div><div class="ar rtl">{AR}</div></div><img class="abs logo" src="logo-white.png"><div class="abs ed">First edition<br>2026</div>',
 back=f'<div class="abs stripes bs"><i class="s3"></i><i class="s2"></i><i class="s1"></i></div><div class="abs bq">{Q}</div><div class="abs bw">{WHO}</div><div class="abs bb">{BLURB}{LIS}</div><img class="abs blogo" src="logo-white.png">')

# 3 Light edition: pale lavender page, oversized brand dots, purple type
C[3] = dict(name='Light edition', fonts=['cormorant-garamond/700','cormorant-garamond/600-italic','amiri/arabic-700'], css='''
body { background:#F6F4FD; color:#3A2B69; }
.dots { right:-110px; top:-50px; } .dots i { display:block; width:260px; height:260px; border-radius:50%; margin-bottom:-36px; }
.d1 { background:#8756C0; } .d2 { background:#867EF6; opacity:.9; } .d3 { background:#CCCDFB; }
.t { left:56px; top:400px; }
.en { font-family:'Cormorant Garamond'; font-weight:700; font-size:84px; line-height:.95; color:#3A2B69; }
.ar { font-family:'Amiri'; font-weight:700; font-size:52px; color:#6E05C9; text-align:left; margin-top:22px; }
.foot { left:56px; right:56px; bottom:50px; border-top:1.5px solid #3A2B69; padding-top:22px; display:flex; justify-content:space-between; align-items:center; }
.foot img { height:82px; } .foot div { font-size:13px; letter-spacing:3px; text-transform:uppercase; text-align:right; line-height:1.7; }
.bdots { left:-150px; bottom:190px; } .bdots i { display:block; width:240px; height:240px; border-radius:50%; margin-bottom:-30px; }
.bq { left:56px; right:56px; top:96px; font-family:'Cormorant Garamond'; font-style:italic; font-weight:600; font-size:40px; line-height:1.15; color:#6E05C9; }
.bw { left:56px; top:208px; font-size:13px; letter-spacing:3px; text-transform:uppercase; }
.bb { left:56px; right:120px; top:268px; font-size:16.5px; line-height:1.5; } .bb ul { margin-top:16px; font-size:15.5px; }''',
 front=f'<div class="abs dots"><i class="d1"></i><i class="d2"></i><i class="d3"></i></div><div class="abs t"><div class="en">{EN}</div><div class="ar rtl">{AR}</div></div><div class="abs foot"><img src="logo-dark.png"><div>First edition<br>2026</div></div>',
 back=f'<div class="abs bq">{Q}</div><div class="abs bw">{WHO}</div><div class="abs bb">{BLURB}{LIS}</div><div class="abs foot"><img src="logo-dark.png"><div>First edition<br>2026</div></div>')

# 4 Letters: faint English and Arabic letters across the purple, titles on a white panel
LET = ' '.join(['A','ع','T','ت','B','ب','R','ر','M','م','N','ن','L','ل','S','س','K','ك','H','ه']*4)
C[4] = dict(name='Letters', fonts=['libre-baskerville/700','el-messiri/arabic-600','amiri/arabic-400'], css=f'''
body {{ background:{GRAD}; color:#fff; }}
.pat {{ inset:-20px; font-family:'Libre Baskerville','Amiri'; font-size:92px; line-height:1.15; letter-spacing:22px; word-spacing:18px; color:rgba(255,255,255,.07); text-align:justify; }}
.card {{ left:56px; right:56px; top:180px; background:#fff; color:#3A2B69; padding:54px 40px 48px; text-align:center; }}
.en {{ font-family:'Libre Baskerville'; font-weight:700; font-size:46px; line-height:1.15; }}
.dots {{ display:flex; justify-content:center; gap:10px; margin:26px 0 20px; }} .dots i {{ width:12px; height:12px; border-radius:50%; }}
.d1 {{ background:#8756C0; }} .d2 {{ background:#867EF6; }} .d3 {{ background:#CCCDFB; }}
.ar {{ font-family:'El Messiri'; font-weight:600; font-size:48px; color:#6E05C9; }}
.logo {{ left:50%; transform:translateX(-50%); bottom:62px; height:96px; }}
.ed {{ left:0; right:0; top:560px; text-align:center; font-size:13px; letter-spacing:4px; text-transform:uppercase; color:#E6E3FF; }}
.bcard {{ left:56px; right:56px; top:90px; background:#fff; color:#3A2B69; padding:40px 36px; }}
.bq {{ font-family:'Libre Baskerville'; font-style:italic; font-size:26px; line-height:1.35; }}
.bw {{ font-size:13px; letter-spacing:3px; text-transform:uppercase; color:#6E05C9; margin:12px 0 22px; }}
.bb {{ font-size:15.5px; line-height:1.5; }} .bb ul {{ margin-top:12px; }}''',
 front=f'<div class="abs pat">{LET}</div><div class="abs card"><div class="en">Translation Handbook</div><div class="dots"><i class="d1"></i><i class="d2"></i><i class="d3"></i></div><div class="ar rtl">{AR}</div></div><div class="abs ed">First edition · 2026</div><img class="abs logo" src="logo-white.png">',
 back=f'<div class="abs pat">{LET}</div><div class="abs bcard"><div class="bq">{Q}</div><div class="bw">{WHO}</div><div class="bb">{BLURB}{LIS}</div></div><img class="abs logo" src="logo-white.png">')

# 5 Big circles: purple top, white bottom, three large brand circles crossing the edge
C[5] = dict(name='Big circles', fonts=['montserrat/700','montserrat/500','ibm-plex-sans-arabic/arabic-600'], css=f'''
body {{ background:#fff; color:#fff; }}
.top {{ left:0; right:0; top:0; height:590px; background:{GRAD}; }}
.c {{ border-radius:50%; }}
.c1 {{ width:250px; height:250px; right:-60px; top:360px; background:#8756C0; }}
.c2 {{ width:190px; height:190px; right:150px; top:470px; background:#867EF6; }}
.c3 {{ width:120px; height:120px; right:70px; top:620px; background:#CCCDFB; }}
.t {{ left:56px; top:110px; }}
.en {{ font-family:'Montserrat'; font-weight:700; font-size:58px; line-height:1.08; letter-spacing:-.5px; }}
.ar {{ font-family:'IBM Plex Sans Arabic'; font-weight:600; font-size:44px; text-align:left; margin-top:22px; color:#F1EFFF; }}
.logo {{ left:56px; bottom:62px; height:96px; }}
.ed {{ left:56px; top:540px; font-family:'Montserrat'; font-weight:500; font-size:12px; letter-spacing:3px; text-transform:uppercase; color:#E6E3FF; }}
.bq {{ left:56px; right:56px; top:96px; font-family:'Montserrat'; font-weight:700; font-size:30px; line-height:1.25; }}
.bw {{ left:56px; top:190px; font-family:'Montserrat'; font-weight:500; font-size:12px; letter-spacing:3px; text-transform:uppercase; color:#CCCDFB; }}
.bb {{ left:56px; right:180px; top:250px; font-size:16.5px; line-height:1.5; color:#F7F6FF; }} .bb ul {{ margin-top:14px; font-size:15.5px; }}''',
 front=f'<div class="abs top"></div><div class="abs c c1"></div><div class="abs c c2"></div><div class="abs c c3"></div><div class="abs t"><div class="en">{EN}</div><div class="ar rtl">{AR}</div></div><div class="abs ed">First edition · 2026</div><img class="abs logo" src="logo-dark.png">',
 back=f'<div class="abs top"></div><div class="abs c c1" style="right:auto;left:-80px;top:470px"></div><div class="abs c c3" style="right:auto;left:150px;top:640px"></div><div class="abs bq">{Q}</div><div class="abs bw">{WHO}</div><div class="abs bb">{BLURB}{LIS}</div><img class="abs logo" style="left:auto;right:56px" src="logo-dark.png">')

# 6 Diagonal: purple cut on a slant, calligraphic Arabic with spaced English capitals
C[6] = dict(name='Diagonal', fonts=['marcellus/400','aref-ruqaa/arabic-700'], css=f'''
body {{ background:#fff; color:#fff; }}
.top {{ inset:0; background:{GRAD}; clip-path:polygon(0 0,100% 0,100% 64%,0 80%); }}
.t {{ left:0; right:0; top:150px; text-align:center; }}
.ar {{ font-family:'Aref Ruqaa'; font-weight:700; font-size:108px; line-height:1.2; }}
.en {{ font-family:'Marcellus'; font-size:30px; letter-spacing:10px; text-transform:uppercase; margin-top:16px; color:#F1EFFF; }}
.dots {{ left:50%; transform:translateX(-50%); top:470px; display:flex; gap:12px; }} .dots i {{ width:14px; height:14px; border-radius:50%; }}
.d1 {{ background:#8756C0; }} .d2 {{ background:#867EF6; }} .d3 {{ background:#CCCDFB; }}
.logo {{ right:56px; bottom:58px; height:96px; }}
.ed {{ left:56px; bottom:74px; font-family:'Marcellus'; font-size:14px; letter-spacing:3px; text-transform:uppercase; color:#3A2B69; line-height:1.7; }}
.bq {{ left:56px; right:56px; top:100px; font-family:'Marcellus'; font-size:30px; line-height:1.3; }}
.bw {{ left:56px; top:196px; font-size:13px; letter-spacing:3px; text-transform:uppercase; color:#CCCDFB; }}
.bb {{ left:56px; right:90px; top:256px; font-size:16.5px; line-height:1.5; color:#F7F6FF; }} .bb ul {{ margin-top:14px; font-size:15.5px; }}''',
 front=f'<div class="abs top"></div><div class="abs t"><div class="ar rtl">{AR}</div><div class="en">Translation Handbook</div></div><div class="abs dots"><i class="d1"></i><i class="d2"></i><i class="d3"></i></div><div class="abs ed">First edition<br>2026</div><img class="abs logo" src="logo-dark.png">',
 back=f'<div class="abs top" style="clip-path:polygon(0 0,100% 0,100% 80%,0 64%)"></div><div class="abs bq">{Q}</div><div class="abs bw">{WHO}</div><div class="abs bb">{BLURB}{LIS}</div><img class="abs logo" style="right:auto;left:56px" src="logo-dark.png">')

CH = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'
for k, c in C.items():
    for side in ('front', 'back'):
        html = f'<!doctype html><html><head><meta charset="utf-8">{FS(c["fonts"])}<style>{BASE}{c["css"]}</style></head><body>{c[side]}</body></html>'
        fn = f'concept{k}-{side}'; open(fn + '.html', 'w').write(html)
        subprocess.run([CH, '--headless', '--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files', '--force-device-scale-factor=3.125',
                        '--window-size=665,1100', '--virtual-time-budget=3000', f'--screenshot=/tmp/claude-0/-home-user-translators-guild/7d117e07-7e64-5e6c-8e91-83d6b6c25330/scratchpad/raw.png', 'file://' + __import__('os').path.abspath(fn + '.html')], capture_output=True)
        Image.open('/tmp/claude-0/-home-user-translators-guild/7d117e07-7e64-5e6c-8e91-83d6b6c25330/scratchpad/raw.png').convert('RGB').crop((0, 0, 2078, 2953)).save(f'concepts/{fn}.png', dpi=(300, 300))
# one sheet per concept (front and back side by side) and an overview of all fronts
f1 = ImageFont.truetype('/usr/share/fonts/truetype/crosextra/Carlito-Bold.ttf', 40)
W, H = 560, 796
for k, c in C.items():
    s = Image.new('RGB', (2 * W + 3 * 30, H + 115), '#EEEEF2'); d = ImageDraw.Draw(s)
    d.text((30, 25), f'Concept {k}: {c["name"]}', fill='#3A2B69', font=f1)
    for i, side in enumerate(('front', 'back')):
        s.paste(Image.open(f'concepts/concept{k}-{side}.png').resize((W, H), Image.LANCZOS), (30 + i * (W + 30), 85))
    s.save(f'concepts/sheet-{k}.png')
s = Image.new('RGB', (3 * W + 4 * 30, 2 * (H + 70) + 30), '#EEEEF2'); d = ImageDraw.Draw(s)
for i, (k, c) in enumerate(C.items()):
    x = 30 + (i % 3) * (W + 30); y = 30 + (i // 3) * (H + 70)
    d.text((x, y), f'{k}. {c["name"]}', fill='#3A2B69', font=f1)
    s.paste(Image.open(f'concepts/concept{k}-front.png').resize((W, H), Image.LANCZOS), (x, y + 55))
s.save('concepts/overview.png')
