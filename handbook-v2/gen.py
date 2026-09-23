# Generates the chapter pages from simple content blocks, so every chapter has the same layout.
A = lambda s: f'<span class="ar">{s}</span>'

def terms(rows):
    r = ''.join(f'<tr><td>{e}</td><td>{A(a)}</td><td>{m}</td></tr>' for e, a, m in rows)
    return f'<h2>Key terms</h2><table class="terms">{r}</table>'

def ex(head, rows, widths=None):
    w = widths or [None] * len(head)
    th = ''.join(f'<th{" class=r" if h.startswith("|") else ""}{f" style=width:{x}" if x else ""}>{h.lstrip("|")}</th>' for h, x in zip(head, w))
    tr = ''
    for row in rows:
        tds = ''
        for h, c in zip(head, row):
            tds += f'<td class="r">{c}</td>' if h.startswith('|') else f'<td>{c}</td>'
        tr += f'<tr>{tds}</tr>'
    hdr = '' if not any(h.strip('|') for h in head) else f'<tr>{th}</tr>'
    return f'<table>{hdr}{tr}</table>'

def remember(points):
    return '<div class="remember"><div class="t">Remember</div><ul>' + ''.join(f'<li>{p}</li>' for p in points) + '</ul></div>'

def chapter(cid, part, no, title, ar, intro, pages):
    head = f'<div class="part">{part}</div><div class="chno">Chapter {no}</div><h1>{title}</h1><div class="art">{ar}</div><div class="rule"></div><p class="intro">{intro}</p>'
    return f'<section class="page" data-id="{cid}" id="{cid}" data-title="Chapter {no} · {title}" data-ar="{ar}"><div class="body">{head}{"".join(pages)}</div><div class="pn"></div></section>'

P1, P2, P3, P4, P5 = 'Part 1 · Getting started', 'Part 2 · Understanding the text', 'Part 3 · Translating', 'Part 4 · Checking and explaining', 'Part 5 · Tools and text types'

ch = []

# ---------------- PART 1 ----------------
ch.append(chapter('c1', P1, 1, 'What is translation?', 'ما الترجمة؟',
 'This chapter explains what translation is and why meaning matters more than words.',
 [terms([('Translation', 'الترجمة التحريرية', 'Transferring the meaning of a <b>written</b> text into another language.'),
         ('Interpretation', 'الترجمة الشفهية', 'Transferring <b>spoken</b> language into another language.'),
         ('Communication', 'التواصل', 'Understanding and being understood.')]) +
  '<h2><span class="n">1.1</span>Translation carries meaning</h2>'
  '<p>A translator does not replace words one by one. A translator carries the <b>meaning</b> of a text from one language to another, so that a reader in the other language understands it.</p>'
  '<p>So translation is a kind of <b>communication between two languages</b>. If the reader does not understand the translation, it has failed.</p>'
  '<h2><span class="n">1.2</span>Translation is approximation</h2>'
  '<p>No two languages match perfectly. The translator’s job is to bring the meaning <b>as close as possible</b> to the target language, especially its cultural meaning (Chapter 12).</p>'
  '<h2><span class="n">1.3</span>The translator in the middle</h2>'
  '<p>The author writes for readers of one language. The translator reads the text, understands it, and rewrites it for readers of another language.</p>'
  '<svg viewBox="0 0 470 50" width="100%" style="margin:2mm 0 3mm"><g font-family="Outfit" font-size="10.5" text-anchor="middle"><defs><marker id="a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" fill="#6a0fd6"/></marker></defs>'
  '<rect x="0" y="6" width="110" height="34" rx="17" fill="#f3effc"/><text x="55" y="27" fill="#3d1591" font-weight="600">Author (SL)</text>'
  '<rect x="180" y="6" width="110" height="34" rx="17" fill="#6a0fd6"/><text x="235" y="27" fill="#fff" font-weight="600">Translator</text>'
  '<rect x="360" y="6" width="110" height="34" rx="17" fill="#f3effc"/><text x="415" y="27" fill="#3d1591" font-weight="600">Reader (TL)</text>'
  '<g stroke="#6a0fd6" stroke-width="1.3" marker-end="url(#a1)"><line x1="112" y1="23" x2="176" y2="23"/><line x1="292" y1="23" x2="356" y2="23"/></g></g></svg>'
  + remember(['Translate the <b>meaning</b>, not the words.', 'Always think about the <b>reader</b>.'])]))

ch.append(chapter('c2', P1, 2, 'The translator', 'المترجم',
 'This chapter describes the skills a translator needs and the two ways a translator can work.',
 [terms([('Commissioned translator', 'مترجم بتكليف', 'Translates for a client.'),
         ('Self-initiated translator', 'مترجم بمبادرة ذاتية', 'Chooses a text to translate, with no client.'),
         ('Bicultural', 'مُلِمّ بالثقافتين', 'Knows both cultures well.')]) +
  '<h2><span class="n">2.1</span>What a good translator needs</h2>'
  '<ul><li><b>Two languages.</b> Be fluent in both the source and the target language.</li>'
  '<li><b>Two cultures.</b> Cultural knowledge is as important as language knowledge.</li>'
  '<li><b>General knowledge.</b> A translator should be like a “walking encyclopedia”.</li>'
  '<li><b>A rich vocabulary</b> <span class="ar">(الحصيلة اللغوية)</span>, including idioms and fixed expressions.</li>'
  '<li><b>Practice.</b> Skill grows with experience and with revising your work.</li></ul>'
  '<h2><span class="n">2.2</span>Two ways of working</h2>'
  + ex(['Commissioned translator', 'Self-initiated translator'],
       [['A client asks you to translate. You follow the client’s style and policy.', 'Nobody asks you. You choose the text yourself, for example a poem you love.']]) +
  '<p class="note">A <b>freelancer</b> works for clients, so a freelancer is a <b>commissioned</b> translator.</p>'
  '<h2><span class="n">2.3</span>Five good habits</h2>'
  '<ol><li>Be <b>faithful</b> to the meaning <span class="ar">(الأمانة)</span>.</li><li>Aim to be accurate, faithful and acceptable to the reader.</li>'
  '<li>Remember that translation is <b>rewriting</b>: the text must read naturally.</li><li><b>Revise</b> every translation.</li><li>Translate everything, including titles and captions.</li></ol>'
  + remember(['A translator needs two languages <b>and</b> two cultures.', 'Revise every translation, even your best one.'])]))

