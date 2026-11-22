/**
 * CHRONOVA - Main Application Bootstrapper
 * Orchestrates onboarding tutorial, keyboard shortcuts, PWA registration, and global state.
 * Created By Shiv Yogi
 */

class ChronovaApp {
  constructor() {
    this.storage = window.storageEngine;
    this.animationEngine = window.animationEngine;
    this.clockEngine = window.clockEngine;
    this.widgetEngine = window.widgetEngine;
    this.wallpaperEngine = window.wallpaperEngine;
    this.settingsEngine = window.settingsEngine;
    this.fullscreenEngine = window.fullscreenEngine;
    this.colorEngine = window.colorEngine;

    // 7 Sequential Onboarding Steps
    this.onboardingSteps = [
      {
        step: 1,
        title: 'Instant Font Morphing',
        desc: 'Double-tap the clock anywhere to effortlessly cycle through 10+ futuristic & digital typography styles.',
        animClass: 'anim-elastic-reveal',
        icon: '<svg viewBox="0 0 24 24"><path d="M2.5 4v3h5v12h3V7h5V4h-13zm19 5h-9v3h3v7h3v-7h3V9z"/></svg>'
      },
      {
        step: 2,
        title: 'Smart Widget Carousel',
        desc: 'Double-tap the date display to instantly cycle between intelligent time, date, stopwatch, and weather widgets.',
        animClass: 'anim-slide-up',
        icon: '<svg viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/></svg>'
      },
      {
        step: 3,
        title: 'Smooth Gesture Swipes',
        desc: 'Swipe left or right directly across the widget area to freely browse through the full suite of live widgets.',
        animClass: 'anim-widget-slide-next',
        icon: '<svg viewBox="0 0 24 24"><path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z"/></svg>'
      },
      {
        step: 4,
        title: 'Per-Digit Color Editor',
        desc: 'Long-press any individual digit (or right-click) to open the floating Liquid Glass color customizer.',
        animClass: 'anim-glow-pulse',
        icon: '<svg viewBox="0 0 24 24"><path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 19.4c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l1.9-1.9C9.23 19.59 10.56 20 12 20c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 15c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/></svg>'
      },
      {
        step: 5,
        title: 'Two-Finger Wallpapers',
        desc: 'Long-press with two fingers anywhere on screen to quickly reveal dynamic and live wallpaper themes.',
        animClass: 'anim-blur-reveal',
        icon: '<svg viewBox="0 0 24 24"><path d="M4 4h7V2H4c-1.1 0-2 .9-2 2v7h2V4zm6 9l-4 5h12l-3-4-2.03 2.71L10 13zm10-9h-7v2h7v7h2V4c0-1.1-.9-2-2-2zm0 16h-7v2h7c1.1 0 2-.9 2-2v-7h-2v7zM4 13H2v7c0 1.1.9 2 2 2h7v-2H4v-7z"/></svg>'
      },
      {
        step: 6,
        title: 'Two-Finger Settings',
        desc: 'Tap with two fingers to toggle the floating Liquid Glass settings shortcut in the bottom-right corner.',
        animClass: 'anim-rotate-reveal',
        icon: '<svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>'
      },
      {
        step: 7,
        title: 'Master Customization',
        desc: 'CHRONOVA is fully yours. Fine-tune RGB animations, always-on display, Wake Lock, and offline PWA.',
        animClass: 'anim-glass-morph',
        icon: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>'
      }
    ];

    this.currentOnboardingStep = 0;

    this.init();
  }

  init() {
    this.bindKeyboardShortcuts();
    this.bindQuickControls();
    this.registerServiceWorker();
    this.checkOnboarding();
  }

  /* Onboarding Flow */
  checkOnboarding() {
    const completed = this.storage.get('onboardingCompleted');
    if (!completed) {
      this.startOnboarding();
    }
  }

