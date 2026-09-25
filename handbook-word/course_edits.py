# Adds material from the general principles-of-translation course, rewritten at beginner level, and makes the
# technology and audiovisual chapters practical. Each edit replaces one exact, unique anchor.
A, B = 'c2a.js', 'c2b.js'
E = []
def after(fn, anchor, new): E.append((fn, anchor, anchor + '\n' + new))
def before(fn, anchor, new): E.append((fn, anchor, new + '\n' + anchor))
def replace(fn, old, new): E.append((fn, old, new))

# ---------- Chapter 1 ----------
after(A, "  '**Localisation**: adapting a product, such as a website or an app, to another country’s language and culture.',\n]],",
"""['p', 'In a wider sense, there are three kinds of translation (Jakobson, 1959): rewording within one language (**intralingual**), translating from one language into another (**interlingual**, the subject of this handbook), and turning words into another medium, such as a film or a painting (**intersemiotic**).'],""")
before(A, "['h', 'Two kinds of translator'],",
"""['p', 'A translator is a reader before being a writer: first understand the source text fully, then write it again in the target language.'],
['h', 'Four common myths'],
['ul', [
  '**“Anyone who speaks two languages can translate.”** Translation also needs training, practice and knowledge of the subject.',
  '**“Translation is exchanging words.”** A translator carries the meaning, not the words.',
  '**“Machines will replace translators.”** Machine translation gives drafts; people still check and finish them (Chapter 22).',
  '**“A translator can translate any subject.”** Most translators specialise in one or two fields, such as law or medicine.',
]],""")

# ---------- Chapter 3 ----------
after(A, "['h', 'Gender and numbers'],", "['p', 'Each language chooses what its grammar must show, such as gender and number (Baker, 2018).'],")
after(A, "  'With the numbers 3 to 10, the number takes the opposite gender to the singular noun: {{ثلاثةُ طلاب}} but {{ثلاثُ طالبات}}.',",
"""  'Arabic has a dual ({{طالبان}}, two students); English uses _two_.',
  'English _I_ and _you_ do not show gender, but Arabic verbs and adjectives do: _I am a student_ → {{أنا طالب}} or {{أنا طالبة}}. If the sentence does not say, look for clues in the whole text: a name, a title such as _Mr_ or _Mrs_, a word such as _husband_ or _wife_.',""")
before(A, "['h', 'Gender and numbers'],",
"""['p', 'Do not translate _is_, _am_ or _are_ with {{يكون}}: _She is kind_ → {{إنها طيبة}}, not {{هي تكون طيبة}}; _I am leaving now_ → {{سأغادر الآن}}. In the past, use {{كان}}: _The child was sick_ → {{كان الطفلُ مريضاً}}.'],
['h', 'The verbs “do” and “have”'],
['ul', [
  'In negatives and questions, _do_ has no Arabic word of its own: _Do not touch it_ → {{لا تلمسه}}; _She did not eat_ → {{لم تأكل}}; _Do you want to play?_ → {{هل تريد أن تلعب؟}}',
  'As a main verb, _do_ has a meaning: _I will do my best_ → {{سأبذل قصارى جهدي}}.',
  'The meaning of _have_ depends on its object: _She had a nice holiday_ → {{قضت عطلةً جميلة}}; _She takes her pills on time_ → {{تتناول دواءها في موعده}}; _She has money_ → {{تملك مالاً}}.',
]],""")
replace(A, "'**EN → AR**: prefer a verbal sentence, join short sentences, use Arabic punctuation.'", "'**EN → AR**: prefer a verbal sentence, never translate _is_ with {{يكون}}, join short sentences, use Arabic punctuation.'")

# ---------- Chapter 5 ----------
replace(A, "  ['Speaker meaning', 'مقصد المتكلم', 'What the speaker really means by saying it.'],\n]],",
"  ['Speaker meaning', 'مقصد المتكلم', 'What the speaker really means by saying it.'],\n  ['Lexical gap', 'الفجوة المعجمية', 'A concept that has a word in one language but not in the other.'],\n]],")
replace(A, "Words can share the same **denotation** but carry a different **connotation** (Baker, 2018).",
    "Words can share the same **denotation** but carry a different **connotation**, sometimes called propositional and expressive meaning (Baker, 2018).")
