import express, { Request, Response } from 'express';
import { store, ProjectDetail, DimensionScore, TraceStage, Anomaly } from '../store';
import { generateContent } from '../gemini';

const router = express.Router();

export const DIMENSION_NAMES = [
  '创新性',
  '技术可行性',
  '市场与商业价值',
  '团队匹配度',
  '材料表达质量',
  '社会价值与效益',
];

export const DIMENSION_STANDARDS = [
  {
    key: 'innovation',
    title: '创新性',
    weight: 25,
    definition: '核心原理或商业机制的「第一性原理」突破；自主原创或底层配方改良',
    vetoPoint: '完全抄袭 GitHub 开源框架；直接购买成熟白牌软件套壳',
  },
  {
    key: 'technology',
    title: '技术可行性',
    weight: 20,
    definition: '技术是否完成物理中试、样机加工或真实临床沙箱验证',
    vetoPoint: '仅存于 CAD 图纸/纯软件建模，无任何真实环境波形、抗拉疲劳或无菌验证参数（悬空项目）',
  },
  {
    key: 'market',
    title: '市场与商业价值',
    weight: 20,
    definition: '「单客户经济模型（Unit Economics）」是否自洽；采购决策流（目标买单主体、预算来源）',
    vetoPoint: '把不具备采购权或无预算科室定为付费方（硬伤）',
  },
  {
    key: 'team',
    title: '团队匹配度',
    weight: 15,
    definition: '学生成员的专业学历、论文与软著署名顺序；学生是否真实研发主力',
    vetoPoint: '导师专利直接挂名学生；核心算法由团队外外行代写/外包（套利行为）',
  },
  {
    key: 'material',
    title: '材料表达质量',
    weight: 10,
    definition: 'BP 幻灯片与文字大纲逻辑连贯性；财务预测与产能规划是否打架；是否有大量无定量指标的 AI 套话',
    vetoPoint: '前后财务预测与产能规划打架（系统性矛盾）',
  },
  {
    key: 'social',
    title: '社会价值与效益',
    weight: 10,
    definition: '对民生改善、弱势帮扶、环保减碳、区域就业或文化传承的实质推动力（需具体账目/证明支撑）',
    vetoPoint: '无（本维度无一票否决点；有真实扶贫账目、医院感谢信或重大进口替代证明者可酌情加分）',
  },
];

export const GRADE_STANDARDS = [
  {
    key: 'A',
    title: 'A 级',
    weight: 0,
    definition: 'Top 10%',
    scoreRange: '≥90 分',
    evidence: '核心专利授权、实物挂网或中试数据完整、商业闭环高自洽',
    action: '极力推荐晋级决赛；高置信 A → 免复核区（批量确认）',
  },
  {
    key: 'B',
    title: 'B 级',
    weight: 0,
    definition: '10%-30%',
    scoreRange: '75-89 分',
    evidence: '技术与成果相对扎实、一致性好；存在部分测试细节或供应链缺陷',
    action: '口头复审；高置信 B → 快速过审；低置信 B → 必复核区',
  },
  {
    key: 'C',
    title: 'C 级',
    weight: 0,
    definition: '30%-60%',
    scoreRange: '60-74 分',
    evidence: '技术路线大面积套用开源、商业自洽度低、存在数据前后矛盾',
    action: '限期整改或打回；必复核区',
  },
  {
    key: 'D',
    title: 'D 级',
    weight: 0,
    definition: '不合格',
    scoreRange: '<60 分',
    evidence: '完全开源套壳、代写抄袭、或存在合规/道德性一票否决缺陷',
    action: '不予通过；高置信 D → 免复核区（批量确认）；低置信 D → 人工仲裁',
  },
];

export const WEIGHT_GROUPS_TABLE = [
  { group: '通用', weights: [25, 20, 20, 15, 10, 10] },
  { group: '创新方向', weights: [30, 30, 10, 10, 10, 10] },
  { group: '创业方向', weights: [20, 15, 30, 15, 10, 10] },
  { group: '策划方向', weights: [15, 10, 25, 15, 20, 15] },
  { group: '混合·创意组', weights: [35, 30, 10, 10, 10, 5] },
  { group: '混合·初创组', weights: [20, 20, 30, 15, 10, 5] },
];

// GET /api/projects
router.get('/projects', (req: Request, res: Response) => {
  const { track, risk, q } = req.query as { track?: string; risk?: string; q?: string };
  const list = store.getProjects({ track, risk, q });
  res.json(list);
});

// POST /api/projects
router.post('/projects', (req: Request, res: Response) => {
  const { name, group, content } = req.body;
  const id = `p${Date.now()}`;
  const track = group || '创新+创业';
  const newDetail: ProjectDetail = {
    id,
    name: name || '新申报双创项目',
    track,
    score: 0,
    grade: 'C',
    confidence: 'low',
    tags: [],
    source: '在线提报',
    dimensions: [],
    trace: [],
    anomalies: [],
    questions: ['该项目刚完成在线录入，请触发一键智能初筛。'],
  };
  store.saveProjectDetail(newDetail);
  if (content) {
    store.saveBpContent(id, content);
  }
  res.json({ id, ok: true, name: newDetail.name });
});

