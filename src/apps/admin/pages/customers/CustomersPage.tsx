import { useCallback, useMemo, useState } from 'react'
import { MockDataBanner } from '../../components/MockDataBanner'
import { formatGhs } from '../../core/utils/formatGhs'
import '../../styles/shared.css'
import './customers.css'

interface Customer {
  id: string
  name: string
  avatar: string
  phone: string
  email: string
  city: string
  bundleTier: string | null
  totalOrders: number
  totalSpend: number
  accountStatus: 'Active' | 'Flagged' | 'Suspended'
  joinedDate: string
  lastOrder: string
}

const STATS = [
  {
    label: 'Total Customers',
    value: '3,418',
    change: '+5%',
    positive: true,
    icon: 'ri-group-fill',
    color: 'blue',
  },
  {
    label: 'Active Bundles',
    value: '1,284',
    change: '+7%',
    positive: true,
    icon: 'ri-gift-fill',
    color: 'green',
  },
  {
    label: 'Flagged Accounts',
    value: '6',
    change: '+2',
    positive: false,
    icon: 'ri-flag-2-fill',
    color: 'red',
  },
  {
    label: 'Pending Refunds',
    value: '4',
    change: '-1',
    positive: true,
    icon: 'ri-refund-2-line',
    color: 'orange',
  },
] as const

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'CU-5001',
    name: 'Camera Barnlu',
    avatar: 'https://i.pravatar.cc/48?img=21',
    phone: '+233 20 111 2233',
    email: 'cbarnlu@gmail.com',
    city: 'Madina',
    bundleTier: 'Business Pro',
    totalOrders: 84,
    totalSpend: 2940,
    accountStatus: 'Active',
    joinedDate: 'Oct 02, 2025',
    lastOrder: 'Jun 18, 2026',
  },
  {
    id: 'CU-5002',
    name: 'Benson Opoku',
    avatar: 'https://i.pravatar.cc/48?img=22',
    phone: '+233 20 222 3344',
    email: 'bopoku@gmail.com',
    city: 'Lapaz',
    bundleTier: 'Starter Pack',
    totalOrders: 12,
    totalSpend: 420,
    accountStatus: 'Active',
    joinedDate: 'Mar 18, 2026',
    lastOrder: 'Jun 18, 2026',
  },
  {
    id: 'CU-5003',
    name: 'Argan Oliver',
    avatar: 'https://i.pravatar.cc/48?img=23',
    phone: '+233 20 333 4455',
    email: 'aoliver@gmail.com',
    city: 'Kasoa',
    bundleTier: null,
    totalOrders: 31,
    totalSpend: 980,
    accountStatus: 'Flagged',
    joinedDate: 'Jan 09, 2026',
    lastOrder: 'Jun 17, 2026',
  },
  {
    id: 'CU-5004',
    name: 'Parfumer Jacob',
    avatar: 'https://i.pravatar.cc/48?img=24',
    phone: '+233 20 444 5566',
    email: 'pjacob@gmail.com',
    city: 'East Legon',
    bundleTier: 'Enterprise',
    totalOrders: 218,
    totalSpend: 11400,
    accountStatus: 'Active',
    joinedDate: 'Aug 14, 2025',
    lastOrder: 'Jun 18, 2026',
  },
  {
    id: 'CU-5005',
    name: 'Linda Mensah',
    avatar: 'https://i.pravatar.cc/48?img=26',
    phone: '+233 20 555 6677',
    email: 'lmensah2@gmail.com',
    city: 'Adenta',
    bundleTier: 'Business Lite',
    totalOrders: 46,
    totalSpend: 1640,
    accountStatus: 'Suspended',
    joinedDate: 'Feb 27, 2026',
    lastOrder: 'Jun 10, 2026',
  },
  {
    id: 'CU-5006',
    name: 'Kojo Asante',
    avatar: 'https://i.pravatar.cc/48?img=28',
    phone: '+233 20 666 7788',
    email: 'kasante2@gmail.com',
    city: 'Madina',
    bundleTier: null,
    totalOrders: 5,
    totalSpend: 150,
    accountStatus: 'Active',
    joinedDate: 'Jun 01, 2026',
    lastOrder: 'Jun 16, 2026',
  },
]

