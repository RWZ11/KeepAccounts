import React, { createContext, useContext, useState, useEffect } from 'react';

export type CurrencyCode = 'CNY' | 'USD' | 'EUR' | 'GBP' | 'JPY';

interface CurrencyContextType {
  currency: CurrencyCode;
  symbol: string;
  setCurrency: (code: CurrencyCode) => void;
}

const symbols: Record<CurrencyCode, string> = {
  CNY: '¥',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
};

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    return (localStorage.getItem('zenledger_currency') as CurrencyCode) || 'CNY';
  });

  const setCurrency = (code: CurrencyCode) => {
    localStorage.setItem('zenledger_currency', code);
    setCurrencyState(code);
  };

  const symbol = symbols[currency];

  return (
    <CurrencyContext.Provider value={{ currency, symbol, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
};
