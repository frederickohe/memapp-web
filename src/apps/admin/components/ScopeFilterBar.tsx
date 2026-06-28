import { useCallback, useEffect, useMemo, useState } from 'react'
import { branchApi } from '../core/services'
import type { Branch, Region, ScopeFilterParams, ScopeLevel } from '../core/models'
import '../styles/shared.css'
import './scope-filter.css'

interface ScopeFilterBarProps {
  value: ScopeFilterParams
  onChange: (next: ScopeFilterParams) => void
  showNational?: boolean
  className?: string
}

export function ScopeFilterBar({
  value,
  onChange,
  showNational = true,
  className = '',
}: ScopeFilterBarProps) {
  const [regions, setRegions] = useState<Region[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(false)

  const scope: ScopeLevel = value.scope ?? 'national'

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [regionData, branchData] = await Promise.all([
        branchApi.listRegions(),
        branchApi.listBranches(),
      ])
      setRegions(regionData)
      setBranches(branchData)
    } catch {
      setRegions([])
      setBranches([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const filteredBranches = useMemo(() => {
    if (scope !== 'branch' || !value.region_id) return branches
    return branches.filter((b) => b.region_id === value.region_id)
  }, [branches, scope, value.region_id])

  const setScope = (nextScope: ScopeLevel) => {
    if (nextScope === 'national') {
      onChange({ scope: 'national' })
      return
    }
    if (nextScope === 'region') {
      onChange({
        scope: 'region',
        region_id: value.region_id ?? regions[0]?.id,
      })
      return
    }
    onChange({
      scope: 'branch',
      region_id: value.region_id ?? regions[0]?.id,
      branch_id: value.branch_id ?? filteredBranches[0]?.id ?? branches[0]?.id,
    })
  }

  return (
    <div className={`scope-filter-bar ${className}`.trim()}>
      <div className="scope-filter-tabs">
        {showNational && (
          <button
            type="button"
            className={`tab-btn${scope === 'national' ? ' tab-active' : ''}`}
            onClick={() => setScope('national')}
          >
            National
          </button>
        )}
        <button
          type="button"
          className={`tab-btn${scope === 'region' ? ' tab-active' : ''}`}
          onClick={() => setScope('region')}
        >
          Regional
        </button>
        <button
          type="button"
          className={`tab-btn${scope === 'branch' ? ' tab-active' : ''}`}
          onClick={() => setScope('branch')}
        >
          Branch
        </button>
      </div>

      {scope === 'region' && (
        <select
          className="form-select scope-filter-select"
          value={value.region_id ?? ''}
          disabled={loading}
          onChange={(e) =>
            onChange({ scope: 'region', region_id: e.target.value || undefined })
          }
        >
          <option value="">Select region…</option>
          {regions.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      )}

      {scope === 'branch' && (
        <>
          <select
            className="form-select scope-filter-select"
            value={value.region_id ?? ''}
            disabled={loading}
            onChange={(e) => {
              const regionId = e.target.value || undefined
              const regionBranches = branches.filter((b) => b.region_id === regionId)
              onChange({
                scope: 'branch',
                region_id: regionId,
                branch_id: regionBranches[0]?.id,
              })
            }}
          >
            <option value="">Select region…</option>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <select
            className="form-select scope-filter-select"
            value={value.branch_id ?? ''}
            disabled={loading || !value.region_id}
            onChange={(e) =>
              onChange({
                scope: 'branch',
                region_id: value.region_id,
                branch_id: e.target.value || undefined,
              })
            }
          >
            <option value="">Select branch…</option>
            {(value.region_id
              ? branches.filter((b) => b.region_id === value.region_id)
              : branches
            ).map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </>
      )}
    </div>
  )
}
