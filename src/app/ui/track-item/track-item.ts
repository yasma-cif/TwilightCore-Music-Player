import { Component, inject, input } from '@angular/core';
import { PlaybackService } from '../../services/playback/playback.service';

@Component({
  imports: [],
  selector: 'tw-track-item',
  styleUrl: './track-item.css',
  templateUrl: './track-item.html',
})
export class TrackItem {
  private readonly _playbackService = inject(PlaybackService);

  public readonly trackTitle = input.required<string>();
  public readonly trackNumber = input.required<number>();

  protected async playTrack() {
    await this._playbackService.playByNumber(this.trackNumber() - 1);
  }
}
