export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  let lastResult: ReturnType<T>;

  return function executedFunction(...args: Parameters<T>): void {
    if (!inThrottle) {
      lastResult = func(...args) as ReturnType<T>;
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

export function rateLimitedFetch<T>(
  fetcher: () => Promise<T>,
  options: {
    maxRetries?: number;
    retryDelay?: number;
    timeout?: number;
  } = {}
): Promise<T> {
  const { maxRetries = 3, retryDelay = 1000, timeout = 10000 } = options;

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Request timeout'));
    }, timeout);

    const attemptFetch = async (retriesLeft: number) => {
      try {
        const result = await fetcher();
        clearTimeout(timeoutId);
        resolve(result);
      } catch (error) {
        if (retriesLeft === 0) {
          clearTimeout(timeoutId);
          reject(error);
          return;
        }

        if (error instanceof Response && error.status === 429) {
          const retryAfter = error.headers.get('Retry-After');
          const delay = retryAfter ? parseInt(retryAfter, 10) * 1000 : retryDelay;

          if (import.meta.env.DEV) {
            console.warn(`Rate limited. Retrying after ${delay}ms...`);
          }

          setTimeout(() => {
            attemptFetch(retriesLeft - 1);
          }, delay);
        } else {
          setTimeout(() => {
            attemptFetch(retriesLeft - 1);
          }, retryDelay);
        }
      }
    };

    attemptFetch(maxRetries);
  });
}

export class RateLimiter {
  private queue: Array<() => void> = [];
  private processing = false;
  private lastExecutionTime = 0;

  constructor(
    private minInterval: number,
    private maxConcurrent: number = 1
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const now = Date.now();
          const timeSinceLastExecution = now - this.lastExecutionTime;

          if (timeSinceLastExecution < this.minInterval) {
            await new Promise(res =>
              setTimeout(res, this.minInterval - timeSinceLastExecution)
            );
          }

          this.lastExecutionTime = Date.now();
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (task) {
        await task();
      }
    }

    this.processing = false;
  }
}

export class TokenBucket {
  private tokens: number;
  private lastRefill: number;

  constructor(
    private capacity: number,
    private refillRate: number,
    private refillInterval: number = 1000
  ) {
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }

  tryConsume(tokens: number = 1): boolean {
    this.refill();

    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }

    return false;
  }

  private refill() {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const tokensToAdd = (timePassed / this.refillInterval) * this.refillRate;

    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  getRemainingTokens(): number {
    this.refill();
    return Math.floor(this.tokens);
  }

  getTimeUntilNextToken(): number {
    if (this.tokens >= 1) {
      return 0;
    }

    const tokensNeeded = 1 - this.tokens;
    return (tokensNeeded / this.refillRate) * this.refillInterval;
  }
}

export function createRequestLimiter(config: {
  maxRequestsPerMinute: number;
  maxConcurrent?: number;
}) {
  const bucket = new TokenBucket(
    config.maxRequestsPerMinute,
    config.maxRequestsPerMinute / 60,
    1000
  );

  const limiter = new RateLimiter(
    60000 / config.maxRequestsPerMinute,
    config.maxConcurrent || 1
  );

  return {
    async execute<T>(fn: () => Promise<T>): Promise<T> {
      if (!bucket.tryConsume()) {
        const waitTime = bucket.getTimeUntilNextToken();
        throw new Error(
          `Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`
        );
      }

      return limiter.execute(fn);
    },

    getRemainingRequests(): number {
      return bucket.getRemainingTokens();
    },
  };
}

export function createFormSubmitLimiter(formId: string, limitMs: number = 2000) {
  const lastSubmits = new Map<string, number>();

  return {
    canSubmit(): boolean {
      const now = Date.now();
      const lastSubmit = lastSubmits.get(formId);

      if (lastSubmit && now - lastSubmit < limitMs) {
        return false;
      }

      return true;
    },

    recordSubmit(): void {
      lastSubmits.set(formId, Date.now());
    },

    getRemainingTime(): number {
      const now = Date.now();
      const lastSubmit = lastSubmits.get(formId);

      if (!lastSubmit) {
        return 0;
      }

      const remaining = limitMs - (now - lastSubmit);
      return Math.max(0, remaining);
    },
  };
}
