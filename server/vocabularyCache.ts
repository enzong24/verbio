interface VocabularyWord {
  word: string;
  type: "noun" | "verb" | "adjective";
  english: string;
  pinyin?: string;
}

interface CacheKey {
  topic: string;
  language: string;
  difficulty: string;
}

interface CacheEntry {
  vocabulary: VocabularyWord[];
  timestamp: number;
}

class VocabularyCache {
  private cache: Map<string, CacheEntry[]> = new Map();
  private readonly MAX_SETS_PER_KEY = 5; // Store up to 5 different vocab sets per topic/language/difficulty
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  private getCacheKey(key: CacheKey): string {
    return `${key.topic}:${key.language}:${key.difficulty}`;
  }

  /**
   * Get a random vocabulary set from cache, or return null if cache is empty/expired
   */
  get(key: CacheKey): VocabularyWord[] | null {
    const cacheKey = this.getCacheKey(key);
    const entries = this.cache.get(cacheKey);

    if (!entries || entries.length === 0) {
      return null;
    }

    // Filter out expired entries
    const now = Date.now();
    const validEntries = entries.filter(
      entry => now - entry.timestamp < this.CACHE_DURATION
    );

    if (validEntries.length === 0) {
      this.cache.delete(cacheKey);
      return null;
    }

    // Update cache with only valid entries
    if (validEntries.length !== entries.length) {
      this.cache.set(cacheKey, validEntries);
    }

    // Return a random vocabulary set
    const randomIndex = Math.floor(Math.random() * validEntries.length);
    return validEntries[randomIndex].vocabulary;
  }

  /**
   * Add a new vocabulary set to the cache
   */
  set(key: CacheKey, vocabulary: VocabularyWord[]): void {
    const cacheKey = this.getCacheKey(key);
    const entries = this.cache.get(cacheKey) || [];

    // Add new entry
    entries.push({
      vocabulary,
      timestamp: Date.now()
    });

    // Keep only the most recent MAX_SETS_PER_KEY entries
    if (entries.length > this.MAX_SETS_PER_KEY) {
      entries.sort((a, b) => b.timestamp - a.timestamp);
      entries.splice(this.MAX_SETS_PER_KEY);
    }

    this.cache.set(cacheKey, entries);
  }

  /**
   * Get cache statistics for monitoring
   */
  getStats(): {
    totalKeys: number;
    totalSets: number;
    keyDetails: { key: string; sets: number }[];
  } {
    const keyDetails: { key: string; sets: number }[] = [];
    let totalSets = 0;

    this.cache.forEach((entries, key) => {
      keyDetails.push({ key, sets: entries.length });
      totalSets += entries.length;
    });

    return {
      totalKeys: this.cache.size,
      totalSets,
      keyDetails
    };
  }

  /**
   * Clear expired entries from cache
   */
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((entries, key) => {
      const validEntries = entries.filter(
        entry => now - entry.timestamp < this.CACHE_DURATION
      );

      if (validEntries.length === 0) {
        keysToDelete.push(key);
      } else if (validEntries.length !== entries.length) {
        this.cache.set(key, validEntries);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));
  }
}

// Export singleton instance
export const vocabularyCache = new VocabularyCache();

// Run cleanup every 6 hours
setInterval(() => vocabularyCache.cleanup(), 6 * 60 * 60 * 1000);