ch.append(chapter('c3', P1, 3, 'Before you translate: the brief', 'قبل أن تترجم: موجز الترجمة',
 'This chapter shows you what to find out, and what to do, before you start translating.',
 [terms([('Translation brief', 'موجز الترجمة', 'The information you need before you start: client, purpose and audience.'),
         ('Target audience', 'الجمهور المستهدف', 'The people who will read the translation.')]) +
  '<h2><span class="n">3.1</span>Ask three questions</h2>'
  + ex(['Question', 'Why it matters'],
       [['<b>Who is the client?</b> <span class="ar">من هو العميل؟</span>', 'Each client has its own style and policy.'],
        ['<b>What is the purpose?</b> <span class="ar">ما الغرض؟</span>', 'Is the text meant to inform, persuade, instruct or entertain?'],
        ['<b>Who is the audience?</b> <span class="ar">من هو الجمهور؟</span>', 'Experts or the general public? Adults or children?']], ['42%', None]) +
  '<h2><span class="n">3.2</span>Prepare in five steps</h2>'
  '<ol><li><b>Read the whole text twice</b> before you translate.</li><li><b>Highlight</b> difficult words, idioms and names.</li>'
  '<li><b>Research</b> the topic.</li><li><b>Make a list</b> of the key terms (Chapter 14).</li><li><b>Picture a first draft</b> in your mind.</li></ol>'
  '<h2><span class="n">3.3</span>An example brief</h2>'
  + ex(['', ''], [['<b>Text</b>', 'A short news report'], ['<b>Client</b>', 'KUNA (Kuwait News Agency)'], ['<b>Purpose</b>', 'To inform'],
       ['<b>Audience</b>', 'English readers interested in Kuwait'], ['<b>So…</b>', 'Use a formal, neutral style and keep the headline short.']], ['28%', None]).replace('<tr><th></th><th></th></tr>', '')
  + remember(['No brief, no plan: find out the <b>client, purpose and audience</b> first.', 'Never start translating before you have read the whole text.'])]))

# ---------------- PART 2 ----------------
ch.append(chapter('c4', P2, 4, 'English and Arabic are different', 'الفروق بين الإنجليزية والعربية',
 'This chapter compares the two languages, so that you can avoid the most common problems.',
 [terms([('Verbal sentence', 'الجملة الفعلية', 'A sentence that starts with a verb.'),
         ('Register', 'المستوى اللغوي', 'How formal or informal the language is.'),
         ('Modern Standard Arabic', 'الفصحى المعاصرة', 'The Arabic of newspapers, laws and education.')]) +
  '<h2><span class="n">4.1</span>The main differences</h2>'
  + ex(['', 'English', 'Arabic'],
       [['<b>Word order</b>', 'Subject first: <em>Sam ate the cake.</em>', 'Verb first: ' + A('أكلَ سامٌ الكعكةَ')],
        ['<b>Sentences</b>', 'Short, with full stops', 'Long, joined with ' + A('و، ف، ثمّ')],
        ['<b>The verb “is”</b>', 'Always written', 'Often not written, or ' + A('يُعدّ')],
        ['<b>Synonyms</b>', 'One word is enough', 'Pairs add emphasis: ' + A('شجاعٌ مِغوار')],
        ['<b>Punctuation</b>', ', ; ?', A('، ؛ ؟')]], ['22%', '34%', None]) +
  '<h2><span class="n">4.2</span>Which Arabic?</h2>'
  '<p>Use <b>Modern Standard Arabic</b> for written translation. Use a dialect <span class="ar">(العامية)</span> only if the client asks for it, for example in film subtitles.</p>',
  '<h2><span class="n">4.3</span>Small words, big traps <span class="note">EN → AR</span></h2>'
  + ex(['English', '|Arabic', 'Why'],
       [['<em>He is in bed.</em>', A('إنه نائم'), 'It means “asleep”, not ' + A('في السرير') + '.'],
        ['<em>As an officer, I…</em>', A('بصفتي ضابطاً…'), 'Here <em>as</em> means a role, not ' + A('كـ') + '.'],
        ['<em>Translation is a fascinating field.</em>', A('تُعدّ الترجمة مجالاً شائقاً'), 'Start with a verb.'],
        ['<em>…to see the Roman ruins</em>', A('لزيارة الآثار الرومانية'), 'Arabic says “visit”.']], ['34%', '30%', None]) +
  '<h2><span class="n">4.4</span>Linking words <span class="note">EN → AR</span></h2>'
  '<p>Arabic joins ideas more than English does. These linking words help your Arabic flow:</p>'
  + ex(['English', '|Arabic', 'English', '|Arabic'],
       [['<em>however</em>', A('غير أنّ'), '<em>therefore</em>', A('لذلك')],
        ['<em>in addition</em>', A('بالإضافة إلى ذلك'), '<em>for example</em>', A('على سبيل المثال')],
        ['<em>on the other hand</em>', A('من ناحيةٍ أخرى'), '<em>as a result</em>', A('ونتيجةً لذلك')]]) +
  '<h2><span class="n">4.5</span>Numbers</h2>'
  '<p>With numbers from 3 to 10, the number takes the <b>opposite gender</b> to the noun: ' + A('ثلاثةُ طلابٍ') + ' but ' + A('ثلاثُ طالباتٍ') + '.</p>'
  + remember(['<b>EN → AR:</b> start with the verb and join short sentences.', '<b>AR → EN:</b> start with the subject, drop repeated synonyms and split long sentences.', 'Use Arabic punctuation in Arabic texts: ' + A('، ؛ ؟')])]))