before(A, "['try', ['In an obituary, which is better: {{مات}} or {{تُوُفِّي}}?'",
"""['h', 'Problems with single words'],
['p', 'Some problems appear at the level of the single word (Baker, 2018):'],
['ul', [
  '**No equivalent word** (a lexical gap): English has _orphan_ and _widow_, but no single word for {{ثكلى}}, a mother who has lost a child. Give the meaning: _a bereaved mother_.',
  '**A false equivalent**: {{الهنود الحمر}} is neutral in Arabic, but _Red Indians_ is offensive in English. Use _Native Americans_.',
  '**A rare word**: {{شبر}} has an exact English equivalent, _span_, but few readers know it. Use a familiar measure: _about 20 centimetres_.',
  '**Several meanings**: {{خط}} can be _a line_, _handwriting_, _a font_ or _a route_. Let the context decide (Chapter 6).',
]],""")

# ---------- Chapter 7 ----------
replace(A, "  '_pay a visit_ → {{يقوم بزيارة}} (not {{يدفع زيارة}})',\n]],",
"""  '_pay a visit_ → {{يقوم بزيارة}} (not {{يدفع زيارة}})',
]],
['p', 'One English verb may need a different Arabic verb with each partner:'],
['ul', [
  '_deliver a letter_ → {{يسلّم رسالة}}; _deliver a speech_ → {{يلقي خطاباً}}',
  '_deliver the news_ → {{ينقل الخبر}}; _deliver a blow_ → {{يوجّه ضربة}}; _deliver a verdict_ → {{يُصدر حكماً}}',
]],""")

# ---------- Chapter 8 ----------
replace(A, "  ['Proverb', 'المثل', 'A traditional saying that gives advice or states a truth.'],\n]],",
"  ['Proverb', 'المثل', 'A traditional saying that gives advice or states a truth.'],\n  ['Fixed expression', 'العبارة المسكوكة', 'A fixed group of words whose meaning is clear from its words, such as _as a matter of fact_.'],\n]],")
replace(A, "['p', '_It’s a piece of cake_ means “it is easy”. An idiom usually cannot be translated word by word. Use a target-language idiom with the same meaning, or translate its meaning in plain words (Baker, 2018).'],",
"""['p', '_It’s a piece of cake_ means “it is easy”. The words of an idiom are frozen: you cannot change their order or replace one of them.'],
['p', 'A **fixed expression** is frozen too, but its meaning is clear from its words: _as a matter of fact_ → {{في واقع الأمر}}; _ladies and gentlemen_ → {{سيداتي سادتي}}; _all the best_ → {{مع أطيب التمنيات}}. Use the expression that the target language uses in the same situation.'],
['h', 'How to spot an idiom'],
['ul', [
  'It makes no literal sense: _It’s raining cats and dogs._',
  'It breaks the rules of grammar: _by and large_ (“in general”).',
  'It is a comparison with _like_: _like two peas in a pod_ (“very similar”).',
  'If an expression makes little sense in its context, it is probably an idiom.',
]],
['h', 'Five ways to translate an idiom'],
['p', 'Try them in this order (Baker, 2018):'],
['ol', [
  'An idiom with the same meaning and the same form, if one exists.',
  'An idiom with the same meaning but a different form: _It’s raining cats and dogs_ → {{تمطر كأفواه القِرَب}}.',
  'Borrowing the idiom, when readers will understand it.',
  'A paraphrase: the meaning in plain words.',
  'Omission, only when the idiom adds nothing and cannot be translated.',
]],""")

# ---------- Chapter 13 ----------
replace(A, "  '**Loan word plus explanation**: _waqf_ (a charitable endowment in Islam).',",
"""  '**Loan word plus explanation**: explain the word the first time, then use it alone: _waqf_ (a charitable endowment in Islam). Many Arabic words entered English this way: _algebra_, _algorithm_, _hijab_.',
  '**Substitution**: using what the target reader expects, especially for times and measures: {{الثامنة إلا ثلثاً}} → _7:40_; {{الثالثة فجراً}} → _3 a.m._',""")

