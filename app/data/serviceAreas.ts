/**
 * Bag Buddy Dumpsters service-area zip codes (180 zips). Pricing is by
 * county: each zip belongs to the area of its county.
 *
 * - Colorado Springs area = El Paso County (63 zips)
 * - Woodland Park area = Teller County (6 zips)
 * - Denver metro = Denver, Adams, Arapahoe, Jefferson, Douglas and
 *   Broomfield counties (111 zips), status 'coming-soon': not served yet
 *
 * Source: Census 2020 ZCTA-to-county relationship file. A ZCTA that spans
 * counties is assigned to the county holding most of its land area (e.g.
 * 80863 Woodland Park is 71% Teller / 29% El Paso -> Woodland Park; 80819
 * Green Mountain Falls is 94% El Paso -> Colorado Springs). PO Box and
 * unique (single-organization) zips have no ZCTA, so the El Paso and Teller
 * ones were added from the USPS county zip list (80901, 80912, 80841,
 * 80931-80937, 80941, 80942, 80946, 80947, 80949, 80950, 80960, 80962,
 * 80970, 80977, 80995, 80997, and 80866 for Teller).
 *
 * TODO(Jason): confirm the list. Military / unique-use zips are included
 * as-is, and some primary city names are unverified (city is not shown on
 * the site).
 */

export type ServiceAreaId =
  | 'colorado-springs'
  | 'woodland-park'
  | 'denver-metro';

export interface ServiceZip {
  zip: string;
  area: ServiceAreaId;
  city: string;
  county: string;
}

