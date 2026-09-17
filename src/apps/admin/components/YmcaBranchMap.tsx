import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getAppConfig } from '../core/appConfig'
import './ymca-branch-map.css'

export interface MapBranch {
  id: string
  name: string
  region: string
  address?: string | null
  lat?: number | null
  lng?: number | null
}

function getGeoapifyApiKey(): string {
  return getAppConfig().geoapifyApiKey || import.meta.env.VITE_GEOAPIFY_API_KEY || ''
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function createBranchIcon(): L.DivIcon {
  return L.divIcon({
    className: 'ymca-branch-marker',
    html: '<div class="ymca-branch-pin"><i class="ri-building-2-fill"></i></div>',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  })
}

interface YmcaBranchMapProps {
  className?: string
  branches: MapBranch[]
}

export function YmcaBranchMap({ className, branches }: YmcaBranchMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const signature = JSON.stringify(
    branches.map((branch) => [branch.id, branch.name, branch.region, branch.address, branch.lat, branch.lng]),
  )

  useEffect(() => {
    const apiKey = getGeoapifyApiKey()
    if (!containerRef.current || !apiKey) return

    const mapped = (JSON.parse(signature) as Array<[string, string, string, string | null, number | null, number | null]>).map(
      ([id, name, region, address, lat, lng]) => ({ id, name, region, address, lat, lng }),
    )

    const map = L.map(containerRef.current, {
      zoomControl: true,
      attributionControl: true,
    })

    L.tileLayer(
      `https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${apiKey}`,
      {
        maxZoom: 20,
        attribution:
          'Powered by <a href="https://www.geoapify.com/" target="_blank" rel="noopener noreferrer">Geoapify</a> | © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
      },
    ).addTo(map)

    const icon = createBranchIcon()
    const markers: L.Marker[] = []
    const located = mapped.filter(
      (branch) => Number.isFinite(Number(branch.lat)) && Number.isFinite(Number(branch.lng)),
    )

    located.forEach((branch) => {
      const marker = L.marker([branch.lat as number, branch.lng as number], { icon })
        .addTo(map)
        .bindPopup(
          `<div class="ymca-branch-popup">
            <strong>${escapeHtml(branch.name)}</strong>
            <span class="ymca-branch-region">${escapeHtml(branch.region || '')}</span>
            ${branch.address ? `<span class="ymca-branch-address">${escapeHtml(branch.address)}</span>` : ''}
          </div>`,
        )
      markers.push(marker)
    })

    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map((m) => m.getLatLng()))
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 8 })
    } else {
      map.setView([7.9465, -1.0232], 6.5)
    }

    const resize = window.setTimeout(() => {
      map.invalidateSize()
    }, 80)

    mapRef.current = map

    return () => {
      window.clearTimeout(resize)
      map.remove()
      mapRef.current = null
    }
  }, [signature])

  const apiKey = getGeoapifyApiKey()

  if (!apiKey) {
    return (
      <div className="map-config-missing">
        <i className="ri-map-pin-line" />
        <p>
          Add your Geoapify API key to <code>VITE_GEOAPIFY_API_KEY</code> or <code>config.json</code>.
        </p>
      </div>
    )
  }

  return <div ref={containerRef} className={className} />
}

export function branchesToMapMarkers(branches: Array<{
  id: string
  name: string
  region_name?: string | null
  address?: string | null
  lat?: number | null
  lng?: number | null
}>): MapBranch[] {
  return branches.map((branch) => ({
    id: branch.id,
    name: branch.name,
    region: branch.region_name ?? '',
    address: branch.address,
    lat: branch.lat,
    lng: branch.lng,
  }))
}
