import React, { useState, useEffect, useRef, useMemo } from 'react'
import {
  Search,
  MessageSquare,
  Plus,
  X,
  CornerDownLeft,
  ArrowRight,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useWorkspace } from '../context/WorkspaceContext'
import { useTheme } from '../context/ThemeContext'
import type { Conversation } from '../types'

interface SearchableItem {
  id: string
  title: string
  workspace_id: number
  workspace_name: string
  workspace_color: string
  updated_at?: string
  created_at?: string
  snippet?: string
  matchType?: 'title' | 'message' | 'workspace'
}

interface GlobalSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectConversation: (convId: string, workspaceId?: number) => void
  onStartNewChat: () => void
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectConversation,
  onStartNewChat,
}) => {
  const { user } = useAuth()
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const { workspaces, currentWorkspace, conversations } = useWorkspace()

  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Focus input automatically on open and reset query
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
    }
  }, [isOpen])

  // Collect conversations from current workspace + all workspaces in local storage
  const allConversations: SearchableItem[] = useMemo(() => {
    if (!isOpen) return []

    const convMap = new Map<string, SearchableItem>()

    // 1. Current workspace conversations
    const currentWsId = currentWorkspace?.id || 1
    const currentWsName = currentWorkspace?.name || 'Default Workspace'
    const currentWsColor = currentWorkspace?.icon_color || '#EAB308'

    conversations.forEach(c => {
      convMap.set(c.id, {
        id: c.id,
        title: c.title || 'Untitled Conversation',
        workspace_id: currentWsId,
        workspace_name: currentWsName,
        workspace_color: currentWsColor,
        updated_at: c.updated_at,
        created_at: c.created_at,
      })
    })

    // 2. Scan other workspaces from workspaces list & localStorage
    workspaces.forEach(ws => {
      const storageKey = `sahaj_convs_${user?.id || 1}_${ws.id}`
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        try {
          const parsed: Conversation[] = JSON.parse(stored)
          if (Array.isArray(parsed)) {
            parsed.forEach(c => {
              if (!convMap.has(c.id)) {
                convMap.set(c.id, {
                  id: c.id,
                  title: c.title || 'Untitled Conversation',
                  workspace_id: ws.id,
                  workspace_name: ws.name,
                  workspace_color: ws.icon_color || '#EAB308',
                  updated_at: c.updated_at,
                  created_at: c.created_at,
                })
              }
            })
          }
        } catch {
          // Ignore parsing errors
        }
      }
    })

    // Also scan any unmapped sahaj_convs_ keys in localStorage
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('sahaj_convs_')) {
          const raw = localStorage.getItem(key)
          if (raw) {
            try {
              const list: Conversation[] = JSON.parse(raw)
              if (Array.isArray(list)) {
                list.forEach(c => {
                  if (c?.id && !convMap.has(c.id)) {
                    const matchedWs = workspaces.find(w => w.id === c.workspace_id)
                    convMap.set(c.id, {
                      id: c.id,
                      title: c.title || 'Untitled Conversation',
                      workspace_id: c.workspace_id || 1,
                      workspace_name: matchedWs?.name || 'Workspace',
                      workspace_color: matchedWs?.icon_color || '#EAB308',
                      updated_at: c.updated_at,
                      created_at: c.created_at,
                    })
                  }
                })
              }
            } catch {
              // Ignore
            }
          }
        }
      }
    } catch {
      // Ignore
    }

    return Array.from(convMap.values())
  }, [isOpen, conversations, currentWorkspace, workspaces, user?.id])

  // Filter conversations by query (matching title, workspace name, or message contents)
  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) {
      // Sort recent by date
      return [...allConversations].sort((a, b) => {
        const dateA = new Date(a.updated_at || a.created_at || 0).getTime()
        const dateB = new Date(b.updated_at || b.created_at || 0).getTime()
        return dateB - dateA
      })
    }

    const matched: SearchableItem[] = []

    allConversations.forEach(item => {
      const titleLower = item.title.toLowerCase()
      const wsLower = item.workspace_name.toLowerCase()

      if (titleLower.includes(q)) {
        matched.push({ ...item, matchType: 'title' })
        return
      }

      // Check messages in localStorage
      try {
        const msgsRaw = localStorage.getItem(`sahaj_msgs_${item.id}`)
        if (msgsRaw) {
          const msgs = JSON.parse(msgsRaw)
          if (Array.isArray(msgs)) {
            for (const m of msgs) {
              const content = typeof m.content === 'string' ? m.content : ''
              const idx = content.toLowerCase().indexOf(q)
              if (idx !== -1) {
                const start = Math.max(0, idx - 30)
                const end = Math.min(content.length, idx + q.length + 50)
                const snippet = (start > 0 ? '...' : '') + content.substring(start, end).replace(/\n+/g, ' ') + (end < content.length ? '...' : '')
                matched.push({
                  ...item,
                  matchType: 'message',
                  snippet,
                })
                return
              }
            }
          }
        }
      } catch {
        // Ignore JSON error
      }

      if (wsLower.includes(q)) {
        matched.push({ ...item, matchType: 'workspace' })
      }
    })

    return matched
  }, [allConversations, query])

  // Total selectable items: index 0 is always "New Chat", followed by filtered results
  const totalItems = 1 + filteredResults.length

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Auto-scroll selected element into view
  useEffect(() => {
    const activeElem = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`)
    if (activeElem) {
      activeElem.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev + 1) % totalItems)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev - 1 + totalItems) % totalItems)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex === 0) {
        onStartNewChat()
      } else {
        const chosen = filteredResults[selectedIndex - 1]
        if (chosen) {
          onSelectConversation(chosen.id, chosen.workspace_id)
        }
      }
    }
  }

  // Format relative timestamp
  const formatTime = (isoString?: string) => {
    if (!isoString) return ''
    try {
      const date = new Date(isoString)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / (1000 * 60))
      const diffHours = Math.floor(diffMins / 60)
      const diffDays = Math.floor(diffHours / 24)

      if (diffMins < 1) return 'Just now'
      if (diffMins < 60) return `${diffMins}m ago`
      if (diffHours < 24) return `${diffHours}h ago`
      if (diffDays === 1) return 'Yesterday'
      if (diffDays < 7) return `${diffDays}d ago`
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    } catch {
      return ''
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-20 px-3 bg-black/60 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col transition-all duration-200 transform scale-100 ${
          isLight ? 'bg-white border-gray-200 text-gray-900' : 'bg-[#121722] border-gray-800 text-gray-100'
        }`}
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div
          className={`flex items-center px-4 py-3.5 border-b gap-3 ${
            isLight ? 'border-gray-200 bg-gray-50/70' : 'border-gray-800 bg-[#161c28]'
          }`}
        >
          <Search className="w-5 h-5 text-[#EAB308] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search chats, topics or content..."
            className="flex-1 bg-transparent border-none outline-none text-sm placeholder-gray-400 font-medium"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                inputRef.current?.focus()
              }}
              className="p-1 rounded-md text-gray-400 hover:text-gray-200 cursor-pointer transition"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded border select-none ${
                isLight ? 'bg-white border-gray-200 text-gray-400' : 'bg-gray-800/80 border-gray-700 text-gray-400'
              }`}
            >
              ESC
            </kbd>
          )}
        </div>

        {/* Results Container */}
        <div ref={listRef} className="max-h-[60vh] sm:max-h-96 overflow-y-auto p-2 space-y-1">
          {/* New Chat Action Item (Always index 0) */}
          <div
            data-index={0}
            onClick={() => onStartNewChat()}
            className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs transition select-none ${
              selectedIndex === 0
                ? isLight
                  ? 'bg-amber-100/70 text-amber-950 font-semibold'
                  : 'bg-[#EAB308]/15 text-[#EAB308] font-semibold'
                : isLight
                ? 'hover:bg-gray-100 text-gray-700'
                : 'hover:bg-gray-800/70 text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  isLight ? 'bg-amber-100 text-amber-800' : 'bg-[#EAB308]/20 text-[#EAB308]'
                }`}
              >
                <Plus className="w-4 h-4" />
              </div>
              <div className="truncate">
                <span className="font-medium">
                  {query.trim() ? `New chat with "${query.trim()}"` : 'Start a new chat'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 opacity-60 text-[11px]">
              <CornerDownLeft className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Section Divider / Header */}
          <div className="px-2 pt-2 pb-1 flex items-center justify-between">
            <span className={`text-[10px] uppercase font-bold tracking-wider ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>
              {query.trim() ? `Chats (${filteredResults.length})` : 'Recent Chats'}
            </span>
            <span className={`text-[10px] ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>
              {filteredResults.length} {filteredResults.length === 1 ? 'chat' : 'chats'}
            </span>
          </div>

          {/* Conversations List */}
          {filteredResults.length === 0 && query.trim() ? (
            <div className={`text-center py-8 px-4 ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>
              <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs font-medium">No chats found for &quot;{query}&quot;</p>
              <p className="text-[11px] mt-1 opacity-70">
                Press Enter to start a new chat or search for another keyword.
              </p>
            </div>
          ) : (
            filteredResults.map((item, idx) => {
              const itemIndex = idx + 1
              const isSelected = selectedIndex === itemIndex

              return (
                <div
                  key={item.id}
                  data-index={itemIndex}
                  onClick={() => onSelectConversation(item.id, item.workspace_id)}
                  className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs transition select-none ${
                    isSelected
                      ? isLight
                        ? 'bg-amber-50 border border-amber-300 text-amber-950 font-semibold shadow-sm'
                        : 'bg-[#1f293d] border border-gray-700 text-white font-medium shadow-sm'
                      : isLight
                      ? 'hover:bg-gray-100 text-gray-700'
                      : 'hover:bg-[#161d2b] text-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0 flex-1 mr-2">
                    <MessageSquare
                      className={`w-4 h-4 shrink-0 mt-0.5 ${
                        isSelected
                          ? 'text-[#EAB308]'
                          : isLight
                          ? 'text-gray-400 group-hover:text-amber-600'
                          : 'text-gray-500 group-hover:text-[#EAB308]'
                      }`}
                    />
                    <div className="min-w-0 flex-1 truncate">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium">{item.title}</span>
                      </div>

                      {/* Snippet preview if matched inside message */}
                      {item.snippet && (
                        <p className={`text-[11px] truncate mt-0.5 font-normal ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                          {item.snippet}
                        </p>
                      )}

                      {/* Workspace pill */}
                      <div className="flex items-center gap-1.5 mt-1">
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.workspace_color }}
                        />
                        <span className={`text-[10px] truncate ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>
                          {item.workspace_name}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>
                      {formatTime(item.updated_at || item.created_at)}
                    </span>
                    <ArrowRight
                      className={`w-3.5 h-3.5 transition-transform ${
                        isSelected ? 'translate-x-0.5 text-[#EAB308] opacity-100' : 'opacity-0 group-hover:opacity-60'
                      }`}
                    />
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Modal Footer with Keyboard Shortcuts */}
        <div
          className={`px-4 py-2 border-t flex items-center justify-between text-[11px] select-none ${
            isLight ? 'border-gray-200 bg-gray-50/50 text-gray-500' : 'border-gray-800 bg-[#0e121a] text-gray-500'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="font-mono text-[9px] px-1 py-0.5 rounded border border-gray-300 dark:border-gray-700">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="font-mono text-[9px] px-1 py-0.5 rounded border border-gray-300 dark:border-gray-700">↵</kbd>
              Select
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="font-mono text-[9px] px-1 py-0.5 rounded border border-gray-300 dark:border-gray-700">ESC</kbd>
            Close
          </span>
        </div>
      </div>
    </div>
  )
}
