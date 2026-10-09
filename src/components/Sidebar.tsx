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
  X,
  LogIn,
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
}

export const Sidebar: React.FC<SidebarProps> = ({
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
  isGenerating,
  onSwitchToAdmin,
  onRequireAuth,
  handleStartNewChat,
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

  const profileRef = useRef<HTMLDivElement>(null)
  const workspaceRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false)
        setIsHelpSubmenuOpen(false)
      }
      if (workspaceRef.current && !workspaceRef.current.contains(event.target as Node)) {
        setIsWorkspaceMenuOpen(false)
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
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 max-w-[85vw] h-full flex flex-col justify-between shrink-0 select-none transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none border-r pb-[72px] md:pb-0 ${isLight ? 'bg-white border-gray-200' : 'bg-[#121722] border-gray-800/80'
          } ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="p-4 flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Top Branding & Workspace Selector */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="shrink-0 flex items-center justify-center">
                  <ThinkingBulb state={isGenerating ? 'thinking' : 'lit'} size={36} />
                </div>
                <div>
                  <h1 className="text-base font-extrabold tracking-tight leading-none"><span className="text-[#EAB308]">sahaj</span><span className={theme === 'dark' ? "text-white" : "text-black"}>AI</span></h1>
                </div>
              </div>

              {/* Close Button on Mobile Drawer */}
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(false)}
                className={`md:hidden p-1.5 rounded-xl transition cursor-pointer ${isLight ? 'text-gray-500 hover:text-gray-950 hover:bg-gray-100' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                title="Close Sidebar"
              >
                <X className="w-5 h-5" />
              </button>
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
        <div className={`p-3 border-t space-y-2 shrink-0 ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-[#0d1117] border-gray-800/80'
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
      </aside>

      {/* Workspace Creation Modal */}
      <WorkspaceModal isOpen={isCreateWsOpen} onClose={() => setIsCreateWsOpen(false)} />
    </>
  )
}
