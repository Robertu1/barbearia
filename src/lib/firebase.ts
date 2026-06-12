/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, getDocs, collection, query, where, updateDoc, serverTimestamp, getDocFromServer } from 'firebase/firestore';
import { User, Appointment, Barber } from '../types';

// Operation Types defined by the Firebase Integration Skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

import appletConfig from '../firebase-applet-config.json';

let firebaseApp: any = null;
let db: any = null;
let auth: any = null;
let isFirebaseConfigured = false;

// Gracefully read configuration if available from the platform provisioner
try {
  if (appletConfig && appletConfig.apiKey && appletConfig.projectId) {
    if (getApps().length === 0) {
      firebaseApp = initializeApp(appletConfig);
      db = getFirestore(firebaseApp, appletConfig.firestoreDatabaseId);
      auth = getAuth(firebaseApp);
      isFirebaseConfigured = true;
      console.log('🔥 Firebase successfully initialized with automatic applet credentials.');
      
      // Test the Firestore connection immediately as requested by the validation rules
      const testConnection = async () => {
        try {
          await getDocFromServer(doc(db, 'test', 'connection'));
        } catch (error) {
          if (error instanceof Error && error.message.includes('the client is offline')) {
            console.warn("Please check your Firebase connectivity or offline status.");
          }
        }
      };
      testConnection();
    }
  }
} catch (e) {
  console.log('ℹ️ Automatic Firebase configuration could not be loaded. Running in high-fidelity local sandbox mode.');
}

export { db, auth, isFirebaseConfigured };

// Standard skill-required error handler
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || 'anonymous-local',
      email: auth?.currentUser?.email || 'local@test.com',
      emailVerified: auth?.currentUser?.emailVerified || false,
      isAnonymous: auth?.currentUser?.isAnonymous || true,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ---------------------------------------------------------------------------
// SANDBOX/LOCAL STORAGE FALLBACK ENGINE
// ---------------------------------------------------------------------------
// Serves as an extremely consistent, resilient local data engine 
// that mimics Firestore's structure, allowing complete validation of signups,
// logins, appointments, and state modifications across multiple mock accounts.
// ---------------------------------------------------------------------------

const LOCAL_USERS_KEY = 'barber_local_users';
const LOCAL_APPOINTMENTS_KEY = 'barber_local_appointments';

// Helper initializer for local demo users
const getLocalUsers = (): Record<string, any> => {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  // Base default user matching default test coordinates
  return {
    'robertucruiz@gmail.com': {
      uid: 'uid-robertu',
      name: 'Roberto Ruiz',
      email: 'robertucruiz@gmail.com',
      phone: '(11) 98765-4321',
      password: 'senha123', // Stored simply for client sandbox login verification
      role: 'owner',
    },
    'cliente@teste.com': {
      uid: 'uid-cliente',
      name: 'Carlos Cliente',
      email: 'cliente@teste.com',
      phone: '(11) 99999-1111',
      password: 'senha123',
      role: 'client',
    }
  };
};

const saveLocalUsers = (users: Record<string, any>) => {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
};

