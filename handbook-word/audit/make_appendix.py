# Builds audit_content.js (the appendix on the team's documents) from audit/*.json, in plain wording for readers.
import json, re
D = json.load(open('audit/draft_notes.json')); T = json.load(open('audit/terminology.json')); A = json.load(open('audit/avt.json'))
AR = re.compile(r'[؀-ۿ][؀-ۿً-ْ\s،؛؟\-]*[؀-ۿً-ْ]|[؀-ۿ]')
def clean(t):
    t = str(t or '')
    t = re.sub(r'\s*\((?:[^()]*?,\s*)?(?:review2?/)?(?:r|f)\d\.json(?: items?[^)]*)?\)', '', t)
    t = re.sub(r'\s*\((?:review2?/)?(?:refs|audit)[^)]*\.json[^)]*\)', '', t)
    t = re.sub(r'\s*\([a-z_]+_content\.js[^)]*\)', '', t)
    t = re.sub(r'(?:review2?/)?(?:r|f)\d\.json(?: items? [\d, and]+)?', 'the expert review', t)
    t = re.sub(r'(?:review2?/)?refs\.json', 'the reference check', t)
    t = re.sub(r'\b[a-z_]+_content\.js(?: [Ss]ection \d+)?', 'the Editorial Report', t)
    t = re.sub(r'\b[a-z0-9_]+\.(?:js|py|json)\b', 'the records', t)
    t = re.sub(r'\b(?:First|Final|first|final) review\s+[rfl]\d\s*#\s*[\d–\-, ]+(?:\s*\((?:high|medium|low)\))?', lambda m: m.group(0).split()[0].capitalize() + ' expert review' + (' ' if m.group(0).endswith(' ') else ''), t)
    t = re.sub(r'\b[rl][1-4]\s*#\s*[\d–\-]+(?:\s*\((?:high|medium|low)\))?', 'the first expert review', t)
    t = re.sub(r'\b(?:Reports?|Editorial Report,? sections?)\s+s{1,2}\.\s*', 'Editorial Report, section ', t)
    t = re.sub(r'\bf[1-4]\s*#\s*[\d–\-]+(?:\s*\((?:high|medium|low)\))?', 'the final expert review', t)
    t = re.sub(r'\bFinal report s\.\s*', 'Final Report, section ', t)
    t = re.sub(r'\bCorrection Log s\.\s*', 'Correction Log, section ', t)
    t = re.sub(r'\b(?:Editorial )?Report s\.\s*', 'Editorial Report, section ', t)
    t = re.sub(r'\b(the (?:first|final) expert review)((?:\s*(?:,|and|;)\s*\1)+)', r'\1', t)
    t = re.sub(r'\bs\.\s*(\d)', r'section \1', t)
    t = re.sub(r'\s{2,}', ' ', t).replace(' .', '.').replace(' ,', ',').replace('()', '').strip()
    return t
def ar(t):
    t = clean(t).replace('{{', '').replace('}}', '')
    return AR.sub(lambda m: '{{' + m.group(0).strip() + '}}', t)
def cnt(rows, key='status'):
    c = {}
    for r in rows: c[r[key]] = c.get(r[key], 0) + 1
    return c
