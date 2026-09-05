export interface ServerProjectFile {
  id: string;
  name: string;
  fileType: 'text' | 'binary' | 'readonly';
  size: number;
  versionRef: string | null;
  readonly: boolean;
  updatedAt: string;
  category?: string;
  badge?: string;
  description?: string;
  author?: string;
  ext?: string;
  tags?: string[];
  contentPreview?: string;
  metadata?: Record<string, any>;
}

export const SERVER_MOCK_FILES_P1: ServerProjectFile[] = [
  {
    id: 'f-bp-main',
    name: '国一【国赛】易休智能睡眠眼罩-商业计划书.md',
    fileType: 'text',
    size: 135794,
    versionRef: 'p1-c8',
    readonly: false,
    updatedAt: '2026-09-04 17:34:20',
    category: '核心申报书',
    badge: '国赛金奖正本',
    description: '国赛主申报商业计划书正本，包含12章完整体系论证与闭环商业逻辑',
    author: '项目负责人（陈逸飞·脑机接口博士）',
    ext: 'md',
    tags: ['国赛主文档', '核心BP', '版本 p1-c8'],
    metadata: {
      wordCount: 38400,
      chaptersCount: 12,
      lastEditor: '陈逸飞',
      reviewStatus: '已通过校赛/省赛直通国赛',
    },
  },
  {
    id: 'f-interview',
    name: '用户深度访谈纪要-24位核心睡眠障碍用户实测反馈.md',
    fileType: 'text',
    size: 32480,
    versionRef: 'p1-c2',
    readonly: false,
    updatedAt: '2026-09-03 14:20:15',
    category: '用户调研与需求',
    badge: '真实实测验证',
    description: '涵盖轻中度入睡困难者、高压白领、更年期失眠人群的痛点画像、试戴舒适度及支付意愿区间（299~499元）实录',
    author: '用户体验组（张婉婷·心理学硕）',
    ext: 'md',
    tags: ['需求真伪性', 'PSQI睡眠指数', 'NPS 88%'],
    metadata: {
      interviewees: 24,
      targetGroup: '22-45岁中青年高压人群',
      avgWearDays: 14,
      willingnessToPay: '¥399-¥599',
    },
  },
  {
    id: 'f-bmc',
    name: '商业模式画布与单位经济模型(BMC).md',
    fileType: 'text',
    size: 28650,
    versionRef: 'p1-c4',
    readonly: false,
    updatedAt: '2026-09-02 11:15:30',
    category: '商业模式闭环',
    badge: '高瓴导师推演',
    description: '九宫格商业模式画布、单位经济模型(Unit Economics)、LTV/CAC测算及院线B端分润机制',
    author: '商业化负责人（李博远·MBA）',
    ext: 'md',
    tags: ['LTV/CAC 4.2x', '毛利率 68.5%', '三阶变现'],
  },
  {
    id: 'f-tech-arch',
    name: '核心技术架构与脑电特征提取算法原型说明书.md',
    fileType: 'text',
    size: 45820,
    versionRef: 'p1-c3',
    readonly: false,
    updatedAt: '2026-09-01 16:30:45',
    category: '核心技术壁垒',
    badge: '自主发明专利',
    description: '3通道干电极抗头皮高阻抗设计、50Hz工频陷波自适应小波滤波及闭环声光刺激诱导算法详解',
    author: '技术总监（宋子航·生物医学工程硕）',
    ext: 'md',
    tags: ['PSG金标准对比', '信噪比提升3.8倍', '94.2%分期吻合率'],
  },
  {
    id: 'f-qa',
    name: '全国总决赛现场答辩高频问题预演与防守清单.md',
    fileType: 'text',
    size: 38240,
    versionRef: null,
    readonly: false,
    updatedAt: '2026-09-04 09:15:10',
    category: '答辩演练秘籍',
    badge: '金牌教练精炼30问',
    description: '国赛评委刁钻提问预演，涵盖第一发明人真实贡献度、二类医疗器械审批合规、B端医院渠道壁垒等核心防守预案',
    author: '国赛指导专家组',
    ext: 'md',
    tags: ['路演必背', '答辩防守', '评委拆招'],
  },
  {
    id: 'f-ppt',
    name: '路演PPT-商业计划演示总决赛汇报版.pptx',
    fileType: 'binary',
    size: 29884416, // 28.5 MB
    versionRef: 'v3.2',
    readonly: false,
    updatedAt: '2026-09-04 18:00:00',
    category: '路演答辩课件',
    badge: '8分钟国赛汇报版',
    description: '全国总决赛现场汇报PPT，16页精炼排版，附带详细演讲逐字稿备注与核心数据动态图表',
    author: '演说主讲人（陈逸飞）',
    ext: 'pptx',
    tags: ['16页幻灯片', '8分钟竞演', '配演讲手卡'],
    metadata: {
      slideCount: 16,
      durationMinutes: 8,
    },
  },
  {
    id: 'f-vcr',
    name: '路演VCR-1分钟产品功能与脑电波演示.mp4',
    fileType: 'binary',
    size: 89338880, // 85.2 MB
    versionRef: 'v2.1',
    readonly: false,
    updatedAt: '2026-09-03 19:40:00',
    category: '多媒体视频',
    badge: '4K超清实拍',
    description: '1分钟竞赛标准时长实物演示，实拍受试者佩戴、实时脑电波形跃迁及粉红噪音闭环声波助眠全过程',
    author: '视觉影像团队',
    ext: 'mp4',
    tags: ['4K 60FPS', '实物出镜', '时长 01:00'],
    metadata: {
      duration: '01:00',
      resolution: '3840x2160 (4K)',
    },
  },
  {
    id: 'f-step',
    name: '硬件样机3D工程拆解图与外观结构.step',
    fileType: 'binary',
    size: 35651584, // 34.0 MB
    versionRef: 'v1.0',
    readonly: false,
    updatedAt: '2026-08-28 10:22:00',
    category: '工程设计图纸',
    badge: 'SolidWorks工程模型',
    description: '眼罩整体工业设计、微型锂电池仓安全隔离舱、3个干电极点位弹性触点及遮光鼻托三维STEP文件',
    author: '工业设计工程师（王浩）',
    ext: 'step',
    tags: ['人体工学', '模具工程', '结构拆解'],
  },
  {
    id: 'f-onepager',
    name: '一页纸商业计划极简摘要(One-Pager).pdf',
    fileType: 'binary',
    size: 4404019, // 4.2 MB
    versionRef: 'v2.0',
    readonly: false,
    updatedAt: '2026-09-02 15:30:00',
    category: '评审速览简报',
    badge: '30秒投资人速览',
    description: '面向国赛初评网评专家与天使投资人的一页纸高密度彩色图文折页，提炼团队、技术、市场与商业模式',
    author: '商业企划部',
    ext: 'pdf',
  },
  {
    id: 'f-patent-1',
    name: '国家发明专利证书-非侵入式微弱脑电采集与抗干扰电极装置.pdf',
    fileType: 'readonly',
    size: 2936012, // 2.8 MB
    versionRef: null,
    readonly: true,
    updatedAt: '2026-08-20 11:00:00',
    category: '权威知识产权',
    badge: '学生第一发明人',
    description: '国家知识产权局授权发明专利，专利号 ZL 2024 1 0588219.8，项目负责人陈逸飞为第一发明人，高校无争议',
    author: '国家知识产权局 (CNIPA)',
    ext: 'pdf',
    tags: ['发明专利已授权', '第一发明人学生', '核心壁垒'],
    metadata: {
      patentNo: 'ZL 2024 1 0588219.8',
      patentType: '发明专利 (已授权)',
      firstInventor: '陈逸飞（学生负责人）',
    },
  },
  {
    id: 'f-patent-2',
    name: '实用新型专利证书-多通道自适应柔性智能助眠眼罩.pdf',
    fileType: 'readonly',
    size: 1992294, // 1.9 MB
    versionRef: null,
    readonly: true,
    updatedAt: '2026-08-15 09:30:00',
    category: '权威知识产权',
    badge: '已授权结构专利',
    description: '专利号 ZL 2024 2 1889921.3，保护柔性环形眼罩结构及电极与头皮接触力学自适应紧固装置',
    author: '国家知识产权局 (CNIPA)',
    ext: 'pdf',
  },
  {
    id: 'f-cma-report',
    name: '国家认监委CMA&CNAS第三方权威中试检测报告.pdf',
    fileType: 'readonly',
    size: 7130316, // 6.8 MB
    versionRef: null,
    readonly: true,
    updatedAt: '2026-08-25 14:15:00',
    category: '质量与安全检测',
    badge: '双C认证·全项合格',
    description: '浙江省电子信息产品检验所官方出具，通过 GB 4706.1-2005 电气安全与 GB 4824-2019 电磁兼容（EMC）全项检验',
    author: '浙江省电子信息产品检验所',
    ext: 'pdf',
    tags: ['CNAS L0145', 'CMA 190010112345', '电气安全', 'EMC合格'],
  },
  {
    id: 'f-hospital-contract',
    name: '首批三甲医院睡眠医学中心试用采购意向合同(脱敏版).pdf',
    fileType: 'readonly',
    size: 3984588, // 3.8 MB
    versionRef: null,
    readonly: true,
    updatedAt: '2026-08-30 16:50:00',
    category: '真实商业验证',
    badge: '意向金额120万元',
    description: '浙江大学医学院附属第一医院睡眠医学中心等3家机构试用及首批采购意向协议，证明商业真实性与市场迫切度',
    author: '三甲医院科研临床与设备转化办公室',
    ext: 'pdf',
    tags: ['真实盖章合同', '采购意向120万', 'B端真实落地'],
  },
  {
    id: 'f-industry-whitepaper',
    name: '2025-2026年中国睡眠经济与数字疗法产业调研白皮书.pdf',
    fileType: 'readonly',
    size: 13002342, // 12.4 MB
    versionRef: null,
    readonly: true,
    updatedAt: '2026-08-10 10:00:00',
    category: '行业宏观支撑',
    badge: '艾瑞咨询官方研报',
    description: '中国睡眠研究会与艾瑞咨询联合发布，详述中国38.2%成年人睡眠问题、千亿助眠蓝海及数字疗法渗透率爆发',
    author: '中国睡眠研究会 & 艾瑞咨询研究院',
    ext: 'pdf',
    tags: ['千亿市场', '年复合增长率18.6%', '数字疗法风口'],
  },
  {
    id: 'f-mentor-recommend',
    name: '指导教师推荐意见表与高校科研成果转化合规证明.pdf',
    fileType: 'readonly',
    size: 1468006, // 1.4 MB
    versionRef: null,
    readonly: true,
    updatedAt: '2026-08-22 17:20:00',
    category: '合规与导师背书',
    badge: '高校科技处盖章',
    description: '国家重点实验室主任、长江学者推荐评语，高校科技转化处正式出具合规备案证明，团队股权无纠纷',
    author: '高校科学技术研究院 & 成果转化办公室',
    ext: 'pdf',
    tags: ['长江学者推荐', '产权清晰合规', '无职务侵占'],
  },
  {
    id: 'f-novelty-search',
    name: '科技查新报告-基于闭环声光刺激的智能睡眠干预系统.pdf',
    fileType: 'readonly',
    size: 4823449, // 4.6 MB
    versionRef: null,
    readonly: true,
    updatedAt: '2026-08-18 15:40:00',
    category: '权威查新查重',
    badge: '国家一级查新机构',
    description: '教育部科技查新工作站（L02）检索全球12个核心专利数据库与学术文献库，查新结论：该微型闭环声学干预机制国内外未见相同报道',
    author: '教育部科技查新工作站（L02）',
    ext: 'pdf',
    tags: ['国家一级查新站', '全球查新查重', '国内外未见同类报道'],
  },
];

