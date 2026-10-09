import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useWorkspace } from '../context/WorkspaceContext'
import { useTheme } from '../context/ThemeContext'
import type { UploadedFile } from '../types'
import { API_ENDPOINTS } from '../apiConfig'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'

interface UserLayoutProps {
  onSwitchToAdmin?: () => void
  onRequireAuth?: () => void
}

export const UserLayout: React.FC<UserLayoutProps> = ({ onSwitchToAdmin, onRequireAuth }) => {
  const { user, token: authToken, isAuthenticated } = useAuth()
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const {
    currentWorkspace,
    currentConversationId,
    messages,
    setMessages,
    createNewConversation,
    updateConversationTitle,
  } = useWorkspace()

  const [input, setInput] = useState('')
  const [model, setModel] = useState('qwen2.5-coder:1.5b')
  const [jailbreak, setJailbreak] = useState('default')
  const [webAccess, setWebAccess] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const [attachedFiles, setAttachedFiles] = useState<UploadedFile[]>([])
  const [isUploadingFile, setIsUploadingFile] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const bottomRef = useRef<HTMLDivElement>(null)
  const conversationIdRef = useRef<string>(currentConversationId || Math.random().toString(36).substring(2))

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
        if (response.status === 504) throw new Error('GATEWAY_TIMEOUT_504')
        else if (response.status === 502) throw new Error('BAD_GATEWAY_502')
        else if (response.status === 401 || response.status === 403) throw new Error('AUTH_ERROR')
        else throw new Error(`HTTP_ERROR_${response.status}`)
      }

      if (!response.body) throw new Error('No response body stream')
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })

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
      if (error?.message === 'GATEWAY_TIMEOUT_504') customNotice = '⚠️ **Gateway Timeout (504)**: The server took too long to process this request (especially with document/CSV analysis). The AI model or upstream Nginx server timed out. Please try again or check Nginx `proxy_read_timeout` on the server.'
      else if (error?.message === 'BAD_GATEWAY_502') customNotice = '⚠️ **Bad Gateway (502)**: The AI backend service is currently offline or unreachable.'
      else if (error?.message === 'AUTH_ERROR') customNotice = '⚠️ **Authentication Required**: Your session has expired. Please log in again.'
      else if (error?.message?.startsWith('HTTP_ERROR_')) customNotice = `⚠️ **Server Error (${error.message.replace('HTTP_ERROR_', '')})**: The server encountered an issue processing your request.`

      setMessages(prev => {
        const last = prev[prev.length - 1]
        return [
          ...prev.slice(0, -1),
          {
            ...last,
            content: (last && !last.content.trim().toLowerCase().startsWith('<html') ? last.content : '') + `\n\n> ${customNotice}`,
          },
        ]
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className={`flex h-full font-sans overflow-hidden transition-colors pb-[72px] md:pb-0 ${isLight ? 'bg-[#f8fafc] text-gray-900' : 'bg-[#0b0f19] text-gray-100'
      }`}>

      <Sidebar
        isMobileSidebarOpen={isMobileSidebarOpen}
        setIsMobileSidebarOpen={setIsMobileSidebarOpen}
        isGenerating={isGenerating}
        onSwitchToAdmin={onSwitchToAdmin}
        onRequireAuth={onRequireAuth}
        handleStartNewChat={handleStartNewChat}
      />

      <div className={`flex-1 flex flex-col relative overflow-hidden h-full min-w-0 transition-colors ${isLight ? 'bg-[#f8fafc]' : 'bg-[#0b0f19]'
        }`}>

        <TopBar
          setIsMobileSidebarOpen={setIsMobileSidebarOpen}
          isGenerating={isGenerating}
          messagesLength={messages.length}
          jailbreak={jailbreak}
          setJailbreak={setJailbreak}
          webAccess={webAccess}
          setWebAccess={setWebAccess}
          onRequireAuth={onRequireAuth}
        />

        <MessageList
          isGenerating={isGenerating}
          handleSend={handleSend}
          copiedIndex={copiedIndex}
          handleCopyCode={handleCopyCode}
          bottomRef={bottomRef}
        />

        <ChatInput
          input={input}
          setInput={setInput}
          handleSend={handleSend}
          attachedFiles={attachedFiles}
          isUploadingFile={isUploadingFile}
          fileInputRef={fileInputRef}
          handleFileUpload={handleFileUpload}
          handleRemoveFile={handleRemoveFile}
          isGenerating={isGenerating}
          onRequireAuth={onRequireAuth}
        />
      </div>
    </div>
  )
}
