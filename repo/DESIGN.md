---
version: "1.0"
name: ShuangChuang-Smart-Agent-Design
description: >
  深空海军蓝暗色玻璃拟态的统一产品设计系统。双创赛事智能体 = 面向高校 OPC 双创孵化与双创赛事全生命周期的 AI 中枢，
  覆盖「项目挖掘 → 赛事培育 → 孵化转化」全链路。视觉 DNA 是"mission control at night"（夜间指挥舱）——
  深海军蓝径向渐变画布承载玻璃拟态卡片，indigo 为主品牌强调色，六维国标评分各拥语义色。
  三场景（智能遴选 / 全链路指导工作台 / 备赛驾驶舱）共用此设计语言；参赛者工作台为 VS Code 式三栏（左侧活动栏 + 中栏页签叠放 + 右侧 AI 对话常驻）。
  Typography 为 system-ui / PingFang SC 原生栈，计时器用等宽 tabular 数字。
colors:
  # ── Canvas & Surface ──────────────────────────────────────
  canvas: "#0b1020"
  canvas-top: "#111a3a"
  surface-card: "rgba(15,20,40,0.6)"
  surface-card-solid: "#0f1428"
  surface-elevated: "#1e2a45"
  surface-input: "rgba(30,42,69,0.6)"
  surface-overlay: "rgba(0,0,0,0.6)"

  # ── Border ────────────────────────────────────────────────
  border-default: "#1e293b"
  border-soft: "rgba(30,41,59,0.7)"
  border-focus: "#6366f1"

  # ── Text ──────────────────────────────────────────────────
  text-primary: "#f1f5f9"
  text-secondary: "#cbd5e1"
  text-muted: "#64748b"
  text-faint: "#334155"

  # ── Primary Accent — Indigo ───────────────────────────────
  primary: "#6366f1"
  primary-hover: "#818cf8"
  primary-muted: "rgba(99,102,241,0.15)"
  primary-border: "rgba(99,102,241,0.30)"

  # ── Semantic / State ──────────────────────────────────────
  success: "#34d399"
  warning: "#fbbf24"
  error: "#fb7185"
  info: "#38bdf8"

  # ── Six-Dimension Radar Colors ────────────────────────────
  dim-innovation: "#818cf8"
  dim-technical: "#38bdf8"
  dim-market: "#34d399"
  dim-team: "#fbbf24"
  dim-expression: "#f472b6"
  dim-social: "#a78bfa"
typography:
  display:
    fontFamily: "system-ui, PingFang SC, Microsoft YaHei, sans-serif"
    fontSize: 28px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.3px"
  title-lg:
    fontFamily: "system-ui, PingFang SC, Microsoft YaHei, sans-serif"
    fontSize: 20px
    fontWeight: 700
    lineHeight: 1.3
  title-md:
    fontFamily: "system-ui, PingFang SC, Microsoft YaHei, sans-serif"
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.4
  title-sm:
    fontFamily: "system-ui, PingFang SC, Microsoft YaHei, sans-serif"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.4
  body-md:
    fontFamily: "system-ui, PingFang SC, Microsoft YaHei, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.55
  body-sm:
    fontFamily: "system-ui, PingFang SC, Microsoft YaHei, sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.5
  caption:
    fontFamily: "system-ui, PingFang SC, Microsoft YaHei, sans-serif"
    fontSize: 11px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.5px"
  label-uppercase:
    fontFamily: "system-ui, PingFang SC, Microsoft YaHei, sans-serif"
    fontSize: 10px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "1px"
    textTransform: uppercase
  timer:
    fontFamily: "ui-monospace, JetBrains Mono, monospace"
    fontSize: 28px
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0"
    fontVariantNumeric: tabular-nums
  button:
    fontFamily: "system-ui, PingFang SC, Microsoft YaHei, sans-serif"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1
rounded:
  sm: 8px
  md: 10px
  lg: 12px
  xl: 16px
  "2xl": 20px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  "2xl": 32px
  section: 48px
shadows:
  card: "0 0 0 1px rgba(30,41,59,0.8)"
  glow-indigo: "0 0 24px rgba(99,102,241,0.12)"
  glow-rose: "0 0 24px rgba(251,113,133,0.12)"
  glow-amber: "0 0 24px rgba(251,191,36,0.12)"
