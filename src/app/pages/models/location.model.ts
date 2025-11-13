// src/app/models/location.model.ts
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface DayHours {
  open: string;
  close: string;
  isClosed: boolean;
}

export interface OperatingHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface LocationImage {
  url: string;
  caption?: string;
}



export interface Location {
  id: string; // ← de _id del backend
  name: string;
  address: string;
  coordinates: Coordinates;
  description?: string;
  phone?: string;
  email?: string;
  capacity: number;
  facilities: string[];
  images: LocationImage[];
  operatingHours: OperatingHours;
  parkingAvailable: boolean;
  accessibleForDisabled: boolean;
  isActive: boolean;
  notes?: string;
  createdAt?: string; // ← timestamps del backend
  updatedAt?: string; // ← timestamps del backend
}
