import { useEffect, useRef } from 'react'
import type { Provider, Course } from '../../core/types'

type MarkerData = Provider & { courses?: Course[] }

function hasCoordinates(provider: MarkerData): provider is MarkerData & {
  latitude: number
  longitude: number
} {
  const lat = Number(provider.latitude)
  const lng = Number(provider.longitude)
  return Number.isFinite(lat) && Number.isFinite(lng)
}

export function LeafletMap({
  providers,
  selectedProviderId,
  onSelectProvider,
}: {
  providers: MarkerData[]
  selectedProviderId?: string | null
  onSelectProvider?: (id: string) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())
  const providersRef = useRef(providers)
  providersRef.current = providers

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    let cancelled = false

    async function init() {
      const L = await import('leaflet')
      if (cancelled || !containerRef.current) return

      // @ts-expect-error leaflet private field
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(containerRef.current).setView([7.95, -1.02], 7)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map)
      mapRef.current = map
      updateMarkers(L, map, providersRef.current, selectedProviderId ?? null)
      requestAnimationFrame(() => map.invalidateSize())
    }

    init()

    return () => {
      cancelled = true
      markersRef.current.forEach((m) => m.remove())
      markersRef.current.clear()
      mapRef.current?.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!mapRef.current) return
    import('leaflet').then((L) => {
      if (mapRef.current) {
        updateMarkers(L, mapRef.current, providers, selectedProviderId ?? null)
      }
    })
  }, [providers, selectedProviderId])

  function updateMarkers(
    L: typeof import('leaflet'),
    map: L.Map,
    items: MarkerData[],
    selectedId: string | null,
  ) {
    markersRef.current.forEach((m) => m.remove())
    markersRef.current.clear()

    const valid = items.filter(hasCoordinates)

    valid.forEach((provider) => {
      const lat = Number(provider.latitude)
      const lng = Number(provider.longitude)
      const isSelected = provider.id === selectedId
      const marker = L.marker([lat, lng], {
        opacity: selectedId && !isSelected ? 0.55 : 1,
      }).addTo(map)

      const courseList =
        provider.courses?.length
          ? `<ul class="yl-popup-courses">${provider.courses
              .map(
                (c) =>
                  `<li><strong>${c.name}</strong><br/><span>${c.subject} · £${c.fees.toFixed(2)}</span></li>`,
              )
              .join('')}</ul>`
          : '<p style="margin:0;font-size:12px;color:#666">No active courses</p>'

      marker.bindPopup(`
        <div class="yl-popup">
          <h3>${provider.name}</h3>
          <p class="yl-popup-address">${provider.address}</p>
          ${courseList}
        </div>
      `)

      marker.on('click', () => {
        marker.openPopup()
        onSelectProvider?.(provider.id)
      })

      markersRef.current.set(provider.id, marker)
    })

    if (selectedId) {
      const selected = valid.find((p) => p.id === selectedId)
      if (selected) {
        map.flyTo(
          [Number(selected.latitude), Number(selected.longitude)],
          13,
          { duration: 0.8 },
        )
        markersRef.current.get(selectedId)?.openPopup()
        return
      }
    }

    if (valid.length > 0) {
      const bounds = L.latLngBounds(
        valid.map((p) => [Number(p.latitude), Number(p.longitude)]),
      )
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 12 })
    }
  }

  return <div ref={containerRef} className="yl-map" />
}