const projectFilesMap: Map<string, ServerProjectFile[]> = new Map();

export function getServerProjectFiles(projectId: string): ServerProjectFile[] {
  if (projectFilesMap.has(projectId)) {
    return projectFilesMap.get(projectId)!;
  }
  if (projectId === 'p1' || !projectId) {
    const list = [...SERVER_MOCK_FILES_P1];
    projectFilesMap.set('p1', list);
    return list;
  }

  // 为其他项目自动生成丰富材料清单
  const projectName =
    projectId === 'p2'
      ? '互联网+可再生能源储能系统'
      : projectId === 'p3'
      ? '跃动客体育'
      : projectId === 'p4'
      ? '飞行医院：支医扶贫多功能移动医疗队'
      : `创新创业项目-${projectId}`;

  const files: ServerProjectFile[] = [
    {
      id: `${projectId}-bp`,
      name: `${projectName}-商业计划书.md`,
      fileType: 'text',
      size: 124500,
      versionRef: `${projectId}-c6`,
      readonly: false,
      updatedAt: '2026-09-04 15:20:00',
      category: '核心申报书',
      badge: '国赛申报正本',
      description: `${projectName}商业计划书正本，包含12章完整体系论证`,
      author: '学生负责团队',
      ext: 'md',
    },
    {
      id: `${projectId}-interview`,
      name: `市场与用户调研深度访谈纪要.md`,
      fileType: 'text',
      size: 28400,
      versionRef: `${projectId}-c1`,
      readonly: false,
      updatedAt: '2026-09-03 10:10:00',
      category: '调研与用户',
      badge: '一手调研数据',
      description: `针对${projectName}目标用户群体的痛点访谈实录与问卷统计`,
      author: '市场调研组',
      ext: 'md',
    },
    {
      id: `${projectId}-bmc`,
      name: `商业模式画布与财务测算模型.md`,
      fileType: 'text',
      size: 26300,
      versionRef: `${projectId}-c2`,
      readonly: false,
      updatedAt: '2026-09-02 16:40:00',
      category: '商业模式闭环',
      badge: '财务模型闭环',
      description: '九宫格商业模式画布、单位经济模型(Unit Economics)与三年财务预测',
      author: '财务顾问组',
      ext: 'md',
    },
    {
      id: `${projectId}-qa`,
      name: `全国总决赛现场答辩30问攻防演练.md`,
      fileType: 'text',
      size: 34100,
      versionRef: null,
      readonly: false,
      updatedAt: '2026-09-04 09:30:00',
      category: '答辩演练秘籍',
      badge: '专家精选30问',
      description: '国赛评委高频提问预演话术与证据索引清单',
      author: '指导专家组',
      ext: 'md',
    },
    {
      id: `${projectId}-ppt`,
      name: `路演PPT-商业计划演示总决赛汇报版.pptx`,
      fileType: 'binary',
      size: 26500000,
      versionRef: 'v3.0',
      readonly: false,
      updatedAt: '2026-09-04 17:00:00',
      category: '路演答辩课件',
      badge: '8分钟竞演版',
      description: '全国总决赛现场汇报PPT，16页精编排版，带逐字演讲稿备注',
      author: '演说主讲人',
      ext: 'pptx',
    },
    {
      id: `${projectId}-vcr`,
      name: `路演VCR-1分钟产品功能与应用场景演示.mp4`,
      fileType: 'binary',
      size: 78000000,
      versionRef: 'v2.0',
      readonly: false,
      updatedAt: '2026-09-03 18:00:00',
      category: '多媒体视频',
      badge: '4K超清实拍',
      description: '实物运行演示与落地应用场景实拍视频',
      author: '宣传组',
      ext: 'mp4',
    },
    {
      id: `${projectId}-onepager`,
      name: `一页纸商业计划摘要简报(One-Pager).pdf`,
      fileType: 'binary',
      size: 3800000,
      versionRef: 'v1.5',
      readonly: false,
      updatedAt: '2026-09-02 14:00:00',
      category: '快速评审简报',
      badge: '30秒投资人速览',
      description: '提炼核心技术、市场规模与商业模式的一页纸彩色简报',
      author: '商业企划部',
      ext: 'pdf',
    },
    {
      id: `${projectId}-patent`,
      name: `核心知识产权发明专利授权证书.pdf`,
      fileType: 'readonly',
      size: 2600000,
      versionRef: null,
      readonly: true,
      updatedAt: '2026-08-20 10:00:00',
      category: '权威知识产权',
      badge: '学生第一发明人',
      description: '国家知识产权局授权发明专利证书，学生团队负责人排第一位',
      author: '国家知识产权局 (CNIPA)',
      ext: 'pdf',
    },
    {
      id: `${projectId}-testing`,
      name: `国家权威第三方检验检测报告(CMA/CNAS).pdf`,
      fileType: 'readonly',
      size: 5800000,
      versionRef: null,
      readonly: true,
      updatedAt: '2026-08-25 15:00:00',
      category: '质量与安全检测',
      badge: '国家权威质检',
      description: '国家认监委授权第三方质检机构出具的检验检测报告，全项指标合格',
      author: '国家质检中心',
      ext: 'pdf',
    },
    {
      id: `${projectId}-order`,
      name: `首批商业化采购意向合同与战略合作协议.pdf`,
      fileType: 'readonly',
      size: 3400000,
      versionRef: null,
      readonly: true,
      updatedAt: '2026-08-28 16:00:00',
      category: '真实商业验证',
      badge: '真实盖章协议',
      description: '真实客户采购意向合同与合作协议，金额证明市场真实需求',
      author: '合作客户单位',
      ext: 'pdf',
    },
    {
      id: `${projectId}-mentor`,
      name: `指导教师推荐意见与成果转化合规证明.pdf`,
      fileType: 'readonly',
      size: 1500000,
      versionRef: null,
      readonly: true,
      updatedAt: '2026-08-22 14:00:00',
      category: '合规与导师背书',
      badge: '高校科技处盖章',
      description: '指导教师推荐函与学校科研处出具的成果转化合规无纠纷证明',
      author: '高校科学技术研究院',
      ext: 'pdf',
    },
    {
      id: `${projectId}-novelty`,
      name: `科技查新报告(教育部国家一级查新站).pdf`,
      fileType: 'readonly',
      size: 4200000,
      versionRef: null,
      readonly: true,
      updatedAt: '2026-08-18 11:00:00',
      category: '权威查新查重',
      badge: '国家一级查新站',
      description: '查新结论：该技术路线在国内外公开发表文献与专利中具有新颖性',
      author: '教育部科技查新工作站',
      ext: 'pdf',
    },
  ];

  projectFilesMap.set(projectId, files);
  return files;
}