def srow(x): return [ar(x['section']), x['status'], ar(x.get('where', '')), ar(' '.join(filter(None, [x.get('details', ''), ('Reason: ' + x['reason']) if x.get('reason') else ''])))]
def rrow(x): return [ar(x['source']), 'Yes' if x['in_references'] else 'No', ar(x['status']), ar(x['note'])]
dc, tc = cnt(D['draft_sections']), cnt(T['sections'])
avt_i = [x for x in A['sections'] if 'Intro' in x['document']]; avt_2 = [x for x in A['sections'] if 'Intro' not in x['document']]
ic, ac = cnt(avt_i), cnt(avt_2)
g = lambda c, k: c.get(k, 0)
S = ['Document', 'Points traced', 'Used as written', 'Used and edited', 'Not used']
C = [
 ['h1', '1. Purpose'],
 ['ul', ['This appendix goes through each of the team’s documents point by point and shows what was used as written, what was used and edited, and what was not used, with the reason.',
         'It also lists every source or reference that each document mentions, with its status: checked twice (confirmed), checked and corrected, checked but still needing the printed source, or not received / not used.',
         'The documents are the original draft (Draft_one), the professor’s notes (Latest updates and thoughts), the terminology chapter, and the two sets of audiovisual translation notes (Intro to AVT and AVT 2).',
         'References to the Editorial Report and the Correction Log point to the section where the decision is recorded.']],
 ['h1', '2. Summary'],
 ['table', S, [
   ['Original draft (Draft_one)', str(len(D['draft_sections'])), str(g(dc, 'Used as written')), str(g(dc, 'Used and edited')), str(g(dc, 'Not used'))],
   ['Terminology chapter', str(len(T['sections'])), str(g(tc, 'Used as written')), str(g(tc, 'Used and edited')), str(g(tc, 'Not used'))],
   ['Intro to AVT notes', str(len(avt_i)), str(g(ic, 'Used as written')), str(g(ic, 'Used and edited')), str(g(ic, 'Not used'))],
   ['AVT 2 notes', str(len(avt_2)), str(g(ac, 'Used as written')), str(g(ac, 'Used and edited')), str(g(ac, 'Not used'))],
 ], [40, 15, 15, 15, 15]],
 ['p', f'The professor’s notes contain {len(D["notes_requests"])} separate requests once repeated requests are merged: ' + '; '.join(f'{k} {v}' for k, v in cnt(D['notes_requests']).items()) + '.'],
 ['p', '“Used and edited” is the largest group because almost every point was rewritten in plain English for beginners, and many were corrected, shortened or merged. The last column says exactly what was done.'],
 ['h1', '3. The original draft (Draft_one)'],
 ['h2', '3.1 Every section and point'],
 ['table', ['Draft section or point', 'Status', 'Now in the handbook', 'What changed, and why'], [srow(x) for x in D['draft_sections']], [24, 12, 18, 46]],
 ['h2', '3.2 Draft material not used'],
 ['table', ['Item', 'Reason'], [[ar(x['item']), ar(x['reason'])] for x in D['draft_items_not_used']], [40, 60]],
 ['h2', '3.3 Sources named in the draft and the professor’s notes'],
 ['table', ['Source', 'In the References?', 'Status', 'Note'], [rrow(x) for x in D['references']], [26, 11, 20, 43]],
 ['h1', '4. The professor’s notes: request by request'],
 ['table', ['Request', 'Paragraphs', 'Status', 'Where', 'Comment'], [[ar(x['request']), ar(x.get('paragraphs', '')), x['status'], ar(x.get('where', '')), ar(x.get('comment', ''))] for x in D['notes_requests']], [28, 10, 13, 17, 32]],
 ['h1', '5. The terminology chapter'],
 ['h2', '5.1 Every section and point'],
 ['table', ['Section or point', 'Status', 'Now in the handbook', 'What changed, and why'], [srow(x) for x in T['sections']], [24, 12, 18, 46]],
 ['h2', '5.2 Added to Chapter 21 that was not in the terminology chapter'],
 ['ul', [ar(x) for x in T['added_not_in_document']]],
 ['h2', '5.3 Sources named in the terminology chapter'],
 ['p', 'The terminology chapter itself cites no sources. The sources used in Chapter 21 (for example UNTERM, Arabterm, Cabré and the dictionaries) were added during editing. The table also lists the organisations and names that the chapter mentions.'],
 ['table', ['Source', 'In the References?', 'Status', 'Note'], [rrow(x) for x in T['references']], [26, 11, 20, 43]],
 ['h1', '6. The audiovisual translation notes'],
 ['h2', '6.1 Intro to AVT'],
 ['table', ['Section or point', 'Status', 'Now in the handbook', 'What changed, and why'], [srow(x) for x in avt_i], [24, 12, 18, 46]],
 ['h2', '6.2 AVT 2'],
 ['table', ['Section or point', 'Status', 'Now in the handbook', 'What changed, and why'], [srow(x) for x in avt_2], [24, 12, 18, 46]],
 ['h2', '6.3 Added to Part 9 that was not in the notes'],
 ['p', 'The Arabic dubbing of _The Simpsons_ in Chapter 26 comes from Shaikha’s notes, not from the audiovisual translation notes.'],
 ['ul', [ar(x) for x in A['added_not_in_notes']]],
 ['h2', '6.4 Sources named in the audiovisual translation notes'],
 ['table', ['Source', 'In the References?', 'Status', 'Note'], [rrow(x) for x in A['references']], [26, 11, 20, 43]],
 ['h1', '7. The Text Analysis Model and the Teams chat'],
 ['h2', '7.1 Text Analysis Model (V2-2)'],
 ['p', 'All four pages were seen, in screenshots.'],
 ['table', ['Section or point', 'Status', 'Now in the handbook', 'What changed, and why'], [
  ['Three-step process: analysis of the source text, translation, post-translation activity', 'used as written', 'Ch 17, Step 1; Ch 25', 'Matches the three phases already in the handbook (analysis, translation and commentary).'],
  ['Model based on Fairclough’s relational model (Fairclough, 2003)', 'used and edited', 'Ch 17, Step 3; References', 'Fairclough (2003) added to the References and cited with the course materials.'],
  ['Two components: linguistic level and external level', 'used and edited', 'Ch 17, Step 3', 'Written as “look at two levels”.'],
  ['1.1.1 Lexical aspects', 'used and edited', 'Ch 17, Step 3', 'Given as “Words”, with the full list.'],
  ['1.1.2 Syntactical aspects', 'used and edited', 'Ch 17, Step 3', 'Given as “Grammar”; “cohesion” explained as how sentences are linked.'],
  ['1.1.3 Semantic level', 'used and edited', 'Ch 17, Step 3', 'Given as “Meaning”; speaker’s, sentence and figurative meaning left out to keep the list short; linked to Chapters 5 to 8.'],
  ['1.1.4 Morphological level', 'used and edited', 'Ch 17, Step 3', 'Given as “Word forms”. Reason for cuts: infixation, blending and clippings are too technical for beginners.'],
  ['1.1.5 Phonological level', 'used and edited', 'Ch 17, Step 3', 'Given as “Sound”, with where it matters most (poems, slogans, adverts).'],
  ['1.2.1 Textual level', 'used and edited', 'Ch 17, Step 3', 'Given as “The text”; texture and coherence left out; linked to Chapter 18.'],
  ['1.2.2 Intertextual level', 'used and edited', 'Ch 17, Step 3', 'Given as “Other texts” (quotations and allusions). Frame-modification, re-modelling and Al-ta’reed not used: too advanced.'],
  ['1.2.3 Political/ideological level', 'used and edited', 'Ch 17, Step 3', 'Given as “Point of view”, linked to Chapter 19.'],
  ['2. The external level', 'used and edited', 'Ch 17, Step 3', 'Given as three questions: background event, author, target culture and audience.'],
  ['3. Post-translation activity: experience and commentary', 'used and edited', 'Ch 25, Step 2', 'Added: consult the analysis while writing the commentary. Monitoring, intrinsic and extrinsic managing not used: too advanced.'],
  ['Translation quality assessment', 'used and edited', 'Ch 17, Step 5', 'One sentence added: the model can also be used to judge a translation (Chapter 23).'],
  ['Sample analyses (News, Speech, Climate change) and course notes', 'not used', '–', 'Not received.'],
 ], [24, 12, 18, 46]],
 ['h2', '7.2 Requests in the Teams chat'],
 ['table', ['Request', 'Status', 'Now in the handbook', 'Note'], [
  ['Terminology material selected by Samiuallah and Masooma, to be added to or cut as needed', 'used and edited', 'Ch 21', 'See Section 5. Contributors are not named in the handbook; the acknowledgement thanks all team members.'],
  ['Add the AVT notes to the audiovisual chapter and to other chapters', 'used and edited', 'Ch 26–27', 'See Section 6. The Skopos idea is also linked from Ch 2.'],
  ['Loulwah to prepare the audiovisual chapter from her notes, with a background and introduction for beginners', 'used and edited', 'Ch 26, Steps 1–2', 'The AVT notes appear to be Loulwah’s (to be confirmed).'],
  ['From the Principles of Translation notes: machine translation', 'used and edited', 'Ch 22', 'The notes were not received; the chapter uses the draft and published sources.'],
  ['From the Principles of Translation notes: English–Arabic communicative translation strategy', 'added', 'Ch 10, Step 4', 'Written from Newmark (1988, p. 47; page to be confirmed). To be compared with the notes.'],
  ['From the Principles of Translation notes: explicitation and implicitation', 'added', 'Ch 13, Step 3', 'Written from Vinay & Darbelnet (1958/1995, p. 342; page to be confirmed). Arabic terms {{التصريح}} and {{الإضمار}} to be confirmed.'],
  ['The margin notes', 'not used', '–', 'Not received.'],
  ['Examples for practice', 'removed', '–', 'The practice section was written, then removed at the team’s request; each chapter keeps its “Try it” questions.'],
 ], [30, 12, 16, 42]],
]
out = json.dumps(C, ensure_ascii=False, indent=0)
left = re.findall(r'\.json|\b[rf][1-4]\s*#|\bs\.\s*\d', out)
open('audit_content.js', 'w').write('// Appendix: point-by-point audit of the team’s documents; generated by audit/make_appendix.py.\nmodule.exports = ' + out + ';\n')
print('leftover internal labels:', len(left), left[:5])
