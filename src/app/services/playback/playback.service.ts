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

  public get repeatMode(): PlaybackRepeatMode {
    return this._repeatMode();
  }

  public set repeatMode(mode: PlaybackRepeatMode) {
    this._repeatMode.set(mode);
  }

  public set onTimeUpdate(ev: () => void) {
    this.audioElement.ontimeupdate = ev;
  }

  public constructor() {
    this.audioElement = new Audio();
    this.audioElement.preservesPitch = false;

    this.audioElement.onended = this.onFinishPlaying;

    this.setupNewTrack(
      this._playlistService.currentPlaylist[this._playlistService.currentTrackNum].url,
    );

    this._repeatMode = signal(PlaybackRepeatMode.RepeatCategory);
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
          this._playlistService.currentPlaylist[this._playlistService.currentTrackNum].url,
        );
        await this.playAudio();
        break;
    }
  };

  public async playNext() {
    this._playlistService.playNext();
    this.setupNewTrack(this._playlistService.currentTrack().url);
    await this.playAudio();
  }

  public async playPrevious() {
    this._playlistService.playPrevious();
    this.setupNewTrack(this._playlistService.currentTrack().url);
    await this.playAudio();
  }

  public async playByNumber(num: number) {
    this._playlistService.playByNumber(num);
    this.setupNewTrack(this._playlistService.currentTrack().url);
    await this.playAudio();
  }
}
