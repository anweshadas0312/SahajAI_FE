export interface User {
  id: number
  username: string
  email: string
  role: 'admin' | 'user'
  created_at?: string
}

export interface Workspace {
  id: number
  user_id: number
  name: string
  description?: string
  icon_color: string
  is_default: boolean
  conversation_count?: number
  created_at?: string
  updated_at?: string
}

export interface Conversation {
  id: string
  workspace_id: number
  user_id: number
  title: string
  model: string
  jailbreak: string
  first_message?: string
  message_count?: number
  created_at?: string
  updated_at?: string
}

export interface ChatMessage {
  id?: number
  role: 'user' | 'assistant' | 'system'
  content: string
  created_at?: string
}

export interface AdminStats {
  total_users: number
  total_workspaces: number
  total_conversations: number
  total_messages: number
  database_type: string
}

export interface AdminWorkspaceItem {
  id: number
  name: string
  description?: string
  icon_color: string
  username: string
  email: string
  conversation_count: number
  created_at: string
}
