import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { store } from '../store';

const router = express.Router();

router.get('/materials/:id/:filename', (req: Request, res: Response) => {
  const { id, filename } = req.params;
  const matInfo = store.getMaterialPath(id);
  if (!matInfo) {
    return res.status(404).send('未找到该项目的材料文件路径');
  }

  const filePath = path.join(matInfo.fullPath, filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send(`文件 ${filename} 不存在`);
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    // Render as a clean HTML view
    const escaped = raw
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${filename} - 材料查看</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      background: #f9fafb;
      margin: 0;
      padding: 24px;
    }
    .container {
      max-width: 880px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 32px 40px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .header {
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 16px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    h1 {
      font-size: 20px;
      margin: 0;
      color: #111827;
    }
    pre {
      white-space: pre-wrap;
      word-break: break-word;
      font-size: 14px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      line-height: 1.7;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      background: #eff6ff;
      color: #1d4ed8;
      font-size: 12px;
      border-radius: 9999px;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📄 ${filename}</h1>
      <span class="badge">申报原始材料</span>
    </div>
    <pre>${escaped}</pre>
  </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err: any) {
    res.status(500).send(`读取材料失败: ${err.message}`);
  }
});

export default router;
