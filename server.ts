import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import screenRouter from './server/routes/screen';
import guidanceRouter from './server/routes/guidance';
import coachRouter from './server/routes/coach';
import dashboardRouter from './server/routes/dashboard';
import materialsRouter from './server/routes/materials';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Health check API
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      app_name: '双创赛事智能体',
      version: '0.1.0',
      llmEnabled: Boolean(process.env.GEMINI_API_KEY),
      activePreset: process.env.GEMINI_API_KEY ? 'gemini' : 'mock',
    });
  });

  // Mount API routers
  app.use('/api', screenRouter);
  app.use('/api', guidanceRouter);
  app.use('/api', coachRouter);
  app.use('/api', dashboardRouter);
  app.use(materialsRouter);

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[双创赛事智能体] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
