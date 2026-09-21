/* Slide content. Kept as data so the engine, the overview grid and the
   3D world can all read from one source. */

export const SLIDES = [
  {
    id: 'title',
    layout: 'title',
    accent: 'gold',
    motif: 'title',
    section: 'Start',
    world: '1-1',
    ovTitle: 'Title screen',
    name: ['Shahad Nawaf', 'Alkhaldi'],
    sub: 'Microbiology · English · Third Year',
    sup: 'ACADEMIC PORTFOLIO'
  },

  {
    id: 'about',
    layout: 'facts',
    accent: 'blue',
    motif: 'block',
    section: 'Introduction',
    world: '1-1',
    eyebrow: 'PLAYER 1',
    title: 'About <em>me</em>',
    lede: 'A short profile before the rest of the world loads.',
    items: [
      { k: 'NAME',  v: 'Shahad Nawaf Alkhaldi', c: 'red', wide: true },
      { k: 'MAJOR', v: 'Microbiology',          c: 'green' },
      { k: 'MINOR', v: 'English',               c: 'blue' },
      { k: 'YEAR',  v: 'Third Year',            c: 'gold' }
    ]
  },

  {
    id: 'major',
    layout: 'points',
    accent: 'green',
    motif: 'mushroom',
    section: 'Microbiology',
    world: '1-2',
    eyebrow: 'MY MAJOR',
    title: '<em>Microbiology</em>',
    chip: 'mush',
    items: [
      { b: 'Microorganisms',                 s: 'Life at a scale the eye cannot reach.' },
      { b: 'Bacteria, fungi, viruses, algae', s: 'Four very different neighbours.' },
      { b: 'Medicine, food & environment',   s: 'Where the work actually lands.' },
      { b: 'Part of everyday life' }
    ]
  },

  {
    id: 'interests',
    layout: 'points',
    accent: 'blue',
    motif: 'blocks',
    section: 'Interests',
    world: '1-3',
    eyebrow: 'HIT THE BLOCKS',
    title: 'My academic <em>interests</em>',
    chip: 'block',
    items: [
      { b: 'Life sciences' },
      { b: 'Science' },
      { b: 'Languages & literature' },
      { b: 'Connecting different fields' }
    ]
  },

  {
    id: 'journey',
    layout: 'points',
    accent: 'green',
    motif: 'pipe',
    section: 'Journey',
    world: '1-4',
    eyebrow: 'WARP ZONE',
    title: 'My academic <em>journey</em>',
    lede: 'One pipe took me somewhere I did not expect.',
    chip: 'pipe',
    items: [
      { b: 'Started with a Molecular Biology minor' },
      { b: 'Changed to English' },
      { b: 'English & communication skills' }
    ]
  },

  {
    id: 'beyond',
    layout: 'points',
    accent: 'blue',
    motif: 'clouds',
    section: 'Clubs',
    world: '1-5',
    eyebrow: 'BONUS LEVEL',
    title: 'Beyond the <em>classroom</em>',
    chip: 'block',
    items: [
      { b: 'Biological Sciences Club' },
      { b: 'Educational Psychology Club' },
      { b: 'Science & education' },
      { b: 'Learning beyond class' }
    ]
  },

  {
    id: 'volunteering',
    layout: 'points',
    accent: 'gold',
    motif: 'coins',
    section: 'Volunteering',
    world: '1-6',
    eyebrow: 'COLLECT COINS',
    title: '<em>Volunteering</em>',
    chip: 'coin',
    items: [
      { b: 'Book Fair' },
      { b: 'Orphan Care Center' },
      { b: "Cancer Patients' Visits" },
      { b: 'Happiness & gratitude' },
      { b: 'Volunteering with friends' }
    ]
  },

  {
    id: 'books',
    layout: 'points',
    accent: 'red',
    motif: 'books',
    section: 'Literature',
    world: '1-7',
    eyebrow: 'READING LIST',
    title: 'Books & <em>literature</em>',
    chip: 'book',
    items: [
      { b: 'Arabic reading & writing' },
      { b: 'I love libraries' },
      { b: 'Tuesdays with Morrie', s: 'Mitch Albom' },
      { b: 'White Nights',         s: 'Fyodor Dostoevsky' },
      { b: 'Different perspectives' }
    ]
  },

  {
    id: 'things',
    layout: 'grid2',
    accent: 'blue',
    motif: 'sky',
    section: 'Off the clock',
    world: '1-8',
    eyebrow: 'PLAYER STATS',
    title: 'A few things <em>about me</em>',
    items: [
      { b: 'Morning person',      chip: 'coin' },
      { b: 'Love morning classes', chip: 'block' },
      { b: 'Love winter',         chip: 'star' },
      { b: 'Reading in summer',   chip: 'book' },
      { b: 'Observant & reflective', chip: 'coin' },
      { b: 'Walking & nature',    chip: 'leaf' },
      { b: 'Travelling',          chip: 'pipe' },
      { b: 'The countryside',     chip: 'leaf' }
    ]
  },

  {
    id: 'everyday',
    layout: 'cols',
    accent: 'green',
    motif: 'microbe',
    section: 'Microbiology',
    world: '1-9',
    wide: true,
    eyebrow: 'THREE WORLDS, ONE ORGANISM',
    title: 'Microbiology in <em>everyday life</em>',
    items: [
      {
        icon: '🧀', head: 'Industrial', c: 'gold',
        rows: [
          '<strong>Swiss cheese</strong>',
          '<em>Propionibacterium freudenreichii</em>',
          'CO<sub>2</sub> &rarr; the holes'
        ]
      },
      {
        icon: '🦠', head: 'Medical', c: 'red',
        rows: [
          '<em>Clostridium tetani</em>',
          '<strong>Tetanus</strong>',
          'Muscle spasms'
        ]
      },
      {
        icon: '🧴', head: 'Everyday', c: 'blue',
        rows: [
          '<strong>Hand sanitiser</strong>',
          'Microbes are everywhere',
          'Door handles &amp; elevators'
        ]
      }
    ]
  },

  {
    id: 'sharing',
    layout: 'points',
    accent: 'gold',
    motif: 'question',
    section: 'Sharing',
    world: '1-10',
    eyebrow: 'HIT THE BLOCK, SHARE THE COIN',
    title: 'Sharing <em>knowledge</em>',
    chip: 'coin',
    items: [
      { b: 'I love learning — and sharing it' },
      { b: 'Explaining ideas simply' },
      { b: 'Teaching helps me understand' },
      { b: "Todd's YouTube programme", s: 'Interesting and informative content.' }
    ]
  },

  {
    id: 'goal',
    layout: 'points',
    accent: 'red',
    motif: 'flag',
    section: 'Goal',
    world: '1-11',
    eyebrow: 'REACH THE FLAG',
    title: 'My <em>goal</em>',
    chip: 'star',
    items: [
      { b: 'Explore the life sciences' },
      { b: 'Explore different fields' },
      { b: 'Connect science, literature & languages' },
      { b: 'Travel' },
      { b: 'Stay a lifelong learner' },
      { b: 'Curiosity drives me' }
    ]
  },

  {
    id: 'closing',
    layout: 'closing',
    accent: 'gold',
    motif: 'castle',
    section: 'Closing',
    world: '1-12',
    eyebrow: 'THANK YOU FOR PLAYING',
    title: 'Keep <em>learning</em>',
    chip: 'star',
    items: [
      { b: 'Microbiology is my field — learning is bigger' },
      { b: 'Science, literature & languages' },
      { b: 'Keep learning' }
    ],
    quote: 'There is always something new to discover.'
  }
];

export const ACCENTS = {
  red:   '#D8382C',
  blue:  '#1E6FD9',
  green: '#2E9E52',
  gold:  '#EFA81C'
};

/* Darker twins of the accents, for accent-coloured *text*. The bright gold
   is lovely on a 3D coin and unreadable as a headline on paper. */
export const ACCENT_INK = {
  red:   '#C22C21',
  blue:  '#1A5CBD',
  green: '#22824A',
  gold:  '#AE7405'
};
