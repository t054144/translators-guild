# Applies the accepted corrections from the final review (f1-f4) and the reference check (refs), with exact-match checks.
import json
reject = {('f1',2), ('f1',7), ('f3',24), ('f3',18)}   # scholar names in the text; keep the draft's triad; Reiss fixed once via refs
files = {f: open(f).read() for f in ('c2a.js', 'c2b.js', 'build2.js')}
n = 0
def apply(fn, find, rep, tag):
    global n
    c = files[fn].count(find); assert c == 1, (tag, c, find[:80]); files[fn] = files[fn].replace(find, rep); n += 1
for r in ('f1', 'f2', 'f3', 'f4', 'refs'):
    for i, x in enumerate(json.load(open(f'review2/{r}.json'))):
        if x['replace'] is None or (r, i) in reject: continue
        apply(x['file'], x['find'], x['replace'], f'{r}#{i}')
extra = [
 ('c2a.js', 'Translation has been described as “saying almost the same thing” (Eco, 2003).', 'Translation has been described as “saying almost the same thing”, the title of a book on translation (Eco, 2003).'),
 ('c2a.js', 'Experts describe translation in the same way:', 'Translation is often defined in the same way:'),
 ('c2b.js', 'Homer’s beer, for example, became a soft drink.', 'Homer’s beer, for example, became a soft drink (Translation Team, n.d.).'),
]
for fn, a, b in extra: apply(fn, a, b, 'extra')
for f, s in files.items(): open(f, 'w').write(s)
print(n, 'changes applied')
