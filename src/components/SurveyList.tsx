import React, { useState } from 'react';
import { VillageSurvey } from '../types';
import { 
  getSignalStatusLao, 
  getTerrainLao, 
  getRoadLao, 
  getPowerLao, 
  exportToGeoJSON, 
  exportToCSV 
} from '../utils/gisCalculations';
import { LAO_PROVINCES } from '../data/mockSurveys';
import { 
  Search, 
  Filter, 
  Download, 
  FileSpreadsheet, 
  Globe, 
  Eye, 
  Trash2, 
  Building2, 
  School, 
  Stethoscope, 
  WifiOff, 
  Sparkles,
  ArrowUpDown,
  CheckCircle2
} from 'lucide-react';

interface SurveyListProps {
  surveys: VillageSurvey[];
  onSelectVillage: (village: VillageSurvey) => void;
  onDeleteSurvey: (id: string) => void;
  lang: 'la' | 'en';
}

export const SurveyList: React.FC<SurveyListProps> = ({
  surveys,
  onSelectVillage,
  onDeleteSurvey,
  lang,
}) => {
  const [search, setSearch] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [minPriority, setMinPriority] = useState(0);
  const [sortBy, setSortBy] = useState<'priority' | 'population' | 'name'>('priority');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  // Filter logic
  const filteredSurveys = surveys
    .filter((v) => {
      const matchQuery =
        v.nameLao.toLowerCase().includes(search.toLowerCase()) ||
        v.nameEng.toLowerCase().includes(search.toLowerCase()) ||
        v.district.toLowerCase().includes(search.toLowerCase()) ||
        (v.subdistrict && v.subdistrict.toLowerCase().includes(search.toLowerCase())) ||
        v.code.toLowerCase().includes(search.toLowerCase());

      const matchProvince = selectedProvince === 'ALL' || v.province.includes(selectedProvince.split(' ')[0]);
      const matchStatus = selectedStatus === 'ALL' || v.signalStatus === selectedStatus;
      const matchPriority = v.priorityScore >= minPriority;

      return matchQuery && matchProvince && matchStatus && matchPriority;
    })
    .sort((a, b) => {
      let result = 0;
      if (sortBy === 'priority') result = b.priorityScore - a.priorityScore;
      if (sortBy === 'population') result = b.population - a.population;
      if (sortBy === 'name') result = a.nameLao.localeCompare(b.nameLao);

      return sortOrder === 'desc' ? result : -result;
    });

  // Handle GeoJSON Export
  const handleExportGeoJSON = () => {
    const geojsonStr = exportToGeoJSON(filteredSurveys);
    const blob = new Blob([geojsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Lao_Telecom_DeadZones_Survey_${new Date().toISOString().slice(0, 10)}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
    triggerNotice(lang === 'la' ? 'ດາວໂຫຼດ GeoJSON ສຳເລັດ!' : 'Exported GeoJSON successfully!');
  };

  // Handle CSV Export
  const handleExportCSV = () => {
    const csvStr = exportToCSV(filteredSurveys);
    const blob = new Blob(['\uFEFF' + csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Lao_Village_Telecom_Survey_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    triggerNotice(lang === 'la' ? 'ດາວໂຫຼດ CSV ສຳເລັດ!' : 'Exported CSV successfully!');
  };

  const triggerNotice = (msg: string) => {
    setDownloadNotice(msg);
    setTimeout(() => setDownloadNotice(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header & Export Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 shadow-md">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-red-400" />
            {lang === 'la' ? 'ບັນຊີບ້ານ ແລະ ຜົນການສຳຫລວດສັນຍານມືຖື ແລະ ອິນເຕີເນັດ' : 'Surveyed Village Telecom Registry'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'la'
              ? `ພົບເຫັນທັງໝົດ ${filteredSurveys.length} ບ້ານ (ຈາກ ${surveys.length} ບ້ານໃນຖານຂໍ້ມູນ)`
              : `Found ${filteredSurveys.length} villages (out of ${surveys.length} total)`}
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportGeoJSON}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow transition-all border border-indigo-400/30"
          >
            <Globe className="w-4 h-4" />
            <span>GeoJSON</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow transition-all border border-emerald-400/30"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel / CSV</span>
          </button>
        </div>
      </div>

      {downloadNotice && (
        <div className="bg-emerald-900/80 border border-emerald-500 text-emerald-200 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{downloadNotice}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
        
        {/* Search */}
        <div className="sm:col-span-2">
          <label className="text-slate-300 font-medium block mb-1">
            {lang === 'la' ? 'ຄົ້ນຫາ (ຊື່ບ້ານ/ຕາແສງ/ເມືອງ/ລະຫັດ):' : 'Search:'}
          </label>
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={lang === 'la' ? 'ພິມຊື່ບ້ານ, ຕາແສງ ຫຼື ເມືອງ...' : 'Search name, subdistrict, district, code...'}
              className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* Province */}
        <div>
          <label className="text-slate-300 font-medium block mb-1">
            {lang === 'la' ? 'ແຂວງ:' : 'Province:'}
          </label>
          <select
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="ALL">{lang === 'la' ? 'ທຸກແຂວງ (All)' : 'All Provinces'}</option>
            {LAO_PROVINCES.slice(1).map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Signal Status */}
        <div>
          <label className="text-slate-300 font-medium block mb-1">
            {lang === 'la' ? 'ສະຖານະສັນຍານ:' : 'Signal Status:'}
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="ALL">{lang === 'la' ? 'ທຸກສະຖານະ' : 'All Status'}</option>
            <option value="NO_SIGNAL">{lang === 'la' ? '🔴 ບໍ່ມີສັນຍານມືຖື ແລະ ອິນເຕີເນັດ' : 'No Signal'}</option>
            <option value="WEAK_2G">{lang === 'la' ? '🟠 2G ອ່ອນ' : 'Weak 2G'}</option>
            <option value="LIMITED_3G">{lang === 'la' ? '🟡 3G ຊ້າ' : 'Limited 3G'}</option>
            <option value="GOOD_4G_5G">{lang === 'la' ? '🟢 4G/5G ສັນຍານດີ' : 'Good 4G/5G'}</option>
          </select>
        </div>

        {/* Min USO Priority Slider */}
        <div>
          <label className="text-slate-300 font-medium block mb-1 flex items-center justify-between">
            <span>{lang === 'la' ? 'ຄະແນນດ່ວນເລັ່ງລັດ (≥):' : 'Min Priority:'}</span>
            <span className="text-red-400 font-bold">{minPriority}</span>
          </label>
          <input
            type="range"
            min="0"
            max="95"
            step="5"
            value={minPriority}
            onChange={(e) => setMinPriority(Number(e.target.value))}
            className="w-full accent-red-500 bg-slate-700 h-2 rounded-lg cursor-pointer mt-1"
          />
        </div>
      </div>

      {/* Sorting Controls */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-2">
        <div className="flex items-center gap-2">
          <span>{lang === 'la' ? 'ຈັດລຽງຕາມ:' : 'Sort by:'}</span>
          <button
            onClick={() => setSortBy('priority')}
            className={`px-2.5 py-1 rounded-md font-medium ${sortBy === 'priority' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300'}`}
          >
            {lang === 'la' ? 'ຄະແນນດ່ວນ USO' : 'Priority'}
          </button>
          <button
            onClick={() => setSortBy('population')}
            className={`px-2.5 py-1 rounded-md font-medium ${sortBy === 'population' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300'}`}
          >
            {lang === 'la' ? 'ຈຳນວນປະຊາກອນ' : 'Population'}
          </button>
          <button
            onClick={() => setSortBy('name')}
            className={`px-2.5 py-1 rounded-md font-medium ${sortBy === 'name' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300'}`}
          >
            {lang === 'la' ? 'ຊື່ບ້ານ' : 'Name'}
          </button>
        </div>

        <button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="flex items-center gap-1 bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1 rounded-md"
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span>{sortOrder === 'desc' ? (lang === 'la' ? 'ຫຼາຍ -> ໜ້ອຍ' : 'High -> Low') : (lang === 'la' ? 'ໜ້ອຍ -> ຫຼາຍ' : 'Low -> High')}</span>
        </button>
      </div>

      {/* Village Survey Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="p-3.5">{lang === 'la' ? 'ລະຫັດ & ຊື່ບ້ານ' : 'Code & Village'}</th>
                <th className="p-3.5">{lang === 'la' ? 'ຕາແສງ / ເມືອງ / ແຂວງ' : 'Subdistrict / District / Province'}</th>
                <th className="p-3.5">{lang === 'la' ? 'ປະຊາກອນ' : 'Population'}</th>
                <th className="p-3.5">{lang === 'la' ? 'ສະຖານະສັນຍານ' : 'Signal Status'}</th>
                <th className="p-3.5">{lang === 'la' ? 'ສັນຍານ 4 ເຄືອຂ່າຍ (LTC/Unitel/T+/ETL)' : 'Carriers (Bars)'}</th>
                <th className="p-3.5">{lang === 'la' ? 'ຄະແນນດ່ວນ USO' : 'USO Priority'}</th>
                <th className="p-3.5">{lang === 'la' ? 'ເສົາ BTS ໃກ້ສຸດ' : 'Closest Tower'}</th>
                <th className="p-3.5 text-right">{lang === 'la' ? 'ຈັດການ' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredSurveys.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-500">
                    <WifiOff className="w-10 h-10 mx-auto mb-2 opacity-40 text-rose-500" />
                    <p>{lang === 'la' ? 'ບໍ່ພົບຂໍ້ມູນບ້ານທີ່ກົງກັບເງື່ອນໄຂ' : 'No survey entries match search'}</p>
                  </td>
                </tr>
              ) : (
                filteredSurveys.map((v) => {
                  const statusInfo = getSignalStatusLao(v.signalStatus);

                  return (
                    <tr key={v.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Code & Name */}
                      <td className="p-3.5">
                        <div className="font-bold text-white text-sm">{v.nameLao}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{v.code} • {v.nameEng}</div>
                      </td>

                      {/* Location: Subdistrict, District, Province */}
                      <td className="p-3.5">
                        <div className="text-slate-200 font-medium">{v.subdistrict ? `${v.subdistrict}, ` : ''}ເມືອງ {v.district}</div>
                        <div className="text-[10px] text-slate-400">ແຂວງ {v.province}</div>
                      </td>

                      {/* Population & Social Infra */}
                      <td className="p-3.5">
                        <div className="font-bold text-slate-100">{v.population.toLocaleString()} {lang === 'la' ? 'ຄົນ' : ''}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-0.5"><School className="w-3 h-3 text-blue-400" />{v.schools}</span>
                          <span className="flex items-center gap-0.5"><Stethoscope className="w-3 h-3 text-rose-400" />{v.healthCenters}</span>
                        </div>
                      </td>

                      {/* Signal Status Badge */}
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border inline-block ${statusInfo.badgeBg}`}>
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Carrier Grid */}
                      <td className="p-3.5">
                        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] font-mono">
                          <span>LTC: <strong className={v.carriers.LTC.bars === 0 ? 'text-red-400' : 'text-emerald-400'}>{v.carriers.LTC.bars}⭐</strong></span>
                          <span>Unitel: <strong className={v.carriers.Unitel.bars === 0 ? 'text-red-400' : 'text-emerald-400'}>{v.carriers.Unitel.bars}⭐</strong></span>
                          <span>TPlus: <strong className={v.carriers.TPlus.bars === 0 ? 'text-red-400' : 'text-emerald-400'}>{v.carriers.TPlus.bars}⭐</strong></span>
                          <span>ETL: <strong className={v.carriers.ETL.bars === 0 ? 'text-red-400' : 'text-emerald-400'}>{v.carriers.ETL.bars}⭐</strong></span>
                        </div>
                      </td>

                      {/* USO Priority Score */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-12 bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
                            <div
                              className={`h-full ${
                                v.priorityScore >= 80
                                  ? 'bg-rose-500'
                                  : v.priorityScore >= 60
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${v.priorityScore}%` }}
                            />
                          </div>
                          <span className={`font-bold text-xs ${v.priorityScore >= 80 ? 'text-rose-400' : 'text-slate-300'}`}>
                            {v.priorityScore}
                          </span>
                        </div>
                      </td>

                      {/* Closest Tower */}
                      <td className="p-3.5">
                        <div className="text-slate-200 text-xs">{v.nearestTowerName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{v.nearestTowerDistanceKm} km away</div>
                      </td>

                      {/* Action */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectVillage(v)}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2 rounded-lg transition-colors border border-slate-700"
                            title={lang === 'la' ? 'ເບິ່ງລາຍລະອຽດເຕັມ' : 'View Detail'}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteSurvey(v.id)}
                            className="bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 p-2 rounded-lg transition-colors border border-slate-700"
                            title={lang === 'la' ? 'ລຶບຂໍ້ມູນ' : 'Delete'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