# ---------- Chapter 18 ----------
replace(B, "  ['Genre', 'الجنس النصّي', 'A kind of text with its own rules, such as a news report or a recipe.'],\n]],",
"""  ['Genre', 'الجنس النصّي', 'A kind of text with its own rules, such as a news report or a recipe.'],
  ['Headline', 'العنوان الرئيسي', 'The title of a news story.'],
  ['Inverted pyramid', 'الهرم المقلوب', 'A news structure that gives the most important facts first.'],
]],""")
before(B, "['try', ['Which text type is an advert: informative, expressive or operative?'",
"""['h', 'Translating news headlines'],
['p', 'English headlines have their own grammar:'],
['ul', [
  'No _a_, _the_ or _is_. A passive headline often becomes a verbal noun ({{مصدر}}) in Arabic: _Man killed, woman wounded in shooting_ → {{مقتل رجل وإصابة امرأة في إطلاق نار}}.',
  'The simple present reports a recent event: _Minister opens new hospital_ → {{الوزير يفتتح مستشفى جديداً}}.',
  '_to_ + verb means the future: _Saudi Arabia to extend visas for expats_ → {{السعودية ستمدّد تأشيرات الوافدين}}.',
  'Add what Arab readers may not know: _Mustang customer complaint_ → {{شكوى زبون من سيارة فورد موستانج}}.',
]],
['h', 'How a news story is built'],
['p', 'Most news stories follow the **inverted pyramid**: the most important facts come first, in the headline and the first paragraph (the lead), and the details follow. Keep this order in your translation.'],
['p', '**Hard news** reports facts, such as decisions, disasters and discoveries, without the writer’s opinion. **Soft news** tells human stories, to interest or move the reader.'],
['h', 'Technical and literary texts'],
['p', 'In technical texts, one word can be a different term in each field: _depression_ is {{الاكتئاب}} in psychology, {{الكساد}} in economics and {{منخفض جوي}} in a weather report. Check the field every time (Chapter 21).'],
['p', 'In literary texts, **style** matters as much as content: word choice, sentence length, tone and dialogue. If a character speaks in dialect to show who they are, find a way to keep that effect.'],""")
replace(B, "['summary', ['Identify the genre before you translate.', 'Follow the rules of the same genre in the target language.']],",
    "['summary', ['Identify the genre before you translate.', 'Follow the rules of the same genre in the target language.', 'News headlines have their own grammar; translate them into natural Arabic headlines.']],")

# ---------- Chapter 22 ----------
replace(B, "  ['Hallucination', 'الهلوسة', 'Invented or false content produced by an AI tool, such as facts that are not in the source text.'],\n]],",
"""  ['Hallucination', 'الهلوسة', 'Invented or false content produced by an AI tool, such as facts that are not in the source text.'],
  ['Translation memory', 'ذاكرة الترجمة', 'A database of earlier translations that the translator can reuse.'],
  ['CAT tool', 'أداة الترجمة بمساعدة الحاسوب', 'Software that helps a human translator, usually with a translation memory and a termbase.'],
  ['Localisation', 'التوطين', 'Adapting a whole product, such as a website, an app or a game, to a local market.'],
]],""")
before(B, "['h', 'Useful or risky?'],",
"""['h', 'Tools translators use'],
['ul', [
  '**Machine translation**: early systems used rules, then statistics; today most use neural networks. They are much more fluent, but they can still be wrong.',
  '**Translation memory**: stores your past translations sentence by sentence and suggests them when a similar sentence appears. It saves time and keeps your work consistent.',
  '**Termbases**: keep one term for one idea across a project (Chapter 21).',
  '**CAT tools** combine these, for example Trados, memoQ, and the free OmegaT and Matecat.',
]],""")
before(B, "['h', 'Four rules'],",
"""['h', 'Post-editing: an example'],
['p', '_Our new branch opens on Monday. Don’t miss out!_'],
['ul', [
  'Machine output: {{فرعنا الجديد يفتح يوم الاثنين. لا تفوّت الخروج!}} ✗ (_miss out_ was read as “going out”)',
  'Post-edited: {{يُفتتح فرعنا الجديد يوم الاثنين. لا تفوّتوا الفرصة!}} ✓',
]],
['h', 'Using AI tools well'],
['ul', [
  'Tell the tool the text type, the audience and the terms you want.',
  'Ask for two or three options, then choose yourself.',
  'Check every name, number, date and term against a reliable source.',
]],
['h', 'Localisation'],
['p', '**Localisation** adapts a whole product to a local market. Translation is one part of it. The rest includes dates, numbers, currencies and units, images and colours, and the direction of the page: an Arabic website reads from right to left.'],""")