animation:
  duration-fast: 150ms
  duration-base: 250ms
  duration-slow: 400ms
  easing-default: "cubic-bezier(0.4, 0, 0.2, 1)"
  easing-spring: "cubic-bezier(0.34, 1.56, 0.64, 1)"
components:
  # ── Global Shell ──────────────────────────────────────────
  app-shell:
    background: "radial-gradient(ellipse at top, {colors.canvas-top} 0%, {colors.canvas} 55%)"
    minHeight: 100vh
    textColor: "{colors.text-primary}"
  header:
    backgroundColor: transparent
    height: 64px
    padding: "0 24px"
  # ── Cards ─────────────────────────────────────────────────
  card:
    backgroundColor: "{colors.surface-card}"
    border: "1px solid {colors.border-default}"
    borderRadius: "{rounded.2xl}"
    backdropFilter: "blur(8px)"
    padding: 20px
  card-active:
    border: "1px solid {colors.primary}"
    backgroundColor: "rgba(99,102,241,0.05)"
  # ── Buttons ───────────────────────────────────────────────
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    borderRadius: "{rounded.xl}"
    padding: "10px 16px"
    hover-backgroundColor: "{colors.primary-hover}"
  button-ghost:
    backgroundColor: transparent
    textColor: "{colors.text-secondary}"
    border: "1px solid {colors.border-default}"
    borderRadius: "{rounded.xl}"
    hover-border: "1px solid #475569"
    hover-textColor: "{colors.text-primary}"
  button-danger:
    backgroundColor: transparent
    textColor: "{colors.error}"
    border: "1px solid {colors.border-default}"
    borderRadius: "{rounded.xl}"
  # ── Chips / Badges ────────────────────────────────────────
  chip:
    borderRadius: "{rounded.full}"
    padding: "2px 10px"
    typography: "{typography.caption}"
  chip-primary:
    backgroundColor: "{colors.primary-muted}"
    textColor: "{colors.primary-hover}"
    border: "1px solid {colors.primary-border}"
  chip-success:
    backgroundColor: "rgba(52,211,153,0.15)"
    textColor: "#6ee7b7"
    border: "1px solid rgba(52,211,153,0.30)"
  chip-warning:
    backgroundColor: "rgba(251,191,36,0.15)"
    textColor: "#fcd34d"
    border: "1px solid rgba(251,191,36,0.30)"
  chip-danger:
    backgroundColor: "rgba(251,113,133,0.10)"
    textColor: "#fca5a5"
    border: "1px solid rgba(251,113,133,0.30)"
  chip-neutral:
    backgroundColor: "rgba(71,85,105,0.30)"
    textColor: "{colors.text-secondary}"
    border: "1px solid rgba(100,116,139,0.40)"
  # ── Form Controls ─────────────────────────────────────────
  input:
    backgroundColor: "{colors.surface-input}"
    textColor: "{colors.text-primary}"
    border: "1px solid #334155"
    borderRadius: "{rounded.xl}"
    padding: "10px 12px"
    focus-border: "1px solid {colors.primary}"
  select:
    backgroundColor: "rgba(30,42,69,0.8)"
    textColor: "{colors.text-primary}"
    border: "1px solid #334155"
    borderRadius: "{rounded.xl}"
    padding: "10px 12px"
    focus-border: "1px solid {colors.primary}"
  # ── Progress / Timer ──────────────────────────────────────
  progress-bar:
    height: 6px
    backgroundColor: "#1e293b"
    borderRadius: "{rounded.full}"
    fill-normal: "{colors.primary}"
    fill-timeout: "{colors.error}"
  timer-display:
    typography: "{typography.timer}"
    color-normal: "{colors.text-primary}"
    color-timeout: "{colors.error}"
  # ── Chat Bubbles（AI 教练 / 评委对话）──────────────────────
  bubble-ai:
    backgroundColor: "rgba(30,41,59,0.70)"
    border: "1px solid rgba(51,65,85,0.70)"
    borderRadius: "0 16px 16px 16px"
    maxWidth: "100%"
  bubble-user:
    backgroundColor: "{colors.primary-muted}"
    borderRadius: "16px 0 16px 16px"
    maxWidth: "85%"
  bubble-streaming:
    cursor: "inline-block 2px 16px {colors.primary} animate-pulse"
  # ── VS Code 三栏工作台（全链路指导，我方旗舰交互）──────────
  three-panel-layout:
    backgroundColor: "transparent"
    leftSiderWidth: 240px
    middlePanelFlex: 1
    rightPanelWidth: 360px
  stage-timeline:
    # 顶栏 L1~L6 纯状态展示（不点击切换，意图下沉 AI 教练）
    active-color: "{colors.primary}"
    done-color: "{colors.success}"
    pending-color: "{colors.text-faint}"
  chapter-bar:
    # 12 章 BP 编辑器
    complete-color: "{colors.success}"
    weak-color: "{colors.warning}"
    missing-color: "{colors.error}"
    not-applicable-color: "{colors.text-faint}"
  score-bar:
    # 六维分数条（Scene1 / Scene2 共用）
    dimension-colors: "{colors.dim-*} reference"
    confidence-high: "{colors.success}"
    confidence-mid: "{colors.warning}"
    confidence-low: "{colors.error}"
  # ── 模拟答辩（吸收 模拟答辩模块DESIGN.md）────────────────
  score-ring:
    size: 132px
    strokeWidth: 10px
    track-color: "#1e293b"
    fill-excellent: "#34d399"   # ≥ 85
    fill-good: "#a3e635"        # ≥ 70
    fill-medium: "#fbbf24"      # ≥ 55
    fill-low: "#fb7185"         # < 55
  radar-chart:
    size: 300px
    rings: 4
    ring-color: "#334155"
    axis-color: "#1e293b"
    label-fontSize: 10.5px
  mode-icon-badge:
    size: 44px
    borderRadius: "{rounded.xl}"
    fontSize: 22px
  voice-recording-bar:
    backgroundColor: "rgba(251,113,133,0.05)"
    border: "1px solid rgba(251,113,133,0.30)"
    borderRadius: "{rounded.xl}"
    height: 36px
  voice-waveform:
    barWidth: 2px
    barColor: "{colors.error}"
    barCount: 5
    animationDuration: 600ms
  drawer:
    backgroundColor: "#0d1424"
    border-left: "1px solid {colors.border-default}"
    width: 448px
    overlay-background: "rgba(0,0,0,0.60)"
    overlay-backdropFilter: "blur(4px)"
  round-card:
    backgroundColor: "rgba(15,20,40,0.40)"
    border: "1px solid {colors.border-default}"
    borderRadius: "{rounded.2xl}"
    summary-padding: 16px
    round-badge:
      backgroundColor: "{colors.primary-muted}"
      textColor: "{colors.primary-hover}"
      size: 32px
      borderRadius: "{rounded.lg}"
      fontWeight: 700
    suggested-answer:
      backgroundColor: "rgba(99,102,241,0.05)"
      border: "1px solid rgba(99,102,241,0.20)"
      borderRadius: "{rounded.xl}"
      padding: 12px
  action-bar-followup:
    backgroundColor: "rgba(251,113,133,0.15)"
    textColor: "{colors.error}"
    borderRadius: "{rounded.xl}"
    padding: "10px 16px"
  action-bar-next:
    backgroundColor: "{colors.primary-muted}"
    textColor: "{colors.primary-hover}"
    borderRadius: "{rounded.xl}"
    padding: "10px 16px"
  action-bar-wrapup:
    backgroundColor: "rgba(52,211,153,0.15)"
    textColor: "#6ee7b7"
    borderRadius: "{rounded.xl}"
    padding: "10px 16px"
