# CHRONOVA — Comprehensive Feature Specification

Created By Shiv Yogi

This document details the comprehensive functional and design specifications of CHRONOVA.

---

## 1. Digital Clock Engine
- **Time Accuracy**: Powered by high-resolution standard JavaScript `Date` and `Intl.DateTimeFormat`.
- **Diff-Only Rendering**: Compares existing DOM digit text content against new values and only updates slots (`h1`, `h2`, `m1`, `m2`, `s1`, `s2`, `ampm`) whose characters have mutated, avoiding unnecessary layout recalculations.
- **12/24-Hour Format**: Flexible mode switching; 12-hour format shows dynamic AM/PM badge with dedicated glow effects.
- **Blinking Separator Colons**: Configurable colon animation modes:
  - *Smooth Pulse*: Sine-wave opacity transition.
  - *Hard Blink*: Instant 1Hz digital blink.
  - *Solid*: Continuous illumination.
- **Digit Transition Animations**:
  - *Slide Roll*: Smooth vertical translation with easing.
  - *3D Flip Card*: Perspective rotation around the X-axis.
  - *Smooth Fade*: Crossfade with slight blur suppression.
  - *Neon Glow Burst*: Expanding luminous flash upon digit change.
  - *Spring Scale*: Kinetic bounce upon numeric tick.
  - *Minimal*: Immediate tick with zero frame overhead.

---

## 2. Font Customization Suite
Includes 10+ digital clock fonts:
1. **Orbitron**: High-tech sci-fi geometric sans-serif.
2. **Share Tech Mono**: Monospaced terminal HUD style.
3. **Chakra Petch**: Cyberpunk octagonal typography.
4. **Montserrat**: Sleek modern luxury sans-serif.
5. **Rajdhani**: Squared bold display type.
6. **Space Mono**: Authentic monospaced engineering font.
7. **Syncopate**: Ultra-wide cinematic typography.
8. **Bebas Neue**: Condensed high-impact digital poster font.
9. **Audiowide**: 80s techno synth display typography.
10. **Digital-7 (LED)**: Classic seven-segment digital clock face with tabular numeral spacing.
11. **JetBrains Mono**: Clean developer code font.

Features live sliders for font size (`6vw` to `22vw`), font weight (`200` to `900`), and letter spacing (`-0.04em` to `0.25em`).

---

## 3. Individual Digit Color Studio
- Accessible by long-pressing any clock digit or through the settings drawer.
- Every clock character position can have its own independent color:
  - Hour tens (`h1`)
  - Hour units (`h2`)
  - Colon 1
  - Minute tens (`m1`)
  - Minute units (`m2`)
  - Colon 2
  - Second tens (`s1`)
  - Second units (`s2`)
  - AM/PM indicator
- Real-time swatch preview, live HEX input with pattern verification, and native HTML5 color picker.
- 16 Curated Color Presets: Pure White, Neon Cyan, Electric Violet, Sunset Amber, Emerald Cyber, Hot Magenta, Electric Yellow, Ice Sapphire, Ruby Crimson, Acid Lime, Deep Indigo, Cosmic Coral, Rose Gold, Aquamarine, Goldenrod, and OLED Silver.
- "Apply to All Matching Digits" toggle: When changing a digit (e.g. '5'), automatically updates all digits on the clock that currently equal '5'.

---

## 4. Advanced RGB Lighting Engine
- Continuous dynamic RGB hue flow across digits.
- Modes:
  - *Rainbow Spectrum Flow*
  - *Smooth Color Cycling*
  - *Breathing Glow* (sine-wave brightness/saturation morph)
  - *Multi-Gradient Wave*
  - *Neon Cyber Pulse*
  - *Random Color Transitions*
- Configurable intervals: Continuous, 1 minute, 2 minutes, 5 minutes, 10 minutes.
- Per-Digit Phase Wave: Offsets hue per digit to create an undulating rainbow wave across the entire clock.

---

## 5. Wallpaper System (3 Distinct Categories)

