import React, { useState } from 'react';
import { VillageSurvey, SignalStatus, TerrainType, PowerSource, RoadAccess, InternetAccess } from '../types';
import { calculatePriorityScore } from '../utils/gisCalculations';
import { LAO_PROVINCES } from '../data/mockSurveys';
import { 
  PlusCircle, 
  MapPin, 
  WifiOff, 
  Camera, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  Radio, 
  School, 
  Stethoscope, 
  Users, 
  Zap, 
  Compass,
  AlertCircle
} from 'lucide-react';

interface SurveyFormProps {
  onAddSurvey: (survey: VillageSurvey) => void;
  lang: 'la' | 'en';
}

export const SurveyForm: React.FC<SurveyFormProps> = ({ onAddSurvey, lang }) => {
  const [nameLao, setNameLao] = useState('');
  const [nameEng, setNameEng] = useState('');
  const [province, setProvince] = useState(LAO_PROVINCES[1]);
  const [district, setDistrict] = useState('');
  const [subdistrict, setSubdistrict] = useState('');
  const [lat, setLat] = useState<number>(18.5);
  const [lng, setLng] = useState<number>(102.4);
  const [population, setPopulation] = useState<number>(350);
  const [households, setHouseholds] = useState<number>(60);
  const [schools, setSchools] = useState<number>(1);
  const [healthCenters, setHealthCenters] = useState<number>(0);
  const [signalStatus, setSignalStatus] = useState<SignalStatus>('NO_SIGNAL');
  const [internetAccess, setInternetAccess] = useState<InternetAccess>('NONE');

  // Carriers
  const [ltcBars, setLtcBars] = useState<number>(0);
  const [unitelBars, setUnitelBars] = useState<number>(0);
  const [tplusBars, setTplusBars] = useState<number>(0);
  const [etlBars, setEtlBars] = useState<number>(0);

  // Infra
  const [terrain, setTerrain] = useState<TerrainType>('MOUNTAIN');
  const [powerSource, setPowerSource] = useState<PowerSource>('SOLAR');
  const [roadAccess, setRoadAccess] = useState<RoadAccess>('DIRT_SEASONAL');
  const [nearestTowerDistanceKm, setNearestTowerDistanceKm] = useState<number>(14.5);
  const [nearestTowerName, setNearestTowerName] = useState('ເສົາ LTC ໂພນໂຮງ 01');
  const [surveyorName, setSurveyorName] = useState('');
  const [notes, setNotes] = useState('');
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Detect Live GPS Location
  const handleGetLiveGps = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(Number(position.coords.latitude.toFixed(5)));
          setLng(Number(position.coords.longitude.toFixed(5)));
        },
        (error) => {
          alert(lang === 'la' ? 'ບໍ່ສາມາດດຶງ GPS ໄດ້: ' + error.message : 'GPS location error: ' + error.message);
        }
      );
    } else {
      alert(lang === 'la' ? 'ບຣາວເຊີບໍ່ຮອງຮັບ GPS' : 'Browser does not support Geolocation');
    }
  };

  const handleAddPhoto = () => {
    if (photoUrlInput.trim()) {
      setPhotos([...photos, photoUrlInput.trim()]);
      setPhotoUrlInput('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameLao || !district || !surveyorName) {
      alert(lang === 'la' ? 'ກະລຸນາປ້ອນຂໍ້ມູນ: ຊື່ບ້ານ, ເມືອງ, ແລະ ຊື່ຜູ້ສຳຫລວດ' : 'Please fill required fields: Village, District, Surveyor Name');
      return;
    }

    const partialSurvey: Partial<VillageSurvey> = {
      population,
      schools,
      healthCenters,
      signalStatus,
      nearestTowerDistanceKm,
      roadAccess,
    };
    const calculatedScore = calculatePriorityScore(partialSurvey);

    const newSurvey: VillageSurvey = {
      id: `VIL-${Date.now().toString().slice(-4)}`,
      code: `LA-${province.slice(0, 2).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      nameLao,
      nameEng: nameEng || nameLao,
      province,
      district,
      subdistrict: subdistrict || (lang === 'la' ? `ຕາແສງ ${district}` : `Subdistrict ${district}`),
      lat,
      lng,
      population,
      households,
      schools,
      healthCenters,
      ethnicGroups: ['Lao'],
      signalStatus,
      internetAccess,
      carriers: {
        LTC: { bars: ltcBars, tech: ltcBars === 0 ? 'NONE' : ltcBars >= 3 ? '4G' : '2G' },
        Unitel: { bars: unitelBars, tech: unitelBars === 0 ? 'NONE' : unitelBars >= 3 ? '4G' : '2G' },
        TPlus: { bars: tplusBars, tech: tplusBars === 0 ? 'NONE' : tplusBars >= 3 ? '3G' : '2G' },
        ETL: { bars: etlBars, tech: etlBars === 0 ? 'NONE' : etlBars >= 3 ? '3G' : '2G' },
      },
      nearestTowerDistanceKm,
      nearestTowerName,
      terrain,
      powerSource,
      roadAccess,
      surveyorName,
      surveyDate: new Date().toISOString().slice(0, 10),
      priorityScore: calculatedScore,
      notes,
      photos,
    };

    onAddSurvey(newSurvey);
    setSuccessMessage(lang === 'la' ? `ບັນທຶກບ້ານ "${nameLao}" ສຳເລັດ! (ຄະແນນດ່ວນ USO: ${calculatedScore}/100)` : `Saved "${nameLao}" successfully!`);

    // Reset Form
    setNameLao('');
    setNameEng('');
    setDistrict('');
    setSubdistrict('');
    setNotes('');
    setPhotos([]);

    setTimeout(() => setSuccessMessage(null), 4000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <PlusCircle className="w-6 h-6 text-rose-500" />
              {lang === 'la' ? 'ຟອມບັນທຶກການສຳຫລວດບ້ານບໍ່ມີສັນຍານມືຖື ແລະ ອິນເຕີເນັດດ້ວຍ ລະບົບ GIS' : 'New Village Mobile Signal Survey Log'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {lang === 'la'
                ? 'ລົງເກັບຂໍ້ມູນພື້ນທີ່ບ້ານ, ສັນຍານມືຖື 4 ເຄືອຂ່າຍ, ໂຄງຮ່າງລວມ ແລະ ພູມສັນຖານ GIS'
                : 'Record field survey parameters, 4 mobile carriers, infrastructure & GIS coordinates'}
            </p>
          </div>
        </div>

        {successMessage && (
          <div className="bg-emerald-950/80 border border-emerald-500 text-emerald-200 px-4 py-3 rounded-xl text-xs flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold">{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1: Basic Location */}
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/80 space-y-4">
            <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {lang === 'la' ? '1. ຂໍ້ມູນບ້ານ ແລະ ຕຳແໜ່ງ GIS Coordinate' : '1. Location & GIS Coordinates'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  {lang === 'la' ? 'ຊື່ບ້ານ (ພາສາລາວ) *' : 'Village Name (Lao) *'}
                </label>
                <input
                  type="text"
                  required
                  value={nameLao}
                  onChange={(e) => setNameLao(e.target.value)}
                  placeholder="ບ້ານ..."
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  {lang === 'la' ? 'ຊື່ບ້ານ (ພາສາອັງກິດ)' : 'Village Name (English)'}
                </label>
                <input
                  type="text"
                  value={nameEng}
                  onChange={(e) => setNameEng(e.target.value)}
                  placeholder="Ban..."
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  {lang === 'la' ? 'ຕາແສງ / ກຸ່ມບ້ານ' : 'Subdistrict / Kumban'}
                </label>
                <input
                  type="text"
                  value={subdistrict}
                  onChange={(e) => setSubdistrict(e.target.value)}
                  placeholder={lang === 'la' ? 'ຕາແສງ...' : 'Subdistrict...'}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  {lang === 'la' ? 'ເມືອງ *' : 'District *'}
                </label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="ເມືອງ..."
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-slate-300 font-medium block mb-1">
                  {lang === 'la' ? 'ແຂວງ *' : 'Province *'}
                </label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-red-500"
                >
                  {LAO_PROVINCES.slice(1).map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* GPS Lat/Lng & Live Button */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="text-slate-300 text-[11px] font-medium block mb-1">
                  Latitude (ເສັ້ນຂະໜານ)
                </label>
                <input
                  type="number"
                  step="0.00001"
                  value={lat}
                  onChange={(e) => setLat(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 text-[11px] font-medium block mb-1">
                  Longitude (ເສັ້ນແວງ)
                </label>
                <input
                  type="number"
                  step="0.00001"
                  value={lng}
                  onChange={(e) => setLng(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-xs font-mono"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleGetLiveGps}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors shadow"
                >
                  <Compass className="w-4 h-4 text-indigo-200" />
                  <span>{lang === 'la' ? 'ດຶງ GPS ຕຳແໜ່ງປັດຈຸບັນ' : 'Get Current GPS'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Mobile Carrier Signal Survey */}
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/80 space-y-4">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Radio className="w-4 h-4" />
              {lang === 'la' ? '2. ສຳຫລວດສັນຍານມືຖື 4 ເຄືອຂ່າຍ (LTC, Unitel, TPlus, ETL)' : '2. Mobile Signal Test (0 to 5 bars)'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              
              {/* LTC */}
              <div className="bg-slate-900/80 p-3 rounded-lg border border-red-900/40">
                <span className="font-bold text-red-400 block mb-1">LTC (ລາວໂທລະຄົມ)</span>
                <select
                  value={ltcBars}
                  onChange={(e) => setLtcBars(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded px-2 py-1 text-xs"
                >
                  <option value={0}>0 ຂີດ (ບໍ່ມີສັນຍານ)</option>
                  <option value={1}>1 ຂີດ (2G ອ່ອນ)</option>
                  <option value={2}>2 ຂີດ (2G)</option>
                  <option value={3}>3 ຂີດ (3G)</option>
                  <option value={4}>4 ຂີດ (4G)</option>
                  <option value={5}>5 ຂີດ (5G ສັນຍານເຕັມ)</option>
                </select>
              </div>

              {/* Unitel */}
              <div className="bg-slate-900/80 p-3 rounded-lg border border-sky-900/40">
                <span className="font-bold text-sky-400 block mb-1">Unitel (ຢູນີເທວ)</span>
                <select
                  value={unitelBars}
                  onChange={(e) => setUnitelBars(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded px-2 py-1 text-xs"
                >
                  <option value={0}>0 ຂີດ (ບໍ່ມີສັນຍານ)</option>
                  <option value={1}>1 ຂີດ (2G ອ່ອນ)</option>
                  <option value={2}>2 ຂີດ (2G)</option>
                  <option value={3}>3 ຂີດ (3G)</option>
                  <option value={4}>4 ຂີດ (4G)</option>
                  <option value={5}>5 ຂີດ (5G ສັນຍານເຕັມ)</option>
                </select>
              </div>

              {/* TPlus */}
              <div className="bg-slate-900/80 p-3 rounded-lg border border-amber-900/40">
                <span className="font-bold text-amber-400 block mb-1">TPlus (ທີພັສ)</span>
                <select
                  value={tplusBars}
                  onChange={(e) => setTplusBars(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded px-2 py-1 text-xs"
                >
                  <option value={0}>0 ຂີດ (ບໍ່ມີສັນຍານ)</option>
                  <option value={1}>1 ຂີດ (2G ອ່ອນ)</option>
                  <option value={2}>2 ຂີດ (2G)</option>
                  <option value={3}>3 ຂີດ (3G)</option>
                  <option value={4}>4 ຂີດ (4G)</option>
                </select>
              </div>

              {/* ETL */}
              <div className="bg-slate-900/80 p-3 rounded-lg border border-emerald-900/40">
                <span className="font-bold text-emerald-400 block mb-1">ETL (ອີທີແອນ)</span>
                <select
                  value={etlBars}
                  onChange={(e) => setEtlBars(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded px-2 py-1 text-xs"
                >
                  <option value={0}>0 ຂີດ (ບໍ່ມີສັນຍານ)</option>
                  <option value={1}>1 ຂີດ (2G ອ່ອນ)</option>
                  <option value={2}>2 ຂີດ (2G)</option>
                  <option value={3}>3 ຂີດ (3G)</option>
                  <option value={4}>4 ຂີດ (4G)</option>
                </select>
              </div>

            </div>

            {/* Overall Signal Classification & Internet */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  {lang === 'la' ? 'ສະຖານະສັນຍານລວມຂອງບ້ານ:' : 'Overall Village Coverage Status:'}
                </label>
                <select
                  value={signalStatus}
                  onChange={(e) => setSignalStatus(e.target.value as SignalStatus)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-red-500"
                >
                  <option value="NO_SIGNAL">🔴 ບໍ່ມີສັນຍານມືຖື ແລະ ອິນເຕີເນັດ (Dead Zone Complete)</option>
                  <option value="WEAK_2G">🟠 ມີສັນຍານ 2G ອ່ອນໆ (Voice Call Only)</option>
                  <option value="LIMITED_3G">🟡 ມີສັນຍານ 3G (Internet slow)</option>
                  <option value="GOOD_4G_5G">🟢 ມີສັນຍານ 4G/5G ສັນຍານດີ</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  {lang === 'la' ? 'ການເຂົ້າເຖິງອິນເຕີເນັດ (Internet Access):' : 'Broadband / Internet Access:'}
                </label>
                <select
                  value={internetAccess}
                  onChange={(e) => setInternetAccess(e.target.value as InternetAccess)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-red-500"
                >
                  <option value="NONE">ບໍ່ມີເລີຍ (None)</option>
                  <option value="SATELLITE">ອິນເຕີເນັດດາວເທັກ (Satellite/Starlink)</option>
                  <option value="FIXED_WIRELESS">Fixed Wireless (ຄື້ນວິທະຍຸ)</option>
                  <option value="FIBER_NEARBY">ມີສາຍໄຍແກ້ວນຳແສງ Fiber ຢູ່ໃກ້</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Population & Social Infrastructure */}
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/80 space-y-4">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              {lang === 'la' ? '3. ປະຊາກອນ ແລະ ໂຄງຮ່າງພື້ນຖານ' : '3. Demographics & Social Infrastructure'}
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">{lang === 'la' ? 'ປະຊາກອນ (ຄົນ)' : 'Population'}</label>
                <input
                  type="number"
                  value={population}
                  onChange={(e) => setPopulation(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-1.5"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">{lang === 'la' ? 'ຫຼັງຄາເຮືອນ' : 'Households'}</label>
                <input
                  type="number"
                  value={households}
                  onChange={(e) => setHouseholds(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-1.5"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 flex items-center gap-1">
                  <School className="w-3.5 h-3.5 text-blue-400" />
                  {lang === 'la' ? 'ໂຮງຮຽນ' : 'Schools'}
                </label>
                <input
                  type="number"
                  value={schools}
                  onChange={(e) => setSchools(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-1.5"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 flex items-center gap-1">
                  <Stethoscope className="w-3.5 h-3.5 text-rose-400" />
                  {lang === 'la' ? 'ສຸກສາລາ' : 'Clinics'}
                </label>
                <input
                  type="number"
                  value={healthCenters}
                  onChange={(e) => setHealthCenters(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-1.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
              <div>
                <label className="text-slate-300 block mb-1">{lang === 'la' ? 'ພູມສັນຖານ:' : 'Terrain:'}</label>
                <select
                  value={terrain}
                  onChange={(e) => setTerrain(e.target.value as TerrainType)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-1.5"
                >
                  <option value="MOUNTAIN">ພູດອຍສູງ (Mountainous)</option>
                  <option value="VALLEY">ຮ່ອມພູ (Valley)</option>
                  <option value="DENSE_FOREST">ປ່າດົງດົກ (Dense Forest)</option>
                  <option value="RIVER_ISLAND">ດອນນ້ຳ/ເກາະ (River Island)</option>
                  <option value="FLATLAND">ທົ່ງພຽງ (Flatland)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">{lang === 'la' ? 'ແຫຼ່ງໄຟຟ້າ:' : 'Power Source:'}</label>
                <select
                  value={powerSource}
                  onChange={(e) => setPowerSource(e.target.value as PowerSource)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-1.5"
                >
                  <option value="GRID">ໄຟຟ້າຕາຂ່າຍ EDP</option>
                  <option value="SOLAR">ໂຊລາເຊວ (Solar Cell)</option>
                  <option value="MICRO_HYDRO">ນ້ຳຕົກຂະໜາດນ້ອຍ</option>
                  <option value="DIESEL">ຈັກປັ່ນໄຟ</option>
                  <option value="NONE">ບໍ່ມີໄຟຟ້າ</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">{lang === 'la' ? 'ເສັ້ນທາງສັນຈອນ:' : 'Road Access:'}</label>
                <select
                  value={roadAccess}
                  onChange={(e) => setRoadAccess(e.target.value as RoadAccess)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-1.5"
                >
                  <option value="ASPHALT">ທາງປູຢາງ/ຄອນກຣີດ</option>
                  <option value="DIRT_SEASONAL">ທາງແດງ/ທ່ຽວໄດ້ຕາມລະດູ</option>
                  <option value="FOOTPATH_ONLY">ທາງຍ່າງເທົ່ານັ້ນ</option>
                  <option value="RIVER_ONLY">ທາງນ້ຳ/ເຮືອເທົ່ານັ້ນ</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Surveyor & Photos */}
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/80 space-y-4">
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <Camera className="w-4 h-4" />
              {lang === 'la' ? '4. ຜູ້ສຳຫລວດ, ຮູບພາບ ແລະ ໝາຍເຫດ' : '4. Surveyor Info & Photos'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  {lang === 'la' ? 'ຊື່ຜູ້ລົງສຳຫລວດ / ວິຊາການ *' : 'Surveyor Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={surveyorName}
                  onChange={(e) => setSurveyorName(e.target.value)}
                  placeholder="ທ່ານ..."
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  {lang === 'la' ? 'ໝາຍເຫດ / ສະພາບຕົວຈິງ:' : 'Notes / Real Terrain Context:'}
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ບ້ານຕັ້ງຢູ່ຫຼັງພູ..."
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs"
                />
              </div>
            </div>

            {/* Photo URL Adder */}
            <div className="text-xs space-y-2">
              <label className="text-slate-300 block">{lang === 'la' ? 'ເພີ່ມ URL ຮູບພາບພື້ນທີ່ສຳຫລວດ:' : 'Add Photo URL:'}</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={photoUrlInput}
                  onChange={(e) => setPhotoUrlInput(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddPhoto}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
                >
                  {lang === 'la' ? 'ເພີ່ມຮູບ' : 'Add'}
                </button>
              </div>

              {photos.length > 0 && (
                <div className="flex gap-2 pt-2 overflow-x-auto">
                  {photos.map((p, idx) => (
                    <img key={idx} src={p} alt="survey" className="w-16 h-16 object-cover rounded-lg border border-slate-700" />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-8 rounded-xl text-sm flex items-center gap-2 shadow-lg hover:shadow-red-900/40 transition-all cursor-pointer"
            >
              <Save className="w-5 h-5" />
              <span>{lang === 'la' ? 'ບັນທຶກຜົນການສຳຫລວດ GIS' : 'Save Survey Entry'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
