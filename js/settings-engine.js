/**
 * CHRONOVA - Settings Engine
 * Comprehensive 15-category Liquid Glass settings system with live data binding and JSON export/import.
 * Created By Shiv Yogi
 */

class SettingsEngine {
  constructor() {
    this.storage = window.storageEngine;
    this.clockEngine = window.clockEngine;
    this.wallpaperEngine = window.wallpaperEngine;
    this.colorEngine = window.colorEngine;
    this.widgetEngine = window.widgetEngine;
    this.animationEngine = window.animationEngine;
    this.fullscreenEngine = window.fullscreenEngine;

    this.activeCategory = 'clock';

    this.init();
  }

  init() {
    this.bindSidebarTabs();
    this.bindControls();
    this.renderWallpapersGrid();
    this.renderLiveWallpapersGrid();
    this.renderFontsGrid();
    this.renderAnimationsGallery();
  }

  openSettings(category = 'clock') {
    const modal = document.getElementById('settings-modal');
    if (!modal) return;
    this.switchCategory(category);
    modal.classList.add('active');
    if (this.animationEngine) this.animationEngine.playSound('click');
  }

  closeSettings() {
    const modal = document.getElementById('settings-modal');
    if (modal) modal.classList.remove('active');
  }

  bindSidebarTabs() {
    const tabs = document.querySelectorAll('.settings-tab-btn');
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        this.switchCategory(tab.dataset.tab);
        if (this.animationEngine) this.animationEngine.playSound('click');
      });
    });

    // Close button
    const closeBtn = document.getElementById('close-settings-btn');
    if (closeBtn) closeBtn.addEventListener('click', () => this.closeSettings());

    // Overlay outside click
    const modal = document.getElementById('settings-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeSettings();
      });
    }

    // Floating launcher button
    const floatBtn = document.getElementById('floating-settings-btn');
    if (floatBtn) {
      floatBtn.addEventListener('click', () => this.openSettings());
    }
  }

  switchCategory(tabId) {
    this.activeCategory = tabId;

    // Tabs
    const tabs = document.querySelectorAll('.settings-tab-btn');
    tabs.forEach((tab) => {
      tab.classList.toggle('active', tab.dataset.tab === tabId);
    });

    // Panels
    const panels = document.querySelectorAll('.settings-panel-section');
    panels.forEach((p) => {
      p.classList.toggle('active', p.id === `settings-panel-${tabId}`);
    });
  }

  bindControls() {
    // Helper to bind a toggle switch
    const bindToggle = (id, key, onChange) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.checked = !!this.storage.get(key);
      el.addEventListener('change', (e) => {
        this.storage.set(key, e.target.checked);
        if (onChange) onChange(e.target.checked);
      });
    };

    // Helper to bind a slider with label
    const bindSlider = (id, labelId, key, unit, onChange) => {
      const el = document.getElementById(id);
      const label = document.getElementById(labelId);
      if (!el) return;
      el.value = this.storage.get(key);
      if (label) label.textContent = `${el.value}${unit}`;

      el.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        if (label) label.textContent = `${val}${unit}`;
        this.storage.set(key, val);
        if (onChange) onChange(val);
      });
    };

    // Helper to bind a select dropdown
    const bindSelect = (id, key, onChange) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.value = this.storage.get(key);
      el.addEventListener('change', (e) => {
        this.storage.set(key, e.target.value);
        if (onChange) onChange(e.target.value);
      });
    };

    /* 1. Clock Settings */
    bindToggle('set-hour12', 'hour12', () => this.clockEngine.tick());
    bindToggle('set-show-seconds', 'showSeconds', () => this.clockEngine.applyClockLayout());
    bindSelect('set-colon-style', 'colonStyle', () => this.clockEngine.applyClockLayout());
    bindSelect('set-clock-transition', 'clockTransition');
    bindSelect('set-clock-position', 'clockPosition', () => this.clockEngine.applyClockLayout());
    bindToggle('set-minimal-mode', 'minimalMode', () => this.clockEngine.applyClockLayout());
    bindSelect('set-timezone', 'timezone', () => this.clockEngine.tick());

    /* 2. Appearance */
    bindSlider('set-font-size', 'lbl-font-size', 'fontSize', 'vw', () => this.clockEngine.applyTypographySettings());
    bindSlider('set-font-weight', 'lbl-font-weight', 'fontWeight', '', () => this.clockEngine.applyTypographySettings());
    bindSlider('set-letter-spacing', 'lbl-letter-spacing', 'letterSpacing', 'em', () => this.clockEngine.applyTypographySettings());
    bindSlider('set-blur', 'lbl-blur', 'wallpaperBlur', 'px', () => this.wallpaperEngine.applyWallpaperSettings());
    bindSlider('set-brightness', 'lbl-brightness', 'wallpaperBrightness', '%', () => this.wallpaperEngine.applyWallpaperSettings());
    bindSlider('set-opacity', 'lbl-opacity', 'wallpaperOpacity', '%', () => this.wallpaperEngine.applyWallpaperSettings());

    /* 4. RGB Customization */
    bindToggle('set-rgb-mode', 'rgbMode', (on) => {
      if (!on) this.colorEngine.applyAllColors();
    });
    bindSelect('set-rgb-style', 'rgbStyle');
    bindSlider('set-rgb-speed', 'lbl-rgb-speed', 'rgbSpeed', 'x');
    bindSelect('set-rgb-interval', 'rgbInterval');
    bindToggle('set-rgb-wave', 'rgbPerDigitWave');

    /* 8. Custom Wallpaper Upload & Controls */
    const mediaInput = document.getElementById('custom-wallpaper-file-input');
    if (mediaInput) {
      mediaInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const isVideo = file.type.startsWith('video/');
        const type = isVideo ? 'video' : 'image';

        try {
          await this.storage.saveMedia('custom_wallpaper', file);
          this.storage.set('hasCustomWallpaper', true);
          this.storage.set('customWallpaperType', type);
          this.storage.set('wallpaperCategory', 'custom');
          this.wallpaperEngine.applyWallpaperSettings();
          alert('Custom wallpaper applied successfully!');
        } catch (err) {
          alert('Failed to save media: ' + err.message);
        }
      });
    }

    const removeCustomBtn = document.getElementById('remove-custom-wallpaper-btn');
    if (removeCustomBtn) {
      removeCustomBtn.addEventListener('click', async () => {
        await this.storage.deleteMedia('custom_wallpaper');
        this.storage.set('hasCustomWallpaper', false);
        this.storage.set('customWallpaperType', null);
        this.storage.set('wallpaperCategory', 'dynamic');
        this.wallpaperEngine.applyWallpaperSettings();
        alert('Custom wallpaper removed. Restored dynamic wallpaper.');
      });
    }

    bindToggle('set-video-muted', 'videoMuted', (muted) => {
      if (this.wallpaperEngine.customVideo) {
        this.wallpaperEngine.customVideo.muted = muted;
      }
    });

    bindSlider('set-video-volume', 'lbl-video-volume', 'videoVolume', '%', (vol) => {
      if (this.wallpaperEngine.customVideo) {
        this.wallpaperEngine.customVideo.volume = vol / 100;
      }
    });

    /* 10. Widgets & Creator Branding */
    bindToggle('set-branding-auto', 'brandingAutoAlternate');
    bindSlider('set-branding-duration', 'lbl-branding-duration', 'brandingDisplayDuration', 's', () => {
      this.widgetEngine.startBrandingAlternator();
    });
    bindSelect('set-branding-anim', 'brandingAnimationStyle', () => {
      this.widgetEngine.applyCreatorBrandingStyle();
    });
    bindSelect('set-branding-typo', 'brandingTypographyIndex', () => {
      this.widgetEngine.applyCreatorBrandingStyle();
    });

    /* 12. Always On Display */
    bindToggle('set-wakelock', 'wakeLockEnabled', (on) => {
      if (on) this.fullscreenEngine.requestWakeLock();
      else this.fullscreenEngine.releaseWakeLock();
    });
    bindSelect('set-wakelock-duration', 'wakeLockDuration', () => {
      this.fullscreenEngine.scheduleWakeLockRelease();
    });
    bindToggle('set-dim-idle', 'dimDisplayOnIdle');
    bindToggle('set-burnin-drift', 'antiBurnInDrift', () => {
      this.fullscreenEngine.applyAODSettings();
    });

    /* 13. Performance */
    bindToggle('set-low-power', 'lowPowerMode', () => {
      this.wallpaperEngine.initParticles();
    });
    bindSelect('set-fps-limit', 'fpsLimit');
    bindToggle('set-sound-enabled', 'soundEnabled');
    bindSlider('set-sound-volume', 'lbl-sound-volume', 'soundVolume', '%');

    /* 14. Gestures */
    bindSlider('set-gesture-sensitivity', 'lbl-gesture-sensitivity', 'gestureSensitivity', 'x');
    bindToggle('set-two-finger-gestures', 'twoFingerGesturesEnabled');

    /* 15. Privacy & Storage */
    const exportBtn = document.getElementById('export-settings-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const json = this.storage.exportSettingsJSON();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chronova_settings_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      });
    }

    const importInput = document.getElementById('import-settings-file-input');
    if (importInput) {
      importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
          const success = this.storage.importSettingsJSON(evt.target.result);
          if (success) {
            alert('Settings imported successfully! Reloading...');
            window.location.reload();
          } else {
            alert('Failed to parse settings JSON file.');
          }
        };
        reader.readAsText(file);
      });
    }

    const resetAllBtn = document.getElementById('reset-all-settings-btn');
    if (resetAllBtn) {
      resetAllBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all CHRONOVA settings to default?')) {
          this.storage.resetAllSettings();
          alert('Settings reset! Reloading application...');
          window.location.reload();
        }
      });
    }

    const replayTutorialBtn = document.getElementById('replay-tutorial-btn');
    if (replayTutorialBtn) {
      replayTutorialBtn.addEventListener('click', () => {
        this.closeSettings();
        if (window.app) window.app.startOnboarding();
      });
    }
  }

  /* Wallpapers Selectors */
  renderWallpapersGrid() {
    const grid = document.getElementById('dynamic-wallpapers-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const list = [
      { id: 'matrix', name: 'Cyber Matrix', color: '#00ff66' },
      { id: 'neon-horizon', name: 'Neon Horizon', color: '#ff007f' },
      { id: 'aurora', name: 'Aurora Borealis', color: '#50e3c2' },
      { id: 'minimal-void', name: 'Minimal Void', color: '#ffffff' },
      { id: 'deep-ocean', name: 'Deep Ocean Abyss', color: '#00d2ff' },
      { id: 'celestial', name: 'Golden Celestial', color: '#ffd700' },
      { id: 'liquid-lava', name: 'Liquid Lava Glass', color: '#ff5e36' },
      { id: 'cyberpunk', name: 'Cyberpunk Cityscape', color: '#ffee00' },
      { id: 'geometric-prisms', name: 'Geometric Prisms', color: '#a855f7' },
      { id: 'retro-quartz', name: 'Retro Quartz LED', color: '#39ff14' },
      { id: 'cosmic-nebula', name: 'Cosmic Nebula', color: '#e879f9' },
      { id: 'zen-ink', name: 'Zen Japanese Ink', color: '#ef4444' }
    ];

    const activeId = this.storage.get('activeDynamicWallpaper');

    list.forEach((item) => {
      const card = document.createElement('div');
      card.className = `wallpaper-card ${item.id === activeId ? 'active' : ''}`;
      card.style.background = `linear-gradient(135deg, #070913 0%, ${item.color}33 100%)`;

      const title = document.createElement('div');
      title.className = 'wallpaper-card-title';
      title.textContent = item.name;
      card.appendChild(title);

      card.addEventListener('click', () => {
        document.querySelectorAll('#dynamic-wallpapers-grid .wallpaper-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.storage.set('wallpaperCategory', 'dynamic');
        this.storage.set('activeDynamicWallpaper', item.id);
        this.wallpaperEngine.applyWallpaperSettings();
        if (this.animationEngine) this.animationEngine.playSound('click');
      });

      grid.appendChild(card);
    });
  }

  renderLiveWallpapersGrid() {
    const grid = document.getElementById('live-wallpapers-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const list = [
      { id: 'chromatic-flux', name: 'Chromatic Flux', color: '#a855f7' },
      { id: 'deep-aurora', name: 'Deep Aurora', color: '#10b981' },
      { id: 'electric-sunset', name: 'Electric Sunset', color: '#f97316' },
      { id: 'midnight-obsidian', name: 'Midnight Obsidian', color: '#3b82f6' },
      { id: 'cosmic-vapor', name: 'Cosmic Vapor', color: '#ec4899' },
      { id: 'neon-tokyo', name: 'Neon Tokyo', color: '#06b6d4' },
      { id: 'solar-flare', name: 'Solar Flare', color: '#ef4444' },
      { id: 'bioluminescence', name: 'Bioluminescence', color: '#14b8a6' },
      { id: 'hyperdrive', name: 'Hyperdrive Starfield', color: '#ffffff' },
      { id: 'liquid-mercury', name: 'Liquid Mercury', color: '#94a3b8' }
    ];

    const activeId = this.storage.get('activeLiveTheme');

    list.forEach((item) => {
      const card = document.createElement('div');
      card.className = `wallpaper-card ${item.id === activeId ? 'active' : ''}`;
      card.style.background = `radial-gradient(circle, ${item.color}44 0%, #06070e 100%)`;

      const title = document.createElement('div');
      title.className = 'wallpaper-card-title';
      title.textContent = item.name;
      card.appendChild(title);

      card.addEventListener('click', () => {
        document.querySelectorAll('#live-wallpapers-grid .wallpaper-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.storage.set('wallpaperCategory', 'live');
        this.storage.set('activeLiveTheme', item.id);
        this.wallpaperEngine.applyWallpaperSettings();
        if (this.animationEngine) this.animationEngine.playSound('click');
      });

      grid.appendChild(card);
    });
  }

  renderFontsGrid() {
    const grid = document.getElementById('fonts-selector-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const activeFont = this.storage.get('selectedFont') || 'orbitron';

    this.clockEngine.fonts.forEach((f) => {
      const card = document.createElement('div');
      card.className = `font-card ${f.id === activeFont ? 'active' : ''}`;

      const sample = document.createElement('div');
      sample.className = `font-card-sample ${f.className}`;
      sample.textContent = '12:45';

      const name = document.createElement('div');
      name.className = 'font-card-name';
      name.textContent = f.name;

      card.appendChild(sample);
      card.appendChild(name);

      card.addEventListener('click', () => {
        document.querySelectorAll('#fonts-selector-grid .font-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.clockEngine.setFont(f.id);
        if (this.animationEngine) this.animationEngine.playSound('click');
      });

      grid.appendChild(card);
    });
  }

  renderAnimationsGallery() {
    const gallery = document.getElementById('animations-gallery-grid');
    if (!gallery) return;
    gallery.innerHTML = '';

    this.animationEngine.animationsList.forEach((anim) => {
      const card = document.createElement('div');
      card.className = 'setting-row';
      card.style.padding = '0.75rem';
      card.style.background = 'rgba(255, 255, 255, 0.04)';
      card.style.borderRadius = '0.9rem';

      const label = document.createElement('div');
      label.className = 'setting-name';
      label.textContent = anim.name;

      const triggerBtn = document.createElement('button');
      triggerBtn.className = 'glass-btn glass-btn-secondary';
      triggerBtn.textContent = 'Test Demo';

      triggerBtn.addEventListener('click', () => {
        this.animationEngine.previewAnimation(anim.id, triggerBtn);
      });

      card.appendChild(label);
      card.appendChild(triggerBtn);
      gallery.appendChild(card);
    });
  }
}

window.settingsEngine = new SettingsEngine();
