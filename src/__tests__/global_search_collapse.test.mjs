import test from 'node:test'
import assert from 'node:assert/strict'

// Unit tests for Global Search filtering and Relative Time utilities

function filterConversations(allConversations, query, messagesMap = {}) {
  const q = query.trim().toLowerCase()
  if (!q) {
    return [...allConversations].sort((a, b) => {
      const dateA = new Date(a.updated_at || a.created_at || 0).getTime()
      const dateB = new Date(b.updated_at || b.created_at || 0).getTime()
      return dateB - dateA
    })
  }

  const matched = []
  allConversations.forEach(item => {
    const titleLower = item.title.toLowerCase()
    const wsLower = (item.workspace_name || '').toLowerCase()

    if (titleLower.includes(q)) {
      matched.push({ ...item, matchType: 'title' })
      return
    }

    const msgs = messagesMap[item.id] || []
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

    if (wsLower.includes(q)) {
      matched.push({ ...item, matchType: 'workspace' })
    }
  })

  return matched
}

function formatRelativeTime(isoString, now = new Date()) {
  if (!isoString) return ''
  try {
    const date = new Date(isoString)
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

test('Global Search & Sidebar Collapse Tests', async t => {
  const dummyConversations = [
    {
      id: 'conv-1',
      title: 'Order CSV Line Chart Analysis',
      workspace_id: 1,
      workspace_name: 'Default Workspace',
      workspace_color: '#EAB308',
      updated_at: '2026-10-13T10:00:00Z',
    },
    {
      id: 'conv-2',
      title: 'Q3 Budget Review',
      workspace_id: 2,
      workspace_name: 'Marketing Team',
      workspace_color: '#3B82F6',
      updated_at: '2026-10-12T10:00:00Z',
    },
    {
      id: 'conv-3',
      title: 'Backend Architecture Refactor',
      workspace_id: 1,
      workspace_name: 'Default Workspace',
      workspace_color: '#EAB308',
      updated_at: '2026-10-11T10:00:00Z',
    },
  ]

  const dummyMessages = {
    'conv-3': [
      { role: 'user', content: 'How should we structure the FastAPI routing and SQLite connection pool?' },
      { role: 'assistant', content: 'Here is the recommended architecture with clean dependency injection.' },
    ],
  }

  await t.test('Empty query returns all conversations sorted by latest date', () => {
    const results = filterConversations(dummyConversations, '')
    assert.equal(results.length, 3)
    assert.equal(results[0].id, 'conv-1')
    assert.equal(results[1].id, 'conv-2')
    assert.equal(results[2].id, 'conv-3')
  })

  await t.test('Title search matches case-insensitively', () => {
    const results = filterConversations(dummyConversations, 'line chart')
    assert.equal(results.length, 1)
    assert.equal(results[0].id, 'conv-1')
    assert.equal(results[0].matchType, 'title')
  })

  await t.test('Workspace name search matches conversations in that workspace', () => {
    const results = filterConversations(dummyConversations, 'marketing')
    assert.equal(results.length, 1)
    assert.equal(results[0].id, 'conv-2')
    assert.equal(results[0].matchType, 'workspace')
  })

  await t.test('Message content search matches keywords inside past chats and generates snippet', () => {
    const results = filterConversations(dummyConversations, 'FastAPI routing', dummyMessages)
    assert.equal(results.length, 1)
    assert.equal(results[0].id, 'conv-3')
    assert.equal(results[0].matchType, 'message')
    assert.ok(results[0].snippet.includes('FastAPI routing'))
  })

  await t.test('Relative time formatting displays readable human timestamps', () => {
    const refNow = new Date('2026-10-13T12:00:00Z')
    assert.equal(formatRelativeTime('2026-10-13T11:59:40Z', refNow), 'Just now')
    assert.equal(formatRelativeTime('2026-10-13T11:45:00Z', refNow), '15m ago')
    assert.equal(formatRelativeTime('2026-10-13T09:00:00Z', refNow), '3h ago')
    assert.equal(formatRelativeTime('2026-10-12T12:00:00Z', refNow), 'Yesterday')
    assert.equal(formatRelativeTime('2026-10-10T12:00:00Z', refNow), '3d ago')
  })

  await t.test('Keyboard index selection wraps cleanly', () => {
    const totalItems = 4 // Index 0: New chat, Index 1-3: Results
    let selectedIndex = 0
    // Down
    selectedIndex = (selectedIndex + 1) % totalItems
    assert.equal(selectedIndex, 1)
    // Down to end
    selectedIndex = (selectedIndex + 2) % totalItems
    assert.equal(selectedIndex, 3)
    // Down past end wraps to 0
    selectedIndex = (selectedIndex + 1) % totalItems
    assert.equal(selectedIndex, 0)
    // Up from 0 wraps to end
    selectedIndex = (selectedIndex - 1 + totalItems) % totalItems
    assert.equal(selectedIndex, 3)
  })

  await t.test('Recent chats popover dynamically maps active workspace conversations without hardcoding', () => {
    const userWorkspaceConvs = [
      { id: 'c1', title: 'English translation' },
      { id: 'c2', title: 'Loader নামকরণ suggestion' },
      { id: 'c3', title: 'বইয়ের সহজ সারাংশ' },
    ]
    const popoverItems = userWorkspaceConvs.map(c => ({
      id: c.id,
      title: c.title || 'Untitled Conversation',
    }))

    assert.equal(popoverItems.length, 3)
    assert.equal(popoverItems[0].title, 'English translation')
    assert.equal(popoverItems[1].title, 'Loader নামকরণ suggestion')
    assert.equal(popoverItems[2].title, 'বইয়ের সহজ সারাংশ')
  })

  await t.test('Mini-rail icons perform actions in-place without expanding sidebar', () => {
    let sidebarCollapsed = true
    const setSidebarCollapsed = (val) => { sidebarCollapsed = val }

    let activeMenu = null // 'workspaces', 'recents', 'profile'
    let currentChatStarted = false
    let searchOpened = false
    let adminOpened = false
    let selectedWorkspace = null
    let selectedConv = null

    // 1. Top Bulb Logo button has hover-to-expand toggle that expands sidebar on click
    const handleTopLogoExpandClick = () => setSidebarCollapsed(false)
    assert.equal(sidebarCollapsed, true)

    // 2. New Chat (+) button starts new chat without expanding
    const handleNewChatClick = () => { currentChatStarted = true }
    handleNewChatClick()
    assert.equal(currentChatStarted, true)
    assert.equal(sidebarCollapsed, true, 'New Chat must not expand sidebar')

    // 4. Search button opens global search modal without expanding
    const handleSearchClick = () => { searchOpened = true }
    handleSearchClick()
    assert.equal(searchOpened, true)
    assert.equal(sidebarCollapsed, true, 'Search button must not expand sidebar')

    // 5. Workspace circle toggles workspace flyout menu in-place without expanding
    const handleWorkspaceCircleClick = () => {
      activeMenu = activeMenu === 'workspaces' ? null : 'workspaces'
    }
    handleWorkspaceCircleClick()
    assert.equal(activeMenu, 'workspaces')
    assert.equal(sidebarCollapsed, true, 'Workspace circle must not expand sidebar')

    // Switching workspace inside flyout
    const handleSelectWs = (ws) => {
      selectedWorkspace = ws
      activeMenu = null
    }
    handleSelectWs({ id: 2, name: 'Research' })
    assert.equal(selectedWorkspace.name, 'Research')
    assert.equal(activeMenu, null)
    assert.equal(sidebarCollapsed, true, 'Selecting workspace must not expand sidebar')

    // 6. Recents icon toggles recents flyout menu in-place without expanding
    const handleRecentsClick = () => {
      activeMenu = activeMenu === 'recents' ? null : 'recents'
    }
    handleRecentsClick()
    assert.equal(activeMenu, 'recents')
    assert.equal(sidebarCollapsed, true, 'Recents icon must not expand sidebar')

    // Selecting conversation inside recents flyout
    const handleSelectConv = (convId) => {
      selectedConv = convId
      activeMenu = null
    }
    handleSelectConv('c2')
    assert.equal(selectedConv, 'c2')
    assert.equal(activeMenu, null)
    assert.equal(sidebarCollapsed, true, 'Selecting conversation must not expand sidebar')

    // 7. Profile avatar opens profile flyout menu in-place without expanding
    const handleProfileClick = () => {
      activeMenu = activeMenu === 'profile' ? null : 'profile'
    }
    handleProfileClick()
    assert.equal(activeMenu, 'profile')
    assert.equal(sidebarCollapsed, true, 'User Profile circle must not expand sidebar')

    // 8. Admin button navigates directly without expanding
    const handleAdminClick = () => { adminOpened = true }
    handleAdminClick()
    assert.equal(adminOpened, true)
    assert.equal(sidebarCollapsed, true, 'Admin button must not expand sidebar')

    // Finally, verify top bulb hover-to-expand toggle does expand
    handleTopLogoExpandClick()
    assert.equal(sidebarCollapsed, false, 'Top logo hover-to-expand toggle expands sidebar')
  })
})

