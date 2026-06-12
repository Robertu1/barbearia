/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ActiveView = 'login' | 'signup' | 'forgot' | 'dashboard';

export interface User {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role?: 'client' | 'owner';
}

export interface Barber {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  rating: number;
  availableTimes: string[];
}

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number; // in minutes
  description: string;
}

export interface Appointment {
  id: string;
  userId?: string;
  userEmail?: string;
  barber: Barber;
  service: Service;
  date: string;
  time: string;
  status: 'scheduled' | 'finished' | 'canceled';
}

export interface TenantConfig {
  id: string;
  barbershopName: string;
  phone: string;
  address: string;
  tagline: string;
  accentColor: 'amber' | 'emerald' | 'crimson' | 'indigo' | 'slate';
  openHours: string;
}

export interface SaaSFeedback {
  id: string;
  userEmail: string;
  rating: number;
  likedMost: string;
  missingFeatures: string;
  createdAt: string;
}
