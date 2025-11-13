import { TestBed } from '@angular/core/testing';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../../environments/environment';

describe('authInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const testUrl = `${environment.apiUrl}/test-endpoint`;
  const mockToken = 'mock-auth-token';
  const mockRefreshToken = 'mock-refresh-token';

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', [
      'obtenerToken',
      'refrescarToken',
      'actualizarToken',
      'cerrarSesion',
    ]);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpyObj },
        {
          provide: HTTP_INTERCEPTORS,
          useValue: authInterceptor,
          multi: true,
        },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(authInterceptor).toBeTruthy();
  });

  // ==================== TOKEN INJECTION ====================

  describe('token injection', () => {
    it('should add Authorization header when token exists', () => {
      authServiceSpy.obtenerToken.and.returnValue(mockToken);

      httpClient.get(testUrl).subscribe();

      const req = httpMock.expectOne(testUrl);
      expect(req.request.headers.has('Authorization')).toBe(true);
      expect(req.request.headers.get('Authorization')).toBe(
        `Bearer ${mockToken}`
      );
      req.flush({});
    });

    it('should not add Authorization header when no token', () => {
      authServiceSpy.obtenerToken.and.returnValue(null);

      httpClient.get(testUrl).subscribe();

      const req = httpMock.expectOne(testUrl);
      expect(req.request.headers.has('Authorization')).toBe(false);
      req.flush({});
    });

    it('should add Authorization header to POST requests', () => {
      authServiceSpy.obtenerToken.and.returnValue(mockToken);

      httpClient.post(testUrl, { data: 'test' }).subscribe();

      const req = httpMock.expectOne(testUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Authorization')).toBe(
        `Bearer ${mockToken}`
      );
      req.flush({});
    });

    it('should add Authorization header to PUT requests', () => {
      authServiceSpy.obtenerToken.and.returnValue(mockToken);

      httpClient.put(testUrl, { data: 'test' }).subscribe();

      const req = httpMock.expectOne(testUrl);
      expect(req.request.method).toBe('PUT');
      expect(req.request.headers.get('Authorization')).toBe(
        `Bearer ${mockToken}`
      );
      req.flush({});
    });

    it('should add Authorization header to DELETE requests', () => {
      authServiceSpy.obtenerToken.and.returnValue(mockToken);

      httpClient.delete(testUrl).subscribe();

      const req = httpMock.expectOne(testUrl);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.headers.get('Authorization')).toBe(
        `Bearer ${mockToken}`
      );
      req.flush({});
    });
  });

  // ==================== 401 ERROR HANDLING ====================

  describe('401 error handling and token refresh', () => {
    it('should attempt to refresh token on 401 error', () => {
      authServiceSpy.obtenerToken.and.returnValue(mockToken);
      authServiceSpy.refrescarToken.and.returnValue(
        of({ token: mockRefreshToken })
      );

      httpClient.get(testUrl).subscribe();

      // First request fails with 401
      const req1 = httpMock.expectOne(testUrl);
      req1.flush({}, { status: 401, statusText: 'Unauthorized' });

      expect(authServiceSpy.refrescarToken).toHaveBeenCalled();

      // Second request with new token should succeed
      const req2 = httpMock.expectOne(testUrl);
      expect(req2.request.headers.get('Authorization')).toBe(
        `Bearer ${mockRefreshToken}`
      );
      req2.flush({ success: true });
    });

    it('should update token after successful refresh', () => {
      authServiceSpy.obtenerToken.and.returnValue(mockToken);
      authServiceSpy.refrescarToken.and.returnValue(
        of({ token: mockRefreshToken })
      );

      httpClient.get(testUrl).subscribe();

      const req1 = httpMock.expectOne(testUrl);
      req1.flush({}, { status: 401, statusText: 'Unauthorized' });

      expect(authServiceSpy.actualizarToken).toHaveBeenCalledWith(
        mockRefreshToken
      );

      httpMock.expectOne(testUrl).flush({});
    });

    it('should close session and navigate to login if refresh fails', (done) => {
      authServiceSpy.obtenerToken.and.returnValue(mockToken);
      authServiceSpy.refrescarToken.and.returnValue(
        throwError(() => new Error('Refresh failed'))
      );

      httpClient.get(testUrl).subscribe({
        error: () => {
          expect(authServiceSpy.cerrarSesion).toHaveBeenCalled();
          expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
          done();
        },
      });

      const req = httpMock.expectOne(testUrl);
      req.flush({}, { status: 401, statusText: 'Unauthorized' });
    });

    it('should close session if refresh returns no token', (done) => {
      authServiceSpy.obtenerToken.and.returnValue(mockToken);
      authServiceSpy.refrescarToken.and.returnValue(of({ token: null as any }));

      httpClient.get(testUrl).subscribe({
        error: () => {
          expect(authServiceSpy.cerrarSesion).toHaveBeenCalled();
          expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
          done();
        },
      });

      const req = httpMock.expectOne(testUrl);
      req.flush({}, { status: 401, statusText: 'Unauthorized' });
    });

    it('should not attempt refresh on refresh-token endpoint', (done) => {
      const refreshUrl = `${environment.apiUrl}/auth/refresh-token`;
      authServiceSpy.obtenerToken.and.returnValue(mockToken);

      httpClient.post(refreshUrl, {}).subscribe({
        error: (error) => {
          expect(error.status).toBe(401);
          expect(authServiceSpy.refrescarToken).not.toHaveBeenCalled();
          done();
        },
      });

      const req = httpMock.expectOne(refreshUrl);
      req.flush({}, { status: 401, statusText: 'Unauthorized' });
    });

    it('should retry request with new token after successful refresh', (done) => {
      authServiceSpy.obtenerToken.and.returnValue(mockToken);
      authServiceSpy.refrescarToken.and.returnValue(
        of({ token: mockRefreshToken })
      );

      httpClient.get(testUrl).subscribe({
        next: (response) => {
          expect(response).toEqual({ data: 'success' });
          done();
        },
      });

      // First request with old token fails
      const req1 = httpMock.expectOne(testUrl);
      expect(req1.request.headers.get('Authorization')).toBe(
        `Bearer ${mockToken}`
      );
      req1.flush({}, { status: 401, statusText: 'Unauthorized' });

      // Second request with new token succeeds
      const req2 = httpMock.expectOne(testUrl);
      expect(req2.request.headers.get('Authorization')).toBe(
        `Bearer ${mockRefreshToken}`
      );
      req2.flush({ data: 'success' });
    });
  });

  // ==================== OTHER ERROR HANDLING ====================

  describe('other HTTP error handling', () => {
    it('should propagate 403 forbidden errors without refresh', (done) => {
      authServiceSpy.obtenerToken.and.returnValue(mockToken);

      httpClient.get(testUrl).subscribe({
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(403);
          expect(authServiceSpy.refrescarToken).not.toHaveBeenCalled();
          expect(authServiceSpy.cerrarSesion).not.toHaveBeenCalled();
          done();
        },
      });

      const req = httpMock.expectOne(testUrl);
      req.flush({}, { status: 403, statusText: 'Forbidden' });
    });

    it('should propagate 404 not found errors without refresh', (done) => {
      authServiceSpy.obtenerToken.and.returnValue(mockToken);

      httpClient.get(testUrl).subscribe({
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(404);
          expect(authServiceSpy.refrescarToken).not.toHaveBeenCalled();
          done();
        },
      });

      const req = httpMock.expectOne(testUrl);
      req.flush({}, { status: 404, statusText: 'Not Found' });
    });

    it('should propagate 500 server errors without refresh', (done) => {
      authServiceSpy.obtenerToken.and.returnValue(mockToken);

      httpClient.get(testUrl).subscribe({
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(500);
          expect(authServiceSpy.refrescarToken).not.toHaveBeenCalled();
          done();
        },
      });

      const req = httpMock.expectOne(testUrl);
      req.flush({}, { status: 500, statusText: 'Internal Server Error' });
    });

    it('should propagate 400 bad request errors without refresh', (done) => {
      authServiceSpy.obtenerToken.and.returnValue(mockToken);

      httpClient.get(testUrl).subscribe({
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(400);
          expect(authServiceSpy.refrescarToken).not.toHaveBeenCalled();
          done();
        },
      });

      const req = httpMock.expectOne(testUrl);
      req.flush({}, { status: 400, statusText: 'Bad Request' });
    });
  });

  // ==================== SUCCESSFUL REQUESTS ====================

  describe('successful requests', () => {
    it('should allow successful GET request to pass through', (done) => {
      authServiceSpy.obtenerToken.and.returnValue(mockToken);

      httpClient.get(testUrl).subscribe({
        next: (response) => {
          expect(response).toEqual({ data: 'test' });
          done();
        },
      });

      const req = httpMock.expectOne(testUrl);
      req.flush({ data: 'test' });
    });

    it('should allow successful POST request to pass through', (done) => {
      authServiceSpy.obtenerToken.and.returnValue(mockToken);
      const postData = { name: 'Test' };

      httpClient.post(testUrl, postData).subscribe({
        next: (response) => {
          expect(response).toEqual({ id: 1, ...postData });
          done();
        },
      });

      const req = httpMock.expectOne(testUrl);
      expect(req.request.body).toEqual(postData);
      req.flush({ id: 1, ...postData });
    });

    it('should preserve request body after adding auth header', () => {
      authServiceSpy.obtenerToken.and.returnValue(mockToken);
      const postData = { test: 'data', nested: { value: 123 } };

      httpClient.post(testUrl, postData).subscribe();

      const req = httpMock.expectOne(testUrl);
      expect(req.request.body).toEqual(postData);
      expect(req.request.headers.get('Authorization')).toBeTruthy();
      req.flush({});
    });

    it('should preserve query parameters after adding auth header', () => {
      authServiceSpy.obtenerToken.and.returnValue(mockToken);
      const urlWithParams = `${testUrl}?id=123&filter=active`;

      httpClient.get(urlWithParams).subscribe();

      const req = httpMock.expectOne(urlWithParams);
      expect(req.request.params.get('id')).toBe('123');
      expect(req.request.params.get('filter')).toBe('active');
      expect(req.request.headers.get('Authorization')).toBeTruthy();
      req.flush({});
    });
  });

  // ==================== EDGE CASES ====================

  describe('edge cases', () => {
    it('should handle multiple simultaneous 401 errors', (done) => {
      authServiceSpy.obtenerToken.and.returnValue(mockToken);
      authServiceSpy.refrescarToken.and.returnValue(
        of({ token: mockRefreshToken })
      );

      let completed = 0;
      const checkDone = () => {
        completed++;
        if (completed === 2) done();
      };

      // Make two simultaneous requests
      httpClient.get(testUrl).subscribe({ next: checkDone });
      httpClient.get(`${testUrl}/2`).subscribe({ next: checkDone });

      // Both fail with 401
      httpMock.expectOne(testUrl).flush({}, { status: 401, statusText: 'Unauthorized' });
      httpMock.expectOne(`${testUrl}/2`).flush({}, { status: 401, statusText: 'Unauthorized' });

      // Both retry with new token
      httpMock.expectOne(testUrl).flush({ data: 1 });
      httpMock.expectOne(`${testUrl}/2`).flush({ data: 2 });
    });

    it('should handle empty response body', (done) => {
      authServiceSpy.obtenerToken.and.returnValue(mockToken);

      httpClient.get(testUrl).subscribe({
        next: (response) => {
          expect(response).toBeNull();
          done();
        },
      });

      const req = httpMock.expectOne(testUrl);
      req.flush(null);
    });

    it('should preserve custom headers when adding auth header', () => {
      authServiceSpy.obtenerToken.and.returnValue(mockToken);
      const customHeaders = { 'X-Custom-Header': 'custom-value' };

      httpClient
        .get(testUrl, { headers: customHeaders })
        .subscribe();

      const req = httpMock.expectOne(testUrl);
      expect(req.request.headers.get('Authorization')).toBe(
        `Bearer ${mockToken}`
      );
      expect(req.request.headers.get('X-Custom-Header')).toBe('custom-value');
      req.flush({});
    });
  });
});