# ---------- Chapter 26 ----------
replace(B, """  '**Free commentary**: a freer version with additions and omissions, as in documentaries and children’s programmes.',
  '**In-vision signing**: a sign-language interpreter shown on screen, for deaf viewers who use sign language.',
  '**Audio description**: a spoken description of the action, for blind and partially sighted viewers.',
  '**Audio subtitling**: subtitles read aloud, for blind and partially sighted viewers.',
  '**Fandubbing** and **fansubbing**: dubbing and subtitles made by fans.',
]],""", """  '**Audio description**: a spoken description of the action, for blind and partially sighted viewers.',
]],""")
replace(B, "Its challenges are matching lip movements, adapting cultural content and staying consistent across a series.'],",
"Its challenges are matching lip movements, adapting cultural content and staying consistent across a series. When the cartoon _The Simpsons_ was dubbed into Arabic as {{آل شمشون}}, the family’s habits were adapted for Arab family viewers: Homer’s beer, for example, became a soft drink.'],")
s_old_arab = """['h', 'AVT in the Arab world'],
['p', 'According to the team’s course notes (Translation Team, n.d.):'],
['ul', [
  '**Challenges**: AVT lacks a clear definition and institutional support, and technology changes quickly.',
  '**Missed opportunities**: wider audiences for Arab films and websites, and more accessible content for people with disabilities.',
  '**Solutions**: closer links between universities and the media industry, and practical training, such as live subtitling.',
]],"""
replace(B, s_old_arab, """['h', 'How to start'],
['ol', [
  'Watch the whole video first, then read the script or dialogue list.',
  'Ask for the brief: subtitles or dubbing? For which viewers? In which Arabic?',
  'Practise with free subtitling software, such as Subtitle Edit or Aegisub.',
  'Watch films with Arabic subtitles and notice what the subtitler shortened.',
]],""")

# ---------- Chapter 27 ----------
replace(B, """  '**Bilingual**: two languages on screen at once.',\n""", "")
replace(B, """  'Also: **surtitles**, shown above the stage in theatres and opera houses, **intertitles** in silent films, and **fansubs** made by fans.',\n""", "")
before(B, "['h', 'Words, images and sound'],",
"""['h', 'Subtitling step by step'],
['ol', [
  'Watch the whole film or video, with the dialogue list if you have one.',
  '**Spot** the subtitles: mark when each one starts and ends.',
  'Translate the meaning of each line.',
  '**Condense**: cut what viewers can see or do not need, such as repetitions and fillers like _well_ and _you know_.',
  'Check the length, reading time and line breaks, then watch the video with your subtitles.',
]],
['h', 'An example'],
['p', '_Well, you know, I really don’t think we should go out tonight, because it’s going to rain._'],
['ar', 'لا أظنّ أن علينا الخروج الليلة، فالمطر قادم.'],
['p', 'The fillers disappear, and the meaning stays.'],
['h', 'Arabic subtitles'],
['ul', [
  'Write in Modern Standard Arabic, even when the characters speak a dialect, unless the client asks otherwise.',
  'Break a line where the meaning breaks: keep a noun with its adjective, and a preposition with its noun.',
  'Use Arabic punctuation.',
]],""")

files = {f: open(f).read() for f in (A, B)}
for fn, old, new in E:
    n = files[fn].count(old); assert n == 1, (n, old[:90])
    files[fn] = files[fn].replace(old, new)
for f, s in files.items(): open(f, 'w').write(s)
print(len(E), 'edits')
