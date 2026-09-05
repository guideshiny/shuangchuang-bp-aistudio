import { ProjectFileItem } from '../types/guidance';

/**
 * 针对双创大赛（互联网+ / 挑战杯）定制的真实度极高的项目文件 Mock 数据集
 */

export const MOCK_PROJECT_FILES_P1: ProjectFileItem[] = [
  // ===================== 1. 可编辑文本（版本化） =====================
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
      coreFinding: '用户普遍抗拒传统手环的被动监测，强烈渴望“主动助眠干预+轻量化无感佩戴”',
    },
    contentPreview: `# 用户深度访谈纪要：24位核心睡眠障碍受试者双盲实测反馈报告

**调研执行机构**：易休智能硬件实验室 & 浙江大学心理健康与脑科学中心  
**调研周期**：2026年07月15日 - 2026年08月20日（历时36天）  
**有效样本**：24人（入选标准：PSQI匹兹堡睡眠质量指数量表得分 ≥ 8分，且近3个月无抗焦虑处方药依赖）  

---

## 一、受试者画像分布
| 样本编号 | 年龄/性别 | 职业场景 | 睡眠痛点标签 | 既往解决方式 | 实测佩戴天数 | 满意度(1-10) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| U-01 | 28岁 / 女 | 互联网大厂运营 | 睡前反刍思维严重、入睡潜伏期 > 60分钟 | 褪黑素、白噪音App | 14天 | 9.2 |
| U-04 | 35岁 / 男 | 律所高级合伙人 | 易惊醒、REM快速眼动期片段化 | 睡眠手环、香薰 | 14天 | 9.0 |
| U-09 | 22岁 / 男 | 考研二战应届生 | 考前焦虑失眠、脑电节律紊乱 | 强行静坐 | 21天 | 9.5 |
| U-17 | 42岁 / 女 | 金融高管 / 更年期早期 | 潮热盗汗伴随早醒、晨起头痛 | 处方镇静剂（副作用担忧） | 14天 | 8.8 |

---

## 二、核心定量结论
1. **入睡潜伏期改善**：从基线平均 **54.6 ± 12.3 分钟** 缩短至 **21.8 ± 6.4 分钟**，平均缩短幅度达 **60.1%**。
2. **夜间觉醒频次**：由每夜平均 3.2 次下降至 0.8 次，深睡眠比例提升 14.5 个百分点。
3. **佩戴耐受度**：48g超轻重量搭配纳米蚕丝遮光罩，91.7%（22/24人）表示“无异物压迫感，整夜佩戴不移位”。
4. **定价接受阈值**：
   - 基础版（眼罩+基础算法）：心理预期价格为 **¥299 - ¥399**（83.3%受访者愿意全款预购）；
   - 医疗专业版（附带三甲医院专家报告解读+数字处方）：心理预期价格为 **¥599 - ¥899**。

---

## 三、典型访谈原声摘录
> **U-01（28岁，大厂运营）**：“以前戴Apple Watch睡觉不仅硌手腕，而且早上起来只看到冷冰冰的一堆红绿柱状图告诉我昨晚睡得差，这只会让我更焦虑！易休眼罩最打动我的是‘它在帮我睡’，闭上眼睛听到的粉红噪音会跟着我的呼吸频率慢下来，不知不觉就失去了知觉。”

> **U-09（22岁，考研学生）**：“模拟考前那两周我几乎整夜失眠，戴上眼罩开启‘考试减压模式’后，第三天开始就能在半小时内睡着，第二天早上脑子明显更清醒。”

---

## 四、对商业计划书论证的支撑价值
- **支撑章节**：第3章【市场痛点与用户洞察】、第5章【临床循证与有效性数据】；
- **答辩防守**：有力回击评委“睡眠监测是否属于伪需求”的质疑，明确确立“从被动记录跨越到主动闭环干预”的代际优势。`,
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
    metadata: {
      grossMargin: '68.5%',
      ltvCacRatio: '4.2x',
      paybackPeriod: '4.8个月',
      cEndPrice: '¥399 / ¥699',
    },
    contentPreview: `# 易休智能睡眠眼罩：商业模式画布（BMC）与单位经济模型测算

## 一、经典商业模式九宫格（Business Model Canvas）
| 画布模块 | 核心规划与落地路径 |
| :--- | :--- |
| **重要伙伴 (Key Partners)** | ① 浙大一院/长征医院临床睡眠中心（临床循证科研）；② 稳健医疗（医用级柔性电极代工）；③ 顺丰冷链/京东医药物流；④ 头部助眠KOL与健康科普IP |
| **关键业务 (Key Activities)** | ① 闭环脑电干预算法持续OTA迭代；② 二类医疗器械注册申报；③ 品牌DTC电商运营与私域高净值睡眠社群运营 |
| **核心资源 (Key Resources)** | ① 3项国家发明专利（微弱脑电抗干扰检测）；② 20万条多导睡眠图（PSG）真实标注数据集；③ 产学研院士顾问团队 |
| **价值主张 (Value Propositions)** | “不仅是监测，更是干预”——让3亿睡眠障碍人群在20分钟内自然入睡，重获高质量深睡 |
| **客户关系 (Customer Relationships)** | 软硬件一体化长效伴随：硬件交付不是终点，而是持续个性化数字疗法服务的起点 |
| **渠道通路 (Channels)** | 线上：天猫旗舰店、抖音助眠直播间、微信小程序；线下：高端体检中心睡眠门诊、三甲医院神经内科绿色通道 |
| **客户细分 (Customer Segments)** | ① 核心客群：高压职场白领、考研/公考青年（20-40岁）；② 潜力客群：更年期伴随睡眠障碍女性（45-55岁）；③ 机构客群：健康管理中心与高端康养酒店 |
| **成本结构 (Cost Structure)** | 硬件BOM成本（28.5%）、研发与算法云算力（24%）、临床审批与试验费用（15%）、市场获客CAC（21%）、运营与物流（11.5%） |
| **收入来源 (Revenue Streams)** | ① 硬件销售溢价（毛利68.5%）；② 深度AI睡眠顾问与数字音频订阅年费（¥198/年）；③ 医院睡眠筛查设备批售与耗材分润 |

---

## 二、单客经济模型（Unit Economics）测算
- **标准零售价（ASP）**：¥499 元（综合基础版与进阶版加权平均）
- **单台硬件 BOM 成本**：¥157.2 元
  - 核心低功耗脑电处理芯片：¥38.5
  - 纳米柔性干电极模组（3通道）：¥24.0
  - 骨传导助眠发声微单元：¥18.6
  - 航天记忆棉+医用级防螨丝绸外罩：¥22.5
  - 锂电池与电源管理芯片：¥14.6
  - 包装盒、充电线及说明书：¥8.0
  - 工厂贴片SMT与组装质检：¥31.0
- **综合毛利**：¥341.8 元（**毛利率 68.5%**）
- **单客获客成本（CAC）**：¥95.0 元（通过专业科普内容种草+定向信息流投放）
- **客户生命周期价值（LTV）**：
  - 硬件毛利贡献：¥341.8 元
  - 第2年及后续软件服务订阅分成（续费率预估 35%）：¥69.3 元
  - 换新机与耗材配件：¥52.0 元
  - **综合 LTV**：¥463.1 元
- **LTV / CAC 比率**：**4.87 倍**（显著高于行业及格线 3.0 倍，具备优异的可扩张性）`,
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
    metadata: {
      samplingRate: '500 Hz',
      accuracyVsPsg: '94.2%',
      latency: '< 18 ms',
      patentNo: 'ZL 2024 1 0588219.8',
    },
    contentPreview: `# 核心技术架构与脑电闭环干预算法原型说明书

## 1. 硬件采集拓扑架构
易休眼罩采用 **额叶双侧对称3通道（Fp1, Fp2, Fpz接地参考）** 干电极排布架构，摆脱了传统湿电极必须涂抹导电膏的严重痛点。

### 1.1 核心硬件指标
- **前置放大器输入阻抗**：≥ 10 GΩ，容忍额头干燥角质层高达 1.2 MΩ 的接触阻抗；
- **共模抑制比（CMRR）**：高达 **118 dB**（在 50Hz 工频下），强力滤除人体天线效应引入的环境电磁噪声；
- **模数转换精度（ADC）**：24-bit 低噪声微功耗专用模拟前端芯片（TI ADS1299 定制版替代方案）；
- **工作功耗**：整机连续运行仅 14 mW，配备 180 mAh 微型防爆固态锂聚合物电池，续航突破 16 小时。

---

## 2. 软件算法：实时睡眠分期与闭环干预引擎
系统在端侧集成轻量化 TinyML 决策树与小波阈值去噪核，在云端运行大型多模态睡眠图谱模型：

\`\`\`
[额头微弱脑电 EEG 信号 (5~50μV)]
              │
              ▼
   [硬件模拟高通滤波 + 50Hz自适应陷波器]
              │
              ▼
  [离散小波变换 (DWT) 运动伪影去除 (动眼/眨眼)]
              │
              ▼
  [时频域特征提取：δ波(0.5-4Hz)、θ波(4-8Hz)、α波(8-13Hz)]
              │
              ▼
  [实时睡眠分期判别模型 (N1/N2/N3/REM/Awake)]
  (与三甲医院 PSG 金标准吻合率达 94.2%)
              │
              ▼
  [自适应声频调制发生器 (闭环粉红噪音 / 双耳差拍 40Hz)]
\`\`\`

## 3. 创新闭环干预机制：非药物诱导演算法
当检测到使用者处于清醒向浅睡期（N1阶段）过渡时，系统自动启动 **40Hz γ节律同频共振声波**，伴随呼吸节奏缓慢下降为 **0.5-2Hz 的 δ 波诱导声**，诱导大脑皮层神经元进入同步慢波放电状态，实现从“数羊无果”到“沉浸式入眠”的跃迁。`,
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
    metadata: {
      questionCount: 30,
      focusAreas: ['学生贡献度', '技术真伪', '商业闭环', '财务合规'],
    },
    contentPreview: `# 全国总决赛现场答辩：评委高频30问与金牌防守话术

### Q1【技术真伪与竞品壁垒】
**评委质询**：“华为、小米手环和市面上的白噪音机都在做睡眠，你们一个大学生初创团队，凭什么能做得过巨头？”  
**防守回答要点**：
> 1. **核心差异在于‘闭环干预’而非‘被动记录’**：手环采用PPG光电心率推测睡眠，误差超过25%，且只能在第二天‘告知你没睡好’，无法干预；我们是直接采集脑电‘金标准’，在床头实现毫秒级声学闭环诱导。  
> 2. **硬件形态具有专用物理优势**：眼罩具有100%全黑遮光天然属性，与额叶紧密贴合，是头戴脑电设备的最佳载体。  
> 3. **团队在柔性干电极领域拥有3项已授权国家发明专利**，将专业睡眠监测室数万元的设备微型化到了几百元。

---

### Q2【学生第一发明人贡献度与师生共创合规】
**评委质询**：“核心专利导师的名字在第几位？这个项目是不是导师实验室课题拿给学生打比赛的‘套壳’？”  
**防守回答要点**：
> 1. **出示支撑材料**（指引附件《专利证书》）：项目负责人陈逸飞作为直博生，在发明专利 ZL202410588219.8 中为**第一发明人**，完成了微弱脑电滤波算法的全部核心代码与硬件布板。  
> 2. **产权清晰合规**（指引附件《高校成果转化证明》）：团队已与学校科技处签署产学研转化协议，学生创业团队持有合资公司 85% 绝对控股表决权，指导教师仅作为首席科学顾问提供学术支持，合规性已通过校级合规审查。

---

### Q3【医疗器械认证与当前商业化推进】
**评委质询**：“医疗器械二类证审批周期至少需18-24个月，在拿证前你们怎么合规赚钱，避免非法行医风险？”  
**防守回答要点**：
> 1. **双轨并行战略**：目前以‘健康消费级智能睡眠硬件’（经CMA/CNAS全项检测合格）切入天猫、京东及跨境电商，主打‘减压助眠’，避开疾病诊断疗效宣称，已实现年销售额 420 万元；  
> 2. **科研与医疗渠道**：以‘科研试验设备’名义与浙大一院、长征医院合作开展临床试验，收取科研协作与数据服务费；二类医疗器械注册申请已于上月正式进入国家药监局绿色通道初审。`,
  },

  // ===================== 2. 大文件（演示与音视频，只保留最新） =====================
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
      aspectRatio: '16:9',
      durationMinutes: 8,
      recommendedSpeaker: '陈逸飞（负责人）',
      keySlides: [
        '01. 封面与破题：中国3亿人的深睡危机',
        '02. 痛点洞察：监测≠治疗，市面方案为何失灵',
        '03. 革命性产品：易休闭环智能助眠眼罩',
        '04. 核心硬科技：高信噪比柔性干电极突破',
        '05. 算法闭环：实时脑电分期与粉红噪音共振',
        '06. 临床循证：三甲医院双盲对照有效率89.4%',
        '07. 商业闭环：DTC消费级+院线科研双轮驱动',
        '08. 财务预测：3年营收过亿与健康现金流',
        '09. 顶尖跨学科团队：医工交叉创客基因',
        '10. 愿景与社会价值：让天下没有难睡的夜晚',
      ],
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
      fps: 60,
      audio: 'Dolby 5.1 声场模拟',
      chapters: [
        { time: '00:00', title: '现代人辗转反侧失眠痛点实拍' },
        { time: '00:15', title: '易休眼罩轻量化48g亲肤佩戴' },
        { time: '00:30', title: '手机App呈现实时动态脑电波' },
        { time: '00:45', title: '闭环诱导：脑电波从高频β波转为平缓深睡δ波' },
        { time: '00:55', title: '金奖团队与产学研合作寄语' },
      ],
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
    metadata: {
      software: 'SolidWorks 2024 / CAD',
      weightGram: 48,
      materials: '医用级导电硅胶 + 60支双面真丝 + 慢回弹记忆棉',
      waterproofRating: 'IPX4 防泼溅防汗',
    },
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
    tags: ['初评网评利器', '一目了然', '精美排版'],
    metadata: {
      pageSize: 'A4 横版高分辨率',
      readDurationSeconds: 45,
      highlights: '痛点、产品硬核、市场容量4800亿、融资需求800万出让10%',
    },
  },

  // ===================== 3. 只读佐证材料（AI 上下文 / 权威背书） =====================
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
      firstInventor: '陈逸飞（学生团队负责人）',
      applyDate: '2024年03月18日',
      grantDate: '2025年08月12日',
      patentee: '杭州易休脑机科技有限公司 / 浙江大学',
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
    tags: ['实用新型', '外观与结构保护', '合法合规'],
    metadata: {
      patentNo: 'ZL 2024 2 1889921.3',
      patentType: '实用新型专利 (已授权)',
      grantDate: '2025年03月05日',
    },
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
    author: '浙江省电子信息产品检验所（国家认监委授权质检机构）',
    ext: 'pdf',
    tags: ['CNAS L0145', 'CMA 190010112345', '电气安全', 'EMC合格'],
    metadata: {
      reportNo: 'ZJ-ELEC-2026-Q88912',
      inspectionOrg: '浙江省电子信息产品检验所',
      standards: ['GB 4706.1-2005', 'GB 4824-2019', 'GB/T 16886.10-2017 生物相容性无刺激'],
      conclusion: '所检项目符合标准要求，样品电气安全性、低频辐射量及亲肤致敏性均达标，结论：全部合格。',
    },
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
    metadata: {
      contractAmount: '¥1,200,000 元',
      clientName: '浙江大学医学院附属第一医院睡眠医学中心 / 上海长征医院神经内科',
      orderQuantity: '500 台专业版科研机 + 3年院内科研随访软件服务',
      signingDate: '2026年08月10日',
      contractStatus: '双方已盖公章，待二期样机交付',
    },
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
    metadata: {
      marketSize2026: '4850 亿元',
      cagr: '18.6%',
      targetPopulation: '3.12 亿存在睡眠困扰的中国居民',
      source: '中国睡眠研究会 2025 年白皮书官方公开报告',
    },
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
    metadata: {
      mentorName: '王建民 教授 / 博士生导师（长江学者特聘教授）',
      reviewConclusion: '该项目由学生团队自发构思与主导攻关，技术路径原创，与导师现有课题产权清晰无重叠，极力推荐参赛。',
      approvalStamp: '高校科学技术研究院成果转化专用章（已验真）',
    },
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
    metadata: {
      searchReportNo: 'CX-2026-EDU-0914',
      databaseCovered: ['WIPO', 'USPTO', 'EPO', 'CNKI', 'IEEE Xplore', 'PubMed'],
      conclusion: '在国内及国际已公开发表的专利和学术论文中，未见与本课题“微型化高阻抗干电极与40Hz动态调频闭环声波一体化便携睡眠眼罩”完全相同的技术特征公开，具备显著的新颖性与创造性。',
    },
  },
];

/**
 * 根据项目ID获取丰富的项目文件数据
 */
export function getEnrichedProjectFiles(projectId: string, baseFiles?: ProjectFileItem[]): ProjectFileItem[] {
  if (projectId === 'p1' || !projectId) {
    return MOCK_PROJECT_FILES_P1;
  }

  // 如果传入了基础文件，且包含有效属性，进行增强，否则根据项目名称自动生成对应双创赛事材料
  const projectName =
    projectId === 'p2'
      ? '互联网+可再生能源储能系统'
      : projectId === 'p3'
      ? '跃动客体育'
      : projectId === 'p4'
      ? '飞行医院：支医扶贫多功能移动医疗队'
      : `创新创业项目-${projectId}`;

  return [
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
      tags: ['国赛主文档', '核心BP'],
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
      metadata: {
        slideCount: 16,
        durationMinutes: 8,
      },
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
      metadata: {
        duration: '01:00',
        resolution: '4K',
      },
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
}
