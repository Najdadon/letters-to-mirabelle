console.log("SCRIPT LOADED");

//const DEV_MODE = false; // <-- set to false before Sunday deploy
//const TARGET_DATE = new Date('2026-02-14T00:00:00');
//const accepted = localStorage.getItem('valentineAccepted');
//const path = window.location.pathname;

//if (!DEV_MODE) {
//  if (!accepted && !path.includes('index.html')) {
//    window.location.href = 'index.html';
//  }

//  if (
 //   accepted &&
//    new Date() < TARGET_DATE &&
 //   path.includes('main.html')
 // ) {
 //   window.location.href = 'countdown.html';
//  }
//}

//const DAILY_TEXT = {
  //'2026-02-09': {
 //   countdown: "I have something planned for you this week. Just… trust me 💙",
  //  lockedHint: "Something is beginning."
//  },
//  '2026-02-10': {
 //   countdown: "I keep thinking about you more than I probably should.",
  //  lockedHint: "This is getting personal." 
//  },
 // '2026-02-11': {
  //  countdown: "There’s a reason I wanted to do this slowly.",
   // lockedHint: "Halfway there."
//  },
//  '2026-02-12': {
  //  countdown: "You don’t even know how much I’m looking forward to Saturday.",
 //   lockedHint: "Almost time."
 // },
 // '2026-02-13': {
  //  countdown: "Tomorrow, I stop holding back.",
  //  lockedHint: "One more sleep."
  //}
//};

//const todayKey = new Date().toISOString().split('T')[0];
//const daily = DAILY_TEXT[todayKey];

//const hintEl = document.getElementById('locked-hint');
//if (daily && hintEl) {
//  hintEl.innerText = daily.lockedHint;
}


/*
  Firebase config:
  - If you set up Firebase, replace the firebaseConfig object below with your project values.
  - If you don't want Firebase yet, leave firebaseConfig = null (code will skip logging).
*/
/*
const firebaseConfig = {
  apiKey: "AIzaSyDNdn7j1vRc-mLJoWkjXgHfr_woQI6isvA",
  authDomain: "mirabelle-9542d.firebaseapp.com",
  projectId: "mirabelle-9542d",
  storageBucket: "mirabelle-9542d.firebasestorage.app",
  messagingSenderId: "634650408021",
  appId: "1:634650408021:web:6aeb5bdcc9a97624d9d0dc"
};
*/


/* Content versioning -- bump a section value when you add content so the banner notifies her */
const contentSections = {
  letters: 'v1',
  poems: 'v1',
  gallery: 'v1',
  hiddenGems: 'v1'
};

/* Good time-based greetings */
const greetings = {
  morning: [
    "Good Morning, Mirabelle! 🌞",
    "Rise and shine! Today is beautiful because of you ☀️",
    "A new day, a new reason to smile 💖"
  ],
  afternoon: [
    "Good Afternoon, love! ☀️",
    "Hope your afternoon is amazing 💖",
    "A sunny hello to brighten your day 🌼"
  ],
  evening: [
    "Good Evening, darling 🌇",
    "Relax and enjoy your evening ✨",
    "Evening vibes just for you 🌙"
  ],
  night: [
    "Good Night, Mirabelle 🌌",
    "Sweet dreams are coming 💫",
    "Nighttime magic for you ✨"
  ]
};

/* Welcome-back messages for additional visits same day */
const welcomeBackMessages = [
  "Welcome back, Mirabelle! 💖",
  "Hey love, glad you’re here again! 🌸",
  "Back for more surprises? ✨",
  "You’re here again! I was waiting 💙",
  "Hello again! More magic awaits 🌟"
];

/* Hidden gem pools (notes, audio filenames, coupons text).
   Replace the sample audio paths with files you add to /audio/ */
