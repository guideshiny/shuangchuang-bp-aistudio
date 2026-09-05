import express, { Request, Response } from 'express';
import { store } from '../store';
import { generateContent } from '../gemini';

const router = express.Router();

const DEFAULT_CHAPTERS = [
  { id: '1', name: '项目概述', status: '已完成', score: 88, redLines: ['痛点定义模糊', '商业构想脱离实际'], pitfalls: ['通篇口号无硬核数据'] },
  { id: '2', name: '痛点与市场需求', status: '已完成', score: 85, redLines: ['把伪需求当作刚需', '目标买单方不明确'], pitfalls: ['缺少真实走访与预售数据'] },
  { id: '3', name: '核心技术与创新', status: '精修中', score: 82, redLines: ['开源套壳伪造自主可控', '学生未实质参与研发'], pitfalls: ['无测试报告或第三方检测'] },
  { id: '4', name: '产品与服务矩阵', status: '已完成', score: 86, redLines: ['仅有渲染图无工模样机'], pitfalls: ['单品交付周期与成本失控'] },
  { id: '5', name: '行业竞争与壁垒', status: '需重构', score: 68, redLines: ['盲目宣称全方位碾压行业巨头'], pitfalls: ['缺少技术参数横向对比矩阵'] },
  { id: '6', name: '商业模式与盈利', status: '精修中', score: 79, redLines: ['未理清付费转化路径'], pitfalls: ['现金流测算严重脱节'] },
  { id: '7', name: '营销推广与获客', status: '需重构', score: 71, redLines: ['只谈全国铺开不谈冷启动'], pitfalls: ['CAC获客成本测算缺失'] },
  { id: '8', name: '运营交付与供应链', status: '已完成', score: 84, redLines: ['供应链卡脖子风险无替代'], pitfalls: ['中试良品率未经过验证'] },
  { id: '9', name: '团队构成与分工', status: '已完成', score: 89, redLines: ['导师挂名套利、学生无署名'], pitfalls: ['股权结构不合理'] },
  { id: '10', name: '财务预测与融资', status: '需重构', score: 65, redLines: ['三张表严重前后矛盾'], pitfalls: ['收入预测呈无脑指数级爆发'] },
  { id: '11', name: '风险防控与应急', status: '精修中', score: 74, redLines: ['回避知识产权侵权纠纷'], pitfalls: ['无核心成员流失预案'] },
  { id: '12', name: '社会效益与发展', status: '已完成', score: 92, redLines: ['无真实促就业/环保佐证'], pitfalls: ['套用通用模版空喊口号'] },
];

// GET /api/projects/:id/coach
router.get('/projects/:id/coach', (req: Request, res: Response) => {
  const { id } = req.params;
  const detail = store.getProjectDetail(id);
  const score = detail?.score || 80;

  res.json({
    maturity: {
      level: score >= 85 ? 'L3' : 'L2',
      phase: score >= 85 ? '技术壁垒与样机打磨' : '商业模式深度验证',
      name: score >= 85 ? 'Technological Barrier' : 'Business Validation',
      desc: '项目整体框架完整，技术原理具备自洽性，当前重点在于补齐竞品对比实验数据与规范财务模型。',
      defects: [
        '第5章竞品分析缺少可测量的指标参数表',
        '第10章财务预测首年净利率高达65%，存在评委扣分隐患',
        '专利成果需附上学生署名证明页',
      ],
    },
    trend: [68, 74, score],
    chapters: DEFAULT_CHAPTERS,
    history: [
      { version: 'v1.0.0', date: '2026-08-10', score: 68, summary: '材料初始化导入' },
      { version: 'v1.1.0', date: '2026-08-25', score: 74, summary: '完成痛点与产品矩阵打磨' },
      { version: 'v1.2.0', date: '2026-09-02', score, summary: '根据初筛反馈完善核心技术证据' },
    ],
  });
});

// POST /api/projects/:id/chapters/:chapterId/diagnose
router.post('/projects/:id/chapters/:chapterId/diagnose', async (req: Request, res: Response) => {
  const { id, chapterId } = req.params;
  const { content } = req.body;

  let score = 84;
  let comment = `第 ${chapterId} 章诊断：核心逻辑基本通顺，语言精炼。建议在文末补充 1 张高清成果验证对比图，更利于评委在 30 秒内快速抓住核心亮点。`;

  if (process.env.GEMINI_API_KEY) {
    try {
      const prompt = `你是全国双创大赛主评委。请对商业计划书第 ${chapterId} 章草稿内容进行诊断与打分（满分100）：
${(content || '').slice(0, 1000)}
请直接输出：打分（60-95整数），一句话评委批注（50字内）。`;
      const reply = await generateContent(prompt);
      if (reply) {
        const scoreMatch = reply.match(/\b([6-9]\d)\b/);
        if (scoreMatch) score = parseInt(scoreMatch[1]);
        comment = reply.replace(/\b([6-9]\d)\b[分]*/, '').trim() || comment;
      }
    } catch (e) {
      console.warn('[chapter diagnose] Gemini error:', e);
    }
  }

  const detail = store.getProjectDetail(id);
  const curScore = detail?.score || 80;
  const updatedTrend = [68, 74, curScore, Math.round((curScore + score) / 2)];
  const newVersion = {
    version: `v1.${Date.now().toString().slice(-2)}.0`,
    date: new Date().toISOString().slice(0, 10),
    score: Math.round((curScore + score) / 2),
    summary: `完成第 ${chapterId} 章智能诊断与修编`,
  };

  res.json({
    chapterId,
    score,
    comment,
    updatedTrend,
    newVersion,
  });
});

