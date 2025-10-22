// src/app/core/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Usuario, UserRole, PerfilResponse, UsuarioLista, CrearAdminResponse } from '../models/user.model';
import {
  RespuestaAuth,
  RefreshTokenResponse,
} from '../models/auth.response.model';
import { LoginCredenciales } from '../models/login.request.model';
import { RegistroCredenciales } from '../models/register-request-model';

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

  cerrarSesion(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.usuarioActual.next(null);
    this.router.navigate(['/auth']);
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
            nombre: perfil.nombre,
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
    return this.http.get(`${this.API_URL}/auth/perfil`, { headers }).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  // ✅ Nuevo método: crear usuario admin/webmaster
  crearUsuarioAdmin(datos: {
    nombre: string;
    email: string;
    password: string;
    role: UserRole;
  }): Observable<CrearAdminResponse> {
    const headers = this.obtenerHeaders();
    return this.http
      .post<CrearAdminResponse>(
        `${this.API_URL}/admin/users`,
        datos,
        { headers }
      )
      .pipe(
        catchError((error) => {
          console.error('Error al crear usuario administrador:', error);
          return throwError(() => error);
        })
      );
  }

  // ✅ Nuevo método: obtener lista de usuarios (solo webmaster)
  obtenerUsuarios(): Observable<{ usuarios:UsuarioLista[] }> {
    const headers = this.obtenerHeaders();
    return this.http
      .get<{ usuarios: UsuarioLista[] }>(`${this.API_URL}/admin/users`, { headers })
      .pipe(
        catchError((error) => {
          console.error('Error al obtener lista de usuarios:', error);
          return throwError(() => error);
        })
      );
  }

  estaAutenticado(): boolean {
    return !!this.obtenerToken() && !!this.usuarioActual.value;
  }

  // ✅ Actualizado: usa role en lugar de rol
  esAdmin(): boolean {
    const role = this.usuarioActual.value?.role;
    return role === 'admin' || role === 'webmaster';
  }

  // ✅ Nuevo método: verifica si es webmaster
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
