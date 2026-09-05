import express, { Request, Response } from 'express';
import { store } from '../store';
import { generateContent } from '../gemini';
import {
  getServerProjectFiles,
  addServerProjectFile,
  deleteServerProjectFile,
} from '../data/mockFiles';

const router = express.Router();

const STANDARD_CHAPTERS_DEF = [
  { id: '1', name: '项目概述', elements: ['背景', '愿景', '核心价值'] },
  { id: '2', name: '痛点分析与市场需求', elements: ['真实痛点', '需求规模', '目标群体'] },
  { id: '3', name: '核心技术与创新点', elements: ['第一性原理突破', '专利软著', '技术路线'] },
  { id: '4', name: '产品或服务形态', elements: ['实物样机', '应用场景', '性能指标'] },
  { id: '5', name: '行业及竞争对手分析', elements: ['竞品对比矩阵', '差异化优势', '进入壁垒'] },
  { id: '6', name: '商业模式与盈利路径', elements: ['付费客户画像', '定价机制', '采购决策流'] },
  { id: '7', name: '市场推广与营销策略', elements: ['获客渠道', '种子客户验证', '阶段性转化目标'] },
  { id: '8', name: '生产交付与运营体系', elements: ['供应链协同', '产线中试', '质检标准'] },
  { id: '9', name: '核心团队与组织架构', elements: ['学生研发主力', '导师指导机制', '股权激励'] },
  { id: '10', name: '财务预测与融资需求', elements: ['三张表逻辑自洽', '单客户经济模型', '资金使用计划'] },
  { id: '11', name: '风险防控与应对策略', elements: ['技术替代风险', '合规与知识产权', '应急备选方案'] },
  { id: '12', name: '社会价值与产业效益', elements: ['区域就业拉动', '科技向善', '绿色低碳'] },
];

function getDefaultTriage(projectId: string) {
  return {
    projectId,
    primaryType: '产品创新',
    secondaryTypes: ['工艺流程创新'],
    confidence: {
      产品创新: 0.85,
      工艺流程创新: 0.1,
      服务创新: 0.05,
      商业模式创新: 0.0,
    },
    evidence: [
      { type: '产品创新', quote: '具备核心自研传感器硬件与嵌入式闭环控制算法' },
      { type: '工艺流程创新', quote: '提出新型微功耗中试与标定流程，生产效率提升30%' },
    ],
    status: 'active',
    degraded: false,
  };
}

function getDefaultRecognition(projectId: string) {
  return {
    projectId,
    chapters: STANDARD_CHAPTERS_DEF.map((c) => ({
      standardId: c.id,
      standardName: c.name,
      actualTitle: c.name,
      matchType: ['5', '7', '10', '11'].includes(c.id) ? 'weak' : 'complete',
      coverage: ['5', '7', '10', '11'].includes(c.id) ? 0.6 : 0.95,
      elements: c.elements.map((el, idx) => ({
        elementId: `${c.id}-${idx + 1}`,
        name: el,
        present: true,
        evidence: `已在对应章节提炼出【${el}】相关描述与佐证数据`,
      })),
    })),
    missing: [],
    weak: ['5', '7', '10', '11'],
    notApplicable: [],
    degraded: false,
  };
}

function getDefaultStages(projectId: string) {
  return [
    { id: 1, projectId, stageCode: 'L1', name: '创意激发与选题定位', status: 'converged', progress: 100, convergeStatus: 'approved' },
    { id: 2, projectId, stageCode: 'L2', name: '商业可行性验证', status: 'converged', progress: 100, convergeStatus: 'approved' },
    { id: 3, projectId, stageCode: 'L3', name: '技术壁垒与样机打磨', status: 'active', progress: 65, convergeStatus: 'reviewing' },
    { id: 4, projectId, stageCode: 'L4', name: '商业计划书精细化打磨', status: 'pending', progress: 20, convergeStatus: 'draft' },
    { id: 5, projectId, stageCode: 'L5', name: '路演答辩与现场模拟', status: 'pending', progress: 0, convergeStatus: 'draft' },
    { id: 6, projectId, stageCode: 'L6', name: '评委模拟盲审与冲金冲银', status: 'pending', progress: 0, convergeStatus: 'draft' },
  ];
}

function getDefaultTodos(projectId: string) {
  return [
    {
      id: 'todo-1',
      projectId,
      stageCode: 'L3',
      title: '补齐核心专利学生第一完成人署名证据',
      desc: '评委高度关注学生研发主体地位，需在附件上传专利受理通知书或学生署名页截图',
      tag: '团队匹配',
      status: 'pending',
      source: 'AI初筛',
      suggestedAction: '更新知识产权附件并重新提交',
      targetChapter: '9',
    },
    {
      id: 'todo-2',
      projectId,
      stageCode: 'L3',
      title: '细化竞品对比雷达图量化指标',
      desc: '当前竞品分析偏定性描述，缺少信噪比、功耗及单台量产成本的精确横向比对',
      tag: '竞争壁垒',
      status: 'pending',
      source: '本体章节识别',
      suggestedAction: '在第5章补充三方实测对比参数表',
      targetChapter: '5',
    },
    {
      id: 'todo-3',
      projectId,
      stageCode: 'L4',
      title: '消除三张财务报表前后折旧矛盾',
      desc: '资产负债表设备总值与利润表折旧摊销测算存在年化 15 万元偏差，需统一会计口径',
      tag: '财务合规',
      status: 'completed',
      source: '一致性校验',
      suggestedAction: '修正第10章财务预测模型中的折旧年限',
      targetChapter: '10',
    },
  ];
}

