import React, { useState, useEffect, useCallback } from 'react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
  )},
  { id: 'users', label: 'Users', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
  )},
  { id: 'activity', label: 'Screen Time & Activity', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  )},
  { id: 'transactions', label: 'Transactions', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
  )},
  { id: 'support', label: 'Support', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
  )},
  { id: 'referrals', label: 'Referrals', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
  )},
  { id: 'posts', label: 'Posts', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v12a2 2 0 01-2 2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 2v4a2 2 0 002 2h4" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12h10M7 16h10" /></svg>
  )},
  { id: 'articles', label: 'Articles', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
  )},
  { id: 'missions', label: 'Missions', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
  )},
  { id: 'products', label: 'Products', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
  )},
  { id: 'announcements', label: 'Announcements', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
  )},
  { id: 'verifications', label: 'Verifications', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
  )},
  { id: 'badges', label: 'Give Badges', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z" /></svg>
  )},
  { id: 'admins', label: 'Admin Team', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
  )},
  { id: 'database', label: 'Database Backup', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
  )},
  { id: 'settings', label: 'Settings', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
  )},
];

const AdminLayout = ({ activePage, setActivePage, onLogout, ADMIN_API, authHeaders, adminUser, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  // Change Password state
  const [showPassModal, setShowPassModal] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  const fetchNotifications = useCallback(async () => {
    if (!ADMIN_API || !authHeaders) return;
    try {
      const res = await fetch(`${ADMIN_API}/notifications`, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data || []);
        setUnreadCount(data ? data.filter(n => !n.isRead).length : 0);
      }
    } catch (e) {
      console.error('Failed to fetch admin notifications:', e);
    }
  }, [ADMIN_API, authHeaders]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // 15s polling
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id, type) => {
    try {
      await fetch(`${ADMIN_API}/notifications/${id}/read`, {
        method: 'PUT',
        headers: authHeaders
      });
      fetchNotifications();
      setShowNotifDropdown(false);
      
      // Page redirection
      if (type === 'support') setActivePage('support');
      else if (type === 'verification') setActivePage('verifications');
      else if (type === 'withdrawal') setActivePage('transactions');
      else if (type === 'premium') setActivePage('premium');
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch(`${ADMIN_API}/notifications/read-all`, {
        method: 'PUT',
        headers: authHeaders
      });
      fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteNotification = async (e, id) => {
    e.stopPropagation();
    try {
      await fetch(`${ADMIN_API}/notifications/${id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      setPassError('New passwords do not match');
      return;
    }
    if (newPass.length < 6) {
      setPassError('Password must be at least 6 characters');
      return;
    }
    setPassLoading(true);
    setPassError('');
    setPassSuccess('');
    try {
      const res = await fetch(`${ADMIN_API}/change-password`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ currentPassword: currentPass, newPassword: newPass }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update password');
      setPassSuccess('Password updated successfully!');
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
      setTimeout(() => {
        setShowPassModal(false);
        setPassSuccess('');
      }, 1500);
    } catch (err) {
      setPassError(err.message);
    } finally {
      setPassLoading(false);
    }
  };

  // Filter nav items based on role & permissions
  const filteredNavItems = navItems.filter(item => {
    if (!adminUser) return true;
    if (adminUser.role === 'super_admin') return true;
    if (item.id === 'admins') return false; // only Super Admin
    return Array.isArray(adminUser.permissions) && adminUser.permissions.includes(item.id);
  });

  const NavItem = ({ item }) => {
    const isActive = activePage === item.id;
    return (
      <button
        onClick={() => { setActivePage(item.id); setSidebarOpen(false); }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
          isActive
            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 font-bold'
            : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
        }`}
      >
        {item.icon}
        {item.label}
      </button>
    );
  };

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-[#0F172A]">
      {/* Brand Logo Header */}
      <div className="flex items-center gap-3.5 px-5 py-5 border-b border-slate-800/80 bg-slate-900/40">
        <img
          src="/zenivio-logo.png"
          alt="Zenivio Logo"
          className="w-10 h-10 rounded-xl object-contain shadow-lg border border-indigo-500/20 bg-slate-900 p-0.5"
        />
        <div>
          <div className="text-white font-black text-base tracking-tight leading-tight">Zenivio</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-indigo-400 text-[10px] font-bold tracking-widest uppercase">Admin Panel</span>
            {adminUser?.role === 'super_admin' ? (
              <span className="text-[9px] font-black text-amber-400 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.2 rounded tracking-wide">SUPER</span>
            ) : (
              <span className="text-[9px] font-black text-indigo-400 bg-indigo-500/15 border border-indigo-500/30 px-1.5 py-0.2 rounded tracking-wide">STAFF</span>
            )}
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {filteredNavItems.map(item => <NavItem key={item.id} item={item} />)}
      </nav>

      {/* User Info / Actions */}
      <div className="px-3 pb-4 border-t border-slate-800/80 pt-3 bg-slate-900/30">
        <div className="flex items-center gap-3 px-3 py-2.5 mb-2 rounded-xl bg-slate-800/40 border border-slate-800/60">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-md ${
            adminUser?.role === 'super_admin'
              ? 'bg-gradient-to-tr from-amber-500 to-indigo-600 border border-amber-400/40'
              : 'bg-gradient-to-tr from-indigo-600 to-purple-600'
          }`}>
            {adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-white text-xs font-bold truncate flex items-center gap-1">
              {adminUser?.name || 'Administrator'}
              {adminUser?.role === 'super_admin' && <span className="text-amber-400 text-[10px]">👑</span>}
            </div>
            <div className="text-slate-400 text-[11px] truncate font-mono">{adminUser?.email || 'admin@zenivio.com'}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => { setShowPassModal(true); setPassError(''); setPassSuccess(''); }}
            className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white transition-all text-xs font-bold border border-slate-700/60"
            title="Change Password"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
            Password
          </button>
          <button
            onClick={onLogout}
            className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-rose-950/30 hover:bg-rose-900/50 text-rose-300 hover:text-white transition-all text-xs font-bold border border-rose-900/40"
            title="Sign Out"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Logout
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#0B1120] overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0 border-r border-slate-800 overflow-y-auto">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative z-10 w-72 flex-shrink-0 border-r border-slate-800 overflow-y-auto">
            <Sidebar />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="flex items-center gap-4 px-4 lg:px-6 py-4 border-b border-slate-800 bg-[#0F172A] flex-shrink-0">
          <button
            className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          
          <div className="flex-1 flex items-center gap-3">
            <img
              src="/zenivio-logo.png"
              alt="Zenivio Logo"
              className="w-8 h-8 rounded-lg object-contain border border-indigo-500/20 bg-slate-900 p-0.5 shadow-sm"
            />
            <div>
              <h1 className="text-white font-bold text-base sm:text-lg capitalize leading-tight">
                {navItems.find(n => n.id === activePage)?.label || activePage}
              </h1>
              <div className="text-[10px] text-slate-400 font-medium hidden sm:block">
                Zenivio Management Console
              </div>
            </div>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="relative p-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-all duration-200 active:scale-95 flex items-center justify-center"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 border-2 border-[#0F172A] rounded-full flex items-center justify-center text-[10px] font-bold text-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <>
                <div className="fixed inset-0 z-[998]" onClick={() => setShowNotifDropdown(false)} />
                <div className="absolute right-[-10px] sm:right-0 mt-3 w-[calc(100vw-32px)] sm:w-96 max-w-sm bg-[#111827] border border-slate-800 rounded-2xl shadow-2xl z-[999] overflow-hidden flex flex-col max-h-[420px] animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/50">
                    <span className="text-white font-black text-xs uppercase tracking-wider">Alerts</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-bold transition-colors"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="overflow-y-auto flex-1 divide-y divide-slate-800/60 max-h-[320px]">
                    {notifications.length === 0 ? (
                      <div className="py-10 text-center text-slate-500 font-medium text-xs">No alerts found</div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n._id}
                          onClick={() => handleMarkAsRead(n._id, n.type)}
                          className={`p-4 flex gap-3 cursor-pointer hover:bg-slate-800/30 transition-colors ${!n.isRead ? 'bg-indigo-950/20' : ''}`}
                        >
                          <div className="flex-shrink-0">
                            <span className="w-8 h-8 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-center text-sm shadow-sm">
                              {n.type === 'support' ? '💬' :
                               n.type === 'verification' ? '📝' :
                               n.type === 'withdrawal' ? '🏦' :
                               n.type === 'premium' ? '🚀' : '📢'}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-1.5">
                              <span className={`text-xs block truncate ${!n.isRead ? 'text-white font-black' : 'text-slate-400 font-bold'}`}>
                                {n.title}
                              </span>
                              <span className="text-[9px] text-slate-500 font-bold whitespace-nowrap">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-semibold leading-relaxed mt-1 break-words">
                              {n.message}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <button
                              onClick={(e) => handleDeleteNotification(e, n._id)}
                              className="p-1 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-rose-400 transition-colors"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Change Password quick button in Header */}
          <button
            onClick={() => { setShowPassModal(true); setPassError(''); setPassSuccess(''); }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-all shadow-sm"
            title="Change Password"
          >
            <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            <span>Password</span>
          </button>

          <div className="flex items-center gap-2 bg-[#111827] border border-slate-800 px-3 py-1.5 rounded-xl">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Live</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>

      {/* Change Password Modal */}
      {showPassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => !passLoading && setShowPassModal(false)} />
          <div className="relative z-10 w-full max-w-md bg-[#111827] border border-slate-800 rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Change Admin Password</h3>
                  <p className="text-slate-400 text-xs mt-0.5">{adminUser?.email || 'admin@zenivio.com'}</p>
                </div>
              </div>
              <button
                onClick={() => setShowPassModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {passSuccess && (
              <div className="mb-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl px-4 py-2.5 text-xs font-bold">
                ✓ {passSuccess}
              </div>
            )}
            {passError && (
              <div className="mb-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl px-4 py-2.5 text-xs font-bold">
                ⚠️ {passError}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPass}
                  onChange={e => setCurrentPass(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full bg-[#1E293B] border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-white font-medium text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPass}
                  onChange={e => setNewPass(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-[#1E293B] border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-white font-medium text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPass}
                  onChange={e => setConfirmPass(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full bg-[#1E293B] border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-white font-medium text-sm outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowPassModal(false)}
                  disabled={passLoading}
                  className="px-4 py-2 text-slate-400 hover:text-white text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passLoading}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/25 disabled:opacity-50 flex items-center gap-2"
                >
                  {passLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;
