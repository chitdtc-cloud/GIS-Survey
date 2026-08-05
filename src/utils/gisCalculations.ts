import { VillageSurvey, CellTower } from '../types';

/**
 * Calculate distance between two coordinates using Haversine formula (in kilometers)
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Calculate USO (Universal Service Obligation) Priority Score (0 - 100)
 * High score means urgent need for telecommunication infrastructure deployment.
 */
export function calculatePriorityScore(village: Partial<VillageSurvey>): number {
  let score = 0;

  // Signal status weight (max 35 pts)
  if (village.signalStatus === 'NO_SIGNAL') score += 35;
  else if (village.signalStatus === 'WEAK_2G') score += 25;
  else if (village.signalStatus === 'LIMITED_3G') score += 10;

  // Population weight (max 25 pts)
  const pop = village.population || 0;
  if (pop > 1000) score += 25;
  else if (pop > 500) score += 20;
  else if (pop > 250) score += 15;
  else if (pop > 100) score += 10;
  else score += 5;

  // Social Infrastructure Presence (max 20 pts)
  const schools = village.schools || 0;
  const health = village.healthCenters || 0;
  score += Math.min(schools * 6, 12);
  score += Math.min(health * 8, 8);

  // Isolation & Distance to Tower (max 12 pts)
  const dist = village.nearestTowerDistanceKm || 0;
  if (dist > 15) score += 12;
  else if (dist > 10) score += 9;
  else if (dist > 5) score += 5;

  // Road difficulty (max 8 pts)
  if (village.roadAccess === 'FOOTPATH_ONLY' || village.roadAccess === 'RIVER_ONLY') score += 8;
  else if (village.roadAccess === 'DIRT_SEASONAL') score += 5;

  return Math.min(Math.round(score), 100);
}

/**
 * Export survey list to GeoJSON format for GIS applications (QGIS, ArcGIS, Google Earth)
 */
export function exportToGeoJSON(villages: VillageSurvey[]): string {
  const geojson = {
    type: 'FeatureCollection',
    name: 'Lao_Villages_Telecom_Survey_GIS',
    crs: {
      type: 'name',
      properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' },
    },
    features: villages.map((v) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [v.lng, v.lat],
      },
      properties: {
        code: v.code,
        nameLao: v.nameLao,
        nameEng: v.nameEng,
        province: v.province,
        district: v.district,
        subdistrict: v.subdistrict || '',
        population: v.population,
        households: v.households,
        schools: v.schools,
        healthCenters: v.healthCenters,
        signalStatus: v.signalStatus,
        internetAccess: v.internetAccess,
        priorityScore: v.priorityScore,
        nearestTowerDistanceKm: v.nearestTowerDistanceKm,
        terrain: v.terrain,
        powerSource: v.powerSource,
        roadAccess: v.roadAccess,
        surveyDate: v.surveyDate,
        LTC_bars: v.carriers.LTC.bars,
        Unitel_bars: v.carriers.Unitel.bars,
        TPlus_bars: v.carriers.TPlus.bars,
        ETL_bars: v.carriers.ETL.bars,
      },
    })),
  };

  return JSON.stringify(geojson, null, 2);
}

/**
 * Export survey list to CSV format
 */
export function exportToCSV(villages: VillageSurvey[]): string {
  const headers = [
    'Code',
    'Name Lao',
    'Name Eng',
    'Province',
    'District',
    'Subdistrict',
    'Latitude',
    'Longitude',
    'Population',
    'Households',
    'Schools',
    'Health Centers',
    'Signal Status',
    'Internet Access',
    'Nearest Tower (km)',
    'Terrain',
    'Power Source',
    'Road Access',
    'Priority Score',
    'LTC Signal',
    'Unitel Signal',
    'TPlus Signal',
    'ETL Signal',
    'Survey Date',
  ];

  const rows = villages.map((v) => [
    `"${v.code}"`,
    `"${v.nameLao}"`,
    `"${v.nameEng}"`,
    `"${v.province}"`,
    `"${v.district}"`,
    `"${v.subdistrict || ''}"`,
    v.lat,
    v.lng,
    v.population,
    v.households,
    v.schools,
    v.healthCenters,
    `"${v.signalStatus}"`,
    `"${v.internetAccess}"`,
    v.nearestTowerDistanceKm,
    `"${v.terrain}"`,
    `"${v.powerSource}"`,
    `"${v.roadAccess}"`,
    v.priorityScore,
    `${v.carriers.LTC.bars} bars (${v.carriers.LTC.tech})`,
    `${v.carriers.Unitel.bars} bars (${v.carriers.Unitel.tech})`,
    `${v.carriers.TPlus.bars} bars (${v.carriers.TPlus.tech})`,
    `${v.carriers.ETL.bars} bars (${v.carriers.ETL.tech})`,
    `"${v.surveyDate}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Translate Signal Status to Lao description
 */
export function getSignalStatusLao(status: string): { label: string; color: string; badgeBg: string } {
  switch (status) {
    case 'NO_SIGNAL':
      return { label: 'ບໍ່ມີສັນຍານມືຖື ແລະ ອິນເຕີເນັດ (0 ຂີດ)', color: 'text-red-600', badgeBg: 'bg-red-100 text-red-800 border-red-300' };
    case 'WEAK_2G':
      return { label: '2G ອ່ອນ (1-2 ຂີດ)', color: 'text-orange-600', badgeBg: 'bg-orange-100 text-orange-800 border-orange-300' };
    case 'LIMITED_3G':
      return { label: '3G ຊ້າ (3-4 ຂີດ)', color: 'text-amber-600', badgeBg: 'bg-amber-100 text-amber-800 border-amber-300' };
    case 'GOOD_4G_5G':
      return { label: '4G/5G ສັນຍານດີ', color: 'text-emerald-600', badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    default:
      return { label: 'ບໍ່ມີຂໍ້ມູນ', color: 'text-gray-600', badgeBg: 'bg-gray-100 text-gray-800 border-gray-300' };
  }
}

export function getTerrainLao(terrain: string): string {
  switch (terrain) {
    case 'MOUNTAIN': return 'ພູດອຍສູງ (Mountainous)';
    case 'VALLEY': return 'ຮ່ອມພູ (Valley)';
    case 'DENSE_FOREST': return 'ປ່າດົງດົກ (Dense Forest)';
    case 'RIVER_ISLAND': return 'ດອນນ້ຳ/ເກາະ (River Island)';
    case 'FLATLAND': return 'ທົ່ງພຽງ (Flatland)';
    default: return terrain;
  }
}

export function getRoadLao(road: string): string {
  switch (road) {
    case 'ASPHALT': return 'ທາງປູຢາງ/ຄອນກຣີດ';
    case 'DIRT_SEASONAL': return 'ທາງແດງ/ທ່ຽວໄດ້ຕາມລະດູ';
    case 'FOOTPATH_ONLY': return 'ທາງຍ່າງເທົ່ານັ້ນ';
    case 'RIVER_ONLY': return 'ທາງນ້ຳ/ເຮືອເທົ່ານັ້ນ';
    default: return road;
  }
}

export function getPowerLao(power: string): string {
  switch (power) {
    case 'GRID': return 'ໄຟຟ້າຕາຂ່າຍ EDP';
    case 'SOLAR': return 'ໂຊລາເຊວ/ແສງອາທິດ';
    case 'MICRO_HYDRO': return 'ນ້ຳຕົກຂະໜາດນ້ອຍ';
    case 'DIESEL': return 'ຈັກປັ່ນໄຟກາຊວນ';
    case 'NONE': return 'ບໍ່ມີໄຟຟ້າ';
    default: return power;
  }
}
