/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User, Phone, ArrowLeft, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { User as UserType } from '../types';
import { dbSignUp } from '../lib/firebase';

interface SignupViewProps {
  onSwitchView: (view: 'login') => void;
  onSignupSuccess: (user: UserType) => void;
}

export default function SignupView({ onSwitchView, onSignupSuccess }: SignupViewProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'client' | 'owner'>('client');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const formatPhoneNumber = (value: string) => {
    const raw = value.replace(/\D/g, '');
    if (raw.length <= 11) {
      if (raw.length <= 2) return raw;
      if (raw.length <= 7) return `(${raw.substring(0, 2)}) ${raw.substring(2)}`;
      return `(${raw.substring(0, 2)}) ${raw.substring(2, 7)}-${raw.substring(7, 11)}`;
    }
    return phone;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !email || !phone || !password || !confirmPassword) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Por favor, insira um e-mail válido.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setIsLoading(true);

    dbSignUp(name, email, phone, password, role)
      .then((user) => {
        setIsLoading(false);
        onSignupSuccess(user);
      })
      .catch((err) => {
        setIsLoading(false);
        let msg = err.message || 'Erro ao criar conta. Verifique os dados fornecidos.';
        try {
          const parsed = JSON.parse(err.message);
          if (parsed.error) {
            if (parsed.error.includes('auth/weak-password')) msg = 'A senha é muito fraca (mínimo de 6 caracteres).';
            else if (parsed.error.includes('auth/email-already-in-use')) msg = 'Este e-mail já está cadastrado em nossa barbearia.';
            else if (parsed.error.includes('auth/invalid-email')) msg = 'O e-mail fornecido é inválido.';
            else msg = 'Erro no servidor: ' + parsed.error;
          }
        } catch(e) {}
        setError(msg);
      });
  };

  return (
    <div className="w-full max-w-md px-4 sm:px-6 py-8 md:py-10 bg-white text-gray-900 h-full flex flex-col justify-center">
      <div className="space-y-5">
        <div className="text-center flex flex-col items-center">
          <button
            type="button"
            id="back-to-login"
            onClick={() => onSwitchView('login')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-amber-600 transition-colors mb-3 cursor-pointer mx-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar para o login</span>
          </button>
          <h2 id="signup-heading" className="text-3xl font-bold tracking-tight text-gray-900 font-display">
            Criar Conta
          </h2>
          <p className="mt-1.5 text-sm text-gray-500 text-center">
            Cadastre-se na BarberSpace para gerenciar seus agendamentos
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-100"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5" id="signup-form">
          {/* Tipo de Conta Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-650 block">
              Tipo de Conta
            </label>
            <div className="grid grid-cols-2 gap-2" id="role-selector-signup">
              <button
                type="button"
                id="select-role-client"
                onClick={() => setRole('client')}
                className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all text-center cursor-pointer ${
                  role === 'client'
                    ? 'bg-amber-600 text-white border-transparent shadow-sm shadow-amber-600/10'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                👤 Sou Cliente
              </button>
              <button
                type="button"
                id="select-role-owner"
                onClick={() => setRole('owner')}
                className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all text-center cursor-pointer ${
                  role === 'owner'
                    ? 'bg-amber-600 text-white border-transparent shadow-sm shadow-amber-600/10'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                ✂️ Sou Dono/Barbeiro
              </button>
            </div>
          </div>

          {/* Nome input */}
          <div className="space-y-1">
            <label htmlFor="signup-name" className="text-xs font-semibold text-gray-600 block">
              Nome Completo
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <User className="w-4 h-4" />
              </span>
              <input
                id="signup-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo"
                className="w-full pl-10 pr-4 py-2 bg-gray-50 text-gray-950 placeholder-gray-400 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Email input */}
          <div className="space-y-1">
            <label htmlFor="signup-email" className="text-xs font-semibold text-gray-600 block">
              Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Seu melhor email"
                className="w-full pl-10 pr-4 py-2 bg-gray-50 text-gray-950 placeholder-gray-400 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Celular input */}
          <div className="space-y-1">
            <label htmlFor="signup-phone" className="text-xs font-semibold text-gray-600 block">
              Celular
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Phone className="w-4 h-4" />
              </span>
              <input
                id="signup-phone"
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="(11) 99999-9999"
                className="w-full pl-10 pr-4 py-2 bg-gray-50 text-gray-950 placeholder-gray-400 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Senha input */}
          <div className="space-y-1">
            <label htmlFor="signup-password" className="text-xs font-semibold text-gray-600 block">
              Senha
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="mínimo 6 caracteres"
                className="w-full pl-10 pr-10 py-2 bg-gray-50 text-gray-950 placeholder-gray-400 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                id="signup-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirmar Senha input */}
          <div className="space-y-1">
            <label htmlFor="confirm-password" className="text-xs font-semibold text-gray-600 block">
              Confirmar Senha
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita sua senha"
                className="w-full pl-10 pr-10 py-2 bg-gray-50 text-gray-950 placeholder-gray-400 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                id="signup-confirm-password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            id="submit-signup"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg text-sm transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 flex items-center justify-center gap-2 pt-2.5 mt-2 active:scale-[0.98] cursor-pointer"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Criar Conta'
            )}
          </button>
        </form>

        {/* Link back to login */}
        <div className="text-center text-sm text-gray-500 pt-2 border-t border-gray-100">
          Já tem uma conta?{' '}
          <button
            type="button"
            id="goto-login"
            onClick={() => onSwitchView('login')}
            className="text-amber-600 hover:text-amber-700 font-bold hover:underline transition-colors focus:outline-none cursor-pointer"
          >
            Fazer login
          </button>
        </div>
      </div>
    </div>
  );
}
