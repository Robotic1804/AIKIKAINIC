// horarios.component.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { HorariosService } from '../../services/horarios.service';
import { AuthService } from '../../features/auth/services/auth.service';
import { Usuario } from '../../features/auth/models/user.model';
import {
  ScheduleEvent,
  Location,
  EventTypes,
  EVENT_TYPES_INFO,
} from '../models/models.horarios';
import { SanitizeUrlPipe } from '../../pipes/sanitize-url.pipe';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../services/notification.service';
import { TIMING, VALIDATION } from '../../core/constants/app.constants';

// Nominatim Geocoding API Response Interface
interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    road?: string;
    city?: string;
    country?: string;
  };
}

@Component({
  selector: 'app-horarios',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SanitizeUrlPipe],
  templateUrl: './horarios.component.html',
  styleUrls: ['./horarios.component.css'],
})
export class HorariosComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  currentUser: Usuario | null = null;
  isAdmin = false;
  isWebmaster = false;
  currentWeekDates: Date[] = [];
  scheduleEvents: ScheduleEvent[] = [];
  locations: Location[] = [];

  selectedEventType: EventTypes | 'all' = 'all';
  selectedDay: number | 'all' = 'all';
  selectedLocation: string | 'all' = 'all';

  eventTypeOpen = false;
  dayFilterOpen = false;
  locationFilterOpen = false;

  showEditModal = false;
  editingEvent: ScheduleEvent | null = null;
  eventForm: FormGroup;

  showLocationModal = false;
  selectedLocationForMap: Location | null = null;

  private horariosService = inject(HorariosService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private notificationService = inject(NotificationService);

  eventTypes = EVENT_TYPES_INFO;

  // Para gestionar el debounce
  private geocodeTimeout: any = null;

  constructor() {
    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      type: ['adult_aikido', Validators.required],
      dayOfWeek: [
        1,
        [Validators.required, Validators.min(0), Validators.max(6)],
      ],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      duration: [VALIDATION.DEFAULT_EVENT_DURATION_MINUTES, [Validators.required, Validators.min(VALIDATION.MIN_EVENT_DURATION_MINUTES)]],
      level: [''],

      // ✅ Reemplaza locationId por un grupo anidado
      location: this.fb.group({
        name: ['', Validators.required],
        address: ['', Validators.required],
        coordinates: this.fb.group({
          lat: [0],
          lng: [0],
        }),
      }),

      locationId: [''], // opcional: para trazabilidad
      updateLocationGlobally: [false], // ✅ nuevo campo

      maxCapacity: [VALIDATION.DEFAULT_MAX_CAPACITY, [Validators.min(1)]],
      isRecurring: [true],
      specificDate: [null],
    });
  }

  /**
   * Geocodifica la dirección del formulario usando Nominatim (OpenStreetMap)
   * Llena automáticamente las coordenadas y el nombre si es posible.
   */
  geocodeAddress(): void {
    const addressControl = this.eventForm.get('location.address');

    if (
      !addressControl ||
      !addressControl.value?.trim() ||
      addressControl.value.trim().length < 3
    ) {
      // Si no hay dirección o tiene menos de 3 caracteres, resetea coordenadas
      this.eventForm.patchValue({
        location: {
          coordinates: { lat: 0, lng: 0 },
        },
      });
      return;
    }

    const address = addressControl.value.trim();
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      address
    )}&countrycodes=NI`;

    if (this.geocodeTimeout) {
      clearTimeout(this.geocodeTimeout);
    }

    this.geocodeTimeout = setTimeout(() => {
      this.http.get<NominatimResult[]>(url).subscribe({
        next: (results) => {
          if (results && results.length > 0) {
            const firstResult = results[0];
            const lat = parseFloat(firstResult.lat);
            const lng = parseFloat(firstResult.lon);

            // Solo actualiza si las coordenadas son válidas
            if (!isNaN(lat) && !isNaN(lng)) {
              this.eventForm.patchValue({
                location: {
                  coordinates: { lat, lng },
                  name: firstResult.display_name,
                },
              });
            } else {
              this.showGeocodeError('Coordenadas inválidas');
            }
          } else {
            this.showGeocodeError(
              'No se encontró la dirección. Por favor, verifica e inténtalo de nuevo.'
            );
          }
        },
        error: () => {
          this.showGeocodeError(
            'Error al obtener la ubicación. Por favor, verifica tu conexión e inténtalo de nuevo.'
          );
        },
      });
    }, TIMING.DEBOUNCE_MS);
  }

  // Para mostrar mensajes de error amigables
  private showGeocodeError(message: string): void {
    this.notificationService.error(message);
  }

  ngOnInit(): void {
    this.loadUserData();
    this.generateCurrentWeekDates();
    this.loadEvents();
    this.loadLocations();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    // Limpia el timeout si existe
    if (this.geocodeTimeout) {
      clearTimeout(this.geocodeTimeout);
    }
  }

  loadUserData(): void {
    this.authService.usuarioActual$
      .pipe(takeUntil(this.destroy$))
      .subscribe((usuario: Usuario | null) => {
        this.currentUser = usuario;
        if (usuario) {
          this.isAdmin = this.authService.esAdmin();
          this.isWebmaster = this.authService.esWebmaster();
        } else {
          this.isAdmin = false;
          this.isWebmaster = false;
        }
      });
  }

  loadEvents(): void {
    this.horariosService
      .getEvents()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (events) => {
          this.scheduleEvents = events;
        },
        error: () => {
          this.notificationService.error('Error al cargar los eventos. Por favor, intenta de nuevo.');
        },
      });
  }

  loadLocations(): void {
    this.horariosService
      .getLocations()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (locations) => {
          this.locations = locations;
        },
        error: () => {
          this.notificationService.error('Error al cargar ubicaciones');
        },
      });
  }

  generateCurrentWeekDates(): void {
    const today = new Date();
    const currentDay = today.getDay();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - currentDay);

    this.currentWeekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      this.currentWeekDates.push(date);
    }
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
    });
  }

  formatDateNumber(date: Date): string {
    return date.getDate().toString();
  }

  formatDateFull(date: Date): string {
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  formatDay(date: Date): string {
    return date.toLocaleDateString('es-ES', { weekday: 'short' });
  }

  getWeekRange(): string {
    if (this.currentWeekDates.length === 0) return '';
    const firstDay = this.currentWeekDates[0];
    const lastDay = this.currentWeekDates[6];
    return `${this.formatDateFull(firstDay)} - ${this.formatDateFull(lastDay)}`;
  }

  get filteredEvents(): ScheduleEvent[] {
    return this.scheduleEvents.filter((event) => {
      const typeMatch =
        this.selectedEventType === 'all' ||
        event.type === this.selectedEventType;

      const dayMatch =
        this.selectedDay === 'all' || event.dayOfWeek === this.selectedDay;

      const locationMatch =
        this.selectedLocation === 'all' ||
        event.locationId === this.selectedLocation;

      return typeMatch && dayMatch && locationMatch;
    });
  }

  getEventsForDay(dayIndex: number): ScheduleEvent[] {
    return this.filteredEvents.filter((event) => event.dayOfWeek === dayIndex);
  }

  getGroupedEventsForDay(dayIndex: number): any[] {
    const events = this.getEventsForDay(dayIndex);

    return events.reduce((groups: any[], event) => {
      const existingGroup = groups.find((group) => group.type === event.type);

      if (existingGroup) {
        existingGroup.events.push(event);
      } else {
        groups.push({
          type: event.type,
          label: this.getEventTypeLabel(event.type as EventTypes),
          events: [event],
        });
      }

      return groups;
    }, []);
  }

  toggleEventTypeMenu(): void {
    this.eventTypeOpen = !this.eventTypeOpen;
    if (this.eventTypeOpen) {
      this.dayFilterOpen = false;
      this.locationFilterOpen = false;
    }
  }

  toggleDayFilterMenu(): void {
    this.dayFilterOpen = !this.dayFilterOpen;
    if (this.dayFilterOpen) {
      this.eventTypeOpen = false;
      this.locationFilterOpen = false;
    }
  }

  toggleLocationFilterMenu(): void {
    this.locationFilterOpen = !this.locationFilterOpen;
    if (this.locationFilterOpen) {
      this.eventTypeOpen = false;
      this.dayFilterOpen = false;
    }
  }

  selectEventType(type: EventTypes | 'all'): void {
    this.selectedEventType = type;
    this.eventTypeOpen = false;
  }

  selectDay(day: number | 'all'): void {
    this.selectedDay = day;
    this.dayFilterOpen = false;
  }

  selectLocation(locationId: string | 'all'): void {
    this.selectedLocation = locationId;
    this.locationFilterOpen = false;
  }

  getEventTypeColor(type: EventTypes | string): string {
    const eventType = this.eventTypes.find((et) => et.value === type);
    return eventType?.color || 'gray';
  }

  getEventTypeLabel(type: EventTypes | string): string {
    const eventType = this.eventTypes.find((et) => et.value === type);
    return eventType?.label || type;
  }

  getSelectedEventTypeLabel(): string {
    if (this.selectedEventType === 'all') return 'Todos los Eventos';
    const type = this.eventTypes.find(
      (et: any) => et.value === this.selectedEventType
    );
    return type?.label || 'Todos los Eventos';
  }

  getSelectedDayLabel(): string {
    if (this.selectedDay === 'all') return 'Toda la Semana';
    return this.formatDay(this.currentWeekDates[this.selectedDay]);
  }
  getLocationName(event: ScheduleEvent): string {
    if (event.locationId) {
      // Si hay un locationId, busca en la lista de ubicaciones
      const location = this.locations.find(
        (loc) => loc.id === event.locationId
      );
      return location?.name || 'Ubicación desconocida';
    } else if (event.location && event.location.name) {
      // Si no hay locationId pero sí hay ubicación embebida, usa su nombre
      return event.location.name;
    } else {
      return 'Ubicación desconocida';
    }
  }

  getLocationNameById(locationId: string): string {
    if (!locationId || locationId === 'all') {
      return 'Todas las Ubicaciones';
    }

    const location = this.locations.find((loc) => loc.id === locationId);
    return location?.name || 'Ubicación desconocida';
  }

  canEditEvent(event: ScheduleEvent): boolean {
    return this.horariosService.canEditEvent(event);
  }

  openCreateEventModal(): void {
    this.editingEvent = null;
    this.eventForm.reset({
      type: 'adult_aikido',
      dayOfWeek: 1,
      duration: 90,
      maxCapacity: 20,
      isRecurring: true,
      location: { name: '', address: '', coordinates: { lat: 0, lng: 0 } },
      locationId: '',
      updateLocationGlobally: false,
    });
    this.showEditModal = true;
  }

  openEditEventModal(event: ScheduleEvent): void {
    if (!this.canEditEvent(event)) {
      this.notificationService.warning('No tienes permisos para editar este evento');
      return;
    }
    const fullLocation = this.locations.find(
      (loc) => loc.id === event.locationId
    );

    this.eventForm.patchValue({
      title: event.title,
      type: event.type,
      dayOfWeek: event.dayOfWeek,
      startTime: event.startTime,
      endTime: event.endTime,
      duration: event.duration,
      level: event.level || '',
      location: fullLocation
        ? {
            name: fullLocation.name,
            address: fullLocation.address,
            coordinates: fullLocation.coordinates,
          }
        : { name: '', address: '', coordinates: { lat: 0, lng: 0 } },
      locationId: event.locationId || null,
      updateLocationGlobally: false,
      maxCapacity: event.maxCapacity,
      isRecurring: event.isRecurring,
      specificDate: event.specificDate,
    });
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editingEvent = null;
    this.eventForm.reset();
  }

  saveEvent(): void {
    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      this.notificationService.warning('Por favor, completa todos los campos requeridos');
      return;
    }

    const formValue = this.eventForm.value;
    const eventData: ScheduleEvent = {
      ...formValue,
      instructor: this.currentUser?.name || '',
      instructorId: this.currentUser?.id || '',
    };

    if (this.editingEvent?.id) {
      this.horariosService
        .updateEvent(this.editingEvent.id, eventData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadEvents();
            this.closeEditModal();
            this.notificationService.success('Evento actualizado exitosamente');
          },
          error: (error) => {
            if (error.status === 403) {
              this.notificationService.error('No tienes permisos para actualizar este evento');
            } else if (error.status === 404) {
              this.notificationService.error('El evento no existe');
            } else {
              this.notificationService.error('Error al actualizar el evento. Por favor, intenta de nuevo.');
            }
          },
        });
    } else {
      this.horariosService
        .createEvent(eventData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadEvents();
            this.closeEditModal();
            this.notificationService.success('Evento creado exitosamente');
          },
          error: (error) => {
            if (error.status === 400) {
              this.notificationService.error('Datos inválidos. Verifica todos los campos.');
            } else if (error.status === 401) {
              this.notificationService.error('No estás autenticado. Por favor, inicia sesión.');
            } else if (error.status === 403) {
              this.notificationService.error('No tienes permisos para crear eventos');
            } else {
              this.notificationService.error('Error al crear el evento. Por favor, intenta de nuevo.');
            }
          },
        });
    }
  }

  deleteEvent(event: ScheduleEvent): void {
    if (!this.canEditEvent(event) || !event.id) {
      this.notificationService.warning('No tienes permisos para eliminar este evento');
      return;
    }

    const confirmed = confirm(
      `¿Estás seguro de que quieres eliminar "${event.title}"?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmed) {
      return;
    }

    this.horariosService
      .deleteEvent(event.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadEvents();
          this.notificationService.success('Evento eliminado exitosamente');
        },
        error: (error) => {
          if (error.status === 403) {
            this.notificationService.error('No tienes permisos para eliminar este evento');
          } else if (error.status === 404) {
            this.notificationService.error('El evento no existe o ya fue eliminado');
          } else {
            this.notificationService.error('Error al eliminar el evento. Por favor, intenta de nuevo.');
          }
        },
      });
  }

  openLocationMap(locationId: string): void {
    const location = this.locations.find((loc) => loc.id === locationId);
    if (location) {
      this.selectedLocationForMap = location;
      this.showLocationModal = true;
    }
  }

  closeLocationModal(): void {
    this.showLocationModal = false;
    this.selectedLocationForMap = null;
  }

  onLocationSelected(locationId: string): void {
    if (locationId === 'create-new') {
      this.eventForm.patchValue({
        location: { name: '', address: '', coordinates: { lat: 0, lng: 0 } },
        locationId: 'create-new', // 👈 Importante: usar 'create-new' como valor
        updateLocationGlobally: false,
      });
    } else {
      const loc = this.locations.find((l) => l.id === locationId);
      if (loc) {
        this.eventForm.patchValue({
          location: {
            name: loc.name,
            address: loc.address,
            coordinates: loc.coordinates,
          },
          locationId: loc.id,
          updateLocationGlobally: false, // por defecto en falso
        });
      }
    }
  }

  getEmbedMapUrl(location: Location): string {
    return this.horariosService.getEmbedMapUrl(location);
  }

  getDirectionsUrl(location: Location): string {
    return this.horariosService.getDirectionsUrl(location);
  }

  getGoogleMapsUrl(location: Location): string {
    return this.horariosService.getGoogleMapsUrl(location);
  }

  calculateDuration(): void {
    const startTime = this.eventForm.get('startTime')?.value;
    const endTime = this.eventForm.get('endTime')?.value;

    if (startTime && endTime) {
      const start = new Date(`2000-01-01T${startTime}`);
      const end = new Date(`2000-01-01T${endTime}`);
      const duration = (end.getTime() - start.getTime()) / (1000 * 60);

      if (duration > 0) {
        this.eventForm.patchValue({ duration: duration });
      }
    }
  }
  formatTimeToAMPM(time: string): string {
    if (!time) return 'N/A';

    const [hours, minutes] = time.split(':').map(Number);
    const date: Date = new Date();
    date.setHours(hours, minutes, 0, 0);

    return date
      .toLocaleTimeString('es-ES', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
      .replace('a. m.', 'am')
      .replace('p. m.', 'pm');
  }

  getEndTime(startTime: string, durationMinutes: number): string {
    if (!startTime || !durationMinutes) {
      return 'Hora no disponible';
    }
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes
      .toString()
      .padStart(2, '0')}`;
    return this.formatTimeToAMPM(endTime);
  }

  get EventType() {
    return EventTypes;
  }
}
