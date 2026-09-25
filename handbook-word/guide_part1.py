# Rewrites the opening of the handbook and Chapters 1 and 2 as a guided, step-by-step introduction for complete beginners.
import re
s = open('c2a.js').read()
def cut(start, end):
    i = s.index(start); j = s.index(end, i); return i, j

START_HERE = """['front', 'Start here'],
['p', 'This book is for you if you have never studied translation. You do not need any background: only good English, good Arabic and curiosity. We will start from zero and go one step at a time.'],
['h', 'What does a translator actually do?'],
['p', 'Imagine you are walking in a park with a friend who reads only Arabic. You see a sign that says _Keep off the grass._ Your friend asks what it means.'],
['p', 'You would not say {{ابقَ بعيداً عن العشب}}. You would say what an Arabic sign says in the same place: {{ممنوع الدوس على العشب}}. You understood the English, then said the same thing the way Arabic says it.'],
['p', 'That is translation. Everything in this book grows from this simple idea.'],
['h', 'The four steps of every translation'],
['p', 'Whether you translate a sign, a letter or a book, you always do the same four things:'],
['ol', [
  '**Understand.** Read the text until you know exactly what it means.',
  '**Plan.** Ask who will read your translation and why.',
  '**Write.** Say the same thing in the other language, in a natural way.',
  '**Check.** Read your translation again and correct it.',
]],
['p', 'The chapters of this book teach you how to do each step better.'],
['h', 'Your journey through this book'],
['ol', [
  '**First steps** (Part 1): what translation is, how to prepare, and how English and Arabic differ.',
  '**Understanding meaning** (Parts 2 and 3): how words carry meaning, and how they work together.',
  '**Solving problems** (Parts 4 and 5): the methods translators use when a word or an idea does not travel easily.',
  '**Whole texts** (Part 6): how to read and translate a complete text, such as a news report.',
  '**Tools and checking** (Parts 7 and 8): dictionaries, technology, and how to check and explain your work.',
  '**Films and videos** (Part 9): subtitles and dubbing, the most advanced topic.',
]],
['p', 'Read the parts in order: each one uses what you learned before it.'],
['h', 'How each chapter guides you'],
['ul', [
  '**Where we are** tells you what you already know and what comes next.',
  'The chapter explains each idea with examples in English and Arabic.',
  '**Try it** gives you a few questions, with the answers straight after.',
  '**Remember** sums up the chapter, and **Words to remember** gives the new terms with their Arabic equivalents. All the terms are also in the glossary at the end.',
]],
['h', 'Signs used in this book'],
['ul', [
  '**EN → AR**: from English into Arabic. **AR → EN**: from Arabic into English.',
  '**✓** marks a good translation and **✗** a poor one.',
  'The short notes in brackets, such as (Newmark, 1988), show where an idea comes from. The full sources are in the References.',
]],
"""

