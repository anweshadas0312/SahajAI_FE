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
  files?: UploadedFile[]
  isAutoPrompt?: boolean
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

export interface UploadedFile {
  id: string
  original_name: string
  file_size: number
  mime_type?: string
  status: 'uploading' | 'processing' | 'ready' | 'error'
  error_message?: string
}

export interface LlmProvider {
  id: number
  name: string
  provider_type: string
  model_name: string
  endpoint: string
  api_key: string
  timeout: number
  is_active: boolean
  created_at?: string
  updated_at?: string
  test_status?: 'idle' | 'testing' | 'success' | 'failed'
  test_message?: string
}


