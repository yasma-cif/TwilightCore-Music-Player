import { inject, Service, signal, WritableSignal } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { PlaybackRepeatMode } from './playback-repeat-mode';
import { PlaybackEvent } from './playback-event';
import { PlaylistService } from '../playlist/playlist.service';

@Service()
export class PlaybackService {
  private readonly _playlistService = inject(PlaylistService);

  private audioElement!: HTMLAudioElement;

  public readonly isPlaying = signal(false);

  private readonly _repeatMode: WritableSignal<PlaybackRepeatMode>;

  private readonly playbackEventSubject = new Subject<PlaybackEvent>();
  public readonly playbackEvent$: Observable<PlaybackEvent> =
    this.playbackEventSubject.asObservable();

  private readonly playbackRateChangeSubject = new Subject<number>();
  public readonly playbackRateChange$: Observable<number> =
    this.playbackRateChangeSubject.asObservable();

  private readonly timeUpdateSubject = new Subject<Event>();
  public readonly timeUpdate$: Observable<Event> = this.timeUpdateSubject.asObservable();

  public get activeAudioElement(): HTMLAudioElement {
    return this.audioElement;
  }

  public get playbackRate(): number {
    return this.audioElement.playbackRate;
  }

  public set playbackRate(val: number) {
    this.audioElement.playbackRate = val;

    this.TEST_setUIColor();
    this.playbackRateChangeSubject.next(this.audioElement.playbackRate);
  }

  public get duration(): number {
    return this.audioElement.duration;
  }

  public get progress(): number {
    return this.audioElement.currentTime;
  }

  public get progressPercentage(): number {
    return (this.audioElement.currentTime / this.audioElement.duration) * 100;
  }

  public set progressPercentage(percent: number) {
    this.audioElement.currentTime = (percent * this.audioElement.duration) / 100;
  }

  public get repeatMode(): PlaybackRepeatMode {
    return this._repeatMode();
  }

  public set repeatMode(mode: PlaybackRepeatMode) {
    this._repeatMode.set(mode);
  }

  public constructor() {
    this.audioElement = new Audio();
    this.audioElement.preservesPitch = false;

    this.audioElement.addEventListener('ended', async () => {
      await this.onFinishPlaying();
    });

    this._repeatMode = signal(PlaybackRepeatMode.RepeatCategory);

    this.audioElement.ontimeupdate = (ev) => {
      this.timeUpdateSubject.next(ev);
    };

    this.TEST_setUIColor();
    void this.initializeFirstTrack();
  }

  private async initializeFirstTrack() {
    await this._playlistService.ready;

    this.setupNewTrack(
      this._playlistService.currentPlaylist()[this._playlistService.currentTrackNum].url,
    );
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

  private onFinishPlaying = async () => {
    switch (this._repeatMode()) {
      case PlaybackRepeatMode.None:
        this.isPlaying.set(false);
        break;
      case PlaybackRepeatMode.RepeatCategory:
        await this.playNext();
        break;
      case PlaybackRepeatMode.RepeatSong:
        this.setupNewTrack(
          this._playlistService.currentPlaylist()[this._playlistService.currentTrackNum].url,
        );
        await this.playAudio();
        break;
    }
  };

  private TEST_setUIColor() {
    const MIN = 0.25;
    const MAX = 3;
    const EASE = 1;
    const CENTER = 1;

    const r = Math.min(MAX, Math.max(MIN, this.audioElement.playbackRate));
    const x =
      r <= CENTER
        ? (0.5 * (r - MIN)) / (CENTER - MIN)
        : 0.5 + (0.5 * (r - CENTER)) / (MAX - CENTER);

    const a = Math.pow(x, EASE);
    const b = Math.pow(1 - x, EASE);
    document.documentElement.style.setProperty('--t', String(a / (a + b)));
  }

  public async playNext() {
    this._playlistService.playNext();
    this.setupNewTrack(this._playlistService.currentTrack()!.url);
    await this.playAudio();
  }

  public async playPrevious() {
    this._playlistService.playPrevious();
    this.setupNewTrack(this._playlistService.currentTrack()!.url);
    await this.playAudio();
  }

  public async playByNumber(num: number) {
    this._playlistService.playByNumber(num);
    this.setupNewTrack(this._playlistService.currentTrack()!.url);
    await this.playAudio();
  }
}
