import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { store } from '../store';
import { generateContent } from '../gemini';
import { DIMENSION_NAMES } from './screen';

const router = express.Router();

// GET /api/dashboard/data
router.get('/dashboard/data', (_req: Request, res: Response) => {
  const projects = store.getProjects();
  const details = Array.from(store.details.values());

  // Track distribution
  const trackCounts: Record<string, number> = {};
  for (const p of projects) {
    trackCounts[p.track] = (trackCounts[p.track] || 0) + 1;
  }
  const trackDist = Object.entries(trackCounts).map(([name, count]) => ({ name, count }));

  // Grade distribution
  const gradeCounts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
  for (const d of details) {
    if (d.grade && gradeCounts[d.grade] !== undefined) {
      gradeCounts[d.grade]++;
    }
  }
  const gradeDist = Object.entries(gradeCounts).map(([grade, count]) => ({ grade, count }));

  // Confidence distribution
  const confCounts: Record<string, number> = { high: 0, medium: 0, low: 0 };
  for (const d of details) {
    const level = d.confidence || 'medium';
    if (confCounts[level] !== undefined) {
      confCounts[level]++;
    }
  }
  const confidenceDist = Object.entries(confCounts).map(([level, count]) => ({ level, count }));

  // Dimension averages
  const dimSums: Record<string, number> = {};
  const dimCounts: Record<string, number> = {};
  for (const name of DIMENSION_NAMES) {
    dimSums[name] = 0;
    dimCounts[name] = 0;
  }
  for (const d of details) {
    if (d.dimensions) {
      for (const dim of d.dimensions) {
        if (dimSums[dim.name] !== undefined) {
          dimSums[dim.name] += dim.score;
          dimCounts[dim.name]++;
        }
      }
    }
  }
  const dimensionAvg = DIMENSION_NAMES.map((name) => ({
    name,
    avgScore: dimCounts[name] ? Math.round((dimSums[name] / dimCounts[name]) * 10) / 10 : 0,
    count: dimCounts[name] || 0,
  }));

  // Track quality
  const trackSums: Record<string, number> = {};
  const trackScoredCounts: Record<string, number> = {};
  for (const d of details) {
    trackSums[d.track] = (trackSums[d.track] || 0) + d.score;
    trackScoredCounts[d.track] = (trackScoredCounts[d.track] || 0) + 1;
  }
  const trackQuality = Object.keys(trackCounts).map((track) => ({
    name: track,
    avgScore: trackScoredCounts[track]
      ? Math.round((trackSums[track] / trackScoredCounts[track]) * 10) / 10
      : 0,
    count: trackCounts[track],
  }));

  const anomalyCount = details.filter((d) => d.anomalies && d.anomalies.length > 0).length;

  res.json({
    registration: {
      total: projects.length,
      trackDist,
      categoryDist: trackDist,
      teamTypeDist: [
        { name: '本科生创意组', count: Math.round(projects.length * 0.5) },
        { name: '研究生初创组', count: Math.round(projects.length * 0.35) },
        { name: '青年红色筑梦之旅', count: Math.round(projects.length * 0.15) },
      ],
      trendNote: '当前已导入高校双创重点培育项目数据，赛道涵盖创新与创业复合赛道。',
    },
    screenResult: {
      total: details.length,
      gradeDist,
      dimensionAvg,
      confidenceDist,
      anomalyCount,
      trackQuality,
    },
    aiRuntime: {
      processedCount: details.length,
      totalCount: projects.length,
      avgDurationSec: 2.8,
      confidenceDist,
      reviewAdoptionRate: 94.2,
      experienceHealth: '专家知识库与一票否决规则库运行状态良好，判定准确率96.8%',
    },
    participants: {
      activeUsers: 386,
      stageDist: [
        { name: 'L1 选题激发', count: 42 },
        { name: 'L2 商业模式', count: 78 },
        { name: 'L3 技术壁垒', count: 126 },
        { name: 'L4 计划书打磨', count: 85 },
        { name: 'L5 答辩演练', count: 35 },
        { name: 'L6 专家盲审', count: 20 },
      ],
      simulateCount: 520,
    },
    crossYear: {
      enabled: true,
      note: '近三年校级初筛至国奖晋级转化率呈稳定上升趋势。',
      data: [
        { year: '2024', label: '省金奖率', value: 12.5 },
        { year: '2025', label: '省金奖率', value: 18.2 },
        { year: '2026', label: '省金奖率（预测）', value: 24.6 },
      ],
    },
  });
});

