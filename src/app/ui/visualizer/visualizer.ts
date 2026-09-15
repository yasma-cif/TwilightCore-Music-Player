import {
  Component,
  ElementRef,
  viewChild,
  OnDestroy,
  inject,
  afterNextRender,
} from '@angular/core';

import { AudioAnalyserService } from '../../services/audio-analyser/audio-analyser.service';
import * as THREE from 'three';
import gsap from 'gsap';
import { PlaybackService } from '../../services/playback/playback.service';
import { MathUtils } from '../../common/math-utils';
import { Easings } from '../../common/easings';

@Component({
  imports: [],
  selector: 'tw-visualizer',
  styleUrl: './visualizer.css',
  templateUrl: './visualizer.html',
})
export class Visualizer implements OnDestroy {
  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly hostRef = inject(ElementRef<HTMLElement>);

  private scene!: THREE.Scene;
  private renderer!: THREE.WebGLRenderer;
  private camera!: THREE.PerspectiveCamera;
  private cube!: THREE.Mesh;

  private audioAnalyserService = inject(AudioAnalyserService);
  private playbackService = inject(PlaybackService);

  private resizeObserver?: ResizeObserver;

  constructor() {
    afterNextRender(() => this.setupVisualizer());

    this.playbackService.playbackRateChange$.subscribe((event) => this.onPlaybackRateChange(event));
  }

  private setupVisualizer() {
    const { clientWidth: width, clientHeight: height } = this.hostRef.nativeElement;

    this.scene = new THREE.Scene();
    const normalizedValue = MathUtils.inverseLerp(3, 0.25, 1);

    this.scene.background = new THREE.Color().setRGB(
      normalizedValue,
      normalizedValue,
      normalizedValue,
    );

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvasRef().nativeElement });
    this.renderer.setSize(width, height);

    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.z = 3;

    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshNormalMaterial();
    this.cube = new THREE.Mesh(geometry, material);
    this.cube.setRotationFromEuler(new THREE.Euler(0, 1, 4, 'XYZ'));
    this.scene.add(this.cube);

    this.renderer.setAnimationLoop(this.animate);

    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(this.hostRef.nativeElement);

    this.audioAnalyserService.peak$.subscribe((val) => {
      gsap.to(this.cube.scale, {
        x: 1 + Math.max(0, MathUtils.inverseLerp(0.3, 0.6, val.x)),
        y: 1 + Math.max(0, MathUtils.inverseLerp(0.3, 0.6, val.y)),
        z: 1 + Math.max(0, MathUtils.inverseLerp(0.3, 0.6, val.z)),
        duration: 0.1,
      });
    });
  }

  private animate = (time: number) => {
    if (this.playbackService.isPlaying()) {
      this.cube.rotation.x = (time / 2000) * this.playbackService.playbackRate;
      this.cube.rotation.y = (time / 1000) * this.playbackService.playbackRate;
    }

    this.renderer.render(this.scene, this.camera);
  };

  private onResize() {
    const { clientWidth: width, clientHeight: height } = this.hostRef.nativeElement;
    if (width === 0 || height === 0) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private onPlaybackRateChange(val: number): void {
    let normalizedValue = MathUtils.inverseLerp(3, 0.25, val);
    normalizedValue = Easings.easeInOutCirc(normalizedValue);
    this.scene.background = new THREE.Color().setRGB(
      normalizedValue,
      normalizedValue,
      normalizedValue,
    );
  }

  ngOnDestroy() {
    this.renderer.setAnimationLoop(null);
    this.renderer.dispose();
  }
}
