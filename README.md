# ✳ Daylight — Sri Lanka Special Days & Countdown Calendar

> **A thoughtful Sri Lankan calendar and Google Chrome Extension for holidays, Poya days, celebrations, live countdowns, and 3-day advance timeline notifications.**

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension%20Manifest%20V3-brightgreen)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Made for Sri Lanka](https://img.shields.io/badge/Made%20for-Sri%20Lanka%20🇱🇰-orange)](#)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero%20(Pure%20JS)-blue)](#)

---

## ✨ Features

- **🇱🇰 Sri Lankan Public Holidays & Poya Days**: Complete 2026 calendar including Full Moon Poya observances, bank & mercantile holidays, and annual recurring national days.
- **🔔 3-Day Advance Notification System**:
  - **Browser & Chrome Native Notifications**: Sends alerts 3 days before any special date arrives.
  - **On-Screen Alert Modal & Chime**: Interactive popup with sound alert when opening the calendar 3 days prior.
  - **In-App Reminder Banner**: Prominent banner highlighting imminent events.
- **⏳ Live Days-Left Countdown Clock**:
  - Live ticking countdown timer (**Days : Hours : Mins : Secs**) in the spotlight hero section.
  - Interactive dropdown to track live countdown for *any* holiday, Poya day, or personal milestone.
  - Quick **Days Remaining Calculator** widget in the sidebar.
- **🧩 Google Chrome Extension with Floating Top-Right Timeline Widget**:
  - When browsing Google or any website, starting 3 days before any special date, an elegant floating countdown timeline widget appears at the top-right corner of the page!
  - 4-stage visual timeline: `[ Day 3 ] ──► [ Day 2 ] ──► [ Eve ] ──► [ Event ]`.
  - Close (`✕`) and Minimize (`─`) buttons to dismiss or collapse at any time.
- **💖 Personal Special Days**:
  - Add birthdays, anniversaries, business launches, and custom milestones.
  - Automatic 3-day reminder toggle for each personal milestone.
  - Synchronized across local storage and Chrome extension storage.
- **📝 Ready-to-Use Facebook & Social Media Post Captions**:
  - Click any holiday to generate festive Sinhala & English greeting captions with hashtags and 1-click clipboard copy.

---

## 🚀 How to Install as a Google Chrome Extension

1. Open **Google Chrome**.
2. In the address bar, type:
   ```text
   chrome://extensions/
   ```
3. In the top-right corner, toggle **Developer mode** to **ON**.
4. In the top-left corner, click **Load unpacked**.
5. Select the `Daylight_Calendar` folder in this repository.
6. Done! The Daylight icon (`✳`) will appear in your Chrome toolbar.

---

## 💻 Running as a Standalone Web Application

No build step or node packages required! Simply:
1. Double-click `Daylight_Calendar/index.html` to open directly in any browser.
2. Or run a lightweight local server:
   ```bash
   python -m http.server 8000
   ```
   Then open `http://localhost:8000` in your browser.

---

## 📁 Repository Structure

```text
Daylight_Calendar/
├── manifest.json       # Chrome Extension Manifest V3 configuration
├── background.js       # Background service worker with alarms & notifications
├── content.js          # Injects the floating top-right timeline widget on web pages
├── content.css         # Isolated styles for the top-right floating timeline widget
├── index.html          # Calendar interface & Extension popup UI
├── app.js              # Calendar logic, countdowns, 3-day notifications, holidays
├── icons/              # Extension icons (16px, 48px, 128px)
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.txt          # Quick reference guide in Sinhala & English
```

---

## 📄 License

MIT License — Feel free to use, modify, and share!

