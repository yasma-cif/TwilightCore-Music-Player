import { inject, Service, signal } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { PlaybackRepeatMode } from './playback-repeat-mode';
import { PlaybackShuffleMode } from './playback-shuffle-mode';
import { PlaybackEvent } from './playback-event';
import { PlaylistService } from '../playlist/playlist.service';

@Service()
export class PlaybackService {
  private readonly playlistService = inject(PlaylistService);

  private readonly audioElement: HTMLAudioElement;

  public readonly isPlaying = signal(false);

  private readonly _repeatMode = signal(PlaybackRepeatMode.RepeatCategory);
  public readonly repeatMode = this._repeatMode.asReadonly();

  private readonly _shuffleMode = signal(PlaybackShuffleMode.None);
  public readonly shuffleMode = this._shuffleMode.asReadonly();

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

  public constructor() {
    this.audioElement = new Audio();
    this.audioElement.preservesPitch = false;

    this.audioElement.addEventListener('ended', async () => {
      await this.onFinishPlaying();
    });

    this.audioElement.ontimeupdate = (ev) => {
      this.timeUpdateSubject.next(ev);
    };

    void this.initializeFirstTrack();
  }

  private async initializeFirstTrack() {
    await this.playlistService.ready;

    this.setupNewTrack(this.playlistService.currentPlaylist()[0].url);
  }

  public setupNewTrack(newTrack: string) {
    const oldPlaybackRate = this.playbackRate;
    this.audioElement.src = newTrack;
    this.audioElement.playbackRate = oldPlaybackRate;
  }

  public async playAudio() {
    if (!this.audioElement.src) {
      return;
    }

    if (this.audioElement.paused) {
      this.playbackEventSubject.next({ type: 'played' });
      this.isPlaying.set(true);
      await this.audioElement.play();
    } else {
      this.playbackEventSubject.next({ type: 'paused' });
      this.isPlaying.set(false);
      this.audioElement.pause();
    }
  }

  private onFinishPlaying = async () => {
    switch (this._repeatMode()) {
      case PlaybackRepeatMode.None:
        this.isPlaying.set(false);
        this.progressPercentage = 0;
        break;
      case PlaybackRepeatMode.RepeatCategory:
        if (this._shuffleMode() === PlaybackShuffleMode.None) {
          await this.playNext();
        } else if (this._shuffleMode() === PlaybackShuffleMode.ShuffleAll) {
          await this.playRandom();
        }
        break;
      case PlaybackRepeatMode.RepeatSong:
        await this.playByNumber(this.playlistService.currentTrackNum());
        break;
    }
  };

  public async playNext() {
    this.playlistService.playNext();
    this.setupNewTrack(this.playlistService.currentTrack()!.url);
    await this.playAudio();
  }

  public async playPrevious() {
    this.playlistService.playPrevious();
    this.setupNewTrack(this.playlistService.currentTrack()!.url);
    await this.playAudio();
  }

  public async playByNumber(num: number) {
    this.playlistService.playByNumber(num);
    this.setupNewTrack(this.playlistService.currentTrack()!.url);
    await this.playAudio();
  }

  public async playRandom() {
    this.playlistService.playRandom();
    this.setupNewTrack(this.playlistService.currentTrack()!.url);
    await this.playAudio();
  }

  public switchRepeatMode() {
    this._repeatMode.set((this._repeatMode() + 1) % (Object.keys(PlaybackRepeatMode).length / 2));
  }

  public switchShuffleMode() {
    this._shuffleMode.set(
      (this._shuffleMode() + 1) % (Object.keys(PlaybackShuffleMode).length / 2),
    );
  }
}
