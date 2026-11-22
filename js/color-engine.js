/**
 * CHRONOVA - Color Engine & RGB Animation System
 * Manages individual digit colors, 16 curated presets, HEX validation, and advanced RGB flow.
 * Created By Shiv Yogi
 */

class ColorEngine {
  constructor() {
    this.storage = window.storageEngine;
    this.targetDigitId = 'h1'; // Currently edited digit: h1, h2, colon1, m1, m2, colon2, s1, s2, ampm
    this.activeHue = 0;
    this.rgbTimer = null;
    this.lastIntervalChange = Date.now();

    // 16 Curated High-End Digital Colors
    this.presets = [
      { name: 'Pure White', hex: '#ffffff', glow: 'rgba(255,255,255,0.45)' },
      { name: 'Neon Cyan', hex: '#00f2fe', glow: 'rgba(0,242,254,0.6)' },
      { name: 'Electric Violet', hex: '#9b51e0', glow: 'rgba(155,81,224,0.6)' },
      { name: 'Sunset Amber', hex: '#ff7700', glow: 'rgba(255,119,0,0.6)' },
      { name: 'Emerald Cyber', hex: '#00ff66', glow: 'rgba(0,255,102,0.6)' },
      { name: 'Hot Magenta', hex: '#ff007f', glow: 'rgba(255,0,127,0.6)' },
      { name: 'Electric Yellow', hex: '#ffee00', glow: 'rgba(255,238,0,0.6)' },
      { name: 'Ice Sapphire', hex: '#4facfe', glow: 'rgba(79,172,254,0.6)' },
      { name: 'Ruby Crimson', hex: '#ff3344', glow: 'rgba(255,51,68,0.6)' },
      { name: 'Acid Lime', hex: '#ccff00', glow: 'rgba(204,255,0,0.6)' },
      { name: 'Deep Indigo', hex: '#6366f1', glow: 'rgba(99,102,241,0.6)' },
      { name: 'Cosmic Coral', hex: '#ff6b6b', glow: 'rgba(255,107,107,0.6)' },
      { name: 'Rose Gold', hex: '#f43f5e', glow: 'rgba(244,63,94,0.6)' },
      { name: 'Aquamarine', hex: '#14b8a6', glow: 'rgba(20,184,166,0.6)' },
      { name: 'Goldenrod', hex: '#eab308', glow: 'rgba(234,179,8,0.6)' },
      { name: 'OLED Silver', hex: '#cbd5e1', glow: 'rgba(203,213,225,0.3)' }
    ];

    this.init();
  }

  init() {
    this.renderPresetsGrid();
    this.bindEvents();
    this.applyAllColors();
  }

  renderPresetsGrid() {
    const grid = document.getElementById('color-presets-grid');
    if (!grid) return;
    grid.innerHTML = '';

    this.presets.forEach((preset) => {
      const circle = document.createElement('div');
      circle.className = 'color-preset-circle';
      circle.style.backgroundColor = preset.hex;
      circle.title = `${preset.name} (${preset.hex})`;
      circle.dataset.hex = preset.hex;

      circle.addEventListener('click', () => {
        this.selectColor(preset.hex);
      });

      grid.appendChild(circle);
    });
  }

