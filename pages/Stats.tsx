import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { StorageService } from '../services/storageService';
import { IconRenderer } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useAuth } from '../contexts/AuthContext';

export const Stats: React.FC = () => {
  const { user } = useAuth();
  const accounts = user ? StorageService.getAccounts(user.id) : [];
  const allTransactions = user ? StorageService.getTransactions(user.id) : [];
  const categories = user ? StorageService.getCategories(user.id) : [];
  const { t, getCategoryName } = useLanguage();
  const { symbol } = useCurrency();

  // Filter transactions to only include those from existing accounts
  const accountIds = new Set(accounts.map(acc => acc.id));
  const transactions = allTransactions.filter(tx => accountIds.has(tx.accountId));

  const expenseData = useMemo(() => {
    const data: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      data[t.categoryId] = (data[t.categoryId] || 0) + t.amount;
    });
    
    return Object.entries(data)
      .map(([catId, value]) => {
        const cat = categories.find(c => c.id === catId);
        const name = cat ? getCategoryName(cat.id, cat.name) : '其他'; 
        return { name, value, color: cat?.color, icon: cat?.icon };
      })
      .sort((a, b) => b.value - a.value);
  }, [transactions, categories, getCategoryName, user]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const monthlyData = useMemo(() => {
    const months: Record<string, {name: string, income: number, expense: number}> = {};
    transactions.forEach(t => {
       const date = new Date(t.date);
       const key = `${date.getMonth()}-${date.getFullYear()}`;
       const name = `${date.getMonth() + 1}月`;
       
       if (!months[key]) months[key] = { name, income: 0, expense: 0 };
       
       if (t.type === 'income') months[key].income += t.amount;
       else months[key].expense += t.amount;
    });
    return Object.values(months).reverse().slice(0, 6); // Last 6 months
  }, [transactions, user]);

  return (
    <div className="p-6 pb-24 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">{t('analysis')}</h1>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6">
        <h3 className="text-sm font-semibold text-slate-500 mb-4">{t('expense_breakdown')}</h3>
        <div className="h-64">
           {expenseData.length > 0 ? (
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={expenseData}
                   cx="50%"
                   cy="50%"
                   innerRadius={60}
                   outerRadius={80}
                   paddingAngle={5}
                   dataKey="value"
                 >
                   {expenseData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                   ))}
                 </Pie>
                 <Tooltip />
               </PieChart>
             </ResponsiveContainer>
           ) : (
             <div className="h-full flex items-center justify-center text-slate-400 text-sm">暂无支出数据</div>
           )}
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6">
        <h3 className="text-sm font-semibold text-slate-500 mb-4">{t('income_vs_expense')}</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-500 mb-4">{t('top_categories')}</h3>
        <div className="space-y-3">
          {expenseData.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                  <IconRenderer name={item.icon || 'DollarSign'} className="w-4 h-4"/>
                </div>
                <span className="text-sm font-medium text-slate-700">{item.name}</span>
              </div>
              <div className="flex items-center gap-4">
                 <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full" 
                      style={{ 
                        width: expenseData[0] ? `${(item.value / expenseData[0].value) * 100}%` : '0%',
                        backgroundColor: COLORS[idx % COLORS.length]
                      }} 
                    />
                 </div>
                 <span className="text-sm font-bold text-slate-800">{symbol}{item.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
