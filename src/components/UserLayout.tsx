import React, { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  Plus,
  Send,
  MessageSquare,
  Trash2,
  ChevronDown,
  Globe,
  Shield,
  LogOut,
  FolderPlus,
  Copy,
  Check,
  Cpu,
  Paperclip,
  FileText,
  Loader2,
  X,
  Sun,
  Moon,
  ExternalLink,
  LogIn,
  Sparkles,
  BookOpen,
  PenTool,
  Lightbulb,
  ArrowRight,
  Menu,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useWorkspace } from '../context/WorkspaceContext'
import { useTheme } from '../context/ThemeContext'
import { WorkspaceModal } from './WorkspaceModal'
import type { UploadedFile } from '../types'
import { API_ENDPOINTS } from '../apiConfig'
import { ThinkingBulb } from './ThinkingBulb'

interface UserLayoutProps {
  onSwitchToAdmin?: () => void
  onRequireAuth?: () => void
}

export const UserLayout: React.FC<UserLayoutProps> = ({ onSwitchToAdmin, onRequireAuth }) => {
  const { user, logout, isAdmin, isAuthenticated } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const {
    workspaces,
    currentWorkspace,
    setCurrentWorkspace,
    deleteWorkspace,
    conversations,
    currentConversationId,
    setCurrentConversationId,
    messages,
    setMessages,
    createNewConversation,
    deleteConversation,
    updateConversationTitle,
  } = useWorkspace()

  const [input, setInput] = useState('')
  // Model hardcoded to Qwen 2.5 Coder by default (easily expandable in the future)
  const [model, setModel] = useState('qwen2.5-coder:1.5b')
  void setModel // Keeps setModel referenced for future dynamic selection
  void Cpu // Keeps Cpu referenced for when model selector JSX is uncommented
  const [jailbreak, setJailbreak] = useState('default')
  const [webAccess, setWebAccess] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false)
  const [isCreateWsOpen, setIsCreateWsOpen] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const [attachedFiles, setAttachedFiles] = useState<UploadedFile[]>([])
  const [isUploadingFile, setIsUploadingFile] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const bottomRef = useRef<HTMLDivElement>(null)
  const conversationIdRef = useRef<string>(currentConversationId || Math.random().toString(36).substring(2))

  // Reset composer attached files when conversation changes
  useEffect(() => {
    setAttachedFiles([])
  }, [currentConversationId])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAuthenticated) {
      if (fileInputRef.current) fileInputRef.current.value = ''
      onRequireAuth?.()
      return
    }
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length === 0) return

    setIsUploadingFile(true)
    const token = localStorage.getItem('sahaj_token')
    const newUploadedFiles: UploadedFile[] = []

    for (const selectedFile of selectedFiles) {
      const formData = new FormData()
      formData.append('file', selectedFile)
      if (currentWorkspace?.id) {
        formData.append('workspace_id', currentWorkspace.id.toString())
      }
      if (conversationIdRef.current) {
        formData.append('conversation_id', conversationIdRef.current)
      }

      try {
        const res = await fetch('/api/files/upload', {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        })
        const data = await res.json()
        if (data.success && data.file) {
          newUploadedFiles.push(data.file)
        } else {
          console.warn(`File upload failed for ${selectedFile.name}:`, data.error)
        }
      } catch (err: any) {
        console.error(`Upload error for ${selectedFile.name}:`, err)
      }
    }

    if (newUploadedFiles.length > 0) {
      setAttachedFiles(prev => [
        ...prev.filter(f => !newUploadedFiles.some(nu => nu.id === f.id)),
        ...newUploadedFiles
      ])
    }
    setIsUploadingFile(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleRemoveFile = async (fileId: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== fileId))
    const token = localStorage.getItem('sahaj_token')
    if (token) {
      try {
        await fetch(`/api/files/${fileId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        })
      } catch (err) {
        console.error('Error deleting file:', err)
      }
    }
  }


  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (currentConversationId) {
      conversationIdRef.current = currentConversationId
    }
  }, [currentConversationId])

  const handleCopyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code)
    setCopiedIndex(idx)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const handleStartNewChat = async () => {
    setIsMobileSidebarOpen(false)
    if (!isAuthenticated) {
      onRequireAuth?.()
      return
    }
    const newId = await createNewConversation(model, jailbreak)
    conversationIdRef.current = newId
    setMessages([])
  }

  const handleSend = async (overridePrompt?: string) => {
    setIsMobileSidebarOpen(false)
    if (!isAuthenticated) {
      onRequireAuth?.()
      return
    }
    const isAutoPrompt = !overridePrompt && !input.trim() && attachedFiles.length > 0
    let promptToSend = overridePrompt || input.trim()
    if (isAutoPrompt) {
      promptToSend = "Summarize and analyze the attached document."
    }
    if (!promptToSend || isGenerating) return
    setInput('')

    // Ensure we have a conversation created
    const shortTitle = promptToSend.slice(0, 32) + (promptToSend.length > 32 ? '...' : '')
    let activeId = currentConversationId || conversationIdRef.current
    if (!currentConversationId) {
      activeId = await createNewConversation(model, jailbreak, shortTitle)
      conversationIdRef.current = activeId
    } else if (messages.length === 0 && activeId) {
      updateConversationTitle(activeId, shortTitle)
    }

    const currentFiles = [...attachedFiles]
    setAttachedFiles([])
    const newMessages = [...messages, { role: 'user' as const, content: promptToSend, files: currentFiles, isAutoPrompt }]
    setMessages([...newMessages, { role: 'assistant' as const, content: '' }])
    setIsGenerating(true)

    try {
      const token = Math.random().toString(36).substring(2)
      const response = await fetch(API_ENDPOINTS.CONVERSATION.STREAM, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
        body: JSON.stringify({
          conversation_id: conversationIdRef.current,
          workspace_id: currentWorkspace?.id,
          action: '_ask',
          model: model,
          jailbreak: jailbreak,
          meta: {
            id: token,
            file_ids: attachedFiles.map(f => f.id),
            content: {
              conversation: newMessages,
              internet_access: webAccess,
              content_type: 'text',
              parts: [{ content: promptToSend, role: 'user' }],
            },
          },
        }),
      })

      if (!response.body) throw new Error('No response body stream')
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        assistantContent += chunk
        setMessages([...newMessages, { role: 'assistant' as const, content: assistantContent }])
      }
    } catch (error) {
      console.error('Chat generation error:', error)
      setMessages(prev => {
        const last = prev[prev.length - 1]
        return [
          ...prev.slice(0, -1),
          {
            ...last,
            content:
              (last ? last.content : '') +
              '\n\n> ⚠️ **Service Notice**: Backend stream did not respond. Check your LLM host endpoint or model status.',
          },
        ]
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const starterPrompts = [
    {
      category: 'Knowledge',
      title: 'Explain Any Concept',
      desc: 'Break down complex topics, science, history, or how things work in plain English',
      icon: BookOpen,
      prompt: 'Explain how quantum computing works using simple, everyday analogies that anyone can understand.',
    },
    {
      category: 'Research',
      title: 'Summarize & Analyze',
      desc: 'Condense long articles, extract key points, or compare different perspectives',
      icon: Sparkles,
      prompt: 'What are the key differences between renewable energy sources like solar and wind, and what are their trade-offs?',
    },
    {
      category: 'Writing',
      title: 'Draft & Polish Writing',
      desc: 'Craft articulate emails, cover letters, essays, or summaries with clear tone',
      icon: PenTool,
      prompt: 'Help me draft a clear, persuasive professional email announcing a new project initiative to stakeholders.',
    },
    {
      category: 'Planning',
      title: 'Brainstorm & Plan',
      desc: 'Explore fresh ideas, design productive routines, or plan upcoming projects',
      icon: Lightbulb,
      prompt: 'Suggest 5 creative and practical ideas to organize my weekly goals and boost everyday focus.',
    },
  ]

  return (
    <div className="flex h-screen bg-[#0b0f19] text-gray-100 font-sans overflow-hidden">
      {/* Mobile Backdrop Overlay */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* ========================================================= */}
      {/* SIDEBAR (Desktop fixed left, Mobile drawer) */}
      {/* ========================================================= */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-[#121722] border-r border-gray-800/80 flex flex-col justify-between shrink-0 select-none transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
      >
        <div className="p-4 flex flex-col h-full overflow-hidden">
          {/* Top Branding & Workspace Selector */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="shrink-0 flex items-center justify-center">
                  <ThinkingBulb state={isGenerating ? 'thinking' : 'lit'} size={36} />
                </div>
                <div>
                  <h1 className="text-base font-bold tracking-tight leading-none"><span className="text-[#FACC15]">sahaj</span><span className="text-black">AI</span></h1>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-[#FACC15]">Studio</span>
                </div>
              </div>

              {/* Close Button on Mobile Drawer */}
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(false)}
                className="md:hidden p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition cursor-pointer"
                title="Close Sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Workspace Dropdown Button */}
            <div className="relative">
              <button
                onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
                className="w-full bg-[#182030] hover:bg-[#1f293d] border border-gray-700/70 text-left px-3.5 py-2.5 rounded-xl flex items-center justify-between transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: currentWorkspace?.icon_color || '#FACC15' }}
                  />
                  <div className="truncate">
                    <p className="text-xs font-semibold text-white truncate">{currentWorkspace?.name || 'Workspace'}</p>
                    <p className="text-[10px] text-gray-400 truncate">
                      {conversations.length} conversation{conversations.length === 1 ? '' : 's'}
                    </p>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
              </button>

              {/* Workspace Dropdown Menu */}
              {isWorkspaceMenuOpen && (
                <div className="absolute top-full left-0 right-0 mt-1.5 glass-dropdown rounded-xl p-1.5 z-40 border border-gray-700 max-h-56 overflow-y-auto">
                  <div className="px-2 py-1 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
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
                        ? 'bg-[#FACC15]/15 text-[#FACC15] font-medium'
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
                          className="opacity-40 hover:opacity-100 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}

                  <div className="pt-1 mt-1 border-t border-gray-800">
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
                      className="w-full flex items-center gap-2 p-2 rounded-lg text-xs text-[#FACC15] hover:bg-[#FACC15]/10 font-medium transition cursor-pointer"
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
            className="w-full bg-[#FACC15] hover:bg-[#EAB308] text-gray-950 font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition duration-200 shadow-md shadow-yellow-500/15 cursor-pointer mb-4 text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>

          {/* Conversation History for Current Workspace */}
          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            <div className="px-1 mb-2 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
              {currentWorkspace?.name} Chats
            </div>

            {conversations.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-xs">
                <MessageSquare className="w-6 h-6 mx-auto mb-2 opacity-30" />
                <p>No conversations yet.</p>
                <p className="text-[10px] mt-0.5 text-gray-600">Start asking questions!</p>
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
                    ? 'bg-[#1e293b] text-white font-medium border border-gray-700'
                    : 'text-gray-400 hover:bg-[#151c28] hover:text-gray-200'
                    }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-60" />
                    <span className="truncate">{conv.title || 'Untitled Conversation'}</span>
                  </div>
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      deleteConversation(conv.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:text-red-400 p-1 transition"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* User Account & Bottom Actions */}
        <div className="p-3 bg-[#0d1117] border-t border-gray-800/80 space-y-2">
          {/* Admin Switcher Button (if admin role) */}
          {isAdmin && onSwitchToAdmin && (
            <button
              onClick={onSwitchToAdmin}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gray-800 hover:bg-gray-750 border border-[#FACC15]/40 text-[#FACC15] text-xs font-semibold transition cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Dashboard</span>
            </button>
          )}

          {/* Profile Card or Sign In Button */}
          {isAuthenticated ? (
            <div className="flex items-center justify-between p-2 rounded-xl bg-gray-900/60 border border-gray-800">
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FACC15] to-[#F59E0B] text-gray-950 flex items-center justify-center text-xs font-black shadow-sm border border-yellow-400/40 uppercase shrink-0">
                  {user?.username ? user.username[0] : 'U'}
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-white truncate">{user?.username || 'User'}</p>
                  <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={toggleTheme}
                  title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  className="theme-toggle-btn p-1.5 rounded-lg text-gray-400 hover:text-[#FACC15] hover:bg-gray-800 transition cursor-pointer"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>

                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-gray-800 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onRequireAuth?.()}
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] text-gray-950 font-semibold text-xs flex items-center justify-center gap-2 transition duration-200 shadow-md shadow-yellow-500/20 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In / Register</span>
              </button>

            </div>
          )}
        </div>
      </aside>

      {/* ========================================================= */}
      {/* MAIN CHAT AREA */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col relative bg-[#0b0f19] overflow-hidden min-w-0">
        {/* Top Control Bar */}
        <div className="h-14 px-3 sm:px-6 border-b border-gray-800/80 bg-[#101521]/70 backdrop-blur-md flex items-center justify-between shrink-0 z-10 relative">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Hamburger Button for Mobile */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 -ml-1 text-gray-300 hover:text-[#FACC15] hover:bg-gray-800/70 rounded-xl transition cursor-pointer shrink-0"
              aria-label="Open sidebar"
              title="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <ThinkingBulb
              state={isGenerating ? 'thinking' : messages.length > 0 ? 'lit' : 'off'}
              size={28}
            />
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: currentWorkspace?.icon_color || '#FACC15' }}
              />
              <span className="text-xs font-bold text-white uppercase tracking-wider truncate max-w-[100px] sm:max-w-[160px]">
                {currentWorkspace?.name}
              </span>
              {conversations.find(c => c.id === currentConversationId)?.title && (
                <>
                  <span className="text-xs text-gray-600 hidden sm:inline">/</span>
                  <span className="text-xs text-gray-400 font-mono truncate max-w-[100px] md:max-w-xs hidden sm:inline">
                    {conversations.find(c => c.id === currentConversationId)?.title}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Model & Config Selectors */}
          <div className="flex items-center gap-2 text-xs">
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="theme-toggle-btn p-1.5 rounded-lg border border-gray-700/80 bg-[#182030] text-gray-300 hover:text-[#FACC15] hover:bg-gray-800 transition cursor-pointer flex items-center justify-center shrink-0"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-[#FACC15]" /> : <Moon className="w-3.5 h-3.5 text-amber-500" />}
            </button>

            <div className="flex items-center gap-1.5 sm:gap-2 text-xs shrink-0">
              {/* Jailbreak Selector */}
              <select
                value={jailbreak}
                onChange={e => setJailbreak(e.target.value)}
                className="bg-[#182030] border border-gray-700/80 rounded-lg px-2 py-1 text-gray-200 text-[11px] sm:text-xs outline-none cursor-pointer max-w-[105px] sm:max-w-none"
              >
                <option value="default" className="bg-[#182030]">Standard</option>
                <option value="gpt-dan-11.0" className="bg-[#182030]">DAN Mode</option>
                <option value="gpt-evil" className="bg-[#182030]">EvilBOT</option>
              </select>

              {/* Web Access Toggle */}
              <button
                type="button"
                onClick={() => setWebAccess(!webAccess)}
                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg border text-[11px] sm:text-xs font-medium transition cursor-pointer ${webAccess
                  ? 'bg-[#FACC15]/15 border-[#FACC15] text-[#FACC15]'
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

              {/* Chat Message List */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
                {messages.length === 0 ? (
                  <div className="max-w-3xl mx-auto h-full flex flex-col items-center justify-center py-6 sm:py-10 px-2 sm:px-4">
                    <div className="mb-4 sm:mb-5 flex items-center justify-center">
                      <ThinkingBulb state="lit" size={54} />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2 text-center">
                      Welcome to <span className="text-[#FACC15]">sahajAI</span>
                    </h2>
                    <p className="text-gray-400 text-xs sm:text-sm max-w-md text-center mb-6 sm:mb-8 px-2">
                      Your dedicated workspace: <strong className="text-gray-200">{currentWorkspace?.name}</strong>.
                      All conversations and outputs are saved securely.
                    </p>

                    {/* Starter Prompts Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5 w-full">
                      {starterPrompts.map((card, i) => {
                        const Icon = card.icon
                        return (
                          <div
                            key={i}
                            style={{ '--card-index': i } as React.CSSProperties}
                            onClick={() => handleSend(card.prompt)}
                            className="starter-card-anim group relative p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#141a27] border border-gray-800/90 hover:border-[#FACC15]/60 hover:bg-[#182030] cursor-pointer text-left select-none"
                          >
                            <div className="starter-card-shimmer" />

                            <div className="flex items-start justify-between mb-2 sm:mb-2.5 relative z-10">
                              <div className="flex items-center gap-2 sm:gap-2.5">
                                <div className="starter-icon-wrap p-1.5 sm:p-2 rounded-xl bg-[#FACC15]/10 text-[#FACC15] group-hover:bg-[#FACC15] group-hover:text-[#0b0f19] group-hover:scale-110 group-hover:rotate-[-4deg] transition-all duration-300 shadow-sm">
                                  <Icon className="w-4 h-4 transition-colors" />
                                </div>
                                <span className="starter-tag text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-gray-800/80 text-gray-300 border border-gray-700/60 group-hover:border-[#FACC15]/40 group-hover:text-[#FACC15] transition-colors">
                                  {card.category}
                                </span>
                              </div>
                              <div className="flex items-center text-gray-500 group-hover:text-[#FACC15] group-hover:translate-x-1 opacity-60 group-hover:opacity-100 transition-all duration-200">
                                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              </div>
                            </div>

                            <h4 className="text-xs sm:text-sm font-semibold text-white group-hover:text-[#FACC15] transition-colors mb-1 relative z-10">
                              {card.title}
                            </h4>
                            <p className="text-[11px] sm:text-xs text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors relative z-10">
                              {card.desc}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
                    {messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex gap-2 sm:gap-3.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {msg.role !== 'user' && (
                          <div className="shrink-0 pt-0.5">
                            <ThinkingBulb
                              state={isGenerating && idx === messages.length - 1 ? 'thinking' : 'lit'}
                              size={32}
                            />
                          </div>
                        )}

                        <div
                          className={`max-w-[88%] sm:max-w-[82%] rounded-2xl p-3.5 sm:p-4.5 break-words ${msg.role === 'user'
                            ? 'bg-[#1c2436] text-white border border-gray-700/80 rounded-tr-none'
                            : 'bg-[#141a27] text-gray-200 border border-gray-800 rounded-tl-none prose prose-invert max-w-none'
                            }`}
                        >
                          {msg.role === 'user' ? (
                            <div className="space-y-2">
                              {msg.files && msg.files.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-1.5">
                                  {msg.files.map(f => (
                                    <a
                                      key={f.id}
                                      href={`/api/files/${f.id}/view`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#141a27] border border-gray-700 hover:border-[#FACC15] text-xs text-[#FACC15] hover:underline transition cursor-pointer group"
                                      title="Click to view file"
                                    >
                                      <FileText className="w-3.5 h-3.5 text-[#FACC15]" />
                                      <span className="font-medium">{f.original_name}</span>
                                      <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-[#FACC15]" />
                                    </a>
                                  ))}
                                </div>
                              )}
                              {!msg.isAutoPrompt && (
                                <p className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed">{msg.content}</p>
                              )}
                            </div>
                          ) : (
                            <div className="relative group text-xs sm:text-sm leading-relaxed space-y-2">
                              {msg.content ? (
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  components={{
                                    a: ({ node, href, children, ...props }) => (
                                      <a
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#FACC15] hover:text-[#EAB308] underline underline-offset-3 font-semibold break-all inline-flex items-center gap-1 cursor-pointer transition hover:opacity-90"
                                        {...props}
                                      >
                                        <span>{children}</span>
                                        <ExternalLink className="w-3.5 h-3.5 inline-block shrink-0 opacity-80" />
                                      </a>
                                    ),
                                  }}
                                >
                                  {msg.content}
                                </ReactMarkdown>
                              ) : (
                                <span className="dots inline-flex items-center py-1.5" aria-label="Thinking">
                                  <span></span><span></span><span></span>
                                </span>
                              )}
                              {msg.content && (
                                <div className="flex justify-end pt-2">
                                  <button
                                    onClick={() => handleCopyCode(msg.content, idx)}
                                    className="flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-[#FACC15] transition cursor-pointer"
                                  >
                                    {copiedIndex === idx ? (
                                      <>
                                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                                        <span className="text-emerald-400">Copied</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3.5 h-3.5" />
                                        <span>Copy</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {msg.role === 'user' && (
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-gradient-to-tr from-[#FACC15] to-[#F59E0B] text-gray-950 flex items-center justify-center shrink-0 text-[10px] sm:text-xs font-black shadow-sm border border-yellow-400/40 uppercase">
                            {user?.username ? user.username[0] : 'U'}
                          </div>
                        )}
                      </div>
                    ))}
                    <div ref={bottomRef} />
                  </div>
                )}
              </div>

              {/* Input Bar Area */}
              <div className="p-2 sm:p-4 bg-gradient-to-t from-[#0b0f19] via-[#0b0f19] to-transparent shrink-0">
                <div className="max-w-3xl mx-auto">

                  {/* Hidden File Input */}
                  <input
                    type="file"
                    multiple
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".pdf,.docx,.txt,.md,.csv,.xlsx,.xls,.py,.js,.ts,.jsx,.tsx,.json,.html,.css,.sql,.xml"
                    className="hidden"
                  />
                  {/* Attached Files Badges */}
                  {(attachedFiles.length > 0 || isUploadingFile) && (
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
                      {attachedFiles.map(file => (
                        <div
                          key={file.id}
                          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-[#1c2436] border border-gray-700 text-[11px] sm:text-xs text-gray-200 shadow-sm"
                        >
                          <FileText className="w-3.5 h-3.5 text-[#FACC15]" />
                          <span className="max-w-[120px] sm:max-w-[150px] truncate font-medium">{file.original_name}</span>
                          <span className="text-[9px] sm:text-[10px] text-emerald-400 font-mono">✓ Ready</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(file.id)}
                            className="ml-0.5 sm:ml-1 p-0.5 hover:bg-gray-700 rounded-md text-gray-400 hover:text-red-400 transition"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {isUploadingFile && (
                        <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-[#1c2436] border border-yellow-500/50 text-[11px] sm:text-xs text-[#FACC15] animate-pulse">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Processing...</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="relative flex items-center bg-[#141a27] rounded-xl sm:rounded-2xl shadow-xl border border-gray-700/80 focus-within:border-[#FACC15] focus-within:ring-1 focus-within:ring-[#FACC15]/40 transition duration-200">

                    {/* File Attachment Button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (!isAuthenticated) {
                          onRequireAuth?.()
                          return
                        }
                        fileInputRef.current?.click()
                      }}
                      disabled={isUploadingFile || isGenerating}
                      className="pl-2.5 sm:pl-3.5 pr-1 text-gray-400 hover:text-[#FACC15] transition cursor-pointer disabled:opacity-30 shrink-0"
                      title="Attach Document/File for context"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>

                    <textarea
                      className="w-full bg-transparent text-white pl-1.5 sm:pl-2 pr-11 sm:pr-14 py-2.5 sm:py-3.5 outline-none resize-none h-12 sm:h-14 max-h-36 text-xs sm:text-sm placeholder-gray-500"
                      placeholder="Start Interacting..."
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          if (!isAuthenticated) {
                            onRequireAuth?.()
                            return
                          }
                          if (input.trim() || attachedFiles.length > 0) {
                            handleSend()
                          }
                        }
                      }}
                      disabled={isGenerating}
                    />

                    <button
                      type="button"
                      onClick={() => {
                        if (!isAuthenticated) {
                          onRequireAuth?.()
                          return
                        }
                        handleSend()
                      }}
                      disabled={isAuthenticated && ((!input.trim() && attachedFiles.length === 0) || isGenerating || isUploadingFile)}
                      className="absolute right-1.5 sm:right-2.5 p-2 sm:p-2.5 bg-[#FACC15] hover:bg-[#EAB308] text-gray-950 font-bold rounded-lg sm:rounded-xl transition duration-150 disabled:opacity-30 disabled:hover:bg-[#FACC15] cursor-pointer shadow-md shadow-yellow-500/20 shrink-0"
                    >
                      <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-1.5 sm:mt-2 px-1 sm:px-2 text-[10px] sm:text-[11px] text-gray-500">
                    <span className="hidden sm:inline">Shift + Enter for new line • Attach files with 📎</span>
                    <span className="sm:hidden">Tap 📎 to attach files • Shift+Enter for new line</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Workspace Creation Modal */}
            <WorkspaceModal isOpen={isCreateWsOpen} onClose={() => setIsCreateWsOpen(false)} />
          </div>
          )
}
