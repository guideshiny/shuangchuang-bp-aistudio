import { client, extractErrorMessage } from './client';
import type {
  ArchiveResult,
  AssessResult,
  ChapterCoachResult,
  CoachMessageItem,
  CoachSessionDetail,
  CoachSessionItem,
  CoachSessionList,
  DiagnosisResult,
  EditDiff,
  EditResult,
  EditGranularity,
  GuidanceDashboard,
  ProjectFileTree,
  ProjectVersion,
  RecognitionResult,
  StageConversationPayload,
  StageConversationReply,
  StageResult,
  StageTaskList,
  TriageResult,
  VersionListResult,
} from '../types/guidance';

/**
 * 全链路智能指导接口封装（本目录是唯一允许网络请求的地方）
 * 后端路由：backend/app/routers/guidance.py（/api/guidance/...）
 */

/** 创新类型分诊（真实 LLM，温度 0.2，等待 5-60s） */
export async function triageProject(projectId: string): Promise<TriageResult> {
  const resp = await client.post<TriageResult>(`/guidance/${projectId}/triage`);
  return resp.data;
}

/** 章节识别（要素级判定 + 规则聚合，真实 LLM） */
export async function recognizeProject(projectId: string): Promise<RecognitionResult> {
  const resp = await client.post<RecognitionResult>(`/guidance/${projectId}/recognize`);
  return resp.data;
}

/**
 * 基线/增量评分（真实 LLM，温度 0.1）
 * baseVersionId 为空=首次基线；传入最近版本 ID=增量对比
 */
export async function assessProject(
  projectId: string,
  group: string,
  baseVersionId?: string,
): Promise<AssessResult> {
  const resp = await client.post<AssessResult>(`/guidance/${projectId}/assess`, {
    group,
    baseVersionId,
  });
  return resp.data;
}

/** 全链路指导工作台聚合数据 */
export async function fetchGuidanceDashboard(projectId: string): Promise<GuidanceDashboard> {
  const resp = await client.get<GuidanceDashboard>(`/guidance/${projectId}/dashboard`);
  return resp.data;
}

/** 当前 BP 全文（决策 B1：中栏编辑器直接读写的数据源） */
export async function fetchBp(projectId: string): Promise<{ projectId: string; content: string; sourceVersionId: string | null; updatedAt: string | null }> {
  const resp = await client.get<{ projectId: string; content: string; sourceVersionId: string | null; updatedAt: string | null }>(`/guidance/${projectId}/bp`);
  return resp.data;
}

/** 项目全文件树（方案 A：文件注册表 + BP 细粒度链 + 大文件只留最新） */
export async function fetchProjectFiles(projectId: string): Promise<ProjectFileTree> {
  const resp = await client.get<ProjectFileTree>(`/guidance/${projectId}/files`);
  return resp.data;
}

// ---- AI 教练会话（对话组，任务 #8-3） ----

/** 项目会话列表 */
export async function listCoachSessions(projectId: string): Promise<CoachSessionList> {
  const resp = await client.get<any>(`/guidance/${projectId}/sessions`);
  if (Array.isArray(resp.data)) {
    return { projectId, sessions: resp.data };
  }
  return {
    projectId: resp.data?.projectId || projectId,
    sessions: Array.isArray(resp.data?.sessions) ? resp.data.sessions : [],
  };
}

/** 新建会话 */
export async function createCoachSession(projectId: string): Promise<CoachSessionItem> {
  const resp = await client.post<CoachSessionItem>(`/guidance/${projectId}/sessions`);
  return resp.data;
}

/** 会话详情（含消息） */
export async function fetchCoachSession(projectId: string, sessionId: number): Promise<CoachSessionDetail> {
  const resp = await client.get<CoachSessionDetail>(`/guidance/${projectId}/sessions/${sessionId}`);
  return resp.data;
}

/** 会话内追加消息 */
export async function appendCoachMessage(
  projectId: string,
  sessionId: number,
  role: string,
  content: string,
): Promise<CoachMessageItem> {
  const resp = await client.post<CoachMessageItem>(`/guidance/${projectId}/sessions/${sessionId}/messages`, {
    role,
    content,
  });
  return resp.data;
}

/** 删除会话 */
export async function deleteCoachSession(projectId: string, sessionId: number): Promise<{ deleted: boolean }> {
  const resp = await client.delete<{ deleted: boolean }>(`/guidance/${projectId}/sessions/${sessionId}`);
  return resp.data;
}