ch.append(chapter('c5', P2, 5, 'Meaning, form and context', 'المعنى والبناء والسياق',
 'This chapter explains the most important rule in translation: meaning comes before form.',
 [terms([('Form', 'البناء', 'The structure of the words: word, phrase, sentence.'),
         ('Meaning', 'المعنى', 'The idea that the words express.'),
         ('Denotation', 'المعنى المعجمي', 'The basic dictionary meaning.'),
         ('Connotation', 'المعنى الإيحائي', 'The feeling a word carries: positive, negative, respectful.'),
         ('Context', 'السياق', 'The words and situation around a text.')]) +
  '<h2><span class="n">5.1</span>Meaning comes before form</h2>'
  '<p>You may change the <b>structure</b> of a sentence, but you must never change its <b>meaning</b> <span class="ar">(المعنى أهمّ من البناء)</span>.</p>'
  + ex(['English', '|Arabic', 'Why'],
       [['<em>Blair, Bush’s poodle</em>', A('بلير، تابعُ بوش'), '“Poodle” has no political meaning in Arabic, so we keep the idea: “an obedient follower”.'],
        ['<em>He is a heavy smoker.</em>', A('يدخّن بشراهة'), 'The adjective becomes a verb, and the meaning stays the same.']], ['30%', '26%', None]),
  '<h2><span class="n">5.2</span>Same meaning, different feeling</h2>'
  + ex(['Word', 'Feeling'],
       [['<em>die</em> ' + A('مات'), 'Neutral'], ['<em>pass away</em> ' + A('توفّي'), 'Respectful'],
        ['<em>kill</em> ' + A('قتل') + ' · <em>assassinate</em> ' + A('اغتال'), '“Assassinate” is political'],
        ['<em>friend</em> ' + A('صديق') + ' · <em>comrade</em> ' + A('رفيق'), '“Comrade” means a member of the same party']], ['52%', None]) +
  '<h2><span class="n">5.3</span>What the speaker really means</h2>'
  '<p>Sometimes a speaker means more than the words say:</p>'
  + ex(['Words', 'Real meaning'], [[A('أشعرُ بالحرّ'), '“Please turn on the air conditioning.”'], ['<em>It’s freezing in here.</em>', '“Please close the window.”']], ['40%', None]) +
  '<h2><span class="n">5.4</span>Context tells you which meaning</h2>'
  '<p>Many words have more than one meaning. The <b>context</b> tells you which one is correct <span class="ar">(لكلّ مقامٍ مقال)</span>.</p>'
  + ex(['Word', 'Meanings'], [['<em>bank</em>', A('مصرف') + ' (a financial bank) · ' + A('ضفّة النهر') + ' (a river bank)'],
                              [A('عين'), 'an eye · a water spring · a spy'], ['<em>case</em>', A('قضية') + ' (in court) · ' + A('حالة') + ' (in medicine) · ' + A('علبة') + ' (a box)']], ['22%', None])
  + remember(['Change the form if you need to, but <b>never</b> change the meaning.', 'Check the <b>connotation</b>, not only the dictionary meaning.', 'Let the <b>context</b> decide which meaning is correct.'])]))

ch.append(chapter('c6', P2, 6, 'Analysing the text', 'تحليل النص',
 'This chapter shows you how to study a text carefully before you translate it.',
 [terms([('Text analysis', 'تحليل النص', 'Studying a text before translating it.'),
         ('Genre', 'الجنس النصّي', 'The type of text: news, contract, poem, advert…'),
         ('Tone', 'النبرة', 'The writer’s attitude: neutral, critical, friendly…')]) +
  '<h2><span class="n">6.1</span>Why analyse first?</h2>'
  '<ul><li>You understand the text better with every reading.</li><li>You can find the difficult parts in advance.</li><li>You can choose your strategies before you start.</li><li>You can decide which resources you need.</li></ul>'
  '<h2><span class="n">6.2</span>Analysis is not a summary</h2>'
  + ex(['Analysis', 'Summary'], [['Describes the text: who wrote it, for whom, why, and how.', 'Only says what the text is about.']]) +
  '<p>When you are asked to analyse, do <b>not</b> summarise.</p>',
  '<h2><span class="n">6.3</span>Ten analysis questions</h2>'
  '<p>Answer these questions for every new text. The example answers are for a short KUNA news report.</p>'
  + ex(['Question', 'Example answer'],
       [['1. Who wrote it, and who published it?', 'A KUNA reporter; KUNA'], ['2. Who is the client?', 'KUNA’s English service'],
        ['3. What is the purpose?', 'To inform'], ['4. Who is the audience?', 'Readers interested in Kuwait'],
        ['5. What is the genre?', 'A news report'], ['6. What is the field?', 'Politics'],
        ['7. What are the tone and style?', 'Neutral and formal'], ['8. Which terms need checking?', 'Official titles'],
        ['9. Are there any cultural items?', 'Forms of address'], ['10. Which strategies and resources will I use?', 'Mostly literal; a news-style guide']], ['52%', None])
  + '<p class="note">A blank copy of these questions is on the worksheet page at the back of the book.</p>'
  + remember(['Analyse <b>before</b> you translate.', 'Your translation must match your analysis: if you call the tone formal, keep it formal.'])]))

# ---------------- PART 3 ----------------
ch.append(chapter('c7', P3, 7, 'Equivalence', 'التكافؤ',
 'This chapter explains how to find the target-language expression that matches the source.',
 [terms([('Equivalence', 'التكافؤ', 'A TL expression that matches the SL expression.'),
         ('Formal equivalence', 'التكافؤ الشكلي', 'Keeps the <b>form</b> of the original.'),
         ('Functional equivalence', 'التكافؤ الوظيفي', 'Keeps the <b>function</b>, using a TL expression that does the same job.'),
         ('Ideational equivalence', 'التكافؤ الفكري', 'Keeps only the <b>basic idea</b>, in plain words.')]) +
  '<h2><span class="n">7.1</span>One sentence, three choices</h2>'
  '<p><em>The agreement has remained a dead letter since then.</em></p>'
  + ex(['Type', '|Arabic', 'Result'],
       [['Formal', A('ظلّت الاتفاقية حرفاً ميتاً منذ ذلك الحين'), 'Same image, but unclear to readers'],
        ['Functional', A('ظلّت الاتفاقية حبراً على ورق منذ ذلك الحين'), '<span class="ok">✓</span> A familiar Arabic idiom'],
        ['Ideational', A('لم تُطبَّق الاتفاقية منذ ذلك الحين'), 'Clear, but the image is lost']], ['20%', '46%', None]) +
  '<h2><span class="n">7.2</span>More examples</h2>'
  + ex(['English', '|Functional', '|Ideational'],
       [['<em>Ali is second to none in poetry.</em>', A('عليٌّ لا يُشقّ له غبار في الشعر'), A('عليٌّ شاعرٌ متميّز')]], ['36%', None, None])
  + remember(['If the form does not work, keep the <b>function</b>.', 'If no idiom fits, keep the <b>idea</b>.'])]))