function buildAssessment(projectId: string, group: string = '创意组', targetVersionId?: string) {
  const isP1 = projectId === 'p1';
  const versionId = targetVersionId || (isP1 ? 'p1-v9' : 'v1.1.0');
  const scorecardName = `全国大学生双创大赛评审标准量表（${group}）`;

  if (isP1) {
    const isV9 = versionId === 'p1-v9';
    return {
      projectId,
      versionId,
      group,
      scorecardName,
      total: isV9 ? 89.5 : 86.5,
      totalScore: isV9 ? 89.5 : 86.5,
      trend: isV9 ? 'up' : 'flat',
      isBaseline: !isV9,
      degraded: false,
      issues: [],
      dimensionScores: {
        创新性: isV9 ? 91 : 85,
        技术可行性: isV9 ? 88 : 82,
        市场与商业价值: isV9 ? 86 : 80,
        团队匹配度: isV9 ? 94 : 90,
        材料表达质量: isV9 ? 88 : 80,
        社会价值与效益: isV9 ? 90 : 85,
      },
      items: [
        // 创新性
        {
          itemId: 'cx-1',
          itemText: '核心原理突破与自主原创程度',
          dimension: '创新性',
          cap: 10,
          baseScore: 8.4,
          currentScore: isV9 ? 9.2 : 8.4,
          delta: isV9 ? 0.8 : 0,
          reason: isV9
            ? '自主研发单导联干电极弱微伏生物电信号滤波算法，突破接触阻抗大与工频强干扰瓶颈，具实质性原理创新。'
            : '提出单导联干电极弱微伏生物电信号滤波算法，算法架构自研，具备实质性应用创新。',
          quote: '技术研发由来自本校生物医学工程与仪器科学学院脑控技术的科研团队承担，核心算法完全自主可控。',
        },
        {
          itemId: 'cx-2',
          itemText: '针对真实痛点的产品定义与功能创新',
          dimension: '创新性',
          cap: 10,
          baseScore: 8.2,
          currentScore: isV9 ? 8.9 : 8.2,
          delta: isV9 ? 0.7 : 0,
          reason: isV9
            ? '针对高压职场人群首创19分钟自适应脑电闭环助眠机制，精准构建“实时脑电监测-多维状态识别-音量自适应调节-智能唤醒”闭环。'
            : '精准切入25-45岁职场人群高压失眠痛点，首创19分钟脑电监测自适应音乐助眠模型。',
          quote: '精准判断用户的睡眠状态（清晰、迷糊、浅睡、深睡），随着大脑放松程度加深音量动态同步递减。',
        },
        {
          itemId: 'cx-3',
          itemText: '自主知识产权与技术壁垒布局',
          dimension: '创新性',
          cap: 10,
          baseScore: 8.5,
          currentScore: isV9 ? 9.2 : 8.5,
          delta: isV9 ? 0.7 : 0,
          reason: isV9
            ? '已取得7项外观专利、软著及核心发明专利受理，获ADI原厂芯片深度技术合作支持与苹果官方MFI严苛认证。'
            : '单导联干电极硬件创新并获苹果MFI认证，成本低于同类产品30%以上。',
          quote: '实现成本低于同类产品30%以上，得到了国际芯片巨头ADI原厂的高度重视，并取得苹果官方MFI认证。',
        },
        // 技术可行性
        {
          itemId: 'js-1',
          itemText: '硬件工程实现与产品化成熟度',
          dimension: '技术可行性',
          cap: 10,
          baseScore: 8.3,
          currentScore: isV9 ? 8.8 : 8.3,
          delta: isV9 ? 0.5 : 0,
          reason: isV9
            ? '眼罩整机重量控制在35g超轻量佩戴舒适，通过国家CNAS认证机构检测与300小时连续充放电可靠性压测。'
            : '二代工模工程样机已完成200小时稳定性压测，整机佩戴舒适性良好。',
          quote: '2015.4 易休立项，2016.9 众筹完成首批4000件量产交付，二代工模样机测试指标达标。',
        },
        {
          itemId: 'js-2',
          itemText: '核心算法信噪比与抗工频干扰指标实测',
          dimension: '技术可行性',
          cap: 10,
          baseScore: 8.2,
          currentScore: isV9 ? 8.8 : 8.2,
          delta: isV9 ? 0.6 : 0,
          reason: isV9
            ? '在复杂移动环境中微伏级脑电信号识别准确率达到91.6%，达到消费级医疗健康监测标准。'
            : '经实验室与三甲医院对比测试，单导干电极脑电信号与临床多导脑电图设备波形相关系数达0.89。',
          quote: '经国家特种检验中心测试与同德医院对比验证，各项指标达到行业一类标准。',
        },
        // 市场与商业价值
        {
          itemId: 'sc-1',
          itemText: '目标市场容量与细分客群痛点匹配度',
          dimension: '市场与商业价值',
          cap: 10,
          baseScore: 8.1,
          currentScore: isV9 ? 8.5 : 8.1,
          delta: isV9 ? 0.4 : 0,
          reason: isV9
            ? '定位于25-45岁都市白领与失眠亚健康人群，千亿睡眠经济赛道下千人问卷与高交会物联网报告论证深入。'
            : '行业PEST宏观环境分析扎实，可穿戴市场年复合增长率数据详实，市场容量预测合理。',
          quote: '根据高交会报告预测，大健康可穿戴设备年复合增长率超80%，午休减压细分市场潜力巨大。',
        },
        {
          itemId: 'sc-2',
          itemText: '“回字形”营销闭环与商业变现造血能力',
          dimension: '市场与商业价值',
          cap: 10,
          baseScore: 8.1,
          currentScore: isV9 ? 8.7 : 8.1,
          delta: isV9 ? 0.6 : 0,
          reason: isV9
            ? '首批众筹破百万且2016年实现营业利润近百万元，差评公众号与自营电商闭环转化率达5.8%，造血能力强劲。'
            : '提出回字形营销闭环，电商+自媒体+体验点多元协同，众筹已验证初期买单意愿。',
          quote: '营销模式以吸引-教育-转化-维系构成回字形闭环；第一轮众筹完成4000件销售，毛利模型健康。',
        },
        // 团队匹配度
        {
          itemId: 'td-1',
          itemText: '团队专业背景与专创融合匹配度',
          dimension: '团队匹配度',
          cap: 10,
          baseScore: 9.2,
          currentScore: isV9 ? 9.5 : 9.2,
          delta: isV9 ? 0.3 : 0,
          reason: isV9
            ? '核心团队毕业于浙江大学生仪学院脑控国家实验室，清华全球挑战赛亚军，具备硬核跨学科技术与商业化操盘履历。'
            : '创始团队成员来自浙大生仪学院脑控实验室，技术发明人为创业团队成员，科研资源优势突出。',
          quote: '技术研发团队均来自本校生仪学院脑控实验室，CEO带领团队参展央视《创业英雄汇》并赴硅谷参赛。',
        },
        {
          itemId: 'td-2',
          itemText: '股权结构健康度与核心骨干激励规划',
          dimension: '团队匹配度',
          cap: 10,
          baseScore: 9.1,
          currentScore: isV9 ? 9.3 : 9.1,
          delta: isV9 ? 0.2 : 0,
          reason: isV9
            ? '创始团队全职投入控股75%股权集中稳定，引入中关村创投资本并规范预留15%~20%期权池。'
            : '天使轮时创始团队控股75%，天使投资持股25%，预计划分期权池。',
          quote: '天使轮时创始团队持股75%，天使投资持股25%，规范划设期权池激励核心算法与营销骨干。',
        },
        // 材料表达质量
        {
          itemId: 'cl-1',
          itemText: '商业计划书逻辑框架与图表表达规范度',
          dimension: '材料表达质量',
          cap: 10,
          baseScore: 8.3,
          currentScore: isV9 ? 8.8 : 8.3,
          delta: isV9 ? 0.5 : 0,
          reason: isV9
            ? 'BP全篇8大核心章节逻辑链条完整，产品爆炸图、脑电闭环流程图与量产时间轴清晰专业，评审体验佳。'
            : '章节覆盖整体完整，排版规整，图表清晰。',
          quote: '已完成章节结构覆盖度自检，图文配比合理，核心机理与商业路径一目了然。',
        },
        {
          itemId: 'cl-2',
          itemText: '财务三表预测勾稽一致性与敏感性分析',
          dimension: '材料表达质量',
          cap: 10,
          baseScore: 8.0,
          currentScore: isV9 ? 8.8 : 8.0,
          delta: isV9 ? 0.8 : 0,
          reason: isV9
            ? '已修正单客经济模型与现金流量表口径冲突，三年营业收入、毛利率及固定资产折旧勾稽严密，敏感性测算合理。'
            : '具备财务预测模型，已完成成本费用与销售利润测算。',
          quote: 'NapTime单机BOM物料清单与代工费用拆解清晰，经营活动现金净流量保持正向平稳流入。',
        },
        // 社会价值与效益
        {
          itemId: 'sh-1',
          itemText: '助力健康中国战略与未病先治社会效益',
          dimension: '社会价值与效益',
          cap: 10,
          baseScore: 8.7,
          currentScore: isV9 ? 9.1 : 8.7,
          delta: isV9 ? 0.4 : 0,
          reason: isV9
            ? '践行科技温暖生活理念，通过无创脑电监测提升千万高压职场人群身心素质，民生健康价值突出。'
            : '项目弘扬科技温暖生活的创业初心，紧扣健康中国战略，团队兼具创新精神与社会责任感。',
          quote: '旨在向大众传达‘智能，温暖你的生活’理念，致力于将健康和快乐带给每一个人。',
        },
        {
          itemId: 'sh-2',
          itemText: '三甲公立医院非营利临床科研合作与产学研带动',
          dimension: '社会价值与效益',
          cap: 10,
          baseScore: 8.6,
          currentScore: isV9 ? 8.9 : 8.6,
          delta: isV9 ? 0.3 : 0,
          reason: isV9
            ? '携手浙江省同德医院开展非营利助眠心理干预临床试验，推动生物电可穿戴医疗普惠发展，获省科技馆重点推介。'
            : '与同德医院在助眠引导语和睡眠试验方面进行非营利性科研合作。',
          quote: '与同德医院在助眠引导语和睡眠试验方面进行非营利性科研合作，并获省科技馆重点推介。',
        },
      ],
    };
  }

  // Generic fallback
  return {
    projectId,
    versionId: targetVersionId || 'v1.1.0',
    group,
    scorecardName,
    total: 86.0,
    totalScore: 86.0,
    trend: 'up',
    isBaseline: false,
    degraded: false,
    issues: [],
    dimensionScores: {
      创新性: 88,
      技术可行性: 85,
      市场与商业价值: 84,
      团队匹配度: 89,
      材料表达质量: 86,
      社会价值与效益: 85,
    },
    items: [
      {
        itemId: 'g-cx-1',
        itemText: '核心原理突破与自主原创程度',
        dimension: '创新性',
        cap: 10,
        baseScore: 8.0,
        currentScore: 8.8,
        delta: 0.8,
        reason: '核心技术方案自研，原理创新度较高，经最新一轮专家评注优化后论证更加严密。',
        quote: '自研核心算法架构，突破传统技术路径瓶颈，具有较高的自主知识产权壁垒。',
      },
      {
        itemId: 'g-js-1',
        itemText: '技术成熟度与工程样机实测',
        dimension: '技术可行性',
        cap: 10,
        baseScore: 8.0,
        currentScore: 8.5,
        delta: 0.5,
        reason: '出具第三方权威检测机构实测报告，核心性能指标达到预期设计标准。',
        quote: '经权威第三方检测，各项关键技术参数均达到设计标准，样机运行稳定。',
      },
    ],
  };
}

