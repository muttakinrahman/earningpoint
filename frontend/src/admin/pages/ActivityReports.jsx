import React, { useState, useEffect, useCallback } from 'react';
import { 
  Clock, 
  Search, 
  Calendar, 
  RefreshCw, 
  Download, 
  Smartphone, 
  Globe, 
  Award, 
  ChevronRight, 
  X, 
  Users as UsersIcon, 
  TrendingUp, 
  Eye, 
  CheckCircle2,
  Filter
} from 'lucide-react';
import VerifiedBadge, { isUserVerified, getUserBadgeType } from '../../components/VerifiedBadge';
import { getImageUrl } from '../../config';

const ActivityReports = ({ ADMIN_API, authHeaders }) => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState('today'); // 'today', 'yesterday', '7days', '30days', 'all', 'custom'
  const [customDate, setCustomDate] = useState('');
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('time_desc');
  const [page, setPage] = useState(1);

  // User History Modal State
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchReports = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 30,
        sortBy,
        platform,
        verifiedOnly: verifiedOnly ? 'true' : 'false'
      });

      if (selectedRange === 'custom' && customDate) {
        params.append('date', customDate);
      } else {
        params.append('range', selectedRange);
      }

      if (search.trim()) {
        params.append('search', search.trim());
      }

      const res = await fetch(`${ADMIN_API}/activity?${params.toString()}`, {
        headers: authHeaders
      });

      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (err) {
      console.error('Failed to fetch activity reports:', err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, [ADMIN_API, authHeaders, page, selectedRange, customDate, search, platform, verifiedOnly, sortBy]);

  useEffect(() => {
    fetchReports(false);
    const interval = setInterval(() => {
      fetchReports(true);
    }, 10000); // Live 10s auto-refresh
    return () => clearInterval(interval);
  }, [fetchReports]);

  // View user detailed 30-day logs
  const openUserHistory = async (userId) => {
    setLoadingDetail(true);
    try {
      const res = await fetch(`${ADMIN_API}/activity/user/${userId}`, {
        headers: authHeaders
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedUserDetail(data);
      }
    } catch (err) {
      console.error('Failed to fetch user activity detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!reports || !reports.users || reports.users.length === 0) return;

    const headers = ['Rank', 'Name', 'Username', 'Phone/Email', 'Verified', 'Platform', 'Time Spent (Formatted)', 'Active Seconds', 'Lifetime Total Time', 'Last Active'];
    const rows = reports.users.map(u => [
      u.rank,
      `"${(u.name || '').replace(/"/g, '""')}"`,
      u.username || '',
      `"${(u.phoneOrEmail || '').replace(/"/g, '""')}"`,
      u.isVerified ? 'Yes' : 'No',
      u.platform,
      `"${u.formattedTime}"`,
      u.activeSeconds,
      `"${u.formattedLifetimeTime}"`,
      u.lastPingAt ? new Date(u.lastPingAt).toLocaleString() : ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `user_activity_${reports.selectedDateLabel || 'report'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const maxSeconds = reports?.users?.[0]?.activeSeconds || 1;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111827] p-5 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <Clock className="w-6 h-6 text-indigo-400" />
            User Screen Time & Activity Reports
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Monitor live active usage, daily screen time (hours, minutes & seconds) and user engagement.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black select-none">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>LIVE (10s auto-sync)</span>
          </div>

          <button
            type="button"
            onClick={() => fetchReports(false)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700 active:scale-95 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            disabled={!reports?.users?.length}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-indigo-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Date & Range Filter Pills */}
      <div className="flex items-center justify-between gap-3 flex-wrap bg-[#111827] p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { id: 'today', label: 'Today (আজকে)' },
            { id: 'yesterday', label: 'Yesterday (গতকাল)' },
            { id: '7days', label: 'Last 7 Days (গত ৭ দিন)' },
            { id: '30days', label: 'Last 30 Days' },
            { id: 'all', label: 'All Time (সর্বমোট)' },
            { id: 'custom', label: 'Custom Date' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setSelectedRange(tab.id);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedRange === tab.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-700/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {selectedRange === 'custom' && (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <input
              type="date"
              value={customDate}
              onChange={(e) => {
                setCustomDate(e.target.value);
                setPage(1);
              }}
              className="bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-1.5 outline-none focus:border-indigo-500"
            />
          </div>
        )}
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Users */}
        <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Active Users</p>
            <h3 className="text-2xl font-black text-white mt-1">
              {reports?.summary?.totalActiveUsers || 0}
            </h3>
            <p className="text-[11px] text-indigo-400 font-bold mt-1">
              Logged in & active ({reports?.selectedDateLabel || 'Today'})
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <UsersIcon className="w-6 h-6" />
          </div>
        </div>

        {/* Total Screen Time */}
        <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Combined Time</p>
            <h3 className="text-lg sm:text-xl font-black text-emerald-400 mt-1">
              {reports?.summary?.formattedTotalTime || '0 sec'}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1 font-mono">
              ~{Math.round((reports?.summary?.totalCombinedSeconds || 0) / 3600 * 10) / 10} hours total
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Average Time Per User */}
        <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Avg Time / User</p>
            <h3 className="text-lg sm:text-xl font-black text-purple-400 mt-1">
              {reports?.summary?.formattedAvgTime || '0 sec'}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">Per active session</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Top User */}
        <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div className="min-w-0 flex-1 mr-2">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Top User ({reports?.selectedDateLabel || 'Today'})</p>
            {reports?.summary?.topUser ? (
              <div className="mt-2 flex items-center gap-2.5">
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 border border-amber-500/30 shadow-xs">
                  {reports.summary.topUser.profilePic ? (
                    <img
                      src={getImageUrl(reports.summary.topUser.profilePic)}
                      alt={reports.summary.topUser.name || 'User'}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : null}
                  <span className="select-none">{(reports.summary.topUser.name || '?')[0].toUpperCase()}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 truncate">
                    <h3 className="text-sm font-black text-amber-400 truncate">
                      {reports.summary.topUser.name || 'User'}
                    </h3>
                    {reports.summary.topUser.isVerified && (
                      <VerifiedBadge 
                        type={reports.summary.topUser.verificationBadge || 'purple'} 
                        iconClassName="w-3.5 h-3.5 inline-block shrink-0" 
                      />
                    )}
                  </div>
                  <p className="text-[11px] text-emerald-400 font-bold font-mono mt-0.5">
                    ⏱️ {reports.summary.topUser.formattedTime}
                  </p>
                </div>
              </div>
            ) : (
              <h3 className="text-sm font-bold text-slate-500 mt-2">No activity yet</h3>
            )}
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#111827] p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, username, email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
          {/* Platform Filter */}
          <select
            value={platform}
            onChange={(e) => {
              setPlatform(e.target.value);
              setPage(1);
            }}
            className="bg-slate-900 border border-slate-700/80 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">All Platforms</option>
            <option value="android">Android App</option>
            <option value="web">Web Browser</option>
          </select>

          {/* Verified Only Filter */}
          <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => {
                setVerifiedOnly(e.target.checked);
                setPage(1);
              }}
              className="rounded accent-indigo-600"
            />
            <span>Verified Only</span>
          </label>

          {/* Sort Filter */}
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            className="bg-slate-900 border border-slate-700/80 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="time_desc">Most Time (Highest)</option>
            <option value="time_asc">Least Time (Lowest)</option>
            <option value="recent">Recently Active</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Users Usage Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                <th className="py-3.5 px-4 text-center w-12">#</th>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Platform</th>
                <th className="py-3.5 px-4 min-w-[200px]">
                  Time Spent ({reports?.selectedDateLabel || 'Today'})
                </th>
                <th className="py-3.5 px-4">Total Screen Time</th>
                <th className="py-3.5 px-4">Last Active</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500 font-bold">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      <span>Loading screen time reports...</span>
                    </div>
                  </td>
                </tr>
              ) : !reports?.users?.length ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500 font-bold">
                    No active user records found for {reports?.selectedDateLabel || 'this period'}.
                  </td>
                </tr>
              ) : (
                reports.users.map((item) => {
                  const percent = Math.min(100, Math.round((item.activeSeconds / maxSeconds) * 100));

                  return (
                    <tr key={item.userId} className="hover:bg-slate-850/50 transition-colors">
                      {/* Rank */}
                      <td className="py-3 px-4 text-center font-bold">
                        {item.rank === 1 ? (
                          <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 inline-flex items-center justify-center font-black text-xs">1</span>
                        ) : item.rank === 2 ? (
                          <span className="w-6 h-6 rounded-full bg-slate-300/20 text-slate-300 inline-flex items-center justify-center font-black text-xs">2</span>
                        ) : item.rank === 3 ? (
                          <span className="w-6 h-6 rounded-full bg-amber-700/20 text-amber-600 inline-flex items-center justify-center font-black text-xs">3</span>
                        ) : (
                          <span className="text-slate-500 font-mono text-[11px]">{item.rank}</span>
                        )}
                      </td>

                      {/* User Info with Verified Badge */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shrink-0 border border-slate-700 shadow-xs">
                            {item.profilePic ? (
                              <img
                                src={getImageUrl(item.profilePic)}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                              />
                            ) : null}
                            <span className="select-none">{(item.name || item.phoneOrEmail || '?')[0].toUpperCase()}</span>
                            {item.isOnline && (
                              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900 animate-pulse" title="Online now" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white truncate max-w-[150px] sm:max-w-[200px]">
                                {item.name}
                              </span>
                              {item.isVerified && (
                                <VerifiedBadge 
                                  type={item.verificationBadge || 'purple'} 
                                  iconClassName="w-3.5 h-3.5 inline-block shrink-0" 
                                />
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400 truncate block">
                              {item.username ? `@${item.username}` : item.phoneOrEmail}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Platform */}
                      <td className="py-3 px-4">
                        {item.platform === 'android' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <Smartphone className="w-3 h-3" />
                            <span>Android</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            <Globe className="w-3 h-3" />
                            <span>Web</span>
                          </span>
                        )}
                      </td>

                      {/* Active Time on Date */}
                      <td className="py-3 px-4">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-black text-sm text-emerald-400 font-mono">
                              {item.formattedTime}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {item.activeSeconds}s
                            </span>
                          </div>
                          {/* Relative progress bar */}
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 h-full rounded-full transition-all"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Lifetime Total Time */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-300">
                        {item.formattedLifetimeTime}
                      </td>

                      {/* Last Active */}
                      <td className="py-3 px-4">
                        {item.isOnline ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            Online now
                          </span>
                        ) : item.lastPingAt ? (
                          <span className="text-[11px] text-slate-400">
                            {new Date(item.lastPingAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => openUserHistory(item.userId)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600/20 text-slate-300 hover:text-indigo-400 border border-slate-700 transition-all text-xs font-bold inline-flex items-center gap-1 active:scale-95 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>History</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {reports?.pagination?.pages > 1 && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Showing page {reports.pagination.page} of {reports.pagination.pages} ({reports.pagination.total} users)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-bold text-slate-300 hover:bg-slate-700 disabled:opacity-40"
              >
                Prev
              </button>
              <button
                type="button"
                disabled={page >= reports.pagination.pages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-bold text-slate-300 hover:bg-slate-700 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User 30-Day Activity History Modal */}
      {selectedUserDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-[#111827] rounded-2xl border border-slate-800 shadow-2xl p-6 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <img
                  src={selectedUserDetail.user.profilePic ? getImageUrl(selectedUserDetail.user.profilePic) : `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUserDetail.user.name || 'U')}&background=6366f1&color=fff`}
                  alt={selectedUserDetail.user.name}
                  className="w-11 h-11 rounded-full object-cover border border-slate-700"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-base font-black text-white">
                      {selectedUserDetail.user.name}
                    </h3>
                    {selectedUserDetail.user.isVerified && (
                      <VerifiedBadge 
                        type={selectedUserDetail.user.verificationBadge || 'purple'} 
                        iconClassName="w-4 h-4 inline-block shrink-0" 
                      />
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    {selectedUserDetail.user.username ? `@${selectedUserDetail.user.username}` : selectedUserDetail.user.phoneOrEmail}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedUserDetail(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lifetime Summary */}
            <div className="my-4 p-3.5 bg-slate-900/60 rounded-xl border border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">All-Time Screen Time</span>
                <span className="text-base font-black text-emerald-400 font-mono">
                  {selectedUserDetail.user.formattedLifetimeTime}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Last Active</span>
                <span className="text-xs font-bold text-slate-300">
                  {selectedUserDetail.user.lastActiveAt ? new Date(selectedUserDetail.user.lastActiveAt).toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>

            {/* 30-Day Breakdown Table */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2">
                Daily Usage Logs (Last 30 Days)
              </h4>

              {selectedUserDetail.dailyLogs.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs font-bold">
                  No daily activity logs recorded for this user yet.
                </div>
              ) : (
                selectedUserDetail.dailyLogs.map(log => (
                  <div
                    key={log._id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-xs font-black">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">
                          {log.date}
                        </span>
                        <span className="text-[10px] text-slate-500 capitalize">
                          {log.platform || 'web'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-emerald-400 font-mono block">
                        {log.formattedTime}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {log.activeSeconds} seconds
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedUserDetail(null)}
              className="mt-4 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityReports;
