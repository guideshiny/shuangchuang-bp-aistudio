/**
 * 全链路智能指导类型定义（对齐 backend/app/schemas/guidance.py，camelCase 字段）
 */

// ---- 创新类型分诊 ----
export interface TriageEvidence {
  type: string; // 类型（产品/工艺流程/服务/商业模式）
  quote: string; // BP 原文片段
}

export interface TriageResult {
  projectId: string;
  primaryType: string; // 主导类型
  secondaryTypes: string[]; // 次要类型
  confidence: Record<string, number>; // 各类型置信度
  evidence: TriageEvidence[];
  status: string; // active / re-triage
  degraded: boolean; // 是否降级（LLM 不可用）
}

// ---- 章节识别（本体驱动，要素级判定） ----
export interface ChapterElement {
  elementId: string;
  name: string;
  present: boolean;
  evidence: string;
}

export type ChapterMatchType = 'complete' | 'weak' | 'missing' | 'not_applicable';

export interface RecognizedChapter {
  standardId: string; // 标准章编号（1~12）
  standardName: string;
  actualTitle: string;
  matchType: ChapterMatchType;
  coverage: number; // 覆盖度 0~1
  elements: ChapterElement[];
}

export interface RecognitionResult {
  projectId: string;
  chapters: RecognizedChapter[];
  missing: string[]; // 缺项标准章编号
  weak: string[]; // 弱覆盖标准章编号
  notApplicable: string[];
  degraded: boolean;
}

// ---- 评分（基线 & 增量） ----
export interface ScoreItem {
  itemId: string;
  itemText: string; // 评审内容条目文本
  dimension: string; // 所属维度
  cap: number; // 条目分值上限
  baseScore: number; // 上一版得分（基线=0）
  currentScore: number;
  delta: number;
  reason: string;
  quote: string;
}

export type TrendType = 'up' | 'down' | 'flat';

export interface AssessResult {
  projectId: string;
  versionId: string;
  group: string; // 创意组/创业组
  scorecardName: string;
  items: ScoreItem[];
  dimensionScores: Record<string, number>;
  total: number;
  trend: TrendType; // 相对 base 版
  isBaseline: boolean; // 是否首次基线评分
  degraded: boolean;
  issues: string[]; // L6 校验问题
}

// ---- 工作台聚合 ----
export interface ScoreVersion {
  versionId: string;
  createdAt: string;
  total: number;
  trend: TrendType;
}

export interface GuidanceDashboard {
  projectId: string;
  projectName: string;
  triage: TriageResult | null;
  recognition: RecognitionResult | null;
  group: string | null; // 已选评分卡组别
  latestVersion: AssessResult | null;
  versions: ScoreVersion[];
  chaptersDone: number; // 完成度轨：已覆盖章节数
  chaptersTotal: number;
}

// ---- 版本管理（内容版本：快照/小版本/里程碑） ----
export type VersionType = 'snapshot' | 'version' | 'milestone';

export interface ProjectVersion {
  versionId: string;
  versionType: VersionType;
  label: string;
  source: string; // auto/manual/edit/milestone
  scoreVersionId: string | null; // 关联评分版本
  createdAt: string;
  total: number | null; // 关联评分总分（有评分时）
  content?: string; // 全文（详情接口返回）
  parentId?: string | null; // 父版本（版本树节点；None=根）
  branchName?: string | null; // 分支名（None=主线）
}

export interface VersionListResult {
  projectId: string;
  versions: ProjectVersion[];
}

export interface SaveVersionPayload {
  label?: string;
  content?: string;
}

export interface MarkMilestonePayload {
  label?: string;
  autoScore?: boolean;
}

// ---- 全文件版本管理（方案 A：文件注册表 + BP 细粒度链） ----
export interface ProjectFileItem {
  id?: string;
  name: string; // 文件名（含扩展名）
  fileType: 'text' | 'binary' | 'readonly'; // text/binary/readonly
  size: number; // 字节数
  versionRef: string | null; // 版本指针：text=最新内容版本号；binary=v1；readonly=空
  readonly: boolean; // 1=只读材料；0=可编辑
  updatedAt: string; // 更新时间
  category?: string; // 细分分类：核心申报书/调研访谈/商业模式/核心技术/路演答辩/演示多媒体/佐证材料等
  badge?: string; // 标签标识：国赛金奖/已授权/双C认证/三甲意向等
  description?: string; // 简要说明
  author?: string; // 责任人或出具单位
  ext?: string; // 扩展名 md/pptx/mp4/pdf/docx 等
  tags?: string[]; // 标签
  contentPreview?: string; // 文本或Markdown详细内容预览
  metadata?: Record<string, any>; // 专项元数据（如 PPT页数、视频时长、专利号、质检机构等）
}

