/**
 * CHRONOVA - Storage Engine
 * Manages LocalStorage configuration and IndexedDB for custom wallpaper media.
 * Created By Shiv Yogi
 */

class StorageEngine {
  constructor() {
    this.prefix = 'chronova_';
    this.dbName = 'chronova_media_db';
    this.dbVersion = 1;
    this.storeName = 'media_blobs';
    this.db = null;

    this.defaultSettings = {
      // Clock
      hour12: true,
      showSeconds: true,
      colonStyle: 'pulse', // pulse, blink, solid
      clockTransition: 'slide', // flip, slide, fade, glow, scale, minimal
      selectedFont: 'orbitron',
      fontSize: 14, // vw basis
      fontWeight: 700,
      letterSpacing: 0.04, // em
      clockPosition: 'center', // center, top, bottom
      minimalMode: false,
      timezone: 'auto',

      // Appearance
      wallpaperBlur: 0,
      wallpaperBrightness: 100,
      wallpaperOpacity: 100,
      glowIntensity: 45,

      // Digit Colors (Individual)
      digitColors: {
        h1: '#ffffff',
        h2: '#ffffff',
        colon1: '#ffffff',
        m1: '#ffffff',
        m2: '#ffffff',
        colon2: '#ffffff',
        s1: '#ffffff',
        s2: '#ffffff',
        ampm: '#00f2fe'
      },
      applyToMatchingDigits: false,

      // RGB Engine
      rgbMode: false,
      rgbStyle: 'rainbow', // rainbow, smooth, breathing, random, gradient, neon
      rgbSpeed: 1, // 0.5x to 3x
      rgbInterval: 'continuous', // continuous, 1m, 2m, 5m, 10m, custom
      rgbCustomIntervalMinutes: 3,
      rgbPerDigitWave: true,

      // Wallpaper
      wallpaperCategory: 'dynamic', // dynamic, live, custom
      activeDynamicWallpaper: 'matrix', // matrix, neon-horizon, aurora, minimal-void, deep-ocean, celestial, liquid-lava, cyberpunk, geometric-prisms, retro-quartz, cosmic-nebula, zen-ink
      activeLiveTheme: 'chromatic-flux', // chromatic-flux, deep-aurora, electric-sunset, midnight-obsidian, cosmic-vapor, neon-tokyo, solar-flare, bioluminescence, hyperdrive, liquid-mercury
      hasCustomWallpaper: false,
      customWallpaperType: null, // 'image' or 'video'
      customWallpaperFit: 'cover',
      videoMuted: true,
      videoVolume: 50,

      // Widgets
      activeWidgetIndex: 0,
      autoRotateWidgets: false,
      widgetRotateInterval: 10, // seconds

      // Creator Branding Widget
      brandingAutoAlternate: true,
      brandingDisplayDuration: 5, // seconds date, 5 seconds branding
      brandingAnimationStyle: 'slide', // slide, zoom, glow-pulse, matrix, neon, flip3d, liquid-wave, shimmer, stagger, minimal-fade, bounce, cyberscan
      brandingTypographyIndex: 1, // 1 to 12

      // Always On Display & Wake Lock
      wakeLockEnabled: true,
      wakeLockDuration: 'unlimited', // 15m, 30m, 1h, 2h, unlimited
      dimDisplayOnIdle: false,
      dimDelayMinutes: 5,
      antiBurnInDrift: true,

      // Performance
      lowPowerMode: false,
      fpsLimit: 60, // 30 or 60
      soundEnabled: true,
      soundVolume: 60,

      // Gestures
      gestureSensitivity: 1, // multiplier
      twoFingerGesturesEnabled: true,

      // Meta
      onboardingCompleted: false
    };

    this.settings = Object.assign({}, this.defaultSettings);
    this.loadSettings();
    this.initIndexedDB();
  }

  loadSettings() {
    try {
      const raw = localStorage.getItem(`${this.prefix}settings`);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.settings = Object.assign({}, this.defaultSettings, parsed);
        // Ensure nested objects like digitColors are merged properly
        if (parsed.digitColors) {
          this.settings.digitColors = Object.assign({}, this.defaultSettings.digitColors, parsed.digitColors);
        }
      }
    } catch (e) {
      console.warn('[StorageEngine] Error loading settings from LocalStorage:', e);
      this.settings = Object.assign({}, this.defaultSettings);
    }
  }

  saveSettings() {
    try {
      localStorage.setItem(`${this.prefix}settings`, JSON.stringify(this.settings));
    } catch (e) {
      console.warn('[StorageEngine] Error saving settings to LocalStorage:', e);
    }
  }

  get(key) {
    return this.settings[key];
  }

  set(key, val) {
    this.settings[key] = val;
    this.saveSettings();
  }

  initIndexedDB() {
    if (!window.indexedDB) {
      console.warn('[StorageEngine] IndexedDB not supported by browser.');
      return;
    }
    const request = indexedDB.open(this.dbName, this.dbVersion);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(this.storeName)) {
        db.createObjectStore(this.storeName);
      }
    };
    request.onsuccess = (event) => {
      this.db = event.target.result;
    };
    request.onerror = (event) => {
      console.error('[StorageEngine] IndexedDB opening error:', event.target.error);
    };
  }

  async saveMedia(key, blob) {
    if (!this.db) await this.waitForDB();
    return new Promise((resolve, reject) => {
      try {
        const tx = this.db.transaction([this.storeName], 'readwrite');
        const store = tx.objectStore(this.storeName);
        const req = store.put(blob, key);
        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  async getMedia(key) {
    if (!this.db) await this.waitForDB();
    return new Promise((resolve, reject) => {
      try {
        const tx = this.db.transaction([this.storeName], 'readonly');
        const store = tx.objectStore(this.storeName);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  async deleteMedia(key) {
    if (!this.db) await this.waitForDB();
    return new Promise((resolve, reject) => {
      try {
        const tx = this.db.transaction([this.storeName], 'readwrite');
        const store = tx.objectStore(this.storeName);
        const req = store.delete(key);
        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  waitForDB() {
    return new Promise((resolve) => {
      if (this.db) return resolve();
      const interval = setInterval(() => {
        if (this.db) {
          clearInterval(interval);
          resolve();
        }
      }, 50);
    });
  }

  exportSettingsJSON() {
    return JSON.stringify(this.settings, null, 2);
  }

  importSettingsJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (typeof parsed !== 'object' || !parsed) return false;
      this.settings = Object.assign({}, this.defaultSettings, parsed);
      this.saveSettings();
      return true;
    } catch (e) {
      console.error('[StorageEngine] JSON import parse failed:', e);
      return false;
    }
  }

  resetAllSettings() {
    this.settings = Object.assign({}, this.defaultSettings);
    // Keep onboarding completed if reset to avoid annoying users unless requested
    this.settings.onboardingCompleted = true;
    this.saveSettings();
  }
}

window.storageEngine = new StorageEngine();
