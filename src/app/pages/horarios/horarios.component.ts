// schedule.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Interface representing a scheduled event
interface ScheduleEvent {
  id: number;
  title: string;
  instructor: string;
  type: EventType;
  dayOfWeek: number; // 0: Sunday, 1: Monday, ..., 6: Saturday
  startTime: string;
  endTime: string;
  duration: number;
  level?: string;
}

interface EventGroup {
  type: EventType;
  label: string;
  events: ScheduleEvent[];
}

// Enum representing different event types
enum EventType {
  ADULT_AIKIDO = 'adult_aikido',
  CHILDREN_AIKIDO = 'children_aikido',
  WEAPONS = 'weapons',
  BASICS = 'basics',
  TEST_PREP = 'test_prep',
  SPECIAL_EVENT = 'special_event',
  SEMINAR = 'seminar',
}

@Component({
  selector: 'app-horarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './horarios.component.html',
  styleUrls: ['./horarios.component.css'],
})
export class HorariosComponent implements OnInit {
  // Holds dates for the current week (Sunday to Saturday)
  currentWeekDates: Date[] = [];

  // Filter selections
  selectedEventType: EventType | 'all' = 'all';
  selectedDay: number | 'all' = 'all';

  // Toggle states for filter dropdowns
  eventTypeOpen = false;
  dayFilterOpen = false;

  // Available event types with labels and colors
  eventTypes: { value: EventType | 'all'; label: string; color: string }[] = [
    { value: 'all', label: 'Todos los Eventos', color: 'gray' },
    {
      value: EventType.ADULT_AIKIDO,
      label: 'Aikido para Adultos',
      color: 'red',
    },
    {
      value: EventType.CHILDREN_AIKIDO,
      label: 'Aikido Infantil',
      color: 'blue',
    },
    { value: EventType.WEAPONS, label: 'Clase de Armas', color: 'green' },
    {
      value: EventType.BASICS,
      label: 'Clase para Principiantes',
      color: 'purple',
    },
    {
      value: EventType.TEST_PREP,
      label: 'Práctica para Exámenes',
      color: 'yellow',
    },
    { value: EventType.SEMINAR, label: 'Seminarios', color: 'indigo' },
    {
      value: EventType.SPECIAL_EVENT,
      label: 'Eventos Especiales',
      color: 'pink',
    },
  ];

  // Static list of sample scheduled events
  scheduleEvents: ScheduleEvent[] = [
    {
      id: 1,
      title: 'Aikido Principiante',
      instructor: 'Susan Kinne',
      type: EventType.BASICS,
      dayOfWeek: 0,
      startTime: '08:00',
      endTime: '09:30',
      duration: 90,
      level: 'Principiante',
    },
    {
      id: 2,
      title: 'Aikido Avanzado',
      instructor: 'Aníbal Pérez',
      type: EventType.ADULT_AIKIDO,
      dayOfWeek: 1,
      startTime: '18:00',
      endTime: '19:30',
      duration: 90,
      level: 'Avanzado',
    },
    {
      id: 3,
      title: 'Aikido Infantil',
      instructor: 'Bruce Lester',
      type: EventType.CHILDREN_AIKIDO,
      dayOfWeek: 1,
      startTime: '16:00',
      endTime: '17:00',
      duration: 60,
      level: 'Niños 6-12 años',
    },
    {
      id: 4,
      title: 'Clase de Jo y Bokken',
      instructor: 'Marlon Sáenz',
      type: EventType.WEAPONS,
      dayOfWeek: 2,
      startTime: '18:00',
      endTime: '19:30',
      duration: 90,
      level: 'Intermedio',
    },
    {
      id: 5,
      title: 'Práctica de Exámenes',
      instructor: 'Lester Guadamuz',
      type: EventType.TEST_PREP,
      dayOfWeek: 3,
      startTime: '17:00',
      endTime: '18:30',
      duration: 90,
      level: 'Todos los niveles',
    },
    {
      id: 6,
      title: 'Aikido Adultos',
      instructor: 'Norman Navarro',
      type: EventType.ADULT_AIKIDO,
      dayOfWeek: 3,
      startTime: '19:00',
      endTime: '20:30',
      duration: 90,
      level: 'Intermedio',
    },
    {
      id: 7,
      title: 'Seminario Especial',
      instructor: 'Sensei Hirotaka',
      type: EventType.SEMINAR,
      dayOfWeek: 4,
      startTime: '09:00',
      endTime: '12:00',
      duration: 180,
      level: 'Todos los niveles',
    },
    {
      id: 8,
      title: 'Aikido Libre',
      instructor: 'Ricardo Reyes',
      type: EventType.ADULT_AIKIDO,
      dayOfWeek: 5,
      startTime: '18:00',
      endTime: '20:00',
      duration: 120,
      level: 'Todos los niveles',
    },
    {
      id: 9,
      title: 'Evento Especial - Demostración',
      instructor: 'Todos los Instructores',
      type: EventType.SPECIAL_EVENT,
      dayOfWeek: 6,
      startTime: '10:00',
      endTime: '12:00',
      duration: 120,
      level: 'Público General',
    },
  ];

