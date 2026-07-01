import type { EnrolmentStatus } from '../../core/types'

const badgeClass: Record<EnrolmentStatus, string> = {
  draft: 'yl-badge-draft',
  checkedOut: 'yl-badge-checkedOut',
  enrolled: 'yl-badge-enrolled',
  withdrawn: 'yl-badge-withdrawn',
  removed: 'yl-badge-removed',
  completed: 'yl-badge-completed',
}

export function EnrolmentBadge({ status }: { status: EnrolmentStatus }) {
  return <span className={`yl-badge ${badgeClass[status]}`}>{status}</span>
}
