import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { StorageService } from '../services/storageService';
import { Category, Account, TransactionType } from '../types';
import { GeminiService } from '../services/geminiService';
import { useCurrency } from '../contexts/CurrencyContext';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Send, Loader2, AlertCircle, Trash2, AlertTriangle } from 'lucide-react';
import { IconRenderer } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';

export const AddTransaction: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const { t, getCategoryName } = useLanguage();
  const { symbol } = useCurrency();
  const { user } = useAuth();
  const [amount, setAmount] = useState<string>('');
  const [type, setType] = useState<TransactionType>('expense');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [aiInput, setAiInput] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [showAiInput, setShowAiInput] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const categories = user ? StorageService.getCategories(user.id).filter(c => c.type === type) : [];
  const accounts = user ? StorageService.getAccounts(user.id) : [];

  // Load existing data if in edit mode
  useEffect(() => {
    if (isEditMode && id && user) {
      const existing = StorageService.getTransactionById(id, user.id);
      if (existing) {
        setAmount(existing.amount.toString());
        setType(existing.type);
        setSelectedCategory(existing.categoryId);
        setSelectedAccount(existing.accountId);
        setNote(existing.note);
        setDate(new Date(existing.date).toISOString().split('T')[0]);
      } else {
        navigate('/');
      }
    }
  }, [isEditMode, id, navigate, user]);

  useEffect(() => {
    if (!isEditMode) {
      if (categories.length > 0 && !selectedCategory) setSelectedCategory(categories[0].id);
      if (accounts.length > 0 && !selectedAccount) setSelectedAccount(accounts[0].id);
    }
  }, [type, categories, accounts, selectedCategory, selectedAccount, isEditMode]);

  const handleAiParse = async () => {
    if (!aiInput.trim()) return;
    setIsAiProcessing(true);
    const result = await GeminiService.parseTransaction(aiInput);
    if (result) {
      setAmount(result.amount.toString());
      setType(result.type as TransactionType);
      setNote(result.note || aiInput);
      if (result.date) setDate(result.date.split('T')[0]);
      
      if (result.categoryName && user) {
        const matched = StorageService.getCategories(user.id).find(c =>
          c.name.toLowerCase().includes(result.categoryName.toLowerCase()) && c.type === result.type
        );
        if (matched) setSelectedCategory(matched.id);
      }
      setShowAiInput(false);
    } else {
      alert(t('ai_error'));
    }
    setIsAiProcessing(false);
  };

  const handleSave = () => {
    if (!amount || parseFloat(amount) <= 0) return alert(t('save_alert_amount'));
    if (!selectedCategory) return alert(t('save_alert_category'));
    if (!selectedAccount) return alert(t('save_alert_account'));
    if (!user) return alert('User not found');

    const transactionData = {
      id: isEditMode ? id! : Date.now().toString(),
      amount: parseFloat(amount),
      type,
      categoryId: selectedCategory,
      accountId: selectedAccount,
      date: new Date(date).toISOString(),
      note,
      userId: user.id
    };

    if (isEditMode) {
      StorageService.updateTransaction(transactionData, user.id);
    } else {
      StorageService.addTransaction(transactionData, user.id);
    }

    navigate('/');
  };

  const handleDelete = () => {
    if (isEditMode && id && user) {
      StorageService.deleteTransaction(id, user.id);
      navigate('/');
    }
  };

  if (accounts.length === 0) {
    return (
      <div className="flex flex-col h-full bg-white p-6 justify-center items-center text-center">
        <div className="bg-rose-50 p-4 rounded-full text-rose-500 mb-4">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-lg font-bold text-slate-800 mb-2">{t('no_accounts')}</h2>
        <p className="text-slate-500 mb-6">{t('no_accounts_add_prompt')}</p>
        <button 
          onClick={() => navigate('/accounts')}
          className="bg-slate-800 text-white px-6 py-3 rounded-xl font-bold"
        >
          {t('add_new_account')}
        </button>
        <button onClick={() => navigate(-1)} className="mt-4 text-slate-400 text-sm">
          {t('cancel')}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white max-w-md mx-auto relative">
      {/* Header */}
      <div className="px-4 py-4 flex items-center relative border-b border-slate-100">
        <button onClick={() => navigate(-1)} className="p-2 text-slate-500 absolute left-2">
          <ArrowLeft size={24} />
        </button>
        
        <div className="flex bg-slate-100 p-1 rounded-lg mx-auto">
          {(['expense', 'income'] as const).map(trType => (
            <button
              key={trType}
              disabled={isEditMode} // Usually type isn't changed in basic edit to avoid complexity, but we allow it if we want
              onClick={() => setType(trType)}
              className={`px-6 py-1.5 rounded-md text-sm font-medium transition-all ${
                type === trType ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'
              } ${isEditMode ? 'opacity-50' : ''}`}
            >
              {t(trType === 'expense' ? 'expense_label' : 'income_label')}
            </button>
          ))}
        </div>

        {isEditMode && (
          <button 
            onClick={() => setShowDeleteModal(true)}
            className="p-2 text-rose-500 absolute right-2 hover:bg-rose-50 rounded-full transition-colors"
          >
            <Trash2 size={24} />
          </button>
        )}
      </div>

      {/* AI Toggle - only for new transactions */}
      {!isEditMode && (
        <div className="px-6 py-2">
          <button 
            onClick={() => setShowAiInput(!showAiInput)}
            className="text-xs flex items-center gap-1 text-purple-600 font-medium ml-auto"
          >
            <SparklesIcon /> {showAiInput ? t('manual_mode') : t('use_ai')}
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-6 pb-24">
        
        {showAiInput ? (
          <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 mt-4">
             <label className="block text-purple-900 font-semibold mb-2">{t('ai_desc')}</label>
             <textarea 
               className="w-full p-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm mb-4 bg-white"
               rows={3}
               placeholder={t('ai_placeholder')}
               value={aiInput}
               onChange={(e) => setAiInput(e.target.value)}
             />
             <button 
              onClick={handleAiParse}
              disabled={isAiProcessing}
              className="w-full bg-purple-600 text-white py-3 rounded-xl font-medium flex justify-center items-center gap-2 hover:bg-purple-700 transition"
             >
               {isAiProcessing ? <Loader2 className="animate-spin" size={20}/> : <SparklesIcon className="text-purple-200"/>}
               {isAiProcessing ? t('ai_analyzing') : t('ai_autofill')}
             </button>
          </div>
        ) : (
          <>
            {/* Amount */}
            <div className="mt-6 mb-8">
              <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">{t('amount')}</label>
              <div className="flex items-center text-4xl font-bold text-slate-800 mt-2 border-b-2 border-slate-100 pb-2 focus-within:border-emerald-500 transition-colors">
                <span className="text-2xl mr-1 text-slate-400">{symbol}</span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full outline-none bg-transparent placeholder-slate-200"
                  autoFocus={!isEditMode}
                />
              </div>
            </div>

            {/* Categories */}
            <div className="mb-8">
              <label className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-3 block">{t('category')}</label>
              <div className="grid grid-cols-4 gap-4">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
                      selectedCategory === cat.id ? 'bg-emerald-50 scale-105 border border-emerald-100' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 text-white shadow-sm ${
                        selectedCategory === cat.id ? 'bg-emerald-500' : 'bg-slate-200 text-slate-500'
                    }`}>
                      <IconRenderer name={cat.icon} className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-medium truncate w-full text-center ${
                       selectedCategory === cat.id ? 'text-emerald-700' : 'text-slate-500'
                    }`}>
                      {getCategoryName(cat.id, cat.name)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Details */}
            <div className="space-y-4">
               <div>
                <label className="text-xs text-slate-400 uppercase font-bold tracking-wider block mb-2">{t('account')}</label>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {accounts.map(acc => (
                     <button
                        key={acc.id}
                        onClick={() => setSelectedAccount(acc.id)}
                        className={`px-4 py-2 rounded-full text-sm whitespace-nowrap border ${
                          selectedAccount === acc.id 
                            ? 'bg-slate-800 text-white border-slate-800' 
                            : 'bg-white text-slate-600 border-slate-200'
                        }`}
                     >
                       {acc.name}
                     </button>
                  ))}
                </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 uppercase font-bold tracking-wider block mb-2">{t('date')}</label>
                    <input 
                      type="date" 
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full p-3 bg-slate-50 rounded-xl text-sm font-medium outline-none text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 uppercase font-bold tracking-wider block mb-2">{t('note')}</label>
                    <input 
                      type="text" 
                      placeholder={t('optional')}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="w-full p-3 bg-slate-50 rounded-xl text-sm font-medium outline-none text-slate-700"
                    />
                  </div>
               </div>
            </div>
          </>
        )}
      </div>

      {/* Footer Action */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-100 max-w-md mx-auto">
        <button
          onClick={handleSave}
          className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-emerald-200 hover:bg-emerald-700 active:scale-[0.98] transition-all flex justify-center items-center gap-2"
        >
          {isEditMode ? t('confirm') : t('save_button')}
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xs shadow-2xl p-6 animate-[fadeIn_0.2s_ease-out]">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center text-rose-500 mb-4">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">{t('delete')}?</h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">{t('delete_transaction_confirm')}</p>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 text-slate-500 font-medium hover:bg-slate-50 rounded-xl transition"
              >
                {t('cancel')}
              </button>
              <button 
                onClick={handleDelete}
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

const SparklesIcon = ({className}: {className?: string}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
  </svg>
)