// GET /api/guidance/:id/dashboard
router.get('/guidance/:id/dashboard', (req: Request, res: Response) => {
  const { id } = req.params;
  const triage = store.triages.get(id) || getDefaultTriage(id);
  const recognition = store.recognitions.get(id) || getDefaultRecognition(id);
  const stages = store.stages.get(id) || getDefaultStages(id);
  const todosList = store.getTodos(id);
  const todos = todosList.length ? todosList : getDefaultTodos(id);
  const detail = store.getProjectDetail(id);
  const versions = store.versions.get(id) || [
    {
      id: 'v1',
      projectId: id,
      versionId: 'p1-v9',
      versionType: 'milestone',
      name: '国赛增量打磨版本（最新）',
      trigger: '全要素评审优化',
      summary: '根据立德树人与核心技术壁垒反馈完成增量打磨，总分提升至 89.5 分',
      createdAt: new Date().toISOString(),
    },
  ];

  const assessment = buildAssessment(id, '创意组', 'p1-v9');

  res.json({
    projectId: id,
    projectName: detail?.name || '易休智能睡眠眼罩',
    triage,
    recognition,
    group: '创意组',
    latestVersion: assessment,
    assessment,
    stages,
    todos,
    versions,
    chaptersDone: recognition?.chapters?.filter((c: any) => c.matchType === 'complete').length || 8,
    chaptersTotal: recognition?.chapters?.length || 12,
  });
});

