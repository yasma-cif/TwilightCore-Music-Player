import { Component, inject, Signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PlaybackProgressBar } from '../playback-progress-bar/playback-progress-bar';
import { PlaybackService } from '../../services/playback/playback.service';

@Component({
  imports: [MatButtonModule, MatIconModule, PlaybackProgressBar],
  selector: 'tw-player-controls-bar',
  styleUrl: './player-controls-bar.css',
  templateUrl: './player-controls-bar.html',
})
export class PlayerControlsBar {
  private readonly playbackService = inject(PlaybackService);

  protected readonly isPlaying: Signal<boolean>;

  constructor() {
    this.isPlaying = this.playbackService.isPlaying;
  }

  protected async playAudio() {
    await this.playbackService.playAudio();
  }

  protected async playNext() {
    await this.playbackService.playNext();
  }

  protected async playPrevious() {
    await this.playbackService.playPrevious();
  }
}
