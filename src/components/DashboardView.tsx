/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Calendar, Clock, LogOut, Scissors, Plus, CheckCircle, 
  MapPin, Star, Sparkles, ChevronRight, BookOpen, Clock3, AlertCircle, ArrowLeft, Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Barber, Service, Appointment, TenantConfig } from '../types';
import barberBg from '../assets/images/barber_bg_1780788337245.png';
import { 
  dbGetAppointments, 
  dbCreateAppointment, 
  dbCancelAppointment,
  dbGetSaaSTenantConfig
} from '../lib/firebase';
import SaaSPartnerView from './SaaSPartnerView';

interface DashboardViewProps {
  user: User;
  onLogout: () => void;
}

const DEFAULT_BARBER: Barber = {
  id: 'shop_barber',
  name: 'Barbearia Principal',
  role: 'Atendimento do Estabelecimento',
  avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=256&auto=format&fit=crop',
  rating: 4.9,
  availableTimes: ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
};

const DEFAULT_SERVICE: Service = {
  id: 'general_service',
  name: 'Cabelo',
  price: 35.00,
  duration: 40,
  description: 'Atendimento de cabelo clássico ou degradê.',
};

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'ap1',
    barber: DEFAULT_BARBER,
    service: {
      id: 's1',
      name: 'Cabelo + Barba',
      price: 55.00,
      duration: 50,
      description: 'Cliente reservou horário para Corte e Barba.',
    },
    date: '2026-06-10',
    time: '14:00',
    status: 'scheduled',
  },
  {
    id: 'ap2',
    barber: DEFAULT_BARBER,
    service: {
      id: 's2',
      name: 'Apenas Cabelo',
      price: 35.00,
      duration: 30,
      description: 'Corte de cabelo simples',
    },
    date: '2026-05-24',
    time: '15:30',
    status: 'finished',
  },
];

