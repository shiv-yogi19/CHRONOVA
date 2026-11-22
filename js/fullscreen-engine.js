/**
 * CHRONOVA - Fullscreen, Screen Orientation & Wake Lock Engine
 * Manages Screen Wake Lock API with re-acquisition, OLED anti-burn-in drift, and dim display modes.
 * Created By Shiv Yogi
 */

class FullscreenEngine {
  constructor() {
    this.storage = window.storageEngine;
    this.wakeLock = null;
    this.wakeLockTimer = null;
    this.idleTimer = null;
    this.lastActivityTime = Date.now();

    this.init();
  }

  init() {
    this.bindEvents();
    this.applyAODSettings();
    if (this.storage.get('wakeLockEnabled')) {
      this.requestWakeLock();
    }
  }

  bindEvents() {
    // Re-acquire Wake Lock when tab becomes visible again
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.storage.get('wakeLockEnabled')) {
        this.requestWakeLock();
      }
    });

    // Idle activity tracking for dim mode
    const resetActivity = () => {
      this.lastActivityTime = Date.now();
      const stage = document.getElementById('stage');
      if (stage && stage.classList.contains('dimmed-display')) {
        stage.classList.remove('dimmed-display');
      }
    };

    window.addEventListener('mousemove', resetActivity);
    window.addEventListener('touchstart', resetActivity);
    window.addEventListener('keydown', resetActivity);

    // Periodic idle checker
    setInterval(() => this.checkIdle(), 15000);

    // Fullscreen change listener
    document.addEventListener('fullscreenchange', () => this.updateFullscreenUI());
    document.addEventListener('webkitfullscreenchange', () => this.updateFullscreenUI());
  }

  async requestWakeLock() {
    if (!('wakeLock' in navigator)) {
      this.updateWakeLockBadge('Unsupported');
      return;
    }

    try {
      this.wakeLock = await navigator.wakeLock.request('screen');
      this.updateWakeLockBadge('Active');

      this.wakeLock.addEventListener('release', () => {
        this.updateWakeLockBadge('Inactive');
      });

      // Manage duration timer
      this.scheduleWakeLockRelease();
    } catch (err) {
      console.warn('[FullscreenEngine] Wake Lock acquisition error:', err);
      this.updateWakeLockBadge('Denied');
    }
  }

  scheduleWakeLockRelease() {
    if (this.wakeLockTimer) clearTimeout(this.wakeLockTimer);

    const duration = this.storage.get('wakeLockDuration');
    if (duration === 'unlimited') return;

    let ms = 15 * 60 * 1000;
    if (duration === '30m') ms = 30 * 60 * 1000;
    else if (duration === '1h') ms = 60 * 60 * 1000;
    else if (duration === '2h') ms = 120 * 60 * 1000;

    this.wakeLockTimer = setTimeout(() => {
      this.releaseWakeLock();
    }, ms);
  }

  releaseWakeLock() {
    if (this.wakeLock) {
      this.wakeLock.release().catch(() => {});
      this.wakeLock = null;
      this.updateWakeLockBadge('Inactive');
    }
  }

  updateWakeLockBadge(status) {
    const badge = document.getElementById('wake-lock-status-badge');
    if (!badge) return;
    badge.textContent = `AOD: ${status}`;
    badge.classList.toggle('active', status === 'Active');
  }

  toggleFullscreen() {
    const doc = document.documentElement;
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      if (doc.requestFullscreen) {
        doc.requestFullscreen().catch(() => {});
      } else if (doc.webkitRequestFullscreen) {
        doc.webkitRequestFullscreen();
      }
      this.lockOrientationLandscape();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  }

  async lockOrientationLandscape() {
    if (screen.orientation && screen.orientation.lock) {
      try {
        await screen.orientation.lock('landscape');
      } catch (err) {
        console.warn('[FullscreenEngine] Orientation lock warning:', err);
      }
    }
  }

  updateFullscreenUI() {
    const isFull = !!(document.fullscreenElement || document.webkitFullscreenElement);
    const btn = document.getElementById('fullscreen-toggle-btn');
    if (btn) btn.classList.toggle('active', isFull);
  }

  applyAODSettings() {
    const clockPresentation = document.getElementById('clock-presentation');
    const antiBurnIn = this.storage.get('antiBurnInDrift');

    if (clockPresentation) {
      clockPresentation.classList.toggle('aod-drift', antiBurnIn);
    }
  }

  checkIdle() {
    if (!this.storage.get('dimDisplayOnIdle')) return;
    const delayMinutes = this.storage.get('dimDelayMinutes') || 5;
    const idleMs = delayMinutes * 60 * 1000;

    if (Date.now() - this.lastActivityTime > idleMs) {
      const stage = document.getElementById('stage');
      if (stage) stage.classList.add('dimmed-display');
    }
  }
}

window.fullscreenEngine = new FullscreenEngine();