// POST /api/guidance/:id/triage
router.post('/guidance/:id/triage', async (req: Request, res: Response) => {
  const { id } = req.params;
  const existing = store.triages.get(id);
  if (existing) return res.json(existing);

  const bp = store.getBpContent(id);
  let triage = getDefaultTriage(id);

  if (process.env.GEMINI_API_KEY && bp) {
    try {
      const prompt = `分析以下双创项目计划书内容，将其按大赛规则归类为主导创新类型（可选：产品创新、工艺流程创新、服务创新、商业模式创新），给出置信度和原文证据：
${bp.slice(0, 1000)}
请以 JSON 格式输出：
{
  "primaryType": "产品创新",
  "secondaryTypes": ["工艺流程创新"],
  "confidence": {"产品创新": 0.85, "工艺流程创新": 0.15},
  "evidence": [{"type": "产品创新", "quote": "..."}]
}`;
      const reply = await generateContent(prompt);
      if (reply) {
        const jsonMatch = reply.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          triage = {
            projectId: id,
            primaryType: parsed.primaryType || '产品创新',
            secondaryTypes: parsed.secondaryTypes || ['工艺流程创新'],
            confidence: parsed.confidence || { 产品创新: 0.85 },
            evidence: parsed.evidence || triage.evidence,
            status: 'active',
            degraded: false,
          };
        }
      }
    } catch (e) {
      console.warn('[Guidance triage] Gemini error, using fallback:', e);
    }
  }

  store.triages.set(id, triage);
  res.json(triage);
});

// POST /api/guidance/:id/recognize
router.post('/guidance/:id/recognize', (req: Request, res: Response) => {
  const { id } = req.params;
  const recognition = store.recognitions.get(id) || getDefaultRecognition(id);
  store.recognitions.set(id, recognition);
  res.json(recognition);
});

// POST /api/guidance/:id/assess
router.post('/guidance/:id/assess', (req: Request, res: Response) => {
  const { id } = req.params;
  const { group, baseVersionId } = req.body;
  const assess = buildAssessment(id, group || '创意组', baseVersionId ? 'p1-v9' : 'p1-v8');
  res.json(assess);
});

// GET /api/guidance/:id/bp
router.get('/guidance/:id/bp', (req: Request, res: Response) => {
  const { id } = req.params;
  const content = store.getBpContent(id);
  res.json({
    projectId: id,
    content,
    sourceVersionId: 'v1.0.0',
    updatedAt: new Date().toISOString(),
  });
});

// PUT /api/guidance/:id/bp
router.put('/guidance/:id/bp', (req: Request, res: Response) => {
  const { id } = req.params;
  const { content } = req.body;
  if (content !== undefined) {
    store.saveBpContent(id, content);
  }
  res.json({ ok: true, updatedAt: new Date().toISOString() });
});

// GET /api/guidance/:id/files
router.get('/guidance/:id/files', (req: Request, res: Response) => {
  const { id } = req.params;
  const files = getServerProjectFiles(id);
  res.json({ projectId: id, files });
});