ch.append(chapter('c8', P3, 8, 'Collocations and idioms', 'التلازم اللفظي والتعابير الاصطلاحية',
 'This chapter explains word partners and fixed expressions, which must never be translated word by word.',
 [terms([('Collocation', 'التلازم اللفظي', 'Words that naturally go together, like <em>strong tea</em>.'),
         ('Idiom', 'التعبير الاصطلاحي', 'A fixed expression whose meaning is not the sum of its words.'),
         ('Proverb', 'المثل', 'A traditional saying.')]) +
  '<h2><span class="n">8.1</span>Collocations <span class="note">EN → AR</span></h2>'
  + ex(['English', '|Arabic', 'Not'],
       [['<em>pay attention</em>', A('ينتبه'), '<span class="x">' + A('يدفع الانتباه') + '</span>'],
        ['<em>pay a visit</em>', A('يقوم بزيارة'), '<span class="x">' + A('يدفع زيارة') + '</span>'],
        ['<em>strong tea</em>', A('شاي ثقيل'), '<span class="x">' + A('شاي قوي') + '</span>'],
        ['<em>a fast colour</em>', A('لون ثابت'), '<span class="x">' + A('لون سريع') + '</span>'],
        ['<em>a close friend</em>', A('صديق مقرّب'), '']], ['36%', '32%', None]) +
  '<h2><span class="n">8.2</span>Collocations <span class="note">AR → EN</span></h2>'
  + ex(['Arabic', 'English'], [[A('يساورني القلق'), '<em>I am growing worried</em>'], [A('قدّم استقالته'), '<em>he resigned</em>'],
                               [A('اتّخذ قراراً'), '<em>made a decision</em>'], [A('عقد اجتماعاً'), '<em>held a meeting</em>']], ['40%', None]),
  '<h2><span class="n">8.3</span>Idioms <span class="note">EN → AR</span></h2>'
  + ex(['English', '|Arabic'],
       [['<em>It’s raining cats and dogs.</em>', A('تمطر بغزارة')], ['<em>over the moon</em>', A('يطير من الفرح')],
        ['<em>to spill the beans</em>', A('أفشى السرّ')], ['<em>I’m all ears.</em>', A('كلّي آذانٌ صاغية')],
        ['<em>Break a leg!</em>', A('بالتوفيق!')], ['<em>It has been a long day.</em>', A('كان يوماً شاقّاً')]], ['55%', None]) +
  '<h2><span class="n">8.4</span>Proverbs <span class="note">AR → EN</span></h2>'
  + ex(['Arabic', 'English'],
       [[A('كالمستجير من الرمضاء بالنار'), '<em>out of the frying pan into the fire</em>'], [A('رجع بخُفَّي حُنين'), '<em>he came back empty-handed</em>'],
        [A('عصفورٌ في اليد خيرٌ من عشرةٍ على الشجرة'), '<em>a bird in the hand is worth two in the bush</em>'], [A('لكلّ مقامٍ مقال'), '<em>there is a time and a place for everything</em>']], ['50%', None])
  + remember(['Learn words <b>with their partners</b>.', 'Never translate an idiom word by word, but check first that it really is an idiom in this context.'])]))

ch.append(chapter('c9', P3, 9, 'Literal and free translation', 'الترجمة الحرفية والترجمة الحرّة',
 'This chapter compares staying close to the source with moving closer to the reader.',
 [terms([('Literal translation', 'الترجمة الحرفية', 'Keeps the words and changes only the grammar.'),
         ('Free translation', 'الترجمة الحرّة', 'Keeps the message, but not the form.'),
         ('Communicative translation', 'الترجمة التواصلية', 'Aims to sound natural to the reader.')]) +
  '<h2><span class="n">9.1</span>Literal translation: sometimes right, sometimes wrong</h2>'
  + ex(['English', '|Arabic', 'Result'],
       [['<em>The book is on the table.</em>', A('الكتاب على الطاولة'), '<span class="ok">✓ Works</span>'],
        ['<em>to play a role</em>', A('يلعب دوراً'), '<span class="ok">✓ Works</span>'],
        ['<em>to pay a visit</em>', A('يدفع زيارة'), '<span class="x">✗ Use ' + A('يقوم بزيارة') + '</span>'],
        ['<em>a long day</em>', A('يوم طويل'), '<span class="x">✗ Use ' + A('يوم شاقّ') + '</span>']], ['36%', '30%', None]) +
  '<h2><span class="n">9.2</span>Free translation: not too free</h2>'
  + ex(['English', '|Free translation', 'Result'],
       [['<em>Appointing new staff should be based on equal opportunity.</em>', A('يجب أن يتمّ تعيين الموظفين الجدد بعيداً عن المحسوبية والواسطة'), '<span class="ok">✓</span> Same message'],
        ['<em>We have had heavy rainfall this winter.</em>', A('سيكون لدينا موسم زراعي مبشّر'), '<span class="x">✗</span> Adds a new idea']], ['34%', '40%', None]) +
  '<h2><span class="n">9.3</span>Other types of translation</h2>'
  + ex(['Type', 'What it means'],
       [['Sight translation', 'Reading a written text aloud in another language'], ['Interpreting', 'Translating speech, during or after the speaker'],
        ['Subtitling', 'Translating film dialogue within time and space limits'], ['Localisation', 'Adapting websites and apps for another country']], ['32%', None])
  + remember(['Use literal translation only when the result is natural.', 'Free translation may change the form, but not the message.'])]))

procs = [('Borrowing', 'الاقتراض', 'Take the word as it is.', '<em>computer</em> → ' + A('كمبيوتر')),
         ('Calque', 'النسخ', 'Translate each part of the expression.', '<em>skyscraper</em> → ' + A('ناطحة سحاب')),
         ('Literal translation', 'الترجمة الحرفية', 'Translate word for word, when this is correct.', '<em>The book is on the table.</em> → ' + A('الكتاب على الطاولة')),
         ('Transposition', 'الإبدال', 'Change the word class, e.g. noun → verb.', '<em>after his arrival</em> → ' + A('بعد أن وصل')),
         ('Modulation', 'التحوير', 'Change the point of view.', '<em>It is not difficult.</em> → ' + A('إنه سهل')),
         ('Equivalence', 'التكافؤ', 'Use a completely different fixed expression.', '<em>Like father, like son.</em> → ' + A('هذا الشبل من ذاك الأسد')),
         ('Adaptation', 'التكييف', 'Replace a cultural situation with a familiar one.', '<em>like Romeo and Juliet</em> → ' + A('كقيسٍ وليلى'))]
