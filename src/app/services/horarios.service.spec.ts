import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { HorariosService } from './horarios.service';
import { AuthService } from '../features/auth/services/auth.service';
import { ScheduleEvent, Location } from '../pages/models/models.horarios';
import { Usuario, UserRole } from '../features/auth/models/user.model';
import { environment } from '../../environments/environment';

describe('HorariosService', () => {
  let service: HorariosService;
  let httpMock: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const apiUrl = environment.apiUrl;

  const mockWebmaster: Usuario = {
    id: '1',
    name: 'Webmaster',
    email: 'webmaster@test.com',
    role: 'webmaster' as UserRole,
    token: 'token',
  };

  const mockAdmin: Usuario = {
    id: '2',
    name: 'Admin',
    email: 'admin@test.com',
    role: 'admin' as UserRole,
    instructorId: 'instructor-1',
    token: 'token',
  };

  const mockUser: Usuario = {
    id: '3',
    name: 'User',
    email: 'user@test.com',
    role: 'user' as UserRole,
    token: 'token',
  };

  const mockEvent: ScheduleEvent = {
    _id: 'event-1',
    title: 'Aikido Training',
    instructorId: 'instructor-1',
    instructorName: 'John Sensei',
    location: 'Tokyo Dojo',
    locationId: 'loc-1',
    startTime: '18:00',
    endTime: '20:00',
    day: 'Monday',
    description: 'Beginner class',
    color: '#3B82F6',
  };

  const mockLocation: Location = {
    _id: 'loc-1',
    name: 'Tokyo Dojo',
    address: '123 Aikido Street',
    coordinates: {
      lat: 35.6762,
      lng: 139.6503,
    },
    capacity: 30,
  };

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', [
      'obtenerUsuarioActual',
    ]);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        HorariosService,
        { provide: AuthService, useValue: authSpy },
      ],
    });

    service = TestBed.inject(HorariosService);
    httpMock = TestBed.inject(HttpTestingController);
    authServiceSpy = TestBed.inject(
      AuthService
    ) as jasmine.SpyObj<AuthService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ==================== EVENTS TESTS ====================

  describe('getEvents', () => {
    it('should retrieve all events', (done) => {
      const mockEvents = [mockEvent];

      service.getEvents().subscribe({
        next: (events) => {
          expect(events).toEqual(mockEvents);
          expect(events.length).toBe(1);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/events`);
      expect(req.request.method).toBe('GET');
      req.flush(mockEvents);
    });

    it('should handle empty events array', (done) => {
      service.getEvents().subscribe({
        next: (events) => {
          expect(events).toEqual([]);
          done();
        },
      });

      httpMock.expectOne(`${apiUrl}/events`).flush([]);
    });

    it('should handle network error', (done) => {
      service.getEvents().subscribe({
        error: (error) => {
          expect(error.status).toBe(0);
          expect(error.message).toBe('No se pudo conectar con el servidor');
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/events`);
      req.error(new ProgressEvent('Network error'), { status: 0 });
    });
  });

  describe('getEventById', () => {
    it('should retrieve event by id', (done) => {
      const eventId = 'event-1';

      service.getEventById(eventId).subscribe({
        next: (event) => {
          expect(event).toEqual(mockEvent);
          expect(event._id).toBe(eventId);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/events/${eventId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockEvent);
    });

    it('should handle 404 when event not found', (done) => {
      const eventId = 'nonexistent';

      service.getEventById(eventId).subscribe({
        error: (error) => {
          expect(error.status).toBe(404);
          expect(error.message).toBe('Evento o ubicación no encontrada');
          done();
        },
      });

      httpMock
        .expectOne(`${apiUrl}/events/${eventId}`)
        .flush({}, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('createEvent', () => {
    it('should create a new event', (done) => {
      const newEvent = { ...mockEvent };
      delete newEvent._id;

      service.createEvent(newEvent as any).subscribe({
        next: (event) => {
          expect(event).toEqual(mockEvent);
          expect(event._id).toBe('event-1');
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/events`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newEvent);
      req.flush(mockEvent);
    });

    it('should handle validation error', (done) => {
      const invalidEvent = {} as ScheduleEvent;

      service.createEvent(invalidEvent).subscribe({
        error: (error) => {
          expect(error.status).toBe(400);
          done();
        },
      });

      httpMock
        .expectOne(`${apiUrl}/events`)
        .flush({}, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('updateEvent', () => {
    it('should update an existing event', (done) => {
      const eventId = 'event-1';
      const updates = { title: 'Updated Training' };

      service.updateEvent(eventId, updates).subscribe({
        next: (event) => {
          expect(event.title).toBe('Updated Training');
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/events/${eventId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updates);
      req.flush({ ...mockEvent, title: 'Updated Training' });
    });

    it('should handle 403 forbidden error', (done) => {
      const eventId = 'event-1';

      service.updateEvent(eventId, {}).subscribe({
        error: (error) => {
          expect(error.status).toBe(403);
          expect(error.message).toBe('No tienes permisos para realizar esta acción');
          done();
        },
      });

      httpMock
        .expectOne(`${apiUrl}/events/${eventId}`)
        .flush({}, { status: 403, statusText: 'Forbidden' });
    });
  });

  describe('deleteEvent', () => {
    it('should delete an event', (done) => {
      const eventId = 'event-1';

      service.deleteEvent(eventId).subscribe({
        next: () => {
          expect(true).toBe(true);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/events/${eventId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should handle 404 error', (done) => {
      const eventId = 'nonexistent';

      service.deleteEvent(eventId).subscribe({
        error: (error) => {
          expect(error.status).toBe(404);
          expect(error.message).toBe('Evento o ubicación no encontrada');
          done();
        },
      });

      httpMock
        .expectOne(`${apiUrl}/events/${eventId}`)
        .flush({}, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('getEventsByInstructor', () => {
    it('should retrieve events by instructor', (done) => {
      const instructorId = 'instructor-1';
      const mockEvents = [mockEvent];

      service.getEventsByInstructor(instructorId).subscribe({
        next: (events) => {
          expect(events).toEqual(mockEvents);
          expect(events[0].instructorId).toBe(instructorId);
          done();
        },
      });

      const req = httpMock.expectOne(
        `${apiUrl}/events/instructor/${instructorId}`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockEvents);
    });

    it('should return empty array when instructor has no events', (done) => {
      const instructorId = 'instructor-2';

      service.getEventsByInstructor(instructorId).subscribe({
        next: (events) => {
          expect(events).toEqual([]);
          done();
        },
      });

      httpMock
        .expectOne(`${apiUrl}/events/instructor/${instructorId}`)
        .flush([]);
    });
  });

  describe('getEventsByLocation', () => {
    it('should retrieve events by location', (done) => {
      const locationId = 'loc-1';
      const mockEvents = [mockEvent];

      service.getEventsByLocation(locationId).subscribe({
        next: (events) => {
          expect(events).toEqual(mockEvents);
          expect(events[0].locationId).toBe(locationId);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/events/location/${locationId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockEvents);
    });
  });

  // ==================== LOCATIONS TESTS ====================

  describe('getLocations', () => {
    it('should retrieve all locations', (done) => {
      const mockLocations = [mockLocation];

      service.getLocations().subscribe({
        next: (locations) => {
          expect(locations).toEqual(mockLocations);
          expect(locations.length).toBe(1);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/locations`);
      expect(req.request.method).toBe('GET');
      req.flush(mockLocations);
    });

    it('should handle server error', (done) => {
      service.getLocations().subscribe({
        error: (error) => {
          expect(error.status).toBe(500);
          expect(error.message).toBe(
            'Error del servidor. Por favor, intenta más tarde'
          );
          done();
        },
      });

      httpMock
        .expectOne(`${apiUrl}/locations`)
        .flush({}, { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('getLocationById', () => {
    it('should retrieve location by id', (done) => {
      const locationId = 'loc-1';

      service.getLocationById(locationId).subscribe({
        next: (location) => {
          expect(location).toEqual(mockLocation);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/locations/${locationId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockLocation);
    });

    it('should handle 404 error', (done) => {
      const locationId = 'nonexistent';

      service.getLocationById(locationId).subscribe({
        error: (error) => {
          expect(error.status).toBe(404);
          expect(error.message).toBe('Evento o ubicación no encontrada');
          done();
        },
      });

      httpMock
        .expectOne(`${apiUrl}/locations/${locationId}`)
        .flush({}, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('createLocation', () => {
    it('should create a new location', (done) => {
      const newLocation = { ...mockLocation };
      delete newLocation._id;

      service.createLocation(newLocation as any).subscribe({
        next: (location) => {
          expect(location).toEqual(mockLocation);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/locations`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newLocation);
      req.flush(mockLocation);
    });
  });

  describe('updateLocation', () => {
    it('should update an existing location', (done) => {
      const locationId = 'loc-1';
      const updates = { name: 'Updated Dojo' };

      service.updateLocation(locationId, updates).subscribe({
        next: (location) => {
          expect(location.name).toBe('Updated Dojo');
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/locations/${locationId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updates);
      req.flush({ ...mockLocation, name: 'Updated Dojo' });
    });
  });

  describe('deleteLocation', () => {
    it('should delete a location', (done) => {
      const locationId = 'loc-1';

      service.deleteLocation(locationId).subscribe({
        next: () => {
          expect(true).toBe(true);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/locations/${locationId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  // ==================== AUTHORIZATION TESTS ====================

  describe('canEditEvent', () => {
    it('should return false when user is not authenticated', () => {
      authServiceSpy.obtenerUsuarioActual.and.returnValue(null);

      const result = service.canEditEvent(mockEvent);

      expect(result).toBe(false);
    });

    it('should return true for webmaster', () => {
      authServiceSpy.obtenerUsuarioActual.and.returnValue(mockWebmaster);

      const result = service.canEditEvent(mockEvent);

      expect(result).toBe(true);
    });

    it('should return true for admin with matching instructorId', () => {
      authServiceSpy.obtenerUsuarioActual.and.returnValue(mockAdmin);

      const result = service.canEditEvent(mockEvent);

      expect(result).toBe(true);
    });

    it('should return false for admin with different instructorId', () => {
      const adminWithDifferentId = {
        ...mockAdmin,
        instructorId: 'different-instructor',
      };
      authServiceSpy.obtenerUsuarioActual.and.returnValue(adminWithDifferentId);

      const result = service.canEditEvent(mockEvent);

      expect(result).toBe(false);
    });

    it('should return false for regular user', () => {
      authServiceSpy.obtenerUsuarioActual.and.returnValue(mockUser);

      const result = service.canEditEvent(mockEvent);

      expect(result).toBe(false);
    });
  });

  // ==================== GOOGLE MAPS URL TESTS ====================

  describe('getGoogleMapsUrl', () => {
    it('should generate correct Google Maps URL', () => {
      const url = service.getGoogleMapsUrl(mockLocation);

      expect(url).toBe(
        `https://www.google.com/maps?q=${mockLocation.coordinates.lat},${mockLocation.coordinates.lng}`
      );
      expect(url).toContain('35.6762');
      expect(url).toContain('139.6503');
    });
  });

  describe('getDirectionsUrl', () => {
    it('should generate correct Google Maps directions URL', () => {
      const url = service.getDirectionsUrl(mockLocation);

      expect(url).toBe(
        `https://www.google.com/maps/dir/?api=1&destination=${mockLocation.coordinates.lat},${mockLocation.coordinates.lng}`
      );
      expect(url).toContain('api=1');
      expect(url).toContain('destination=');
    });
  });

  describe('getEmbedMapUrl', () => {
    it('should generate correct Google Maps embed URL', () => {
      const url = service.getEmbedMapUrl(mockLocation);

      expect(url).toBe(
        `https://www.google.com/maps?q=${mockLocation.coordinates.lat},${mockLocation.coordinates.lng}&hl=es&z=15&output=embed`
      );
      expect(url).toContain('hl=es');
      expect(url).toContain('z=15');
      expect(url).toContain('output=embed');
    });
  });

  // ==================== ERROR HANDLING TESTS ====================

  describe('handleError (indirectly tested)', () => {
    it('should handle client-side ErrorEvent', (done) => {
      service.getEvents().subscribe({
        error: (error) => {
          expect(error.message).toContain('Error:');
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/events`);
      req.error(new ErrorEvent('Network error', { message: 'Client error' }));
    });

    it('should return structured error object', (done) => {
      service.getEvents().subscribe({
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
        .expectOne(`${apiUrl}/events`)
        .flush({}, { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle backend error message', (done) => {
      const backendError = { message: 'Custom error from backend' };

      service.getEvents().subscribe({
        error: (error) => {
          expect(error.message).toBe('Custom error from backend');
          done();
        },
      });

      httpMock
        .expectOne(`${apiUrl}/events`)
        .flush(backendError, { status: 400, statusText: 'Bad Request' });
    });
  });
});
