// Daylight — Sri Lanka Special Days & Countdown Logic
const $ = id => document.getElementById(id);
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const monthsSi = ['ජනවාරි', 'පෙබරවාරි', 'මාර්තු', 'අප්‍රේල්', 'මැයි', 'ජූනි', 'ජූලි', 'අගෝස්තු', 'සැප්තැම්බර්', 'ඔක්තෝබර්', 'නොවැම්බර්', 'දෙසැම්බර්'];

// Timezone: Asia/Colombo
const today = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Colombo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
}).format(new Date());

let year = Number(today.slice(0, 4));
let month = Number(today.slice(5, 7)) - 1;
let view = 'month';
let selectedDate = today;
let editingId = null;
let currentFilter = 'all';
let spotlightDate = null;
let heroClockTimer = null;
let active3DayEvent = null;

if (year < 2026 || year > 2028) {
  year = 2026;
  month = 10;
}

// Days Until calculation
const daysUntil = date => Math.round((Date.parse(date + 'T00:00:00Z') - Date.parse(today + 'T00:00:00Z')) / 86400000);

// Human readable bilingual countdown string
const countdown = date => {
  const n = daysUntil(date);
  if (n === 0) return '🎉 අදයි · Today is the day!';
  if (n === 1) return '⚡ හෙට · Tomorrow (1 day to go)';
  if (n === 2) return '⏳ තව දින 2යි · 2 days to go';
  if (n === 3) return '🔔 තව දින 3යි · 3 days to go (Alert active!)';
  if (n > 3) return `⏳ තව දින ${n}යි · ${n} days to go`;
  if (n === -1) return 'ඊයේ · Yesterday (1 day ago)';
  return `${Math.abs(n)} days ago · අවසන් වූ දිනයක්`;
};

// Sri Lankan 2026 Holiday Data (Public holidays and Poya days)
const holidayData = [
  ['01-03', 'Duruthu Poya · දුරුතු පුර පසළොස්වක පෝය'],
  ['01-15', 'Tamil Thai Pongal · තමිල් තෛපොංගල් දිනය'],
  ['02-01', 'Navam Poya · නවම් පුර පසළොස්වක පෝය'],
  ['02-04', 'National Day (Independence) · නිදහස් දිනය'],
  ['02-15', 'Maha Shivaratri · මහා ශිවරාත්‍රී දිනය'],
  ['03-02', 'Madin Poya · මැදින් පුර පසළොස්වක පෝය'],
  ['03-21', 'Eid al-Fitr (Ramazan) · ඊදුල් ෆිත්ර් දිනය'],
  ['04-01', 'Bak Poya · බක් පුර පසළොස්වක පෝය'],
  ['04-03', 'Good Friday · මහ සිකුරාදා'],
  ['04-13', 'Day prior to Sinhala & Tamil New Year · සිංහල හා දෙමළ අලුත් අවුරුදු පෙර දිනය'],
  ['04-14', 'Sinhala & Tamil New Year · සිංහල හා දෙමළ අලුත් අවුරුදු දිනය'],
  ['05-01', 'Adhi Vesak Poya · අධි වෙසක් පුර පසළොස්වක පෝය'],
  ['05-01', 'May Day · මැයි දිනය'],
  ['05-28', 'Eid al-Adha (Hajj) · හජ්ජි උත්සව දිනය'],
  ['05-30', 'Vesak Poya · වෙසක් පුර පසළොස්වක පෝය'],
  ['05-31', 'Day following Vesak Poya · වෙසක් අනු පෝය'],
  ['06-29', 'Poson Poya · පොසොන් පුර පසළොස්වක පෝය'],
  ['07-29', 'Esala Poya · ඇසළ පුර පසළොස්වක පෝය'],
  ['08-26', 'Milad-Un-Nabi (Prophet’s Birthday) · මිලාදුන් නබි දිනය'],
  ['08-27', 'Nikini Poya · නිකිණි පුර පසළොස්වක පෝය'],
  ['09-26', 'Binara Poya · බිනර පුර පසළොස්වක පෝය'],
  ['10-25', 'Vap Poya · වප් පුර පසළොස්වක පෝය'],
  ['11-08', 'Deepavali · දීපාවලී උත්සව දිනය'],
  ['11-24', 'Il Poya · ඉල් පුර පසළොස්වක පෝය'],
  ['12-23', 'Unduvap Poya · උඳුවප් පුර පසළොස්වක පෝය'],
  ['12-25', 'Christmas Day · නත්තල් දිනය']
];

// World & Post-Worthy Occasions
const worldData = [
  ['01-01', 'New Year’s Day · නව වසර'],
  ['02-14', 'Valentine’s Day · ආදරවන්තයින්ගේ දිනය'],
  ['03-08', 'Women’s Day · ජාත්‍යන්තර කාන්තා දිනය'],
  ['06-05', 'World Environment Day · ලෝක පරිසර දිනය'],
  ['09-27', 'World Tourism Day · ලෝක සංචාරක දිනය'],
  ['10-01', 'Children’s Day (Sri Lanka) · ළමා දිනය'],
  ['10-01', 'Elders’ Day · වැඩිහිටි දිනය'],
  ['10-06', 'Teachers’ Day (Sri Lankan schools) · ගුරු දිනය'],
  ['11-11', 'Remembrance Day (Poppy Day) · රණවිරු සැමරුම් දිනය'],
  ['12-24', 'Christmas Eve · නත්තල් සැඳෑව'],
  ['12-31', 'New Year’s Eve · වසර අවසානය']
];

// Mother's & Father's Day
function familyDays(y) {
  const nthSunday = (m, n) => 1 + (7 - new Date(y, m, 1).getDay()) % 7 + 7 * (n - 1);
  return [
    { date: key(y, 4, nthSunday(4, 2)), name: 'Mother’s Day · මව්වරුන්ගේ දිනය', cat: 'International' },
    { date: key(y, 5, nthSunday(5, 3)), name: 'Father’s Day · පියවරුන්ගේ දිනය', cat: 'International' }
  ];
}

// Escaping helper
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const key = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

// Personal special days from localStorage
let own = [];
try {
  own = JSON.parse(localStorage.getItem('daylight-dates') || '[]');
  if (!Array.isArray(own)) own = [];
} catch {
  own = [];
}

