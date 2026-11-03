# NeuroBridge

Accessible learning platform for dyslexic students.

| Part | Folder | Tech | Local port |
|---|---|---|---|
| Website | `frontend/` | React + Vite + Tailwind | 5147 |
| API | `backend/` | Node + Express + MongoDB | 4000 |
| Adaptive ML service | `ml model/` | Python + Flask + PyTorch | 5001 |
| Document Q&A ("Brain") | `rag_brain/` | Python + FastAPI + FAISS | 8000 |

## Run locally

```bash
# 1. API
cd backend
cp .env.example .env        # then fill in the values
npm install
npm run dev

# 2. Website
cd frontend
cp .env.example .env        # VITE_BACKEND_URL=http://localhost:4000
npm install
npm run dev                 # http://localhost:5147

# 3. ML service
cd "ml model"
pip install -r requirements.txt
python ml_service.py        # Windows: run_ml_service.bat

# 4. Document Q&A
cd rag_brain
pip install -r requirements.txt
python main.py
```

## Deploy

**Website** — `npm run build` in `frontend/` and host the `dist/` folder on any static
host (Vercel, Netlify, …). Set these environment variables on the host:

- `VITE_BACKEND_URL` — public URL of the API, e.g. `https://api.your-domain.com`
- `VITE_MAPBOX_TOKEN` — Mapbox public token (Nearby Care map)

The site uses client-side routing, so the host must send every path to `index.html`
(Vercel/Netlify "SPA rewrite").

**API** — run `npm start` in `backend/` on a Node host (Render, Railway, …).
Copy every key from `backend/.env.example` into the host's environment settings and set:

- `NODE_ENV=production`
- `FRONTEND_URL` — public URL of the website
- `MONGO_URI` — a hosted database (e.g. MongoDB Atlas)
- `GOOGLE_REDIRECT_URI` — `https://<api-domain>/api/auth/google/callback`
  (also add it in Google Cloud Console → Credentials)
- `JWT_SECRET`, `SESSION_SECRET` — new long random values
- `ML_SERVICE_URL`, `RAG_BRAIN_URL` — public URLs of the two Python services

**Python services** — deploy each folder as its own web service
(start commands: `python ml_service.py` and `python main.py`).

Never commit `.env` files; they are listed in `.gitignore`.
