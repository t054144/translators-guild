# Checklists, worksheet, glossary, references and back cover.
A = lambda s: f'<span class="ar">{s}</span>'

def cl(title, items):
    return f'<h2>{title}</h2><ul class="cl">' + ''.join(f'<li>{i}</li>' for i in items) + '</ul>'

checklists = f'''<style>.cl{{list-style:none;margin:0 0 2mm}}.cl li{{position:relative;padding-left:6mm;margin-bottom:1.3mm}}.cl li::before{{content:"";position:absolute;left:0;top:.9mm;width:3.2mm;height:3.2mm;border:.3mm solid var(--purple);border-radius:.6mm}}
.wq{{display:grid;grid-template-columns:1fr;gap:0}}.wq div{{padding:1.6mm 0 5.5mm;border-bottom:.25mm dotted #b7aee0;font-size:9pt}}</style>
<section class="page" data-id="chk" id="chk" data-title="Checklists" data-ar="قوائم التحقّق"><div class="body">
<div class="part">Reference</div><h1 style="margin-top:3mm">Checklists</h1><div class="art">قوائم التحقّق</div><div class="rule"></div>
<p class="intro">Use these checklists with every translation. Tick each point as you go.</p>
{cl('Before you translate', ['I know the <b>client</b>, the <b>purpose</b> and the <b>audience</b>.', 'I have read the whole text <b>twice</b>.', 'I know the <b>genre</b> and the <b>tone</b>.', 'I have marked difficult words, idioms, names and cultural items.', 'I have made a list of <b>key terms</b>.', 'I have my dictionaries and resources ready.'])}
{cl('While you translate', ['The <b>meaning</b> is the same as in the source.', 'The <b>terms</b> are the same all the way through.', 'The <b>style</b> suits the brief (formal or informal).', 'The <b>collocations</b> and idioms sound natural.', 'Cultural references are handled.'])}
{cl('After you translate', ['Nothing is missing and nothing is added.', 'Every “not” is still there.', 'Grammar, spelling and punctuation are correct.', 'Numbers, names, dates, titles and captions are checked.', 'I have read the translation once <b>without</b> the source.'])}
{cl('Your commentary', ['For each problem: problem → solution → strategy → resource → justification.', 'I quote examples from the source and the translation.', 'I write in the third person.'])}
</div><div class="pn"></div></section>

<section class="page" data-id="ws" id="ws"><div class="body">
<div class="part">Reference</div><h1 style="margin-top:3mm">Analysis worksheet</h1><div class="art">ورقة تحليل النص</div><div class="rule"></div>
<p class="intro">Photocopy this page and fill it in before you translate a new text (Chapter 6).</p>
<p>Text: ____________________________________ &nbsp; Direction: ☐ EN → AR &nbsp; ☐ AR → EN</p>
<div class="wq">
<div>1. Who wrote it, and who published it?</div><div>2. Who is the client?</div><div>3. What is the purpose?</div><div>4. Who is the audience?</div><div>5. What is the genre?</div>
<div>6. What is the field?</div><div>7. What are the tone and style?</div><div>8. Which terms need checking?</div><div>9. Are there any cultural items?</div><div>10. Which strategies and resources will I use?</div>
</div>
</div><div class="pn"></div></section>'''

