import { useCallback, useEffect, useMemo, useState } from 'react'
import { ScopeFilterBar } from '../../components/ScopeFilterBar'
import { branchApi, memberUserApi } from '../../core/services'
import type {
  BroadcastMessageRequest,
  MemberUser,
  MessageAudienceMode,
  MessageChannel,
  ScopeFilterParams,
} from '../../core/models'
import { ApiError } from '../../core/utils/apiError'
import '../../styles/shared.css'
import './messages.css'

function userInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function canReceive(user: MemberUser, channel: MessageChannel): boolean {
  if (channel === 'sms') return Boolean(user.phone?.trim())
  return Boolean(user.email?.trim())
}

export function MessagesPage() {
  const [audienceMode, setAudienceMode] = useState<MessageAudienceMode>('broadcast')
  const [scopeFilter, setScopeFilter] = useState<ScopeFilterParams>({ scope: 'national' })
  const [listScopeFilter, setListScopeFilter] = useState<ScopeFilterParams>({ scope: 'national' })

  const [users, setUsers] = useState<MemberUser[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [selectedUsersCache, setSelectedUsersCache] = useState<Record<string, MemberUser>>({})

  const [channel, setChannel] = useState<MessageChannel>('sms')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)

  const loadUsers = useCallback(async () => {
    setUsersLoading(true)
    try {
      const data = await memberUserApi.list({
        limit: 100,
        search: userSearch.trim() || undefined,
        status: 'ACTIVE',
        ...listScopeFilter,
      })
      setUsers(data.users)
    } catch {
      setUsers([])
    } finally {
      setUsersLoading(false)
    }
  }, [listScopeFilter, userSearch])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadUsers()
    }, 250)
    return () => window.clearTimeout(timer)
  }, [loadUsers])

  const selectedUsers = useMemo(
    () =>
      selectedUserIds
        .map((id) => selectedUsersCache[id] ?? users.find((u) => u.id === id))
        .filter((user): user is MemberUser => Boolean(user)),
    [selectedUserIds, selectedUsersCache, users],
  )

  const eligibleUsers = useMemo(
    () => users.filter((u) => canReceive(u, channel)),
    [users, channel],
  )

  const toggleUser = (user: MemberUser) => {
    setSelectedUserIds((prev) => {
      if (prev.includes(user.id)) {
        setSelectedUsersCache((cache) => {
          const next = { ...cache }
          delete next[user.id]
          return next
        })
        return prev.filter((id) => id !== user.id)
      }
      setSelectedUsersCache((cache) => ({ ...cache, [user.id]: user }))
      return [...prev, user.id]
    })
  }

  const selectAllEligible = () => {
    const nextCache = { ...selectedUsersCache }
    eligibleUsers.forEach((user) => {
      nextCache[user.id] = user
    })
    setSelectedUsersCache(nextCache)
    setSelectedUserIds(eligibleUsers.map((u) => u.id))
  }

  const clearSelection = () => {
    setSelectedUserIds([])
    setSelectedUsersCache({})
  }

  const removeSelected = (userId: string) => {
    setSelectedUserIds((prev) => prev.filter((id) => id !== userId))
    setSelectedUsersCache((cache) => {
      const next = { ...cache }
      delete next[userId]
      return next
    })
  }

  const sendMessage = useCallback(async () => {
    const text = message.trim()
    if (!text) return
    if (channel === 'email' && !subject.trim()) {
      setError('Subject is required for email messages.')
      return
    }

    if (audienceMode === 'broadcast') {
      if (scopeFilter.scope === 'region' && !scopeFilter.region_id) {
        setError('Select a region for regional broadcasts.')
        return
      }
      if (scopeFilter.scope === 'branch' && !scopeFilter.branch_id) {
        setError('Select a branch for branch broadcasts.')
        return
      }
    } else if (selectedUserIds.length === 0) {
      setError('Select at least one user to send the message.')
      return
    }

    setSending(true)
    setError(null)
    setResult(null)

    const payload: BroadcastMessageRequest =
      audienceMode === 'users'
        ? {
            channel,
            scope: 'users',
            user_ids: selectedUserIds,
            subject: channel === 'email' ? subject.trim() : undefined,
            message: text,
          }
        : {
            channel,
            scope: scopeFilter.scope ?? 'national',
            region_id: scopeFilter.region_id,
            branch_id: scopeFilter.branch_id,
            subject: channel === 'email' ? subject.trim() : undefined,
            message: text,
          }

    try {
      const response = await branchApi.broadcast(payload)
      setResult(response.message)
      setMessage('')
      setSubject('')
      if (audienceMode === 'users') {
        setSelectedUserIds([])
        setSelectedUsersCache({})
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to send message.')
    } finally {
      setSending(false)
    }
  }, [audienceMode, channel, message, scopeFilter, selectedUserIds, subject])

  const sendDisabled =
    sending ||
    !message.trim() ||
    (audienceMode === 'users' && selectedUserIds.length === 0)

  return (
    <section className="messages-shell messages-compose-shell">
      <div className="conv-panel messages-user-panel">
        <div className="conv-panel-hdr">
          <div>
            <h2 className="card-title">Members</h2>
            <p className="messages-panel-sub">
              {audienceMode === 'users'
                ? `${selectedUserIds.length} selected`
                : 'Select users for targeted messages'}
            </p>
          </div>
          {audienceMode === 'users' && selectedUserIds.length > 0 && (
            <button type="button" className="btn-outline btn-sm" onClick={clearSelection}>
              Clear
            </button>
          )}
        </div>

        <div className="search-box conv-search">
          <i className="ri-search-line" />
          <input
            type="text"
            placeholder="Search members…"
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
          />
        </div>

        <div className="messages-list-scope">
          <span className="messages-list-scope-label">Filter list</span>
          <ScopeFilterBar
            value={listScopeFilter}
            onChange={setListScopeFilter}
            className="messages-scope-filter-compact"
          />
        </div>

        {audienceMode === 'users' && (
          <div className="messages-list-actions">
            <button type="button" className="btn-outline btn-sm" onClick={selectAllEligible}>
              Select all ({eligibleUsers.length})
            </button>
          </div>
        )}

        <div className="conv-list messages-user-list">
          {usersLoading && (
            <div className="empty-state">
              <i className="ri-loader-4-line" /> Loading members…
            </div>
          )}
          {!usersLoading &&
            users.map((user) => {
              const eligible = canReceive(user, channel)
              const selected = selectedUserIds.includes(user.id)
              return (
                <label
                  key={user.id}
                  className={`conv-item messages-user-item${selected ? ' conv-active' : ''}${!eligible ? ' messages-user-item-disabled' : ''}`}
                >
                  {audienceMode === 'users' && (
                    <input
                      type="checkbox"
                      className="messages-user-check"
                      checked={selected}
                      disabled={!eligible}
                      onChange={() => toggleUser(user)}
                    />
                  )}
                  <span className="messages-user-avatar">{userInitials(user.full_name)}</span>
                  <div className="conv-text">
                    <div className="conv-top">
                      <span className="conv-name">{user.full_name}</span>
                    </div>
                    <div className="conv-bottom">
                      <span className="conv-preview">
                        {channel === 'sms' ? user.phone || 'No phone' : user.email}
                      </span>
                      {!eligible && (
                        <span className="messages-unavailable-badge">
                          No {channel === 'sms' ? 'phone' : 'email'}
                        </span>
                      )}
                    </div>
                    {(user.branch_name || user.current_branch) && (
                      <span className="messages-user-branch">
                        {user.branch_name || user.current_branch}
                      </span>
                    )}
                  </div>
                  {audienceMode === 'users' && selected && (
                    <i className="ri-check-line messages-user-selected-icon" />
                  )}
                </label>
              )
            })}
          {!usersLoading && users.length === 0 && (
            <div className="empty-state">
              <i className="ri-user-search-line" /> No members found
            </div>
          )}
        </div>
      </div>

      <div className="chat-panel messages-compose-panel">
        <div className="chat-hdr messages-compose-hdr">
          <div>
            <p className="chat-name">Compose Message</p>
            <p className="chat-role">Send SMS or email to members</p>
          </div>
        </div>

        <div className="messages-compose-body">
          {error && (
            <div className="auth-alert auth-alert-error">
              <i className="ri-error-warning-line" />
              <span>{error}</span>
            </div>
          )}

          {result && (
            <div className="auth-alert auth-alert-success">
              <i className="ri-check-line" />
              <span>{result}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Audience</label>
            <div className="tab-bar conv-tabs">
              <button
                type="button"
                className={`tab-btn${audienceMode === 'broadcast' ? ' tab-active' : ''}`}
                onClick={() => setAudienceMode('broadcast')}
              >
                <i className="ri-megaphone-line" /> Group broadcast
              </button>
              <button
                type="button"
                className={`tab-btn${audienceMode === 'users' ? ' tab-active' : ''}`}
                onClick={() => setAudienceMode('users')}
              >
                <i className="ri-user-line" /> Selected users
                {selectedUserIds.length > 0 ? ` (${selectedUserIds.length})` : ''}
              </button>
            </div>
          </div>

          {audienceMode === 'broadcast' ? (
            <div className="form-group">
              <label className="form-label">Broadcast scope</label>
              <ScopeFilterBar value={scopeFilter} onChange={setScopeFilter} />
              <p className="text-muted messages-hint">
                Message will be sent to all active members in the selected scope who have a valid{' '}
                {channel === 'sms' ? 'phone number' : 'email address'}.
              </p>
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">
                Recipients ({selectedUserIds.length})
              </label>
              {selectedUserIds.length === 0 ? (
                <p className="text-muted messages-hint">
                  Select one or more members from the list on the left.
                </p>
              ) : (
                <div className="messages-selected-chips">
                  {selectedUsers.map((user) => (
                    <span key={user.id} className="messages-selected-chip">
                      {user.full_name}
                      <button
                        type="button"
                        className="messages-chip-remove"
                        onClick={() => removeSelected(user.id)}
                        aria-label={`Remove ${user.full_name}`}
                      >
                        <i className="ri-close-line" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Channel</label>
            <div className="tab-bar conv-tabs">
              <button
                type="button"
                className={`tab-btn${channel === 'sms' ? ' tab-active' : ''}`}
                onClick={() => setChannel('sms')}
              >
                <i className="ri-message-2-line" /> SMS
              </button>
              <button
                type="button"
                className={`tab-btn${channel === 'email' ? ' tab-active' : ''}`}
                onClick={() => setChannel('email')}
              >
                <i className="ri-mail-line" /> Email
              </button>
            </div>
          </div>

          {channel === 'email' && (
            <div className="form-group">
              <label className="form-label">Subject</label>
              <input
                className="form-input"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject line"
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Message</label>
            <textarea
              className="form-textarea"
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                channel === 'sms'
                  ? 'SMS message (160 chars recommended)'
                  : 'Email message body'
              }
            />
            {channel === 'sms' && (
              <p className="text-muted messages-hint">{message.length} / 160 characters</p>
            )}
          </div>
        </div>

        <div className="chat-input-row messages-send-row">
          <button
            type="button"
            className="btn-green messages-send-btn"
            disabled={sendDisabled}
            onClick={() => void sendMessage()}
          >
            <i className="ri-send-plane-fill" />
            {sending
              ? 'Sending…'
              : audienceMode === 'users'
                ? `Send to ${selectedUserIds.length} user${selectedUserIds.length === 1 ? '' : 's'}`
                : 'Send broadcast'}
          </button>
        </div>
      </div>
    </section>
  )
}
