interface PlaybackEvent {
  type: 'played' | 'paused';
  track: HTMLAudioElement;
}
