import { Component, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
  imports: [DecimalPipe],
  selector: 'tw-player',
  styleUrl: './player-controls.css',
  templateUrl: './player-controls.html',
})
export class Player implements OnInit {
  private readonly SONG = '/music/test2.mp3';
  protected _current_Audio: HTMLAudioElement;

  public constructor() {
    this._current_Audio = new Audio();
  }

  async ngOnInit() {
    this._current_Audio.src = this.SONG;

    this._current_Audio.preservesPitch = false;
    this._current_Audio.playbackRate = 1;
  }

  protected get playbackRate(): number {
    return this._current_Audio.playbackRate;
  }

  protected get isPlaying(): boolean {
    return !this._current_Audio.paused;
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
