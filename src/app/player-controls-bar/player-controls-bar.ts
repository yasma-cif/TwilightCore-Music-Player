import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PlaybackProgressBar } from '../playback-progress-bar/playback-progress-bar';
import { PlaybackService } from '../services/playback/playback.service';

@Component({
  imports: [MatButtonModule, MatIconModule, PlaybackProgressBar],
  providers: [PlaybackService],
  selector: 'tw-player',
  styleUrl: './player-controls-bar.css',
  templateUrl: './player-controls-bar.html',
})
export class PlayerControlsBar {
  private readonly playbackService = inject(PlaybackService);

  protected async playAudio() {
    await this.playbackService.playAudio();
  }

  protected get isPlaying(): boolean {
    return this.playbackService.isPlaying;
  }
}