  startOnboarding() {
    this.currentOnboardingStep = 0;
    const overlay = document.getElementById('onboarding-overlay');
    if (!overlay) return;

    this.renderOnboardingCard();
    overlay.classList.add('active');

    // Bind Got It button
    const actionBtn = document.getElementById('onboarding-gotit-btn');
    if (actionBtn) {
      actionBtn.onclick = () => this.advanceOnboarding();
    }
  }

  renderOnboardingCard() {
    const stepData = this.onboardingSteps[this.currentOnboardingStep];
    if (!stepData) return;

    const counter = document.getElementById('onboarding-step-counter');
    const iconWrap = document.getElementById('onboarding-icon-wrap');
    const title = document.getElementById('onboarding-title');
    const desc = document.getElementById('onboarding-desc');
    const card = document.querySelector('.onboarding-card');

    if (counter) counter.textContent = `Instruction ${stepData.step} of 7`;
    if (iconWrap) iconWrap.innerHTML = stepData.icon;
    if (title) title.textContent = stepData.title;
    if (desc) desc.textContent = stepData.desc;

    if (card) {
      card.className = `onboarding-card ${stepData.animClass}`;
    }
  }

  advanceOnboarding() {
    if (this.animationEngine) this.animationEngine.playSound('gotit');

    this.currentOnboardingStep++;
    if (this.currentOnboardingStep < this.onboardingSteps.length) {
      this.renderOnboardingCard();
    } else {
      // Completed! Animate overlay out and reveal clock with staggered digit animation
      const overlay = document.getElementById('onboarding-overlay');
      if (overlay) {
        overlay.classList.remove('active');
      }

      this.storage.set('onboardingCompleted', true);
      this.triggerStaggeredClockEntrance();
    }
  }

  triggerStaggeredClockEntrance() {
    const slots = ['h1', 'h2', 'colon-1', 'm1', 'm2', 'colon-2', 's1', 's2'];
    slots.forEach((slot, idx) => {
      let el;
      if (slot.startsWith('colon')) el = document.getElementById(slot);
      else el = document.getElementById(`digit-${slot}`);

      if (el) {
        el.classList.add(`anim-stagger-${(idx % 6) + 1}`);
        setTimeout(() => {
          el.classList.remove(`anim-stagger-${(idx % 6) + 1}`);
        }, 1200);
      }
    });
  }

  /* Desktop Keyboard Shortcuts */
  bindKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Do not trigger shortcuts if user is typing in an input or textarea
      const tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      const key = e.key.toLowerCase();