---

# 统一设计系统（Deep Space Navy Dark Glassmorphism）

> **版本**：v1.0（2026-09-03）｜**状态**：active
> **依据**：《模拟答辩模块DESIGN.md》（副本视觉基座）+《产品定义-定稿 v1.2》+《PRD v1.0》+ 我方三场景实测
> **配套**：`RanZhuang/2026-09/shuangchuang_design_v1_我方/`（需求/角色/ADR 全量）
> **适用范围**：`shuangchuang-ai_ZR` 全部前端（17 路由）

---

## 一、Visual Theme & Atmosphere

**"夜间指挥舱"（mission control at night）**：深海军蓝径向渐变画布（`#0b1020` → 顶部 `#111a3a` 光源）承载玻璃拟态卡片（`backdrop-blur(8px)` + 半透明 `rgba` 底 + 发丝线 `#1e293b` 边框）。**全暗色，无亮色模式。**

三个产品语境对应三种屏幕节奏（与模拟答辩三屏同构，我方已有实现衔接）：

| 语境 | 我方载体 | 氛围 |
|------|---------|------|
| 管理者数据（遴选/驾驶舱） | `/scene1` `/scene3` | 高信号数据密集：指标卡 + 表格 + 雷达 + 看板 |
| 参赛者工作台（全链路指导） | `/guidance` | VS Code 三栏专注：左侧活动栏 + 中栏编辑 + 右侧 AI 对话常驻 |
| 训练舱（模拟答辩，规划） | 待建 | 对话驱动的沉浸式：评委泡泡 + 计时器 + 波形 |

