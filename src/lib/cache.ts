// Simple in-memory cache for pathway generation
interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class PathwayCache {
  private cache = new Map<string, CacheEntry>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  generateKey(config: any): string {
    // Create a hash of the configuration for caching
    const configString = JSON.stringify({
      name: config.name,
      voice: config.voice,
      interruptionThreshold: config.interruptionThreshold,
      robustnessLevel: config.robustnessLevel,
      // Include file names and sizes for cache key
      files: config.files?.map((f: any) => ({ name: f.name, size: f.size })) || []
    });
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < configString.length; i++) {
      const char = configString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

export const pathwayCache = new PathwayCache();
