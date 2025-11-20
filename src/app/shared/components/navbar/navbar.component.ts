import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  Renderer2,
  inject,
  signal,
  ElementRef,
  ViewChild,
} from '@angular/core';
import {
  Router,
  NavigationEnd,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { filter, Subject, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/features/auth/services/auth.service';
import { ModalService } from '../../../services/modal.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  isMenuOpen = false;
  isMenuOpenMaestros = false;
  isScrolled = false;
  userMenuOpen = signal<boolean>(false);
  estaAutenticado = signal<boolean>(false);
  usuarioNombre = signal<string>('');
  esAdminOWebmaster = signal<boolean>(false);
  tieneNotificacionesSinLeer = signal(true);
  numeroNotificaciones = signal(3);

  @ViewChild('userMenuContainer') userMenuContainer?: ElementRef;

  private authService = inject(AuthService);
  private destroy$ = new Subject<void>();
  private router = inject(Router);
  private renderer = inject(Renderer2);
  private modalService = inject(ModalService);
  private elementRef = inject(ElementRef);

  ngOnInit(): void {
    this.authService.usuarioActual$
      .pipe(takeUntil(this.destroy$))
      .subscribe((usuario) => {
        this.estaAutenticado.set(!!usuario);
        this.usuarioNombre.set(usuario?.name || '');
        this.esAdminOWebmaster.set(usuario?.role === 'admin' || usuario?.role === 'webmaster');
      });

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.closeMenu();
        this.userMenuOpen.set(false);
      });

    this.checkScroll();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.renderer.removeClass(document.body, 'menu-open');
  }

  toggleUserMenu(event?: Event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    this.userMenuOpen.update((open) => !open);
  }

  cerrarSesion(): void {
    this.userMenuOpen.set(false);
    this.authService.cerrarSesion();
  }

  irADashboard(): void {
    this.userMenuOpen.set(false);
    this.router.navigate(['/dashboard']);
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    this.updateBodyClass();
  }

  closeMenu(): void {
    this.isMenuOpen = false;
    this.isMenuOpenMaestros = false;
    this.updateBodyClass();
  }

  closeMaestrosMenu() {
    this.isMenuOpenMaestros = false;
  }

  toggleMaestrosMobile(event: Event) {
    if (window.innerWidth <= 768) {
      // Mismo breakpoint que md:hidden
      event.preventDefault();
      this.isMenuOpenMaestros = !this.isMenuOpenMaestros;
    }
  }

  private updateBodyClass(): void {
    if (this.isMenuOpen) {
      this.renderer.addClass(document.body, 'menu-open');
    } else {
      this.renderer.removeClass(document.body, 'menu-open');
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const clickedElement = event.target as HTMLElement;

    // Close user menu if clicked outside
    if (this.userMenuOpen()) {
      const clickedInside = this.elementRef.nativeElement.contains(clickedElement);
      if (!clickedInside) {
        this.userMenuOpen.set(false);
      }
    }

    // Close maestros menu if clicked outside
    if (!clickedElement.closest('.maestros-menu-container') &&
        !clickedElement.closest('.mobile-maestros-container')) {
      this.isMenuOpenMaestros = false;
    }
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.checkScroll();
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (this.isMenuOpen) {
      this.closeMenu();
      keyboardEvent.preventDefault();
    }
    if (this.userMenuOpen()) {
      this.userMenuOpen.set(false);
      keyboardEvent.preventDefault();
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

  abrirLogin() {
    this.modalService.abrirLoginModal();
  }
}
