/**
 * Bag Buddy service areas (labels, status, map position). Kept apart from
 * the zip list in serviceAreas.ts, which re-exports everything here, so
 * pages that only need the area names (the footer) stay light.
 */

export type ServiceAreaId =
  | 'colorado-springs'
  | 'woodland-park'
  | 'denver-metro';

/** True for exactly 5 digits (surrounding spaces ignored). */
export function isValidZip(zip: string): boolean {
  return /^\d{5}$/.test(zip.trim());
}

export type ServiceStatus = 'served' | 'coming-soon';

export interface ServiceArea {
  id: ServiceAreaId;
  label: string;
  /** 'coming-soon' areas are recognized but not booked or priced yet. */
  status: ServiceStatus;
  counties: readonly string[];
  /** Approximate center, used to place the area on the service map. */
  lat: number;
  lon: number;
  /** Marker radius on the service map, in map units. */
  radius: number;
}

export const SERVICE_AREAS: readonly ServiceArea[] = [
  {
    id: 'denver-metro',
    label: 'Denver metro',
    // Jason: Denver is not served yet; planned soon.
    status: 'coming-soon',
    counties: [
      'Denver',
      'Adams',
      'Arapahoe',
      'Jefferson',
      'Douglas',
      'Broomfield',
    ],
    lat: 39.68,
    lon: -104.95,
    radius: 30,
  },
  {
    id: 'colorado-springs',
    label: 'Colorado Springs',
    status: 'served',
    counties: ['El Paso'],
    lat: 38.86,
    lon: -104.78,
    radius: 150,
  },
  {
    id: 'woodland-park',
    label: 'Woodland Park',
    status: 'served',
    counties: ['Teller'],
    lat: 38.99,
    lon: -105.06,
    radius: 34,
  },
];

export function getServiceArea(id: ServiceAreaId): ServiceArea {
  const area = SERVICE_AREAS.find((entry) => entry.id === id);
  if (!area) throw new Error(`Unknown service area: ${id}`);
  return area;
}