const gemPools = [
  {
    type: 'note',
    color: '#FF69B4',
    pool: [
      "Hi Mir, I love you so much 💙",
      "You make my heart skip a beat 💖",
      "Psst… you’re my secret joy 🌸",
      "Every day with you is magic ✨",
      "You are my favourite hello and hardest goodbye."
    ]
  },
  {
    type: 'audio',
    color: '#00BFFF',
    pool: [
      "audio/sample-voice1.mp3",
      "audio/sample-voice2.mp3",
      "audio/sample-voice3.mp3"
    ]
  },
  {
    type: 'coupon',
    color: '#A020F0',
    pool: [
      "Virtual Hug 🤗",
      "Surprise Date Night 🌙",
      "Special Love Note 💌",
      "Redeem a Favor 💜"
    ]
  }
];

/* Number of gems to create each visit (adjustable) */
const GEMS_PER_VISIT = 4;

/* ---------------------------
   END CONFIG
   --------------------------- */


/* ---------------------------
   Initialize Firebase (if provided)
   --------------------------- */
let db = null;
if (firebaseConfig) {
  try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    console.log('Firebase initialized.');
  } catch (e) {
    console.warn('Firebase init failed:', e);
  }
}

/* ---------------------------
   Utility helpers
   --------------------------- */
function qs(sel) { return document.querySelector(sel); }
function qsa(sel) { return Array.from(document.querySelectorAll(sel)); }

}

/* ---------------------------
   Visitor detection & logging (Firestore)
   --------------------------- */


function logVisit() {
  // create a basic device info string
  const deviceInfo = navigator.userAgent || 'unknown';
  const record = {
  type: 'visitor',
    device: deviceInfo,
    timestamp: new Date().toISOString()
  };

  // local log for quick debug
  console.log('Visit log:', record);

  // Firestore log (if configured)
  if (db) {
    db.collection('visits').add(record).catch(err => console.warn('Visit log error:', err));
  }
}

/* ---------------------------
   Notification banner logic (section versioning)
   --------------------------- */
function showNotificationIfNew() {
  try {
    const banner = qs('#notification-banner');
    // only show once per session
    if (sessionStorage.getItem('bannerShown')) return;

    const lastSeen = JSON.parse(localStorage.getItem('lastSeenVersions') || '{}');
    const newSections = [];

    for (const key in contentSections) {
      if (!lastSeen[key] || lastSeen[key] !== contentSections[key]) newSections.push(key);
    }

    if (newSections.length > 0) {
      // map pretty names
      const pretty = newSections.map(s => s === 'hiddenGems' ? 'hidden gems' : s);
      banner.innerText = `✨ Surprise! New content added: check ${pretty.join(', ')}! ✨`;
      // slide down
      setTimeout(() => (banner.style.top = '20px'), 80);
      // hide after 6 seconds
      setTimeout(() => (banner.style.top = '-80px'), 6200);

      // store as seen (so banner won't show again until you bump versions)
      localStorage.setItem('lastSeenVersions', JSON.stringify(contentSections));
      sessionStorage.setItem('bannerShown', 'true');
    }
  } catch (e) {
    console.warn('Notification error', e);
  }
}

/* ---------------------------
   Greeting / Welcome Back logic
   --------------------------- */
function pickTimeOfDayGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

function showGreeting() {
  const popup = qs('#greeting-popup');
  const msgEl = qs('#greeting-message');
  const today = new Date().toDateString();
  const lastShown = localStorage.getItem('lastGreetingDate');

  let message;
  if (lastShown !== today) {
    const timeSlot = pickTimeOfDayGreeting();
    const pool = greetings[timeSlot];
    message = pool[Math.floor(Math.random() * pool.length)];
    localStorage.setItem('lastGreetingDate', today);
  } else {
    // welcome back message
    message = welcomeBackMessages[Math.floor(Math.random() * welcomeBackMessages.length)];
  }

  msgEl.innerText = message;
  popup.style.display = 'flex';
}

function closeGreeting() {
  qs('#greeting-popup').style.display = 'none';
}

