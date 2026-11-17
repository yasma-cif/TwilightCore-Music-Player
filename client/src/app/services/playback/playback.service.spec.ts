import { TestBed } from '@angular/core/testing';
import { Playback } from './playback.service';

describe('Playback', () => {
  let service: Playback;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Playback);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
