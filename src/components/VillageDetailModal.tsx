import React from 'react';
import { VillageSurvey } from '../types';
import { getSignalStatusLao, getTerrainLao, getPowerLao, getRoadLao } from '../utils/gisCalculations';
import { 
  X, 
  MapPin, 
  WifiOff, 
  Building2, 
  School, 
  Stethoscope, 
  Users, 
  Zap, 
  Compass, 
  Radio, 
  ShieldAlert, 
  Printer, 
  Calendar,
  UserCheck
} from 'lucide-react';

interface VillageDetailModalProps {
  village: VillageSurvey | null;
  onClose: () => void;
  lang: 'la' | 'en';
}

export const VillageDetailModal: React.FC<VillageDetailModalProps> = ({ village, onClose, lang }) => {
  if (!village) return null;

  const statusInfo = getSignalStatusLao(village.signalStatus);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl my-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-800 p-5 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                {village.code}
              </span>
              <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${statusInfo.badgeBg}`}>
                {statusInfo.label}
              </span>
            </div>
            <h2 className="text-2xl font-black text-white mt-1">{village.nameLao} ({village.nameEng})</h2>
            <p className="text-xs text-rose-300 font-medium mt-0.5">
              📍 ບ້ານ {village.nameLao}, ຕາແສງ {village.subdistrict ? `${village.subdistrict}, ` : ''}ເມືອງ {village.district}, ແຂວງ {village.province}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2 rounded-xl transition-colors border border-slate-700"
              title="Print Dossier"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white p-2 rounded-xl transition-colors border border-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-xs text-slate-300 max-h-[75vh] overflow-y-auto">
          
          {/* Priority Alert Box */}
          <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-950 text-rose-400 rounded-xl border border-rose-800">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block font-semibold">{lang === 'la' ? 'ຄະແນນຄວາມດ່ວນ USO (USO Priority)' : 'USO Priority Score'}</span>
                <span className="text-xl font-bold text-rose-400">{village.priorityScore} / 100</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-slate-400 block font-semibold">{lang === 'la' ? 'ເສົາ BTS ໃກ້ສຸດ' : 'Nearest Cell Tower'}</span>
              <span className="font-bold text-white">{village.nearestTowerName}</span>
              <span className="text-[11px] text-indigo-400 block">ຫ່າງ {village.nearestTowerDistanceKm} km</span>
            </div>
          </div>

          {/* Location & GPS Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-500 block">{lang === 'la' ? 'ພິກັດ Latitude' : 'Latitude'}</span>
              <span className="font-mono text-slate-200 font-bold">{village.lat}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">{lang === 'la' ? 'ພິກັດ Longitude' : 'Longitude'}</span>
              <span className="font-mono text-slate-200 font-bold">{village.lng}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">{lang === 'la' ? 'ປະຊາກອນ / ຫຼັງຄາ' : 'Demographics'}</span>
              <span className="text-slate-200 font-bold">{village.population} ຄົນ ({village.households} ຫຼັງ)</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">{lang === 'la' ? 'ໂຮງຮຽນ & ສຸກສາລາ' : 'Schools & Clinics'}</span>
              <span className="text-slate-200 font-bold">{village.schools} ໂຮງຮຽນ / {village.healthCenters} ສຸກສາລາ</span>
            </div>
          </div>

          {/* Carrier Signal Test Results */}
          <div className="space-y-2">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-amber-400" />
              {lang === 'la' ? 'ຜົນການທົດສອບສັນຍານ 4 ເຄືອຂ່າຍມືຖື (0 - 5 ຂີດ)' : 'Mobile Carrier Signal Audit'}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 block">LTC (ລາວໂທລະຄົມ)</span>
                <span className="text-base font-bold text-white">{village.carriers.LTC.bars}⭐ ({village.carriers.LTC.tech})</span>
              </div>
              <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 block">Unitel (ຢູນີເທວ)</span>
                <span className="text-base font-bold text-white">{village.carriers.Unitel.bars}⭐ ({village.carriers.Unitel.tech})</span>
              </div>
              <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 block">TPlus (ທີພັສ)</span>
                <span className="text-base font-bold text-white">{village.carriers.TPlus.bars}⭐ ({village.carriers.TPlus.tech})</span>
              </div>
              <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 block">ETL (ອີທີແອວ)</span>
                <span className="text-base font-bold text-white">{village.carriers.ETL.bars}⭐ ({village.carriers.ETL.tech})</span>
              </div>
            </div>
          </div>

          {/* Infrastructure & Terrain */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-500 block">{lang === 'la' ? 'ພູມສັນຖານ:' : 'Terrain:'}</span>
              <span className="font-bold text-slate-200">{getTerrainLao(village.terrain)}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">{lang === 'la' ? 'ແຫຼ່ງໄຟຟ້າ:' : 'Power:'}</span>
              <span className="font-bold text-slate-200">{getPowerLao(village.powerSource)}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">{lang === 'la' ? 'ເສັ້ນທາງ:' : 'Road:'}</span>
              <span className="font-bold text-slate-200">{getRoadLao(village.roadAccess)}</span>
            </div>
          </div>

          {/* Notes & Surveyor */}
          {village.notes && (
            <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700 text-slate-300">
              <span className="text-[10px] font-bold text-slate-400 block mb-1">{lang === 'la' ? 'ໝາຍເຫດຈາກວິຊາການສຳຫລວດ:' : 'Surveyor Notes:'}</span>
              <p className="italic">"{village.notes}"</p>
            </div>
          )}

          {/* Photos */}
          {village.photos && village.photos.length > 0 && (
            <div className="space-y-2">
              <span className="font-bold text-slate-300 block">{lang === 'la' ? 'ຮູບພາບພື້ນທີ່:' : 'Survey Photos:'}</span>
              <div className="grid grid-cols-2 gap-3">
                {village.photos.map((p, idx) => (
                  <img key={idx} src={p} alt="Village" className="w-full h-36 object-cover rounded-xl border border-slate-700" />
                ))}
              </div>
            </div>
          )}

          {/* Footer Metadata */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-slate-400" />
              {lang === 'la' ? 'ຜູ້ສຳຫລວດ: ' + village.surveyorName : 'Surveyor: ' + village.surveyorName}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {lang === 'la' ? 'ວັນທີ: ' + village.surveyDate : 'Date: ' + village.surveyDate}
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};
