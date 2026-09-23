# Generates the chapter pages from simple content blocks, so every chapter has the same layout.
A = lambda s: f'<span class="ar">{s}</span>'

def terms(rows):
    r = ''.join(f'<tr><td>{e}</td><td>{A(a)}</td><td>{m}</td></tr>' for e, a, m in rows)
    return f'<h2>Key words</h2><table class="terms">{r}</table>'

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

def plain(t):
    return f'<div class="plain"><div class="t">In plain words</div><p>{t}</p></div>'

def quote(t, by, ar=None):
    a = f'<span class="qa">{ar}</span>' if ar else ''
    return f'<div class="epi">{a}<span class="qt">{t}</span><span class="by">{by}</span></div>'

def remember(points):
    return '<div class="remember"><div class="t">Remember</div><ul>' + ''.join(f'<li>{p}</li>' for p in points) + '</ul></div>'

def chapter(cid, part, no, title, ar, intro, pages, pl='', q=''):
    head = f'<div class="part">{part}</div><div class="chno">Chapter {no}</div><h1>{title}</h1><div class="art">{ar}</div><div class="rule"></div><p class="intro">{intro}</p>{q}{plain(pl) if pl else ""}'
    return f'<section class="page" data-id="{cid}" id="{cid}" data-title="Chapter {no} · {title}" data-ar="{ar}"><div class="body">{head}{"".join(pages)}</div><div class="pn"></div></section>'

P1, P2, P3, P4, P5 = 'Part 1 · Getting started', 'Part 2 · Understanding the text', 'Part 3 · Translating', 'Part 4 · Checking and explaining', 'Part 5 · Tools and text types'

ch = []

# ---------------- PART 1 ----------------
ch.append(chapter('c1', P1, 1, 'What is translation?', 'ما الترجمة؟',
 'Start here. This chapter explains what translation is, in the simplest possible terms.',
 [terms([('Source text (ST)', 'النص المصدر', 'The original text that you translate.'),
         ('Target text (TT)', 'النص الهدف', 'Your translation.'),
         ('Translation', 'الترجمة التحريرية', 'Turning a <b>written</b> text into another language.'),
         ('Interpreting', 'الترجمة الشفهية', 'Turning <b>speech</b> into another language.')]) +
  '<h2><span class="n">1.1</span>Translate the meaning, not the words</h2>'
  '<p>A beginner often replaces each word with a word from the dictionary. The result is usually wrong, because words do not match one to one. Look at this example:</p>'
  + ex(['English', '|Word by word ✗', '|Meaning ✓'],
       [['<em>Break a leg!</em>', A('اكسر ساقاً!'), A('بالتوفيق!')]], ['34%', None, None]) +
  '<p>An English speaker says <em>Break a leg!</em> to wish someone good luck. The word-by-word version sounds like a threat, while ' + A('بالتوفيق!') + ' carries the real meaning. So a translator does not copy words: a translator carries <b>meaning</b>.</p>'
  '<h2><span class="n">1.2</span>No two languages match perfectly</h2>'
  '<p>Every language divides the world in its own way, so a translation can never be an exact copy. The translator’s job is to get <b>as close as possible</b> to the meaning, especially the cultural meaning (Chapter 12). The Italian writer Umberto Eco described translation as <em>saying almost the same thing</em>.</p>'
  '<h2><span class="n">1.3</span>The translator stands in the middle</h2>'
  '<p>The author writes for readers of one language. The translator reads and understands the text, then rewrites it for readers of another language.</p>'
  '<svg viewBox="0 0 470 50" width="100%" style="margin:2mm 0 3mm"><g font-family="Outfit" font-size="10.5" text-anchor="middle"><defs><marker id="a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" fill="#6a0fd6"/></marker></defs>'
  '<rect x="0" y="6" width="110" height="34" rx="17" fill="#f3effc"/><text x="55" y="27" fill="#3d1591" font-weight="600">Author</text>'
  '<rect x="180" y="6" width="110" height="34" rx="17" fill="#6a0fd6"/><text x="235" y="27" fill="#fff" font-weight="600">Translator</text>'
  '<rect x="360" y="6" width="110" height="34" rx="17" fill="#f3effc"/><text x="415" y="27" fill="#3d1591" font-weight="600">Reader</text>'
  '<g stroke="#6a0fd6" stroke-width="1.3" marker-end="url(#a1)"><line x1="112" y1="23" x2="176" y2="23"/><line x1="292" y1="23" x2="356" y2="23"/></g></g></svg>'
  '<p>If the reader does not understand the translation, the communication has failed, however “correct” each word may be.</p>'
  + remember(['Translate the <b>meaning</b>, not the words.', 'A translation is always an approximation: aim for the closest natural meaning.', 'Always think about the <b>reader</b>.'])],
 pl='Imagine a friend who only speaks Arabic asks you what an English sign says. You do not read the English words out one by one. You tell your friend what the sign <b>means</b>, in good Arabic. That is translation.',
 q=quote('Rendering the meaning of a text into another language in the way that the author intended the text.', 'Peter Newmark, <em>A Textbook of Translation</em> (1988), defining translation')))

ch.append(chapter('c2', P1, 2, 'The translator', 'المترجم',
 'This chapter describes the skills a translator needs and the two ways a translator can work.',
 [terms([('Commissioned translator', 'مترجم بتكليف', 'Someone who translates for a client, for example a freelancer.'),
         ('Self-initiated translator', 'مترجم بمبادرة ذاتية', 'Someone who chooses a text to translate, with no client.'),
         ('Bicultural', 'مُلِمّ بالثقافتين', 'Knowing both cultures well.')]) +
  '<h2><span class="n">2.1</span>What a good translator needs</h2>'
  '<ul><li><b>Two languages.</b> You must be fluent in both the source language and the target language.</li>'
  '<li><b>Two cultures.</b> Knowing the culture is as important as knowing the language (Chapter 12).</li>'
  '<li><b>General knowledge.</b> Texts can be about anything, so a translator should be like a “walking encyclopedia”.</li>'
  '<li><b>A rich vocabulary</b> <span class="ar">(الحصيلة اللغوية)</span>, including idioms and fixed expressions.</li>'
  '<li><b>Practice.</b> Skill grows with experience and with revising your own work.</li></ul>'
  '<h2><span class="n">2.2</span>Two ways of working</h2>'
  '<p>Translators work in one of two ways, depending on who chooses the text:</p>'
  + ex(['Commissioned translator', 'Self-initiated translator'],
       [['A client asks you to translate a text. You follow the client’s style and policy.', 'Nobody asks you. You choose the text yourself, for example a poem you love.']]) +
  '<p class="note">A <b>freelancer</b> works for different clients, so a freelancer is a <b>commissioned</b> translator.</p>'
  '<h2><span class="n">2.3</span>Five good habits</h2>'
  '<ol><li><b>Be faithful</b> <span class="ar">(الأمانة)</span>: do not add or remove meaning.</li>'
  '<li><b>Write naturally</b>: translation is rewriting, so the text must read as if it had been written in the target language.</li>'
  '<li><b>Revise</b> every translation (Chapter 15).</li><li><b>Translate everything</b>, including titles, captions and footnotes.</li>'
  '<li><b>Keep learning</b>: read in both languages and build your vocabulary.</li></ol>'
  + remember(['A translator needs two languages <b>and</b> two cultures.', 'Be faithful to the meaning and natural in the style.', 'Revise every translation, even your best one.'])],
 pl='A translator is like a bridge between two peoples. A bridge has to stand firmly on <b>both</b> banks. In the same way, a translator needs a firm footing in both languages and both cultures.',
 q=quote('The translator’s skill in expression must match his knowledge of the subject. He should know the language he translates from and the language he translates into better than anyone, until he masters both equally.',
         'al-Jāḥiẓ (d. 868 CE), <em>Kitāb al-Ḥayawān</em> · English version by the handbook team',
         'ولا بدَّ للتَّرجُمانِ من أن يكونَ بيانُه في نفسِ الترجمةِ في وزنِ علمِه في نفسِ المعرفة، وينبغي أن يكونَ أعلمَ الناسِ باللغةِ المنقولةِ والمنقولِ إليها، حتى يكونَ فيهما سواءً وغاية.')))