// POST /api/projects/:id/maturity
router.post('/projects/:id/maturity', (req: Request, res: Response) => {
  const { id } = req.params;
  const detail = store.getProjectDetail(id);
  const score = detail?.score || 82;

  res.json({
    level: score >= 85 ? 'L3' : 'L2',
    phase: score >= 85 ? '技术壁垒与样机打磨' : '商业模式深度验证',
    name: score >= 85 ? 'Technological Barrier' : 'Business Validation',
    desc: '经过多轮诊断与章节优化，商业逻辑完整度显著提升，已具备参加省赛争金条件。',
    defects: [
      '仍需在附件中提供CNAS/CMA国家认可的质检认证',
      '建议补充种子客户试用满意度调查与复购承诺函',
    ],
  });
});

// PUT /api/projects/:id/chapters/:chapterId/draft
router.put('/projects/:id/chapters/:chapterId/draft', (req: Request, res: Response) => {
  const { content } = req.body;
  res.json({ ok: true, chars: (content || '').length });
});

// POST /api/projects/:id/stage/topic
router.post('/projects/:id/stage/topic', (_req: Request, res: Response) => {
  res.json({
    topics: [
      '面向极端工况的高灵敏度智能传感与边缘推理系统',
      '基于自适应降噪算法的工业母机微振动高精监测装备',
      '绿色低碳驱动：新能源储能电站全生命周期健康管家',
    ],
    insight: '当前高校双创赛事评委偏好具备“硬科技国产替代 + 真实工业落地场景”的选题方向。',
    risk: '避免选择“纯软件APP”或“无技术门槛的生活服务众包”，此类项目通常在网评阶段即被淘汰。',
  });
});

// POST /api/projects/:id/stage/feasibility
router.post('/projects/:id/stage/feasibility', (_req: Request, res: Response) => {
  res.json({
    techStatus: '技术方案已完成实验室级原型验证，算法已在 FPGA 平台跑通，平均时延达标。',
    marketStatus: '细分市场潜在客户年采购规模约 12 亿元，前三大龙头企业具备替换意向。',
    fitStatus: '赛道契合度极高（95%），建议主申报中国国际大学生创新大赛高教主赛道。',
    suggestions: [
      '加急办理学生第一署名人的核心专利申请受理书',
      '联合省级重点实验室出具查新咨询报告与对标测试证明',
    ],
  });
});

// POST /api/projects/:id/stage/template
router.post('/projects/:id/stage/template', (_req: Request, res: Response) => {
  res.json({
    templateType: '科研硬科技转化型（推荐金奖标准模板）',
    chapters: [
      '1. 国家战略急需与痛点破局',
      '2. 原创底层核心技术第一性原理突破',
      '3. 工模样机实测与国际竞品全方位对标',
      '4. 产业化落地与标杆龙头客户采购验证',
      '5. 师生共创与学生真实研发主力风采',
      '6. 财务造血模型与百亿产业经济拉动',
    ],
    tips: [
      '封面标题务必出现“填补国内空白”或“关键指标提升X倍”等抓人眼球的定量关键词。',
      'PPT 控制在 18-22 页内，单页图文比保持在 7:3。',
    ],
  });
});

// GET /api/projects/:id/stage/profile
router.get('/projects/:id/stage/profile', (_req: Request, res: Response) => {
  res.json({
    stageProfile: {
      currentStage: 'L3 技术壁垒与样机打磨',
      doneItems: ['选题国家需求对齐', '商业模式自洽性推演', '一代工程样机研发'],
      nextItems: ['三方权威检测报告', '学生署名权佐证梳理', '竞品三维对比雷达图完善'],
      archived: false,
    },
    nextAction: '建议进入智能指导工作台，针对第5章【行业竞争】启动 AI 诊断并生成精修版。',
    stageNote: '当前处于省赛前关键冲刺期，重点防范财务前后矛盾与专利挂名红线。',
  });
});

export default router;
