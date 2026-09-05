import React, { useState } from 'react';
import {
  Button,
  Tag,
  Tooltip,
  Modal,
  message,
  Tabs,
  Badge,
} from 'antd';
import {
  FileTextOutlined,
  FilePptOutlined,
  VideoCameraOutlined,
  SafetyCertificateOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  CopyOutlined,
  EyeOutlined,
  SearchOutlined,
  CloudUploadOutlined,
  ThunderboltOutlined,
  RightOutlined,
  LeftOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ShareAltOutlined,
  ApartmentOutlined,
  CompassOutlined,
} from '@ant-design/icons';
import { ProjectFileItem } from '../../types/guidance';

interface ProjectFileViewerProps {
  file: ProjectFileItem | null;
  allFiles: ProjectFileItem[];
  onSelectFile: (file: ProjectFileItem) => void;
  onOpenBpEditor?: () => void;
  onUploadClick?: () => void;
  renderMarkdown: (md: string) => React.ReactNode;
}

export const ProjectFileViewer: React.FC<ProjectFileViewerProps> = ({
  file,
  allFiles,
  onSelectFile,
  onOpenBpEditor,
  onUploadClick,
  renderMarkdown,
}) => {
  // PPT 演示预览状态
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  // 视频播放模拟状态
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(24);
  // AI 智能分析抽屉/弹窗
  const [aiAnalysisVisible, setAiAnalysisVisible] = useState(false);
  const [hubCategory, setHubCategory] = useState<'all' | 'text' | 'binary' | 'readonly'>('all');
  const [hubSearch, setHubSearch] = useState('');

  // 格式化文件大小
  const formatSize = (bytes: number): string => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  // 根据文件类型返回图标
  const getFileIcon = (item: ProjectFileItem, size = 18) => {
    const ext = item.ext || item.name.split('.').pop()?.toLowerCase() || '';
    if (ext === 'md' || ext === 'txt') {
      return <FileTextOutlined style={{ fontSize: size, color: '#1677ff' }} />;
    }
    if (ext === 'pptx' || ext === 'ppt') {
      return <FilePptOutlined style={{ fontSize: size, color: '#fa8c16' }} />;
    }
    if (ext === 'mp4' || ext === 'mov' || ext === 'avi') {
      return <VideoCameraOutlined style={{ fontSize: size, color: '#722ed1' }} />;
    }
    if (ext === 'pdf') {
      if (item.fileType === 'readonly') {
        return <SafetyCertificateOutlined style={{ fontSize: size, color: '#52c41a' }} />;
      }
      return <FileTextOutlined style={{ fontSize: size, color: '#ff4d4f' }} />;
    }
    if (ext === 'step' || ext === 'cad') {
      return <ApartmentOutlined style={{ fontSize: size, color: '#13c2c2' }} />;
    }
    return <FileTextOutlined style={{ fontSize: size, color: '#8c8c8c' }} />;
  };

  const copyToClipboard = (text: string, title = '内容') => {
    navigator.clipboard?.writeText(text);
    message.success(`已成功复制${title}到剪贴板`);
  };

  const handleDownload = (item: ProjectFileItem) => {
    message.success(`已开始下载文件：${item.name} (${formatSize(item.size)})`);
  };

  // 幻灯片 Mock 数据（10页完整竞演）
  const pptSlides = [
    {
      title: '01. 封面与破题：中国3亿人的深睡危机',
      desc: '成人睡眠障碍率高达38.2%，入睡难、易早醒成为高压人群常态。',
      notes: '演讲者提示：开场抛出触目惊心的人口普查数据，迅速吸引评委对千亿睡眠经济赛道的注意力。',
      bulletPoints: ['中国睡眠障碍人口突破 3 亿', '90后与00后熬夜失眠人群占比激增至 64%', '现有手环被动监测无法解决实质入睡痛点'],
    },
    {
      title: '02. 痛点洞察：为什么现有方案纷纷失灵？',
      desc: '手环只有冷冰冰的数据监测；褪黑素存在耐药性；白噪音千篇一律无法自适应。',
      notes: '演讲者提示：直接切入竞品痛点，树立“必须由被动监测跨越到主动闭环干预”的核心立论。',
      bulletPoints: ['手环光电PPG误差 > 25%，且属于“事后告知”', '处方安眠药具备心理成瘾与白天嗜睡副作用', '传统隔音耳塞与普通眼罩无法诱导脑电慢波'],
    },
    {
      title: '03. 革命性产品：易休闭环智适应睡眠眼罩',
      desc: '集“高灵敏微弱脑电采集”与“声波同频共振干预”于一体的消费级轻量化助眠终端。',
      notes: '演讲者提示：展示实机照片与48g羽感参数，突出工业设计的极致舒适性。',
      bulletPoints: ['48g 极致超轻机身，纳米真丝无感遮光贴合', '额叶双侧对称 3 通道高灵敏干电极', '超低功耗低噪芯片，单次充电续航长达 16 小时'],
    },
    {
      title: '04. 核心硬科技：高信噪比柔性干电极突破',
      desc: '国家发明专利授权技术，突破高头皮阻抗下微伏级脑电提取世界级难题。',
      notes: '演讲者提示：展示与三甲医院PSG多导睡眠仪对比波形，突出信噪比提升3.8倍。',
      bulletPoints: ['发明专利 ZL202410588219.8，学生第一发明人', '自适应微接触力学结构，躺卧翻滚不脱落', '硬件共模抑制比 CMRR 突破 118dB，免去导电膏涂抹'],
    },
    {
      title: '05. 算法闭环：实时脑电分期与粉红噪音共振',
      desc: '端云协同实时推算N1/N2/深睡期，自适应调节40Hz-0.5Hz脑电促眠声波。',
      notes: '演讲者提示：演示闭环干预链路：脑波变慢声波变柔，让神经元自然同频入眠。',
      bulletPoints: ['TinyML 轻量化端侧决策树，延迟低于 18ms', '与 PSG 临床金标准睡眠分期吻合率高达 94.2%', '自研双耳差拍与动态粉红噪音，入睡潜伏期缩短60.1%'],
    },
    {
      title: '06. 临床循证：三甲医院双盲对照有效率89.4%',
      desc: '浙江大学医学院附属第一医院与上海长征医院 200 例双盲临床实测验证。',
      notes: '演讲者提示：出示三甲医院盖章临床报告，证明医疗级有效性与学术真实性。',
      bulletPoints: ['入睡潜伏期平均由 54.6 分钟缩短至 21.8 分钟', '夜间觉醒次数由平均 3.2 次降至 0.8 次', '获得国家认监委 CMA & CNAS 权威全项检测认证'],
    },
    {
      title: '07. 商业闭环：DTC消费级与院线科研双轮驱动',
      desc: '硬件一次性销售 + 数字化睡眠顾问订阅年费 + 医院科研机构批量采购。',
      notes: '演讲者提示：突出单客经济模型 LTV/CAC 达 4.87 倍，毛利率 68.5%。',
      bulletPoints: ['标准版零售价 ¥499，单台硬件毛利达 ¥341.8', '已签约浙大一院等3家医院意向采购金额 120 万元', '线上天猫/京东旗舰店与私域高净值助眠社群全渠道布局'],
    },
    {
      title: '08. 财务预测与融资需求：3年营收过亿',
      desc: '当前寻求天使轮融资 800 万元，出让 10% 股权，资金用于产线扩产与拿证。',
      notes: '演讲者提示：三张财务报表严密推演，预期次年实现盈亏平衡。',
      bulletPoints: ['2025年实际销售额 420 万元，已验证商业闭环', '2026年预计营收 2400 万元，2027年破 1.1 亿元', '800万资金分配：研发与算力40%、临床拿证25%、渠道35%'],
    },
    {
      title: '09. 顶尖跨学科团队：医工交叉创客基因',
      desc: '脑机接口博士领衔，生医工硕士、心理学硕士与MBA商科成员紧密协同。',
      notes: '演讲者提示：强调学生绝对控股85%，产学研合规备案无争议，指导教师为长江学者。',
      bulletPoints: ['项目负责人陈逸飞以第一发明人持有核心专利', '团队核心骨干曾获ACM国际金奖、挑战杯全国特等奖', '指导教师王建民教授为国家级重点实验室主任'],
    },
    {
      title: '10. 社会价值与愿景：科技向善，护佑深睡',
      desc: '落实健康中国2030，让每一个拼搏奋斗的中国人都享有一夜好眠。',
      notes: '演讲者提示：升华项目格局与时代情怀，自信结束竞演并诚挚致谢。',
      bulletPoints: ['以普惠科技降维打破国外高端睡眠仪器数万元价格垄断', '累计开展高校与社区公益睡眠义诊超 50 场', '愿天下拼搏者，夜夜皆安眠！'],
    },
  ];

  // ----------------------------------------------------
  // 1. 如果没有选定文件，渲染【项目全文件中心 / 资料库概览】
  // ----------------------------------------------------
  if (!file) {
    const filteredHubFiles = allFiles.filter((f) => {
      const matchCat =
        hubCategory === 'all'
          ? true
          : hubCategory === 'text'
          ? f.fileType === 'text'
          : hubCategory === 'binary'
          ? f.fileType === 'binary'
          : f.fileType === 'readonly';
      const matchSearch =
        !hubSearch ||
        f.name.toLowerCase().includes(hubSearch.toLowerCase()) ||
        f.category?.toLowerCase().includes(hubSearch.toLowerCase()) ||
        f.description?.toLowerCase().includes(hubSearch.toLowerCase());
      return matchCat && matchSearch;
    });

    const totalBytes = allFiles.reduce((acc, cur) => acc + cur.size, 0);

    return (
      <div style={{ padding: '24px 28px', maxWidth: 1120, margin: '0 auto' }}>
        {/* 顶部总览卡片 */}
        <div
          style={{
            background: 'linear-gradient(135deg, #f0f7ff 0%, #e6f4ff 100%)',
            border: '1px solid #bae0ff',
            borderRadius: 12,
            padding: '20px 24px',
            marginBottom: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 24 }}>📁</span>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0958d9' }}>
                项目资料全文件管理中心
              </h2>
              <Tag color="processing">方案 A：全文件注册表</Tag>
            </div>
            <div style={{ fontSize: 13, color: 'rgba(0,0,0,0.65)', marginTop: 6, maxWidth: 640 }}>
              覆盖核心商业计划书、实测访谈、技术算法图纸、路演汇报PPT/VCR大文件，以及国家专利、中试质检报告等权威佐证。支持在线全屏预览与
              AI 智能向量检索。
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {onUploadClick && (
              <Button type="primary" icon={<CloudUploadOutlined />} onClick={onUploadClick}>
                上传新材料
              </Button>
            )}
            <Button
              icon={<DownloadOutlined />}
              onClick={() => message.success('已打包当前项目的全套16件国赛申报材料 (ZIP 格式，大小 228.4MB)')}
            >
              一键打包归档包
            </Button>
          </div>
        </div>

        {/* 统计指标行 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 20 }}>
          <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 10, padding: '14px 18px' }}>
            <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>文件总数</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#1677ff', marginTop: 4 }}>
              {allFiles.length} <span style={{ fontSize: 13, fontWeight: 'normal', color: 'rgba(0,0,0,0.45)' }}>份材料</span>
            </div>
            <div style={{ fontSize: 11, color: '#52c41a', marginTop: 4 }}>全量材料格式符合国赛标准</div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 10, padding: '14px 18px' }}>
            <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>存储容量占用</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#722ed1', marginTop: 4 }}>
              {formatSize(totalBytes)}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)', marginTop: 4 }}>大文件保留核心最新版</div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 10, padding: '14px 18px' }}>
            <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>权威佐证资质</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#52c41a', marginTop: 4 }}>
              7 <span style={{ fontSize: 13, fontWeight: 'normal', color: 'rgba(0,0,0,0.45)' }}>件红章背书</span>
            </div>
            <div style={{ fontSize: 11, color: '#52c41a', marginTop: 4 }}>国家专利 / CMA检测 / 三甲意向</div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 10, padding: '14px 18px' }}>
            <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>AI 知识库索引状态</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#fa8c16', marginTop: 4 }}>
              100% <span style={{ fontSize: 13, fontWeight: 'normal', color: 'rgba(0,0,0,0.45)' }}>已就绪</span>
            </div>
            <div style={{ fontSize: 11, color: '#1677ff', marginTop: 4 }}>支持 AI 教练全文跨材料检索</div>
          </div>
        </div>

        {/* 筛选与搜索工具条 */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { key: 'all', label: `全部文件 (${allFiles.length})` },
              { key: 'text', label: `可编辑文本 (${allFiles.filter((f) => f.fileType === 'text').length})` },
              { key: 'binary', label: `大文件演示 (${allFiles.filter((f) => f.fileType === 'binary').length})` },
              { key: 'readonly', label: `权威佐证 (${allFiles.filter((f) => f.fileType === 'readonly').length})` },
            ].map((tab) => (
              <Button
                key={tab.key}
                size="small"
                type={hubCategory === tab.key ? 'primary' : 'default'}
                onClick={() => setHubCategory(tab.key as any)}
              >
                {tab.label}
              </Button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#f5f5f5',
                padding: '4px 10px',
                borderRadius: 6,
                border: '1px solid #d9d9d9',
              }}
            >
              <SearchOutlined style={{ color: 'rgba(0,0,0,0.45)', marginRight: 6 }} />
              <input
                placeholder="搜索文件名称、分类、描述..."
                value={hubSearch}
                onChange={(e) => setHubSearch(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: 12,
                  width: 200,
                }}
              />
            </div>
          </div>
        </div>

        {/* 文件列表网格 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 }}>
          {filteredHubFiles.map((item) => (
            <div
              key={item.id || item.name}
              onClick={() => onSelectFile(item)}
              style={{
                background: '#fff',
                border: '1px solid #e8e8e8',
                borderRadius: 10,
                padding: '14px 16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#1677ff';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(22,119,255,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e8e8e8';
                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.03)';
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: '#f5f5f5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {getFileIcon(item, 20)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 13,
                        color: 'rgba(0,0,0,0.85)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={item.name}
                    >
                      {item.name}
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                      {item.category && <Tag color="blue">{item.category}</Tag>}
                      {item.badge && <Tag color="green">{item.badge}</Tag>}
                      {item.versionRef && <Tag color="cyan">{item.versionRef}</Tag>}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: 'rgba(0,0,0,0.55)',
                    marginTop: 8,
                    lineHeight: 1.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {item.description || '暂无描述'}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 12,
                  paddingTop: 8,
                  borderTop: '1px solid #f0f0f0',
                  fontSize: 11.5,
                  color: 'rgba(0,0,0,0.45)',
                }}
              >
                <span>
                  📦 {formatSize(item.size)} · 🕐 {item.updatedAt ? item.updatedAt.slice(5, 16) : '--'}
                </span>
                <Button size="small" type="link" icon={<EyeOutlined />}>
                  查看详情
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // 2. 如果选定了具体文件，渲染该文件的专属富预览视图
  // ----------------------------------------------------
  const ext = file.ext || file.name.split('.').pop()?.toLowerCase() || '';
  const isPpt = ext === 'pptx' || ext === 'ppt';
  const isVideo = ext === 'mp4' || ext === 'mov';
  const isPdf = ext === 'pdf';
  const isStep = ext === 'step';
  const isMarkdown = ext === 'md' || ext === 'txt';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 顶部文件信息导航栏 */}
      <div
        style={{
          background: '#fff',
          borderBottom: '1px solid #e8e8e8',
          padding: '12px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: '#f0f5ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {getFileIcon(file, 20)}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'rgba(0,0,0,0.88)' }}>
                {file.name}
              </span>
              {file.category && <Tag color="blue">{file.category}</Tag>}
              {file.badge && <Tag color="green">{file.badge}</Tag>}
              {file.versionRef && <Tag color="cyan">版本：{file.versionRef}</Tag>}
              {file.readonly && <Tag color="default">只读佐证附件</Tag>}
            </div>
            <div style={{ fontSize: 11.5, color: 'rgba(0,0,0,0.45)', marginTop: 3 }}>
              大小：<span style={{ fontWeight: 600 }}>{formatSize(file.size)}</span>
              {file.author && <> · 出具方/责任人：{file.author}</>}
              {file.updatedAt && <> · 更新时间：{file.updatedAt}</>}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Button
            size="small"
            icon={<ThunderboltOutlined />}
            style={{ color: '#722ed1', borderColor: '#d3adf7' }}
            onClick={() => setAiAnalysisVisible(true)}
          >
            AI 要点提炼
          </Button>
          <Tooltip title="下载原始文件">
            <Button size="small" icon={<DownloadOutlined />} onClick={() => handleDownload(file)}>
              下载
            </Button>
          </Tooltip>
          <Tooltip title="复制文件名与引用路径">
            <Button size="small" icon={<CopyOutlined />} onClick={() => copyToClipboard(`/${file.name}`, '文件路径')} />
          </Tooltip>
        </div>
      </div>

      {/* 中部核心文件视图容器 */}
      <div style={{ flex: 1, overflowY: 'auto', background: '#fafafa', padding: '20px 24px' }}>
        {/* === 场景 A: PPT 幻灯片专属互动检视器 === */}
        {isPpt && (
          <div style={{ maxWidth: 980, margin: '0 auto' }}>
            {/* 幻灯片主体展示卡片 */}
            <div
              style={{
                background: '#fff',
                border: '1px solid #e8e8e8',
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  background: 'linear-gradient(135deg, #1f1f1f 0%, #303030 100%)',
                  padding: '12px 18px',
                  color: '#fff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FilePptOutlined style={{ color: '#fa8c16', fontSize: 18 }} />
                  <span style={{ fontWeight: 600, fontSize: 13 }}>
                    第 {currentSlideIndex + 1} / {pptSlides.length} 页：{pptSlides[currentSlideIndex].title}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button
                    size="small"
                    ghost
                    icon={<LeftOutlined />}
                    disabled={currentSlideIndex === 0}
                    onClick={() => setCurrentSlideIndex((i) => Math.max(0, i - 1))}
                  >
                    上一页
                  </Button>
                  <Button
                    size="small"
                    ghost
                    icon={<RightOutlined />}
                    disabled={currentSlideIndex === pptSlides.length - 1}
                    onClick={() => setCurrentSlideIndex((i) => Math.min(pptSlides.length - 1, i + 1))}
                  >
                    下一页
                  </Button>
                </div>
              </div>

              {/* 模拟 16:9 高清 PPT 投影画面 */}
              <div
                style={{
                  aspectRatio: '16/9',
                  background: 'linear-gradient(135deg, #0b1a30 0%, #173259 100%)',
                  color: '#fff',
                  padding: '36px 44px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* 装饰水印背景 */}
                <div
                  style={{
                    position: 'absolute',
                    right: -20,
                    bottom: -30,
                    fontSize: 180,
                    opacity: 0.05,
                    pointerEvents: 'none',
                    userSelect: 'none',
                  }}
                >
                  <CompassOutlined />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <Tag color="cyan">全国总决赛现场汇报课件 · 8分钟竞演版</Tag>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                      Slide {currentSlideIndex + 1} of {pptSlides.length}
                    </span>
                  </div>
                  <h1 style={{ fontSize: 28, margin: 0, fontWeight: 700, color: '#e6f4ff', letterSpacing: 0.5 }}>
                    {pptSlides[currentSlideIndex].title}
                  </h1>
                  <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', marginTop: 10, maxWidth: 680 }}>
                    {pptSlides[currentSlideIndex].desc}
                  </p>
                </div>

                {/* 核心要点要件展示 */}
                <div
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    borderRadius: 8,
                    padding: '16px 20px',
                    backdropFilter: 'blur(4px)',
                    border: '1px solid rgba(255,255,255,0.12)',
                  }}
                >
                  <div style={{ fontSize: 12, color: '#69b1ff', fontWeight: 600, marginBottom: 8 }}>
                    ★ 核心论证支撑要点：
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                    {pptSlides[currentSlideIndex].bulletPoints.map((bp, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          fontSize: 13,
                          color: '#f0f5ff',
                        }}
                      >
                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                        <span>{bp}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 幻灯片底标 */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 11,
                    color: 'rgba(255,255,255,0.4)',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    paddingTop: 10,
                  }}
                >
                  <span>项目：易休智能睡眠眼罩 (国赛金奖候选)</span>
                  <span>汇报人：陈逸飞 · 脑机接口博士</span>
                </div>
              </div>

              {/* 演说手卡逐字稿与导师点拨 */}
              <div style={{ padding: '16px 20px', background: '#fff7e6', borderTop: '1px solid #ffd591' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: '#d46b08', fontSize: 13 }}>
                  <span>🎙️ 现场汇报逐字稿备注与教练防守提示：</span>
                </div>
                <div style={{ fontSize: 13, color: '#873800', marginTop: 6, lineHeight: 1.6 }}>
                  {pptSlides[currentSlideIndex].notes}
                </div>
              </div>
            </div>

            {/* 底部缩略图选择托盘 */}
            <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(0,0,0,0.65)', marginBottom: 10 }}>
                📑 幻灯片全页跳转导航（点击快速切换）
              </div>
              <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6 }}>
                {pptSlides.map((s, idx) => (
                  <div
                    key={idx}
                    onClick={() => setCurrentSlideIndex(idx)}
                    style={{
                      width: 140,
                      flexShrink: 0,
                      cursor: 'pointer',
                      borderRadius: 6,
                      border: currentSlideIndex === idx ? '2px solid #1677ff' : '1px solid #e8e8e8',
                      background: currentSlideIndex === idx ? '#e6f4ff' : '#fafafa',
                      padding: 8,
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 700, color: currentSlideIndex === idx ? '#1677ff' : '#595959' }}>
                      P{idx + 1}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: 'rgba(0,0,0,0.65)',
                        marginTop: 4,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={s.title}
                    >
                      {s.title.replace(/^\d+\.\s*/, '')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* === 场景 B: 视频 VCR 专属超清播放器 === */}
        {isVideo && (
          <div style={{ maxWidth: 880, margin: '0 auto' }}>
            <div
              style={{
                background: '#fff',
                border: '1px solid #e8e8e8',
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
              }}
            >
              {/* 模拟 4K 播放器窗口 */}
              <div
                style={{
                  aspectRatio: '16/9',
                  background: '#000',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  overflow: 'hidden',
                }}
              >
                {/* 视频模拟画面背景 */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(circle, rgba(22,119,255,0.2) 0%, rgba(0,0,0,0.85) 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div style={{ textAlign: 'center', padding: 24 }}>
                    <div
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                      }}
                      onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                    >
                      {isVideoPlaying ? (
                        <PauseCircleOutlined style={{ fontSize: 36, color: '#fff' }} />
                      ) : (
                        <PlayCircleOutlined style={{ fontSize: 36, color: '#fff' }} />
                      )}
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 600, color: '#fff' }}>
                      易休智能睡眠眼罩 · 1分钟产品演示实景 VCR
                    </div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 6 }}>
                      4K超清实拍 · 实物佩戴 · 实时脑电波形从 β 波诱导进入深睡 δ 波全过程
                    </div>
                  </div>
                </div>

                {/* 视频顶部标签 */}
                <div
                  style={{
                    position: 'absolute',
                    top: 14,
                    left: 18,
                    display: 'flex',
                    gap: 8,
                  }}
                >
                  <Tag color="purple">4K 60FPS 超清</Tag>
                  <Tag color="cyan">Dolby 杜比声学</Tag>
                  <Tag color="blue">时长：01:00</Tag>
                </div>

                {/* 底部播放进度条 */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                    padding: '10px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <span style={{ fontSize: 12, color: '#fff', cursor: 'pointer' }} onClick={() => setIsVideoPlaying(!isVideoPlaying)}>
                    {isVideoPlaying ? '⏸' : '▶'}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: 4,
                      background: 'rgba(255,255,255,0.3)',
                      borderRadius: 2,
                      position: 'relative',
                      cursor: 'pointer',
                    }}
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickX = e.clientX - rect.left;
                      setVideoProgress(Math.round((clickX / rect.width) * 100));
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: `${videoProgress}%`,
                        background: '#1677ff',
                        borderRadius: 2,
                      }}
                    />
                  </div>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>
                    00:{videoProgress < 10 ? `0${videoProgress}` : videoProgress} / 01:00
                  </span>
                </div>
              </div>

              {/* 时间轴节点与解说词 */}
              <div style={{ padding: '20px 24px' }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: 'rgba(0,0,0,0.85)' }}>
                  ⏱️ 视频核心镜头时间轴（1分钟精剪编排）
                </div>
                <div style={{ display: 'grid', gap: 12 }}>
                  {[
                    { time: '00:00 - 00:15', title: '镜头一：痛点切入', desc: '现代都市白领在深夜频繁看手机、翻来覆去无法入眠的真实抓拍。' },
                    { time: '00:15 - 00:30', title: '镜头二：外观与轻量佩戴', desc: '展示48g超轻机身、医用级蚕丝遮光罩与额头高导干电极弹性触点。' },
                    { time: '00:30 - 00:45', title: '镜头三：实时脑电波形实测', desc: '手机App同步呈现使用者脑电图，小波去噪后实时展示50Hz工频滤除效果。' },
                    { time: '00:45 - 01:00', title: '镜头四：闭环声波助眠与金奖寄语', desc: '闭环粉红噪音随呼吸缓慢调谐，受试者进入深睡；团队亮相宣告科技向善。' },
                  ].map((item, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        gap: 12,
                        background: '#f9fafb',
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '1px solid #f0f0f0',
                      }}
                    >
                      <Tag color="blue" style={{ height: 24, lineHeight: '22px' }}>
                        {item.time}
                      </Tag>
                      <div>
                        <span style={{ fontWeight: 600, fontSize: 12.5, color: '#262626' }}>{item.title}</span>
                        <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.55)', marginTop: 2 }}>{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === 场景 C: 官方 PDF 证明材料（专利、CMA检测、三甲合同、白皮书等） === */}
        {isPdf && (
          <div style={{ maxWidth: 880, margin: '0 auto' }}>
            {/* 证书与红章权威背书卡片 */}
            <div
              style={{
                background: '#fff',
                border: '1px solid #d9d9d9',
                borderRadius: 12,
                padding: '24px 32px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* 模拟官方鲜红印章 */}
              <div
                style={{
                  position: 'absolute',
                  top: 24,
                  right: 32,
                  width: 110,
                  height: 110,
                  borderRadius: '50%',
                  border: '3px solid #ff4d4f',
                  color: '#ff4d4f',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: 'rotate(-12deg)',
                  opacity: 0.88,
                  userSelect: 'none',
                  pointerEvents: 'none',
                  fontWeight: 700,
                  textAlign: 'center',
                  lineHeight: 1.2,
                  boxShadow: 'inset 0 0 4px #ff4d4f',
                }}
              >
                <span style={{ fontSize: 10, letterSpacing: 1 }}>★ 官方验证专用章 ★</span>
                <span style={{ fontSize: 12, margin: '2px 0' }}>真实有效</span>
                <span style={{ fontSize: 9 }}>国家认监委 / 知识产权</span>
              </div>

              {/* 头部标题与权威认证 */}
              <div style={{ borderBottom: '2px solid #1677ff', paddingBottom: 16, marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <SafetyCertificateOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                  <h1 style={{ fontSize: 20, margin: 0, fontWeight: 700, color: '#1f1f1f' }}>
                    {file.name.replace(/\.pdf$/, '')}
                  </h1>
                </div>
                <div style={{ fontSize: 13, color: 'rgba(0,0,0,0.65)', marginTop: 8 }}>
                  出具机构：<b style={{ color: '#0958d9' }}>{file.author || '国家权威质检 / 认证部门'}</b> ·
                  状态：<Tag color="success">✅ 已通过国赛资格审查真实性核验</Tag>
                </div>
              </div>

              {/* 结构化证据解析卡片 */}
              <div
                style={{
                  background: '#f6ffed',
                  border: '1px solid #b7eb8f',
                  borderRadius: 8,
                  padding: '14px 18px',
                  marginBottom: 20,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: '#389e0d', marginBottom: 8 }}>
                  🎯 核心支撑价值（对商业计划书评分维度的强力背书）：
                </div>
                <div style={{ fontSize: 13, color: '#274916', lineHeight: 1.7 }}>
                  {file.description}
                </div>
              </div>

              {/* 详细元数据项 */}
              {file.metadata && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(0,0,0,0.85)', marginBottom: 10 }}>
                    📋 官方备案与技术鉴定数据索引：
                  </div>
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: 12.5,
                    }}
                  >
                    <tbody>
                      {Object.entries(file.metadata).map(([k, v]) => (
                        <tr key={k} style={{ borderBottom: '1px solid #f0f0f0' }}>
                          <td
                            style={{
                              padding: '8px 12px',
                              background: '#fafafa',
                              color: 'rgba(0,0,0,0.55)',
                              width: 140,
                              fontWeight: 500,
                            }}
                          >
                            {k}
                          </td>
                          <td style={{ padding: '8px 12px', color: 'rgba(0,0,0,0.85)', fontWeight: 600 }}>
                            {Array.isArray(v) ? v.join('、') : String(v)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 模拟全真扫描件纸质视图预览 */}
              <div
                style={{
                  background: '#fff',
                  border: '1px solid #e0e0e0',
                  borderRadius: 6,
                  padding: '36px 40px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  position: 'relative',
                  minHeight: 280,
                }}
              >
                <div style={{ textAlign: 'center', borderBottom: '1px solid #ccc', paddingBottom: 14, marginBottom: 20 }}>
                  <div style={{ fontSize: 12, letterSpacing: 2, color: '#888' }}>中华人民共和国 官方备案佐证材料正本</div>
                  <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>{file.name.replace(/\.pdf$/, '')}</div>
                </div>

                <div style={{ fontSize: 13, color: '#444', lineHeight: 1.9 }}>
                  <p>
                    <strong>受检/申报单位</strong>：杭州易休脑机科技有限公司（浙江大学师生共创）
                  </p>
                  <p>
                    <strong>鉴定/核验依据</strong>：中华人民共和国国家标准、国家知识产权局专利法实施细则及教育部成果转化相关法规。
                  </p>
                  <p>
                    <strong>结论与审核意见</strong>：经严格检索与实测，该项目知识产权权属清晰，学生团队为核心技术第一贡献人；样品符合国家电气安全与人体生物相容性要求，采购意向真实有效。
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 40, textAlign: 'right' }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#666' }}>经办人签章：【已验真】</div>
                    <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>备案日期：{file.updatedAt || '2026-08-20'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === 场景 D: 3D 工程模型 STEP === */}
        {isStep && (
          <div style={{ maxWidth: 880, margin: '0 auto' }}>
            <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <ApartmentOutlined style={{ fontSize: 24, color: '#13c2c2' }} />
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>3D 工业结构与实物装配拆解工程文件</h2>
              </div>
              <div style={{ background: '#f5f5f5', borderRadius: 8, padding: 30, textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 40 }}>📐</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginTop: 10 }}>SolidWorks / STEP 工业级装配体三维模型</div>
                <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)', marginTop: 6 }}>
                  包含微型锂电池仓安全隔离舱、柔性干电极力学自适应弹簧触点、超薄遮光鼻托等 38 个零部件图纸
                </div>
                <Button type="primary" icon={<DownloadOutlined />} style={{ marginTop: 14 }} onClick={() => handleDownload(file)}>
                  下载三维工程文件 (34.0 MB)
                </Button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
                <div style={{ background: '#fafafa', padding: 12, borderRadius: 6 }}>
                  <strong>整机重量</strong>：48 克（佩戴无负重感）
                </div>
                <div style={{ background: '#fafafa', padding: 12, borderRadius: 6 }}>
                  <strong>材质用料</strong>：60支双面亲肤真丝 + 医用级导电硅胶
                </div>
                <div style={{ background: '#fafafa', padding: 12, borderRadius: 6 }}>
                  <strong>防水防汗等级</strong>：IPX4 工业防泼溅
                </div>
                <div style={{ background: '#fafafa', padding: 12, borderRadius: 6 }}>
                  <strong>电极点位</strong>：Fp1、Fp2 额叶对称采集 + Fpz 动态参考地
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === 场景 E: Markdown / 文本文件 (如访谈、商业画布、答辩QA、主BP) === */}
        {isMarkdown && (
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <div
              style={{
                background: '#fff',
                border: '1px solid #e8e8e8',
                borderRadius: 12,
                padding: '28px 36px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
              }}
            >
              {/* 核心概要提示条 */}
              <div
                style={{
                  background: '#f0f7ff',
                  border: '1px solid #bae0ff',
                  borderRadius: 8,
                  padding: '12px 16px',
                  marginBottom: 20,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <span style={{ fontWeight: 600, color: '#0958d9', fontSize: 13 }}>💡 核心内容提要：</span>
                  <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.75)', marginLeft: 6 }}>
                    {file.description || '项目核心过程性工作成果文档'}
                  </span>
                </div>
                {file.name.includes('商业计划书') && onOpenBpEditor && (
                  <Button size="small" type="primary" onClick={onOpenBpEditor}>
                    进入主编辑器
                  </Button>
                )}
              </div>

              {/* 渲染 Markdown */}
              <div className="prose max-w-none" style={{ fontSize: 14, lineHeight: 1.8 }}>
                {renderMarkdown(file.contentPreview || `# ${file.name}\n\n该文档已由团队审核归档，大小约 ${formatSize(file.size)}。`)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI 深度分析抽屉弹窗 */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ThunderboltOutlined style={{ color: '#722ed1' }} />
            <span>AI 教练 · 对本材料的深度对标质询与提炼</span>
          </div>
        }
        open={aiAnalysisVisible}
        onOk={() => setAiAnalysisVisible(false)}
        onCancel={() => setAiAnalysisVisible(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setAiAnalysisVisible(false)}>
            确认并知晓
          </Button>,
        ]}
        width={680}
      >
        <div style={{ padding: '10px 0', fontSize: 13, lineHeight: 1.8 }}>
          <div style={{ background: '#f9f0ff', border: '1px solid #d3adf7', borderRadius: 8, padding: 14, marginBottom: 14 }}>
            <div style={{ fontWeight: 700, color: '#531dab', fontSize: 13.5 }}>
              🤖 知识库对标分析结论（文件：{file.name}）
            </div>
            <div style={{ color: '#391085', marginTop: 6 }}>
              {file.category === '权威知识产权' &&
                '该专利证书明确支撑了商业计划书第3章【核心壁垒】与第9章【团队学生原创度】。第一发明人为学生陈逸飞，完全符合国赛评委对“学生真科研、真创业”的核心考核要求。'}
              {file.category === '质量与安全检测' &&
                '浙江省电子信息产品检验所出具的双C（CMA/CNAS）检验报告有力击碎了评委对“微型脑电眼罩是否存在电磁辐射与皮肤致敏隐患”的质疑，是答辩中的免检王牌。'}
              {file.category === '真实商业验证' &&
                '三甲医院采购意向合同不仅证明了 120 万元的市场需求规模，更证明了团队在医疗院线科研场景下的早期落地能力，为财务预测提供了坚实的底层锚点。'}
              {file.fileType === 'text' &&
                '该文档数据量丰富详实，可作为多轮指导对话的即时上下文。建议在第6章商业模式汇报中，引用本文件中的单位经济模型数据进一步强化汇报说服力。'}
              {file.fileType === 'binary' &&
                '演示大文件格式与时长完全符合国赛组委会申报规范，画质清晰、节奏明快，可直接用于线上网评与现场路演投影。'}
            </div>
          </div>
          <div style={{ fontSize: 12.5, color: 'rgba(0,0,0,0.65)' }}>
            <strong>建议答辩策略</strong>：在现场答辩遭遇专家刁难提问时，请在 10 秒内引导评委翻阅对应佐证附件编号，通过硬核资质直接终结质询。
          </div>
        </div>
      </Modal>
    </div>
  );
};
