import React, { useState, useEffect } from 'react'
import {
  Shield,
  Users,
  Layers,
  MessageSquare,
  Database,
  ArrowLeft,
  Search,
  CheckCircle2,
  Trash2,
  RefreshCw,
  LogOut,
  Sliders,
  Server,
  AlertTriangle,
  Sun,
  Moon,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import type { AdminStats, AdminWorkspaceItem } from '../types'
import { API_ENDPOINTS } from '../apiConfig'

interface AdminLayoutProps {
  onSwitchToChat: () => void
}

interface UserAdminRow {
  id: number
  username: string
  email: string
  role: 'admin' | 'user'
  workspace_count: number
  conversation_count: number
  created_at?: string
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onSwitchToChat }) => {
  const { user, token, logout, dbConnected, checkDbStatus } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [activeTab, setActiveTab] = useState<'users' | 'workspaces' | 'settings'>('users')
  const [stats, setStats] = useState<AdminStats>({
    total_users: 2,
    total_workspaces: 2,
    total_conversations: 5,
    total_messages: 18,
    database_type: 'MySQL',
  })
  const [usersList, setUsersList] = useState<UserAdminRow[]>([
    { id: 1, username: 'admin', email: 'admin@sahaj.ai', role: 'admin', workspace_count: 1, conversation_count: 3 },
    { id: 2, username: 'sahaj_user', email: 'user@sahaj.ai', role: 'user', workspace_count: 1, conversation_count: 2 },
  ])
  const [workspacesList, setWorkspacesList] = useState<AdminWorkspaceItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const showNotification = (type: 'success' | 'error', text: string) => {
    setNotification({ type, text })
    setTimeout(() => setNotification(null), 3000)
  }

  const fetchAdminData = async () => {
    setIsLoading(true)
    await checkDbStatus()
    if (token && !token.startsWith('demo_token_')) {
      try {
        // Stats
        const statsRes = await fetch(API_ENDPOINTS.ADMIN.STATS, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (statsRes.ok) {
          const statsData = await statsRes.json()
          if (statsData.success) setStats(statsData.stats)
        }

        // Users
        const usersRes = await fetch(API_ENDPOINTS.ADMIN.USERS, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (usersRes.ok) {
          const usersData = await usersRes.json()
          if (usersData.success && usersData.users) setUsersList(usersData.users)
        }

        // Workspaces
        const wsRes = await fetch(API_ENDPOINTS.ADMIN.WORKSPACES, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (wsRes.ok) {
          const wsData = await wsRes.json()
          if (wsData.success && wsData.workspaces) setWorkspacesList(wsData.workspaces)
        }
      } catch (err) {
        console.warn('Admin fetch note:', err)
      }
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchAdminData()
  }, [])

  const handleRoleToggle = async (userId: number, currentRole: 'admin' | 'user') => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    if (userId === user?.id && newRole !== 'admin') {
      showNotification('error', 'Cannot demote your own admin account')
      return
    }

    try {
      if (token && !token.startsWith('demo_token_')) {
        const res = await fetch(API_ENDPOINTS.ADMIN.USER_ROLE(userId), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ role: newRole }),
        })
        const data = await res.json()
        if (!data.success) {
          showNotification('error', data.error || 'Failed to update role')
          return
        }
      }
      setUsersList(prev => prev.map(u => (u.id === userId ? { ...u, role: newRole } : u)))
      showNotification('success', `User role updated to ${newRole}`)
    } catch {
      showNotification('error', 'Failed to update role')
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (userId === user?.id) {
      showNotification('error', 'Cannot delete your own admin account')
      return
    }
    if (!confirm('Are you sure you want to delete this user and all their workspaces?')) return

    try {
      if (token && !token.startsWith('demo_token_')) {
        const res = await fetch(API_ENDPOINTS.ADMIN.USER_BY_ID(userId), {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (!data.success) {
          showNotification('error', data.error || 'Failed to delete user')
          return
        }
      }
      setUsersList(prev => prev.filter(u => u.id !== userId))
      showNotification('success', 'User removed successfully')
    } catch {
      showNotification('error', 'Failed to delete user')
    }
  }

  const filteredUsers = usersList.filter(
    u =>
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 font-sans flex flex-col">
      {/* ========================================================= */}
      {/* ADMIN HEADER */}
      {/* ========================================================= */}
      <header className="min-h-16 px-3 sm:px-6 py-2.5 sm:py-0 bg-[#111723] border-b border-gray-800 flex flex-wrap items-center justify-between gap-2.5 shrink-0 sticky top-0 z-30">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#FACC15] flex items-center justify-center text-gray-950 font-bold shadow-md shadow-yellow-500/20 shrink-0">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">sahajAI Admin</h1>
              <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-[#FACC15]/15 border border-[#FACC15]/30 text-[#FACC15] text-[9px] sm:text-[10px] font-mono font-bold uppercase">
                Control Center
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-gray-400 hidden xs:block">Multi-tenant Workspace & User Oversight</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Switch to Chat Button */}
          <button
            onClick={onSwitchToChat}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-gray-800 hover:bg-gray-750 border border-gray-700 text-white text-xs font-semibold transition cursor-pointer hover:border-[#FACC15]"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FACC15]" />
            <span className="hidden sm:inline">sahajAI Chat</span>
            <span className="sm:hidden">Chat</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="theme-toggle-btn p-1.5 sm:p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-[#FACC15] transition cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-[#FACC15]" /> : <Moon className="w-4 h-4 text-blue-500" />}
          </button>

          {/* Refresh Data */}
          <button
            onClick={fetchAdminData}
            disabled={isLoading}
            className="p-1.5 sm:p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition cursor-pointer disabled:opacity-50"
            title="Refresh Metrics"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#FACC15]' : ''}`} />
          </button>

          {/* Admin Profile & Logout */}
          <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-gray-800">
            <div className="text-right">
              <p className="text-xs font-semibold text-white truncate max-w-[80px] sm:max-w-none">{user?.username || 'Admin'}</p>
              <p className="text-[10px] text-gray-400 hidden sm:block">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 sm:p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-gray-800 transition cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`fixed top-20 right-6 z-50 px-4 py-2.5 rounded-xl shadow-xl text-xs font-medium border flex items-center gap-2 ${
            notification.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-600 text-emerald-200'
              : 'bg-red-950/90 border-red-600 text-red-200'
          }`}
        >
          {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{notification.text}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* MAIN ADMIN DASHBOARD BODY */}
      {/* ========================================================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6 overflow-x-hidden">
        {/* STATS OVERVIEW CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Users */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#121722] border border-gray-800 hover:border-[#FACC15]/40 transition duration-200 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Users</span>
              <div className="w-9 h-9 rounded-xl bg-[#FACC15]/10 text-[#FACC15] flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{stats.total_users}</span>
              <span className="text-xs text-gray-500 ml-2">Registered Accounts</span>
            </div>
          </div>

          {/* Card 2: Workspaces */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#121722] border border-gray-800 hover:border-[#FACC15]/40 transition duration-200 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Workspaces</span>
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{stats.total_workspaces}</span>
              <span className="text-xs text-gray-500 ml-2">Isolated Environments</span>
            </div>
          </div>

          {/* Card 3: Conversations */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#121722] border border-gray-800 hover:border-[#FACC15]/40 transition duration-200 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Conversations</span>
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{stats.total_conversations}</span>
              <span className="text-xs text-gray-500 ml-2">Active Chat Sessions</span>
            </div>
          </div>

          {/* Card 4: Database & Messages */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#121722] border border-gray-800 hover:border-[#FACC15]/40 transition duration-200 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Database Status</span>
              <div className={`w-9 h-9 rounded-xl ${dbConnected ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'} flex items-center justify-center`}>
                <Database className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{stats.total_messages}</span>
                <span className="text-xs text-gray-500 ml-2">Messages</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${dbConnected ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'}`}>
                {dbConnected ? 'MySQL 8' : 'Standby'}
              </span>
            </div>
          </div>
        </div>

        {/* TAB CONTROLS */}
        <div className="flex items-center gap-2 border-b border-gray-800 pb-3 overflow-x-auto whitespace-nowrap scrollbar-none">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
              activeTab === 'users'
                ? 'bg-[#FACC15] text-gray-950 shadow-md shadow-yellow-500/15'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Management</span>
          </button>

          <button
            onClick={() => setActiveTab('workspaces')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
              activeTab === 'workspaces'
                ? 'bg-[#FACC15] text-gray-950 shadow-md shadow-yellow-500/15'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Workspace Oversight</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
              activeTab === 'settings'
                ? 'bg-[#FACC15] text-gray-950 shadow-md shadow-yellow-500/15'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>System Configuration</span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: USER MANAGEMENT */}
        {/* ========================================================= */}
        {activeTab === 'users' && (
          <div className="bg-[#121722] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
            {/* Table Header & Search */}
            <div className="p-4 border-b border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white">Registered Users & Access Roles</h3>
                <p className="text-xs text-gray-400">Manage privileges, role changes, and workspace assignments</p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Filter users..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-[#0d1117] border border-gray-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FACC15]"
                />
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0e131d] text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4 text-center">Workspaces</th>
                    <th className="py-3 px-4 text-center">Conversations</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-gray-850/40 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-gray-800 flex items-center justify-center font-bold text-gray-300 uppercase">
                            {u.username[0]}
                          </div>
                          <span className="font-semibold text-white">{u.username}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-300 font-mono text-[11px]">{u.email}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            u.role === 'admin'
                              ? 'bg-[#FACC15]/15 text-[#FACC15] border border-[#FACC15]/30'
                              : 'bg-gray-800 text-gray-300 border border-gray-700'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-gray-300 font-medium">
                        {u.workspace_count || 1}
                      </td>
                      <td className="py-3 px-4 text-center text-gray-300 font-medium">
                        {u.conversation_count || 0}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleRoleToggle(u.id, u.role)}
                            className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 text-[11px] font-medium transition cursor-pointer"
                          >
                            Set {u.role === 'admin' ? 'User' : 'Admin'}
                          </button>
                          {u.id !== user?.id && (
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="p-1 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-950/30 transition cursor-pointer"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: WORKSPACE OVERSIGHT */}
        {/* ========================================================= */}
        {activeTab === 'workspaces' && (
          <div className="bg-[#121722] border border-gray-800 rounded-2xl overflow-hidden shadow-xl p-5">
            <h3 className="text-sm font-bold text-white mb-1">Global Workspace Directory</h3>
            <p className="text-xs text-gray-400 mb-4">All isolated tenant workspaces and data containers</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {workspacesList.length === 0 ? (
                <>
                  <div className="p-4 rounded-xl bg-[#0d1117] border border-gray-800">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-3 h-3 rounded-full bg-[#FACC15]" />
                      <h4 className="text-xs font-bold text-white">Admin Workspace</h4>
                    </div>
                    <p className="text-[11px] text-gray-400">Owner: admin (admin@sahaj.ai)</p>
                    <div className="mt-3 pt-2 border-t border-gray-800/80 flex justify-between text-[11px] text-gray-500">
                      <span>Status: Default</span>
                      <span>3 Conversations</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-[#0d1117] border border-gray-800">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-400" />
                      <h4 className="text-xs font-bold text-white">Default Workspace</h4>
                    </div>
                    <p className="text-[11px] text-gray-400">Owner: sahaj_user (user@sahaj.ai)</p>
                    <div className="mt-3 pt-2 border-t border-gray-800/80 flex justify-between text-[11px] text-gray-500">
                      <span>Status: Active</span>
                      <span>2 Conversations</span>
                    </div>
                  </div>
                </>
              ) : (
                workspacesList.map(ws => (
                  <div key={ws.id} className="p-4 rounded-xl bg-[#0d1117] border border-gray-800">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: ws.icon_color }} />
                      <h4 className="text-xs font-bold text-white">{ws.name}</h4>
                    </div>
                    <p className="text-[11px] text-gray-400">Owner: {ws.username} ({ws.email})</p>
                    <div className="mt-3 pt-2 border-t border-gray-800/80 flex justify-between text-[11px] text-gray-500">
                      <span>Created: {new Date(ws.created_at).toLocaleDateString()}</span>
                      <span>{ws.conversation_count} Conversations</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: SYSTEM CONFIGURATION */}
        {/* ========================================================= */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Database Engine Settings */}
            <div className="p-5 rounded-2xl bg-[#121722] border border-gray-800">
              <div className="flex items-center gap-2.5 mb-4">
                <Database className="w-5 h-5 text-[#FACC15]" />
                <h3 className="text-sm font-bold text-white">MySQL Database Settings</h3>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-gray-800">
                  <span className="text-gray-400">Host & Port</span>
                  <span className="text-white font-mono">localhost:3306</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-800">
                  <span className="text-gray-400">Database Name</span>
                  <span className="text-[#FACC15] font-mono font-bold">sahaj_ai</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-800">
                  <span className="text-gray-400">Driver</span>
                  <span className="text-white font-mono">PyMySQL (Pure Python)</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-400">Connection State</span>
                  <span className={`font-semibold ${dbConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {dbConnected ? '● Online & Healthy' : '○ Standby / Service Checking'}
                  </span>
                </div>
              </div>
            </div>

            {/* LLM Engine Settings */}
            <div className="p-5 rounded-2xl bg-[#121722] border border-gray-800">
              <div className="flex items-center gap-2.5 mb-4">
                <Server className="w-5 h-5 text-[#FACC15]" />
                <h3 className="text-sm font-bold text-white">LLM Server & Models</h3>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-gray-800">
                  <span className="text-gray-400">Remote API Host</span>
                  <span className="text-white font-mono truncate max-w-[200px]">122.163.121.176:3041</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-800">
                  <span className="text-gray-400">Default Model</span>
                  <span className="text-[#FACC15] font-mono font-bold">mistral:latest</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-800">
                  <span className="text-gray-400">Secondary Model</span>
                  <span className="text-white font-mono">qwen2.5-coder:1.5b</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-400">Streaming Protocol</span>
                  <span className="text-emerald-400 font-semibold">Server-Sent Events (SSE)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
