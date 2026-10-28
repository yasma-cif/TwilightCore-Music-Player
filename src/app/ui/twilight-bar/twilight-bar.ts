import {
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
  OnInit,
  computed,
  Signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { PlaybackService } from '../../services/playback/playback.service';
import { MathUtils } from '../../common/math-utils';

@Component({
  imports: [DecimalPipe],
  selector: 'tw-twilight-bar',
  styleUrl: './twilight-bar.css',
  templateUrl: './twilight-bar.html',
})
export class TwilightBar implements OnInit {
  private readonly playbackService = inject(PlaybackService);

  private readonly twilightBarRef =
    viewChild.required<ElementRef<HTMLCanvasElement>>('twilightBar');

  protected readonly twilightValue = signal(1);
  protected readonly thumbPositionPercent = signal(0);
  protected readonly thumbIcon: Signal<string>;
  protected readonly isGrabbing = signal(false);
  protected readonly isSeeking = signal(false);

  protected isPointerDown = false;

  protected TWILIGHT_VALUE_MIN = 0.25;
  protected TWILIGHT_VALUE_MAX = 2.5;

  constructor() {
    this.thumbIcon = computed(() => {
      if (this.twilightValue() > 1) {
        return 'icons/moon.svg';
      } else if (this.twilightValue() < 1) {
        return 'icons/sun.svg';
      } else {
        return 'icons/twilight.svg';
      }
    });
  }

  ngOnInit() {
    this.thumbPositionPercent.set(50);
    this.twilightValue.set(this.playbackService.playbackRate);
  }

  private async setTwilightValue(pos: number) {
    // Sets 1.0 as the center of the bar
    const twilightVal =
      pos <= 0.5
        ? MathUtils.lerp(this.TWILIGHT_VALUE_MIN, 1.0, pos * 2)
        : MathUtils.lerp(1.0, this.TWILIGHT_VALUE_MAX, (pos - 0.5) * 2);

    const newThumbPos = MathUtils.lerp(0, 100, pos);
    this.thumbPositionPercent.set(newThumbPos);

    const truncatedTwilightVal = Number(twilightVal.toFixed(2));
    this.playbackService.playbackRate = truncatedTwilightVal;
    this.twilightValue.set(truncatedTwilightVal);
  }

  private calculatePointerPosition(ev: PointerEvent) {
    const rect = this.twilightBarRef().nativeElement.getBoundingClientRect();

    const position = Math.max(0, Math.min(ev.clientX - rect.left, rect.width));

    return MathUtils.inverseLerp(0, rect.width, position);
  }

  protected async onPointerDown(ev: PointerEvent) {
    this.isPointerDown = true;
    this.isGrabbing.set(true);

    (ev.currentTarget as HTMLElement).setPointerCapture(ev.pointerId);

    const newPosition = this.calculatePointerPosition(ev);

    if (Math.abs(newPosition - this.thumbPositionPercent() / 100) > 0.05) {
      await this.setTwilightValue(newPosition);

      if (!this.playbackService.isPlaying()) {
        await this.playbackService.playAudio();
      }
    }
  }

  protected async onPointerUp(ev: PointerEvent) {
    const center = 0.5;
    const newPosition = this.calculatePointerPosition(ev);

    if (Math.abs(newPosition - this.thumbPositionPercent() / 100) > 0.05 && this.isSeeking()) {
      if (Math.abs(newPosition - center) < 0.01) {
        await this.setTwilightValue(center);
      } else {
        await this.setTwilightValue(newPosition);
      }
    }

    this.isPointerDown = false;
    this.isSeeking.set(false);
    this.isGrabbing.set(false);
  }

  protected async onPointerMove(ev: PointerEvent) {
    if (!this.isPointerDown) {
      return;
    }

    this.isSeeking.set(true);

    const center = 0.5;
    const newPosition = this.calculatePointerPosition(ev);

    if (Math.abs(newPosition - center) < 0.01) {
      await this.setTwilightValue(center);
    } else {
      await this.setTwilightValue(newPosition);
    }
  }
}
