/* ------------------------------------------------------------------
   Nazar Utaro – tradition data
   Every tradition = a costume + a backdrop + a scripted ritual.
   Hands are positioned in stage coordinates (480 x 640).
   ------------------------------------------------------------------ */
window.NU = window.NU || {};
(function (NU) {
  'use strict';

  // ---- reusable hand motions -------------------------------------------------
  const HEAD = [165, 335];                      // the person's head
  const REST_N = { m: 'pt', x: 254, y: 342 };
  const REST_F = { m: 'pt', x: 346, y: 342 };
  const TRAY_F = { m: 'pt', x: 340, y: 358 };
  const WAVE = { m: 'pt', x: 236, y: 186, ox: 14, oy: 5, f: 1.1 };
  const NAMASTE_N = { m: 'pt', x: 291, y: 272 };
  const NAMASTE_F = { m: 'pt', x: 309, y: 272 };
  const TEMPLE_N = { m: 'pt', x: 270, y: 146, ox: 3, f: 3.2 };
  const TEMPLE_F = { m: 'pt', x: 330, y: 146, ox: -3, f: 3.2 };
  const BLESS_N = { m: 'pt', x: 160, y: 286, ox: 7, oy: 4, f: 1.4 };
  const BLESS_F = { m: 'pt', x: 192, y: 282, ox: -7, oy: 4, f: 1.4 };
  const CHEEK = { m: 'pt', x: 190, y: 346 };
  const FIRE_HAND = { m: 'pt', x: 236, y: 406 };
  const circle = (turns, dir, rx, ry) => ({ m: 'circle', turns, dir, rx: rx || 48, ry: ry || 34 });
  const sweep = (n) => ({ m: 'sweep', n, x: 165, y0: 286, y1: 474, amp: 10 });

  // ---- shared flow for the "salt-chilli-fire" family -------------------------
  function desi(o) {
    const steps = [
      { d: 4.6, t: o.greet, near: WAVE, far: REST_F, cloud: 1, mood: 0.1, fire: 0.3 },
      { d: 5.0, t: o.prep, near: { m: 'pt', x: 318, y: 350 }, far: TRAY_F, hf: 'thali', hn: 'handful', mood: 0.15 },
      { d: 8.2, t: o.circle, near: circle(7, 1), far: TRAY_F, hf: 'thali', hn: 'handful', cloud: 0.62, lap: 7 },
      { d: 5.2, t: o.second, near: circle(3, -1), far: TRAY_F, hf: 'thali', hn: o.secondProp || 'handful', cloud: 0.4, lap: 3 },
      { d: 5.6, t: o.fire, near: FIRE_HAND, far: TRAY_F, hf: 'thali', hn: 'handful', crouch: 1, fire: 1,
        ev: [{ at: 0.5, do: 'burst' }, { at: 0.62, do: 'crackle' }] },
      { d: 5.8, t: o.sniff, near: { m: 'pt', x: 276, y: 176, ox: 9, oy: 3, f: 2.6 }, far: REST_F, crouch: 0, fire: 0.5, cloud: 0, mood: 0.5,
        ev: [{ at: 0.35, do: 'poof' }, { at: 0.4, do: 'pop', text: o.noSmell || 'No cough!' }] },
      { d: 4.4, t: o.crack, near: TEMPLE_N, far: TEMPLE_F, mood: 0.68,
        ev: [{ at: 0.3, do: 'crack', text: o.crackText }, { at: 0.52, do: 'crack', text: '' }, { at: 0.74, do: 'crack', text: '' }] },
      { d: 4.4, t: o.teeka, near: CHEEK, far: REST_F, mood: 0.86, ev: [{ at: 0.55, do: 'teeka' }] }
    ];
    if (o.extra) steps.push(...o.extra);
    steps.push({ d: 6.6, t: o.finale, near: BLESS_N, far: BLESS_F, mood: 1, fire: 0.18, ev: [{ at: 0.08, do: 'petals' }, { at: 0.1, do: 'chime' }] });
    return steps;
  }
  const T = (n, e) => ({ n, e });

  // ---------------------------------------------------------------------------
  NU.traditions = [
    // ============================= MAHARASHTRA ================================
    {
      id: 'maharashtra', name: 'Maharashtra', sub: 'Nauvari sari · salt, chillies, chappal & fire', group: 'India',
      lang: 'mr-IN', theme: { a: '#ff9f1c', b: '#8f1b3f' },
      blurb: 'Salt, mustard, dry red chillies and a Kolhapuri chappal go round your head, then straight into the fire. If the chillies don\'t sting, the nazar was strong!',
      chips: ['Salt', 'Dry chillies', 'Mustard', 'Chappal', 'Fire'],
      fact: 'In many Marathi homes the chillies are burnt on hot coals. Folk wisdom says the stronger the nazar, the less the chillies sting. So no cough means mission accomplished.',
      music: { root: 196, scale: [0, 2, 4, 7, 9] },
      woman: {
        skin: '#d8956a',
        lower: { type: 'kashta', color: '#168a5c', border: '#8f1b3f', zari: '#f2c230', bh: 20 },
        top: { color: '#8f1b3f', neck: 'round', trim: '#f2c230' },
        sleeve: { c: '#8f1b3f', long: false },
        drape: { type: 'pallu', c: '#168a5c', border: '#8f1b3f', zari: '#f2c230' },
        head: { style: 'bun', hair: '#17110f', flowers: ['#fffbe8', '#ff9a1f'] },
        acc: { bindi: 'moon', nath: 'nath', ear: 'jhumka', neck: 'mangal', bangles: ['#2fa35f', '#f2c230', '#2fa35f', '#f2c230'] }
      },
      scene: { type: 'arch', wall: ['#ffe2b0', '#f8a85f'], floor: '#8c5a3c', accent: '#ff9f1c', accent2: '#168a5c', frame: '#8f1b3f', deco: 'toran', rangoli: true },
      station: 'fire',
      steps: desi({
        greet: T('या या! बस इथे… दृष्ट काढते तुझी.', 'Ya ya, baso! Let me take that nazar off you, {name}.'),
        prep: T('मीठ, मोहरी आणि लाल सुक्या मिरच्या…', 'Salt, mustard seeds and dry red chillies: the Marathi nazar kit.'),
        circle: T('सात वेळा ओवाळते… दृष्ट लागू नये कुणाची!', 'Seven rounds around your head. Nazar, go away!'),
        second: T('आता कोल्हापुरी चप्पलही फिरवते!', 'Now the Kolhapuri chappal joins in. Don\'t worry, it only goes round!'),
        secondProp: 'chappal',
        fire: T('जळू दे दृष्ट, जळून जाऊ दे!', 'Into the fire it all goes. Phatt phatt phatt!'),
        sniff: T('अरे वा! ठसका नाही, खोकला नाही… खूप मोठी नजर होती!', 'No cough, no sting at all?! That was one STRONG nazar. Now it\'s burnt.'),
        crack: T('अलाबला घेते गं… कडकड!', 'Alabala ghete! All your troubles on me. Kadak kadak!'), crackText: 'कडकड!',
        teeka: T('आणि हा काजळाचा तीट कानामागे.', 'And a little black teet behind the ear, for extra protection.'),
        finale: T('चल, आता हास! सगळं छान होईल.', 'There! Nazar gone. Now smile, {name}. You are so loved.')
      })
    },
    // ================================ GUJARAT =================================
    {
      id: 'gujarat', name: 'Gujarat', sub: 'Chaniya choli · mithu, rai & marcha', group: 'India',
      lang: 'gu-IN', theme: { a: '#d6336c', b: '#1aa5b8' },
      blurb: 'A twirly chaniya choli, a handful of mithu-rai-marcha waved seven times, a hearty "ovaranaa" and a kaalu tilu.',
      chips: ['Salt', 'Mustard', 'Chillies', 'Fire', 'Kaalu tilu'],
      fact: 'Ovaranaa lewu means taking someone\'s troubles upon yourself, a blessing every Gujarati grandma knows by heart.',
      music: { root: 220, scale: [0, 2, 4, 7, 9] },
      woman: {
        skin: '#d29062',
        lower: { type: 'flare', color: '#d6336c', hw: 92, hemY: 584,
          bands: [{ o: 0, h: 16, c: '#1aa5b8' }, { o: 22, h: 5, c: '#ffd166' }, { o: 74, h: 8, c: '#1aa5b8' }],
          dots: { rows: 3, gap: 24, step: 22, c: '#fff1c4' } },
        top: { color: '#1aa5b8', neck: 'round', trim: '#ffd166', midriff: true },
        sleeve: { c: '#1aa5b8', long: false },
        head: { style: 'odhani', under: 'bun', hair: '#17110f', cover: { c: '#ff6f3c', trim: '#ffd166' } },
        acc: { bindi: 'dot', nath: 'stud', ear: 'jhumka', neck: 'collar', bangles: ['#ffffff', '#e63946', '#ffffff', '#e63946', '#ffffff'] }
      },
      scene: { type: 'arch', wall: ['#ffd9e4', '#ff9bb8'], floor: '#9a5a4a', accent: '#ffb703', accent2: '#1aa5b8', frame: '#d6336c', deco: 'toran', rangoli: true, dots: true },
      station: 'fire',
      steps: desi({
        greet: T('કેમ છો? બેસો, નજર ઉતારી દઉં…', 'Kem cho, {name}? Sit down, I\'ll take your nazar off.'),
        prep: T('મીઠું, રાઈ અને સૂકાં મરચાં…', 'Mithu, rai and sukka marcha: salt, mustard and dry chillies.'),
        circle: T('સાત વાર ફેરવું… નજર ના લાગે!', 'Seven rounds around your head. Nazar na laage!'),
        second: T('હવે ઊલટી દિશામાં ત્રણ વાર…', 'Three more the other way, just to be doubly sure.'),
        fire: T('લ્યો, આગમાં સ્વાહા!', 'Into the fire it goes. Svaaha!'),
        sniff: T('ખાંસી પણ ન આવી! નજર ભારે હતી, પણ હવે ગઈ.', 'Not even a cough! That was a heavy nazar, and now it\'s gone.'),
        crack: T('ઓવારણાં લઉં છું!', 'Ovaranaa! All your troubles on me. Kadak kadak!'), crackText: 'કડક!',
        teeka: T('લે, કાળું ટીલું!', 'A little black tilu to keep the nazar away.'),
        finale: T('હવે હસી દે! બધું સારું થઈ જશે.', 'Now give us that smile, {name}. Everything will be fine.')
      })
    },
    // ================================= PUNJAB =================================
    {
      id: 'punjab', name: 'Punjab', sub: 'Salwar kameez, phulkari · waar ke mirchaan', group: 'India',
      lang: 'pa-IN', theme: { a: '#f7c600', b: '#c2185b' },
      blurb: 'A cheerful Punjabi mom in yellow and a phulkari dupatta waves mirchaan over your head and drops them in the fire. Sadke jaavan!',
      chips: ['Loon', 'Rai', 'Mirchaan', 'Fire', 'Kaala teeka'],
      fact: '"Waarna" means to circle something around a person and then offer it away. It\'s how Punjabi mothers send nazar packing.',
      music: { root: 196, scale: [0, 2, 4, 7, 9] },
      woman: {
        skin: '#dba074',
        lower: { type: 'salwar', color: '#0f8a7e', cuff: '#f4c20d' },
        top: { color: '#f7c600', neck: 'round', trim: '#d81b60', tunic: 468 },
        sleeve: { c: '#f7c600', long: false },
        drape: { type: 'dupatta', c: '#c2185b', border: '#f4c20d', pattern: 'phulkari' },
        head: { style: 'braid', hair: '#17110f', paranda: ['#d81b60', '#f4c20d', '#0f8a7e'] },
        acc: { bindi: 'dot', nath: 'stud', ear: 'jhumka', bangles: ['#e63946', '#f4c20d', '#e63946', '#f4c20d', '#e63946'] },
        shoes: '#b7791f'
      },
      scene: { type: 'fields', sky: ['#9bd8ff', '#fff3c4'], floor: '#b98a5a', accent: '#f7c600' },
      station: 'fire',
      steps: desi({
        greet: T('ਆ ਪੁੱਤ, ਬਹਿ ਜਾ। ਨਜ਼ਰ ਲਾਹ ਦਿੰਦੀ ਆਂ।', 'Aa puttar, beh ja. I\'ll take that nazar off you, {name}.'),
        prep: T('ਲੂਣ, ਰਾਈ ਤੇ ਸੁੱਕੀਆਂ ਮਿਰਚਾਂ…', 'Loon, rai and sukkiyaan mirchaan: salt, mustard and dry chillies.'),
        circle: T('ਵਾਰ ਕੇ ਸੱਤ ਵਾਰੀ… ਨਜ਼ਰ ਨਾ ਲੱਗੇ!', 'Waar ke seven times… nazar na lagge!'),
        second: T('ਤੇ ਹੁਣ ਉਲਟੇ ਪਾਸੇ ਤਿੰਨ ਵਾਰ।', 'Three more the opposite way, puttar.'),
        fire: T('ਮਿਰਚਾਂ ਵਾਰ ਕੇ ਅੱਗ ਵਿੱਚ!', 'Chillies waved over you, straight into the fire!'),
        sniff: T('ਹਾਏ! ਖੰਘ ਵੀ ਨਹੀਂ ਆਈ… ਬੜੀ ਭਾਰੀ ਨਜ਼ਰ ਸੀ!', 'Not a single cough! That was one heavy nazar, puttar.'),
        crack: T('ਬਲਾਈਆਂ ਲੈ ਲਵਾਂ!', 'Balaiyaan lai lavaan! All your troubles on me. Kadak kadak!'), crackText: 'ਕੜਾਕ!',
        teeka: T('ਲੈ, ਕਾਲਾ ਟਿੱਕਾ ਲਾ ਦਿੱਤਾ!', 'A kaala teeka, so no nazar dares come close.'),
        finale: T('ਹੁਣ ਹੱਸ ਪੁੱਤ, ਸਦਕੇ ਜਾਵਾਂ!', 'Now hass de, puttar. Sadke jaavan!')
      })
    },
    // ================================= BENGAL =================================
    {
      id: 'bengal', name: 'Bengal', sub: 'Laal-paar sari · nun-lonka, shankh & ulu', group: 'India',
      lang: 'bn-IN', theme: { a: '#c62828', b: '#e0a526' },
      blurb: 'Salt and chillies burn on the coals, the nazar goes with them, and she finishes by blowing a conch with an ulu-ulu!',
      chips: ['Nun', 'Lonka', 'Sorshe', 'Shankh', 'Kalo tip'],
      fact: '"Balai shaat!" is what a Bengali elder says to ward off harm. The conch (shankh) and the ulu-ulu are blown at auspicious moments.',
      music: { root: 207.65, scale: [0, 2, 4, 7, 9] },
      woman: {
        skin: '#d7966a',
        lower: { type: 'sari', color: '#fbf6ea', border: '#c62828', zari: '#e0a526', bh: 26 },
        top: { color: '#c62828', neck: 'round', trim: '#e0a526' },
        sleeve: { c: '#c62828', long: false },
        drape: { type: 'pallu', c: '#fbf6ea', border: '#c62828', zari: '#e0a526' },
        head: { style: 'bun', hair: '#17110f', flowers: ['#ffffff', '#ffffff'] },
        acc: { bindi: 'dot-big', sindoor: true, nath: 'stud', ear: 'stud', neck: 'beads', bangles: ['#ffffff', '#c62828', '#ffffff', '#e0a526', '#ffffff'] }
      },
      scene: { type: 'arch', wall: ['#fff3da', '#f1c58a'], floor: '#9b3b2e', accent: '#c62828', accent2: '#2e8b57', frame: '#c62828', deco: 'fronds', alpona: true },
      station: 'fire',
      steps: desi({
        greet: T('এসো, বসো তো। নজর কাটিয়ে দিই।', 'Esho, boso to, {name}. Let me cut that nazar off.'),
        prep: T('নুন, লঙ্কা আর সর্ষে…', 'Nun, lonka and sorshe: salt, chillies and mustard seeds.'),
        circle: T('সাতবার ঘুরিয়ে… কারও নজর না লাগুক!', 'Seven rounds around your head. Kono nazar na laaguk!'),
        second: T('এবার উল্টোদিকে তিনবার।', 'Three rounds the other way, to be extra sure.'),
        fire: T('নুন-লঙ্কা পুড়ে যাক, নজরও পুড়ে যাক!', 'Let the salt and chillies burn, and the nazar with them!'),
        sniff: T('ঝাঁঝ নেই, কাশিও নেই! বুঝলে, বেশ কড়া নজর ছিল।', 'No sting, no cough! Bujhle? That was a strong nazar.'),
        crack: T('বালাই ষাট! সব বালাই আমার।', 'Balai shaat! I\'m taking all your troubles on me.'), crackText: 'কড়াক!',
        teeka: T('এই নাও, কালো টিপ!', 'Here, a kalo tip to guard you.'),
        extra: [{ d: 4.6, t: T('উলু উলু উলু!', 'Ulu-ulu! A conch blown for good luck.'), near: { m: 'pt', x: 289, y: 182 }, far: REST_F, hn: 'conch', mood: 0.92, fire: 0.2,
          ev: [{ at: 0.18, do: 'conch' }] }],
        finale: T('এবার একটু হাসো তো! সব ঠিক হয়ে যাবে।', 'Now smile, {name}. Sob thik hoye jabe.')
      })
    },
    // ============================== SOUTH INDIA ===============================
    {
      id: 'tamil', name: 'South India', sub: 'Kanjeevaram sari · aarti, thishti & coconut', group: 'India',
      lang: 'ta-IN', theme: { a: '#0e7c6b', b: '#c2185b' },
      blurb: 'Red aarti water, lime and camphor go round three times each way, then a coconut takes the last of it with a satisfying SMASH.',
      chips: ['Red aarti water', 'Camphor', 'Coconut', 'Thishti pottu'],
      fact: 'Called "thishti suthi" or "drishti", this is done after weddings, festivals, or when a child has been admired a bit too much. The coconut is smashed outside the door.',
      music: { root: 220, scale: [0, 1, 4, 5, 7, 8, 11] },
      woman: {
        skin: '#c98558',
        lower: { type: 'sari', color: '#0e7c6b', border: '#c2185b', zari: '#f2c230', bh: 26, hw: 68 },
        top: { color: '#c2185b', neck: 'v', trim: '#f2c230' },
        sleeve: { c: '#c2185b', long: false },
        drape: { type: 'pallu', c: '#0e7c6b', border: '#c2185b', zari: '#f2c230' },
        head: { style: 'braid', hair: '#120d0b', flowers: ['#ffffff', '#ffffff'] },
        acc: { bindi: 'dot-big', nath: 'stud', ear: 'stud', neck: 'temple', bangles: ['#f2c230', '#2fa35f', '#f2c230', '#f2c230', '#2fa35f', '#f2c230'] }
      },
      scene: { type: 'gopuram', sky: ['#1d6f7a', '#f6a05a'], floor: '#6d4631', accent: '#f2c230' },
      station: 'plain',
      steps: [
        { d: 4.6, t: T('வாங்க, உட்காருங்க. திருஷ்டி சுத்திப் போடறேன்.', 'Vaanga, utkaarunga, {name}. Let me do your thishti.'), near: WAVE, far: REST_F, cloud: 1, mood: 0.1 },
        { d: 5.0, t: T('ஆரத்தி தட்டு தயார்: மஞ்சள், சுண்ணாம்பு, கற்பூரம்.', 'A plate of red aarti water with turmeric, lime and a flame of camphor.'), near: { m: 'pt', x: 280, y: 322 }, far: REST_F, hn: 'aarti', mood: 0.15 },
        { d: 6.2, t: T('மூணு தடவை சுத்தி… திருஷ்டி போகட்டும்!', 'Three rounds clockwise… thishti, go away!'), near: circle(3, 1, 42, 30), hn: 'aarti', cloud: 0.72, lap: 3 },
        { d: 6.2, t: T('இப்போ எதிர்த் திசையில்…', 'Three rounds the other way. Now the nazar is confused.'), near: circle(3, -1, 42, 30), hn: 'aarti', cloud: 0.5, lap: 3 },
        { d: 5.4, t: T('இப்போ தேங்காய் சுத்தறேன்…', 'Now the coconut. It takes the last of the nazar.'), near: circle(3, 1), hn: 'coconut', cloud: 0.3, lap: 3 },
        { d: 5.2, t: T('தேங்காய் உடைக்கிறேன்… டமால்!', 'SMASH! A clean break means a clean slate.'), near: { m: 'path', pts: [[236, 250], [236, 250], [236, 412]], ease: 'in' }, hn: 'coconut', crouch: 0.95,
          ev: [{ at: 0.66, do: 'smash' }] },
        { d: 5.0, t: T('கண் திருஷ்டி போச்சு!', 'Kan thishti pochu! The evil eye is gone.'), near: { m: 'pt', x: 276, y: 176, ox: 8, oy: 3, f: 2.4 }, far: REST_F, crouch: 0, cloud: 0, mood: 0.55,
          ev: [{ at: 0.2, do: 'poof' }] },
        { d: 4.4, t: T('இந்தா, திருஷ்டிப் பொட்டு.', 'And the little thishti pottu to keep it that way.'), near: CHEEK, far: REST_F, mood: 0.85, ev: [{ at: 0.55, do: 'teeka' }] },
        { d: 6.6, t: T('இப்போ சிரிங்க! எல்லாம் நல்லா இருக்கும்.', 'Now sirichunga, {name}! Everything will be good.'), near: BLESS_N, far: BLESS_F, mood: 1, ev: [{ at: 0.08, do: 'petals' }, { at: 0.1, do: 'chime' }] }
      ]
    },
    // =============================== RAJASTHAN ================================
    {
      id: 'rajasthan', name: 'Rajasthan', sub: 'Ghagra & odhani · rai-namak-mirch', group: 'India',
      lang: 'hi-IN', theme: { a: '#e8453c', b: '#f4a300' },
      blurb: 'Padharo! A royal ghagra, rai-namak-mirch waved seven times around your head, thrown on glowing coals. Hindi-belt classic.',
      chips: ['Rai', 'Namak', 'Mirch', 'Angaare', 'Kaala teeka'],
      fact: 'Across north India, nazar is also kept away with a lemon-and-green-chilli string at the door, or a black teeka on babies. The salt-mustard-chilli fire is the grown-up version.',
      music: { root: 220, scale: [0, 1, 4, 5, 7, 8, 11] },
      woman: {
        skin: '#d6965f',
        lower: { type: 'flare', color: '#e8453c', hw: 94, hemY: 584,
          bands: [{ o: 0, h: 18, c: '#f4a300' }, { o: 26, h: 6, c: '#f8e7c0' }, { o: 62, h: 12, c: '#7b1e3a' }],
          dots: { rows: 2, gap: 26, step: 20, c: '#ffd966' } },
        top: { color: '#7b1e3a', neck: 'v', trim: '#f4a300', midriff: true },
        sleeve: { c: '#7b1e3a', long: false },
        head: { style: 'odhani', under: 'bun', hair: '#17110f', cover: { c: '#f4a300', trim: '#e8453c' }, borla: true },
        acc: { bindi: 'dot', nath: 'ring', ear: 'jhumka', neck: 'temple', bangles: ['#f4a300', '#e8453c', '#f4a300', '#e8453c', '#f4a300'] }
      },
      scene: { type: 'arch', wall: ['#ffc59a', '#f08a6a'], floor: '#a1694a', accent: '#f4a300', accent2: '#7b1e3a', frame: '#7b1e3a', deco: 'jharokha', rangoli: true },
      station: 'fire',
      steps: desi({
        greet: T('पधारो सा! बैठ जा, नज़र उतार दूँ।', 'Padharo, {name}! Sit down, I\'ll take your nazar off.'),
        prep: T('राई, नमक और सूखी लाल मिर्च…', 'Rai, namak and dry red chillies: the oldest nazar kit.'),
        circle: T('सात बार वार के… नज़र न लगे!', 'Seven rounds around your head. Nazar na lage!'),
        second: T('उल्टी तरफ़ तीन बार और…', 'Three more the other way, double protection.'),
        fire: T('अंगारों में डाल दिया… स्वाहा!', 'Into the glowing coals. Swaaha!'),
        sniff: T('अरे! खाँसी भी नहीं आई, बड़ी तगड़ी नज़र थी!', 'Not even a cough! What a strong nazar that was.'),
        crack: T('बलैयाँ ले लूँ! कड़क-कड़क!', 'Balaiyaan le loon! All your troubles on me. Kadak kadak!'), crackText: 'कड़क!',
        teeka: T('ये ले, काला टीका!', 'A black teeka behind the ear. Nazar-proof!'),
        finale: T('अब मुस्कुरा दे, सब अच्छा होगा!', 'Now smile, {name}. All will be well.')
      })
    },
    // ================================= TURKEY =================================
    {
      id: 'turkey', name: 'Turkey', sub: 'Nazar boncuğu · üzerlik smoke', group: 'World',
      lang: 'tr-TR', theme: { a: '#1d4fd8', b: '#e53935' },
      blurb: 'The land of the blue evil-eye bead. A Turkish grandma circles üzerlik smoke around you, then pins a nazar boncuğu on you.',
      chips: ['Üzerlik seeds', 'Smoke', 'Nazar boncuğu'],
      fact: 'The blue glass nazar boncuğu is hung on doors, cars and baby clothes across Turkey. When it cracks, they say it took a hit for you.',
      music: { root: 220, scale: [0, 1, 4, 5, 7, 8, 11] },
      woman: {
        skin: '#e6b48c',
        lower: { type: 'baggy', color: '#c2185b', cuff: '#f7c948', pattern: 'dots', patC: '#ffd1e3' },
        top: { color: '#ffffff', neck: 'round', trim: '#f7c948', vest: { c: '#173b7a', trim: '#f2c230' }, sash: '#d32f2f' },
        sleeve: { c: '#ffffff', long: true },
        head: { style: 'scarf', hair: '#2b1a12', cover: { c: '#fdfdfd', trim: '#3a7bd5', dots: '#e53935' } },
        acc: { ear: 'stud', neck: 'blue' },
        shoes: '#6d4c41'
      },
      scene: { type: 'tiles', wall: ['#e8f1ff', '#cfe0ff'], floor: '#8a2f3b', accent: '#1d4fd8', accent2: '#e53935' },
      station: 'none',
      steps: [
        { d: 4.6, t: T('Gel bakalım, otur. Nazarını alalım.', 'Come on, sit down. Let\'s take your nazar away, {name}.'), near: WAVE, far: REST_F, cloud: 1, mood: 0.1 },
        { d: 5.0, t: T('Üzerlik tohumunu közün üstüne atıyorum…', 'Üzerlik (wild rue) seeds on hot coals: they crackle and smoke.'), near: { m: 'pt', x: 242, y: 300, ox: 3, oy: 3, f: 1.2 }, far: REST_F, hn: 'censer', mood: 0.15 },
        { d: 7.4, t: T('Üç kere başının etrafında… Maşallah, nazar değmesin!', 'Three rounds around your head. Mashallah, may no nazar touch you!'), near: circle(3, 1), hn: 'censer', cloud: 0.6, lap: 3 },
        { d: 6.4, t: T('Baştan ayağa… tüt, tüt, tüt!', 'Head to toe, and let the smoke do its work.'), near: sweep(1), hn: 'censer', cloud: 0.3 },
        { d: 6.0, t: T('Al, bu boncuk seni korusun.', 'Here, wear this nazar boncuğu. It watches over you.'), near: { m: 'pt', x: 194, y: 392 }, far: REST_F, hn: 'bead', cloud: 0.08, mood: 0.6,
          ev: [{ at: 0.62, do: 'pin' }, { at: 0.64, do: 'poof' }] },
        { d: 6.6, t: T('İşte bu kadar! Şimdi gülümse bakalım.', 'And that\'s all. Now let\'s see that smile, {name}.'), near: BLESS_N, far: BLESS_F, cloud: 0, mood: 1, ev: [{ at: 0.08, do: 'petals' }, { at: 0.1, do: 'chime' }] }
      ]
    },
    // ================================== ITALY =================================
    {
      id: 'italy', name: 'Italy', sub: 'Il malocchio · olive oil in water', group: 'World',
      lang: 'it-IT', theme: { a: '#c9572b', b: '#2e7d32' },
      blurb: 'Nonna whispers the secret prayer, then drops olive oil in water. If the oil spreads out like an eye, it was the malocchio.',
      chips: ['Olive oil', 'Bowl of water', 'Secret prayer'],
      fact: 'Italian nonne traditionally pass the malocchio prayer on only once a year (often on Christmas Eve) and only to a chosen family member.',
      music: { root: 261.63, scale: [0, 2, 4, 5, 7, 9, 11] },
      woman: {
        skin: '#efc3a0',
        lower: { type: 'flare', color: '#37474f', hw: 64, hemY: 572, apron: { c: '#fff3e0', trim: '#d62828' } },
        top: { color: '#37474f', neck: 'high', trim: '#cfd8dc', cardigan: '#8d6e63', apron: '#fff3e0' },
        sleeve: { c: '#8d6e63', long: true },
        head: { style: 'bun', hair: '#b9bec7' },
        acc: { ear: 'pearl', neck: 'cross', glasses: true },
        shoes: '#222222'
      },
      scene: { type: 'terracotta', wall: ['#f1b97a', '#d98a52'], floor: '#8d7b6a', accent: '#c9572b', accent2: '#2e7d32' },
      station: 'bowl',
      steps: [
        { d: 4.6, t: T('Siediti, tesoro. Ti tolgo il malocchio.', 'Sit down, tesoro. I\'ll take the malocchio off you, {name}.'), near: WAVE, far: REST_F, cloud: 1, mood: 0.1 },
        { d: 5.0, t: T('Un piatto d\'acqua e un po\' d\'olio d\'oliva…', 'A plate of water and a little olive oil: nonna\'s tools.'), near: { m: 'pt', x: 246, y: 372 }, far: REST_F, hn: 'oilbottle', crouch: 0.4, mood: 0.15 },
        { d: 7.2, t: T('Sussurro la preghiera segreta…', 'She whispers the secret family prayer, tracing a cross three times.'), near: { m: 'path', rep: 3, pts: [[165, 270], [165, 400], [165, 340], [118, 340], [212, 340]] }, crouch: 0, cloud: 0.7, ev: [{ at: 0.3, do: 'whisper' }, { at: 0.63, do: 'whisper' }] },
        { d: 6.2, t: T('Tre gocce d\'olio nell\'acqua…', 'Three drops of olive oil in the water. If they spread out, it\'s the malocchio.'), near: { m: 'pt', x: 232, y: 394 }, far: REST_F, hn: 'oilbottle', crouch: 0.9, cloud: 0.55,
          ev: [{ at: 0.25, do: 'drop' }, { at: 0.48, do: 'drop' }, { at: 0.71, do: 'drop' }] },
        { d: 5.8, t: T('Eccolo! L\'olio si è allargato: era malocchio!', 'Look! The oil spread out. That was the malocchio!'), near: { m: 'pt', x: 244, y: 396, ox: 4, f: 1 }, far: REST_F, hn: null, crouch: 0.7, cloud: 0.12, mood: 0.5,
          ev: [{ at: 0.1, do: 'spread' }, { at: 0.7, do: 'poof' }] },
        { d: 6.6, t: T('Via il malocchio! Ora sorridi, che ti voglio bene.', 'Gone! Now smile. Nonna loves you, {name}.'), near: BLESS_N, far: BLESS_F, crouch: 0, cloud: 0, mood: 1, ev: [{ at: 0.08, do: 'petals' }, { at: 0.1, do: 'chime' }] }
      ]
    },
    // ================================== MEXICO ================================
    {
      id: 'mexico', name: 'Mexico', sub: 'Limpia con huevo · rue & basil', group: 'World',
      lang: 'es-MX', theme: { a: '#e91e63', b: '#00838f' },
      blurb: 'A curandera sweeps you from head to toe with a fresh egg and fragrant herbs, then cracks the egg in a glass of water to see what it soaked up.',
      chips: ['Fresh egg', 'Rue & basil', 'Glass of water'],
      fact: 'A "limpia" (cleansing) is used to remove "mal de ojo". After the egg is cracked into water, the shapes it makes are "read" like tea leaves.',
      music: { root: 246.94, scale: [0, 2, 4, 7, 9] },
      woman: {
        skin: '#cf9266',
        lower: { type: 'flare', color: '#00838f', hw: 86, hemY: 584,
          bands: [{ o: 0, h: 12, c: '#e91e63' }, { o: 18, h: 8, c: '#ffc107' }, { o: 34, h: 12, c: '#7cb342' }] },
        top: { color: '#fffaf0', neck: 'square', trim: '#e91e63', embroid: ['#e91e63', '#ffc107', '#4caf50'] },
        sleeve: { c: '#fffaf0', long: false },
        drape: { type: 'rebozo', c: '#6a1b4d', stripes: ['#f4a300', '#00a6a6'] },
        head: { style: 'twoBraids', hair: '#14100e', ribbons: ['#e91e63', '#ffc107'], flower: '#e53935' },
        acc: { ear: 'hoop', neck: 'beads', bangles: ['#ffc107', '#e91e63'] },
        shoes: '#6d4c41'
      },
      scene: { type: 'papel', wall: ['#ffd1b8', '#f6957d'], floor: '#4a6e8a', accent: '#e91e63', accent2: '#00838f' },
      station: 'glass',
      steps: [
        { d: 4.6, t: T('Siéntate, mi vida. Te voy a hacer una limpia.', 'Sit down, mi vida. I\'m going to give you a limpia, {name}.'), near: WAVE, far: REST_F, cloud: 1, mood: 0.1 },
        { d: 5.0, t: T('Un huevo fresco y ramitas de ruda y albahaca…', 'A fresh egg and sprigs of rue and basil.'), near: { m: 'pt', x: 296, y: 326 }, far: { m: 'pt', x: 342, y: 336 }, hn: 'egg', hf: 'herbs', mood: 0.15 },
        { d: 7.4, t: T('Con el huevo te limpio de la cabeza a los pies…', 'The egg gently sweeps you clean from head to toe.'), near: sweep(2), far: REST_F, hn: 'egg', hf: 'herbs', cloud: 0.62 },
        { d: 6.2, t: T('Y con las hierbas barremos la mala energía.', 'And the herbs sweep the heavy energy away.'), near: sweep(2), far: REST_F, hn: 'herbs', hf: 'egg', cloud: 0.36 },
        { d: 5.6, t: T('¡Fuera el mal de ojo! ¡Fuera!', 'Out with the mal de ojo! Out!'), near: { m: 'path', rep: 2, pts: [[165, 276], [165, 420], [165, 350], [122, 350], [208, 350]] }, hn: 'herbs', hf: 'egg', cloud: 0.2,
          ev: [{ at: 0.2, do: 'whoosh' }, { at: 0.7, do: 'whoosh' }] },
        { d: 5.8, t: T('Ahora rompemos el huevo en un vaso de agua…', 'Now the egg is cracked into a glass of water to read what it took away.'), near: { m: 'pt', x: 236, y: 398 }, far: REST_F, hn: 'egg', crouch: 0.85,
          ev: [{ at: 0.58, do: 'crackegg' }] },
        { d: 5.4, t: T('¡Mira! Todo lo pesado se quedó en el huevo.', 'Look! All the heaviness stayed in the egg.'), near: { m: 'pt', x: 244, y: 392, ox: 4, f: 1 }, far: REST_F, hn: null, crouch: 0.5, cloud: 0, mood: 0.6,
          ev: [{ at: 0.2, do: 'poof' }] },
        { d: 6.6, t: T('¡Sana, sana! Ya quedó limpia tu energía.', 'Sana, sana! Your energy is clean again, {name}.'), near: BLESS_N, far: BLESS_F, crouch: 0, mood: 1, ev: [{ at: 0.08, do: 'petals' }, { at: 0.1, do: 'chime' }] }
      ]
    },
    // ================================== BRAZIL ================================
    {
      id: 'brazil', name: 'Brazil', sub: 'Benzedeira · rue branch (arruda)', group: 'World',
      lang: 'pt-BR', theme: { a: '#43a047', b: '#fdd835' },
      blurb: 'A benzedeira in a flowery dress brushes you with a branch of rue. If the leaves wilt by the end, it soaked up the mau-olhado!',
      chips: ['Rue branch', 'Prayer', 'Wilting leaves'],
      fact: 'In Brazil a sprig of arruda is kept behind the ear or in a vase. Folk belief says it withers when it absorbs the evil eye ("mau-olhado" or "olho gordo").',
      music: { root: 196, scale: [0, 2, 4, 7, 9] },
      woman: {
        skin: '#c98a60',
        lower: { type: 'flare', color: '#e9f5db', hw: 70, hemY: 574, pattern: 'florals', patC: '#f06292', bands: [{ o: 0, h: 8, c: '#f06292' }] },
        top: { color: '#e9f5db', neck: 'round', trim: '#f06292', pattern: 'florals', patC: '#f06292' },
        sleeve: { c: '#e9f5db', long: false },
        head: { style: 'scarf', hair: '#2a1d16', cover: { c: '#ffe08a', trim: '#e07a1f', knot: true } },
        acc: { ear: 'stud', neck: 'rosary' },
        shoes: '#8d6e63'
      },
      scene: { type: 'tropical', wall: ['#fff0a8', '#ffc94d'], floor: '#9c6b43', accent: '#43a047', accent2: '#e91e63' },
      station: 'none',
      steps: [
        { d: 4.6, t: T('Senta aqui, meu bem. Vou te benzer.', 'Sit here, meu bem. I\'m going to bless you, {name}.'), near: WAVE, far: REST_F, cloud: 1, mood: 0.1 },
        { d: 4.8, t: T('Um galhinho de arruda bem verdinho…', 'A fresh green sprig of rue (arruda).'), near: { m: 'pt', x: 244, y: 296, ox: 3, oy: 3, f: 1.1 }, far: REST_F, hn: 'rue', mood: 0.15 },
        { d: 7.4, t: T('Arruda, leva o mau-olhado embora…', 'Rue, carry the evil eye away…'), near: sweep(2), far: REST_F, hn: 'rue', cloud: 0.55 },
        { d: 6.4, t: T('Sai mau-olhado, sai inveja, sai olho gordo!', 'Out, evil eye! Out, envy! Out, olho gordo!'), near: circle(3, 1, 46, 32), hn: 'rue', cloud: 0.18, lap: 3 },
        { d: 5.6, t: T('Olha só, a arruda murchou!', 'Look, the rue has wilted! It soaked up the evil eye.'), near: { m: 'pt', x: 236, y: 232, ox: 3, f: 1 }, far: REST_F, hn: 'rue', cloud: 0, mood: 0.6, ev: [{ at: 0.25, do: 'poof' }] },
        { d: 6.6, t: T('Pronto, meu bem! Tá tudo limpo. Agora sorri!', 'Done, meu bem! All clean. Now smile, {name}!'), near: BLESS_N, far: BLESS_F, mood: 1, ev: [{ at: 0.08, do: 'petals' }, { at: 0.1, do: 'chime' }] }
      ]
    },
    // ================================== IRAN ==================================
    {
      id: 'iran', name: 'Iran', sub: 'Esfand smoke · cheshm-e bad door', group: 'World',
      lang: 'fa-IR', theme: { a: '#0e9aa7', b: '#c62828' },
      blurb: 'Esfand (wild rue) seeds pop and crackle on hot coals while smoke is circled around your head. Cheshm-e bad door!',
      chips: ['Esfand seeds', 'Smoke', 'Mashallah'],
      fact: 'Esfand seeds popping on the coals is part of the fun. Persian households burn it at New Year, for newborns, and whenever someone could use some luck.',
      music: { root: 233.08, scale: [0, 1, 4, 5, 7, 8, 11] },
      woman: {
        skin: '#e2b088',
        lower: { type: 'salwar', color: '#1c2b5a', cuff: '#f2c230' },
        top: { color: '#0e9aa7', neck: 'round', trim: '#f2c230', tunic: 492, hemTrim: '#f2c230' },
        sleeve: { c: '#0e9aa7', long: true },
        head: { style: 'odhani', under: 'bun', hair: '#1a110d', cover: { c: '#f5ead0', trim: '#c62828' } },
        acc: { ear: 'drop', neck: 'temple', bangles: [] },
        shoes: '#8a2f3b'
      },
      scene: { type: 'arch', wall: ['#cdeff2', '#7fc8d2'], floor: '#8a2f3b', accent: '#0e9aa7', accent2: '#f2c230', frame: '#1c4f8a', deco: 'tilework', rug: true },
      station: 'none',
      steps: [
        { d: 4.6, t: T('بفرمایید بنشینید. اسپند دود می‌کنم.', 'Please, sit. I\'ll burn esfand for you, {name}.'), near: WAVE, far: REST_F, cloud: 1, mood: 0.1 },
        { d: 5.0, t: T('دانه‌های اسپند روی آتش می‌ترکند…', 'Esfand seeds pop and crackle on the hot coals.'), near: { m: 'pt', x: 242, y: 300, ox: 3, oy: 3, f: 1.2 }, far: REST_F, hn: 'censer', mood: 0.15, ev: [{ at: 0.4, do: 'crackle' }, { at: 0.7, do: 'crackle' }] },
        { d: 7.4, t: T('دور سرت می‌چرخانم… چشم بد دور!', 'Round and round your head. Cheshm-e bad door: away with the evil eye!'), near: circle(3, 1), hn: 'censer', cloud: 0.55, lap: 3 },
        { d: 6.4, t: T('از سر تا پا… ماشاءالله!', 'From head to toe. Mashallah!'), near: sweep(1), hn: 'censer', cloud: 0.25 },
        { d: 5.6, t: T('چشم‌زخم رفت!', 'The cheshm-zakhm is gone!'), near: { m: 'pt', x: 258, y: 214, ox: 6, oy: 3, f: 1.5 }, far: REST_F, hn: 'censer', cloud: 0, mood: 0.6, ev: [{ at: 0.2, do: 'poof' }, { at: 0.3, do: 'crackle' }] },
        { d: 6.6, t: T('حالا لبخند بزن، عزیزم!', 'Now give me a smile, azizam!'), near: BLESS_N, far: BLESS_F, mood: 1, ev: [{ at: 0.08, do: 'petals' }, { at: 0.1, do: 'chime' }] }
      ]
    },
    // ================================== JAPAN =================================
    {
      id: 'japan', name: 'Japan', sub: 'Shinto harae · ōnusa wand & salt', group: 'World',
      lang: 'ja-JP', theme: { a: '#d94a5a', b: '#2b2d42' },
      blurb: 'A shrine maiden in white and red waves an ōnusa wand left-right-left and scatters purifying salt. Not exactly the evil eye, but the closest cousin.',
      chips: ['Ōnusa wand', 'Purifying salt', '2 bows, 2 claps'],
      fact: 'Japan has no exact "evil eye", but Shinto harae and sprinkling salt (kiyome-jio) clear away bad luck. Sumo wrestlers throw salt in the ring for the same reason.',
      music: { root: 220, scale: [0, 1, 5, 7, 8] },
      woman: {
        skin: '#f3d3b8',
        lower: { type: 'flare', color: '#c62828', hw: 84, hemY: 580, pleats: true },
        top: { color: '#ffffff', neck: 'kimono', trim: '#c62828', obi: '#ffffff' },
        sleeve: { c: '#ffffff', long: true, w: [27, 23] },
        head: { style: 'long', hair: '#0f0c14', ribbon: '#ffffff', ornament: '#c62828' },
        acc: { },
        shoes: '#ffffff'
      },
      scene: { type: 'shoji', wall: ['#fbf1e0', '#efe0c4'], floor: '#b79a6b', accent: '#d94a5a', accent2: '#8d6e63' },
      station: 'none',
      steps: [
        { d: 4.6, t: T('どうぞお座りください。お祓いをしますね。', 'Please sit. I\'ll perform a purification (harae) for you, {name}.'), near: WAVE, far: REST_F, cloud: 1, mood: 0.1 },
        { d: 4.8, t: T('大幣と塩で清めます。', 'With the ōnusa wand and salt: the Shinto way of clearing bad luck.'), near: { m: 'pt', x: 246, y: 292, ox: 2, oy: 2, f: 1 }, far: REST_F, hn: 'onusa', mood: 0.15 },
        { d: 7.2, t: T('祓いたまえ、清めたまえ…', 'Harai-tamae, kiyome-tamae. Left, right, left…'), near: { m: 'pt', x: 160, y: 262, ox: 62, oy: 8, f: 0.9 }, hn: 'onusa', cloud: 0.5,
          ev: [{ at: 0.05, do: 'whoosh' }, { at: 0.22, do: 'whoosh' }, { at: 0.39, do: 'whoosh' }, { at: 0.56, do: 'whoosh' }, { at: 0.73, do: 'whoosh' }, { at: 0.9, do: 'whoosh' }] },
        { d: 5.2, t: T('塩で清めます。', 'Salt to purify, like clearing the air.'), near: { m: 'pt', x: 214, y: 300, ox: 6, oy: 4, f: 2 }, far: REST_F, hn: null, cloud: 0.15,
          ev: [{ at: 0.2, do: 'salt' }, { at: 0.5, do: 'salt' }, { at: 0.8, do: 'salt' }] },
        { d: 5.2, t: T('二礼二拍手一礼。', 'Two bows, two claps, one bow.'), near: NAMASTE_N, far: NAMASTE_F, cloud: 0, mood: 0.6,
          ev: [{ at: 0.34, do: 'clap' }, { at: 0.5, do: 'clap' }, { at: 0.55, do: 'poof' }] },
        { d: 6.6, t: T('これで大丈夫です。きっと良いことがありますよ。', 'You\'re all set, {name}. Good things are coming.'), near: BLESS_N, far: BLESS_F, mood: 1, ev: [{ at: 0.08, do: 'petals' }, { at: 0.1, do: 'chime' }] }
      ]
    }
  ];

  NU.byId = (id) => NU.traditions.find((t) => t.id === id);
  NU.HEAD = HEAD;
})(window.NU);
