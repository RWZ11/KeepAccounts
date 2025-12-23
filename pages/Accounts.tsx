import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storageService';
import { Wallet, CreditCard, Banknote, Smartphone, TrendingUp, X, Trash2, Plus, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useAuth } from '../contexts/AuthContext';
import { Account } from '../types';

export const Accounts: React.FC = () => {
  const { t } = useLanguage();
  const { symbol } = useCurrency();
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  
  // Modals State
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null); // Store ID of account to delete
  
  // New Account Form State
  const [name, setName] = useState('');
  const [type, setType] = useState('cash');
  const [balance, setBalance] = useState('');

  useEffect(() => {
    if (user) {
      loadAccounts();
    }
  }, [user]);

  const loadAccounts = () => {
    if (user) {
      setAccounts(StorageService.getAccounts(user.id));
    }
  };

  // Trigger Delete Confirmation
  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteId(id);
  };

  // Execute Deletion
  const confirmDelete = () => {
    if (deleteId && user) {
      StorageService.removeAccount(deleteId, user.id);
      loadAccounts();
      setDeleteId(null);
    }
  };

  const handleAdd = () => {
    if (!name || !user) return;

    // Determine color based on type
    let color = 'bg-emerald-500';
    if (type === 'bank') color = 'bg-blue-600';
    if (type === 'credit') color = 'bg-slate-700';
    if (type === 'alipay') color = 'bg-sky-500';
    if (type === 'wechat') color = 'bg-green-500';
    if (type === 'investment') color = 'bg-red-500';

    const newAccount: Account = {
      id: Date.now().toString(),
      name,
      type: type as any,
      balance: parseFloat(balance) || 0,
      color,
      userId: user.id
    };

    StorageService.addAccount(newAccount, user.id);
    loadAccounts();
    setShowAddModal(false);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setType('cash');
    setBalance('');
  };

  const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bank': return Banknote;
      case 'credit': return CreditCard;
      case 'alipay': return Smartphone; // Simplified for Alipay
      case 'wechat': return Smartphone; // Simplified for WeChat
      case 'investment': return TrendingUp;
      default: return Wallet;
    }
  };

  return (
    <div className="p-6 pb-24 max-w-md mx-auto relative min-h-full">
      <div className="mb-8 text-center">
        <h2 className="text-slate-500 font-medium text-sm mb-1">{t('net_worth')}</h2>
        <h1 className="text-4xl font-bold text-slate-800">{symbol}{totalBalance.toLocaleString()}</h1>
      </div>

      <div className="space-y-4">
        {accounts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-slate-200">
             <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Wallet size={32} />
             </div>
             <h3 className="text-slate-600 font-bold mb-1">{t('no_accounts')}</h3>
             <p className="text-slate-400 text-sm px-6">{t('no_accounts_desc')}</p>
          </div>
        ) : (
          accounts.map(acc => {
            const Icon = getTypeIcon(acc.type);
            
            return (
              <div key={acc.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 relative group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full ${acc.color} flex items-center justify-center text-white shadow-md`}>
                      <Icon size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{acc.name}</h3>
                      <p className="text-xs text-slate-400 uppercase tracking-wide">{t(`type_${acc.type}`)}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 relative">
                     <span className={`text-lg font-bold ${acc.balance < 0 ? 'text-rose-500' : 'text-slate-800'}`}>
                      {symbol}{acc.balance.toLocaleString()}
                     </span>
                     <button 
                      onClick={(e) => handleDeleteClick(acc.id, e)}
                      className="p-2.5 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-full transition-all cursor-pointer z-10 mt-1 shadow-sm active:scale-95"
                      aria-label={t('delete')}
                     >
                       <Trash2 size={18} />
                     </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        <button 
          onClick={() => setShowAddModal(true)}
          className="w-full bg-slate-800 text-white rounded-2xl p-4 font-bold shadow-lg shadow-slate-200 hover:bg-slate-900 transition flex items-center justify-center gap-2 mt-4"
        >
          <Plus size={20} /> {t('add_new_account')}
        </button>
      </div>

      {/* Add Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xs shadow-2xl p-6 animate-[fadeIn_0.2s_ease-out]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800">{t('create_account')}</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">{t('account_name')}</label>
                <input 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 p-3 rounded-xl outline-none border border-transparent focus:border-emerald-500 transition-colors"
                  placeholder="e.g. 我的钱包"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">{t('account_type')}</label>
                <select 
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-slate-50 p-3 rounded-xl outline-none border border-transparent focus:border-emerald-500 transition-colors"
                >
                  <option value="cash">{t('type_cash')}</option>
                  <option value="bank">{t('type_bank')}</option>
                  <option value="credit">{t('type_credit')}</option>
                  <option value="alipay">{t('type_alipay')}</option>
                  <option value="wechat">{t('type_wechat')}</option>
                  <option value="investment">{t('type_investment')}</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">{t('initial_balance')}</label>
                <input 
                  type="number"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  className="w-full bg-slate-50 p-3 rounded-xl outline-none border border-transparent focus:border-emerald-500 transition-colors"
                  placeholder="0.00"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 text-slate-500 font-medium hover:bg-slate-50 rounded-xl transition"
                >
                  {t('cancel')}
                </button>
                <button 
                  onClick={handleAdd}
                  disabled={!name}
                  className={`flex-1 py-3 text-white font-bold rounded-xl shadow-lg transition
                    ${name ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' : 'bg-slate-300 cursor-not-allowed'}
                  `}
                >
                  {t('confirm')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xs shadow-2xl p-6 animate-[fadeIn_0.2s_ease-out]">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center text-rose-500 mb-4">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">{t('delete')}?</h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">{t('delete_confirm')}</p>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteId(null)}
                className="flex-1 py-3 text-slate-500 font-medium hover:bg-slate-50 rounded-xl transition"
              >
                {t('cancel')}
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-3 bg-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-200 hover:bg-rose-600 transition"
              >
                {t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