**品牌词汇**：indigo 主强调色（`#6366f1`）、深空海军蓝画布（`#0b1020`）、径向顶部光晕（`#111a3a`）、六维语义色（创新/技术/市场/团队/表达/社会各一色）。模式切换（L1~L6 / 六种训练模式）= 进入同一个「舱」的不同「房间」。

**动效原则**：卡片 hover 上浮（`translateY(-3px)` + spring）、抽屉右侧滑入、气泡淡入上浮、流式光标脉冲。动效服务信息层级，不为装饰。

---

## 二、Color Palette & Roles

### Canvas & Surface

| Token | 值 | 角色 |
|-------|-----|------|
| `{colors.canvas}` | `#0b1020` | 页面最深地板（body 背景） |
| `{colors.canvas-top}` | `#111a3a` | 径向渐变顶部（顶部光源氛围） |
| `{colors.surface-card}` | `rgba(15,20,40,0.6)` | 玻璃卡片底（恒配 `backdrop-blur(8px)`） |
| `{colors.surface-elevated}` | `#1e2a45` | 头像底/内联代码/内层浮起面板 |
| `{colors.surface-input}` | `rgba(30,42,69,0.6)` | 表单控件底（textarea/select/input） |
| `{colors.surface-overlay}` | `rgba(0,0,0,0.6)` | 抽屉遮罩 |

### Text

| Token | 值 | 角色 |
|-------|-----|------|
| `{colors.text-primary}` | `#f1f5f9` | 标题、激活标签、对话消息 |
| `{colors.text-secondary}` | `#cbd5e1` | 正文、按钮标签、次级信息 |
| `{colors.text-muted}` | `#64748b` | 时间戳、元信息、占位符 |
| `{colors.text-faint}` | `#334155` | 分割文本、水印级标签 |

### Primary Accent（Indigo）

| Token | 值 | 角色 |
|-------|-----|------|
| `{colors.primary}` | `#6366f1` | 品牌主色——主 CTA、focus 环、进度条、标准模式身份 |
| `{colors.primary-hover}` | `#818cf8` | hover 态 + 暗底高对比文本 |
| `{colors.primary-muted}` | `rgba(99,102,241,0.15)` | chip/badge 填充、激活卡片底 |
| `{colors.primary-border}` | `rgba(99,102,241,0.30)` | indigo 卡片发丝边、focus 环 |

### Semantic / State

`success #34d399` / `warning #fbbf24` / `error #fb7185` / `info #38bdf8` —— 用于状态 chip、置信度、异常告警、计时超时。

### Six-Dimension Radar Colors（六维国标评分，产品级语义）

| 维度 | 色 | 用途 |
|------|-----|------|
| 创新性 | `#818cf8` indigo | Scene1 初筛 / Scene2 评分 / 答辩雷达 |
| 技术可行性 | `#38bdf8` sky | 同上 |
| 市场与商业价值 | `#34d399` emerald | 同上 |
| 团队匹配度 | `#fbbf24` amber | 同上传 |
| 材料完整性与表达质量 | `#f472b6` rose | 同上传 |
| 社会价值 | `#a78bfa` violet | 同上传 |

---

## 三、Typography Rules

