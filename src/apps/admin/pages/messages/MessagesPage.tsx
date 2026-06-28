import { useCallback, useMemo, useState } from 'react'
import { MockDataBanner } from '../../components/MockDataBanner'
import { formatTimeAgo } from '../../core/utils/formatTimeAgo'
import '../../styles/shared.css'
import './messages.css'

interface Conversation {
  id: string
  name: string
  avatar: string
  role: 'Rider' | 'Customer'
  lastMessage: string
  lastMessageAt: string
  unread: number
}

interface ChatMessage {
  fromMe: boolean
  text: string
  time: string
}

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'c1',
    name: 'Eddie Lobanovskiy',
    avatar: 'https://i.pravatar.cc/40?img=11',
    role: 'Rider',
    lastMessage: 'On my way to pickup now',
    lastMessageAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    unread: 2,
  },
  {
    id: 'c2',
    name: 'Camera Barnlu',
    avatar: 'https://i.pravatar.cc/40?img=21',
    role: 'Customer',
    lastMessage: 'My order #876364 is delayed',
    lastMessageAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    unread: 1,
  },
  {
    id: 'c3',
    name: 'Anton Tkacheve',
    avatar: 'https://i.pravatar.cc/40?img=13',
    role: 'Rider',
    lastMessage: 'Vehicle battery is low',
    lastMessageAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    unread: 0,
  },
  {
    id: 'c4',
    name: 'Linda Mensah',
    avatar: 'https://i.pravatar.cc/40?img=26',
    role: 'Customer',
    lastMessage: 'Thanks, refund received!',
    lastMessageAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    unread: 0,
  },
  {
    id: 'c5',
    name: 'Kwesi Boateng',
    avatar: 'https://i.pravatar.cc/40?img=15',
    role: 'Rider',
    lastMessage: 'Requesting maintenance for VH-2204',
    lastMessageAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    unread: 0,
  },
]

const INITIAL_CHAT_HISTORY: Record<string, ChatMessage[]> = {
  c1: [
    { fromMe: false, text: 'Heading to the pickup point now.', time: '10:02 AM' },
    { fromMe: true, text: 'Great, customer is waiting at Madina station.', time: '10:03 AM' },
    { fromMe: false, text: 'On my way to pickup now', time: '10:05 AM' },
  ],
  c2: [
    { fromMe: false, text: 'My order #876364 is delayed', time: '09:50 AM' },
    { fromMe: true, text: 'Apologies for the delay! Checking with the rider now.', time: '09:52 AM' },
  ],
  c3: [
    { fromMe: false, text: 'Vehicle battery is low', time: '08:40 AM' },
    { fromMe: true, text: 'Noted — please head to the nearest charging point.', time: '08:42 AM' },
  ],
  c4: [
    { fromMe: true, text: 'Your refund of GHS 45 has been processed.', time: '06:10 AM' },
    { fromMe: false, text: 'Thanks, refund received!', time: '06:20 AM' },
  ],
  c5: [{ fromMe: false, text: 'Requesting maintenance for VH-2204', time: '05:00 AM' }],
}