export interface ProjectFileTree {
  projectId: string;
  files: ProjectFileItem[];
}

// ---- AI 教练会话（任务 #8-3：对话组落库，仿 deepseek.com） ----
export interface CoachSessionItem {
  id: number;
  title: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CoachSessionList {
  projectId: string;
  sessions: CoachSessionItem[];
}

export interface CoachMessageItem {
  id: number;
  role: string; // user/assistant
  content: string;
  createdAt: string;
}

export interface CoachSessionDetail {
  sessionId: number;
  title: string;
  messages: CoachMessageItem[];
}

export interface CoachMessagePayload {
  role?: string;
  content: string;
}

// ---- agent 操作执行（编辑 BP） ----
export type EditGranularity = 'paragraph' | 'element' | 'chapter' | 'document';

export interface EditDiff {
  type: 'added' | 'removed' | 'replaced';
  position: string;
  before: string;
  after: string;
}

export interface EditResult {
  projectId: string;
  versionId: string;
  granularity: EditGranularity;
  chapterId: string | null;
  instruction: string;
  diffs: EditDiff[];
  changed: boolean;
  summary: string;
  content: string; // 修改后全文
}

// ---- 全链路阶段旅程（L1~L6） ----
export type StageStatus = 'done' | 'doing' | 'todo';

export interface StageProgressItem {
  stage: string; // L1~L6
  label: string;
  status: StageStatus;
  hint: string;
}

export interface StageResult {
  projectId: string;
  stage: string;
  stageStatus: string;
  subStatus: Record<string, unknown>;
  progress: StageProgressItem[];
  history?: { role: string; content: string }[]; // 对话历史（会话记忆）
}

// ---- M2 诊断报告（你在哪 / 缺什么 / 下一步） ----
export interface DiagnosisItem {
  text: string;
  chapterId: string; // 关联章节（空=不关联）
  action: string; // chapter_coach / edit / score / full_run
  target: string; // 动作目标（章节号/预填指令等）
}

export interface DiagnosisResult {
  projectId: string;
  stage: string;
  stageLabel: string;
  youAre: string;
  missing: DiagnosisItem[];
  nextSteps: DiagnosisItem[];
}

// ---- M3 L1/L2 轻量对话 ----
export interface StageConversationReply {
  reply: string;
  choices: string[]; // 选项（空=结束轮或无需选择）
  done: boolean;
}

export interface StageConversationPayload {
  message?: string;
  choice?: string;
  /** 0902 会议：AI 教练意图聚焦阶段（L1~L6/free），仅切换对话语境，不改变项目真实阶段 */
  intentStage?: string;
}

export type StageTaskStatus = 'pending' | 'submitted' | 'passed' | 'failed';

export interface StageTaskItem {
  taskId: string; // t1/t2/t3
  title: string;
  status: StageTaskStatus;
  requirement: string;
  evidence: string;
  feedback: string;
}

export interface StageTaskList {
  projectId: string;
  tasks: StageTaskItem[];
  allPassed: boolean;
}

export interface StageTaskSubmitPayload {
  taskId: string;
  evidence: string;
}

// ---- M4 章节教练（不给分） ----
export interface ChapterCoachResult {
  chapterId: string;
  chapterName: string;
  judgeLooks: string[]; // 评委看什么
  missingElements: string[]; // 还缺哪些必写
  pitfalls: string[]; // 红线/坑/好示例
}

export interface ChapterCoachPayload {
  chapterId: string;
  draft: string;
  focused?: boolean;
}

// ---- M7 项目档案时间线 ----
export interface ArchiveEvent {
  time: string;
  eventType: 'version' | 'score';
  title: string;
  detail: string;
  refId: string;
}

export interface ArchiveResult {
  projectId: string;
  events: ArchiveEvent[];
  scoreTrend: ScoreVersion[]; // 趋势点（分数 mini 图）
}
