import React, { useEffect, useState } from 'react';
import { Transaction, Account } from '../types';
import { StorageService } from '../services/storageService';
import { ArrowUpRight, ArrowDownRight, Search, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { IconRenderer } from '../constants';
import { GeminiService } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [monthIncome, setMonthIncome] = useState(0);
  const [monthExpense, setMonthExpense] = useState(0);
  const [advice, setAdvice] = useState<string>('');
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  const { t, getCategoryName } = useLanguage();
  const { symbol } = useCurrency();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadData();
      setAdvice('');
    }
  }, [user]);

  const loadData = () => {
    if (!user) return;

    const accs = StorageService.getAccounts(user.id);
    setAccounts(accs);

    // Get all transactions and filter only those belonging to existing accounts
    const allTxs = StorageService.getTransactions(user.id);
    const accountIds = new Set(accs.map(acc => acc.id));
    const validTxs = allTxs.filter(tx => accountIds.has(tx.accountId));

    const txs = validTxs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setTransactions(txs);

    const balance = accs.reduce((sum, acc) => sum + acc.balance, 0);
    setTotalBalance(balance);

    const now = new Date();
    const currentMonthTxs = txs.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const inc = currentMonthTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const exp = currentMonthTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    setMonthIncome(inc);
    setMonthExpense(exp);
  };

  const generateAdvice = async () => {
    if (!user) return;

    setLoadingAdvice(true);
    const categories: Record<string, number> = {};
    transactions.slice(0, 20).forEach(t => {
      if(t.type === 'expense') {
        const catName = StorageService.getCategories(user.id).find(c => c.id === t.categoryId)?.name || 'Unknown';
        categories[catName] = (categories[catName] || 0) + t.amount;
      }
    });
    const topCats = Object.entries(categories).sort((a,b) => b[1] - a[1]).slice(0, 3).map(k => k[0]);

    const adviceText = await GeminiService.getFinancialAdvice(monthIncome, monthExpense, topCats, 'zh-CN');
    setAdvice(adviceText || "保持良好的记账习惯！");
    setLoadingAdvice(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-md mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-slate-500 text-sm font-medium">{t('total_assets')}</h2>
          <h1 className="text-3xl font-bold text-slate-800">{symbol}{totalBalance.toLocaleString()}</h1>
        </div>
        <div className="bg-slate-200 p-2 rounded-full cursor-pointer hover:bg-slate-300 transition-colors">
           <Search size={20} className="text-slate-600" />
        </div>
      </div>

      {/* Monthly Summary Card */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-5 text-white shadow-xl shadow-emerald-200">
        <h3 className="text-emerald-100 text-sm mb-4">{t('this_month')}</h3>
        <div className="flex justify-between">
          <div>
            <div className="flex items-center gap-1 text-emerald-100 mb-1 text-xs uppercase tracking-wider">
              <ArrowDownRight size={14} /> {t('income')}
            </div>
            <span className="text-xl font-semibold">{symbol}{monthIncome.toLocaleString()}</span>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-1 text-rose-200 mb-1 text-xs uppercase tracking-wider">
               {t('expense')} <ArrowUpRight size={14} />
            </div>
            <span className="text-xl font-semibold text-white">{symbol}{monthExpense.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* AI Insight */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="flex items-start gap-3">
          <div className="bg-purple-100 p-2 rounded-lg text-purple-600 shrink-0">
            <Sparkles size={20} />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-slate-800 text-sm mb-1">{t('ai_insight')}</h4>
            <p className="text-xs text-slate-500 leading-relaxed min-h-[40px]">
              {loadingAdvice ? t('ai_loading') : (advice || t('ai_default'))}
            </p>
            {!advice && !loadingAdvice && (
              <button 
                onClick={generateAdvice}
                className="mt-2 text-xs bg-purple-600 text-white px-3 py-1.5 rounded-md hover:bg-purple-700 transition"
              >
                {t('ai_button')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex justify-between items-end mb-4">
          <h3 className="font-bold text-lg text-slate-800">{t('recent_activity')}</h3>
          <span className="text-xs text-emerald-600 font-medium">{t('view_all')}</span>
        </div>
        
        <div className="space-y-3">
          {transactions.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">{t('no_transactions')}</div>
          ) : (
            transactions.slice(0, 5).map((t) => {
              const category = user ? StorageService.getCategories(user.id).find(c => c.id === t.categoryId) : null;
              return (
                <div 
                  key={t.id} 
                  onClick={() => navigate(`/edit/${t.id}`)}
                  className="flex items-center bg-white p-3 rounded-xl shadow-sm border border-slate-50 cursor-pointer active:scale-[0.98] active:bg-slate-50 transition-all"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${category?.color || 'bg-slate-100'}`}>
                    <IconRenderer name={category?.icon || 'DollarSign'} className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800">{category ? getCategoryName(category.id, category.name) : '未分类'}</p>
                    <p className="text-xs text-slate-400">{t.note || format(new Date(t.date), 'MMM d, HH:mm')}</p>
                  </div>
                  <span className={`font-semibold text-sm ${t.type === 'expense' ? 'text-slate-800' : 'text-emerald-600'}`}>
                    {t.type === 'expense' ? '-' : '+'}{symbol}{t.amount}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