/* ---------------------------
   Gallery Tabs
   --------------------------- */
function showGallery(type, btn) {
  // set active button
  qsa('.tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const images = qsa('.image-item');
  const videos = qsa('.video-item');

  if (type === 'all') {
    images.forEach(i => (i.style.display = 'inline-block'));
    videos.forEach(v => (v.style.display = 'inline-block'));
  } else if (type === 'images') {
    images.forEach(i => (i.style.display = 'inline-block'));
    videos.forEach(v => (v.style.display = 'none'));
  } else if (type === 'videos') {
    images.forEach(i => (i.style.display = 'none'));
    videos.forEach(v => (v.style.display = 'inline-block'));
  }
}

/* ---------------------------
   Sections navigation
   --------------------------- */
function showSection(id) {
  qsa('.section').forEach(s => s.style.display = 'none');
  const el = qs(`#${id}`);
  if (el) el.style.display = 'block';
}

/* Playlist open */
function openPlaylist() {
  window.open('https://youtube.com/playlist?list=PLaJ_oeKKGN8IqqE9x6zVuAKFPGC2Bh8l3', '_blank');
}

/* ---------------------------
   Hidden Gems generator (random colored, non-repeating)
   --------------------------- */
function createHiddenGems() {
 

  // Load used items to avoid repeats across sessions (optionally persist)
  let used = JSON.parse(localStorage.getItem('usedGems') || '[]');

  // flatten all available items count so we can skip when exhausted
  const totalAvailable = gemPools.reduce((sum, g) => sum + g.pool.length, 0);
  if (used.length >= totalAvailable) {
    // Optional: reset if all used up
    // used = []; localStorage.removeItem('usedGems');
    // For now, if exhausted, we just stop adding new gems.
    console.info('All gem content used up for this browser.');
  }

  const createdGems = [];
  for (let i = 0; i < GEMS_PER_VISIT; i++) {
    // pick random gem pool type
    const poolIndex = Math.floor(Math.random() * gemPools.length);
    const gemType = gemPools[poolIndex];
    // filter unused options for this type
    const available = gemType.pool.filter(item => !used.includes(item));
    if (available.length === 0) continue; // nothing new here

    // pick content
    const content = available[Math.floor(Math.random() * available.length)];
    used.push(content);
    localStorage.setItem('usedGems', JSON.stringify(used));

    // create gem element
    const gemEl = document.createElement('div');
    gemEl.className = 'hidden-gem';
    gemEl.innerText = '✨';
    gemEl.style.position = 'fixed';
    // random-ish positions (avoid edges)
    gemEl.style.top = (10 + Math.random() * 70) + '%';
    gemEl.style.left = (8 + Math.random() * 80) + '%';
    gemEl.style.color = gemType.color;
    gemEl.style.zIndex = 70 + i;
    document.body.appendChild(gemEl);
    createdGems.push({ el: gemEl, content, type: gemType.type, color: gemType.color });
  }

  // For each created gem, build a popup and logic
  createdGems.forEach((g, idx) => {
    const popup = document.createElement('div');
    popup.className = 'popup';
    popup.style.zIndex = 200 + idx;
    // popup content container
    const pc = document.createElement('div');
    pc.className = 'popup-content';
    pc.innerHTML = `<span class="close" onclick="this.parentElement.parentElement.style.display='none'">&times;</span>`;

    // type-specific content
    if (g.type === 'note') {
      const p = document.createElement('p');
      p.innerText = g.content;
      p.style.color = '#fff';
      p.style.fontSize = '1.05rem';
      pc.appendChild(p);
    } else if (g.type === 'audio') {
      const p = document.createElement('p'); p.innerText = "Listen 💙";
      const audio = document.createElement('audio');
      audio.controls = true;
      const src = document.createElement('source');
      src.src = g.content; // audio path
      src.type = 'audio/mpeg';
      audio.appendChild(src);
      p.appendChild(audio);
      pc.appendChild(p);
    } else if (g.type === 'coupon') {
      // draw coupon to canvas
      const title = g.content;
      const canvas = document.createElement('canvas');
      canvas.width = 520; canvas.height = 300;
      canvas.className = 'couponCanvas';
      const ctx = canvas.getContext('2d');

      // draw gradient background
      const grad = ctx.createLinearGradient(0,0,canvas.width,canvas.height);
      grad.addColorStop(0, g.color);
      grad.addColorStop(1, '#4b2a69');
      ctx.fillStyle = grad;
      ctx.fillRect(0,0,canvas.width,canvas.height);

      // decorative
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      for(let k=0;k<8;k++){
        ctx.beginPath();
        ctx.arc(30 + k*70, 40 + (k%2)*20, 40, 0, Math.PI*2);
        ctx.fill();
      }

      // text
      ctx.fillStyle = '#fff';
      ctx.font = '28px Poppins';
      ctx.textAlign = 'center';
      ctx.fillText('COUPON', canvas.width/2, 70);

      ctx.font = '22px Poppins';
      ctx.fillText(title, canvas.width/2, canvas.height/2 + 10);

      ctx.font = '14px Poppins';
      ctx.fillText('Redeemable for something special — show this to Najee', canvas.width/2, canvas.height - 40);

      pc.appendChild(canvas);

      // download link
      const download = document.createElement('a');
      download.innerText = 'Download Coupon';
      download.href = '#';
      download.style.display = 'inline-block';
      download.style.marginTop = '12px';
      download.style.color = '#fff';
      download.onclick = function(e){
        e.preventDefault();
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `${title.replace(/\s+/g,'_')}.png`;
        link.click();
      };
      pc.appendChild(download);
    }

    popup.appendChild(pc);
    document.body.appendChild(popup);

    // click logic
    g.el.addEventListener('click', () => {
      // show popup
      popup.style.display = 'flex';
      // optional: log that a hidden gem was opened (firestore)
      if (db) {
        db.collection('gemEvents').add({
          type: g.type,
          content: g.content,
          timestamp: new Date().toISOString(),
          actor: 'visitor'
        }).catch(err => console.warn('Gem log error', err));
      }
    });
  });
}

/* ---------------------------
   Boot sequence
   --------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Firestore logging in main code if configured
  logVisit();

  // Show dynamic notification if any new section
  showNotificationIfNew();

  // Show greeting/welcome back (time-aware)
  showGreeting();

  // Set default section visible (home = none; show letters by click)
  // showSection('letters'); // optional default

  // Create hidden gems randomly for primary visitor
  createHiddenGems();

  // Gallery tabs: set event to default 'all' active (first tab)
  // If the page uses statically added tabs, ensure first is active
  // (buttons are inline in HTML)
});

/* ---------------------------
  Small helpers for testing
  --------------------------- */

// Reset usedGems (for testing only)
// localStorage.removeItem('usedGems');

// Utility to bump versions manually (for quick testing)
function bumpSection(section) {
  // e.g., bumpSection('gallery') => will set contentSections.gallery to new random version
  if (contentSections[section]) {
    contentSections[section] = contentSections[section] + '-' + Date.now();
    // next reload will show notification because localStorage has old value
    console.log('Bumped', section, contentSections[section]);
  }
}

/* Envelope open/close toggle */
function toggleEnvelope(el) {
  el.classList.toggle('open');
}

/* Fix gallery filter (optional) */
function showGallery(type, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  document.querySelectorAll('.gallery-item').forEach(item => {
    if (type === 'all' || item.classList.contains(type + '-item')) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
}

/* Playlist Link */
function openPlaylist() {
  window.open("https://youtube.com/playlist?list=PLaJ_oeKKGN8IqqE9x6zVuAKFPGC2Bh8l3&si=FCldejexsyJR4fgO", "_blank");
}

