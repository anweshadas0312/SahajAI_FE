import React, { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  Sparkles,
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
  Database,
  Code,
  Terminal,
  Compass,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useWorkspace } from '../context/WorkspaceContext'
import { WorkspaceModal } from './WorkspaceModal'

interface UserLayoutProps {
  onSwitchToAdmin?: () => void
}

export const UserLayout: React.FC<UserLayoutProps> = ({ onSwitchToAdmin }) => {
  const { user, logout, isAdmin, dbConnected } = useAuth()
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
  const [model, setModel] = useState('mistral:latest')
  const [jailbreak, setJailbreak] = useState('default')
  const [webAccess, setWebAccess] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false)
  const [isCreateWsOpen, setIsCreateWsOpen] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const bottomRef = useRef<HTMLDivElement>(null)
  const conversationIdRef = useRef<string>(currentConversationId || Math.random().toString(36).substring(2))

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
    const newId = await createNewConversation(model, jailbreak)
    conversationIdRef.current = newId
    setMessages([])
  }

  const handleSend = async (overridePrompt?: string) => {
    const promptToSend = overridePrompt || input.trim()
    if (!promptToSend || isGenerating) return
    setInput('')

    // Ensure we have a conversation created
    if (!currentConversationId) {
      const newId = await createNewConversation(model, jailbreak)
      conversationIdRef.current = newId
    }

    const newMessages = [...messages, { role: 'user' as const, content: promptToSend }]
    setMessages([...newMessages, { role: 'assistant' as const, content: '' }])
    setIsGenerating(true)

    // Update conversation title if first message
    if (messages.length === 0 && conversationIdRef.current) {
      const shortTitle = promptToSend.slice(0, 32) + (promptToSend.length > 32 ? '...' : '')
      updateConversationTitle(conversationIdRef.current, shortTitle)
    }

    try {
      const token = Math.random().toString(36).substring(2)
      const response = await fetch('/backend-api/v2/conversation', {
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
      title: 'Full-Stack Architecture',
      desc: 'Design an end-to-end scalable application with clean modular APIs',
      icon: Terminal,
      prompt: 'Design an end-to-end architecture for a modern SaaS web app using FastAPI, MySQL, and React.',
    },
    {
      title: 'MySQL Optimization',
      desc: 'Analyze indexing, joins, and relational query efficiency',
      icon: Database,
      prompt: 'Explain best practices for indexing and query optimization in MySQL 8 for high-concurrency systems.',
    },
    {
      title: 'Python Script Helper',
      desc: 'Write automated async pipelines or processing utilities',
      icon: Code,
      prompt: 'Write a Python utility to stream data asynchronously and process incoming JSON payloads.',
    },
    {
      title: 'Brainstorm Strategy',
      desc: 'Explore product roadmaps, tech choices, and user flow ideas',
      icon: Compass,
      prompt: 'Give me 5 high-impact features to include in an AI productivity workspace tool.',
    },
  ]

  return (
    <div className="flex h-screen bg-[#0b0f19] text-gray-100 font-sans overflow-hidden">
      {/* ========================================================= */}
      {/* SIDEBAR */}
      {/* ========================================================= */}
      <div className="w-72 bg-[#121722] border-r border-gray-800/80 flex flex-col justify-between shrink-0 select-none">
        <div className="p-4 flex flex-col h-full overflow-hidden">
          {/* Top Branding & Workspace Selector */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FACC15] flex items-center justify-center text-gray-950 font-bold shadow-md shadow-yellow-500/20">
                  <Sparkles className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-white tracking-tight leading-none">SahajAI</h1>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-[#FACC15]">Studio</span>
                </div>
              </div>

              {/* DB Status Badge */}
              <div
                title={dbConnected ? 'MySQL Connected' : 'MySQL Standby'}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-850 border border-gray-700/60 text-[10px] text-gray-400"
              >
                <span className={`w-2 h-2 rounded-full ${dbConnected ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`} />
                <span>MySQL</span>
              </div>
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
                      }}
                      className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition ${
                        currentWorkspace?.id === ws.id
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
                  onClick={() => setCurrentConversationId(conv.id)}
                  className={`group flex items-center justify-between p-2.5 rounded-xl text-xs transition cursor-pointer ${
                    currentConversationId === conv.id
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

          {/* Profile Card */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-gray-900/60 border border-gray-800">
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-xs font-bold text-white uppercase">
                {user?.username ? user.username[0] : 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{user?.username || 'User'}</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-gray-800 text-[#FACC15] font-mono font-bold uppercase">
                    {user?.role || 'user'}
                  </span>
                  <span className="text-[10px] text-gray-500 truncate">{user?.email}</span>
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-gray-800 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MAIN CHAT AREA */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col relative bg-[#0b0f19] overflow-hidden">
        {/* Top Control Bar */}
        <div className="h-14 px-6 border-b border-gray-800/80 bg-[#101521]/70 backdrop-blur-md flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-2.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: currentWorkspace?.icon_color || '#FACC15' }}
            />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              {currentWorkspace?.name}
            </span>
            <span className="text-xs text-gray-600">/</span>
            <span className="text-xs text-gray-400 font-mono">
              {conversations.find(c => c.id === currentConversationId)?.title || 'Active Session'}
            </span>
          </div>

          {/* Model & Config Selectors */}
          <div className="flex items-center gap-2 text-xs">
            {/* Model Selector */}
            <div className="flex items-center gap-1 bg-[#182030] border border-gray-700/80 rounded-lg px-2.5 py-1 text-gray-200">
              <Cpu className="w-3.5 h-3.5 text-[#FACC15]" />
              <select
                value={model}
                onChange={e => setModel(e.target.value)}
                className="bg-transparent text-xs text-white outline-none cursor-pointer"
              >
                <option value="mistral:latest" className="bg-[#182030]">Mistral Latest</option>
                <option value="qwen2.5-coder:1.5b" className="bg-[#182030]">Qwen 2.5 Coder</option>
              </select>
            </div>

            {/* Jailbreak Selector */}
            <select
              value={jailbreak}
              onChange={e => setJailbreak(e.target.value)}
              className="bg-[#182030] border border-gray-700/80 rounded-lg px-2.5 py-1 text-gray-200 text-xs outline-none cursor-pointer"
            >
              <option value="default" className="bg-[#182030]">Standard Mode</option>
              <option value="gpt-dan-11.0" className="bg-[#182030]">DAN Mode</option>
              <option value="gpt-evil" className="bg-[#182030]">EvilBOT</option>
            </select>

            {/* Web Access Toggle */}
            <button
              type="button"
              onClick={() => setWebAccess(!webAccess)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition cursor-pointer ${
                webAccess
                  ? 'bg-[#FACC15]/15 border-[#FACC15] text-[#FACC15]'
                  : 'bg-[#182030] border-gray-700/80 text-gray-400 hover:text-gray-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Web Search</span>
            </button>
          </div>
        </div>

        {/* Chat Message List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="max-w-3xl mx-auto h-full flex flex-col items-center justify-center py-10">
              <div className="w-16 h-16 rounded-3xl bg-[#FACC15]/10 border border-[#FACC15]/30 flex items-center justify-center text-[#FACC15] mb-5 yellow-glow">
                <Sparkles className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2 text-center">
                Welcome to <span className="text-[#FACC15]">SahajAI</span>
              </h2>
              <p className="text-gray-400 text-sm max-w-md text-center mb-8">
                Your dedicated workspace: <strong className="text-gray-200">{currentWorkspace?.name}</strong>.
                All conversations and outputs are saved securely.
              </p>

              {/* Starter Prompts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 w-full">
                {starterPrompts.map((card, i) => {
                  const Icon = card.icon
                  return (
                    <div
                      key={i}
                      onClick={() => handleSend(card.prompt)}
                      className="p-4 rounded-2xl bg-[#141a27] border border-gray-800 hover:border-[#FACC15]/50 hover:bg-[#182030] transition duration-200 cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 mb-1.5 text-white group-hover:text-[#FACC15] transition">
                        <Icon className="w-4 h-4 text-[#FACC15]" />
                        <h4 className="text-sm font-semibold">{card.title}</h4>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed">{card.desc}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role !== 'user' && (
                    <div className="w-8 h-8 rounded-xl bg-[#FACC15] text-gray-950 flex items-center justify-center shrink-0 font-bold shadow-md shadow-yellow-500/20">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-4.5 ${
                      msg.role === 'user'
                        ? 'bg-[#1c2436] text-white border border-gray-700/80 rounded-tr-none'
                        : 'bg-[#141a27] text-gray-200 border border-gray-800 rounded-tl-none prose prose-invert max-w-none'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                    ) : (
                      <div className="relative group text-sm leading-relaxed space-y-2">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
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
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-gray-700 to-gray-600 text-white flex items-center justify-center shrink-0 text-xs font-bold uppercase">
                      {user?.username ? user.username[0] : 'U'}
                    </div>
                  )}
                </div>
              ))}
              {isGenerating && (
                <div className="flex items-center gap-2 text-xs text-[#FACC15] animate-pulse">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>SahajAI is generating response...</span>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input Bar Area */}
        <div className="p-4 bg-gradient-to-t from-[#0b0f19] via-[#0b0f19] to-transparent shrink-0">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-center bg-[#141a27] rounded-2xl shadow-xl border border-gray-700/80 focus-within:border-[#FACC15] focus-within:ring-1 focus-within:ring-[#FACC15]/40 transition duration-200">
              <textarea
                className="w-full bg-transparent text-white pl-4 pr-14 py-3.5 outline-none resize-none h-14 max-h-36 text-sm placeholder-gray-500"
                placeholder={`Ask ${currentWorkspace?.name} anything...`}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                disabled={isGenerating}
              />

              <button
                type="button"
                onClick={() => handleSend()}
                disabled={!input.trim() || isGenerating}
                className="absolute right-2.5 p-2.5 bg-[#FACC15] hover:bg-[#EAB308] text-gray-950 font-bold rounded-xl transition duration-150 disabled:opacity-30 disabled:hover:bg-[#FACC15] cursor-pointer shadow-md shadow-yellow-500/20"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between mt-2 px-2 text-[11px] text-gray-500">
              <span>Shift + Enter for new line • Enter to send</span>
              <span className="font-mono text-gray-400">
                Workspace ID: {currentWorkspace?.id} • Model: {model}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Workspace Creation Modal */}
      <WorkspaceModal isOpen={isCreateWsOpen} onClose={() => setIsCreateWsOpen(false)} />
    </div>
  )
}
