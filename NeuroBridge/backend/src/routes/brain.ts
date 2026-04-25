import { Router, Request, Response } from 'express';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';

export const brainRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

const RAG_BRAIN_URL = process.env.RAG_BRAIN_URL || 'http://localhost:8000';

// Proxy upload to Python RAG service
brainRouter.post('/upload', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  try {
    const form = new FormData();
    form.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const response = await axios.post(`${RAG_BRAIN_URL}/upload`, form, {
      headers: { ...form.getHeaders() },
    });

    res.json(response.data);
  } catch (error: any) {
    console.error('[Brain Proxy Upload]', error.message);
    res.status(500).json({ error: 'RAG Brain service error or unavailable.' });
  }
});

// Proxy query to Python RAG service
brainRouter.post('/query', async (req: Request, res: Response): Promise<void> => {
  const { query, k } = req.body;
  if (!query) {
    res.status(400).json({ error: 'Query is required' });
    return;
  }

  try {
    const response = await axios.post(`${RAG_BRAIN_URL}/query`, { query, k });
    res.json(response.data);
  } catch (error: any) {
    console.error('[Brain Proxy Query]', error.message);
    res.status(500).json({ error: 'RAG Brain service error or unavailable.' });
  }
});

// Status check
brainRouter.get('/status', async (_req, res) => {
  try {
    const response = await axios.get(`${RAG_BRAIN_URL}/status`);
    res.json(response.data);
  } catch {
    res.json({ status: 'offline' });
  }
});