ch.append(chapter('c10', P3, 10, 'The seven translation procedures', 'إجراءات الترجمة السبعة',
 'This chapter presents seven techniques for translating words and phrases, from the closest to the source to the freest.',
 ['<p>These seven procedures were described by Vinay and Darbelnet. Procedures 1–3 stay <b>close</b> to the source. Procedures 4–7 move <b>further</b> away, and you use them when a close translation sounds wrong.</p>'
  + ex(['', 'Procedure', 'What it does', 'Example'],
       [[f'<b style="color:var(--purple)">{i+1}</b>', f'<b>{e}</b><br>{A(a)}', w, x] for i, (e, a, w, x) in enumerate(procs)], ['5%', '24%', '30%', None]) +
  '<p class="note">1–3 = direct procedures · 4–7 = oblique procedures</p>',
  '<h2><span class="n">10.1</span>The procedures in one sentence</h2>'
  '<p><em>After his arrival in Kuwait, the minister held a press conference at the Sheraton and said the reforms were not impossible.</em></p>'
  '<p style="text-align:right">' + A('بعد أن وصل الوزير إلى الكويت، عقد مؤتمراً صحفياً في فندق شيراتون، وقال إنّ الإصلاحات ممكنة.') + '</p>'
  + ex(['English', '|Arabic', 'Procedure'],
       [['<em>after his arrival</em>', A('بعد أن وصل'), 'Transposition (noun → verb)'], ['<em>press conference</em>', A('مؤتمر صحفي'), 'Calque'],
        ['<em>Sheraton</em>', A('شيراتون'), 'Borrowing'], ['<em>not impossible</em>', A('ممكنة'), 'Modulation']], ['32%', '28%', None]) +
  '<h2><span class="n">10.2</span>Why learn the names?</h2>'
  '<p>When you write a commentary (Chapter 17), you can <b>name</b> the procedure you used and explain why. For example: <em>“After his arrival” was changed into a verb because Arabic prefers verbs.</em></p>'
  + remember(['Start with procedures 1–3.', 'Move to 4–7 when the result sounds unnatural or unclear.'])]))

ch.append(chapter('c11', P3, 11, 'Translation strategies', 'استراتيجيات الترجمة',
 'This chapter gives you practical solutions for words and expressions that have no direct equivalent.',
 [terms([('Strategy', 'الاستراتيجية', 'A planned solution to a translation problem.')]) +
  '<h2><span class="n">11.1</span>Six useful strategies</h2>'
  + ex(['Strategy', 'Use it when…', 'Example'],
       [['<b>Functional translation</b><br>' + A('الترجمة الوظيفية'), 'a TL expression does the same job', '<em>spill the beans</em> → ' + A('أفشى السرّ')],
        ['<b>Cultural substitution</b><br>' + A('الإبدال الثقافي'), 'a cultural reference would mean nothing to the reader', '<em>Romeo and Juliet</em> → ' + A('قيس وليلى')],
        ['<b>Addition</b><br>' + A('الإضافة'), 'the reader needs extra information (common EN → AR)', '<em>the Fed</em> → ' + A('مجلس الاحتياطي الفيدرالي الأمريكي')],
        ['<b>Omission</b><br>' + A('الحذف'), 'words repeat the same meaning (common AR → EN)', A('شجاعٌ مِغوار') + ' → <em>very brave</em>'],
        ['<b>A more general word</b><br>' + A('اللفظ الأعمّ'), 'the TL has no exact word', '<em>prawns / shrimps</em> → ' + A('روبيان')],
        ['<b>Borrowing + explanation</b><br>' + A('الاقتراض مع الشرح'), 'a cultural word must be kept', A('الوقف') + ' → <em>waqf</em> (a charitable endowment)']], ['30%', '32%', None]) +
  '<p class="note">Never add information to headlines, and never omit real information.</p>',
  '<h2><span class="n">11.2</span>Translating metaphors</h2>'
  '<p>A <b>metaphor</b> <span class="ar">(الاستعارة)</span> compares two things without “as” or “like”: <em>She is a moon.</em> A <b>simile</b> <span class="ar">(التشبيه)</span> uses “as” or “like”. Follow these four steps, in order:</p>'
  + ex(['Step', 'Example'],
       [['<b>1. Keep the image</b> if both languages share it.', '<em>She is a snake.</em> → ' + A('إنها أفعى')],
        ['<b>2. Use an Arabic image</b> if the English one is unfamiliar.', '<em>the tip of the iceberg</em> → ' + A('غيضٌ من فيض')],
        ['<b>3. Change it into a simile.</b>', '<em>He is a rock.</em> → ' + A('إنه كالصخرة في ثباته')],
        ['<b>4. Give the plain meaning</b> (the last option).', '<em>He is a chicken.</em> → ' + A('إنه جبان')]], ['50%', None]) +
  '<h2><span class="n">11.3</span>Domestication and foreignisation</h2>'
  '<p><b>Domestication</b> <span class="ar">(التوطين)</span> makes the text feel local to the reader. <b>Foreignisation</b> <span class="ar">(التغريب)</span> keeps its foreign flavour. For example, <em>the diwaniya</em> (foreignised) or <em>a men’s evening gathering</em> (domesticated).</p>'
  + remember(['Choose a strategy for each problem, not for the whole text.', 'For metaphors: keep the image, replace it, turn it into a simile, or explain it, in that order.'])]))

