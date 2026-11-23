import {useState} from 'react';
import {
  SERVICE_AREAS,
  type ServiceArea,
  type ServiceAreaId,
} from '~/data/serviceAreas';

/**
 * Lightweight inline-SVG map of Colorado with the Bag Buddy service areas.
 * No map library or API key. Hover, focus or tap an area to see its name;
 * the area matched by the zip checker is highlighted.
 */

// Colorado bounds (approx.) and a simple equirectangular projection.
const WEST = -109.06;
const EAST = -102.04;
const NORTH = 41.0;
const SOUTH = 36.99;
const PX_PER_LON = 100;
const PX_PER_LAT = PX_PER_LON / Math.cos((39 * Math.PI) / 180);
const PAD = 16;
const WIDTH = (EAST - WEST) * PX_PER_LON;
const HEIGHT = (NORTH - SOUTH) * PX_PER_LAT;

function project(lat: number, lon: number) {
  return {
    x: PAD + (lon - WEST) * PX_PER_LON,
    y: PAD + (NORTH - lat) * PX_PER_LAT,
  };
}

// Interstate 25 along the Front Range, for orientation.
const I25: Array<[number, number]> = [
  [41.0, -104.88],
  [40.58, -104.98],
  [39.74, -104.99],
  [39.37, -104.86],
  [38.83, -104.82],
  [38.25, -104.61],
  [37.17, -104.5],
  [36.99, -104.47],
];

const CITY_DOTS: Array<{name: string; lat: number; lon: number}> = [
  {name: 'Denver', lat: 39.74, lon: -104.99},
  {name: 'Colorado Springs', lat: 38.83, lon: -104.82},
  {name: 'Woodland Park', lat: 38.99, lon: -105.06},
];

export function ServiceMap({
  highlightedArea,
}: {
  highlightedArea?: ServiceAreaId | null;
}) {
  const [hovered, setHovered] = useState<ServiceAreaId | null>(null);
  const activeId = hovered ?? highlightedArea ?? null;
  const active = SERVICE_AREAS.find((area) => area.id === activeId);

  const i25Path = I25.map(([lat, lon], i) => {
    const {x, y} = project(lat, lon);
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');

  return (
    <figure className="bb-map">
      <svg
        viewBox={`0 0 ${WIDTH + PAD * 2} ${HEIGHT + PAD * 2}`}
        role="group"
        aria-label="Map of Colorado showing Bag Buddy service areas: Denver metro, Colorado Springs and Woodland Park"
      >
        <rect
          className="bb-map__state"
          x={PAD}
          y={PAD}
          width={WIDTH}
          height={HEIGHT}
          rx={6}
        />
        <text
          className="bb-map__state-label"
          x={PAD + 24}
          y={PAD + HEIGHT - 24}
          aria-hidden="true"
        >
          COLORADO
        </text>
        <path className="bb-map__road" d={i25Path} aria-hidden="true" />
        <text
          className="bb-map__road-label"
          {...project(37.7, -104.42)}
          aria-hidden="true"
        >
          I-25
        </text>
        {SERVICE_AREAS.map((area) => (
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
              r={3.5}
              aria-hidden="true"
            />
          );
        })}
      </svg>
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
        {SERVICE_AREAS.map((area) => (
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
                setHovered((current) => (current === area.id ? null : area.id))
              }
            >
              {area.label}
            </button>
          </li>
        ))}
      </ul>
    </figure>
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
  const className = [
    'bb-map__area',
    active ? 'is-active' : '',
    matched ? 'is-matched' : '',
  ]
    .filter(Boolean)
    .join(' ');
  const labelLeft = area.id === 'woodland-park';
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
        x={labelLeft ? x - area.radius - 6 : x + area.radius + 6}
        y={y + 5}
        textAnchor={labelLeft ? 'end' : 'start'}
      >
        {area.label}
      </text>
    </g>
  );
}
