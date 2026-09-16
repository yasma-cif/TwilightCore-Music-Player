import { TestBed } from '@angular/core/testing';
import { SideMenuState } from './side-menu-state';

describe('SideMenuState', () => {
  let service: SideMenuState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SideMenuState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
