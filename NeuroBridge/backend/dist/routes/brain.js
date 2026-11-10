"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.brainRouter = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
exports.brainRouter = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
const getRagBrainUrl = () => (process.env.RAG_BRAIN_URL || 'http://localhost:8000').replace(/\/+$/, '');
// Proxy upload to Python RAG service
exports.brainRouter.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
    }
    try {
        const form = new form_data_1.default();
        form.append('file', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype,
        });
        const response = await axios_1.default.post(`${getRagBrainUrl()}/upload`, form, {
            headers: { ...form.getHeaders() },
        });
        res.json(response.data);
    }
    catch (error) {
        console.error('[Brain Proxy Upload]', error.message);
        res.status(500).json({ error: 'RAG Brain service error or unavailable.' });
    }
});
// Proxy query to Python RAG service
exports.brainRouter.post('/query', async (req, res) => {
    const { query, k } = req.body;
    if (!query) {
        res.status(400).json({ error: 'Query is required' });
        return;
    }
    try {
        const response = await axios_1.default.post(`${getRagBrainUrl()}/query`, { query, k });
        res.json(response.data);
    }
    catch (error) {
        console.error('[Brain Proxy Query]', error.message);
        res.status(500).json({ error: 'RAG Brain service error or unavailable.' });
    }
});
// Status check
exports.brainRouter.get('/status', async (_req, res) => {
    try {
        const response = await axios_1.default.get(`${getRagBrainUrl()}/status`);
        res.json(response.data);
    }
    catch {
        res.json({ status: 'offline' });
    }
});