ch.append(chapter('c3', P1, 3, 'Before you translate: the brief', 'قبل أن تترجم: موجز الترجمة',
 'This chapter shows you what to find out, and what to do, before you translate a single word.',
 [terms([('Translation brief', 'موجز الترجمة', 'The information you need before you start: who the client is, what the purpose is and who the readers are.'),
         ('Target audience', 'الجمهور المستهدف', 'The people who will read your translation.')]) +
  '<h2><span class="n">3.1</span>Ask three questions</h2>'
  '<p>Before you start, ask these three questions. The answers tell you <b>how</b> to translate.</p>'
  + ex(['Question', 'Why it matters'],
       [['<b>Who is the client?</b> <span class="ar">من هو العميل؟</span>', 'Each client has its own style and policy.'],
        ['<b>What is the purpose?</b> <span class="ar">ما الغرض؟</span>', 'Is the text meant to inform, persuade, instruct or entertain?'],
        ['<b>Who is the audience?</b> <span class="ar">من هو الجمهور؟</span>', 'Experts or the general public? Adults or children?']], ['42%', None]) +
  '<h2><span class="n">3.2</span>Prepare in five steps</h2>'
  '<ol><li><b>Read the whole text twice</b> before you translate anything.</li><li><b>Highlight</b> difficult words, idioms and names.</li>'
  '<li><b>Research</b> the topic, so that you understand what the text is about.</li><li><b>Make a list</b> of the key terms (Chapter 14).</li><li><b>Plan</b>: picture how the translation should sound.</li></ol>'
  '<h2><span class="n">3.3</span>An example brief</h2>'
  '<p>Here is a brief for a short news report. Notice how the last line turns the answers into decisions.</p>'
  + ex(['', ''], [['<b>Text</b>', 'A short news report'], ['<b>Client</b>', 'KUNA (Kuwait News Agency)'], ['<b>Purpose</b>', 'To inform'],
       ['<b>Audience</b>', 'English readers interested in Kuwait'], ['<b>So…</b>', 'Use a formal, neutral style and keep the headline short.']], ['28%', None])
  + remember(['First find out the <b>client, purpose and audience</b>.', 'Never start translating before you have read the whole text.'])],
 pl='A tailor asks who will wear a suit, and for what occasion, before cutting any cloth. A translator does the same: before translating, find out <b>who</b> the translation is for and <b>why</b> it is needed.',
 q=quote('Function plus loyalty.', 'Christiane Nord, <em>Translating as a Purposeful Activity</em> (1997): a translation must work for its purpose, and the translator must be loyal to the client, the author and the reader')))

# ---------------- PART 2 ----------------
ch.append(chapter('c4', P2, 4, 'English and Arabic are different', 'الفروق بين الإنجليزية والعربية',
 'This chapter compares the two languages, so that you can avoid the most common beginner mistakes.',
 [terms([('Verbal sentence', 'الجملة الفعلية', 'A sentence that starts with a verb.'),
         ('Register', 'المستوى اللغوي', 'How formal or informal the language is.'),
         ('Modern Standard Arabic', 'الفصحى المعاصرة', 'The Arabic of newspapers, laws and education.')]) +
  '<h2><span class="n">4.1</span>The main differences</h2>'
  + ex(['', 'English', 'Arabic'],
       [['<b>Word order</b>', 'Subject first: <em>Sam ate the cake.</em>', 'Verb first: ' + A('أكلَ سامٌ الكعكةَ')],
        ['<b>Sentences</b>', 'Short, with full stops', 'Long, joined with ' + A('و، ف، ثمّ')],
        ['<b>The verb “is”</b>', 'Always written', 'Often not written, or ' + A('يُعدّ')],
        ['<b>Synonyms</b>', 'One word is enough', 'Pairs add emphasis: ' + A('شجاعٌ مِغوار')],
        ['<b>“You”</b>', 'One word for everyone', A('أنتَ') + ' (a man) or ' + A('أنتِ') + ' (a woman)'],
        ['<b>Numbers 3–10</b>', '<em>three students</em>', 'Opposite gender: ' + A('ثلاثةُ طلابٍ')],
        ['<b>Punctuation</b>', ', ; ?', A('، ؛ ؟')]], ['22%', '34%', None]) +
  '<h2><span class="n">4.2</span>Which Arabic?</h2>'
  '<p>Use <b>Modern Standard Arabic</b> for written translation. Use a dialect <span class="ar">(العامية)</span> only if the client asks for it, for example in film subtitles.</p>',
  '<h2><span class="n">4.3</span>Small words, big traps <span class="note">EN → AR</span></h2>'
  '<p>Some short English words look easy but do not mean what the dictionary’s first entry says:</p>'
  + ex(['English', '|Arabic', 'Why'],
       [['<em>He is in bed.</em>', A('إنه نائم'), 'It means “asleep”, not ' + A('في السرير') + '.'],
        ['<em>As an officer, I…</em>', A('بصفتي ضابطاً…'), 'Here <em>as</em> means a role, not ' + A('كـ') + '.'],
        ['<em>…to see the Roman ruins</em>', A('لزيارة الآثار الرومانية'), 'Arabic says “visit”.']], ['34%', '30%', None]) +
  '<h2><span class="n">4.4</span>Linking words that help Arabic flow <span class="note">EN → AR</span></h2>'
  + ex(['English', '|Arabic', 'English', '|Arabic'],
       [['<em>however</em>', A('غير أنّ'), '<em>therefore</em>', A('لذلك')],
        ['<em>in addition</em>', A('بالإضافة إلى ذلك'), '<em>for example</em>', A('على سبيل المثال')],
        ['<em>on the other hand</em>', A('من ناحيةٍ أخرى'), '<em>as a result</em>', A('ونتيجةً لذلك')]])
  + remember(['<b>EN → AR:</b> start with the verb and join short sentences.', '<b>AR → EN:</b> start with the subject, drop repeated synonyms and split long sentences.', 'Use Arabic punctuation in Arabic texts: ' + A('، ؛ ؟')])],
 pl='Every language has its own habits. A sentence that is perfect in English can sound strange in Arabic if you copy its word order. Learn the main differences, and you will avoid most beginner mistakes.',
 q=quote('Languages differ essentially in what they must convey and not in what they may convey.', 'Roman Jakobson, “On Linguistic Aspects of Translation” (1959). For example, Arabic <b>must</b> say whether “you” is a man or a woman; English does not have to')))

