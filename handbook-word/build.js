// Builds Translation-Handbook.docx from content.js and back.js: plain text, headings and lists only.
const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, LevelFormat, PageNumber,
  Footer, TableOfContents, PageBreak,
} = require('docx');

const INK = '1F1A2E', ACCENT = '3D1591', GREY = '6B6680';
const LATIN = 'Calibri', ARABIC = 'Arial';

// ---------- inline text: **bold**, _italic_, {{Arabic}} ----------
function runs(text, base = {}) {
  const out = [];
  const re = /(\*\*[^*]+\*\*|\{\{[^}]+\}\}|_[^_]+_)/g;
  let last = 0, m;
  const push = (t, o) => { if (t) out.push(...latinOrArabic(t, { ...base, ...o })); };
  while ((m = re.exec(text))) {
    push(text.slice(last, m.index), {});
    const tok = m[0];
    if (tok.startsWith('**')) out.push(...runs(tok.slice(2, -2), { ...base, bold: true }));
    else if (tok.startsWith('{{')) out.push(arabic(tok.slice(2, -2), base));
    else out.push(...runs(tok.slice(1, -1), { ...base, italics: true }));
    last = m.index + tok.length;
  }
  push(text.slice(last), {});
  return out;
}
function latinOrArabic(t, o) { return [new TextRun({ text: t, font: LATIN, ...o })]; }
function arabic(t, o = {}) {
  return new TextRun({ text: t, rightToLeft: true, font: { ascii: ARABIC, hAnsi: ARABIC, cs: ARABIC }, size: 23, sizeComplexScript: 24,
    bold: o.bold, boldComplexScript: o.bold, color: o.color });
}

// ---------- block rendering ----------
let listInstance = 0;
let afterPart = false;
const body = [];
const P = (children, opts = {}) => body.push(new Paragraph({ children, spacing: { after: 120, line: 290 }, ...opts }));

function block(b) {
  const [kind, a, c] = b;
  switch (kind) {
    case 'front':
      body.push(new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: true, children: [new TextRun({ text: a })] }));
      break;
    case 'part':
      body.push(new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: true, children: [new TextRun({ text: a })] }));
      if (c) P(runs(c, { italics: true, color: GREY }), { spacing: { after: 360 } });
      afterPart = true;
      break;
    case 'ch':
      body.push(new Paragraph({ heading: HeadingLevel.HEADING_2, pageBreakBefore: !afterPart, children: [new TextRun({ text: a })] }));
      afterPart = false;
      break;
    case 'h':
      body.push(new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: a })] }));
      break;
    case 'p':
      P(runs(a));
      break;
    case 'ex':
      P(runs(a), { indent: { left: 567 } });
      break;
    case 'ar':
      body.push(new Paragraph({ bidirectional: true, alignment: AlignmentType.LEFT, indent: { left: 567 }, spacing: { after: 140, line: 300 }, children: [arabic(a)] }));
      break;
    case 'ol': {
      const inst = ++listInstance;
      a.forEach(t => P(runs(t), { numbering: { reference: 'num', level: 0, instance: inst }, spacing: { after: 80, line: 290 } }));
      body.push(new Paragraph({ spacing: { after: 40 }, children: [] }));
      break;
    }
    case 'ul':
      a.forEach(t => P(runs(t), { numbering: { reference: 'bul', level: 0 }, spacing: { after: 80, line: 290 } }));
      body.push(new Paragraph({ spacing: { after: 40 }, children: [] }));
      break;
    case 'try': {
      body.push(new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: 'Try it' })] }));
      const inst = ++listInstance;
      a.forEach(t => P(runs(t), { numbering: { reference: 'num', level: 0, instance: inst }, spacing: { after: 80, line: 290 } }));
      P([new TextRun({ text: 'Answers', bold: true, color: GREY, font: LATIN })], { spacing: { before: 100, after: 60, line: 290 } });
      const ai = ++listInstance;
      c.forEach(t => P(runs(t, { color: GREY }), { numbering: { reference: 'num', level: 0, instance: ai }, spacing: { after: 60, line: 290 } }));
      body.push(new Paragraph({ spacing: { after: 60 }, children: [] }));
      break;
    }
    default: throw new Error('unknown block ' + kind);
  }
}

