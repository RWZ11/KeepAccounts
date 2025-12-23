import { Transaction, Account, Category, User } from '../types';
import { DEFAULT_CATEGORIES } from '../constants';

const KEYS = {
  USERS_LIST: 'zenledger_users_registry',
  CURRENT_USER: 'zenledger_current_session',
  SKIP_AUTH: 'zenledger_skip_auth'
};

// Helper function to generate user-specific keys
const getUserKey = (baseKey: string, userId: string) => `${baseKey}_${userId}`;

// Data migration logic
const migrateLegacyData = (userId: string) => {
  // Check if legacy data exists
  const legacyTransactions = localStorage.getItem(KEYS.TRANSACTIONS);
  const legacyAccounts = localStorage.getItem(KEYS.ACCOUNTS);

  if (legacyTransactions && !localStorage.getItem(getUserKey('zenledger_transactions', userId))) {
    const transactions = JSON.parse(legacyTransactions);
    const migratedTransactions = transactions.map((tx: any) => ({ ...tx, userId }));
    localStorage.setItem(getUserKey('zenledger_transactions', userId), JSON.stringify(migratedTransactions));
  }

  if (legacyAccounts && !localStorage.getItem(getUserKey('zenledger_accounts', userId))) {
    const accounts = JSON.parse(legacyAccounts);
    const migratedAccounts = accounts.map((acc: any) => ({ ...acc, userId }));
    localStorage.setItem(getUserKey('zenledger_accounts', userId), JSON.stringify(migratedAccounts));
  }
};

export const StorageService = {
  // --- Transaction Logic ---
  getTransactions: (userId: string): Transaction[] => {
    const data = localStorage.getItem(getUserKey('zenledger_transactions', userId));
    return data ? JSON.parse(data) : [];
  },
  getTransactionById: (id: string, userId: string): Transaction | undefined => {
    return StorageService.getTransactions(userId).find(t => String(t.id) === String(id));
  },
  saveTransactions: (transactions: Transaction[], userId: string) => {
    localStorage.setItem(getUserKey('zenledger_transactions', userId), JSON.stringify(transactions));
  },
  addTransaction: (transaction: Transaction, userId: string) => {
    const list = StorageService.getTransactions(userId);
    list.push(transaction);
    StorageService.saveTransactions(list, userId);
    const accounts = StorageService.getAccounts(userId);
    const accountIndex = accounts.findIndex(a => String(a.id) === String(transaction.accountId));
    if (accountIndex >= 0) {
      if (transaction.type === 'expense') accounts[accountIndex].balance -= transaction.amount;
      else if (transaction.type === 'income') accounts[accountIndex].balance += transaction.amount;
      StorageService.saveAccounts(accounts, userId);
    }
  },
  updateTransaction: (updatedTx: Transaction, userId: string) => {
    const transactions = StorageService.getTransactions(userId);
    const oldIndex = transactions.findIndex(t => String(t.id) === String(updatedTx.id));
    if (oldIndex === -1) return;
    const oldTx = transactions[oldIndex];
    const accounts = StorageService.getAccounts(userId);
    const oldAccIndex = accounts.findIndex(a => String(a.id) === String(oldTx.accountId));
    if (oldAccIndex >= 0) {
      if (oldTx.type === 'expense') accounts[oldAccIndex].balance += oldTx.amount;
      else if (oldTx.type === 'income') accounts[oldAccIndex].balance -= oldTx.amount;
    }
    const newAccIndex = accounts.findIndex(a => String(a.id) === String(updatedTx.accountId));
    if (newAccIndex >= 0) {
      if (updatedTx.type === 'expense') accounts[newAccIndex].balance -= updatedTx.amount;
      else if (updatedTx.type === 'income') accounts[newAccIndex].balance += updatedTx.amount;
    }
    transactions[oldIndex] = updatedTx;
    StorageService.saveTransactions(transactions, userId);
    StorageService.saveAccounts(accounts, userId);
  },
  deleteTransaction: (id: string, userId: string) => {
    const transactions = StorageService.getTransactions(userId);
    const txIndex = transactions.findIndex(t => String(t.id) === String(id));
    if (txIndex === -1) return;
    const txToDelete = transactions[txIndex];
    const accounts = StorageService.getAccounts(userId);
    const accIndex = accounts.findIndex(a => String(a.id) === String(txToDelete.accountId));
    if (accIndex >= 0) {
      if (txToDelete.type === 'expense') accounts[accIndex].balance += txToDelete.amount;
      else if (txToDelete.type === 'income') accounts[accIndex].balance -= txToDelete.amount;
    }
    const newList = transactions.filter(t => String(t.id) !== String(id));
    StorageService.saveTransactions(newList, userId);
    StorageService.saveAccounts(accounts, userId);
  },

  // --- Account Logic ---
  getAccounts: (userId: string): Account[] => {
    const data = localStorage.getItem(getUserKey('zenledger_accounts', userId));
    return data ? JSON.parse(data) : [];
  },
  saveAccounts: (accounts: Account[], userId: string) => {
    localStorage.setItem(getUserKey('zenledger_accounts', userId), JSON.stringify(accounts));
  },
  addAccount: (account: Account, userId: string) => {
    const list = StorageService.getAccounts(userId);
    list.push(account);
    StorageService.saveAccounts(list, userId);
  },
  removeAccount: (id: string, userId: string) => {
    const list = StorageService.getAccounts(userId).filter(a => String(a.id) !== String(id));
    StorageService.saveAccounts(list, userId);
  },

  // --- Category Logic ---
  getCategories: (userId: string): Category[] => {
    const data = localStorage.getItem(getUserKey('zenledger_categories', userId));
    return data ? JSON.parse(data) : DEFAULT_CATEGORIES.map(cat => ({ ...cat, userId }));
  },

  // --- User / Auth Logic ---
  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  },
  setCurrentUser: (user: User | null) => {
    if (user) localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    else localStorage.removeItem(KEYS.CURRENT_USER);
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
      // Migrate legacy data for this user
      migrateLegacyData(safeUser.id);
      return safeUser;
    }
    return null;
  }
};