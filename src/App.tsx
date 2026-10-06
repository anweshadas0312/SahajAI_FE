import React, { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { WorkspaceProvider } from './context/WorkspaceContext'
import { UserLayout } from './components/UserLayout'
import { AdminLayout } from './components/AdminLayout'
import { AuthModal } from './components/AuthModal'

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
    <AuthProvider>
      <WorkspaceProvider>
        <MainContent />
      </WorkspaceProvider>
    </AuthProvider>
  )
}

export default App
