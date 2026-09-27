import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'QuanLyHDKhoan' });
  });

  // Server-side Gemini API route for Legal & HR Advisor
  app.post('/api/legal-advisor', async (req, res) => {
    try {
      const { prompt, context } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(503).json({ error: 'GEMINI_API_KEY is not configured' });
      }

      const ai = new GoogleGenAI({ apiKey });
      const systemInstruction = `
Bạn là Chuyên gia Cao cấp về Pháp luật Lao động, Bộ luật Dân sự 2015, Luật Bảo hiểm xã hội 2024 và Luật Thuế TNCN (Nghị định 253/2026/NĐ-CP) của Việt Nam, chuyên tư vấn cho Chi nhánh Vận tải đường sắt Nha Trang.
Nhiệm vụ: Giải đáp câu hỏi, hướng dẫn soạn thảo điều khoản hợp đồng giao khoán công việc theo sản phẩm (vệ sinh rửa toa xe, bốc xếp hàng hóa tại ga), xử lý rủi ro pháp lý để không bị cơ quan chức năng coi là hợp đồng lao động ngụy trang, hướng dẫn khấu trừ thuế 10% đúng quy định.
Trả lời bằng tiếng Việt chuyên nghiệp, trích dẫn chính xác điều khoản luật, ngắn gọn, có gạch đầu dòng rõ ràng và đưa ra phương án xử lý thực tiễn.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemInstruction}\n\nThông tin bối cảnh:\n${context || 'Chi nhánh Vận tải đường sắt Nha Trang'}\n\nCâu hỏi:\n${prompt}` }]
          }
        ]
      });

      return res.json({ text: response.text });
    } catch (error: any) {
      console.error('Gemini API call error:', error);
      return res.status(500).json({ error: error.message || 'Lỗi khi gọi API Gemini' });
    }
  });

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
