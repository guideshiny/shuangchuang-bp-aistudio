import fs from 'fs';
import path from 'path';

export interface ProjectSummary {
  id: string;
  name: string;
  track: string;
  score: number;
  grade: string;
  confidence: string;
  tags: string[];
  source?: string;
}

export interface DimensionScore {
  name: string;
  weight: number;
  score: number;
  reason: string;
  vetoHit?: boolean;
}

export interface TraceStage {
  step: number;
  title: string;
  status: 'done' | 'warning' | 'error';
  duration: number;
  detail: string;
  sample?: string;
}

export interface Anomaly {
  type: string;
  level: 'warning' | 'danger';
  desc: string;
}

export interface ProjectDetail extends ProjectSummary {
  dimensions: DimensionScore[];
  trace: TraceStage[];
  anomalies: Anomaly[];
  questions: string[];
}

export interface ReviewRecord {
  id: number;
  projectId: string;
  verdict: string;
  comment: string;
  createdAt: string;
}

export interface MaterialFile {
  name: string;
  size: number;
  role: 'core' | 'aux' | 'exclude';
}

class Store {
  projects: Map<string, ProjectSummary> = new Map();
  details: Map<string, ProjectDetail> = new Map();
  reviews: Map<string, ReviewRecord[]> = new Map();
  materials: Map<string, MaterialFile[]> = new Map();
  materialPaths: Map<string, { event: string; dir: string; fullPath: string }> = new Map();
  
  // Scene 2 Guidance stores
  triages: Map<string, any> = new Map();
  recognitions: Map<string, any> = new Map();
  assessments: Map<string, any> = new Map();
  bpContents: Map<string, string> = new Map();
  stages: Map<string, any[]> = new Map();
  todos: Map<string, any[]> = new Map();
  versions: Map<string, any[]> = new Map();
  sessions: Map<string, any[]> = new Map();
  messages: Map<string, any[]> = new Map();
  coachData: Map<string, any> = new Map();
  scoreVersions: Map<string, any[]> = new Map();
  scoreResults: Map<string, any[]> = new Map();

  dumpPath = path.resolve(process.cwd(), 'server/data/db_dump.json');
  materialsRoot = path.resolve(process.cwd(), 'materials');

  constructor() {
    this.init();
  }

  init() {
    this.scanMaterials();
    this.loadDbDump();
  }

  scanMaterials() {
    if (!fs.existsSync(this.materialsRoot)) return;
    try {
      const eventDirs = fs.readdirSync(this.materialsRoot).filter((d) => {
        return fs.statSync(path.join(this.materialsRoot, d)).isDirectory();
      });

      const fixedProjects: Record<string, { event: string; dir: string; name: string; track: string }> = {
        p1: { event: '01.中国国际大学生创新大赛', dir: '国一【国赛】易休智能睡眠眼罩', name: '易休智能睡眠眼罩', track: '创新+创业' },
        p2: { event: '01.中国国际大学生创新大赛', dir: '互联网【国赛】互联网+可再生能源储能系统', name: '互联网+可再生能源储能系统', track: '创新+创业' },
        p3: { event: '01.中国国际大学生创新大赛', dir: '国一互联网【国赛】跃动客体育', name: '跃动客体育', track: '创业' },
        p4: { event: '01.中国国际大学生创新大赛', dir: '国一互联网飞行医院——致力于支医扶贫的多功能移动医疗队计划书', name: '飞行医院：支医扶贫多功能移动医疗队', track: '创新+创业' },
      };

      let autoId = 5;
      for (const event of eventDirs) {
        const eventPath = path.join(this.materialsRoot, event);
        const subdirs = fs.readdirSync(eventPath).filter((d) => {
          return fs.statSync(path.join(eventPath, d)).isDirectory();
        });

        for (const sub of subdirs) {
          let id = '';
          let name = sub;
          let track = event.includes('创新') ? '创新+创业' : '创业';

          // Check fixed mapping
          for (const [k, v] of Object.entries(fixedProjects)) {
            if (v.event === event && v.dir === sub) {
              id = k;
              name = v.name;
              track = v.track;
              break;
            }
          }
          if (!id) {
            id = `p${autoId++}`;
          }

          const fullPath = path.join(eventPath, sub);
          this.materialPaths.set(id, { event, dir: sub, fullPath });

          // Scan files in this directory
          const files = fs.readdirSync(fullPath).filter((f) => {
            return !f.startsWith('.') && fs.statSync(path.join(fullPath, f)).isFile();
          });

          const matFiles: MaterialFile[] = files.map((f) => {
            const stat = fs.statSync(path.join(fullPath, f));
            let role: 'core' | 'aux' | 'exclude' = 'core';
            const lower = f.toLowerCase();
            if (lower.includes('ppt') || lower.includes('答辩') || lower.includes('展示')) {
              role = 'aux';
            } else if (lower.includes('证明') || lower.includes('承诺') || lower.includes('附件') || lower.includes('专利证书')) {
              role = 'exclude';
            }
            return {
              name: f,
              size: stat.size,
              role,
            };
          });
          this.materials.set(id, matFiles);

          // Read default BP content
          const coreFile = matFiles.find((m) => m.role === 'core' && m.name.endsWith('.md')) || matFiles[0];
          if (coreFile) {
            try {
              const content = fs.readFileSync(path.join(fullPath, coreFile.name), 'utf-8');
              this.bpContents.set(id, content);
            } catch {
              // ignore
            }
          }
        }
      }
    } catch (e) {
      console.error('[Store] Error scanning materials:', e);
    }
  }

