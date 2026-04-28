export type EmergencyType = 'FIRE' | 'MEDICAL' | 'SECURITY' | 'SOS' | null;

export interface Responder {
  id: string;
  name: string;
  type: 'DOCTOR' | 'CITIZEN' | 'HOSPITAL';
  distance: string;
  lat: number;
  lng: number;
  rating?: number;
}

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
}