G = [("Adaptation","التكييف","Replacing a cultural situation with a familiar one.","c10"),
("Addition","الإضافة","Adding words the reader needs.","c11"),
("Analysis (text analysis)","تحليل النص","Studying a text before translating it.","c6"),
("Approximation","التقريب","Bringing the meaning as close as possible to the TL.","c1"),
("Borrowing","الاقتراض","Taking a word from the SL as it is.","c10"),
("Calque","النسخ","Translating each part of an expression.","c10"),
("Client","العميل","The person or organisation who asks for a translation.","c3"),
("Collocation","التلازم اللفظي","Words that naturally go together.","c8"),
("Commentary","التعليق على الترجمة","A text that explains and justifies translation choices.","c17"),
("Commissioned translator","مترجم بتكليف","A translator who works for a client.","c2"),
("Communication","التواصل","Understanding and being understood.","c1"),
("Connotation","المعنى الإيحائي","The feeling a word carries.","c5"),
("Context","السياق","The words and situation around a text.","c5"),
("Cultural approximation","التقريب الثقافي","Bringing cultural meaning close to the TL reader.","c12"),
("Cultural substitution","الإبدال الثقافي","Replacing a cultural reference with a TL one.","c11"),
("Denotation","المعنى المعجمي","The basic dictionary meaning.","c5"),
("Descriptive translation","الترجمة الوصفية","Explaining a word by describing it.","c13"),
("Discourse analysis","تحليل الخطاب","Studying how language shows power and ideology.","c18"),
("Domestication","التوطين","Making a text feel local to the reader.","c11"),
("Equivalence","التكافؤ","A TL expression that matches the SL one.","c7"),
("Foreignisation","التغريب","Keeping the foreign flavour of a text.","c11"),
("Form","البناء","The structure of words and sentences.","c5"),
("Formal equivalence","التكافؤ الشكلي","Keeps the form of the original.","c7"),
("Free translation","الترجمة الحرّة","Keeps the message, but not the form.","c9"),
("Functional equivalence","التكافؤ الوظيفي","Keeps the function of the original.","c7"),
("Genre","الجنس النصّي","A type of text, e.g. news or a contract.","c21"),
("Hallucination","الهلوسة","AI output that is not in the source.","c20"),
("Ideational equivalence","التكافؤ الفكري","Keeps only the basic idea.","c7"),
("Ideology","الأيديولوجيا","Beliefs that affect how events are described.","c18"),
("Idiom","التعبير الاصطلاحي","A fixed expression whose meaning is not the sum of its words.","c8"),
("Interpretation","الترجمة الشفهية","Translating speech.","c1"),
("Lexical creation","النحت المعجمي","Creating a new word in the TL.","c13"),
("Literal translation","الترجمة الحرفية","Keeping the words and changing only the grammar.","c9"),
("Machine translation","الترجمة الآلية","Translation done by software.","c20"),
("Meaning","المعنى","The idea that words express.","c5"),
("Metaphor","الاستعارة","A comparison without “as” or “like”.","c11"),
("Modern Standard Arabic","الفصحى المعاصرة","The Arabic of newspapers, laws and education.","c4"),
("Modulation","التحوير","Changing the point of view.","c10"),
("Omission","الحذف","Leaving out words that repeat the meaning.","c11"),
("Post-editing","التحرير اللاحق","A human correcting machine translation.","c20"),
("Procedure","الإجراء","A technique for translating a word or phrase.","c10"),
("Proverb","المثل","A traditional saying.","c8"),
("Register","المستوى اللغوي","How formal the language is.","c4"),
("Revision","المراجعة","Checking and correcting a translation.","c15"),
("Risk","الخطر","The chance that a choice causes a problem.","c16"),
("Self-initiated translator","مترجم بمبادرة ذاتية","A translator who chooses a text, with no client.","c2"),
("Simile","التشبيه","A comparison with “as” or “like”.","c11"),
("Source language (SL)","اللغة المصدر","The language of the original text.","howto"),
("Strategy","الاستراتيجية","A planned solution to a translation problem.","c11"),
("Target language (TL)","اللغة الهدف","The language of the translation.","howto"),
("Term","المصطلح","A word with a special meaning in one field.","c14"),
("Translation","الترجمة التحريرية","Transferring the meaning of a written text.","c1"),
("Translation brief","موجز الترجمة","Client, purpose and audience.","c3"),
("Transliteration","النقل الصوتي","Writing a word’s sounds in the other alphabet.","c13"),
("Transposition","الإبدال","Changing the word class, e.g. noun → verb.","c10"),
("Verbal sentence","الجملة الفعلية","A sentence that starts with a verb.","c4")]
rows = ''.join(f'<div class="gr"><b>{t}</b><span class="ar">{a}</span><span>{d}</span><span class="gp" data-ref="{r}"></span></div>' for t, a, d, r in G)
glossary = f'''<style>.gr{{display:grid;grid-template-columns:34mm 30mm 1fr 7mm;gap:2.4mm;padding:1.3mm 0;border-bottom:.25mm solid var(--line);font-size:8.7pt;line-height:1.35;align-items:baseline}}.gr b{{color:var(--deep)}}.gr .ar{{text-align:right;color:var(--purple)}}.gr .gp{{text-align:right;color:var(--ink-3)}}</style>
<section class="page" data-id="gl" id="gl" data-title="Glossary" data-ar="مسرد المصطلحات"><div class="body">
<div class="part">Reference</div><h1 style="margin-top:3mm">Glossary</h1><div class="art">مسرد المصطلحات</div><div class="rule"></div>
<p class="intro">The key terms in this handbook, in alphabetical order, with the page where each one is explained.</p>
{rows}
</div><div class="pn"></div></section>'''