CH1 = """['ch', 'Chapter 1: Translation and the translator'],
['intro', 'This is your starting point. In this chapter you will see what translation really is, the different kinds of translation, and what you need to become a translator.'],
['terms', [
  ['Translation', 'الترجمة', 'Transferring meaning from one language into another. In a narrow sense, written translation ({{الترجمة التحريرية}}), as opposed to interpreting.'],
  ['Interpreting', 'الترجمة الشفهية', 'Transferring spoken language into another language.'],
  ['Source text (ST)', 'النص المصدر', 'The original text that you translate.'],
  ['Target text (TT)', 'النص الهدف', 'Your translation.'],
  ['Approximation', 'التقريب', 'Rendering the meaning of the source text as closely as possible in the target language, knowing that an exact match is impossible.'],
  ['Commissioned translator', 'مترجم بتكليف', 'A translator who translates a text at someone else’s request.'],
  ['Self-initiated translator', 'مترجم بمبادرة ذاتية', 'A translator who chooses a text to translate on their own initiative.'],
]],
['h', 'Step 1: translation carries meaning, not words'],
['p', 'Imagine a friend who reads only Arabic asks what an English sign says. You would not read out the words one by one; you would say what the sign **means**, in good Arabic. That is translation.'],
['p', 'Here is what happens when we translate words instead of meaning. English speakers say _Break a leg!_ to wish someone good luck, especially before a performance:'],
['ex', 'Word by word: {{اكسر ساقاً!}}  ✗    By meaning: {{بالتوفيق!}}  ✓'],
['p', 'Experts describe translation in the same way: “an activity or process of transferring textual meaning from one language to another” (Translation Team, n.d.), or “rendering the meaning of a text into another language in the way that the author intended the text” (Newmark, 1988, p. 5).'],
['p', 'From now on, we call the original text the **source text** and your translation the **target text**.'],
['h', 'Step 2: a translation is never a perfect copy'],
['p', 'No two languages match perfectly, so you can never make an exact copy. You bring the meaning as close as you can. This is called **approximation**. Translation has been described as “saying almost the same thing” (Eco, 2003).'],
['p', 'And your translation has one test: your reader must understand it. If they do not, the translation has not worked.'],
['h', 'Step 3: the different kinds of translation'],
['p', 'People translate in several ways:'],
['ul', [
  '**Written translation**: translating written texts. This is what this book teaches.',
  '**Interpreting**: translating speech, while the speaker is talking (simultaneous) or after the speaker stops (consecutive).',
  '**Sight translation**: reading a written text aloud in another language.',
  '**Audiovisual translation**: translating films, television and video games, for example with subtitles (Part 9).',
  '**Localisation**: adapting a product, such as a website or an app, to another country’s language and culture.',
]],
['p', 'In a wider sense, even rewording a text in the same language, or turning a story into a film, is a kind of translation (Jakobson, 1959). In this book, we focus on translating from one language into another.'],
['h', 'Step 4: what you need to become a translator'],
['p', 'Knowing two languages is the start, not the end. A good translator:'],
['ul', [
  'knows both languages well;',
  'knows both **cultures** well ({{مُلِمّ بالثقافتين}});',
  'is curious and learns about the topic of each text;',
  'knows many expressions and idioms in both languages;',
  'keeps practising and checking their work.',
]],
['p', 'This is not a new idea. More than a thousand years ago, an Arabic writer said that a translator must know both languages equally well (al-Jāḥiẓ, 1965):'],
['ar', 'ولا بدَّ للتَّرجُمانِ من أن يكونَ بيانُه في نفسِ الترجمةِ في وزنِ علمِه في نفسِ المعرفة، وينبغي أن يكونَ أعلمَ الناسِ باللغةِ المنقولةِ والمنقولِ إليها، حتى يكونَ فيهما سواءً وغايةً.'],
['p', 'Remember that a translator is a reader before being a writer: first understand the text fully, then write it again in the other language.'],
['h', 'Step 5: who chooses the text?'],
['p', 'Sometimes someone asks you to translate a text: a client, an agency or an employer. You are then a **commissioned translator**, and you follow their instructions (Chapter 2). Sometimes you choose the text yourself, such as a poem you love. You are then a **self-initiated translator**, and you make your own choices.'],
['p', 'Freelance and in-house translators both do commissioned work, and any translator can also translate a text on their own initiative.'],
['try', ['What is the difference between translation and interpreting?', 'A publisher asks you to translate a novel. Are you a commissioned or a self-initiated translator?', 'Why is translation called “approximation”?'],
        ['Translation deals with written texts; interpreting deals with speech.', 'Commissioned: the publisher chose the text and asked you to translate it.', 'Because no two languages match perfectly, so the translator can only come as close as possible to the original meaning.']],
['summary', ['Translation carries **meaning**, not words, from one language to another.', 'A good translator needs two languages **and** two cultures.', 'Commissioned translators follow the brief; self-initiated translators choose their own texts.']],

"""