// Annual Fixed Sri Lankan Holidays (For 2026, 2027, 2028)
const annualFixedHolidays = [
  ['01-01', 'New Year’s Day · නව වසර'],
  ['01-15', 'Tamil Thai Pongal · තමිල් තෛපොංගල් දිනය'],
  ['02-04', 'National Day (Independence) · නිදහස් දිනය'],
  ['04-13', 'Day prior to Sinhala & Tamil New Year · සිංහල හා දෙමළ අලුත් අවුරුදු පෙර දිනය'],
  ['04-14', 'Sinhala & Tamil New Year · සිංහල හා දෙමළ අලුත් අවුරුදු දිනය'],
  ['05-01', 'May Day · මැයි දිනය'],
  ['11-11', 'Remembrance Day (Poppy Day) · රණවිරු සැමරුම් දිනය'],
  ['12-25', 'Christmas Day · නත්තල් දිනය']
];

// Get all combined events for active year
function all(targetYear = year) {
  let data = worldData.map(([d, n]) => ({ date: `${targetYear}-${d}`, name: n, cat: 'International' }));
  data.push(...familyDays(targetYear));
  if (targetYear === 2026) {
    data.push(...holidayData.map(([d, n]) => ({
      date: `2026-${d}`,
      name: n,
      cat: n.includes('Poya') || n.includes('පෝය') ? 'Poya' : 'Holiday'
    })));
  } else {
    data.push(...annualFixedHolidays.map(([d, n]) => ({
      date: `${targetYear}-${d}`,
      name: n,
      cat: 'Holiday'
    })));
  }
  return [...data, ...own.filter(e => e.date.startsWith(String(targetYear)))].sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name));
}

// Filtered events
function filtered() {
  const q = ($('search')?.value || '').toLowerCase().trim();
  const allEvents = all();

  return allEvents.filter(e => {
    if (currentFilter === '3days') {
      const d = daysUntil(e.date);
      if (!(d >= 0 && d <= 3)) return false;
    } else if (currentFilter !== 'all' && e.cat !== currentFilter) {
      return false;
    }

    if (q) {
      const matchName = e.name.toLowerCase().includes(q);
      const matchNote = (e.note || '').toLowerCase().includes(q);
      const matchDate = e.date.includes(q);
      if (!matchName && !matchNote && !matchDate) return false;
    }

    return true;
  });
}

// Toast helper
function toast(s) {
  const t = $('toast');
  if (!t) return;
  t.textContent = s;
  t.style.display = 'block';
  clearTimeout(window.tt);
  window.tt = setTimeout(() => {
    t.style.display = 'none';
  }, 4000);
}

// Save personal dates to localStorage and chrome.storage
function save() {
  try {
    localStorage.setItem('daylight-dates', JSON.stringify(own));
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ daylight_dates: own });
    }
    return true;
  } catch {
    toast('Storage full or unavailable. Export your dates to backup.');
    return false;
  }
}

// Sound Chime using Web Audio API
function playChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';

    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(659.25, now + 0.12); // E5
    osc.frequency.setValueAtTime(783.99, now + 0.24); // G5

    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.65);
  } catch (e) {}
}

// Lightweight Confetti Animation
function launchConfetti() {
  const canvas = $('confetti');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const palette = ['#216a50', '#f59e0b', '#8b5cf6', '#3b82f6', '#f97316', '#10b981', '#ec4899'];
  for (let i = 0; i < 85; i++) {
    particles.push({
      x: canvas.width / 2 + (Math.random() - 0.5) * 120,
      y: canvas.height * 0.35,
      r: Math.random() * 6 + 4,
      color: palette[Math.floor(Math.random() * palette.length)],
      vx: (Math.random() - 0.5) * 14,
      vy: Math.random() * -10 - 4,
      gravity: 0.3,
      tilt: Math.random() * 10 - 5,
      tiltAngle: 0,
      tiltSpeed: Math.random() * 0.08 + 0.04,
      opacity: 1
    });
  }

  let frames = 0;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = false;
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.tiltAngle += p.tiltSpeed;
      p.tilt = Math.sin(p.tiltAngle) * 10;
      p.opacity -= 0.009;

      if (p.opacity > 0 && p.y < canvas.height) {
        active = true;
        ctx.beginPath();
        ctx.lineWidth = p.r / 2;
        ctx.strokeStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.moveTo(p.x + p.tilt + p.r / 4, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 4);
        ctx.stroke();
      }
    });

    frames++;
    if (active && frames < 140) {
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  animate();
}

// --------------------------------------------------------------------------
// 3-Day Advance Notification System
// --------------------------------------------------------------------------

// Find events occurring in exactly 3 days
function get3DayEvents() {
  const currentEvents = all();
  return currentEvents.filter(e => daysUntil(e.date) === 3);
}

// Find events occurring within 3 days (0..3)
function getImminentEvents() {
  const currentEvents = all();
  return currentEvents.filter(e => {
    const d = daysUntil(e.date);
    return d >= 0 && d <= 3;
  }).sort((a, b) => a.date.localeCompare(b.date));
}

