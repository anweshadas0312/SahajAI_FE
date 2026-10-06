import React, { useState } from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { WorkspaceProvider } from './context/WorkspaceContext'
import { UserLayout } from './components/UserLayout'
import { AdminLayout } from './components/AdminLayout'
import { AuthModal } from './components/AuthModal'
import { GOOGLE_CLIENT_ID } from './apiConfig'

const MainContent: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth()
  const [viewMode, setViewMode] = useState<'chat' | 'admin'>('chat')

  // If not logged in, show AuthModal
  if (!isAuthenticated) {
    return <AuthModal isOpen={true} />
  }

  // If user is admin and chooses admin view
  if (isAdmin && viewMode === 'admin') {
    return <AdminLayout onSwitchToChat={() => setViewMode('chat')} />
  }

  // Otherwise, user workspace view
  return (
    <UserLayout
      onSwitchToAdmin={isAdmin ? () => setViewMode('admin') : undefined}
    />
  )
}

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ThemeProvider>
        <AuthProvider>
          <WorkspaceProvider>
            <MainContent />
          </WorkspaceProvider>
        </AuthProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  )
}

export default App
