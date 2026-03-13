import { Info } from 'lucide-react'

type PendingSourceBannerProps = {
  label?: string
}

export function PendingSourceBanner({
  label = 'This view uses a typed fallback adapter until backend endpoints are available.',
}: PendingSourceBannerProps) {
  return (
    <div className="dashboard-panel flex items-start gap-3 border-blue-200 bg-blue-50/70 px-4 py-3">
      <Info className="mt-0.5 size-4 text-blue-600" />
      <div>
        <p className="text-sm font-medium text-blue-900">Data source pending</p>
        <p className="text-xs text-blue-700">{label}</p>
      </div>
    </div>
  )
}
