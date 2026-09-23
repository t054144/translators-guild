G=[
("Adaptation","التكييف","Replacing a situation unknown in the TL culture with a familiar one","c9"),
("Addition","الإضافة","Adding words the TL reader needs","c8"),
("Approximation","التقريب","Bringing SL meaning as close as possible to the TL","c10"),
("Arabicisation","التعريب","Fitting a borrowed word to Arabic sounds and patterns","c12"),
("Bilingual dictionary","معجم ثنائي اللغة","Gives equivalents in another language","c19"),
("Borrowing","الاقتراض","Taking an SL word as it is","c9"),
("Calque","النسخ","Translating each part of an expression literally","c9"),
("Collocation","التلازم اللفظي","Words that naturally go together","c6"),
("Commentary","التعليق على الترجمة","A text that explains and justifies translation choices","c15"),
("Commissioned translator","مترجم بتكليف","Works for a client (a freelancer included)","c1"),
("Communication","التواصل","Understanding and being understood","c1"),
("Communicative translation","الترجمة التواصلية","Natural translation focused on the reader","c7"),
("Compensation","التعويض","Recreating a lost effect elsewhere in the text","c8b"),
("Concept","المفهوم","A complex meaning that a word stands for","c11"),
("Connotation","المعنى الإيحائي","The extra feeling a word carries","c4"),
("Context","السياق","Background that helps us understand a text","c4"),
("Critical discourse analysis","التحليل النقدي للخطاب","Studying power and ideology in language","c17"),
("Cultural approximation","التقريب الثقافي","Approximating cultural meaning","c10"),
("Cultural substitution","الإبدال الثقافي","Replacing a cultural item with a TL one","c8"),
("Denotation","المعنى المعجمي","The basic dictionary meaning","c4"),
("Descriptive translation","الترجمة الوصفية","Explaining a word by describing its meaning","c11"),
("Discourse","الخطاب","Language in use in society","c17"),
("Domestication","التوطين","Making a text feel local to TL readers","c8b"),
("Equivalence","التكافؤ","Finding the TL expression that matches the SL one","c5"),
("Foreignisation","التغريب","Keeping the foreign flavour of a text","c8b"),
("Form","البناء","The structure of words and sentences","c4"),
("Formal equivalence","التكافؤ الشكلي","Keeps the SL form","c5"),
("Free translation","الترجمة الحرّة","Keeps the message, not the form","c7"),
("Functional equivalence","التكافؤ الوظيفي","Keeps the function with a TL expression","c5"),
("Genre","الجنس النصّي","A familiar type of text, such as news or a contract","c18"),
("Hallucination","الهلوسة","AI output that is not in the source","c19"),
("Hybrid","المصطلح الهجين","A term that is half translated, half transliterated","c12"),
("Ideational equivalence","التكافؤ الفكري","Keeps only the basic idea","c5"),
("Ideology","الأيديولوجيا","Beliefs that shape how events are described","c17"),
("Idiom","التعبير الاصطلاحي","A fixed phrase whose meaning is not the sum of its words","c6"),
("Interpretation","الترجمة الشفهية","Oral translation of speech","c1"),
("Lexical creation","النحت المعجمي","Creating a new word for a lexical gap","c12"),
("Lexicalisation","التعجيم","When a new word enters the dictionary","c12"),
("Literal translation","الترجمة الحرفية","Keeps the words and adjusts the grammar","c7"),
("Loan word + explanation","الاقتراض مع الشرح","Keeping a term and explaining it","c8"),
("Localisation","الأقلمة","Adapting websites and apps for a market","c7"),
("Machine translation","الترجمة الآلية","Translation done by software","c19"),
("Meaning","المعنى","The idea that words express","c4"),
("Metaphor","الاستعارة","A comparison without “as” or “like”","c8b"),
("Mitigation","التخفيف","An action that reduces a risk","c16"),
("Modulation","التحوير","Changing the point of view","c9"),
("Monolingual dictionary","معجم أحادي اللغة","Explains words in one language","c19"),
("More general word","اللفظ الأعمّ","A broader word when no exact one exists","c8"),
("Neologism","اللفظ المستحدث","A brand-new word","c12"),
("Omission","الحذف","Removing words that repeat meaning","c8"),
("Phraseology","التعابير المسكوكة","The fixed word groups of a language","c6"),
("Post-editing","التحرير اللاحق","A human correcting machine output","c20"),
("Procedure","الإجراء","A technique for a word or phrase","c9"),
("Proverb","المثل","A traditional saying","c6"),
("Register","المستوى اللغوي","How formal the language is","c3"),
("Revision","المراجعة","Checking a translation against the source","c20"),
("Risk","الخطر","The chance that a choice causes a problem","c16"),
("Self-initiated translator","مترجم بمبادرة ذاتية","Chooses the text, with no client","c1"),
("Semantic translation","الترجمة الدلالية","Stays close to the author’s meaning","c7"),
("Sight translation","الترجمة المنظورة","Reading a text aloud in another language","c7"),
("Simile","التشبيه","A comparison with “as” or “like”","c8b"),
("Speaker meaning","قصد المتكلم","What a speaker really means","c4"),
("Strategy","الاستراتيجية","A planned solution to a problem","c8"),
("Term","المصطلح","A word naming a concept in a field","c13"),
("Terminology guide","دليل المصطلحات","The list of approved terms","c13"),
("Text","النص","Any piece of language that communicates","c14"),
("Text analysis","تحليل النص","Breaking a text down before translating","c14"),
("Transcreation","الترجمة الإبداعية","Recreating an advert for a new market","c7"),
("Translation","الترجمة التحريرية","Transferring written meaning between languages","c1"),
("Translation brief","موجز الترجمة","Client + purpose + audience","c2"),
("Transliteration","النقل الصوتي","Writing SL sounds in TL letters","c12"),
("Transposition","الإبدال","Changing the word class","c9"),
("Verbal sentence","الجملة الفعلية","A sentence that starts with a verb","c3"),
]
def entry(t,a,d,r): return f'<div class="g"><div class="gh"><b>{t}</b><span class="ar">{a}</span><em data-ref="{r}"></em></div><div class="gd">{d}</div></div>'
half=(len(G)+1)//2
def page(items,first):
    head='''<div class="opener plain"><div class="kick"><span class="dots"><i></i><i></i><i></i></span> &nbsp;Quick reference</div><h2>Glossary</h2><div class="arT">مسرد المصطلحات</div></div>
<p class="small">Every key term in the handbook, with its Arabic equivalent, a short definition and the page where it is explained.</p>''' if first else ''
    return f'''<section class="page" data-id="{'gl' if first else 'gl2'}"{' id="gl"' if first else ''}>
<div class="tab" data-p="Q">Q</div>
<div class="rh"><span>Glossary</span><span class="ar">مسرد المصطلحات</span></div>
<div class="body">{head}
<div class="gl">{''.join(entry(*g) for g in items)}</div>
</div>
<div class="folio"><i></i><i></i><i></i><span>Quick Reference</span></div>
</section>'''
css='''<style>.gl{columns:2;column-gap:6mm;column-rule:.2mm solid var(--rule)}.g{break-inside:avoid;padding:1mm 0 1.1mm;border-bottom:.2mm dotted var(--d3)}.gh{display:grid;grid-template-columns:auto 1fr 6mm;gap:2mm;align-items:baseline}.gh b{font-size:8.2pt;color:var(--deep)}.gh .ar{text-align:right;color:var(--v2);font-size:1.05em}.gh em{font-style:normal;font-weight:700;color:var(--v3);text-align:right;font-size:7.6pt}.gd{font-size:7.5pt;color:var(--ink-2);line-height:1.3}</style>'''
k=33
open('parts/09-gloss.html','w').write(css+page(G[:k],True)+page(G[k:],False))
print(len(G))
