import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { PhotoService } from './photo.service';
import { Photo } from '../models/photo.model';
import { environment } from '../../environments/environment';

describe('PhotoService', () => {
  let service: PhotoService;
  let httpMock: HttpTestingController;

  const apiUrl = `${environment.apiUrl}/photos`;
  const baseUrl = environment.apiUrl.replace('/api', '');

  const mockPhotos: Photo[] = [
    {
      _id: '1',
      imageUrl: '/uploads/photo1.jpg',
      location: 'Tokyo',
      event: 'Tournament',
      date: '2025-01-15',
      comment: 'Great event',
    },
    {
      _id: '2',
      imageUrl: '/uploads/photo2.jpg',
      location: 'Osaka',
      event: 'Training',
      date: '2025-01-10',
      comment: '',
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PhotoService],
    });

    service = TestBed.inject(PhotoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPhotos', () => {
    it('should retrieve photos and transform imageUrl with baseUrl', (done) => {
      service.getPhotos().subscribe({
        next: (photos) => {
          expect(photos.length).toBe(2);
          expect(photos[0].imageUrl).toBe(`${baseUrl}/uploads/photo1.jpg`);
          expect(photos[1].imageUrl).toBe(`${baseUrl}/uploads/photo2.jpg`);
          expect(photos[0].location).toBe('Tokyo');
          done();
        },
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockPhotos);
    });

    it('should handle empty photo array', (done) => {
      service.getPhotos().subscribe({
        next: (photos) => {
          expect(photos).toEqual([]);
          expect(photos.length).toBe(0);
          done();
        },
      });

      httpMock.expectOne(apiUrl).flush([]);
    });

    it('should handle network error (status 0)', (done) => {
      service.getPhotos().subscribe({
        error: (error) => {
          expect(error.status).toBe(0);
          expect(error.message).toBe('No se pudo conectar con el servidor');
          done();
        },
      });

      const req = httpMock.expectOne(apiUrl);
      req.error(new ProgressEvent('Network error'), { status: 0 });
    });

    it('should handle 404 error', (done) => {
      service.getPhotos().subscribe({
        error: (error) => {
          expect(error.status).toBe(404);
          expect(error.message).toBe('Recurso no encontrado');
          done();
        },
      });

      httpMock
        .expectOne(apiUrl)
        .flush({}, { status: 404, statusText: 'Not Found' });
    });

    it('should handle 500 server error', (done) => {
      service.getPhotos().subscribe({
        error: (error) => {
          expect(error.status).toBe(500);
          expect(error.message).toBe(
            'Error del servidor. Por favor, intenta más tarde'
          );
          done();
        },
      });

      httpMock
        .expectOne(apiUrl)
        .flush({}, { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle backend error message', (done) => {
      const backendError = { message: 'Custom backend error' };

      service.getPhotos().subscribe({
        error: (error) => {
          expect(error.message).toBe('Custom backend error');
          done();
        },
      });

      httpMock
        .expectOne(apiUrl)
        .flush(backendError, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('createPhoto', () => {
    it('should upload photo and return transformed photo array', (done) => {
      const formData = new FormData();
      formData.append('location', 'Tokyo');
      formData.append('event', 'Training');
      formData.append('date', '2025-01-15');
      formData.append('comment', 'Test comment');

      const mockResponse = {
        message: 'Photo uploaded successfully',
        data: [mockPhotos[0]],
      };

      service.createPhoto(formData).subscribe({
        next: (photos) => {
          expect(photos.length).toBe(1);
          expect(photos[0].imageUrl).toBe(`${baseUrl}/uploads/photo1.jpg`);
          expect(photos[0].location).toBe('Tokyo');
          done();
        },
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBe(formData);
      req.flush(mockResponse);
    });

    it('should handle multiple photos upload', (done) => {
      const formData = new FormData();

      const mockResponse = {
        message: '2 photos uploaded',
        data: mockPhotos,
      };

      service.createPhoto(formData).subscribe({
        next: (photos) => {
          expect(photos.length).toBe(2);
          expect(photos[0].imageUrl).toBe(`${baseUrl}/uploads/photo1.jpg`);
          expect(photos[1].imageUrl).toBe(`${baseUrl}/uploads/photo2.jpg`);
          done();
        },
      });

      httpMock.expectOne(apiUrl).flush(mockResponse);
    });

    it('should handle 413 file too large error', (done) => {
      const formData = new FormData();

      service.createPhoto(formData).subscribe({
        error: (error) => {
          expect(error.status).toBe(413);
          expect(error.message).toBe('El archivo es demasiado grande');
          done();
        },
      });

      httpMock
        .expectOne(apiUrl)
        .flush({}, { status: 413, statusText: 'Payload Too Large' });
    });

    it('should handle 415 unsupported media type error', (done) => {
      const formData = new FormData();

      service.createPhoto(formData).subscribe({
        error: (error) => {
          expect(error.status).toBe(415);
          expect(error.message).toBe('Tipo de archivo no soportado');
          done();
        },
      });

      httpMock
        .expectOne(apiUrl)
        .flush({}, { status: 415, statusText: 'Unsupported Media Type' });
    });

    it('should handle generic error with status and statusText', (done) => {
      const formData = new FormData();

      service.createPhoto(formData).subscribe({
        error: (error) => {
          expect(error.status).toBe(403);
          expect(error.message).toBe('Error 403: Forbidden');
          done();
        },
      });

      httpMock
        .expectOne(apiUrl)
        .flush({}, { status: 403, statusText: 'Forbidden' });
    });
  });

  describe('deletePhoto', () => {
    it('should delete photo by id', (done) => {
      const photoId = '123';

      service.deletePhoto(photoId).subscribe({
        next: () => {
          expect(true).toBe(true); // Successfully completed
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${photoId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should handle 404 error when photo not found', (done) => {
      const photoId = 'nonexistent';

      service.deletePhoto(photoId).subscribe({
        error: (error) => {
          expect(error.status).toBe(404);
          expect(error.message).toBe('Recurso no encontrado');
          done();
        },
      });

      httpMock
        .expectOne(`${apiUrl}/${photoId}`)
        .flush({}, { status: 404, statusText: 'Not Found' });
    });

    it('should handle 403 forbidden error', (done) => {
      const photoId = '123';

      service.deletePhoto(photoId).subscribe({
        error: (error) => {
          expect(error.status).toBe(403);
          expect(error.message).toBe('Error 403: Forbidden');
          done();
        },
      });

      httpMock
        .expectOne(`${apiUrl}/${photoId}`)
        .flush({}, { status: 403, statusText: 'Forbidden' });
    });

    it('should handle network error', (done) => {
      const photoId = '123';

      service.deletePhoto(photoId).subscribe({
        error: (error) => {
          expect(error.status).toBe(0);
          expect(error.message).toBe('No se pudo conectar con el servidor');
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${photoId}`);
      req.error(new ProgressEvent('Network error'), { status: 0 });
    });
  });

  describe('handleError (indirectly tested)', () => {
    it('should handle client-side ErrorEvent', (done) => {
      service.getPhotos().subscribe({
        error: (error) => {
          expect(error.message).toContain('Error:');
          done();
        },
      });

      const req = httpMock.expectOne(apiUrl);
      req.error(new ErrorEvent('Network error', { message: 'Client error' }));
    });

    it('should return structured error object', (done) => {
      service.getPhotos().subscribe({
        error: (error) => {
          expect(error).toEqual(
            jasmine.objectContaining({
              status: jasmine.any(Number),
              message: jasmine.any(String),
              error: jasmine.anything(),
            })
          );
          done();
        },
      });

      httpMock
        .expectOne(apiUrl)
        .flush({}, { status: 500, statusText: 'Internal Server Error' });
    });
  });
});