export default function DashboardView({ user, onLogout }: DashboardViewProps) {
  const todayStr = React.useMemo(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  }, []);
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isDbLoading, setIsDbLoading] = useState(true);

  const [tenantConfig, setTenantConfig] = useState<TenantConfig>({
    id: 'primary',
    barbershopName: 'BarberSpace',
    phone: '(11) 98765-4321',
    address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
    tagline: 'Agende seu horário com simplicidade. Escolha o dia, os serviços desejados através da nossa plataforma e garanta sua vaga diretamente na barbearia de forma rápida.',
    accentColor: 'amber',
    openHours: 'Quarta à Sábado, das 08h às 18h',
  });

  const loadTenantConfig = () => {
    dbGetSaaSTenantConfig()
      .then((data) => {
        setTenantConfig(data);
      })
      .catch((e) => console.error('Error fetching tenant config:', e));
  };

  React.useEffect(() => {
    loadTenantConfig();
  }, []);

  React.useEffect(() => {
    setIsDbLoading(true);
    dbGetAppointments(user.email, user.id || '')
      .then((data) => {
        setAppointments(data);
        setIsDbLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching appointments:', err);
        setIsDbLoading(false);
      });
  }, [user]);

  const [activeTab, setActiveTab] = useState<'my-bookings' | 'new-booking' | 'saas-panel'>(() => {
    return user.role === 'owner' ? 'saas-panel' : 'new-booking';
  });
  const [simulatedRole, setSimulatedRole] = useState<'client' | 'owner'>(() => {
    return user.role || 'client';
  });

  React.useEffect(() => {
    // If a regular user tries to navigate to saas-panel or set role to owner, force client mode
    if (user.role !== 'owner') {
      if (simulatedRole !== 'client') {
        setSimulatedRole('client');
      }
      if (activeTab === 'saas-panel') {
        setActiveTab('new-booking');
      }
    } else {
      if (simulatedRole === 'client' && activeTab === 'saas-panel') {
        setActiveTab('new-booking');
      }
    }
  }, [simulatedRole, activeTab, user.role]);

  const getThemeClasses = () => {
    switch (tenantConfig.accentColor) {
      case 'emerald':
        return {
          bg: 'bg-emerald-600',
          hoverBg: 'hover:bg-emerald-700',
          solidBg: 'bg-emerald-600',
          text: 'text-emerald-500',
          lightBg: 'bg-emerald-550/10',
          border: 'border-emerald-600/30',
          shadow: 'shadow-emerald-600/20',
          btnSelected: 'bg-emerald-600 text-white border-emerald-650',
          textHover: 'hover:text-emerald-400',
          badgeText: 'text-emerald-500',
          accentText: 'text-emerald-400',
          bannerBg: 'bg-emerald-600/10 text-emerald-500 border-emerald-500/20',
          headerBg: 'bg-emerald-600',
          cardGradient: 'from-emerald-600 to-emerald-800',
        };
      case 'crimson':
        return {
          bg: 'bg-rose-600',
          hoverBg: 'hover:bg-rose-700',
          solidBg: 'bg-rose-600',
          text: 'text-rose-500',
          lightBg: 'bg-rose-550/10',
          border: 'border-rose-600/30',
          shadow: 'shadow-rose-600/20',
          btnSelected: 'bg-rose-600 text-white border-rose-650',
          textHover: 'hover:text-rose-400',
          badgeText: 'text-rose-500',
          accentText: 'text-rose-400',
          bannerBg: 'bg-rose-600/10 text-rose-500 border-rose-500/20',
          headerBg: 'bg-rose-600',
          cardGradient: 'from-rose-600 to-rose-850',
        };
      case 'indigo':
        return {
          bg: 'bg-indigo-600',
          hoverBg: 'hover:bg-indigo-700',
          solidBg: 'bg-indigo-600',
          text: 'text-indigo-500',
          lightBg: 'bg-indigo-550/10',
          border: 'border-indigo-600/30',
          shadow: 'shadow-indigo-600/20',
          btnSelected: 'bg-indigo-600 text-white border-indigo-650',
          textHover: 'hover:text-indigo-400',
          badgeText: 'text-indigo-500',
          accentText: 'text-indigo-400',
          bannerBg: 'bg-indigo-600/10 text-indigo-500 border-indigo-500/20',
          headerBg: 'bg-indigo-600',
          cardGradient: 'from-indigo-600 to-indigo-850',
        };
      case 'slate':
        return {
          bg: 'bg-slate-755',
          hoverBg: 'hover:bg-slate-800',
          solidBg: 'bg-slate-700',
          text: 'text-slate-400',
          lightBg: 'bg-slate-550/10',
          border: 'border-slate-600/30',
          shadow: 'shadow-slate-600/20',
          btnSelected: 'bg-slate-700 text-white border-slate-650',
          textHover: 'hover:text-slate-300',
          badgeText: 'text-slate-400',
          accentText: 'text-slate-300',
          bannerBg: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
          headerBg: 'bg-slate-100',
          cardGradient: 'from-slate-700 to-slate-900',
        };
      case 'amber':
      default:
        return {
          bg: 'bg-amber-600',
          hoverBg: 'hover:bg-amber-700',
          solidBg: 'bg-amber-600',
          text: 'text-amber-500',
          lightBg: 'bg-amber-550/10',
          border: 'border-amber-600/30',
          shadow: 'shadow-amber-600/20',
          btnSelected: 'bg-amber-600 text-white border-amber-655',
          textHover: 'hover:text-amber-400',
          badgeText: 'text-amber-500',
          accentText: 'text-amber-400',
          bannerBg: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
          headerBg: 'bg-amber-600',
          cardGradient: 'from-[#d97706] to-[#b45309]',
        };
    }
  };
  const theme = getThemeClasses();
  
  // Custom simple neighborhood shop options
  const [wantHair, setWantHair] = useState(true);
  const [wantBeard, setWantBeard] = useState(false);
  const [wantSobrancelha, setWantSobrancelha] = useState(false);
  const [customInstructions, setCustomInstructions] = useState('');
  
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const getSelectedTotal = () => {
    if (wantHair && wantBeard && wantSobrancelha) return 65;
    if (wantHair && wantBeard) return 55;
    if (wantHair && wantSobrancelha) return 45;
    if (wantBeard && wantSobrancelha) return 35;
    if (wantHair) return 35;
    if (wantBeard) return 25;
    if (wantSobrancelha) return 15;
    return 0;
  };

  const getSelectedNames = () => {
    const parts: string[] = [];
    if (wantHair) parts.push('Cabelo');
    if (wantBeard) parts.push('Barba');
    if (wantSobrancelha) parts.push('Sobrancelha');
    if (parts.length === 0) return 'Geral';
    return parts.join(' + ');
  };

  const getAvailableTimesForDate = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    const isToday = selectedDate === todayStr;

    return DEFAULT_BARBER.availableTimes.filter(t => {
      if (!isToday) return true;
      const [hourStr, minStr] = t.split(':');
      const timeHour = parseInt(hourStr, 10);
      const timeMin = parseInt(minStr || '0', 10);
      
      if (timeHour > currentHour) return true;
      if (timeHour === currentHour && timeMin > currentMinute) return true;
      return false;
    });
  };

  const availableTimes = getAvailableTimesForDate();

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) return;

    const calculatedPrice = getSelectedTotal();
    const serviceName = getSelectedNames();
    
    setIsDbLoading(true);

    dbCreateAppointment(
      user,
      DEFAULT_BARBER,
      serviceName,
      calculatedPrice,
      selectedDate,
      selectedTime,
      customInstructions
    )
      .then((newAppointment) => {
        setAppointments([newAppointment, ...appointments]);
        setBookingSuccess(true);
        setIsDbLoading(false);
        
        // Reset inputs
        setSelectedTime('');
        setCustomInstructions('');

        setTimeout(() => {
          setBookingSuccess(false);
          setActiveTab('my-bookings');
        }, 2500);
      })
      .catch((err) => {
        console.error('Error creating booking:', err);
        setIsDbLoading(false);
      });
  };

  const handleCancelAppointment = (id: string) => {
    dbCancelAppointment(id)
      .then(() => {
        setAppointments(
          appointments.map((ap) => (ap.id === id ? { ...ap, status: 'canceled' as const } : ap))
        );
      })
      .catch((err) => {
        console.error('Error canceling booking:', err);
      });
  };

  const activeAppointments = appointments.filter((ap) => ap.status === 'scheduled');
  const pastAppointments = appointments.filter((ap) => ap.status !== 'scheduled');

  return (
    <div className="w-full min-h-screen bg-[#050811] text-white flex flex-col font-sans relative overflow-x-hidden">

      {/* Immersive Barber Background Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src={barberBg}
          alt="Barbershop Atmosphere"
          className="w-full h-full object-cover scale-105 opacity-15 blur-[3px] transform-gpu"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050811] via-[#050811]/95 to-transparent"></div>
      </div>

      {/* Header element */}
      <header className="bg-brand-card/90 border-b border-gray-800/80 sticky top-0 z-20 backdrop-blur-md" id="dashboard-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${theme.bg} rounded-lg flex items-center justify-center font-display font-bold text-lg text-white shadow-md ${theme.shadow}`}>
              {tenantConfig.barbershopName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <span className="font-display font-bold text-xl tracking-wide block">{tenantConfig.barbershopName}</span>
              <span className={`text-[10px] ${theme.text} uppercase tracking-widest font-semibold flex items-center gap-1`}>
                <Sparkles className="w-3 h-3 animate-pulse" /> Clube do Membro
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <span className="text-xs text-gray-400 block font-medium">Bem-vindo,</span>
              <span className="text-sm font-bold text-gray-100">{user.name}</span>
            </div>
            
            <button
              onClick={onLogout}
              id="logout-btn"
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-red-950 hover:text-red-300 text-gray-300 rounded-lg text-xs font-semibold border border-transparent hover:border-red-900/40 transition-all cursor-pointer"
              title="Sair da Conta"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Cover section */}
      <section className="relative z-10 bg-gradient-to-b from-brand-card/90 to-brand-dark py-10 px-4 border-b border-gray-900" id="membership-hero">
        <div className="max-w-4xl mx-auto w-full">
          {/* Welcome section */}
          <div className="space-y-3.5 text-center flex flex-col items-center">
            <div className={`inline-flex items-center gap-1.5 ${theme.bannerBg} px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider`}>
              <Scissors className="w-3.5 h-3.5" />
              <span>{user.role === 'owner' ? 'Painel de Controle' : 'Agendamento Simples'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-white m-0">
              {user.role === 'owner'
                ? `Olá, ${user.name.split(' ')[0]}! Bem-vindo de volta.`
                : `Fala, ${user.name.split(' ')[0]}! Tudo pronto para dar aquele tapa no visual?`
              }
            </h1>
            <p className="text-sm text-gray-400 leading-relaxed max-w-2xl font-medium m-0">
              {user.role === 'owner'
                ? 'Gerencie a fila de clientes agendados e acompanhe o fluxo da barbearia.'
                : tenantConfig.tagline
              }
            </p>
          </div>
        </div>
      </section>

      {/* Main body */}
      <main className="relative z-10 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 flex-1 flex flex-col">
        {/* Navigation Tabs (Only shown to clients) */}
        {user.role !== 'owner' && (
          <div className="flex flex-col md:flex-row gap-2 md:gap-0 border-b border-gray-800 mb-8 p-1 bg-brand-card/50 rounded-xl" id="dashboard-tabs">
            <button
              onClick={() => setActiveTab('my-bookings')}
              className={`flex-1 py-3 text-center rounded-lg font-semibold text-sm transition-all cursor-pointer flex justify-center items-center gap-2 ${
                activeTab === 'my-bookings'
                  ? `${theme.bg} text-white shadow-md ${theme.shadow}`
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Clock3 className="w-4 h-4" />
              <span>Meus Agendamentos</span>
            </button>
            <button
              onClick={() => setActiveTab('new-booking')}
              className={`flex-1 py-3 text-center rounded-lg font-semibold text-sm transition-all cursor-pointer flex justify-center items-center gap-2 ${
                activeTab === 'new-booking'
                  ? `${theme.bg} text-white shadow-md ${theme.shadow}`
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Novo Agendamento</span>
            </button>
          </div>
        )}

        {/* Tab content area */}
        <div className="flex-1">
          {bookingSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-950/40 border border-green-500/20 text-green-300 p-4 rounded-xl flex items-center gap-3 mb-6"
            >
              <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
              <div>
                <span className="font-bold block">Sucesso!</span>
                <span className="text-xs">Seu agendamento foi marcado com sucesso e já está integrado à agenda do barbeiro.</span>
              </div>
            </motion.div>
          )}

          {user.role === 'owner' ? (
            <SaaSPartnerView userEmail={user.email} onConfigChanged={loadTenantConfig} />
          ) : activeTab === 'my-bookings' ? (
            <div className="space-y-6">
              {/* Scheduled bookings */}
              <div>
                <h3 className="text-lg font-bold font-display text-gray-100 flex items-center gap-2 mb-4">
                  <span>Próximos agendamentos</span>
                  <span className="px-2 py-0.5 bg-amber-600/10 text-amber-500 text-xs rounded-full font-bold">
                    {activeAppointments.length}
                  </span>
                </h3>

                {activeAppointments.length === 0 ? (
                  <div className="border border-dashed border-gray-800 rounded-xl p-8 text-center space-y-4 bg-brand-card/25">
                    <Calendar className="w-10 h-10 text-gray-600 mx-auto" />
                    <div>
                      <p className="text-sm font-semibold text-gray-400">Você não possui nenhum agendamento pendente.</p>
                      <p className="text-xs text-gray-500 mt-1">Clique para agendar e renovar seu visual!</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('new-booking')}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-all"
                    >
                      Agendar Agora
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {activeAppointments.map((ap) => (
                      <motion.div
                        key={ap.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-brand-card border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-505/20 flex items-center justify-center text-amber-500 shrink-0">
                            <Scissors className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-xs px-2 py-0.5 bg-amber-500/15 text-amber-500 rounded-md font-bold inline-block mb-1">
                              {ap.service.name}
                            </span>
                            <h4 className="font-bold text-sm text-gray-100">Horário Agendado</h4>
                            <p className="text-xs text-gray-400 mt-1 flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                                {ap.date.split('-').reverse().join('/')}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-amber-500" />
                                {ap.time} h
                              </span>
                            </p>
                            {ap.service.description && ap.service.description !== 'Atendimento sob agendamento simples.' && (
                              <p className="text-[11px] text-gray-400 mt-2 italic bg-gray-900/60 p-2.5 rounded-lg border border-gray-800/50">
                                Obs: {ap.service.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 border-gray-800/80 pt-3 sm:pt-0">
                          <span className="text-lg font-bold font-display text-white">
                            R$ {ap.service.price.toFixed(2).replace('.', ',')}
                          </span>
                          <button
                            onClick={() => handleCancelAppointment(ap.id)}
                            className="text-xs font-semibold text-red-500 hover:text-red-400 hover:underline transition-colors mt-1 focus:outline-none cursor-pointer"
                          >
                            Desmarcar horário
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* History bookings */}
              <div className="pt-4">
                <h3 className="text-lg font-bold font-display text-gray-400 flex items-center gap-2 mb-4">
                  <span>Histórico de visitas</span>
                </h3>

                {pastAppointments.length === 0 ? (
                  <p className="text-xs text-gray-500">Seu histórico de visitas aparecerá aqui após o término das primeiras sessões.</p>
                ) : (
                  <div className="bg-brand-card/50 border border-gray-900 rounded-xl divide-y divide-gray-800/80">
                    {pastAppointments.map((ap) => (
                      <div key={ap.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm text-gray-400">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-900 rounded-lg text-gray-500">
                            <Scissors className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-semibold text-gray-300 block">{ap.service.name}</span>
                            <span className="text-xs text-gray-500 block mt-0.5">Visita à Barbearia • {ap.date.split('-').reverse().join('/')}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-gray-900/40 text-gray-400 border border-gray-800">
                            {ap.status === 'finished' ? 'Finalizado' : 'Cancelado'}
                          </span>
                          <span className="font-bold text-gray-300">
                            R$ {ap.service.price.toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full max-w-5xl rounded-3xl bg-brand-card shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-gray-800/60 overflow-hidden flex flex-col md:flex-row min-h-[600px] mx-auto" id="scheduler-split-card">
              
              {/* Left Column: Cozy chalkboard style matching screenshot */}
              <div className={`md:w-5/12 bg-gradient-to-br ${theme.cardGradient} p-8 sm:p-10 flex flex-col justify-between text-white relative overflow-hidden select-none shrink-0 min-h-[300px]`}>
                {/* Subtle vintage overlay grid pattern */}
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
                
                <div className="space-y-6 relative z-10 flex flex-col items-center text-center">
                  {/* Scissors Icon circle decoration */}
                  <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg transform hover:rotate-12 transition-transform duration-300">
                    <Scissors className="w-8 h-8 text-white" />
                  </div>

                  {/* Brand header */}
                  <div className="space-y-1">
                    <h2 className="text-3xl font-extrabold tracking-tight font-display text-white">
                      {tenantConfig.barbershopName}
                    </h2>
                    <div className="w-14 h-1 bg-white/50 rounded-full mx-auto"></div>
                  </div>

                  {/* Promotion text */}
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold font-display leading-tight">
                      Agende seu horário
                    </h3>
                    <p className="text-sm text-white/90 leading-relaxed max-w-xs mx-auto text-center">
                      Escolha a data, os serviços desejados de forma direta e garanta sua vaga rapidamente!
                    </p>
                  </div>
                </div>

                {/* Chalkboard pricing card + hours info strictly matching neighborhood styles */}
                <div className="space-y-4 mt-8 md:mt-0 relative z-10">
                  <div className="bg-black/20 border border-white/10 p-5 rounded-2xl space-y-3 shadow-inner">
                    <span className="text-[10px] uppercase font-bold text-amber-200 tracking-widest block text-center">Tabela de Valores</span>
                    <div className="space-y-2 text-xs text-white/90 font-mono">
                      <div className="flex justify-between border-b border-white/5 pb-1.5">
                        <span>💇‍♂️ Cabelo (Corte/Social)</span>
                        <span className="font-bold text-white">R$ 35,00</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1.5">
                        <span>🧔 Barba Navalhada</span>
                        <span className="font-bold text-white">R$ 25,00</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1.5">
                        <span>✂️ Sobrancelha</span>
                        <span className="font-bold text-white">R$ 15,00</span>
                      </div>
                      <div className="flex justify-between pt-1 text-amber-200">
                        <span>⚡ Combo Cabelo + Barba</span>
                        <span className="font-bold text-white">R$ 55,00</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/15 p-3.5 rounded-xl justify-center text-center">
                    <Clock className="w-4 h-4 text-white" />
                    <div>
                      <span className="text-[9px] uppercase font-bold text-amber-200 tracking-widest block">Atendimento</span>
                      <span className="text-xs font-bold text-white block mt-0.5">{tenantConfig.openHours}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Clean premium white dashboard sheet for user input and timeslots */}
              <div className="md:w-7/12 bg-white text-gray-900 p-6 sm:p-8 flex flex-col justify-between relative min-h-[450px]">
                
                {/* Form dynamic wrapper */}
                <div className="space-y-5 flex-1">
                  
                  {/* Heading */}
                  <div className="text-center flex flex-col items-center">
                    <h2 className="text-2xl font-bold font-display tracking-tight text-gray-950">
                      Seu Agendamento
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5 text-center">
                      Configure os serviços e selecione o período desejado
                    </p>
                  </div>

                  <form onSubmit={handleCreateAppointment} className="space-y-4">
                    
                    {/* Multi-select interactive custom services chips */}
                    <div className="space-y-2 text-center flex flex-col items-center">
                      <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block">
                        O que você pretende fazer?
                      </label>
                      <div className="flex flex-wrap gap-2.5 justify-center">
                        <button
                          type="button"
                          onClick={() => setWantHair(!wantHair)}
                          className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all flex items-center gap-2 cursor-pointer ${
                            wantHair 
                              ? `${theme.bg} text-white border-transparent shadow-md ${theme.shadow}` 
                              : 'bg-slate-50 text-gray-600 border-gray-200 hover:bg-slate-100/80 hover:border-gray-300'
                          }`}
                        >
                          <span>💇‍♂️</span> Cabelo
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => setWantBeard(!wantBeard)}
                          className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all flex items-center gap-2 cursor-pointer ${
                            wantBeard 
                              ? `${theme.bg} text-white border-transparent shadow-md ${theme.shadow}` 
                              : 'bg-slate-50 text-gray-600 border-gray-200 hover:bg-slate-100/80 hover:border-gray-300'
                          }`}
                        >
                          <span>🧔</span> Barba
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => setWantSobrancelha(!wantSobrancelha)}
                          className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all flex items-center gap-2 cursor-pointer ${
                            wantSobrancelha 
                              ? `${theme.bg} text-white border-transparent shadow-md ${theme.shadow}` 
                              : 'bg-slate-50 text-gray-600 border-gray-200 hover:bg-slate-100/80 hover:border-gray-300'
                          }`}
                        >
                          <span>✂️</span> Sobrancelha
                        </button>
                      </div>
                    </div>

                    {/* Observações text input */}
                    <div className="space-y-1.5 text-center flex flex-col items-center">
                      <label htmlFor="custom-instructions" className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block">
                        Observações / Detalhes (Opcional)
                      </label>
                      <input
                        id="custom-instructions"
                        type="text"
                        placeholder="Ex: Risco na sobrancelha, degradê navalhado..."
                        value={customInstructions}
                        onChange={(e) => setCustomInstructions(e.target.value)}
                        className="w-full bg-slate-50 text-gray-800 border border-gray-200 rounded-lg py-2.5 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold text-center"
                      />
                    </div>

                    {/* Date field exactly like layout */}
                    <div className="space-y-1.5 text-center flex flex-col items-center">
                      <label htmlFor="booking-date" className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block">
                        Data do Agendamento
                      </label>
                      <input
                        id="booking-date"
                        type="date"
                        min={todayStr}
                        value={selectedDate}
                        onChange={(e) => {
                          setSelectedDate(e.target.value);
                          setSelectedTime('');
                        }}
                        required
                        className="w-full bg-white text-gray-800 border border-gray-200 rounded-lg py-2.5 px-3.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent cursor-pointer text-center"
                      />
                    </div>

                    {/* Available timeslots section with dynamic count */}
                    <div className="space-y-2 text-center flex flex-col items-center">
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block">
                          Horários Disponíveis
                        </span>
                        <span className="text-xs text-amber-600 font-bold bg-amber-50 border border-amber-100 rounded-full py-0.5 px-2.5 block">
                          {selectedDate ? (availableTimes.length > 0 ? `${availableTimes.length} disponíveis` : 'Nenhum horário livre') : 'Selecione uma data'}
                        </span>
                      </div>

                      {!selectedDate ? (
                        <p className="text-xs text-gray-400 italic p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center">
                          Selecione o dia acima para checar os horários disponíveis.
                        </p>
                      ) : availableTimes.length === 0 ? (
                        <p className="text-xs text-gray-400 italic p-4 bg-red-50 text-red-600 rounded-xl border border-dashed border-red-200 text-center">
                          Infelizmente não há mais horários disponíveis para hoje.
                        </p>
                      ) : (
                        /* Scroll wrapper with 3 cols exactly like mock grid */
                        <div className="grid grid-cols-3 gap-2.5 max-h-[150px] overflow-y-auto pr-1">
                          {availableTimes.map((t) => {
                            const isSelected = selectedTime === t;
                            return (
                              <button
                                key={t}
                                type="button"
                                onClick={() => setSelectedTime(t)}
                                className={`py-2 px-1 text-center rounded-xl border transition-all flex flex-col items-center justify-center relative cursor-pointer ${
                                  isSelected
                                    ? 'border-amber-600 bg-amber-600 text-white shadow-md shadow-amber-600/10'
                                    : 'border-amber-500/20 bg-amber-50/50 hover:bg-amber-100/60 hover:border-amber-400/40 text-amber-800'
                                }`}
                              >
                                <span className="text-sm font-extrabold">{t}</span>
                                <span className={`text-[9px] block mt-0.5 font-bold uppercase tracking-widest ${isSelected ? 'text-amber-100/95' : 'text-amber-600/70'}`}>
                                  {isSelected ? 'Selecionado' : 'Disponível'}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Yellow Alert 'Como funciona' Card matching layout */}
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-900 text-xs shadow-sm">
                      <div className="flex items-center gap-1.5 font-bold mb-1.5 text-amber-950">
                        <CheckCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Como funciona?</span>
                      </div>
                      <ul className="space-y-0.5 list-disc pl-4 text-amber-900/90 font-medium">
                        <li>Selecione os serviços adequados do dia</li>
                        <li>Escolha um horário livre</li>
                        <li>Confirme seu agendamento e o valor correspondente</li>
                        <li>Pague diretamente no estabelecimento após ser atendido</li>
                      </ul>
                    </div>

                    {/* Interactive summarized total to confirm details before action */}
                    {selectedDate && selectedTime && (wantHair || wantBeard || wantSobrancelha) && (
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between text-xs animate-fadeIn">
                        <div>
                          <span className="text-gray-400 font-medium text-left block">Reserva marcada:</span>
                          <span className="font-bold text-gray-800 block text-left">
                            {selectedDate.split('-').reverse().join('/')} às {selectedTime}h ({getSelectedNames()})
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-gray-400 block font-medium">Preço Estimado:</span>
                          <span className="font-extrabold text-sm text-[#10b981]">R$ {getSelectedTotal().toFixed(2).replace('.', ',')}</span>
                        </div>
                      </div>
                    )}

                    {/* Form Buttons navigation block */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={!selectedDate || !selectedTime || (!wantHair && !wantBeard && !wantSobrancelha)}
                        className="w-full py-4 px-4 bg-[#10b981] hover:bg-[#059669] disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-500/10 cursor-pointer active:scale-98"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Confirmar Agendamento</span>
                      </button>
                    </div>

                  </form>
                </div>
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}
