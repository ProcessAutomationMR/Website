interface BehaviorMetrics {
  mouseMovements: number;
  keystrokes: number;
  clickPattern: number[];
  scrollEvents: number;
  focusChanges: number;
  timeOnPage: number;
  startTime: number;
}

class BehaviorTracker {
  private metrics: BehaviorMetrics = {
    mouseMovements: 0,
    keystrokes: 0,
    clickPattern: [],
    scrollEvents: 0,
    focusChanges: 0,
    timeOnPage: 0,
    startTime: Date.now(),
  };

  private listeners: Array<() => void> = [];

  constructor() {
    this.setupListeners();
  }

  private setupListeners() {
    const trackMouseMove = () => {
      this.metrics.mouseMovements++;
    };

    const trackKeyPress = () => {
      this.metrics.keystrokes++;
    };

    const trackClick = () => {
      const now = Date.now();
      this.metrics.clickPattern.push(now);
      if (this.metrics.clickPattern.length > 10) {
        this.metrics.clickPattern.shift();
      }
    };

    const trackScroll = () => {
      this.metrics.scrollEvents++;
    };

    const trackFocus = () => {
      this.metrics.focusChanges++;
    };

    document.addEventListener('mousemove', trackMouseMove);
    document.addEventListener('keypress', trackKeyPress);
    document.addEventListener('click', trackClick);
    document.addEventListener('scroll', trackScroll);
    window.addEventListener('focus', trackFocus);
    window.addEventListener('blur', trackFocus);

    this.listeners.push(
      () => document.removeEventListener('mousemove', trackMouseMove),
      () => document.removeEventListener('keypress', trackKeyPress),
      () => document.removeEventListener('click', trackClick),
      () => document.removeEventListener('scroll', trackScroll),
      () => window.removeEventListener('focus', trackFocus),
      () => window.removeEventListener('blur', trackFocus)
    );
  }

  getMetrics(): BehaviorMetrics {
    const now = Date.now();
    return {
      ...this.metrics,
      timeOnPage: now - this.metrics.startTime,
    };
  }

  getSuspicionScore(): number {
    const metrics = this.getMetrics();
    let score = 0;

    if (metrics.timeOnPage < 1500) {
      score += 30;
    }

    if (metrics.mouseMovements === 0 && metrics.timeOnPage > 2000) {
      score += 40;
    } else if (metrics.mouseMovements < 5 && metrics.timeOnPage > 5000) {
      score += 20;
    }

    if (metrics.clickPattern.length >= 3) {
      const intervals = [];
      for (let i = 1; i < metrics.clickPattern.length; i++) {
        intervals.push(metrics.clickPattern[i] - metrics.clickPattern[i - 1]);
      }

      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const variance = intervals.reduce((sum, val) => sum + Math.pow(val - avgInterval, 2), 0) / intervals.length;

      if (variance < 100) {
        score += 35;
      } else if (variance < 500) {
        score += 15;
      }
    }

    if (metrics.scrollEvents === 0 && metrics.timeOnPage > 3000) {
      score += 20;
    }

    if (metrics.keystrokes === 0 && metrics.timeOnPage > 5000) {
      score += 15;
    }

    return Math.min(100, score);
  }

  destroy() {
    this.listeners.forEach(cleanup => cleanup());
    this.listeners = [];
  }
}

let globalTracker: BehaviorTracker | null = null;

export function initBehaviorTracking(): void {
  if (!globalTracker) {
    globalTracker = new BehaviorTracker();
  }
}

export function getBehaviorMetrics(): BehaviorMetrics | null {
  return globalTracker?.getMetrics() || null;
}

export function getSuspicionScore(): number {
  return globalTracker?.getSuspicionScore() || 0;
}

export function isLikelyBot(): boolean {
  const score = getSuspicionScore();
  const tools = detectAutomationTools();
  const inconsistencies = checkBrowserInconsistencies();
  return score > 60 || tools.length > 0 || inconsistencies.length >= 2;
}

export function destroyBehaviorTracking(): void {
  if (globalTracker) {
    globalTracker.destroy();
    globalTracker = null;
  }
}

