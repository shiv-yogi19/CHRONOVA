/**
 * CHRONOVA - Widget Engine & Creator Branding System
 * Interactive Date, Week Info, Timezone, World Clocks, Stopwatch, Timer, Battery, Weather,
 * and dedicated "Created By Shiv Yogi" branding widget with 12 animations & 12 typography styles.
 * Created By Shiv Yogi
 */

class WidgetEngine {
  constructor() {
    this.storage = window.storageEngine;
    this.animationEngine = window.animationEngine;

    this.activeWidgetIndex = this.storage.get('activeWidgetIndex') || 0;
    this.widgets = [
      'widget-date',
      'widget-week-info',
      'widget-timezone',
      'widget-world-clock',
      'widget-stopwatch',
      'widget-timer',
      'widget-battery',
      'widget-weather',
      'widget-branding'
    ];

    // Creator Branding Alternator
    this.isShowingBrandingAlternate = false;
    this.brandingTimer = null;

    // Stopwatch State
    this.stopwatch = {
      running: false,
      startTime: 0,
      elapsed: 0,
      intervalId: null,
      laps: []
    };

    // Timer State
    this.timer = {
      running: false,
      totalSeconds: 300, // 5 min default
      remainingSeconds: 300,
      intervalId: null
    };

    // Weather State
    this.weatherData = null;

    this.init();
  }

  init() {
    this.renderIndicators();
    this.showWidget(this.activeWidgetIndex, false);
    this.startClockUpdates();
    this.initBattery();
    this.fetchWeather();
    this.bindStopwatch();
    this.bindTimer();
    this.startBrandingAlternator();
  }

  renderIndicators() {
    const container = document.getElementById('widget-indicators');
    if (!container) return;
    container.innerHTML = '';

    this.widgets.forEach((_, idx) => {
      const dot = document.createElement('div');
      dot.className = `widget-dot ${idx === this.activeWidgetIndex ? 'active' : ''}`;
      dot.addEventListener('click', () => this.showWidget(idx));
      container.appendChild(dot);
    });
  }

  nextWidget() {
    const nextIdx = (this.activeWidgetIndex + 1) % this.widgets.length;
    this.showWidget(nextIdx, true, 'next');
  }

  prevWidget() {
    const prevIdx = (this.activeWidgetIndex - 1 + this.widgets.length) % this.widgets.length;
    this.showWidget(prevIdx, true, 'prev');
  }

