/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, ArrowLeft, AlertCircle, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface RecoveryViewProps {
  onSwitchView: (view: 'login') => void;
}

export default function RecoveryView({ onSwitchView }: RecoveryViewProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Por favor, digite seu e-mail.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Por favor, insira um e-mail válido.');
      return;
    }

    setIsLoading(true);

    // Simulate recovery email submission
    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);
    }, 1500);
  };

  return (
    <div className="w-full max-w-md px-4 sm:px-6 py-8 md:py-12 bg-white text-gray-900">
      <div className="space-y-6">
        <div className="text-center flex flex-col items-center">
          <button
            type="button"
            id="back-to-login-recovery"
            onClick={() => onSwitchView('login')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-amber-600 transition-colors mb-4 cursor-pointer mx-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar para o login</span>
          </button>

          {!success ? (
            <>
              <h2 id="recovery-heading" className="text-3xl font-bold tracking-tight text-gray-900 font-display">
                Recuperar Senha
              </h2>
              <p className="mt-2 text-sm text-gray-500 text-center">
                Insira o seu e-mail cadastrado e enviaremos um link para redefinir sua senha.
              </p>
            </>
          ) : (
            <div className="text-center py-4 flex flex-col items-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600 mb-4">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h2 id="recovery-success-heading" className="text-2xl font-bold tracking-tight text-gray-900 font-display">
                E-mail Enviado!
              </h2>
              <p className="mt-2 text-sm text-gray-500 text-center">
                Enviamos instruções de redefinição para <span className="font-semibold text-gray-800">{email}</span>. Verifique sua caixa de entrada ou spam.
              </p>
            </div>
          )}
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

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-4" id="recovery-form">
            {/* Email input */}
            <div className="space-y-1.5">
              <label htmlFor="recovery-email" className="text-xs font-semibold text-gray-600 block">
                Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  id="recovery-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Seu email cadastrado"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 text-gray-950 placeholder-gray-400 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              id="submit-recovery"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-750 text-white font-medium rounded-lg text-sm transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Enviar Link de Recuperação'
              )}
            </button>
          </form>
        ) : (
          <button
            type="button"
            id="back-to-login-btn"
            onClick={() => onSwitchView('login')}
            className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg text-sm transition-all text-center focus:outline-none"
          >
            Voltar para o Login
          </button>
        )}
      </div>
    </div>
  );
}