**字体栈**：`system-ui, PingFang SC, Microsoft YaHei, sans-serif`——macOS/iOS（苹方）、Windows（雅黑）、拉丁系统原生渲染，**零外部字体依赖**。

**等宽计时器**：`ui-monospace, JetBrains Mono, monospace` + `font-variant-numeric: tabular-nums`——现场训练的倒计时是焦点元素，等宽数字防跳动。

### 层级表

| Token | 字号/字重 | 用途 |
|-------|----------|------|
| `{typography.display}` | 28px/700，-0.3px | 页面/区块大标题——稀有，仅应用名/报告头部 |
| `{typography.title-lg}` | 20px/700 | 卡片主标题、项目名 |
| `{typography.title-md}` | 16px/600 | 卡内区块标题 |
| `{typography.title-sm}` | 14px/600 | 子区块标签、配置抽屉区块标题 |
| `{typography.body-md}` | 14px/400 | 全部正文、对话消息、描述 |
| `{typography.body-sm}` | 12px/400 | 元信息、时间戳、字数统计 |
| `{typography.caption}` | 11px/500，0.5px | chip/badge 标签、进度注解 |
| `{typography.label-uppercase}` | 10px/600，1px 大写 | 区块分隔标签（「评委」「训练进度」） |
| `{typography.timer}` | 28px/700 tabular-mono | 倒计时钟——现场训练视觉锚点 |
| `{typography.button}` | 14px/500 | 全部按钮标签 |

---

## 四、Component Stylings（统一组件语汇）

> 我方已有实现组件（AntD 基础上）按此 token 对齐；规划组件（模拟答辩）直接照 token 实现。所有颜色引用 `{ref}`，**不内联 hex**。

### 跨场景通用

| 组件 | Token 组 | 状态 |
|------|---------|------|
| Card / Card-active | `{component.card}` `{component.card-active}` | ✅ 全场景 |
| Button primary / ghost / danger | `{component.button-*}` | ✅ 全场景 |
| Chip（primary/success/warning/danger/neutral） | `{component.chip-*}` | ✅ 全场景 |
| Input / Textarea / Select | `{component.input}` 等 | ✅ 全场景 |
| Progress-bar / Score-bar | `{component.progress-bar}` `{component.score-bar}` | ✅ Scene1/2 |
| Chat bubbles（AI/用户/流式） | `{component.bubble-*}` | ✅ Scene2 右栏；答辩复用 |

### 场景专属

| 组件 | Token 组 | 载体 |
|------|---------|------|
| Three-panel-layout（三栏） | `{component.three-panel-layout}` | ✅ `/guidance` |
| Stage-timeline（L1~L6 状态条） | `{component.stage-timeline}` | ✅ `/guidance` 顶栏 |
| Chapter-bar（12 章编辑器） | `{component.chapter-bar}` | ✅ `/guidance` 中栏 |
| Score-ring / Radar-chart | `{component.score-ring}` `{component.radar-chart}` | 规划（答辩报告） |
| Mode-icon-badge / Voice-waveform | `{component.mode-icon-badge}` `{component.voice-*}` | 规划（答辩） |
| Drawer（配置舱） | `{component.drawer}` | ✅（Scene1 配置抽屉同构） |
| Round-card（逐轮复盘） | `{component.round-card}` | 规划（答辩报告） |
| Action-bar（决策条） | `{component.action-bar-*}` | 规划（答辩会话） |

---

## 五、Layout Principles

- **最大内容宽度**：1280px（7xl）居中；`px-4`（移动）/ `px-6`（sm+）
- **栅格**：1 列移动 → 2 列 sm → 3 列 lg（项目/模式选择卡）；会话视图 2 列左 + 1 列右；报告视图 1 列堆叠内部 2 列
- **三栏工作台**（全链路指导）：左活动栏 240px（可折叠可拉伸）+ 中栏弹性 + 右 AI 对话 360px 常驻
- **间距**：区块间 `24/32px`；卡片内 `p-5`（20px）标准、`p-6`（24px）突出卡（评分头/雷达）；chip `px-2.5 py-0.5`
- **留白哲学**：暗色画布上让卡片呼吸——玻璃卡间距充足，信息密度靠卡片内部而非全局堆叠

---

## 六、Depth & Elevation

