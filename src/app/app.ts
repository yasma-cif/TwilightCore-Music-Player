import { Component } from '@angular/core';
import { PlayerControlsBar } from './ui/player-controls-bar/player-controls-bar';
import { TopBar } from './ui/top-bar/top-bar';
import { AppContent } from './ui/app-content/app-content';

@Component({
  selector: 'tw-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
  imports: [PlayerControlsBar, TopBar, AppContent],
})
export class App {}
