import { EmergencyType, Responder } from './types';

export const EMERGENCY_COLORS = {
  FIRE: {
    bg: 'bg-[#F97316]',
    text: 'text-[#F97316]',
    light: 'bg-[#F97316]/20',
    hex: '#F97316'
  },
  MEDICAL: {
    bg: 'bg-[#3B82F6]',
    text: 'text-[#3B82F6]',
    light: 'bg-[#3B82F6]/20',
    hex: '#3B82F6'
  },
  SOS: {
    bg: 'bg-[#EF4444]',
    text: 'text-[#EF4444]',
    light: 'bg-[#EF4444]/20',
    hex: '#EF4444'
  },
  SECURITY: {
    bg: 'bg-[#0F172A]',
    text: 'text-[#0F172A]',
    light: 'bg-[#0F172A]/10',
    hex: '#0F172A'
  }
};

export const MOCK_RESPONDERS: Responder[] = [
  { id: '1', name: 'Dr. Sarah Wilson', type: 'DOCTOR', distance: '0.8 km', lat: 0.005, lng: 0.005, rating: 4.9 },
  { id: '2', name: 'City General Hospital', type: 'HOSPITAL', distance: '1.2 km', lat: -0.003, lng: 0.008 },
  { id: '3', name: 'James Chen (Nearby)', type: 'CITIZEN', distance: '300 m', lat: 0.002, lng: -0.001 },
  { id: '4', name: 'Dr. Mike Ross', type: 'DOCTOR', distance: '2.1 km', lat: -0.008, lng: -0.005, rating: 4.7 }
];
