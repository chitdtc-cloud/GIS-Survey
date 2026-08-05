import React from 'react';
import { 
  Map, 
  Table, 
  PlusCircle, 
  Radio, 
  BarChart3, 
  WifiOff, 
  ShieldAlert, 
  Building2, 
  Users,
  Wifi,
  Globe
} from 'lucide-react';
import { VillageSurvey } from '../types';

interface NavbarProps {
  activeTab: 'map' | 'list' | 'add' | 'planner' | 'analytics';
  setActiveTab: (tab: 'map' | 'list' | 'add' | 'planner' | 'analytics') => void;
  surveys: VillageSurvey[];
  onOpenAiAdvisor: () => void;
  onOpenOfflineSync: () => void;
  offlineQueueCount: number;
  lang: 'la' | 'en';
  setLang: (lang: 'la' | 'en') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  surveys,
  onOpenAiAdvisor,
  onOpenOfflineSync,
  offlineQueueCount,
  lang,
  setLang
}) => {
  // Stats
  const totalVillages = surveys.length;
  const noSignalVillages = surveys.filter(s => s.signalStatus === 'NO_SIGNAL').length;
  const deadZonePop = surveys
    .filter(s => s.signalStatus === 'NO_SIGNAL' || s.signalStatus === 'WEAK_2G')
    .reduce((acc, curr) => acc + curr.population, 0);
  const highPriorityCount = surveys.filter(s => s.priorityScore >= 80).length;

  return (
    <header className="bg-slate-900 text-white shadow-lg border-b border-slate-800 sticky top-0 z-[1000]">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded flex items-center justify-center font-bold text-xl text-white shadow-md border border-indigo-500/50">
                G
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-bold text-lg leading-tight tracking-tight uppercase text-white">
                    {lang === 'la' ? 'GIS SURVEYOR' : 'GIS SURVEYOR'}{' '}
                    <span className="text-indigo-400 font-light">LAO PDR</span>
                  </h1>
                  <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 rounded tracking-wider">
                    USO TELECOM
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 block tracking-normal mt-0.5">
                  {lang === 'la' ? 'ພະແນກ ເຕັກໂນໂລຊີ ແລະ ການສື່ສານ ແຂວງສະຫວັນນະເຂດ • ສຳຫລວດບ້ານບໍ່ມີສັນຍານມືຖື ແລະ ອິນເຕີເນັດດ້ວຍ ລະບົບ GIS' : 'Department of Technology & Communications, Savannakhet Province • Coverage Survey & USO Planning'}
                </p>
              </div>
            </div>

          {/* Quick Stats Badges */}
          <div className="hidden lg:flex items-center gap-4 text-xs">
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-1.5 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-slate-400 block text-[10px]">{lang === 'la' ? 'ບ້ານສຳຫລວດແລ້ວ' : 'Surveyed'}</span>
                <span className="font-bold text-slate-100">{totalVillages} {lang === 'la' ? 'ບ້ານ' : 'vils'}</span>
              </div>
            </div>

            <div className="bg-red-950/50 border border-red-800/50 rounded-lg px-3 py-1.5 flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-red-400" />
              <div>
                <span className="text-red-300 block text-[10px]">{lang === 'la' ? 'ບໍ່ມີສັນຍານເລີຍ' : 'Dead Zones'}</span>
                <span className="font-bold text-red-200">{noSignalVillages} {lang === 'la' ? 'ບ້ານ' : 'vils'}</span>
              </div>
            </div>

            <div className="bg-amber-950/50 border border-amber-800/50 rounded-lg px-3 py-1.5 flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-amber-300 block text-[10px]">{lang === 'la' ? 'ປະຊາກອນຂາດສັນຍານ' : 'Unserved Pop.'}</span>
                <span className="font-bold text-amber-200">{deadZonePop.toLocaleString()} {lang === 'la' ? 'ຄົນ' : ''}</span>
              </div>
            </div>

            <div className="bg-rose-950/50 border border-rose-800/50 rounded-lg px-3 py-1.5 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <div>
                <span className="text-rose-300 block text-[10px]">{lang === 'la' ? 'ເປົ້າໝາຍດ່ວນ (USO)' : 'High Priority'}</span>
                <span className="font-bold text-rose-200">{highPriorityCount} {lang === 'la' ? 'ບ້ານ' : 'vils'}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Language & Offline Queue & AI Assistant */}
          <div className="flex items-center gap-2">
            
            {/* AI Advisor Button */}
            <button
              onClick={onOpenAiAdvisor}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-colors border border-indigo-400/30"
              title="AI GIS Advisor"
            >
              <Wifi className="w-3.5 h-3.5 text-indigo-200 animate-spin" />
              <span className="hidden sm:inline">{lang === 'la' ? 'ປັນຍາປະດິດວິເຄາະ' : 'AI Advisor'}</span>
            </button>

            {/* Offline Sync Status */}
            <button
              onClick={onOpenOfflineSync}
              className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors border ${
                offlineQueueCount > 0
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
              title="Offline Survey Queue"
            >
              <span className={`w-2 h-2 rounded-full ${offlineQueueCount > 0 ? 'bg-rose-500' : 'bg-emerald-400'}`} />
              <span className="hidden sm:inline">
                {offlineQueueCount > 0 ? `${offlineQueueCount} Offline` : 'Offline Sync'}
              </span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'la' ? 'en' : 'la')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider border border-slate-700 flex items-center gap-1"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{lang === 'la' ? 'ລາວ' : 'EN'}</span>
            </button>

          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-950 border-t border-slate-800 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto no-scrollbar">
          <nav className="flex space-x-1 sm:space-x-2 py-2">
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                activeTab === 'map'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
              }`}
            >
              <Map className="w-4 h-4" />
              <span>{lang === 'la' ? '🗺️ ແຜນທີ່ GIS' : 'GIS Map View'}</span>
            </button>

            <button
              onClick={() => setActiveTab('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                activeTab === 'list'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
              }`}
            >
              <Table className="w-4 h-4" />
              <span>{lang === 'la' ? '📋 ຕາຕະລາງສຳຫລວດ' : 'Survey List'}</span>
            </button>

            <button
              onClick={() => setActiveTab('add')}
              className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                activeTab === 'add'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>{lang === 'la' ? '📝 ບັນທຶກສຳຫລວດໃໝ່' : 'New Survey Log'}</span>
            </button>

            <button
              onClick={() => setActiveTab('planner')}
              className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                activeTab === 'planner'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>{lang === 'la' ? '📡 ວາງແຜນເສົາ BTS' : 'BTS Tower Simulator'}</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>{lang === 'la' ? '📊 ສະຖິຕິ & ລາຍງານ' : 'GIS Analytics'}</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
