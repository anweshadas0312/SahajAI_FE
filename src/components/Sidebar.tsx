import React, { useState, useEffect, useRef } from 'react'
import {
  Plus,
  MessageSquare,
  Trash2,
  ChevronDown,
  ChevronRight,
  Shield,
  LogOut,
  FolderPlus,
  LogIn,
  Search,
  PanelLeft,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useWorkspace } from '../context/WorkspaceContext'
import { useTheme } from '../context/ThemeContext'
import { ThinkingBulb } from './ThinkingBulb'
import { WorkspaceModal } from './WorkspaceModal'

interface SidebarProps {
  isMobileSidebarOpen: boolean
  setIsMobileSidebarOpen: (isOpen: boolean) => void
  isGenerating: boolean
  onSwitchToAdmin?: () => void
  onRequireAuth?: () => void
  handleStartNewChat: () => void
  isSidebarCollapsed: boolean
  setIsSidebarCollapsed: (isCollapsed: boolean) => void
  onOpenSearch: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
  isGenerating,
  onSwitchToAdmin,
  onRequireAuth,
  handleStartNewChat,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  onOpenSearch,
}) => {
  const { user, logout, isAdmin, isAuthenticated } = useAuth()
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const {
    workspaces,
    currentWorkspace,
    setCurrentWorkspace,
    deleteWorkspace,
    conversations,
    currentConversationId,
    setCurrentConversationId,
    deleteConversation,
  } = useWorkspace()

  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false)
  const [isCreateWsOpen, setIsCreateWsOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isHelpSubmenuOpen, setIsHelpSubmenuOpen] = useState(false)
  const [isRecentsOpen, setIsRecentsOpen] = useState(false)
  const [isWorkspaceMiniOpen, setIsWorkspaceMiniOpen] = useState(false)
  const [isProfileMiniOpen, setIsProfileMiniOpen] = useState(false)
  const [isProfileMiniHelpOpen, setIsProfileMiniHelpOpen] = useState(false)

  const profileRef = useRef<HTMLDivElement>(null)
  const workspaceRef = useRef<HTMLDivElement>(null)
  const recentsRef = useRef<HTMLDivElement>(null)
  const workspaceMiniRef = useRef<HTMLDivElement>(null)
  const profileMiniRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (profileRef.current && !profileRef.current.contains(target)) {
        setIsProfileMenuOpen(false)
        setIsHelpSubmenuOpen(false)
      }
      if (workspaceRef.current && !workspaceRef.current.contains(target)) {
        setIsWorkspaceMenuOpen(false)
      }
      if (recentsRef.current && !recentsRef.current.contains(target)) {
        setIsRecentsOpen(false)
      }
      if (workspaceMiniRef.current && !workspaceMiniRef.current.contains(target)) {
        setIsWorkspaceMiniOpen(false)
      }
      if (profileMiniRef.current && !profileMiniRef.current.contains(target)) {
        setIsProfileMiniOpen(false)
        setIsProfileMiniHelpOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed md:relative inset-y-0 left-0 z-40 h-full flex flex-col justify-between shrink-0 select-none transition-all duration-300 ease-in-out shadow-2xl md:shadow-none border-r pb-[72px] md:pb-0 ${
          isLight ? 'bg-white border-gray-200' : 'bg-[#121722] border-gray-800/80'
        } ${
          isMobileSidebarOpen
            ? 'translate-x-0 w-72 max-w-[85vw]'
            : '-translate-x-full md:translate-x-0'
        } ${
          isSidebarCollapsed ? 'md:w-16 overflow-visible' : 'md:w-72'
        }`}
      >
        {/* Collapsed Mini-Sidebar Rail (ChatGPT-style) */}
        {isSidebarCollapsed && (
          <div className="hidden md:flex flex-col items-center justify-between h-full w-16 py-3.5 px-2 select-none overflow-visible relative">
            {/* Top Group */}
            <div className="flex flex-col items-center gap-2 w-full">
              {/* SahajAI Logo with ChatGPT-style Hover-to-Expand Toggle */}
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(false)}
                className={`group relative w-10 h-10 rounded-xl flex items-center justify-center transition cursor-pointer ${
                  isLight
                    ? 'hover:bg-gray-100 text-gray-600 hover:text-gray-950'
                    : 'hover:bg-gray-800 text-gray-400 hover:text-white'
                }`}
                title="Expand sidebar"
                aria-label="Expand sidebar"
              >
                {/* Default Bulb Logo (visible normally, hides on hover) */}
                <div className="flex items-center justify-center transition-all duration-200 group-hover:opacity-0 group-hover:scale-75 pointer-events-none">
                  <ThinkingBulb state={isGenerating ? 'thinking' : 'lit'} size={28} />
                </div>

                {/* Expand Sidebar Icon (hidden normally, appears on hover like ChatGPT) */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 scale-75 transition-all duration-200 group-hover:opacity-100 group-hover:scale-100 pointer-events-none">
                  <PanelLeft className="w-5 h-5" />
                </div>
              </button>

              {/* Subtle Divider */}
              <div className={`w-8 h-px my-0.5 ${isLight ? 'bg-gray-200' : 'bg-gray-800'}`} />

              {/* New Chat Button */}
              <button
                type="button"
                onClick={handleStartNewChat}
                className="w-10 h-10 rounded-xl bg-[#EAB308] hover:bg-[#d9a406] text-gray-950 flex items-center justify-center shadow-md shadow-yellow-500/15 cursor-pointer transition font-bold"
                title="New chat"
                aria-label="New chat"
              >
                <Plus className="w-5 h-5" />
              </button>

              {/* Global Search Button */}
              <button
                type="button"
                onClick={onOpenSearch}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition cursor-pointer ${
                  isLight
                    ? 'text-gray-500 hover:text-gray-950 hover:bg-gray-100'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
                title="Search chats (Ctrl+K)"
                aria-label="Search chats"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Current Workspace Pill / Selector Flyout */}
              <div className="relative" ref={workspaceMiniRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsWorkspaceMiniOpen(prev => !prev)
                    setIsRecentsOpen(false)
                    setIsProfileMiniOpen(false)
                  }}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition cursor-pointer ${
                    isWorkspaceMiniOpen
                      ? isLight
                        ? 'bg-gray-100 ring-2 ring-yellow-500/40'
                        : 'bg-gray-800 ring-2 ring-yellow-500/40'
                      : isLight
                      ? 'hover:bg-gray-100'
                      : 'hover:bg-gray-800'
                  }`}
                  title={`Workspace: ${currentWorkspace?.name || 'Default Workspace'}`}
                  aria-label={`Workspace: ${currentWorkspace?.name || 'Default Workspace'}`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full ring-2 ring-offset-2 transition"
                    style={{
                      backgroundColor: currentWorkspace?.icon_color || '#EAB308',
                    }}
                  />
                </button>

                {isWorkspaceMiniOpen && (
                  <div
                    className={`absolute left-full top-0 ml-3 w-64 rounded-2xl border shadow-2xl p-2 z-[100] origin-top-left transition-all ${
                      isLight
                        ? 'bg-white border-gray-200/90 shadow-2xl text-gray-900'
                        : 'bg-[#151c28] border-gray-700/80 shadow-2xl shadow-black/80 text-white'
                    }`}
                  >
                    <div className="px-3 pt-2 pb-1.5 text-xs font-semibold text-gray-400 select-none flex items-center justify-between">
                      <span>Workspaces</span>
                      <span className="text-[10px] font-normal text-gray-400">
                        {workspaces.length} total
                      </span>
                    </div>

                    <div className="space-y-0.5 mt-0.5 max-h-56 overflow-y-auto">
                      {workspaces.map(ws => (
                        <div
                          key={ws.id}
                          onClick={() => {
                            setCurrentWorkspace(ws)
                            setIsWorkspaceMiniOpen(false)
                          }}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition ${
                            currentWorkspace?.id === ws.id
                              ? isLight
                                ? 'bg-amber-100/70 text-amber-950 font-bold'
                                : 'bg-[#EAB308]/15 text-[#EAB308] font-bold'
                              : isLight
                              ? 'text-gray-700 hover:bg-gray-100'
                              : 'text-gray-300 hover:bg-gray-800'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: ws.icon_color }}
                            />
                            <span className="truncate">{ws.name}</span>
                          </div>
                          {!ws.is_default && workspaces.length > 1 && (
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation()
                                deleteWorkspace(ws.id)
                              }}
                              className="opacity-40 hover:opacity-100 hover:text-red-500 p-1"
                              title="Delete workspace"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className={`pt-1 mt-1 border-t ${isLight ? 'border-gray-200' : 'border-gray-800'}`}>
                      <button
                        type="button"
                        onClick={() => {
                          setIsWorkspaceMiniOpen(false)
                          if (!isAuthenticated) {
                            onRequireAuth?.()
                            return
                          }
                          setIsCreateWsOpen(true)
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-amber-600 dark:text-[#EAB308] hover:bg-amber-50 dark:hover:bg-[#EAB308]/10 font-medium transition cursor-pointer"
                      >
                        <FolderPlus className="w-3.5 h-3.5" />
                        <span>New Workspace</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Recent Chats Flyout Popover (ChatGPT-style) */}
              <div className="relative" ref={recentsRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsRecentsOpen(prev => !prev)
                    setIsWorkspaceMiniOpen(false)
                    setIsProfileMiniOpen(false)
                  }}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition cursor-pointer ${
                    isRecentsOpen
                      ? isLight
                        ? 'bg-gray-100 text-gray-950 shadow-sm'
                        : 'bg-gray-800 text-white'
                      : isLight
                      ? 'text-gray-500 hover:text-gray-950 hover:bg-gray-100'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                  title="Recent chats"
                  aria-label="Recent chats"
                >
                  <MessageSquare className="w-5 h-5" />
                </button>

                {isRecentsOpen && (
                  <div
                    className={`absolute left-full top-0 ml-3 w-64 sm:w-72 max-h-[380px] overflow-y-auto rounded-2xl border shadow-2xl p-2 z-[100] origin-top-left transition-all ${
                      isLight
                        ? 'bg-white border-gray-200/90 shadow-2xl text-gray-900'
                        : 'bg-[#151c28] border-gray-700/80 shadow-2xl shadow-black/80 text-white'
                    }`}
                  >
                    <div
                      className="px-3 pt-2 pb-1.5 text-xs font-semibold text-gray-400 select-none flex items-center justify-between"
                    >
                      <span>Recents</span>
                      <span className="text-[10px] font-normal text-gray-400">
                        {conversations.length} chats
                      </span>
                    </div>

                    <div className="space-y-0.5 mt-0.5">
                      {conversations.length === 0 ? (
                        <div
                          className={`px-3 py-6 text-center text-xs ${
                            isLight ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        >
                          No recent chats
                        </div>
                      ) : (
                        conversations.map(conv => (
                          <div
                            key={conv.id}
                            onClick={() => {
                              setCurrentConversationId(conv.id)
                              setIsRecentsOpen(false)
                            }}
                            className={`group w-full text-left px-3 py-2 rounded-xl text-xs sm:text-[13px] transition truncate cursor-pointer flex items-center justify-between ${
                              currentConversationId === conv.id
                                ? isLight
                                  ? 'bg-amber-100/70 text-amber-950 font-semibold'
                                  : 'bg-[#EAB308]/15 text-[#EAB308] font-semibold'
                                : isLight
                                ? 'text-gray-700 hover:bg-gray-100 hover:text-black'
                                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                            }`}
                            title={conv.title || 'Untitled Conversation'}
                          >
                            <div className="flex items-center gap-2 truncate flex-1 min-w-0 mr-1">
                              <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isLight ? 'text-amber-600' : 'opacity-60'}`} />
                              <span className="truncate">
                                {conv.title || 'Untitled Conversation'}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation()
                                deleteConversation(conv.id)
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition shrink-0"
                              title="Delete chat"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Group: Admin (if applicable) & User Profile */}
            <div className="flex flex-col items-center gap-2 w-full">
              {isAdmin && onSwitchToAdmin && (
                <button
                  type="button"
                  onClick={onSwitchToAdmin}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition cursor-pointer ${
                    isLight
                      ? 'text-amber-800 hover:bg-amber-100'
                      : 'text-[#EAB308] hover:bg-gray-800'
                  }`}
                  title="Admin Dashboard"
                  aria-label="Admin Dashboard"
                >
                  <Shield className="w-4 h-4" />
                </button>
              )}

              {/* User Avatar Circle */}
              {isAuthenticated ? (
                <div className="relative" ref={profileMiniRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMiniOpen(prev => !prev)
                      setIsWorkspaceMiniOpen(false)
                      setIsRecentsOpen(false)
                    }}
                    title={`${user?.username || 'User'} (${user?.email || ''})`}
                    className="w-9 h-9 rounded-full bg-[#EAB308] text-gray-950 flex items-center justify-center text-xs font-black shadow-md border border-yellow-500/40 uppercase cursor-pointer hover:scale-105 transition"
                  >
                    {user?.username ? user.username.slice(0, 2).toUpperCase() : 'U'}
                  </button>

                  {isProfileMiniOpen && (
                    <div
                      className={`absolute left-full bottom-0 ml-3 w-64 rounded-2xl border shadow-2xl p-2 z-[100] origin-bottom-left transition-all ${
                        isLight
                          ? 'bg-white border-gray-200/90 shadow-2xl text-gray-900'
                          : 'bg-[#151c28] border-gray-700/80 shadow-2xl shadow-black/80 text-white'
                      }`}
                    >
                      {/* User Info */}
                      <div className={`flex items-center gap-2.5 p-2 rounded-xl mb-1 ${
                        isLight ? 'bg-gray-50' : 'bg-gray-800/40'
                      }`}>
                        <div className="w-8 h-8 rounded-full bg-[#EAB308] text-gray-950 flex items-center justify-center text-xs font-black shadow-sm uppercase shrink-0">
                          {user?.username ? user.username[0].toUpperCase() : 'U'}
                        </div>
                        <div className="truncate">
                          <p className={`text-xs font-semibold truncate ${isLight ? 'text-gray-950' : 'text-white'}`}>
                            {user?.username || 'User'}
                          </p>
                          <p className={`text-[10px] truncate ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                            {user?.email}
                          </p>
                        </div>
                      </div>

                      {/* Admin Switcher (if admin) */}
                      {isAdmin && onSwitchToAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileMiniOpen(false)
                            onSwitchToAdmin()
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-xs rounded-xl transition cursor-pointer mb-1 ${
                            isLight
                              ? 'text-amber-800 hover:bg-amber-50'
                              : 'text-[#EAB308] hover:bg-gray-800'
                          }`}
                        >
                          <Shield className="w-4 h-4" />
                          <span>Admin Dashboard</span>
                        </button>
                      )}

                      {/* Help Menu */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation()
                            setIsProfileMiniHelpOpen(prev => !prev)
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition cursor-pointer ${
                            isLight
                              ? 'text-gray-700 hover:bg-gray-100 hover:text-black'
                              : 'text-gray-200 hover:bg-gray-800 hover:text-white'
                          }`}
                        >
                          <span>Help & Support</span>
                          <ChevronRight
                            className={`w-3.5 h-3.5 transition-transform ${
                              isProfileMiniHelpOpen ? 'rotate-90' : ''
                            }`}
                          />
                        </button>

                        {isProfileMiniHelpOpen && (
                          <div
                            className={`mt-1 flex flex-col gap-0.5 p-1 rounded-xl ${
                              isLight ? 'bg-gray-50' : 'bg-gray-800/50'
                            }`}
                          >
                            <a
                              href="/privacy-policy"
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => setIsProfileMiniOpen(false)}
                              className={`block px-3 py-1.5 text-xs rounded-lg transition ${
                                isLight
                                  ? 'text-gray-600 hover:bg-gray-200 hover:text-black'
                                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                              }`}
                            >
                              Privacy Policy
                            </a>
                            <a
                              href="/disclaimer"
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => setIsProfileMiniOpen(false)}
                              className={`block px-3 py-1.5 text-xs rounded-lg transition ${
                                isLight
                                  ? 'text-gray-600 hover:bg-gray-200 hover:text-black'
                                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                              }`}
                            >
                              Disclaimer
                            </a>
                            <a
                              href="/terms"
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => setIsProfileMiniOpen(false)}
                              className={`block px-3 py-1.5 text-xs rounded-lg transition ${
                                isLight
                                  ? 'text-gray-600 hover:bg-gray-200 hover:text-black'
                                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                              }`}
                            >
                              Terms and Conditions
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Sign Out Button */}
                      <div className={`pt-1 mt-1 border-t ${isLight ? 'border-gray-200' : 'border-gray-800'}`}>
                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileMiniOpen(false)
                            logout()
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-xs rounded-xl transition cursor-pointer ${
                            isLight
                              ? 'text-red-600 hover:bg-red-50'
                              : 'text-red-400 hover:bg-red-950/30'
                          }`}
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onRequireAuth?.()}
                  className="w-9 h-9 rounded-full bg-[#EAB308] text-gray-950 flex items-center justify-center text-xs font-bold shadow-md cursor-pointer hover:scale-105 transition"
                  title="Sign In / Register"
                >
                  <LogIn className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Full Sidebar View (when expanded or on mobile drawer) */}
        <div
          className={`flex-1 flex flex-col justify-between h-full w-72 min-h-0 overflow-hidden ${
            isSidebarCollapsed ? 'md:hidden' : 'flex'
          }`}
        >
          <div className="w-72 p-4 flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Top Branding & Workspace Selector */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="shrink-0 flex items-center justify-center">
                  <ThinkingBulb state={isGenerating ? 'thinking' : 'lit'} size={36} />
                </div>
                <div className="truncate">
                  <h1 className="text-base font-extrabold tracking-tight leading-none"><span className="text-[#EAB308]">sahaj</span><span className={theme === 'dark' ? "text-white" : "text-black"}>AI</span></h1>
                </div>
              </div>

              {/* Action buttons beside sahajAI: Search & Collapse (like ChatGPT) */}
              <div className="flex items-center gap-1 shrink-0">
                {/* Global Search Button */}
                <button
                  type="button"
                  onClick={onOpenSearch}
                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                    isLight
                      ? 'text-gray-500 hover:text-gray-950 hover:bg-gray-100'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                  title="Search chats (Ctrl+K)"
                  aria-label="Search chats"
                >
                  <Search className="w-4 h-4" />
                </button>

                {/* Sidebar Collapse Button (Desktop) */}
                <button
                  type="button"
                  onClick={() => setIsSidebarCollapsed(true)}
                  className={`hidden md:flex p-1.5 rounded-lg transition cursor-pointer ${
                    isLight
                      ? 'text-gray-500 hover:text-gray-950 hover:bg-gray-100'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                  title="Close sidebar"
                  aria-label="Close sidebar"
                >
                  <PanelLeft className="w-4 h-4" />
                </button>

                {/* Mobile Drawer Close Button */}
                <button
                  type="button"
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className={`md:hidden p-1.5 rounded-lg transition cursor-pointer ${
                    isLight
                      ? 'text-gray-500 hover:text-gray-950 hover:bg-gray-100'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                  title="Close sidebar"
                  aria-label="Close sidebar"
                >
                  <PanelLeft className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Workspace Dropdown Button */}
            <div className="relative" ref={workspaceRef}>
              <button
                onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
                className={`w-full border text-left px-3.5 py-2.5 rounded-xl flex items-center justify-between transition cursor-pointer ${isLight
                  ? 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-900'
                  : 'bg-[#182030] hover:bg-[#1f293d] border-gray-700/70 text-white'
                  }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: currentWorkspace?.icon_color || '#EAB308' }}
                  />
                  <div className="truncate">
                    <p className={`text-xs font-semibold truncate ${isLight ? 'text-gray-950' : 'text-white'}`}>{currentWorkspace?.name || 'Workspace'}</p>
                    <p className={`text-[10px] truncate ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                      {conversations.length} conversation{conversations.length === 1 ? '' : 's'}
                    </p>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 shrink-0 ${isLight ? 'text-gray-500' : 'text-gray-400'}`} />
              </button>

              {/* Workspace Dropdown Menu */}
              {isWorkspaceMenuOpen && (
                <div className={`absolute top-full left-0 right-0 mt-1.5 rounded-xl p-1.5 z-40 border max-h-56 overflow-y-auto ${isLight
                  ? 'bg-white border-gray-200 shadow-xl'
                  : 'glass-dropdown border-gray-700'
                  }`}>
                  <div className={`px-2 py-1 text-[10px] uppercase font-bold tracking-wider ${isLight ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                    Your Workspaces
                  </div>
                  {workspaces.map(ws => (
                    <div
                      key={ws.id}
                      onClick={() => {
                        setCurrentWorkspace(ws)
                        setIsWorkspaceMenuOpen(false)
                        setIsMobileSidebarOpen(false)
                      }}
                      className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition ${currentWorkspace?.id === ws.id
                        ? 'bg-[#EAB308]/15 text-amber-700 font-bold dark:text-[#EAB308]'
                        : isLight
                          ? 'text-gray-700 hover:bg-gray-100'
                          : 'text-gray-300 hover:bg-gray-800'
                        }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: ws.icon_color }} />
                        <span className="truncate">{ws.name}</span>
                      </div>
                      {!ws.is_default && workspaces.length > 1 && (
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            deleteWorkspace(ws.id)
                          }}
                          className="opacity-40 hover:opacity-100 hover:text-red-500 p-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}

                  <div className={`pt-1 mt-1 border-t ${isLight ? 'border-gray-200' : 'border-gray-800'}`}>
                    <button
                      onClick={() => {
                        setIsWorkspaceMenuOpen(false)
                        setIsMobileSidebarOpen(false)
                        if (!isAuthenticated) {
                          onRequireAuth?.()
                          return
                        }
                        setIsCreateWsOpen(true)
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-lg text-xs text-amber-600 dark:text-[#EAB308] hover:bg-amber-50 dark:hover:bg-[#EAB308]/10 font-medium transition cursor-pointer"
                    >
                      <FolderPlus className="w-3.5 h-3.5" />
                      <span>New Workspace</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* New Chat Button */}
          <button
            onClick={handleStartNewChat}
            className="w-full bg-[#EAB308] hover:bg-[#EAB308] text-gray-950 font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition duration-200 shadow-md shadow-yellow-500/15 cursor-pointer mb-4 text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>

          {/* Conversation History for Current Workspace */}
          <div className="flex-1 min-h-0 overflow-y-auto space-y-1 pr-1">
            <div className={`px-1 mb-2 text-[10px] uppercase font-bold tracking-wider ${isLight ? 'text-gray-500' : 'text-gray-500'
              }`}>
              {currentWorkspace?.name} Chats
            </div>

            {conversations.length === 0 ? (
              <div className={`text-center py-8 text-xs ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>
                <MessageSquare className="w-6 h-6 mx-auto mb-2 opacity-30" />
                <p>No conversations yet.</p>
                <p className={`text-[10px] mt-0.5 ${isLight ? 'text-gray-400' : 'text-gray-600'}`}>Start asking questions!</p>
              </div>
            ) : (
              conversations.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => {
                    setCurrentConversationId(conv.id)
                    setIsMobileSidebarOpen(false)
                  }}
                  className={`group flex items-center justify-between p-2.5 rounded-xl text-xs transition cursor-pointer ${currentConversationId === conv.id
                    ? isLight
                      ? 'bg-amber-50 text-amber-950 font-bold border border-amber-300'
                      : 'bg-[#1e293b] text-white font-medium border border-gray-700'
                    : isLight
                      ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-950'
                      : 'text-gray-400 hover:bg-[#151c28] hover:text-gray-200'
                    }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isLight ? 'text-amber-600' : 'opacity-60'}`} />
                    <span className="truncate">{conv.title || 'Untitled Conversation'}</span>
                  </div>
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      deleteConversation(conv.id)
                    }}
                    className={`opacity-0 group-hover:opacity-100 p-1 transition ${isLight ? 'hover:text-red-600 text-gray-400' : 'hover:text-red-400 text-gray-500'
                      }`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* User Account & Bottom Actions */}
        <div className={`w-72 p-3 border-t space-y-2 shrink-0 ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-[#0d1117] border-gray-800/80'
          }`}>
          {/* Admin Switcher Button (if admin role) */}
          {isAdmin && onSwitchToAdmin && (
            <button
              onClick={onSwitchToAdmin}
              className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${isLight
                ? 'bg-white hover:bg-gray-100 border-amber-300 text-amber-800 shadow-sm'
                : 'bg-gray-800 hover:bg-gray-750 border-[#EAB308]/40 text-[#EAB308]'
                }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Dashboard</span>
            </button>
          )}

          {/* Profile Card or Sign In Button */}
          {isAuthenticated ? (
            <div className="relative" ref={profileRef}>
              {isProfileMenuOpen && (
                <div className={`absolute left-0 right-0 bottom-full mb-2 border rounded-xl shadow-2xl z-50 p-1 ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-gray-900 border-gray-800'}`}>
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsHelpSubmenuOpen(!isHelpSubmenuOpen);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition cursor-pointer ${theme === 'light' ? 'text-gray-700 hover:bg-gray-100 hover:text-black' : 'text-gray-200 hover:bg-gray-800 hover:text-white'}`}
                      >
                        <span>Help</span>
                        <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isHelpSubmenuOpen ? 'rotate-90' : ''}`} />
                      </button>

                      {isHelpSubmenuOpen && (
                        <div className={`mt-1 flex flex-col gap-0.5 overflow-hidden p-1 ${theme === 'light' ? 'bg-gray-50 rounded-lg' : 'bg-gray-800/50 rounded-lg'}`}>
                          <a
                            href="/privacy-policy"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => {
                              setIsHelpSubmenuOpen(false)
                              setIsProfileMenuOpen(false)
                            }}
                            className={`block px-3 py-2 text-xs rounded-lg transition ${theme === 'light' ? 'text-gray-600 hover:bg-gray-200 hover:text-black' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                          >
                            Privacy Policy
                          </a>
                          <a
                            href="/disclaimer"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => {
                              setIsHelpSubmenuOpen(false)
                              setIsProfileMenuOpen(false)
                            }}
                            className={`block px-3 py-2 text-xs rounded-lg transition ${theme === 'light' ? 'text-gray-600 hover:bg-gray-200 hover:text-black' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                          >
                            Disclaimer
                          </a>
                          <a
                            href="/terms"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => {
                              setIsHelpSubmenuOpen(false)
                              setIsProfileMenuOpen(false)
                            }}
                            className={`block px-3 py-2 text-xs rounded-lg transition ${theme === 'light' ? 'text-gray-600 hover:bg-gray-200 hover:text-black' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                          >
                            Terms and Conditions
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
              )}

              <div
                className={`flex items-center justify-between p-2 rounded-xl border transition cursor-pointer ${isLight
                  ? 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
                  : 'bg-gray-900/60 border-gray-800 hover:border-gray-700'
                  }`}
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-8 h-8 rounded-full bg-[#EAB308] text-gray-950 flex items-center justify-center text-xs font-black shadow-sm border border-yellow-500/40 uppercase shrink-0">
                    {user?.username ? user.username[0] : 'U'}
                  </div>
                  <div className="truncate">
                    <p className={`text-xs font-semibold truncate ${isLight ? 'text-gray-950' : 'text-white'}`}>{user?.username || 'User'}</p>
                    <p className={`text-[10px] truncate ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      logout()
                    }}
                    title="Sign Out"
                    className={`p-1.5 rounded-lg transition cursor-pointer ${isLight ? 'text-gray-400 hover:text-red-600 hover:bg-gray-100' : 'text-gray-400 hover:text-red-400 hover:bg-gray-800'
                      }`}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onRequireAuth?.()}
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#EAB308] hover:bg-[#EAB308] text-gray-950 font-semibold text-xs flex items-center justify-center gap-2 transition duration-200 shadow-md shadow-yellow-500/20 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In / Register</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>

      {/* Workspace Creation Modal */}
      <WorkspaceModal isOpen={isCreateWsOpen} onClose={() => setIsCreateWsOpen(false)} />
    </>
  )
}
