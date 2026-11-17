import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppInner } from './app-inner';

describe('AppInner', () => {
  let component: AppInner;
  let fixture: ComponentFixture<AppInner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppInner],
    }).compileComponents();

    fixture = TestBed.createComponent(AppInner);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
