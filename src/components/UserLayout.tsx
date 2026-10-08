import React, { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  Plus,
  Send,
  MessageSquare,
  Trash2,
  ChevronDown,
  ChevronRight,
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
import { ChartRenderer } from './ChartRenderer'

interface UserLayoutProps {
  onSwitchToAdmin?: () => void
  onRequireAuth?: () => void
}

// Fallback helper to extract chart data if AI model outputs text bullet points, tables, or prose instead of ```chart codeblock
const extractChartFromText = (text: string) => {
  if (!text || text.includes('```chart')) return null

  const lower = text.toLowerCase()
  const lines = text.split('\n')
  const items: { name: string; value: number }[] = []

  for (const line of lines) {
    const cleanLine = line.replace(/[\*\_\`]/g, '').trim()
    if (!cleanLine) continue

    // Pattern 1: Table row | Gold | 22956 | or | Gold | $22,956 |
    if (cleanLine.startsWith('|') && cleanLine.endsWith('|')) {
      const cells = cleanLine.split('|').map(c => c.trim()).filter(Boolean)
      if (cells.length >= 2) {
        const nameCandidate = cells[0]
        const valCandidate = parseFloat(cells[1].replace(/[\$,]/g, ''))
        if (nameCandidate && !isNaN(valCandidate) && valCandidate > 0) {
          const lowerC = nameCandidate.toLowerCase()
          const isMeta = ['category', 'item', 'metal', 'type', 'name', '---', 'header', 'label', 'parameter', 'id'].some(k => lowerC.includes(k))
          if (!isMeta) {
            if (!items.some(it => it.name.toLowerCase() === lowerC)) {
              items.push({ name: nameCandidate, value: valCandidate })
            }
          }
        }
      }
      continue
    }

    // Pattern 2: Key-value lines: "Gold: 22,956" or "• Gold: 48.9%" or "Gold - $22,956"
    const match = cleanLine.match(/^[-*•\d\.\)]*\s*([A-Za-z0-9\s\-\/]+?)[:=]\s*(?:[^0-9\n]*?)\$?([0-9]+(?:[\.,][0-9]+)?)%?/i)
    if (match) {
      const rawName = match[1].trim()
      const rawVal = parseFloat(match[2].replace(/,/g, ''))
      if (rawName && !isNaN(rawVal) && rawVal > 0) {
        const lowerName = rawName.toLowerCase()
        const isMeta = ['date range', 'metal types', 'order number', 'total sales', 'explanation', 'most sold metals', 'average cost', 'item types', 'pie chart', 'bar chart', 'summary', 'key topics', 'data table', 'chart title', 'subtitle', 'price level', 'order count'].some(k => lowerName.includes(k))
        if (!isMeta) {
          if (!items.some(it => it.name.toLowerCase() === lowerName)) {
            items.push({ name: rawName, value: rawVal })
          }
        }
      }
    }
  }

  if (items.length >= 2) {
    const chartType = lower.includes('bar chart') ? 'bar' : 'pie'
    return {
      type: chartType,
      title: chartType === 'bar' ? 'Bar Chart Visualization' : 'Pie Chart Breakdown',
      data: items,
    }
  }

  return null
}

export const UserLayout: React.FC<UserLayoutProps> = ({ onSwitchToAdmin, onRequireAuth }) => {
  const { user, token: authToken, logout, isAdmin, isAuthenticated } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const isLight = theme === 'light'
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
  const [isJailbreakMenuOpen, setIsJailbreakMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isHelpSubmenuOpen, setIsHelpSubmenuOpen] = useState(false)
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

    const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2 MB
    for (const selectedFile of selectedFiles) {
      if (selectedFile.size > MAX_FILE_SIZE) {
        alert(`File "${selectedFile.name}" exceeds maximum allowed size limit of 2 MB.`)
        continue
      }
      const formData = new FormData()
      formData.append('file', selectedFile)
      if (currentWorkspace?.id) {
        formData.append('workspace_id', currentWorkspace.id.toString())
      }
      if (conversationIdRef.current) {
        formData.append('conversation_id', conversationIdRef.current)
      }

      try {
        const res = await fetch(API_ENDPOINTS.FILES.UPLOAD, {
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
        await fetch(API_ENDPOINTS.FILES.BY_ID(fileId), {
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

    const currentFiles = [...attachedFiles]
    setAttachedFiles([])
    const newMessages = [...messages, { role: 'user' as const, content: promptToSend, files: currentFiles, isAutoPrompt }]
    setMessages([...newMessages, { role: 'assistant' as const, content: '' }])
    setIsGenerating(true)

    // Ensure we have a conversation created
    const shortTitle = promptToSend.slice(0, 32) + (promptToSend.length > 32 ? '...' : '')
    let activeId = currentConversationId || conversationIdRef.current
    if (!currentConversationId) {
      activeId = await createNewConversation(model, jailbreak, shortTitle)
      conversationIdRef.current = activeId
    } else if (messages.length === 0 && activeId) {
      updateConversationTitle(activeId, shortTitle)
    }

    try {
      const streamToken = Math.random().toString(36).substring(2)
      const response = await fetch(API_ENDPOINTS.CONVERSATION.STREAM, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          conversation_id: conversationIdRef.current,
          workspace_id: currentWorkspace?.id,
          user_id: user?.id,
          action: '_ask',
          model: model,
          jailbreak: jailbreak,
          meta: {
            id: streamToken,
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

      if (!response.ok) {
        if (response.status === 504) {
          throw new Error('GATEWAY_TIMEOUT_504')
        } else if (response.status === 502) {
          throw new Error('BAD_GATEWAY_502')
        } else if (response.status === 401 || response.status === 403) {
          throw new Error('AUTH_ERROR')
        } else {
          throw new Error(`HTTP_ERROR_${response.status}`)
        }
      }

      if (!response.body) throw new Error('No response body stream')
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })

        // Safety check: if backend/proxy returned an HTML error page instead of stream
        if ((assistantContent + chunk).trim().toLowerCase().startsWith('<html') ||
          (assistantContent + chunk).trim().toLowerCase().startsWith('<!doctype')) {
          throw new Error('GATEWAY_TIMEOUT_504')
        }

        assistantContent += chunk
        setMessages([...newMessages, { role: 'assistant' as const, content: assistantContent }])
      }
    } catch (error: any) {
      console.error('Chat generation error:', error)
      let customNotice = '⚠️ **Service Notice**: Backend stream did not respond. Check your LLM host endpoint or model status.'

      if (error?.message === 'GATEWAY_TIMEOUT_504') {
        customNotice = '⚠️ **Gateway Timeout (504)**: The server took too long to process this request (especially with document/CSV analysis). The AI model or upstream Nginx server timed out. Please try again or check Nginx `proxy_read_timeout` on the server.'
      } else if (error?.message === 'BAD_GATEWAY_502') {
        customNotice = '⚠️ **Bad Gateway (502)**: The AI backend service is currently offline or unreachable.'
      } else if (error?.message === 'AUTH_ERROR') {
        customNotice = '⚠️ **Authentication Required**: Your session has expired. Please log in again.'
      } else if (error?.message?.startsWith('HTTP_ERROR_')) {
        customNotice = `⚠️ **Server Error (${error.message.replace('HTTP_ERROR_', '')})**: The server encountered an issue processing your request.`
      }

      setMessages(prev => {
        const last = prev[prev.length - 1]
        return [
          ...prev.slice(0, -1),
          {
            ...last,
            content:
              (last && !last.content.trim().toLowerCase().startsWith('<html') ? last.content : '') +
              `\n\n> ${customNotice}`,
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
    <div className={`flex h-[100dvh] font-sans overflow-hidden transition-colors ${isLight ? 'bg-[#f8fafc] text-gray-900' : 'bg-[#0b0f19] text-gray-100'
      }`}>
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
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 max-w-[85vw] flex flex-col justify-between shrink-0 select-none transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none border-r ${isLight ? 'bg-white border-gray-200' : 'bg-[#121722] border-gray-800/80'
          } ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
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
            <div className="relative">
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
          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
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
        <div className={`p-3 border-t space-y-2 ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-[#0d1117] border-gray-800/80'
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
            <div className="relative">
              {isProfileMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => { setIsProfileMenuOpen(false); setIsHelpSubmenuOpen(false); }} />
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
                        <div className={`absolute left-full bottom-0 ml-1 w-48 border rounded-xl shadow-xl overflow-hidden p-1 z-50 ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-gray-900 border-gray-800'}`}>
                          <a
                            href="/privacy-policy"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => {
                              setIsHelpSubmenuOpen(false)
                              setIsProfileMenuOpen(false)
                            }}
                            className={`block px-3 py-2 text-xs rounded-lg transition ${theme === 'light' ? 'text-gray-700 hover:bg-gray-100 hover:text-black' : 'text-gray-200 hover:bg-gray-800 hover:text-white'}`}
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
                            className={`block px-3 py-2 text-xs rounded-lg transition ${theme === 'light' ? 'text-gray-700 hover:bg-gray-100 hover:text-black' : 'text-gray-200 hover:bg-gray-800 hover:text-white'}`}
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
                            className={`block px-3 py-2 text-xs rounded-lg transition ${theme === 'light' ? 'text-gray-700 hover:bg-gray-100 hover:text-black' : 'text-gray-200 hover:bg-gray-800 hover:text-white'}`}
                          >
                            Terms and Conditions
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </>
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

      {/* ========================================================= */}
      {/* MAIN CHAT AREA */}
      {/* ========================================================= */}
      <div className={`flex-1 flex flex-col relative overflow-hidden min-w-0 transition-colors ${isLight ? 'bg-[#f8fafc]' : 'bg-[#0b0f19]'
        }`}>
        {/* Top Control Bar */}
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
                  state={isGenerating ? 'thinking' : messages.length > 0 ? 'lit' : 'off'}
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

        {/* Chat Message List */}
        <div className={`flex-1 ${messages.length === 0 && !isGenerating
          ? 'overflow-y-auto p-2 sm:p-4 flex flex-col'
          : 'overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6'
          }`}>
          {messages.length === 0 && !isGenerating ? (
            <div className="max-w-3xl mx-auto w-full flex flex-col items-center my-auto py-6 sm:py-8 px-2 sm:px-4">
              <div className="mb-2 sm:mb-3 flex items-center justify-center">
                <ThinkingBulb state="lit" size={46} />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2 text-center">
                Welcome to <span className="text-[#EAB308]">sahaj</span><span className={theme === 'dark' ? "text-white" : "text-black"}>AI</span>
              </h2>
              {/* <p className={`text-xs sm:text-sm max-w-md text-center mb-3.5 sm:mb-5 px-2 ${isLight ? 'text-gray-600' : 'text-gray-400'
                }`}>
                Your dedicated workspace: <strong className={isLight ? 'text-gray-900 font-bold' : 'text-gray-200'}>{currentWorkspace?.name}</strong>.
                All conversations and outputs are saved securely.
              </p> */}


              <p
                className={`text-xs sm:text-sm max-w-md text-center mb-3.5 sm:mb-5 px-2 ${isLight ? 'text-gray-600' : 'text-gray-400'
                  }`}
              >
                In <strong className={isLight ? 'text-gray-900 font-bold' : 'text-gray-200'}>
                  Proudly supporting the Make in INDIA initiative.
                </strong>{' '}
                — built with innovation and technology for the world.
              </p>

              {/* Starter Prompts Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 w-full max-w-2xl">
                {starterPrompts.map((card, i) => {
                  const Icon = card.icon
                  return (
                    <div
                      key={i}
                      style={{ '--card-index': i } as React.CSSProperties}
                      onClick={() => handleSend(card.prompt)}
                      className={`starter-card-anim group relative p-3 sm:p-3.5 rounded-xl border cursor-pointer text-left select-none transition-all duration-200 ${isLight
                        ? 'bg-white border-gray-200 hover:border-amber-400 hover:shadow-md'
                        : 'bg-[#141a27] border-gray-800/90 hover:border-[#EAB308]/60 hover:bg-[#182030]'
                        }`}
                    >
                      <div className="starter-card-shimmer" />

                      <div className="flex items-start justify-between mb-2 sm:mb-2.5 relative z-10">
                        <div className="flex items-center gap-2 sm:gap-2.5">
                          <div className={`starter-icon-wrap p-1.5 rounded-xl transition-all duration-300 shadow-sm ${isLight
                            ? 'bg-amber-50 text-amber-700 group-hover:bg-amber-400 group-hover:text-gray-950 group-hover:scale-110 group-hover:rotate-[-4deg]'
                            : 'bg-[#EAB308]/10 text-[#EAB308] group-hover:bg-[#EAB308] group-hover:text-[#0b0f19] group-hover:scale-110 group-hover:rotate-[-4deg]'
                            }`}>
                            <Icon className="w-3.5 h-3.5 transition-colors" />
                          </div>
                          <span className={`starter-tag text-[9px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full border transition-colors ${isLight
                            ? 'bg-gray-100 text-gray-600 border-gray-200 group-hover:border-amber-300 group-hover:text-amber-800'
                            : 'bg-gray-800/80 text-gray-300 border-gray-700/60 group-hover:border-[#EAB308]/40 group-hover:text-[#EAB308]'
                            }`}>
                            {card.category}
                          </span>
                        </div>
                        <div className={`flex items-center group-hover:translate-x-1 opacity-60 group-hover:opacity-100 transition-all duration-200 ${isLight ? 'text-gray-400 group-hover:text-amber-600' : 'text-gray-500 group-hover:text-[#EAB308]'
                          }`}>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      <h4 className={`text-[11px] sm:text-xs font-semibold transition-colors mb-0.5 relative z-10 ${isLight ? 'text-gray-950 group-hover:text-amber-700' : 'text-white group-hover:text-[#EAB308]'
                        }`}>
                        {card.title}
                      </h4>
                      <p className={`text-[10px] sm:text-[11px] leading-relaxed transition-colors relative z-10 ${isLight ? 'text-gray-600 group-hover:text-gray-800' : 'text-gray-400 group-hover:text-gray-300'
                        }`}>
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
                      ? isLight
                        ? 'bg-[#EAB308] text-gray-950 border border-amber-500/40 rounded-tr-none font-medium'
                        : 'bg-[#1c2436] text-white border border-gray-700/80 rounded-tr-none'
                      : isLight
                        ? 'bg-white text-gray-900 border border-gray-200 rounded-tl-none prose shadow-sm max-w-none'
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
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs hover:underline transition cursor-pointer group ${isLight
                                  ? 'bg-amber-50/80 border-amber-300 text-amber-900 hover:border-amber-400'
                                  : 'bg-[#141a27] border-gray-700 hover:border-[#EAB308] text-[#EAB308]'
                                  }`}
                                title="Click to view file"
                              >
                                <FileText className={`w-3.5 h-3.5 ${isLight ? 'text-amber-800' : 'text-[#EAB308]'}`} />
                                <span className="font-medium">{f.original_name}</span>
                                <ExternalLink className={`w-3 h-3 ${isLight ? 'text-amber-700' : 'text-gray-400 group-hover:text-[#EAB308]'}`} />
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
                          <>
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                a: ({ node, href, children, ...props }) => (
                                  <a
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-amber-600 dark:text-[#EAB308] hover:text-amber-700 dark:hover:text-[#EAB308] underline underline-offset-3 font-semibold break-all inline-flex items-center gap-1 cursor-pointer transition hover:opacity-90"
                                    {...props}
                                  >
                                    <span>{children}</span>
                                    <ExternalLink className="w-3.5 h-3.5 inline-block shrink-0 opacity-80" />
                                  </a>
                                ),
                                code: ({ node, inline, className, children, ...props }: any) => {
                                  const match = /language-(\w+)/.exec(className || '');
                                  const lang = match ? match[1].toLowerCase() : '';
                                  const rawContent = String(children).replace(/\n$/, '').trim();

                                  if (lang === 'chart' || lang === 'pie' || lang === 'bar' || lang === 'line' || lang === 'json' || !lang) {
                                    try {
                                      const parsed = JSON.parse(rawContent);
                                      if (parsed && (Array.isArray(parsed.data) || parsed.type || parsed.title)) {
                                        if (!parsed.type && (lang === 'pie' || lang === 'bar' || lang === 'line')) {
                                          parsed.type = lang;
                                        }
                                        if (Array.isArray(parsed.data) && parsed.data.length > 0) {
                                          return <ChartRenderer dataPayload={parsed} />;
                                        }
                                      }
                                    } catch (e) {
                                      // Not valid JSON chart data, fallback to normal code block
                                    }
                                  }

                                  if (inline) {
                                    return (
                                      <code className="bg-[#141a27] text-[#EAB308] px-1.5 py-0.5 rounded font-mono text-xs" {...props}>
                                        {children}
                                      </code>
                                    );
                                  }
                                  return (
                                    <pre className="bg-[#0f141f] border border-[#232d3f] p-3 rounded-lg overflow-x-auto text-xs font-mono my-2 text-gray-200" {...props}>
                                      <code>{children}</code>
                                    </pre>
                                  );
                                },
                              }}
                            >
                              {msg.content}
                            </ReactMarkdown>

                            {/* Fallback chart extractor if model wrote text breakdown without ```chart block */}
                            {(() => {
                              const fallbackChart = extractChartFromText(msg.content)
                              return fallbackChart ? <ChartRenderer dataPayload={fallbackChart} /> : null
                            })()}
                          </>
                        ) : (
                          <span className="dots inline-flex items-center py-1.5" aria-label="Thinking">
                            <span></span><span></span><span></span>
                          </span>
                        )}
                        {msg.content && (
                          <div className="flex justify-end pt-2">
                            <button
                              onClick={() => handleCopyCode(msg.content, idx)}
                              className={`flex items-center gap-1.5 text-[11px] transition cursor-pointer ${isLight ? 'text-gray-400 hover:text-amber-600' : 'text-gray-400 hover:text-[#EAB308]'
                                }`}
                            >
                              {copiedIndex === idx ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                                  <span className="text-emerald-500">Copied</span>
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
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-[#EAB308] text-gray-950 flex items-center justify-center shrink-0 text-[10px] sm:text-xs font-black shadow-sm border border-yellow-500/40 uppercase">
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
        <div className={`p-2 sm:p-4 pb-3 sm:pb-4 shrink-0 transition-colors ${isLight
          ? 'bg-gradient-to-t from-[#f8fafc] via-[#f8fafc]/95 to-transparent'
          : 'bg-gradient-to-t from-[#0b0f19] via-[#0b0f19] to-transparent'
          }`}>
          <div className="max-w-3xl mx-auto">

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              accept=".pdf,.docx,.txt,.md,.csv,.xlsx,.xls,.py,.js,.ts,.jsx,.tsx,.json,.html,.css,.sql,.xml"
              className="hidden"
            />

            {/* Attached Files Badges */}
            {(attachedFiles.length > 0 || isUploadingFile) && (
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
                {attachedFiles.map(file => (
                  <div
                    key={file.id}
                    className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border text-[11px] sm:text-xs shadow-sm ${isLight
                      ? 'bg-white border-gray-300 text-gray-800'
                      : 'bg-[#1c2436] border-gray-700 text-gray-200'
                      }`}
                  >
                    <FileText className={`w-3.5 h-3.5 ${isLight ? 'text-amber-600' : 'text-[#EAB308]'}`} />
                    <span className="max-w-[120px] sm:max-w-[150px] truncate font-medium">{file.original_name}</span>
                    <span className={`text-[9px] sm:text-[10px] font-mono ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`}>✓ Ready</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(file.id)}
                      className={`ml-0.5 sm:ml-1 p-0.5 rounded-md transition ${isLight ? 'hover:bg-gray-100 text-gray-400 hover:text-red-500' : 'hover:bg-gray-700 text-gray-400 hover:text-red-400'
                        }`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {isUploadingFile && (
                  <div className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border text-[11px] sm:text-xs animate-pulse ${isLight
                    ? 'bg-amber-50 border-amber-300 text-amber-800'
                    : 'bg-[#1c2436] border-yellow-500/50 text-[#EAB308]'
                    }`}>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing...</span>
                  </div>
                )}
              </div>
            )}

            <div className={`relative flex items-center rounded-xl sm:rounded-2xl border transition duration-200 ${isLight
              ? 'bg-white border-gray-300 shadow-md focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20'
              : 'bg-[#141a27] border-gray-700/80 shadow-xl focus-within:border-[#EAB308] focus-within:ring-1 focus-within:ring-[#EAB308]/40'
              }`}>

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
                className={`pl-2.5 sm:pl-3.5 pr-1 transition cursor-pointer disabled:opacity-30 shrink-0 ${isLight ? 'text-gray-400 hover:text-amber-600' : 'text-gray-400 hover:text-[#EAB308]'
                  }`}
                title="Attach Document/File for context"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <textarea
                className={`w-full bg-transparent pl-1.5 sm:pl-2 pr-11 sm:pr-14 py-[16px] sm:py-[18px] outline-none resize-none h-12 sm:h-14 max-h-36 text-xs sm:text-sm leading-tight ${isLight
                  ? 'text-gray-950 placeholder-gray-400'
                  : 'text-white placeholder-gray-500'
                  }`}
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
                className="absolute right-1.5 sm:right-2.5 p-2 sm:p-2.5 bg-[#EAB308] hover:bg-[#EAB308] text-gray-950 font-bold rounded-lg sm:rounded-xl transition duration-150 disabled:opacity-30 disabled:hover:bg-[#EAB308] cursor-pointer shadow-md shadow-yellow-500/20 shrink-0"
              >
                <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            <div className={`flex items-center justify-between mt-1.5 sm:mt-2 px-1 sm:px-2 text-[10px] sm:text-[11px] ${isLight ? 'text-gray-500' : 'text-gray-500'
              }`}>
              <span className="hidden sm:inline-flex items-center gap-1">
                Shift + Enter for new line • Attach multiple files with <Paperclip className="w-3 h-3 text-gray-400 inline" /> (Max 2 MB each)
              </span>
              <span className="sm:hidden flex items-center gap-1">
                Tap <Paperclip className="w-3 h-3 text-gray-400 inline" /> to attach multiple files (Max 2 MB each) • Shift+Enter for new line
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Workspace Creation Modal */}
      <WorkspaceModal isOpen={isCreateWsOpen} onClose={() => setIsCreateWsOpen(false)} />
    </div >
  )
}