ch.append(chapter('c5', P2, 5, 'Meaning, form and context', 'المعنى والبناء والسياق',
 'This chapter explains the most important rule in translation: meaning comes before form.',
 [terms([('Form', 'البناء', 'The shape of the language: the words and how they are arranged.'),
         ('Meaning', 'المعنى', 'The idea that the words express.'),
         ('Denotation', 'المعنى المعجمي', 'What a word means in the dictionary.'),
         ('Connotation', 'المعنى الإيحائي', 'The feeling a word carries: positive, negative, respectful…'),
         ('Context', 'السياق', 'The words and the situation around a word or text.')]) +
  '<h2><span class="n">5.1</span>Meaning comes before form</h2>'
  '<p>You may change the <b>structure</b> of a sentence, but you must never change its <b>meaning</b> <span class="ar">(المعنى أهمّ من البناء)</span>.</p>'
  + ex(['English', '|Arabic', 'Why'],
       [['<em>Blair, Bush’s poodle</em>', A('بلير، تابعُ بوش'), '“Poodle” has no political meaning in Arabic, so we keep the idea: “an obedient follower”.'],
        ['<em>He is a heavy smoker.</em>', A('يدخّن بشراهة'), 'The adjective becomes a verb, and the meaning stays the same.']], ['30%', '26%', None]),
  '<h2><span class="n">5.2</span>Same meaning, different feeling</h2>'
  '<p>Words can share a dictionary meaning but carry different feelings. Choose the word with the right feeling:</p>'
  + ex(['Word', 'Feeling'],
       [['<em>die</em> ' + A('مات'), 'Neutral'], ['<em>pass away</em> ' + A('توفّي'), 'Respectful'],
        ['<em>kill</em> ' + A('قتل') + ' · <em>assassinate</em> ' + A('اغتال'), '“Assassinate” is political']], ['52%', None]) +
  '<h2><span class="n">5.3</span>What the speaker really means</h2>'
  '<p>Sometimes a speaker means more than the words say. Translate what the speaker <b>means</b>:</p>'
  + ex(['Words', 'Real meaning'], [[A('أشعرُ بالحرّ'), '“Please turn on the air conditioning.”'], ['<em>It’s freezing in here.</em>', '“Please close the window.”']], ['40%', None]) +
  '<h2><span class="n">5.4</span>Context tells you which meaning</h2>'
  '<p>Many words have more than one meaning. The words around them, the <b>context</b>, tell you which one is correct <span class="ar">(لكلّ مقامٍ مقال)</span>.</p>'
  + ex(['Word', 'Meanings'], [['<em>bank</em>', A('مصرف') + ' (a financial bank) · ' + A('ضفّة النهر') + ' (a river bank)'],
                              [A('عين'), 'an eye · a water spring · a spy'], ['<em>case</em>', A('قضية') + ' (in court) · ' + A('حالة') + ' (in medicine) · ' + A('علبة') + ' (a box)']], ['22%', None])
  + remember(['Change the form if you need to, but <b>never</b> change the meaning.', 'Check the <b>feeling</b> of a word, not only its dictionary meaning.', 'Let the <b>context</b> decide which meaning is correct.'])],
 pl='Think of meaning as water and form as the glass. You can pour the water into a different glass: the shape changes, but it is the same water. In translation, you may change the shape of a sentence, but never its meaning.',
 q=quote('Anything that can be said in one language can be said in another, unless the form is an essential element of the message.', 'Eugene Nida and Charles Taber, <em>The Theory and Practice of Translation</em> (1969)')))

ch.append(chapter('c6', P2, 6, 'Analysing the text', 'تحليل النص',
 'This chapter shows you how to study a text carefully before you translate it.',
 [terms([('Text analysis', 'تحليل النص', 'Studying a text before translating it.'),
         ('Genre', 'الجنس النصّي', 'The type of text: news, contract, poem, advert…'),
         ('Tone', 'النبرة', 'The writer’s attitude: neutral, critical, friendly…')]) +
  '<h2><span class="n">6.1</span>Why analyse first?</h2>'
  '<ul><li>You understand the text better with every reading.</li><li>You find the difficult parts in advance.</li><li>You can choose your strategies before you start.</li><li>You know which dictionaries and resources you need.</li></ul>'
  '<h2><span class="n">6.2</span>Analysis is not a summary</h2>'
  + ex(['Analysis', 'Summary'], [['Describes the text: who wrote it, for whom, why, and how.', 'Only says what the text is about.']]) +
  '<p>When you are asked to analyse a text, do <b>not</b> summarise it.</p>',
  '<h2><span class="n">6.3</span>Ten analysis questions</h2>'
  '<p>Answer these ten questions for every new text. The example answers are for a short KUNA news report.</p>'
  + ex(['Question', 'Example answer'],
       [['1. Who wrote it, and who published it?', 'A KUNA reporter; KUNA'], ['2. Who is the client?', 'KUNA’s English service'],
        ['3. What is the purpose?', 'To inform'], ['4. Who is the audience?', 'Readers interested in Kuwait'],
        ['5. What is the genre?', 'A news report'], ['6. What is the field?', 'Politics'],
        ['7. What are the tone and style?', 'Neutral and formal'], ['8. Which terms need checking?', 'Official titles'],
        ['9. Are there any cultural items?', 'Forms of address'], ['10. Which strategies and resources will I use?', 'Mostly literal; a news-style guide']], ['52%', None])
  + '<p class="note">A blank copy of these questions is on the worksheet page at the back of the book.</p>'
  + remember(['Analyse <b>before</b> you translate.', 'Your translation must match your analysis: if you call the tone formal, keep it formal.'])],
 pl='A doctor examines a patient before prescribing medicine. A translator examines a text before translating it. This examination is called <b>text analysis</b>.',
 q=quote('You begin the job by reading the original for two purposes: first, to understand what it is about; second, to analyse it from a ‘translator’s’ point of view.', 'Peter Newmark, <em>A Textbook of Translation</em> (1988)')))

# ---------------- PART 3 ----------------
ch.append(chapter('c7', P3, 7, 'Equivalence', 'التكافؤ',
 'This chapter explains how to find the expression in the other language that matches the original.',
 [terms([('Equivalence', 'التكافؤ', 'Finding an expression in the target language that matches the source expression.'),
         ('Formal equivalence', 'التكافؤ الشكلي', 'Keeps the <b>words and image</b> of the original.'),
         ('Functional equivalence', 'التكافؤ الوظيفي', 'Uses a different expression that <b>does the same job</b>.'),
         ('Ideational equivalence', 'التكافؤ الفكري', 'Keeps only the <b>basic idea</b>, in plain words.')]) +
  '<h2><span class="n">7.1</span>One sentence, three choices</h2>'
  '<p><em>The agreement has remained a dead letter since then.</em> A “dead letter” is a law or agreement that exists on paper but is never applied. Here are three ways to translate it. Which one would an Arab reader understand best?</p>'
  + ex(['Type', '|Arabic', 'Result'],
       [['Formal', A('ظلّت الاتفاقية حرفاً ميتاً منذ ذلك الحين'), 'Same image, but unclear to readers'],
        ['Functional', A('ظلّت الاتفاقية حبراً على ورق منذ ذلك الحين'), '<span class="ok">✓</span> A familiar Arabic idiom'],
        ['Ideational', A('لم تُطبَّق الاتفاقية منذ ذلك الحين'), 'Clear, but the image is lost']], ['20%', '46%', None]) +
  '<h2><span class="n">7.2</span>Another example</h2>'
  + ex(['English', '|Functional', '|Ideational'],
       [['<em>Ali is second to none in poetry.</em>', A('عليٌّ لا يُشقّ له غبار في الشعر'), A('عليٌّ شاعرٌ متميّز')]], ['36%', None, None]) +
  '<p>Both translations are correct. The functional one keeps the colour of an idiom; the ideational one is plainer.</p>'
  + remember(['First try to keep the form.', 'If the form does not work, keep the <b>function</b>.', 'If no idiom fits, keep the <b>idea</b>.'])],
 pl='Equivalence means finding the expression in the other language that <b>does the same job</b>. Sometimes you can keep the same words, sometimes only the same function, and sometimes only the basic idea.',
 q=quote('Translating consists in reproducing in the receptor language the closest natural equivalent of the source-language message, first in terms of meaning and secondly in terms of style.', 'Eugene Nida and Charles Taber, <em>The Theory and Practice of Translation</em> (1969)')))

