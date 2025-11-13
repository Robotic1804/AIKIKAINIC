import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Usuario, UserRole } from '../models/user.model';
import {
  LoginCredenciales,
  RegistroCredenciales,
} from '../models/login.request.model';
import { RespuestaAuth } from '../models/auth.response.model';
import { environment } from '../../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;
  let localStorageSpy: jasmine.SpyObj<Storage>;

  const API_URL = `${environment.apiUrl}/auth`;
  const ADMIN_URL = `${environment.apiUrl}/admin`;

  const mockUsuario: Usuario = {
    id: '123',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user' as UserRole,
    token: 'mock-token',
  };

  const mockAuthResponse: RespuestaAuth = {
    token: 'mock-token',
    refreshToken: 'mock-refresh-token',
    usuario: mockUsuario,
    message: 'Success',
  };

  beforeEach(() => {
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);
    localStorageSpy = jasmine.createSpyObj('localStorage', [
      'getItem',
      'setItem',
      'removeItem',
    ]);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpyObj },
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    spyOn(localStorage, 'getItem').and.returnValue(null);
    spyOn(localStorage, 'setItem');
    spyOn(localStorage, 'removeItem');
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('registrar', () => {
    it('should register a new user and save session', (done) => {
      const datos: RegistroCredenciales = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        age: 25,
      };

      service.registrar(datos).subscribe({
        next: (response) => {
          expect(response).toEqual(mockAuthResponse);
          expect(localStorage.setItem).toHaveBeenCalledWith(
            'auth_token',
            'mock-token'
          );
          expect(localStorage.setItem).toHaveBeenCalledWith(
            'user_data',
            JSON.stringify(mockUsuario)
          );
          done();
        },
      });

      const req = httpMock.expectOne(`${API_URL}/registro`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(datos);
      req.flush(mockAuthResponse);
    });

    it('should set cargando to true then false', (done) => {
      const datos: RegistroCredenciales = {
        name: 'Test',
        email: 'test@test.com',
        password: 'pass',
        age: 20,
      };
      const cargandoValues: boolean[] = [];

      service.cargando$.subscribe((value) => cargandoValues.push(value));

      service.registrar(datos).subscribe({
        next: () => {
          expect(cargandoValues).toContain(true);
          expect(cargandoValues[cargandoValues.length - 1]).toBe(false);
          done();
        },
      });

      httpMock.expectOne(`${API_URL}/registro`).flush(mockAuthResponse);
    });

    it('should handle registration error', (done) => {
      const datos: RegistroCredenciales = {
        name: 'Test',
        email: 'test@test.com',
        password: 'pass',
        age: 20,
      };
      const errorResponse = { message: 'Email already exists' };

      service.registrar(datos).subscribe({
        error: (error) => {
          expect(error.error).toEqual(errorResponse);
          done();
        },
      });

      const req = httpMock.expectOne(`${API_URL}/registro`);
      req.flush(errorResponse, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('login', () => {
    it('should login user and save session with refresh token', (done) => {
      const credenciales: LoginCredenciales = {
        email: 'test@example.com',
        password: 'password123',
      };

      service.login(credenciales).subscribe({
        next: (response) => {
          expect(response).toEqual(mockAuthResponse);
          expect(localStorage.setItem).toHaveBeenCalledWith(
            'auth_token',
            'mock-token'
          );
          expect(localStorage.setItem).toHaveBeenCalledWith(
            'refresh_token',
            'mock-refresh-token'
          );
          done();
        },
      });

      const req = httpMock.expectOne(`${API_URL}/login`);
      expect(req.request.method).toBe('POST');
      req.flush(mockAuthResponse);
    });

    it('should handle login error', (done) => {
      const credenciales: LoginCredenciales = {
        email: 'wrong@example.com',
        password: 'wrongpass',
      };

      service.login(credenciales).subscribe({
        error: (error) => {
          expect(error.status).toBe(401);
          done();
        },
      });

      const req = httpMock.expectOne(`${API_URL}/login`);
      req.flush(
        { message: 'Invalid credentials' },
        { status: 401, statusText: 'Unauthorized' }
      );
    });

    it('should update usuarioActual$ observable on successful login', (done) => {
      const credenciales: LoginCredenciales = {
        email: 'test@example.com',
        password: 'password123',
      };

      service.usuarioActual$.subscribe((usuario) => {
        if (usuario) {
          expect(usuario).toEqual(mockUsuario);
          done();
        }
      });

      service.login(credenciales).subscribe();
      httpMock.expectOne(`${API_URL}/login`).flush(mockAuthResponse);
    });
  });

  describe('verificarEmail', () => {
    it('should verify email and auto-login user', (done) => {
      const token = 'verification-token';
      const response = {
        ...mockAuthResponse,
        message: 'Email verified successfully',
      };

      service.verificarEmail(token).subscribe({
        next: (res) => {
          expect(res).toEqual(response);
          expect(localStorage.setItem).toHaveBeenCalledWith(
            'auth_token',
            'mock-token'
          );
          done();
        },
      });

      const req = httpMock.expectOne(`${API_URL}/verificar-email/${token}`);
      expect(req.request.method).toBe('GET');
      req.flush(response);
    });

    it('should handle verification error', (done) => {
      const token = 'invalid-token';

      service.verificarEmail(token).subscribe({
        error: (error) => {
          expect(error.status).toBe(400);
          done();
        },
      });

      httpMock
        .expectOne(`${API_URL}/verificar-email/${token}`)
        .flush({}, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('reenviarVerificacion', () => {
    it('should resend verification email', (done) => {
      const email = 'test@example.com';
      const response = {
        message: 'Verification email sent',
        success: true,
      };

      service.reenviarVerificacion(email).subscribe({
        next: (res) => {
          expect(res).toEqual(response);
          done();
        },
      });

      const req = httpMock.expectOne(`${API_URL}/reenviar-verificacion`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email });
      req.flush(response);
    });

    it('should handle resend error', (done) => {
      const email = 'notfound@example.com';

      service.reenviarVerificacion(email).subscribe({
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        },
      });

      httpMock
        .expectOne(`${API_URL}/reenviar-verificacion`)
        .flush({}, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('solicitarResetPassword', () => {
    it('should request password reset', (done) => {
      const datos = { email: 'test@example.com' };
      const response = { message: 'Reset email sent', success: true };

      service.solicitarResetPassword(datos).subscribe({
        next: (res) => {
          expect(res).toEqual(response);
          done();
        },
      });

      const req = httpMock.expectOne(`${API_URL}/solicitar-reset-password`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(datos);
      req.flush(response);
    });
  });

  describe('verificarTokenReset', () => {
    it('should verify reset token', (done) => {
      const token = 'reset-token';
      const response = { valido: true, message: 'Token is valid' };

      service.verificarTokenReset(token).subscribe({
        next: (res) => {
          expect(res).toEqual(response);
          done();
        },
      });

      const req = httpMock.expectOne(
        `${API_URL}/verificar-token-reset/${token}`
      );
      expect(req.request.method).toBe('GET');
      req.flush(response);
    });

    it('should handle invalid reset token', (done) => {
      const token = 'invalid-token';

      service.verificarTokenReset(token).subscribe({
        error: (error) => {
          expect(error.status).toBe(400);
          done();
        },
      });

      httpMock
        .expectOne(`${API_URL}/verificar-token-reset/${token}`)
        .flush({}, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', (done) => {
      const token = 'reset-token';
      const datos = { password: 'newPassword123' };
      const response = { message: 'Password reset successful', success: true };

      service.resetPassword(token, datos).subscribe({
        next: (res) => {
          expect(res).toEqual(response);
          done();
        },
      });

      const req = httpMock.expectOne(`${API_URL}/reset-password/${token}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(datos);
      req.flush(response);
    });
  });

  describe('cerrarSesion', () => {
    it('should clear localStorage and navigate to inicio', () => {
      service.cerrarSesion();

      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('user_data');
      expect(localStorage.removeItem).toHaveBeenCalledWith('refresh_token');
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/inicio']);
    });

    it('should set usuarioActual to null', (done) => {
      service.usuarioActual$.subscribe((usuario) => {
        if (usuario === null) {
          expect(usuario).toBeNull();
          done();
        }
      });

      service.cerrarSesion();
    });
  });

  describe('obtenerPerfil', () => {
    it('should get user profile and update current user', (done) => {
      const mockPerfil = {
        _id: '123',
        name: 'Updated User',
        email: 'test@example.com',
        role: 'user' as UserRole,
      };

      (localStorage.getItem as jasmine.Spy).and.returnValue('mock-token');

      service['usuarioActual'].next(mockUsuario);

      service.obtenerPerfil().subscribe({
        next: (perfil) => {
          expect(perfil).toEqual(mockPerfil);
          const updatedUser = service.obtenerUsuarioActual();
          expect(updatedUser?.name).toBe('Updated User');
          done();
        },
      });

      const req = httpMock.expectOne(`${API_URL}/auth/perfil`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe(
        'Bearer mock-token'
      );
      req.flush(mockPerfil);
    });

    it('should call cerrarSesion on 401 error', (done) => {
      spyOn(service, 'cerrarSesion');
      (localStorage.getItem as jasmine.Spy).and.returnValue('mock-token');

      service.obtenerPerfil().subscribe({
        error: () => {
          expect(service.cerrarSesion).toHaveBeenCalled();
          done();
        },
      });

      httpMock
        .expectOne(`${API_URL}/auth/perfil`)
        .flush({}, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('verificarToken', () => {
    it('should return true for valid token', (done) => {
      const token = 'valid-token';

      service.verificarToken(token).subscribe({
        next: (isValid) => {
          expect(isValid).toBe(true);
          done();
        },
      });

      const req = httpMock.expectOne(`${API_URL}/perfil`);
      expect(req.request.headers.get('Authorization')).toBe(
        `Bearer ${token}`
      );
      req.flush({});
    });

    it('should return false for invalid token', (done) => {
      const token = 'invalid-token';

      service.verificarToken(token).subscribe({
        next: (isValid) => {
          expect(isValid).toBe(false);
          done();
        },
      });

      httpMock
        .expectOne(`${API_URL}/perfil`)
        .flush({}, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('crearUsuarioAdmin', () => {
    it('should create admin user', (done) => {
      const datos = {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'adminpass',
        role: 'admin' as UserRole,
      };
      const response = {
        message: 'Admin created',
        usuario: { ...datos, _id: '456' },
      };

      (localStorage.getItem as jasmine.Spy).and.returnValue('mock-token');

      service.crearUsuarioAdmin(datos).subscribe({
        next: (res) => {
          expect(res).toEqual(response);
          done();
        },
      });

      const req = httpMock.expectOne(`${ADMIN_URL}/users`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(datos);
      req.flush(response);
    });
  });

  describe('obtenerUsuarios', () => {
    it('should get list of users', (done) => {
      const mockUsuarios = {
        usuarios: [
          {
            _id: '1',
            name: 'User 1',
            email: 'user1@example.com',
            role: 'user' as UserRole,
          },
          {
            _id: '2',
            name: 'User 2',
            email: 'user2@example.com',
            role: 'admin' as UserRole,
          },
        ],
      };

      (localStorage.getItem as jasmine.Spy).and.returnValue('mock-token');

      service.obtenerUsuarios().subscribe({
        next: (res) => {
          expect(res).toEqual(mockUsuarios);
          expect(res.usuarios.length).toBe(2);
          done();
        },
      });

      const req = httpMock.expectOne(`${ADMIN_URL}/users`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUsuarios);
    });
  });

  describe('estaAutenticado', () => {
    it('should return true when token and user exist', () => {
      (localStorage.getItem as jasmine.Spy).and.returnValue('mock-token');
      service['usuarioActual'].next(mockUsuario);

      expect(service.estaAutenticado()).toBe(true);
    });

    it('should return false when no token', () => {
      (localStorage.getItem as jasmine.Spy).and.returnValue(null);

      expect(service.estaAutenticado()).toBe(false);
    });

    it('should return false when no user', () => {
      (localStorage.getItem as jasmine.Spy).and.returnValue('mock-token');
      service['usuarioActual'].next(null);

      expect(service.estaAutenticado()).toBe(false);
    });
  });

  describe('esAdmin', () => {
    it('should return true for admin role', () => {
      service['usuarioActual'].next({
        ...mockUsuario,
        role: 'admin' as UserRole,
      });

      expect(service.esAdmin()).toBe(true);
    });

    it('should return true for webmaster role', () => {
      service['usuarioActual'].next({
        ...mockUsuario,
        role: 'webmaster' as UserRole,
      });

      expect(service.esAdmin()).toBe(true);
    });

    it('should return false for user role', () => {
      service['usuarioActual'].next({ ...mockUsuario, role: 'user' as UserRole });

      expect(service.esAdmin()).toBe(false);
    });
  });

  describe('esWebmaster', () => {
    it('should return true for webmaster role', () => {
      service['usuarioActual'].next({
        ...mockUsuario,
        role: 'webmaster' as UserRole,
      });

      expect(service.esWebmaster()).toBe(true);
    });

    it('should return false for admin role', () => {
      service['usuarioActual'].next({
        ...mockUsuario,
        role: 'admin' as UserRole,
      });

      expect(service.esWebmaster()).toBe(false);
    });

    it('should return false for user role', () => {
      service['usuarioActual'].next({ ...mockUsuario, role: 'user' as UserRole });

      expect(service.esWebmaster()).toBe(false);
    });
  });

  describe('obtenerUsuarioActual', () => {
    it('should return current user', () => {
      service['usuarioActual'].next(mockUsuario);

      const usuario = service.obtenerUsuarioActual();

      expect(usuario).toEqual(mockUsuario);
    });

    it('should return null when no user', () => {
      service['usuarioActual'].next(null);

      expect(service.obtenerUsuarioActual()).toBeNull();
    });
  });

  describe('guardarSesionDesdeVerificacion', () => {
    it('should save session and update current user', (done) => {
      const token = 'verification-token';

      service.usuarioActual$.subscribe((usuario) => {
        if (usuario) {
          expect(usuario).toEqual(mockUsuario);
          done();
        }
      });

      service.guardarSesionDesdeVerificacion(token, mockUsuario);

      expect(localStorage.setItem).toHaveBeenCalledWith('auth_token', token);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'user_data',
        JSON.stringify(mockUsuario)
      );
    });
  });

  describe('actualizarToken', () => {
    it('should update token in localStorage', () => {
      const newToken = 'new-token';

      service.actualizarToken(newToken);

      expect(localStorage.setItem).toHaveBeenCalledWith('auth_token', newToken);
    });
  });

  describe('obtenerToken', () => {
    it('should return token from localStorage', () => {
      (localStorage.getItem as jasmine.Spy).and.returnValue('stored-token');

      const token = service.obtenerToken();

      expect(token).toBe('stored-token');
      expect(localStorage.getItem).toHaveBeenCalledWith('auth_token');
    });

    it('should return null when no token stored', () => {
      (localStorage.getItem as jasmine.Spy).and.returnValue(null);

      const token = service.obtenerToken();

      expect(token).toBeNull();
    });
  });

  describe('refrescarToken', () => {
    it('should refresh token and save new token', (done) => {
      const refreshToken = 'refresh-token';
      const newToken = 'new-access-token';
      (localStorage.getItem as jasmine.Spy).and.returnValue(refreshToken);

      service.refrescarToken().subscribe({
        next: (response) => {
          expect(response.token).toBe(newToken);
          expect(localStorage.setItem).toHaveBeenCalledWith(
            'auth_token',
            newToken
          );
          done();
        },
      });

      const req = httpMock.expectOne(`${API_URL}/auth/refresh-token`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ refreshToken });
      req.flush({ token: newToken });
    });

    it('should call cerrarSesion and return error when no refresh token', (done) => {
      (localStorage.getItem as jasmine.Spy).and.returnValue(null);
      spyOn(service, 'cerrarSesion');

      service.refrescarToken().subscribe({
        error: (error) => {
          expect(service.cerrarSesion).toHaveBeenCalled();
          expect(error.message).toBe('No refresh token');
          done();
        },
      });
    });
  });
});