refs = '''<style>.rf p{padding-left:5mm;text-indent:-5mm;font-size:8.8pt;margin-bottom:1.8mm}</style>
<section class="page" data-id="refs" id="refs" data-title="References" data-ar="المراجع"><div class="body">
<div class="part">Reference</div><h1 style="margin-top:3mm">References</h1><div class="art">المراجع</div><div class="rule"></div>
<div class="rf">
<h2>Team course materials</h2>
<p>The Translation Team’s course notes and drafts, the <b>180</b> textbook and the <b>182</b> course book. <span class="note">(Full details to be added.)</span></p>
<p><span class="ar">الترجمة: ماهيتها</span>, a text cited in the team notes. <span class="note">(Author and details to be confirmed.)</span></p>
<h2>Books and articles</h2>
<p>Baker, M. (2018). <em>In Other Words: A Coursebook on Translation</em> (3rd ed.). Routledge.</p>
<p>Fairclough, N. (1992). <em>Discourse and Social Change</em>. Polity Press.</p>
<p>Farghal, M., &amp; Shunnaq, A. (1999). <em>Translation with Reference to English and Arabic: A Practical Guide</em>. Dar Al-Hilal.</p>
<p>Newmark, P. (1988). <em>A Textbook of Translation</em>. Prentice Hall.</p>
<p>Nord, C. (1997). <em>Translating as a Purposeful Activity</em>. St. Jerome.</p>
<p>Pym, A. (2015). Translating as risk management. <em>Journal of Pragmatics</em>, 85, 67–80.</p>
<p>Venuti, L. (1995). <em>The Translator’s Invisibility</em>. Routledge.</p>
<p>Vinay, J.-P., &amp; Darbelnet, J. (1995). <em>Comparative Stylistics of French and English</em> (J. C. Sager &amp; M.-J. Hamel, Trans.). John Benjamins. (Original work published 1958)</p>
<h2>Texts quoted</h2>
<p>al-Mutanabbi (d. 965 CE). <em>Dīwān</em>. · Shakespeare, W. (1609). <em>Sonnet 18</em>. · United Nations (1948). <em>Universal Declaration of Human Rights</em>, Article 1.</p>
<h2>Dictionaries and resources</h2>
<p>Baalbaki, M. <em>Al-Mawrid: A Modern English–Arabic Dictionary</em>. Dar El-Ilm Lilmalayin. · Wehr, H. (1994). <em>A Dictionary of Modern Written Arabic</em> (4th ed.). Spoken Language Services. · Academy of the Arabic Language, Cairo. <em>Al-Muʿjam al-Wasīṭ</em>. · <em>Oxford Collocations Dictionary for Students of English</em> (2nd ed., 2009). Oxford University Press. · UNTERM (United Nations terminology database). · Arabterm.</p>
</div></div><div class="pn"></div></section>'''

back = '''<section class="page" data-id="back" style="background:linear-gradient(195deg,#9e05cf 0%,#8103d3 45%,#5c06ea 100%);color:#fff">
<div style="position:absolute;left:24mm;right:24mm;top:70mm">
<p style="font-family:var(--serif);font-style:italic;font-size:17pt;line-height:1.35;margin-bottom:4mm">“Translate the meaning, not the words.”</p>
<p style="font-family:var(--ar);font-size:15pt;direction:rtl;text-align:left;color:#eadcff;margin-bottom:12mm">ترجِمِ المعنى، لا الكلمات.</p>
<p style="font-size:10pt;line-height:1.65;color:#f3eaff">This handbook introduces beginners to translating between English and Arabic, step by step, from preparing to translate to checking and explaining the result. Each chapter follows the same simple layout, with clear examples in both languages and exercises with answers.</p>
</div>
<div style="position:absolute;left:24mm;bottom:22mm;display:flex;align-items:flex-start;gap:1.4mm;font-family:var(--serif);font-weight:700;font-size:20pt;line-height:.85">Guild<span style="display:flex;flex-direction:column;gap:.9mm;padding-top:.8mm"><i style="width:2mm;height:2mm;border-radius:50%;background:#8756c0"></i><i style="width:2mm;height:2mm;border-radius:50%;background:#867ef6"></i><i style="width:2mm;height:2mm;border-radius:50%;background:#cccdfb"></i></span></div>
<div style="position:absolute;right:24mm;bottom:22mm;text-align:right;font-size:7.4pt;letter-spacing:.22em;color:#eadcff;line-height:1.9">TRANSLATION TEAM<br>PROFESSIONAL CLUB<br>FIRST EDITION · 2026</div>
</section>'''

open('parts/04-end.html', 'w').write(checklists + glossary + refs + back)
print(len(G), 'glossary terms')
