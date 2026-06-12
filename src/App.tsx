/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ActiveView, User } from './types';
import LoginView from './components/LoginView';
import SignupView from './components/SignupView';
import RecoveryView from './components/RecoveryView';
import DashboardView from './components/DashboardView';

// Import the generated barbershop logo
import barberLogo from './assets/images/barber_logo_1780786982270.png';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('barber_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [view, setView] = useState<ActiveView>(() => {
    try {
      const saved = localStorage.getItem('barber_current_user');
      return saved ? 'dashboard' : 'login';
    } catch {
      return 'login';
    }
  });

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setView('dashboard');
    try {
      localStorage.setItem('barber_current_user', JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSignupSuccess = (user: User) => {
    setCurrentUser(user);
    setView('dashboard');
    try {
      localStorage.setItem('barber_current_user', JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('login');
    try {
      localStorage.removeItem('barber_current_user');
    } catch (e) {
      console.error(e);
    }
  };

  if (view === 'dashboard' && currentUser) {
    return (
      <DashboardView 
        user={currentUser} 
        onLogout={handleLogout} 
      />
    );
  }

  return (
    <div className="min-h-screen text-gray-100 flex items-center justify-center p-0 sm:p-4 md:p-8 bg-brand-card sm:bg-[#050811] relative overflow-hidden font-sans">
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-amber-600/10 filter blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-900/10 filter blur-[120px] pointer-events-none"></div>

      {/* Main card box containing brand and form */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-5xl rounded-none sm:rounded-2xl bg-brand-card shadow-none sm:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-0 sm:border border-gray-800/60 overflow-hidden flex flex-col md:flex-row min-h-screen sm:min-h-[600px] z-10"
        id="barber-auth-container"
      >
        {/* Left column: Branded/Aesthetic visual banner */}
        <div className="md:w-1/2 bg-gradient-to-br from-brand-card to-brand-dark border-b md:border-b-0 md:border-r border-gray-800/80 p-8 md:p-12 flex flex-col justify-center items-center text-center relative overflow-hidden select-none shrink-0 min-h-[220px] md:min-h-[300px]">
          {/* Subtle grid pattern overlay */}
          <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="flex flex-col items-center"
          >
            {/* Round barbershop badge crest */}
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-full bg-amber-500/10 filter blur-md animate-pulse"></div>
              <img
                src={barberLogo}
                alt="BarberSpace Crest"
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border border-amber-500/30 object-cover shadow-lg relative z-5"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Text header */}
            <h1 className="text-3xl sm:text-4.5xl font-bold font-display tracking-tight text-white flex flex-col items-center">
              <span>BarberSpace</span>
            </h1>

            {/* Accent divider line */}
            <div className="w-16 h-1 mt-3 bg-amber-600 rounded-full shadow-sm shadow-amber-600/30"></div>

            {/* Dynamic Slogans depending on the Active View */}
            <AnimatePresence mode="wait">
              {view === 'login' && (
                <motion.div
                  key="login-slogan"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="mt-6"
                >
                  <h3 className="text-lg font-bold text-gray-100 font-display">Bem-vindo de volta</h3>
                  <p className="mt-2 text-sm text-gray-400 max-w-xs leading-relaxed text-center">
                    Entre na plataforma e gerencie seus agendamentos de forma fácil e rápida.
                  </p>
                </motion.div>
              )}

              {view === 'signup' && (
                <motion.div
                  key="signup-slogan"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="mt-6"
                >
                  <h3 className="text-lg font-bold text-gray-100 font-display">Junte-se à BarberSpace</h3>
                  <p className="mt-2 text-sm text-gray-400 max-w-xs leading-relaxed text-center">
                    Crie uma conta para garantir horários exclusivos, cartão fidelidade e o melhor atendimento da região.
                  </p>
                </motion.div>
              )}

              {view === 'forgot' && (
                <motion.div
                  key="forgot-slogan"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="mt-6"
                >
                  <h3 className="text-lg font-bold text-gray-100 font-display">Não se preocupe!</h3>
                  <p className="mt-2 text-sm text-gray-400 max-w-xs leading-relaxed text-center">
                    A gente te ajuda a recuperar o acesso rapidinho. O seu estilo não precisará esperar.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Sotto bottom caption */}
          <div className="absolute bottom-4 left-0 right-0 text-[10px] text-gray-600 text-center font-medium">
            © 2026 BarberSpace. Todos os direitos reservados.
          </div>
        </div>

        {/* Right column: Form section */}
        <div className="md:w-1/2 flex bg-white relative flex-1 min-h-[400px] justify-center sm:items-center items-start">
          <AnimatePresence mode="wait">
            {view === 'login' && (
              <motion.div
                key="login-component"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full flex justify-center items-center"
              >
                <LoginView 
                  onSwitchView={(newView) => setView(newView)}
                  onLoginSuccess={handleLoginSuccess}
                />
              </motion.div>
            )}

            {view === 'signup' && (
              <motion.div
                key="signup-component"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full flex justify-center items-center"
              >
                <SignupView 
                  onSwitchView={(newView) => setView(newView)}
                  onSignupSuccess={handleSignupSuccess}
                />
              </motion.div>
            )}

            {view === 'forgot' && (
              <motion.div
                key="forgot-component"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full flex justify-center items-center"
              >
                <RecoveryView 
                  onSwitchView={(newView) => setView(newView)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