// POST /api/guidance/:id/files (模拟材料上传)
router.post('/guidance/:id/files', (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, fileType, size, category, description, author } = req.body;
  const newFile = addServerProjectFile(id, {
    name,
    fileType,
    size: Number(size) || undefined,
    category,
    description,
    author,
  });
  res.json({ ok: true, file: newFile });
});

// DELETE /api/guidance/:id/files/:filename
router.delete('/guidance/:id/files/:filename', (req: Request, res: Response) => {
  const { id, filename } = req.params;
  const success = deleteServerProjectFile(id, decodeURIComponent(filename));
  res.json({ ok: success });
});

// GET /api/guidance/:id/sessions
router.get('/guidance/:id/sessions', (req: Request, res: Response) => {
  const { id } = req.params;
  let list = store.sessions.get(id);
  if (!list || list.length === 0) {
    list = [
      {
        id: 'sess-default',
        projectId: id,
        title: '双创金牌教练辅导工作台',
        createdAt: new Date().toISOString(),
      },
    ];
    store.sessions.set(id, list);
  }
  res.json({ sessions: list, activeSessionId: list[0].id });
});

// POST /api/guidance/:id/sessions
router.post('/guidance/:id/sessions', (req: Request, res: Response) => {
  const { id } = req.params;
  const { title } = req.body;
  const newSession = {
    id: `sess-${Date.now()}`,
    projectId: id,
    title: title || '新指导会话',
    createdAt: new Date().toISOString(),
  };
  const list = store.sessions.get(id) || [];
  list.unshift(newSession);
  store.sessions.set(id, list);
  res.json(newSession);
});

// GET /api/guidance/:id/sessions/:sessionId
router.get('/guidance/:id/sessions/:sessionId', (req: Request, res: Response) => {
  const { id, sessionId } = req.params;
  const sessions = store.sessions.get(id) || [];
  const session = sessions.find((s) => s.id === sessionId) || {
    id: sessionId,
    projectId: id,
    title: '金牌教练实时对话',
    createdAt: new Date().toISOString(),
  };

  let msgs = store.messages.get(sessionId);
  if (!msgs || msgs.length === 0) {
    msgs = [
      {
        id: 'msg-init',
        sessionId,
        role: 'assistant',
        content: `你好！我是双创赛事智能辅导教练。\n我已经全面分析了你的商业计划书与最新初筛维度得分。当前项目的优势在于核心技术自研度较高，但【财务模型】与【竞品对比壁垒】仍有明显的失分风险。\n你可以直接告诉我你想打磨哪个章节（例如：“帮我重写第5章竞品对比”），或者向我提问备赛策略！`,
        action: 'suggest',
        target: 'bp',
        createdAt: new Date().toISOString(),
      },
    ];
    store.messages.set(sessionId, msgs);
  }

  res.json({ session, messages: msgs });
});

// POST /api/guidance/:id/sessions/:sessionId/messages
router.post('/guidance/:id/sessions/:sessionId/messages', async (req: Request, res: Response) => {
  const { id, sessionId } = req.params;
  const { content, action, target } = req.body;

  const msgs = store.messages.get(sessionId) || [];
  const userMsg = {
    id: `msg-${Date.now()}-user`,
    sessionId,
    role: 'user',
    content,
    action,
    target,
    createdAt: new Date().toISOString(),
  };
  msgs.push(userMsg);

  // Generate AI Coach reply with domain knowledge
  let aiReplyText = '';
  const bp = store.getBpContent(id);
  const detail = store.getProjectDetail(id);

  if (process.env.GEMINI_API_KEY) {
    try {
      const systemInstruction = `你是全国大学生双创大赛（中国国际大学生创新大赛/挑战杯）的国家级资深评委与金牌辅导教练。
你的风格：专业、敏锐、一针见血、逻辑严谨，擅长帮助项目把“学术成果”包装成“自洽的商业产品”，特别擅长解决评委最在意的痛点：
1. 真实买单方与采购预算流（谁付钱？凭什么付钱？）
2. 学生是否真实研发主力（学生署名与核心工作量证明）
3. 财务预测与单客户经济模型（避免假大空虚高预测）
4. 竞品对比与核心护城河（拒绝“别人什么都不行我们什么都行”）
请根据用户问题，给出条理清晰、具备落地修改范式的中文指导建议。字数 150-350 字。`;

      const prompt = `当前辅导项目信息：
名称：${detail?.name || '双创项目'}
赛道：${detail?.track || '创新+创业'}
当前六维评分：${JSON.stringify(detail?.dimensions || [])}
计划书节选：
${bp.slice(0, 1500)}

参赛学生提出的问题或请求：
“${content}”`;

      const reply = await generateContent(prompt, systemInstruction);
      if (reply) {
        aiReplyText = reply;
      }
    } catch (err) {
      console.warn('[Coach message] Gemini error:', err);
    }
  }

  if (!aiReplyText) {
    if (content.includes('财务') || content.includes('收入') || content.includes('盈利')) {
      aiReplyText = `【财务闭环诊断建议】\n1. 警惕“按行业百分比切蛋糕”的假大空预测。建议转为自下而上的单客户模型（Unit Economics）：单台售价、硬件物料BOM成本、交付维护年费。\n2. 在商业计划书第10章，明确首批种子客户的合同/意向金订单，将营收测算建立在真实的采购意愿基础上。\n3. 注意现金流生命周期，说明初创期资金能支持项目运转多少个月，避免收支时间点倒挂。`;
    } else if (content.includes('竞品') || content.includes('壁垒') || content.includes('对手')) {
      aiReplyText = `【竞品分析重构建议】\n1. 很多团队常犯的忌讳是把大疆、华为等巨头全部列为竞品然后全方位超越，这在评委眼中极其虚假。\n2. 建议采用“细分场景战术突围”策略：明确在具体某类极端工况或高校细分科研领域，由于定制化与特定专利算法，我们具备交付周期更短、性价比高3倍的硬核优势。\n3. 请在第5章补充量化参数对比表格，用真实检测波形或对比数据替代形容词。`;
    } else if (content.includes('团队') || content.includes('老师') || content.includes('署名')) {
      aiReplyText = `【团队匹配度评委红线】\n1. 双创大赛最忌讳“导师拿国家重大科技专项成果包装给学生参赛（教授套利）”。\n2. 答辩 PPT 与 BP 必须清晰体现学生第一发明人的软著或学术论文。\n3. 团队成员专业结构要与项目技术链路一一对应（如硬件设计、算法工程、市场运营分工明确），展现不可替代性。`;
    } else {
      aiReplyText = `【教练指导意见】\n针对你提出的问题：“${content}”，建议从以下三步进行针对性修正：\n1. **论据前置**：在对应章节首段用加粗字体直接给出结论与关键量化成果（如降本率、响应时间、意向签约额）。\n2. **消除评委质疑**：把评委现场可能扣分的质询点转化为正文的小标题和证明材料截图。\n3. **推进阶段任务**：建议参考工作台右侧的【动态任务清单】，优先完成标星的高优先级待办项。`;
    }
  }

  const aiMsg = {
    id: `msg-${Date.now()}-assistant`,
    sessionId,
    role: 'assistant',
    content: aiReplyText,
    action: 'guide',
    target: 'bp',
    createdAt: new Date().toISOString(),
  };

  msgs.push(aiMsg);
  store.messages.set(sessionId, msgs);

  res.json(aiMsg);
});

