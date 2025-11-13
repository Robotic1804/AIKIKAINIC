// src/app/features/auth/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Usuario, UserRole, PerfilResponse, UsuarioLista, CrearAdminResponse } from '../models/user.model';
import {
  RespuestaAuth,
} from '../models/auth.response.model';
import { LoginCredenciales } from '../models/login.request.model';
import { RegistroCredenciales } from '../models/register-request-model';
import {
  RespuestaVerificacion,
  RespuestaReenvio,
  RespuestaSolicitudReset,
  RespuestaVerificacionToken,
  RespuestaResetPassword,
  SolicitudResetPassword,
  DatosResetPassword,
  VerificacionConLoginResponse
} from '../models/email.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private readonly ADMIN_URL = `${environment.apiUrl}/admin`;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';

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
            if (respuesta.refreshToken) {
              this.guardarRefreshToken(respuesta.refreshToken);
            }
            this.usuarioActual.next(respuesta.usuario);
          }
        }),
        catchError((error) => {
          this.cargando.next(false);
          return throwError(() => error);
        }),
        tap(() => this.cargando.next(false))
      );
  }

  /**
   * Verifica el email del usuario mediante token
   * @param token Token de verificación enviado por email
   */
  verificarEmail(token: string): Observable<VerificacionConLoginResponse> {
    this.cargando.next(true);
    return this.http
      .get<VerificacionConLoginResponse>(
        `${this.API_URL}/verificar-email/${token}`
      )
      .pipe(
        tap((respuesta) => {
          if (respuesta.token && respuesta.usuario) {
            this.guardarSesion(respuesta.token, respuesta.usuario);
            if (respuesta.refreshToken) {
              this.guardarRefreshToken(respuesta.refreshToken);
            }
            this.usuarioActual.next(respuesta.usuario);
          }
        }),
        catchError((error) => {
          this.cargando.next(false);
          return throwError(() => error);
        }),
        tap(() => this.cargando.next(false))
      );
  }

  /**
   * Reenvía el email de verificación
   * @param email Email del usuario
   */
  reenviarVerificacion(email: string): Observable<RespuestaReenvio> {
    this.cargando.next(true);
    return this.http
      .post<RespuestaReenvio>(`${this.API_URL}/reenviar-verificacion`, {
        email,
      })
      .pipe(
        catchError((error) => {
          this.cargando.next(false);
          return throwError(() => error);
        }),
        tap(() => this.cargando.next(false))
      );
  }

  /**
   * Solicita el reset de contraseña
   * @param datos Objeto con el email del usuario
   */
  solicitarResetPassword(
    datos: SolicitudResetPassword
  ): Observable<RespuestaSolicitudReset> {
    this.cargando.next(true);
    return this.http
      .post<RespuestaSolicitudReset>(
        `${this.API_URL}/solicitar-reset-password`,
        datos
      )
      .pipe(
        catchError((error) => {
          this.cargando.next(false);
          return throwError(() => error);
        }),
        tap(() => this.cargando.next(false))
      );
  }

  /**
   * Verifica si el token de reset es válido
   * @param token Token de reset de contraseña
   */
  verificarTokenReset(token: string): Observable<RespuestaVerificacionToken> {
    this.cargando.next(true);
    return this.http
      .get<RespuestaVerificacionToken>(
        `${this.API_URL}/verificar-token-reset/${token}`
      )
      .pipe(
        catchError((error) => {
          this.cargando.next(false);
          return throwError(() => error);
        }),
        tap(() => this.cargando.next(false))
      );
  }

  /**
   * Resetea la contraseña del usuario
   * @param token Token de reset
   * @param datos Objeto con la nueva contraseña
   */
  resetPassword(
    token: string,
    datos: DatosResetPassword
  ): Observable<RespuestaResetPassword> {
    this.cargando.next(true);
    return this.http
      .post<RespuestaResetPassword>(
        `${this.API_URL}/reset-password/${token}`,
        datos
      )
      .pipe(
        catchError((error) => {
          this.cargando.next(false);
          return throwError(() => error);
        }),
        tap(() => this.cargando.next(false))
      );
  }

  cerrarSesion(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    this.usuarioActual.next(null);
    this.router.navigate(['/inicio']);
  }

  obtenerPerfil(): Observable<PerfilResponse> {
    const headers = this.obtenerHeaders();
    return this.http
      .get<PerfilResponse>(`${this.API_URL}/auth/perfil`, { headers })
      .pipe(
        tap((perfil) => {
          const usuarioActual = this.usuarioActual.value;
          if (!usuarioActual) return;

          const usuarioActualizado: Usuario = {
            id: perfil._id,
            name: perfil.name,
            email: perfil.email,
            role: perfil.role,
            token: usuarioActual.token,
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

  crearUsuarioAdmin(datos: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
  }): Observable<CrearAdminResponse> {
    const headers = this.obtenerHeaders();
    return this.http
      .post<CrearAdminResponse>(`${this.ADMIN_URL}/users`, datos, {
        headers,
      })
      .pipe(
        catchError((error) => {
          return throwError(() => error);
        })
      );
  }

  obtenerUsuarios(): Observable<{ usuarios: UsuarioLista[] }> {
    const headers = this.obtenerHeaders();
    return this.http
      .get<{ usuarios: UsuarioLista[] }>(`${this.ADMIN_URL}/users`, {
        headers,
      })
      .pipe(
        catchError((error) => {
          return throwError(() => error);
        })
      );
  }

  estaAutenticado(): boolean {
    return !!this.obtenerToken() && !!this.usuarioActual.value;
  }

  esAdmin(): boolean {
    const role = this.usuarioActual.value?.role;
    return role === 'admin' || role === 'webmaster';
  }

  esWebmaster(): boolean {
    return this.usuarioActual.value?.role === 'webmaster';
  }

  obtenerUsuarioActual(): Usuario | null {
    return this.usuarioActual.value;
  }

  private guardarSesion(token: string, usuario: Usuario): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    this.guardarDatosUsuario(usuario);
  }

  private guardarDatosUsuario(usuario: Usuario): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(usuario));
  }

  /**
   * Public method to handle email verification with auto-login
   * @param token - The authentication token from email verification
   * @param usuario - The user data to store
   */
  guardarSesionDesdeVerificacion(token: string, usuario: Usuario): void {
    this.guardarSesion(token, usuario);
    this.usuarioActual.next(usuario);
  }

  /**
   * Updates the authentication token after refresh
   * @param token - The new authentication token
   */
  actualizarToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  obtenerToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private obtenerDatosUsuario(): Usuario | null {
    const userData = localStorage.getItem(this.USER_KEY);
    if (!userData) return null;

    try {
      const parsed = JSON.parse(userData);
      if (
        typeof parsed === 'object' &&
        parsed !== null &&
        parsed.id &&
        parsed.email
      ) {
        return parsed as Usuario;
      }
    } catch (e) {
      return null;
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

  refrescarToken(): Observable<{ token: string }> {
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);

    if (!refreshToken) {
      this.cerrarSesion();
      return throwError(() => new Error('No refresh token'));
    }

    return this.http
      .post<{ token: string }>(`${this.API_URL}/auth/refresh-token`, {
        refreshToken,
      })
      .pipe(
        tap((respuesta) => {
          if (respuesta.token) {
            localStorage.setItem(this.TOKEN_KEY, respuesta.token);
          }
        })
      );
  }

  private guardarRefreshToken(refreshToken: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }
}
