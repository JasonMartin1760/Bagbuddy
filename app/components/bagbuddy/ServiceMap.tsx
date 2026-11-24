import {useState, type Dispatch, type ReactNode, type SetStateAction} from 'react';
import {
  SERVICE_AREAS,
  type ServiceArea,
  type ServiceAreaId,
} from '~/data/serviceAreaList';

// Only served areas are drawn. Denver metro (coming soon) is left off the
// map until version 2.
const MAP_AREAS = SERVICE_AREAS.filter((area) => area.status === 'served');

/**
 * Lightweight inline-SVG map of the Pikes Peak region with the Bag Buddy
 * service areas. No map library or API key. Colorado Springs is the focus
 * and fills the map; Woodland Park sits up in the corner as the side area.
 * Hover, focus or tap an area to see its name; the area matched by the zip
 * checker is highlighted.
 */

// Map window (approx.), centred on Colorado Springs, with a simple
// equirectangular projection. Woodland Park lands near the top-left edge.
const WEST = -105.2;
const EAST = -104.3;
const NORTH = 39.12;
const SOUTH = 38.6;
const PX_PER_LON = 1000;
const PX_PER_LAT = PX_PER_LON / Math.cos((38.86 * Math.PI) / 180);
const PAD = 16;
const WIDTH = (EAST - WEST) * PX_PER_LON;
const HEIGHT = (NORTH - SOUTH) * PX_PER_LAT;

function project(lat: number, lon: number) {
  return {
    x: PAD + (lon - WEST) * PX_PER_LON,
    y: PAD + (NORTH - lat) * PX_PER_LAT,
  };
}