### Category A: 12 Dynamic Wallpapers with Built-in Clock
Each dynamic wallpaper features its own integrated clock styling:
1. **Cyber Matrix**: Falling green/cyan digital code rain with illuminated leading glyphs and cyber grid box.
2. **Neon Horizon**: Retro synthwave perspective ground grid scrolling toward a setting vector sun with mountain backdrop.
3. **Aurora Borealis**: Waving northern lights atmospheric curtains with twinkling starfield.
4. **Minimal Void**: Pitch-black OLED background with a gentle breathing cosmic dust ring.
5. **Deep Ocean Abyss**: Bioluminescent floating underwater spores and drifting caustic beams.
6. **Golden Celestial**: Concentric astrological dials rotating with orbital planetary nodes.
7. **Liquid Lava Glass**: Volumetric fluid blobs moving dynamically behind frosted glass.
8. **Cyberpunk Cityscape**: High-contrast skyscraper wireframes with pulsing window lights and neon fog.
9. **Geometric Prisms**: 3D wireframe polyhedra tumbling with chromatic edge glow.
10. **Retro Quartz LED**: Vintage green phosphor VFD raster lines and oscilloscope sine waves.
11. **Cosmic Nebula**: Dual-arm spiral galaxy particle vortex.
12. **Zen Japanese Ink**: Sumi-e monochromatic fluid waves and falling cherry blossom petals.

### Category B: 10 Live Color Canvas Themes
1. **Chromatic Flux**: Shifting multi-color fluid mesh gradients.
2. **Deep Aurora**: Emerald, teal, and indigo breathing waves.
3. **Electric Sunset**: Magenta, flame orange, and deep purple gradient morph.
4. **Midnight Obsidian**: Charcoal and electric sapphire ambient glow.
5. **Cosmic Vapor**: Pastel lilac, turquoise, peach, and soft violet fluid.
6. **Neon Tokyo**: High-contrast electric acid lime, cyan, and hot neon magenta pulses.
7. **Solar Flare**: Radiant amber, crimson gold, and rising plasma sparks.
8. **Bioluminescence**: Deep marine navy with pulsing teal spore bursts.
9. **Hyperdrive Starfield**: 3D warp-speed stars rushing outward from center into hyperdrive trails.
10. **Liquid Mercury**: Chrome metallic reflective ripples and silver gradients.

### Category C: Custom Media Wallpapers
- Supports user-uploaded image files (`.png`, `.jpg`, `.webp`, `.gif`) and video files (`.mp4`, `.webm`).
- Uploads are saved directly to browser **IndexedDB** (`chronova_media_db`). Zero external server transmission.
- Full controls for blur (0–40px), brightness (10%–150%), opacity, video mute toggle, and volume slider.

---

## 6. Widget Engine & Creator Branding

### Available Widgets:
1. **Full Date**: Localized day of week, month, date, and year.
2. **Week & Year Metrics**: ISO 8601 week number, calendar quarter, and remaining days in year.
3. **Timezone**: Browser-resolved timezone with exact UTC offset.
4. **World Clock**: Live synchronized dual time for New York, London, and Tokyo.
5. **Interactive Stopwatch**: Millisecond-accurate timer with Start/Pause, Lap recording, and Reset.
6. **Interactive Countdown Timer**: Presets (5m, 10m, 25m Pomodoro) with Web Audio alarm chime.
7. **Battery Monitor**: Live battery percentage and charging indicator using `navigator.getBattery()`.
8. **Live Weather**: Weather conditions, temperature, humidity, and wind using the open Open-Meteo API.
9. **Dedicated Creator Branding Widget**:
   - Displays **Created By Shiv Yogi**.
   - Automatic Alternation: Shows Date for 5 seconds, slides into Creator Branding for 5 seconds, and returns to Date.
   - 12 Branding Animation Styles: Slide In Flare, Zoom Scale, Glow Pulse, Matrix Decrypt, Neon Sign Flicker, 3D Perspective Flip, Liquid Wave, Cyber Shimmer, Elastic Stagger, Minimal Fade, Kinetic Bounce, and Laser Cyber Scan.
   - 12 Typography Combinations: Orbitron Cyber, Montserrat Luxury, Rajdhani High-Tech, Syncopate Wide, Bebas Neue, Share Tech, Chakra Petch, Audiowide, Space Mono, JetBrains Mono, Gold Foil Luxury, and Holographic Rainbow.

---

## 7. Always On Display & Screen Wake Lock
- Prevents display sleep using `navigator.wakeLock`.
- Automatic Wake Lock re-acquisition upon tab visibility restoration.
- OLED Anti-Burn-In Protection: Drifts the clock position by a few pixels every few minutes to protect OLED/AMOLED pixels.
- Idle Display Dimming: Subtly dims screen after inactivity to preserve energy.
