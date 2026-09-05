# 双创赛事智能体

按《产品定义-定稿 v1.2》实现的 **OPC 双创孵化 + 赛事全生命周期 AI 中枢 demo**，辅导大学生参加创新创业大赛（创新大赛 / 挑战杯 / 职规赛等）。

## 核心能力

**三场景全链路真实 LLM**（LLM 不可用时自动降级 mock，演示不中断）：

| 场景 | 对应定义 | 能力 |
|------|---------|------|
| **Scene1 智能遴选与排名** | 5.1 | 一键初筛 SSE 流水线、六维打分、A/B/C/D 分级、置信度、质询、异常审计、复核工作台 |
| **Scene2 全链路智能指导工作台** | 4.2 | AI 教练工作台（VS Code 三栏）：**L1~L6 六阶段旅程**（创意激发→可行性验证→材料成型→打磨优化→进度追踪→智能推送）、章节编辑/诊断、版本管理（快照/分支/里程碑/diff）、动态待办 AI 生成、AI 教练对话组、项目档案、新建项目 |
| **Scene3 备赛数据驾驶舱** | 5.4 | 五大看板（报名/初筛/AI 运行/参赛者/跨届）+ AI 数据解读 + 异常预警 + Word 汇报生成 |

**确定性功能模块**（纯前端 mock，依据 `双创资料/文档/需求/0821-*` 细化设计）：

- 账号与权限（登录/注册/个人中心/团队/用户/角色/学校管理，RBAC + 多租户）
- 导师库与预约（检索/规则版匹配推荐/预约冲突检测/状态机/评价）
- 任务工单与看板预警（任务下发验收/提交反馈/指标快照/阈值预警）

## 技术栈

- **前端**：React 18 + Vite + TypeScript + Ant Design 5 + react-router（17 个路由）
- **后端**：FastAPI（Python 3.10，mambaforge base）+ SQLAlchemy
- **存储**：SQLite（`backend/data/shuangchuang.db`，16 张业务表）+ 材料文件系统
- **LLM**：OpenAI 兼容配置中心（当前 **volcano 火山方舟 DeepSeek V4 Flash**），`backend/.env` 切换预设，业务代码零改动

## 快速开始

```powershell
# 后端（backend/ 目录，单脚本起全栈 API :8000 + 前端 dist）
cd backend
C:\Users\ran.zhuang01\AppData\Local\mambaforge\python.exe run.py

# 前端开发模式（frontend/ 目录）
cd frontend
npm run dev        # http://localhost:5173，/api 代理到 :8000

# 前端构建（生产/演示，构建后由后端直接挂载）
npm run build
```

- 健康检查：`GET http://127.0.0.1:8000/api/health`（返回 `llmEnabled` / `activePreset`）
- 演示账号：`student1`（学生）/ `teacher1`（导师）/ `admin1`（校级）等，密码统一 `123456`

## 文档导航

- **仓库总览（AI 入口）**：`README_AGENT.md`；文档体系索引见 `docs/README_AGENT.md`
- **最新全貌**：`docs/项目交接-20260902.md`（新 agent 首选入口）
- **产品定义（业务唯一依据）**：`双创资料/文档/产品定义/高校双创赛事智能体-产品定义-定稿.md`（v1.2）
- **全链路指导开发方案**：`docs/全链路指导重构-开发方案.md`（里程碑 1/2/3 + 后续蓝图）
- **LLM 配置**：`backend/.env`（不入库），预设见 `backend/app/config/settings.py`