function statusBadgeClass(status: Customer['accountStatus']): string {
  if (status === 'Active') return 'badge badge-active'
  if (status === 'Flagged') return 'badge badge-cancelled'
  return 'badge badge-inactive'
}

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [tierFilter, setTierFilter] = useState('All')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [editBuffer, setEditBuffer] = useState<Customer | null>(null)

  const filteredCustomers = useMemo(
    () =>
      customers.filter((c) => {
        const matchesSearch =
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.phone.includes(searchTerm)
        const matchesStatus = statusFilter === 'All' || c.accountStatus === statusFilter
        const matchesTier =
          tierFilter === 'All' ||
          (tierFilter === 'No Bundle' && !c.bundleTier) ||
          c.bundleTier === tierFilter
        return matchesSearch && matchesStatus && matchesTier
      }),
    [customers, searchTerm, statusFilter, tierFilter],
  )

  const viewCustomer = useCallback((c: Customer) => {
    setSelectedCustomer(c)
    setEditMode(false)
  }, [])

  const closeDrawer = useCallback(() => {
    setSelectedCustomer(null)
    setEditMode(false)
    setEditBuffer(null)
  }, [])

  const startEdit = useCallback(() => {
    setSelectedCustomer((current) => {
      if (current) {
        setEditBuffer({ ...current })
        setEditMode(true)
      }
      return current
    })
  }, [])

  const cancelEdit = useCallback(() => {
    setEditMode(false)
    setEditBuffer(null)
  }, [])

  const saveEdit = useCallback(() => {
    if (!editBuffer || !selectedCustomer) return

    setCustomers((prev) =>
      prev.map((c) => (c.id === selectedCustomer.id ? { ...c, ...editBuffer } : c)),
    )
    setSelectedCustomer((prev) => (prev ? { ...prev, ...editBuffer } : prev))
    setEditMode(false)
    setEditBuffer(null)
  }, [editBuffer, selectedCustomer])

  const setStatus = useCallback((c: Customer, status: Customer['accountStatus']) => {
    setCustomers((prev) => prev.map((row) => (row.id === c.id ? { ...row, accountStatus: status } : row)))
    setSelectedCustomer((prev) => (prev?.id === c.id ? { ...prev, accountStatus: status } : prev))
  }, [])

  const updateEditBuffer = useCallback(
    (patch: Partial<Customer>) => {
      setEditBuffer((prev) => (prev ? { ...prev, ...patch } : prev))
    },
    [],
  )

  return (
    <>
      <MockDataBanner message="The swagger contract for VoltGo has no Admin / Customer Management endpoints yet — every record here is sample data." />

      <section className="stats-grid">
        {STATS.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className={`stat-icon icon-${stat.color}`}>
              <i className={stat.icon} />
            </div>
            <div>
              <p className="stat-val">{stat.value}</p>
              <p className="stat-lbl">{stat.label}</p>
            </div>
            <span className={`trend-pill ${stat.positive ? 'trend-up' : 'trend-down'}`}>
              <i className={stat.positive ? 'ri-arrow-up-line' : 'ri-arrow-down-line'} />
              {stat.change}
            </span>
          </div>
        ))}
      </section>

      <section className="card table-card">
        <div className="card-hdr">
          <h2 className="card-title">All Customers</h2>
          <div className="filter-bar">
            <div className="search-box">
              <i className="ri-search-line" />
              <input
                type="text"
                placeholder="Search name, ID, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Flagged">Flagged</option>
              <option value="Suspended">Suspended</option>
            </select>
            <select
              className="filter-select"
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
            >
              <option value="All">All Tiers</option>
              <option value="No Bundle">No Bundle</option>
              <option value="Starter Pack">Starter Pack</option>
              <option value="Business Lite">Business Lite</option>
              <option value="Business Pro">Business Pro</option>
              <option value="Enterprise">Enterprise</option>
            </select>
          </div>
        </div>

        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Customer</th>
                <th>City</th>
                <th>Bundle Tier</th>
                <th>Total Orders</th>
                <th>Total Spend</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((c) => (
                <tr key={c.id} className="clickable-row" onClick={() => viewCustomer(c)}>
                  <td>
                    <div className="cust-left">
                      <img src={c.avatar} alt={c.name} className="avatar-sm" />
                      <div>
                        <p className="cell-name">{c.name}</p>
                        <p className="cell-sub">{c.id}</p>
                      </div>
                    </div>
                  </td>
                  <td>{c.city}</td>
                  <td>{c.bundleTier || '—'}</td>
                  <td>{c.totalOrders}</td>
                  <td style={{ fontWeight: 600 }}>{formatGhs(c.totalSpend)}</td>
                  <td>
                    <span className={statusBadgeClass(c.accountStatus)}>{c.accountStatus}</span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        type="button"
                        title="View / Edit"
                        onClick={(e) => {
                          e.stopPropagation()
                          viewCustomer(c)
                        }}
                      >
                        <i className="ri-edit-line" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <i className="ri-inbox-line" />
                      No customers match your filters
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <span className="pagination-info">
            Showing {filteredCustomers.length} of {customers.length} customers
          </span>
          <div className="pagination-controls">
            <button type="button" className="page-btn">
              <i className="ri-arrow-left-s-line" />
            </button>
            <button type="button" className="page-btn active">
              1
            </button>
            <button type="button" className="page-btn">
              <i className="ri-arrow-right-s-line" />
            </button>
          </div>
        </div>
      </section>

      {selectedCustomer && (
        <div className="drawer-overlay" onClick={closeDrawer}>
          <div className="drawer-box" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-hdr">
              <h3 className="modal-title">Customer Profile</h3>
              <button type="button" className="modal-close" onClick={closeDrawer}>
                <i className="ri-close-line" />
              </button>
            </div>

            {!editMode && (
              <>
                <div className="profile-top">
                  <img
                    src={selectedCustomer.avatar}
                    alt={selectedCustomer.name}
                    className="avatar-lg"
                  />
                  <div>
                    <p className="profile-name">{selectedCustomer.name}</p>
                    <p className="profile-id">
                      {selectedCustomer.id} · Joined {selectedCustomer.joinedDate}
                    </p>
                    <span
                      className={statusBadgeClass(selectedCustomer.accountStatus)}
                      style={{ marginTop: 6 }}
                    >
                      {selectedCustomer.accountStatus}
                    </span>
                  </div>
                </div>

                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Phone</span>
                    <span className="info-value">{selectedCustomer.phone}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Email</span>
                    <span className="info-value">{selectedCustomer.email}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">City</span>
                    <span className="info-value">{selectedCustomer.city}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Bundle Tier</span>
                    <span className="info-value">{selectedCustomer.bundleTier || 'None'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Last Order</span>
                    <span className="info-value">{selectedCustomer.lastOrder}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Total Orders</span>
                    <span className="info-value">{selectedCustomer.totalOrders}</span>
                  </div>
                </div>

                <div className="earnings-box">
                  <span>
                    <i className="ri-money-dollar-circle-line" /> Total Spend
                  </span>
                  <span className="earnings-val">{formatGhs(selectedCustomer.totalSpend)}</span>
                </div>

                <div className="drawer-actions">
                  <button type="button" className="btn-outline drawer-btn" onClick={startEdit}>
                    <i className="ri-edit-line" /> Edit Details
                  </button>
                  <button type="button" className="btn-green drawer-btn">
                    <i className="ri-refund-2-line" /> Process Refund
                  </button>
                  {selectedCustomer.accountStatus !== 'Flagged' && (
                    <button
                      type="button"
                      className="btn-warn drawer-btn"
                      onClick={() => setStatus(selectedCustomer, 'Flagged')}
                    >
                      <i className="ri-flag-2-line" /> Flag Account
                    </button>
                  )}
                  {selectedCustomer.accountStatus !== 'Active' && (
                    <button
                      type="button"
                      className="btn-green drawer-btn"
                      onClick={() => setStatus(selectedCustomer, 'Active')}
                    >
                      <i className="ri-check-line" /> Reactivate
                    </button>
                  )}
                  {selectedCustomer.accountStatus !== 'Suspended' && (
                    <button
                      type="button"
                      className="btn-danger drawer-btn"
                      onClick={() => setStatus(selectedCustomer, 'Suspended')}
                    >
                      <i className="ri-forbid-line" /> Suspend
                    </button>
                  )}
                </div>
              </>
            )}

            {editMode && editBuffer && (
              <>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editBuffer.name}
                    onChange={(e) => updateEditBuffer({ name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editBuffer.phone}
                    onChange={(e) => updateEditBuffer({ phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editBuffer.email}
                    onChange={(e) => updateEditBuffer({ email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editBuffer.city}
                    onChange={(e) => updateEditBuffer({ city: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Bundle Tier</label>
                  <select
                    className="form-select"
                    value={editBuffer.bundleTier ?? ''}
                    onChange={(e) =>
                      updateEditBuffer({ bundleTier: e.target.value || null })
                    }
                  >
                    <option value="">No Bundle</option>
                    <option value="Starter Pack">Starter Pack</option>
                    <option value="Business Lite">Business Lite</option>
                    <option value="Business Pro">Business Pro</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn-outline" onClick={cancelEdit}>
                    Cancel
                  </button>
                  <button type="button" className="btn-green" onClick={saveEdit}>
                    <i className="ri-check-line" /> Save Changes
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
