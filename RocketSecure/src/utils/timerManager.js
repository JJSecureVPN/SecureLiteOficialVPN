/**
 * TimerManager
 * Safely manages global intervals and timeouts to prevent memory leaks.
 * Useful for global stores where Vue's onBeforeUnmount is not applicable.
 */
class TimerManager {
  constructor() {
    this.timers = new Map();
    this.intervals = new Map();
  }

  setTimeout(key, fn, ms) {
    this.clearTimeout(key);
    this.timers.set(
      key,
      window.setTimeout(() => {
        this.timers.delete(key);
        fn();
      }, ms)
    );
  }

  clearTimeout(key) {
    if (this.timers.has(key)) {
      window.clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
  }

  setInterval(key, fn, ms) {
    this.clearInterval(key);
    this.intervals.set(key, window.setInterval(fn, ms));
  }

  clearInterval(key) {
    if (this.intervals.has(key)) {
      window.clearInterval(this.intervals.get(key));
      this.intervals.delete(key);
    }
  }

  clearAll() {
    this.timers.forEach((val, key) => this.clearTimeout(key));
    this.intervals.forEach((val, key) => this.clearInterval(key));
  }
}

export const globalTimers = new TimerManager();