export function createHoneypot(formId: string): {
  element: HTMLInputElement;
  isTriggered: () => boolean;
} {
  const honeypot = document.createElement('input');
  honeypot.type = 'text';
  honeypot.name = `${formId}_website`;
  honeypot.tabIndex = -1;
  honeypot.autocomplete = 'off';
  honeypot.style.position = 'absolute';
  honeypot.style.left = '-9999px';
  honeypot.style.width = '1px';
  honeypot.style.height = '1px';
  honeypot.style.opacity = '0';
  honeypot.setAttribute('aria-hidden', 'true');

  let triggered = false;

  honeypot.addEventListener('input', () => {
    triggered = true;
  });

  honeypot.addEventListener('change', () => {
    triggered = true;
  });

  return {
    element: honeypot,
    isTriggered: () => triggered,
  };
}

export function detectAutomationTools(): string[] {
  const detected: string[] = [];

  if (typeof (window as any).webdriver !== 'undefined') {
    detected.push('selenium');
  }

  if ((window as any).__nightmare) {
    detected.push('nightmare');
  }

  if ((window as any).phantom || (window as any).callPhantom) {
    detected.push('phantomjs');
  }

  if ((navigator as any).webdriver) {
    detected.push('webdriver');
  }

  if ((window as any).domAutomation || (window as any).domAutomationController) {
    detected.push('chrome-automation');
  }

  if ((window as any).Buffer && typeof process !== 'undefined') {
    detected.push('nodejs-context');
  }

  if (
    navigator.plugins.length === 0 &&
    !navigator.userAgent.includes('Mobile') &&
    !navigator.userAgent.includes('Android') &&
    !navigator.userAgent.includes('HeadlessChrome') === false
  ) {
    detected.push('headless-browser');
  }

  return detected;
}

export function validateFormSubmissionTiming(
  formId: string,
  minTimeMs: number = 2000
): boolean {
  const key = `form_${formId}_opened`;
  const openedAt = sessionStorage.getItem(key);

  if (!openedAt) {
    sessionStorage.setItem(key, String(Date.now()));
    return false;
  }

  const elapsed = Date.now() - parseInt(openedAt, 10);
  return elapsed >= minTimeMs;
}

export function clearFormTiming(formId: string): void {
  const key = `form_${formId}_opened`;
  sessionStorage.removeItem(key);
}

export function getTimezoneOffset(): number {
  return new Date().getTimezoneOffset();
}

export function hasInconsistentTimezone(): boolean {
  const reportedTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const offset = getTimezoneOffset();

  if (reportedTz === 'UTC' && offset !== 0) {
    return true;
  }

  return false;
}

export function checkBrowserInconsistencies(): string[] {
  const issues: string[] = [];

  if (navigator.userAgent.includes('HeadlessChrome')) {
    issues.push('headless-chrome');
  }

  if (!navigator.languages || navigator.languages.length === 0) {
    issues.push('missing-languages');
  }

  if (screen.width === 0 || screen.height === 0) {
    issues.push('invalid-screen-dimensions');
  }

  if (typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency === 0) {
    issues.push('invalid-hardware-concurrency');
  }

  if (!('ontouchstart' in window) && navigator.maxTouchPoints > 0) {
    issues.push('touch-inconsistency');
  }

  if (typeof navigator.deviceMemory !== 'undefined' && (navigator as any).deviceMemory === 0) {
    issues.push('invalid-device-memory');
  }

  return issues;
}

export function checkCanvasFingerprint(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return true;

    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Bot detection', 2, 2);

    const dataURL = canvas.toDataURL();
    return dataURL === 'data:,' || dataURL.length < 100;
  } catch {
    return true;
  }
}

export interface AntiAutomationCheck {
  suspicionScore: number;
  isLikelyBot: boolean;
  detectedTools: string[];
  browserInconsistencies: string[];
  timezoneInconsistent: boolean;
  canvasSuspicious: boolean;
  behaviorMetrics: BehaviorMetrics | null;
}

export function performAntiAutomationCheck(): AntiAutomationCheck {
  const detectedTools = detectAutomationTools();
  const browserInconsistencies = checkBrowserInconsistencies();
  const canvasSuspicious = checkCanvasFingerprint();
  const suspicionScore = getSuspicionScore();

  const isBot =
    suspicionScore > 60 ||
    detectedTools.length > 0 ||
    browserInconsistencies.length >= 2 ||
    canvasSuspicious;

  return {
    suspicionScore,
    isLikelyBot: isBot,
    detectedTools,
    browserInconsistencies,
    timezoneInconsistent: hasInconsistentTimezone(),
    canvasSuspicious,
    behaviorMetrics: getBehaviorMetrics(),
  };
}
