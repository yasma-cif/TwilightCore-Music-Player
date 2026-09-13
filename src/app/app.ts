import { Component } from '@angular/core';
import { PlayerControlsBar } from './player-controls-bar/player-controls-bar';
import { TopBar } from './top-bar/top-bar';

@Component({
  selector: 'tw-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
  imports: [PlayerControlsBar, TopBar],
})
export class App {}
