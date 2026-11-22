/**
 * CHRONOVA - Animation Engine & Audio Synthesizer
 * Orchestrates 25 polished animations, digit transition modes, and synthetic UI sound effects.
 * Created By Shiv Yogi
 */

class AnimationEngine {
  constructor() {
    this.storage = window.storageEngine;
    this.audioCtx = null;

    // List of 25 Polished Animations
    this.animationsList = [
      { id: 'fade-reveal', name: 'Fade Reveal', cssClass: 'anim-fade-reveal' },
      { id: 'slide-up', name: 'Slide Up', cssClass: 'anim-slide-up' },
      { id: 'flip-digit', name: 'Flip Digit', cssClass: 'anim-flip-digit' },
      { id: 'scale-reveal', name: 'Scale Reveal', cssClass: 'anim-scale-reveal' },
      { id: 'blur-reveal', name: 'Blur Reveal', cssClass: 'anim-blur-reveal' },
      { id: 'liquid-transition', name: 'Liquid Transition', cssClass: 'anim-liquid-transition' },
      { id: 'rgb-flow', name: 'RGB Flow', cssClass: 'anim-rgb-flow' },
      { id: 'glow-pulse', name: 'Glow Pulse', cssClass: 'anim-glow-pulse' },
      { id: 'particle-motion', name: 'Particle Motion', cssClass: 'anim-particle-motion' },
      { id: 'glass-morph', name: 'Glass Morph', cssClass: 'anim-glass-morph' },
      { id: 'smooth-widget-slide', name: 'Smooth Widget Slide', cssClass: 'anim-widget-slide-next' },
      { id: 'elastic-reveal', name: 'Elastic Reveal', cssClass: 'anim-elastic-reveal' },
      { id: 'wave-transition', name: 'Wave Transition', cssClass: 'anim-wave-transition' },
      { id: 'gradient-flow', name: 'Gradient Flow', cssClass: 'anim-gradient-flow' },
      { id: 'neon-flicker', name: 'Neon Flicker', cssClass: 'anim-neon-flicker' },
      { id: 'rotate-reveal', name: 'Rotate Reveal', cssClass: 'anim-rotate-reveal' },
      { id: 'crossfade', name: 'Crossfade', cssClass: 'anim-crossfade' },
      { id: 'shimmer', name: 'Shimmer', cssClass: 'anim-shimmer' },
      { id: 'breathing-glow', name: 'Breathing Glow', cssClass: 'anim-breathing-glow' },
      { id: 'parallax', name: 'Parallax', cssClass: 'anim-parallax' },
      { id: 'liquid-ripple', name: 'Liquid Ripple', cssClass: 'anim-liquid-ripple' },
      { id: 'stagger-reveal', name: 'Stagger Reveal', cssClass: 'anim-stagger-1' },
      { id: 'morph-transition', name: 'Morph Transition', cssClass: 'anim-morph-transition' },
      { id: 'ambient-light', name: 'Ambient Light', cssClass: 'anim-ambient-light' },
      { id: 'smooth-exit', name: 'Smooth Exit', cssClass: 'anim-smooth-exit' }
    ];

    this.initAudio();
  }

  initAudio() {
    // Lazy initialize on first user interaction to comply with autoplay policy
    const unlockAudio = () => {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext && !this.audioCtx) {
          this.audioCtx = new AudioContext();
        }
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }
      } catch (e) {
        console.warn('[AnimationEngine] Web Audio init warning:', e);
      }
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };

    window.addEventListener('click', unlockAudio, { once: true });
    window.addEventListener('touchstart', unlockAudio, { once: true });
  }

  playSound(type) {
    if (!this.storage.get('soundEnabled')) return;
    if (!this.audioCtx) return;

    try {
      const vol = (this.storage.get('soundVolume') || 50) / 100;
      const now = this.audioCtx.currentTime;

      if (type === 'click') {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
        gain.gain.setValueAtTime(vol * 0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'gotit') {
        // Harmonious chord
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.04);
          gain.gain.setValueAtTime(vol * 0.2, now + idx * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.3);
          osc.connect(gain);
          gain.connect(this.audioCtx.destination);
          osc.start(now + idx * 0.04);
          osc.stop(now + idx * 0.04 + 0.35);
        });
      } else if (type === 'alarm') {
        // Double electronic beep
        [880, 880].forEach((freq, idx) => {
          const startTime = now + idx * 0.25;
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, startTime);
          gain.gain.setValueAtTime(vol * 0.4, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);
          osc.connect(gain);
          gain.connect(this.audioCtx.destination);
          osc.start(startTime);
          osc.stop(startTime + 0.16);
        });
      } else if (type === 'swoosh') {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.12);
        gain.gain.setValueAtTime(vol * 0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.13);
      }
    } catch (err) {
      console.warn('[AnimationEngine] Audio play error:', err);
    }
  }

  applyDigitTransition(element, transitionMode) {
    if (!element) return;
    if (transitionMode === 'minimal') return;

    let animClass = 'digit-slide-up';
    if (transitionMode === 'flip') animClass = 'anim-flip-digit';
    else if (transitionMode === 'fade') animClass = 'digit-fade';
    else if (transitionMode === 'glow') animClass = 'digit-glow-burst';
    else if (transitionMode === 'scale') animClass = 'digit-scale';

    element.classList.remove('digit-slide-up', 'anim-flip-digit', 'digit-fade', 'digit-glow-burst', 'digit-scale');
    // Force reflow
    void element.offsetWidth;
    element.classList.add(animClass);

    setTimeout(() => {
      element.classList.remove(animClass);
    }, 450);
  }

  createLiquidRipple(x, y) {
    const ripple = document.createElement('div');
    ripple.className = 'anim-liquid-ripple';
    ripple.style.left = `${x - 25}px`;
    ripple.style.top = `${y - 25}px`;
    ripple.style.width = '50px';
    ripple.style.height = '50px';
    document.body.appendChild(ripple);

    setTimeout(() => {
      if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
    }, 1000);
  }

  previewAnimation(animationId, previewElem) {
    const item = this.animationsList.find(a => a.id === animationId);
    if (!item || !previewElem) return;

    previewElem.className = 'animation-preview-box ' + item.cssClass;
    this.playSound('click');

    setTimeout(() => {
      previewElem.className = 'animation-preview-box';
    }, 1500);
  }
}

window.animationEngine = new AnimationEngine();
