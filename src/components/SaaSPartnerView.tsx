/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Building2, Phone, MapPin, Sparkles, Check, ChevronRight, 
  Clock, Award, Star, MessageSquareCode, Trash, CalendarRange, 
  TrendingUp, Users, RefreshCw, Layers, Paintbrush
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TenantConfig, SaaSFeedback, Appointment } from '../types';
import { 
  dbGetSaaSTenantConfig, 
  dbSaveSaaSTenantConfig, 
  dbGetSaaSFeedbacks, 
  dbCreateSaaSFeedback, 
  dbGetAllAppointments, 
  dbUpdateAppointmentStatus 
} from '../lib/firebase';

interface SaaSPartnerViewProps {
  userEmail: string;
  onConfigChanged: () => void;
}

export default function SaaSPartnerView({ userEmail, onConfigChanged }: SaaSPartnerViewProps) {
  // Config state
  const [config, setConfig] = useState<TenantConfig>({
    id: 'primary',
    barbershopName: 'BarberSpace',
    phone: '(11) 98765-4321',
    address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
    tagline: 'Agende seu horário com simplicidade. Escolha o dia, os serviços desejados de forma rápida e prática!',
    accentColor: 'amber',
    openHours: 'Quarta à Sábado, das 08h às 18h',
  });
  
  // Feedback states
  const [feedbacks, setFeedbacks] = useState<SaaSFeedback[]>([]);
  const [rating, setRating] = useState<number>(5);
  const [likedMost, setLikedMost] = useState<string>('');
  const [missingFeatures, setMissingFeatures] = useState<string>('');
  const [feedbackSuccess, setFeedbackSuccess] = useState<boolean>(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState<boolean>(false);

  // Appointments master states
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState<boolean>(true);
  const [isSavingConfig, setIsSavingConfig] = useState<boolean>(false);
  const [configSuccess, setConfigSuccess] = useState<boolean>(false);

  // Fetch initial data
  useEffect(() => {
    // 1. Get configuration
    dbGetSaaSTenantConfig().then((data) => {
      setConfig(data);
    });

    // 2. Get feedbacks
    dbGetSaaSFeedbacks().then((data) => {
      setFeedbacks(data);
    });

    // 3. Get master appointments
    fetchAppointments();
  }, []);

  const fetchAppointments = () => {
    setIsLoadingAppointments(true);
    dbGetAllAppointments()
      .then((data) => {
        setAllAppointments(data);
        setIsLoadingAppointments(false);
      })
      .catch((err) => {
        console.error('Error fetching master appointments:', err);
        setIsLoadingAppointments(false);
      });
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingConfig(true);
    dbSaveSaaSTenantConfig(config)
      .then(() => {
        setIsSavingConfig(false);
        setConfigSuccess(true);
        onConfigChanged();
        setTimeout(() => setConfigSuccess(false), 3000);
      })
      .catch((err) => {
        console.error('Error saving config', err);
        setIsSavingConfig(false);
      });
  };

  const handleStatusChange = (id: string, nextStatus: 'finished' | 'canceled') => {
    dbUpdateAppointmentStatus(id, nextStatus)
      .then(() => {
        // Optimistic update
        setAllAppointments(prev => 
          prev.map(ap => ap.id === id ? { ...ap, status: nextStatus } : ap)
        );
      })
      .catch((err) => console.error('Error updating status:', err));
  };

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!likedMost.trim() || !missingFeatures.trim()) return;

    setIsSubmittingFeedback(true);
    dbCreateSaaSFeedback(userEmail, rating, likedMost, missingFeatures)
      .then((newFb) => {
        setFeedbacks(prev => [newFb, ...prev]);
        setFeedbackSuccess(true);
        setIsSubmittingFeedback(false);
        // Reset
        setLikedMost('');
        setMissingFeatures('');
        setRating(5);
        setTimeout(() => setFeedbackSuccess(false), 4500);
      })
      .catch((err) => {
        console.error('Error recording feedback:', err);
        setIsSubmittingFeedback(false);
      });
  };

  // Metrics computing
  const finishedOrders = allAppointments.filter(ap => ap.status === 'finished');
  const activeOrders = allAppointments.filter(ap => ap.status === 'scheduled');
  const canceledOrders = allAppointments.filter(ap => ap.status === 'canceled');

  const totalRevenue = finishedOrders.reduce((acc, ap) => acc + ap.service.price, 0);
  const potentialRevenue = activeOrders.reduce((acc, ap) => acc + ap.service.price, 0) + totalRevenue;

  // Render Theme Picker previews
  const colorsList: { key: TenantConfig['accentColor']; name: string; bg: string; text: string; ring: string }[] = [
    { key: 'amber', name: 'Dourado / Whisky', bg: 'bg-amber-600', text: 'text-amber-500', ring: 'ring-amber-500' },
    { key: 'emerald', name: 'Naturals Verde', bg: 'bg-emerald-600', text: 'text-emerald-500', ring: 'ring-emerald-500' },
    { key: 'crimson', name: 'Crimson Viking', bg: 'bg-rose-600', text: 'text-rose-500', ring: 'ring-rose-500' },
    { key: 'indigo', name: 'Indigo Moderno', bg: 'bg-indigo-600', text: 'text-indigo-500', ring: 'ring-indigo-500' },
    { key: 'slate', name: 'Preto Mineral', bg: 'bg-slate-700', text: 'text-slate-400', ring: 'ring-slate-400' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn" id="saas-partner-panel">
      
      {/* 1. COLLABORATIVE BARBER MANAGEMENT PANEL */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-900 via-brand-card to-gray-900 border border-amber-600/10 p-6 md:p-8 shadow-xl">
        {/* Subtle glowing abstract elements */}
        <div className="absolute top-[-50%] right-[-10%] w-72 h-72 rounded-full bg-amber-500/10 filter blur-[80px] pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl text-left">
            <div className="inline-flex items-center gap-1.5 bg-amber-500/15 text-amber-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-amber-500/20">
              <Building2 className="w-3.5 h-3.5" />
              <span>Painel do Proprietário</span>
            </div>
            
            <h2 className="text-2xl font-extrabold font-display text-white">
              Controle Geral da Barbearia ✂️
            </h2>
            
            <p className="text-xs md:text-sm text-gray-400 leading-relaxed font-medium">
              Gerencie toda a operação do seu estabelecimento. Personalize a identidade visual do app de agendamento do seu cliente em tempo real, gerencie a fila de horários marcados, marque atendimentos concluídos e acompanhe métricas de faturamento.
            </p>
          </div>
        </div>
      </div>

      {/* 2. REAL-TIME METRICS WIDGETS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="saas-metrics-grid">
        {/* Metric 1: Total Realizado */}
        <div className="bg-brand-card border border-gray-800 rounded-xl p-5 text-left flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block">Faturamento Concluído</span>
            <span className="text-2xl font-black font-mono text-[#10b981]">
              R$ {totalRevenue.toFixed(2).replace('.', ',')}
            </span>
          </div>
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2: Potential Orders */}
        <div className="bg-brand-card border border-gray-800 rounded-xl p-5 text-left flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block">Faturamento Previsto</span>
            <span className="text-2xl font-black font-mono text-amber-500">
              R$ {potentialRevenue.toFixed(2).replace('.', ',')}
            </span>
          </div>
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3: Active queue */}
        <div className="bg-brand-card border border-gray-800 rounded-xl p-5 text-left flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block">Agendamentos Ativos</span>
            <span className="text-2xl font-black font-mono text-blue-400">
              {activeOrders.length}
            </span>
          </div>
          <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center">
            <CalendarRange className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4: Serviced clients */}
        <div className="bg-brand-card border border-gray-800 rounded-xl p-5 text-left flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block">Clientes Atendidos</span>
            <span className="text-2xl font-black font-mono text-purple-400">
              {finishedOrders.length}
            </span>
          </div>
          <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 text-purple-500 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>


      {/* 3. MASTER CRM - BOOKINGS QUEUE MANAGER */}
      <div className="bg-brand-card border border-gray-800 rounded-2xl p-6 md:p-8 space-y-6" id="dashboard-queue-crm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
          <div className="text-left space-y-1">
            <h3 className="text-lg font-bold font-display text-white">Fila Integrada de Atendimentos</h3>
            <p className="text-xs text-gray-400">Simule o dia-a-dia da barbearia atendendo os agendamentos dos clientes</p>
          </div>
          
          <button
            onClick={fetchAppointments}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-semibold cursor-pointer active:scale-95 transition-all text-left"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Atualizar Painel</span>
          </button>
        </div>

        {isLoadingAppointments ? (
          <div className="py-12 text-center text-gray-500 space-y-2">
            <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
            <p className="text-xs font-medium">Buscando novos agendamentos no banco...</p>
          </div>
        ) : allAppointments.length === 0 ? (
          <div className="py-12 border border-dashed border-gray-800 rounded-xl text-center space-y-3 bg-[#0a0f1d]/40">
            <Building2 className="w-10 h-10 text-gray-600 mx-auto" />
            <p className="text-sm font-semibold text-gray-400">Ainda sem agendamentos cadastrados.</p>
            <p className="text-xs text-gray-500">Volte para a "Visão do Cliente" e preencha um novo agendamento para simular!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300 border-collapse">
              <thead>
                <tr className="border-b border-gray-800 text-[10px] uppercase font-bold text-gray-500">
                  <th className="py-3.5 px-4 font-bold">Cliente</th>
                  <th className="py-3.5 px-4 font-bold">Serviço Solicitado</th>
                  <th className="py-3.5 px-4 font-bold">Data & Horário</th>
                  <th className="py-3.5 px-4 font-bold">Preço em R$</th>
                  <th className="py-3.5 px-4 font-bold">Situação (Status)</th>
                  <th className="py-3.5 px-4 font-bold text-right">Ação Comercial</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-850">
                {allAppointments.map((ap) => {
                  let statusBadge = (
                    <span className="px-2.5 py-1 rounded-full bg-blue-950/40 text-blue-400 border border-blue-900/40 font-bold block text-center max-w-[100px]">
                      Sugerido
                    </span>
                  );
                  if (ap.status === 'scheduled') {
                    statusBadge = (
                      <span className="px-2.5 py-1 rounded-full bg-amber-950/40 text-amber-500 border border-amber-900/40 font-bold block text-center max-w-[110px] uppercase tracking-wider text-[9px]">
                        Marcado
                      </span>
                    );
                  } else if (ap.status === 'finished') {
                    statusBadge = (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 font-bold block text-center max-w-[110px] uppercase tracking-wider text-[9px]">
                        Concluído
                      </span>
                    );
                  } else if (ap.status === 'canceled') {
                    statusBadge = (
                      <span className="px-2.5 py-1 rounded-full bg-red-950/40 text-red-400 border border-red-900/40 font-bold block text-center max-w-[110px] uppercase tracking-wider text-[9px]">
                        Cancelado
                      </span>
                    );
                  }

                  return (
                    <tr key={ap.id} className="hover:bg-gray-800/20 transition-colors">
                      {/* User Column */}
                      <td className="py-4 px-4 font-semibold text-left">
                        <span className="text-gray-100 font-bold block">{ap.userEmail?.split('@')[0].toUpperCase() || 'CLIENTE'}</span>
                        <span className="text-[10px] text-gray-500 font-medium block">{ap.userEmail || 'e-mail pendente'}</span>
                      </td>
                      
                      {/* Name cuts */}
                      <td className="py-4 px-4 font-extrabold text-left">
                        <span className="text-white block">{ap.service.name}</span>
                        {ap.service.description && (
                          <span className="text-[10px] text-gray-500 italic block font-medium max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap">
                            Obs: {ap.service.description}
                          </span>
                        )}
                      </td>

                      {/* Date details */}
                      <td className="py-4 px-4 font-semibold text-left">
                        <span className="flex items-center gap-1 text-gray-200">
                          <DayFormatted text={ap.date} />
                        </span>
                        <span className="flex items-center gap-1 text-gray-400 text-[10px] font-bold mt-0.5">
                          <Clock className="w-3 h-3 text-amber-500" />
                          {ap.time} h
                        </span>
                      </td>

                      {/* Cost */}
                      <td className="py-4 px-4 font-black font-mono text-[#10b981] text-sm text-left">
                        R$ {ap.service.price.toFixed(2).replace('.', ',')}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 align-middle">
                        {statusBadge}
                      </td>

                      {/* Action buttons */}
                      <td className="py-4 px-4 text-right">
                        {ap.status === 'scheduled' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleStatusChange(ap.id, 'finished')}
                              className="px-2.5 py-1.5 bg-[#10b981]/20 hover:bg-[#10b981] text-[#10b981] hover:text-white font-bold rounded text-[10px] uppercase cursor-pointer transition-all active:scale-95"
                              title="Concluir Atendimento e somar ao faturamento"
                            >
                              Finalizar ✔
                            </button>
                            <button
                              onClick={() => handleStatusChange(ap.id, 'canceled')}
                              className="px-2.5 py-1.5 bg-red-950/30 hover:bg-red-600 text-red-400 hover:text-white font-bold rounded text-[10px] uppercase cursor-pointer transition-all active:scale-95"
                              title="Marcar como Cancelado"
                            >
                              Cancelar ✘
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-gray-500 block italic pr-2">Atendimento finalizado</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

// Inline small helpers
function DayFormatted({ text }: { text: string }) {
  if (!text) return <span>Hoje</span>;
  const parts = text.split('-');
  if (parts.length !== 3) return <span>{text}</span>;
  return (
    <span className="flex items-center gap-1.5 font-extrabold text-white">
      📅 {parts[2]}/{parts[1]}/{parts[0]}
    </span>
  );
}
