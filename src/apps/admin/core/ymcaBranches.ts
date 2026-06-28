export interface YmcaBranch {
  id: string
  name: string
  region: string
  address: string
  lat: number
  lng: number
}

/** YMCA Ghana regional offices and key facilities (coordinates approximate to city/address). */
export const YMCA_BRANCHES: YmcaBranch[] = [
  {
    id: 'hq-accra',
    name: 'National Headquarters',
    region: 'Greater Accra',
    address: 'Castle Road, Adabraka, Accra (P.O. Box GP738)',
    lat: 5.5565,
    lng: -0.2132,
  },
  {
    id: 'ttc-accra',
    name: 'Accra YMCA Technical Training Centre',
    region: 'Greater Accra',
    address: 'Adabraka, Accra',
    lat: 5.5578,
    lng: -0.2145,
  },
  {
    id: 'regional-accra',
    name: 'Greater Accra Regional YMCA',
    region: 'Greater Accra',
    address: 'Accra',
    lat: 5.6037,
    lng: -0.187,
  },
  {
    id: 'regional-ashanti',
    name: 'Ashanti Regional YMCA',
    region: 'Ashanti',
    address: 'Kumasi',
    lat: 6.692,
    lng: -1.623,
  },
  {
    id: 'regional-eastern',
    name: 'Eastern Regional YMCA',
    region: 'Eastern',
    address: 'Koforidua',
    lat: 6.094,
    lng: -0.259,
  },
  {
    id: 'regional-volta',
    name: 'Volta Regional YMCA',
    region: 'Volta',
    address: 'Ho',
    lat: 6.612,
    lng: 0.47,
  },
  {
    id: 'regional-western',
    name: 'Western Regional YMCA',
    region: 'Western',
    address: 'Takoradi',
    lat: 4.896,
    lng: -1.767,
  },
  {
    id: 'vti-takoradi',
    name: 'Vocational Training Institute',
    region: 'Western',
    address: 'Takoradi',
    lat: 4.901,
    lng: -1.759,
  },
]