// POST /api/guidance/:id/coach-chapter
router.post('/guidance/:id/coach-chapter', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { chapterKey, userInstruction } = req.body;

  let diagnosis = `针对第 ${chapterKey} 章，AI 教练检视发现：内容整体完整，但缺乏与同赛道国奖项目的差异化定量对比，叙述性文字偏多，缺少评审专家一目了然的图表结论。`;
  let revised = `### 第 ${chapterKey} 章 精修版\n\n【核心摘要】：本项目首创高灵敏度自适应低功耗技术架构，在实测环境下性能优于行业同类基准 32%，首期已获得 3 家工业级客户试用验证。\n\n1. **技术突破**：突破传统硬件瓶颈，将核心响应时间从 120ms 压缩至 18ms。\n2. **商业落地**：锁定首年 50 家标杆客户，单客交付成本下降 40%。\n3. **团队保障**：学生团队作为第一署名人主导全部底层算法研发，具备完全自主知识产权。`;
  let diff = `@@ -1,3 +1,6 @@\n- 旧版章节以定性描述为主，缺少明确对比基准\n+ 【核心摘要】：本项目首创高灵敏度自适应低功耗架构，实测性能优于基准 32%\n+ 突破传统硬件瓶颈，将响应时间压缩至 18ms\n+ 学生团队作为第一署名人主导全部底层算法研发`;

  if (process.env.GEMINI_API_KEY) {
    try {
      const prompt = `你是双创大赛评审专家，请针对商业计划书的第 ${chapterKey} 章进行深度诊断与精修改写：
用户特殊要求：${userInstruction || '提升金奖竞争力与评委说服力'}

请输出 JSON：
{
  "diagnosis": "一句话诊断评委失分点",
  "revisedContent": "改写后的精修Markdown内容",
  "diff": "简要版本修改差异摘要"
}`;
      const reply = await generateContent(prompt);
      if (reply) {
        const match = reply.match(/\{[\s\S]*\}/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          if (parsed.diagnosis) diagnosis = parsed.diagnosis;
          if (parsed.revisedContent) revised = parsed.revisedContent;
          if (parsed.diff) diff = parsed.diff;
        }
      }
    } catch (e) {
      console.warn('[coach-chapter] Gemini error:', e);
    }
  }

  res.json({
    chapterKey,
    diagnosis,
    revisedContent: revised,
    diff,
  });
});

// GET /api/guidance/:id/stages
router.get('/guidance/:id/stages', (req: Request, res: Response) => {
  const { id } = req.params;
  const stages = store.stages.get(id) || getDefaultStages(id);
  res.json(stages);
});

// GET /api/guidance/:id/stage
router.get('/guidance/:id/stage', (req: Request, res: Response) => {
  const { id } = req.params;
  const stages = store.stages.get(id) || getDefaultStages(id);
  const cur = stages.find((s) => s.status === 'active') || stages[0];
  res.json({
    projectId: id,
    stage: cur?.stageCode || 'L1',
    stageStatus: cur?.convergeStatus || 'draft',
    subStatus: {},
    progress: stages.map((s) => ({
      stage: s.stageCode,
      label: s.name,
      status: s.status === 'converged' ? 'done' : s.status === 'active' ? 'doing' : 'todo',
      hint: `${s.progress}%`,
    })),
    history: [],
  });
});

