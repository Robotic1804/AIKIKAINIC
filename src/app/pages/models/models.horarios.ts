import { UserRole } from "../../features/auth/models/user.model";


export enum EventTypes {  
  ADULT_AIKIDO = 'adult_aikido',
   CHILDREN_AIKIDO = 'children_aikido',
   WEAPONS ='weapons',
   BASICS ='basics',
   TEST_PREP ='test_prep',
   SPECIAL_EVENT = 'special_event',
  SEMINAR = 'seminar'
}
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  instructorId?: string;
}


export interface Location {
  id: string;
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  description?: string;
  phone?: string;
  email?: string; 
  capacity: number; 
  facilities?: string[]; 
  images?: {

    url: string;
    caption?: string;
  }[];
  operatingHours?: {
   
    monday: DayHours;
    tuesday: DayHours;
    wednesday: DayHours;
    thursday: DayHours;
    friday: DayHours;
    saturday: DayHours;
    sunday: DayHours;
  };
  parkingAvailable?: boolean; 
  accessibleForDisabled?: boolean; 
  isActive: boolean; 
  notes?: string;
  createdAt?: string; 
  updatedAt?: string; 
}


export interface DayHours {
  open: string;
  close: string;
  isClosed: boolean;
}

export interface ScheduleEvent {
  id: string; 
  title: string;
  instructor: string;
  instructorId: string;
  type: EventTypes;
  dayOfWeek: number; 
  startTime: string; 
  endTime: string; 
  duration: number; 
  level?: string;
  locationId: string;
  location?: Location;
  maxCapacity: number;
  currentEnrollment: number;
  isRecurring: boolean;
  specificDate?: string | null; 
  isActive: boolean;
  notes?: string;
  createdAt?: string; 
  updatedAt?: string; 
}



export interface EventGroup {
  type: EventTypes | string;
  label: string;
  events: ScheduleEvent[];
}

export interface EventTypeInfo {
  value: EventTypes | 'all';
  label: string;
  color: string;
}

export const EVENT_TYPES_INFO: EventTypeInfo[] = [
  { value: 'all', label: 'Todos los Eventos', color: 'gray' },
  { value: EventTypes.ADULT_AIKIDO, label: 'Aikido para Adultos', color: 'red' },
  { value: EventTypes.CHILDREN_AIKIDO, label: 'Aikido Infantil', color: 'blue' },
  { value: EventTypes.WEAPONS, label: 'Clase de Armas', color: 'green' },
  {
    value: EventTypes.BASICS,
    label: 'Clase para Principiantes',
    color: 'purple',
  },
  {
    value: EventTypes.TEST_PREP,
    label: 'Práctica para Exámenes',
    color: 'yellow',
  },
  { value: EventTypes.SEMINAR, label: 'Seminarios', color: 'indigo' },
  {
    value: EventTypes.SPECIAL_EVENT,
    label: 'Eventos Especiales',
    color: 'pink',
  },
];
