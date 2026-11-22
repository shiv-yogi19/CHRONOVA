/**
 * CHRONOVA - Digital Clock Engine & Font System
 * Diff-only digit rendering, 10+ digital/futuristic fonts, 12/24h formats, and timezone handling.
 * Created By Shiv Yogi
 */

class ClockEngine {
  constructor() {
    this.storage = window.storageEngine;
    this.animationEngine = window.animationEngine;

    // Font Library (10+ digital clock styles)
    this.fonts = [
      { id: 'orbitron', name: 'Orbitron Cyber', className: 'font-orbitron' },
      { id: 'share-tech', name: 'Share Tech HUD', className: 'font-share-tech' },
      { id: 'chakra', name: 'Chakra Petch', className: 'font-chakra' },
      { id: 'montserrat', name: 'Montserrat Minimal', className: 'font-montserrat' },
      { id: 'rajdhani', name: 'Rajdhani Bold', className: 'font-rajdhani' },
      { id: 'space-mono', name: 'Space Monospace', className: 'font-space-mono' },
      { id: 'syncopate', name: 'Syncopate Ultra-Wide', className: 'font-syncopate' },
      { id: 'bebas', name: 'Bebas Condensed', className: 'font-bebas' },
      { id: 'audiowide', name: 'Audiowide Synth', className: 'font-audiowide' },
      { id: 'digital7', name: 'Seven Segment LED', className: 'font-digital7' },
      { id: 'jetbrains', name: 'JetBrains Code', className: 'font-jetbrains' }
    ];

    // Last rendered state for diffing
    this.lastState = {
      h1: '',
      h2: '',
      m1: '',
      m2: '',
      s1: '',
      s2: '',
      ampm: ''
    };

    this.timerId = null;
    this.init();
  }

  init() {
    this.applyTypographySettings();
    this.applyClockLayout();
    this.startTick();
  }

  startTick() {
    this.tick();
    // High-resolution interval check (every 250ms) to ensure exact second transitions
    this.timerId = setInterval(() => this.tick(), 250);
  }

  tick() {
    const now = new Date();
    const timeZone = this.storage.get('timezone');
    let dateObj = now;

    if (timeZone && timeZone !== 'auto') {
      try {
        const str = now.toLocaleString('en-US', { timeZone });
        dateObj = new Date(str);
      } catch (e) {
        console.warn('[ClockEngine] Timezone conversion fallback:', e);
      }
    }

    let hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    const seconds = dateObj.getSeconds();
    const is12Hour = this.storage.get('hour12');

    let ampm = '';
    if (is12Hour) {
      ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 hour should be 12
    }

    const hStr = String(hours).padStart(2, '0');
    const mStr = String(minutes).padStart(2, '0');
    const sStr = String(seconds).padStart(2, '0');

    const newState = {
      h1: hStr[0],
      h2: hStr[1],
      m1: mStr[0],
      m2: mStr[1],
      s1: sStr[0],
      s2: sStr[1],
      ampm: is12Hour ? ampm : ''
    };

    const transitionMode = this.storage.get('clockTransition') || 'slide';

    // Render diff only
    ['h1', 'h2', 'm1', 'm2', 's1', 's2'].forEach((slot) => {
      if (this.lastState[slot] !== newState[slot]) {
        const el = document.getElementById(`digit-${slot}`);
        if (el) {
          el.textContent = newState[slot];
          if (this.animationEngine && this.lastState[slot] !== '') {
            this.animationEngine.applyDigitTransition(el, transitionMode);
          }
        }
        this.lastState[slot] = newState[slot];
      }
    });

    // Render AM/PM
    if (this.lastState.ampm !== newState.ampm) {
      const ampmEl = document.getElementById('ampm-indicator');
      if (ampmEl) {
        ampmEl.textContent = newState.ampm;
        ampmEl.style.display = is12Hour ? 'inline-block' : 'none';
      }
      this.lastState.ampm = newState.ampm;
    }
  }

  cycleFont() {
    const current = this.storage.get('selectedFont') || 'orbitron';
    const index = this.fonts.findIndex(f => f.id === current);
    const nextIndex = (index + 1) % this.fonts.length;
    const nextFont = this.fonts[nextIndex];

    this.setFont(nextFont.id);

    // Audio chime
    if (this.animationEngine) {
      this.animationEngine.playSound('click');
    }

    // Brief animation burst
    const clock = document.getElementById('clock-container');
    if (clock) {
      clock.classList.add('anim-scale-reveal');
      setTimeout(() => clock.classList.remove('anim-scale-reveal'), 500);
    }
  }

  setFont(fontId) {
    this.storage.set('selectedFont', fontId);
    this.applyTypographySettings();
  }

  applyTypographySettings() {
    const clockContainer = document.getElementById('clock-container');
    if (!clockContainer) return;

    // Remove all font classes
    this.fonts.forEach(f => clockContainer.classList.remove(f.className));

    const selected = this.storage.get('selectedFont') || 'orbitron';
    const fontObj = this.fonts.find(f => f.id === selected) || this.fonts[0];
    clockContainer.classList.add(fontObj.className);

    // Custom size, weight, spacing
    const root = document.documentElement;
    const sizeVw = this.storage.get('fontSize') || 14;
    const weight = this.storage.get('fontWeight') || 700;
    const spacing = this.storage.get('letterSpacing') || 0.04;

    root.style.setProperty('--clock-font-size', `clamp(3.5rem, ${sizeVw}vw, 14rem)`);
    root.style.setProperty('--clock-font-weight', weight);
    root.style.setProperty('--clock-letter-spacing', `${spacing}em`);
  }

  applyClockLayout() {
    const root = document.documentElement;
    const stage = document.getElementById('stage');
    const clockPresentation = document.getElementById('clock-presentation');
    const colon1 = document.getElementById('colon-1');
    const colon2 = document.getElementById('colon-2');

    // Show/Hide Seconds
    const showSeconds = this.storage.get('showSeconds');
    if (stage) {
      stage.classList.toggle('seconds-hidden', !showSeconds);
    }

    // Colon Style
    const colonStyle = this.storage.get('colonStyle') || 'pulse';
    [colon1, colon2].forEach((colon) => {
      if (!colon) return;
      colon.classList.remove('colon-pulse', 'colon-blink');
      if (colonStyle === 'pulse') colon.classList.add('colon-pulse');
      else if (colonStyle === 'blink') colon.classList.add('colon-blink');
    });

    // Clock Position
    const position = this.storage.get('clockPosition') || 'center';
    let offset = '0px';
    if (position === 'top') offset = '-15vh';
    else if (position === 'bottom') offset = '15vh';
    root.style.setProperty('--clock-vertical-offset', offset);

    // Minimal Mode
    const minimal = this.storage.get('minimalMode');
    if (stage) {
      stage.classList.toggle('minimal-mode', minimal);
    }
  }
}

window.clockEngine = new ClockEngine();
