import React from 'react';
import { Home, PlusCircle, PieChart, CreditCard, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const navItems = [
    { path: '/', icon: <Home size={24} />, label: t('nav_home') },
    { path: '/stats', icon: <PieChart size={24} />, label: t('nav_stats') },
    { path: '/add', icon: <PlusCircle size={40} className="text-emerald-500 drop-shadow-lg" />, label: '', isAction: true },
    { path: '/accounts', icon: <CreditCard size={24} />, label: t('nav_accounts') },
    { path: '/profile', icon: <User size={24} />, label: t('nav_profile') },
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      <main className="flex-1 overflow-y-auto no-scrollbar pb-20">
        {children}
      </main>
      
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe pt-2 px-6 h-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
        <div className="flex justify-between items-center max-w-md mx-auto h-full pb-2">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center transition-colors duration-200 
                ${item.isAction ? '-mt-6' : ''}
                ${location.pathname === item.path && !item.isAction ? 'text-emerald-600' : 'text-slate-400'}
              `}
            >
              {item.isAction ? (
                <div className="bg-white rounded-full p-1 shadow-lg border border-slate-100">
                   {item.icon}
                </div>
              ) : (
                <>
                  {item.icon}
                  <span className="text-[10px] font-medium mt-1">{item.label}</span>
                </>
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};
