/* ============================================================
   MINDWAVE — App
   Faithful copy of Lovable project: UI-Project--MindWave
   All screens in Hebrew, RTL, exact design language
   ============================================================ */

// ── State ──────────────────────────────────────────────────────────
const S = {
  authed:     false,
  tab:        'home',      // home | community | tools | profile
  dark:       false,
  isSignup:   false,
  authMethod: 'email',     // email | id
  moodSelected: null,
  // Detail screens
  activeHome:    null,     // null | 'breathing' | 'flashbacks' | 'podcast' | 'support'
  activeTool:    null,     // null | tool object
  activeGroup:   null,     // null | group object
  activeProfile: null,     // null | 'report' | 'privacy'
  // Privacy toggles
  privAnon:  true,
  privShare: false,
  privNotif: true,
  // Journal
  journalEntry: '',
  journalSaved: false,
  // Community sub-tab
  communityTab: 'mine',   // 'mine' | 'join'
  joinedGroups: {},       // tracks joined groups by id
  // Group chat
  groupMessages: {},
  groupInput: '',
  // Support chat
  chatMessages: [],
  chatInput: '',
  // Report period
  reportPeriod: 'week', // 'week' | 'month'
};

// init theme
try {
  const t = localStorage.getItem('mw-theme');
  S.dark = t ? t === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
} catch(e) {}

// ── Splash screen ───────────────────────────────────────────────────
(function initSplash() {
  const splash = document.getElementById('splash');
  if (!splash) return;
  setTimeout(() => {
    splash.classList.add('hide');
    setTimeout(() => { splash.remove(); }, 500);
  }, 2000);
})();

// ── Router ─────────────────────────────────────────────────────────
let _rendering = false;
function render() {
  const app = document.getElementById('app');
  document.documentElement.classList.toggle('dark', S.dark);
  try { localStorage.setItem('mw-theme', S.dark ? 'dark' : 'light'); } catch(e) {}

  if (_rendering) {
    app.innerHTML = S.authed ? renderMain() : renderAuth();
    bindEvents();
    return;
  }

  _rendering = true;
  // Opacity only — transform on a parent breaks position:fixed children (nav bar)
  app.style.transition = 'opacity 0.14s ease';
  requestAnimationFrame(() => { app.style.opacity = '0'; });

  setTimeout(() => {
    app.innerHTML = S.authed ? renderMain() : renderAuth();
    bindEvents();
    app.style.transition = 'opacity 0.28s cubic-bezier(0.25,0,0.25,1)';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      app.style.opacity = '1';
    }));
    setTimeout(() => {
      app.style.transition = '';
      _rendering = false;
    }, 320);
  }, 160);
}