ch.append(chapter('c8', P3, 8, 'Collocations and idioms', 'التلازم اللفظي والتعابير الاصطلاحية',
 'This chapter explains word partners and fixed expressions, which must never be translated word by word.',
 [terms([('Collocation', 'التلازم اللفظي', 'Words that naturally go together, like <em>strong tea</em>.'),
         ('Idiom', 'التعبير الاصطلاحي', 'A fixed expression whose meaning you cannot guess from its words.'),
         ('Proverb', 'المثل', 'A traditional saying.')]) +
  '<h2><span class="n">8.1</span>Collocations <span class="note">EN → AR</span></h2>'
  '<p>Each English pair has its own Arabic partner. The last column shows what happens if you translate word by word:</p>'
  + ex(['English', '|Arabic', 'Do not write'],
       [['<em>pay attention</em>', A('ينتبه'), '<span class="x">' + A('يدفع الانتباه') + '</span>'],
        ['<em>pay a visit</em>', A('يقوم بزيارة'), '<span class="x">' + A('يدفع زيارة') + '</span>'],
        ['<em>strong tea</em>', A('شاي ثقيل'), '<span class="x">' + A('شاي قوي') + '</span>'],
        ['<em>a fast colour</em>', A('لون ثابت'), '<span class="x">' + A('لون سريع') + '</span>']], ['36%', '32%', None]) +
  '<h2><span class="n">8.2</span>Collocations <span class="note">AR → EN</span></h2>'
  + ex(['Arabic', 'English'], [[A('يساورني القلق'), '<em>I am growing worried</em>'], [A('قدّم استقالته'), '<em>he resigned</em>'],
                               [A('اتّخذ قراراً'), '<em>made a decision</em>'], [A('عقد اجتماعاً'), '<em>held a meeting</em>']], ['40%', None]),
  '<h2><span class="n">8.3</span>Idioms <span class="note">EN → AR</span></h2>'
  '<p><em>It’s raining cats and dogs</em> has nothing to do with animals: it means “raining heavily”. Translate the meaning of an idiom, or use an Arabic idiom with the same meaning:</p>'
  + ex(['English', '|Arabic'],
       [['<em>It’s raining cats and dogs.</em>', A('تمطر بغزارة')], ['<em>over the moon</em>', A('يطير من الفرح')],
        ['<em>to spill the beans</em>', A('أفشى السرّ')], ['<em>I’m all ears.</em>', A('كلّي آذانٌ صاغية')],
        ['<em>Break a leg!</em>', A('بالتوفيق!')]], ['55%', None]) +
  '<h2><span class="n">8.4</span>Proverbs <span class="note">AR → EN</span></h2>'
  '<p>Look for an English proverb with the same meaning. If there is none, give the meaning in plain English.</p>'
  + ex(['Arabic', 'English'],
       [[A('كالمستجير من الرمضاء بالنار'), '<em>out of the frying pan into the fire</em>'], [A('رجع بخُفَّي حُنين'), '<em>he came back empty-handed</em>'],
        [A('عصفورٌ في اليد خيرٌ من عشرةٍ على الشجرة'), '<em>a bird in the hand is worth two in the bush</em>'], [A('لكلّ مقامٍ مقال'), '<em>there is a time and a place for everything</em>']], ['50%', None])
  + remember(['Learn words <b>with their partners</b>.', 'Never translate an idiom word by word, but first check that it really is an idiom in this context.'])],
 pl='Some words are “friends” that always go together. In English we say <em>strong tea</em>, but in Arabic we say ' + A('شاي ثقيل') + ' (“heavy tea”). If you translate the words one at a time, the friendship breaks and the result sounds wrong.',
 q=quote('You shall know a word by the company it keeps.', 'J. R. Firth, linguist (1957)')))

ch.append(chapter('c9', P3, 9, 'Literal and free translation', 'الترجمة الحرفية والترجمة الحرّة',
 'This chapter compares staying close to the original words with staying close to the reader.',
 [terms([('Literal translation', 'الترجمة الحرفية', 'Keeps the words and changes only the grammar.'),
         ('Free translation', 'الترجمة الحرّة', 'Keeps the message, but not the form.'),
         ('Communicative translation', 'الترجمة التواصلية', 'Aims to sound natural to the reader.')]) +
  '<svg viewBox="0 0 470 46" width="100%" style="margin:1mm 0 3mm"><g font-family="Outfit" text-anchor="middle"><defs><marker id="a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#6a0fd6"/></marker></defs>'
  '<line x1="70" y1="14" x2="400" y2="14" stroke="#6a0fd6" stroke-width="1.4" marker-start="url(#a9)" marker-end="url(#a9)"/>'
  '<text x="30" y="18" font-size="10.5" font-weight="600" fill="#3d1591">Literal</text><text x="440" y="18" font-size="10.5" font-weight="600" fill="#3d1591">Free</text>'
  '<text x="235" y="10" font-size="9" fill="#6a0fd6">good translation is usually in between</text>'
  '<text x="30" y="36" font-size="8.5" fill="#817a95">close to the words</text><text x="440" y="36" font-size="8.5" fill="#817a95">close to the reader</text></g></svg>'
  '<h2><span class="n">9.1</span>Literal translation: sometimes right, sometimes wrong</h2>'
  + ex(['English', '|Arabic', 'Result'],
       [['<em>The book is on the table.</em>', A('الكتاب على الطاولة'), '<span class="ok">✓ Works</span>'],
        ['<em>to play a role</em>', A('يلعب دوراً'), '<span class="ok">✓ Works</span>'],
        ['<em>to pay a visit</em>', A('يدفع زيارة'), '<span class="x">✗ Use ' + A('يقوم بزيارة') + '</span>'],
        ['<em>a long day</em>', A('يوم طويل'), '<span class="x">✗ Use ' + A('يوم شاقّ') + '</span>']], ['36%', '30%', None]) +
  '<h2><span class="n">9.2</span>Free translation: not too free</h2>'
  '<p>A free translation may change the words, but it must not change the message:</p>'
  + ex(['English', '|Free translation', 'Result'],
       [['<em>Appointing new staff should be based on equal opportunity.</em>', A('يجب أن يتمّ تعيين الموظفين الجدد بعيداً عن المحسوبية والواسطة'), '<span class="ok">✓</span> Same message'],
        ['<em>We have had heavy rainfall this winter.</em>', A('سيكون لدينا موسم زراعي مبشّر'), '<span class="x">✗</span> Adds a new idea']], ['34%', '40%', None]),
  '<h2><span class="n">9.3</span>An old question</h2>'
  '<p>Translators have discussed “words or meaning?” for centuries. In the 14th century, the scholar al-Ṣafadī described two methods used by the translators of the Abbasid era. Some, such as Yūḥannā ibn al-Biṭrīq, translated <b>word by word</b>. Others, such as Ḥunayn ibn Isḥāq, read a whole sentence, understood it, and rewrote its <b>meaning</b>. Al-Ṣafadī judged the second method to be the better one.</p>'
  '<h2><span class="n">9.4</span>Other kinds of translation work</h2>'
  + ex(['Type', 'What it means'],
       [['Sight translation', 'Reading a written text aloud in another language'], ['Interpreting', 'Translating speech, during or after the speaker'],
        ['Subtitling', 'Translating film dialogue within time and space limits'], ['Localisation', 'Adapting websites and apps for another country']], ['32%', None])
  + remember(['Use literal translation only when the result is natural.', 'Free translation may change the form, but never the message.'])],
 pl='Imagine a line. At one end is <b>literal</b> translation, which stays close to the original words. At the other end is <b>free</b> translation, which stays close to the reader. A good translation usually sits somewhere in between.',
 q=quote('Not word for word, but sense for sense.', 'St Jerome, translator of the Bible into Latin, in his letter to Pammachius (395 CE)')))

