import { Component, inject } from '@angular/core';
import { TrackItem } from '../track-item/track-item';
import { PlaylistService } from '../../services/playlist/playlist.service';

@Component({
  imports: [TrackItem],
  selector: 'tw-side-menu',
  styleUrl: './side-menu.css',
  templateUrl: './side-menu.html',
})
export class SideMenu {
  protected readonly playlistService = inject(PlaylistService);

  constructor() {}
}
