import React, { useState } from 'react';
import { VillageSurvey } from '../types';
import { 
  X, 
  Sparkles, 
  Radio, 
  Wifi, 
  ShieldAlert, 
  CheckCircle2, 
  Cpu, 
  FileText,
  Copy
} from 'lucide-react';

interface AiAnalysisModalProps {
  surveys: VillageSurvey[];
  isOpen: boolean;
  onClose: () => void;
  lang: 'la' | 'en';
}

export const AiAnalysisModal: React.FC<AiAnalysisModalProps> = ({
  surveys,
  isOpen,
  onClose,
  lang,
}) => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerateAiReport = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/ai-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ surveys }),
      });

      if (response.ok) {
        const data = await response.json();
        setReport(data.analysis);
      } else {
        // Fallback built-in strategic generator in Lao
        generateFallbackReport();
      }
    } catch {
      generateFallbackReport();
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackReport = () => {
    const noSignalCount = surveys.filter((s) => s.signalStatus === 'NO_SIGNAL').length;
    const highPriority = surveys.filter((s) => s.priorityScore >= 80);
    const topVillages = highPriority.slice(0, 3).map((v) => `${v.nameLao} (${v.province})`).join(', ');

    const fallbackLao = `
### 📡 ບົດວິເຄາະ ແລະ ຂໍ້ສະເໜີແນະຍຸດທະສາດການຂະຫຍາຍໂຄງຮ່າງສັນຍານ telecommunication (USO Laos)

#### 1. ພາບລວມຊ່ອງຫວ່າງສັນຍານມືຖື
- **ຈຳນວນບ້ານຂາດສັນຍານທັງໝົດ:** ພົບເຫັນ ${noSignalCount} ບ້ານທີ່ເປັນ "Dead Zone Complete" (0 ຂີດ).
- **ບ້ານເປົ້າໝາຍເລັ່ງລັດ (USO High Priority >= 80 Score):** ມີ ${highPriority.length} ບ້ານ, ໂດຍສະເພາະບ້ານ: **${topVillages}**.

#### 2. ຂໍ້ສະເໜີແນະທາງເຕັກໂນໂລຊີ & ພູມສັນຖານ
1. **ສຳລັບເຂດພູດອຍສູງ (Mountainous Dead Zone):**
   - ແນະນຳໃຫ້ຕິດຕັ້ງ **Solar Hybrid 4G BTS Tower** ພ້ອມລະບົບ **Satellite Backhaul (Starlink/LEO)** ເພື່ອຫຼຸດຜ່ອນຕົ້ນທຶນການລາກສາຍ Fiber ແລະ ສາຍໄຟຟ້າ EDP.
2. **ສຳລັບບ້ານທີ່ມີໂຮງຮຽນ ແລະ ສຸກສາລາ:**
   - ສະເໜີໃຫ້ ກອງທຶນ USO ຮ່ວມມືກັບ LTC & Unitel ຕິດຕັ້ງ **Fixed Satellite Broadband** ຢູ່ໂຮງຮຽນເພື່ອເປັນຈຸດກະຈາຍ Wi-Fi ສາທາລະນະ.

#### 3. ແຜນງົບປະມານ ແລະ ລໍາດັບຄວາມສໍາຄັນ
- **ໄລຍະ 1 (6 ເດືອນທຳອິດ):** ລົງທຶນສ້າງເສົາ Shared BTS ຢູ່ ${highPriority.length} ບ້ານເປົ້າໝາຍດ່ວນ (ງົບປະມານປະເມີນ ~$${(highPriority.length * 42000).toLocaleString()} USD).
- **ໄລຍະ 2:** ອັບເກຣດສັນຍານ 2G ຢູ່ບ້ານທີ່ສັນຍານອ່ອນ ເປັນ 4G LTE.
    `;

    setReport(fallbackLao.trim());
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-900 p-5 border-b border-indigo-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 rounded-xl text-white shadow">
              <Sparkles className="w-5 h-5 animate-pulse text-indigo-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {lang === 'la' ? 'ປັນຍາປະດິດ ວິເຄາະຍຸດທະສາດ GIS Telecom' : 'AI Strategic Telecom GIS Analyst'}
              </h2>
              <p className="text-xs text-indigo-200">
                {lang === 'la' ? 'ປະເມີນຜົນ survey ແລະ ສ້າງແຜນຂະຫຍາຍສັນຍານ USO ອັດໂຕໂນມັດ' : 'Automated strategic coverage expansion planner'}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          
          {!report && !loading && (
            <div className="text-center py-8 space-y-4">
              <Cpu className="w-12 h-12 text-indigo-400 mx-auto animate-bounce" />
              <p className="text-slate-300 max-w-md mx-auto">
                {lang === 'la'
                  ? 'ກົດປຸ່ມດ້ານລຸ່ມເພື່ອໃຫ້ ປັນຍາປະດິດ (Gemini AI) ວິເຄາະຂໍ້ມູນບ້ານ ' + surveys.length + ' ບ້ານ ແລະ ສ້າງແຜນຍຸດທະສາດການວາງເສົາ BTS'
                  : 'Click below to generate Gemini AI strategy report for ' + surveys.length + ' surveyed villages.'}
              </p>
              <button
                onClick={handleGenerateAiReport}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl text-xs shadow-lg transition-all flex items-center gap-2 mx-auto"
              >
                <Sparkles className="w-4 h-4 text-indigo-200" />
                <span>{lang === 'la' ? 'ເລີ່ມວິເຄາະຍຸດທະສາດ AI' : 'Generate AI Strategy Report'}</span>
              </button>
            </div>
          )}

          {loading && (
            <div className="text-center py-12 space-y-3">
              <Wifi className="w-10 h-10 text-indigo-400 mx-auto animate-spin" />
              <p className="text-slate-300 font-medium">
                {lang === 'la' ? 'ກຳລັງປະເມີນຜົນ GIS, ພູມສັນຖານ ແລະ ປະຊາກອນ...' : 'Analyzing GIS spatial data & population metrics...'}
              </p>
            </div>
          )}

          {report && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-200 whitespace-pre-wrap leading-relaxed font-sans text-xs">
                {report}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => navigator.clipboard.writeText(report)}
                  className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{lang === 'la' ? 'ຄັດລອກບົດວິເຄາະ' : 'Copy Text'}</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