// ---------- title page and contents ----------
const center = (children, spacing) => body.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing, children }));
center([new TextRun({ text: 'GUILD · TRANSLATION TEAM · PROFESSIONAL CLUB', font: LATIN, size: 18, color: GREY })], { before: 1800, after: 1400 });
center([new TextRun({ text: 'Translation Handbook', font: LATIN, size: 60, bold: true, color: ACCENT })], { after: 200 });
center([new TextRun({ text: 'A beginner’s guide to translating between English and Arabic', font: LATIN, size: 26, italics: true, color: INK })], { after: 500 });
body.push(new Paragraph({ bidirectional: true, alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [new TextRun({ text: 'دليل الترجمة', rightToLeft: true, font: { ascii: ARABIC, hAnsi: ARABIC, cs: ARABIC }, size: 44, sizeComplexScript: 44, bold: true, boldComplexScript: true, color: ACCENT })] }));
body.push(new Paragraph({ bidirectional: true, alignment: AlignmentType.CENTER, spacing: { after: 2400 }, children: [new TextRun({ text: 'مرشدٌ للمبتدئين في الترجمة بين العربية والإنجليزية', rightToLeft: true, font: { ascii: ARABIC, hAnsi: ARABIC, cs: ARABIC }, size: 26, sizeComplexScript: 26, color: INK })] }));
center([new TextRun({ text: 'First edition, 2026', font: LATIN, size: 20, color: GREY })], {});

body.push(new Paragraph({ pageBreakBefore: true, spacing: { after: 240 }, children: [new TextRun({ text: 'Contents', font: LATIN, size: 36, bold: true, color: ACCENT })] }));
body.push(new TableOfContents('Contents', { hyperlink: true, headingStyleRange: '1-2' }));
body.push(new Paragraph({ spacing: { before: 200 }, children: [new TextRun({ text: 'If the page numbers are missing, right-click the list and choose “Update Field”.', font: LATIN, size: 17, italics: true, color: GREY })] }));

// ---------- main content ----------
require('./content.js').forEach(block);
require('./back.js').forEach(block);

