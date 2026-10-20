import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TrackMenu } from './track-menu';

describe('TrackMenu', () => {
  let component: TrackMenu;
  let fixture: ComponentFixture<TrackMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrackMenu],
    }).compileComponents();

    fixture = TestBed.createComponent(TrackMenu);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
