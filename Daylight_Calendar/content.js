// Daylight Calendar — Content Script for Google & Web Pages
(function () {
  // Avoid duplicate injection
  if (document.getElementById('daylight-topright-widget')) return;

  // Check if dismissed in this session
  if (sessionStorage.getItem('daylight_tw_dismissed') === 'true') return;

  // Hardcoded core Sri Lankan special days & fallback calendar logic
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
    ['04-13', 'Day prior to Sinhala & Tamil New Year · අලුත් අවුරුදු පෙර දිනය'],
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
    ['11-11', 'Remembrance Day (Poppy Day) · රණවිරු සැමරුම් දිනය'],
    ['11-24', 'Il Poya · ඉල් පුර පසළොස්වක පෝය'],
    ['12-23', 'Unduvap Poya · උඳුවප් පුර පසළොස්වක පෝය'],
    ['12-25', 'Christmas Day · නත්තල් දිනය']
  ];

  const todayStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Colombo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());

  const yearStr = todayStr.slice(0, 4);

  const daysUntil = dateStr => Math.round((Date.parse(dateStr + 'T00:00:00Z') - Date.parse(todayStr + 'T00:00:00Z')) / 86400000);

  // Ask background service worker for customized events or fallback to local
  function checkAndRenderWidget() {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ action: 'get_3day_events' }, response => {
        if (response && response.events && response.events.length) {
          renderTopRightWidget(response.events[0]);
        } else {
          fallbackCheck();
        }
      });
    } else {
      fallbackCheck();
    }
  }

  function fallbackCheck() {
    const list = holidayData.map(([d, n]) => ({
      date: `${yearStr}-${d}`,
      name: n
    })).filter(e => {
      const diff = daysUntil(e.date);
      return diff >= 0 && diff <= 3;
    });

    if (list.length) {
      renderTopRightWidget(list[0]);
    }
  }

  function renderTopRightWidget(event) {
    const d = daysUntil(event.date);
    const dateObj = new Date(event.date + 'T12:00:00');
    const formattedDate = dateObj.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });

    const widget = document.createElement('div');
    widget.id = 'daylight-topright-widget';

    widget.innerHTML = `
      <div class="daylight-tw-header">
        <div class="daylight-tw-badge">
          <span>🔔</span> 3-Day Timeline Alert
        </div>
        <div class="daylight-tw-header-actions">
          <button class="daylight-tw-btn-icon" id="daylight-tw-min" title="Minimize / Expand">─</button>
          <button class="daylight-tw-btn-icon" id="daylight-tw-close" title="Close / Dismiss">✕</button>
        </div>
      </div>

      <div class="daylight-tw-title">${escapeHtml(event.name)}</div>
      <div class="daylight-tw-date">
        📅 ${formattedDate} · <span style="color:#d97706;font-weight:700">${d === 0 ? 'Today! (අදයි)' : d === 3 ? 'In 3 Days! (තව දින 3යි)' : `In ${d} Days (තව දින ${d}යි)`}</span>
      </div>

      <!-- 3-Day Step Timeline -->
      <div class="daylight-tw-timeline">
        <div class="daylight-tw-timeline-title">3-Day Countdown Timeline</div>
        <div class="daylight-tw-timeline-track">
          <div class="daylight-tw-step ${d === 3 ? 'active' : d < 3 ? 'completed' : ''}">
            <div class="daylight-tw-dot">3d</div>
            <span class="daylight-tw-step-label">Day 3</span>
          </div>
          <div class="daylight-tw-step ${d === 2 ? 'active' : d < 2 ? 'completed' : ''}">
            <div class="daylight-tw-dot">2d</div>
            <span class="daylight-tw-step-label">Day 2</span>
          </div>
          <div class="daylight-tw-step ${d === 1 ? 'active' : d < 1 ? 'completed' : ''}">
            <div class="daylight-tw-dot">1d</div>
            <span class="daylight-tw-step-label">Eve</span>
          </div>
          <div class="daylight-tw-step ${d === 0 ? 'active' : ''}">
            <div class="daylight-tw-dot">★</div>
            <span class="daylight-tw-step-label">Event</span>
          </div>
        </div>
      </div>

      <div class="daylight-tw-actions">
        <button class="daylight-tw-btn-primary" id="daylight-tw-open">Open Calendar (දින දර්ශනය)</button>
        <button class="daylight-tw-btn-secondary" id="daylight-tw-dismiss">Close (වසන්න)</button>
      </div>
    `;

    document.body.appendChild(widget);

    // Event Listeners
    const closeBtn = document.getElementById('daylight-tw-close');
    const dismissBtn = document.getElementById('daylight-tw-dismiss');
    const minBtn = document.getElementById('daylight-tw-min');
    const openBtn = document.getElementById('daylight-tw-open');

    function removeWidget() {
      widget.style.transform = 'translateX(120%)';
      widget.style.opacity = '0';
      sessionStorage.setItem('daylight_tw_dismissed', 'true');
      setTimeout(() => {
        if (widget.parentNode) widget.parentNode.removeChild(widget);
      }, 350);
    }

    if (closeBtn) closeBtn.onclick = removeWidget;
    if (dismissBtn) dismissBtn.onclick = removeWidget;

    if (minBtn) {
      minBtn.onclick = () => {
        widget.classList.toggle('minimized');
      };
    }

    if (openBtn) {
      openBtn.onclick = () => {
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
          chrome.runtime.sendMessage({ action: 'open_calendar' });
        } else {
          window.open('https://www.google.com', '_blank');
        }
      };
    }
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[c]));
  }

  // Run on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAndRenderWidget);
  } else {
    setTimeout(checkAndRenderWidget, 500);
  }
})();

