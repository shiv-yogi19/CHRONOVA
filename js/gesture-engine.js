/**
 * CHRONOVA - Advanced Gesture Recognition Engine
 * Handles double-taps, swipes, long-presses, two-finger gestures with jitter prevention.
 * Created By Shiv Yogi
 */

class GestureEngine {
  constructor() {
    this.storage = window.storageEngine;
    this.clockEngine = window.clockEngine;
    this.widgetEngine = window.widgetEngine;
    this.colorEngine = window.colorEngine;

    // Gesture Configuration
    this.longPressThreshold = 450; // ms
    this.doubleTapThreshold = 300; // ms
    this.swipeMinDistance = 40; // px
    this.jitterTolerance = 12; // px

    // Tracking State
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchStartTime = 0;
    this.longPressTimer = null;
    this.isLongPressTriggered = false;
    this.touchCount = 0;

    // Double tap trackers
    this.lastClockTapTime = 0;
    this.lastDateTapTime = 0;

    this.init();
  }

  init() {
    this.bindTouchGestures();
    this.bindMouseGestures();
  }

  bindTouchGestures() {
    const stage = document.getElementById('stage');
    if (!stage) return;

    stage.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
    stage.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
    stage.addEventListener('touchend', (e) => this.handleTouchEnd(e));
    stage.addEventListener('touchcancel', () => this.cancelLongPress());
  }

  handleTouchStart(e) {
    this.touchCount = e.touches.length;
    this.isLongPressTriggered = false;

    if (this.touchCount === 1) {
      const touch = e.touches[0];
      this.touchStartX = touch.clientX;
      this.touchStartY = touch.clientY;
      this.touchStartTime = Date.now();

      const target = e.target;
      const digitSlot = target.closest('.digit-slot');
      const clockContainer = target.closest('#clock-container');

      // Individual Digit Long-press
      if (digitSlot) {
        const slotId = digitSlot.id.replace('digit-', '');
        this.longPressTimer = setTimeout(() => {
          this.isLongPressTriggered = true;
          if (this.colorEngine) {
            this.colorEngine.openModal(slotId);
            if (window.animationEngine) window.animationEngine.playSound('gotit');
          }
        }, this.longPressThreshold);
      } else if (clockContainer) {
        // Clock Long-press -> Appearance controls
        this.longPressTimer = setTimeout(() => {
          this.isLongPressTriggered = true;
          this.openAppearanceModal();
          if (window.animationEngine) window.animationEngine.playSound('gotit');
        }, this.longPressThreshold);
      }
    } else if (this.touchCount === 2 && this.storage.get('twoFingerGesturesEnabled')) {
      // Two-Finger Gestures
      this.touchStartTime = Date.now();
      this.longPressTimer = setTimeout(() => {
        // Two-Finger Long-Press -> Open Wallpaper Customization
        this.isLongPressTriggered = true;
        this.openWallpaperModal();
        if (window.animationEngine) window.animationEngine.playSound('gotit');
      }, this.longPressThreshold + 100);
    }
  }