procs = [('Borrowing', 'الاقتراض', 'Take the word as it is.', '<em>computer</em> → ' + A('كمبيوتر')),
         ('Calque', 'النسخ', 'Translate each part of the expression.', '<em>skyscraper</em> → ' + A('ناطحة سحاب')),
         ('Literal translation', 'الترجمة الحرفية', 'Translate word for word, when this is correct.', '<em>The book is on the table.</em> → ' + A('الكتاب على الطاولة')),
         ('Transposition', 'الإبدال', 'Change the word class, e.g. a noun becomes a verb.', '<em>after his arrival</em> → ' + A('بعد أن وصل')),
         ('Modulation', 'التحوير', 'Say the same thing from another point of view.', '<em>It is not difficult.</em> → ' + A('إنه سهل')),
         ('Equivalence', 'التكافؤ', 'Use a completely different fixed expression.', '<em>Like father, like son.</em> → ' + A('هذا الشبل من ذاك الأسد')),
         ('Adaptation', 'التكييف', 'Replace a cultural reference with a familiar one.', '<em>like Romeo and Juliet</em> → ' + A('كقيسٍ وليلى'))]
ch.append(chapter('c10', P3, 10, 'The seven translation procedures', 'إجراءات الترجمة السبعة',
 'This chapter presents seven techniques for translating words and phrases.',
 [terms([('Method', 'منهج الترجمة', 'Your general approach to the <b>whole text</b>, e.g. literal or free (Chapter 9).'),
         ('Procedure', 'إجراء الترجمة', 'A technique for translating one <b>word or phrase</b>.')]) +
  '<h2>The seven procedures</h2>'
  '<p>These procedures were described by the linguists Vinay and Darbelnet. They go from the one that stays <b>closest</b> to the original (1) to the <b>freest</b> (7). Try them in this order, and move down the list only when the result sounds wrong.</p>'
  + ex(['', 'Procedure', 'What it does', 'Example'],
       [[f'<b style="color:var(--purple)">{i+1}</b>', f'<b>{e}</b><br>{A(a)}', w, x] for i, (e, a, w, x) in enumerate(procs)], ['5%', '24%', '30%', None]) +
  '',
  '<h2><span class="n">10.1</span>The procedures in one sentence</h2>'
  '<p>A single sentence often needs several procedures:</p>'
  '<p><em>After his arrival in Kuwait, the minister held a press conference at the Sheraton and said the reforms were not impossible.</em></p>'
  '<p style="text-align:right">' + A('بعد أن وصل الوزير إلى الكويت، عقد مؤتمراً صحفياً في فندق شيراتون، وقال إنّ الإصلاحات ممكنة.') + '</p>'
  + ex(['English', '|Arabic', 'Procedure'],
       [['<em>after his arrival</em>', A('بعد أن وصل'), 'Transposition (noun → verb)'], ['<em>press conference</em>', A('مؤتمر صحفي'), 'Calque'],
        ['<em>Sheraton</em>', A('شيراتون'), 'Borrowing'], ['<em>not impossible</em>', A('ممكنة'), 'Modulation']], ['32%', '28%', None]) +
  remember(['A <b>method</b> is for the whole text; a <b>procedure</b> is for a word or phrase.', 'Start with procedures 1–3. Move to 4–7 when the result sounds unnatural or unclear.', 'Learn the names: in a commentary (Chapter 17) you <b>name</b> the procedure and explain why you used it.'])],
 pl='A procedure is a small tool for translating one word or phrase. Think of a toolbox with seven tools: you pick the tool that fits the job in front of you.',
 q=quote('While translation methods relate to whole texts, translation procedures are used for sentences and the smaller units of language.', 'Peter Newmark, <em>A Textbook of Translation</em> (1988)')))

ch.append(chapter('c11', P3, 11, 'Translation strategies', 'استراتيجيات الترجمة',
 'This chapter gives you practical solutions for words and expressions that are hard to translate.',
 [terms([('Strategy', 'الاستراتيجية', 'A planned solution to a translation problem.')]) +
  '<h2><span class="n">11.1</span>Six useful strategies</h2>'
  '<p>Read the middle column first: it tells you <b>when</b> to use each strategy.</p>'
  + ex(['Strategy', 'Use it when…', 'Example'],
       [['<b>Functional translation</b><br>' + A('الترجمة الوظيفية'), 'a target-language expression does the same job', '<em>spill the beans</em> → ' + A('أفشى السرّ')],
        ['<b>Cultural substitution</b><br>' + A('الإبدال الثقافي'), 'a cultural reference would mean nothing to the reader', '<em>Romeo and Juliet</em> → ' + A('قيس وليلى')],
        ['<b>Addition</b><br>' + A('الإضافة'), 'the reader needs extra information (common EN → AR)', '<em>the Fed</em> → ' + A('مجلس الاحتياطي الفيدرالي الأمريكي')],
        ['<b>Omission</b><br>' + A('الحذف'), 'words repeat the same meaning (common AR → EN)', A('شجاعٌ مِغوار') + ' → <em>very brave</em>'],
        ['<b>A more general word</b><br>' + A('اللفظ الأعمّ'), 'the target language has no exact word', '<em>prawns / shrimps</em> → ' + A('روبيان')],
        ['<b>Borrowing + explanation</b><br>' + A('الاقتراض مع الشرح'), 'a cultural word must be kept', A('الوقف') + ' → <em>waqf</em> (a charitable endowment)']], ['30%', '32%', None]) +
  '<p class="note">Never add information to headlines, and never leave out real information.</p>',
  '<h2><span class="n">11.2</span>Translating metaphors</h2>'
  '<p>A <b>metaphor</b> <span class="ar">(الاستعارة)</span> describes something as if it were something else: <em>She is a moon.</em> A <b>simile</b> <span class="ar">(التشبيه)</span> uses “as” or “like”: <em>She is like a moon.</em> To translate a metaphor, try these four steps in order:</p>'
  + ex(['Step', 'Example'],
       [['<b>1. Keep the image</b> if both languages share it.', '<em>She is a snake.</em> → ' + A('إنها أفعى')],
        ['<b>2. Use an Arabic image</b> if the English one is unfamiliar.', '<em>the tip of the iceberg</em> → ' + A('غيضٌ من فيض')],
        ['<b>3. Change it into a simile.</b>', '<em>He is a rock.</em> → ' + A('إنه كالصخرة في ثباته')],
        ['<b>4. Give the plain meaning</b> (the last option).', '<em>He is a chicken.</em> → ' + A('إنه جبان')]], ['50%', None]) +
  ''
  + remember(['Choose a strategy for each problem, not one strategy for the whole text.', 'For metaphors: keep the image, replace it, turn it into a simile, or explain it, in that order.'])],
 pl='A strategy is your plan for solving a translation problem, for example a word that has no match in Arabic. This chapter gives you six ready-made plans, and shows you how to handle metaphors.',
 q=quote('Either the translator leaves the author in peace, as much as possible, and moves the reader towards him; or he leaves the reader in peace, as much as possible, and moves the author towards him.', 'Friedrich Schleiermacher, “On the Different Methods of Translating” (1813), translated by André Lefevere')))

