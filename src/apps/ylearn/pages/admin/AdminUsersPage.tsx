import { useEffect, useState } from 'react'
import { listUsers } from '../../core/data/users'
import type { UserProfile } from '../../core/types'

export function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])

  useEffect(() => {
    void listUsers().then(setUsers)
  }, [])

  return (
    <div>
      <h2 className="yl-page-title">Users</h2>
      <div className="yl-table-wrap">
        <table className="yl-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Phone</th>
              <th>Address</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.uid}>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td style={{ textTransform: 'capitalize' }}>{u.role}</td>
                <td>{u.phone ?? '—'}</td>
                <td>{u.address ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
