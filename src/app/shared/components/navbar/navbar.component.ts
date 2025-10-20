import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  Renderer2,
  inject,
} from '@angular/core';
import {
  Router,
  NavigationEnd,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { filter, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  isMenuOpen = false;
  isScrolled = false;
  showMenu = false;
  isLoginMenuOpen = false; // ⬅️ Para el menú del botón "Ingresar"

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
        this.closeLoginMenu(); // ⬅️ Cierra el menú de login también
      });

    this.checkScroll();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.renderer.removeClass(document.body, 'menu-open');
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    this.updateBodyClass();
  }

  closeMenu(): void {
    this.isMenuOpen = false;
    this.updateBodyClass();
  }

  private updateBodyClass(): void {
    if (this.isMenuOpen) {
      this.renderer.addClass(document.body, 'menu-open');
    } else {
      this.renderer.removeClass(document.body, 'menu-open');
    }
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(): void {
    this.checkScroll();
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent): void {
    if (this.isMenuOpen || this.isLoginMenuOpen) {
      this.closeMenu();
      this.closeLoginMenu();
      event.preventDefault();
    }
  }

  private checkScroll(): void {
    const scrollPosition =
      window.pageYOffset || document.documentElement.scrollTop;
    this.isScrolled = scrollPosition > 50;
  }

  get navbarClasses(): string[] {
    return [this.isScrolled ? 'scrolled' : 'at-top'];
  }

  // =============================
  // 🔽 Lógica del menú de ingresar
  // =============================
  toggleLoginMenu(): void {
    this.isLoginMenuOpen = !this.isLoginMenuOpen;
  }

  closeLoginMenu(): void {
    this.isLoginMenuOpen = false;
  }

  navigateTo(path: string): void {
    this.closeLoginMenu();
    this.router.navigate([path]);
  }
}
