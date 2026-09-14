import { Component } from '@angular/core';
import { PlayerControlsBar } from './ui/player-controls-bar/player-controls-bar';
import { TopBar } from './ui/top-bar/top-bar';
import { TwilightBar } from './ui/twilight-bar/twilight-bar';
import { Visualizer } from './ui/visualizer/visualizer';

@Component({
  selector: 'tw-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
  imports: [PlayerControlsBar, TopBar, TwilightBar, Visualizer],
})
export class App {}
