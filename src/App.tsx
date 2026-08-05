import React, { useState, useEffect } from 'react';
import { VillageSurvey, CellTower } from './types';
import { INITIAL_VILLAGE_SURVEYS, INITIAL_CELL_TOWERS } from './data/mockSurveys';
import { Navbar } from './components/Navbar';
import { GisMap } from './components/GisMap';
import { SurveyList } from './components/SurveyList';
import { SurveyForm } from './components/SurveyForm';
import { TowerPlanner } from './components/TowerPlanner';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { VillageDetailModal } from './components/VillageDetailModal';
import { AiAnalysisModal } from './components/AiAnalysisModal';
import { OfflineSyncModal } from './components/OfflineSyncModal';

export default function App() {
  const [lang, setLang] = useState<'la' | 'en'>('la');
  const [activeTab, setActiveTab] = useState<'map' | 'list' | 'add' | 'planner' | 'analytics'>('map');

  // Load Surveys from LocalStorage or Default Mock
  const [surveys, setSurveys] = useState<VillageSurvey[]>(() => {
    const saved = localStorage.getItem('lao_gis_surveys');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved surveys', e);
      }
    }
    return INITIAL_VILLAGE_SURVEYS;
  });

  // Load Cell Towers
  const [towers, setTowers] = useState<CellTower[]>(() => {
    const saved = localStorage.getItem('lao_gis_towers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved towers', e);
      }
    }
    return INITIAL_CELL_TOWERS;
  });

  // Offline Sync Queue State
  const [offlineQueue, setOfflineQueue] = useState<VillageSurvey[]>(() => {
    const saved = localStorage.getItem('lao_gis_offline_queue');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  // Modals state
  const [selectedVillage, setSelectedVillage] = useState<VillageSurvey | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);

  // Tower Placement Mode on Map
  const [isPlacingTowerMode, setIsPlacingTowerMode] = useState(false);
  const [proposedTowerRadiusKm, setProposedTowerRadiusKm] = useState(6.0);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('lao_gis_surveys', JSON.stringify(surveys));
  }, [surveys]);

  useEffect(() => {
    localStorage.setItem('lao_gis_towers', JSON.stringify(towers));
  }, [towers]);

  useEffect(() => {
    localStorage.setItem('lao_gis_offline_queue', JSON.stringify(offlineQueue));
  }, [offlineQueue]);

  // Handlers
  const handleAddSurvey = (newSurvey: VillageSurvey) => {
    // If browser is offline, store in offline queue
    if (!navigator.onLine) {
      newSurvey.isOfflineCreated = true;
      setOfflineQueue((prev) => [newSurvey, ...prev]);
    } else {
      setSurveys((prev) => [newSurvey, ...prev]);
    }
    setActiveTab('map');
    setSelectedVillage(newSurvey);
  };

  const handleDeleteSurvey = (id: string) => {
    if (confirm(lang === 'la' ? 'ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບຂໍ້ມູນບ້ານນີ້?' : 'Are you sure you want to delete this village record?')) {
      setSurveys((prev) => prev.filter((s) => s.id !== id));
      if (selectedVillage?.id === id) setSelectedVillage(null);
    }
  };

  const handleAddTower = (newTower: CellTower) => {
    setTowers((prev) => [newTower, ...prev]);
    setIsPlacingTowerMode(false);
    setActiveTab('map');
  };

  const handleOpenMapToPlaceTower = (radiusKm: number) => {
    setProposedTowerRadiusKm(radiusKm);
    setIsPlacingTowerMode(true);
    setActiveTab('map');
  };

  const handlePlaceProposedTowerFromMap = (lat: number, lng: number) => {
    const newTower: CellTower = {
      id: `TOW-${Date.now().toString().slice(-4)}`,
      name: `ເສົາ USO ໃໝ່ (GPS: ${lat.toFixed(3)}, ${lng.toFixed(3)})`,
      operator: 'Shared/USO',
      lat,
      lng,
      coverageRadiusKm: proposedTowerRadiusKm,
      technology: '4G',
      powerType: 'Solar+Grid',
      isProposed: true,
    };

    setTowers((prev) => [newTower, ...prev]);
    setIsPlacingTowerMode(false);
    alert(lang === 'la' ? `ເພີ່ມເສົາ BTS ໃໝ່ເທິງແຜນທີ່ GIS ສຳເລັດ!` : `Placed proposed tower on map!`);
  };

  const handleSyncOfflineQueue = () => {
    if (offlineQueue.length === 0) return;
    setSurveys((prev) => [...offlineQueue, ...prev]);
    setOfflineQueue([]);
    setIsOfflineModalOpen(false);
    alert(lang === 'la' ? `ຊິງຄ໌ຂໍ້ມູນ Offline ${offlineQueue.length} ບ້ານ ຂຶ້ນລະບົບ Cloud ສຳເລັດ!` : `Synced offline entries to main registry!`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-rose-500 selection:text-white">
      
      {/* Navbar Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        surveys={surveys}
        onOpenAiAdvisor={() => setIsAiModalOpen(true)}
        onOpenOfflineSync={() => setIsOfflineModalOpen(true)}
        offlineQueueCount={offlineQueue.length}
        lang={lang}
        setLang={setLang}
      />

      {/* Main Tab View Router */}
      <main className="flex-1 w-full">
        {activeTab === 'map' && (
          <GisMap
            surveys={surveys}
            towers={towers}
            selectedVillage={selectedVillage}
            onSelectVillage={setSelectedVillage}
            onPlaceProposedTower={handlePlaceProposedTowerFromMap}
            isPlacingTowerMode={isPlacingTowerMode}
            proposedTowerRadiusKm={proposedTowerRadiusKm}
            lang={lang}
          />
        )}

        {activeTab === 'list' && (
          <SurveyList
            surveys={surveys}
            onSelectVillage={setSelectedVillage}
            onDeleteSurvey={handleDeleteSurvey}
            lang={lang}
          />
        )}

        {activeTab === 'add' && (
          <SurveyForm
            onAddSurvey={handleAddSurvey}
            lang={lang}
          />
        )}

        {activeTab === 'planner' && (
          <TowerPlanner
            surveys={surveys}
            towers={towers}
            onAddTower={handleAddTower}
            onOpenMapToPlaceTower={handleOpenMapToPlaceTower}
            lang={lang}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard
            surveys={surveys}
            lang={lang}
          />
        )}
      </main>

      {/* Modals */}
      <VillageDetailModal
        village={selectedVillage}
        onClose={() => setSelectedVillage(null)}
        lang={lang}
      />

      <AiAnalysisModal
        surveys={surveys}
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        lang={lang}
      />

      <OfflineSyncModal
        queue={offlineQueue}
        isOpen={isOfflineModalOpen}
        onClose={() => setIsOfflineModalOpen(false)}
        onSync={handleSyncOfflineQueue}
        onClearQueue={() => setOfflineQueue([])}
        lang={lang}
      />

      {/* Bottom Status Bar */}
      <footer className="h-8 bg-slate-900 border-t border-slate-800 flex items-center justify-between px-6 text-[10px] text-slate-400 font-mono uppercase tracking-widest z-50">
        <div className="flex gap-4 items-center">
          <span>GIS ENGINE: V.4.2.0</span>
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
            SYSTEM READY
          </span>
          <span className="hidden md:inline border-l border-slate-700 pl-4">LAO PDR TELECOM REGISTRY</span>
        </div>
        <div className="italic hidden sm:block text-slate-500">
          {lang === 'la' ? 'ຂໍ້ມູນອັດເດດຫຼ້າສຸດ: ' + new Date().toLocaleDateString('la-LA') + ' (Local Storage)' : 'Last Updated: ' + new Date().toLocaleDateString() + ' (Local Storage)'}
        </div>
      </footer>

    </div>
  );
}
