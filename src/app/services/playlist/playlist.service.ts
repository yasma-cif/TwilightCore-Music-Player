import { Service, signal, WritableSignal } from '@angular/core';
import { Track } from './track';
import { parseBlob } from 'music-metadata';

@Service()
export class PlaylistService {
  private readonly TEST_trackFileList: Array<string> = [
    '/music/test1.mp3',
    '/music/test2.mp3',
    '/music/test3.mp3',
    '/music/test4.mp3',
    '/music/other_tests/Last Engage (Prayer-Incantation).mp3',
    '/music/other_tests/Wind Garden.flac',
    '/music/other_tests/kk.mp3',
    '/music/other_tests/aerosurf.mp3',
    '/music/other_tests/sbbb main.mp3',
    '/music/other_tests/sbbb menu.mp3',
    '/music/other_tests/td.mp3',
    '/music/other_tests/bt.mp3',
    '/music/other_tests/c ruins.mp3',
    '/music/other_tests/f winds.flac',
    '/music/other_tests/daybreak.flac',
    '/music/other_tests/finale.flac',
  ];

  private readonly _currentPlaylist = signal<Array<Track>>([]);
  public readonly currentPlaylist = this._currentPlaylist.asReadonly();

  private readonly _currentTrack: WritableSignal<Track | undefined>;

  public readonly currentTrack;

  public currentTrackNum = 0;

  public readonly ready: Promise<void>;

  constructor() {
    this._currentTrack = signal(undefined);
    this.currentTrack = this._currentTrack.asReadonly();

    this.ready = this.createPlaylist();
  }

  private async createPlaylist(): Promise<void> {
    const playlist: Array<Track> = [];

    for (const t of this.TEST_trackFileList) {
      const metadata = await this.loadTrackMetadata(t);

      const coverArt = metadata.common.picture?.[0];

      playlist.push({
        url: t,
        title:
          metadata.common.title ??
          t
            .split('/')
            .pop()!
            .replace(/\.[^/.]+$/, ''),
        artist: metadata.common.artist ?? '',
        album: metadata.common.album ?? '',
        coverArt: coverArt
          ? `data:${coverArt.format};base64,${this.uint8ArrayToBase64(coverArt.data)}`
          : null,
        duration: metadata.format.duration! * 1000,
      });
    }
    this._currentPlaylist.set(playlist);

    this._currentTrack.set(this._currentPlaylist()[this.currentTrackNum]);
  }

  private uint8ArrayToBase64(data: Uint8Array): string {
    let binary = '';

    for (const byte of data) {
      binary += String.fromCharCode(byte);
    }

    return btoa(binary);
  }

  private async loadTrackMetadata(t: string) {
    const track = await fetch(t);
    const blob = await track.blob();

    return await parseBlob(blob);
  }

  public playNext() {
    this.currentTrackNum =
      (this.currentTrackNum + 1 + this._currentPlaylist().length) % this._currentPlaylist().length;

    this._currentTrack.set(this._currentPlaylist()[this.currentTrackNum]);
  }

  public playPrevious() {
    this.currentTrackNum =
      (this.currentTrackNum - 1 + this._currentPlaylist().length) % this._currentPlaylist().length;

    this._currentTrack.set(this._currentPlaylist()[this.currentTrackNum]);
  }

  public playByNumber(num: number) {
    if (num >= this._currentPlaylist().length || num < 0) {
      console.error('Track number out of range.');
      return;
    }

    this.currentTrackNum = num;

    this._currentTrack.set(this._currentPlaylist()[this.currentTrackNum]);
  }
}
