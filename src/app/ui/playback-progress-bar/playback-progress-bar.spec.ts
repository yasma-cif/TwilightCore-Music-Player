import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlaybackProgressBar } from './playback-progress-bar';

describe('PlaybackProgressBar', () => {
  let component: PlaybackProgressBar;
  let fixture: ComponentFixture<PlaybackProgressBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaybackProgressBar],
    }).compileComponents();

    fixture = TestBed.createComponent(PlaybackProgressBar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