  loadDbDump() {
    if (!fs.existsSync(this.dumpPath)) return;
    try {
      const dump = JSON.parse(fs.readFileSync(this.dumpPath, 'utf-8'));

      // 1. screen_results
      if (Array.isArray(dump.screen_results)) {
        for (const row of dump.screen_results) {
          const detail = JSON.parse(row.detail_json);
          // Deduplicate tags
          if (Array.isArray(detail.tags)) {
            detail.tags = Array.from(new Set(detail.tags.map((t: string) => String(t).trim()).filter(Boolean)));
          }
          // Convert veto_hit to vetoHit if needed
          if (Array.isArray(detail.dimensions)) {
            detail.dimensions = detail.dimensions.map((d: any) => ({
              name: d.name,
              weight: d.weight,
              score: d.score,
              reason: d.reason,
              vetoHit: d.vetoHit ?? d.veto_hit ?? false,
            }));
          }
          this.details.set(row.project_id, detail);
          this.projects.set(row.project_id, {
            id: detail.id,
            name: detail.name,
            track: detail.track,
            score: detail.score,
            grade: detail.grade,
            confidence: detail.confidence,
            tags: detail.tags || [],
            source: detail.source,
          });
        }
      }

      // 2. review_records
      if (Array.isArray(dump.review_records)) {
        for (const row of dump.review_records) {
          const list = this.reviews.get(row.project_id) || [];
          list.push({
            id: row.id,
            projectId: row.project_id,
            verdict: row.verdict,
            comment: row.comment,
            createdAt: row.created_at,
          });
          this.reviews.set(row.project_id, list);
        }
      }

      // 3. triage_results
      if (Array.isArray(dump.triage_results)) {
        for (const row of dump.triage_results) {
          try {
            const data = JSON.parse(row.result_json);
            this.triages.set(row.project_id, data);
          } catch {}
        }
      }

      // 4. bp_recognitions
      if (Array.isArray(dump.bp_recognitions)) {
        for (const row of dump.bp_recognitions) {
          try {
            const data = JSON.parse(row.result_json);
            this.recognitions.set(row.project_id, data);
          } catch {}
        }
      }

      // 5. project_stages
      if (Array.isArray(dump.project_stages)) {
        for (const row of dump.project_stages) {
          const list = this.stages.get(row.project_id) || [];
          list.push({
            id: row.id,
            projectId: row.project_id,
            stageCode: row.stage_code,
            status: row.status,
            progress: row.progress,
            convergeStatus: row.converge_status,
            updatedAt: row.updated_at,
          });
          this.stages.set(row.project_id, list);
        }
      }

      // 6. project_todos
      if (Array.isArray(dump.project_todos)) {
        for (const row of dump.project_todos) {
          const list = this.todos.get(row.project_id) || [];
          const doneBool = Boolean(row.done === 1 || row.done === true || row.status === 'completed');
          list.push({
            id: typeof row.id === 'number' ? row.id : Number(row.id) || list.length + 1,
            projectId: row.project_id,
            stage: row.stage || row.stage_code || 'L1',
            stageCode: row.stage || row.stage_code || 'L1',
            text: row.text || row.title || '',
            title: row.text || row.title || '',
            done: doneBool,
            status: doneBool ? 'completed' : 'pending',
            source: row.source || 'derived',
            refKey: row.ref_key || row.refKey || null,
            ref_key: row.ref_key || row.refKey || null,
            ai: Boolean(row.ai ?? (row.source === 'ai' || (row.source && row.source.toLowerCase().includes('ai')))),
            tag: row.tag || (row.source === 'ai' ? 'AI教练建议' : '规则衍生'),
            created_at: row.created_at,
            updated_at: row.updated_at,
          });
          this.todos.set(row.project_id, list);
        }
      }

      // 7. project_versions
      if (Array.isArray(dump.project_versions)) {
        for (const row of dump.project_versions) {
          const list = this.versions.get(row.project_id) || [];
          list.push({
            id: String(row.id),
            projectId: row.project_id,
            versionId: row.version_id,
            versionType: row.version_type,
            name: row.name,
            trigger: row.trigger,
            summary: row.summary,
            bpContent: row.bp_content,
            createdAt: row.created_at,
          });
          this.versions.set(row.project_id, list);
          if (row.bp_content && !this.bpContents.has(row.project_id)) {
            this.bpContents.set(row.project_id, row.bp_content);
          }
        }
      }

      // 8. coach_sessions & coach_messages
      if (Array.isArray(dump.coach_sessions)) {
        for (const row of dump.coach_sessions) {
          const list = this.sessions.get(row.project_id) || [];
          list.push({
            id: String(row.id),
            projectId: row.project_id,
            title: row.title,
            createdAt: row.created_at,
          });
          this.sessions.set(row.project_id, list);
        }
      }

      if (Array.isArray(dump.coach_messages)) {
        for (const row of dump.coach_messages) {
          const list = this.messages.get(String(row.session_id)) || [];
          list.push({
            id: String(row.id),
            sessionId: String(row.session_id),
            role: row.role,
            content: row.content,
            action: row.action,
            target: row.target,
            createdAt: row.created_at,
          });
          this.messages.set(String(row.session_id), list);
        }
      }

      // 9. score_versions
      if (Array.isArray(dump.score_versions)) {
        for (const row of dump.score_versions) {
          const list = this.scoreVersions.get(row.project_id) || [];
          list.push(row);
          this.scoreVersions.set(row.project_id, list);
        }
      }

      // 10. score_results
      if (Array.isArray(dump.score_results)) {
        for (const row of dump.score_results) {
          const key = `${row.project_id}:${row.version_id}`;
          const list = this.scoreResults.get(key) || [];
          list.push(row);
          this.scoreResults.set(key, list);
        }
      }
    } catch (e) {
      console.error('[Store] Error loading db dump:', e);
    }
  }

