import { Component, inject, WritableSignal, signal, OnInit } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { PlaybackService } from '../services/playback/playback.service';

@Component({
  imports: [MatProgressBarModule],
  selector: 'tw-playback-progress-bar',
  styleUrl: './playback-progress-bar.css',
  templateUrl: './playback-progress-bar.html',
})
export class PlaybackProgressBar implements OnInit {
  private readonly playbackService = inject(PlaybackService);

  protected readonly playbackProgress: WritableSignal<number> = signal(
    this.playbackService.progressPercentage,
  );

  ngOnInit() {
    this.playbackService.currentAudio.ontimeupdate = () => {
      this.playbackProgress.set(this.playbackService.progressPercentage);
    };
  }
}