// ---------- glossary ----------
const G = [
  ['Adaptation', 'التكييف', 'Replacing a cultural reference with a familiar one.', 7],
  ['Addition', 'الإضافة', 'Adding a short explanation that the reader needs.', 8],
  ['Bilingual dictionary', 'معجم ثنائي اللغة', 'A dictionary that gives equivalents in another language.', 10],
  ['Borrowing', 'الاقتراض', 'Taking a word from the other language as it is.', 7],
  ['Calque', 'النسخ', 'Translating each part of an expression.', 7],
  ['Collocation', 'التلازم اللفظي', 'Words that naturally go together, such as _strong tea_.', 4],
  ['Commentary', 'التعليق على الترجمة', 'A short text that explains translation problems and justifies the solutions.', 14],
  ['Commissioned translator', 'مترجم بتكليف', 'A translator who works for a client.', 1],
  ['Connotation', 'المعنى الإيحائي', 'The feeling a word carries.', 3],
  ['Context', 'السياق', 'The words and the situation around a word or text.', 3],
  ['Critical discourse analysis', 'تحليل الخطاب النقدي', 'Studying how language shows power and ideology.', 16],
  ['Cultural approximation', 'التقريب الثقافي', 'Bringing a cultural meaning as close as possible to the reader.', 9],
  ['Cultural substitution', 'الإبدال الثقافي', 'Replacing a cultural reference with one the reader knows.', 9],
  ['Denotation', 'المعنى المعجمي', 'The basic dictionary meaning of a word.', 3],
  ['Descriptive translation', 'الترجمة الوصفية', 'Explaining a word by describing its meaning.', 8],
  ['Domestication', 'التوطين', 'Making a translation feel local to the reader.', 9],
  ['Draft', 'المسوّدة', 'The first version of a translation.', 11],
  ['Equivalence (procedure)', 'التكافؤ', 'Using a completely different fixed expression.', 7],
  ['Equivalent', 'المكافئ', 'An expression in the target language that matches the original.', 6],
  ['Foreignisation', 'التغريب', 'Keeping the foreign flavour of a text.', 9],
  ['Formal equivalence', 'التكافؤ الشكلي', 'Keeping the words and image of the original.', 6],
  ['Free translation', 'الترجمة الحرّة', 'Keeping the message, but not the form.', 6],
  ['Functional equivalence', 'التكافؤ الوظيفي', 'Using a different expression that does the same job.', 6],
  ['Genre', 'الجنس النصّي', 'A type of text with its own rules, such as a news report or a contract.', 15],
  ['Hallucination', 'الهلوسة', 'Information added by an AI tool that is not in the original.', 13],
  ['Ideational equivalence', 'التكافؤ الفكري', 'Keeping only the basic idea, in plain words.', 6],
  ['Ideology', 'الأيديولوجيا', 'A set of beliefs that shapes how events are described.', 16],
  ['Idiom', 'التعبير الاصطلاحي', 'A fixed expression whose meaning cannot be guessed from its words.', 4],
  ['Interpreting', 'الترجمة الشفهية', 'Translating speech.', 1],
  ['Lexical creation', 'النحت المعجمي', 'Creating a new word in the target language.', 8],
  ['Literal translation', 'الترجمة الحرفية', 'Keeping the original words and changing only what the grammar requires.', 6],
  ['Machine translation', 'الترجمة الآلية', 'Translation done by software.', 13],
  ['Metaphor', 'الاستعارة', 'Describing something as if it were something else.', 9],
  ['Modern Standard Arabic', 'الفصحى المعاصرة', 'The Arabic of newspapers, laws and education.', 5],
  ['Modulation', 'التحوير', 'Saying the same thing from another point of view.', 7],
  ['Monolingual dictionary', 'معجم أحادي اللغة', 'A dictionary that explains words in the same language.', 10],
  ['Non-equivalence', 'انعدام التكافؤ', 'When the target language has no word for something in the original.', 8],
  ['Omission', 'الحذف', 'Leaving out words that repeat the same meaning.', 5],
  ['Post-editing', 'التحرير اللاحق', 'Correcting a machine translation.', 13],
  ['Proverb', 'المثل', 'A traditional saying.', 4],
  ['Revision', 'المراجعة', 'Checking a translation and correcting it.', 11],
  ['Risk management', 'إدارة المخاطر', 'Taking more care where a mistake could cause more harm.', 12],
  ['Self-initiated translator', 'مترجم بمبادرة ذاتية', 'A translator who chooses a text, with no client.', 1],
  ['Simile', 'التشبيه', 'A comparison using “like” or “as”.', 9],
  ['Source language', 'اللغة المصدر', 'The language of the original text.', 1],
  ['Source text', 'النص المصدر', 'The original text that you translate.', 1],
  ['Target language', 'اللغة الهدف', 'The language you translate into.', 1],
  ['Target text', 'النص الهدف', 'Your translation.', 1],
  ['Term', 'المصطلح', 'A word with one exact meaning in a special field.', 10],
  ['Term list', 'قائمة المصطلحات', 'A list of the approved terms for a project.', 10],
  ['Terminology management', 'إدارة المصطلحات', 'Finding, checking, recording and sharing terms.', 10],
  ['Text analysis', 'تحليل النص', 'Studying a text before translating it.', 2],
  ['Translation', 'الترجمة التحريرية', 'Carrying the meaning of a written text into another language.', 1],
  ['Translation brief', 'موجز الترجمة', 'The client, purpose and audience of a translation.', 2],
  ['Translation procedure', 'إجراء الترجمة', 'A technique for translating a word or phrase.', 7],
  ['Transliteration', 'النقل الصوتي', 'Writing the sounds of a word in another alphabet.', 8],
  ['Transposition', 'الإبدال', 'Changing the word class, for example a noun into a verb.', 7],
];
block(['part', 'Glossary', 'All the key terms in this handbook, in alphabetical order, with the chapter where each one is explained.']);
G.forEach(([t, a, d, ch]) => P([...runs(`**${t}**`), new TextRun({ text: '  ', font: LATIN }), arabic(a), new TextRun({ text: '  ', font: LATIN }), ...runs(`${d} `), new TextRun({ text: `(Chapter ${ch})`, font: LATIN, color: GREY })], { spacing: { after: 90, line: 280 } }));

