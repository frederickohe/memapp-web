declare namespace google.maps {
  class Map {
    constructor(el: HTMLElement, opts?: Record<string, unknown>)
    setCenter(latLng: { lat: number; lng: number }): void
    setZoom(zoom: number): void
    panTo(latLng: { lat: number; lng: number }): void
  }

  class Marker {
    constructor(opts?: Record<string, unknown>)
    setMap(map: Map | null): void
    addListener(event: string, handler: () => void): void
  }

  class Size {
    constructor(width: number, height: number)
  }

  class Point {
    constructor(x: number, y: number)
  }

  namespace event {
    function trigger(instance: Map, eventName: string): void
  }
}

declare const google: {
  maps: typeof google.maps
}

interface Window {
  google?: typeof google
}