// ---- 版本管理 ----

/** 内容版本列表（时间线，里程碑带总分） */
export async function listVersions(projectId: string): Promise<VersionListResult> {
  const resp = await client.get<any>(`/guidance/${projectId}/versions`);
  if (Array.isArray(resp.data)) {
    return { projectId, versions: resp.data };
  }
  return {
    projectId: resp.data?.projectId || projectId,
    versions: Array.isArray(resp.data?.versions) ? resp.data.versions : [],
  };
}

/** 内容版本详情（含全文，切换旧版查看） */
export async function fetchVersion(projectId: string, versionId: string): Promise<ProjectVersion> {
  const resp = await client.get<ProjectVersion>(`/guidance/${projectId}/versions/${versionId}`);
  return resp.data;
}

/** 版本 diff（与上一内容版本对比） */
export async function fetchVersionDiff(projectId: string, versionId: string): Promise<EditDiff[]> {
  const resp = await client.get<EditDiff[]>(`/guidance/${projectId}/versions/${versionId}/diff`);
  return resp.data;
}

/** 从指定版本创建分支（决策 5：仿 git 树形版本管理） */
export async function createBranch(
  projectId: string,
  versionId: string,
  label?: string,
): Promise<ProjectVersion> {
  const resp = await client.post<ProjectVersion>(
    `/guidance/${projectId}/versions/${versionId}/branch`,
    { label },
  );
  return resp.data;
}

/** 手动保存小版本 */
export async function saveVersion(projectId: string, label?: string, content?: string): Promise<ProjectVersion> {
  const resp = await client.post<ProjectVersion>(`/guidance/${projectId}/versions`, {
    label,
    content,
  });
  return resp.data;
}

/** 标记里程碑（可选自动触发增量评分） */
export async function markMilestone(
  projectId: string,
  versionId: string,
  label?: string,
  autoScore = true,
): Promise<ProjectVersion> {
  const resp = await client.post<ProjectVersion>(
    `/guidance/${projectId}/versions/${versionId}/milestone`,
    { label, autoScore },
  );
  return resp.data;
}

// ---- agent 操作执行 ----

/** agent 执行修改（对话指令 → LLM 生成修改 → 自动快照 + diff） */
export async function editProject(
  projectId: string,
  instruction: string,
  granularity: EditGranularity,
  chapterId?: string,
  autoScore = false,
): Promise<EditResult> {
  const resp = await client.post<EditResult>(`/guidance/${projectId}/edit`, {
    instruction,
    granularity,
    chapterId,
    autoScore,
  });
  return resp.data;
}

// ---- 全链路阶段旅程 ----

/** 全链路阶段状态（当前阶段 + 各阶段完成情况） */
export async function fetchStage(projectId: string): Promise<StageResult> {
  const resp = await client.get<StageResult>(`/guidance/${projectId}/stage`);
  return resp.data;
}

/** 推进/切换阶段 */
export async function advanceStage(projectId: string, target: string): Promise<StageResult> {
  const resp = await client.post<StageResult>(`/guidance/${projectId}/stage/advance`, {
    target,
  });
  return resp.data;
}

/** 阶段/意图问候（决策 B2 + 0902：切意图触发；intentStage 可选，L1~L6/free） */
export async function stageGreet(projectId: string, intentStage?: string): Promise<StageConversationReply> {
  const resp = await client.post<StageConversationReply>(
    `/guidance/${projectId}/stage/greet`,
    undefined,
    { params: intentStage ? { intent_stage: intentStage } : undefined },
  );
  return resp.data;
}

// ---- M2 诊断报告 ----

/** 诊断报告（你在哪 / 缺什么 / 下一步） */
export async function fetchDiagnosis(projectId: string): Promise<DiagnosisResult> {
  const resp = await client.get<DiagnosisResult>(`/guidance/${projectId}/diagnosis`);
  return resp.data;
}

// ---- M3 L1/L2 轻量对话 ----

/** L1/L2 对话（message 或 choice 二选一） */
export async function stageConversation(
  projectId: string,
  body: StageConversationPayload,
): Promise<StageConversationReply> {
  const resp = await client.post<StageConversationReply>(
    `/guidance/${projectId}/stage/conversation`,
    body,
  );
  return resp.data;
}

