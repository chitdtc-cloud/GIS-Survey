import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { VillageSurvey, CellTower, MapLayerConfig } from '../types';
import { getSignalStatusLao, getTerrainLao, getPowerLao, calculateHaversineDistance } from '../utils/gisCalculations';
import { 
  Layers, 
  Search, 
  MapPin, 
  Radio, 
  SlidersHorizontal, 
  Maximize2, 
  Ruler, 
  Zap, 
  Building2, 
  PhoneCall, 
  Wifi,
  Eye,
  Plus
} from 'lucide-react';

interface GisMapProps {
  surveys: VillageSurvey[];
  towers: CellTower[];
  selectedVillage: VillageSurvey | null;
  onSelectVillage: (village: VillageSurvey) => void;
  onNewSurveyFromMap?: (lat: number, lng: number) => void;
  onPlaceProposedTower?: (lat: number, lng: number) => void;
  isPlacingTowerMode?: boolean;
  proposedTowerRadiusKm?: number;
  lang: 'la' | 'en';
}

// Custom Leaflet Icons Generator
const createVillageIcon = (status: string, priorityScore: number, isSelected: boolean) => {
  let color = '#ef4444'; // Red for NO_SIGNAL
  if (status === 'WEAK_2G') color = '#f97316'; // Orange
  else if (status === 'LIMITED_3G') color = '#f59e0b'; // Amber
  else if (status === 'GOOD_4G_5G') color = '#10b981'; // Green

  const borderStyle = isSelected ? 'border-4 border-yellow-300 ring-4 ring-yellow-400/50' : 'border-2 border-white shadow-md';
  const pulseClass = status === 'NO_SIGNAL' && priorityScore >= 80 ? 'animate-bounce' : '';

  const html = `
    <div class="relative flex items-center justify-center ${pulseClass}">
      <div style="background-color: ${color};" class="w-7 h-7 rounded-full flex items-center justify-center text-white ${borderStyle}">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      </div>
      ${priorityScore >= 85 ? `<span class="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border border-white animate-ping"></span>` : ''}
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-village-icon',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

const createTowerIcon = (operator: string, isProposed = false) => {
  let bgColor = '#3b82f6'; // Blue
  if (operator === 'Unitel') bgColor = '#0284c7';
  if (operator === 'LTC') bgColor = '#dc2626';
  if (operator === 'ETL') bgColor = '#16a34a';
  if (operator === 'TPlus') bgColor = '#d97706';
  if (isProposed) bgColor = '#8b5cf6'; // Purple for proposed

  const html = `
    <div class="relative flex items-center justify-center">
      <div style="background-color: ${bgColor};" class="w-8 h-8 rounded-full flex items-center justify-center text-white border-2 border-white shadow-lg ${isProposed ? 'ring-4 ring-purple-400 animate-pulse' : ''}">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/>
          <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/>
          <circle cx="12" cy="12" r="2"/>
          <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/>
          <path d="M19.1 4.9c3.9 3.9 3.9 10.3 0 14.2"/>
        </svg>
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-tower-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

// Component to handle map clicks for measuring or adding surveys
function MapClickHandler({ 
  onMapClick, 
  isPlacingTowerMode 
}: { 
  onMapClick: (lat: number, lng: number) => void; 
  isPlacingTowerMode?: boolean;
}) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Controller to smoothly center map on selected village
function MapFlyTo({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 12, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

export const GisMap: React.FC<GisMapProps> = ({
  surveys,
  towers,
  selectedVillage,
  onSelectVillage,
  onNewSurveyFromMap,
  onPlaceProposedTower,
  isPlacingTowerMode,
  proposedTowerRadiusKm = 5,
  lang
}) => {
  // Map Layer Config
  const [layers, setLayers] = useState<MapLayerConfig>({
    showVillages: true,
    showTowers: true,
    showCoverageCircles: true,
    showHeatmap: false,
    mapType: 'streets',
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSignal, setFilterSignal] = useState<string>('ALL');
  const [filterProvince, setFilterProvince] = useState<string>('ALL');

  // Measure Distance Tool state
  const [measureMode, setMeasureMode] = useState(false);
  const [measurePoints, setMeasurePoints] = useState<[number, number][]>([]);

  // Filtered villages
  const filteredVillages = surveys.filter((v) => {
    const matchesSearch =
      v.nameLao.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.nameEng.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.subdistrict && v.subdistrict.toLowerCase().includes(searchQuery.toLowerCase())) ||
      v.province.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSignal = filterSignal === 'ALL' || v.signalStatus === filterSignal;
    const matchesProvince = filterProvince === 'ALL' || v.province.includes(filterProvince);

    return matchesSearch && matchesSignal && matchesProvince;
  });

  // Handle map click
  const handleMapClick = (lat: number, lng: number) => {
    if (isPlacingTowerMode && onPlaceProposedTower) {
      onPlaceProposedTower(lat, lng);
      return;
    }

    if (measureMode) {
      setMeasurePoints((prev) => [...prev, [lat, lng]]);
      return;
    }
  };

  // Center of Laos default
  const defaultCenter: [number, number] = selectedVillage
    ? [selectedVillage.lat, selectedVillage.lng]
    : [18.2, 102.6]; // Vientiane / Central Laos area

  // Tile Layer URLs
  const tileUrls = {
    streets: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    terrain: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
  };

  const measureDistanceTotal = measurePoints.length > 1
    ? calculateHaversineDistance(
        measurePoints[0][0],
        measurePoints[0][1],
        measurePoints[measurePoints.length - 1][0],
        measurePoints[measurePoints.length - 1][1]
      )
    : 0;

  return (
    <div className="relative w-full h-[calc(100vh-8rem)] bg-slate-900 overflow-hidden flex flex-col md:flex-row">
      
      {/* Floating Control & Filter Panel (Left Sidebar / Overlay) */}
      <div className="w-full md:w-80 bg-slate-900/95 backdrop-blur-md border-r border-slate-800 p-4 z-[999] flex flex-col gap-4 max-h-full overflow-y-auto">
        
        {/* Search */}
        <div>
          <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-red-400" />
            <span>{lang === 'la' ? 'ຄົ້ນຫາບ້ານ, ຕາແສງ ຫຼື ເມືອງ' : 'Search Village or District'}</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'la' ? 'ພິມຊື່ບ້ານ, ຕາແສງ...' : 'Search...'}
              className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-400 text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        {/* Signal Status Filter */}
        <div>
          <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'la' ? 'ກັ່ນກອງຕາມສັນຍານ' : 'Signal Filter'}</span>
          </label>
          <select
            value={filterSignal}
            onChange={(e) => setFilterSignal(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="ALL">{lang === 'la' ? 'ທຸກສະຖານະ (All Status)' : 'All Status'}</option>
            <option value="NO_SIGNAL">{lang === 'la' ? '🔴 ບໍ່ມີສັນຍານ (0 ຂີດ)' : 'Red: No Signal'}</option>
            <option value="WEAK_2G">{lang === 'la' ? '🟠 2G ອ່ອນ (1-2 bars)' : 'Orange: Weak 2G'}</option>
            <option value="LIMITED_3G">{lang === 'la' ? '🟡 3G ຊ້າ (3-4 bars)' : 'Yellow: Limited 3G'}</option>
            <option value="GOOD_4G_5G">{lang === 'la' ? '🟢 4G/5G ສັນຍານດີ' : 'Green: Good 4G/5G'}</option>
          </select>
        </div>

        {/* GIS Layer Toggles */}
        <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/80 space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-400" />
              {lang === 'la' ? 'ຊັ້ນຂໍ້ມູນ GIS Map' : 'GIS Map Layers'}
            </span>
          </div>

          <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
            <span className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-red-400" />
              {lang === 'la' ? 'ສະແດງບ້ານສຳຫລວດ' : 'Show Villages'}
            </span>
            <input
              type="checkbox"
              checked={layers.showVillages}
              onChange={(e) => setLayers({ ...layers, showVillages: e.target.checked })}
              className="rounded accent-red-600"
            />
          </label>

          <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
            <span className="flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-blue-400" />
              {lang === 'la' ? 'ສະແດງເສົາສັນຍານ (BTS)' : 'Show Cell Towers'}
            </span>
            <input
              type="checkbox"
              checked={layers.showTowers}
              onChange={(e) => setLayers({ ...layers, showTowers: e.target.checked })}
              className="rounded accent-blue-600"
            />
          </label>

          <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
            <span className="flex items-center gap-2">
              <Wifi className="w-3.5 h-3.5 text-cyan-400" />
              {lang === 'la' ? 'ລັດສະໝີຄວບຄຸມ (Radius)' : 'Tower Coverage Radius'}
            </span>
            <input
              type="checkbox"
              checked={layers.showCoverageCircles}
              onChange={(e) => setLayers({ ...layers, showCoverageCircles: e.target.checked })}
              className="rounded accent-cyan-600"
            />
          </label>

          {/* Map Base Tile Switcher */}
          <div className="pt-2 border-t border-slate-700/80">
            <span className="text-[11px] font-medium text-slate-400 block mb-1.5">
              {lang === 'la' ? 'ປະເພດແຜນທີ່ພື້ນຫຼັງ:' : 'Map Base Type:'}
            </span>
            <div className="grid grid-cols-3 gap-1">
              {(['streets', 'satellite', 'terrain'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setLayers({ ...layers, mapType: type })}
                  className={`py-1 text-[10px] rounded font-medium capitalize transition-all ${
                    layers.mapType === type
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Measure Distance Tool */}
        <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Ruler className="w-4 h-4 text-emerald-400" />
              {lang === 'la' ? 'ເຄື່ອງມືວັດແທກໄລຍະທາງ' : 'Distance Ruler'}
            </span>
            <button
              onClick={() => {
                setMeasureMode(!measureMode);
                if (measureMode) setMeasurePoints([]);
              }}
              className={`px-2 py-0.5 text-[10px] rounded font-bold transition-colors ${
                measureMode ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'
              }`}
            >
              {measureMode ? (lang === 'la' ? 'ກຳລັງວັດແທກ (Active)' : 'Active') : (lang === 'la' ? 'ເປີດວັດແທກ' : 'Enable')}
            </button>
          </div>
          {measureMode && (
            <div className="text-[11px] text-slate-300 space-y-1 bg-slate-900/60 p-2 rounded-lg">
              <p>{lang === 'la' ? 'ກົດເທິງແຜນທີ່ 2 ຈຸດເພື່ອວັດແທກ' : 'Click 2 points on map'}</p>
              {measurePoints.length > 0 && (
                <div className="flex justify-between items-center text-emerald-400 font-bold pt-1 border-t border-slate-700">
                  <span>{lang === 'la' ? 'ໄລຍະທາງ:' : 'Distance:'}</span>
                  <span>{measureDistanceTotal} km</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Legend */}
        <div className="mt-auto bg-slate-800/40 rounded-xl p-3 border border-slate-700/60 space-y-1.5 text-[11px]">
          <span className="font-semibold text-slate-300 block mb-1">
            {lang === 'la' ? 'ສັນຍາລັກ (Legend):' : 'Map Legend:'}
          </span>
          <div className="flex items-center gap-2 text-red-300">
            <span className="w-3 h-3 rounded-full bg-red-500 border border-white" />
            <span>{lang === 'la' ? '🔴 ບໍ່ມີສັນຍານ (0 ຂີດ)' : 'No Signal (0 bars)'}</span>
          </div>
          <div className="flex items-center gap-2 text-orange-300">
            <span className="w-3 h-3 rounded-full bg-orange-500 border border-white" />
            <span>{lang === 'la' ? '🟠 2G ອ່ອນ (1-2 ຂີດ)' : 'Weak 2G Signal'}</span>
          </div>
          <div className="flex items-center gap-2 text-amber-300">
            <span className="w-3 h-3 rounded-full bg-amber-500 border border-white" />
            <span>{lang === 'la' ? '🟡 3G (3-4 ຂີດ)' : 'Limited 3G'}</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-300">
            <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white" />
            <span>{lang === 'la' ? '🟢 4G/5G ສັນຍານດີ' : 'Good 4G/5G'}</span>
          </div>
          <div className="flex items-center gap-2 text-blue-300 pt-1 border-t border-slate-700">
            <span className="w-3.5 h-3.5 rounded-full bg-blue-500 border border-white flex items-center justify-center text-[8px] font-bold text-white">T</span>
            <span>{lang === 'la' ? '📡 ເສົາສັນຍານ BTS' : 'Cellular Tower'}</span>
          </div>
        </div>

      </div>

      {/* Main Map Canvas */}
      <div className="flex-1 h-full relative">
        
        {/* Tower placement overlay prompt if in tower placement mode */}
        {isPlacingTowerMode && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-indigo-900/90 border border-indigo-500 text-white px-4 py-2 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-3 animate-pulse">
            <Radio className="w-5 h-5 text-indigo-300 animate-spin" />
            <span className="text-xs font-semibold">
              {lang === 'la' ? 'ກົດໃສ່ແຜນທີ່ເພື່ອວາງຈຸດ ເສົາ BTS ໃໝ່ (ຊື່ງມີລັດສະໝີ ' + proposedTowerRadiusKm + ' km)' : 'Click map to place proposed BTS Tower (Radius ' + proposedTowerRadiusKm + ' km)'}
            </span>
          </div>
        )}

        <MapContainer
          center={defaultCenter}
          zoom={8}
          scrollWheelZoom={true}
          className="w-full h-full z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url={tileUrls[layers.mapType]}
          />

          <MapFlyTo center={selectedVillage ? [selectedVillage.lat, selectedVillage.lng] : null} />
          <MapClickHandler onMapClick={handleMapClick} isPlacingTowerMode={isPlacingTowerMode} />

          {/* Render Cell Towers */}
          {layers.showTowers &&
            towers.map((tower) => (
              <React.Fragment key={tower.id}>
                <Marker
                  position={[tower.lat, tower.lng]}
                  icon={createTowerIcon(tower.operator, tower.isProposed)}
                >
                  <Popup className="custom-popup">
                    <div className="p-2 space-y-1.5 min-w-[200px]">
                      <div className="flex items-center justify-between border-b pb-1">
                        <span className="font-bold text-slate-900 text-sm">{tower.name}</span>
                        <span className={`px-1.5 py-0.5 text-[10px] rounded font-bold ${tower.isProposed ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                          {tower.operator}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 space-y-1">
                        <p><strong>{lang === 'la' ? 'ເຕັກໂນໂລຊີ:' : 'Tech:'}</strong> {tower.technology}</p>
                        <p><strong>{lang === 'la' ? 'ລັດສະໝີ:' : 'Radius:'}</strong> {tower.coverageRadiusKm} km</p>
                        <p><strong>{lang === 'la' ? 'ແຫຼ່ງໄຟຟ້າ:' : 'Power:'}</strong> {tower.powerType}</p>
                        <p className="text-[10px] text-slate-400 font-mono">GPS: {tower.lat.toFixed(3)}, {tower.lng.toFixed(3)}</p>
                      </div>
                    </div>
                  </Popup>
                </Marker>

                {/* Tower Coverage Circle */}
                {layers.showCoverageCircles && (
                  <Circle
                    center={[tower.lat, tower.lng]}
                    radius={tower.coverageRadiusKm * 1000}
                    pathOptions={{
                      color: tower.isProposed ? '#a855f7' : '#3b82f6',
                      fillColor: tower.isProposed ? '#c084fc' : '#60a5fa',
                      fillOpacity: tower.isProposed ? 0.25 : 0.12,
                      dashArray: tower.isProposed ? '6, 6' : undefined,
                      weight: 1.5,
                    }}
                  />
                )}
              </React.Fragment>
            ))}

          {/* Render Village Survey Markers */}
          {layers.showVillages &&
            filteredVillages.map((village) => {
              const statusInfo = getSignalStatusLao(village.signalStatus);
              const isSelected = selectedVillage?.id === village.id;

              return (
                <Marker
                  key={village.id}
                  position={[village.lat, village.lng]}
                  icon={createVillageIcon(village.signalStatus, village.priorityScore, isSelected)}
                  eventHandlers={{
                    click: () => onSelectVillage(village),
                  }}
                >
                  <Popup className="custom-popup">
                    <div className="p-2 space-y-2 min-w-[220px]">
                      <div className="border-b border-slate-200 pb-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-slate-900 text-base">{village.nameLao}</h3>
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${statusInfo.badgeBg}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium mt-0.5">ບ້ານ {village.nameLao} ({village.nameEng}) • {village.subdistrict ? `${village.subdistrict}, ` : ''}ເມືອງ {village.district}, ແຂວງ {village.province}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
                          <span className="text-[10px] text-slate-500 block">{lang === 'la' ? 'ປະຊາກອນ' : 'Pop.'}</span>
                          <span className="font-bold text-slate-800">{village.population} {lang === 'la' ? 'ຄົນ' : ''} ({village.households} ຫຼັງ)</span>
                        </div>
                        <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
                          <span className="text-[10px] text-slate-500 block">{lang === 'la' ? 'ຄະແນນດ່ວນ USO' : 'USO Priority'}</span>
                          <span className={`font-bold ${village.priorityScore >= 80 ? 'text-rose-600' : 'text-slate-800'}`}>
                            {village.priorityScore}/100
                          </span>
                        </div>
                      </div>

                      {/* Carrier Signal Grid */}
                      <div className="bg-slate-100 p-2 rounded-lg text-xs space-y-1">
                        <span className="text-[10px] font-semibold text-slate-600 block">{lang === 'la' ? 'ສັນຍານຄ່າຍໂທລະສັບ:' : 'Carriers:'}</span>
                        <div className="grid grid-cols-2 gap-1 text-[11px]">
                          <div>LTC: <strong className="text-slate-800">{village.carriers.LTC.bars}⭐ ({village.carriers.LTC.tech})</strong></div>
                          <div>Unitel: <strong className="text-slate-800">{village.carriers.Unitel.bars}⭐ ({village.carriers.Unitel.tech})</strong></div>
                          <div>TPlus: <strong className="text-slate-800">{village.carriers.TPlus.bars}⭐ ({village.carriers.TPlus.tech})</strong></div>
                          <div>ETL: <strong className="text-slate-800">{village.carriers.ETL.bars}⭐ ({village.carriers.ETL.tech})</strong></div>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-600 space-y-0.5">
                        <p><strong>{lang === 'la' ? 'ເສົາໃກ້ສຸດ:' : 'Closest Tower:'}</strong> {village.nearestTowerName} ({village.nearestTowerDistanceKm} km)</p>
                        <p><strong>{lang === 'la' ? 'ໂຮງຮຽນ/ສຸກສາລາ:' : 'Schools/Clinics:'}</strong> {village.schools} ໂຮງຮຽນ / {village.healthCenters} ສຸກສາລາ</p>
                      </div>

                      <button
                        onClick={() => onSelectVillage(village)}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        {lang === 'la' ? 'ເບິ່ງລາຍລະອຽດເຕັມ' : 'View Full Dossier'}
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

          {/* Render Measure Distance Polyline */}
          {measurePoints.length > 1 && (
            <Polyline
              positions={measurePoints}
              pathOptions={{ color: '#10b981', weight: 4, dashArray: '8, 8' }}
            />
          )}
        </MapContainer>

        {/* Geometric Balance GPS Information Card Overlay */}
        <div className="absolute bottom-4 left-4 right-4 z-[998] pointer-events-none">
          <div className="bg-slate-900/90 backdrop-blur-md p-4 rounded-xl shadow-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-white pointer-events-auto max-w-5xl mx-auto">
            <div className="border-b sm:border-b-0 sm:border-r border-slate-800 pb-2 sm:pb-0 pr-4">
              <h3 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-1">GPS Coordinates</h3>
              <p className="font-mono text-xs font-bold text-slate-100">
                {selectedVillage ? `${selectedVillage.lat.toFixed(4)}° N, ${selectedVillage.lng.toFixed(4)}° E` : '18.1925° N, 102.6328° E'}
              </p>
              <p className="text-[10px] text-indigo-400 mt-1 uppercase font-bold italic tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping"></span>
                GPS Active (High Precision)
              </p>
            </div>

            <div className="border-b sm:border-b-0 lg:border-r border-slate-800 pb-2 sm:pb-0 pr-4">
              <h3 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-1">Target Village</h3>
              <p className="font-bold text-xs text-white truncate">
                {selectedVillage ? selectedVillage.nameLao : (lang === 'la' ? 'ເລືອກບ້ານເທິງແຜນທີ່' : 'Select a village')}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                {selectedVillage ? `ບ້ານ ${selectedVillage.nameLao}, ${selectedVillage.subdistrict ? selectedVillage.subdistrict + ', ' : ''}ເມືອງ ${selectedVillage.district}, ແຂວງ ${selectedVillage.province}` : 'Lao PDR GIS Network'}
              </p>
            </div>

            <div className="border-b sm:border-b-0 sm:border-r border-slate-800 pb-2 sm:pb-0 pr-4">
              <h3 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-1">Signal Status</h3>
              <p className="text-xs font-bold uppercase tracking-wider text-rose-400">
                {selectedVillage ? getSignalStatusLao(selectedVillage.signalStatus).label : 'Survey Active'}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                {selectedVillage ? `USO Priority: ${selectedVillage.priorityScore}/100` : `${surveys.length} total surveyed villages`}
              </p>
            </div>

            <div className="flex flex-col justify-center">
              <button
                onClick={() => {
                  if (selectedVillage) {
                    onSelectVillage(selectedVillage);
                  }
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2 px-4 rounded uppercase tracking-widest shadow transition-colors"
              >
                {lang === 'la' ? 'ບັນທຶກຂໍ້ມູນພື້ນທີ່' : 'Record GIS Log'}
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
