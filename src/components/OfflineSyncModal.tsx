import React from 'react';
import { VillageSurvey } from '../types';
import { X, CloudUpload, CheckCircle2, WifiOff, Trash2, ShieldCheck } from 'lucide-react';

interface OfflineSyncModalProps {
  queue: VillageSurvey[];
  isOpen: boolean;
  onClose: () => void;
  onSync: () => void;
  onClearQueue: () => void;
  lang: 'la' | 'en';
}

export const OfflineSyncModal: React.FC<OfflineSyncModalProps> = ({
  queue,
  isOpen,
  onClose,
  onSync,
  onClearQueue,
  lang,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="bg-slate-900 border-b border-slate-800 p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <CloudUpload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {lang === 'la' ? 'ຄັງເກັບຂໍ້ມູນສຳຫລວດ Offline (Queue)' : 'Offline Survey Sync Queue'}
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'la' ? 'ຂໍ້ມູນທີ່ບັນທຶກຕອນບໍ່ມີສັນຍານມືຖື ຈະຖືກເກັບໄວ້ໃນເຄື່ອງ' : 'Surveys collected in zero-signal zones'}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {queue.length === 0 ? (
            <div className="text-center py-8 space-y-2 text-slate-400">
              <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto" />
              <p className="font-semibold text-slate-200">
                {lang === 'la' ? 'ບໍ່ມີຂໍ້ມູນຄ້າງ Cloud Sync! ທຸກບ້ານຖືກຊິງຄ໌ແລ້ວ' : 'All surveys synced to cloud database!'}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {queue.map((item) => (
                  <div key={item.id} className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">{item.nameLao}</div>
                      <div className="text-[10px] text-slate-400">{item.district}, {item.province} • {item.surveyDate}</div>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] bg-amber-950 text-amber-300 border border-amber-800 rounded">
                      Pending Sync
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-800">
                <button
                  onClick={onClearQueue}
                  className="text-slate-400 hover:text-rose-400 text-xs flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{lang === 'la' ? 'ລຶບຄັງຄ້າງ' : 'Clear Queue'}</span>
                </button>

                <button
                  onClick={onSync}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-5 rounded-xl text-xs flex items-center gap-1.5 shadow"
                >
                  <CloudUpload className="w-4 h-4" />
                  <span>{lang === 'la' ? 'ຊິງຄ໌ຂໍ້ມູນຂຶ້ນ Cloud (' + queue.length + ' ບ້ານ)' : 'Sync to Cloud (' + queue.length + ')'}</span>
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
