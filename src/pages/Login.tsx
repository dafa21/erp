import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, User, Lock, AlertTriangle } from 'lucide-react';
import { LoginRequestDto } from '../types/dto/auth.dto';

interface LoginProps {
  onLogin: (data: LoginRequestDto) => Promise<void>;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoggingIn(true);
    try {
      await onLogin({ username, password });
    } catch (error: any) {
      setAuthError(error.message || 'Autentikasi gagal.');
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 text-slate-800 dark:text-slate-200 font-sans transition-colors duration-300 relative overflow-hidden" style={{ backgroundColor: '#fdfdfd' }}>
      {/* Dot Pattern Background */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.3]" 
        style={{ 
          backgroundImage: 'radial-gradient(#cbd5e1 1.5px, transparent 1px)', 
          backgroundSize: '24px 24px' 
        }} 
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto flex items-center justify-center mb-4">
            <img 
              src="/nur.png" 
              alt="Nurhealth Logo" 
              className="w-full h-full object-contain" 
              fetchPriority="high" 
              width="144" 
              height="144" 
            />
          </div>
          <h1 className="text-[26px] font-black tracking-tight text-[#1e293b] uppercase leading-none">
            NURHEALTH<span className="text-[#0ea5e9]">.</span>
          </h1>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2 italic">
            Clinical ERP Systems
          </p>
        </div>

        <form 
          onSubmit={handleSubmit} 
          className="space-y-5 bg-white p-7 sm:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative"
        >
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">ID Pengguna / Username</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#0ea5e9] transition-colors">
                <User className="w-4 h-4" />
              </div>
              <input 
                type="text" 
                name="username" 
                required 
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-[#0ea5e9] focus:outline-none focus:ring-4 focus:ring-[#0ea5e9]/10 transition-all placeholder-slate-300 text-slate-700" 
                placeholder="admin" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Sandi / Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#0ea5e9] transition-colors">
                <Lock className="w-4 h-4" />
              </div>
              <input 
                type="password" 
                name="password" 
                required 
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-lg font-black tracking-widest focus:bg-white focus:border-[#0ea5e9] focus:outline-none focus:ring-4 focus:ring-[#0ea5e9]/10 transition-all placeholder-slate-300 text-slate-700 placeholder:text-xs placeholder:font-medium placeholder:tracking-normal" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <AnimatePresence>
            {authError && (
              <motion.div 
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-red-50 text-red-600 text-[10px] font-bold p-3 rounded-xl border border-red-100 flex items-center gap-2 uppercase tracking-tight mt-1">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {authError}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            type="submit"
            disabled={isLoggingIn}
            className="w-full bg-[#1149ff] hover:bg-[#0038ff] disabled:opacity-75 text-white font-semibold py-3.5 rounded-xl transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2 mt-2 shadow-lg shadow-[#1149ff]/20 active:scale-[0.98] outline-none"
          >
            {isLoggingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {isLoggingIn ? 'MEMPROSES...' : 'AUTENTIKASI SEKARANG'}
          </button>
        </form>

        <p className="text-center text-[10px] font-bold text-slate-400/80 mt-10 tracking-[0.2em] uppercase">
          &copy; 2024 Nurhealth Systems.
        </p>
      </motion.div>
    </div>
  );
}
