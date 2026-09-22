import { Service, signal, WritableSignal } from '@angular/core';
import { Track } from './track';

@Service()
export class PlaylistService {
  private _currentPlaylist: Array<Track>;

  private readonly _currentTrack: WritableSignal<Track>;

  public readonly currentTrack;

  public currentTrackNum = 0;

  public get currentPlaylist(): Array<Track> {
    return this._currentPlaylist;
  }

  constructor() {
    this._currentPlaylist = [
      { url: '/music/test1.mp3', title: 'Extended Encore' },
      { url: '/music/test2.mp3', title: 'What Lies at the End' },
      { url: '/music/test3.mp3', title: 'New Battle!!!' },
      { url: '/music/test4.mp3', title: 'Bokura no Network' },
    ];

    this._currentTrack = signal(this._currentPlaylist[this.currentTrackNum]);
    this.currentTrack = this._currentTrack.asReadonly();
  }

  public playNext() {
    this.currentTrackNum =
      (this.currentTrackNum + 1 + this._currentPlaylist.length) % this._currentPlaylist.length;

    this._currentTrack.set(this._currentPlaylist[this.currentTrackNum]);
  }

  public playPrevious() {
    this.currentTrackNum =
      (this.currentTrackNum - 1 + this._currentPlaylist.length) % this._currentPlaylist.length;

    this._currentTrack.set(this._currentPlaylist[this.currentTrackNum]);
  }

  public playByNumber(num: number) {
    if (num >= this._currentPlaylist.length || num < 0) {
      console.error('Track number out of range.');
      return;
    }

    this.currentTrackNum = num;

    this._currentTrack.set(this._currentPlaylist[this.currentTrackNum]);
  }
}