      switch (key) {
        case 'f':
          e.preventDefault();
          this.fullscreenEngine.toggleFullscreen();
          break;

        case 's':
          e.preventDefault();
          const settingsModal = document.getElementById('settings-modal');
          if (settingsModal && settingsModal.classList.contains('active')) {
            this.settingsEngine.closeSettings();
          } else {
            this.settingsEngine.openSettings();
          }
          break;

        case 'arrowleft':
          e.preventDefault();
          this.widgetEngine.prevWidget();
          break;

        case 'arrowright':
          e.preventDefault();
          this.widgetEngine.nextWidget();
          break;

        case ' ': // Space bar
          e.preventDefault();
          if (this.wallpaperEngine.paused) {
            this.wallpaperEngine.resume();
          } else {
            this.wallpaperEngine.pause();
          }
          break;

        case 'r':
          e.preventDefault();
          // Cycle dynamic wallpapers or fonts
          this.clockEngine.cycleFont();
          break;

        case 'escape':
          // Close active modals
          document.querySelectorAll('.modal-overlay.active').forEach((modal) => {
            modal.classList.remove('active');
          });
          const drawer = document.getElementById('quick-controls-drawer');
          if (drawer) drawer.classList.remove('open');
          const brightModal = document.getElementById('quick-brightness-modal');
          if (brightModal) brightModal.classList.remove('open');
          break;
      }
    });
  }

  /* Quick Controls Drawer & Buttons */
  bindQuickControls() {
    // Quick Drawer Toggle
    const topBar = document.getElementById('top-bar');
    const drawer = document.getElementById('quick-controls-drawer');
    const closeDrawerBtn = document.getElementById('close-quick-drawer-btn');

    if (closeDrawerBtn && drawer) {
      closeDrawerBtn.addEventListener('click', () => drawer.classList.remove('open'));
    }

    // Quick Fullscreen Button
    const quickFullBtn = document.getElementById('quick-btn-fullscreen');
    if (quickFullBtn) {
      quickFullBtn.addEventListener('click', () => {
        this.fullscreenEngine.toggleFullscreen();
        if (drawer) drawer.classList.remove('open');
      });
    }

    // Top Bar Fullscreen Button
    const topFullBtn = document.getElementById('fullscreen-toggle-btn');
    if (topFullBtn) {
      topFullBtn.addEventListener('click', () => this.fullscreenEngine.toggleFullscreen());
    }

    // Quick Low Power Button
    const quickPowerBtn = document.getElementById('quick-btn-power');
    if (quickPowerBtn) {
      quickPowerBtn.addEventListener('click', () => {
        const current = this.storage.get('lowPowerMode');
        this.storage.set('lowPowerMode', !current);
        quickPowerBtn.classList.toggle('active', !current);
        this.wallpaperEngine.initParticles();
      });
    }

    // Quick Theme Switch
    const quickThemeBtn = document.getElementById('quick-btn-theme');
    if (quickThemeBtn) {
      quickThemeBtn.addEventListener('click', () => {
        const wallpapers = ['matrix', 'neon-horizon', 'aurora', 'minimal-void', 'deep-ocean', 'celestial', 'liquid-lava', 'cyberpunk', 'geometric-prisms', 'retro-quartz', 'cosmic-nebula', 'zen-ink'];
        const current = this.storage.get('activeDynamicWallpaper');
        const next = wallpapers[(wallpapers.indexOf(current) + 1) % wallpapers.length];
        this.storage.set('wallpaperCategory', 'dynamic');
        this.storage.set('activeDynamicWallpaper', next);
        this.wallpaperEngine.applyWallpaperSettings();
        if (this.animationEngine) this.animationEngine.playSound('click');
      });
    }

    // Quick Brightness Overlay slider
    const quickBrightnessSlider = document.getElementById('quick-brightness-slider');
    const closeBrightModalBtn = document.getElementById('close-brightness-modal-btn');
    const brightModal = document.getElementById('quick-brightness-modal');

    if (quickBrightnessSlider) {
      quickBrightnessSlider.value = this.storage.get('wallpaperBrightness') || 100;
      quickBrightnessSlider.addEventListener('input', (e) => {
        const val = e.target.value;
        this.storage.set('wallpaperBrightness', val);
        this.wallpaperEngine.applyWallpaperSettings();
      });
    }

    if (closeBrightModalBtn && brightModal) {
      closeBrightModalBtn.addEventListener('click', () => brightModal.classList.remove('open'));
    }

    // Portrait hint pill click -> lock landscape fullscreen
    const portraitPill = document.getElementById('portrait-hint-pill');
    if (portraitPill) {
      portraitPill.addEventListener('click', () => {
        this.fullscreenEngine.toggleFullscreen();
      });
    }

    // Top Brand Badge click -> Open Creator Branding Settings
    const brandBadge = document.querySelector('.brand-badge');
    if (brandBadge) {
      brandBadge.addEventListener('click', () => {
        this.settingsEngine.openSettings('widgets');
      });
    }
  }

  /* PWA Service Worker Registration */
  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
          .then((reg) => {
            console.log('[CHRONOVA] PWA Service Worker registered:', reg.scope);
          })
          .catch((err) => {
            console.warn('[CHRONOVA] Service Worker registration failed:', err);
          });
      });
    }
  }
}

// Instantiate application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new ChronovaApp();
});