// ── SVG Icons (matching Lucide) ────────────────────────────────────
const SVG = {
  home:    `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  users:   `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  book:    `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
  user:    `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  wind:    `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>`,
  phone:   `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.61 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.09 6.09l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
  headphones:`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>`,
  music:   `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
  heart:   `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  leaf:    `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>`,
  chat:    `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  chart:   `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  mail:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`,
  id:      `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="16" y1="2" x2="16" y2="7"/><line x1="8" y1="2" x2="8" y2="7"/><line x1="6" y1="12" x2="10" y2="12"/><line x1="6" y1="16" x2="12" y2="16"/></svg>`,
  arrowR:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`,
  send:    `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transform:scaleX(-1)"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
  sun:     `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>`,
  moon:    `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
  userplus:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>`,
  usersGroup:`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
};

// ── AUTH SCREEN ─────────────────────────────────────────────────────
function renderAuth() {
  const greet = S.dark ? 'לילה טוב' : 'שלום';
  return `
<div class="auth-screen">
  <div class="auth-top-row">
    <button class="icon-btn" id="toggle-dark" aria-label="החלפת מצב">${S.dark ? SVG.moon : SVG.sun}</button>
  </div>

  <div class="auth-logo-section">
    <div class="auth-logo-box">${SVG.leaf}</div>
    <h1 class="auth-app-name">MINDWAVE</h1>
    <p class="auth-tagline">גל של תמיכה — בקצב שלך.</p>
  </div>

  <!-- Method toggle -->
  <div class="auth-method-row">
    <button class="auth-method-btn ${S.authMethod==='email'?'active':''}" id="method-email">
      ${SVG.mail} אימייל
    </button>
    <button class="auth-method-btn ${S.authMethod==='id'?'active':''}" id="method-id">
      ${SVG.id} תעודת זהות
    </button>
  </div>

  <!-- Form -->
  <form class="auth-form" id="auth-form">
    ${S.isSignup ? `<input class="auth-input" type="text" placeholder="שם או כינוי" />` : ''}
    <input class="auth-input"
      type="${S.authMethod==='email'?'email':'text'}"
      inputmode="${S.authMethod==='id'?'numeric':'email'}"
      placeholder="${S.authMethod==='email'?'כתובת אימייל':'מספר תעודת זהות'}" />
    <input class="auth-input" type="password" placeholder="סיסמה" />
    <button type="submit" class="auth-submit">${S.isSignup?'יצירת חשבון':'התחברות'}</button>
  </form>

  <!-- Guest -->
  <button class="auth-guest" id="guest-btn">כניסה כאורח — ללא הרשמה</button>
  <p class="auth-guest-note">אפשר להיכנס ולהתנסות במרחב גם בלי ליצור משתמש</p>

  <!-- Create user box -->
  <div class="auth-create-box">
    <div class="auth-create-icon">${SVG.userplus}</div>
    <div>
      <p class="auth-create-title">אין לך משתמש עדיין?</p>
      <p class="auth-create-sub">צור משתמש חדש כאן — אנונימי ומוגן.</p>
      <button class="auth-create-link" id="signup-link">צור משתמש חדש כאן ←</button>
    </div>
  </div>

  <p class="auth-footer">בהמשך אתה מאשר את תנאי השימוש ומדיניות הפרטיות</p>
</div>`;
}

// ── MAIN APP ─────────────────────────────────────────────────────────
function renderMain() {
  // Determine which body to show
  let body = '';

  // Handle detail screens that overlay the tab
  if (S.activeHome)    return renderMainShell(renderHomeDetail());
  if (S.activeTool)    return renderMainShell(renderToolDetail());
  if (S.activeGroup)   return renderGroupChatScreen();
  if (S.activeProfile) return renderMainShell(renderProfileDetail());

  if      (S.tab === 'home')      body = renderHomeTab();
  else if (S.tab === 'community') body = renderCommunityTab();
  else if (S.tab === 'tools')     body = renderToolsTab();
  else if (S.tab === 'profile')   body = renderProfileTab();

  return renderMainShell(body);
}

function renderMainShell(body) {
  const greet = S.dark ? 'לילה טוב, נועה' : 'בוקר טוב, נועה';
  const titles = { home: S.dark?'איך את מרגישה הערב?':'איך את מרגישה היום?', community:'הקהילה שלך', tools:'כלים לרגעים קשים', profile:'המרחב שלי' };

  // If a detail is open, don't show the header
  const showHeader = !S.activeHome && !S.activeTool && !S.activeProfile && !S.activeGroup;

  return `
<div class="main-screen">
  ${showHeader ? `
  <header class="app-header">
    <div>
      <p class="app-greeting">${greet}</p>
      <h1 class="app-title">${titles[S.tab] || ''}</h1>
    </div>
    <button class="header-icon-btn" id="toggle-dark">${S.dark ? SVG.moon : SVG.sun}</button>
  </header>` : ''}

  ${body}

  <!-- Bottom nav (hidden during group chat) -->
  <nav class="bottom-nav">
    ${navItem('home',      SVG.home,  'בית')}
    ${navItem('community', SVG.users, 'קהילה')}
    ${navItem('tools',     SVG.book,  'כלים')}
    ${navItem('profile',   SVG.user,  'פרופיל')}
  </nav>
</div>`;
}

function navItem(tab, icon, label) {
  const active = S.tab === tab && !S.activeHome && !S.activeTool && !S.activeProfile && !S.activeGroup;
  return `
    <button class="nav-item ${active?'active':''}" data-tab="${tab}">
      <span class="nav-icon-pill">${icon}</span>
      <span class="nav-label">${label}</span>
    </button>`;
}

// ── HOME TAB ──────────────────────────────────────────────────────────
function renderHomeTab() {
  const moods = [
    {e:'😌',l:'רגועה'},{e:'🙂',l:'בסדר'},{e:'😔',l:'עצובה'},
    {e:'😟',l:'חרדה'},{e:'😴',l:'עייפה'}
  ];
  return `
<div class="tab-content">
  <!-- Mood check-in -->
  <section class="mood-card">
    <p class="mood-card-title">${S.dark?'צ׳ק-אין לילי':'צ׳ק-אין יומי'}</p>
    <p class="mood-card-sub">אין תשובות נכונות. רק את ומה שעולה כרגע.</p>
    <div class="mood-row">
      ${moods.map((m,i) => `
        <button class="mood-btn ${S.moodSelected===i?'selected':''}" data-mood="${i}">
          <span class="mood-emoji">${m.e}</span>
          <span class="mood-label">${m.l}</span>
        </button>`).join('')}
    </div>
  </section>

  <!-- Featured: Breathing -->
  <section class="featured-card">
    <div class="featured-inner">
      <div class="featured-icon-box">${SVG.wind}</div>
      <div>
        <h3 class="featured-title">תרגיל הרגעה — 2 דקות</h3>
        <p class="featured-sub">נשימה מודרכת להפחתת חרדה ומתח</p>
        <button class="featured-btn" data-home-detail="breathing">התחילי עכשיו</button>
      </div>
    </div>
  </section>

  <!-- Content cards -->
  <section>
    <div class="section-header">
      <h2 class="section-title">${S.dark?'בשבילך הערב':'בשבילך היום'}</h2>
      <button class="section-all">הכל</button>
    </div>
    <button class="content-card tint-green" data-home-detail="flashbacks">
      <div class="content-card-icon">${SVG.book}</div>
      <div>
        <p class="content-card-title">להבין פלאשבקים</p>
        <p class="content-card-sub">קריאה · 5 דק׳</p>
      </div>
    </button>
    <button class="content-card tint-accent" data-home-detail="podcast">
      <div class="content-card-icon">${SVG.headphones}</div>
      <div>
        <p class="content-card-title">בשבילך, היום</p>
        <p class="content-card-sub">פודקאסט · 10 דק׳</p>
      </div>
    </button>
  </section>

  <!-- Support line -->
  <button class="support-btn" data-home-detail="support">
    <div class="support-icon">${SVG.phone}</div>
    <div class="support-text">
      <p class="support-title">צריכה לדבר עם מישהו עכשיו?</p>
      <p class="support-sub">קו תמיכה זמין 24/7, אנונימי וחינמי</p>
    </div>
  </button>
</div>`;
}

// ── HOME DETAIL SCREENS ───────────────────────────────────────────────
function renderHomeDetail() {
  const d = S.activeHome;
  if (d === 'breathing') return renderDetailScreen('תרגיל הרגעה','נשימה מודרכת · 2 דק׳','tint-green',SVG.wind, renderBreathingBody(),'activeHome');
  if (d === 'flashbacks') return renderDetailScreen('להבין פלאשבקים','קריאה · 5 דק׳','tint-green',SVG.book, renderArticleBody([
    'פלאשבק הוא רגע שבו הגוף והנפש חוזרים לאירוע מהעבר, גם כשאת כאן ועכשיו.',
    'זה לא סימן לחולשה — זו תגובה טבעית של מערכת העצבים שמנסה להגן עלייך.',
    'טכניקת ההארקה (5-4-3-2-1): מצאי 5 דברים שאת רואה, 4 ששומעת, 3 שמרגישה, 2 שמריחה, 1 שטועמת.',
    'תני לעצמך זמן. את לא חייבת להבין הכל עכשיו.',
  ]),'activeHome');
  if (d === 'podcast') return renderDetailScreen('בשבילך, היום','פודקאסט · 10 דק׳','tint-peach',SVG.headphones, renderPodcastBody(),'activeHome');
  if (d === 'support') return renderDetailScreen('קו תמיכה','זמין 24/7 · אנונימי','tint-peach',SVG.phone, renderChatBody('היי, אני כאן להקשיב. אין לחץ ואין שיפוט. ספרי מה עובר עלייך עכשיו.','מתנדבת · נועם','supportChat'),'activeHome');
  return '';
}

// ── DETAIL SCREEN WRAPPER ─────────────────────────────────────────────
function renderDetailScreen(title, subtitle, tint, icon, body, backKey) {
  return `
<div class="detail-screen">
  <div class="detail-header">
    <button class="back-btn" data-back="${backKey}">${SVG.arrowR}</button>
    <div class="detail-icon-box ${tint}">${icon}</div>
    <div>
      <p class="detail-title">${title}</p>
      <p class="detail-sub">${subtitle}</p>
    </div>
  </div>
  <div class="detail-body">${body}</div>
</div>`;
}

// ── BREATHING BODY ────────────────────────────────────────────────────
let breathInterval = null;
let breathState = { active: false, phase: 'idle', count: 0, totalSeconds: 0 };
const BREATH_TOTAL = 120; // 2 minutes

function renderBreathingBody() {
  return `
<div class="breathing-wrap">
  <p class="breathing-hint">שאפו דרך האף 4 שניות · עצרו 7 שניות · נשפו באיטיות דרך הפה 8 שניות</p>

  <div class="breath-progress-row" id="breath-progress-row">
    <span class="breath-time" id="breath-time">2:00</span>
    <div class="breath-prog-track">
      <div class="breath-prog-bar" id="breath-prog-bar"></div>
    </div>
  </div>

  <div class="breathing-circle idle" id="breath-circle">
    <span class="breath-label" id="breath-label">לחצי להתחיל</span>
    <span class="breath-count" id="breath-count"></span>
  </div>

  <button class="breath-stop-btn" id="breath-stop">עצור</button>
</div>`;
}

function startBreathing() {
  if (breathInterval) clearInterval(breathInterval);
  breathState = { active: true, phase: 'inhale', count: 4, totalSeconds: 0 };

  const circle   = document.getElementById('breath-circle');
  const label    = document.getElementById('breath-label');
  const countEl  = document.getElementById('breath-count');
  const progRow  = document.getElementById('breath-progress-row');
  const progBar  = document.getElementById('breath-prog-bar');
  const timeEl   = document.getElementById('breath-time');
  const stopBtn  = document.getElementById('breath-stop');

  if (!circle) return;

  const LABELS = { inhale: 'שאפו דרך האף', hold: 'עצרו את הנשימה', exhale: 'נשפו באיטיות' };

  // Initial UI
  progRow.style.display  = 'flex';
  stopBtn.style.display  = 'block';
  circle.className       = 'breathing-circle inhale';
  label.textContent      = LABELS.inhale;
  countEl.style.display  = 'block';
  countEl.textContent    = '4';

  breathInterval = setInterval(() => {
    breathState.totalSeconds++;
    breathState.count--;

    if (breathState.totalSeconds >= BREATH_TOTAL) { stopBreathing(); return; }

    if (breathState.count <= 0) {
      if      (breathState.phase === 'inhale') { breathState.phase = 'hold';   breathState.count = 7; }
      else if (breathState.phase === 'hold')   { breathState.phase = 'exhale'; breathState.count = 8; }
      else                                     { breathState.phase = 'inhale'; breathState.count = 4; }
    }

    const c  = document.getElementById('breath-circle');
    const l  = document.getElementById('breath-label');
    const cn = document.getElementById('breath-count');
    const pb = document.getElementById('breath-prog-bar');
    const te = document.getElementById('breath-time');
    if (!c) { clearInterval(breathInterval); return; }

    c.className   = `breathing-circle ${breathState.phase}`;
    l.textContent = LABELS[breathState.phase];
    cn.textContent = breathState.count;

    const pct = (breathState.totalSeconds / BREATH_TOTAL) * 100;
    pb.style.width = pct + '%';

    const rem  = BREATH_TOTAL - breathState.totalSeconds;
    te.textContent = `${Math.floor(rem/60)}:${String(rem%60).padStart(2,'0')}`;
  }, 1000);
}

function stopBreathing() {
  clearInterval(breathInterval);
  breathInterval = null;
  breathState = { active: false, phase: 'idle', count: 0, totalSeconds: 0 };

  const circle  = document.getElementById('breath-circle');
  const label   = document.getElementById('breath-label');
  const countEl = document.getElementById('breath-count');
  const progRow = document.getElementById('breath-progress-row');
  const stopBtn = document.getElementById('breath-stop');

  if (!circle) return;
  circle.className      = 'breathing-circle idle';
  label.textContent     = 'לחצי להתחיל';
  countEl.style.display = 'none';
  countEl.textContent   = '';
  progRow.style.display = 'none';
  stopBtn.style.display = 'none';
}

// ── PODCAST (Speech Synthesis) ────────────────────────────────────────
const PODCAST_SCRIPT = `בשבילך, היום.

שלום וברוכה הבאה. אני שמחה שאת כאן, שהקדשת את הרגע הזה לעצמך. זה לא מובן מאליו. להיות כאן, להקשיב, לדאוג לעצמך — זה כבר מעשה של אומץ.

הפרק של היום הוא בשבילך. רק בשבילך. לא בשביל מישהו אחר, לא בשביל מה שצריך להיות — אלא בשביל מה שאת, ממש עכשיו.

קחי רגע לנשום. לא צריך לעשות כלום מיוחד. פשוט תני לגוף שלך להיות.

---

אני רוצה לדבר איתך על משהו שלא מדברים עליו מספיק: הקושי שבלהיות בסדר.

כולנו מכירות את זה. הרגע שבו מישהו שואל "איך את?" ואנחנו עונות "בסדר", גם כשבפנים כל כך הרבה דברים קורים. כל כך הרבה שאלות, כל כך הרבה רגשות שאין להם שם.

זה לא חולשה. זה אנושיות.

---

ג׳ולייה קמרון, סופרת שכתבה על יצירתיות וריפוי, אמרה פעם שאנחנו לא צריכות לדעת לאן אנחנו הולכות — אנחנו רק צריכות לדעת לאן אנחנו לא רוצות ללכת יותר.

ואני חושבת שזה נכון גם בתהליך הריפוי שלנו.

את לא חייבת לדעת איך הכל ייראה בסוף. את לא חייבת לראות את כל הדרך. מספיק לראות את הצעד הבא. רק אחד.

---

רגע של הרפיה.

אם את יכולה, שבי בנוחות. תני לגב שלך להישען. תרפי את הכתפיים.

עכשיו, נשמי איתי.

שאפי לאט דרך האף, אחת, שתיים, שלוש, ארבע.

עצרי בעדינות, אחת, שתיים, שלוש, ארבע, חמש, שש, שבע.

נשפי באיטיות דרך הפה, אחת, שתיים, שלוש, ארבע, חמש, שש, שבע, שמונה.

יפה מאוד. עוד פעם.

שאפי, אחת, שתיים, שלוש, ארבע.

עצרי, אחת, שתיים, שלוש, ארבע, חמש, שש, שבע.

נשפי, אחת, שתיים, שלוש, ארבע, חמש, שש, שבע, שמונה.

הגוף שלך יודע מה לעשות. הוא יודע לנשום, הוא יודע לנוח, הוא יודע להחלים. לפעמים הוא רק צריך רשות.

---

אני רוצה לספר לך על יום אחד שאני זוכרת.

היה בוקר, ויצאתי לקנות לחם. משהו פשוט. ובדרך, ראיתי ילדה קטנה רצה לכיוון אמה — הידיים פרושות, הפנים מלאות שמחה. ועצרתי. ועמדתי שם, ובכיתי.

לא מעצב. מכמיהה. מגעגוע לפשטות. מהבנה שאי שם, בתוכי, יש ילדה כזו שגם היא רוצה לרוץ.

ואמרתי לעצמי: מותר לה. מותר לה לרצות. מותר לה לגעגע. מותר לה להיות עצובה ולהיות שמחה באותו רגע.

ומותר גם לך.

---

הרגשות שלך הם לא בעיה שצריך לפתור. הם מידע. הם ניסיון של הגוף והנפש שלך לדבר איתך.

כשאת מרגישה פחד — הגוף שלך אומר: "ראי, משהו מאיים."
כשאת מרגישה עצב — הנפש שלך אומר: "משהו חשוב לי הלך."
כשאת מרגישה כעס — יש בך גבול שנחצה.

כל אחד מהרגשות האלה חשוב. כל אחד מהם מגיע ממקום של הגנה עליך.

הטריק הוא לא להיפטר מהם — אלא ללמוד לשבת איתם, בלי שהם ישתלטו.

---

יש טכניקה פשוטה שנקראת הארקה, ואני רוצה ללמד אותה אותך עכשיו.

היא עובדת כי היא מחזירה אותנו לרגע הזה. לכאן. לעכשיו.

חפשי חמישה דברים שאת רואה סביבך. תתארי אותם בראש שלך.

ארבעה דברים שאת שומעת. קולות קרובים, קולות רחוקים.

שלושה דברים שאת מרגישה בגוף. אולי הכיסא מתחתייך. אולי הטמפרטורה של האוויר. אולי הבגד על העור.

שני דברים שאת מריחה, או שהיית רוצה להריח.

ודבר אחד שאת יכולה לטעום.

הגוף שלך חזר. הוא כאן. ואת איתו.

---

לפני שנסיים, אני רוצה שתקחי איתך משפט אחד להיום:

אני עושה כמיטב יכולתי, ועם מה שיש לי, וזה מספיק.

קראי את זה שוב בשקט.

אני עושה כמיטב יכולתי, ועם מה שיש לי, וזה מספיק.

---

תודה שהיית כאן. תודה שנתת לעצמך את הזמן הזה. אני מקווה שהיה לך טוב, ולו רק קצת.

נתראה בפרק הבא — בשבילך, גם מחר.`;

const PODCAST_DURATION = 600; // 10 minutes
let podState = { playing: false, elapsed: 0, utterance: null, interval: null };

function renderPodcastBody() {
  const pct = Math.min((podState.elapsed / PODCAST_DURATION) * 100, 100);
  const fmt = s => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
  return `
<div class="podcast-wrap">
  <div class="podcast-avatar-box">${SVG.headphones}</div>
  <p class="podcast-ep-title">פרק 1 — בשבילך, היום</p>
  <p class="podcast-desc">רגע של עצירה, נשימה, ושיחה עדינה בשבילך — ממש עכשיו.</p>
  <div class="podcast-prog-track">
    <div class="podcast-prog-fill" id="pod-fill" style="width:${pct}%"></div>
  </div>
  <div class="podcast-time-row">
    <span id="pod-elapsed">${fmt(podState.elapsed)}</span>
    <span>${fmt(PODCAST_DURATION)}</span>
  </div>
  <button class="podcast-play-btn" id="pod-toggle">
    ${podState.playing
      ? `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`
      : `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>`}
  </button>
  <p class="podcast-speaker">מגיש: קול נשי רגוע · בשבילך</p>
</div>`;
}

function togglePodcast() {
  if (!window.speechSynthesis) return;
  if (podState.playing) {
    window.speechSynthesis.pause();
    clearInterval(podState.interval);
    podState.playing = false;
    refreshPodcastUI();
    return;
  }
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
    podState.playing = true;
    podState.interval = setInterval(tickPodcast, 1000);
    refreshPodcastUI();
    return;
  }
  // Fresh start — pick a calm female Hebrew voice if available
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(PODCAST_SCRIPT);
  utt.lang = 'he-IL';
  utt.rate = 0.82;   // slower = more relaxed
  utt.pitch = 1.1;   // slightly higher = softer female feel
  utt.volume = 1;
  const pickVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    return voices.find(v => v.lang === 'he-IL' && /female|נקבה|woman/i.test(v.name))
        || voices.find(v => v.lang === 'he-IL')
        || null;
  };
  const chosen = pickVoice();
  if (chosen) { utt.voice = chosen; }
  else {
    // voices may not be ready yet — wait for them then re-speak
    window.speechSynthesis.onvoiceschanged = () => {
      const v2 = pickVoice();
      if (v2) utt.voice = v2;
      window.speechSynthesis.onvoiceschanged = null;
    };
  }
  utt.onstart  = () => { podState.playing = true; podState.interval = setInterval(tickPodcast, 1000); refreshPodcastUI(); };
  utt.onend    = () => { stopPodcast(); };
  utt.onerror  = () => { stopPodcast(); };
  podState.utterance = utt;
  window.speechSynthesis.speak(utt);
}

function tickPodcast() {
  podState.elapsed = Math.min(podState.elapsed + 1, PODCAST_DURATION);
  const fill    = document.getElementById('pod-fill');
  const elapsed = document.getElementById('pod-elapsed');
  if (!fill) { stopPodcast(); return; }
  fill.style.width = (podState.elapsed / PODCAST_DURATION * 100) + '%';
  if (elapsed) elapsed.textContent = `${Math.floor(podState.elapsed/60)}:${String(podState.elapsed%60).padStart(2,'0')}`;
}

function stopPodcast() {
  window.speechSynthesis && window.speechSynthesis.cancel();
  clearInterval(podState.interval);
  podState = { playing: false, elapsed: 0, utterance: null, interval: null };
  refreshPodcastUI();
}

function refreshPodcastUI() {
  const btn = document.getElementById('pod-toggle');
  if (!btn) return;
  btn.innerHTML = podState.playing
    ? `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`
    : `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>`;
}

// ── PLAYER BODY ───────────────────────────────────────────────────────
let playerAudio = null;
let playerState = { playing: false, progress: 0, duration: 0 };
let playerTimerSrc = '';

function renderPlayerBody(desc, label, src) {
  const pct = playerState.duration ? (playerState.progress / playerState.duration) * 100 : 0;
  const fmt = s => { if (!isFinite(s)||s<=0) return '0:00'; return `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`; };
  playerTimerSrc = src;
  return `
<div class="player-wrap">
  <audio id="player-audio" src="${src}" preload="metadata"></audio>
  <p class="player-desc">${desc}</p>
  <p class="player-label">${label}</p>
  <button class="player-btn ${playerState.playing?'playing':''}" id="player-toggle">
    ${playerState.playing ? '⏸' : '▶'}
  </button>
  <div class="player-progress-wrap">
    <div class="player-bar"><div class="player-fill" style="width:${pct}%"></div></div>
    <div class="player-times"><span>${fmt(playerState.progress)}</span><span>${fmt(playerState.duration)}</span></div>
  </div>
  <p class="player-status">${playerState.playing?'מתנגן...':'הקישי להפעלה'}</p>
</div>`;
}

function initPlayer() {
  const audio = document.getElementById('player-audio');
  if (!audio) return;
  playerAudio = audio;
  audio.addEventListener('loadedmetadata', () => { playerState.duration = audio.duration; updatePlayerUI(); });
  audio.addEventListener('timeupdate', () => { playerState.progress = audio.currentTime; updatePlayerUI(); });
  audio.addEventListener('ended', () => { playerState.playing = false; updatePlayerUI(); });
}

function updatePlayerUI() {
  const pct = playerState.duration ? (playerState.progress / playerState.duration) * 100 : 0;
  const fmt = s => { if (!isFinite(s)||s<=0) return '0:00'; return `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`; };
  const fill = document.querySelector('.player-fill');
  const times = document.querySelectorAll('.player-times span');
  const btn   = document.getElementById('player-toggle');
  const status= document.querySelector('.player-status');
  if (fill)       fill.style.width = `${pct}%`;
  if (times[0])   times[0].textContent = fmt(playerState.progress);
  if (times[1])   times[1].textContent = fmt(playerState.duration);
  if (btn)        btn.innerHTML = playerState.playing ? '⏸' : '▶';
  if (btn)        btn.classList.toggle('playing', playerState.playing);
  if (status)     status.textContent = playerState.playing ? 'מתנגן...' : 'הקישי להפעלה';
}

async function togglePlayer() {
  const audio = playerAudio || document.getElementById('player-audio');
  if (!audio) return;
  if (playerState.playing) {
    audio.pause(); playerState.playing = false;
  } else {
    try { await audio.play(); playerState.playing = true; } catch(e) { playerState.playing = false; }
  }
  updatePlayerUI();
}

// ── ARTICLE BODY ──────────────────────────────────────────────────────
function renderArticleBody(paragraphs) {
  return `<div class="article-body">${paragraphs.map(p=>`<p class="article-para">${p}</p>`).join('')}</div>`;
}

// ── JOURNAL BODY ──────────────────────────────────────────────────────
function renderJournalBody() {
  return `
<div class="journal-wrap">
  <p class="journal-hint">מה עולה עכשיו? אין נכון או לא נכון.</p>
  <textarea class="journal-textarea" id="journal-text" placeholder="כתבי כאן...">${S.journalEntry}</textarea>
  <button class="journal-save-btn" id="journal-save">${S.journalSaved?'נשמר ✓':'שמירה'}</button>
</div>`;
}

// ── CHAT BODY ─────────────────────────────────────────────────────────
function renderChatBody(greeting, author, chatKey) {
  if (!S[chatKey] || S[chatKey].length === 0) {
    S[chatKey] = [{ id: 1, text: greeting, author }];
  }
  const isSupport = chatKey === 'supportChat';
  return `
<div class="chat-body-wrap">
  <div class="chat-messages" id="chat-messages-${chatKey}">
    ${S[chatKey].map(m => `
      <div class="chat-row ${m.me?'me':'them'}">
        <div class="chat-bubble ${m.me?'me':'them'}">
          ${!m.me ? `<p class="chat-author">${m.author||author}</p>` : ''}
          <p>${m.text}</p>
        </div>
      </div>`).join('')}
  </div>
  <div class="chat-input-row">
    ${isSupport ? `<button class="chat-phone-btn" id="show-phone-btn">${SVG.phone}</button>` : ''}
    <input class="chat-text-input" id="chat-input-${chatKey}" placeholder="כתבי כאן..." />
    <button class="chat-send-btn" data-chat-send="${chatKey}" data-author="${author}">${SVG.send}</button>
  </div>
</div>`;
}

const chatReplies = [
  'אני שומעת אותך. ספרי לי עוד.',
  'תודה ששיתפת איתי. זה לוקח אומץ.',
  'מה את מרגישה בגוף כשאת חושבת על זה?',
  'זה נשמע באמת קשה. את לא לבד בזה.',
  'אנחנו יכולות לנשום יחד רגע. את בטוחה כאן.',
  'מה היה עוזר לך הכי הרבה ברגע הזה?',
];

function sendChatMessage(chatKey, author) {
  const input = document.getElementById(`chat-input-${chatKey}`);
  if (!input || !input.value.trim()) return;
  const text = input.value.trim();
  input.value = '';
  if (!S[chatKey]) S[chatKey] = [];
  S[chatKey].push({ id: Date.now(), text, me: true });
  renderChatInPlace(chatKey, author);
  setTimeout(() => {
    S[chatKey].push({ id: Date.now()+1, text: chatReplies[Math.floor(Math.random()*chatReplies.length)], author });
    renderChatInPlace(chatKey, author);
  }, 900 + Math.random()*700);
}

function renderChatInPlace(chatKey, author) {
  const container = document.getElementById(`chat-messages-${chatKey}`);
  if (!container) return;
  container.innerHTML = S[chatKey].map(m => `
    <div class="chat-row ${m.me?'me':'them'}">
      <div class="chat-bubble ${m.me?'me':'them'}">
        ${!m.me ? `<p class="chat-author">${m.author||author}</p>` : ''}
        <p>${m.text}</p>
      </div>
    </div>`).join('');
  container.scrollTop = container.scrollHeight;
}

// ── COMMUNITY TAB ─────────────────────────────────────────────────────
const groups = [
  { id:'morning', name: ()=>S.dark?'מעגל לילה':'מעגל בוקר', members:24, desc:()=>S.dark?'שיתוף קצר ורגוע לסיום היום':'שיתוף קצר ורגוע לפתיחת היום', tint:'tint-green' },
  { id:'war',     name: ()=>'אחרי המלחמה', members:156, desc:()=>'קהילה לפגועי טראומה ומשפחותיהם', tint:'tint-blue'  },
  { id:'mothers', name: ()=>'אמהות',        members:89,  desc:()=>'תמיכה הדדית לאמהות בהתמודדות',   tint:'tint-peach' },
  { id:'sleep',   name: ()=>'נשימות לילה', members:67, desc:()=>'מרחב חם לרגעים שבין ערות לשינה', tint:'tint-light' },
];

const joinableGroups = [
  { id:'anxiety', name:'מרחב שקט', members:203, desc:'מקום בטוח לנשום, להרגיש ולהיות', tint:'tint-blue' },
  { id:'fears',   name:'עבודה עם פחדים', members:91, desc:'מרחב לעיבוד פחדים בצוותא', tint:'tint-green' },
  { id:'body',    name:'גוף ונפש', members:134, desc:'חיבור בין גוף לנפש — תנועה ונשימה', tint:'tint-peach' },
];

function renderCommunityTab() {
  const isMine = S.communityTab === 'mine';
  return `
<div class="tab-content">
  <!-- Sub-tabs -->
  <div class="comm-tabs">
    <button class="comm-tab ${isMine?'active':''}" id="comm-mine">הקהילות שלי</button>
    <button class="comm-tab ${!isMine?'active':''}" id="comm-join">הצטרפות לקהילה</button>
  </div>

  <p class="community-hint">קהילות אנונימיות ובטוחות, מנוהלות ע״י מטפלים מוסמכים.</p>

  ${isMine ? [
      ...groups.map(g => ({ id:g.id, name:g.name(), desc:g.desc(), members:g.members, tint:g.tint })),
      ...joinableGroups.filter(g => S.joinedGroups[g.id])
    ].map(g => `
    <button class="group-card" data-group="${g.id}">
      <div class="group-icon ${g.tint}">${SVG.usersGroup}</div>
      <div class="group-text">
        <p class="group-name">${g.name}</p>
        <p class="group-desc">${g.desc}</p>
        <p class="group-members">${g.members} חברות פעילות</p>
      </div>
    </button>`).join('') : joinableGroups.map(g => `
    <div class="group-card join-card">
      <div class="group-icon ${g.tint}">${SVG.usersGroup}</div>
      <div class="group-text" style="flex:1">
        <p class="group-name">${g.name}</p>
        <p class="group-desc">${g.desc}</p>
        <p class="group-members">${g.members} חברות פעילות</p>
      </div>
      <button class="join-btn ${S.joinedGroups[g.id]?'joined':''}" data-join="${g.id}">
        ${S.joinedGroups[g.id]?'✓ הצטרפת':'הצטרפות'}
      </button>
    </div>`).join('')}
</div>`;
}

// ── GROUP CHAT SCREEN ─────────────────────────────────────────────────
function renderGroupChatScreen() {
  const g = S.activeGroup;
  const key = `group_${g.id}`;
  if (!S[key]) {
    S[key] = [
      { id:1, author:'מנחה · יעל', text:`ברוכות הבאות ל"${g.name}". זה מרחב בטוח. שתפו במה שמרגיש נכון.` },
      { id:2, author:'ש.',         text:'היה לי לילה קשה. נשימות עזרו קצת.' },
      { id:3, author:'ר.',         text:'מחבקת. גם אצלי. תודה ששיתפת.' },
    ];
  }
  return `
<div class="main-screen">
  <div class="group-chat-screen" style="padding-top:12px">
    <div class="group-chat-header">
      <button class="back-btn" data-back="activeGroup">${SVG.arrowR}</button>
      <div class="group-icon ${g.tint}" style="width:40px;height:40px">${SVG.usersGroup}</div>
      <div style="flex:1">
        <p style="font-size:14px;font-weight:500;color:var(--foreground)">${g.name}</p>
        <p style="font-size:11px;color:var(--muted-fg)">${g.members} חברות · אנונימי</p>
      </div>
    </div>

    <div class="group-chat-messages" id="group-chat-msg-${g.id}">
      ${S[key].map(m => `
        <div class="chat-row ${m.me?'me':'them'}">
          <div class="chat-bubble ${m.me?'me':'them'}">
            ${!m.me ? `<p class="chat-author">${m.author}</p>` : ''}
            <p>${m.text}</p>
          </div>
        </div>`).join('')}
    </div>

    <div class="group-chat-input-row">
      <input class="chat-text-input" id="group-input-${g.id}" placeholder="כתבי כאן... בקצב שלך" />
      <button class="chat-send-btn" data-group-send="${g.id}">${SVG.send}</button>
    </div>
  </div>
  <nav class="bottom-nav">
    ${navItem('home',SVG.home,'בית')}
    ${navItem('community',SVG.users,'קהילה')}
    ${navItem('tools',SVG.book,'כלים')}
    ${navItem('profile',SVG.user,'פרופיל')}
  </nav>
</div>`;
}

function getContextualReply(userText) {
  const t = userText;

  const patterns = [
    {
      test: /פחד|מפחד|מפחידה|חרדה|לחץ|דאגה|מודאגת|חרד/,
      replies: [
        { author:'מנחה · יעל', text:'הפחד הזה מוכר לי. נסי להניח יד על הלב ולנשום לאט — הגוף שומע אותך.' },
        { author:'ש.', text:'גם אני מכירה את הפחד הזה. כאן יחד, זה קצת יותר קל.' },
        { author:'ר.', text:'כשאני מפחדת אני מזכירה לעצמי: הרגע הזה יעבור. שולחת חום אלייך.' },
      ]
    },
    {
      test: /עצובה|עצב|בוכה|בכי|דיכאון|בכיתי|עצבות|עצוב/,
      replies: [
        { author:'מנחה · יעל', text:'העצב שלך לגיטימי. כאן מותר לבכות — זה לא חולשה, זה אומץ.' },
        { author:'ש.', text:'מחבקת אותך חזק. תני לעצמך להרגיש, גם את הכאב.' },
        { author:'ר.', text:'תודה שאמרת. עצב הוא אות שמשהו חשוב לך. אנחנו כאן איתך.' },
      ]
    },
    {
      test: /כועסת|כעס|עצבנות|עצבני|עצבנית|מתוסכלת|תסכול/,
      replies: [
        { author:'מנחה · יעל', text:'כעס הוא רגש לגיטימי לחלוטין. מה עורר אותו עכשיו?' },
        { author:'ש.', text:'גם לי יש רגעים כאלה. לפעמים לצרוח בכרית עוזר. :)' },
        { author:'ר.', text:'הכעס שלך מובן. שולחת הבנה ורוגע.' },
      ]
    },
    {
      test: /לא יכולה לישון|אין שינה|ניסיתי לישון|לילה קשה|ערה|ישנה|שינה/,
      replies: [
        { author:'מנחה · יעל', text:'לילות קשים מיוחדים במינם. נסי נשימת 4-7-8: שאפי 4, החזיקי 7, נשפי 8.' },
        { author:'ש.', text:'גם אני ערה לפעמים בלילה. כיף שיש לנו קבוצה גם בשעות כאלה.' },
        { author:'ר.', text:'הגוף שלך עובד קשה אפילו כשאת ערה. תני לו רחמים.' },
      ]
    },
    {
      test: /פלאשבק|זיכרון|חזר|חוזר|עבר|טראומה|אירוע/,
      replies: [
        { author:'מנחה · יעל', text:'פלאשבקים הם תגובה נורמלית למצב לא נורמלי. נסי לעגן את עצמך — 5 דברים שאת רואה עכשיו.' },
        { author:'ש.', text:'אני מבינה. זה ממש קשה כשזה מגיע. אנחנו כאן איתך ברגע הזה.' },
        { author:'ר.', text:'הגוף שלך מנסה לעבד. תני לו זמן. שולחת אהבה.' },
      ]
    },
    {
      test: /לבד|בדידות|בודדה|אין לי|אף אחד|מרגישה שאף/,
      replies: [
        { author:'מנחה · יעל', text:'בדידות כואבת מאוד. ועדיין — אנחנו כאן, ואת לא לבד עכשיו.' },
        { author:'ש.', text:'גם אני הרגשתי ככה. לפעמים הקבוצה הזאת היא הדבר היחיד שעוזר.' },
        { author:'ר.', text:'אנחנו איתך. ממש כאן, ברגע הזה. מחבקת אותך.' },
      ]
    },
    {
      test: /עייפה|עייפות|מותשת|אין כוח|תשישה|אמרתי נמאס/,
      replies: [
        { author:'מנחה · יעל', text:'עייפות עמוקה היא חלק מהתהליך. הגוף שלך מבקש מנוחה — האם יש משהו קטן שמרגיע אותך?' },
        { author:'ש.', text:'אני מכירה את העייפות הזאת. לפעמים מספיק לשכב ולנשום.' },
        { author:'ר.', text:'תני לעצמך רשות לנוח. זה לא חולשה, זה הדבר הנכון עכשיו.' },
      ]
    },
    {
      test: /נשימה|נשמתי|לנשום|נשיפה|שאפתי/,
      replies: [
        { author:'מנחה · יעל', text:'כל כך טוב שמצאת את הנשימה. היא תמיד שם בשבילך.' },
        { author:'ש.', text:'נשימה עמוקה עשתה לי ניסים. שמחה שזה עוזר גם לך.' },
        { author:'ר.', text:'הגוף שלך יודע מה לעשות. הנשימה היא הכפתור הפנימי.' },
      ]
    },
    {
      test: /תודה|מודה|אסירת תודה|עזרתם|עזרה|עוזר/,
      replies: [
        { author:'מנחה · יעל', text:'זה ממש מרגש לשמוע. אנחנו גדלות יחד מכל שיתוף.' },
        { author:'ש.', text:'גם את עוזרת לנו רק בכך שאת כאן ומשתפת.' },
        { author:'ר.', text:'הלב שלנו פתוח אלייך תמיד. שמחה שאת כאן.' },
      ]
    },
    {
      test: /טוב יותר|השתפר|מרגישה טוב|עברתי|הצלחתי|ניצחתי/,
      replies: [
        { author:'מנחה · יעל', text:'כל כך שמחה לשמוע! כל צעד קטן הוא ניצחון אמיתי.' },
        { author:'ש.', text:'וואו, זה מעורר השראה לכולנו! ממש שמחה בשבילך.' },
        { author:'ר.', text:'ראיתי אותך מאז שהגעת — הצמיחה שלך ברורה. ❤️' },
      ]
    },
    {
      test: /לא יודעת|מבולבלת|לא מבינה|אבודה|מה לעשות/,
      replies: [
        { author:'מנחה · יעל', text:'בלבול הוא חלק מהדרך. אין צורך לדעת הכל עכשיו. מה מרגיש נכון לרגע הזה?' },
        { author:'ש.', text:'גם אני לא תמיד יודעת. לפעמים מספיק להיות כאן ולנשום.' },
        { author:'ר.', text:'את לא חייבת תשובות עכשיו. פשוט להיות — זה גם מספיק.' },
      ]
    },
  ];

  for (const p of patterns) {
    if (p.test.test(t)) {
      return p.replies[Math.floor(Math.random() * p.replies.length)];
    }
  }

  // Default — generic empathetic responses
  const defaults = [
    { author:'מנחה · יעל', text:'תודה שחלקת איתנו. הרגשות שלך נכונים — אנחנו כאן ושומעות.' },
    { author:'ש.', text:'מחבקת אותך מכאן. תמשיכי לכתוב אם זה עוזר.' },
    { author:'ר.', text:'את לא לבד. אנחנו איתך ברגע הזה.' },
    { author:'מנחה · יעל', text:'אנחנו כאן, שומעות ולא שופטות. תגידי עוד אם בא לך.' },
  ];
  return defaults[Math.floor(Math.random() * defaults.length)];
}

function sendGroupMessage(groupId) {
  const input = document.getElementById(`group-input-${groupId}`);
  if (!input || !input.value.trim()) return;
  const text = input.value.trim();
  input.value = '';
  const key = `group_${groupId}`;
  if (!S[key]) S[key] = [];
  S[key].push({ id: Date.now(), text, me: true });
  const container = document.getElementById(`group-chat-msg-${groupId}`);
  if (container) {
    container.innerHTML += `<div class="chat-row me"><div class="chat-bubble me"><p>${text}</p></div></div>`;
    container.scrollTop = container.scrollHeight;
  }
  const reply = getContextualReply(text);
  setTimeout(() => {
    S[key].push({ id: Date.now()+1, author: reply.author, text: reply.text });
    if (container) {
      container.innerHTML += `<div class="chat-row them"><div class="chat-bubble them"><p class="chat-author">${reply.author}</p><p>${reply.text}</p></div></div>`;
      container.scrollTop = container.scrollHeight;
    }
  }, 1000 + Math.random()*800);
}

// ── TOOLS TAB ─────────────────────────────────────────────────────────
const tools = [
  { id:'breath',   icon:SVG.wind,       name:'נשימות',      sub:'תרגילי נשימה מודרכים',  tint:'tint-green' },
  { id:'music',    icon:SVG.music,      name:'מוזיקה',      sub:'צלילים שמרגיעים',        tint:'tint-blue'  },
  { id:'journal',  icon:SVG.heart,      name:'יומן רגשי',   sub:'כתבי מה שעולה',          tint:'tint-peach' },
  { id:'med',      icon:SVG.leaf,       name:'מדיטציה',     sub:'רגעי שקט',               tint:'tint-light' },
  { id:'therapist',icon:SVG.chat,       name:'מטפל זמין',   sub:'צ׳אט עם מטפל/ת',         tint:'tint-green' },
  { id:'read',     icon:SVG.book,       name:'קריאה',       sub:'מאמרים קצרים',            tint:'tint-blue'  },
];

function renderToolsTab() {
  return `
<div class="tab-content">
  <p class="tools-hint">כלים פשוטים לרגעים קשים. בקצב שלך.</p>
  <div class="tools-grid">
    ${tools.map(t => `
      <button class="tool-card" data-tool="${t.id}">
        <div class="tool-icon ${t.tint}">${t.icon}</div>
        <span class="tool-name">${t.name}</span>
      </button>`).join('')}
  </div>
</div>`;
}

function renderToolDetail() {
  const t = S.activeTool;
  let body = '';
  if (t.id === 'breath')    body = renderBreathingBody();
  else if (t.id === 'music') body = renderPlayerBody('פלייליסט שקט להרגעה ולשינה.','Gymnopédie · נשימה ארוכה','https://upload.wikimedia.org/wikipedia/commons/2/25/Erik_Satie_-_Gymnopedie_No.3_-_Arr_for_soprano_saxophone_and_strings_-_David_Hernando_Vitores.ogg');
  else if (t.id === 'journal') body = renderJournalBody();
  else if (t.id === 'med')   body = renderPlayerBody('מדיטציה מודרכת קצרה — גלי ים להרגעה.','גלי ים · 5 דקות','https://upload.wikimedia.org/wikipedia/commons/f/f1/Oceanwavescrushing.ogg');
  else if (t.id === 'therapist') body = renderChatBody('היי, אני כאן בשבילך. ספרי מה עובר עלייך.','מטפלת · ד״ר רוני','therapistChat');
  else if (t.id === 'read')  body = renderArticleBody(['מאמרים קצרים שעוזרים להבין ולעבד.','בחרי קצב שמתאים לך — אפשר גם רק כותרת ולחזור מחר.']);
  return renderDetailScreen(t.name, t.sub, t.tint, t.icon, body, 'activeTool');
}

// ── PROFILE TAB ───────────────────────────────────────────────────────
function renderProfileTab() {
  return `
<div class="tab-content">
  <!-- Avatar card -->
  <div class="profile-card">
    <div class="profile-avatar-wrap">
      <img src="${S.dark ? 'avatar-dark.png' : 'avatar-light.png'}" alt="נועה"
        onerror="this.src='${S.dark ? 'avatar-light.png' : 'avatar-light.png'}'" />
    </div>
    <p class="profile-name">נועה</p>
    <p class="profile-since">חברה במרחב כבר 47 ימים</p>
  </div>

  <!-- Stats -->
  <div class="stats-grid">
    <div class="stat-card"><p class="stat-value">32</p><p class="stat-label">צ׳ק-אינים</p></div>
    <div class="stat-card"><p class="stat-value">58</p><p class="stat-label">תרגולים</p></div>
    <div class="stat-card"><p class="stat-value">12</p><p class="stat-label">ימים רצופים</p></div>
  </div>

  <!-- Menu items -->
  <button class="profile-menu-btn" data-profile-detail="report">
    <div class="profile-menu-icon">${SVG.chart}</div>
    <div>
      <p class="profile-menu-title">דו"ח מצב שבועי</p>
      <p class="profile-menu-sub">סיכום ההתקדמות והתרגולים שלך השבוע</p>
    </div>
  </button>
  <button class="profile-menu-btn" data-profile-detail="privacy">
    <div class="profile-menu-icon">${SVG.user}</div>
    <div>
      <p class="profile-menu-title">הגדרות פרטיות</p>
      <p class="profile-menu-sub">הזהות שלך אנונימית במלואה. את שולטת במה משותף.</p>
    </div>
  </button>
</div>`;
}

function renderProfileDetail() {
  const d = S.activeProfile;
  if (d === 'report')  return renderDetailScreen('דו"ח מצב שבועי','סיכום השבוע שלך','tint-green',SVG.chart, renderReportBody(),'activeProfile');
  if (d === 'privacy') return renderDetailScreen('הגדרות פרטיות','את שולטת במה שמשותף','tint-blue',SVG.user, renderPrivacyBody(),'activeProfile');
  return '';
}

function renderReportBars(items, maxVal) {
  const barColor = v => v/maxVal >= 0.8 ? 'var(--primary)' : v/maxVal >= 0.55 ? 'var(--secondary)' : 'var(--accent)';
  return `
    <div class="report-chart-bars">
      ${items.map(d=>`
        <div class="report-chart-col">
          <span class="chart-emoji">${d.emoji}</span>
          <div class="report-bar-track">
            <div class="report-bar-fill" style="height:${d.v/maxVal*100}%; background:${barColor(d.v)};"></div>
          </div>
          <span class="chart-day-label">${d.d}</span>
        </div>`).join('')}
    </div>
    <div class="chart-legend">
      <span class="legend-dot" style="background:var(--primary)"></span><span>טוב</span>
      <span class="legend-dot" style="background:var(--secondary)"></span><span>בינוני</span>
      <span class="legend-dot" style="background:var(--accent)"></span><span>קשה</span>
    </div>`;
}

function renderWeeklyReport() {
  const days = [
    {d:'א׳', v:3, emoji:'😐'},{d:'ב׳', v:4, emoji:'🙂'},
    {d:'ג׳', v:2, emoji:'😔'},{d:'ד׳', v:5, emoji:'😊'},
    {d:'ה׳', v:4, emoji:'🙂'},{d:'ו׳', v:3, emoji:'😐'},
    {d:'ש׳', v:5, emoji:'😊'},
  ];
  const avg = (days.reduce((s,d)=>s+d.v,0)/days.length).toFixed(1);
  return `
  <div class="report-header-card">
    <p class="report-week-label">15–21 ביוני 2025</p>
    <p class="report-headline">שבוע טוב, נועה 🌱</p>
    <p class="report-sub-headline">ממוצע מצב רוח: <strong>${avg}/5</strong> · מעל הממוצע שלך</p>
  </div>
  <div class="report-section-card">
    <p class="report-section-title">מצב רוח יומי</p>
    ${renderReportBars(days, 5)}
  </div>
  <div class="report-stats-grid">
    <div class="report-stat-card"><p class="report-stat-value">6/7</p><p class="report-stat-label">ימי צ׳ק-אין</p></div>
    <div class="report-stat-card"><p class="report-stat-value">11</p><p class="report-stat-label">תרגולים</p></div>
    <div class="report-stat-card"><p class="report-stat-value">${avg}</p><p class="report-stat-label">ממוצע מצב רוח</p></div>
    <div class="report-stat-card report-stat-highlight"><p class="report-stat-value">+18%</p><p class="report-stat-label">שיפור מהשבוע שעבר</p></div>
  </div>
  <div class="report-section-card">
    <p class="report-section-title">תובנות</p>
    <div class="report-insights-list">
      <div class="report-insight-row"><span class="insight-icon">🌬️</span><p class="insight-text">ימי נשימה — מצב רוח גבוה ב-40%</p></div>
      <div class="report-insight-row"><span class="insight-icon">💬</span><p class="insight-text">יום ג׳ היה הקשה — הקהילה עזרה</p></div>
      <div class="report-insight-row"><span class="insight-icon">⭐</span><p class="insight-text">הרגע הטוב: יום ד׳ ורבת 😊 · 5/5</p></div>
      <div class="report-insight-row"><span class="insight-icon">📈</span><p class="insight-text">3 שבועות ברציפות מעל 5 תרגולים</p></div>
    </div>
  </div>
  <div class="report-tip-card">
    <p class="report-tip-title">💡 לשבוע הבא</p>
    <p class="report-tip-text">הוסיפי תרגיל נשימה ביום שלישי — הוא הקשה ביותר, ועדיין ריק מתרגול.</p>
  </div>`;
}

function renderMonthlyReport() {
  const weeks = [
    {d:'שבוע 1', v:3.2, emoji:'😐'},{d:'שבוע 2', v:3.8, emoji:'🙂'},
    {d:'שבוע 3', v:4.1, emoji:'😊'},{d:'שבוע 4', v:3.9, emoji:'🙂'},
  ];
  const avg = (weeks.reduce((s,w)=>s+w.v,0)/weeks.length).toFixed(1);
  return `
  <div class="report-header-card">
    <p class="report-week-label">יוני 2025</p>
    <p class="report-headline">חודש של צמיחה 🌿</p>
    <p class="report-sub-headline">ממוצע מצב רוח: <strong>${avg}/5</strong> · מגמה עולה</p>
  </div>
  <div class="report-section-card">
    <p class="report-section-title">מצב רוח שבועי</p>
    ${renderReportBars(weeks, 5)}
  </div>
  <div class="report-stats-grid">
    <div class="report-stat-card"><p class="report-stat-value">24/30</p><p class="report-stat-label">ימי צ׳ק-אין</p></div>
    <div class="report-stat-card"><p class="report-stat-value">38</p><p class="report-stat-label">תרגולים</p></div>
    <div class="report-stat-card"><p class="report-stat-value">${avg}</p><p class="report-stat-label">ממוצע מצב רוח</p></div>
    <div class="report-stat-card report-stat-highlight"><p class="report-stat-value">+12%</p><p class="report-stat-label">שיפור מחודש שעבר</p></div>
  </div>
  <div class="report-section-card">
    <p class="report-section-title">תובנות</p>
    <div class="report-insights-list">
      <div class="report-insight-row"><span class="insight-icon">📈</span><p class="insight-text">שבוע 3 היה הטוב ביותר — 4.1/5 ממוצע</p></div>
      <div class="report-insight-row"><span class="insight-icon">🌬️</span><p class="insight-text">38 תרגולים — שיא אישי חודשי</p></div>
      <div class="report-insight-row"><span class="insight-icon">💬</span><p class="insight-text">פעילות קהילה עלתה ב-30% לעומת מאי</p></div>
      <div class="report-insight-row"><span class="insight-icon">🔥</span><p class="insight-text">רצף של 8 ימים ברציפות — הישג!</p></div>
    </div>
  </div>
  <div class="report-tip-card">
    <p class="report-tip-title">💡 ליולי</p>
    <p class="report-tip-text">הרגלי הנשימה עובדים — נסי להוסיף יומן רגשי פעמיים בשבוע.</p>
  </div>`;
}

function renderReportBody() {
  const isWeek = S.reportPeriod !== 'month';
  return `
<div class="report-wrap" id="report-wrap">
  <div class="report-period-tabs">
    <button class="report-period-tab ${isWeek?'active':''}" data-report-period="week">שבועי</button>
    <button class="report-period-tab ${!isWeek?'active':''}" data-report-period="month">חודשי</button>
  </div>
  <div class="report-period-dots">
    <span class="period-dot ${isWeek?'active':''}"></span>
    <span class="period-dot ${!isWeek?'active':''}"></span>
  </div>
  ${isWeek ? renderWeeklyReport() : renderMonthlyReport()}
</div>`;
}

function renderPrivacyBody() {
  const row = (label, desc, key) => `
    <button class="privacy-row" data-privacy="${key}">
      <div class="privacy-text">
        <p class="privacy-label">${label}</p>
        <p class="privacy-desc">${desc}</p>
      </div>
      <div class="toggle ${S[key]?'on':'off'}"><div class="toggle-thumb"></div></div>
    </button>`;
  return `
    ${row('זהות אנונימית','הכינוי שלך מוצג במקום שם אמיתי','privAnon')}
    ${row('שיתוף תובנות','המערכת משתמשת בנתונים אנונימיים לשיפור','privShare')}
    ${row('התראות','תזכורות עדינות לצ׳ק-אין יומי','privNotif')}`;
}

// ── EVENT BINDING ─────────────────────────────────────────────────────
let _clickH = null, _keyH = null;

function bindEvents() {
  const app = document.getElementById('app');

  // Remove previous listeners to prevent stacking on every render
  if (_clickH) app.removeEventListener('click', _clickH);
  if (_keyH)   app.removeEventListener('keydown', _keyH);

  app.addEventListener('click', _clickH = e => {
    const t = e.target.closest('[id],[data-tab],[data-mood],[data-home-detail],[data-back],[data-group],[data-tool],[data-profile-detail],[data-chat-send],[data-group-send],[data-privacy],[data-join],[data-report-period]');
    if (!t) return;

    // Report period switch
    if (t.dataset.reportPeriod) { S.reportPeriod = t.dataset.reportPeriod; render(); return; }

    // Auth events
    if (t.id === 'toggle-dark')   { S.dark = !S.dark; render(); return; }
    if (t.id === 'method-email')  { S.authMethod = 'email'; render(); return; }
    if (t.id === 'method-id')     { S.authMethod = 'id';    render(); return; }
    if (t.id === 'guest-btn')     { S.authed = true; render(); return; }
    if (t.id === 'signup-link')   { S.isSignup = true; render(); return; }
    if (t.id === 'auth-form')     return; // handled by submit

    // Nav tabs
    if (t.dataset.tab) {
      S.tab = t.dataset.tab;
      S.activeHome = null; S.activeTool = null; S.activeGroup = null; S.activeProfile = null;
      render(); return;
    }

    // Mood
    if (t.dataset.mood !== undefined) { S.moodSelected = parseInt(t.dataset.mood); render(); return; }

    // Home details
    if (t.dataset.homeDetail) { S.activeHome = t.dataset.homeDetail; playerState = {playing:false,progress:0,duration:0}; breathState = {active:false,phase:'idle',count:0,totalSeconds:0}; render(); return; }

    // Back
    if (t.dataset.back) {
      const key = t.dataset.back;
      S[key] = null;
      if (key === 'activeHome' || key === 'activeTool') { stopBreathing(); stopPodcast(); playerState.playing = false; if(playerAudio){ playerAudio.pause(); playerAudio=null; } }
      render(); return;
    }

    // Community sub-tabs
    if (t.id === 'comm-mine') { S.communityTab = 'mine'; render(); return; }
    if (t.id === 'comm-join') { S.communityTab = 'join'; render(); return; }

    // Join a community
    if (t.dataset.join) {
      const id = t.dataset.join;
      S.joinedGroups[id] = true;
      // Remove the card from the join list immediately (no full re-render)
      const card = t.closest('.join-card');
      if (card) card.remove();
      return;
    }

    // Groups
    if (t.dataset.group) {
      const id = t.dataset.group;
      const fromGroups = groups.find(g=>g.id===id);
      const fromJoin   = joinableGroups.find(g=>g.id===id);
      if (fromGroups) S.activeGroup = { id:fromGroups.id, name:fromGroups.name(), desc:fromGroups.desc(), members:fromGroups.members, tint:fromGroups.tint };
      else if (fromJoin) S.activeGroup = { id:fromJoin.id, name:fromJoin.name, desc:fromJoin.desc, members:fromJoin.members, tint:fromJoin.tint };
      S.tab='community'; render(); return;
    }

    // Tools
    if (t.dataset.tool) { S.activeTool = tools.find(to=>to.id===t.dataset.tool); playerState={playing:false,progress:0,duration:0}; breathState={active:false,phase:'idle',count:4,cycles:0}; S.tab='tools'; render(); return; }

    // Profile details
    if (t.dataset.profileDetail) { S.activeProfile = t.dataset.profileDetail; render(); return; }

    // Phone number — appears as a soft chat message from the volunteer
    if (t.id === 'show-phone-btn') {
      const container = document.getElementById('chat-messages-supportChat');
      if (!container) return;
      t.disabled = true;
      t.style.opacity = '0.4';
      const msg = document.createElement('div');
      msg.className = 'chat-row them';
      msg.innerHTML = `
        <div class="chat-bubble them phone-info-bubble">
          <p class="chat-author">מתנדבת · נועם</p>
          <p style="margin-bottom:8px">אם תרצי לדבר ישירות, אנחנו כאן:</p>
          <div class="phone-inline-card">
            <span class="phone-inline-number">1-800-800-200</span>
            <span class="phone-inline-note">24/7 · חינמי · אנונימי</span>
          </div>
        </div>`;
      container.appendChild(msg);
      container.scrollTop = container.scrollHeight;
      return;
    }

    // Chat send
    if (t.dataset.chatSend) { sendChatMessage(t.dataset.chatSend, t.dataset.author); return; }

    // Group send
    if (t.dataset.groupSend) { sendGroupMessage(t.dataset.groupSend); return; }

    // Privacy toggles
    if (t.dataset.privacy) {
      const key = t.dataset.privacy;
      S[key] = !S[key];
      const toggle = t.querySelector('.toggle');
      const thumb  = t.querySelector('.toggle-thumb');
      if (toggle) { toggle.className = `toggle ${S[key]?'on':'off'}`; }
      return;
    }

    // Breathing — click circle to start, click stop button to stop
    if (t.id === 'breath-circle' || t.closest('#breath-circle')) {
      if (!breathState.active) startBreathing();
      return;
    }
    if (t.id === 'breath-stop') { stopBreathing(); return; }

    // Podcast toggle
    if (t.id === 'pod-toggle') { togglePodcast(); return; }

    // Player toggle
    if (t.id === 'player-toggle') { togglePlayer(); return; }

    // Journal save
    if (t.id === 'journal-save') {
      S.journalEntry = document.getElementById('journal-text')?.value || '';
      S.journalSaved = true;
      t.textContent = 'נשמר ✓';
      return;
    }
  });

  // Auth form submit
  const form = document.getElementById('auth-form');
  if (form) {
    form.addEventListener('submit', e => { e.preventDefault(); S.authed = true; render(); });
  }

  // Journal text update
  const jt = document.getElementById('journal-text');
  if (jt) {
    jt.addEventListener('input', e => { S.journalEntry = e.target.value; S.journalSaved = false; const btn = document.getElementById('journal-save'); if(btn) btn.textContent='שמירה'; });
  }

  // Chat enter key
  app.addEventListener('keydown', _keyH = e => {
    if (e.key !== 'Enter' || e.shiftKey) return;
    const inp = e.target;
    if (inp.id && inp.id.startsWith('chat-input-')) {
      const key = inp.id.replace('chat-input-','');
      const btn = document.querySelector(`[data-chat-send="${key}"]`);
      if (btn) btn.click();
    }
    if (inp.id && inp.id.startsWith('group-input-')) {
      const gid = inp.id.replace('group-input-','');
      sendGroupMessage(gid);
    }
  });

  // Init player if on screen
  if (document.getElementById('player-audio')) initPlayer();

  // Scroll group chat to bottom
  const gcm = document.querySelector('.group-chat-messages');
  if (gcm) gcm.scrollTop = gcm.scrollHeight;
  const chatMsgs = document.querySelector('.chat-messages');
  if (chatMsgs) chatMsgs.scrollTop = chatMsgs.scrollHeight;

  // Swipe on report
  const reportEl = document.getElementById('report-wrap');
  if (reportEl) {
    let sx = 0;
    reportEl.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
    reportEl.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) < 50) return;
      if (dx < 0 && S.reportPeriod === 'week')  { S.reportPeriod = 'month'; render(); }
      if (dx > 0 && S.reportPeriod === 'month') { S.reportPeriod = 'week';  render(); }
    }, { passive: true });
  }
}

// ── INIT ──────────────────────────────────────────────────────────────
render();
