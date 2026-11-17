import { Component } from '@angular/core';
import { TopBar } from './ui/top-bar/top-bar';
import { PlayerControlsBar } from './ui/player-controls-bar/player-controls-bar';
import { AppInner } from './ui/app-inner/app-inner';

@Component({
  selector: 'tw-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
  imports: [TopBar, PlayerControlsBar, AppInner],
})
export class App {}
