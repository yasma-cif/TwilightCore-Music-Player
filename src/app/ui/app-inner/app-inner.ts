import { Component, inject } from '@angular/core';
import { Visualizer } from '../visualizer/visualizer';
import { TrackMenu } from '../track-menu/track-menu';
import { TrackMenuStateService } from '../../services/track-menu-state/track-menu-state';

@Component({
  imports: [Visualizer, TrackMenu],
  selector: 'tw-app-inner',
  styleUrl: './app-inner.css',
  templateUrl: './app-inner.html',
})
export class AppInner {
  protected readonly sidemenuState = inject(TrackMenuStateService);
}