export const SERVICE_ZIPS: readonly ServiceZip[] = [
  {
    zip: '80002',
    area: 'denver-metro',
    city: 'Arvada',
    county: 'Jefferson County',
  },
  {
    zip: '80003',
    area: 'denver-metro',
    city: 'Arvada',
    county: 'Jefferson County',
  },
  {
    zip: '80004',
    area: 'denver-metro',
    city: 'Arvada',
    county: 'Jefferson County',
  },
  {
    zip: '80005',
    area: 'denver-metro',
    city: 'Arvada',
    county: 'Jefferson County',
  },
  {
    zip: '80007',
    area: 'denver-metro',
    city: 'Zcta 80007',
    county: 'Jefferson County',
  },
  {
    zip: '80010',
    area: 'denver-metro',
    city: 'Aurora',
    county: 'Arapahoe County',
  },
  {zip: '80011', area: 'denver-metro', city: 'Aurora', county: 'Adams County'},
  {
    zip: '80012',
    area: 'denver-metro',
    city: 'Aurora',
    county: 'Arapahoe County',
  },
  {
    zip: '80013',
    area: 'denver-metro',
    city: 'Aurora',
    county: 'Arapahoe County',
  },
  {
    zip: '80014',
    area: 'denver-metro',
    city: 'Aurora',
    county: 'Arapahoe County',
  },
  {
    zip: '80015',
    area: 'denver-metro',
    city: 'Aurora',
    county: 'Arapahoe County',
  },
  {
    zip: '80016',
    area: 'denver-metro',
    city: 'Aurora',
    county: 'Arapahoe County',
  },
  {
    zip: '80017',
    area: 'denver-metro',
    city: 'Aurora',
    county: 'Arapahoe County',
  },
  {
    zip: '80018',
    area: 'denver-metro',
    city: 'Aurora',
    county: 'Arapahoe County',
  },
  {zip: '80019', area: 'denver-metro', city: 'Aurora', county: 'Adams County'},
  {
    zip: '80020',
    area: 'denver-metro',
    city: 'Broomfield',
    county: 'Broomfield County',
  },
  {
    zip: '80021',
    area: 'denver-metro',
    city: 'Westminster',
    county: 'Jefferson County',
  },
  {
    zip: '80022',
    area: 'denver-metro',
    city: 'Commerce city',
    county: 'Adams County',
  },
  {
    zip: '80023',
    area: 'denver-metro',
    city: 'Broomfield',
    county: 'Broomfield County',
  },
  {zip: '80024', area: 'denver-metro', city: 'Dupont', county: 'Adams County'},
  {
    zip: '80030',
    area: 'denver-metro',
    city: 'Westminster',
    county: 'Adams County',
  },
  {
    zip: '80031',
    area: 'denver-metro',
    city: 'Westminster',
    county: 'Adams County',
  },
  {
    zip: '80033',
    area: 'denver-metro',
    city: 'Wheat ridge',
    county: 'Jefferson County',
  },
  {zip: '80045', area: 'denver-metro', city: 'Aurora', county: 'Adams County'},
  {zip: '80102', area: 'denver-metro', city: 'Bennett', county: 'Adams County'},
  {zip: '80103', area: 'denver-metro', city: 'Byers', county: 'Adams County'},
  {
    zip: '80104',
    area: 'denver-metro',
    city: 'Castle rock',
    county: 'Douglas County',
  },
  {
    zip: '80105',
    area: 'denver-metro',
    city: 'Deer trail',
    county: 'Arapahoe County',
  },
  {
    zip: '80108',
    area: 'denver-metro',
    city: 'Castle Rock',
    county: 'Douglas County',
  },
  {
    zip: '80109',
    area: 'denver-metro',
    city: 'Castle Rock',
    county: 'Douglas County',
  },
  {
    zip: '80110',
    area: 'denver-metro',
    city: 'Cherry hills vil',
    county: 'Arapahoe County',
  },
  {
    zip: '80111',
    area: 'denver-metro',
    city: 'Cherry hills vil',
    county: 'Arapahoe County',
  },
  {
    zip: '80112',
    area: 'denver-metro',
    city: 'Englewood',
    county: 'Arapahoe County',
  },
  {
    zip: '80113',
    area: 'denver-metro',
    city: 'Englewood',
    county: 'Arapahoe County',
  },
  {
    zip: '80116',
    area: 'denver-metro',
    city: 'Franktown',
    county: 'Douglas County',
  },
  {
    zip: '80118',
    area: 'denver-metro',
    city: 'Larkspur',
    county: 'Douglas County',
  },
  {
    zip: '80120',
    area: 'denver-metro',
    city: 'Littleton',
    county: 'Arapahoe County',
  },
  {
    zip: '80121',
    area: 'denver-metro',
    city: 'Greenwood villag',
    county: 'Arapahoe County',
  },
  {
    zip: '80122',
    area: 'denver-metro',
    city: 'Littleton',
    county: 'Arapahoe County',
  },
  {
    zip: '80123',
    area: 'denver-metro',
    city: 'Bow mar',
    county: 'Jefferson County',
  },
  {
    zip: '80124',
    area: 'denver-metro',
    city: 'Littleton',
    county: 'Douglas County',
  },
  {
    zip: '80125',
    area: 'denver-metro',
    city: 'Littleton',
    county: 'Douglas County',
  },
  {
    zip: '80126',
    area: 'denver-metro',
    city: 'Highlands ranch',
    county: 'Douglas County',
  },
  {
    zip: '80127',
    area: 'denver-metro',
    city: 'Littleton',
    county: 'Jefferson County',
  },
  {
    zip: '80128',
    area: 'denver-metro',
    city: 'Zcta 80128',
    county: 'Jefferson County',
  },
  {
    zip: '80129',
    area: 'denver-metro',
    city: 'Littleton',
    county: 'Douglas County',
  },
  {
    zip: '80130',
    area: 'denver-metro',
    city: 'Littleton',
    county: 'Douglas County',
  },
  {
    zip: '80131',
    area: 'denver-metro',
    city: 'Louviers',
    county: 'Douglas County',
  },
  {
    zip: '80132',
    area: 'colorado-springs',
    city: 'Monument',
    county: 'El Paso County',
  },
  {
    zip: '80133',
    area: 'colorado-springs',
    city: 'Palmer lake',
    county: 'El Paso County',
  },
  {
    zip: '80134',
    area: 'denver-metro',
    city: 'Parker',
    county: 'Douglas County',
  },
  {
    zip: '80135',
    area: 'denver-metro',
    city: 'Deckers',
    county: 'Douglas County',
  },
  {
    zip: '80136',
    area: 'denver-metro',
    city: 'Strasburg',
    county: 'Adams County',
  },
  {
    zip: '80137',
    area: 'denver-metro',
    city: 'Watkins',
    county: 'Arapahoe County',
  },
  {
    zip: '80138',
    area: 'denver-metro',
    city: 'Zcta 80138',
    county: 'Douglas County',
  },
  {zip: '80202', area: 'denver-metro', city: 'Denver', county: 'Denver County'},
  {zip: '80203', area: 'denver-metro', city: 'Denver', county: 'Denver County'},
  {zip: '80204', area: 'denver-metro', city: 'Denver', county: 'Denver County'},
  {zip: '80205', area: 'denver-metro', city: 'Denver', county: 'Denver County'},
  {zip: '80206', area: 'denver-metro', city: 'Denver', county: 'Denver County'},
  {zip: '80207', area: 'denver-metro', city: 'Denver', county: 'Denver County'},
  {zip: '80209', area: 'denver-metro', city: 'Denver', county: 'Denver County'},
  {zip: '80210', area: 'denver-metro', city: 'Denver', county: 'Denver County'},
  {zip: '80211', area: 'denver-metro', city: 'Denver', county: 'Denver County'},
  {
    zip: '80212',
    area: 'denver-metro',
    city: 'Mountain view',
    county: 'Denver County',
  },
  {
    zip: '80214',
    area: 'denver-metro',
    city: 'Edgewater',
    county: 'Jefferson County',
  },
  {
    zip: '80215',
    area: 'denver-metro',
    city: 'Lakewood',
    county: 'Jefferson County',
  },
  {zip: '80216', area: 'denver-metro', city: 'Denver', county: 'Denver County'},
  {zip: '80218', area: 'denver-metro', city: 'Denver', county: 'Denver County'},
  {zip: '80219', area: 'denver-metro', city: 'Denver', county: 'Denver County'},
  {zip: '80220', area: 'denver-metro', city: 'Denver', county: 'Denver County'},
  {
    zip: '80221',
    area: 'denver-metro',
    city: 'Federal heights',
    county: 'Adams County',
  },
  {
    zip: '80222',
    area: 'denver-metro',
    city: 'Glendale',
    county: 'Denver County',
  },
  {zip: '80223', area: 'denver-metro', city: 'Denver', county: 'Denver County'},
  {zip: '80224', area: 'denver-metro', city: 'Denver', county: 'Denver County'},
  {
    zip: '80226',
    area: 'denver-metro',
    city: 'Lakewood',
    county: 'Jefferson County',
  },
  {
    zip: '80227',
    area: 'denver-metro',
    city: 'Denver',
    county: 'Jefferson County',
  },
  {
    zip: '80228',
    area: 'denver-metro',
    city: 'Lakewood',
    county: 'Jefferson County',
  },
  {
    zip: '80229',
    area: 'denver-metro',
    city: 'Thornton',
    county: 'Adams County',
  },
  {
    zip: '80230',
    area: 'denver-metro',
    city: 'Lowry afb',
    county: 'Denver County',
  },
  {zip: '80231', area: 'denver-metro', city: 'Denver', county: 'Denver County'},
  {
    zip: '80232',
    area: 'denver-metro',
    city: 'Lakewood',
    county: 'Jefferson County',
  },
  {
    zip: '80233',
    area: 'denver-metro',
    city: 'Northglenn',
    county: 'Adams County',
  },
  {
    zip: '80234',
    area: 'denver-metro',
    city: 'Northglenn',
    county: 'Adams County',
  },
  {
    zip: '80235',
    area: 'denver-metro',
    city: 'Denver',
    county: 'Jefferson County',
  },
  {zip: '80236', area: 'denver-metro', city: 'Denver', county: 'Denver County'},
  {zip: '80237', area: 'denver-metro', city: 'Denver', county: 'Denver County'},
  {zip: '80238', area: 'denver-metro', city: 'Denver', county: 'Denver County'},
  {zip: '80239', area: 'denver-metro', city: 'Denver', county: 'Denver County'},
  {
    zip: '80241',
    area: 'denver-metro',
    city: 'Northglenn',
    county: 'Adams County',
  },
  {
    zip: '80246',
    area: 'denver-metro',
    city: 'Zcta 80246',
    county: 'Denver County',
  },
  {zip: '80247', area: 'denver-metro', city: 'Denver', county: 'Denver County'},
  {zip: '80249', area: 'denver-metro', city: 'Denver', county: 'Denver County'},
  {
    zip: '80260',
    area: 'denver-metro',
    city: 'Zcta 80260',
    county: 'Adams County',
  },
  {
    zip: '80264',
    area: 'denver-metro',
    city: 'Lincoln center b',
    county: 'Denver County',
  },
  {zip: '80266', area: 'denver-metro', city: 'Denver', county: 'Denver County'},
  {
    zip: '80290',
    area: 'denver-metro',
    city: 'Two united bank',
    county: 'Denver County',
  },
  {
    zip: '80293',
    area: 'denver-metro',
    city: 'First interstate',
    county: 'Denver County',
  },
  {zip: '80294', area: 'denver-metro', city: 'Denver', county: 'Denver County'},
  {
    zip: '80401',
    area: 'denver-metro',
    city: 'Golden',
    county: 'Jefferson County',
  },
  {
    zip: '80403',
    area: 'denver-metro',
    city: 'Golden',
    county: 'Jefferson County',
  },
  {
    zip: '80419',
    area: 'denver-metro',
    city: 'Golden',
    county: 'Jefferson County',
  },
  {
    zip: '80425',
    area: 'denver-metro',
    city: 'Buffalo creek',
    county: 'Jefferson County',
  },
  {
    zip: '80433',
    area: 'denver-metro',
    city: 'Conifer',
    county: 'Jefferson County',
  },
  {
    zip: '80453',
    area: 'denver-metro',
    city: 'Idledale',
    county: 'Jefferson County',
  },
  {
    zip: '80454',
    area: 'denver-metro',
    city: 'Indian hills',
    county: 'Jefferson County',
  },
  {
    zip: '80457',
    area: 'denver-metro',
    city: 'Kittredge',
    county: 'Jefferson County',
  },
  {
    zip: '80465',
    area: 'denver-metro',
    city: 'Morrison',
    county: 'Jefferson County',
  },
  {
    zip: '80470',
    area: 'denver-metro',
    city: 'Pine',
    county: 'Jefferson County',
  },
  {zip: '80601', area: 'denver-metro', city: 'Lochbui', county: 'Adams County'},
  {
    zip: '80602',
    area: 'denver-metro',
    city: 'Brighton',
    county: 'Adams County',
  },
  {
    zip: '80603',
    area: 'denver-metro',
    city: 'Brighton',
    county: 'Adams County',
  },
  {
    zip: '80640',
    area: 'denver-metro',
    city: 'Henderson',
    county: 'Adams County',
  },
  {
    zip: '80808',
    area: 'colorado-springs',
    city: 'Calhan',
    county: 'El Paso County',
  },
  {
    zip: '80809',
    area: 'colorado-springs',
    city: 'North pole',
    county: 'El Paso County',
  },
  {
    zip: '80813',
    area: 'woodland-park',
    city: 'Cripple creek',
    county: 'Teller County',
  },
  {
    zip: '80814',
    area: 'woodland-park',
    city: 'Divide',
    county: 'Teller County',
  },
  {
    zip: '80816',
    area: 'woodland-park',
    city: 'Florissant',
    county: 'Teller County',
  },
  {
    zip: '80817',
    area: 'colorado-springs',
    city: 'Fountain',
    county: 'El Paso County',
  },
  {
    zip: '80819',
    area: 'colorado-springs',
    city: 'Green mountain f',
    county: 'El Paso County',
  },
  {
    zip: '80829',
    area: 'colorado-springs',
    city: 'Manitou springs',
    county: 'El Paso County',
  },
  {
    zip: '80831',
    area: 'colorado-springs',
    city: 'Peyton',
    county: 'El Paso County',
  },
  {
    zip: '80840',
    area: 'colorado-springs',
    city: 'United states ai',
    county: 'El Paso County',
  },
  {
    zip: '80841',
    area: 'colorado-springs',
    city: 'USAF Academy',
    county: 'El Paso County',
  },
  {
    zip: '80860',
    area: 'woodland-park',
    city: 'Victor',
    county: 'Teller County',
  },
  {
    zip: '80863',
    area: 'woodland-park',
    city: 'Woodland park',
    county: 'Teller County',
  },
  {
    zip: '80864',
    area: 'colorado-springs',
    city: 'Yoder',
    county: 'El Paso County',
  },
  {
    zip: '80866',
    area: 'woodland-park',
    city: 'Woodland Park',
    county: 'Teller County',
  },
  {
    zip: '80901',
    area: 'colorado-springs',
    city: 'Colorado Springs',
    county: 'El Paso County',
  },
  {
    zip: '80902',
    area: 'colorado-springs',
    city: 'Colorado Springs',
    county: 'El Paso County',
  },
  {
    zip: '80903',
    area: 'colorado-springs',
    city: 'Colorado springs',
    county: 'El Paso County',
  },
  {
    zip: '80904',
    area: 'colorado-springs',
    city: 'Colorado springs',
    county: 'El Paso County',
  },
  {
    zip: '80905',
    area: 'colorado-springs',
    city: 'Colorado springs',
    county: 'El Paso County',
  },
  {
    zip: '80906',
    area: 'colorado-springs',
    city: 'Colorado springs',
    county: 'El Paso County',
  },
  {
    zip: '80907',
    area: 'colorado-springs',
    city: 'Colorado springs',
    county: 'El Paso County',
  },
  {
    zip: '80908',
    area: 'colorado-springs',
    city: 'Colorado springs',
    county: 'El Paso County',
  },
  {
    zip: '80909',
    area: 'colorado-springs',
    city: 'Colorado springs',
    county: 'El Paso County',
  },
  {
    zip: '80910',
    area: 'colorado-springs',
    city: 'Colorado springs',
    county: 'El Paso County',
  },
  {
    zip: '80911',
    area: 'colorado-springs',
    city: 'Colorado springs',
    county: 'El Paso County',
  },
  {
    zip: '80912',
    area: 'colorado-springs',
    city: 'Colorado Springs (Schriever SFB)',
    county: 'El Paso County',
  },
  {
    zip: '80913',
    area: 'colorado-springs',
    city: 'Fort carson',
    county: 'El Paso County',
  },
  {
    zip: '80914',
    area: 'colorado-springs',
    city: 'Colorado Springs',
    county: 'El Paso County',
  },
  {
    zip: '80915',
    area: 'colorado-springs',
    city: 'Colorado springs',
    county: 'El Paso County',
  },
  {
    zip: '80916',
    area: 'colorado-springs',
    city: 'Colorado springs',
    county: 'El Paso County',
  },
  {
    zip: '80917',
    area: 'colorado-springs',
    city: 'Colorado springs',
    county: 'El Paso County',
  },
  {
    zip: '80918',
    area: 'colorado-springs',
    city: 'Colorado springs',
    county: 'El Paso County',
  },
  {
    zip: '80919',
    area: 'colorado-springs',
    city: 'Colorado springs',
    county: 'El Paso County',
  },
  {
    zip: '80920',
    area: 'colorado-springs',
    city: 'Colorado springs',
    county: 'El Paso County',
  },
  {
    zip: '80921',
    area: 'colorado-springs',
    city: 'Colorado springs',
    county: 'El Paso County',
  },
  {
    zip: '80922',
    area: 'colorado-springs',
    city: 'Colorado springs',
    county: 'El Paso County',
  },
  {
    zip: '80923',
    area: 'colorado-springs',
    city: 'Colorado Springs',
    county: 'El Paso County',
  },
  {
    zip: '80924',
    area: 'colorado-springs',
    city: 'Colorado Springs',
    county: 'El Paso County',
  },
  {
    zip: '80925',
    area: 'colorado-springs',
    city: 'Colorado springs',
    county: 'El Paso County',
  },
  {
    zip: '80926',
    area: 'colorado-springs',
    city: 'Colorado springs',
    county: 'El Paso County',
  },
  {
    zip: '80927',
    area: 'colorado-springs',
    city: 'Colorado Springs',
    county: 'El Paso County',
  },
  {
    zip: '80928',
    area: 'colorado-springs',
    city: 'Colorado springs',
    county: 'El Paso County',
  },
  {
    zip: '80929',
    area: 'colorado-springs',
    city: 'Colorado springs',
    county: 'El Paso County',
  },
  {
    zip: '80930',
    area: 'colorado-springs',
    city: 'Colorado springs',
    county: 'El Paso County',
  },
  {
    zip: '80931',
    area: 'colorado-springs',
    city: 'Colorado Springs',
    county: 'El Paso County',
  },
  {
    zip: '80932',
    area: 'colorado-springs',
    city: 'Colorado Springs',
    county: 'El Paso County',
  },
  {
    zip: '80933',
    area: 'colorado-springs',
    city: 'Colorado Springs',
    county: 'El Paso County',
  },
  {
    zip: '80934',
    area: 'colorado-springs',
    city: 'Colorado Springs',
    county: 'El Paso County',
  },
  {
    zip: '80935',
    area: 'colorado-springs',
    city: 'Colorado Springs',
    county: 'El Paso County',
  },
  {
    zip: '80936',
    area: 'colorado-springs',
    city: 'Colorado Springs',
    county: 'El Paso County',
  },
  {
    zip: '80937',
    area: 'colorado-springs',
    city: 'Colorado Springs',
    county: 'El Paso County',
  },
  {
    zip: '80938',
    area: 'colorado-springs',
    city: 'Colorado Springs',
    county: 'El Paso County',
  },
  {
    zip: '80939',
    area: 'colorado-springs',
    city: 'Colorado Springs',
    county: 'El Paso County',
  },
  {
    zip: '80941',
    area: 'colorado-springs',
    city: 'Colorado Springs',
    county: 'El Paso County',
  },
  {
    zip: '80942',
    area: 'colorado-springs',
    city: 'Colorado Springs',
    county: 'El Paso County',
  },
  {
    zip: '80946',
    area: 'colorado-springs',
    city: 'Colorado Springs',
    county: 'El Paso County',
  },
  {
    zip: '80947',
    area: 'colorado-springs',
    city: 'Colorado Springs',
    county: 'El Paso County',
  },
  {
    zip: '80949',
    area: 'colorado-springs',
    city: 'Colorado Springs',
    county: 'El Paso County',
  },
  {
    zip: '80950',
    area: 'colorado-springs',
    city: 'Colorado Springs',
    county: 'El Paso County',
  },
  {
    zip: '80951',
    area: 'colorado-springs',
    city: 'Colorado Springs',
    county: 'El Paso County',
  },
  {
    zip: '80960',
    area: 'colorado-springs',
    city: 'Colorado Springs',
    county: 'El Paso County',
  },
  {
    zip: '80962',
    area: 'colorado-springs',
    city: 'Colorado Springs',
    county: 'El Paso County',
  },
  {
    zip: '80970',
    area: 'colorado-springs',
    city: 'Colorado Springs',
    county: 'El Paso County',
  },
  {
    zip: '80977',
    area: 'colorado-springs',
    city: 'Colorado Springs',
    county: 'El Paso County',
  },
  {
    zip: '80995',
    area: 'colorado-springs',
    city: 'Colorado Springs',
    county: 'El Paso County',
  },
  {
    zip: '80997',
    area: 'colorado-springs',
    city: 'Colorado Springs',
    county: 'El Paso County',
  },
];

const ZIP_INDEX: ReadonlyMap<string, ServiceZip> = new Map(
  SERVICE_ZIPS.map((entry) => [entry.zip, entry]),
);

export function isValidZip(zip: string): boolean {
  return /^\d{5}$/.test(zip.trim());
}

export function findServiceZip(zip: string): ServiceZip | undefined {
  return ZIP_INDEX.get(zip.trim());
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
