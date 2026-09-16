import { Component, inject } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Visualizer } from '../visualizer/visualizer';
import { SideMenu } from '../side-menu/side-menu';
import { SideMenuStateService } from '../../services/side-menu-state/side-menu-state';

@Component({
  imports: [MatSidenavModule, Visualizer, SideMenu],
  selector: 'tw-app-content',
  styleUrl: './app-content.css',
  templateUrl: './app-content.html',
})
export class AppContent {
  protected readonly sidemenuState = inject(SideMenuStateService);
}