function toPath(points: Array<[number, number]>) {
  return points
    .map(([lat, lon], i) => {
      const {x, y} = project(lat, lon);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
}

// Interstate 25 through Colorado Springs, for orientation.
const I25: Array<[number, number]> = [
  [39.13, -104.87],
  [39.02, -104.86],
  [38.93, -104.81],
  [38.83, -104.82],
  [38.75, -104.77],
  [38.59, -104.68],
];

// US 24 from Colorado Springs up Ute Pass to Woodland Park.
const US24: Array<[number, number]> = [
  [38.84, -104.84],
  [38.86, -104.91],
  [38.91, -104.96],
  [38.95, -105.01],
  [38.99, -105.06],
  [39.02, -105.21],
];

const PIKES_PEAK = {lat: 38.84, lon: -105.04};

const CITY_DOTS: Array<{name: string; lat: number; lon: number}> = [
  {name: 'Colorado Springs', lat: 38.83, lon: -104.82},
  {name: 'Woodland Park', lat: 38.99, lon: -105.06},
];

export function ServiceMap({
  highlightedArea,
  footer,
}: {
  highlightedArea?: ServiceAreaId | null;
  /** Replaces the caption and area buttons under the map (e.g. a zip checker). */
  footer?: ReactNode;
}) {
  const [hovered, setHovered] = useState<ServiceAreaId | null>(null);
  const activeId = hovered ?? highlightedArea ?? null;
  const active = MAP_AREAS.find((area) => area.id === activeId);

  const peak = project(PIKES_PEAK.lat, PIKES_PEAK.lon);

  return (
    <figure className="bb-map">
      <svg
        viewBox={`0 0 ${WIDTH + PAD * 2} ${HEIGHT + PAD * 2}`}
        role="group"
        aria-label="Map of the Pikes Peak region showing Bag Buddy service areas: Colorado Springs, plus Woodland Park"
      >
        <rect
          className="bb-map__state"
          x={PAD}
          y={PAD}
          width={WIDTH}
          height={HEIGHT}
          rx={10}
        />
        <text
          className="bb-map__state-label"
          x={PAD + WIDTH - 24}
          y={PAD + HEIGHT - 24}
          textAnchor="end"
          aria-hidden="true"
        >
          PIKES PEAK REGION
        </text>
        <defs>
          <clipPath id="bb-map-clip">
            <rect x={PAD} y={PAD} width={WIDTH} height={HEIGHT} rx={10} />
          </clipPath>
        </defs>
        <g clipPath="url(#bb-map-clip)" aria-hidden="true">
          <path className="bb-map__road" d={toPath(I25)} />
          <path className="bb-map__road bb-map__road--minor" d={toPath(US24)} />
        </g>
        <text
          className="bb-map__road-label"
          {...project(39.08, -104.84)}
          aria-hidden="true"
        >
          I-25
        </text>
        <g className="bb-map__peak" aria-hidden="true">
          <path
            d={`M${peak.x} ${peak.y - 22} L${peak.x + 22} ${peak.y + 16} L${peak.x - 22} ${peak.y + 16} Z`}
          />
          <text x={peak.x} y={peak.y + 46} textAnchor="middle">
            Pikes Peak
          </text>
        </g>
        {MAP_AREAS.map((area) => (
          <AreaMarker
            key={area.id}
            area={area}
            active={area.id === activeId}
            matched={area.id === highlightedArea}
            onActivate={setHovered}
          />
        ))}
        {CITY_DOTS.map((city) => {
          const {x, y} = project(city.lat, city.lon);
          return (
            <circle
              key={city.name}
              className="bb-map__city"
              cx={x}
              cy={y}
              r={6}
              aria-hidden="true"
            />
          );
        })}
      </svg>
      {footer ? (
        <div className="bb-map__footer">{footer}</div>
      ) : (
        <MapCaption active={active} activeId={activeId} onToggle={setHovered} />
      )}
    </figure>
  );
}

function MapCaption({
  active,
  activeId,
  onToggle,
}: {
  active: ServiceArea | undefined;
  activeId: ServiceAreaId | null;
  onToggle: Dispatch<SetStateAction<ServiceAreaId | null>>;
}) {
  return (
    <>
      <figcaption className="bb-map__caption" aria-live="polite">
        {active ? (
          <>
            <strong>{active.label}</strong>
            <span>
              {active.counties.join(', ')}{' '}
              {active.counties.length > 1 ? 'counties' : 'County'}
            </span>
          </>
        ) : (
          <span>Tap an area to see where we serve</span>
        )}
      </figcaption>
      <ul className="bb-map__legend">
        {MAP_AREAS.map((area) => (
          <li key={area.id}>
            <button
              type="button"
              className={
                area.id === activeId
                  ? 'bb-map__legend-btn is-active'
                  : 'bb-map__legend-btn'
              }
              aria-pressed={area.id === activeId}
              onClick={() =>
                onToggle((current) => (current === area.id ? null : area.id))
              }
            >
              {area.label}
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

function AreaMarker({
  area,
  active,
  matched,
  onActivate,
}: {
  area: ServiceArea;
  active: boolean;
  matched: boolean;
  onActivate: (id: ServiceAreaId | null) => void;
}) {
  const {x, y} = project(area.lat, area.lon);
  // Woodland Park is the side area: smaller, label tucked above it.
  const secondary = area.id === 'woodland-park';
  const className = [
    'bb-map__area',
    active ? 'is-active' : '',
    matched ? 'is-matched' : '',
    secondary ? 'bb-map__area--side' : 'bb-map__area--main',
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <g
      className={className}
      role="button"
      tabIndex={0}
      aria-label={`${area.label} service area`}
      aria-pressed={active}
      onMouseEnter={() => onActivate(area.id)}
      onMouseLeave={() => onActivate(null)}
      onFocus={() => onActivate(area.id)}
      onBlur={() => onActivate(null)}
      onClick={() => onActivate(area.id)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onActivate(area.id);
        }
      }}
    >
      <circle cx={x} cy={y} r={area.radius} />
      <text
        x={secondary ? x - area.radius : x}
        y={secondary ? y - area.radius - 14 : y + area.radius + 44}
        textAnchor={secondary ? 'start' : 'middle'}
      >
        {area.label}
      </text>
    </g>
  );
}
