// Google AdSense & H5 Games Ad Placement API integration
// Follows Google AdSense for Games best practices

declare global {
  interface Window {
    adsbygoogle?: any[];
    adBreak?: (options: {
      type: 'start' | 'pause' | 'next' | 'browse' | 'reward';
      name?: string;
      beforeAd?: () => void;
      afterAd?: () => void;
      beforeReward?: (showAdFn: () => void) => void;
      adDismissed?: () => void;
      adViewed?: () => void;
    }) => void;
    adConfig?: (options: any) => void;
  }
}

export interface AdManagerConfig {
  clientId?: string;
  testMode?: boolean;
}

class AdSenseManager {
  private clientId: string = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-2976794750301024';
  private lastInterstitialTime: number = 0;
  private readonly INTERSTITIAL_COOLDOWN_MS: number = 60000; // 60s cooldown to comply with AdSense policy
  private gamesSinceLastAd: number = 0;
  private readonly GAMES_BETWEEN_ADS: number = 3;

  constructor() {
    if (typeof window !== 'undefined') {
      // Initialize adConfig if Google H5 SDK is present
      if (typeof window.adConfig === 'function') {
        window.adConfig({
          preloadAdBreaks: 'on',
          sound: 'on',
        });
      }
    }
  }

  // Check if real AdSense is active on the page
  public isAdSenseAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    return typeof window.adBreak === 'function' || (Array.isArray(window.adsbygoogle) && !!this.clientId);
  }

  // Interstitial Ad (Between game sessions)
  public showInterstitialAd(callbacks?: {
    onStart?: () => void;
    onComplete?: () => void;
  }): boolean {
    const now = Date.now();
    this.gamesSinceLastAd++;

    // Enforce cooldown & frequency
    if (
      this.gamesSinceLastAd < this.GAMES_BETWEEN_ADS ||
      now - this.lastInterstitialTime < this.INTERSTITIAL_COOLDOWN_MS
    ) {
      callbacks?.onComplete?.();
      return false;
    }

    this.lastInterstitialTime = now;
    this.gamesSinceLastAd = 0;

    // Use Google H5 Games adBreak if available
    if (typeof window !== 'undefined' && typeof window.adBreak === 'function') {
      try {
        window.adBreak({
          type: 'next',
          name: 'game_over_restart',
          beforeAd: () => {
            callbacks?.onStart?.();
          },
          afterAd: () => {
            callbacks?.onComplete?.();
          },
        });
        return true;
      } catch {
        callbacks?.onComplete?.();
        return false;
      }
    }

    // In dev or preview mode, simulate ad completion
    callbacks?.onComplete?.();
    return false;
  }

  // Rewarded Video Ad ("Watch Ad to Revive" or "Watch Ad for 50 Coins")
  public showRewardedAd(options: {
    rewardName: string;
    onStart?: () => void;
    onRewardEarned: () => void;
    onDismissed?: () => void;
  }) {
    if (typeof window !== 'undefined' && typeof window.adBreak === 'function') {
      try {
        window.adBreak({
          type: 'reward',
          name: options.rewardName,
          beforeReward: (showAdFn) => {
            options.onStart?.();
            showAdFn();
          },
          adViewed: () => {
            options.onRewardEarned();
          },
          adDismissed: () => {
            options.onDismissed?.();
          },
        });
        return;
      } catch (err) {
        console.warn('Google adBreak error:', err);
      }
    }

    // Development / Fallback mode: Show simulated rewarded modal if real AdSense isn't approved yet
    options.onStart?.();
    const confirmed = window.confirm(
      `📺 [AdSense Rewarded Video Simulation]\n\nWatching 5-second sponsor video for: "${options.rewardName}"\n\n(In production, Google AdSense will play a live video ad here).\n\nClick OK to simulate completing the ad and claim your reward!`
    );

    if (confirmed) {
      options.onRewardEarned();
    } else {
      options.onDismissed?.();
    }
  }
}

export const adManager = new AdSenseManager();
