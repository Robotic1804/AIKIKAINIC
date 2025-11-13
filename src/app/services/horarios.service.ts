import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ScheduleEvent, Location } from '../pages/models/models.horarios';
import { AuthService } from '../features/auth/services/auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class HorariosService {
  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  /**
   * Verifica si el usuario actual puede editar un evento
   */
  canEditEvent(event: ScheduleEvent): boolean {
    const user = this.authService.obtenerUsuarioActual();
    if (!user) return false;

    if (user.role === 'webmaster') return true;

    if (user.role === 'admin') {
      return event.instructorId === user.instructorId;
    }

    return false;
  }

  getEvents(): Observable<ScheduleEvent[]> {
    return this.http.get<ScheduleEvent[]>(`${this.apiUrl}/events`).pipe(
      catchError(this.handleError)
    );
  }

  getEventById(id: string): Observable<ScheduleEvent> {
    return this.http.get<ScheduleEvent>(`${this.apiUrl}/events/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Crear un nuevo evento
   */
  createEvent(event: ScheduleEvent): Observable<ScheduleEvent> {
    return this.http.post<ScheduleEvent>(`${this.apiUrl}/events`, event).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Actualizar un evento existente
   */
  updateEvent(
    id: string,
    event: Partial<ScheduleEvent>
  ): Observable<ScheduleEvent> {
    return this.http.put<ScheduleEvent>(`${this.apiUrl}/events/${id}`, event).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Eliminar un evento
   */
  deleteEvent(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/events/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtener eventos por instructor
   */
  getEventsByInstructor(instructorId: string): Observable<ScheduleEvent[]> {
    return this.http.get<ScheduleEvent[]>(
      `${this.apiUrl}/events/instructor/${instructorId}`
    ).pipe(catchError(this.handleError));
  }

  /**
   * Obtener eventos por ubicación
   */
  getEventsByLocation(locationId: string): Observable<ScheduleEvent[]> {
    return this.http.get<ScheduleEvent[]>(
      `${this.apiUrl}/events/location/${locationId}`
    ).pipe(catchError(this.handleError));
  }

  /**
   * Obtener todas las ubicaciones
   */
  getLocations(): Observable<Location[]> {
    return this.http.get<Location[]>(`${this.apiUrl}/locations`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtener una ubicación por ID
   */
  getLocationById(id: string): Observable<Location> {
    return this.http.get<Location>(`${this.apiUrl}/locations/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Crear una nueva ubicación
   */
  createLocation(location: Location): Observable<Location> {
    return this.http.post<Location>(`${this.apiUrl}/locations`, location).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Actualizar una ubicación existente
   */
  updateLocation(
    id: string,
    location: Partial<Location>
  ): Observable<Location> {
    return this.http.put<Location>(`${this.apiUrl}/locations/${id}`, location).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Eliminar una ubicación
   */
  deleteLocation(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/locations/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Genera URL de Google Maps para una ubicación
   */
  getGoogleMapsUrl(location: Location): string {
    return `https://www.google.com/maps?q=${location.coordinates.lat},${location.coordinates.lng}`;
  }

  /**
   * Genera URL de direcciones de Google Maps para una ubicación
   */
  getDirectionsUrl(location: Location): string {
    return `https://www.google.com/maps/dir/?api=1&destination=${location.coordinates.lat},${location.coordinates.lng}`;
  }

  /**
   * Genera URL de embed de Google Maps para iframes
   */
  getEmbedMapUrl(location: Location): string {
    return `https://www.google.com/maps?q=${location.coordinates.lat},${location.coordinates.lng}&hl=es&z=15&output=embed`;
  }

  /**
   * Manejo centralizado de errores HTTP
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocurrió un error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente o de red
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      if (error.status === 0) {
        errorMessage = 'No se pudo conectar con el servidor';
      } else if (error.status === 403) {
        errorMessage = 'No tienes permisos para realizar esta acción';
      } else if (error.status === 404) {
        errorMessage = 'Evento o ubicación no encontrada';
      } else if (error.status >= 500) {
        errorMessage = 'Error del servidor. Por favor, intenta más tarde';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Error ${error.status}: ${error.statusText}`;
      }
    }

    return throwError(() => ({
      status: error.status,
      message: errorMessage,
      error: error.error,
    }));
  }
}
