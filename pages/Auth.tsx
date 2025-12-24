import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { StorageService } from '../services/storageService';
import { Wallet, Mail, Lock, User as UserIcon, ArrowRight, Loader2 } from 'lucide-react';

export const Auth: React.FC = () => {
  const { setUser, setSkip } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Small artificial delay for UX feel
      await new Promise(r => setTimeout(r, 800));
      
      if (isLogin) {
        const user = StorageService.loginUser(username, password);
        if (user) {
          setUser(user);
          navigate('/');
        } else {
          setError(t('auth_error_invalid'));
        }
      } else {
        try {
          const user = StorageService.registerUser(username, password);
          setUser(user);
          navigate('/');
        } catch (err: any) {
          setError(t('auth_error_exists'));
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    setSkip(true);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-emerald-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-emerald-200 mb-6 rotate-3">
            <Wallet size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">ZenLedger</h1>
          <p className="text-slate-500 mt-2 font-medium">{t('auth_subtitle')}</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-8">
            <button 
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${isLogin ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
            >
              {t('login')}
            </button>
            <button 
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${!isLogin ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
            >
              {t('register')}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">{t('username')}</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50 border-none outline-none py-4 pl-12 pr-4 rounded-2xl text-slate-700 focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="e.g. janesmith"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">{t('password')}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border-none outline-none py-4 pl-12 pr-4 rounded-2xl text-slate-700 focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && <p className="text-rose-500 text-xs font-bold text-center px-2">{error}</p>}

            <button 
              disabled={loading}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-lg shadow-slate-200 transition-all flex items-center justify-center gap-2 group active:scale-95"
            >
              {loading ? <Loader2 className="animate-spin" size={20}/> : (isLogin ? t('login_action') : t('register_action'))}
              {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="mt-8 flex items-center justify-between">
             <div className="h-[1px] flex-1 bg-slate-100"></div>
             <span className="text-[10px] uppercase tracking-widest font-bold text-slate-300 px-4">{t('or')}</span>
             <div className="h-[1px] flex-1 bg-slate-100"></div>
          </div>

          <button 
            onClick={handleSkip}
            className="w-full mt-6 py-4 text-slate-500 font-bold text-sm hover:bg-slate-50 rounded-2xl transition-all"
          >
            {t('skip_auth')}
          </button>
        </div>
      </div>
    </div>
  );
};