ch.append(chapter('c12', P3, 12, 'Culture in translation', 'الثقافة في الترجمة',
 'This chapter explains how to translate expressions that belong to one culture.',
 [terms([('Cultural approximation', 'التقريب الثقافي', 'Bringing a cultural meaning as close as possible to the reader.'),
         ('Domestication', 'التوطين', 'Making the text feel local to the reader.'),
         ('Foreignisation', 'التغريب', 'Keeping the text’s foreign flavour.')]) +
  '<h2><span class="n">12.1</span>Same meaning, different image <span class="note">EN → AR</span></h2>'
  '<p>Each expression below has an Arabic partner with the same meaning but a different picture:</p>'
  + ex(['English', '|Arabic'],
       [['<em>I’ve got the test in the bag.</em>', A('الامتحان في جيبي')], ['<em>cut from the same cloth</em>', A('من طينةٍ واحدة')],
        ['<em>a scapegoat</em>', A('كبش الفداء')], ['<em>like mother, like daughter</em>', A('اقلب الجرّة على فمها تطلع البنت لأمّها')]], ['50%', None]) +
  '<h2><span class="n">12.2</span>When climate changes meaning</h2>'
  + ex(['English', '|Arabic', 'Why'], [['<em>The news warmed my heart.</em>', A('أثلجَ الخبرُ صدري'), 'In a hot climate, relief feels <b>cold</b>.']], ['34%', '28%', None]) +
  '<p>Shakespeare wrote: <em>“Shall I compare thee to a summer’s day?”</em> An English summer is mild and lovely, but a Gulf summer is harsh, so many translators choose spring: ' + A('أأشبّهكِ بيومٍ ربيعيّ؟') + '</p>',
  '<h2><span class="n">12.3</span>Titles and institutions</h2>'
  '<p>Official titles differ from country to country. Translate the <b>job</b>, not the words:</p>'
  + ex(['English', '|Arabic'],
       [['<em>the Home Office</em> (UK)', A('وزارة الداخلية')], ['<em>the Secretary of State</em> (US)', A('وزير الخارجية')],
        ['<em>the Chancellor of the Exchequer</em> (UK)', A('وزير المالية')], ['<em>the Secretary of the Treasury</em> (US)', A('وزير الخزانة')]], ['55%', None]) +
  '<h2><span class="n">12.4</span>Social expressions</h2>'
  '<p>For greetings, thanks and condolences, use the phrase people actually say <b>in the same situation</b>:</p>'
  + ex(['English', '|Arabic', 'Situation'],
       [['<em>I’m sorry for your loss.</em>', A('عظّم الله أجركم'), 'Condolence'], ['<em>Welcome! It’s an honour.</em>', A('أهلاً وسهلاً، شرّفتمونا'), 'Hospitality'],
        ['<em>Thank you for your hard work.</em>', A('الله يعطيك العافية'), 'Thanks'], ['<em>Many happy returns!</em>', A('عساكم من عُوّاده'), 'Gulf festive greeting']], ['38%', '34%', None]) +
  '<h2><span class="n">12.5</span>Domestication and foreignisation</h2>'
  '<p>When a text is full of cultural references, you can move in one of two directions:</p>'
  + ex(['Domestication ' + A('التوطين'), 'Foreignisation ' + A('التغريب')],
       [['Moves the <b>text</b> towards the reader. It feels local.', 'Moves the <b>reader</b> towards the text. It keeps a foreign flavour.'],
        ['<em>a men’s evening gathering</em>', '<em>the diwaniya</em>']]) +
  '<p class="note">This is the choice Schleiermacher describes in the quotation at the start of Chapter 11.</p>'
  + remember(['Translate the <b>effect</b>, not the image.', 'Use the expression a target-language speaker would use in the same situation.', 'Decide whether the text should feel local (domestication) or foreign (foreignisation).'])],
 pl='Words carry culture. “Summer” sounds lovely to an English reader, but a Kuwaiti reader thinks of 50°C heat. When an image carries a different feeling in the other culture, translate the <b>feeling</b>, not the image.'))

ch.append(chapter('c13', P3, 13, 'When there is no equivalent', 'عندما لا يوجد مقابل',
 'This chapter shows two solutions for words that have no equivalent: describing them, and creating new words.',
 [terms([('Transliteration', 'النقل الصوتي', 'Writing the sounds of a word in the other alphabet, e.g. ' + A('زكاة') + ' → <em>zakat</em>.'),
         ('Descriptive translation', 'الترجمة الوصفية', 'Explaining a word by describing its meaning.'),
         ('Lexical creation', 'النحت المعجمي', 'Creating a new word in the target language.')]) +
  '<h2><span class="n">13.1</span>Solution 1: describe the word</h2>'
  '<p>For cultural and religious words, first <b>transliterate</b> the word, then <b>describe</b> it in brackets or in a footnote. Do this only the first time the word appears.</p>'
  + ex(['Arabic', 'English'],
       [[A('الزكاة'), '<em>zakat</em> (obligatory almsgiving in Islam)'], [A('التيمّم'), '<em>tayammum</em> (ritual washing with clean earth when there is no water)'],
        [A('البسملة'), '<em>the basmala</em> (saying “In the name of God, the Most Gracious, the Most Merciful”)'],
        [A('العِدّة'), '<em>ʿidda</em> (the waiting period before a divorced or widowed woman may remarry)']], ['22%', None]) +
  '<p class="note">Use this as a <b>last option</b>, because it makes the text longer.</p>',
  '<h2><span class="n">13.2</span>Solution 2: create a new word</h2>'
  '<p>New inventions and ideas need new words. Here are five ways Arabic has created them:</p>'
  + ex(['Method', 'Example'],
       [['<b>A new word</b>', '<em>blog</em> → ' + A('مدوّنة')], ['<b>Translate each part</b> (calque)', '<em>smartphone</em> → ' + A('الهاتف الذكي')],
        ['<b>Borrow the sounds</b>', '<em>radio</em> → ' + A('راديو')], ['<b>Mix both</b>', '<em>cybersecurity</em> → ' + A('الأمن السيبراني')],
        ['<b>A short explanation</b>', '<em>jet lag</em> → ' + A('إرهاق السفر')]], ['42%', None]) +
  '<h2><span class="n">13.3</span>Search before you create</h2>'
  + ex(['English', '|Arabic'], [['<em>greenwashing</em>', A('التضليل البيئي')], ['<em>cancel culture</em>', A('ثقافة الإلغاء')], ['<em>global warming</em>', A('الاحترار العالمي')]], ['55%', None]) +
  '<p>These new words already have accepted Arabic terms. A term from the Arabic language academies or UNTERM is always better than your own invention.</p>'
  + remember(['Describe a word only the first time it appears.', 'Look for an existing term before you create a new one.'])],
 pl='Some words exist in only one language, because the thing they name exists in only one culture. English, for example, has no single word for ' + A('الزكاة') + '. You then have two choices: explain the word, or create a new one.'))