CH2 = """['ch', 'Chapter 2: Tips, advice and preparation'],
['intro', 'You now know what translation is. Before you translate your first sentence, you need to prepare. This chapter walks you through what to do before, during and after translating, and ends with your first complete translation.'],
['terms', [
  ['Client', 'العميل', 'The person or organisation that asks for a translation.'],
  ['Communicative purpose', 'الغرض التواصلي', 'What the translation is for: to inform, persuade, instruct or entertain.'],
  ['Target audience', 'الجمهور المستهدف', 'The people who will read the translation.'],
  ['Translation brief', 'موجز الترجمة', 'The client’s instructions for a translation: who it is for, what it is for and any other requirements.'],
  ['Mental draft', 'المسوّدة الذهنية', 'A first idea of the translation that you form while reading the text.'],
]],
['h', 'Before you start: ask three questions'],
['p', 'A news report for experts and a leaflet for children need different words. The purpose of a translation decides how it should be translated (Nord, 1997). So before you write anything, ask:'],
['ol', [
  '**Who is the client?** ({{من هو العميل؟}}) Clients have their own style and rules.',
  '**What is the translation for?** ({{ما الغرض التواصلي؟}}) To inform, to persuade, to instruct or to entertain?',
  '**Who will read it?** ({{من هو الجمهور المستهدف؟}}) Experts or the general public? Adults or children?',
]],
['p', 'The answers are your **translation brief**. If nobody gives you one, ask. If you chose the text yourself, answer the questions yourself.'],
['p', 'For example, a short news report translated for KUNA, the Kuwait News Agency, informs English readers interested in Kuwait. So the translation should be formal and neutral, with a short headline.'],
['h', 'Next: get to know the text'],
['ol', [
  '**Read the whole text** once, just to understand it.',
  '**Read it again with a pen.** Mark difficult words, idioms, names and numbers.',
  '**Find out about the topic** if you do not know it well.',
  '**List the key terms** and check them in a dictionary (Chapters 20 and 21).',
  '**Picture the translation**: imagine how it should sound. This is your **mental draft**.',
]],
['h', 'While you translate'],
['p', 'Break a long text into smaller pieces: paragraphs into sentences, sentences into phrases. Work out what each piece means, then rebuild it in the other language. Keep the links between sentences, such as cause and effect.'],
['p', 'Good habits from experienced translators:'],
['ul', [
  '**Be faithful** ({{الأمانة}}): do not add or remove meaning. Aim to be faithful, accurate and acceptable to the reader.',
  '**Write naturally**: the result should usually read as if it had been written in the target language.',
  '**Tread carefully**: translation is like a minefield ({{الترجمة كحقل ألغام}}). Know what is appropriate in both cultures.',
  '**Translate everything**, including titles, captions and notes. Keep titles short, and do not add to them.',
  '**Keep it simple.**',
]],
['h', 'After you translate'],
['p', 'Always read your translation again, even when you think it is perfect (Chapter 23). Poetry often allows more creative freedom, but informative texts, such as reports and instructions, must be exact. Good translators combine quality and speed, and that builds their reputation.'],
['h', 'Your first translation, step by step'],
['p', 'Now let us put it all together on one short sentence:'],
['ex', '_It’s raining cats and dogs, so the match has been cancelled._'],
['ol', [
  '**Plan.** A school is informing Arabic-speaking parents about the match, so the Arabic should be clear and simple.',
  '**Understand.** _Raining cats and dogs_ is an idiom meaning “raining heavily”. It has nothing to do with animals (Chapter 8).',
  '**Write.** A word-by-word version, {{إنها تمطر قططاً وكلاباً، لذلك تمّ إلغاء المباراة.}}, makes no sense. A translation of the meaning works: {{أُلغيت المباراة بسبب الأمطار الغزيرة.}}',
  '**Check.** Read the Arabic without the English: the meaning is complete and the sentence sounds natural.',
  '**Explain**, if you are asked why: “The idiom was translated by its meaning, because a word-for-word version would make no sense to Arabic-speaking readers” (Chapter 25).',
]],
['p', 'You have just translated your first sentence the way professionals do. The rest of the book helps you do each step better.'],
['try', ['A hospital asks you to translate a medicine leaflet for its patients. Who is the target audience, and what style should you use?', 'What is the purpose of an advert?', 'Why should you read the whole text before you start translating?'],
        ['Patients from the general public, so use a clear, simple style with exact words.', 'To persuade.', 'To understand it, find the difficult parts in advance, and form a mental draft.']],
['summary', ['Ask three questions first: **client, purpose, audience**.', 'Read the whole text at least twice before you translate.', 'Be faithful, write naturally, and always revise.']],

"""
i, j = cut("['front', 'How to use this handbook'],", "// ================= PART 1 =================")
abbrev_i = s.index("['h', 'Abbreviations'],", i)
abbrev = s[abbrev_i:j].strip()
s = s[:i] + START_HERE + '\n' + s[j:]
i, j = cut("['ch', 'Chapter 1: Translation and the translator'],", "['ch', 'Chapter 3: English and Arabic: key differences'],")
s = s[:i] + CH1 + CH2 + s[j:]
s = s.replace("['intro', 'The main differences between English and Arabic (Farghal & Shunnaq, 1999; Ghazala, 2008).'],",
 "['intro', 'You are ready to translate. But English and Arabic work differently, and most beginners’ mistakes come from these differences. This chapter shows you the main ones (Farghal & Shunnaq, 1999; Ghazala, 2008).'],")
open('c2a.js', 'w').write(s)
# abbreviations move to the back of the book, just before the glossary
b = open('c2b.js').read()
abbrev = abbrev.replace("['h', 'Abbreviations'],", "['part', 'Abbreviations'],")
b = b.rstrip()
assert b.endswith('];')
b = b[:-2].rstrip() + '\n\n' + abbrev + '\n];\n'
open('c2b.js', 'w').write(b)
print('ok')