// ---------- references (APA 7) ----------
const R = [
  'Academy of the Arabic Language. (n.d.). _Al-muʿjam al-wasīṭ_ [The intermediate dictionary]. [Edition details to be confirmed.]',
  'al-Jāḥiẓ. (n.d.). _Kitāb al-ḥayawān_ [The book of animals] (ʿA. M. Hārūn, Ed.). [Edition details to be confirmed.] (Original work written 9th century CE)',
  'al-Mutanabbi. (n.d.). _Dīwān al-Mutanabbī_ [The collected poems of al-Mutanabbi]. [Edition details to be confirmed.] (Original work written 10th century CE)',
  'Arabization Coordination Bureau, & GIZ. (n.d.). _Arabterm_ [Online technical dictionary]. https://www.arabterm.org',
  'Baalbaki, M. (n.d.). _Al-Mawrid: A modern English–Arabic dictionary_. Dar El-Ilm Lilmalayin. [Edition details to be confirmed.]',
  'Baker, M. (2018). _In other words: A coursebook on translation_ (3rd ed.). Routledge.',
  'Baker, M., & Hanna, S. (2009). Arabic tradition. In M. Baker & G. Saldanha (Eds.), _Routledge encyclopedia of translation studies_ (2nd ed.). Routledge.',
  'Cabré, M. T. (1999). _Terminology: Theory, methods and applications_ (J. C. Sager, Ed.; J. A. DeCesaris, Trans.). John Benjamins.',
  'Dickins, J., Hervey, S., & Higgins, I. (2016). _Thinking Arabic translation: A course in translation method: Arabic to English_ (2nd ed.). Routledge.',
  'Eco, U. (2003). _Dire quasi la stessa cosa: Esperienze di traduzione_ [Saying almost the same thing: Experiences of translation]. Bompiani.',
  'Fairclough, N. (1989). _Language and power_. Longman.',
  'Fairclough, N. (1992). _Discourse and social change_. Polity Press.',
  'Farghal, M., & Shunnaq, A. (1999). _Translation with reference to English and Arabic: A practical guide_. Dar Al-Hilal.',
  'Firth, J. R. (1957). A synopsis of linguistic theory, 1930–1955. In _Studies in linguistic analysis_ (pp. 1–32). Blackwell.',
  'Ghazala, H. (2008). _Translation as problems and solutions: A textbook for university students and trainee translators_ (Special ed.). Dar El-Ilm Lilmalayin.',
  'Jakobson, R. (1959). On linguistic aspects of translation. In R. A. Brower (Ed.), _On translation_ (pp. 232–239). Harvard University Press.',
  'Jerome. (2012). Letter to Pammachius (K. Davis, Trans.). In L. Venuti (Ed.), _The translation studies reader_ (3rd ed.). Routledge. (Original work written 395 CE)',
  'Kenny, D. (Ed.). (2022). _Machine translation for everyone: Empowering users in the age of artificial intelligence_. Language Science Press.',
  'Mossop, B. (2014). _Revising and editing for translators_ (3rd ed.). Routledge.',
  'Newmark, P. (1988). _A textbook of translation_. Prentice Hall.',
  'Nida, E. A., & Taber, C. R. (1969). _The theory and practice of translation_. E. J. Brill.',
  'Nord, C. (1997). _Translating as a purposeful activity: Functionalist approaches explained_. St. Jerome.',
  'Nord, C. (2005). _Text analysis in translation: Theory, methodology, and didactic application of a model for translation-oriented text analysis_ (2nd ed.). Rodopi.',
  '_Oxford collocations dictionary for students of English_ (2nd ed.). (2009). Oxford University Press.',
  'Piozzi, H. L. (1786). _Anecdotes of the late Samuel Johnson, LL.D._ T. Cadell.',
  'Pym, A. (2015). Translating as risk management. _Journal of Pragmatics, 85_, 67–80.',
  'Reiss, K. (2000). _Translation criticism: The potentials and limitations_ (E. F. Rhodes, Trans.). St. Jerome. (Original work published 1971)',
  'Schleiermacher, F. (2012). On the different methods of translating (S. Bernofsky, Trans.). In L. Venuti (Ed.), _The translation studies reader_ (3rd ed.). Routledge. (Original work published 1813)',
  'Shakespeare, W. (1609). Sonnet 18. In _Shakespeare’s sonnets_. Thomas Thorpe.',
  'Translation Team. (n.d.). _Translation handbook: Course materials and notes_ [Unpublished manuscript]. Guild, Translation Team, Professional Club.',
  'United Nations. (1948). _Universal Declaration of Human Rights_. https://www.un.org/en/about-us/universal-declaration-of-human-rights',
  'United Nations. (n.d.). _UNTERM: The United Nations terminology database_. https://unterm.un.org',
  'Venuti, L. (1995). _The translator’s invisibility: A history of translation_. Routledge.',
  'Vinay, J.-P., & Darbelnet, J. (1995). _Comparative stylistics of French and English: A methodology for translation_ (J. C. Sager & M.-J. Hamel, Trans.). John Benjamins. (Original work published 1958)',
  'Wehr, H. (1994). _A dictionary of modern written Arabic_ (J. M. Cowan, Ed.; 4th ed.). Spoken Language Services.',
];
block(['part', 'References', 'All sources cited in this handbook, in APA style.']);
R.forEach(r => P(runs(r), { indent: { left: 567, hanging: 567 }, spacing: { after: 100, line: 280 } }));
block(['h', 'To be added by the Translation Team']);
block(['ul', ['[Full reference for the 180 textbook.]', '[Full reference for the 182 course book.]', '[Author and publication details for {{الترجمة: ماهيتها}}.]']]);

