import { inject, Service } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { PlaybackService } from '../playback/playback.service';
import { PlaybackEvent } from '../playback/playback-event';

@Service()
export class AudioAnalyserService {
  private readonly playbackService = inject(PlaybackService);

  private readonly audioCtx: AudioContext;
  private readonly analyser: AnalyserNode;
  private readonly source: MediaElementAudioSourceNode;

  private readonly peakSubject = new Subject<Array<number>>();

  public readonly peak$: Observable<Array<number>> = this.peakSubject.asObservable();

  constructor() {
    this.audioCtx = new AudioContext();
    this.analyser = this.audioCtx.createAnalyser();
    this.source = this.audioCtx.createMediaElementSource(this.playbackService.activeAudioElement);

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
      if (!this.playbackService.isPlaying()) {
        return;
      }

      this.analyser.getByteFrequencyData(dataArray);

      const trimmedArray = dataArray.subarray(0, 300);

      const lowsArray = trimmedArray.subarray(0, trimmedArray.length / 3);
      const midsArray = trimmedArray.subarray(
        trimmedArray.length / 3,
        (2 * trimmedArray.length) / 3,
      );
      const highsArray = trimmedArray.subarray((2 * trimmedArray.length) / 3, trimmedArray.length);

      const lowsAverage =
        lowsArray.reduce((sum, value) => sum + value, 0) / (lowsArray.length * 255);
      const midsAverage =
        midsArray.reduce((sum, value) => sum + value, 0) / (midsArray.length * 255);
      const highsAverage =
        highsArray.reduce((sum, value) => sum + value, 0) / (highsArray.length * 255);

      const newVector = new Array<number>(lowsAverage, midsAverage, highsAverage);

      this.peakSubject.next(newVector);

      requestAnimationFrame(analyse);
    };

    requestAnimationFrame(analyse);
  }
}
