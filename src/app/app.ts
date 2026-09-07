import { Component, signal, OnInit } from '@angular/core';
import { Player } from './player-controls/player-controls';
import { TopBar } from './top-bar/top-bar';

@Component({
  selector: 'tw-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
  imports: [Player, TopBar],
})
export class App {}
