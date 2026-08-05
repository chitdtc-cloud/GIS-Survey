import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'Lao GIS Telecom Survey' });
  });

  // AI Strategic Advisor Endpoint
  app.post('/api/ai-advisor', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ error: 'GEMINI_API_KEY environment variable is missing.' });
      }

      const { surveys } = req.body;
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
You are a senior GIS & Telecommunication Infrastructure Strategic Advisor for Laos Ministry of Technology and Communications (ກະຊວງເຕັກໂນໂລຊີ ແລະ ການສື່ສານ).
Analyze the following surveyed villages data in Laos and provide a strategic Universal Service Obligation (USO) expansion recommendation written in professional Lao language.

Surveys Data:
${JSON.stringify(
  (surveys || []).map((s: any) => ({
    nameLao: s.nameLao,
    province: s.province,
    district: s.district,
    population: s.population,
    schools: s.schools,
    healthCenters: s.healthCenters,
    signalStatus: s.signalStatus,
    priorityScore: s.priorityScore,
    terrain: s.terrain,
    nearestTowerDistanceKm: s.nearestTowerDistanceKm,
  })),
  null,
  2
)}

Please structure your response in clear Lao Markdown:
### 📡 ບົດວິເຄາະຍຸດທະສາດການຂະຫຍາຍສັນຍາມືຖື ແລະ ອິນເຕີເນັດ (USO Telecom Laos)
1. **ພາບລວມປະຊາກອນ ແລະ ເຂດຂາດສັນຍາ (Dead Zones)**
2. **ລາຍຊື່ບ້ານເປົ້າໝາຍເລັ່ງລັດ (Top Priority Villages)**
3. **ຂໍ້ສະເໜີແນະດ້ານເຕັກໂນໂລຊີ (Solar Hybrid 4G vs Satellite/Starlink)**
4. **ແຜນງົບປະມານ ແລະ ການຮ່ວມມືກັບ 4 ຄ່າຍ (LTC, Unitel, TPlus, ETL)**
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      res.json({ analysis: response.text });
    } catch (error: any) {
      console.error('AI Strategy Error:', error);
      res.status(500).json({ error: error?.message || 'Error generating AI analysis' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