export function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS)
  const [chatHistory, setChatHistory] =
    useState<Record<string, ChatMessage[]>>(INITIAL_CHAT_HISTORY)
  const [selectedConversationId, setSelectedConversationId] = useState(
    INITIAL_CONVERSATIONS[0].id,
  )
  const [searchTerm, setSearchTerm] = useState('')
  const [audienceFilter, setAudienceFilter] = useState<'All' | 'Riders' | 'Customers'>('All')
  const [newMessageText, setNewMessageText] = useState('')
  const [showBroadcastModal, setShowBroadcastModal] = useState(false)
  const [broadcastAudience, setBroadcastAudience] = useState<
    'All Riders' | 'All Customers' | 'Specific Zone'
  >('All Riders')
  const [broadcastText, setBroadcastText] = useState('')

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === selectedConversationId) ?? conversations[0],
    [conversations, selectedConversationId],
  )

  const filteredConversations = useMemo(
    () =>
      conversations.filter((c) => {
        const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesAudience =
          audienceFilter === 'All' ||
          (audienceFilter === 'Riders' && c.role === 'Rider') ||
          (audienceFilter === 'Customers' && c.role === 'Customer')
        return matchesSearch && matchesAudience
      }),
    [audienceFilter, conversations, searchTerm],
  )

  const currentChat = useMemo(
    () => chatHistory[selectedConversation.id] ?? [],
    [chatHistory, selectedConversation.id],
  )

  const selectConversation = useCallback((c: Conversation) => {
    setSelectedConversationId(c.id)
    setConversations((prev) =>
      prev.map((row) => (row.id === c.id ? { ...row, unread: 0 } : row)),
    )
  }, [])

  const sendMessage = useCallback(() => {
    const text = newMessageText.trim()
    if (!text) return

    const now = new Date().toISOString()

    setChatHistory((prev) => ({
      ...prev,
      [selectedConversation.id]: [
        ...(prev[selectedConversation.id] ?? []),
        { fromMe: true, text, time: 'Just now' },
      ],
    }))

    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConversation.id
          ? { ...c, lastMessage: text, lastMessageAt: now }
          : c,
      ),
    )

    setNewMessageText('')
  }, [newMessageText, selectedConversation.id])

  const openBroadcast = useCallback(() => {
    setBroadcastText('')
    setBroadcastAudience('All Riders')
    setShowBroadcastModal(true)
  }, [])

  const closeBroadcast = useCallback(() => {
    setShowBroadcastModal(false)
  }, [])

  const sendBroadcast = useCallback(() => {
    if (broadcastText.trim()) {
      setShowBroadcastModal(false)
    }
  }, [broadcastText])

  return (
    <>
      <MockDataBanner message="There is no messaging/chat endpoint yet — conversations and messages shown here are sample data only." />

      <section className="messages-shell">
        <div className="conv-panel">
          <div className="conv-panel-hdr">
            <h2 className="card-title">Messages</h2>
            <button type="button" className="btn-dark" onClick={openBroadcast}>
              <i className="ri-megaphone-line" /> Broadcast
            </button>
          </div>

          <div className="search-box conv-search">
            <i className="ri-search-line" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="tab-bar conv-tabs">
            <button
              type="button"
              className={`tab-btn${audienceFilter === 'All' ? ' tab-active' : ''}`}
              onClick={() => setAudienceFilter('All')}
            >
              All
            </button>
            <button
              type="button"
              className={`tab-btn${audienceFilter === 'Riders' ? ' tab-active' : ''}`}
              onClick={() => setAudienceFilter('Riders')}
            >
              Riders
            </button>
            <button
              type="button"
              className={`tab-btn${audienceFilter === 'Customers' ? ' tab-active' : ''}`}
              onClick={() => setAudienceFilter('Customers')}
            >
              Customers
            </button>
          </div>

          <div className="conv-list">
            {filteredConversations.map((c) => (
              <div
                key={c.id}
                className={`conv-item${selectedConversation.id === c.id ? ' conv-active' : ''}`}
                onClick={() => selectConversation(c)}
              >
                <img src={c.avatar} alt={c.name} className="avatar-sm" />
                <div className="conv-text">
                  <div className="conv-top">
                    <span className="conv-name">{c.name}</span>
                    <span className="conv-time">{formatTimeAgo(c.lastMessageAt)}</span>
                  </div>
                  <div className="conv-bottom">
                    <span className="conv-preview">{c.lastMessage}</span>
                    {c.unread > 0 && <span className="conv-unread">{c.unread}</span>}
                  </div>
                </div>
              </div>
            ))}
            {filteredConversations.length === 0 && (
              <div className="empty-state">
                <i className="ri-inbox-line" />
                No conversations found
              </div>
            )}
          </div>
        </div>

        {selectedConversation && (
          <div className="chat-panel">
            <div className="chat-hdr">
              <img
                src={selectedConversation.avatar}
                alt={selectedConversation.name}
                className="avatar-sm"
              />
              <div>
                <p className="chat-name">{selectedConversation.name}</p>
                <p className="chat-role">{selectedConversation.role}</p>
              </div>
              <button
                type="button"
                className="btn-icon-only"
                style={{ marginLeft: 'auto' }}
                title="View profile"
              >
                <i className="ri-user-line" />
              </button>
            </div>

            <div className="chat-body">
              {currentChat.map((m, index) => (
                <div
                  key={`${m.time}-${index}`}
                  className={`chat-bubble-row${m.fromMe ? ' from-me' : ''}`}
                >
                  <div className="chat-bubble">
                    {m.text}
                    <span className="chat-time">{m.time}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="chat-input-row">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') sendMessage()
                }}
              />
              <button type="button" className="btn-green" onClick={sendMessage}>
                <i className="ri-send-plane-fill" />
              </button>
            </div>
          </div>
        )}
      </section>

      {showBroadcastModal && (
        <div className="modal-overlay" onClick={closeBroadcast}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-hdr">
              <h3 className="modal-title">Broadcast Message</h3>
              <button type="button" className="modal-close" onClick={closeBroadcast}>
                <i className="ri-close-line" />
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Audience</label>
              <select
                className="form-select"
                value={broadcastAudience}
                onChange={(e) =>
                  setBroadcastAudience(
                    e.target.value as 'All Riders' | 'All Customers' | 'Specific Zone',
                  )
                }
              >
                <option value="All Riders">All Riders</option>
                <option value="All Customers">All Customers</option>
                <option value="Specific Zone">Specific Zone</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Message</label>
              <textarea
                className="form-textarea"
                rows={4}
                placeholder="Type your broadcast message..."
                value={broadcastText}
                onChange={(e) => setBroadcastText(e.target.value)}
              />
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-outline" onClick={closeBroadcast}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-green"
                onClick={sendBroadcast}
                disabled={!broadcastText.trim()}
              >
                <i className="ri-send-plane-fill" /> Send Broadcast
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