// GET /api/guidance/:id/diagnosis
router.get('/guidance/:id/diagnosis', (req: Request, res: Response) => {
  const { id } = req.params;
  const detail = store.getProjectDetail(id);
  const isP1 = id === 'p1';

  if (isP1) {
    return res.json({
      projectId: id,
      projectName: detail?.name || '易休智能睡眠眼罩',
      stage: 'L3',
      stageLabel: '材料成型与短板攻坚',
      youAre: '项目已完成单导干电极样机中试、苹果 MFI 官方认证及 4000 件众筹验证，当前总分 89.5（增量 ↑3.0 分），处于向国赛金奖精细化冲刺阶段。',
      whereYouAre: '项目已完成单导干电极样机中试、苹果 MFI 官方认证及 4000 件众筹验证，当前总分 89.5（增量 ↑3.0 分），处于向国赛金奖精细化冲刺阶段。',
      missing: [
        { text: '第 7 章财务预测中单客经济模型与现金流量表存在两处勾稽口径不一致，缺少敏感性分析', chapterId: '7', action: 'edit', target: '7' },
        { text: '第 3 章市场分析竞品矩阵缺少与国际头部厂商（NeuroSky、Emotiv）的微伏级信噪比与功耗量化横评', chapterId: '3', action: 'edit', target: '3' },
        { text: '第 5 章生产管理中 OEM 外协代工缺少详细出厂公差与不良率退换货兜底条款', chapterId: '5', action: 'edit', target: '5' },
        { text: '第 6 章公司管理缺少核心成员全职投入承诺书及 15%~20% 员工期权激励实施细则', chapterId: '6', action: 'edit', target: '6' },
      ],
      nextSteps: [
        { text: '修订第 7 章财务预测表，统一销售返点扣除后的现金净现值口径', chapterId: '7', action: 'edit', target: '7' },
        { text: '一键调取 AI 竞品库，生成与 NeuroSky / Emotiv 核心参数对比图表', chapterId: '3', action: 'chapter_coach', target: '3' },
        { text: '补充东软熙康 OEM 框架协议中第 4 条质量保证验收标准的附件说明', chapterId: '5', action: 'edit', target: '5' },
        { text: '发起一轮完整材料增量评审，验证修复后立德树人与技术壁垒得分提升', chapterId: '', action: 'score', target: 'p1-v9' },
      ],
      whatYouLack: [
        '第 7 章财务预测中单客经济模型与现金流量表存在两处勾稽口径不一致，缺少敏感性分析',
        '第 3 章市场分析竞品矩阵缺少与国际头部厂商（NeuroSky、Emotiv）的微伏级信噪比与功耗量化横评',
        '第 5 章生产管理中 OEM 外协代工缺少详细出厂公差与不良率退换货兜底条款',
        '第 6 章公司管理缺少核心成员全职投入承诺书及 15%~20% 员工期权激励实施细则',
      ],
      riskLevel: 'low',
    });
  }

  res.json({
    projectId: id,
    projectName: detail?.name || '双创项目',
    stage: 'L3',
    stageLabel: '技术壁垒与样机打磨',
    youAre: '项目已完成核心技术样机研制与初筛评估，当前处于可行性验证向材料成型过渡阶段。',
    whereYouAre: '项目已完成核心技术样机研制与初筛评估，当前处于可行性验证向材料成型过渡阶段。',
    missing: [
      { text: '财务模型与成本测算口径存在两处勾稽不一致', chapterId: '10', action: 'edit', target: '10' },
      { text: '直接竞品差异化壁垒论证不够充分，未列出核心工艺对比参数', chapterId: '5', action: 'edit', target: '5' },
      { text: '目标客群单客经济模型缺少实测付费意向数据支撑', chapterId: '4', action: 'edit', target: '4' },
    ],
    nextSteps: [
      { text: '根据专家批注修改第10章财务预算表', chapterId: '10', action: 'edit', target: '10' },
      { text: '补写第5章竞品技术路线对比矩阵', chapterId: '5', action: 'edit', target: '5' },
      { text: '完成首批样机第三方中试检测报告入库', chapterId: '7', action: 'edit', target: '7' },
    ],
    whatYouLack: [
      '财务模型与成本测算口径存在两处勾稽不一致',
      '直接竞品差异化壁垒论证不够充分，未列出核心工艺对比参数',
      '目标客群单客经济模型缺少实测付费意向数据支撑',
    ],
    riskLevel: 'medium',
  });
});

// GET /api/guidance/:id/stage/tasks
router.get('/guidance/:id/stage/tasks', (req: Request, res: Response) => {
  const { id } = req.params;
  res.json({
    projectId: id,
    stage: 'L2',
    tasks: [
      {
        id: 'task-1',
        title: '用户痛点真实性抽样调研',
        desc: '完成至少 30 份目标用户结构化深度访谈并留存访谈纪要',
        status: 'completed',
        evidence: '30份访谈纪要已整理归档',
      },
      {
        id: 'task-2',
        title: '工模样机 200 小时可靠性压测',
        desc: '提供物理样机在模拟真实环境下的连续运行数据日志及损耗率统计',
        status: 'pending',
        evidence: null,
      },
    ],
  });
});

// POST /api/guidance/:id/stages/:stageCode/converge
router.post('/guidance/:id/stages/:stageCode/converge', (req: Request, res: Response) => {
  const { id, stageCode } = req.params;
  let stages = store.stages.get(id) || getDefaultStages(id);
  const target = stages.find((s) => s.stageCode === stageCode);
  if (target) {
    target.status = 'converged';
    target.progress = 100;
    target.convergeStatus = 'approved';
    // Activate next
    const nextIdx = stages.indexOf(target) + 1;
    if (nextIdx < stages.length) {
      stages[nextIdx].status = 'active';
      stages[nextIdx].progress = 30;
      stages[nextIdx].convergeStatus = 'reviewing';
    }
  }
  store.stages.set(id, stages);
  res.json(target || { stageCode, status: 'converged', progress: 100 });
});

