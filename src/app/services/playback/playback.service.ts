import { Service, signal } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Service()
export class PlaybackService {
  private readonly trackList: Array<string> = ['/music/test2.mp3', '/music/test1.mp3'];
  private currentTrackNum = 0;

  private audioElement!: HTMLAudioElement;

  public readonly isPlaying = signal(false);

  private readonly playbackEventSubject = new Subject<PlaybackEvent>();
  public readonly playbackEvent$: Observable<PlaybackEvent> =
    this.playbackEventSubject.asObservable();

  private readonly playbackRateChangeSubject = new Subject<number>();
  public readonly playbackRateChange$: Observable<number> =
    this.playbackRateChangeSubject.asObservable();

  public get activeAudioElement(): HTMLAudioElement {
    return this.audioElement;
  }

  public get playbackRate(): number {
    return this.audioElement.playbackRate;
  }

  public set playbackRate(val: number) {
    this.audioElement.playbackRate = val;
    this.playbackRateChangeSubject.next(this.audioElement.playbackRate);
  }

  public get duration(): number {
    return this.audioElement.duration;
  }

  public get progressPercentage(): number {
    return (this.audioElement.currentTime / this.audioElement.duration) * 100;
  }

  public set progressPercentage(percent: number) {
    this.audioElement.currentTime = (percent * this.audioElement.duration) / 100;
  }

  public set onTimeUpdate(ev: () => void) {
    this.audioElement.ontimeupdate = ev;
  }

  public constructor() {
    this.audioElement = new Audio();
    this.audioElement.preservesPitch = false;

    this.audioElement.onended = this.onFinishPlaying;

    this.setupNewTrack(this.trackList[this.currentTrackNum]);
  }

  public setupNewTrack(newAudio: string) {
    const oldPlaybackRate = this.playbackRate;
    this.audioElement.src = newAudio;
    this.audioElement.playbackRate = oldPlaybackRate;
  }

  public async playAudio() {
    if (this.audioElement.paused) {
      this.playbackEventSubject.next({ type: 'played', track: this.audioElement });
      this.isPlaying.set(true);
      await this.audioElement.play();
    } else {
      this.playbackEventSubject.next({ type: 'paused', track: this.audioElement });
      this.isPlaying.set(false);
      this.audioElement.pause();
    }
  }

  private onFinishPlaying = () => {
    console.log('finished');
    this.isPlaying.set(false);
  };

  public async playNext() {
    this.currentTrackNum =
      (this.currentTrackNum + 1 + this.trackList.length) % this.trackList.length;
    this.setupNewTrack(this.trackList[this.currentTrackNum]);
    await this.playAudio();
  }

  public async playPrevious() {
    this.currentTrackNum =
      (this.currentTrackNum - 1 + this.trackList.length) % this.trackList.length;
    this.setupNewTrack(this.trackList[this.currentTrackNum]);
    await this.playAudio();
  }
}
