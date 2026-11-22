/**
 * CHRONOVA - Wallpaper Engine
 * 12 Dynamic Wallpapers with Integrated Clock Styling, 10 Live Wallpapers & Custom Media.
 * Created By Shiv Yogi
 */

class WallpaperEngine {
  constructor() {
    this.storage = window.storageEngine;
    this.canvas = document.getElementById('wallpaper-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.container = document.getElementById('custom-wallpaper-container');
    this.customImg = document.getElementById('custom-wallpaper-img');
    this.customVideo = document.getElementById('custom-wallpaper-video');

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2 for mobile efficiency
    this.animId = null;
    this.lastTime = performance.now();
    this.paused = false;

    // Simulation State
    this.time = 0;
    this.particles = [];
    this.matrixColumns = [];
    this.stars = [];

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pause();
      } else {
        this.resume();
      }
    });

    this.initParticles();
    this.applyWallpaperSettings();
    this.startLoop();
  }

  resize() {
    if (!this.canvas) return;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    if (this.ctx) {
      this.ctx.scale(this.dpr, this.dpr);
    }
    this.initMatrix();
    this.initStars();
  }

  initParticles() {
    this.particles = [];
    const count = this.storage.get('lowPowerMode') ? 35 : 75;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: Math.random() * 2.5 + 0.8,
        alpha: Math.random() * 0.7 + 0.3,
        hue: Math.random() * 360
      });
    }
  }

  initMatrix() {
    const fontSize = 16;
    const columns = Math.ceil(this.width / fontSize);
    this.matrixColumns = [];
    for (let i = 0; i < columns; i++) {
      this.matrixColumns[i] = Math.floor(Math.random() * -100);
    }
  }

  initStars() {
    this.stars = [];
    const starCount = 120;
    for (let i = 0; i < starCount; i++) {
      this.stars.push({
        x: (Math.random() - 0.5) * this.width * 2,
        y: (Math.random() - 0.5) * this.height * 2,
        z: Math.random() * this.width,
        pz: 0
      });
    }
  }

  applyWallpaperSettings() {
    const root = document.documentElement;
    const blur = this.storage.get('wallpaperBlur') || 0;
    const brightness = this.storage.get('wallpaperBrightness') || 100;
    const opacity = (this.storage.get('wallpaperOpacity') || 100) / 100;

    root.style.setProperty('--wallpaper-blur', `${blur}px`);
    root.style.setProperty('--wallpaper-brightness', `${brightness}%`);
    root.style.setProperty('--wallpaper-opacity', opacity);

    const category = this.storage.get('wallpaperCategory') || 'dynamic';

    if (category === 'custom') {
      if (this.container) this.container.style.display = 'block';
      if (this.canvas) this.canvas.style.display = 'none';
      this.loadCustomMedia();
    } else {
      if (this.container) this.container.style.display = 'none';
      if (this.canvas) this.canvas.style.display = 'block';
      this.updateThemeClass();
    }
  }

  updateThemeClass() {
    const appRoot = document.getElementById('app-root');
    if (!appRoot) return;

    // Remove old theme classes
    Array.from(appRoot.classList).forEach(cls => {
      if (cls.startsWith('theme-')) appRoot.classList.remove(cls);
    });

    const category = this.storage.get('wallpaperCategory');
    if (category === 'dynamic') {
      const active = this.storage.get('activeDynamicWallpaper') || 'matrix';
      appRoot.classList.add(`theme-${active}`);
    }
  }

  async loadCustomMedia() {
    const type = this.storage.get('customWallpaperType');
    if (!type) return;

    try {
      const blob = await this.storage.getMedia('custom_wallpaper');
      if (!blob) return;

      const mediaUrl = URL.createObjectURL(blob);
      if (type === 'image' && this.customImg) {
        this.customImg.src = mediaUrl;
        this.customImg.style.display = 'block';
        if (this.customVideo) this.customVideo.style.display = 'none';
      } else if (type === 'video' && this.customVideo) {
        this.customVideo.src = mediaUrl;
        this.customVideo.style.display = 'block';
        if (this.customImg) this.customImg.style.display = 'none';
        this.customVideo.muted = this.storage.get('videoMuted');
        this.customVideo.volume = (this.storage.get('videoVolume') || 50) / 100;
        this.customVideo.play().catch(e => console.warn('[WallpaperEngine] Video autoplay wait:', e));
      }
    } catch (err) {
      console.warn('[WallpaperEngine] Custom media loading error:', err);
    }
  }

  startLoop() {
    if (this.animId) cancelAnimationFrame(this.animId);

    const loop = (currentTime) => {
      const delta = currentTime - this.lastTime;
      const targetFps = this.storage.get('lowPowerMode') ? 30 : (this.storage.get('fpsLimit') || 60);
      const interval = 1000 / targetFps;

      if (delta >= interval) {
        this.lastTime = currentTime - (delta % interval);
        if (!this.paused) {
          this.time += delta * 0.001;
          this.render();
          // Also feed delta to RGB Color Engine
          if (window.colorEngine) {
            window.colorEngine.updateRGBFrame(delta);
          }
        }
      }

      this.animId = requestAnimationFrame(loop);
    };

    this.animId = requestAnimationFrame(loop);
  }

  pause() {
    this.paused = true;
    if (this.customVideo && !this.customVideo.paused) {
      this.customVideo.pause();
    }
  }

  resume() {
    this.paused = false;
    this.lastTime = performance.now();
    if (this.customVideo && this.storage.get('wallpaperCategory') === 'custom') {
      this.customVideo.play().catch(() => {});
    }
  }

  render() {
    if (!this.ctx) return;
    const category = this.storage.get('wallpaperCategory') || 'dynamic';

    if (category === 'dynamic') {
      const active = this.storage.get('activeDynamicWallpaper') || 'matrix';
      this.renderDynamic(active);
    } else if (category === 'live') {
      const liveTheme = this.storage.get('activeLiveTheme') || 'chromatic-flux';
      this.renderLive(liveTheme);
    }
  }

  /* 12 DYNAMIC WALLPAPERS */
  renderDynamic(name) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const t = this.time;

    switch (name) {
      case 'matrix': {
        // Digital Rain Canvas
        ctx.fillStyle = 'rgba(7, 8, 14, 0.2)';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#00ff66';
        ctx.font = '14px monospace';

        const chars = '0123456789ABCDEFSHIVYOGICHRONOVA';
        for (let i = 0; i < this.matrixColumns.length; i++) {
          const char = chars.charAt(Math.floor(Math.random() * chars.length));
          const x = i * 16;
          const y = this.matrixColumns[i] * 16;

          // Bright leading character
          ctx.fillStyle = '#ffffff';
          ctx.fillText(char, x, y);
          ctx.fillStyle = '#00ff66';

          if (y > h && Math.random() > 0.975) {
            this.matrixColumns[i] = 0;
          }
          this.matrixColumns[i]++;
        }
        break;
      }

      case 'neon-horizon': {
        // 80s Synthwave Grid & Sunset
        ctx.fillStyle = '#080512';
        ctx.fillRect(0, 0, w, h);

        // Neon Horizon Sun
        const sunY = h * 0.45;
        const grad = ctx.createLinearGradient(0, sunY - 120, 0, sunY + 60);
        grad.addColorStop(0, '#ffee00');
        grad.addColorStop(0.5, '#ff007f');
        grad.addColorStop(1, '#7928ca');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(w / 2, sunY, 110, 0, Math.PI * 2);
        ctx.fill();

        // Sun Scanlines
        ctx.fillStyle = '#080512';
        for (let i = 0; i < 8; i++) {
          const sy = sunY + 15 + i * 12;
          ctx.fillRect(w / 2 - 120, sy, 240, 3 + i * 0.8);
        }

        // Perspective Grid
        ctx.strokeStyle = 'rgba(0, 242, 254, 0.4)';
        ctx.lineWidth = 1.5;
        const horizon = h * 0.52;
        const gridSpeed = (t * 80) % 40;

        // Horizontal lines
        for (let y = horizon; y < h; y += (y - horizon) * 0.35 + 8) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }

        // Vanishing lines
        for (let x = -w; x < w * 2; x += 90) {
          ctx.beginPath();
          ctx.moveTo(w / 2, horizon);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        break;
      }

      case 'aurora': {
        // Northern Lights Ribbons & Stars
        ctx.fillStyle = '#040711';
        ctx.fillRect(0, 0, w, h);

        // Stars
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let i = 0; i < 40; i++) {
          const sx = (Math.sin(i * 99 + t * 0.05) * 0.5 + 0.5) * w;
          const sy = (Math.cos(i * 33 + t * 0.05) * 0.5 + 0.5) * (h * 0.6);
          ctx.fillRect(sx, sy, 1.5, 1.5);
        }

        // Aurora Curtains
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(0, h * 0.4);
          for (let x = 0; x <= w; x += 30) {
            const y = h * 0.35 + Math.sin(x * 0.003 + t * 0.5 + i) * 60 + Math.cos(x * 0.005 + t * 0.3) * 40;
            ctx.lineTo(x, y);
          }
          ctx.lineTo(w, 0);
          ctx.lineTo(0, 0);
          ctx.closePath();

          const auroraGrad = ctx.createLinearGradient(0, 0, 0, h * 0.6);
          if (i === 0) {
            auroraGrad.addColorStop(0, 'rgba(80, 227, 194, 0.25)');
            auroraGrad.addColorStop(1, 'transparent');
          } else if (i === 1) {
            auroraGrad.addColorStop(0, 'rgba(155, 81, 224, 0.2)');
            auroraGrad.addColorStop(1, 'transparent');
          } else {
            auroraGrad.addColorStop(0, 'rgba(0, 242, 254, 0.15)');
            auroraGrad.addColorStop(1, 'transparent');
          }
          ctx.fillStyle = auroraGrad;
          ctx.fill();
        }
        break;
      }

      case 'minimal-void': {
        // OLED Black with Subtle Breathing Cosmic Ring
        ctx.fillStyle = '#030408';
        ctx.fillRect(0, 0, w, h);

        const ringRadius = Math.min(w, h) * 0.32;
        const breath = Math.sin(t * 0.8) * 15;
        const ringGrad = ctx.createRadialGradient(w / 2, h / 2, ringRadius - 40, w / 2, h / 2, ringRadius + 40);
        ringGrad.addColorStop(0, 'transparent');
        ringGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.06)');
        ringGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = ringGrad;
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, ringRadius + breath, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'deep-ocean': {
        // Abyss Bioluminescent Spores & Caustic Light
        const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
        bgGrad.addColorStop(0, '#020c1b');
        bgGrad.addColorStop(1, '#01050a');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        // Rising luminous bubbles & spores
        this.particles.forEach((p, idx) => {
          p.y -= 0.6;
          p.x += Math.sin(t + idx) * 0.5;
          if (p.y < 0) p.y = h;

          ctx.fillStyle = `rgba(0, 210, 255, ${p.alpha * 0.6})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 1.5, 0, Math.PI * 2);
          ctx.fill();
        });
        break;
      }

      case 'celestial': {
        // Rotating Golden Astrological Dials
        ctx.fillStyle = '#07060f';
        ctx.fillRect(0, 0, w, h);

        const cx = w / 2;
        const cy = h / 2;
        const baseR = Math.min(w, h) * 0.38;

        ctx.strokeStyle = 'rgba(255, 215, 0, 0.15)';
        ctx.lineWidth = 1;

        // Dial 1
        ctx.beginPath();
        ctx.arc(cx, cy, baseR, 0, Math.PI * 2);
        ctx.stroke();

        // Dial 2 (Offset rotation)
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(t * 0.1);
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.25)';
        ctx.strokeRect(-baseR * 0.7, -baseR * 0.7, baseR * 1.4, baseR * 1.4);
        ctx.restore();

        // Dial 3 (Counter rotation)
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(-t * 0.08);
        ctx.beginPath();
        ctx.arc(0, 0, baseR * 0.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        break;
      }

      case 'liquid-lava': {
        // Fluid Gradient Lava Blobs
        ctx.fillStyle = '#0f0502';
        ctx.fillRect(0, 0, w, h);

        for (let i = 0; i < 4; i++) {
          const bx = w * 0.5 + Math.sin(t * 0.5 + i * 1.5) * (w * 0.3);
          const by = h * 0.5 + Math.cos(t * 0.6 + i * 1.2) * (h * 0.25);
          const bGrad = ctx.createRadialGradient(bx, by, 10, bx, by, 220);
          bGrad.addColorStop(0, 'rgba(255, 94, 54, 0.35)');
          bGrad.addColorStop(0.6, 'rgba(255, 30, 0, 0.12)');
          bGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = bGrad;
          ctx.beginPath();
          ctx.arc(bx, by, 220, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'cyberpunk': {
        // Neon Cityscape Silhouette
        ctx.fillStyle = '#0a0514';
        ctx.fillRect(0, 0, w, h);

        // Distant smog glow
        const fog = ctx.createLinearGradient(0, h * 0.4, 0, h);
        fog.addColorStop(0, 'transparent');
        fog.addColorStop(0.6, 'rgba(255, 0, 85, 0.15)');
        fog.addColorStop(1, 'rgba(255, 238, 0, 0.1)');
        ctx.fillStyle = fog;
        ctx.fillRect(0, h * 0.4, w, h * 0.6);

        // Skyline Buildings
        ctx.fillStyle = '#05020a';
        const numBld = 12;
        const bWidth = w / numBld;
        for (let i = 0; i < numBld; i++) {
          const bHeight = 100 + ((i * 37) % 220);
          ctx.fillRect(i * bWidth, h - bHeight, bWidth - 4, bHeight);

          // Glowing windows
          ctx.fillStyle = (i % 2 === 0) ? 'rgba(0, 242, 254, 0.6)' : 'rgba(255, 238, 0, 0.6)';
          for (let wy = h - bHeight + 20; wy < h - 20; wy += 35) {
            ctx.fillRect(i * bWidth + 8, wy, 6, 12);
          }
          ctx.fillStyle = '#05020a';
        }
        break;
      }

      case 'geometric-prisms': {
        // Floating 3D Wireframe Polyhedra
        ctx.fillStyle = '#070815';
        ctx.fillRect(0, 0, w, h);

        ctx.strokeStyle = 'rgba(168, 85, 247, 0.3)';
        ctx.lineWidth = 1.5;

        for (let i = 0; i < 3; i++) {
          ctx.save();
          ctx.translate(w * (0.25 + i * 0.25), h * 0.5 + Math.sin(t + i) * 30);
          ctx.rotate(t * 0.4 + i);
          const size = 60 + i * 25;
          ctx.strokeRect(-size / 2, -size / 2, size, size);
          ctx.rotate(Math.PI / 4);
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
          ctx.strokeRect(-size / 2, -size / 2, size, size);
          ctx.restore();
        }
        break;
      }

      case 'retro-quartz': {
        // Classic Green VFD / CRT Chassis
        ctx.fillStyle = '#051108';
        ctx.fillRect(0, 0, w, h);

        // Phosphor grid
        ctx.strokeStyle = 'rgba(57, 255, 20, 0.05)';
        ctx.lineWidth = 1;
        for (let x = 0; x < w; x += 24) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        for (let y = 0; y < h; y += 24) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }

        // Oscilloscope Wave
        ctx.strokeStyle = 'rgba(57, 255, 20, 0.35)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x < w; x += 10) {
          const y = h * 0.5 + Math.sin(x * 0.02 + t * 4) * 25 + Math.sin(x * 0.01 + t * 2) * 15;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        break;
      }

      case 'cosmic-nebula': {
        // Swirling Galaxy Spiral
        ctx.fillStyle = '#04030a';
        ctx.fillRect(0, 0, w, h);

        const cx = w / 2;
        const cy = h / 2;
        const armCount = 2;

        for (let a = 0; a < armCount; a++) {
          const armOffset = (a * Math.PI * 2) / armCount;
          for (let r = 20; r < Math.min(w, h) * 0.5; r += 12) {
            const angle = armOffset + (r * 0.02) + (t * 0.2);
            const px = cx + Math.cos(angle) * r;
            const py = cy + Math.sin(angle) * r;
            ctx.fillStyle = `rgba(232, 121, 249, ${Math.max(0.05, 0.5 - r / (w * 0.6))})`;
            ctx.beginPath();
            ctx.arc(px, py, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        break;
      }

      case 'zen-ink': {
        // Sumi-e Waves & Cherry Petals
        ctx.fillStyle = '#08080a';
        ctx.fillRect(0, 0, w, h);

        // Fluid ink waves
        ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += 40) {
          const y = h * 0.65 + Math.sin(x * 0.004 + t * 0.4) * 50;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fill();

        // Falling Sakura Petals
        this.particles.slice(0, 25).forEach((p, idx) => {
          p.y += 0.8;
          p.x += Math.cos(t + idx) * 0.6;
          if (p.y > h) p.y = 0;

          ctx.fillStyle = 'rgba(239, 68, 68, 0.65)';
          ctx.beginPath();
          ctx.ellipse(p.x, p.y, 4, 7, Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();
        });
        break;
      }
    }
  }

  /* 10 LIVE WALLPAPERS */
  renderLive(theme) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const t = this.time;

    switch (theme) {
      case 'chromatic-flux': {
        const g = ctx.createLinearGradient(0, 0, w, h);
        const hue1 = (t * 15) % 360;
        const hue2 = (hue1 + 120) % 360;
        g.addColorStop(0, `hsl(${hue1}, 75%, 15%)`);
        g.addColorStop(1, `hsl(${hue2}, 85%, 8%)`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
        break;
      }

      case 'deep-aurora': {
        ctx.fillStyle = '#03080e';
        ctx.fillRect(0, 0, w, h);
        const g = ctx.createRadialGradient(w * 0.5, h * 0.5, 40, w * 0.5, h * 0.5, w * 0.6);
        g.addColorStop(0, 'rgba(80, 227, 194, 0.25)');
        g.addColorStop(0.5, 'rgba(30, 64, 175, 0.15)');
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
        break;
      }

      case 'electric-sunset': {
        const g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, '#2d0628');
        g.addColorStop(0.5, '#4a0e2e');
        g.addColorStop(1, '#110212');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
        break;
      }

      case 'midnight-obsidian': {
        ctx.fillStyle = '#06070a';
        ctx.fillRect(0, 0, w, h);
        const g = ctx.createRadialGradient(w * 0.5, h * 0.8, 10, w * 0.5, h * 0.8, w * 0.5);
        g.addColorStop(0, 'rgba(59, 130, 246, 0.18)');
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
        break;
      }

      case 'cosmic-vapor': {
        const g = ctx.createLinearGradient(0, 0, w, h);
        g.addColorStop(0, '#1a0b2e');
        g.addColorStop(0.5, '#0d1f36');
        g.addColorStop(1, '#241029');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
        break;
      }

      case 'neon-tokyo': {
        ctx.fillStyle = '#080511';
        ctx.fillRect(0, 0, w, h);
        const pulse = (Math.sin(t * 3) + 1) * 0.5;
        const g = ctx.createRadialGradient(w * 0.2, h * 0.3, 20, w * 0.2, h * 0.3, 300);
        g.addColorStop(0, `rgba(255, 0, 127, ${0.15 + pulse * 0.15})`);
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
        break;
      }

      case 'solar-flare': {
        ctx.fillStyle = '#110602';
        ctx.fillRect(0, 0, w, h);
        const g = ctx.createRadialGradient(w * 0.5, h * 1.1, 80, w * 0.5, h * 1.1, h);
        g.addColorStop(0, 'rgba(255, 120, 0, 0.35)');
        g.addColorStop(0.5, 'rgba(220, 38, 38, 0.15)');
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
        break;
      }

      case 'bioluminescence': {
        ctx.fillStyle = '#020b12';
        ctx.fillRect(0, 0, w, h);
        this.particles.forEach((p, idx) => {
          const alpha = (Math.sin(t * 2 + idx) + 1) * 0.25;
          ctx.fillStyle = `rgba(20, 184, 166, ${alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 2, 0, Math.PI * 2);
          ctx.fill();
        });
        break;
      }

      case 'hyperdrive': {
        // Warp Starfield
        ctx.fillStyle = 'rgba(4, 6, 12, 0.3)';
        ctx.fillRect(0, 0, w, h);

        const cx = w / 2;
        const cy = h / 2;

        this.stars.forEach(s => {
          s.z -= 15;
          if (s.z <= 0) {
            s.z = w;
            s.x = (Math.random() - 0.5) * w * 2;
            s.y = (Math.random() - 0.5) * h * 2;
          }

          const k = 128 / s.z;
          const px = s.x * k + cx;
          const py = s.y * k + cy;

          if (px >= 0 && px <= w && py >= 0 && py <= h) {
            const size = (1 - s.z / w) * 3;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(px, py, Math.max(0.6, size), 0, Math.PI * 2);
            ctx.fill();
          }
        });
        break;
      }

      case 'liquid-mercury': {
        const g = ctx.createLinearGradient(0, 0, w, h);
        g.addColorStop(0, '#111317');
        g.addColorStop(0.5, '#232730');
        g.addColorStop(1, '#0e1014');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
        break;
      }
    }
  }
}

window.wallpaperEngine = new WallpaperEngine();
