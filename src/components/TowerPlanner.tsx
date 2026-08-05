import React, { useState } from 'react';
import { VillageSurvey, CellTower } from '../types';
import { calculateHaversineDistance } from '../utils/gisCalculations';
import { 
  Radio, 
  MapPin, 
  Plus, 
  Calculator, 
  CheckCircle2, 
  DollarSign, 
  Zap, 
  Building2, 
  Users, 
  School, 
  Stethoscope, 
  Sun, 
  Layers,
  Sparkles
} from 'lucide-react';

interface TowerPlannerProps {
  surveys: VillageSurvey[];
  towers: CellTower[];
  onAddTower: (tower: CellTower) => void;
  onOpenMapToPlaceTower: (radiusKm: number) => void;
  lang: 'la' | 'en';
}

export const TowerPlanner: React.FC<TowerPlannerProps> = ({
  surveys,
  towers,
  onAddTower,
  onOpenMapToPlaceTower,
  lang,
}) => {
  const [towerName, setTowerName] = useState('ເສົາ 4G USO ຍອດອູ-01');
  const [operator, setOperator] = useState<'LTC' | 'Unitel' | 'TPlus' | 'ETL' | 'Shared/USO'>('Shared/USO');
  const [lat, setLat] = useState<number>(21.800);
  const [lng, setLng] = useState<number>(102.200);
  const [coverageRadiusKm, setCoverageRadiusKm] = useState<number>(6.0);
  const [technology, setTechnology] = useState<'2G/3G' | '4G' | '5G'>('4G');
  const [powerType, setPowerType] = useState<'Grid' | 'Solar+Grid' | 'Diesel'>('Solar+Grid');
  const [backhaulType, setBackhaulType] = useState<'Microwave' | 'Fiber' | 'Satellite'>('Microwave');

  // Calculate Impacted Villages
  const impactedVillages = surveys.filter((v) => {
    const dist = calculateHaversineDistance(lat, lng, v.lat, v.lng);
    return dist <= coverageRadiusKm;
  });

  const newlyCoveredVillages = impactedVillages.filter(
    (v) => v.signalStatus === 'NO_SIGNAL' || v.signalStatus === 'WEAK_2G'
  );

  const totalPeopleCovered = newlyCoveredVillages.reduce((sum, v) => sum + v.population, 0);
  const totalSchoolsCovered = newlyCoveredVillages.reduce((sum, v) => sum + v.schools, 0);
  const totalHealthCovered = newlyCoveredVillages.reduce((sum, v) => sum + v.healthCenters, 0);

  // Financial Estimations ($ USD)
  let baseTowerCost = 35000; // Mast & Civil works
  if (powerType === 'Solar+Grid') baseTowerCost += 12000; // Solar panels & batteries
  if (backhaulType === 'Satellite') baseTowerCost += 8000; // Satellite dish & modem
  if (backhaulType === 'Fiber') baseTowerCost += 15000; // Fiber extension
  if (technology === '5G') baseTowerCost += 20000; // 5G RAN equipment

  const totalCost = baseTowerCost;
  const costPerPerson = totalPeopleCovered > 0 ? Math.round(totalCost / totalPeopleCovered) : 0;

  const handleSaveTower = () => {
    const newTower: CellTower = {
      id: `TOW-${Date.now().toString().slice(-4)}`,
      name: towerName,
      operator,
      lat,
      lng,
      coverageRadiusKm,
      technology,
      powerType,
      isProposed: true,
    };

    onAddTower(newTower);
    alert(lang === 'la' ? `ບັນທຶກເສົາໃໝ່ "${towerName}" ສຳເລັດ!` : `Saved proposed tower "${towerName}"!`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border border-indigo-800/60 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Radio className="w-6 h-6 text-indigo-400 animate-pulse" />
            {lang === 'la' ? 'ລະບົບຈຳລອງການວາງເສົາສັນຍານ BTS & ກອງທຶນ USO' : 'BTS Tower & USO Planning Simulator'}
          </h2>
          <p className="text-xs text-indigo-200 mt-1">
            {lang === 'la'
              ? 'ກຳນົດພື້ນທີ່ວາງເສົາ 4G ໃໝ່, ຈຳລອງລັດສະໝີຄື້ນສັນຍານ ແລະ ຄິດໄລ່ຈຳນວນປະຊາກອນທີ່ໄດ້ຮັບຜົນປະໂຫຍດ'
              : 'Simulate strategic 4G tower positioning, signal coverage radius & ROI cost per citizen'}
          </p>
        </div>

        <button
          onClick={() => onOpenMapToPlaceTower(coverageRadiusKm)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all border border-indigo-400/30"
        >
          <MapPin className="w-4 h-4 text-indigo-200" />
          <span>{lang === 'la' ? 'ກົດເລືອກຈຸດເທິງແຜນທີ່ GIS' : 'Pick Location on GIS Map'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Tower Configuration Controls */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
          <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
            <Calculator className="w-4 h-4" />
            {lang === 'la' ? 'ຕັ້ງຄ່າເສົາ BTS ໃໝ່' : 'New Tower Specifications'}
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 font-medium block mb-1">{lang === 'la' ? 'ຊື່ເສົາ BTS / ໂຄງການ:' : 'Tower Name / Project:'}</label>
              <input
                type="text"
                value={towerName}
                onChange={(e) => setTowerName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">{lang === 'la' ? 'ຜູ້ບໍລິການ (Operator):' : 'Operator / Fund:'}</label>
              <select
                value={operator}
                onChange={(e) => setOperator(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs"
              >
                <option value="Shared/USO">Shared USO (ກອງທຶນລັດ + 4 ເຄືອຂ່າຍ)</option>
                <option value="LTC">LTC (ລາວໂທລະຄົມ)</option>
                <option value="Unitel">Unitel (ຢູນີເທວ)</option>
                <option value="TPlus">TPlus (ທີພັສ)</option>
                <option value="ETL">ETL (ອີທີແອວ)</option>
              </select>
            </div>

            {/* GPS Lat Lng */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 text-[10px] block mb-1">Latitude</label>
                <input
                  type="number"
                  step="0.001"
                  value={lat}
                  onChange={(e) => setLat(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-slate-400 text-[10px] block mb-1">Longitude</label>
                <input
                  type="number"
                  step="0.001"
                  value={lng}
                  onChange={(e) => setLng(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 font-mono text-xs"
                />
              </div>
            </div>

            {/* Radius Slider */}
            <div>
              <div className="flex items-center justify-between text-slate-300 mb-1">
                <span>{lang === 'la' ? 'ລັດສະໝີປົກຄຸມ (Coverage Radius):' : 'Coverage Radius:'}</span>
                <span className="font-bold text-indigo-400">{coverageRadiusKm} km</span>
              </div>
              <input
                type="range"
                min="2"
                max="15"
                step="0.5"
                value={coverageRadiusKm}
                onChange={(e) => setCoverageRadiusKm(Number(e.target.value))}
                className="w-full accent-indigo-500 bg-slate-700 h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* Tech & Power */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div>
                <label className="text-slate-300 block mb-1">{lang === 'la' ? 'ເຕັກໂນໂລຊີ:' : 'Technology:'}</label>
                <select
                  value={technology}
                  onChange={(e) => setTechnology(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded px-2 py-1.5 text-xs"
                >
                  <option value="4G">4G LTE (ແນະນຳ)</option>
                  <option value="5G">5G Ultra Broad</option>
                  <option value="2G/3G">2G/3G (Basic)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">{lang === 'la' ? 'ລະບົບໄຟຟ້າ:' : 'Power System:'}</label>
                <select
                  value={powerType}
                  onChange={(e) => setPowerType(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded px-2 py-1.5 text-xs"
                >
                  <option value="Solar+Grid">Solar Hybrid (ໂຊລາ+ແບັດ)</option>
                  <option value="Grid">Grid EDP (ຕາຂ່າຍ)</option>
                  <option value="Diesel">Diesel Generator</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-slate-300 block mb-1">{lang === 'la' ? 'ລະບົບ Backhaul ຮັບສົ່ງສັນຍານ:' : 'Backhaul Type:'}</label>
              <select
                value={backhaulType}
                onChange={(e) => setBackhaulType(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-xs"
              >
                <option value="Microwave">Microwave Link (ຄື້ນວິທະຍຸ)</option>
                <option value="Satellite">Satellite (ດາວທຽມ LEO / Starlink)</option>
                <option value="Fiber">Fiber Optic (ສາຍໃຍແກ້ວ)</option>
              </select>
            </div>

            <button
              onClick={handleSaveTower}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'la' ? 'ເພີ່ມເຂົ້າໃນແຜນທີ່ GIS' : 'Add to GIS Map'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Simulated Impact Dashboard */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">{lang === 'la' ? 'ບ້ານທີ່ໄດ້ຮັບສັນຍານ' : 'Villages Covered'}</span>
              <span className="text-2xl font-black text-indigo-400">{newlyCoveredVillages.length}</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">{lang === 'la' ? 'ຈາກ ' + impactedVillages.length + ' ບ້ານໃນລັດສະໝີ' : 'out of ' + impactedVillages.length + ' total'}</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">{lang === 'la' ? 'ປະຊາກອນໄດ້ຮັບສັນຍາ' : 'Population Gained'}</span>
              <span className="text-2xl font-black text-emerald-400">{totalPeopleCovered.toLocaleString()}</span>
              <span className="text-[10px] text-emerald-500/80 block mt-0.5">{lang === 'la' ? 'ຄົນໄດ້ຫຼຸດພົ້ນຈາກ Deadzone' : 'citizens connected'}</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">{lang === 'la' ? 'ໂຮງຮຽນ/ສຸກສາລາ' : 'Schools / Clinics'}</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-lg font-bold text-blue-400 flex items-center gap-1"><School className="w-4 h-4" />{totalSchoolsCovered}</span>
                <span className="text-lg font-bold text-rose-400 flex items-center gap-1"><Stethoscope className="w-4 h-4" />{totalHealthCovered}</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">{lang === 'la' ? 'ງົບປະມານປະເມີນ' : 'Estimated Cost'}</span>
              <span className="text-xl font-black text-amber-400">${totalCost.toLocaleString()}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">${costPerPerson}/ຄົນ</span>
            </div>

          </div>

          {/* Impacted Villages List inside Coverage Radius */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-400" />
              {lang === 'la' ? `ລາຍຊື່ບ້ານທີ່ຢູ່ໃນລັດສະໝີ ${coverageRadiusKm} km (${newlyCoveredVillages.length} ບ້ານຂາດສັນຍານ)` : `Impacted Villages within ${coverageRadiusKm} km`}
            </h3>

            {newlyCoveredVillages.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs bg-slate-950/50 rounded-xl border border-slate-800/60">
                <p>{lang === 'la' ? 'ບໍ່ມີບ້ານຂາດສັນຍາໃນລັດສະໝີນີ້. ລອງປັບຈຸດ Lat/Lng ຫຼື ເພີ່ມລັດສະໝີ.' : 'No unserved villages inside this coverage radius.'}</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {newlyCoveredVillages.map((v) => {
                  const dist = calculateHaversineDistance(lat, lng, v.lat, v.lng);
                  return (
                    <div
                      key={v.id}
                      className="bg-slate-800/60 border border-slate-700/80 p-3 rounded-xl flex items-center justify-between text-xs hover:border-indigo-500 transition-colors"
                    >
                      <div>
                        <div className="font-bold text-white text-sm">{v.nameLao} ({v.nameEng})</div>
                        <div className="text-[10px] text-slate-400">{v.district}, {v.province} • ໄລຍະທາງ: {dist} km</div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="font-bold text-emerald-400 block">{v.population} {lang === 'la' ? 'ຄົນ' : 'pop'}</span>
                          <span className="text-[10px] text-rose-400">{v.schools} ໂຮງຮຽນ / {v.healthCenters} ສຸກສາລາ</span>
                        </div>
                        <span className="px-2 py-1 text-[10px] font-bold bg-rose-950 text-rose-300 rounded border border-rose-800">
                          {v.priorityScore} USO
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* USO Budget & Breakdown Analysis */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-xs space-y-3">
            <h4 className="font-bold text-slate-200 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-400" />
              {lang === 'la' ? 'ລາຍລະອຽດຕົ້ນທຶນການສ້າງເສົາ BTS (USO Budget Breakdown)' : 'USO Budget & Technology Breakdown'}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-700">
                <span className="text-slate-400 block">ໂຄງສ້າງເສົາ & ງານກໍ່ສ້າງ</span>
                <span className="font-bold text-slate-200">$35,000</span>
              </div>
              <div className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-700">
                <span className="text-slate-400 block">ລະບົບໄຟຟ້າ Solar Cell</span>
                <span className="font-bold text-slate-200">{powerType === 'Solar+Grid' ? '$12,000' : '$0'}</span>
              </div>
              <div className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-700">
                <span className="text-slate-400 block">ອຸປະກອນ Backhaul</span>
                <span className="font-bold text-slate-200">{backhaulType === 'Satellite' ? '$8,000' : '$4,000'}</span>
              </div>
              <div className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-700">
                <span className="text-slate-400 block">ລວມທັງໝົດ</span>
                <span className="font-bold text-amber-400">${totalCost.toLocaleString()}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
