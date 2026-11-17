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
import { PlaybackService } from '../../services/playback/playback.service';
import { MathUtils } from '../../common/math-utils';
import { Easings } from '../../common/easings';
import gsap from 'gsap';
import { PlaylistService } from '../../services/playlist/playlist.service';
import { PlaybackEvent } from '../../services/playback/playback-event';

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
  private sphere!: THREE.Mesh;

  private textureCanvas!: HTMLCanvasElement;
  private gradientTexture!: THREE.CanvasTexture;

  private readonly sphereRadius = 1;
  private readonly bins = 300;
  private audioData = new Uint8Array(this.bins);
  private audioTexture!: THREE.DataTexture;

  private audioAnalyserService = inject(AudioAnalyserService);
  private playbackService = inject(PlaybackService);
  private playlistService = inject(PlaylistService);

  private currentRendererSize!: THREE.Vector2;

  constructor() {
    afterNextRender(() => this.setupVisualizer());

    this.playbackService.playbackRateChange$.subscribe((event) => this.onPlaybackRateChange(event));
    this.playbackService.playbackEvent$.subscribe((event) => this.onPlaybackEvent(event));
  }

  private setupVisualizer() {
    const { clientWidth: width, clientHeight: height } = this.hostRef.nativeElement;

    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvasRef().nativeElement,
      alpha: true,
    });
    this.renderer.setSize(width, height, false);

    this.currentRendererSize = new THREE.Vector2(width, height);

    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.z = 8;

    const geometry = new THREE.SphereGeometry(this.sphereRadius, 64, 256);

    this.sphere = new THREE.Mesh(geometry, this.setupMaterial());
    //this.sphere.setRotationFromEuler(new THREE.Euler(0, 1, 4, 'XYZ'));
    this.sphere.setRotationFromEuler(new THREE.Euler(0, 0, THREE.MathUtils.degToRad(90), 'XYZ'));
    this.scene.add(this.sphere);

    const ambient = new THREE.AmbientLight(0xffffff, 1.0);
    const directional = new THREE.DirectionalLight(0xffffff, 2.2);
    directional.position.set(3, 4, 5);
    this.scene.add(ambient, directional);

    this.audioTexture = new THREE.DataTexture(
      this.audioData,
      this.bins,
      1,
      THREE.RedFormat,
      THREE.UnsignedByteType,
    );
    this.audioTexture.magFilter = THREE.LinearFilter;
    this.audioTexture.minFilter = THREE.LinearFilter;
    this.audioTexture.needsUpdate = true;

    this.renderer.setAnimationLoop(this.animate);

    this.audioAnalyserService.peak$.subscribe((val) => this.onPeak(val));
  }

  private onPeak(val: [Array<number>, Array<number>]) {
    this.audioData.set(val[0]);
    gsap.to(this.sphere.scale, {
      x: 1 + MathUtils.lerp(0, 1, val[1][0]),
      y: 1 + MathUtils.lerp(0, 3, val[1][1]),
      z: 1 + MathUtils.lerp(0, 1, val[1][0]),
      duration: 0.1,
    });

    this.audioTexture.needsUpdate = true;
  }

  private setupMaterial() {
    this.textureCanvas = document.createElement('canvas');
    this.textureCanvas.width = 1;
    this.textureCanvas.height = 256;

    this.gradientTexture = new THREE.CanvasTexture(this.textureCanvas);
    this.gradientTexture.colorSpace = THREE.SRGBColorSpace;

    const newMaterial = new THREE.MeshLambertMaterial({ map: this.gradientTexture });

    newMaterial.onBeforeCompile = (shader) => {
      shader.uniforms['uAudioTexture'] = { value: this.audioTexture };
      shader.uniforms['uDisplacementAmount'] = { value: 0.8 };
      shader.uniforms['uRadius'] = { value: this.sphereRadius };
      shader.uniforms['uLogBase'] = { value: 30.0 };

      shader.vertexShader = shader.vertexShader
        .replace(
          '#include <common>',
          `#include <common>
          uniform sampler2D uAudioTexture;
          uniform float uDisplacementAmount;
          uniform float uRadius;
          uniform float uLogBase;

          float audioHeight(float lat) {
            float u = (pow(uLogBase, lat) - 1.0) / (uLogBase - 1.0);
            return texture2D(uAudioTexture, vec2(u, 0.5)).r * uDisplacementAmount;
          }`,
        )
        .replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
          float lat = 1.0 - acos(clamp(position.y / uRadius, -1.0, 1.0)) / PI;
          transformed += normal * audioHeight(lat);`,
        );
    };

    this.updateGradient();

    return newMaterial;
  }

  private animate = (time: number) => {
    /* if (this.playbackService.isPlaying()) {
      this.sphere.rotation.x = (time / 60000) * this.playbackService.playbackRate;
      this.sphere.rotation.y = (time / 3000) * this.playbackService.playbackRate;
    } */
    this.onResize();
    this.renderer.render(this.scene, this.camera);
  };

  private onResize() {
    const { clientWidth: width, clientHeight: height } = this.hostRef.nativeElement;
    if (
      width === 0 ||
      height === 0 ||
      this.currentRendererSize.equals(new THREE.Vector2(width, height))
    )
      return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);

    this.currentRendererSize = new THREE.Vector2(width, height);
  }

  private onPlaybackEvent(event: PlaybackEvent): void {
    /* if (this.playlistService.currentTrack()?.coverArt) {
      const textureLoader = new THREE.TextureLoader();

      textureLoader.load(this.playlistService.currentTrack()?.coverArt ?? '', (texture) => {
        this.cube.material = this.setupMaterial(new THREE.MeshStandardMaterial({ map: texture }));
      });
    } else {
      this.cube.material = this.setupMaterial(new THREE.MeshNormalMaterial());
    } */

    switch (event.type) {
      case 'paused':
        break;
      case 'played':
        break;
    }
  }

  private updateGradient() {
    const currentPrimaryColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-primary')
      .trim();

    const currentCrustColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-crust')
      .trim();

    const stops = [
      { offset: 0, color: '#cdd6f4' },
      { offset: 0.5, color: currentPrimaryColor },
      { offset: 1, color: '#cdd6f4' },
    ];

    const ctx = this.textureCanvas.getContext('2d')!;

    const newGradient = ctx.createLinearGradient(0, 0, 0, 256);
    stops.forEach((s) => newGradient.addColorStop(s.offset, s.color));

    ctx.fillStyle = newGradient;
    ctx.fillRect(0, 0, 1, 256);

    this.gradientTexture.needsUpdate = true;
  }

  private onPlaybackRateChange(val: number): void {
    this.updateGradient();
  }

  ngOnDestroy() {
    this.renderer.setAnimationLoop(null);
    this.renderer.dispose();
  }
}