ch.append(chapter('c12', P3, 12, 'Culture in translation', 'الثقافة في الترجمة',
 'This chapter explains how to translate expressions that belong to one culture.',
 [terms([('Cultural approximation', 'التقريب الثقافي', 'Bringing cultural meaning as close as possible to the TL reader.'),
         ('Culture-specific item', 'عنصر ثقافي خاص', 'A word or custom that belongs to one culture.')]) +
  '<h2><span class="n">12.1</span>Expressions <span class="note">EN → AR</span></h2>'
  + ex(['English', '|Arabic'],
       [['<em>I’ve got the test in the bag.</em>', A('الامتحان في جيبي')], ['<em>cut from the same cloth</em>', A('من طينةٍ واحدة')],
        ['<em>a scapegoat</em>', A('كبش الفداء')], ['<em>like mother, like daughter</em>', A('اقلب الجرّة على فمها تطلع البنت لأمّها')]], ['50%', None]) +
  '<h2><span class="n">12.2</span>When climate changes meaning</h2>'
  + ex(['English', '|Arabic', 'Why'], [['<em>The news warmed my heart.</em>', A('أثلجَ الخبرُ صدري'), 'In a hot climate, relief feels <b>cold</b>.']], ['34%', '28%', None]) +
  '<p>Shakespeare wrote: <em>“Shall I compare thee to a summer’s day?”</em> An English summer is mild and lovely, but a Gulf summer is harsh, so many translators choose spring: ' + A('أأشبّهكِ بيومٍ ربيعيّ؟') + '</p>',
  '<h2><span class="n">12.3</span>Titles and institutions</h2>'
  + ex(['English', '|Arabic'],
       [['<em>the Home Office</em> (UK)', A('وزارة الداخلية')], ['<em>the Secretary of State</em> (US)', A('وزير الخارجية')],
        ['<em>the Chancellor of the Exchequer</em> (UK)', A('وزير المالية')], ['<em>the Secretary of the Treasury</em> (US)', A('وزير الخزانة')]], ['55%', None]) +
  '<h2><span class="n">12.4</span>Social expressions</h2>'
  '<p>Translate greetings and condolences with the phrase people actually use <b>in the same situation</b>:</p>'
  + ex(['English', '|Arabic', 'Situation'],
       [['<em>I’m sorry for your loss.</em>', A('عظّم الله أجركم'), 'Condolence'], ['<em>Welcome! It’s an honour.</em>', A('أهلاً وسهلاً، شرّفتمونا'), 'Hospitality'],
        ['<em>Thank you for your hard work.</em>', A('الله يعطيك العافية'), 'Thanks'], ['<em>Many happy returns!</em>', A('عساكم من عُوّاده'), 'Gulf festive greeting']], ['38%', '34%', None])
  + remember(['Translate the <b>effect</b>, not the image.', 'Use the expression a TL speaker would use in the same situation.'])]))

ch.append(chapter('c13', P3, 13, 'When there is no equivalent', 'عندما لا يوجد مقابل',
 'This chapter shows two solutions for words that have no equivalent: describing them, and creating new words.',
 [terms([('Descriptive translation', 'الترجمة الوصفية', 'Explaining a word by describing its meaning.'),
         ('Lexical creation', 'النحت المعجمي', 'Creating a new word in the TL.'),
         ('Transliteration', 'النقل الصوتي', 'Writing the sounds of a word in the other alphabet.')]) +
  '<h2><span class="n">13.1</span>Describe the word</h2>'
  '<p>For cultural and religious words, first <b>transliterate</b> the word, then <b>describe</b> it in brackets or in a footnote. Do this only the first time the word appears.</p>'
  + ex(['Arabic', 'English'],
       [[A('الزكاة'), '<em>zakat</em> (obligatory almsgiving in Islam)'], [A('التيمّم'), '<em>tayammum</em> (ritual washing with clean earth when there is no water)'],
        [A('البسملة'), '<em>the basmala</em> (saying “In the name of God, the Most Gracious, the Most Merciful”)'],
        [A('العِدّة'), '<em>ʿidda</em> (the waiting period before a divorced or widowed woman may remarry)']], ['22%', None]) +
  '<p class="note">This is the <b>last option</b>, because it makes the text longer.</p>',
  '<h2><span class="n">13.2</span>Create a new word</h2>'
  + ex(['Method', 'Example'],
       [['<b>New word</b>', '<em>blog</em> → ' + A('مدوّنة')], ['<b>Translate each part</b> (calque)', '<em>smartphone</em> → ' + A('الهاتف الذكي')],
        ['<b>Borrow the sounds</b>', '<em>radio</em> → ' + A('راديو')], ['<b>Mix both</b>', '<em>cybersecurity</em> → ' + A('الأمن السيبراني')],
        ['<b>Short explanation</b>', '<em>jet lag</em> → ' + A('إرهاق السفر')]], ['42%', None]) +
  '<h2><span class="n">13.3</span>New words in the news</h2>'
  + ex(['English', '|Arabic'], [['<em>greenwashing</em>', A('التضليل البيئي')], ['<em>cancel culture</em>', A('ثقافة الإلغاء')], ['<em>global warming</em>', A('الاحترار العالمي')]], ['55%', None]) +
  '<p><b>Search before you create.</b> An accepted word from the Arabic language academies or UNTERM is always better than a new invention.</p>'
  + remember(['Describe only the first time a word appears.', 'Look for an existing term before you create a new one.'])]))

ch.append(chapter('c14', P3, 14, 'Terminology', 'المصطلحات',
 'This chapter shows you how to find, check and record specialised terms.',
 [terms([('Term', 'المصطلح', 'A word with a special meaning in one field, e.g. law or medicine.'),
         ('Term list', 'قائمة المصطلحات', 'A table of approved terms for a project.')]) +
  '<h2><span class="n">14.1</span>Four steps</h2>'
  '<ol><li><b>Find</b> the key terms in the text.</li><li><b>Check</b> them in reliable sources.</li><li><b>Record</b> each term and its context.</li><li><b>Share</b> the list, so the whole team uses the same terms.</li></ol>'
  '<h2><span class="n">14.2</span>A simple term list</h2>'
  + ex(['English term', '|Arabic term', 'Field', 'Note'],
       [['<em>governing law</em>', A('القانون الواجب التطبيق'), 'Legal', 'Not ' + A('القانون الحاكم')],
        ['<em>provided that</em>', A('شريطةَ أن'), 'Legal', 'Contract condition'],
        ['<em>Article</em> (of a law)', A('مادّة'), 'Legal', 'A contract <em>clause</em> = ' + A('بند')],
        ['<em>greenwashing</em>', A('التضليل البيئي'), 'Environment', 'Also ' + A('الغسل الأخضر')]], ['28%', '28%', '16%', None]) +
  '<p><b>Where to check Arabic terms:</b> UNTERM (United Nations), Arabterm, the Arabic language academies, and the client’s own glossary.</p>'
  + remember(['Use <b>one term for one idea</b> throughout the text.', 'Do not change a term “for variety”: a new word suggests a new meaning.'])]))

