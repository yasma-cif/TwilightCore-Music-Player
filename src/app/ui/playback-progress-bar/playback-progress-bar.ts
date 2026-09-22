import { Component, inject, signal, OnInit, viewChild, ElementRef } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { PlaybackService } from '../../services/playback/playback.service';

@Component({
  imports: [MatProgressBarModule],
  selector: 'tw-playback-progress-bar',
  styleUrl: './playback-progress-bar.css',
  templateUrl: './playback-progress-bar.html',
})
export class PlaybackProgressBar implements OnInit {
  private readonly playbackService = inject(PlaybackService);

  private readonly progressBarRef =
    viewChild.required<ElementRef<HTMLCanvasElement>>('progressBar');

  protected readonly progressBarValue = signal(0);
  protected readonly showThumb = signal(false);
  protected readonly progressBarHeight = signal(4);

  protected isPointerDown = false;
  protected isSeeking = false;

  ngOnInit() {
    this.playbackService.timeUpdate$.subscribe(() => this.setPlaybackBarProgress());
  }

  private setPlaybackBarProgress() {
    if (!this.isSeeking) {
      this.progressBarValue.set(this.playbackService.progressPercentage);
    }
  }

  private async seekByPercentage(pos: number) {
    const barWidth = this.progressBarRef().nativeElement.offsetWidth;
    this.playbackService.progressPercentage = (pos / barWidth) * 100;

    if (!this.playbackService.isPlaying()) {
      await this.playbackService.playAudio();
    }
  }

  private calculatePointerPosition(ev: PointerEvent) {
    const rect = this.progressBarRef().nativeElement.getBoundingClientRect();

    return Math.max(0, Math.min(ev.clientX - rect.left, rect.width));
  }

  protected async onPointerDown(ev: PointerEvent) {
    this.isPointerDown = true;

    (ev.currentTarget as HTMLElement).setPointerCapture(ev.pointerId);

    await this.seekByPercentage(this.calculatePointerPosition(ev));

    if (!this.playbackService.isPlaying()) {
      await this.playbackService.playAudio();
    }
  }

  protected async onPointerUp(ev: PointerEvent) {
    if (this.isSeeking) {
      await this.seekByPercentage(this.calculatePointerPosition(ev));
    }

    this.isPointerDown = false;
    this.isSeeking = false;
  }

  protected async onPointerMove(ev: PointerEvent) {
    if (this.isPointerDown) {
      this.isSeeking = true;
      const barWidth = this.progressBarRef().nativeElement.offsetWidth;
      this.progressBarValue.set((ev.pageX / barWidth) * 100);
    }
  }

  protected onPointerEnter() {
    this.progressBarHeight.set(8);
    this.showThumb.set(true);
  }

  protected onPointerLeave() {
    this.progressBarHeight.set(4);
    this.showThumb.set(false);
  }
}
