import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getAppConfig } from '../core/appConfig'
import { YMCA_BRANCHES } from '../core/ymcaBranches'

function getGeoapifyApiKey(): string {
  return getAppConfig().geoapifyApiKey || import.meta.env.VITE_GEOAPIFY_API_KEY || ''
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
}

export function YmcaBranchMap({ className }: YmcaBranchMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    const apiKey = getGeoapifyApiKey()
    if (!containerRef.current || !apiKey) return

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

    YMCA_BRANCHES.forEach((branch) => {
      const marker = L.marker([branch.lat, branch.lng], { icon })
        .addTo(map)
        .bindPopup(
          `<div class="ymca-branch-popup">
            <strong>${branch.name}</strong>
            <span class="ymca-branch-region">${branch.region}</span>
            <span class="ymca-branch-address">${branch.address}</span>
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

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  const apiKey = getGeoapifyApiKey()

  if (!apiKey) {
    return (
      <div className="map-config-missing">
        <i className="ri-map-pin-line" />
        <p>Add your Geoapify API key to <code>VITE_GEOAPIFY_API_KEY</code> or <code>config.json</code>.</p>
      </div>
    )
  }

  return <div ref={containerRef} className={className} />
}

export function getYmcaBranchCount(): number {
  return YMCA_BRANCHES.length
}
