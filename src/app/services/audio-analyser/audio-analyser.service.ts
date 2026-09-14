import { inject, Service } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { PlaybackService } from '../playback/playback.service';

@Service()
export class AudioAnalyserService {
  private playbackService = inject(PlaybackService);

  private audioElement!: HTMLAudioElement;

  private audioCtx!: AudioContext;
  private analyser!: AnalyserNode;
  private source!: MediaElementAudioSourceNode;

  private readonly peakSubject = new Subject<number>();
  public readonly peak$: Observable<number> = this.peakSubject.asObservable();

  constructor() {
    this.audioCtx = new AudioContext();
    this.analyser = this.audioCtx.createAnalyser();

    this.audioElement = this.playbackService.activeAudioElement;
    this.source = this.audioCtx.createMediaElementSource(this.audioElement);

    this.source.connect(this.analyser);
    this.analyser.connect(this.audioCtx.destination);

    this.playbackService.playbackEvent$.subscribe((event) => this.onPlaybackEvent(event));
  }

  private onPlaybackEvent(event: PlaybackEvent) {
    switch (event.type) {
      case 'played':
        this.startAnalysing();
        break;
      case 'paused':
        break;
    }
  }

  public startAnalysing() {
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    const analyse = () => {
      if (this.audioElement.paused) {
        return;
      }

      this.analyser.getByteFrequencyData(dataArray);

      let peak = 0;
      for (const value of dataArray) {
        if (value > peak) {
          peak = value;
        }
      }

      const normalizedPeak = peak / 255;

      console.log('Peak:', normalizedPeak);
      this.peakSubject.next(normalizedPeak);

      requestAnimationFrame(analyse);
    };

    requestAnimationFrame(analyse);
  }
}