# ---------------- PART 4 ----------------
ch.append(chapter('c15', P4, 15, 'Revising your translation', 'مراجعة الترجمة',
 'This chapter shows you how to check your translation and avoid the most common mistakes.',
 [terms([('Revision', 'المراجعة', 'Checking a translation against the source and correcting it.')]) +
  '<h2><span class="n">15.1</span>Revise in three readings</h2>'
  '<ol><li><b>Accuracy reading</b>, with the source text: is anything missing, added or changed?</li>'
  '<li><b>Fluency reading</b>, without the source text: does it sound natural?</li>'
  '<li><b>Final check</b>: numbers, names, punctuation, titles and captions.</li></ol>'
  '<h2><span class="n">15.2</span>Common mistakes in Arabic <span class="note">EN → AR</span></h2>'
  + ex(['Mistake', '|Wrong ✗', '|Right ✓'],
       [['Subject first', A('الحكومة أعلنت…'), A('أعلنت الحكومة…')], ['Overusing ' + A('قام بـ'), A('قام الوزير بزيارة الكويت'), A('زار الوزير الكويت')],
        ['Passive with ' + A('من قِبَل'), A('تمّ افتتاح المعرض من قِبَل الوزير'), A('افتتح الوزير المعرض')],
        ['Numbers 3–10', A('ثلاث طلاب'), A('ثلاثة طلاب')], ['Spelling', A('انشاء · مدرسه · الى'), A('إنشاء · مدرسة · إلى')],
        ['Punctuation', A('نعم, شكراً?'), A('نعم، شكراً؟')]], ['28%', None, None]),
  '<h2><span class="n">15.3</span>Common mistakes in English <span class="note">AR → EN</span></h2>'
  + ex(['Mistake', 'Wrong ✗', 'Right ✓'],
       [['Very long sentences', '<em>…and he said and he added and…</em>', 'Split them with full stops.'],
        ['Repeated synonyms', '<em>brave and daring</em>', '<em>very brave</em>'], ['Extra “the”', '<em>The life is beautiful.</em>', '<em>Life is beautiful.</em>'],
        ['Missing verb “to be”', '<em>He in the office.</em>', '<em>He is in the office.</em>'], ['Arabic preposition', '<em>He married from her.</em>', '<em>He married her.</em>'],
        ['No capital letters', '<em>the minister of health</em>', '<em>the Minister of Health</em>']], ['30%', None, None]) +
  '<h2><span class="n">15.4</span>Post-editing</h2>'
  '<p><b>Post-editing</b> <span class="ar">(التحرير اللاحق)</span> means correcting a machine translation. It is now an important part of the translator’s work (Chapter 20).</p>'
  + remember(['Read your translation once <b>without</b> the source text.', 'If a sentence sounds translated, rewrite it.'])]))

ch.append(chapter('c16', P4, 16, 'Spotting risks', 'تقييم المخاطر',
 'This chapter helps you find the places where a translation mistake could cause real harm.',
 [terms([('Risk', 'الخطر', 'The chance that a translation choice causes a problem.')]) +
  '<p>Before you deliver a translation, look for these risky places:</p>'
  + ex(['Risk', 'Example', 'What to do'],
       [['<b>Wrong term</b>', '<em>governing law</em> → ' + A('القانون الحاكم'), 'Check a specialised dictionary'],
        ['<b>Lost “not”</b>', 'A negative sentence becomes positive', 'Compare sentence by sentence'],
        ['<b>Cultural image</b>', '<em>warmed my heart</em> → ' + A('أدفأ قلبي'), 'Use cultural approximation'],
        ['<b>Sensitive names</b>', '<em>Persian Gulf / Arabian Gulf</em>', 'Follow the client; mention it in your commentary'],
        ['<b>Legal words</b>', '<em>shall</em> → ' + A('سوف'), 'Use the Arabic present tense'],
        ['<b>Numbers and dates</b>', 'Wrong figure, Hijri or Gregorian date', 'Check every number'],
        ['<b>Wrong style</b>', 'A dialect word in a formal report', 'Re-read with the brief in mind'],
        ['<b>Unclear word</b>', A('علم') + ': flag, knowledge or taught?', 'Read the words around it']], ['24%', '38%', None]) +
  '<p>The more <b>serious</b> the possible harm, the more carefully you should check, for example by asking a second person to review your translation.</p>'
  + remember(['Check numbers, names, negatives and legal words every time.', 'When a risk is high, ask a second person to check.'])]))

ch.append(chapter('c17', P4, 17, 'Writing a commentary', 'كتابة التعليق على الترجمة',
 'This chapter shows you how to explain and justify your translation choices.',
 [terms([('Commentary', 'التعليق على الترجمة', 'A short text that explains the problems in a translation and justifies the solutions.')]) +
  '<h2><span class="n">17.1</span>Five parts for each problem</h2>'
  + ex(['Part', 'Question'], [['1. Problem', 'What was difficult?'], ['2. Solution', 'What did you write?'], ['3. Strategy', 'Which strategy or procedure did you use?'], ['4. Resource', 'Which dictionary or source did you check?'], ['5. Justification', 'Why is your choice right?']], ['30%', None]) +
  '<h2><span class="n">17.2</span>An example</h2>'
  '<p style="background:var(--soft);padding:3mm 4mm;border-radius:1.5mm">The ST says the agreement “remained a dead letter”. A literal translation, ' + A('حرفاً ميتاً') + ', would confuse Arab readers, so the translator chose ' + A('حبراً على ورق') + '. This is a <b>functional equivalent</b>. It was checked in Arabic newspapers. It is a familiar idiom and suits the formal style of the news report.</p>'
  '<h2><span class="n">17.3</span>Rules</h2>'
  '<ul><li>Write in the <b>third person</b>: “The translator…”</li><li><b>Quote</b> examples and <b>name</b> the strategy.</li><li>Always explain <b>why</b>.</li></ul>'
  + remember(['Problem → solution → strategy → resource → justification.'])]))

ch.append(chapter('c18', P4, 18, 'Language and ideology', 'اللغة والأيديولوجيا',
 'This chapter explains how word choices can show a point of view, and what a translator should do about it.',
 [terms([('Ideology', 'الأيديولوجيا', 'A set of beliefs that affects how events are described.'),
         ('Discourse analysis', 'تحليل الخطاب', 'Studying how language shows power and ideology.')]) +
  '<h2><span class="n">18.1</span>No word is neutral</h2>'
  '<p>Word choices can show a point of view. Your translation can keep, soften or strengthen it.</p>'
  + ex(['English', '|Arabic', 'Note'],
       [['<em>regime</em> · <em>government</em>', A('نظام · حكومة'), '“Regime” is negative'],
        ['<em>suicide bomber</em>', A('انتحاري / استشهادي'), 'The choice depends on the client’s policy'],
        ['<em>Protesters were killed.</em>', A('قُتل متظاهرون'), 'The passive hides who did it']], ['34%', '32%', None]) +
  '<h2><span class="n">18.2</span>Three levels (Fairclough)</h2>'
  '<p>Norman Fairclough looks at every text on three levels:</p>'
  + ex(['Level', 'Ask'], [['1. The text', 'Which words show judgement? Who is the doer?'], ['2. Its production', 'Who wrote it, and for which newspaper or organisation?'], ['3. Society', 'Whose interests does it serve?']], ['30%', None])
  + remember(['Notice loaded words.', 'Follow the client’s policy, and explain your choice in the commentary.'])]))