ch.append(chapter('c14', P3, 14, 'Terminology', 'المصطلحات',
 'This chapter shows you how to find, check and record specialised terms.',
 [terms([('Term', 'المصطلح', 'A word with one exact meaning in a special field, e.g. law or medicine.'),
         ('Term list', 'قائمة المصطلحات', 'A table of the approved terms for a project.')]) +
  '<h2><span class="n">14.1</span>Four steps</h2>'
  '<ol><li><b>Find</b> the key terms in the text.</li><li><b>Check</b> them in UNTERM, Arabterm, the language academies or the client’s glossary.</li><li><b>Record</b> each term, its translation and its context.</li><li><b>Share</b> the list, so that the whole team uses the same terms.</li></ol>'
  '<h2><span class="n">14.2</span>A simple term list</h2>'
  + ex(['English term', '|Arabic term', 'Field', 'Note'],
       [['<em>governing law</em>', A('القانون الواجب التطبيق'), 'Legal', 'Not ' + A('القانون الحاكم')],
        ['<em>provided that</em>', A('شريطةَ أن'), 'Legal', 'Contract condition'],
        ['<em>Article</em> (of a law)', A('مادّة'), 'Legal', 'A contract <em>clause</em> = ' + A('بند')]], ['28%', '28%', '16%', None])
  + remember(['Use <b>one term for one idea</b> all the way through the text.', 'Never change a term “for variety”: a new word suggests a new meaning.'])],
 pl='In law, medicine and other special fields, some words have one exact meaning. These are called <b>terms</b>. A wrong term can change a contract, so translators check every term and keep a list.'))

# ---------------- PART 4 ----------------
ch.append(chapter('c15', P4, 15, 'Revising your translation', 'مراجعة الترجمة',
 'This chapter shows you how to check your translation and avoid the most common mistakes.',
 [terms([('Draft', 'المسوّدة', 'Your first version of a translation.'),
         ('Revision', 'المراجعة', 'Checking a translation against the source and correcting it.')]) +
  '<h2><span class="n">15.1</span>Revise in three readings</h2>'
  '<ol><li><b>Accuracy reading</b>, with the source text: is anything missing, added or changed?</li>'
  '<li><b>Fluency reading</b>, without the source text: does it sound natural?</li>'
  '<li><b>Final check</b>: numbers, names, punctuation, titles and captions.</li></ol>'
  '<h2><span class="n">15.2</span>Common mistakes in Arabic <span class="note">EN → AR</span></h2>'
  '<p>These mistakes appear when English grammar is copied into Arabic:</p>'
  + ex(['Mistake', '|Wrong ✗', '|Right ✓'],
       [['Subject first', A('الحكومة أعلنت…'), A('أعلنت الحكومة…')], ['Overusing ' + A('قام بـ'), A('قام الوزير بزيارة الكويت'), A('زار الوزير الكويت')],
        ['Passive with ' + A('من قِبَل'), A('تمّ افتتاح المعرض من قِبَل الوزير'), A('افتتح الوزير المعرض')],
        ['Numbers 3–10', A('ثلاث طلاب'), A('ثلاثة طلاب')], ['Spelling', A('انشاء · مدرسه · الى'), A('إنشاء · مدرسة · إلى')],
        ['Punctuation', A('نعم, شكراً?'), A('نعم، شكراً؟')]], ['28%', None, None]),
  '<h2><span class="n">15.3</span>Common mistakes in English <span class="note">AR → EN</span></h2>'
  '<p>These mistakes appear when Arabic grammar is copied into English:</p>'
  + ex(['Mistake', 'Wrong ✗', 'Right ✓'],
       [['Very long sentences', '<em>…and he said and he added and…</em>', 'Split them with full stops.'],
        ['Repeated synonyms', '<em>brave and daring</em>', '<em>very brave</em>'], ['Extra “the”', '<em>The life is beautiful.</em>', '<em>Life is beautiful.</em>'],
        ['Missing verb “to be”', '<em>He in the office.</em>', '<em>He is in the office.</em>'], ['Arabic preposition', '<em>He married from her.</em>', '<em>He married her.</em>'],
        ['No capital letters', '<em>the minister of health</em>', '<em>the Minister of Health</em>']], ['30%', None, None]) +
  '<h2><span class="n">15.4</span>Post-editing</h2>'
  '<p><b>Post-editing</b> <span class="ar">(التحرير اللاحق)</span> means correcting a machine translation. It is now an important part of a translator’s work (Chapter 20).</p>'
  + remember(['Read your translation once <b>without</b> the source text.', 'If a sentence sounds translated, rewrite it.'])],
 pl='Your first version is only a <b>draft</b>. Professional translators always read their work again, usually more than once, before they hand it in. Most mistakes are found at this stage.'))

ch.append(chapter('c16', P4, 16, 'Spotting risks', 'تقييم المخاطر',
 'This chapter helps you find the places where a translation mistake could cause real harm.',
 [terms([('Risk', 'الخطر', 'The chance that a translation choice causes a problem.')]) +
  '<p>Check these eight risky places before you deliver a translation:</p>'
  + ex(['Risk', 'Example', 'What to do'],
       [['<b>Wrong term</b>', '<em>governing law</em> → ' + A('القانون الحاكم'), 'Check a specialised dictionary'],
        ['<b>Lost “not”</b>', 'A negative sentence becomes positive', 'Compare sentence by sentence'],
        ['<b>Cultural image</b>', '<em>warmed my heart</em> → ' + A('أدفأ قلبي'), 'Use cultural approximation'],
        ['<b>Sensitive names</b>', '<em>Persian Gulf / Arabian Gulf</em>', 'Follow the client; mention it in your commentary'],
        ['<b>Legal words</b>', '<em>shall</em> → ' + A('سوف'), 'Use the Arabic present tense'],
        ['<b>Numbers and dates</b>', 'Wrong figure, Hijri or Gregorian date', 'Check every number'],
        ['<b>Wrong style</b>', 'A dialect word in a formal report', 'Re-read with the brief in mind'],
        ['<b>Unclear word</b>', A('علم') + ': flag, knowledge or taught?', 'Read the words around it']], ['24%', '38%', None]) +
  remember(['Check numbers, names, negatives and legal words every time.', 'The higher the risk, the more carefully you check. Ask a second person if needed.'])],
 pl='Some mistakes are small, such as a missing comma. Others can cause real harm, such as a wrong dose in a medicine leaflet or a missing “not” in a contract. This chapter shows you where the dangerous mistakes usually hide.'))