  ngOnInit() {
    this.generateCurrentWeekDates();
  }

  // Calculates the current week's dates from Sunday to Saturday
  generateCurrentWeekDates(): void {
    const today = new Date();
    const currentDay = today.getDay(); // Sunday = 0
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - currentDay);

    this.currentWeekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      this.currentWeekDates.push(date);
    }
  }

  // Returns filtered events based on selected type and day
  get filteredEvents(): ScheduleEvent[] {
    return this.scheduleEvents.filter((event) => {
      const typeMatch =
        this.selectedEventType === 'all' ||
        event.type === this.selectedEventType;
      const dayMatch =
        this.selectedDay === 'all' || event.dayOfWeek === this.selectedDay;
      return typeMatch && dayMatch;
    });
  }

  // Returns events for a specific day
  getEventsForDay(dayIndex: number): ScheduleEvent[] {
    return this.filteredEvents.filter((event) => event.dayOfWeek === dayIndex);
  }

  // Formats date as "day short-month"
  formatDate(date: Date): string {
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
    });
  }

  // Returns just the day number of the date
  formatDateNumber(date: Date): string {
    return date.getDate().toString();
  }

  // Formats date in full Spanish format
  formatDateFull(date: Date): string {
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  // Returns the short weekday name for a given date
  formatDay(date: Date): string {
    return date.toLocaleDateString('es-ES', { weekday: 'short' });
  }

  // Returns the full range of the current week
  getWeekRange(): string {
    if (this.currentWeekDates.length === 0) return '';
    const firstDay = this.currentWeekDates[0];
    const lastDay = this.currentWeekDates[6];
    return `${this.formatDateFull(firstDay)} - ${this.formatDateFull(lastDay)}`;
  }

  // Returns the color associated with an event type
  getEventTypeColor(type: EventType): string {
    const eventType = this.eventTypes.find((et) => et.value === type);
    return eventType?.color || 'gray';
  }

  // Toggles the event type filter dropdown
  toggleEventTypeMenu(): void {
    this.eventTypeOpen = !this.eventTypeOpen;
    if (this.eventTypeOpen) this.dayFilterOpen = false;
  }

  // Toggles the day filter dropdown
  toggleDayFilterMenu(): void {
    this.dayFilterOpen = !this.dayFilterOpen;
    if (this.dayFilterOpen) this.eventTypeOpen = false;
  }

  // Sets the selected event type
  selectEventType(type: EventType | 'all'): void {
    this.selectedEventType = type;
    this.eventTypeOpen = false;
  }

  // Sets the selected day
  selectDay(day: number | 'all'): void {
    this.selectedDay = day;
    this.dayFilterOpen = false;
  }

  // Checks if the provided date is today
  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  // Gets the label of the selected event type
  getSelectedEventTypeLabel(): string {
    if (this.selectedEventType === 'all') return 'Todos los Eventos';
    const type = this.eventTypes.find(
      (et) => et.value === this.selectedEventType
    );
    return type?.label || 'Todos los Eventos';
  }

  // Gets the label for a specific event type
  getEventTypeLabel(type: EventType): string {
    const eventType = this.eventTypes.find((et) => et.value === type);
    return eventType?.label || type;
  }

  // Gets the label of the selected day
  getSelectedDayLabel(): string {
    if (this.selectedDay === 'all') return 'Toda la Semana';
    return this.formatDay(this.currentWeekDates[this.selectedDay]);
  }

  // Groups events by type for a specific day
  getGroupedEventsForDay(dayIndex: number): EventGroup[] {
    const events = this.getEventsForDay(dayIndex);

    return events.reduce((groups: EventGroup[], event) => {
      const existingGroup = groups.find((group) => group.type === event.type);

      if (existingGroup) {
        existingGroup.events.push(event);
      } else {
        groups.push({
          type: event.type,
          label: this.getEventTypeLabel(event.type),
          events: [event],
        });
      }

      return groups;
    }, []);
  }

  // Exposes the EventType enum to the template
  get EventType() {
    return EventType;
  }
}
