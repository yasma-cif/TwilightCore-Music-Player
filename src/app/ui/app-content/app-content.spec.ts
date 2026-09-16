import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppContent } from './app-content';

describe('AppContent', () => {
  let component: AppContent;
  let fixture: ComponentFixture<AppContent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppContent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppContent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