  handleTouchMove(e) {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const deltaX = Math.abs(touch.clientX - this.touchStartX);
      const deltaY = Math.abs(touch.clientY - this.touchStartY);

      // Cancel long-press if moving beyond jitter tolerance
      if (deltaX > this.jitterTolerance || deltaY > this.jitterTolerance) {
        this.cancelLongPress();
      }
    } else {
      this.cancelLongPress();
    }
  }

  handleTouchEnd(e) {
    this.cancelLongPress();
    if (this.isLongPressTriggered) return;

    const elapsed = Date.now() - this.touchStartTime;

    // Two-Finger Tap -> Reveal/Toggle Settings Shortcut
    if (this.touchCount === 2 && elapsed < 350) {
      this.toggleFloatingSettingsBtn();
      if (window.animationEngine) window.animationEngine.playSound('click');
      return;
    }

    if (e.changedTouches.length === 1) {
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - this.touchStartX;
      const deltaY = touch.clientY - this.touchStartY;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);
      const target = document.elementFromPoint(touch.clientX, touch.clientY);

      const sensitivity = this.storage.get('gestureSensitivity') || 1;
      const minDistance = this.swipeMinDistance / sensitivity;

      // 1. Horizontal Swipe on Date / Widget Area
      if (target && target.closest('#widget-presentation') && absDeltaX > minDistance && absDeltaX > absDeltaY * 1.5) {
        if (deltaX < 0) {
          // Swipe Left -> Next Widget
          if (this.widgetEngine) this.widgetEngine.nextWidget();
        } else {
          // Swipe Right -> Prev Widget
          if (this.widgetEngine) this.widgetEngine.prevWidget();
        }
        return;
      }

      // 2. Vertical Swipe
      if (absDeltaY > minDistance * 1.5 && absDeltaY > absDeltaX * 1.5) {
        if (deltaY < -minDistance && this.touchStartY > window.innerHeight * 0.7) {
          // One-finger swipe UP from bottom -> Brightness controls
          this.openBrightnessModal();
          return;
        } else if (deltaY > minDistance && this.touchStartY < window.innerHeight * 0.35) {
          // One-finger swipe DOWN from top -> Quick controls
          this.toggleQuickControls(true);
          return;
        }
      }

      // 3. Double-tap recognition
      const now = Date.now();

      // Clock Double-Tap -> Change Font
      if (target && target.closest('#clock-container') && !target.closest('.digit-slot')) {
        if (now - this.lastClockTapTime < this.doubleTapThreshold) {
          if (this.clockEngine) this.clockEngine.cycleFont();
          this.lastClockTapTime = 0;
          return;
        }
        this.lastClockTapTime = now;
      }

      // Date Double-Tap -> Switch Widget
      if (target && target.closest('#widget-presentation')) {
        if (now - this.lastDateTapTime < this.doubleTapThreshold) {
          if (this.widgetEngine) this.widgetEngine.nextWidget();
          this.lastDateTapTime = 0;
          return;
        }
        this.lastDateTapTime = now;
      }
    }
  }

  cancelLongPress() {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  bindMouseGestures() {
    // Clock Double Click
    const clock = document.getElementById('clock-container');
    if (clock) {
      clock.addEventListener('dblclick', (e) => {
        if (!e.target.closest('.digit-slot')) {
          if (this.clockEngine) this.clockEngine.cycleFont();
        }
      });
    }

    // Date Double Click
    const widgetPres = document.getElementById('widget-presentation');
    if (widgetPres) {
      widgetPres.addEventListener('dblclick', () => {
        if (this.widgetEngine) this.widgetEngine.nextWidget();
      });
    }

    // Individual Digit Click & Hold / Right Click
    const digitSlots = document.querySelectorAll('.digit-slot');
    digitSlots.forEach((slot) => {
      let pressTimer = null;

      slot.addEventListener('mousedown', (e) => {
        if (e.button === 0) {
          pressTimer = setTimeout(() => {
            const slotId = slot.id.replace('digit-', '');
            if (this.colorEngine) this.colorEngine.openModal(slotId);
          }, 450);
        }
      });

      slot.addEventListener('mouseup', () => clearTimeout(pressTimer));
      slot.addEventListener('mouseleave', () => clearTimeout(pressTimer));

      // Right-click also opens color editor for convenience on desktop
      slot.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const slotId = slot.id.replace('digit-', '');
        if (this.colorEngine) this.colorEngine.openModal(slotId);
      });
    });
  }

  toggleFloatingSettingsBtn() {
    const btn = document.getElementById('floating-settings-btn');
    if (!btn) return;
    if (btn.style.display === 'none') {
      btn.style.display = 'flex';
      btn.classList.add('anim-scale-reveal');
    } else {
      btn.style.display = 'none';
    }
  }

  openAppearanceModal() {
    const modal = document.getElementById('appearance-modal');
    if (modal) modal.classList.add('active');
  }

  openWallpaperModal() {
    const modal = document.getElementById('wallpaper-modal');
    if (modal) modal.classList.add('active');
  }

  openBrightnessModal() {
    const modal = document.getElementById('quick-brightness-modal');
    if (modal) modal.classList.add('open');
  }

  toggleQuickControls(forceOpen = null) {
    const drawer = document.getElementById('quick-controls-drawer');
    if (!drawer) return;
    if (forceOpen !== null) {
      drawer.classList.toggle('open', forceOpen);
    } else {
      drawer.classList.toggle('open');
    }
  }
}

window.gestureEngine = new GestureEngine();
