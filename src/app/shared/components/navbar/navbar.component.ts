import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  Renderer2,
  inject,
} from '@angular/core';
import { Router, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  isMenuOpen = false;
  isScrolled = false;
  private destroy$ = new Subject<void>();
  private router = inject(Router);
  private renderer = inject(Renderer2);

  ngOnInit(): void {
    // Cerrar menú móvil al cambiar de ruta
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.closeMenu();
      });

    // Inicializar estado del scroll
    this.checkScroll();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    // Limpiar clase del body si existe
    this.renderer.removeClass(document.body, 'menu-open');
  }

  /**
   * Alterna el estado del menú móvil
   */
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    this.updateBodyClass();
  }

  /**
   * Cierra el menú móvil
   */
  closeMenu(): void {
    this.isMenuOpen = false;
    this.updateBodyClass();
  }

  /**
   * Actualiza la clase del body para prevenir scroll
   */
  private updateBodyClass(): void {
    if (this.isMenuOpen) {
      this.renderer.addClass(document.body, 'menu-open');
    } else {
      this.renderer.removeClass(document.body, 'menu-open');
    }
  }

  /**
   * Detecta el scroll para cambiar estilos del navbar
   */
  @HostListener('window:scroll', ['$event'])
  onWindowScroll(): void {
    this.checkScroll();
  }

  /**
   * Cierra el menú al presionar Escape
   */
  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent): void {
    if (this.isMenuOpen) {
      this.closeMenu();
      event.preventDefault();
    }
  }

  /**
   * Verifica la posición del scroll
   */
  private checkScroll(): void {
    const scrollPosition =
      window.pageYOffset || document.documentElement.scrollTop;
    this.isScrolled = scrollPosition > 50;
  }

  /**
   * Obtiene las clases dinámicas del navbar
   */
  get navbarClasses(): string[] {
    const classes = [];

    if (this.isScrolled) {
      classes.push('scrolled');
    } else {
      classes.push('at-top');
    }

    return classes;
  }
}