// Trigger browser native notification
function sendBrowserNotification(title, body) {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    try {
      const iconSvg = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="%23216a50"/><text x="50" y="68" font-size="52" text-anchor="middle" fill="%23f59e0b">✳</text></svg>`;
      const n = new Notification(title, {
        body,
        icon: iconSvg,
        tag: 'daylight-3day-alert'
      });
      n.onclick = () => {
        window.focus();
        n.close();
      };
    } catch (e) {
      console.warn('Notification error:', e);
    }
  }
}

// Show the Interactive 3-Day On-Screen Popup Modal
function showPopup3Day(event) {
  active3DayEvent = event;
  $('popup3daytitle').textContent = `🔔 ${event.name}`;
  const dObj = new Date(event.date + 'T12:00:00');
  const dFormatted = dObj.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const d = daysUntil(event.date);

  $('popup3daydate').textContent = `${dFormatted} · (${d === 3 ? 'තව දින 3කින් එළඹේ' : countdown(event.date)})`;
  $('popup3daydesc').textContent = `මෙම විශේෂ දිනයට තව දින ${d}ක් පමණි! දැන්ම සුබපැතුම්, post එකක් හෝ සැමරුම සැලසුම් කරගන්න.`;

  $('popup3day').style.display = 'flex';
  playChime();
}

function closePopup3Day() {
  $('popup3day').style.display = 'none';
}

// Top-Right Floating 3-Day Timeline Widget (Inside Daylight Calendar & Webpages)
function updateTopRightTimelineWidget(event) {
  const widget = $('daylight-topright-widget');
  if (!widget) return;

  if (!event || sessionStorage.getItem('daylight_tw_dismissed') === 'true') {
    widget.style.display = 'none';
    return;
  }

  const d = daysUntil(event.date);
  if (!(d >= 0 && d <= 3)) {
    widget.style.display = 'none';
    return;
  }

  $('daylight-tw-title').textContent = event.name;
  const dObj = new Date(event.date + 'T12:00:00');
  const dFormatted = dObj.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  $('daylight-tw-date').innerHTML = `📅 ${dFormatted} · <span style="color:#d97706;font-weight:700">${d === 0 ? 'Today! (අදයි)' : d === 3 ? 'In 3 Days! (තව දින 3යි)' : `In ${d} Days (තව දින ${d}යි)`}</span>`;

  // Update step timeline active nodes
  const s3 = $('daylight-tw-step3');
  const s2 = $('daylight-tw-step2');
  const s1 = $('daylight-tw-step1');
  const s0 = $('daylight-tw-step0');

  if (s3) s3.className = `daylight-tw-step ${d === 3 ? 'active' : d < 3 ? 'completed' : ''}`;
  if (s2) s2.className = `daylight-tw-step ${d === 2 ? 'active' : d < 2 ? 'completed' : ''}`;
  if (s1) s1.className = `daylight-tw-step ${d === 1 ? 'active' : d < 1 ? 'completed' : ''}`;
  if (s0) s0.className = `daylight-tw-step ${d === 0 ? 'active' : ''}`;

  widget.style.display = 'block';

  $('daylight-tw-close').onclick = () => {
    widget.style.display = 'none';
    sessionStorage.setItem('daylight_tw_dismissed', 'true');
  };
  $('daylight-tw-dismiss').onclick = () => {
    widget.style.display = 'none';
    sessionStorage.setItem('daylight_tw_dismissed', 'true');
  };
  $('daylight-tw-min').onclick = () => {
    widget.classList.toggle('minimized');
  };
  $('daylight-tw-view').onclick = () => {
    details(event.date);
  };
}

// Check and trigger notifications & update in-app alert UI
function checkAndTrigger3DayNotifications(isTest = false, specificEvent = null) {
  if (isTest) {
    const demoEvent = specificEvent || get3DayEvents()[0] || all().find(e => e.date >= today) || {
      name: 'Special Celebration Milestone · විශේෂ සැමරුම',
      date: '2026-11-11',
      cat: 'Personal'
    };

    showPopup3Day(demoEvent);
    updateTopRightTimelineWidget(demoEvent);
    sendBrowserNotification(
      `🔔 3-Day Reminder Demo: ${demoEvent.name}`,
      `"${demoEvent.name}" is coming up in 3 days on ${demoEvent.date}! (තව දින 3කින් පැමිණේ). Time to prepare!`
    );
    toast('🔔 3-Day Notification triggered!');
    return;
  }

  const exact3DayEvents = get3DayEvents();
  const imminent = getImminentEvents();

  // Update floating top-right timeline widget
  updateTopRightTimelineWidget(exact3DayEvents[0] || imminent[0]);

  // Update notification badge count
  const badge = $('notifbadge');
  const alertCountBox = $('alert3daycount');
  if (alertCountBox) alertCountBox.textContent = exact3DayEvents.length || imminent.length;

  if (badge) {
    const count = exact3DayEvents.length || imminent.length;
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
  }

  // Update In-App Alert Banner at top
  const alertBanner = $('alertbanner');
  if (alertBanner) {
    if (exact3DayEvents.length > 0) {
      const first = exact3DayEvents[0];
      $('alertbannertitle').textContent = `🔔 3-Day Alert: "${first.name}" is in 3 days!`;
      $('alertbannerdesc').textContent = `${first.date} දින පැවැත්වේ (තව දින 3යි). Start preparing your celebrations, posts, or wishes!`;
      $('alertbannerview').onclick = () => {
        details(first.date);
      };
      alertBanner.style.display = 'flex';
    } else if (imminent.length > 0 && !alertBanner.dataset.dismissed) {
      const first = imminent.find(e => daysUntil(e.date) > 0) || imminent[0];
      const d = daysUntil(first.date);
      $('alertbannertitle').textContent = d === 0 ? `🎉 Today: "${first.name}"!` : `🔔 Reminder: "${first.name}" is coming up in ${d} day${d > 1 ? 's' : ''}!`;
      $('alertbannerdesc').textContent = `${first.date} දින පැවැත්වේ (${countdown(first.date)}).`;
      $('alertbannerview').onclick = () => details(first.date);
      alertBanner.style.display = 'flex';
    } else {
      alertBanner.style.display = 'none';
    }
  }

  // If there is an event in 3 days, show the popup alert modal and send desktop notification
  if (exact3DayEvents.length > 0) {
    const first = exact3DayEvents[0];

    // Check if popup already shown this session
    const sessionKey = `daylight-popup-shown-${first.date}-${first.name}`;
    if (!sessionStorage.getItem(sessionKey)) {
      showPopup3Day(first);
      sessionStorage.setItem(sessionKey, 'true');
    }

    // Check storage to avoid desktop notification spam
    if ('Notification' in window && Notification.permission === 'granted') {
      let notifiedToday = [];
      try {
        notifiedToday = JSON.parse(localStorage.getItem(`daylight-notified-${today}`) || '[]');
      } catch {}

      const evKey = `${first.date}_${first.name}`;
      if (!notifiedToday.includes(evKey)) {
        sendBrowserNotification(
          `🔔 3 Days Left: ${first.name}`,
          `"${first.name}" is coming up in 3 days on ${first.date}! (තව දින 3කින් පැමිණේ).`
        );
        notifiedToday.push(evKey);
        try {
          localStorage.setItem(`daylight-notified-${today}`, JSON.stringify(notifiedToday));
        } catch {}
      }
    }
  }
}

// Request desktop notification permission
function requestNotificationPermission() {
  if (!('Notification' in window)) {
    toast('Your browser does not support desktop notifications. In-app alerts remain active.');
    return;
  }

  Notification.requestPermission().then(permission => {
    updateNotificationPermissionUI();
    if (permission === 'granted') {
      toast('🔔 Desktop notifications enabled! You will be alerted 3 days before special days.');
      sendBrowserNotification(
        '🔔 3-Day Alerts Enabled!',
        'Daylight will notify you 3 days before upcoming Sri Lankan holidays and personal special days.'
      );
      playChime();
      checkAndTrigger3DayNotifications();
    } else if (permission === 'denied') {
      toast('Notifications blocked in browser settings. In-app alerts will be displayed.');
    }
  });
}

// Update notification modal UI
function updateNotificationPermissionUI() {
  const permBox = $('notifpermbox');
  const permTitle = $('notifpermtitle');
  const permDesc = $('notifpermdesc');
  const enableBtn = $('notifenablebtn');
  if (!permBox || !enableBtn) return;

  if (!('Notification' in window)) {
    permTitle.textContent = 'Desktop Alerts Unsupported';
    permDesc.textContent = 'This browser does not support desktop notifications.';
    enableBtn.style.display = 'none';
    return;
  }

  if (Notification.permission === 'granted') {
    permTitle.textContent = '✓ Desktop Notifications Active';
    permDesc.textContent = 'You will receive 3-day advance alerts for all special days.';
    enableBtn.textContent = 'Active ✓';
    enableBtn.disabled = true;
    enableBtn.style.background = 'var(--green)';
  } else if (Notification.permission === 'denied') {
    permTitle.textContent = 'Notifications Blocked';
    permDesc.textContent = 'Please enable notifications in your browser address bar.';
    enableBtn.textContent = 'Blocked';
    enableBtn.disabled = true;
  } else {
    permTitle.textContent = 'Enable Desktop Notifications';
    permDesc.textContent = 'Get notified 3 days ahead, even when this tab is in the background.';
    enableBtn.textContent = 'Enable (සක්‍රිය කරන්න)';
    enableBtn.disabled = false;
  }
}

// Render notification center list
function renderNotificationList() {
  const listContainer = $('notiflist');
  if (!listContainer) return;

  const exact3 = get3DayEvents();
  const imminent = getImminentEvents();

  let html = '';

  if (exact3.length > 0) {
    html += '<div style="margin-bottom:8px;font-size:11px;font-weight:700;color:#92400e;">🔥 Coming up in EXACTLY 3 DAYS (දින 3කින්):</div>';
    exact3.forEach(e => {
      html += `
        <div class="notif-item urgent" role="button" tabindex="0" onclick="details('${e.date}'); $('notifmodal').close();">
          <div>
            <strong style="color:#92400e">🔔 ${esc(e.name)}</strong>
            <div class="small" style="color:#b45309">${e.date} · <b>In 3 Days (තව දින 3යි)</b></div>
          </div>
          <button style="font-size:11px;padding:4px 8px">View</button>
        </div>
      `;
    });
  }

  if (imminent.length > 0) {
    html += '<div style="margin:12px 0 6px;font-size:11px;font-weight:700;color:var(--muted)">Upcoming within 3 days:</div>';
    imminent.forEach(e => {
      const d = daysUntil(e.date);
      html += `
        <div class="notif-item" role="button" tabindex="0" onclick="details('${e.date}'); $('notifmodal').close();">
          <div>
            <strong>${esc(e.name)}</strong>
            <div class="small">${e.date} · <span class="countdown-pill ${d === 3 ? 'in-3d' : d === 0 ? 'today-pill' : ''}">${countdown(e.date)}</span></div>
          </div>
          <button style="font-size:11px;padding:4px 8px">View</button>
        </div>
      `;
    });
  } else {
    html += '<p class="small" style="text-align:center;padding:16px;">No upcoming special days in the next 3 days. Use the calendar to explore upcoming dates!</p>';
  }

  listContainer.innerHTML = html;
}

// Open Notification Center Modal
function openNotificationCenter() {
  updateNotificationPermissionUI();
  renderNotificationList();
  $('notifmodal').showModal();
}

// --------------------------------------------------------------------------
// Live Hero Countdown Clock
// --------------------------------------------------------------------------

function startLiveCountdown() {
  if (heroClockTimer) clearInterval(heroClockTimer);
  updateHeroClock();
  heroClockTimer = setInterval(updateHeroClock, 1000);
}

function updateHeroClock() {
  const allEvents = all();
  let targetEvent = null;

  if (spotlightDate) {
    targetEvent = allEvents.find(e => e.date === spotlightDate);
  }
  if (!targetEvent) {
    targetEvent = allEvents.find(e => e.date >= today) || allEvents[0];
  }
  if (!targetEvent) return;

  const targetDateStr = targetEvent.date;
  const daysDiff = daysUntil(targetDateStr);

  const targetTime = new Date(`${targetDateStr}T00:00:00+05:30`).getTime();
  const now = Date.now();
  const diffMs = targetTime - now;

  let days = 0, hours = 0, mins = 0, secs = 0;

  if (diffMs > 0) {
    days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
    mins = Math.floor((diffMs / 1000 / 60) % 60);
    secs = Math.floor((diffMs / 1000) % 60);
  }

  const pad = n => String(Math.max(0, n)).padStart(2, '0');
  if ($('clockdays')) $('clockdays').textContent = pad(days);
  if ($('clockhours')) $('clockhours').textContent = pad(hours);
  if ($('clockmins')) $('clockmins').textContent = pad(mins);
  if ($('clocksecs')) $('clocksecs').textContent = pad(secs);

  if ($('herotitle')) $('herotitle').textContent = targetEvent.name;

  if ($('herotext')) {
    if (daysDiff === 0) {
      $('herotext').textContent = 'Today is a little more special. අද දවස සතුටින් සමරමු!';
    } else if (daysDiff === 3) {
      $('herotext').textContent = `🔔 3-Day Warning: Only 3 days left until ${targetEvent.name}! Start getting ready today.`;
    } else if (daysDiff > 0) {
      $('herotext').textContent = `A moment worth remembering. ${new Date(targetDateStr + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} · Plan something special.`;
    } else {
      $('herotext').textContent = `Concluded on ${targetDateStr}. Explore other upcoming celebrations!`;
    }
  }

  if ($('herocount')) {
    if (daysDiff === 0) {
      $('herocount').innerHTML = '<span>🎉 Today is the celebration! · අද තමයි විශේෂ දිනය!</span>';
    } else if (daysDiff > 0) {
      $('herocount').innerHTML = `<span>⏳ <b>තව දින ${days}ක්, පැය ${hours}ක්, මිනිත්තු ${mins}ක් ඇත</b> · (${countdown(targetDateStr)})</span>`;
    } else {
      $('herocount').innerHTML = `<span>${countdown(targetDateStr)}</span>`;
    }
  }

  const pill3d = $('hero3daypill');
  if (pill3d) {
    pill3d.style.display = daysDiff === 3 ? 'inline-flex' : 'none';
  }

  const mIndex = Number(targetDateStr.slice(5, 7)) - 1;
  if ($('heromonth')) $('heromonth').textContent = months[mIndex].toUpperCase();
  if ($('heroday')) $('heroday').textContent = targetDateStr.slice(8);
}

function populateSpotlightSelector() {
  const sel = $('heroselector');
  if (!sel) return;

  const allEvents = all();
  const upcomingEvents = allEvents.filter(e => e.date >= today);
  const optionsSource = upcomingEvents.length ? upcomingEvents : allEvents;

  sel.innerHTML = optionsSource.map(e => {
    const d = daysUntil(e.date);
    const tag = d === 0 ? 'Today' : d === 3 ? '🔔 In 3 days' : d > 0 ? `In ${d}d` : 'Passed';
    return `<option value="${e.date}" ${e.date === spotlightDate ? 'selected' : ''}>${e.date.slice(5)} · ${esc(e.name.split('·')[0].trim())} (${tag})</option>`;
  }).join('');

  sel.onchange = () => {
    spotlightDate = sel.value;
    updateHeroClock();
    if (daysUntil(spotlightDate) === 0) launchConfetti();
  };
}

// --------------------------------------------------------------------------
// Quick Days Calculator (Rail)
// --------------------------------------------------------------------------

function initQuickDaysCalculator() {
  const calcInput = $('calcdate');
  if (!calcInput) return;

  if (!calcInput.value) {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 3);
    calcInput.value = nextWeek.toISOString().slice(0, 10);
  }

  function updateCalc() {
    const target = calcInput.value;
    if (!target) return;
    const diff = daysUntil(target);
    const numEl = $('calcnum');
    const subEl = $('calcsub');

    const targetDateObj = new Date(target + 'T12:00:00');
    const weekday = targetDateObj.toLocaleDateString('en-GB', { weekday: 'long' });
    const formattedDate = targetDateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    if (diff === 0) {
      numEl.textContent = 'TODAY · අදයි';
      subEl.textContent = `Today is ${weekday}, ${formattedDate}!`;
    } else if (diff === 3) {
      numEl.textContent = '03 DAYS (දින 3යි)';
      subEl.textContent = `🔔 In exactly 3 days on ${weekday}, ${formattedDate}!`;
    } else if (diff > 0) {
      numEl.textContent = `${diff} DAYS`;
      subEl.textContent = `තව දින ${diff}ක් ඇත · Falls on a ${weekday} (${formattedDate})`;
    } else {
      numEl.textContent = `${Math.abs(diff)} DAYS AGO`;
      subEl.textContent = `Occurred ${Math.abs(diff)} days ago on ${weekday}.`;
    }
  }

  calcInput.oninput = updateCalc;
  updateCalc();

  const setHeroBtn = $('calcsethero');
  if (setHeroBtn) {
    setHeroBtn.onclick = () => {
      const target = calcInput.value;
      if (!target) return;
      spotlightDate = target;
      updateHeroClock();
      toast(`🎯 Tracking countdown for ${target} in Hero!`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
  }

  const addHereBtn = $('calcaddhere');
  if (addHereBtn) {
    addHereBtn.onclick = () => {
      add(calcInput.value);
    };
  }
}

// --------------------------------------------------------------------------
// Add / Edit Form Reminder Preview Helper
// --------------------------------------------------------------------------

function updateFormReminderPreview() {
  const dateVal = $('date').value;
  const previewText = $('reminderpreviewtext');
  if (!dateVal || !previewText) return;

  const d = daysUntil(dateVal);
  const targetDateObj = new Date(dateVal + 'T12:00:00');

  // 3 days before calculation
  const remindDateObj = new Date(targetDateObj.getTime() - 3 * 86400000);
  const remindDateStr = remindDateObj.toISOString().slice(0, 10);
  const remindFormatted = remindDateObj.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

  if (d === 3) {
    previewText.textContent = `⚡ මෙම දිනයට තව ඇත්තේ දින 3ක් පමණි! Save කළ සැණින් notification එක ක්‍රියාත්මක වේ.`;
  } else if (d > 3) {
    previewText.textContent = `🔔 Notification දිනය: ${remindDateStr} (${remindFormatted}) — හරියටම දින 3කට පෙර ඔබට notification එකක් එවනු ලැබේ.`;
  } else if (d > 0) {
    previewText.textContent = `🔔 මෙම දිනයට තව දින ${d}ක් ඇත. Notification එක අදම ක්‍රියාත්මක වේ.`;
  } else if (d === 0) {
    previewText.textContent = `🎉 මෙම දිනය අද දිනයයි!`;
  } else {
    previewText.textContent = `⚠️ මෙම දිනය පසුගිය දිනයකි (${Math.abs(d)} days ago).`;
  }
}

// --------------------------------------------------------------------------
// Main Render Function
// --------------------------------------------------------------------------

function render() {
  const data = all();
  const items = filtered();
  const prefix = key(year, month, 1).slice(0, 7);

  $('year').value = year;
  $('monthtitle').textContent = view === 'year'
    ? `${year} at a glance · වසරේ බැල්ම`
    : view === 'personal'
      ? 'My special days · මගේ විශේෂ දින'
      : view === '3days'
        ? '🔔 3-Day Advance Alerts (දින 3ක මතක් කිරීම්)'
        : `${months[month]} ${year} · ${monthsSi[month]}`;

  $('toggle').textContent = view === 'year' ? 'Month view' : 'Year view';

  $('monthcount').textContent = data.filter(e => e.date.startsWith(prefix)).length;
  $('yearcount').textContent = data.length;
  $('owncount').textContent = own.length;

  document.querySelectorAll('[data-view]').forEach(b => {
    b.classList.toggle('active', b.dataset.view === view);
  });
  if ($('nav3days')) $('nav3days').classList.toggle('active', view === '3days');

  document.querySelectorAll('.filter-pills .pill-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.pill === currentFilter);
  });

  populateSpotlightSelector();
  updateHeroClock();

  let html = year !== 2026
    ? '<div class="notice" style="padding:14px;font-size:12px;background:#fff8e6;border-radius:10px;margin:12px;border:1px solid #fed7aa;color:#9a3412;">International days and your custom dates only. Sri Lankan public holidays for this year have not been loaded.</div>'
    : '';

  if (view === 'year') {
    html += '<div class="yeargrid">';
    for (let m = 0; m < 12; m++) {
      html += `<div class="monthmini"><h4>${months[m]} · ${monthsSi[m]}</h4><div class="minigrid">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(x => `<span style="color:#8f9d8f;font-weight:700">${x}</span>`).join('')}`;
      const start = (new Date(year, m, 1).getDay() + 6) % 7;
      html += '<span></span>'.repeat(start);
      const totalDays = new Date(year, m + 1, 0).getDate();
      for (let d = 1; d <= totalDays; d++) {
        const dateStr = key(year, m, d);
        const ev = items.filter(e => e.date === dateStr);
        const is3d = daysUntil(dateStr) === 3;
        const markClass = is3d ? 'marked in3d' : ev.length ? 'marked' : '';
        const titleText = ev.map(e => e.name).join(', ') || dateStr;
        html += `<span role="button" tabindex="0" data-date="${dateStr}" class="${markClass}" title="${esc(titleText)} (${countdown(dateStr)})">${d}</span>`;
      }
      html += '</div></div>';
    }
    html += '</div>';
  } else if (view === '3days') {
    const list = all().filter(e => {
      const d = daysUntil(e.date);
      return d >= 0 && d <= 3;
    });

    html += '<div class="list">';
    html += '<div style="margin-bottom:14px;padding:12px 14px;background:#fffbeb;border:1px solid #fde68a;border-radius:10px;color:#92400e;"><strong>🔔 3-Day Advance Alert View</strong><br><span class="small">Special days happening within the next 3 days. Use these to plan your promotions, gifts, and posts!</span></div>';
    if (list.length) {
      html += list.map(e => {
        const d = daysUntil(e.date);
        return `
          <button class="list-item-btn" data-date="${e.date}">
            <div>
              <strong style="font-size:14px;">${d === 3 ? '🔔 ' : d === 0 ? '🎉 ' : '⏳ '}${esc(e.name)}</strong>
              <div class="small" style="color:var(--muted);margin-top:2px;">Category: <b>${esc(e.cat)}</b></div>
            </div>
            <div style="text-align:right;">
              <span class="countdown-pill ${d === 3 ? 'in-3d' : d === 0 ? 'today-pill' : ''}">${countdown(e.date)}</span>
              <span class="small" style="display:block;margin-top:3px;">${e.date}</span>
            </div>
          </button>
        `;
      }).join('');
    } else {
      html += '<div class="notice">No special days occurring in the next 3 days. Try browsing Month View or adding your own special day!</div>';
    }
    html += '</div>';
  } else if (view === 'personal' || $('search').value) {
    const list = view === 'personal' ? items.filter(e => e.cat === 'Personal') : items;
    html += '<div class="list">' + (list.length
      ? list.map(e => {
        const d = daysUntil(e.date);
        return `
          <button class="list-item-btn" data-date="${e.date}">
            <div>
              <strong style="font-size:14px">${esc(e.name)}</strong>
              <div class="small" style="color:var(--muted)">Category: <b>${esc(e.cat)}</b> ${e.remind3 ? '· 🔔 3-Day Alert On' : ''}</div>
            </div>
            <div style="text-align:right">
              <span class="countdown-pill ${d === 3 ? 'in-3d' : d === 0 ? 'today-pill' : ''}">${countdown(e.date)}</span>
              <span class="small" style="display:block;margin-top:3px">${e.date}</span>
            </div>
          </button>
        `;
      }).join('')
      : '<div class="notice">No matching days found. Add a personal special day or adjust your search filter.</div>') + '</div>';
  } else {
    html += '<div class="week">' + ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(d => `<span>${d}</span>`).join('') + '</div><div class="grid">';
    const start = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    html += '<div class="day empty"></div>'.repeat(start);

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = key(year, month, d);
      const dayEvents = items.filter(e => e.date === dateStr);
      const isToday = dateStr === today;
      const dUntil = daysUntil(dateStr);
      const is3Days = dUntil === 3;

      const dayClass = `day ${isToday ? 'today' : ''} ${is3Days ? 'in-3days' : ''}`;

      html += `<div class="${dayClass}" tabindex="0" role="button" aria-label="${dateStr}" data-date="${dateStr}">`;
      html += `<div class="day-header">`;
      html += `<span class="num">${d}</span>`;

      if (isToday) {
        html += `<span class="day-pill-tag tag-today">TODAY</span>`;
      } else if (is3Days) {
        html += `<span class="day-pill-tag tag-3days">🔔 IN 3D</span>`;
      }
      html += `</div>`;

      dayEvents.forEach(e => {
        const icon = e.cat === 'Poya' ? '🌕' : e.cat === 'Holiday' ? '🇱🇰' : e.cat === 'International' ? '🌐' : '💖';
        const miniDays = dUntil === 0 ? 'Today' : dUntil > 0 ? `In ${dUntil}d` : '';
        html += `
          <div class="event ${e.cat}" title="${esc(e.name)} (${countdown(e.date)})">
            <span>${icon} ${esc(e.name.split('·')[0].trim())}</span>
            ${miniDays ? `<span class="event-mini-countdown">${miniDays}</span>` : ''}
          </div>
        `;
      });

      html += `</div>`;
    }

    html += '<div class="day empty"></div>'.repeat((7 - (start + daysInMonth) % 7) % 7) + '</div>';
  }

  $('board').innerHTML = html;

  let upcoming = items.filter(e => e.date >= today).slice(0, 5);
  $('railtitle').innerHTML = `<span>${upcoming.length ? 'Coming up next' : 'Selected year'}</span><span style="color:var(--green)">↗</span>`;
  if (!upcoming.length) upcoming = items.slice(0, 5);

  $('upcoming').innerHTML = upcoming.map(e => {
    const d = daysUntil(e.date);
    const mName = months[Number(e.date.slice(5, 7)) - 1].slice(0, 3).toUpperCase();
    const dNum = e.date.slice(8);
    const icon = e.cat === 'Poya' ? '🌕' : e.cat === 'Holiday' ? '🇱🇰' : e.cat === 'International' ? '🌐' : '💖';

    return `
      <div class="upitem" role="button" tabindex="0" data-date="${e.date}">
        <div class="datebox">
          <small>${mName}</small>
          <b>${dNum}</b>
        </div>
        <div class="upitem-content">
          <strong>${icon} ${esc(e.name)}</strong>
          <p>${e.date}</p>
          <span class="countdown-pill ${d === 3 ? 'in-3d' : d === 0 ? 'today-pill' : ''}">${countdown(e.date)}</span>
        </div>
      </div>
    `;
  }).join('') || '<p class="small">No matching special days found.</p>';

  checkAndTrigger3DayNotifications();
}

// --------------------------------------------------------------------------
// Details Modal
// --------------------------------------------------------------------------

function details(date) {
  selectedDate = date;
  const dateObj = new Date(date + 'T12:00:00');
  $('detailtitle').textContent = dateObj.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const d = daysUntil(date);
  const daysNumEl = $('detaildaysnum');
  const daysSubEl = $('detaildayssub');

  if (d === 0) {
    daysNumEl.textContent = '🎉 TODAY!';
    daysSubEl.textContent = 'Today is the celebration! අද දවස සතුටින් සමරමු.';
  } else if (d === 3) {
    daysNumEl.textContent = '🔔 3 DAYS TO GO';
    daysSubEl.textContent = 'තව දින 3කින් එළඹේ! 3-Day Alert is active.';
  } else if (d > 0) {
    daysNumEl.textContent = `⏳ ${d} DAYS LEFT`;
    daysSubEl.textContent = `තව දින ${d}ක් ඉතිරිව ඇත · ${countdown(date)}`;
  } else {
    daysNumEl.textContent = `${Math.abs(d)} DAYS AGO`;
    daysSubEl.textContent = `අවසන් වූ දිනයක් (${countdown(date)})`;
  }

  const events = all().filter(e => e.date === date);

  $('detailbody').innerHTML = events.map(e => `
    <div class="detail-item">
      <span class="label" style="color:var(--green)">${e.cat} ${e.remind3 ? '· 🔔 3-Day Reminder Set' : ''}</span>
      <h3>${esc(e.name)}</h3>
      <p style="margin:6px 0;line-height:1.6">${esc(e.note || (
        e.cat === 'Poya'
          ? 'A full moon Poya observance in Sri Lanka. පසළොස්වක පෝය දිනයක්.'
          : e.cat === 'Holiday'
            ? 'Official Sri Lankan Public Holiday. රජයේ නිවාඩු දිනයක්.'
            : e.cat === 'International'
              ? 'A post-worthy occasion for Sri Lankan audiences. සමාජ මාධ්‍ය සඳහා ගැළපෙන දිනයක්.'
              : 'A special moment marked on your personal calendar.'
      ))}</p>
      ${e.id ? `
        <div style="margin-top:10px;display:flex;gap:8px;">
          <button data-edit="${esc(e.id)}">Edit</button>
          <button data-delete="${esc(e.id)}" style="color:#b91c1c">Delete</button>
        </div>
      ` : ''}
    </div>
  `).join('') || '<p class="small" style="padding:14px 0;">Nothing planned on this date yet. Make this day your own!</p>';

  // Button to trigger 3-Day Alert for this specific event
  const test3DayBtn = $('detailtest3daybtn');
  if (test3DayBtn) {
    test3DayBtn.onclick = () => {
      const currentEv = events[0] || { name: 'Special Day', date: date, cat: 'Personal' };
      $('detail').close();
      checkAndTrigger3DayNotifications(true, currentEv);
    };
  }

  const spotlightBtn = $('detailsetspotlight');
  if (spotlightBtn) {
    spotlightBtn.onclick = () => {
      spotlightDate = date;
      updateHeroClock();
      $('detail').close();
      toast(`🎯 Tracking countdown for ${date} in Hero!`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
  }

  $('detail').showModal();
}

// --------------------------------------------------------------------------
// Add / Edit Modal
// --------------------------------------------------------------------------

function add(date = today, item = null) {
  editingId = item?.id || null;
  $('form').reset();
  $('date').value = date;
  if ($('remind3')) $('remind3').checked = item ? (item.remind3 !== false) : true;

  if (item) {
    $('name').value = item.name;
    $('note').value = item.note || '';
  }

  updateFormReminderPreview();
  $('edit').showModal();
}

// --------------------------------------------------------------------------
// Event Listeners & Interaction Handling
// --------------------------------------------------------------------------

// Click events delegation
document.addEventListener('click', e => {
  const v = e.target.closest('[data-view]');
  const d = e.target.closest('[data-date]');
  const del = e.target.closest('[data-delete]');
  const ed = e.target.closest('[data-edit]');

  if (v) {
    view = v.dataset.view;
    currentFilter = 'all';
    render();
  }

  if (d && !del && !ed) {
    details(d.dataset.date);
  }

  if (del && confirm('Delete this personal special day? (මෙම දිනය මකා දමන්නද?)')) {
    own = own.filter(x => x.id !== del.dataset.delete);
    save();
    $('detail').close();
    render();
    toast('Special day deleted ✓');
  }

  if (ed) {
    const item = own.find(x => x.id === ed.dataset.edit);
    $('detail').close();
    if (item) add(item.date, item);
  }
});

// Keyboard navigation
document.addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[data-date]') && e.target.tagName !== 'BUTTON') {
    e.preventDefault();
    details(e.target.dataset.date);
  }
});

// Top bar buttons
$('add').onclick = () => add(selectedDate || today);
$('cancel').onclick = () => $('edit').close();
$('close').onclick = () => $('detail').close();
$('addhere').onclick = () => {
  $('detail').close();
  add(selectedDate);
};
$('toggle').onclick = () => {
  view = view === 'year' ? 'month' : 'year';
  render();
};
$('year').onchange = () => {
  year = +$('year').value;
  render();
};
$('search').oninput = render;

// Quick 3-Day Alert Simulation in Top Bar
$('quicktest3day').onclick = () => {
  checkAndTrigger3DayNotifications(true);
};

// 3-Day Alert Popup modal close buttons
$('popup3dayclose').onclick = closePopup3Day;
$('popup3daydismiss').onclick = closePopup3Day;
$('popup3dayviewbtn').onclick = () => {
  closePopup3Day();
  if (active3DayEvent) {
    details(active3DayEvent.date);
  }
};

// Form date input listener for reminder preview
$('date').oninput = updateFormReminderPreview;

// Notification bell button
$('notifbtn').onclick = openNotificationCenter;
$('stat3daybox').onclick = () => {
  view = '3days';
  render();
};
$('nav3days').onclick = () => {
  view = '3days';
  render();
};
if ($('mobile3days')) $('mobile3days').onclick = openNotificationCenter;

// Notification modal controls
$('notifclose').onclick = () => $('notifmodal').close();
$('notifenablebtn').onclick = requestNotificationPermission;
$('notiftestbtn').onclick = () => {
  $('notifmodal').close();
  checkAndTrigger3DayNotifications(true);
};

// 3-Day Alert Banner dismiss
$('alertbannerclose').onclick = () => {
  $('alertbanner').style.display = 'none';
  $('alertbanner').dataset.dismissed = 'true';
};

// Filter pills
document.querySelectorAll('.filter-pills .pill-btn').forEach(btn => {
  btn.onclick = () => {
    currentFilter = btn.dataset.pill;
    if (currentFilter === '3days') {
      view = '3days';
    } else if (view === '3days') {
      view = 'month';
    }
    render();
  };
});

// Month navigation
function move(n) {
  if (view === 'year') {
    year += n;
  } else {
    month += n;
    if (month < 0) {
      month = 11;
      year--;
    }
    if (month > 11) {
      month = 0;
      year++;
    }
  }

  if (year < 2026) {
    year = 2026;
    month = 0;
    toast('Available years: 2026–2028');
  }
  if (year > 2028) {
    year = 2028;
    month = 11;
    toast('Available years: 2026–2028');
  }
  render();
}

$('prev').onclick = () => move(-1);
$('next').onclick = () => move(1);
$('today').onclick = () => {
  year = +today.slice(0, 4);
  month = +today.slice(5, 7) - 1;
  view = 'month';
  currentFilter = 'all';
  $('search').value = '';
  spotlightDate = today;
  render();
  launchConfetti();
  toast('Jumped to Today! 🎉');
};

// Hero celebrate button
$('herocelebrate').onclick = () => {
  launchConfetti();
  playChime();
  toast('✨ Let’s celebrate! සතුටින් සමරමු!');
};

// Form submission (Save special day)
$('form').onsubmit = e => {
  e.preventDefault();
  const name = $('name').value.trim();
  if (!name) {
    $('name').setCustomValidity('Please enter an occasion name.');
    $('name').reportValidity();
    return;
  }

  const itemDate = $('date').value;
  const remind3 = $('remind3') ? $('remind3').checked : true;

  const item = {
    id: editingId || crypto.randomUUID(),
    name,
    date: itemDate,
    note: $('note').value.trim(),
    cat: 'Personal',
    remind3
  };

  if (editingId) {
    own = own.filter(e => e.id !== editingId);
  }
  own.push(item);
  const saved = save();

  year = +itemDate.slice(0, 4);
  month = +itemDate.slice(5, 7) - 1;
  view = 'month';
  currentFilter = 'all';
  spotlightDate = itemDate;
  $('search').value = '';
  $('edit').close();
  render();

  const d = daysUntil(itemDate);
  if (saved) {
    launchConfetti();
    if (d === 3 && remind3) {
      toast('🔔 This special day is in 3 days! Triggering notification alert…');
      setTimeout(() => showPopup3Day(item), 400);
    } else if (remind3) {
      const remindDateObj = new Date(new Date(itemDate + 'T12:00:00').getTime() - 3 * 86400000);
      toast(`Special day saved ✓ · Notification scheduled for ${remindDateObj.toISOString().slice(0, 10)} (3 days before)!`);
    } else {
      toast('Your special day is saved ✓');
    }
  }
};
$('name').oninput = () => $('name').setCustomValidity('');

// Export / Import
$('export').onclick = () => {
  const url = URL.createObjectURL(new Blob([JSON.stringify(own, null, 2)], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'daylight-special-days.json';
  a.click();
  setTimeout(()=> URL.revokeObjectURL(url), 500);
  toast('Special days exported ✓');
};

$('import').onclick = () => $('importfile').click();
$('importfile').onchange = async e => {
  try {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 1000000) throw Error();

    const data = JSON.parse(await file.text());
    if (!Array.isArray(data) || data.length > 1000 || !data.every(x =>
      typeof x.name === 'string' && x.name.trim() && x.name.length <= 90 &&
      /^202[6-8]-\d{2}-\d{2}$/.test(x.date) && !isNaN(Date.parse(x.date)) &&
      new Date(x.date).toISOString().slice(0, 10) === x.date
    )) {
      throw Error();
    }

    let count = 0;
    for (const x of data) {
      if (!own.some(o => o.date === x.date && o.name === x.name)) {
        own.push({
          id: crypto.randomUUID(),
          name: x.name,
          date: x.date,
          note: String(x.note || '').slice(0, 400),
          cat: 'Personal',
          remind3: x.remind3 !== false
        });
        count++;
      }
    }

    if (save()) toast(`${count} special days imported ✓`);
    render();
  } catch {
    toast('Please choose a valid Daylight JSON export.');
  }
  e.target.value = '';
};

// --------------------------------------------------------------------------
// Initialization
// --------------------------------------------------------------------------

initQuickDaysCalculator();
startLiveCountdown();

// Sync with chrome.storage.local if running as extension
if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
  chrome.storage.local.get(['daylight_dates'], res => {
    if (res && Array.isArray(res.daylight_dates) && res.daylight_dates.length) {
      res.daylight_dates.forEach(item => {
        if (!own.some(o => o.id === item.id)) own.push(item);
      });
      render();
    }
  });
}

render();

// Check notification permissions and trigger initial 3-day scan
setTimeout(() => {
  checkAndTrigger3DayNotifications();
}, 400);
