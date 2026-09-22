import { Component, computed, inject, signal, Signal, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PlaybackProgressBar } from '../playback-progress-bar/playback-progress-bar';
import { PlaybackService } from '../../services/playback/playback.service';
import { TwilightBar } from '../twilight-bar/twilight-bar';
import { PlaybackRepeatMode } from '../../services/playback/playback-repeat-mode';
import { SideMenuStateService } from '../../services/side-menu-state/side-menu-state';
import { DatePipe } from '@angular/common';

@Component({
  imports: [MatButtonModule, MatIconModule, PlaybackProgressBar, TwilightBar, DatePipe],
  selector: 'tw-player-controls-bar',
  styleUrl: './player-controls-bar.css',
  templateUrl: './player-controls-bar.html',
})
export class PlayerControlsBar implements OnInit {
  protected readonly playbackService = inject(PlaybackService);
  protected readonly sideMenuState = inject(SideMenuStateService);

  protected readonly isPlaying: Signal<boolean>;
  protected readonly showTwilightBar = signal(true);

  protected readonly repeatIcon = computed(() => this.setRepeatIcon());

  protected readonly trackProgress = signal(0);
  protected readonly trackDuration = signal(0);

  constructor() {
    this.isPlaying = this.playbackService.isPlaying;
  }

  ngOnInit() {
    this.playbackService.timeUpdate$.subscribe(() => this.setTrackProgress());
  }

  private setTrackProgress() {
    this.trackProgress.set(this.playbackService.progress * 1000);
    this.trackDuration.set(this.playbackService.duration * 1000);
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
