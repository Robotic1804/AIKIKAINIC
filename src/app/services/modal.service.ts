import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private _loginModalVisible = signal<boolean>(false);

  readonly loginModalVisible = this._loginModalVisible.asReadonly();

  abrirLoginModal(): void {
    this._loginModalVisible.set(true);
  }

  cerrarLoginModal(): void {
    this._loginModalVisible.set(false);
  }
}
