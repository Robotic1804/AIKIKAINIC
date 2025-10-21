import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';

// Tipos auxiliares
type Rol = 'usuario' | 'admin';

// Definimos qué privilegios puede tener un admin
interface Privilegios {
  gestionarUsuarios?: boolean;
  gestionarContenido?: boolean;
  verReportes?: boolean;
  configurarSistema?: boolean;
  [key: string]: boolean | undefined;
}

// Interfaz principal de usuario
interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
  token?: string;
  privilegios?: Privilegios;
  superAdmin?: boolean;
}

// Respuesta común de autenticación
interface RespuestaAuth {
  mensaje: string;
  token: string;
  usuario?: Usuario;
  admin?: Usuario;
}

// Perfil retornado por la API
interface PerfilResponse {
  _id?: string;
  nombre?: string;
  email?: string;
  rol?: Rol;
  privilegios?: Privilegios;
  superAdmin?: boolean;
}

// Respuesta al crear admin
interface CrearAdminResponse {
  mensaje: string;
  admin?: Usuario;
}

// Respuesta al listar admins
interface ListaAdminsResponse {
  admins: Usuario[];
  total: number;
  limitAlcanzado: boolean;
}

// Respuesta de refresco de token
interface RefreshTokenResponse {
  token: string;
}

// Credenciales de registro
interface RegistroCredenciales {
  nombre: string;
  email: string;
  password: string;
}

// Credenciales de login
interface LoginCredenciales {
  email: string;
  password: string;
}

// Credenciales de login admin
interface LoginAdminCredenciales extends LoginCredenciales {
  codigo2FA?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = 'http://localhost:3000/api';
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';

  private usuarioActual = new BehaviorSubject<Usuario | null>(null);
  public usuarioActual$ = this.usuarioActual.asObservable();

  private cargando = new BehaviorSubject<boolean>(false);
  public cargando$ = this.cargando.asObservable();

  private http = inject(HttpClient);
  private router = inject(Router);

  constructor() {
    this.verificarSesionGuardada();
  }

  private verificarSesionGuardada(): void {
    const token = this.obtenerToken();
    const userData = this.obtenerDatosUsuario();

    if (token && userData) {
      this.verificarToken(token).subscribe({
        next: (valido) => {
          if (valido) {
            this.usuarioActual.next(userData);
          } else {
            this.cerrarSesion();
          }
        },
        error: () => this.cerrarSesion(),
      });
    }
  }

  registrar(datos: RegistroCredenciales): Observable<RespuestaAuth> {
    this.cargando.next(true);
    return this.http
      .post<RespuestaAuth>(`${this.API_URL}/registro`, datos)
      .pipe(
        tap((respuesta) => {
          if (respuesta.token && respuesta.usuario) {
            this.guardarSesion(respuesta.token, respuesta.usuario);
            this.usuarioActual.next(respuesta.usuario);
          }
        }),
        catchError((error) => {
          this.cargando.next(false);
          console.error('Error en registro:', error);
          return throwError(() => error);
        }),
        tap(() => this.cargando.next(false))
      );
  }

  login(credenciales: LoginCredenciales): Observable<RespuestaAuth> {
    this.cargando.next(true);
    return this.http
      .post<RespuestaAuth>(`${this.API_URL}/login`, credenciales)
      .pipe(
        tap((respuesta) => {
          if (respuesta.token && respuesta.usuario) {
            this.guardarSesion(respuesta.token, respuesta.usuario);
            this.usuarioActual.next(respuesta.usuario);
          }
        }),
        catchError((error) => {
          this.cargando.next(false);
          console.error('Error en login:', error);
          return throwError(() => error);
        }),
        tap(() => this.cargando.next(false))
      );
  }

  loginAdmin(credenciales: LoginAdminCredenciales): Observable<RespuestaAuth> {
    this.cargando.next(true);
    return this.http
      .post<RespuestaAuth>(`${this.API_URL}/admin/login`, credenciales)
      .pipe(
        tap((respuesta) => {
          if (respuesta.token && respuesta.admin) {
            this.guardarSesion(respuesta.token, respuesta.admin);
            this.usuarioActual.next(respuesta.admin);
          }
        }),
        catchError((error) => {
          this.cargando.next(false);
          console.error('Error en login de admin:', error);
          if (error.status === 401) {
            error.error.mensaje = 'Credenciales de administrador inválidas';
          } else if (error.status === 403) {
            error.error.mensaje = 'Acceso denegado. Privilegios insuficientes';
          }
          return throwError(() => error);
        }),
        tap(() => this.cargando.next(false))
      );
  }

