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

  protected readonly twilightBarValue = signal(1);
  protected readonly thumbPosition = signal(0);
  protected readonly thumbIcon: Signal<string>;
  protected readonly isGrabbing = signal(false);

  protected isPointerDown = false;
  protected isSeeking = false;

  protected twilightValueMin = 0.25;
  protected twilightValueMax = 2.5;

  constructor() {
    this.thumbIcon = computed(() => {
      if (this.twilightBarValue() > 1) {
        return 'icons/moon.svg';
      } else if (this.twilightBarValue() < 1) {
        return 'icons/sun.svg';
      } else {
        return 'icons/twilight.svg';
      }
    });
  }

  ngOnInit() {
    this.thumbPosition.set(50);

    this.twilightBarValue.set(this.playbackService.playbackRate);
  }

  private async setTwilightValue(pos: number) {
    const valInRange =
      pos <= 0.5
        ? MathUtils.lerp(this.twilightValueMin, 1, pos * 2)
        : MathUtils.lerp(1, this.twilightValueMax, (pos - 0.5) * 2);

    const trimmedValInRange = Number(valInRange.toFixed(2));

    const thumbVal = MathUtils.lerp(0, 100, pos);
    this.thumbPosition.set(thumbVal);

    this.playbackService.playbackRate = trimmedValInRange;
    this.twilightBarValue.set(trimmedValInRange);
  }

  private calculatePointerPosition(ev: PointerEvent) {
    const rect = this.twilightBarRef().nativeElement.getBoundingClientRect();

    const position = Math.max(0, Math.min(ev.clientX - rect.left, rect.width));

    const normalizedPosition = MathUtils.inverseLerp(0, rect.width, position);

    return normalizedPosition;
  }

  protected async onPointerDown(ev: PointerEvent) {
    this.isPointerDown = true;
    this.isGrabbing.set(true);

    (ev.currentTarget as HTMLElement).setPointerCapture(ev.pointerId);

    const position = this.calculatePointerPosition(ev);

    if (Math.abs(position - this.thumbPosition() / 100) > 0.05) {
      await this.setTwilightValue(position);

      if (!this.playbackService.isPlaying()) {
        await this.playbackService.playAudio();
      }
    }
  }

  protected async onPointerUp(ev: PointerEvent) {
    const center = 0.5;
    const position = this.calculatePointerPosition(ev);

    if (Math.abs(position - this.thumbPosition() / 100) > 0.05 && this.isSeeking) {
      if (Math.abs(position - center) < 0.01) {
        await this.setTwilightValue(center);
      } else {
        await this.setTwilightValue(position);
      }
    }

    this.isPointerDown = false;
    this.isSeeking = false;
    this.isGrabbing.set(false);
  }

  protected async onPointerMove(ev: PointerEvent) {
    if (!this.isPointerDown) {
      return;
    }

    this.isSeeking = true;

    const center = 0.5;
    const position = this.calculatePointerPosition(ev);

    if (Math.abs(position - center) < 0.01) {
      await this.setTwilightValue(center);
    } else {
      await this.setTwilightValue(position);
    }
  }
}
