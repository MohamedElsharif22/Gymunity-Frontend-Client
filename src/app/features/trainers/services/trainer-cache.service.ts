import { Injectable, signal } from '@angular/core';
import { TrainerCard } from '../../../core/models';

/**
 * Trainer Cache Service
 * Temporarily stores trainer data during navigation
 * Useful for preserving trainer data when navigation state is lost (e.g., during auth redirects)
 * 
 * The cached trainer is cleared after being retrieved
 */
@Injectable({
  providedIn: 'root'
})
export class TrainerCacheService {
  private cachedTrainer = signal<any>(null);

  /**
   * Store trainer data in cache
   * Used before navigating to trainer detail so data persists across auth redirects
   */
  cacheTrainer(trainer: any): void {
    console.log('[TrainerCacheService] Caching trainer:', trainer);
    this.cachedTrainer.set(trainer);
  }

  /**
   * Get cached trainer and clear cache
   * Returns the cached trainer and immediately clears it
   */
  getCachedTrainer(): any {
    const trainer = this.cachedTrainer();
    if (trainer) {
      console.log('[TrainerCacheService] Retrieved cached trainer:', trainer);
      // Clear cache after retrieval
      this.cachedTrainer.set(null);
    }
    return trainer;
  }

  /**
   * Check if there's a cached trainer without clearing
   */
  hasCachedTrainer(): boolean {
    return !!this.cachedTrainer();
  }

  /**
   * Manually clear cache
   */
  clearCache(): void {
    this.cachedTrainer.set(null);
  }
}
