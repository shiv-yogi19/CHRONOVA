# CHRONOVA — Architecture & System Design

Created By Shiv Yogi

This document describes the software architecture, design patterns, and module interactions of CHRONOVA.

---

## 1. High-Level Architecture Overview

CHRONOVA follows an event-driven, modular vanilla JavaScript architecture. The application is entirely client-side, requiring no build tools, bundlers, or backend servers.

```
┌─────────────────────────────────────────────────────────────┐
│                          CHRONOVA                           │
│                      (index.html PWA)                       │
└──────────────────────────────┬──────────────────────────────┘
                               │
                ┌──────────────┴──────────────┐
                ▼                             ▼
       ┌──────────────────┐          ┌──────────────────┐
       │   Presentation   │          │  Engine Modules  │
       │    (CSS3 UI)     │          │  (Vanilla ES6)   │
       └────────┬─────────┘          └────────┬─────────┘
                │                             │
    ┌───────────┼───────────┐                 ├─ storage-engine.js
    ▼           ▼           ▼                 ├─ clock-engine.js
  glass.css  main.css  themes.css             ├─ color-engine.js
animations.css mobile.css desktop.css         ├─ wallpaper-engine.js
                                              ├─ widget-engine.js
                                              ├─ gesture-engine.js
                                              ├─ fullscreen-engine.js
                                              ├─ animation-engine.js
                                              ├─ settings-engine.js
                                              └─ app.js
```

---

## 2. Module Specifications

### `storage-engine.js`
- **Dual Persistence Strategy**:
  - `LocalStorage`: For key-value configurations, typography selections, digit color maps, and settings.
  - `IndexedDB` (`chronova_media_db`): For custom wallpaper media blobs (images and videos).
- **Import/Export Pipeline**: Encodes entire configuration into JSON schema for seamless export, import, and backup.

### `clock-engine.js`
- **Diff-Only Rendering**: Avoids re-rendering unaltered digits. Compares cache against newly evaluated hours, minutes, and seconds.
- **Timezone Normalization**: Utilizes `Intl.DateTimeFormat` with optional manual timezone override.
- **Font Switching**: Dynamically swaps CSS typography classes on the root clock container without rebuilding markup.

### `color-engine.js`
- **Per-Digit Color Mapping**: Maintains individual hex codes for each slot (`h1`, `h2`, `colon1`, `m1`, `m2`, `colon2`, `s1`, `s2`, `ampm`).
- **RGB Shader Engine**: Drives rainbow and gradient hue rotations via a unified tick function fed from `wallpaper-engine.js`.

### `wallpaper-engine.js`
- **Single Render Loop**: Uses `requestAnimationFrame` with FPS throttling (30 or 60 FPS) and automatic pause on `document.hidden`.
- **Canvas DPR Optimization**: Calculates `window.devicePixelRatio` capped at 2 for mobile GPU efficiency.
- **Media Controller**: Manages custom wallpaper video playback, mute policies, and IndexedDB blob URLs.

### `widget-engine.js`
- **Smart Carousel**: Manages date, time metrics, world clock, battery, stopwatch, timer, weather, and branding widgets.
- **Branding Alternator**: Alternates between live date and the **Created By Shiv Yogi** showcase widget at configurable intervals.

### `gesture-engine.js`
- **Multi-Touch & Mouse Normalization**: Handles double-taps, directional horizontal/vertical swipes, long-press cancellation on jitter, and two-finger interactions.

### `fullscreen-engine.js`
- **Wake Lock Lifecycle**: Acquires `navigator.wakeLock`, handles browser releases, and reacquires on tab visibility change.
- **Anti-Burn-In Engine**: Modulates clock coordinate offsets on a 5-minute cycle to prevent OLED pixel burn-in.

### `animation-engine.js`
- **Web Audio API Synthesizer**: Generates UI clicks, chimes, and alarms mathematically using oscillators without external audio dependencies.
- **25 Polished Animations**: Manages class bindings and demo previews.

### `settings-engine.js`
- **Reactive Data Binding**: Immediately dispatches UI changes (toggles, sliders, dropdowns) to relevant engines and stores in `LocalStorage`.

### `app.js`
- **Application Lifecycle**: Orchestrates 7-step onboarding tutorial, desktop keyboard shortcuts, and Service Worker registration.

---

## 3. Storage Schema

```json
{
  "hour12": true,
  "showSeconds": true,
  "colonStyle": "pulse",
  "clockTransition": "slide",
  "selectedFont": "orbitron",
  "fontSize": 14,
  "fontWeight": 700,
  "letterSpacing": 0.04,
  "clockPosition": "center",
  "minimalMode": false,
  "timezone": "auto",
  "digitColors": {
    "h1": "#ffffff",
    "h2": "#ffffff",
    "colon1": "#ffffff",
    "m1": "#ffffff",
    "m2": "#ffffff",
    "colon2": "#ffffff",
    "s1": "#ffffff",
    "s2": "#ffffff",
    "ampm": "#00f2fe"
  },
  "rgbMode": false,
  "rgbStyle": "rainbow",
  "wallpaperCategory": "dynamic",
  "activeDynamicWallpaper": "matrix",
  "wakeLockEnabled": true,
  "antiBurnInDrift": true,
  "onboardingCompleted": true
}
```
