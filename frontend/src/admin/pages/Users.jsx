import React, { useState, useEffect, useCallback } from 'react';

const Pill = ({ label, color }) => (
  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${color}`}>{label}</span>
);

const Users = ({ ADMIN_API, authHeaders }) => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editData, setEditData] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.append('search', search);
      if (filter) params.append('filter', filter);
      const res = await fetch(`${ADMIN_API}/users?${params}`, { headers: authHeaders });
      const data = await res.json();
      setUsers(data.users || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, search, filter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const openUser = async (userId) => {
    try {
      const res = await fetch(`${ADMIN_API}/users/${userId}`, { headers: authHeaders });
      const data = await res.json();
      setSelectedUser(data);
      setEditData({
        balance: data.user.balance,
        points: data.user.points,
        name: data.user.name || '',
        isPremium: data.user.isPremium || false,
        isBanned: data.user.isBanned || false,
        verificationBadge: data.user.verificationBadge || 'none'
      });
    } catch (e) { console.error(e); }
  };

  const saveUser = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`${ADMIN_API}/users/${selectedUser.user._id}`, {
        method: 'PUT', headers: authHeaders, body: JSON.stringify(editData),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      showToast('✅ User updated successfully');
      setSelectedUser(null);
      fetchUsers();
    } catch (e) { showToast('❌ ' + e.message); }
    finally { setActionLoading(false); }
  };

  const toggleBan = async (user) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${ADMIN_API}/users/${user._id}`, {
        method: 'PUT', headers: authHeaders,
        body: JSON.stringify({ isBanned: !user.isBanned }),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      showToast(`✅ User ${user.isBanned ? 'unbanned' : 'banned'}`);
      fetchUsers();
    } catch (e) { showToast('❌ ' + e.message); }
    finally { setActionLoading(false); }
  };

  const deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to DELETE this user? This cannot be undone.')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${ADMIN_API}/users/${userId}`, { method: 'DELETE', headers: authHeaders });
      if (!res.ok) throw new Error((await res.json()).message);
      showToast('✅ User deleted');
      fetchUsers();
    } catch (e) { showToast('❌ ' + e.message); }
    finally { setActionLoading(false); }
  };

  return (
    <div className="space-y-5">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl text-sm font-bold shadow-2xl ${toast.startsWith('✅') ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>{toast}</div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            type="text"
            placeholder="Search by name, email, referral code..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-[#111827] border border-slate-700 focus:border-indigo-500 rounded-xl text-white placeholder-slate-600 text-sm font-medium outline-none"
          />
        </div>
        <select value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }}
          className="bg-[#111827] border border-slate-700 text-slate-300 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-indigo-500">
          <option value="">All Users</option>
          <option value="banned">Banned</option>
          <option value="premium">Premium</option>
        </select>
        <div className="flex items-center gap-2 text-slate-400 text-sm font-medium bg-[#111827] border border-slate-800 rounded-xl px-4">
          Total: <span className="text-white font-bold">{total}</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50">
                <th className="text-left text-slate-500 text-xs font-bold uppercase tracking-wider px-5 py-3">User</th>
                <th className="text-left text-slate-500 text-xs font-bold uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Balance</th>
                <th className="text-left text-slate-500 text-xs font-bold uppercase tracking-wider px-5 py-3 hidden md:table-cell">Points</th>
                <th className="text-left text-slate-500 text-xs font-bold uppercase tracking-wider px-5 py-3 hidden lg:table-cell">Joined</th>
                <th className="text-left text-slate-500 text-xs font-bold uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-right text-slate-500 text-xs font-bold uppercase tracking-wider px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan={6} className="py-12 text-center text-slate-500">
                  <svg className="animate-spin w-8 h-8 text-indigo-500 mx-auto" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                </td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-slate-500 font-medium">No users found</td></tr>
              ) : users.map(u => (
                <tr key={u._id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                        {(u.name || u.phoneOrEmail || '?')[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-white font-semibold text-xs flex items-center gap-1 truncate max-w-[120px]">
                          {(u.verificationBadge === 'blue' || u.verificationBadge === 'purple' || u.verificationBadge === 'golden') && (
                            <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-black ${u.verificationBadge === 'golden' ? 'bg-amber-500 text-white' : 'bg-purple-600 text-white'}`}>
                              ✓
                            </span>
                          )}
                        </div>
                        <div className="text-slate-500 text-[10px] truncate max-w-[120px]">{u.phoneOrEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 hidden sm:table-cell text-amber-400 font-bold text-xs">{(u.balance || 0).toLocaleString()} Coins</td>
                  <td className="px-5 py-3 hidden md:table-cell text-indigo-400 font-bold text-xs">{u.points || 0}</td>
                  <td className="px-5 py-3 hidden lg:table-cell text-slate-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1">
                      {u.isBanned && <Pill label="Banned" color="bg-rose-500/20 text-rose-400" />}
                      {u.isPremium && <Pill label="Premium" color="bg-purple-500/20 text-purple-400" />}
                      {!u.isBanned && !u.isPremium && <Pill label="Active" color="bg-emerald-500/20 text-emerald-400" />}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => window.open(`${window.location.origin}?profileId=${u._id}`, '_blank')}
                        className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                        title="View Public Profile"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </button>
                      <button onClick={() => openUser(u._id)} className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      </button>
                      <button onClick={() => toggleBan(u)} disabled={actionLoading}
                        className={`p-1.5 rounded-lg transition-colors ${u.isBanned ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-amber-400 hover:bg-amber-500/10'}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                      </button>
                      <button onClick={() => deleteUser(u._id)} disabled={actionLoading}
                        className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800">
            <span className="text-slate-500 text-xs font-medium">Page {page} of {pages}</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white text-xs font-bold rounded-lg transition-colors">Prev</button>
              <button disabled={page === pages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white text-xs font-bold rounded-lg transition-colors">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedUser(null)} />
          <div className="relative z-10 bg-[#111827] border border-slate-700 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div>
                <h3 className="text-white font-bold text-base flex items-center gap-2">
                  {selectedUser.user.name || 'User Detail'}
                  <button 
                    onClick={() => window.open(`${window.location.origin}?profileId=${selectedUser.user._id}`, '_blank')}
                    className="p-1 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded transition-colors"
                    title="View Public Profile"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </button>
                </h3>
                <p className="text-slate-500 text-xs">{selectedUser.user.phoneOrEmail}</p>
              </div>
              <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-5">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                  <div className="text-amber-400 font-black text-lg">{(selectedUser.user.balance || 0).toLocaleString()} Coins</div>
                  <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mt-0.5">Coin Balance</div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                  <div className="text-indigo-400 font-black text-lg">{selectedUser.user.points || 0}</div>
                  <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mt-0.5">Points</div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                  <div className="text-purple-400 font-black text-lg">{selectedUser.referrals?.length || 0}</div>
                  <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mt-0.5">Referrals</div>
                </div>
              </div>

              {/* Edit Fields */}
              <div className="space-y-3">
                <h4 className="text-white font-bold text-sm">Edit User</h4>
                <div>
                  <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Name</label>
                  <input type="text" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-white text-sm outline-none" />
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Balance (৳)</label>
                  <input type="number" value={editData.balance} onChange={e => setEditData({...editData, balance: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-white text-sm outline-none" />
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Points</label>
                  <input type="number" value={editData.points} onChange={e => setEditData({...editData, points: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-white text-sm outline-none" />
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Verification Badge</label>
                  <select
                    value={editData.verificationBadge}
                    onChange={e => setEditData({...editData, verificationBadge: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-white text-sm outline-none font-medium"
                  >
                    <option value="none">No Badge (None)</option>
                    <option value="purple">Purple Verified Badge</option>
                    <option value="golden">Golden Verified Badge</option>
                  </select>
                </div>
                <div className="flex items-center justify-between bg-slate-800/50 rounded-xl px-4 py-3">
                  <span className="text-slate-300 text-sm font-semibold">Premium IP</span>
                  <button onClick={() => setEditData({...editData, isPremium: !editData.isPremium})}
                    className={`w-12 h-6 rounded-full transition-colors relative ${editData.isPremium ? 'bg-purple-600' : 'bg-slate-700'}`}>
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${editData.isPremium ? 'right-0.5' : 'left-0.5'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between bg-slate-800/50 rounded-xl px-4 py-3">
                  <span className="text-slate-300 text-sm font-semibold">Banned</span>
                  <button onClick={() => setEditData({...editData, isBanned: !editData.isBanned})}
                    className={`w-12 h-6 rounded-full transition-colors relative ${editData.isBanned ? 'bg-rose-600' : 'bg-slate-700'}`}>
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${editData.isBanned ? 'right-0.5' : 'left-0.5'}`} />
                  </button>
                </div>
              </div>

              {/* Recent Transactions */}
              {selectedUser.transactions?.length > 0 && (
                <div>
                  <h4 className="text-white font-bold text-sm mb-2">Recent Transactions</h4>
                  <div className="space-y-1.5">
                    {selectedUser.transactions.slice(0, 5).map((t, i) => (
                      <div key={i} className="flex items-center justify-between bg-slate-800/50 rounded-lg px-3 py-2">
                        <span className="text-slate-400 text-xs truncate flex-1 mr-2">{t.description}</span>
                        <span className={`text-xs font-bold flex-shrink-0 ${t.type === 'withdrawal' ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {t.type === 'withdrawal' ? '-' : '+'}৳{t.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setSelectedUser(null)} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm transition-colors">Cancel</button>
                <button onClick={saveUser} disabled={actionLoading} className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-sm transition-all disabled:opacity-50">
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
