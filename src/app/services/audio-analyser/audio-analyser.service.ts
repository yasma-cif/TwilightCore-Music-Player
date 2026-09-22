import { inject, Service } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { PlaybackService } from '../playback/playback.service';
import { Vector3 } from 'three';
import { PlaybackEvent } from '../playback/playback-event';

@Service()
export class AudioAnalyserService {
  private playbackService = inject(PlaybackService);

  private audioElement!: HTMLAudioElement;

  private audioCtx!: AudioContext;
  private analyser!: AnalyserNode;
  private source!: MediaElementAudioSourceNode;

  private readonly peakSubject = new Subject<Vector3>();
  public readonly peak$: Observable<Vector3> = this.peakSubject.asObservable();

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

      const newVector = new Vector3(lowsAverage, midsAverage, highsAverage);

      this.peakSubject.next(newVector);

      requestAnimationFrame(analyse);
    };

    requestAnimationFrame(analyse);
  }
}
