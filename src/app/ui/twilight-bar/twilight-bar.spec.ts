import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TwilightBar } from './twilight-bar';

describe('TwilightBar', () => {
  let component: TwilightBar;
  let fixture: ComponentFixture<TwilightBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TwilightBar],
    }).compileComponents();

    fixture = TestBed.createComponent(TwilightBar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
