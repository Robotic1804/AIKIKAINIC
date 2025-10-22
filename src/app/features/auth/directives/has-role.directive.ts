import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  OnInit,
  OnDestroy,
  inject,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Directive({
  selector: '[appHasRole]',
  standalone: true,
})
export class HasRoleDirective implements OnInit, OnDestroy {
  @Input() appHasRole!: string | string[];
  private subscription?: Subscription;
  private templateRef = inject(TemplateRef<unknown>);
  private viewContainer = inject(ViewContainerRef);
  private authService = inject(AuthService);

  ngOnInit(): void {
    // Suscribirse a cambios en el usuario actual
    this.subscription = this.authService.usuarioActual$.subscribe((usuario) => {
      this.updateView(usuario);
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private updateView(usuario: { rol?: string } | null): void {
    const rolesPermitidos = Array.isArray(this.appHasRole)
      ? this.appHasRole
      : [this.appHasRole];

    if (usuario && usuario.rol && rolesPermitidos.includes(usuario.rol)) {
      // Mostrar el elemento
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      // Ocultar el elemento
      this.viewContainer.clear();
    }
  }
}
