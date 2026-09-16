import { Component, computed, inject, signal, Signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PlaybackProgressBar } from '../playback-progress-bar/playback-progress-bar';
import { PlaybackService } from '../../services/playback/playback.service';
import { TwilightBar } from '../twilight-bar/twilight-bar';
import { PlaybackRepeatMode } from '../../services/playback/playback-repeat-mode';
import { SideMenuStateService } from '../../services/side-menu-state/side-menu-state';

@Component({
  imports: [MatButtonModule, MatIconModule, PlaybackProgressBar, TwilightBar],
  selector: 'tw-player-controls-bar',
  styleUrl: './player-controls-bar.css',
  templateUrl: './player-controls-bar.html',
})
export class PlayerControlsBar {
  private readonly playbackService = inject(PlaybackService);
  protected readonly sideMenuState = inject(SideMenuStateService);

  protected readonly isPlaying: Signal<boolean>;
  protected readonly showTwilightBar = signal(true);

  protected readonly repeatIcon = computed(() => this.setRepeatIcon());

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

  protected toggleTwilightBar() {
    this.showTwilightBar.set(!this.showTwilightBar());
  }

  protected switchRepeatMode() {
    this.playbackService.repeatMode =
      (this.playbackService.repeatMode + 1) % (Object.keys(PlaybackRepeatMode).length / 2);
    console.log(this.playbackService.repeatMode);
  }

  private setRepeatIcon() {
    switch (this.playbackService.repeatMode) {
      case PlaybackRepeatMode.None:
        return 'fa-repeat disabled-icon';
      case PlaybackRepeatMode.RepeatCategory:
        return 'fa-repeat';
      case PlaybackRepeatMode.RepeatSong:
        return 'fa-1';
    }
  }
}
