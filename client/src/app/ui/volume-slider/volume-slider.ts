import {
  Component,
  inject,
  signal,
  OnInit,
  viewChild,
  ElementRef,
  computed,
  Signal,
} from '@angular/core';
import { PlaybackService } from '../../services/playback/playback.service';
import { MathUtils } from '../../common/math-utils';

@Component({
  imports: [],
  selector: 'tw-volume-slider',
  styleUrl: './volume-slider.css',
  templateUrl: './volume-slider.html',
})
export class VolumeSlider {
  private readonly playbackService = inject(PlaybackService);

  private readonly volumeSliderRef =
    viewChild.required<ElementRef<HTMLCanvasElement>>('volumeSlider');

  protected readonly volumeValuePercentage: Signal<number>;
  protected readonly showThumb = signal(false);
  protected readonly volumeSliderExpanded = signal(false);
  protected readonly isGrabbing = signal(false);
  protected readonly isSeeking = signal(false);

  protected isPointerDown = false;

  constructor() {
    this.volumeValuePercentage = computed(() => {
      return this.playbackService.currentVolume() * 100;
    });
  }

  private calculatePointerPosition(ev: PointerEvent) {
    const rect = this.volumeSliderRef().nativeElement.getBoundingClientRect();

    const position = Math.max(0, Math.min(ev.clientX - rect.left, rect.width));

    return MathUtils.inverseLerp(0, rect.width, position);
  }

  protected async onPointerDown(ev: PointerEvent) {
    this.isPointerDown = true;
    this.isGrabbing.set(true);

    (ev.currentTarget as HTMLElement).setPointerCapture(ev.pointerId);

    this.playbackService.volume = this.calculatePointerPosition(ev);
  }

  protected async onPointerUp(ev: PointerEvent) {
    if (this.isSeeking()) {
      this.playbackService.volume = this.calculatePointerPosition(ev);
    }

    this.isPointerDown = false;
    this.isSeeking.set(false);
    this.isGrabbing.set(false);
  }

  protected async onPointerMove(ev: PointerEvent) {
    if (this.isPointerDown) {
      this.isSeeking.set(true);
      this.playbackService.volume = this.calculatePointerPosition(ev);
    }
  }

  protected onPointerEnter() {
    this.volumeSliderExpanded.set(true);
    this.showThumb.set(true);
  }

  protected onPointerLeave() {
    this.volumeSliderExpanded.set(false);
    this.showThumb.set(false);
  }
}
