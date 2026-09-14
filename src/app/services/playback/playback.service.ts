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

  public get activeAudioElement(): HTMLAudioElement {
    return this.audioElement;
  }

  public get playbackRate(): number {
    return this.audioElement.playbackRate;
  }

  public get duration(): number {
    return this.audioElement.duration;
  }

  public get progressPercentage(): number {
    return (this.audioElement.currentTime / this.audioElement.duration) * 100;
  }

  public set onTimeUpdate(ev: () => void) {
    this.audioElement.ontimeupdate = ev;
  }

  public constructor() {
    this.audioElement = new Audio();
    this.setupNewTrack(this.trackList[this.currentTrackNum]);
  }

  public setupNewTrack(newAudio: string) {
    this.audioElement.src = newAudio;

    this.audioElement.preservesPitch = false;
    this.audioElement.playbackRate = 1;
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

  public increaseSpeed() {
    this.audioElement.playbackRate += 0.02;
  }
  public decreaseSpeed() {
    this.audioElement.playbackRate -= 0.02;
  }

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
