import test from 'node:test'
import assert from 'node:assert/strict'

// Helper function modeling Sidebar conversation partitioning
function partitionConversations(conversations) {
  const pinned = conversations.filter(c => Boolean(c.is_pinned))
  const recents = conversations.filter(c => !c.is_pinned)
  const showPinnedSection = pinned.length > 0
  return { pinned, recents, showPinnedSection }
}

function togglePin(conversations, targetId) {
  return conversations.map(c => {
    if (c.id === targetId) {
      return { ...c, is_pinned: !c.is_pinned }
    }
    return c
  })
}

test('Sidebar Pinned & Recents Sections', async (t) => {
  await t.test('Pinned section is hidden when no chats are pinned', () => {
    const convs = [
      { id: '1', title: 'Python Asyncio', is_pinned: false },
      { id: '2', title: 'Docker Compose', is_pinned: false },
      { id: '3', title: 'React Hooks', is_pinned: false },
    ]
    const { pinned, recents, showPinnedSection } = partitionConversations(convs)
    assert.equal(showPinnedSection, false, 'Pinned section must NOT appear when 0 chats are pinned')
    assert.equal(pinned.length, 0)
    assert.equal(recents.length, 3)
  })

  await t.test('Pinned section appears only when at least one chat is pinned', () => {
    const convs = [
      { id: '1', title: 'Python Asyncio', is_pinned: false },
      { id: '2', title: 'Important Project Discussion', is_pinned: true },
      { id: '3', title: 'React Hooks', is_pinned: false },
    ]
    const { pinned, recents, showPinnedSection } = partitionConversations(convs)
    assert.equal(showPinnedSection, true, 'Pinned section must appear when at least 1 chat is pinned')
    assert.equal(pinned.length, 1)
    assert.equal(pinned[0].id, '2')
    assert.equal(recents.length, 2)
    assert.deepEqual(recents.map(r => r.id), ['1', '3'])
  })

  await t.test('Pin toggle moves chat from Recents to Pinned and makes Pinned section appear', () => {
    let convs = [
      { id: '1', title: 'Chat 1', is_pinned: false },
      { id: '2', title: 'Chat 2', is_pinned: false },
    ]
    // Initially no pinned section
    assert.equal(partitionConversations(convs).showPinnedSection, false)

    // Pin Chat 1
    convs = togglePin(convs, '1')
    const state1 = partitionConversations(convs)
    assert.equal(state1.showPinnedSection, true)
    assert.equal(state1.pinned.length, 1)
    assert.equal(state1.pinned[0].id, '1')
    assert.equal(state1.recents.length, 1)
    assert.equal(state1.recents[0].id, '2')
  })

  await t.test('Unpinning all chats causes Pinned section to disappear completely', () => {
    let convs = [
      { id: '1', title: 'Chat 1', is_pinned: true },
      { id: '2', title: 'Chat 2', is_pinned: false },
    ]
    assert.equal(partitionConversations(convs).showPinnedSection, true)

    // Unpin Chat 1
    convs = togglePin(convs, '1')
    const state = partitionConversations(convs)
    assert.equal(state.showPinnedSection, false, 'Pinned section must disappear when all chats are unpinned')
    assert.equal(state.pinned.length, 0)
    assert.equal(state.recents.length, 2)
  })

  await t.test('Multiple pinned chats are correctly ordered under Pinned section', () => {
    const convs = [
      { id: '1', title: 'Chat 1', is_pinned: true },
      { id: '2', title: 'Chat 2', is_pinned: false },
      { id: '3', title: 'Chat 3', is_pinned: true },
      { id: '4', title: 'Chat 4', is_pinned: false },
    ]
    const { pinned, recents, showPinnedSection } = partitionConversations(convs)
    assert.equal(showPinnedSection, true)
    assert.equal(pinned.length, 2)
    assert.deepEqual(pinned.map(p => p.id), ['1', '3'])
    assert.equal(recents.length, 2)
    assert.deepEqual(recents.map(r => r.id), ['2', '4'])
  })
})
