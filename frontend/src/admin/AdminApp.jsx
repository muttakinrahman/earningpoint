import React, { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin';
import AdminLayout from './AdminLayout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Transactions from './pages/Transactions';
import Support from './pages/Support';
import Referrals from './pages/Referrals';
import Settings from './pages/Settings';
import Posts from './pages/Posts';
import Articles from './pages/Articles';
import Missions from './pages/Missions';
import Products from './pages/Products';
import Announcements from './pages/Announcements';
import Verifications from './pages/Verifications';
import Badges from './pages/Badges';
import DatabaseBackup from './pages/DatabaseBackup';
import AdminManagement from './pages/AdminManagement';
import ActivityReports from './pages/ActivityReports';

import { API_BASE as GlobalApiBase } from '../config';
export const API_BASE = GlobalApiBase;
export const ADMIN_API = `${API_BASE}/api/admin`;

const AdminApp = () => {
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('adminToken'));
  const [adminUser, setAdminUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('adminUser') || 'null');
    } catch {
      return null;
    }
  });
  const [activePage, setActivePage] = useState('dashboard');

  useEffect(() => {
    if (adminToken) {
      fetch(`${ADMIN_API}/profile`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.email) {
            setAdminUser(data);
            localStorage.setItem('adminUser', JSON.stringify(data));
          }
        })
        .catch(err => console.error('Failed to sync admin profile:', err));
    }
  }, [adminToken]);

  const handleLogin = (token, user) => {
    localStorage.setItem('adminToken', token);
    if (user) {
      localStorage.setItem('adminUser', JSON.stringify(user));
      setAdminUser(user);
    }
    setAdminToken(token);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setAdminToken(null);
    setAdminUser(null);
  };

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${adminToken}`,
  };

  if (!adminToken) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  const pageProps = { authHeaders, ADMIN_API, setActivePage, adminUser };

  return (
    <AdminLayout
      activePage={activePage}
      setActivePage={setActivePage}
      onLogout={handleLogout}
      ADMIN_API={ADMIN_API}
      authHeaders={authHeaders}
      adminUser={adminUser}
    >
      {activePage === 'dashboard' && <Dashboard {...pageProps} />}
      {activePage === 'users' && <Users {...pageProps} />}
      {activePage === 'activity' && <ActivityReports {...pageProps} />}
      {activePage === 'transactions' && <Transactions {...pageProps} />}
      {activePage === 'support' && <Support {...pageProps} />}
      {activePage === 'referrals' && <Referrals {...pageProps} />}
      {activePage === 'posts' && <Posts {...pageProps} />}
      {activePage === 'articles' && <Articles {...pageProps} />}
      {activePage === 'missions' && <Missions {...pageProps} />}
      {activePage === 'products' && <Products {...pageProps} />}
      {activePage === 'announcements' && <Announcements {...pageProps} />}
      {activePage === 'verifications' && <Verifications {...pageProps} />}
      {activePage === 'badges' && <Badges {...pageProps} />}
      {activePage === 'admins' && <AdminManagement {...pageProps} />}
      {activePage === 'database' && <DatabaseBackup {...pageProps} />}
      {activePage === 'settings' && <Settings {...pageProps} onLogout={handleLogout} />}
    </AdminLayout>
  );
};

export default AdminApp;
