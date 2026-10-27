import { inject, Service } from '@angular/core';
import { PlaybackService } from '../playback/playback.service';

@Service()
export class ThemingService {
  protected readonly playbackService = inject(PlaybackService);

  constructor() {
    this.playbackService.playbackRateChange$.subscribe((event) => this.setUIColor(event));
    this.setUIColor(1);
  }

  private setUIColor(playbackRate: number) {
    const MIN = 0.25;
    const MAX = 2.5;
    const EASE = 1;
    const CENTER = 1;

    const r = Math.min(MAX, Math.max(MIN, playbackRate));
    const x =
      r <= CENTER
        ? (0.5 * (r - MIN)) / (CENTER - MIN)
        : 0.5 + (0.5 * (r - CENTER)) / (MAX - CENTER);

    const a = Math.pow(x, EASE);
    const b = Math.pow(1 - x, EASE);
    document.documentElement.style.setProperty('--t', String(a / (a + b)));
  }
}