const getLocalAppointments = (): Appointment[] => {
  try {
    const raw = localStorage.getItem(LOCAL_APPOINTMENTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [
    {
      id: 'ap-1',
      userId: 'uid-robertu',
      userEmail: 'robertucruiz@gmail.com',
      barber: {
        id: 'shop_barber',
        name: 'Barbearia Principal',
        role: 'Atendimento do Estabelecimento',
        avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=256&auto=format&fit=crop',
        rating: 4.9,
        availableTimes: ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
      },
      service: {
        id: 's1',
        name: 'Cabelo + Barba',
        price: 55.00,
        duration: 50,
        description: 'Corte e barba clássicos.',
      },
      date: '2026-06-12',
      time: '14:00',
      status: 'scheduled',
    },
    {
      id: 'ap-2',
      userId: 'uid-robertu',
      userEmail: 'robertucruiz@gmail.com',
      barber: {
        id: 'shop_barber',
        name: 'Barbearia Principal',
        role: 'Atendimento do Estabelecimento',
        avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=256&auto=format&fit=crop',
        rating: 4.9,
        availableTimes: ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
      },
      service: {
        id: 's2',
        name: 'Apenas Cabelo',
        price: 35.00,
        duration: 30,
        description: 'Corte simples',
      },
      date: '2026-05-24',
      time: '15:30',
      status: 'finished',
    }
  ];
};

const saveLocalAppointments = (appointments: Appointment[]) => {
  localStorage.setItem(LOCAL_APPOINTMENTS_KEY, JSON.stringify(appointments));
};

// ---------------------------------------------------------------------------
// HIGH LEVEL AGNOSTIC DATABASE API
// ---------------------------------------------------------------------------

export async function dbSignIn(email: string, pass: string): Promise<User> {
  const normalizedEmail = email.trim().toLowerCase();

  if (isFirebaseConfigured) {
    try {
      const authResult = await signInWithEmailAndPassword(auth, normalizedEmail, pass);
      const userDoc = await getDoc(doc(db, 'users', authResult.user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          id: authResult.user.uid,
          name: data.name,
          email: data.email,
          phone: data.phone,
          role: data.role || 'client',
        };
      }
      return {
        id: authResult.user.uid,
        name: authResult.user.displayName || email.split('@')[0],
        email: normalizedEmail,
        phone: '(11) 99999-9999',
        role: normalizedEmail === 'robertucruiz@gmail.com' ? 'owner' : 'client',
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/...`);
    }
  }

  // Fallback to Sandboxed local storage implementation
  const users = getLocalUsers();
  const matched = users[normalizedEmail];
  if (!matched || matched.password !== pass) {
    throw new Error('E-mail ou senha incorretos. Dica: use o e-mail de teste "robertucruiz@gmail.com" com a senha "senha123" ou crie uma conta nova!');
  }

  return {
    id: matched.uid,
    name: matched.name,
    email: matched.email,
    phone: matched.phone,
    role: matched.role || 'client',
  };
}

export async function dbSignInWithGoogle(): Promise<User> {
  if (isFirebaseConfigured) {
    try {
      const provider = new GoogleAuthProvider();
      const authResult = await signInWithPopup(auth, provider);
      
      const userRef = doc(db, 'users', authResult.user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          id: authResult.user.uid,
          name: data.name,
          email: data.email,
          phone: data.phone || '(11) 99999-9999',
          role: data.role || 'client',
        };
      } else {
        const profileData = {
          uid: authResult.user.uid,
          name: authResult.user.displayName || authResult.user.email?.split('@')[0] || 'Usuário Google',
          email: authResult.user.email || '',
          phone: '(11) 99999-9999',
          role: 'client', // Defaults to client on Google Auth signup
        };
        await setDoc(userRef, profileData);
        return {
          id: profileData.uid,
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone,
          role: profileData.role as 'client' | 'owner',
        };
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/google`);
    }
  }

  throw new Error('O banco de dados real (Firebase) não está conectado. Tente login por email localmente.');
}

export async function dbSignUp(name: string, email: string, phone: string, pass: string, role: 'client' | 'owner' = 'client'): Promise<User> {
  const normalizedEmail = email.trim().toLowerCase();

  if (isFirebaseConfigured) {
    try {
      const authResult = await createUserWithEmailAndPassword(auth, normalizedEmail, pass);
      const userRef = doc(db, 'users', authResult.user.uid);
      const profileData = {
        uid: authResult.user.uid,
        name,
        email: normalizedEmail,
        phone,
        role,
      };
      await setDoc(userRef, profileData);
      return {
        id: authResult.user.uid,
        name,
        email: normalizedEmail,
        phone,
        role,
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${normalizedEmail}`);
    }
  }

  // Fallback storage signup
  const users = getLocalUsers();
  if (users[normalizedEmail]) {
    throw new Error('Este e-mail já está cadastrado em nossa barbearia.');
  }

  const generatedUid = `uid-${Date.now()}`;
  users[normalizedEmail] = {
    uid: generatedUid,
    name,
    email: normalizedEmail,
    phone,
    password: pass,
    role,
  };

  saveLocalUsers(users);
  return {
    id: generatedUid,
    name,
    email: normalizedEmail,
    phone,
    role,
  };
}

export async function dbGetAppointments(userEmail: string, userId: string): Promise<Appointment[]> {
  const normalizedEmail = userEmail.trim().toLowerCase();

  if (isFirebaseConfigured) {
    try {
      const q = query(collection(db, 'appointments'), where('userId', '==', userId));
      const querySnap = await getDocs(q);
      const list: Appointment[] = [];
      querySnap.forEach((docSnap) => {
        const d = docSnap.data();
        list.push({
          id: docSnap.id,
          userId: d.userId,
          date: d.date,
          time: d.time,
          status: d.status,
          barber: {
            id: 'shop_barber',
            name: d.barberName || 'Barbearia Principal',
            role: 'Atendimento do Estabelecimento',
            avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=256&auto=format&fit=crop',
            rating: 4.9,
            availableTimes: [],
          },
          service: {
            id: 'srv',
            name: d.serviceName,
            price: d.price,
            duration: 30,
            description: d.notes || '',
          }
        });
      });
      return list;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'appointments');
    }
  }

  // Local storage query enforcer mimicking securely matching the logged user's appointments
  const allAppointments = getLocalAppointments();
  return allAppointments.filter(ap => ap.userEmail?.toLowerCase() === normalizedEmail || ap.userId === userId);
}

export async function dbCreateAppointment(
  user: User, 
  barber: Barber, 
  serviceName: string, 
  price: number, 
  date: string, 
  time: string, 
  notes: string
): Promise<Appointment> {
  const id = `ap-${Date.now()}`;
  
  if (isFirebaseConfigured) {
    try {
      const appRef = doc(db, 'appointments', id);
      const appPayload = {
        id,
        userId: user.id,
        barberName: barber.name,
        serviceName,
        price,
        date,
        time,
        status: 'scheduled',
        notes: notes || '',
        createdAt: new Date().toISOString(),
      };
      await setDoc(appRef, appPayload);
      
      return {
        id,
        userId: user.id,
        userEmail: user.email,
        barber,
        service: {
          id: `srv-${id}`,
          name: serviceName,
          price,
          duration: 30,
          description: notes,
        },
        date,
        time,
        status: 'scheduled'
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `appointments/${id}`);
    }
  }

  // Local storage secure insertion
  const appointments = getLocalAppointments();
  const scheduleObj: Appointment = {
    id,
    userId: user.id,
    userEmail: user.email,
    barber,
    service: {
      id: `srv-${id}`,
      name: serviceName,
      price,
      duration: 30,
      description: notes
    },
    date,
    time,
    status: 'scheduled'
  };

  const updatedSnap = [scheduleObj, ...appointments];
  saveLocalAppointments(updatedSnap);
  return scheduleObj;
}

export async function dbCancelAppointment(appointmentId: string): Promise<boolean> {
  if (isFirebaseConfigured) {
    try {
      const docRef = doc(db, 'appointments', appointmentId);
      await updateDoc(docRef, { status: 'canceled' });
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `appointments/${appointmentId}`);
    }
  }

  // Local storage state update
  const appointments = getLocalAppointments();
  const index = appointments.findIndex(ap => ap.id === appointmentId);
  if (index !== -1) {
    appointments[index].status = 'canceled';
    saveLocalAppointments(appointments);
    return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// SAAS PORTAL AND TENANT MANAGEMENT APIs (FOR TACTICAL DEMOS)
// ---------------------------------------------------------------------------

const LOCAL_SAAS_CONFIG_KEY = 'barber_saas_tenant_config';
const LOCAL_SAAS_FEEDBACKS_KEY = 'barber_saas_feedbacks';

const DEFAULT_CONFIG: TenantConfig = {
  id: 'primary',
  barbershopName: 'BarberSpace',
  phone: '(11) 98765-4321',
  address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
  tagline: 'Agende seu horário com simplicidade. Escolha o dia, os serviços desejados de forma rápida e prática!',
  accentColor: 'amber',
  openHours: 'Quarta à Sábado, das 08h às 18h',
};

import { TenantConfig, SaaSFeedback } from '../types';

export async function dbGetSaaSTenantConfig(): Promise<TenantConfig> {
  if (isFirebaseConfigured) {
    try {
      const docSnap = await getDoc(doc(db, 'saas_config', 'primary'));
      if (docSnap.exists()) {
        return docSnap.data() as TenantConfig;
      }
    } catch (e) {
      console.warn('Could not read saas_config from Firestore. Fallback to local.', e);
    }
  }

  try {
    const raw = localStorage.getItem(LOCAL_SAAS_CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }

  // Pre-populate so immediate client custom names can be demonstrated
  return DEFAULT_CONFIG;
}

export async function dbSaveSaaSTenantConfig(config: TenantConfig): Promise<boolean> {
  if (isFirebaseConfigured) {
    try {
      await setDoc(doc(db, 'saas_config', 'primary'), config);
    } catch (e) {
      console.warn('Could not save saas_config to Firestore. Saving to local storage only.', e);
    }
  }

  try {
    localStorage.setItem(LOCAL_SAAS_CONFIG_KEY, JSON.stringify(config));
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

export async function dbGetSaaSFeedbacks(): Promise<SaaSFeedback[]> {
  if (isFirebaseConfigured) {
    try {
      const querySnap = await getDocs(collection(db, 'saas_feedbacks'));
      const list: SaaSFeedback[] = [];
      querySnap.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as SaaSFeedback);
      });
      if (list.length > 0) return list;
    } catch (e) {
      console.warn('Could not read saas_feedbacks from Firestore. Fallback to local.', e);
    }
  }

  try {
    const raw = localStorage.getItem(LOCAL_SAAS_FEEDBACKS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }

  // Default prefilled feedbacks so the app is populated on startup
  return [
    {
      id: 'fb-demo-1',
      userEmail: 'robertucruiz@gmail.com',
      rating: 5,
      likedMost: 'Excelente design escuro com dourado! O switcher de visão do cliente e painel administrativo ajuda muito a demonstrar a proposta de SaaS para os donos de barbearia.',
      missingFeatures: 'Módulo financeiro integrado para rastreamento de despesas mensais e cálculo de comissão de barbeiros parceiros.',
      createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    },
    {
      id: 'fb-demo-2',
      userEmail: 'parceiro_barba_bruta@outlook.com',
      rating: 4,
      likedMost: 'A flexibilidade de mudar o nome e cor da marca em tempo real. Eu pude ver meu logotipo e nome "Barba Bruta" em 2 segundos.',
      missingFeatures: 'Envio de aviso automático de lembrete pelo WhatsApp para diminuir a taxa de "no-show" dos clientes esquecidos.',
      createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    }
  ];
}

export async function dbCreateSaaSFeedback(
  userEmail: string,
  rating: number,
  likedMost: string,
  missingFeatures: string
): Promise<SaaSFeedback> {
  const id = `fb-${Date.now()}`;
  const feedbackData: SaaSFeedback = {
    id,
    userEmail,
    rating,
    likedMost,
    missingFeatures,
    createdAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured) {
    try {
      await setDoc(doc(db, 'saas_feedbacks', id), feedbackData);
    } catch (e) {
      console.warn('Could not save saas_feedback to Firestore. Saving to local storage.', e);
    }
  }

  // Save to local storage
  try {
    const list = await dbGetSaaSFeedbacks();
    const updated = [feedbackData, ...list.filter(f => !f.id.startsWith('fb-demo-'))];
    localStorage.setItem(LOCAL_SAAS_FEEDBACKS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error(e);
  }

  return feedbackData;
}

export async function dbGetAllAppointments(): Promise<Appointment[]> {
  if (isFirebaseConfigured) {
    try {
      const snap = await getDocs(collection(db, 'appointments'));
      const list: Appointment[] = [];
      snap.forEach((docSnap) => {
        const d = docSnap.data();
        list.push({
          id: docSnap.id,
          userId: d.userId,
          userEmail: d.userEmail || d.userId || 'cliente@exemplo.com',
          date: d.date,
          time: d.time,
          status: d.status,
          barber: {
            id: 'shop_barber',
            name: d.barberName || 'Barbearia Principal',
            role: 'Atendimento do Estabelecimento',
            avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=256&auto=format&fit=crop',
            rating: 4.9,
            availableTimes: [],
          },
          service: {
            id: 'srv',
            name: d.serviceName,
            price: d.price,
            duration: 30,
            description: d.notes || '',
          }
        });
      });
      if (list.length > 0) return list;
    } catch (e) {
      console.warn('Firestore load failed for master list.', e);
    }
  }

  return getLocalAppointments();
}

export async function dbUpdateAppointmentStatus(appointmentId: string, status: 'scheduled' | 'finished' | 'canceled'): Promise<boolean> {
  if (isFirebaseConfigured) {
    try {
      const docRef = doc(db, 'appointments', appointmentId);
      await updateDoc(docRef, { status });
      return true;
    } catch (e) {
      console.warn('Firestore update status failed.', e);
    }
  }

  const list = getLocalAppointments();
  const index = list.findIndex(ap => ap.id === appointmentId);
  if (index !== -1) {
    list[index].status = status;
    saveLocalAppointments(list);
    return true;
  }
  return false;
}
