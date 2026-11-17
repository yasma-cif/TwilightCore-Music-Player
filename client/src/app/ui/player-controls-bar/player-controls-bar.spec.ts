import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayerControlsBar } from './player-controls-bar';

describe('PlayerControlsBar', () => {
  let component: PlayerControlsBar;
  let fixture: ComponentFixture<PlayerControlsBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerControlsBar],
    }).compileComponents();

    fixture = TestBed.createComponent(PlayerControlsBar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