// GET /api/guidance/:id/todos
router.get('/guidance/:id/todos', (req: Request, res: Response) => {
  const { id } = req.params;
  const list = store.getTodos(id);
  const todos = list.length ? list : getDefaultTodos(id);
  res.json({ projectId: id, todos });
});

// POST /api/guidance/:id/todos
router.post('/guidance/:id/todos', (req: Request, res: Response) => {
  const { id } = req.params;
  const { stage, text, source, ai } = req.body;
  const newTodo = store.addTodo(id, { stage: stage || 'L1', text: text || '', source: source || 'manual', ai: Boolean(ai) });
  res.json(newTodo);
});

// POST /api/guidance/:id/todos/generate
router.post('/guidance/:id/todos/generate', async (req: Request, res: Response) => {
  const { id } = req.params;
  const newTodo = store.addTodo(id, {
    stage: 'L4',
    text: '打磨第 1 章执行概要：提炼“全球首款脑电波智能助眠眼罩”10 秒电梯演讲与 19 分钟闭环机理',
    source: 'ai',
    ai: true,
  });
  const todos = store.getTodos(id);
  res.json({ projectId: id, todos, newTodo });
});

// PATCH /api/guidance/:id/todos/:todoId
router.patch('/guidance/:id/todos/:todoId', (req: Request, res: Response) => {
  const { id, todoId } = req.params;
  const { done, completed, status } = req.body;
  let isDone: boolean | undefined = undefined;
  if (done !== undefined) isDone = Boolean(done);
  else if (completed !== undefined) isDone = Boolean(completed);
  else if (status !== undefined) isDone = status === 'completed';

  const updated = store.toggleTodo(id, todoId, isDone);
  res.json(updated || { id: todoId, status: isDone ? 'completed' : 'pending', done: isDone });
});

// DELETE /api/guidance/:id/todos/:todoId
router.delete('/guidance/:id/todos/:todoId', (req: Request, res: Response) => {
  const { id, todoId } = req.params;
  const deleted = store.deleteTodo(id, todoId);
  res.json({ success: deleted });
});

// GET /api/guidance/:id/versions
router.get('/guidance/:id/versions', (req: Request, res: Response) => {
  const { id } = req.params;
  const versions = store.versions.get(id) || [
    {
      id: 'v1',
      projectId: id,
      versionId: 'v1.0.0',
      versionType: 'milestone',
      name: '立项初稿',
      trigger: '全套材料入库',
      summary: '初始版本材料解析导入',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'v2',
      projectId: id,
      versionId: 'v1.1.0',
      versionType: 'snapshot',
      name: '第一轮诊断修编',
      trigger: 'AI 教练初筛批改',
      summary: '重构第5章竞品与第10章财务模型',
      createdAt: new Date().toISOString(),
    },
  ];
  res.json({ projectId: id, versions });
});

// POST /api/guidance/:id/versions
router.post('/guidance/:id/versions', (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, summary, versionType } = req.body;
  const list = store.versions.get(id) || [];
  const count = list.length + 1;
  const newV = {
    id: `v${count}`,
    projectId: id,
    versionId: `v1.${count}.0`,
    versionType: versionType || 'snapshot',
    name: name || `快照版本 ${count}`,
    trigger: '手动保存快照',
    summary: summary || '用户触发版本快照保存',
    createdAt: new Date().toISOString(),
  };
  list.unshift(newV);
  store.versions.set(id, list);
  res.json(newV);
});

// GET /api/guidance/:id/versions/:vId/diff
router.get('/guidance/:id/versions/:vId/diff', (req: Request, res: Response) => {
  const { id, vId } = req.params;
  res.json({
    projectId: id,
    versionId: vId,
    diff: `--- a/BP_v1.0.0.md\n+++ b/BP_${vId}.md\n@@ -20,6 +20,12 @@\n- 旧版仅提及初步技术原型，未列出量产中试良率\n+ 新版补充：样机通过工模测试，首批量产批次良品率达 98.4%\n+ 补充国家发明专利（专利号：ZL20241002341.2）授权文件`,
  });
});

// GET /api/guidance/:id/archive
router.get('/guidance/:id/archive', (req: Request, res: Response) => {
  const { id } = req.params;
  const detail = store.getProjectDetail(id);
  res.json({
    projectId: id,
    archiveId: `ARC-${Date.now()}`,
    projectName: detail?.name || '双创项目',
    exportDate: new Date().toISOString(),
    fileCount: 4,
    archiveUrl: `/materials/${id}/archive.zip`,
    events: [
      { time: '2026-08-01', eventType: 'version', title: '📄 选题立项完成', detail: '全套材料初始化导入，生成立项基线版本', refId: 'v1.0.0' },
      { time: '2026-08-15', eventType: 'score', title: '📊 商业模式闭环跑通', detail: '第一轮初筛与增量评分，综合得分 83 分', refId: 's1' },
      { time: '2026-09-01', eventType: 'version', title: '📄 样机研发与专利落定', detail: '重构第5章竞品与第10章财务模型', refId: 'v1.1.0' },
    ],
    scoreTrend: [
      { versionId: 'v1.0.0', createdAt: '2026-08-01', total: 78, trend: 'up' },
      { versionId: 'v1.1.0', createdAt: '2026-08-15', total: 83, trend: 'up' },
    ],
  });
});

export default router;