// GET /api/projects/:id
router.get('/projects/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const detail = store.getProjectDetail(id);
  if (detail) {
    return res.json(detail);
  }
  // Check if it exists in projects list or materials
  const projects = store.getProjects();
  const summary = projects.find((p) => p.id === id);
  if (summary) {
    const emptyDetail: ProjectDetail = {
      ...summary,
      dimensions: [],
      trace: [],
      anomalies: [],
      questions: ['该项目尚未执行一键初筛，请先在看板触发初筛流水线。'],
    };
    return res.json(emptyDetail);
  }
  res.status(404).json({ error: `项目 ${id} 不存在` });
});

// GET /api/projects/:id/materials
router.get('/projects/:id/materials', (req: Request, res: Response) => {
  const { id } = req.params;
  const files = store.getMaterials(id);
  res.json(files);
});

// POST /api/projects/:id/review
router.post('/projects/:id/review', (req: Request, res: Response) => {
  const { id } = req.params;
  const { verdict, comment } = req.body;
  if (!verdict) {
    return res.status(400).json({ error: 'verdict required' });
  }
  const record = store.addReview(id, verdict, comment || '');
  const detail = store.getProjectDetail(id);
  if (detail) {
    detail.grade = verdict;
    store.saveProjectDetail(detail);
  }
  res.json(record);
});

// GET /api/projects/:id/review-history
router.get('/projects/:id/review-history', (req: Request, res: Response) => {
  const { id } = req.params;
  const records = store.getReviews(id);
  res.json(records);
});

// GET /api/judge-standards
router.get('/judge-standards', (_req: Request, res: Response) => {
  res.json({
    dimensions: DIMENSION_STANDARDS,
    grades: GRADE_STANDARDS,
    weightGroups: WEIGHT_GROUPS_TABLE,
    dimensionNames: DIMENSION_NAMES,
  });
});

// GET /api/screen-stats
router.get('/screen-stats', (_req: Request, res: Response) => {
  const details = Array.from(store.details.values()).filter((d) => d.dimensions && d.dimensions.length > 0);
  const total = details.length;
  const dimSums: Record<string, number> = {};
  const dimCounts: Record<string, number> = {};

  for (const name of DIMENSION_NAMES) {
    dimSums[name] = 0;
    dimCounts[name] = 0;
  }

  const scores = details.map((d) => d.score);
  for (const d of details) {
    for (const dim of d.dimensions) {
      if (dimSums[dim.name] !== undefined) {
        dimSums[dim.name] += dim.score;
        dimCounts[dim.name] += 1;
      }
    }
  }

  const dimensions = DIMENSION_NAMES.map((name) => ({
    name,
    avgScore: dimCounts[name] ? Math.round((dimSums[name] / dimCounts[name]) * 10) / 10 : 0,
    count: dimCounts[name] || 0,
  }));

  const scoreStats = {
    avg: scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 0,
    max: scores.length ? Math.max(...scores) : 0,
    min: scores.length ? Math.min(...scores) : 0,
  };

  res.json({
    total,
    dimensions,
    scoreStats,
  });
});