export function addServerProjectFile(projectId: string, file: Partial<ServerProjectFile>): ServerProjectFile {
  const list = getServerProjectFiles(projectId);
  const now = new Date();
  const dateStr = now.toISOString().replace('T', ' ').slice(0, 19);
  const ext = (file.name || '').split('.').pop()?.toLowerCase() || '';
  const fileType = file.fileType || (ext === 'md' || ext === 'txt' ? 'text' : ext === 'pdf' || ext === 'docx' ? 'readonly' : 'binary');

  const newFile: ServerProjectFile = {
    id: file.id || `file-${Date.now()}`,
    name: file.name || `未命名文件.${ext || 'txt'}`,
    fileType,
    size: file.size || Math.floor(Math.random() * 50000) + 10240,
    versionRef: file.versionRef || (fileType === 'text' ? `${projectId}-c${Date.now() % 10}` : fileType === 'binary' ? 'v1' : null),
    readonly: file.readonly !== undefined ? file.readonly : fileType === 'readonly',
    updatedAt: dateStr,
    category: file.category || (fileType === 'text' ? '补充文本' : fileType === 'binary' ? '多媒体大文件' : '支撑佐证材料'),
    badge: file.badge || '最新上传',
    description: file.description || '用户自主上传的项目佐证材料',
    author: file.author || '项目团队',
    ext,
    tags: file.tags || ['新材料'],
  };

  list.unshift(newFile);
  projectFilesMap.set(projectId, list);
  return newFile;
}

export function deleteServerProjectFile(projectId: string, filename: string): boolean {
  const list = getServerProjectFiles(projectId);
  const idx = list.findIndex((f) => f.name === filename || f.id === filename);
  if (idx >= 0) {
    list.splice(idx, 1);
    projectFilesMap.set(projectId, list);
    return true;
  }
  return false;
}