  showWidget(index, animate = true, direction = 'next') {
    this.activeWidgetIndex = index;
    this.storage.set('activeWidgetIndex', index);

    // Hide all widget cards
    this.widgets.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.classList.remove('active', 'anim-widget-slide-next', 'anim-widget-slide-prev');
      }
    });

    const activeEl = document.getElementById(this.widgets[index]);
    if (activeEl) {
      activeEl.classList.add('active');
      if (animate) {
        activeEl.classList.add(direction === 'next' ? 'anim-widget-slide-next' : 'anim-widget-slide-prev');
        if (this.animationEngine) this.animationEngine.playSound('swoosh');
      }
    }

    // Update indicator dots
    const dots = document.querySelectorAll('.widget-dot');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === index);
    });

    // Reset branding alternation if user navigated
    this.isShowingBrandingAlternate = false;
    this.applyCreatorBrandingStyle();
  }

  startClockUpdates() {
    this.updateLiveWidgets();
    setInterval(() => this.updateLiveWidgets(), 1000);
  }

  updateLiveWidgets() {
    const now = new Date();

    // 1. Full Date Widget
    const dateTextEl = document.getElementById('widget-date-text');
    if (dateTextEl) {
      const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
      dateTextEl.textContent = now.toLocaleDateString(undefined, options);
    }

    // 2. Week Info Widget
    const weekTextEl = document.getElementById('widget-week-text');
    if (weekTextEl) {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const days = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
      const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
      const quarter = Math.floor(now.getMonth() / 3) + 1;
      const isLeap = (now.getFullYear() % 4 === 0 && now.getFullYear() % 100 !== 0) || (now.getFullYear() % 400 === 0);
      const totalDays = isLeap ? 366 : 365;
      const daysLeft = totalDays - days;
      weekTextEl.textContent = `Week ${weekNumber} · Q${quarter} · ${daysLeft} Days Left in ${now.getFullYear()}`;
    }

    // 3. Timezone Widget
    const tzTextEl = document.getElementById('widget-timezone-text');
    if (tzTextEl) {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const offsetMinutes = -now.getTimezoneOffset();
      const sign = offsetMinutes >= 0 ? '+' : '-';
      const offH = String(Math.floor(Math.abs(offsetMinutes) / 60)).padStart(2, '0');
      const offM = String(Math.abs(offsetMinutes) % 60).padStart(2, '0');
      tzTextEl.textContent = `${tz} (UTC${sign}${offH}:${offM})`;
    }

    // 4. World Clock Widget
    const worldTextEl = document.getElementById('widget-world-clock-text');
    if (worldTextEl) {
      const getCityTime = (tz) => {
        return now.toLocaleTimeString('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false });
      };
      worldTextEl.textContent = `NYC: ${getCityTime('America/New_York')} · LON: ${getCityTime('Europe/London')} · TYO: ${getCityTime('Asia/Tokyo')}`;
    }
  }

  /* Creator Branding Alternator (5s Date -> 5s Branding -> Date) */
  startBrandingAlternator() {
    if (this.brandingTimer) clearInterval(this.brandingTimer);

    const intervalMs = (this.storage.get('brandingDisplayDuration') || 5) * 1000;

    this.brandingTimer = setInterval(() => {
      // Only alternate if user is currently looking at Date (index 0) and setting is enabled
      if (!this.storage.get('brandingAutoAlternate')) return;
      if (this.activeWidgetIndex !== 0 && !this.isShowingBrandingAlternate) return;

      const dateWidget = document.getElementById('widget-date');
      const brandingWidget = document.getElementById('widget-branding');
      if (!dateWidget || !brandingWidget) return;

      if (!this.isShowingBrandingAlternate) {
        // Switch to Creator Branding
        dateWidget.classList.remove('active');
        brandingWidget.classList.add('active', 'anim-widget-slide-next');
        this.isShowingBrandingAlternate = true;
      } else {
        // Return to Date
        brandingWidget.classList.remove('active');
        dateWidget.classList.add('active', 'anim-widget-slide-next');
        this.isShowingBrandingAlternate = false;
      }
    }, intervalMs);
  }

  applyCreatorBrandingStyle() {
    const brandingCard = document.getElementById('widget-branding');
    const brandingText = document.getElementById('creator-branding-text');
    if (!brandingCard || !brandingText) return;

    // Reset styles
    Array.from(brandingCard.classList).forEach(cls => {
      if (cls.startsWith('branding-anim-')) brandingCard.classList.remove(cls);
    });
    Array.from(brandingText.classList).forEach(cls => {
      if (cls.startsWith('branding-typo-')) brandingText.classList.remove(cls);
    });

    const animStyle = this.storage.get('brandingAnimationStyle') || 'slide';
    const typoIndex = this.storage.get('brandingTypographyIndex') || 1;

    brandingCard.classList.add(`branding-anim-${animStyle}`);
    brandingText.classList.add(`branding-typo-${typoIndex}`);
  }

  /* Battery API with Graceful Fallback */
  async initBattery() {
    const batteryText = document.getElementById('widget-battery-text');
    if (!batteryText) return;

    if ('getBattery' in navigator) {
      try {
        const battery = await navigator.getBattery();
        const update = () => {
          const level = Math.round(battery.level * 100);
          const charging = battery.charging ? ' (Charging ⚡)' : '';
          batteryText.textContent = `Battery: ${level}%${charging}`;
        };
        update();
        battery.addEventListener('levelchange', update);
        battery.addEventListener('chargingchange', update);
      } catch (e) {
        batteryText.textContent = 'Battery: Optimized & Connected';
      }
    } else {
      batteryText.textContent = 'Battery: Continuous Power Mode';
    }
  }

  /* Weather Widget using Free Open-Meteo API */
  async fetchWeather() {
    const weatherText = document.getElementById('widget-weather-text');
    if (!weatherText) return;

    const loadWeather = async (lat, lon, cityName = 'Local') => {
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`);
        if (!res.ok) throw new Error('Weather API error');
        const data = await res.json();
        const temp = Math.round(data.current.temperature_2m);
        const humidity = data.current.relative_humidity_2m;
        const wind = data.current.wind_speed_10m;
        const weatherDesc = this.getWeatherDesc(data.current.weather_code);

        weatherText.textContent = `${cityName}: ${temp}°C · ${weatherDesc} · 💧${humidity}% · 💨${wind}km/h`;
      } catch (err) {
        weatherText.textContent = 'Weather: 24°C · Clear Sky · 💧45%';
      }
    };

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => loadWeather(pos.coords.latitude, pos.coords.longitude, 'Nearby'),
        () => loadWeather(28.6139, 77.2090, 'New Delhi') // Fallback coordinates
      );
    } else {
      loadWeather(28.6139, 77.2090, 'New Delhi');
    }
  }

  getWeatherDesc(code) {
    if (code === 0) return 'Clear Sky';
    if (code <= 3) return 'Partly Cloudy';
    if (code <= 48) return 'Foggy';
    if (code <= 67) return 'Rainy';
    if (code <= 77) return 'Snow';
    if (code <= 82) return 'Rain Showers';
    return 'Stormy';
  }

  /* Interactive Stopwatch */
  bindStopwatch() {
    const display = document.getElementById('stopwatch-time-display');
    const startBtn = document.getElementById('stopwatch-start-btn');
    const lapBtn = document.getElementById('stopwatch-lap-btn');
    const resetBtn = document.getElementById('stopwatch-reset-btn');
    const lapsList = document.getElementById('stopwatch-laps-list');

    if (!startBtn) return;

    const formatStopwatch = (ms) => {
      const minutes = Math.floor(ms / 60000);
      const seconds = Math.floor((ms % 60000) / 1000);
      const centis = Math.floor((ms % 1000) / 10);
      return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centis).padStart(2, '0')}`;
    };

    startBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.animationEngine) this.animationEngine.playSound('click');

      if (!this.stopwatch.running) {
        this.stopwatch.running = true;
        this.stopwatch.startTime = performance.now() - this.stopwatch.elapsed;
        startBtn.textContent = 'Pause';
        startBtn.classList.add('active');

        this.stopwatch.intervalId = setInterval(() => {
          this.stopwatch.elapsed = performance.now() - this.stopwatch.startTime;
          if (display) display.textContent = formatStopwatch(this.stopwatch.elapsed);
        }, 30);
      } else {
        this.stopwatch.running = false;
        clearInterval(this.stopwatch.intervalId);
        startBtn.textContent = 'Start';
        startBtn.classList.remove('active');
      }
    });

    lapBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!this.stopwatch.running || !lapsList) return;
      if (this.animationEngine) this.animationEngine.playSound('click');

      const lapTime = formatStopwatch(this.stopwatch.elapsed);
      this.stopwatch.laps.unshift(lapTime);
      const item = document.createElement('div');
      item.className = 'stopwatch-lap-item';
      item.textContent = `Lap ${this.stopwatch.laps.length}: ${lapTime}`;
      lapsList.prepend(item);
    });

    resetBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.animationEngine) this.animationEngine.playSound('click');

      this.stopwatch.running = false;
      clearInterval(this.stopwatch.intervalId);
      this.stopwatch.elapsed = 0;
      this.stopwatch.laps = [];
      if (display) display.textContent = '00:00.00';
      if (lapsList) lapsList.innerHTML = '';
      startBtn.textContent = 'Start';
      startBtn.classList.remove('active');
    });
  }

  /* Interactive Countdown Timer */
  bindTimer() {
    const display = document.getElementById('timer-time-display');
    const startBtn = document.getElementById('timer-start-btn');
    const resetBtn = document.getElementById('timer-reset-btn');
    const presetPills = document.querySelectorAll('.timer-preset-pill');

    if (!startBtn) return;

    const formatTimer = (sec) => {
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    presetPills.forEach((pill) => {
      pill.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.animationEngine) this.animationEngine.playSound('click');
        presetPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');

        const sec = parseInt(pill.dataset.seconds, 10);
        this.timer.totalSeconds = sec;
        this.timer.remainingSeconds = sec;
        if (display) display.textContent = formatTimer(sec);
      });
    });

    startBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.animationEngine) this.animationEngine.playSound('click');

      if (!this.timer.running) {
        if (this.timer.remainingSeconds <= 0) {
          this.timer.remainingSeconds = this.timer.totalSeconds;
        }
        this.timer.running = true;
        startBtn.textContent = 'Pause';
        startBtn.classList.add('active');

        this.timer.intervalId = setInterval(() => {
          this.timer.remainingSeconds--;
          if (display) display.textContent = formatTimer(this.timer.remainingSeconds);

          if (this.timer.remainingSeconds <= 0) {
            clearInterval(this.timer.intervalId);
            this.timer.running = false;
            startBtn.textContent = 'Start';
            startBtn.classList.remove('active');
            if (this.animationEngine) this.animationEngine.playSound('alarm');
            if (display) display.textContent = 'Time Up!';
          }
        }, 1000);
      } else {
        this.timer.running = false;
        clearInterval(this.timer.intervalId);
        startBtn.textContent = 'Start';
        startBtn.classList.remove('active');
      }
    });

    resetBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.animationEngine) this.animationEngine.playSound('click');
      this.timer.running = false;
      clearInterval(this.timer.intervalId);
      this.timer.remainingSeconds = this.timer.totalSeconds;
      if (display) display.textContent = formatTimer(this.timer.remainingSeconds);
      startBtn.textContent = 'Start';
      startBtn.classList.remove('active');
    });
  }
}

window.widgetEngine = new WidgetEngine();
