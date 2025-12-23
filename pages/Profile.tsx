import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency, CurrencyCode } from '../contexts/CurrencyContext';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, Palette, Info, LogOut, ChevronRight, LogIn, Coins, Key, Eye, EyeOff, Check, X } from 'lucide-react';
import { GeminiService } from '../services/geminiService';

export const Profile: React.FC = () => {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const navigate = useNavigate();

  // API Key states
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKeySaved, setApiKeySaved] = useState(false);

  const currencies: { code: CurrencyCode; label: string }[] = [
    { code: 'CNY', label: '¥ CNY' },
    { code: 'USD', label: '$ USD' },
    { code: 'EUR', label: '€ EUR' },
    { code: 'JPY', label: '¥ JPY' },
  ];

  // Load API Key on component mount
  useEffect(() => {
    const currentKey = GeminiService.getApiKey();
    setApiKey(currentKey);
    setApiKeySaved(!!currentKey);
  }, []);

  const handleSaveApiKey = () => {
    GeminiService.setApiKey(apiKey);
    setApiKeySaved(true);
    setShowApiKeyModal(false);
    // Show success feedback briefly
    setTimeout(() => setApiKeySaved(false), 2000);
  };

  const handleClearApiKey = () => {
    GeminiService.setApiKey('');
    setApiKey('');
    setApiKeySaved(false);
    setShowApiKeyModal(false);
  };

  return (
    <div className="p-6 pb-24 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">{t('profile')}</h1>

      {/* User Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-6">
        <div className="p-6 flex items-center gap-5">
           <div className={`w-20 h-20 ${user ? 'bg-emerald-100' : 'bg-slate-100'} rounded-3xl flex items-center justify-center`}>
             <UserIcon size={36} className={user ? 'text-emerald-600' : 'text-slate-400'} />
           </div>
           <div className="flex-1">
             {user ? (
               <>
                 <h2 className="font-black text-xl text-slate-800 leading-tight">{user.username}</h2>
                 <p className="text-sm font-bold text-emerald-600 mt-1 flex items-center gap-1">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                   Premium Member
                 </p>
               </>
             ) : (
               <>
                 <h2 className="font-black text-xl text-slate-800 leading-tight">{t('guest_user')}</h2>
                 <p className="text-sm font-medium text-slate-400 mt-1">{t('login_desc')}</p>
               </>
             )}
           </div>
        </div>

        {!user && (
          <div className="px-6 pb-6">
            <button 
              onClick={() => navigate('/auth')}
              className="w-full bg-slate-800 text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-900 transition shadow-lg shadow-slate-100"
            >
              <LogIn size={18} /> {t('login_register_now')}
            </button>
          </div>
        )}
      </div>

      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">{t('settings')}</h3>
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        
        {/* Currency Selector */}
        <div className="p-5 flex flex-col gap-4 border-b border-slate-50">
          <div className="flex items-center gap-3 text-slate-700">
            <div className="bg-amber-50 p-2 rounded-xl text-amber-600">
              <Coins size={18} />
            </div>
            <span className="font-bold text-sm">{t('currency')}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {currencies.map((item) => (
              <button
                key={item.code}
                onClick={() => setCurrency(item.code)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  currency === item.code 
                    ? 'bg-amber-500 text-white border-amber-500 shadow-sm shadow-amber-100' 
                    : 'bg-slate-50 text-slate-500 border-transparent hover:border-slate-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* API Key Setting */}
        <div className="p-5 flex flex-col gap-4 border-b border-slate-50">
          <div className="flex items-center gap-3 text-slate-700">
            <div className="bg-green-50 p-2 rounded-xl text-green-600">
              <Key size={18} />
            </div>
            <div className="flex-1">
              <span className="font-bold text-sm block">{t('gemini_api_key')}</span>
              <span className="text-xs text-slate-500">{t('gemini_api_desc')}</span>
            </div>
            {apiKeySaved && (
              <div className="text-green-500">
                <Check size={16} />
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowApiKeyModal(true)}
              className="flex-1 py-2 px-3 bg-slate-50 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 transition"
            >
              {apiKeySaved ? t('modify_api_key') : t('set_api_key')}
            </button>
            {apiKeySaved && (
              <button
                onClick={handleClearApiKey}
                className="py-2 px-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100 transition"
              >
                {t('clear_api_key')}
              </button>
            )}
          </div>
        </div>

        <button className="w-full p-5 flex items-center justify-between border-b border-slate-50 hover:bg-slate-50 transition group text-left">
          <div className="flex items-center gap-3 text-slate-700">
            <div className="bg-purple-50 p-2 rounded-xl text-purple-600">
              <Palette size={18} />
            </div>
            <span className="font-bold text-sm">{t('theme')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">{t('theme_light')}</span>
            <ChevronRight size={14} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        <button className="w-full p-5 flex items-center justify-between hover:bg-slate-50 transition group text-left">
          <div className="flex items-center gap-3 text-slate-700">
            <div className="bg-blue-50 p-2 rounded-xl text-blue-600">
              <Info size={18} />
            </div>
            <span className="font-bold text-sm">{t('about')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">v1.1.0</span>
            <ChevronRight size={14} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>

      {user && (
        <button
          onClick={logout}
          className="w-full mt-6 bg-rose-50 text-rose-500 py-4 rounded-3xl font-bold flex items-center justify-center gap-2 hover:bg-rose-100 transition active:scale-95"
        >
          <LogOut size={18} /> {t('logout')}
        </button>
      )}

      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-black/50 z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xs shadow-2xl p-6 animate-[fadeIn_0.2s_ease-out]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800">{t('api_key_title')}</h3>
              <button onClick={() => setShowApiKeyModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">API Key</label>
                <div className="relative">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full bg-slate-50 p-3 rounded-xl outline-none border border-transparent focus:border-emerald-500 transition-colors pr-12"
                    placeholder={t('api_key_placeholder')}
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {t('api_key_help')}
                </p>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => setShowApiKeyModal(false)}
                  className="flex-1 py-3 text-slate-500 font-medium hover:bg-slate-50 rounded-xl transition"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleSaveApiKey}
                  disabled={!apiKey.trim()}
                  className={`flex-1 py-3 text-white font-bold rounded-xl shadow-lg transition
                    ${apiKey.trim() ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' : 'bg-slate-300 cursor-not-allowed'}
                  `}
                >
                  {t('save_api_key')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
