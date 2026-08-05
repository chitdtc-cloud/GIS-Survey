export type SignalStatus = 'NO_SIGNAL' | 'WEAK_2G' | 'LIMITED_3G' | 'GOOD_4G_5G';

export type TerrainType = 'MOUNTAIN' | 'VALLEY' | 'DENSE_FOREST' | 'RIVER_ISLAND' | 'FLATLAND';

export type PowerSource = 'GRID' | 'SOLAR' | 'MICRO_HYDRO' | 'DIESEL' | 'NONE';

export type RoadAccess = 'ASPHALT' | 'DIRT_SEASONAL' | 'FOOTPATH_ONLY' | 'RIVER_ONLY';

export type InternetAccess = 'NONE' | 'SATELLITE' | 'FIBER_NEARBY' | 'FIXED_WIRELESS';

export interface CarrierSignal {
  bars: number; // 0 to 5
  tech: 'NONE' | '2G' | '3G' | '4G' | '5G';
}

export interface CarriersStatus {
  LTC: CarrierSignal;      // Lao Telecom
  Unitel: CarrierSignal;   // Unitel / Star Telecom
  TPlus: CarrierSignal;    // TPlus (Telecom 3)
  ETL: CarrierSignal;      // Enterprise Telecom Lao
}

export interface VillageSurvey {
  id: string;
  code: string; // e.g., LA-VT-014
  nameLao: string;
  nameEng: string;
  province: string;
  district: string;
  subdistrict: string; // ຕາແສງ / ກຸ່ມບ້ານ
  lat: number;
  lng: number;
  population: number;
  households: number;
  schools: number;
  healthCenters: number;
  ethnicGroups: string[];
  signalStatus: SignalStatus;
  internetAccess: InternetAccess;
  carriers: CarriersStatus;
  nearestTowerDistanceKm: number;
  nearestTowerName: string;
  terrain: TerrainType;
  powerSource: PowerSource;
  roadAccess: RoadAccess;
  surveyorName: string;
  surveyDate: string;
  priorityScore: number; // 0 - 100
  notes: string;
  photos: string[];
  isOfflineCreated?: boolean;
}

export interface CellTower {
  id: string;
  name: string;
  operator: 'LTC' | 'Unitel' | 'TPlus' | 'ETL' | 'Shared/USO' | 'Proposed';
  lat: number;
  lng: number;
  coverageRadiusKm: number;
  technology: '2G/3G' | '4G' | '5G';
  powerType: 'Grid' | 'Solar+Grid' | 'Diesel';
  isProposed?: boolean;
}

export interface SurveyFilter {
  province: string;
  district: string;
  signalStatus: string;
  minPriority: number;
  searchQuery: string;
  terrain: string;
}

export interface MapLayerConfig {
  showVillages: boolean;
  showTowers: boolean;
  showCoverageCircles: boolean;
  showHeatmap: boolean;
  mapType: 'streets' | 'satellite' | 'terrain';
}
