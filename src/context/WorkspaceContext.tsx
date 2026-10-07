import React, { createContext, useContext, useState, useEffect } from 'react'
import type { Workspace, Conversation, ChatMessage } from '../types'
import { useAuth } from './AuthContext'
import { API_ENDPOINTS } from '../apiConfig'

interface WorkspaceContextType {
  workspaces: Workspace[]
  currentWorkspace: Workspace | null
  setCurrentWorkspace: (ws: Workspace) => void
  createWorkspace: (name: string, description?: string, icon_color?: string) => Promise<boolean>
  updateWorkspace: (id: number, name: string, description?: string, icon_color?: string) => Promise<boolean>
  deleteWorkspace: (id: number) => Promise<boolean>
  conversations: Conversation[]
  currentConversationId: string | null
  setCurrentConversationId: (id: string | null) => void
  messages: ChatMessage[]
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
  createNewConversation: (model: string, jailbreak: string, title?: string) => Promise<string>
  deleteConversation: (id: string) => Promise<boolean>
  updateConversationTitle: (id: string, title: string) => Promise<boolean>
  isLoadingWorkspaces: boolean
  isLoadingConversations: boolean
  refreshWorkspaces: () => Promise<void>
  refreshConversations: () => Promise<void>
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined)

const DEFAULT_WORKSPACE_FALLBACK: Workspace = {
  id: 1,
  user_id: 1,
  name: 'Sahaj Workspace',
  description: 'Personal AI Workspace for exploration, code, and analysis',
  icon_color: '#FACC15',
  is_default: true,
  conversation_count: 0,
}

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth()
  const [workspaces, setWorkspaces] = useState<Workspace[]>([DEFAULT_WORKSPACE_FALLBACK])
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(DEFAULT_WORKSPACE_FALLBACK)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState<boolean>(false)
  const [isLoadingConversations, setIsLoadingConversations] = useState<boolean>(false)

  // Fetch workspaces when user/token changes
  const fetchWorkspaces = async () => {
    if (!user || !token) {
      setWorkspaces([DEFAULT_WORKSPACE_FALLBACK])
      setCurrentWorkspace(DEFAULT_WORKSPACE_FALLBACK)
      return
    }

    setIsLoadingWorkspaces(true)
    try {
      const res = await fetch(API_ENDPOINTS.WORKSPACES.BASE, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.workspaces && data.workspaces.length > 0) {
          setWorkspaces(data.workspaces)
          if (!currentWorkspace || !data.workspaces.some((w: Workspace) => w.id === currentWorkspace.id)) {
            setCurrentWorkspace(data.workspaces[0])
          }
          setIsLoadingWorkspaces(false)
          return
        }
      }
    } catch (e) {
      console.warn('Workspace fetch note:', e)
    }

    // Fallback if DB offline or empty
    const localKey = `sahaj_workspaces_${user.id}`
    const stored = localStorage.getItem(localKey)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setWorkspaces(parsed)
        setCurrentWorkspace(parsed[0] || DEFAULT_WORKSPACE_FALLBACK)
      } catch {
        setWorkspaces([DEFAULT_WORKSPACE_FALLBACK])
        setCurrentWorkspace(DEFAULT_WORKSPACE_FALLBACK)
      }
    } else {
      const initialWs = [{ ...DEFAULT_WORKSPACE_FALLBACK, user_id: user.id }]
      setWorkspaces(initialWs)
      setCurrentWorkspace(initialWs[0])
      localStorage.setItem(localKey, JSON.stringify(initialWs))
    }
    setIsLoadingWorkspaces(false)
  }

  // Fetch conversations for current workspace
  const fetchConversations = async () => {
    if (!currentWorkspace || !user) {
      setConversations([])
      return
    }

    setIsLoadingConversations(true)
    try {
      if (token && !token.startsWith('demo_token_')) {
        const res = await fetch(API_ENDPOINTS.WORKSPACES.CONVERSATIONS(currentWorkspace.id), {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          if (data.success) {
            setConversations(data.conversations || [])
            setIsLoadingConversations(false)
            return
          }
        }
      }
    } catch (e) {
      console.warn('Conversations fetch note:', e)
    }

    // LocalStorage fallback
    const localKey = `sahaj_convs_${user.id}_${currentWorkspace.id}`
    const stored = localStorage.getItem(localKey)
    if (stored) {
      try {
        setConversations(JSON.parse(stored))
      } catch {
        setConversations([])
      }
    } else {
      setConversations([])
    }
    setIsLoadingConversations(false)
  }

  // Fetch messages when conversation changes
  const fetchMessages = async () => {
    if (!currentConversationId || !user) {
      setMessages([])
      return
    }

    try {
      if (token && !token.startsWith('demo_token_')) {
        const res = await fetch(API_ENDPOINTS.CONVERSATIONS.BY_ID(currentConversationId), {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          if (data.success && Array.isArray(data.messages) && data.messages.length > 0) {
            setMessages(data.messages)
            return
          }
        }
      }
    } catch (e) {
      console.warn('Messages fetch note:', e)
    }

    // Local storage fallback
    const localKey = `sahaj_msgs_${currentConversationId}`
    const stored = localStorage.getItem(localKey)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed)
          return
        }
      } catch {
        // ignore
      }
    }
  }

  useEffect(() => {
    fetchWorkspaces()
  }, [user, token])

  useEffect(() => {
    if (currentWorkspace) {
      fetchConversations()
      setCurrentConversationId(null)
      setMessages([])
    }
  }, [currentWorkspace?.id])

  useEffect(() => {
    if (currentConversationId) {
      fetchMessages()
    }
  }, [currentConversationId])

  // Save messages to local cache as backup
  useEffect(() => {
    if (currentConversationId && messages.length > 0) {
      localStorage.setItem(`sahaj_msgs_${currentConversationId}`, JSON.stringify(messages))
    }
  }, [messages, currentConversationId])

  const createWorkspace = async (name: string, description = '', icon_color = '#FACC15') => {
    if (!user) return false
    try {
      if (token && !token.startsWith('demo_token_')) {
        const res = await fetch(API_ENDPOINTS.WORKSPACES.BASE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ name, description, icon_color }),
        })
        if (res.ok) {
          const data = await res.json()
          if (data.success && data.workspace) {
            setWorkspaces(prev => [...prev, data.workspace])
            setCurrentWorkspace(data.workspace)
            return true
          }
        }
      }
    } catch (e) {
      console.warn('API workspace create error:', e)
    }

    // Fallback
    const newWs: Workspace = {
      id: Date.now(),
      user_id: user.id,
      name,
      description,
      icon_color,
      is_default: false,
      conversation_count: 0,
      created_at: new Date().toISOString(),
    }
    const updated = [...workspaces, newWs]
    setWorkspaces(updated)
    setCurrentWorkspace(newWs)
    localStorage.setItem(`sahaj_workspaces_${user.id}`, JSON.stringify(updated))
    return true
  }

  const updateWorkspace = async (id: number, name: string, description = '', icon_color = '#FACC15') => {
    if (!user) return false
    try {
      if (token && !token.startsWith('demo_token_')) {
        await fetch(API_ENDPOINTS.WORKSPACES.BY_ID(id), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ name, description, icon_color }),
        })
      }
    } catch (e) {
      console.warn('API workspace update error:', e)
    }

    const updated = workspaces.map(w => (w.id === id ? { ...w, name, description, icon_color } : w))
    setWorkspaces(updated)
    if (currentWorkspace?.id === id) {
      setCurrentWorkspace({ ...currentWorkspace, name, description, icon_color })
    }
    localStorage.setItem(`sahaj_workspaces_${user.id}`, JSON.stringify(updated))
    return true
  }

  const deleteWorkspace = async (id: number) => {
    if (!user) return false
    try {
      if (token && !token.startsWith('demo_token_')) {
        await fetch(API_ENDPOINTS.WORKSPACES.BY_ID(id), {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        })
      }
    } catch (e) {
      console.warn('API workspace delete error:', e)
    }

    const filtered = workspaces.filter(w => w.id !== id)
    setWorkspaces(filtered)
    if (currentWorkspace?.id === id) {
      setCurrentWorkspace(filtered[0] || null)
    }
    localStorage.setItem(`sahaj_workspaces_${user.id}`, JSON.stringify(filtered))
    return true
  }

  const createNewConversation = async (model: string, jailbreak: string, title?: string) => {
    const newId = Math.random().toString(36).substring(2) + Date.now().toString(36)
    const newConv: Conversation = {
      id: newId,
      workspace_id: currentWorkspace?.id || 1,
      user_id: user?.id || 1,
      title: title || 'New Conversation',
      model,
      jailbreak,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    try {
      if (token && !token.startsWith('demo_token_')) {
        await fetch(API_ENDPOINTS.WORKSPACES.CONVERSATIONS(newConv.workspace_id), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(newConv),
        })
      }
    } catch (e) {
      console.warn('API conv create note:', e)
    }

    setConversations(prev => {
      const updated = [newConv, ...prev.filter(c => c.id !== newId)]
      if (user && currentWorkspace) {
        localStorage.setItem(`sahaj_convs_${user.id}_${currentWorkspace.id}`, JSON.stringify(updated))
      }
      return updated
    })
    setCurrentConversationId(newId)
    return newId
  }

  const deleteConversation = async (id: string) => {
    try {
      if (token && !token.startsWith('demo_token_')) {
        await fetch(API_ENDPOINTS.CONVERSATIONS.BY_ID(id), {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        })
      }
    } catch (e) {
      console.warn('API conv delete note:', e)
    }

    setConversations(prev => {
      const updated = prev.filter(c => c.id !== id)
      if (user && currentWorkspace) {
        localStorage.setItem(`sahaj_convs_${user.id}_${currentWorkspace.id}`, JSON.stringify(updated))
      }
      return updated
    })
    if (currentConversationId === id) {
      setCurrentConversationId(null)
      setMessages([])
    }
    return true
  }

  const updateConversationTitle = async (id: string, title: string) => {
    try {
      if (token && !token.startsWith('demo_token_')) {
        await fetch(API_ENDPOINTS.CONVERSATIONS.BY_ID(id), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ title }),
        })
      }
    } catch (e) {
      console.warn('API conv title note:', e)
    }

    setConversations(prev => {
      const updated = prev.map(c => (c.id === id ? { ...c, title } : c))
      if (user && currentWorkspace) {
        localStorage.setItem(`sahaj_convs_${user.id}_${currentWorkspace.id}`, JSON.stringify(updated))
      }
      return updated
    })
    return true
  }

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        currentWorkspace,
        setCurrentWorkspace,
        createWorkspace,
        updateWorkspace,
        deleteWorkspace,
        conversations,
        currentConversationId,
        setCurrentConversationId,
        messages,
        setMessages,
        createNewConversation,
        deleteConversation,
        updateConversationTitle,
        isLoadingWorkspaces,
        isLoadingConversations,
        refreshWorkspaces: fetchWorkspaces,
        refreshConversations: fetchConversations,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  )
}

export const useWorkspace = () => {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) throw new Error('useWorkspace must be used within a WorkspaceProvider')
  return ctx
}