- **表面层级**（暗底由深至浅）：canvas `#0b1020` → card `rgba(15,20,40,0.6)` → elevated `#1e2a45` → overlay `rgba(0,0,0,0.6)`
- **阴影体系**：卡片 `0 0 0 1px rgba(30,41,59,0.8)`（发丝线）+ 可选 glow（`0 0 24px rgba(99,102,241,0.12)` 等，按模式色）
- **玻璃拟态铁律**：半透明卡必须配 `backdrop-blur(8px)`；纯色卡（`surface-card-solid`）仅用于需要遮挡底层的场景

---

## 七、Do's and Don'ts（设计护栏）

| Do ✅ | Don't ❌ |
|-------|---------|
| indigo `#6366f1` 只给主 CTA、focus 环、进度条、标准模式身份 | 不要到处刷 indigo（护栏——只用于主行动） |
| 六维语义色固定映射（创新=indigo 系 #818cf8 等） | 不要按心情改维度色 |
| 玻璃卡恒配 backdrop-blur | 不要让半透明卡无模糊直接叠在渐变上 |
| 暗色文本层级用 4 级（primary/secondary/muted/faint） | 不要用纯黑 `#000` 于任何文本 |
| 三栏工作台：对话常驻右侧、状态只在顶栏展示 | 不要把对话做成独立页面、不要用顶栏阶段条强制切换 |
| 动效 150/250/400ms + spring 上浮 | 不要给核心操作加超过 400ms 的动效 |
| 计时器用等宽 tabular 数字 | 不要在倒计时上用普通比例数字（会抖动） |
| 任何评分配「为什么」与原文引用（可解释） | 不要黑箱打分（置信度 + 依据必须可见） |
| 状态/置信度必须用语义色 chip 表达 | 不要让用户从裸数字猜状态 |
| 决策类操作（复核/采纳）要显式、可回退 | 不要让「未采纳」快照悄悄生效（副本 ADR-010 护栏） |

---

## 八、Responsive Behavior

- **断点**：移动 1 列 → sm 2 列 → lg 3 列（与 Tailwind 4 断点对齐）
- **三栏工作台降级**：lg 以下左活动栏收为图标栏（可折叠）；右 AI 对话收为底部抽屉或浮动按钮；中栏保持
- **触控目标**：至少 40px 高（按钮/芯片行内高度）
- **答辩会话**：移动端 1 列堆叠（对话 → 输入 → 信息面板），计时器保持顶部可及
- **折叠策略**：配置抽屉/右栏在窄屏默认收起，由顶栏图标唤起

---

## 九、Agent Prompt Guide（给 AI 编码代理）

**取色速查**：暗画布 `#0b1020`、卡片 `rgba(15,20,40,0.6)+blur(8px)`、主色 indigo `#6366f1`、hover `#818cf8`、语义成功/警告/错误 `#34d399/#fbbf24/#fb7185`、六维评分 `#818cf8/#38bdf8/#34d399/#fbbf24/#f472b6/#a78bfa`。

**可直接用的 prompt**：

> 「按本仓库根目录 DESIGN.md 的设计系统实现/改造 <页面>。要求：深空海军蓝径向渐变画布、玻璃拟态卡片配 backdrop-blur、indigo 主色只用于主 CTA 与 focus、文本 4 级层级、六维评分用对应语义色、状态用语义 chip、动效 ≤400ms。所有颜色引用 token 不内联 hex。请先读 DESIGN.md 的 YAML frontmatter。」

**迭代指引**：改视觉时先查 `DESIGN.md` YAML token；新增组件先看 `components.md` 是否已有对应 token（我方 design 包）；拿不准时在 `RanZhuang/2026-09/shuangchuang_design_v1_我方/` 找对应角色 module 的 Spec。

---

## 十、Known Gaps（诚实标注未覆盖）

- 现有 17 个路由页面尚未按本规范改造（当前 AntD 亮色），**暗色化是在排期内的迁移工作**
- 模拟答辩模块 UI 未实现（只有 DESIGN token），是第一个「原生按本规范实现」的候选
- 图标体系：统一用 `@ant-design/icons`（现有），未做品牌图标库
- 仪表盘图表（scene3）当前为简单 div 条形（DistBar），未引入图表库，暗色化时按 token 对齐即可