# ---------------- PART 5 ----------------
ch.append(chapter('c19', P5, 19, 'Dictionaries', 'المعاجم',
 'This chapter shows you which dictionaries to use and how to use them well.',
 [terms([('Bilingual dictionary', 'معجم ثنائي اللغة', 'Gives equivalents in another language.'),
         ('Monolingual dictionary', 'معجم أحادي اللغة', 'Explains words in the same language.')]) +
  '<h2><span class="n">19.1</span>Useful dictionaries</h2>'
  + ex(['Dictionary', 'Use it for'],
       [['<b>Al-Mawrid</b> (English–Arabic, Arabic–English)', 'Everyday words in both directions'], ['<b>Hans Wehr</b>, <em>A Dictionary of Modern Written Arabic</em>', 'Arabic words, organised by root'],
        ['<b>Al-Muʿjam al-Wasīṭ</b> ' + A('المعجم الوسيط'), 'Checking Arabic meanings'], ['<b>Oxford Collocations Dictionary</b>', 'Finding natural English word partners'],
        ['<b>Online dictionaries</b> (e.g. Almaany)', 'Quick searches. Always double-check them.'], ['<b>UNTERM</b>, <b>Arabterm</b>', 'Official and technical terms']], ['50%', None]) +
  '<h2><span class="n">19.2</span>The three-check rule</h2>'
  '<ol><li>Find options in a <b>bilingual</b> dictionary.</li><li>Confirm the meaning in a <b>monolingual</b> dictionary.</li><li>Check real use in a <b>text written in the TL</b>.</li></ol>'
  '<p><b>Example:</b> for <em>fast colour</em>, a bilingual dictionary gives ' + A('سريع، ثابت') + '. An Arabic dictionary confirms that ' + A('ثابت') + ' means “does not fade”. So the answer is ' + A('لون ثابت') + '.</p>'
  + remember(['Never take the first meaning a dictionary gives.', 'Check in a bilingual dictionary, then a monolingual one, then a real text.'])]))

ch.append(chapter('c20', P5, 20, 'Machine translation and AI', 'الترجمة الآلية والذكاء الاصطناعي',
 'This chapter explains how to use machine translation and AI tools safely.',
 [terms([('Machine translation', 'الترجمة الآلية', 'Translation done by software, such as Google Translate or AI chat tools.'),
         ('Post-editing', 'التحرير اللاحق', 'A human correcting machine translation.'),
         ('Hallucination', 'الهلوسة', 'AI output that is not in the source, such as an invented fact.')]) +
  '<h2><span class="n">20.1</span>Useful or risky?</h2>'
  + ex(['Useful for', 'Risky for'], [['A first draft of simple texts<br>Checking ideas<br>Large amounts of text', 'Legal, medical and religious texts<br>Idioms and poetry<br>Private or confidential texts']]) +
  '<h2><span class="n">20.2</span>Typical machine mistakes</h2>'
  + ex(['English', '|Machine ✗', '|Correct ✓'],
       [['<em>It’s raining cats and dogs.</em>', A('إنها تمطر قططاً وكلاباً'), A('تمطر بغزارة')],
        ['<em>The doctor said she…</em>', A('قال الطبيب…'), A('قالت الطبيبة…')]], ['36%', None, None]) +
  '<h2><span class="n">20.3</span>Four rules</h2>'
  '<ol><li><b>You are responsible</b> for every word, whatever tool you use.</li><li>Never put a client’s <b>private text</b> into a public AI tool.</li><li><b>Check</b> terms, names, numbers, idioms and every “not”.</li><li><b>Tell the client</b> if you used a machine or AI.</li></ol>'
  + remember(['Machine translation is a first draft, not a final translation.'])]))

genres = [('News', 'Facts, neutral tone, short headlines', '<em>Oil prices rose sharply on Monday.</em><br>' + A('ارتفعت أسعار النفط ارتفاعاً حادّاً يوم الاثنين.')),
          ('Legal', 'Exact words; <em>shall</em> means an obligation', '<em>This Agreement shall be governed by the laws of the State of Kuwait.</em><br>' + A('تخضع هذه الاتفاقية لقوانين دولة الكويت.')),
          ('Political', 'Careful, sensitive words', '<em>The two sides held frank and constructive talks.</em><br>' + A('أجرى الجانبان محادثاتٍ صريحةً وبنّاءة.')),
          ('Medical', 'No ambiguity; exact doses', '<em>Take one tablet twice daily.</em><br>' + A('تناوَل قرصاً واحداً مرّتين يومياً.')),
          ('Technical', 'Clear instructions, consistent terms', '<em>Press and hold the power button.</em><br>' + A('اضغط مطوّلاً على زرّ التشغيل.')),
          ('Literary', 'Feeling, voice, natural dialogue', '<em>It has been a long day.</em><br>' + A('كان يوماً شاقّاً.')),
          ('Poetry', 'Images, rhythm; more freedom', A('الخيلُ والليلُ والبيداءُ تعرفني') + ' (al-Mutanabbi)<br><em>The horses, the night and the desert know me</em>'),
          ('Advertising', 'Persuasion and rhythm', '<em>Save more. Smile more.</em><br>' + A('وفّر أكثر… وابتسم أكثر!'))]
ch.append(chapter('c21', P5, 21, 'Text types (genres)', 'أجناس النصوص',
 'This chapter shows what matters most when translating the main types of text.',
 [terms([('Genre', 'الجنس النصّي', 'A familiar type of text with its own rules.')]) +
  ex(['Genre', 'What matters', 'Example'], [[f'<b>{g}</b>', w, e] for g, w, e in genres], ['16%', '28%', None])
  + remember(['Identify the genre <b>before</b> you translate: each genre has its own rules.'])]))

open('parts/02-chapters.html', 'w').write('\n'.join(ch))
print('chapters written')
