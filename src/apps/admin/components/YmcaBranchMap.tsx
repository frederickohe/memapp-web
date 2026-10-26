import { useEffect, useRef, useState } from 'react'
import type { Map as LeafletMap, Marker as LeafletMarker } from 'leaflet'
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

function hasCoordinates(branch: MapBranch): branch is MapBranch & { lat: number; lng: number } {
  return Number.isFinite(Number(branch.lat)) && Number.isFinite(Number(branch.lng))
}

interface YmcaBranchMapProps {
  className?: string
  branches: MapBranch[]
}

export function YmcaBranchMap({ className, branches }: YmcaBranchMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const markersRef = useRef<LeafletMarker[]>([])
  const branchesRef = useRef(branches)
  branchesRef.current = branches

  const [mapError, setMapError] = useState<string | null>(null)
  const apiKey = getGeoapifyApiKey()

  // Create the map once; update markers when branch data changes.
  useEffect(() => {
    if (!apiKey || !containerRef.current || mapRef.current) return

    let cancelled = false

    async function init() {
      try {
        const L = await import('leaflet')
        if (cancelled || !containerRef.current || mapRef.current) return

        // Clear stale leaflet id left by StrictMode remounts / HMR.
        const el = containerRef.current as HTMLDivElement & { _leaflet_id?: number }
        if (el._leaflet_id) {
          el._leaflet_id = undefined
          el.innerHTML = ''
        }

        const map = L.map(el, {
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

        mapRef.current = map
        syncMarkers(L, map, branchesRef.current)
        requestAnimationFrame(() => map.invalidateSize())
      } catch (err) {
        console.error('Failed to initialize branch map', err)
        if (!cancelled) {
          setMapError(err instanceof Error ? err.message : 'Map failed to load')
        }
      }
    }

    void init()

    return () => {
      cancelled = true
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [apiKey])

  useEffect(() => {
    if (!mapRef.current) return

    let cancelled = false
    void import('leaflet').then((L) => {
      if (cancelled || !mapRef.current) return
      try {
        syncMarkers(L, mapRef.current, branches)
      } catch (err) {
        console.error('Failed to update branch markers', err)
      }
    })

    return () => {
      cancelled = true
    }
  }, [branches])

  function syncMarkers(
    L: typeof import('leaflet'),
    map: LeafletMap,
    items: MapBranch[],
  ) {
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []

    const icon = L.divIcon({
      className: 'ymca-branch-marker',
      html: '<div class="ymca-branch-pin"><i class="ri-building-2-fill"></i></div>',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    })

    const located = items.filter(hasCoordinates)
    for (const branch of located) {
      const marker = L.marker([branch.lat, branch.lng], { icon })
        .addTo(map)
        .bindPopup(
          `<div class="ymca-branch-popup">
            <strong>${escapeHtml(branch.name)}</strong>
            <span class="ymca-branch-region">${escapeHtml(branch.region || '')}</span>
            ${branch.address ? `<span class="ymca-branch-address">${escapeHtml(branch.address)}</span>` : ''}
          </div>`,
        )
      markersRef.current.push(marker)
    }

    if (markersRef.current.length > 0) {
      const bounds = L.latLngBounds(markersRef.current.map((m) => m.getLatLng()))
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 8 })
    } else {
      map.setView([7.9465, -1.0232], 7)
    }
  }

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

  if (mapError) {
    return (
      <div className="map-config-missing">
        <i className="ri-error-warning-line" />
        <p>Map unavailable: {mapError}</p>
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
