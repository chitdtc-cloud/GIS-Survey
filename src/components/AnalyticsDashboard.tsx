import React from 'react';
import { VillageSurvey } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import { 
  BarChart3, 
  PieChart as PieIcon, 
  ShieldAlert, 
  Building2, 
  Users, 
  WifiOff, 
  School, 
  Stethoscope 
} from 'lucide-react';

interface AnalyticsDashboardProps {
  surveys: VillageSurvey[];
  lang: 'la' | 'en';
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ surveys, lang }) => {
  // 1. Overall Signal Pie Chart Data
  const signalCounts = {
    NO_SIGNAL: surveys.filter((s) => s.signalStatus === 'NO_SIGNAL').length,
    WEAK_2G: surveys.filter((s) => s.signalStatus === 'WEAK_2G').length,
    LIMITED_3G: surveys.filter((s) => s.signalStatus === 'LIMITED_3G').length,
    GOOD_4G_5G: surveys.filter((s) => s.signalStatus === 'GOOD_4G_5G').length,
  };

  const pieData = [
    { name: lang === 'la' ? '🔴 ບໍ່ມີສັນຍານມືຖື ແລະ ອິນເຕີເນັດ (0 bars)' : 'No Signal', value: signalCounts.NO_SIGNAL, color: '#ef4444' },
    { name: lang === 'la' ? '🟠 2G ອ່ອນ (1-2 bars)' : 'Weak 2G', value: signalCounts.WEAK_2G, color: '#f97316' },
    { name: lang === 'la' ? '🟡 3G ຊ້າ (3-4 bars)' : 'Limited 3G', value: signalCounts.LIMITED_3G, color: '#f59e0b' },
    { name: lang === 'la' ? '🟢 4G/5G ສັນຍານດີ' : 'Good 4G/5G', value: signalCounts.GOOD_4G_5G, color: '#10b981' },
  ];

  // 2. Dead Zone Villages by Province (Bar Chart)
  const provinceMap: Record<string, { province: string; noSignal: number; weak2g: number; good: number }> = {};

  surveys.forEach((s) => {
    const provShort = s.province.split(' ')[0];
    if (!provinceMap[provShort]) {
      provinceMap[provShort] = { province: provShort, noSignal: 0, weak2g: 0, good: 0 };
    }
    if (s.signalStatus === 'NO_SIGNAL') provinceMap[provShort].noSignal += 1;
    else if (s.signalStatus === 'WEAK_2G') provinceMap[provShort].weak2g += 1;
    else provinceMap[provShort].good += 1;
  });

  const provinceBarData = Object.values(provinceMap);

  // 3. Mobile Carriers Presence (LTC, Unitel, TPlus, ETL with >0 bars)
  const carrierCoverageData = [
    {
      carrier: 'LTC',
      covered: surveys.filter((s) => s.carriers.LTC.bars > 0).length,
      noSignal: surveys.filter((s) => s.carriers.LTC.bars === 0).length,
    },
    {
      carrier: 'Unitel',
      covered: surveys.filter((s) => s.carriers.Unitel.bars > 0).length,
      noSignal: surveys.filter((s) => s.carriers.Unitel.bars === 0).length,
    },
    {
      carrier: 'TPlus',
      covered: surveys.filter((s) => s.carriers.TPlus.bars > 0).length,
      noSignal: surveys.filter((s) => s.carriers.TPlus.bars === 0).length,
    },
    {
      carrier: 'ETL',
      covered: surveys.filter((s) => s.carriers.ETL.bars > 0).length,
      noSignal: surveys.filter((s) => s.carriers.ETL.bars === 0).length,
    },
  ];

  // 4. Key Totals
  const totalDeadZonePop = surveys
    .filter((s) => s.signalStatus === 'NO_SIGNAL' || s.signalStatus === 'WEAK_2G')
    .reduce((acc, curr) => acc + curr.population, 0);

  const totalSchoolsWithoutInternet = surveys
    .filter((s) => s.signalStatus === 'NO_SIGNAL' || s.signalStatus === 'WEAK_2G')
    .reduce((acc, curr) => acc + curr.schools, 0);

  const totalClinicsWithoutInternet = surveys
    .filter((s) => s.signalStatus === 'NO_SIGNAL' || s.signalStatus === 'WEAK_2G')
    .reduce((acc, curr) => acc + curr.healthCenters, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-400" />
            {lang === 'la' ? 'ສະຖິຕິ ແລະ ການວິເຄາະ ບ້ານບໍ່ມີສັນຍານມືຖື ແລະ ອິນເຕີເນັດດ້ວຍ ລະບົບ GIS' : 'Telecom Signal & Infrastructure Analytics'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'la'
              ? 'ສະຫຼຸບຜົນສຳຫລວດພາບລວມ, ຊ່ອງຫວ່າງສັນຍານມືຖື, ໂຮງຮຽນ, ສຸກສາລາ ແລະ ປະຊາກອນ'
              : 'Statistical analysis of telecommunication dead zones across provinces'}
          </p>
        </div>
      </div>

      {/* Summary Stat Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-900/90 border border-red-900/50 p-4 rounded-xl shadow-md">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase mb-1">
            <WifiOff className="w-4 h-4" />
            <span>{lang === 'la' ? 'ບ້ານ ບໍ່ມີສັນຍານມືຖື ແລະ ອິນເຕີເນັດ' : 'Complete Dead Zones'}</span>
          </div>
          <span className="text-3xl font-black text-rose-200">{signalCounts.NO_SIGNAL}</span>
          <span className="text-xs text-rose-300/80 block mt-1">
            {((signalCounts.NO_SIGNAL / surveys.length) * 100).toFixed(1)}% {lang === 'la' ? 'ຂອງບ້ານສຳຫລວດທັງໝົດ' : 'of surveyed villages'}
          </span>
        </div>

        <div className="bg-slate-900/90 border border-amber-900/50 p-4 rounded-xl shadow-md">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase mb-1">
            <Users className="w-4 h-4" />
            <span>{lang === 'la' ? 'ປະຊາກອນຂາດສັນຍານ' : 'Unserved Population'}</span>
          </div>
          <span className="text-3xl font-black text-amber-200">{totalDeadZonePop.toLocaleString()}</span>
          <span className="text-xs text-amber-300/80 block mt-1">{lang === 'la' ? 'ຄົນຕ້ອງການສັນຍານດ່ວນ' : 'citizens lacking signal'}</span>
        </div>

        <div className="bg-slate-900/90 border border-blue-900/50 p-4 rounded-xl shadow-md">
          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase mb-1">
            <School className="w-4 h-4" />
            <span>{lang === 'la' ? 'ໂຮງຮຽນບໍ່ມີສັນຍານ' : 'Unserved Schools'}</span>
          </div>
          <span className="text-3xl font-black text-blue-200">{totalSchoolsWithoutInternet}</span>
          <span className="text-xs text-blue-300/80 block mt-1">{lang === 'la' ? 'ແຫ່ງ ຕ້ອງການອິນເຕີເນັດ' : 'schools need internet'}</span>
        </div>

        <div className="bg-slate-900/90 border border-emerald-900/50 p-4 rounded-xl shadow-md">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase mb-1">
            <Stethoscope className="w-4 h-4" />
            <span>{lang === 'la' ? 'ສຸກສາລາບໍ່ມີສັນຍານ' : 'Unserved Clinics'}</span>
          </div>
          <span className="text-3xl font-black text-emerald-200">{totalClinicsWithoutInternet}</span>
          <span className="text-xs text-emerald-300/80 block mt-1">{lang === 'la' ? 'ແຫ່ງ ຕ້ອງການລະບົບສື່ສານ' : 'clinics need signal'}</span>
        </div>

      </div>

      {/* Recharts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Pie Chart: Signal Status Breakdown */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
            <PieIcon className="w-4 h-4 text-rose-400" />
            {lang === 'la' ? 'ສັດສ່ວນສະຖານະສັນຍານມືຖື ແລະ ອິນເຕີເນັດ (Signal Status Share)' : 'Signal Status Distribution'}
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Villages by Province */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
            <BarChart3 className="w-4 h-4 text-amber-400" />
            {lang === 'la' ? 'ຈຳນວນບ້ານຂາດສັນຍານ ແຍກຕາມແຂວງ' : 'Dead Zone Villages by Province'}
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={provinceBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="province" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="noSignal" name={lang === 'la' ? '🔴 ບໍ່ມີສັນຍານ' : 'No Signal'} fill="#ef4444" />
                <Bar dataKey="weak2g" name={lang === 'la' ? '🟠 2G ອ່ອນ' : 'Weak 2G'} fill="#f97316" />
                <Bar dataKey="good" name={lang === 'la' ? '🟢 4G/5G' : '4G/5G'} fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Carrier Share Comparison */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-3 lg:col-span-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
            <Building2 className="w-4 h-4 text-sky-400" />
            {lang === 'la' ? 'ການປົກຄຸມຂອງ 4 ຄ່າຍ ໂທລະຄົມໃນເຂດຫ່າງໄກສອກຫຼີກ' : 'Carrier Presence in Surveyed Remote Areas'}
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={carrierCoverageData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis dataKey="carrier" type="category" stroke="#94a3b8" fontSize={12} fontWeight="bold" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="covered" name={lang === 'la' ? 'ມີສັນຍານ (Covered)' : 'Covered'} fill="#10b981" />
                <Bar dataKey="noSignal" name={lang === 'la' ? 'ບໍ່ມີສັນຍານ (No Signal)' : 'No Signal'} fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
