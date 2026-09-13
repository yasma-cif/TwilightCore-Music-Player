import { Service } from '@angular/core';

@Service()
export class PlaybackService {
  private readonly SONG = '/music/test2.mp3';
  protected _current_Audio: HTMLAudioElement;

  public constructor() {
    this._current_Audio = new Audio();

    this._current_Audio.src = this.SONG;

    this._current_Audio.preservesPitch = false;
    this._current_Audio.playbackRate = 1;
  }

  public get currentAudio() {
    return this._current_Audio;
  }

  public get playbackRate(): number {
    return this._current_Audio.playbackRate;
  }

  public get isPlaying(): boolean {
    return !this._current_Audio.paused;
  }

  public get duration(): number {
    return this._current_Audio.duration;
  }

  public get progressPercentage(): number {
    return (this._current_Audio.currentTime / this._current_Audio.duration) * 100;
  }

  public async playAudio() {
    if (this._current_Audio.paused) {
      await this._current_Audio.play();
    } else {
      this._current_Audio.pause();
    }
  }

  public increaseSpeed() {
    this._current_Audio.playbackRate += 0.02;
  }
  public decreaseSpeed() {
    this._current_Audio.playbackRate -= 0.02;
  }
}