  bindEvents() {
    // Digit Color Modal Close
    const closeBtn = document.getElementById('close-digit-modal-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeModal());
    }

    // Modal overlay click outside
    const modal = document.getElementById('digit-color-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeModal();
      });
    }

    // HEX Input
    const hexInput = document.getElementById('digit-hex-input');
    if (hexInput) {
      hexInput.addEventListener('input', (e) => {
        let val = e.target.value.trim();
        if (!val.startsWith('#')) val = '#' + val;
        if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
          this.selectColor(val, false);
        }
      });
    }

    // Native Color Picker input
    const nativePicker = document.getElementById('native-color-picker');
    if (nativePicker) {
      nativePicker.addEventListener('input', (e) => {
        this.selectColor(e.target.value);
      });
    }

    // Reset current digit button
    const resetSingleBtn = document.getElementById('reset-single-digit-btn');
    if (resetSingleBtn) {
      resetSingleBtn.addEventListener('click', () => {
        const defaultColor = this.targetDigitId === 'ampm' ? '#00f2fe' : '#ffffff';
        this.selectColor(defaultColor);
      });
    }

    // Reset all digits button
    const resetAllBtn = document.getElementById('reset-all-digits-btn');
    if (resetAllBtn) {
      resetAllBtn.addEventListener('click', () => {
        const digitColors = this.storage.get('digitColors');
        Object.keys(digitColors).forEach((key) => {
          digitColors[key] = key === 'ampm' ? '#00f2fe' : '#ffffff';
        });
        this.storage.set('digitColors', digitColors);
        this.applyAllColors();
        this.updateModalPreview();
      });
    }

    // Target Digit Selector pills
    const pills = document.querySelectorAll('.digit-target-pill');
    pills.forEach((pill) => {
      pill.addEventListener('click', () => {
        pills.forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
        this.targetDigitId = pill.dataset.target;
        this.updateModalPreview();
      });
    });

    // Apply to matching digits checkbox
    const matchCheckbox = document.getElementById('apply-matching-digits-checkbox');
    if (matchCheckbox) {
      matchCheckbox.checked = this.storage.get('applyToMatchingDigits');
      matchCheckbox.addEventListener('change', (e) => {
        this.storage.set('applyToMatchingDigits', e.target.checked);
      });
    }
  }

  openModal(targetId = 'h1') {
    this.targetDigitId = targetId;
    const modal = document.getElementById('digit-color-modal');
    if (!modal) return;

    // Highlight active pill
    const pills = document.querySelectorAll('.digit-target-pill');
    pills.forEach((p) => {
      p.classList.toggle('active', p.dataset.target === targetId);
    });

    this.updateModalPreview();
    modal.classList.add('active');
  }

  closeModal() {
    const modal = document.getElementById('digit-color-modal');
    if (modal) modal.classList.remove('active');
  }

  selectColor(hex, updateInput = true) {
    const digitColors = this.storage.get('digitColors');
    const applyMatching = this.storage.get('applyToMatchingDigits');

    digitColors[this.targetDigitId] = hex;

    // If applyMatching is enabled and this is a numeric digit, apply to matching values
    if (applyMatching && this.targetDigitId.startsWith('h') || this.targetDigitId.startsWith('m') || this.targetDigitId.startsWith('s')) {
      const targetElem = document.getElementById(`digit-${this.targetDigitId}`);
      if (targetElem) {
        const targetValue = targetElem.textContent.trim();
        ['h1', 'h2', 'm1', 'm2', 's1', 's2'].forEach((key) => {
          const el = document.getElementById(`digit-${key}`);
          if (el && el.textContent.trim() === targetValue) {
            digitColors[key] = hex;
          }
        });
      }
    }

    this.storage.set('digitColors', digitColors);
    this.applyAllColors();
    this.updateModalPreview(updateInput);
  }

  updateModalPreview(updateInput = true) {
    const digitColors = this.storage.get('digitColors');
    const currentColor = digitColors[this.targetDigitId] || '#ffffff';

    const swatch = document.getElementById('color-swatch-large');
    const hexLabel = document.getElementById('digit-hex-label');
    const hexInput = document.getElementById('digit-hex-input');
    const nativePicker = document.getElementById('native-color-picker');

    if (swatch) swatch.style.backgroundColor = currentColor;
    if (hexLabel) hexLabel.textContent = currentColor.toUpperCase();
    if (nativePicker) nativePicker.value = currentColor;
    if (updateInput && hexInput) hexInput.value = currentColor.toUpperCase();

    // Highlight matching preset circle if exact match
    const circles = document.querySelectorAll('.color-preset-circle');
    circles.forEach((c) => {
      c.classList.toggle('active', c.dataset.hex.toLowerCase() === currentColor.toLowerCase());
    });
  }

  applyAllColors() {
    if (this.storage.get('rgbMode')) return; // Handled by RGB Animation Loop

    const digitColors = this.storage.get('digitColors');
    const targets = ['h1', 'h2', 'colon1', 'm1', 'm2', 'colon2', 's1', 's2', 'ampm'];

    targets.forEach((key) => {
      let el;
      if (key.startsWith('colon')) {
        el = document.getElementById(`colon-${key === 'colon1' ? '1' : '2'}`);
      } else if (key === 'ampm') {
        el = document.getElementById('ampm-indicator');
      } else {
        el = document.getElementById(`digit-${key}`);
      }

      if (el) {
        const color = digitColors[key] || '#ffffff';
        el.style.color = color;
        el.style.textShadow = `0 0 25px ${this.hexToRgba(color, 0.55)}`;
      }
    });

    // Update ambient glow layer to match primary minutes color
    const ambientLayer = document.querySelector('.ambient-glow-layer');
    if (ambientLayer) {
      const mainColor = digitColors.m1 || '#00f2fe';
      ambientLayer.style.background = `radial-gradient(circle, ${this.hexToRgba(mainColor, 0.45)} 0%, transparent 70%)`;
    }
  }

  /* RGB Animation System */
  updateRGBFrame(deltaMs) {
    if (!this.storage.get('rgbMode')) return;

    const style = this.storage.get('rgbStyle') || 'rainbow';
    const speed = this.storage.get('rgbSpeed') || 1;
    const wave = this.storage.get('rgbPerDigitWave');

    // Interval check for 1m, 2m, 5m, 10m, custom
    const intervalType = this.storage.get('rgbInterval');
    if (intervalType !== 'continuous') {
      let intervalMs = 60000;
      if (intervalType === '2m') intervalMs = 120000;
      else if (intervalType === '5m') intervalMs = 300000;
      else if (intervalType === '10m') intervalMs = 600000;
      else if (intervalType === 'custom') {
        intervalMs = (this.storage.get('rgbCustomIntervalMinutes') || 3) * 60000;
      }

      const elapsed = Date.now() - this.lastIntervalChange;
      if (elapsed > intervalMs) {
        this.lastIntervalChange = Date.now();
        this.activeHue = (this.activeHue + 45) % 360;
      }
    } else {
      // Continuous speed
      this.activeHue = (this.activeHue + (deltaMs * 0.05 * speed)) % 360;
    }

    const digitKeys = ['h1', 'h2', 'colon1', 'm1', 'm2', 'colon2', 's1', 's2', 'ampm'];

    digitKeys.forEach((key, index) => {
      let hue = this.activeHue;
      if (wave) {
        hue = (hue + (index * 25)) % 360;
      }

      let colorStr = '';
      if (style === 'rainbow' || style === 'smooth') {
        colorStr = `hsl(${hue}, 100%, 65%)`;
      } else if (style === 'breathing') {
        const lightness = 40 + Math.sin(Date.now() * 0.002 * speed) * 35;
        colorStr = `hsl(${hue}, 100%, ${lightness}%)`;
      } else if (style === 'neon') {
        colorStr = `hsl(${hue}, 100%, 75%)`;
      } else if (style === 'gradient') {
        colorStr = `hsl(${(hue + index * 40) % 360}, 95%, 60%)`;
      } else if (style === 'random') {
        colorStr = `hsl(${hue}, 85%, 65%)`;
      }

      let el;
      if (key.startsWith('colon')) el = document.getElementById(`colon-${key === 'colon1' ? '1' : '2'}`);
      else if (key === 'ampm') el = document.getElementById('ampm-indicator');
      else el = document.getElementById(`digit-${key}`);

      if (el) {
        el.style.color = colorStr;
        el.style.textShadow = `0 0 25px ${colorStr}`;
      }
    });

    // Update ambient glow layer
    const ambientLayer = document.querySelector('.ambient-glow-layer');
    if (ambientLayer) {
      ambientLayer.style.background = `radial-gradient(circle, hsla(${this.activeHue}, 100%, 60%, 0.45) 0%, transparent 70%)`;
    }
  }

  hexToRgba(hex, alpha = 0.5) {
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const num = parseInt(c, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}

window.colorEngine = new ColorEngine();
