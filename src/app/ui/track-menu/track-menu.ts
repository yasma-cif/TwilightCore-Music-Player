import { Component, inject } from '@angular/core';
import { TrackItem } from '../track-item/track-item';
import { PlaylistService } from '../../services/playlist/playlist.service';

@Component({
  imports: [TrackItem],
  selector: 'tw-track-menu',
  styleUrl: './track-menu.css',
  templateUrl: './track-menu.html',
})
export class TrackMenu {
  protected readonly playlistService = inject(PlaylistService);

  constructor() {}
}
