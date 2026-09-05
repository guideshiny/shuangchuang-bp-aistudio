import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import {
  Alert,
  App as AntdApp,
  Button,
  Empty,
  Input,
  Modal,
  Progress,
  Select,
  Space,
  Spin,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import {
  FileOutlined,
  FlagOutlined,
  RocketOutlined,
  SaveOutlined,
  SendOutlined,
  PlusOutlined,
  SearchOutlined,
  CloseOutlined,
  FilePptOutlined,
  VideoCameraOutlined,
  SafetyCertificateOutlined,
  ApartmentOutlined,
  CloudUploadOutlined,
  AppstoreOutlined,
  FileTextOutlined,
  DownloadOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { ProjectFileViewer } from './ProjectFileViewer';
import { getEnrichedProjectFiles } from '../../data/mockProjectFiles';
import {
  appendCoachMessage,
  assessProject,
  createBranch,
  createCoachSession,
  createTodo,
  deleteCoachSession,
  deleteTodo,
  editProject,
  fetchArchive,
  fetchBp,
  fetchCoachSession,
  fetchDiagnosis,
  fetchGuidanceDashboard,
  fetchProjectFiles,
  fetchStage,
  fetchStageTasks,
  fetchTodos,
  fetchVersion,
  fetchVersionDiff,
  generateTodos,
  listCoachSessions,
  listVersions,
  markMilestone,
  recognizeProject,
  saveVersion,
  stageConversation,
  stageGreet,
  triageProject,
  updateTodo,
} from '../../api/guidance';
import type {
  ArchiveEvent,
  ChapterMatchType,
  CoachSessionItem,
  DiagnosisResult,
  EditDiff,
  GuidanceDashboard,
  ProjectFileItem,
  ProjectVersion,
  RecognizedChapter,
  StageResult,
  StageTaskList,
  TrendType,
} from '../../types/guidance';

const { Text } = Typography;
const { TextArea } = Input;

/** 标准 12 章选项 */
const STANDARD_CHAPTER_OPTIONS = [
  { value: '1', label: '1 执行摘要' },
  { value: '2', label: '2 项目背景与痛点' },
  { value: '3', label: '3 产品/服务与技术' },
  { value: '4', label: '4 市场分析' },
  { value: '5', label: '5 竞争分析' },
  { value: '6', label: '6 商业模式与盈利' },
  { value: '7', label: '7 营销策略' },
  { value: '8', label: '8 运营/生产/实施计划' },
  { value: '9', label: '9 团队与组织' },
  { value: '10', label: '10 财务预测与融资' },
  { value: '11', label: '11 风险分析与退出' },
  { value: '12', label: '12 发展规划/社会价值/附录' },
];

/** 章节状态配置 */
const CHAPTER_STATUS: Record<ChapterMatchType, { color: string; label: string }> = {
  complete: { color: 'success', label: '完整' },
  weak: { color: 'warning', label: '弱覆盖' },
  missing: { color: 'error', label: '缺项' },
  not_applicable: { color: 'default', label: '不适用' },
};

/** 趋势标签 */
function TrendTag({ trend }: { trend: TrendType }) {
  if (trend === 'up') return <Tag color="green">上升</Tag>;
  if (trend === 'down') return <Tag color="red">下降</Tag>;
  return <Tag>持平</Tag>;
}

/** 阶段 → 专项教练身份名（决策 B2 方案 3 分层教练） */
function coachNameOf(stage: string): string {
  const map: Record<string, string> = {
    L1: '· 创意教练',
    L2: '· 验证教练',
    L3: '· 写作教练',
    L4: '· 打磨教练',
    L5: '· 路演教练',
    L6: '· 冲刺教练',
  };
  return map[stage] ?? '';
}

/** 评分折线图（任务 #3 子任务 3：块状进度条 → SVG 折线） */
function TrendLine({ data }: { data?: { versionId: string; total: number; trend: TrendType }[] }) {
  const safeData = data || [];
  if (!safeData.length) return null;
  const W = 252;
  const H = 90;
  const PAD = 8;
  // 归一化分数 → 坐标（87.5 中心，56 横向间距）
  const xs = (i: number) => PAD + (i * (W - PAD * 2)) / Math.max(safeData.length - 1, 1);
  const yOf = (v: number) => PAD + (1 - (Math.min(v, 100) - 50) / 50) * (H - PAD * 2);
  const points = safeData.map((d, i) => `${xs(i)},${yOf(d.total)}`).join(' ');
  // 面积填充渐变
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
      {/* 网格基线 */}
      <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#f0f0f0" />
      <polyline
        points={`${PAD},${H - PAD} ${points} ${W - PAD},${H - PAD}`}
        fill="url(#trendGrad)"
        stroke="none"
      />
      <defs>
        <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1677ff" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#1677ff" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polyline points={points} fill="none" stroke="#1677ff" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
      {safeData.map((d, i) => (
        <g key={d.versionId || i}>
          <circle cx={xs(i)} cy={yOf(d.total)} r={i === safeData.length - 1 ? 4 : 3} fill={d.trend === 'down' ? '#f5222d' : d.trend === 'up' ? '#52c41a' : '#1677ff'} stroke="#fff" strokeWidth="1.2" />
          <text x={xs(i)} y={H - 2} fontSize="8" fill="#999" textAnchor="middle">{i + 1}</text>
          <title>{`${d.versionId}：${d.total} 分（${d.trend === 'up' ? '上升' : d.trend === 'down' ? '下降' : '持平'}）`}</title>
        </g>
      ))}
      {/* 峰值标注 */}
      {safeData.length ? (
        <text x={W - PAD} y={yOf(safeData[safeData.length - 1].total) - 6} fontSize="9" fill="#1677ff" textAnchor="end" fontWeight="600">
          {safeData[safeData.length - 1].total} 分
        </text>
      ) : null}
    </svg>
  );
}

/** HTML 转义 */
function escHtml(s?: unknown): string {
  if (s == null) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** 行内 Markdown */
function inlineMd(s?: unknown): string {
  if (s == null) return '';
  return escHtml(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code>$1</code>');
}

/** 极简 Markdown 渲染 */
function renderSimpleMarkdown(text?: unknown): string {
  if (text == null || typeof text !== 'string') return '';
  const lines = text.split('\n');
  let html = '';
  let inCode = false;
  let inList = false;
  const codeBuf: string[] = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (line.startsWith('```')) {
      if (inCode) {
        html += `<pre style="background:#f6f8fa;padding:8px;border-radius:4px;overflow:auto">${escHtml(codeBuf.join('\n'))}</pre>`;
        codeBuf.length = 0;
        inCode = false;
      } else {
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      codeBuf.push(raw);
      continue;
    }
    if (line.startsWith('#')) {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      const level = Math.min(line.match(/^#+/)![0].length, 4);
      // 识别章标题 → 加锚点 id（供章节条跳转）。优先级：第N章 > N 标题 > N.标题（避免「四、」误伤）
      const titleText = line.replace(/^#+\s*/, '');
      let chNum: string | null = null;
      const m2 = titleText.match(/^第([一二三四五六七八九十]{1,3})[章节]/);
      const m1n = titleText.match(/^(\d{1,2})\s+[^\d.]/);
      if (m2) {
        const order: Record<string, string> = { 一: '1', 二: '2', 三: '3', 四: '4', 五: '5', 六: '6', 七: '7', 八: '8', 九: '9', 十: '10', 十一: '11', 十二: '12' };
        chNum = order[m2[1]] ?? null;
      } else if (m1n) {
        chNum = m1n[1];
      }
      const chId = chNum ? ` id="ch-${chNum}"` : '';
      html += `<h${level}${chId} style="margin:10px 0 4px">${inlineMd(titleText)}</h${level}>`;
      continue;
    }
    if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!inList) {
        html += '<ul style="margin:4px 0;padding-left:20px">';
        inList = true;
      }
      html += `<li>${inlineMd(line.slice(2))}</li>`;
      continue;
    }
    if (line.startsWith('> ')) {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      html += `<blockquote style="margin:4px 0;padding:4px 10px;border-left:3px solid #ddd;color:#666">${inlineMd(line.slice(2))}</blockquote>`;
      continue;
    }
    if (line === '---') {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      html += '<hr style="margin:8px 0;border:none;border-top:1px solid #eee" />';
      continue;
    }
    if (inList) {
      html += '</ul>';
      inList = false;
    }
    if (line === '') {
      html += '<div style="height:8px"></div>';
    } else {
      html += `<div>${inlineMd(line)}</div>`;
    }
  }
  if (inList) html += '</ul>';
  if (inCode) html += `<pre style="background:#f6f8fa;padding:8px;border-radius:4px">${escHtml(codeBuf.join('\n'))}</pre>`;
  return html;
}

/** 极简 Markdown 预览 */
function SimpleMarkdown({ text }: { text: string }) {
  const html = useMemo(() => renderSimpleMarkdown(text || ''), [text]);
  return (
    <div
      style={{ fontSize: 13, lineHeight: 1.8, color: 'rgba(0,0,0,0.88)' }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/* ========== 侧栏视图类型 ========== */
type SideView = 'todo' | 'files' | 'versions' | 'archive';
type CenterTab = 'bp' | 'diag' | 'score' | 'file';

/** 动态待办项（决策 B3 落库；id 为后端自增数字，source=derived/manual/ai） */
interface TodoItem {
  id: number;
  stage: string;
  text: string;
  done: boolean;
  source: string; // derived/manual/ai
  ai?: boolean; // AI 建议标记（derived/ai 来源）
}

/** 聊天气泡 */
interface ChatMsg {
  role: 'ai' | 'user';
  html: string;
  time: string;
}

/**
 * VS Code 风格三栏全链路指导工作台（依据 2026-08-31 设计评审改造）：
 * - 活动栏：阶段总览 / 动态待办 / 项目文件 / 版本历史 / 项目档案 五视图切换
 * - 中栏：BP 编辑（预览/源码）+ 诊断报告 + 评分详情 页签叠放（无 ×）
 * - 右栏：AI 教练对话常驻（真实 LLM：诊断 BP / 修改章节 / 辅导写作）
 */
export default function GuidanceVSCode() {
  const { message } = AntdApp.useApp();
  const { projectId: urlProjectId } = useParams<{ projectId?: string }>();
  const location = useLocation();
  const [projectId, setProjectId] = useState(urlProjectId || 'p1');
  const [dashboard, setDashboard] = useState<GuidanceDashboard | null>(null);
  const [group, setGroup] = useState('创意组');
  const [loading, setLoading] = useState(false);

  // ---- 活动栏视图 & 中栏页签 ----
  const [sideView, setSideView] = useState<SideView>('todo');
  const [centerTab, setCenterTab] = useState<CenterTab>('bp');

  // ---- 阶段旅程 ----
  const [stageState, setStageState] = useState<StageResult | null>(null);
  // 0902 会议：AI 教练意图聚焦（L1~L6/free）——只切换教练语境，不改变项目真实 stage
  const [coachIntent, setCoachIntent] = useState<string>('');

  // ---- 诊断 ----
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);

  // ---- L2 任务清单（动态待办数据源） ----
  const [taskList, setTaskList] = useState<StageTaskList | null>(null);

  // ---- 版本管理 ----
  const [verList, setVerList] = useState<ProjectVersion[]>([]);
  const [viewingVersion, setViewingVersion] = useState<ProjectVersion | null>(null);
  const [viewingDiffs, setViewingDiffs] = useState<EditDiff[]>([]);
  // 任务 #8-2 方案 A：当前工作区版本（默认最新；切换旧版后有「回到最新」提示条）+ 分支展开集合
  const [workVersionId, setWorkVersionId] = useState<string | null>(null);
  const [branchOpenKeys, setBranchOpenKeys] = useState<Set<string>>(new Set());

  // ---- AI 修改（对话指令） ----
  const [editChapter, setEditChapter] = useState<string | undefined>(undefined);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [previewMode, setPreviewMode] = useState<'preview' | 'edit'>('preview');
  const [bpContent, setBpContent] = useState('');

  // ---- 项目档案 ----
  const [archiveEvents, setArchiveEvents] = useState<ArchiveEvent[]>([]);
  const [archiveScoreTrend, setArchiveScoreTrend] = useState<
    { versionId: string; createdAt: string; total: number; trend: TrendType }[]
  >([]);

  // ---- 右侧聊天 ----
  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState('');
  const chatBodyRef = useRef<HTMLDivElement>(null);
  // 决策 D1：右栏可折叠 + 可拖拽调宽
  const [chatWidth, setChatWidth] = useState(380);
  const [chatCollapsed, setChatCollapsed] = useState(false);
  const dragRef = useRef<{ startX: number; startWidth: number } | null>(null);
  // 任务 #7-1 + #8-3：历史会话管理（对话组落库）——会话列表 + 当前会话
  const [historyOpen, setHistoryOpen] = useState(false);
  const [sessions, setSessions] = useState<CoachSessionItem[]>([]);
  const [curSessionId, setCurSessionId] = useState<number | null>(null);

  // 拖拽调宽
  const startDrag = useCallback((e: React.MouseEvent) => {
    dragRef.current = { startX: e.clientX, startWidth: chatWidth };
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [chatWidth]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = dragRef.current.startX - e.clientX; // 左拖增加宽度
      const w = Math.min(560, Math.max(280, dragRef.current.startWidth + dx));
      setChatWidth(w);
    };
    const onUp = () => {
      dragRef.current = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  // ---- 动态待办（跨阶段聚合） ----
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [aiGenerating, setAiGenerating] = useState(false);

  // 任务 #10-1：阶段条已移除（0902 会议），无插槽渲染

  // ---- 全文件版本管理（方案 A：文件注册表） ----
  const [projectFiles, setProjectFiles] = useState<ProjectFileItem[]>([]);
  const [activeProjectFile, setActiveProjectFile] = useState<ProjectFileItem | null>(null);
  const [fileSearchText, setFileSearchText] = useState<string>('');
  const [fileFilterCategory, setFileFilterCategory] = useState<'all' | 'text' | 'binary' | 'readonly'>('all');
  const [uploadModalVisible, setUploadModalVisible] = useState<boolean>(false);
  const [newFileName, setNewFileName] = useState<string>('');
  const [newFileCategory, setNewFileCategory] = useState<string>('补充佐证材料');
  const [newFileDesc, setNewFileDesc] = useState<string>('');
  const [newFileType, setNewFileType] = useState<'text' | 'binary' | 'readonly'>('readonly');

  // 全局侧栏子菜单 ↔ 侧栏视图同步（?view=todo 等）：URL 变化驱动视图切换
  // 无 view 参数 = 动态待办（默认视图；阶段总览已废除，阶段信息由顶栏阶段条呈现）
  useEffect(() => {
    const v = new URLSearchParams(location.search).get('view');
    if (v === 'todo' || v === 'files' || v === 'versions' || v === 'archive') {
      setSideView(v);
    } else {
      setSideView('todo');
    }
  }, [location.search]);

  /** 章节条点击 → 编辑器跳转到对应章节标题（renderSimpleMarkdown 标题带 ch-N 锚点） */
  const jumpToChapter = useCallback((chapterId: string) => {
    setCenterTab('bp');
    setTimeout(() => {
      // 优先取「正文章节」锚点：跳过目录项（目录行通常含页码省略号），取正文「第N章」标题
      const candidates = Array.from(document.querySelectorAll(`[id="ch-${chapterId}"]`));
      let el: Element | null = null;
      for (const c of candidates) {
        const t = c.textContent || '';
        if (!t.includes('……') && !/\.\.\s*\d+/.test(t)) { el = c; break; }
      }
      if (!el && candidates.length) el = candidates[candidates.length - 1];
      if (el) {
        // 使用 BP 文档滚动容器（#bpScroll）定位（真实 BP 内容在此嵌套滚动）
        const scroller = document.getElementById('bpScroll');
        if (scroller) {
          const targetTop = el.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop;
          // 先立即定位（auto），避免 smooth 被重渲染打断
          scroller.scrollTop = targetTop - 10;
        } else {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        // 高亮标记
        (el as HTMLElement).style.transition = 'background 1.4s';
        (el as HTMLElement).style.background = '#e6f4ff';
        setTimeout(() => { (el as HTMLElement).style.background = 'transparent'; }, 1500);
      }
    }, 120);
  }, []);

  useEffect(() => {
    if (urlProjectId) setProjectId(urlProjectId);
  }, [urlProjectId]);

  // 任务 #6-3 + #9-1：项目选择器联动（?project=xxx → projectId）。
  // 修复：query 与路径参数双来源冲突导致切换失效——query 始终为最高优先级（顶栏唯一入口），
  // 无 query 时回退路径参数（/guidance/:pid），再无则 p1（从其他模块返回时也正确兜底）。
  useEffect(() => {
    const p = new URLSearchParams(location.search).get('project');
    if (p) {
      setProjectId(p);
    } else if (!urlProjectId) {
      setProjectId('p1');
    }
  }, [location.search, urlProjectId]);

  const nowTime = (): string => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  /** 追加 AI 气泡 */
  const pushChat = useCallback((role: 'ai' | 'user', html: string) => {
    setChatMsgs((prev) => [...prev, { role, html, time: nowTime() }]);
  }, []);

  // 聊天自动滚动到底部
  useEffect(() => {
    chatBodyRef.current?.scrollTo({ top: chatBodyRef.current.scrollHeight, behavior: 'smooth' });
  }, [chatMsgs]);

  // ---- 数据加载 ----
  const loadDashboard = useCallback(
    async (pid: string) => {
      setLoading(true);
      try {
        const data = await fetchGuidanceDashboard(pid);
        setDashboard(data);
        if (data.group) setGroup(data.group);
      } catch {
        setDashboard(null);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const loadStage = useCallback(async (pid: string) => {
    try {
      const s = await fetchStage(pid);
      setStageState(s);
      // 会话记忆：加载后端对话历史填充右栏（决策 4；仅当右侧无消息时恢复一次）
      const history = Array.isArray(s?.history) ? s.history : [];
      const validHistory = history.filter((h: any) => h && (typeof h.content === 'string' || h.role));
      if (validHistory.length) {
        setChatMsgs((prev) => {
          // 若已有人工消息（本次会话新对话），不覆盖；否则用历史重建
          if (prev.length > 0) return prev;
          return validHistory.map((h: any) => ({
            role: h.role === 'user' ? ('user' as const) : ('ai' as const),
            html: escHtml(h.content ?? '').replace(/\n/g, '<br/>'),
            time: '历史',
          }));
        });
      }
    } catch {
      setStageState(null);
    }
  }, []);

  const loadVersions = useCallback(async (pid: string) => {
    try {
      const r = await listVersions(pid);
      const list = Array.isArray(r) ? r : Array.isArray((r as any)?.versions) ? (r as any).versions : [];
      setVerList(list);
    } catch {
      setVerList([]);
    }
  }, []);

  const loadDiagnosis = useCallback(async (pid: string) => {
    try {
      const d = await fetchDiagnosis(pid);
      setDiagnosis(d);
    } catch {
      setDiagnosis(null);
    }
  }, []);

  const loadArchive = useCallback(async (pid: string) => {
    try {
      const a = await fetchArchive(pid);
      setArchiveEvents(Array.isArray(a?.events) ? a.events : []);
      setArchiveScoreTrend(Array.isArray(a?.scoreTrend) ? a.scoreTrend : []);
    } catch {
      setArchiveEvents([]);
      setArchiveScoreTrend([]);
    }
  }, []);

  const loadTasks = useCallback(async (pid: string) => {
    try {
      const t = await fetchStageTasks(pid);
      setTaskList(t);
    } catch {
      setTaskList(null);
    }
  }, []);

  useEffect(() => {
    loadDashboard(projectId);
    loadStage(projectId);
    loadVersions(projectId);
    loadDiagnosis(projectId);
    loadArchive(projectId);
    // 方案 A：切项目后工作区回到最新版本
    setWorkVersionId(null);
    setBranchOpenKeys(new Set());
  }, [projectId, loadDashboard, loadStage, loadVersions, loadDiagnosis, loadArchive]);

  // 任务 #9-1：章节识别自动补跑——前端一进项目就应看到结果。
  // dashboard 加载完成后若 recognition 缺失（该新项目未识别过），自动在后台触发识别。
  useEffect(() => {
    if (!dashboard || dashboard.recognition) return;
    let cancelled = false;
    recognizeProject(projectId)
      .then(() => {
        if (!cancelled) loadDashboard(projectId);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboard, projectId]);

  // 项目全文件树（方案 A：真实文件注册表）
  const loadFiles = useCallback(async (pid: string) => {
    try {
      const r = await fetchProjectFiles(pid);
      if (r && r.files && r.files.length > 0) {
        setProjectFiles(r.files);
      } else {
        setProjectFiles(getEnrichedProjectFiles(pid));
      }
    } catch {
      setProjectFiles(getEnrichedProjectFiles(pid));
    }
  }, []);

  useEffect(() => {
    loadFiles(projectId);
  }, [projectId, loadFiles]);

  // 加载 BP 全文：独立 BP 接口（决策 B1），优先最新内容版本，否则回退原始材料
  useEffect(() => {
    fetchBp(projectId)
      .then((r) => {
        if (r.content) {
          setBpContent(r.content);
          setEditContent(r.content);
        }
      })
      .catch(() => undefined);
  }, [projectId]);

  // 阶段变化：L2 阶段加载真实任务清单（动态待办数据源）
  const curStage = stageState?.stage;
  useEffect(() => {
    if (!curStage) return;
    if (curStage === 'L2' && !taskList) loadTasks(projectId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curStage, projectId, taskList, loadTasks]);

  // ---- 动态待办（决策 B3：落库接口驱动；派生合并在后端） ----
  const loadTodos = useCallback(async (pid: string) => {
    try {
      const r = await fetchTodos(pid);
      const list = Array.isArray(r) ? r : Array.isArray(r?.todos) ? r.todos : [];
      setTodos(
        list.map((t: any) => ({
          id: t.id,
          stage: t.stage || t.stageCode || 'L1',
          text: t.text || t.title || '',
          done: Boolean(t.done ?? (t.status === 'completed')),
          source: t.source || 'manual',
          ai: Boolean(t.ai ?? (t.source?.includes('AI') || false)),
        })),
      );
    } catch {
      setTodos([]);
    }
  }, []);

  useEffect(() => {
    loadTodos(projectId);
  }, [projectId, loadTodos, dashboard, diagnosis, taskList]);

  // ---- AI 教练会话（对话组，任务 #8-3） ----
  const loadSessions = useCallback(async (pid: string) => {
    try {
      const r = await listCoachSessions(pid);
      const list = Array.isArray(r) ? r : Array.isArray(r?.sessions) ? r.sessions : [];
      setSessions(list);
      return list;
    } catch {
      setSessions([]);
      return [];
    }
  }, []);

  // 进入项目：加载会话列表；无会话则自动新建一个（对话组）
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await loadSessions(projectId);
        if (cancelled) return;
        if (list && list.length) {
          // 默认打开最近一个会话，并载入其消息
          const latest = list[0];
          setCurSessionId(latest.id);
          const detail = await fetchCoachSession(projectId, latest.id);
          if (!cancelled && detail?.messages?.length) {
            setChatMsgs(
              detail.messages.map((m) => ({
                role: m.role === 'user' ? ('user' as const) : ('ai' as const),
                html: escHtml(m.content || '').replace(/\n/g, '<br/>'),
                time: '历史',
              })),
            );
          }
        } else {
          const s = await createCoachSession(projectId);
          if (!cancelled) {
            setSessions([s]);
            setCurSessionId(s.id);
          }
        }
      } catch {
        // 会话加载失败不影响主体
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId, loadSessions]);

  /** 新建会话（清空右栏开始新对话组） */
  const handleNewSession = useCallback(async () => {
    try {
      const s = await createCoachSession(projectId);
      setSessions((prev) => [s, ...prev]);
      setCurSessionId(s.id);
      setChatMsgs([]);
      message.success('已新建会话');
    } catch {
      message.error('新建会话失败');
    }
  }, [projectId, message]);

  /** 切换会话（载入消息） */
  const handleOpenSession = useCallback(
    async (sid: number) => {
      try {
        const detail = await fetchCoachSession(projectId, sid);
        setCurSessionId(sid);
        const messages = Array.isArray(detail?.messages) ? detail.messages : [];
        setChatMsgs(
          messages.map((m) => ({
            role: m.role === 'user' ? ('user' as const) : ('ai' as const),
            html: escHtml(m.content ?? '').replace(/\n/g, '<br/>'),
            time: '历史',
          })),
        );
        setHistoryOpen(false);
      } catch {
        message.error('会话加载失败');
      }
    },
    [projectId, message],
  );

  /** 删除会话 */
  const handleDeleteSession = useCallback(
    async (sid: number) => {
      try {
        await deleteCoachSession(projectId, sid);
        const rest = sessions.filter((s) => s.id !== sid);
        setSessions(rest);
        if (curSessionId === sid) {
          setCurSessionId(null);
          setChatMsgs([]);
          if (rest.length) await handleOpenSession(rest[0].id);
        }
      } catch {
        message.error('删除会话失败');
      }
    },
    [projectId, sessions, curSessionId, handleOpenSession, message],
  );

  /** 将一条消息持久化到当前会话（无会话先自动新建） */
  const persistToSession = useCallback(
    async (role: 'user' | 'assistant', content: string) => {
      try {
        let sid = curSessionId;
        if (sid == null) {
          const s = await createCoachSession(projectId);
          sid = s.id;
          setCurSessionId(s.id);
          setSessions((prev) => (prev.some((x) => x.id === s.id) ? prev : [s, ...prev]));
        }
        await appendCoachMessage(projectId, sid, role, content);
        // 刷新会话列表（标题/消息数更新）
        loadSessions(projectId).then((list) => setSessions(list));
      } catch {
        // 落库失败不阻断对话
      }
    },
    [projectId, curSessionId, loadSessions],
  );

  /** 方案 A（#9-2）：点击待办 → 进入工作（而非直接勾选完成） */
  const handleEnterTodoWork = useCallback(
    async (t: TodoItem) => {
      // 识别「第 N 章」类待办 → 跳转 BP 对应章节 + 设为 AI 上下文
      const m = t.text.match(/第\s*(\d{1,2})\s*章/);
      if (m) {
        const chapterId = m[1];
        setEditChapter(chapterId);
        setCenterTab('bp');
        // 稍等渲染后跳转章节（复用章节条跳转逻辑）
        setTimeout(() => jumpToChapter(chapterId), 120);
        message.success(`进入工作：第 ${chapterId} 章（已设为 AI 上下文）`);
        return;
      }
      // 其他待办：通传到 AI 教练对话（辅导进入该工作）
      setChatInput(t.text);
      // 触发展开右栏
      setChatCollapsed(false);
      message.info('待办内容已填入 AI 教练输入框，回车即可开始工作');
    },
    [jumpToChapter, message],
  );

  /** 勾选/取消（决策 B3 持久化） */
  const handleToggleTodo = useCallback(
    async (id: number) => {
      const target = todos.find((t) => t.id === id);
      if (!target) return;
      // 乐观更新
      setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
      try {
        await updateTodo(projectId, id, !target.done);
      } catch {
        setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: target.done } : t)));
        message.error('待办状态更新失败');
      }
    },
    [todos, projectId, message],
  );

  /** 新增待办（manual 手动输入） */
  const handleAddTodo = useCallback(
    async (stage: string, text: string) => {
      if (!text.trim()) return;
      try {
        await createTodo(projectId, stage, text.trim(), 'manual');
        await loadTodos(projectId);
        message.success('已新增待办');
      } catch {
        message.error('新增待办失败');
      }
    },
    [projectId, loadTodos, message],
  );

  /** AI 生成待办（任务 #10-2：真实 LLM 调用后端生成接口，产出多条当前阶段待办） */
  const handleAiGenerateTodo = useCallback(
    async (stage: string) => {
      setAiGenerating(true);
      try {
        const r = await generateTodos(projectId);
        const added = r.todos.filter((t) => t.source === 'ai');
        await loadTodos(projectId);
        if (added.length) {
          message.success(`AI 已生成 ${added.length} 条待办（${stage}）`);
        } else {
          message.info('AI 未生成新待办（可能与已有待办重复）');
        }
      } catch {
        message.error('AI 生成待办失败');
      } finally {
        setAiGenerating(false);
      }
    },
    [projectId, loadTodos, message],
  );

  /** 删除待办（决策 7：允许删任意来源含 AI 项） */
  const handleDeleteTodo = useCallback(
    async (id: number) => {
      try {
        await deleteTodo(projectId, id);
        setTodos((prev) => prev.filter((t) => t.id !== id));
      } catch {
        message.error('删除待办失败');
      }
    },
    [projectId, message],
  );

  // ---- 交互：活动栏 ----
  const sideMeta: Record<SideView, { title: string }> = {
    todo: { title: '动态待办' },
    files: { title: '项目文件' },
    versions: { title: '版本历史' },
    archive: { title: '项目档案' },
  };

  /** 0902 会议：AI 教练意图切换（放右栏头部 Select）——只切换对话语境，不写项目阶段；
   *  切换即触发 AI 意图问候（每次切换都触发，用户已确认）。 */
  const handleIntentChange = useCallback(
    async (intent: string) => {
      setCoachIntent(intent);
      if (!intent) return;
      // 意图问候：不同意图 AI 主动引导（对应所选意图的问候）
      try {
        const g = await stageGreet(projectId, intent.trim().toLowerCase());
        if (g?.reply) {
          pushChat('ai', escHtml(g.reply).replace(/\n/g, '<br/>'));
        }
      } catch {
        // 问候失败不阻断
      }
    },
    [projectId, pushChat],
  );

  /** 0902 会议：阶段推进能力（后端保留；前端顶栏已改为状态展示，推进由业务/脚本调用 advanceStage 完成） */

  /** 发送聊天（智能路由，决策 B2 方案 3 分层教练）：
   *  - 咨询/引导/分析类指令 → stageConversation（当前阶段专项教练，快）
   *  - 修改类指令（含指定章节） → editProject（编辑执行 + 自动快照）
   */
  const handleChatSend = useCallback(async () => {
    const text = chatInput.trim();
    if (!text) return;
    setChatInput('');
    pushChat('user', escHtml(text));
    // 任务 #8-3：用户消息落库到当前会话（对话组）
    void persistToSession('user', text);
    setEditing(true);
    try {
      // 会话意图路由：咨询关键词优先走阶段教练
      const askIntent =
        /(告诉我|帮我看看|帮我分析|评委看什么|怎么做|怎么办|如何|辅导|建议|缺什么|有什么问题|讲讲|说明|解释|检查|诊断)/.test(text);
      if (askIntent || !editChapter) {
        // 阶段教练对话（0902：带意图聚焦，教练语音随意图切换；choices 选项附带）
        const r = await stageConversation(projectId, { message: text, intentStage: coachIntent || undefined });
        if (r?.reply) {
          pushChat('ai', escHtml(r.reply).replace(/\n/g, '<br/>'));
          // 任务 #8-3：AI 回复落库
          void persistToSession('assistant', r.reply);
        }
        if (r?.choices?.length) {
          pushChat(
            'ai',
            `可选项：${r.choices.map((c) => `<b>${escHtml(c)}</b>`).join(' / ')}`,
          );
        }
        if (r.done) {
          message.success(`阶段 ${stageState?.stage ?? ''} 对话完成`);
          await loadStage(projectId);
        }
      } else {
        // 修改执行（指定章节）
        const r = await editProject(projectId, text, 'chapter', editChapter, false);
        setEditContent(r.content);
        setBpContent(r.content);
        if (r.changed) {
          await loadVersions(projectId);
          pushChat(
            'ai',
            `✅ ${escHtml(r.summary || '修改完成')}<br/>已自动生成快照 <b>${escHtml(r.versionId)}</b>。` +
              (r.diffs?.length
                ? `<br/>变更点：${r.diffs.map((d) => `· ${escHtml(d.position)}（${d.type === 'added' ? '新增' : d.type === 'removed' ? '删除' : '改写'}）`).join('<br/>')}`
                : ''),
          );
          // 任务 #8-3：AI 回复落库
          void persistToSession(
            'assistant',
            `${r.summary || '修改完成'}（已自动生成快照 ${r.versionId}）`,
          );
          message.success(r.summary || '修改完成');
        } else {
          pushChat('ai', `ℹ️ ${escHtml(r.summary || '未发生修改')}`);
          // 任务 #8-3：AI 回复落库
          void persistToSession('assistant', r.summary || '未发生修改');
          message.info(r.summary || '未发生修改');
        }
      }
    } catch {
      message.error('AI 教练调用失败，请稍后重试');
      pushChat('ai', '❌ AI 教练调用失败，请稍后重试。');
    } finally {
      setEditing(false);
    }
  }, [chatInput, projectId, editChapter, stageState, coachIntent, loadStage, loadVersions, pushChat, persistToSession, message]);

  /** 查看版本详情 */
  const handleViewVersion = useCallback(
    async (versionId: string) => {
      try {
        const v = await fetchVersion(projectId, versionId);
        const diffs = await fetchVersionDiff(projectId, versionId);
        setViewingVersion(v);
        setViewingDiffs(diffs);
      } catch {
        message.error('版本详情加载失败');
      }
    },
    [projectId, message],
  );

  /** 切换版本（决策 B1：点击版本 → 中栏 BP 切换为当时内容；弹窗看 diff） */
  const handleSwitchVersion = useCallback(
    async (versionId: string) => {
      try {
        const v = await fetchVersion(projectId, versionId);
        if (v.content) {
          setEditContent(v.content);
          setBpContent(v.content);
          setCenterTab('bp');
          setPreviewMode('preview');
          // 方案 A：记录当前工作区版本（用于「已切换到旧版」提示条 + 回到最新）
          setWorkVersionId(versionId);
          message.success(`已切换到版本 ${versionId}`);
        }
      } catch {
        message.error('版本内容加载失败');
      }
    },
    [projectId, message],
  );

  /** 方案 A：回到最新版本（切换 BP 到 verList 最末版本，即最新） */
  const handleBackToLatest = useCallback(async () => {
    const list = verList || [];
    const latest = list[list.length - 1];
    if (!latest) return;
    await handleSwitchVersion(latest.versionId);
    setWorkVersionId(null);
  }, [verList, handleSwitchVersion]);

  /** 从版本创建分支（决策 5：仿 git 树形） */
  const handleCreateBranch = useCallback(
    async (versionId: string) => {
      const label = window.prompt('分支名（如：评委建议的技术路线尝试）：', `branch-${versionId}`);
      if (!label || !label.trim()) return;
      try {
        const v = await createBranch(projectId, versionId, label.trim());
        message.success(`已从 ${versionId} 创建分支 ${v.versionId}`);
        await loadVersions(projectId);
        if (v.content) {
          setEditContent(v.content);
          setBpContent(v.content);
        }
      } catch {
        message.error('创建分支失败');
      }
    },
    [projectId, loadVersions, message],
  );

  /** 标记里程碑 */
  const handleMarkMilestone = useCallback(
    async (versionId: string) => {
      try {
        const v = await markMilestone(projectId, versionId, undefined, true);
        message.success(`已标记里程碑 ${v.versionId}${v.total != null ? `（自动评分 ${v.total} 分）` : ''}`);
        await loadVersions(projectId);
      } catch {
        message.error('标记里程碑失败');
      }
    },
    [projectId, loadVersions, message],
  );

  /** 保存快照（手动） */
  const handleSaveVersion = useCallback(async () => {
    try {
      const v = await saveVersion(projectId, '手动保存', editContent || undefined);
      message.success(`已保存版本 ${v.versionId}`);
      await loadVersions(projectId);
    } catch {
      message.error('保存版本失败');
    }
  }, [projectId, editContent, loadVersions, message]);

  /** 一键全链路分析 */
  const handleFullRun = useCallback(async () => {
    setLoading(true);
    try {
      await triageProject(projectId);
      await recognizeProject(projectId);
      await assessProject(projectId, group);
      message.success('全链路分析完成');
      await loadDashboard(projectId);
      await loadStage(projectId);
    } catch {
      message.error('全链路分析中断，请检查后重试');
    } finally {
      setLoading(false);
    }
  }, [projectId, group, loadDashboard, loadStage, message]);

  // ---- 派生数据 ----
  const triage = dashboard?.triage ?? null;
  const recognition = dashboard?.recognition ?? null;
  const latest = dashboard?.latestVersion ?? null;
  const curStageLabel = stageState ? stageState.stage : '--';
  const chaptersDone = dashboard?.chaptersDone ?? 0;
  const chaptersTotal = dashboard?.chaptersTotal ?? 12;

  // 按阶段分组待办
  const todoByStage = useMemo(() => {
    const map: Record<string, TodoItem[]> = {};
    (todos || []).forEach((t) => {
      if (!t) return;
      const st = t.stage || 'L1';
      if (!map[st]) map[st] = [];
      map[st].push(t);
    });
    return map;
  }, [todos]);

  // ========== 渲染：版本历史（方案 A：主线平铺 + 分支折叠 + 旧版提示条） ==========
  const renderVersionTree = (versions: ProjectVersion[]) => {
    const safeVersions = versions || [];
    const byParent = new Map<string | null, ProjectVersion[]>();
    safeVersions.forEach((v) => {
      if (!v) return;
      const key = v.parentId ?? null;
      if (!byParent.has(key)) byParent.set(key, []);
      byParent.get(key)!.push(v);
    });
    // 按创建时间排序（oldest first）
    byParent.forEach((list) => list.sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1)));

    const renderVerRow = (v: ProjectVersion, isBranch: boolean): React.ReactNode => {
      const isMs = v.versionType === 'milestone';
      const isCurrent = workVersionId === v.versionId;
      return (
        <div
          key={v.versionId}
          className="verRow-w"
          onClick={() => handleSwitchVersion(v.versionId)}
          style={{
            position: 'relative',
            padding: '7px 10px',
            borderRadius: 6,
            cursor: 'pointer',
            borderBottom: '1px solid #f5f5f5',
            background: isCurrent ? '#e6f4ff' : undefined,
            marginLeft: isBranch ? 22 : 0,
            borderLeft: isBranch ? '2px solid #d3adf7' : undefined,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: '50%',
                flexShrink: 0,
                background: isMs ? '#faad14' : isBranch ? '#722ed1' : '#1677ff',
                boxShadow: isCurrent ? '0 0 0 3px rgba(22,119,255,0.15)' : undefined,
              }}
            />
            <Text strong style={{ fontSize: 12.5, flexShrink: 0 }}>{v.versionId}</Text>
            <span
              style={{
                fontSize: 10,
                padding: '0 5px',
                borderRadius: 3,
                flexShrink: 0,
                background: isMs ? '#fff7e6' : isBranch ? '#f9f0ff' : '#f0f0f0',
                color: isMs ? '#d46b08' : isBranch ? '#722ed1' : '#8c8c8c',
              }}
            >
              {isMs ? '⭐ 里程碑' : isBranch ? '⎇ 分支' : v.versionType === 'version' ? '版本' : '快照'}
            </span>
            {isCurrent ? (
              <span
                style={{
                  fontSize: 10,
                  color: '#1677ff',
                  background: '#fff',
                  border: '1px solid #91caff',
                  borderRadius: 8,
                  padding: '0 6px',
                  flexShrink: 0,
                }}
              >
                当前工作区
              </span>
            ) : null}
            {/* 时间/分数移到右上角，与版本号同行（不挤压 label 区） */}
            <span
              style={{
                marginLeft: 'auto',
                flexShrink: 0,
                fontSize: v.total != null ? 12 : 10.5,
                fontWeight: v.total != null ? 700 : 400,
                color: v.total != null ? '#1677ff' : 'rgba(0,0,0,0.35)',
                whiteSpace: 'nowrap',
              }}
            >
              {v.total != null ? `${v.total} 分` : v.createdAt}
            </span>
          </div>
          {v.label ? (
            <div
              style={{
                fontSize: 11,
                color: 'rgba(0,0,0,0.45)',
                marginTop: 2,
                paddingLeft: 15,
                lineHeight: 1.5,
                wordBreak: 'break-all',
              }}
            >
              {v.label}
            </div>
          ) : null}
          {/* 操作按钮组：hover 行才展开（overflow 收折，不再常驻占位挤压文字） */}
          <div
            style={{
              position: 'absolute',
              right: 6,
              top: 4,
              display: 'flex',
              gap: 3,
              background: isCurrent ? '#e6f4ff' : '#fff',
              padding: '2px 3px',
              borderRadius: 4,
              boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
              opacity: 0,
              maxHeight: 0,
              overflow: 'hidden',
            }}
            className="verRow-actions"
          >
            {v.total == null ? (
              <Button size="small" onClick={(e) => { e.stopPropagation(); handleViewVersion(v.versionId); }}>
                diff
              </Button>
            ) : null}
            <Button size="small" onClick={(e) => { e.stopPropagation(); handleSwitchVersion(v.versionId); }}>
              切换
            </Button>
            {!isMs ? (
              <Button
                size="small"
                type="primary"
                ghost
                onClick={(e) => {
                  e.stopPropagation();
                  handleMarkMilestone(v.versionId);
                }}
                icon={<FlagOutlined />}
              >
                里程碑
              </Button>
            ) : null}
            {!isBranch ? (
              <Button
                size="small"
                danger
                ghost
                onClick={(e) => {
                  e.stopPropagation();
                  handleCreateBranch(v.versionId);
                }}
              >
                ⎇ 分支
              </Button>
            ) : null}
          </div>
        </div>
      );
    };

    // 方案 A 结构：
    // - 主线 = parentId=null 的根 + 其下 parent 链上「非分支」的主线版本（平铺，无缩进）
    // - 分支 = 从某个主线版本拉出的 branch_name 版本（缩进 + 紫色，可折叠）
    // 修正：主线不再用递归缩进（c1→c6 全部平铺）；分支组默认收起，点展开显示分支链
    const mainChain: ProjectVersion[] = [];
    const branchRoots: { baseId: string; baseVer: ProjectVersion; branches: ProjectVersion[] }[] = [];
    // 主线 = 非分支节点，按 parent 链顺序平铺（根 → 最新）
    const roots = byParent.get(null) ?? [];
    const walked = new Set<string>();
    const walkMain = (v: ProjectVersion) => {
      if (walked.has(v.versionId)) return;
      walked.add(v.versionId);
      if (v.branchName) return; // 分支不进主线
      mainChain.push(v);
      (byParent.get(v.versionId) ?? [])
        .filter((c) => !c.branchName)
        .forEach((c) => walkMain(c));
    };
    roots.forEach((r) => walkMain(r));
    // 分支：收集「主线版本下有分支」的分组
    mainChain.forEach((base) => {
      const branches = (byParent.get(base.versionId) ?? []).filter((c) => c.branchName);
      if (branches.length) {
        branchRoots.push({ baseId: base.versionId, baseVer: base, branches });
      }
    });

    return (
      <>
        {/* 任务 #10-3：hover 行时展开操作按钮（不常驻占位挤压文字） */}
        <style>{`
          .verRow-actions { pointer-events: none; opacity: 0; max-height: 0 !important; overflow: hidden; }
          .verRow-w:hover .verRow-actions { opacity: 1 !important; max-height: 40px !important; pointer-events: auto; }
          .verRow-w:hover { background: #fafafa !important; }
          .verRow-actions .ant-btn { height: 20px !important; line-height: 20px !important; font-size: 11px !important; padding: 0 6px !important; }
        `}</style>
        {/* 旧版提示条（当前工作区非最新时） */}
        {workVersionId && mainChain.length ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 11.5,
              background: '#fff7e6',
              border: '1px solid #ffd591',
              color: '#d46b08',
              borderRadius: 6,
              padding: '5px 10px',
              marginBottom: 8,
            }}
          >
            ⏪ 当前工作区 = 版本 {workVersionId}（非最新）
            <Button size="small" onClick={handleBackToLatest} style={{ marginLeft: 'auto' }}>
              ↩ 回到最新
            </Button>
          </div>
        ) : null}
        {/* 主线平铺 */}
        {mainChain.map((v) => renderVerRow(v, false))}
        {/* 分支折叠组 */}
        {branchRoots.map(({ baseId, baseVer, branches }) => {
          const open = branchOpenKeys.has(baseId);
          return (
            <div key={`br-${baseId}`} style={{ marginTop: 2 }}>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setBranchOpenKeys((prev) => {
                    const next = new Set(prev);
                    if (next.has(baseId)) next.delete(baseId);
                    else next.add(baseId);
                    return next;
                  });
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 10px',
                  fontSize: 11.5,
                  color: '#722ed1',
                  cursor: 'pointer',
                }}
              >
                {open ? '▼' : '▶'} ⎇ 分支：{baseVer.versionId} 拉出（{branches.length}）
              </div>
              {open ? branches.map((b) => renderVerRow(b, true)) : null}
            </div>
          );
        })}
      </>
    );
  };

  // ========== 渲染：侧栏视图 ==========
  const renderSideContent = () => {
    switch (sideView) {
      case 'todo':
        return (
          <div style={{ fontSize: 12.5 }}>
            <div style={{ fontWeight: 600, color: 'rgba(0,0,0,0.55)', fontSize: 11.5, padding: '4px 8px' }}>
              动态待办 · 混合引导（AI 生成 / 可增删 / 勾选推进）
            </div>
            {Object.entries(todoByStage).map(([stage, items]) => {
              const safeItems = items || [];
              const done = safeItems.filter((t) => t.done).length;
              const labelMap: Record<string, string> = { L1: '创意激发', L2: '可行性验证', L3: '材料成型', L4: '精细化打磨' };
              const isCur = stage === curStageLabel;
              return (
                <div
                  key={stage}
                  style={{
                    background: isCur ? '#f0f7ff' : '#fafafa',
                    border: `1px solid ${isCur ? '#1677ff' : '#e8e8e8'}`,
                    borderRadius: 10,
                    padding: 10,
                    marginBottom: 10,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <Text strong style={{ fontSize: 12 }}>
                      {stage} · {labelMap[stage] ?? ''}
                    </Text>
                    {isCur ? (
                      <span
                        style={{
                          fontSize: 10,
                          padding: '1px 6px',
                          borderRadius: 8,
                          background: '#fff',
                          border: '1px solid #d6e4ff',
                          color: '#1677ff',
                        }}
                      >
                        当前阶段
                      </span>
                    ) : null}
                    <span style={{ marginLeft: 'auto', fontSize: 11, color: 'rgba(0,0,0,0.45)' }}>
                      {done}/{safeItems.length}
                    </span>
                  </div>
                  {safeItems.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => handleEnterTodoWork(t)}
                      title="点击进入工作（勾选完成请点圆圈）"
                      style={{
                        display: 'flex',
                        gap: 6,
                        alignItems: 'flex-start',
                        padding: '5px 4px',
                        borderRadius: 6,
                        cursor: 'pointer',
                      }}
                    >
                      <span
                        title={t.done ? '取消完成' : '标记完成'}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleTodo(t.id);
                        }}
                        style={{
                          width: 15,
                          height: 15,
                          border: '1.5px solid #bfbfbf',
                          borderRadius: '50%',
                          flexShrink: 0,
                          marginTop: 4,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 9,
                          color: '#fff',
                          background: t.done ? '#52c41a' : undefined,
                          borderColor: t.done ? '#52c41a' : undefined,
                          cursor: 'pointer',
                        }}
                      >
                        {t.done ? '✓' : ''}
                      </span>
                      <span
                        style={{
                          fontSize: 12.5,
                          lineHeight: 1.5,
                          flex: 1,
                          color: t.done ? '#bfbfbf' : undefined,
                          textDecoration: t.done ? 'line-through' : undefined,
                        }}
                      >
                        {t.text}
                        {t.ai ? (
                          <span
                            style={{
                              fontSize: 10,
                              color: '#1677ff',
                              border: '1px solid #d6e4ff',
                              borderRadius: 8,
                              padding: '0 5px',
                              background: '#fff',
                              marginLeft: 4,
                            }}
                          >
                            AI 建议
                          </span>
                        ) : null}
                      </span>
                      <span
                        title="删除待办"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTodo(t.id);
                        }}
                        style={{
                          color: 'rgba(0,0,0,0.25)',
                          fontSize: 12,
                          padding: '0 3px',
                          cursor: 'pointer',
                          flexShrink: 0,
                        }}
                      >
                        ✕
                      </span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
                    <Input
                      size="small"
                      placeholder="新增待办（Enter 确认）"
                      onPressEnter={(e) => {
                        handleAddTodo(stage, (e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }}
                      style={{ flex: 1, fontSize: 12 }}
                    />
                    <Button
                      size="small"
                      loading={aiGenerating}
                      onClick={() => handleAiGenerateTodo(stage)}
                      style={{ fontSize: 11 }}
                    >
                      ✨ AI 生成
                    </Button>
                  </div>
                </div>
              );
            })}
            <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)', lineHeight: 1.6 }}>
              💡 混合引导：待办已落库（勾选/增删持久化）；L2 真实任务 + L3 章节识别 + L4 诊断建议自动派生（后端合并），AI 生成项可删除。
            </div>
          </div>
        );

      case 'files': {
        const safeFiles = projectFiles || [];
        const filteredFiles = safeFiles.filter((f) => {
          const matchKeyword =
            !fileSearchText.trim() ||
            f.name.toLowerCase().includes(fileSearchText.trim().toLowerCase()) ||
            (f.category && f.category.toLowerCase().includes(fileSearchText.trim().toLowerCase())) ||
            (f.badge && f.badge.toLowerCase().includes(fileSearchText.trim().toLowerCase()));

          if (!matchKeyword) return false;
          if (fileFilterCategory === 'all') return true;
          if (fileFilterCategory === 'text') return f.fileType === 'text' && !f.readonly;
          if (fileFilterCategory === 'binary') return f.fileType === 'binary';
          if (fileFilterCategory === 'readonly') return f.fileType === 'readonly';
          return true;
        });

        const groups: { title: string; typeKey: string; color: string; items: ProjectFileItem[] }[] = [
          {
            title: '📄 可编辑文本（版本化）',
            typeKey: 'text',
            color: '#1677ff',
            items: filteredFiles.filter((f) => f.fileType === 'text' && !f.readonly),
          },
          {
            title: '🎬 大文件（演示与音视频）',
            typeKey: 'binary',
            color: '#722ed1',
            items: filteredFiles.filter((f) => f.fileType === 'binary'),
          },
          {
            title: '📎 权威佐证（AI 上下文 / 资质背书）',
            typeKey: 'readonly',
            color: '#52c41a',
            items: filteredFiles.filter((f) => f.fileType === 'readonly'),
          },
        ];

        const getFileIcon = (fileName: string, fileType: string) => {
          const ext = fileName.split('.').pop()?.toLowerCase() || '';
          if (ext === 'md' || ext === 'txt') return <FileTextOutlined style={{ color: '#1677ff', fontSize: 14 }} />;
          if (ext === 'pptx' || ext === 'ppt') return <FilePptOutlined style={{ color: '#fa8c16', fontSize: 14 }} />;
          if (ext === 'mp4' || ext === 'mov' || ext === 'avi') return <VideoCameraOutlined style={{ color: '#722ed1', fontSize: 14 }} />;
          if (ext === 'pdf') return <SafetyCertificateOutlined style={{ color: '#52c41a', fontSize: 14 }} />;
          if (ext === 'step' || ext === 'cad' || ext === 'dwg') return <ApartmentOutlined style={{ color: '#13c2c2', fontSize: 14 }} />;
          return <FileOutlined style={{ color: fileType === 'readonly' ? '#8c8c8c' : '#1677ff', fontSize: 14 }} />;
        };

        const formatFileSize = (bytes: number) => {
          if (!bytes) return '0 K';
          if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} M`;
          return `${(bytes / 1024).toFixed(1)} K`;
        };

        return (
          <div style={{ fontSize: 12.5, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* 顶栏操作 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 4px' }}>
              <div style={{ fontWeight: 600, color: 'rgba(0,0,0,0.75)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>📁 全材料库</span>
                <Tag color="blue" style={{ margin: 0, borderRadius: 10, fontSize: 10, lineHeight: '18px', padding: '0 6px' }}>
                  {safeFiles.length} 件
                </Tag>
              </div>
              <Space size={4}>
                <Button
                  size="small"
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setUploadModalVisible(true)}
                  style={{ fontSize: 11, height: 24, padding: '0 8px' }}
                >
                  上传
                </Button>
                <Tooltip title="在中栏打开全文件库总览看板">
                  <Button
                    size="small"
                    icon={<AppstoreOutlined />}
                    onClick={() => {
                      setActiveProjectFile(null);
                      setCenterTab('file');
                    }}
                    style={{ fontSize: 11, height: 24, padding: '0 8px' }}
                  >
                    总览
                  </Button>
                </Tooltip>
              </Space>
            </div>

            {/* 搜索框 */}
            <Input
              placeholder="搜索文件名、类型或标签..."
              prefix={<SearchOutlined style={{ color: '#bfbfbf', fontSize: 12 }} />}
              value={fileSearchText}
              onChange={(e) => setFileSearchText(e.target.value)}
              allowClear
              size="small"
              style={{ fontSize: 11.5, borderRadius: 6 }}
            />

            {/* 分类快捷标签 */}
            <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 2 }}>
              {[
                { key: 'all', label: '全部' },
                { key: 'text', label: '文本' },
                { key: 'binary', label: '演示音视频' },
                { key: 'readonly', label: '佐证资质' },
              ].map((c) => (
                <button
                  key={c.key}
                  onClick={() => setFileFilterCategory(c.key as any)}
                  style={{
                    border: 'none',
                    background: fileFilterCategory === c.key ? '#1677ff' : '#f5f5f5',
                    color: fileFilterCategory === c.key ? '#fff' : 'rgba(0,0,0,0.65)',
                    fontSize: 11,
                    padding: '2px 8px',
                    borderRadius: 4,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* 文件列表按分类渲染 */}
            {filteredFiles.length ? (
              groups
                .filter((g) => g.items.length > 0)
                .map((g) => (
                  <div key={g.title} style={{ marginTop: 4 }}>
                    <div
                      style={{
                        fontWeight: 600,
                        color: 'rgba(0,0,0,0.55)',
                        fontSize: 11,
                        padding: '4px 6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>{g.title}</span>
                      <span style={{ fontSize: 10, color: 'rgba(0,0,0,0.35)' }}>{g.items.length} 个</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {g.items.map((f) => {
                        const isSelected =
                          (centerTab === 'file' && activeProjectFile?.name === f.name) ||
                          (centerTab === 'bp' && f.name.includes('商业计划书'));

                        return (
                          <div
                            key={f.name}
                            onClick={() => {
                              if (f.name.includes('商业计划书')) {
                                setCenterTab('bp');
                                message.info('已切换至主商业计划书（BP）编辑与预览');
                              } else {
                                setActiveProjectFile(f);
                                setCenterTab('file');
                              }
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              padding: '7px 8px',
                              borderRadius: 6,
                              fontSize: 12,
                              cursor: 'pointer',
                              background: isSelected ? '#e6f4ff' : '#fafafa',
                              border: isSelected ? '1px solid #91caff' : '1px solid #f0f0f0',
                              transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) (e.currentTarget as HTMLElement).style.background = '#f5f5f5';
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) (e.currentTarget as HTMLElement).style.background = '#fafafa';
                            }}
                          >
                            <div style={{ flexShrink: 0 }}>{getFileIcon(f.name, f.fileType)}</div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  overflow: 'hidden',
                                }}
                              >
                                <Tooltip title={f.name} placement="top">
                                  <span
                                    style={{
                                      fontWeight: isSelected ? 600 : 500,
                                      color: isSelected ? '#1677ff' : 'rgba(0,0,0,0.85)',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      fontSize: 12,
                                    }}
                                  >
                                    {f.name}
                                  </span>
                                </Tooltip>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2, fontSize: 10.5, color: 'rgba(0,0,0,0.45)' }}>
                                <span>{formatFileSize(f.size)}</span>
                                <span>•</span>
                                <span>{f.versionRef || '当前版'}</span>
                                {f.badge && (
                                  <Tag
                                    color={f.fileType === 'readonly' ? 'green' : f.fileType === 'binary' ? 'purple' : 'blue'}
                                    style={{
                                      margin: 0,
                                      fontSize: 9.5,
                                      lineHeight: '14px',
                                      padding: '0 4px',
                                      borderRadius: 4,
                                    }}
                                  >
                                    {f.badge}
                                  </Tag>
                                )}
                              </div>
                            </div>

                            <div style={{ flexShrink: 0, display: 'flex', gap: 4 }}>
                              <Tooltip title="查看文件详情与 AI 分析">
                                <Button
                                  type="text"
                                  size="small"
                                  icon={<EyeOutlined />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (f.name.includes('商业计划书')) {
                                      setCenterTab('bp');
                                    } else {
                                      setActiveProjectFile(f);
                                      setCenterTab('file');
                                    }
                                  }}
                                  style={{ color: '#1677ff', width: 22, height: 22, padding: 0 }}
                                />
                              </Tooltip>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
            ) : (
              <Empty
                description={fileSearchText ? '未找到符合条件的文件' : '暂无文件'}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{ margin: '20px 0' }}
              />
            )}

            <div
              style={{
                fontSize: 11,
                color: 'rgba(0,0,0,0.45)',
                lineHeight: 1.6,
                marginTop: 6,
                background: '#f6ffed',
                border: '1px solid #b7eb8f',
                padding: '6px 8px',
                borderRadius: 6,
              }}
            >
              💡 <b>全材料知识图谱</b>：所有已纳入的项目文件均作为真实依据接入 AI 教练系统，在模拟问辩与六维诊断中互相交叉印证。
            </div>
          </div>
        );
      }

      case 'versions':
        return (
          <div style={{ fontSize: 12.5 }}>
            <div style={{ fontWeight: 600, color: 'rgba(0,0,0,0.55)', fontSize: 11.5, padding: '4px 8px' }}>
              评分趋势（{(archiveScoreTrend || []).length ? `${archiveScoreTrend.length} 个评分版本` : '暂无评分'}）
            </div>
            {(archiveScoreTrend || []).length ? (
              <div style={{ padding: '4px 8px', marginBottom: 8 }}>
                <TrendLine data={archiveScoreTrend} />
              </div>
            ) : null}
            <div style={{ fontWeight: 600, color: 'rgba(0,0,0,0.55)', fontSize: 11.5, padding: '4px 8px' }}>
              版本树 · 快照 / 里程碑（点击切换）
            </div>
            {(verList || []).length ? (
              renderVersionTree(verList)
            ) : (
              <Empty description="尚无内容版本（AI 修改或手动保存后产生）" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
            <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)', lineHeight: 1.6, marginTop: 8 }}>
              💡 快照：每次 AI 修改自动生成；里程碑：手动标记，<b>只对里程碑评分</b>。点击版本可切换回当时内容；「分支」从任意版本拉出尝试线（仿 git）。
            </div>
          </div>
        );

      case 'archive':
        // 任务 #8-4：项目档案重定位——全文件粗粒度变更记录（非 BP 版本历史/评分轨迹）
        // 事件已由后端按「文件」组织：BP=版本摘要，大文件=仅最新，只读=初始上传
        // 任务 #2（0902）：展示变更时间（mtime 兜底），支撑「变更记录册」时间线感
        return (
          <div style={{ fontSize: 12.5 }}>
            <div style={{ fontWeight: 600, color: 'rgba(0,0,0,0.55)', fontSize: 11.5, padding: '4px 8px' }}>
              📁 全文件变更记录（{(archiveEvents || []).length} 个文件 · 粗粒度）
            </div>
            {(archiveEvents || []).length ? (
              archiveEvents.map((ev, i) => {
                const isText = ev.title?.startsWith('📄');
                const isBinary = ev.title?.startsWith('🎬');
                return (
                  <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px dashed #f0f0f0', alignItems: 'flex-start' }}>
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: isText ? '#1677ff' : isBinary ? '#722ed1' : '#bfbfbf',
                        marginTop: 6,
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 500, wordBreak: 'break-all' }}>{ev.title}</div>
                      <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)' }}>{ev.detail}</div>
                      {ev.time ? (
                        <div style={{ fontSize: 10.5, color: 'rgba(0,0,0,0.35)', marginTop: 2 }}>
                          🕐 {ev.time}
                        </div>
                      ) : null}
                    </div>
                    {ev.refId ? (
                      <span
                        style={{
                          fontSize: 10,
                          padding: '1px 6px',
                          borderRadius: 8,
                          background: isBinary ? '#f9f0ff' : '#e6f4ff',
                          border: `1px solid ${isBinary ? '#d3adf7' : '#91caff'}`,
                          color: isBinary ? '#722ed1' : '#0958d9',
                          alignSelf: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {ev.refId}
                      </span>
                    ) : null}
                  </div>
                );
              })
            ) : (
              <Empty description="暂无文件记录（上传/创建文件后产生）" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
            <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)', lineHeight: 1.6, marginTop: 8 }}>
              💡 项目档案 = 全文件「变更记录册」（粗粒度）：BP 显示版本摘要、PPT/VCR 显示「仅保留最新版」、
              证明/报告显示「初始上传」。细粒度 BP 版本操作（切换/diff/分支）在「版本历史」视图。
            </div>
          </div>
        );
    }
  };

  // ========== 渲染：中栏内容 ==========
  const renderCenterContent = () => {
    if (centerTab === 'diag') {
      return (
        <div style={{ padding: 16 }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 14 }}>
            <div
              style={{
                flex: 1,
                minWidth: 180,
                background: '#f0f7ff',
                border: '1px solid #d6e4ff',
                borderRadius: 10,
                padding: 14,
              }}
            >
              <Text type="secondary" style={{ fontSize: 11 }}>当前总分（增量评分）</Text>
              <div style={{ fontSize: 30, fontWeight: 700, color: '#1677ff' }}>
                {latest?.total ?? '--'}
                {latest && latest.trend !== 'flat' ? (
                  <span style={{ fontSize: 13, color: latest.trend === 'up' ? '#52c41a' : '#f5222d' }}>
                    {' '}{latest.trend === 'up' ? '↑' : '↓'}
                  </span>
                ) : null}
              </div>
              <Text type="secondary" style={{ fontSize: 11 }}>{latest?.scorecardName ?? '尚未评分'}</Text>
            </div>
            <div style={{ flex: 1, minWidth: 180, background: '#fff7e6', border: '1px solid #ffd591', borderRadius: 10, padding: 14 }}>
              <Text type="secondary" style={{ fontSize: 11 }}>最大短板</Text>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#d46b08', marginTop: 4 }}>
                {diagnosis?.missing[0]?.text ?? '暂无诊断'}
              </div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)', marginBottom: 6 }}>六维评分</div>
          {latest
            ? Object.entries(latest.dimensionScores).map(([d, v]) => (
                <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, marginBottom: 5 }}>
                  <span style={{ width: 64, color: 'rgba(0,0,0,0.45)' }}>{d}</span>
                  <Progress
                    percent={Math.round(v)}
                    format={() => `${v}`}
                    size="small"
                    style={{ flex: 1, margin: 0 }}
                    strokeColor={v >= 85 ? '#52c41a' : v >= 70 ? '#faad14' : '#ff4d4f'}
                  />
                </div>
              ))
            : null}
          {diagnosis ? (
            <div style={{ background: '#fafafa', border: '1px solid #e8e8e8', borderRadius: 10, padding: 12, marginTop: 12 }}>
              <Text strong style={{ fontSize: 12 }}>🎯 下一步建议（AI 教练）</Text>
              <div style={{ fontSize: 12.5, lineHeight: 1.8, marginTop: 6 }}>
                {diagnosis.nextSteps.slice(0, 4).map((n, i) => (
                  <div key={i}>• {n.text}</div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      );
    }
    if (centerTab === 'score') {
      return (
        <div style={{ padding: 16 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
            <Select
              style={{ width: 110 }}
              value={group}
              onChange={setGroup}
              options={[
                { value: '创意组', label: '创意组' },
                { value: '创业组', label: '创业组' },
              ]}
            />
            <Button onClick={() => assessProject(projectId, group).then(() => { message.success('基线评分完成'); loadDashboard(projectId); })}>
              基线评分
            </Button>
            <Tooltip title={latest ? '对比最近版本输出增量' : '需先完成基线评分'}>
              <Button
                type="primary"
                disabled={!latest}
                onClick={() => latest && assessProject(projectId, group, latest.versionId).then(() => { message.success('增量评分完成'); loadDashboard(projectId); })}
              >
                增量评分
              </Button>
            </Tooltip>
            <Button icon={<RocketOutlined />} onClick={handleFullRun} style={{ marginLeft: 'auto' }}>
              一键全链路分析
            </Button>
          </div>
          {latest ? (
            <>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3,1fr)',
                  gap: 12,
                  marginBottom: 14,
                }}
              >
                <div style={{ border: '1px solid #e8e8e8', borderRadius: 8, padding: 12 }}>
                  <Text type="secondary" style={{ fontSize: 11 }}>总分（{latest.scorecardName}）</Text>
                  <div style={{ fontSize: 26, fontWeight: 700, color: latest.total >= 80 ? '#3f8600' : '#1677ff' }}>
                    {latest.total} <small style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>/ 100</small>
                  </div>
                  {latest.isBaseline ? <Tag color="gold">基线</Tag> : <TrendTag trend={latest.trend} />}
                </div>
                <div style={{ border: '1px solid #e8e8e8', borderRadius: 8, padding: 12 }}>
                  <Text type="secondary" style={{ fontSize: 11 }}>版本</Text>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>{latest.versionId}</div>
                  <Text type="secondary" style={{ fontSize: 11 }}>{latest.degraded ? '已降级模板评分' : '真实 LLM 评分'}</Text>
                </div>
                <div style={{ border: '1px solid #e8e8e8', borderRadius: 8, padding: 12 }}>
                  <Text type="secondary" style={{ fontSize: 11 }}>维度得分</Text>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>{Object.keys(latest.dimensionScores || {}).length} 项</div>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {Object.entries(latest.dimensionScores || {}).map(([d, v]) => `${d} ${v}`).join(' / ')}
                  </Text>
                </div>
              </div>
              {/* 0902 会议④：评分详情结构化——维度 → 条目二级（得分 + 得分原因 + 证据引用） */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {Object.entries(latest.dimensionScores || {}).map(([dim, dimScore]) => {
                  const dimItems = (latest.items || []).filter((it) => it.dimension === dim);
                  return (
                    <div key={dim} style={{ border: '1px solid #f0f0f0', borderRadius: 8, overflow: 'hidden' }}>
                      {/* 维度头 */}
                      <div style={{ padding: '8px 12px', background: '#fafafa', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Text strong style={{ width: 110 }}>{dim}</Text>
                        <Progress
                          percent={Math.round(dimScore)}
                          format={() => `${dimScore}`}
                          size="small"
                          style={{ flex: 1, margin: 0 }}
                          strokeColor={dimScore >= 85 ? '#52c41a' : dimScore >= 70 ? '#faad14' : '#ff4d4f'}
                        />
                      </div>
                      {/* 条目 */}
                      {dimItems.length ? (
                        dimItems.map((it) => (
                          <div key={it.itemId} style={{ padding: '7px 14px 7px 20px', borderTop: '1px dashed #f0f0f0', fontSize: 12 }}>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                              <Text style={{ flex: 1, color: 'rgba(0,0,0,0.75)' }}>{it.itemText}</Text>
                              <Text type="secondary" style={{ fontSize: 11.5, whiteSpace: 'nowrap' }}>
                                得分 <b style={{ color: '#1677ff' }}>{it.currentScore}</b> / {it.cap}
                                {it.delta !== 0 ? (
                                  <span style={{ color: it.delta > 0 ? '#52c41a' : '#f5222d', marginLeft: 4 }}>
                                    {it.delta > 0 ? `↑${it.delta}` : `↓${Math.abs(it.delta)}`}
                                  </span>
                                ) : null}
                              </Text>
                            </div>
                            <div style={{ marginTop: 3, fontSize: 11.5, color: 'rgba(0,0,0,0.45)', lineHeight: 1.6 }}>
                              理由：{it.reason || '（暂无说明）'}
                              {it.quote ? (
                                <div style={{ marginTop: 3, background: '#fafafa', borderLeft: '2px solid #d9d9d9', padding: '3px 8px', borderRadius: '0 4px 4px 0', fontSize: 11, color: '#8c8c8c' }}>
                                  证据：{it.quote}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div style={{ padding: '6px 14px 6px 20px', borderTop: '1px dashed #f0f0f0', fontSize: 11.5, color: 'rgba(0,0,0,0.35)' }}>
                          该维度暂无条目明细（模板降级时可能缺失）
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)', lineHeight: 1.6, background: '#fafafa', border: '1px dashed #e8e8e8', borderRadius: 6, padding: 8, marginTop: 12 }}>
                💡 双评分机制：增量评分仅重评变更维度，分数波动可精确归因到本次 AI 修改内容，同时省 Token。
              </div>
            </>
          ) : (
            <Empty description="尚未评分">
              <Button type="primary" onClick={() => assessProject(projectId, group).then(() => { message.success('基线评分完成'); loadDashboard(projectId); })}>
                开始基线评分
              </Button>
            </Empty>
          )}
        </div>
      );
    }
    if (centerTab === 'file') {
      return (
        <ProjectFileViewer
          file={activeProjectFile}
          allFiles={projectFiles || []}
          onSelectFile={(f) => {
            if (f.name.includes('商业计划书')) {
              setCenterTab('bp');
              message.info('已切换至主商业计划书（BP）编辑与预览');
            } else {
              setActiveProjectFile(f);
              setCenterTab('file');
            }
          }}
          onOpenBpEditor={() => setCenterTab('bp')}
          onUploadClick={() => setUploadModalVisible(true)}
          renderMarkdown={(md) => <SimpleMarkdown text={md} />}
        />
      );
    }
    // bp
    return (
      <div style={{ padding: '20px 36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <Text type="secondary" style={{ fontSize: 11, whiteSpace: 'nowrap' }}>
            章节覆盖
          </Text>
          <Progress
            percent={Math.round((chaptersDone / chaptersTotal) * 100)}
            format={() => `${chaptersDone}/${chaptersTotal}`}
            size="small"
            style={{ flex: 1, maxWidth: 260, margin: 0 }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
          {recognition?.chapters.map((c: RecognizedChapter) => {
            const st = CHAPTER_STATUS[c.matchType];
            const isContext = editChapter === c.standardId;
            return (
              <Tooltip key={c.standardId} title={`第${c.standardId}章 ${c.standardName} · ${st.label}`}>
                <span
                  onClick={() => jumpToChapter(c.standardId)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 2,
                    fontSize: 11,
                    padding: '2px 8px',
                    borderRadius: 10,
                    background: isContext
                      ? '#e6f4ff'
                      : c.matchType === 'complete' ? '#f6ffed' : c.matchType === 'weak' ? '#fffbe6' : c.matchType === 'missing' ? '#fff2f0' : '#fafafa',
                    color: st.color,
                    border: `1px solid ${
                      isContext ? '#1677ff' : c.matchType === 'complete' ? '#b7eb8f' : c.matchType === 'weak' ? '#ffe58f' : c.matchType === 'missing' ? '#ffa39e' : '#f0f0f0'
                    }`,
                    cursor: 'pointer',
                  }}
                >
                  {c.standardId}. {c.standardName} · {st.label}
                  <span
                    title="设为 AI 会话上下文（@ 此章节）"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditChapter(c.standardId);
                      message.success(`已 @ 第 ${c.standardId} 章：后续 AI 修改/辅导以此章为上下文`);
                    }}
                    style={{
                      fontWeight: 700,
                      padding: '0 3px',
                      borderRadius: 4,
                      color: isContext ? '#fff' : '#1677ff',
                      background: isContext ? '#1677ff' : '#e6f4ff',
                      cursor: 'pointer',
                    }}
                  >
                    @
                  </span>
                </span>
              </Tooltip>
            );
          })}
        </div>
        <div
          id="bpScroll"
          style={{
            border: '1px solid #f0f0f0',
            borderRadius: 8,
            padding: 12,
            maxHeight: 'calc(100vh - 220px)',
            overflow: 'auto',
            background: '#fff',
          }}
        >
          <SimpleMarkdown text={bpContent || editContent || '（暂无 BP 内容，可先在右侧让 AI 生成或执行全链路分析）'} />
        </div>
      </div>
    );
  };

  return (
    <>
      <div style={{ display: 'flex', height: 'calc(100vh - 80px)', overflow: 'hidden', background: '#fff' }}>
      {/* ========== 三栏主体（侧栏 + 中栏 + 右栏） ========== */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
      {/* ========== 侧栏（视图切换走全局菜单 ?view=，活动栏已移除） ========== */}
      <div
        style={{
          width: 300,
          background: '#fff',
          borderRight: '1px solid #e8e8e8',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            padding: '10px 12px',
            borderBottom: '1px solid #e8e8e8',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(0,0,0,0.55)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {sideMeta[sideView].title}
          </span>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>{renderSideContent()}</div>
      </div>

      {/* ========== 中栏 ========== */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ display: 'flex', background: '#fff', borderBottom: '1px solid #e8e8e8', height: 36, alignItems: 'stretch', flexShrink: 0, overflowX: 'auto' }}>
          {(
            [
              { key: 'bp', label: `📄 ${dashboard?.projectName ?? '项目'}-BP.md` },
              { key: 'diag', label: '📋 诊断报告' },
              { key: 'score', label: '📊 评分详情' },
              ...(activeProjectFile || centerTab === 'file'
                ? [
                    {
                      key: 'file' as CenterTab,
                      label: activeProjectFile
                        ? `📁 ${activeProjectFile.name.length > 20 ? activeProjectFile.name.slice(0, 18) + '...' : activeProjectFile.name}`
                        : '📁 项目材料总览',
                      closable: true,
                    },
                  ]
                : []),
            ] as { key: CenterTab; label: string; closable?: boolean }[]
          ).map((t) => (
            <div
              key={t.key}
              onClick={() => setCenterTab(t.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '0 14px',
                fontSize: 12.5,
                color: centerTab === t.key ? 'rgba(0,0,0,0.88)' : 'rgba(0,0,0,0.45)',
                borderRight: '1px solid #e8e8e8',
                cursor: 'pointer',
                position: 'relative',
                background: centerTab === t.key ? '#fff' : '#fafafa',
                whiteSpace: 'nowrap',
              }}
            >
              <span>{t.label}</span>
              {t.closable && (
                <CloseOutlined
                  style={{ fontSize: 10, color: 'rgba(0,0,0,0.35)', marginLeft: 4 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveProjectFile(null);
                    setCenterTab('bp');
                  }}
                />
              )}
              {centerTab === t.key ? (
                <span style={{ position: 'absolute', left: 0, right: 0, bottom: -1, height: 2, background: '#1677ff' }} />
              ) : null}
            </div>
          ))}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 14px',
            background: '#fff',
            borderBottom: '1px solid #e8e8e8',
            flexShrink: 0,
            fontSize: 12,
          }}
        >
          {centerTab === 'bp' && (
            <>
              <Button size="small" onClick={() => setPreviewMode((p) => (p === 'preview' ? 'edit' : 'preview'))}>
                {previewMode === 'preview' ? '✏️ 编辑源码' : '👁 预览'}
              </Button>
              <Button size="small" onClick={handleSaveVersion} icon={<SaveOutlined />}>
                保存快照
              </Button>
              <Button size="small" onClick={() => verList[0] && handleMarkMilestone(verList[0].versionId)} icon={<FlagOutlined />}>
                标为里程碑
              </Button>
            </>
          )}
          {centerTab === 'file' && (
            <>
              {activeProjectFile ? (
                <>
                  <Tag color="blue" style={{ margin: 0 }}>
                    {activeProjectFile.category || '项目材料'}
                  </Tag>
                  <span style={{ fontWeight: 600, color: 'rgba(0,0,0,0.85)' }}>
                    {activeProjectFile.name}
                  </span>
                  <span style={{ color: 'rgba(0,0,0,0.45)', fontSize: 11 }}>
                    ({(activeProjectFile.size / 1024).toFixed(1)} KB · {activeProjectFile.versionRef || '当前登记版'})
                  </span>
                  <Button
                    size="small"
                    onClick={() => setActiveProjectFile(null)}
                    style={{ fontSize: 11, marginLeft: 6 }}
                  >
                    返回材料总览
                  </Button>
                </>
              ) : (
                <span style={{ fontWeight: 600, color: 'rgba(0,0,0,0.65)' }}>
                  📁 项目多模态材料库总览（共 {(projectFiles || []).length} 份注册材料）
                </span>
              )}
              <Button
                size="small"
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setUploadModalVisible(true)}
                style={{ fontSize: 11, marginLeft: 'auto' }}
              >
                上传新材料
              </Button>
            </>
          )}
          <Spin size="small" spinning={loading} />
          <div style={{ marginLeft: centerTab === 'file' ? 8 : 'auto', fontSize: 11, color: 'rgba(0,0,0,0.35)' }}>
            {dashboard ? `项目：${dashboard.projectName}` : ''}
          </div>
        </div>
        <div id="centerScroll" style={{ flex: 1, overflowY: 'auto', background: '#fff' }}>
          {previewMode === 'edit' && centerTab === 'bp' ? (
            <div style={{ padding: 16 }}>
              <TextArea
                rows={20}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                style={{ fontFamily: 'monospace', fontSize: 13 }}
              />
            </div>
          ) : (
            renderCenterContent()
          )}
        </div>
        {/* 任务 #6-4：中栏底部底栏（组别/类型/字数；后续扩展显示相关信息） */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '4px 14px',
            background: '#fff',
            borderTop: '1px solid #f0f0f0',
            flexShrink: 0,
            fontSize: 11.5,
            color: 'rgba(0,0,0,0.45)',
          }}
        >
          {/* 任务 #7-3：项目名称放底栏左侧 */}
          <span style={{ fontWeight: 600, color: 'rgba(0,0,0,0.65)' }}>
            📁 {dashboard?.projectName ?? '--'}
          </span>
          <span>
            组别：<b style={{ color: '#1677ff' }}>{group}</b>
          </span>
          <span>类型：{triage?.primaryType ?? '--'}</span>
          <span>
            {editContent ? `${editContent.length} 字` : '--'}
          </span>
          <span style={{ marginLeft: 'auto' }}>{centerTab === 'bp' ? 'BP 编辑' : centerTab === 'diag' ? '诊断报告' : centerTab === 'score' ? '评分详情' : '材料检视'}</span>
        </div>
      </div>

      {/* ========== 右侧 AI 对话（常驻，决策 D1：可折叠/可调宽） ========== */}
      <div
        style={{
          width: chatCollapsed ? 36 : chatWidth,
          background: '#fafafa',
          borderLeft: '1px solid #e8e8e8',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          position: 'relative',
          transition: chatCollapsed ? 'width 0.2s' : undefined,
        }}
      >
        {/* 拖拽调宽手柄（折叠时隐藏） */}
        {!chatCollapsed ? (
          <div
            onMouseDown={startDrag}
            title="拖拽调整宽度"
            style={{
              position: 'absolute',
              left: -4,
              top: 0,
              bottom: 0,
              width: 8,
              cursor: 'col-resize',
              zIndex: 10,
            }}
          />
        ) : null}
        {/* 折叠态窄条 */}
        {chatCollapsed ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              paddingTop: 12,
              gap: 10,
            }}
          >
            <div
              onClick={() => setChatCollapsed(false)}
              title="展开 AI 对话"
              style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: 'linear-gradient(135deg,#1677ff,#69b1ff)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              AI
            </div>
            <span
              onClick={() => setChatCollapsed(false)}
              style={{ cursor: 'pointer', color: '#8c8c8c', fontSize: 14 }}
              title="展开"
            >
              ◀
            </span>
          </div>
        ) : (
          <>
        <div style={{ padding: '10px 14px', borderBottom: '1px solid #e8e8e8', background: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: '50%',
              background: 'linear-gradient(135deg,#1677ff,#69b1ff)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
            }}
          >
            AI
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>AI 教练 · 全链路指导</div>
            <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)' }}>
              正在指导：{dashboard?.projectName ?? '--'}
              {curStageLabel !== '--' ? (
                <span style={{ marginLeft: 6, color: '#1677ff' }}>
                  · 现状：{curStageLabel} {coachNameOf(curStageLabel)}
                </span>
              ) : null}
            </div>
            {/* 0902 会议：意图切换下沉 AI 教练（位置 A）——只切对话语境，不改变项目阶段 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
              <span style={{ fontSize: 10.5, color: 'rgba(0,0,0,0.45)', whiteSpace: 'nowrap' }}>教练聚焦</span>
              <Select
                size="small"
                style={{ flex: 1, minWidth: 130 }}
                value={coachIntent || curStageLabel || undefined}
                onChange={handleIntentChange}
                options={[
                  { value: 'L1', label: 'L1 创意激发' },
                  { value: 'L2', label: 'L2 可行性验证' },
                  { value: 'L3', label: 'L3 材料写作' },
                  { value: 'L4', label: 'L4 打磨优化' },
                  { value: 'L5', label: 'L5 路演成型' },
                  { value: 'L6', label: 'L6 赛前冲刺' },
                  { value: 'free', label: '✦ 自由对话' },
                ]}
              />
            </div>
          </div>
          {/* 任务 #7-1：历史会话 + 新建会话 */}
          <Tooltip title="历史会话（已落库）">
            <span
              onClick={() => setHistoryOpen(true)}
              style={{
                marginLeft: 'auto',
                cursor: 'pointer',
                color: 'rgba(0,0,0,0.45)',
                fontSize: 12,
                padding: '2px 5px',
              }}
            >
              🕘 历史
            </span>
          </Tooltip>
          <Tooltip title="新建对话组（新的多轮会话，历史保留）">
            <span
              onClick={handleNewSession}
              style={{
                cursor: 'pointer',
                color: '#1677ff',
                fontSize: 12,
                padding: '2px 5px',
              }}
            >
              ＋ 新会话
            </span>
          </Tooltip>
          <span
            onClick={() => setChatCollapsed(true)}
            title="折叠 AI 对话"
            style={{
              cursor: 'pointer',
              color: 'rgba(0,0,0,0.45)',
              fontSize: 12,
              padding: '2px 5px',
            }}
          >
            ▶ 折叠
          </span>
        </div>

        <div ref={chatBodyRef} style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(chatMsgs || []).length ? (
            chatMsgs.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    color: '#fff',
                    background: m.role === 'ai' ? 'linear-gradient(135deg,#1677ff,#69b1ff)' : '#8c8c8c',
                  }}
                >
                  {m.role === 'ai' ? 'AI' : '我'}
                </div>
                <div
                  style={{
                    maxWidth: '86%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    fontSize: 12.5,
                    lineHeight: 1.65,
                    background: m.role === 'ai' ? '#fff' : '#1677ff',
                    border: m.role === 'ai' ? '1px solid #e8e8e8' : undefined,
                    color: m.role === 'ai' ? 'rgba(0,0,0,0.88)' : '#fff',
                  }}
                >
                  <div dangerouslySetInnerHTML={{ __html: m.html }} />
                  <div style={{ fontSize: 10, color: m.role === 'ai' ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.75)', marginTop: 4 }}>
                    {m.time}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', color: 'rgba(0,0,0,0.45)', padding: '30px 0', fontSize: 12.5 }}>
              AI 教练对话将显示在这里<br />
              <div style={{ marginTop: 8 }}>可让 AI：诊断 BP / 优化章节 / 补写内容 / 辅导写作</div>
            </div>
          )}
        </div>

        {/* 快捷指令（0902 简化：保留 2 个高频） */}
        <div style={{ display: 'flex', gap: 6, padding: '0 12px 8px', flexWrap: 'wrap' }}>
          {[
            { label: '🔍 诊断 BP', action: '帮我诊断当前BP问题' },
            { label: '✍️ 辅导当前章节', action: '' },
          ].map((q) => (
            <span
              key={q.label}
              onClick={() => {
                if (q.action) {
                  setChatInput(q.action);
                } else if (editChapter) {
                  setChatInput(`请辅导第 ${editChapter} 章写作`);
                } else {
                  setChatInput('请先选择章节，再让我辅导写作');
                }
              }}
              style={{
                fontSize: 11.5,
                padding: '4px 10px',
                borderRadius: 14,
                background: '#fff',
                border: '1px solid #e8e8e8',
                color: 'rgba(0,0,0,0.88)',
                cursor: 'pointer',
              }}
            >
              {q.label}
            </span>
          ))}
        </div>

        {/* 修改范围选择 */}
        <div style={{ padding: '0 12px 8px', display: 'flex', gap: 6, alignItems: 'center' }}>
          <Select
            size="small"
            style={{ width: 150 }}
            placeholder="目标章节（全文档）"
            allowClear
            value={editChapter}
            onChange={setEditChapter}
            options={STANDARD_CHAPTER_OPTIONS}
          />
          <Text type="secondary" style={{ fontSize: 10.5 }}>
            修改范围：<b style={{ color: '#1677ff' }}>{editChapter ? `第 ${editChapter} 章` : '全文档'}</b>
          </Text>
        </div>

        <div style={{ padding: '10px 12px', borderTop: '1px solid #e8e8e8', background: '#fff' }}>
          <div style={{ border: '1px solid #e8e8e8', borderRadius: 8, padding: '8px 10px' }}>
            <textarea
              rows={2}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleChatSend();
                }
              }}
              placeholder="给 AI 教练发指令，例如：帮我优化第6章 商业模式…"
              style={{ width: '100%', border: 'none', outline: 'none', resize: 'none', fontSize: 12.5, lineHeight: 1.5, fontFamily: 'inherit' }}
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
              <span style={{ fontSize: 10.5, color: 'rgba(0,0,0,0.45)' }}>Enter 发送 / Shift+Enter 换行</span>
              <Button type="primary" size="small" loading={editing} onClick={handleChatSend} icon={<SendOutlined />}>
                发送
              </Button>
            </div>
          </div>
        </div>
          </>
        )}
      </div>
      {/* ========== 三栏主体结束 ========== */}
      </div>
      </div>

      {/* ========== 版本详情弹窗 ========== */}
      <Modal
        title={`版本 ${viewingVersion?.versionId ?? ''}${viewingVersion?.label ? ` · ${viewingVersion.label}` : ''}`}
        open={!!viewingVersion}
        onCancel={() => setViewingVersion(null)}
        footer={null}
        width={720}
      >
        {viewingVersion ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Space wrap>
              <Tag color={viewingVersion.versionType === 'milestone' ? 'gold' : viewingVersion.versionType === 'version' ? 'blue' : 'default'}>
                {viewingVersion.versionType === 'milestone' ? '里程碑' : viewingVersion.versionType === 'version' ? '版本' : '快照'}
              </Tag>
              {viewingVersion.total != null ? <Tag color="green">总分 {viewingVersion.total}</Tag> : null}
              <Text type="secondary" style={{ fontSize: 12 }}>{viewingVersion.createdAt}</Text>
            </Space>
            {(viewingDiffs || []).length ? (
              <div>
                <Text strong style={{ fontSize: 12 }}>与上一版 diff（{viewingDiffs.length} 处）</Text>
                {viewingDiffs.map((d, i) => (
                  <div key={i} style={{ marginTop: 8, border: '1px solid #f0f0f0', borderRadius: 6, padding: 8 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {d.type === 'added' ? '新增' : d.type === 'removed' ? '删除' : '改写'} · {d.position}
                    </Text>
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <div style={{ flex: 1, background: '#fff1f0', padding: 6, borderRadius: 4, whiteSpace: 'pre-wrap', fontSize: 12, color: '#cf1322' }}>
                        {d.before || '（新增内容）'}
                      </div>
                      <div style={{ alignSelf: 'center', color: 'rgba(0,0,0,0.45)' }}>→</div>
                      <div style={{ flex: 1, background: '#f6ffed', padding: 6, borderRadius: 4, whiteSpace: 'pre-wrap', fontSize: 12, color: '#389e0d' }}>
                        {d.after || '（删除内容）'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Alert type="info" showIcon message="与上一版内容一致" />
            )}
            <div style={{ border: '1px solid #f0f0f0', borderRadius: 6, padding: 12, maxHeight: 420, overflow: 'auto', background: '#fff' }}>
              <SimpleMarkdown text={viewingVersion.content ?? ''} />
            </div>
          </div>
        ) : null}
      </Modal>

      {/* ========== 历史会话弹窗（任务 #7-1 + #8-3：对话组列表管理） ========== */}
      <Modal
        title={`对话组（会话） · ${dashboard?.projectName ?? ''}`}
        open={historyOpen}
        onCancel={() => setHistoryOpen(false)}
        footer={null}
        width={640}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Alert
            type="info"
            showIcon
            message="每个对话组 = 一段多轮对话的完整记录（已落库）。可切换/新建/删除。"
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button size="small" type="primary" ghost icon={<SendOutlined />} onClick={handleNewSession}>
              ＋ 新建对话组
            </Button>
          </div>
          {(sessions || []).length ? (
            <div style={{ maxHeight: 400, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {sessions.map((s) => (
                <div
                  key={s.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 10px',
                    borderRadius: 8,
                    background: curSessionId === s.id ? '#e6f4ff' : '#fafafa',
                    border: curSessionId === s.id ? '1px solid #91caff' : '1px solid #f0f0f0',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleOpenSession(s.id)}
                >
                  <span style={{ fontSize: 13, fontWeight: 500, flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    💬 {s.title}
                  </span>
                  <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)', flexShrink: 0 }}>
                    {s.messageCount} 条 · {s.updatedAt}
                  </span>
                  {curSessionId === s.id ? (
                    <span style={{ fontSize: 10, color: '#1677ff', flexShrink: 0 }}>当前</span>
                  ) : null}
                  <span
                    title="删除对话组"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSession(s.id);
                    }}
                    style={{ color: 'rgba(0,0,0,0.25)', cursor: 'pointer', padding: '0 4px', flexShrink: 0 }}
                  >
                    ✕
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <Empty description="暂无对话组（与 AI 对话后自动创建）" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
          <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)' }}>
            💡 与 AI 教练的对话会自动归入「当前对话组」；点击「＋ 新建对话组」开始一段新的多轮对话，历史记录完整保留。
          </div>
        </div>
      </Modal>

      {/* 上传/添加新材料模态框 */}
      <Modal
        title="📤 上传 / 登记项目材料"
        open={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        onOk={() => {
          if (!newFileName.trim()) {
            message.warning('请输入材料文件名（如：查新报告.pdf / 路演PPT.pptx）');
            return;
          }
          const ext = newFileName.split('.').pop()?.toLowerCase() || '';
          const computedFileType: 'text' | 'binary' | 'readonly' =
            newFileType ||
            (ext === 'md' || ext === 'txt'
              ? 'text'
              : ext === 'pptx' || ext === 'ppt' || ext === 'mp4' || ext === 'step'
              ? 'binary'
              : 'readonly');

          const newFile: ProjectFileItem = {
            id: `file-usr-${Date.now()}`,
            name: newFileName.trim(),
            fileType: computedFileType,
            size: Math.floor(Math.random() * 4500000) + 128000,
            versionRef: computedFileType === 'text' ? `${projectId}-c1` : computedFileType === 'binary' ? 'v1.0' : null,
            readonly: computedFileType === 'readonly',
            updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
            category: newFileCategory,
            badge: '用户上传',
            description: newFileDesc.trim() || '自主上传的项目佐证材料，已接入全链路 AI 向量知识库。',
            author: '项目团队',
            ext,
          };

          setProjectFiles((prev) => [newFile, ...prev]);
          setActiveProjectFile(newFile);
          setCenterTab('file');
          setUploadModalVisible(false);
          setNewFileName('');
          setNewFileDesc('');
          message.success(`已成功添加材料【${newFile.name}】，并建立 AI 语义索引！`);
        }}
        okText="确认登记入库"
        cancelText="取消"
        width={520}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 8 }}>
          <Alert
            type="info"
            showIcon
            message="材料将自动纳入赛事 AI 知识库"
            description="上传的项目材料将作为评审核验依据，并注入 AI 教练上下文，辅助撰写商业计划书并预演答辩攻防。"
          />

          <div>
            <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 4, color: 'rgba(0,0,0,0.85)' }}>
              材料文件名 <span style={{ color: '#ff4d4f' }}>*</span>
            </div>
            <Input
              placeholder="例如：新型导热材料中试实验数据.pdf / 答辩攻防预案.md"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
            />
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 4, color: 'rgba(0,0,0,0.85)' }}>材料归属类别</div>
            <Select
              style={{ width: '100%' }}
              value={newFileCategory}
              onChange={setNewFileCategory}
              options={[
                { value: '商业模式与计划', label: '📄 商业模式与计划（BP/画布/纪要）' },
                { value: '技术与研发文档', label: '🔬 技术与研发文档（技术报告/CAD/参数）' },
                { value: '演示与多媒体', label: '🎬 演示与多媒体（PPT/VCR视频/折页）' },
                { value: '知识产权与专利', label: '📜 知识产权与专利（发明专利/软著）' },
                { value: '检测与质检报告', label: '🛡️ 检测与质检报告（CMA/CNAS第三方质检）' },
                { value: '市场与商业佐证', label: '🤝 市场与商业佐证（意向订单/合同协议）' },
                { value: '财务与合规资质', label: '⚖️ 财务与合规资质（转化证明/财务审计）' },
              ]}
            />
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 4, color: 'rgba(0,0,0,0.85)' }}>材料类型定义</div>
            <Select
              style={{ width: '100%' }}
              value={newFileType}
              onChange={setNewFileType}
              options={[
                { value: 'readonly', label: '📎 只读佐证材料（提供 AI 检索与评委打分核验依据）' },
                { value: 'text', label: '📄 可编辑文本文件（纳入版本化管理，支持源码与预览）' },
                { value: 'binary', label: '🎬 二进制大文件（PPT/视频/3D模型，保留核心最新版）' },
              ]}
            />
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 4, color: 'rgba(0,0,0,0.85)' }}>材料说明与亮点摘要</div>
            <Input.TextArea
              rows={3}
              placeholder="简要描述材料的核心内容、权威结论或商业/技术亮点（有助于 AI 更精准提取要点）"
              value={newFileDesc}
              onChange={(e) => setNewFileDesc(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