ch.append(chapter('c17', P4, 17, 'Writing a commentary', 'كتابة التعليق على الترجمة',
 'This chapter shows you how to explain and justify your translation choices.',
 [terms([('Commentary', 'التعليق على الترجمة', 'A short text that explains the problems in a translation and justifies the solutions.')]) +
  '<h2><span class="n">17.1</span>Five parts for each problem</h2>'
  '<p>For each difficult point, answer these five questions in order:</p>'
  '<ol><li><b>Problem:</b> what was difficult?</li><li><b>Solution:</b> what did you write?</li><li><b>Strategy:</b> which strategy or procedure did you use?</li><li><b>Resource:</b> which dictionary or source did you check?</li><li><b>Justification:</b> why is your choice right?</li></ol>'
  '<h2><span class="n">17.2</span>An example</h2>'
  '<p style="background:var(--soft);padding:3mm 4mm;border-radius:1.5mm">The source text says the agreement “remained a dead letter”. A literal translation, ' + A('حرفاً ميتاً') + ', would confuse Arab readers, so the translator chose ' + A('حبراً على ورق') + '. This is a <b>functional equivalent</b>. It was checked in Arabic newspapers. It is a familiar idiom and suits the formal style of the news report.</p>'
  + remember(['Problem → solution → strategy → resource → justification.', 'Write in the <b>third person</b> (“The translator…”), quote your examples and name the strategy.', 'Always explain <b>why</b>.'])],
 pl='A commentary explains your choices, like showing your working in a maths exam: <b>what</b> was difficult, <b>what</b> you did, and <b>why</b>.'))

ch.append(chapter('c18', P4, 18, 'Language and ideology', 'اللغة والأيديولوجيا',
 'This chapter explains how word choices can show a point of view, and what a translator should do about it.',
 [terms([('Ideology', 'الأيديولوجيا', 'A set of beliefs that affects how events are described.'),
         ('Discourse analysis', 'تحليل الخطاب', 'Studying how language shows power and ideology.')]) +
  '<h2><span class="n">18.1</span>No word is neutral</h2>'
  '<p>Word choices can show a point of view. Your translation can keep, soften or strengthen it, so choose carefully:</p>'
  + ex(['English', '|Arabic', 'Note'],
       [['<em>regime</em> · <em>government</em>', A('نظام · حكومة'), '“Regime” is negative'],
        ['<em>suicide bomber</em>', A('انتحاري / استشهادي'), 'The choice depends on the client’s policy'],
        ['<em>Protesters were killed.</em>', A('قُتل متظاهرون'), 'The passive hides who did it']], ['34%', '32%', None]) +
  '<h2><span class="n">18.2</span>Three levels (Fairclough)</h2>'
  '<p>The linguist Norman Fairclough looks at every text on three levels, from the words on the page to society as a whole:</p>'
  + ex(['Level', 'Ask'], [['1. The text', 'Which words show judgement? Who is the doer?'], ['2. Its production', 'Who wrote it, and for which newspaper or organisation?'], ['3. Society', 'Whose interests does it serve?']], ['30%', None])
  + remember(['Notice loaded words.', 'Follow the client’s policy, and explain your choice in the commentary.'])],
 pl='The same event can be described in different words, and each choice shows a point of view. Is a group of fighters called “rebels”, “militants” or “freedom fighters”? A translator must notice these choices and handle them carefully.',
 q=quote('Language use as a form of social practice.', 'Norman Fairclough, <em>Discourse and Social Change</em> (1992), on what “discourse” means')))

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
  '<h2><span class="n">19.2</span>Printed or digital?</h2>'
  '<p>Both kinds are useful. Know the strengths and weaknesses of each:</p>'
  + ex(['', 'Printed dictionaries', 'Digital dictionaries'],
       [['<b>Strengths</b>', 'Edited by experts; reliable; full entries with examples', 'Fast; easy to search; updated with new words'],
        ['<b>Weaknesses</b>', 'Slow to search; new words may be missing', 'Quality varies; some are written by anonymous users']], ['20%', None, None]) +
  '<p>With a digital dictionary, always check <b>who publishes it</b>. A digital version of a well-known printed dictionary is safer than an unknown website.</p>'
  '<h2><span class="n">19.3</span>The three-check rule</h2>'
  '<ol><li>Find options in a <b>bilingual</b> dictionary.</li><li>Confirm the meaning in a <b>monolingual</b> dictionary.</li><li>Check how the word is really used in a <b>text written in the target language</b>.</li></ol>'
  '<p><b>Example:</b> for <em>fast colour</em>, a bilingual dictionary gives ' + A('سريع، ثابت') + '. An Arabic dictionary confirms that ' + A('ثابت') + ' means “does not fade”. So the answer is ' + A('لون ثابت') + '.</p>'
  + remember(['Never take the first meaning a dictionary gives.', 'Check in a bilingual dictionary, then a monolingual one, then a real text.'])],
 pl='A dictionary gives you <b>options</b>, not answers. You still have to choose the option that fits your context.',
 q=quote('Dictionaries are like watches; the worst is better than none, and the best cannot be expected to go quite true.', 'Samuel Johnson, author of <em>A Dictionary of the English Language</em>, as recorded by Hester Piozzi (1786)')))

ch.append(chapter('c20', P5, 20, 'Machine translation and AI', 'الترجمة الآلية والذكاء الاصطناعي',
 'This chapter explains how to use machine translation and AI safely.',
 [terms([('Post-editing', 'التحرير اللاحق', 'Correcting machine output.'),
         ('Hallucination', 'الهلوسة', 'An AI invention, not in the source.')]) +
  '<h2><span class="n">20.1</span>Useful or risky?</h2>'
  + ex(['Useful for', 'Risky for'], [['A first draft of simple texts<br>Checking your ideas', 'Legal, medical and religious texts; idioms and poetry<br>Private or confidential texts']]) +
  '<h2><span class="n">20.2</span>Typical machine mistakes</h2>'
  + ex(['English', '|Machine ✗', '|Correct ✓'],
       [['<em>It’s raining cats and dogs.</em>', A('إنها تمطر قططاً وكلاباً'), A('تمطر بغزارة')],
        ['<em>The doctor said she…</em>', A('قال الطبيب…'), A('قالت الطبيبة…')]], ['36%', None, None]) +
  '<h2><span class="n">20.3</span>Four rules</h2>'
  '<ol><li><b>You are responsible</b> for every word.</li><li>Never put a client’s <b>private text</b> into a public AI tool.</li><li><b>Check</b> terms, names, numbers, idioms and every “not”.</li><li><b>Tell the client</b> if you used a machine or AI.</li></ol>'
  + remember(['Machine translation is a first draft, not a final translation.'])],
 pl='Machine translation and AI tools translate in seconds. They are useful helpers, but they make mistakes that beginners may miss. You, not the machine, are responsible for the final text.'))

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
  '<h2>Eight common genres</h2>'
  '<p>The middle column tells you what to pay most attention to. The examples show each genre in both languages.</p>'
  + ex(['Genre', 'What matters', 'Example'], [[f'<b>{g}</b>', w, e] for g, w, e in genres], ['16%', '28%', None])
  + remember(['Identify the genre <b>before</b> you translate: each genre has its own rules.'])],
 pl='A recipe, a news report and a poem are written in very different ways. Each type of text, or <b>genre</b>, has its own rules, and your translation must follow the rules of the same genre in the target language.'))

open('parts/02-chapters.html', 'w').write('\n'.join(ch))
print('chapters written')
