// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';

// Interfaces
interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: 'usuario' | 'admin';
  token?: string;
  privilegios?: any;
  superAdmin?: boolean;
}

interface RespuestaAuth {
  mensaje: string;
  token: string;
  usuario?: Usuario;
  admin?: Usuario;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = 'http://localhost:3000/api';
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';

  // Observable para el estado de autenticación
  private usuarioActual = new BehaviorSubject<Usuario | null>(null);
  public usuarioActual$ = this.usuarioActual.asObservable();

  // Observable para el estado de carga
  private cargando = new BehaviorSubject<boolean>(false);
  public cargando$ = this.cargando.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // Verificar si hay una sesión guardada al iniciar
    this.verificarSesionGuardada();
  }

  // Verificar sesión guardada en localStorage
  private verificarSesionGuardada(): void {
    const token = this.obtenerToken();
    const userData = this.obtenerDatosUsuario();

    if (token && userData) {
      // Verificar si el token aún es válido
      this.verificarToken(token).subscribe({
        next: (valido) => {
          if (valido) {
            this.usuarioActual.next(userData);
          } else {
            this.cerrarSesion();
          }
        },
        error: () => {
          this.cerrarSesion();
        },
      });
    }
  }

  // Registro de nuevo usuario
  registrar(datos: {
    nombre: string;
    email: string;
    password: string;
  }): Observable<RespuestaAuth> {
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

  // Login de usuario normal
  login(credenciales: {
    email: string;
    password: string;
  }): Observable<RespuestaAuth> {
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

  // Login de administrador
  loginAdmin(credenciales: {
    email: string;
    password: string;
    codigo2FA?: string;
  }): Observable<RespuestaAuth> {
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

          // Manejar diferentes tipos de errores
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

  // Cerrar sesión
  cerrarSesion(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.usuarioActual.next(null);
    this.router.navigate(['/auth']);
  }

  // Obtener perfil del usuario actual
  obtenerPerfil(): Observable<any> {
    const headers = this.obtenerHeaders();

    return this.http.get(`${this.API_URL}/perfil`, { headers }).pipe(
      tap((perfil) => {
        // Actualizar datos del usuario si es necesario
        const usuarioActualizado = { ...this.usuarioActual.value, ...perfil };
        this.usuarioActual.next(usuarioActualizado);
        this.guardarDatosUsuario(usuarioActualizado);
      }),
      catchError((error) => {
        if (error.status === 401) {
          this.cerrarSesion();
        }
        return throwError(() => error);
      })
    );
  }

  // Verificar si el token es válido
  verificarToken(token: string): Observable<boolean> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get(`${this.API_URL}/perfil`, { headers }).pipe(
      map(() => true),
      catchError(() => {
        return new Observable<boolean>((observer) => {
          observer.next(false);
          observer.complete();
        });
      })
    );
  }

  // Crear nuevo administrador (solo superadmin)
  crearAdministrador(datos: any): Observable<any> {
    const headers = this.obtenerHeaders();

    return this.http
      .post(`${this.API_URL}/admin/crear`, datos, { headers })
      .pipe(
        catchError((error) => {
          console.error('Error al crear administrador:', error);
          return throwError(() => error);
        })
      );
  }

  // Obtener lista de administradores
  obtenerListaAdministradores(): Observable<any> {
    const headers = this.obtenerHeaders();

    return this.http.get(`${this.API_URL}/admin/lista`, { headers }).pipe(
      catchError((error) => {
        console.error('Error al obtener lista de administradores:', error);
        return throwError(() => error);
      })
    );
  }

  // Métodos auxiliares

  // Verificar si hay usuario autenticado
  estaAutenticado(): boolean {
    return !!this.obtenerToken() && !!this.usuarioActual.value;
  }

  // Verificar si el usuario es administrador
  esAdmin(): boolean {
    const usuario = this.usuarioActual.value;
    return usuario?.rol === 'admin';
  }

  // Verificar si es superadmin
  esSuperAdmin(): boolean {
    const usuario = this.usuarioActual.value;
    return usuario?.rol === 'admin' && usuario?.superAdmin === true;
  }

  // Obtener el usuario actual
  obtenerUsuarioActual(): Usuario | null {
    return this.usuarioActual.value;
  }

  // Obtener privilegios del admin
  obtenerPrivilegios(): any {
    const usuario = this.usuarioActual.value;
    return usuario?.privilegios || null;
  }

  // Verificar un privilegio específico
  tienePrivilegio(privilegio: string): boolean {
    const privilegios = this.obtenerPrivilegios();
    return privilegios ? privilegios[privilegio] === true : false;
  }

  // Guardar sesión en localStorage
  private guardarSesion(token: string, usuario: Usuario): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    this.guardarDatosUsuario(usuario);
  }

  // Guardar datos del usuario
  private guardarDatosUsuario(usuario: Usuario): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(usuario));
  }

  // Obtener token guardado
  obtenerToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Obtener datos del usuario guardado
  private obtenerDatosUsuario(): Usuario | null {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  // Obtener headers con autorización
  private obtenerHeaders(): HttpHeaders {
    const token = this.obtenerToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  // Refrescar token (opcional, para implementar más adelante)
  refrescarToken(): Observable<any> {
    const headers = this.obtenerHeaders();

    return this.http
      .post(`${this.API_URL}/refresh-token`, {}, { headers })
      .pipe(
        tap((respuesta: any) => {
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
