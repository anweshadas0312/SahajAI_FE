import React, { useState } from 'react'
import { Menu, Sun, Moon, ChevronDown, Globe } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useWorkspace } from '../context/WorkspaceContext'
import { useTheme } from '../context/ThemeContext'
import { ThinkingBulb } from './ThinkingBulb'

interface TopBarProps {
  setIsMobileSidebarOpen: (isOpen: boolean) => void
  isGenerating: boolean
  messagesLength: number
  jailbreak: string
  setJailbreak: (val: string) => void
  webAccess: boolean
  setWebAccess: (val: boolean) => void
  onRequireAuth?: () => void
}

export const TopBar: React.FC<TopBarProps> = ({
  setIsMobileSidebarOpen,
  isGenerating,
  messagesLength,
  jailbreak,
  setJailbreak,
  webAccess,
  setWebAccess,
  onRequireAuth,
}) => {
  const { isAuthenticated } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const isLight = theme === 'light'
  const { currentWorkspace, conversations, currentConversationId } = useWorkspace()

  const [isJailbreakMenuOpen, setIsJailbreakMenuOpen] = useState(false)

  return (
    <div className={`h-14 px-3 sm:px-6 border-b flex items-center justify-between shrink-0 z-10 gap-2 backdrop-blur-md transition-colors ${isLight ? 'border-gray-200 bg-white/80' : 'border-gray-800/80 bg-[#101521]/70'
      }`}>
      {/* Left: Mobile Menu + Workspace & Conversation Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 mr-2">
        {/* Hamburger Button for Mobile */}
        <button
          type="button"
          onClick={() => setIsMobileSidebarOpen(true)}
          className={`md:hidden p-2 -ml-1 rounded-xl transition cursor-pointer shrink-0 ${isLight ? 'text-gray-700 hover:text-amber-600 hover:bg-gray-100' : 'text-gray-300 hover:text-[#EAB308] hover:bg-gray-800/70'
            }`}
          aria-label="Open sidebar"
          title="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Left-Aligned Workspace Info */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="shrink-0">
            <ThinkingBulb
              state={isGenerating ? 'thinking' : messagesLength > 0 ? 'lit' : 'off'}
              size={26}
            />
          </div>
          <div className="flex items-center gap-1.5 min-w-0 truncate">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: currentWorkspace?.icon_color || '#EAB308' }}
            />
            <span className={`text-xs font-bold uppercase tracking-wider truncate max-w-[120px] sm:max-w-[200px] ${isLight ? 'text-gray-950' : 'text-white'
              }`}>
              {currentWorkspace?.name}
            </span>
            {conversations.find(c => c.id === currentConversationId)?.title && (
              <>
                <span className={`text-xs mx-1 shrink-0 ${isLight ? 'text-gray-400' : 'text-gray-600'}`}>/</span>
                <span className={`text-xs font-mono truncate max-w-[120px] sm:max-w-xs md:max-w-sm lg:max-w-md ${isLight ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                  {conversations.find(c => c.id === currentConversationId)?.title}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Model & Config Selectors */}
      <div className="flex items-center gap-2 text-xs">
        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className={`theme-toggle-btn p-1.5 rounded-lg border transition cursor-pointer flex items-center justify-center shrink-0 ${isLight
            ? 'border-gray-200 bg-gray-50 text-gray-700 hover:text-amber-600 hover:bg-gray-100'
            : 'border-gray-700/80 bg-[#182030] text-gray-300 hover:text-[#EAB308] hover:bg-gray-800'
            }`}
        >
          {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-[#EAB308]" /> : <Moon className="w-3.5 h-3.5 text-amber-500" />}
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2 text-xs shrink-0">
          {/* Custom Jailbreak Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                if (!isAuthenticated && onRequireAuth) {
                  onRequireAuth()
                  return
                }
                setIsJailbreakMenuOpen(!isJailbreakMenuOpen)
              }}
              className={`border rounded-lg pl-2.5 pr-2 py-1 text-[11px] sm:text-xs outline-none cursor-pointer flex items-center gap-1.5 transition ${isLight
                ? 'bg-gray-50 border-gray-200 text-gray-800 hover:border-gray-300 hover:text-gray-950'
                : 'bg-[#182030] border-gray-700/80 text-gray-200 hover:border-gray-500 hover:text-white'
                }`}
            >
              <span className="truncate max-w-[100px] sm:max-w-[140px]">
                {jailbreak === 'default' ? 'Guided Mode' : jailbreak === 'gpt-dan-11.0' ? 'Ask Anything' : 'Unrestricted Ask'}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 shrink-0 ${isLight ? 'text-gray-500' : 'text-gray-400'}`} />
            </button>

            {isJailbreakMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsJailbreakMenuOpen(false)} />
                <div className={`absolute right-0 top-full mt-1.5 w-40 sm:w-44 border rounded-xl shadow-2xl overflow-hidden z-50 p-1 origin-top-right ${isLight ? 'bg-white border-gray-200 shadow-xl' : 'bg-[#111827] border-gray-800 shadow-black'
                  }`}>
                  {[
                    { value: 'default', label: 'Guided Mode' },
                    { value: 'gpt-dan-11.0', label: 'Ask Anything' },
                    { value: 'gpt-evil', label: 'Unrestricted Ask' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setJailbreak(opt.value)
                        setIsJailbreakMenuOpen(false)
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-[11px] sm:text-xs transition cursor-pointer ${jailbreak === opt.value
                        ? isLight ? 'bg-amber-100 text-amber-900 font-bold' : 'bg-[#EAB308]/15 text-[#EAB308] font-medium'
                        : isLight ? 'text-gray-700 hover:bg-gray-100 hover:text-black' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Web Access Toggle */}
          <button
            type="button"
            onClick={() => {
              if (!isAuthenticated && onRequireAuth) {
                onRequireAuth()
                return
              }
              setWebAccess(!webAccess)
            }}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg border text-[11px] sm:text-xs font-medium transition cursor-pointer ${webAccess
              ? isLight
                ? 'bg-amber-50 border-amber-300 text-amber-800 font-semibold'
                : 'bg-[#EAB308]/15 border-[#EAB308] text-[#EAB308]'
              : isLight
                ? 'bg-gray-50 border-gray-200 text-gray-600 hover:text-gray-900'
                : 'bg-[#182030] border-gray-700/80 text-gray-400 hover:text-gray-200'
              }`}
            title="Toggle Web Search"
          >
            <Globe className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Web Search</span>
          </button>
        </div>
      </div>
    </div>
  )
}
