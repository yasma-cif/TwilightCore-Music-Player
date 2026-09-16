import { Service, signal } from '@angular/core';

@Service()
export class SideMenuStateService {
  private readonly _isOpen = signal(true);

  public readonly isOpen = this._isOpen.asReadonly();

  public toggleSideMenu() {
    this._isOpen.set(!this._isOpen());
  }
}
