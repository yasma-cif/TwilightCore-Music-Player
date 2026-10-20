import { Component, inject } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Visualizer } from '../visualizer/visualizer';
import { TrackMenu } from '../track-menu/track-menu';
import { TrackMenuStateService } from '../../services/track-menu-state/track-menu-state';

@Component({
  imports: [MatSidenavModule, Visualizer, TrackMenu],
  selector: 'tw-app-content',
  styleUrl: './app-content.css',
  templateUrl: './app-content.html',
})
export class AppContent {
  protected readonly sidemenuState = inject(TrackMenuStateService);
}
