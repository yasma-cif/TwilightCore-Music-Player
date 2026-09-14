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
  }

  private setupVisualizer() {
    const { clientWidth: width, clientHeight: height } = this.hostRef.nativeElement;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#3d0045');

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

    this.audioAnalyserService.peak$.subscribe((peak) => {
      const val = 1 + THREE.MathUtils.inverseLerp(0.7, 1, peak);

      gsap.to(this.cube.scale, {
        x: val,
        y: val,
        z: val,
        duration: 0.1,
      });
    });
  }

  private animate = (time: number) => {
    if (this.playbackService.isPlaying()) {
      this.cube.rotation.x = time / 2000;
      this.cube.rotation.y = time / 1000;
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

  ngOnDestroy() {
    this.renderer.setAnimationLoop(null);
    this.renderer.dispose();
  }
}
