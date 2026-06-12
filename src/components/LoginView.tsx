/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { User } from '../types';
import { dbSignIn, dbSignInWithGoogle } from '../lib/firebase';

interface LoginViewProps {
  onSwitchView: (view: 'signup' | 'forgot') => void;
  onLoginSuccess: (user: User) => void;
}

export default function LoginView({ onSwitchView, onLoginSuccess }: LoginViewProps) {
  const [selectedRoleType, setSelectedRoleType] = useState<'client' | 'owner'>('client');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Por favor, digite seu e-mail.');
      return;
    }
    if (!password) {
      setError('Por favor, digite sua senha.');
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

    setIsLoading(true);

    dbSignIn(email, password)
      .then((user) => {
        setIsLoading(false);
        onLoginSuccess(user);
      })
      .catch((err) => {
        setIsLoading(false);
        let msg = err.message || 'Erro ao realizar login. Verifique suas credenciais.';
        try {
          const parsed = JSON.parse(err.message);
          if (parsed.error) {
            if (parsed.error.includes('auth/invalid-credential') || parsed.error.includes('auth/wrong-password') || parsed.error.includes('auth/user-not-found')) {
              msg = 'E-mail ou senha incorretos.';
            } else if (parsed.error.includes('auth/too-many-requests')) {
              msg = 'Muitas tentativas falhas. Tente novamente mais tarde.';
            } else {
              msg = 'Erro no servidor: ' + parsed.error;
            }
          }
        } catch(e) {}
        setError(msg);
      });
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    dbSignInWithGoogle()
      .then((user) => {
        setIsLoading(false);
        onLoginSuccess(user);
      })
      .catch((err) => {
        setIsLoading(false);
        let msg = err.message || 'Erro ao realizar login com o Google.';
        try {
          const parsed = JSON.parse(err.message);
          if (parsed.error) {
            if (parsed.error.includes('auth/popup-closed-by-user')) msg = 'A janela de login do Google foi fechada.';
            else msg = 'Erro do Google: ' + parsed.error;
          }
        } catch(e) {}
        setError(msg);
      });
  };


  return (
    <div className="w-full max-w-md px-6 sm:px-6 py-6 md:py-12 pb-10 sm:pb-6 md:pb-12 bg-white text-gray-900">
      <div className="space-y-4">
        <div className="text-center">
          <h2 id="login-heading" className="text-3xl font-bold tracking-tight text-gray-900 font-display">
            Entrar
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Acesse sua conta para continuar
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

        <form onSubmit={handleSubmit} className="space-y-4" id="login-form">
          {/* Role Type Selector */}
          <div className="space-y-2 pb-2 border-b border-gray-100" id="login-role-selector-container">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block text-center">
              Selecione o seu perfil de acesso
            </span>
            <div className="flex flex-col sm:grid sm:grid-cols-2 gap-2" id="login-role-switcher">
              <button
                type="button"
                id="login-role-client"
                onClick={() => {
                  setSelectedRoleType('client');
                  setError(null);
                }}
                className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-1 ${
                  selectedRoleType === 'client'
                    ? 'bg-amber-600 text-white border-transparent shadow-sm shadow-amber-600/10'
                    : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <span>👤 Cliente</span>
              </button>
              <button
                type="button"
                id="login-role-owner"
                onClick={() => {
                  setSelectedRoleType('owner');
                  setError(null);
                }}
                className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-1 ${
                  selectedRoleType === 'owner'
                    ? 'bg-slate-900 text-white border-transparent shadow-sm shadow-slate-900/10'
                    : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <span>✂️ Barbeiro / Dono</span>
              </button>
            </div>
          </div>

          {/* Email input */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-semibold text-gray-600 block">
              Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu email"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 text-gray-950 placeholder-gray-400 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-semibold text-gray-600 block">
              Senha
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                className="w-full pl-10 pr-10 py-2.5 bg-gray-50 text-gray-950 placeholder-gray-400 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                id="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember me & forgot password */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-gray-500 select-none">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-amber-600 bg-gray-50 border-gray-200 rounded focus:ring-amber-500 cursor-pointer"
              />
              <span>Lembrar de mim</span>
            </label>

            <button
              type="button"
              id="goto-forgot"
              onClick={() => onSwitchView('forgot')}
              className="text-amber-600 hover:text-amber-700 font-medium hover:underline transition-colors focus:outline-none cursor-pointer"
            >
              Esqueceu a senha?
            </button>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            id="submit-login"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-750 text-white font-medium rounded-lg text-sm transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        {/* Separator */}
        <div className="relative flex items-center justify-center py-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <span className="relative px-3 bg-white text-xs text-gray-400 font-medium">OU</span>
        </div>

        {/* Google login */}
        <button
          type="button"
          id="google-login-btn"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full py-2.5 px-4 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 shadow-sm hover:border-gray-300 active:scale-[0.98] cursor-pointer"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22-.03-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span className="text-gray-600">Fazer Login com o Google</span>
        </button>

        {/* Switch to Register */}
        <div className="text-center text-sm text-gray-500 pt-2 border-t border-gray-100">
          Não possui conta?{' '}
          <button
            type="button"
            id="switch-signup"
            onClick={() => onSwitchView('signup')}
            className="text-amber-600 hover:text-amber-700 font-bold hover:underline transition-colors focus:outline-none cursor-pointer"
          >
            Criar conta
          </button>
        </div>

      </div>
    </div>
  );
}