  // Get project summaries
  getProjects(query?: { track?: string; risk?: string; q?: string }): ProjectSummary[] {
    let result = Array.from(this.projects.values());
    if (query?.track && query.track !== '全部') {
      result = result.filter((p) => p.track.includes(query.track!));
    }
    if (query?.risk) {
      if (query.risk === 'danger') {
        result = result.filter((p) => {
          const d = this.details.get(p.id);
          return d?.anomalies?.some((a) => a.level === 'danger') || p.grade === 'D';
        });
      } else if (query.risk === 'warn') {
        result = result.filter((p) => {
          const d = this.details.get(p.id);
          return d?.anomalies?.some((a) => a.level === 'warning');
        });
      }
    }
    if (query?.q) {
      const kw = query.q.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(kw) || p.track.toLowerCase().includes(kw));
    }
    return result;
  }

  getProjectDetail(id: string): ProjectDetail | null {
    return this.details.get(id) || null;
  }

  saveProjectDetail(detail: ProjectDetail) {
    if (Array.isArray(detail.tags)) {
      detail.tags = Array.from(new Set(detail.tags.map((t) => String(t).trim()).filter(Boolean)));
    }
    this.details.set(detail.id, detail);
    this.projects.set(detail.id, {
      id: detail.id,
      name: detail.name,
      track: detail.track,
      score: detail.score,
      grade: detail.grade,
      confidence: detail.confidence,
      tags: detail.tags || [],
      source: detail.source,
    });
  }

  addReview(projectId: string, verdict: string, comment: string): ReviewRecord {
    const list = this.reviews.get(projectId) || [];
    const newRecord: ReviewRecord = {
      id: Date.now(),
      projectId,
      verdict,
      comment,
      createdAt: new Date().toISOString(),
    };
    list.unshift(newRecord);
    this.reviews.set(projectId, list);
    return newRecord;
  }

  getReviews(projectId: string): ReviewRecord[] {
    return this.reviews.get(projectId) || [];
  }

  getMaterials(projectId: string): MaterialFile[] {
    return this.materials.get(projectId) || [];
  }

  getMaterialPath(projectId: string) {
    return this.materialPaths.get(projectId) || null;
  }

  getBpContent(projectId: string): string {
    return this.bpContents.get(projectId) || '暂无商业计划书内容。';
  }

  saveBpContent(projectId: string, content: string) {
    this.bpContents.set(projectId, content);
  }

  // Todos helper methods
  getTodos(projectId: string): any[] {
    return this.todos.get(projectId) || [];
  }

  saveTodos(projectId: string, list: any[]) {
    this.todos.set(projectId, list);
  }

  addTodo(projectId: string, item: { stage?: string; text: string; source?: string; ai?: boolean }): any {
    const list = this.getTodos(projectId);
    const maxId = list.reduce((max, t) => Math.max(max, typeof t.id === 'number' ? t.id : Number(t.id) || 0), 0);
    const newId = maxId + 1;
    const stage = item.stage || 'L1';
    const isAi = Boolean(item.ai || item.source === 'ai');
    const newTodo = {
      id: newId,
      projectId,
      stage,
      stageCode: stage,
      text: item.text,
      title: item.text,
      done: false,
      status: 'pending',
      source: item.source || (isAi ? 'ai' : 'manual'),
      refKey: null,
      ref_key: null,
      ai: isAi,
      tag: isAi ? 'AI教练建议' : '人工新增',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    list.unshift(newTodo);
    this.todos.set(projectId, list);
    return newTodo;
  }

  toggleTodo(projectId: string, todoId: number | string, done?: boolean): any {
    const list = this.getTodos(projectId);
    const idNum = typeof todoId === 'number' ? todoId : Number(todoId);
    const target = list.find((t) => t.id === todoId || (idNum && Number(t.id) === idNum));
    if (target) {
      const nextDone = done !== undefined ? Boolean(done) : !target.done;
      target.done = nextDone;
      target.status = nextDone ? 'completed' : 'pending';
      target.updated_at = new Date().toISOString();
      return target;
    }
    return null;
  }

  deleteTodo(projectId: string, todoId: number | string): boolean {
    const list = this.getTodos(projectId);
    const idNum = typeof todoId === 'number' ? todoId : Number(todoId);
    const initialLen = list.length;
    const filtered = list.filter((t) => t.id !== todoId && (!idNum || Number(t.id) !== idNum));
    this.todos.set(projectId, filtered);
    return filtered.length < initialLen;
  }

  // Scores helper methods
  getScoreVersions(projectId: string): any[] {
    return this.scoreVersions.get(projectId) || [];
  }

  getScoreResults(projectId: string, versionId: string): any[] {
    return this.scoreResults.get(`${projectId}:${versionId}`) || [];
  }
}

export const store = new Store();
