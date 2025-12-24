import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { AddTransaction } from './pages/AddTransaction';
import { Stats } from './pages/Stats';
import { Accounts } from './pages/Accounts';
import { Profile } from './pages/Profile';
import { Auth } from './pages/Auth';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CurrencyProvider } from './contexts/CurrencyContext';

const AppContent: React.FC = () => {
  const { user, isSkipped } = useAuth();
  
  // If user is neither logged in nor skipped auth, redirect to Auth page
  // We exclude /auth from this check
  const showAuth = !user && !isSkipped;

  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/add" element={showAuth ? <Navigate to="/auth" /> : <AddTransaction />} />
      <Route path="/edit/:id" element={showAuth ? <Navigate to="/auth" /> : <AddTransaction />} />
      <Route path="*" element={
        showAuth ? <Navigate to="/auth" /> : (
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="/accounts" element={<Accounts />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </Layout>
        )
      } />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <CurrencyProvider>
        <AuthProvider>
          <Router>
            <AppContent />
          </Router>
        </AuthProvider>
      </CurrencyProvider>
    </LanguageProvider>
  );
};

export default App;