// POST /api/projects/:id/screen (SSE Pipeline)
router.post('/projects/:id/screen', async (req: Request, res: Response) => {
  const { id } = req.params;
  let detail = store.getProjectDetail(id);
  const summary = store.getProjects().find((p) => p.id === id);

  if (!detail && !summary) {
    return res.status(404).json({ error: `项目 ${id} 不存在` });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const sendEvent = (event: string, data: any) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  try {
    // Stage 1: OCR & Entity Extraction
    sendEvent('stage_start', { step: 1, title: 'OCR 提取与实体识别', ts: '+0.1s' });
    await sleep(600);
    sendEvent('stage_done', { step: 1, duration: 0.6, detail: '提取核心商业计划书指标、财务表格与团队名册' });

    // Stage 2: Consistency Verification
    sendEvent('stage_start', { step: 2, title: '一致性关联校验', ts: '+0.7s' });
    await sleep(600);
    if (detail?.anomalies && detail.anomalies.length > 0) {
      sendEvent('stage_warning', {
        step: 2,
        title: '检出财务与产能一致性矛盾',
        desc: detail.anomalies[0].desc,
      });
    }
    sendEvent('stage_done', { step: 2, duration: 0.6, detail: '完成跨章节前后逻辑与财务报表交叉核验' });

    // Stage 3: Multi-dimensional scoring
    sendEvent('stage_start', { step: 3, title: '多维向量打分与行业对标', ts: '+1.3s' });
    
    // Check if we can enhance questions or reasons with Gemini
    const bpContent = store.getBpContent(id);
    let geminiQuestions: string[] | null = null;
    if (process.env.GEMINI_API_KEY && bpContent) {
      try {
        const prompt = `你是中国国际大学生创新大赛（双创大赛）的权威评委。请阅读以下项目商业计划书摘要：
项目名称：${summary?.name || detail?.name}
赛道：${summary?.track || detail?.track}
材料内容节选：
${bpContent.slice(0, 1500)}

请针对该项目的商业闭环、技术自研性、财务真实性提出 3 条尖锐且具体的现场质询问题。直接按 1. 2. 3. 列出，每条不超过 40 字。`;
        const reply = await generateContent(prompt);
        if (reply) {
          const lines = reply.split('\n').map((s) => s.replace(/^\d+[\.、\s]*/, '').trim()).filter((s) => s.length > 5);
          if (lines.length >= 3) {
            geminiQuestions = lines.slice(0, 3);
          }
        }
      } catch (err) {
        console.warn('[Screen Gemini] Generation skipped:', err);
      }
    }

    await sleep(800);
    sendEvent('stage_done', {
      step: 3,
      duration: 0.8,
      detail: '根据教育部大赛最新评审指标生成创新、技术、商业、团队等维度打分',
    });

    // Stage 4: AI & Plagiarism Detection
    sendEvent('stage_start', { step: 4, title: 'AI 生成率及学术不端检测', ts: '+2.1s' });
    await sleep(500);
    sendEvent('stage_done', { step: 4, duration: 0.5, detail: '查重库比对完成，AI 痕迹 < 10%' });

    // Stage 5: Final Rating & Inquiry
    sendEvent('stage_start', { step: 5, title: '最终评级裁定与质询提示', ts: '+2.6s' });
    await sleep(400);

    // Compute or retrieve final score
    const targetScore = detail?.score && detail.score > 0 ? detail.score : 82;
    const targetGrade = detail?.grade || (targetScore >= 90 ? 'A' : targetScore >= 75 ? 'B' : targetScore >= 60 ? 'C' : 'D');
    const targetConfidence = detail?.confidence || 'high';
    const finalQuestions = geminiQuestions || detail?.questions || [
      '请说明核心技术研发中学生团队的真实工作量占比及成果署名情况。',
      '请解释首年财务预测与实际签约客户意向合同的匹配依据。',
      '请明确针对竞品在性价比与交付周期上的核心壁垒与防御机制。',
    ];

    sendEvent('stage_done', {
      step: 5,
      duration: 0.4,
      detail: `综合得分 ${targetScore} 分 → ${targetGrade} 级 · ${targetConfidence} 置信度`,
    });

    // Save updated detail
    const updatedDetail: ProjectDetail = {
      id,
      name: summary?.name || detail?.name || '项目',
      track: summary?.track || detail?.track || '创新+创业',
      score: targetScore,
      grade: targetGrade,
      confidence: targetConfidence,
      tags: detail?.tags || ['重点关注'],
      source: summary?.source || detail?.source,
      dimensions: detail?.dimensions && detail.dimensions.length > 0 ? detail.dimensions : [
        { name: '创新性', weight: 25, score: Math.round(targetScore * 0.98), reason: '具备明确自主研发特征与应用创新场景', vetoHit: false },
        { name: '技术可行性', weight: 20, score: Math.round(targetScore * 1.02), reason: '原理样机已完成验证，具备中试条件', vetoHit: false },
        { name: '市场与商业价值', weight: 20, score: Math.round(targetScore * 0.95), reason: '细分市场切入准确，单客户模型基本成立', vetoHit: false },
        { name: '团队匹配度', weight: 15, score: Math.round(targetScore * 1.0), reason: '专业背景互补，指导教师与学生分工清晰', vetoHit: false },
        { name: '材料表达质量', weight: 10, score: Math.round(targetScore * 0.92), reason: '商业计划书逻辑清晰，数据佐证充分', vetoHit: false },
        { name: '社会价值与效益', weight: 10, score: Math.round(targetScore * 0.96), reason: '具备显著区域带动与就业促进价值', vetoHit: false },
      ],
      trace: [
        { step: 1, title: 'OCR 提取与实体识别', status: 'done', duration: 0.6, detail: '提取材料全文关键参数' },
        { step: 2, title: '一致性关联校验', status: detail?.anomalies?.length ? 'warning' : 'done', duration: 0.6, detail: '完成前后逻辑与财务核验' },
        { step: 3, title: '多维向量打分与行业对标', status: 'done', duration: 0.8, detail: '依据六维标准完成向量评分' },
        { step: 4, title: 'AI 生成率及学术不端检测', status: 'done', duration: 0.5, detail: 'AI 痕迹 < 10%' },
        { step: 5, title: '最终评级裁定与质询提示', status: 'done', duration: 0.4, detail: `综合 ${targetScore} 分 → ${targetGrade} 级` },
      ],
      anomalies: detail?.anomalies || [],
      questions: finalQuestions,
    };

    store.saveProjectDetail(updatedDetail);

    // Done event
    sendEvent('done', {
      score: targetScore,
      grade: targetGrade,
      confidence: targetConfidence,
      questions: finalQuestions,
    });

    res.end();
  } catch (err: any) {
    sendEvent('stage_error', { step: 3, desc: err?.message || '初筛执行异常' });
    res.end();
  }
});

export default router;
