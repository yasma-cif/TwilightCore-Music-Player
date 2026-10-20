import { TestBed } from '@angular/core/testing';
import { TrackMenuStateService } from './track-menu-state';

describe('TrackMenuStateService', () => {
  let service: TrackMenuStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrackMenuStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