/** L2 验证任务清单 */
export async function fetchStageTasks(projectId: string): Promise<StageTaskList> {
  const resp = await client.get<StageTaskList>(`/guidance/${projectId}/stage/tasks`);
  return resp.data;
}

/** L2 任务提交评阅 */
export async function submitStageTask(
  projectId: string,
  taskId: string,
  evidence: string,
): Promise<StageTaskList> {
  const resp = await client.post<StageTaskList>(
    `/guidance/${projectId}/stage/tasks/${taskId}/submit`,
    { evidence },
  );
  return resp.data;
}

// ---- M4 章节教练 ----

/** 章节教练（评委看什么 / 缺哪些必写 / 红线坑示例，不给分） */
export async function chapterCoach(
  projectId: string,
  chapterId: string,
  draft: string,
  focused = false,
): Promise<ChapterCoachResult> {
  const resp = await client.post<ChapterCoachResult>(`/guidance/${projectId}/chapter-coach`, {
    chapterId,
    draft,
    focused,
  });
  return resp.data;
}

// ---- M7 项目档案时间线 ----

/** 项目档案（版本事件 + 评分事件合并时间线 + 趋势点） */
export async function fetchArchive(projectId: string): Promise<ArchiveResult> {
  const resp = await client.get<any>(`/guidance/${projectId}/archive`);
  const data = resp.data || {};
  return {
    projectId: data.projectId || projectId,
    events: Array.isArray(data.events)
      ? data.events.map((ev: any) => ({
          time: ev.time || ev.date || '',
          eventType: ev.eventType || 'version',
          title: ev.title || (ev.step ? `${ev.step} 节点记录` : '节点记录'),
          detail: ev.detail || '',
          refId: ev.refId || ev.step || '',
        }))
      : [],
    scoreTrend: Array.isArray(data.scoreTrend) ? data.scoreTrend : [],
  };
}

// ---- 动态待办（决策 B3 落库） ----

export interface TodoItemDto {
  id: number;
  stage: string;
  text: string;
  done: boolean;
  source: string; // derived/manual/ai
  refKey?: string | null;
  ai: boolean;
}

/** 动态待办列表（落库 + 派生合并） */
export async function fetchTodos(projectId: string): Promise<{ projectId: string; todos: TodoItemDto[] }> {
  const resp = await client.get<any>(`/guidance/${projectId}/todos`);
  const list = Array.isArray(resp.data) ? resp.data : Array.isArray(resp.data?.todos) ? resp.data.todos : [];
  return {
    projectId,
    todos: list.map((t: any, idx: number) => ({
      id: typeof t.id === 'number' ? t.id : idx + 1,
      stage: t.stage || t.stageCode || 'L1',
      text: t.text || t.title || '',
      done: Boolean(t.done ?? (t.status === 'completed')),
      source: t.source || 'manual',
      refKey: t.refKey ?? null,
      ai: Boolean(t.ai ?? (t.source?.includes('AI') || false)),
    })),
  };
}

/** 新增待办（manual/ai） */
export async function createTodo(
  projectId: string,
  stage: string,
  text: string,
  source: 'manual' | 'ai' = 'manual',
): Promise<TodoItemDto> {
  const resp = await client.post<TodoItemDto>(`/guidance/${projectId}/todos`, { stage, text, source });
  return resp.data;
}

/** AI 生成待办（任务 #10-2：后端真实 LLM 调用，产出当前阶段多条待办并落库） */
export async function generateTodos(projectId: string): Promise<{ projectId: string; todos: TodoItemDto[] }> {
  const resp = await client.post<{ projectId: string; todos: TodoItemDto[] }>(
    `/guidance/${projectId}/todos/generate`,
  );
  return resp.data;
}

/** 勾选/取消完成 */
export async function updateTodo(projectId: string, todoId: number, done: boolean): Promise<TodoItemDto> {
  const resp = await client.patch<TodoItemDto>(`/guidance/${projectId}/todos/${todoId}`, { done });
  return resp.data;
}

/** 删除待办（允许删 AI 项，决策 7） */
export async function deleteTodo(projectId: string, todoId: number): Promise<{ deleted: boolean }> {
  const resp = await client.delete<{ deleted: boolean }>(`/guidance/${projectId}/todos/${todoId}`);
  return resp.data;
}

export { extractErrorMessage };
