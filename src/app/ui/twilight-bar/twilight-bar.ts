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

  protected isPointerDown = false;
  protected isSeeking = false;

  protected twilightValueMin = 0.25;
  protected twilightValueMax = 3;

  constructor() {
    this.thumbIcon = computed(() => (this.twilightBarValue() >= 1 ? 'fa-moon' : 'fa-sun'));
  }

  ngOnInit() {
    const valInRange = MathUtils.inverseLerp(
      this.twilightValueMin,
      this.twilightValueMax,
      this.playbackService.playbackRate,
    );
    const thumbVal = MathUtils.lerp(-100, 100, valInRange);
    this.thumbPosition.set(thumbVal);

    this.twilightBarValue.set(this.playbackService.playbackRate);
  }

  private async setTwilightValue(pos: number) {
    const maxBarVal = this.twilightBarRef().nativeElement.getBoundingClientRect().width;

    const normalizedVal = MathUtils.inverseLerp(0, maxBarVal, pos);
    const valInRange = MathUtils.lerp(this.twilightValueMin, this.twilightValueMax, normalizedVal);
    const trimmedValInRange = Number(valInRange.toFixed(2));

    const thumbVal = MathUtils.lerp(-100, 100, normalizedVal);
    this.thumbPosition.set(thumbVal);

    this.playbackService.playbackRate = trimmedValInRange;
    this.twilightBarValue.set(trimmedValInRange);

    console.log(this.twilightBarValue());
  }

  private calculatePointerPosition(ev: PointerEvent) {
    const rect = this.twilightBarRef().nativeElement.getBoundingClientRect();

    return Math.max(0, Math.min(ev.clientX - rect.left, rect.width));
  }

  protected async onPointerDown(ev: PointerEvent) {
    this.isPointerDown = true;

    (ev.currentTarget as HTMLElement).setPointerCapture(ev.pointerId);

    await this.setTwilightValue(this.calculatePointerPosition(ev));

    if (!this.playbackService.isPlaying()) {
      await this.playbackService.playAudio();
    }
  }

  protected async onPointerUp(ev: PointerEvent) {
    if (this.isSeeking) {
      await this.setTwilightValue(this.calculatePointerPosition(ev));
    }

    this.isPointerDown = false;
    this.isSeeking = false;
  }

  protected async onPointerMove(ev: PointerEvent) {
    if (this.isPointerDown) {
      this.isSeeking = true;
      await this.setTwilightValue(this.calculatePointerPosition(ev));
    }
  }
}