  cerrarSesion(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.usuarioActual.next(null);
    this.router.navigate(['/auth']);
  }

  obtenerPerfil(): Observable<PerfilResponse> {
    const headers = this.obtenerHeaders();
    return this.http
      .get<PerfilResponse>(`${this.API_URL}/perfil`, { headers })
      .pipe(
        tap((perfil) => {
          const usuarioActual = this.usuarioActual.value;
          if (!usuarioActual) return;

          const usuarioActualizado: Usuario = {
            ...usuarioActual,
            id: perfil._id ?? usuarioActual.id,
            nombre: perfil.nombre ?? usuarioActual.nombre,
            email: perfil.email ?? usuarioActual.email,
            rol: perfil.rol ?? usuarioActual.rol,
            token: usuarioActual.token,
            privilegios: perfil.privilegios ?? usuarioActual.privilegios,
            superAdmin: perfil.superAdmin ?? usuarioActual.superAdmin,
          };

          this.usuarioActual.next(usuarioActualizado);
          this.guardarDatosUsuario(usuarioActualizado);
        }),
        catchError((error) => {
          if (error.status === 401) this.cerrarSesion();
          return throwError(() => error);
        })
      );
  }

  verificarToken(token: string): Observable<boolean> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get(`${this.API_URL}/perfil`, { headers }).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  crearAdministrador(datos: Partial<Usuario>): Observable<CrearAdminResponse> {
    const headers = this.obtenerHeaders();
    return this.http
      .post<CrearAdminResponse>(`${this.API_URL}/admin/crear`, datos, {
        headers,
      })
      .pipe(
        catchError((error) => {
          console.error('Error al crear administrador:', error);
          return throwError(() => error);
        })
      );
  }

  obtenerListaAdministradores(): Observable<ListaAdminsResponse> {
    const headers = this.obtenerHeaders();
    return this.http
      .get<ListaAdminsResponse>(`${this.API_URL}/admin/lista`, { headers })
      .pipe(
        catchError((error) => {
          console.error('Error al obtener lista de administradores:', error);
          return throwError(() => error);
        })
      );
  }

  estaAutenticado(): boolean {
    return !!this.obtenerToken() && !!this.usuarioActual.value;
  }

  esAdmin(): boolean {
    return this.usuarioActual.value?.rol === 'admin';
  }

  esSuperAdmin(): boolean {
    const usuario = this.usuarioActual.value;
    return usuario?.rol === 'admin' && usuario.superAdmin === true;
  }

  obtenerUsuarioActual(): Usuario | null {
    return this.usuarioActual.value;
  }

  obtenerPrivilegios(): Privilegios | null {
    return this.usuarioActual.value?.privilegios || null;
  }

  tienePrivilegio(privilegio: string): boolean {
    const privilegios = this.obtenerPrivilegios();
    return privilegios ? privilegios[privilegio] === true : false;
  }

  private guardarSesion(token: string, usuario: Usuario): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    this.guardarDatosUsuario(usuario);
  }

  private guardarDatosUsuario(usuario: Usuario): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(usuario));
  }

  obtenerToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private obtenerDatosUsuario(): Usuario | null {
    const userData = localStorage.getItem(this.USER_KEY);
    if (!userData) return null;

    try {
      const parsed = JSON.parse(userData);
      // Validación básica de tipo
      if (
        typeof parsed === 'object' &&
        parsed !== null &&
        parsed.id &&
        parsed.email
      ) {
        return parsed as Usuario;
      }
    } catch (e) {
      console.warn('Error al parsear datos de usuario', e);
    }
    return null;
  }

  private obtenerHeaders(): HttpHeaders {
    const token = this.obtenerToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  refrescarToken(): Observable<RefreshTokenResponse> {
    const headers = this.obtenerHeaders();
    return this.http
      .post<RefreshTokenResponse>(
        `${this.API_URL}/refresh-token`,
        {},
        { headers }
      )
      .pipe(
        tap((respuesta) => {
          if (respuesta.token) {
            localStorage.setItem(this.TOKEN_KEY, respuesta.token);
          }
        }),
        catchError((error) => {
          this.cerrarSesion();
          return throwError(() => error);
        })
      );
  }
}
