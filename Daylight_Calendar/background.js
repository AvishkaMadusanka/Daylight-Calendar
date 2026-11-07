// Daylight Calendar — Chrome Extension Background Service Worker (Manifest V3)

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

function getTodayStr() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Colombo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());
}

function daysUntil(dateStr) {
  const todayStr = getTodayStr();
  return Math.round((Date.parse(dateStr + 'T00:00:00Z') - Date.parse(todayStr + 'T00:00:00Z')) / 86400000);
}

// Check special days and trigger Chrome notifications
async function checkSpecialDays() {
  const todayStr = getTodayStr();
  const yearStr = todayStr.slice(0, 4);

  let personalDates = [];
  try {
    const data = await chrome.storage.local.get(['daylight_dates']);
    if (data && Array.isArray(data.daylight_dates)) {
      personalDates = data.daylight_dates;
    }
  } catch (e) {}

  const allEvents = holidayData.map(([d, n]) => ({
    date: `${yearStr}-${d}`,
    name: n,
    cat: 'Holiday'
  }));

  personalDates.forEach(p => {
    if (p.date && p.name) allEvents.push(p);
  });

  const exact3DayEvents = allEvents.filter(e => daysUntil(e.date) === 3);
  const imminent = allEvents.filter(e => {
    const d = daysUntil(e.date);
    return d >= 0 && d <= 3;
  });

  // Update extension badge
  if (exact3DayEvents.length > 0) {
    chrome.action.setBadgeText({ text: '3d' });
    chrome.action.setBadgeBackgroundColor({ color: '#f59e0b' });
  } else if (imminent.length > 0) {
    chrome.action.setBadgeText({ text: String(imminent.length) });
    chrome.action.setBadgeBackgroundColor({ color: '#216a50' });
  } else {
    chrome.action.setBadgeText({ text: '' });
  }

  // Trigger Chrome Notification if 3 days away
  if (exact3DayEvents.length > 0) {
    const first = exact3DayEvents[0];
    const notifKey = `notified_${todayStr}_${first.date}_${first.name}`;

    try {
      const stored = await chrome.storage.local.get([notifKey]);
      if (!stored[notifKey]) {
        chrome.notifications.create(notifKey, {
          type: 'basic',
          iconUrl: 'icons/icon128.png',
          title: `🔔 3 Days Left: ${first.name}`,
          message: `"${first.name}" is coming up in 3 days on ${first.date}! (තව දින 3කින් පැමිණේ). Plan your celebrations or posts.`,
          priority: 2
        });

        const updateObj = {};
        updateObj[notifKey] = true;
        await chrome.storage.local.set(updateObj);
      }
    } catch (e) {}
  }
}

// Alarms & Startup
chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create('checkSpecialDaysAlarm', { periodInMinutes: 60 });
  checkSpecialDays();
});

chrome.runtime.onStartup.addListener(() => {
  checkSpecialDays();
});

chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === 'checkSpecialDaysAlarm') {
    checkSpecialDays();
  }
});

// Communication with Content Script & Popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'get_3day_events') {
    const todayStr = getTodayStr();
    const yearStr = todayStr.slice(0, 4);

    chrome.storage.local.get(['daylight_dates']).then(data => {
      const personalDates = (data && data.daylight_dates) || [];
      const allEvents = holidayData.map(([d, n]) => ({
        date: `${yearStr}-${d}`,
        name: n
      }));

      personalDates.forEach(p => {
        if (p.date && p.name) allEvents.push(p);
      });

      const events = allEvents.filter(e => {
        const d = daysUntil(e.date);
        return d >= 0 && d <= 3;
      }).sort((a, b) => a.date.localeCompare(b.date));

      sendResponse({ events });
    });
    return true; // async reply
  }

  if (request.action === 'open_calendar') {
    chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
  }

  if (request.action === 'trigger_test') {
    chrome.notifications.create('test-3day-alert', {
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: '🔔 3-Day Reminder Demo: Remembrance Day',
      message: 'Remembrance Day is in 3 days (තව දින 3යි)! Be ready to celebrate and share your posts.',
      priority: 2
    });
  }
});

// Clicking notification opens Calendar
chrome.notifications.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
});