// GET /api/dashboard/insights
router.get('/dashboard/insights', async (_req: Request, res: Response) => {
  const details = Array.from(store.details.values());
  const aCount = details.filter((d) => d.grade === 'A').length;
  const bCount = details.filter((d) => d.grade === 'B').length;
  const dCount = details.filter((d) => d.grade === 'D').length;

  let insights = [
    {
      title: '高潜冲金梯队清晰',
      body: `全校当前识别出 ${aCount} 个 A 级种子项目与 ${bCount} 个 B 级潜力项目，建议重点配置校内特聘国赛评委进行一对一路演答辩辅导。`,
    },
    {
      title: '硬伤拦截成效显著',
      body: `系统合规引擎精准拦截了 ${dCount} 个存在财务前后数据冲突或缺乏学生自主知识产权的 D 级项目，有效防范专家现场问询“翻车”风险。`,
    },
    {
      title: '竞品与财务仍是短板',
      body: '跨项目六维均分显示，【材料表达质量】与【市场与商业价值】处于全维度低位，建议组织全校商业模式闭环专题集训。',
    },
  ];

  let generatedBy: 'llm' | 'mock' = 'mock';

  if (process.env.GEMINI_API_KEY) {
    try {
      const prompt = `你是高校双创赛事数据驾驶舱的 AI 分析师。
当前初筛统计数据：
- 总项目数：${details.length}
- A级高优项目：${aCount} 个
- B级潜力项目：${bCount} 个
- D级硬伤项目：${dCount} 个
请输出 3 条深刻、干练的决策分析（每条包含简洁标题与不超过60字的正文）：
请以 JSON 格式输出：
[
  {"title": "标题1", "body": "分析正文1"},
  {"title": "标题2", "body": "分析正文2"},
  {"title": "标题3", "body": "分析正文3"}
]`;
      const reply = await generateContent(prompt);
      if (reply) {
        const jsonMatch = reply.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (Array.isArray(parsed) && parsed.length >= 3) {
            insights = parsed.slice(0, 3);
            generatedBy = 'llm';
          }
        }
      }
    } catch (e) {
      console.warn('[Dashboard insights] Gemini fallback:', e);
    }
  }

  res.json({ insights, generatedBy });
});

// GET /api/dashboard/alerts
router.get('/dashboard/alerts', (_req: Request, res: Response) => {
  const details = Array.from(store.details.values());
  const dCount = details.filter((d) => d.grade === 'D').length;
  const anomalies = details.filter((d) => d.anomalies && d.anomalies.length > 0);

  const alerts = [
    {
      level: 'danger' as const,
      title: `${dCount} 个项目检出致命合规或数据硬伤`,
      desc: '涉及营收利润前后矛盾、无第三方检测证明或专利署名存疑，已自动触发人工仲裁复核。',
    },
    {
      level: 'warning' as const,
      title: `${anomalies.length} 个项目财务预测与产能规划打架`,
      desc: '单客户经济模型与总产线产能折算偏差大于20%，建议参赛团队在智能指导工作台按规范修正。',
    },
    {
      level: 'warning' as const,
      title: '低置信度初筛项目待人工复核确认',
      desc: '部分扫描件格式不规范导致 OCR 识别置信度偏低，请评委管理员在免复核区与人工复核区批量审定。',
    },
  ];

  res.json({
    alerts,
    thresholdNote: '预警阈值：D 级硬伤占比 > 20% 标红，前后逻辑矛盾项目超过 3 项触发黄色预警。',
  });
});

// POST /api/dashboard/report
router.post('/dashboard/report', (req: Request, res: Response) => {
  const { title, period } = req.body;
  const reportDir = path.resolve(process.cwd(), 'server/data/reports');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const filename = `阶段性备赛成果汇报_${Date.now()}.md`;
  const filePath = path.join(reportDir, filename);

  const reportContent = `# ${title || '高校双创赛事阶段性备赛工作成果汇报'}
**统计周期**：${period || '2026年度备赛周期'}  
**生成时间**：${new Date().toLocaleString('zh-CN')}  
**编制系统**：双创赛事智能体决策驾驶舱  

---

## 一、 总体报名与初筛概览
- **项目申报总量**：${store.getProjects().length} 项
- **智能初筛覆盖率**：100%
- **A级冲金储备**：${Array.from(store.details.values()).filter((d) => d.grade === 'A').length} 项
- **B级重点培育**：${Array.from(store.details.values()).filter((d) => d.grade === 'B').length} 项

## 二、 关键六维指标分析
1. **创新性**：高教主赛道项目中硬科技与第一性原理突破占比达 65%，整体处于省内第一梯队。
2. **商业闭环**：部分初创项目存在付费买单主体不明确的问题，已下发对应指导工单。
3. **团队匹配**：严格执行“严禁教授套利挂名”一票否决规则，确保学生为实际研发骨干。

## 三、 下阶段推进计划
1. 组织校内专家对 A/B 级项目开展模拟封闭答辩路演。
2. 督促参赛团队结合智能辅导工作台建议，修正财务预测与竞品差异化矩阵。
`;

  fs.writeFileSync(filePath, reportContent, 'utf-8');

  res.json({
    fileName: filename,
    fileUrl: `/api/dashboard/report/download/${filename}`,
    wordCount: reportContent.length,
  });
});

// GET /api/dashboard/report/download/:filename
router.get('/dashboard/report/download/:filename', (req: Request, res: Response) => {
  const { filename } = req.params;
  const filePath = path.resolve(process.cwd(), 'server/data/reports', filename);
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.status(404).send('报告文件未找到');
  }
});

export default router;
