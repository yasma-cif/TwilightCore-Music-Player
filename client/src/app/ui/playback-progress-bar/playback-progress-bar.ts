import { Component, inject, signal, OnInit, viewChild, ElementRef } from '@angular/core';
import { PlaybackService } from '../../services/playback/playback.service';

@Component({
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
  protected readonly progressBarExpanded = signal(false);
  protected readonly isGrabbing = signal(false);
  protected readonly isSeeking = signal(false);

  protected isPointerDown = false;

  ngOnInit() {
    this.playbackService.timeUpdate$.subscribe(() => this.updatePlaybackBarProgress());
  }

  private updatePlaybackBarProgress() {
    if (!this.isSeeking()) {
      this.progressBarValue.set(this.playbackService.progressPercentage);
    }
  }

  private async seek(pos: number) {
    const barWidth = this.progressBarRef().nativeElement.offsetWidth;

    this.playbackService.seekByPercentage((pos / barWidth) * 100);

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
    this.isGrabbing.set(true);

    (ev.currentTarget as HTMLElement).setPointerCapture(ev.pointerId);

    const newPosition = this.calculatePointerPosition(ev);

    const currentPosition =
      (this.progressBarRef().nativeElement.offsetWidth * this.progressBarValue()) / 100;

    if (Math.abs(newPosition - currentPosition) > 14) {
      await this.seek(newPosition);

      if (!this.playbackService.isPlaying()) {
        await this.playbackService.playAudio();
      }
    }
  }

  protected async onPointerUp(ev: PointerEvent) {
    if (this.isSeeking()) {
      await this.seek(this.calculatePointerPosition(ev));
    }

    this.isPointerDown = false;
    this.isSeeking.set(false);
    this.isGrabbing.set(false);
  }

  protected async onPointerMove(ev: PointerEvent) {
    if (this.isPointerDown) {
      this.isSeeking.set(true);
      const barWidth = this.progressBarRef().nativeElement.offsetWidth;
      this.progressBarValue.set((ev.pageX / barWidth) * 100);
    }
  }

  protected onPointerEnter() {
    this.progressBarExpanded.set(true);
    this.showThumb.set(true);
  }

  protected onPointerLeave() {
    this.progressBarExpanded.set(false);
    this.showThumb.set(false);
  }
}
