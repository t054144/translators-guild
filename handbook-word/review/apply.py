# Applies the accepted review corrections (r1-r4 plus editor's cross-file fixes) with exact-match checks.
import json
reject = {('r1',10), ('r1',19), ('r1',57)}
override = {
 ('r1',34): "'_Shops stay open._ → {{تظلّ المحلات التجارية مفتوحة}} (_stay_ means “remain”, not “live”)',",
 ('r2',37): "'**Functional translation**: _a dead letter_ → {{حبرٌ على ورق}}; _second to none_ → {{لا يُشقّ له غبار}} (Chapter 9). When there is no matching expression, give the plain meaning: _spill the beans_ → {{يُفشي السرّ}}; _mark my words_ → {{تذكّر كلامي}}.',",
 ('r4',2): "'A **terminologist** studies the terms of a field rather than whole texts: they collect, record and sometimes standardise them, in one or more languages.',",
}
files = {f: open(f).read() for f in ('c2a.js', 'c2b.js', 'build2.js')}
log = []
def apply(fn, find, rep, tag):
    s = files[fn]; n = s.count(find)
    assert n == 1, (tag, n, find[:80]); files[fn] = s.replace(find, rep); log.append(tag)
for r in ('r1', 'r2', 'r3', 'r4'):
    for i, x in enumerate(json.load(open(f'review/{r}.json'))):
        if x['replace'] is None or (r, i) in reject: continue
        rep = override.get((r, i), x['replace'])
        if (r, i) in override:   # keep the same line ending as the original find
            rep = rep if x['find'].rstrip().endswith(',') else rep.rstrip(',')
        apply(x['file'], x['find'], rep, f'{r}#{i}')
extra = [
 ('c2a.js', "'{{يساورني القلق}} → _I am growing worried_'", "'{{يساورني القلق}} → _I am worried_'", 'x1'),
 ('c2b.js', "_I am growing worried about the results._", "_I am worried about the results._", 'x2'),
 ('c2b.js', "An idiom is never translated word by word.", "Do not translate an idiom word by word unless English has the same idiom.", 'x3'),
 ('build2.js', "'Academy of the Arabic Language. (n.d.).", "'Academy of the Arabic Language in Cairo. (n.d.).", 'x5'),
]
for fn, a, b, t in extra: apply(fn, a, b, t)
for f, s in files.items(): open(f, 'w').write(s)
print(len(log), 'changes applied')