// ---------- document ----------
const mm = x => Math.round(x * 56.7);
const doc = new Document({
  creator: 'Guild Translation Team',
  title: 'Translation Handbook',
  features: { updateFields: true },
  styles: {
    default: { document: { run: { font: LATIN, size: 21, color: INK } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { font: LATIN, size: 40, bold: true, color: ACCENT }, paragraph: { spacing: { before: 600, after: 200 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { font: LATIN, size: 30, bold: true, color: ACCENT }, paragraph: { spacing: { before: 240, after: 200 }, outlineLevel: 1, keepNext: true } },
      { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { font: LATIN, size: 23, bold: true, color: INK }, paragraph: { spacing: { before: 260, after: 100 }, outlineLevel: 2, keepNext: true } },
    ],
  },
  numbering: {
    config: [
      { reference: 'num', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 454, hanging: 340 } } } }] },
      { reference: 'bul', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 454, hanging: 340 } } } }] },
    ],
  },
  sections: [{
    properties: { page: { size: { width: mm(176), height: mm(250) }, margin: { top: mm(20), bottom: mm(20), left: mm(20), right: mm(20), footer: mm(9) } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: [PageNumber.CURRENT], font: LATIN, size: 17, color: GREY })] })] }) },
    children: body,
  }],
});
Packer.toBuffer(doc).then(buf => { fs.writeFileSync('Translation-Handbook.docx', buf); console.log('written', body.length, 'paragraphs'); });
