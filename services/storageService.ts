import { Transaction, Account, Category, User } from '../types';
import { DEFAULT_CATEGORIES } from '../constants';

const KEYS = {
  TRANSACTIONS_BASE: 'zenledger_transactions',
  ACCOUNTS_BASE: 'zenledger_accounts',
  CATEGORIES: 'zenledger_categories',
  USERS_LIST: 'zenledger_users_registry',
  CURRENT_USER: 'zenledger_current_session',
  SKIP_AUTH: 'zenledger_skip_auth'
};

/**
 * Helper to get the current data prefix based on the logged-in user or guest status.
 */
const getDataPrefix = (): string => {
  const userStr = localStorage.getItem(KEYS.CURRENT_USER);
  if (userStr) {
    const user = JSON.parse(userStr) as User;
    return `user_${user.id}`;
  }
  return 'guest';
};

const getTKey = () => `${KEYS.TRANSACTIONS_BASE}_${getDataPrefix()}`;
const getAKey = () => `${KEYS.ACCOUNTS_BASE}_${getDataPrefix()}`;

export const StorageService = {
  // --- Transaction Logic ---
  getTransactions: (): Transaction[] => {
    const data = localStorage.getItem(getTKey());
    return data ? JSON.parse(data) : [];
  },
  getTransactionById: (id: string): Transaction | undefined => {
    return StorageService.getTransactions().find(t => String(t.id) === String(id));
  },
  saveTransactions: (transactions: Transaction[]) => {
    localStorage.setItem(getTKey(), JSON.stringify(transactions));
  },
  addTransaction: (transaction: Transaction) => {
    const list = StorageService.getTransactions();
    list.push(transaction);
    StorageService.saveTransactions(list);
    
    const accounts = StorageService.getAccounts();
    const accountIndex = accounts.findIndex(a => String(a.id) === String(transaction.accountId));
    if (accountIndex >= 0) {
      if (transaction.type === 'expense') accounts[accountIndex].balance -= transaction.amount;
      else if (transaction.type === 'income') accounts[accountIndex].balance += transaction.amount;
      StorageService.saveAccounts(accounts);
    }
  },
  updateTransaction: (updatedTx: Transaction) => {
    const transactions = StorageService.getTransactions();
    const oldIndex = transactions.findIndex(t => String(t.id) === String(updatedTx.id));
    if (oldIndex === -1) return;
    
    const oldTx = transactions[oldIndex];
    const accounts = StorageService.getAccounts();
    
    // Revert old impact
    const oldAccIndex = accounts.findIndex(a => String(a.id) === String(oldTx.accountId));
    if (oldAccIndex >= 0) {
      if (oldTx.type === 'expense') accounts[oldAccIndex].balance += oldTx.amount;
      else if (oldTx.type === 'income') accounts[oldAccIndex].balance -= oldTx.amount;
    }
    
    // Apply new impact
    const newAccIndex = accounts.findIndex(a => String(a.id) === String(updatedTx.accountId));
    if (newAccIndex >= 0) {
      if (updatedTx.type === 'expense') accounts[newAccIndex].balance -= updatedTx.amount;
      else if (updatedTx.type === 'income') accounts[newAccIndex].balance += updatedTx.amount;
    }
    
    transactions[oldIndex] = updatedTx;
    StorageService.saveTransactions(transactions);
    StorageService.saveAccounts(accounts);
  },
  deleteTransaction: (id: string) => {
    const transactions = StorageService.getTransactions();
    const txIndex = transactions.findIndex(t => String(t.id) === String(id));
    if (txIndex === -1) return;
    
    const txToDelete = transactions[txIndex];
    const accounts = StorageService.getAccounts();
    const accIndex = accounts.findIndex(a => String(a.id) === String(txToDelete.accountId));
    if (accIndex >= 0) {
      if (txToDelete.type === 'expense') accounts[accIndex].balance += txToDelete.amount;
      else if (txToDelete.type === 'income') accounts[accIndex].balance -= txToDelete.amount;
    }
    
    const newList = transactions.filter(t => String(t.id) !== String(id));
    StorageService.saveTransactions(newList);
    StorageService.saveAccounts(accounts);
  },

  // --- Account Logic ---
  getAccounts: (): Account[] => {
    const data = localStorage.getItem(getAKey());
    return data ? JSON.parse(data) : [];
  },
  saveAccounts: (accounts: Account[]) => {
    localStorage.setItem(getAKey(), JSON.stringify(accounts));
  },
  addAccount: (account: Account) => {
    const list = StorageService.getAccounts();
    list.push(account);
    StorageService.saveAccounts(list);
  },
  removeAccount: (id: string) => {
    const list = StorageService.getAccounts().filter(a => String(a.id) !== String(id));
    StorageService.saveAccounts(list);
  },

  // --- Category Logic ---
  getCategories: (): Category[] => {
    const data = localStorage.getItem(KEYS.CATEGORIES);
    return data ? JSON.parse(data) : DEFAULT_CATEGORIES;
  },

  // --- User / Auth Logic ---
  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  },
  setCurrentUser: (user: User | null) => {
    if (user) {
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(KEYS.CURRENT_USER);
    }
  },
  getSkipAuth: (): boolean => {
    return localStorage.getItem(KEYS.SKIP_AUTH) === 'true';
  },
  setSkipAuth: (skip: boolean) => {
    localStorage.setItem(KEYS.SKIP_AUTH, skip ? 'true' : 'false');
  },
  registerUser: (username: string, password: string): User => {
    const registry = JSON.parse(localStorage.getItem(KEYS.USERS_LIST) || '{}');
    if (registry[username]) throw new Error("User already exists");
    const newUser: User = { id: Date.now().toString(), username };
    registry[username] = { ...newUser, password };
    localStorage.setItem(KEYS.USERS_LIST, JSON.stringify(registry));
    return newUser;
  },
  loginUser: (username: string, password: string): User | null => {
    const registry = JSON.parse(localStorage.getItem(KEYS.USERS_LIST) || '{}');
    const user = registry[username];
    if (user && user.password === password) {
      const { password: _, ...safeUser } = user;
      return safeUser;
    }
    return null;
  }
};