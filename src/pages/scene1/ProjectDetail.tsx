import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  App as AntdApp,
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Form,
  Input,
  List,
  Radio,
  Row,
  Space,
  Spin,
  Table,
  Tabs,
  Tag,
  Timeline,
  Typography,
} from 'antd';
import {
  AlertOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  HistoryOutlined,
  QuestionCircleOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import {
  fetchJudgeStandards,
  fetchProjectDetail,
  fetchReviewHistory,
  submitReview,
} from '../../api/screen';
import ConfidenceTag from '../../components/ConfidenceTag';
import ScoreBar from '../../components/ScoreBar';
import StageTimeline from '../../components/StageTimeline';
import type { JudgeStandards, ProjectDetail as ProjectDetailType, ReviewRecord } from '../../types';

const { Title, Text, Paragraph } = Typography;

/** 复核裁定选项（评委端 4 类） */
const VERDICT_OPTIONS = [
  { label: '推荐 A 类（晋级决赛）', value: 'A' },
  { label: '放行 B 类（口头复审）', value: 'B' },
  { label: '打回 C 类修正', value: 'C' },
  { label: '一票否决 D 类', value: 'D' },
];

/** 六维标准表列定义 */
const DIM_COLUMNS = [
  { title: '维度', dataIndex: 'title', width: 130 },
  { title: '权重', dataIndex: 'weight', width: 70, render: (v: number) => `${v}%` },
  { title: '标准定义（考察什么）', dataIndex: 'definition' },
  { title: '一票否决点', dataIndex: 'vetoPoint', render: (v: string) => <Text type="danger">{v || '无'}</Text> },
];

/** 等级映射表列定义 */
const GRADE_COLUMNS = [
  { title: '等级', dataIndex: 'title', width: 80, render: (v: string) => <Tag color={v === 'A' ? 'green' : v === 'B' ? 'blue' : v === 'C' ? 'orange' : 'red'}>{v}</Tag> },
  { title: '占比区间', dataIndex: 'definition', width: 100 },
  { title: '综合得分', dataIndex: 'scoreRange', width: 100 },
  { title: '准入证据特征', dataIndex: 'evidence' },
  { title: '处理动作', dataIndex: 'action' },
];

/**
 * Scene1 项目详情（核心页面）：
 * - 顶部摘要卡：总分 / 等级 / 置信度 / 异常标签
 * - 页签一：AI 初筛分析报告（六维得分条 + 5 阶段溯源时间轴 + 异常审计 + 质询提示）
 * - 页签二：官方评判指标依据（六维标准 / 等级映射 / 方向权重组）
 * - 页签三：历史复核反馈记录
 * - 复核工作舱（评委端）：4 类裁定 + 必填评语 + 重置/保存
 */
export default function ProjectDetail() {
  const { message } = AntdApp.useApp();
  const { id = '' } = useParams<{ id: string }>();
  const [detail, setDetail] = useState<ProjectDetailType | null>(null);
  const [standards, setStandards] = useState<JudgeStandards | null>(null);
  const [history, setHistory] = useState<ReviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  // 加载项目详情 + 评判标准 + 复核记录
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchProjectDetail(id),
      fetchJudgeStandards(),
      fetchReviewHistory(id),
    ])
      .then(([d, s, h]) => {
        setDetail(d);
        setStandards(s);
        setHistory(h);
      })
      .catch(() => {
        message.error('项目详情加载失败，请确认后端已启动');
      })
      .finally(() => setLoading(false));
  }, [id]);

  // 提交复核裁定
  const handleSubmit = useCallback(async () => {
    const values = await form.validateFields();
    setSubmitting(true);
    try {
      const record = await submitReview(id, values.verdict, values.comment);
      setHistory((prev) => [record, ...prev]);
      message.success('复核已提交，此内容将同步记录并训练神经网络');
      form.resetFields();
    } catch (error) {
      message.error(`提交失败：${(error as Error).message}`);
    } finally {
      setSubmitting(false);
    }
  }, [form, id]);

  // 重置复核表单
  const handleReset = () => form.resetFields();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }
  if (!detail) {
    return <Empty description="项目不存在" />;
  }

  const gradeColor = detail.grade === 'A' ? 'green' : detail.grade === 'B' ? 'blue' : detail.grade === 'C' ? 'orange' : 'red';

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      {/* 顶部摘要卡 */}
      <Card>
        <Row gutter={24} align="middle">
          <Col flex="auto">
            <Space size={12} wrap>
              <Title level={4} style={{ margin: 0 }}>
                {detail.name}
              </Title>
              <Tag color="geekblue">{detail.track}</Tag>
              <Tag color={gradeColor}>
                {detail.grade} 级
              </Tag>
              <ConfidenceTag confidence={detail.confidence} />
              {Array.from(new Set(detail.tags || [])).map((tag, idx) => (
                <Tag key={`${detail.id}-tag-${tag}-${idx}`} color={tag.includes('警报') || tag.includes('预警') ? 'orange' : 'red'}>
                  {tag}
                </Tag>
              ))}
            </Space>
            <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
              {detail.confidence === 'high' ? '高置信 · 建议快速过审' : detail.confidence === 'medium' ? '中置信 · 建议人工复核' : '低置信 · 建议人工仲裁'}
            </Text>
          </Col>
          <Col>
            <Space align="end" size={16}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 36, fontWeight: 700, color: '#1677ff' }}>{detail.score}</div>
                <Text type="secondary">综合得分 / 100</Text>
              </div>
            </Space>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]}>
        {/* 左侧：三页签 */}
        <Col xs={24} lg={17}>
          <Card>
            <Tabs
              defaultActiveKey="report"
              items={[
                // ---- 页签一：AI 初筛分析报告 ----
                {
                  key: 'report',
                  label: (
                    <span>
                      <RobotOutlined /> AI 初筛分析报告 & 推理过程
                    </span>
                  ),
                  children: (
                    <Space direction="vertical" size={20} style={{ width: '100%' }}>
                      <div>
                        <Title level={5}>六维得分</Title>
                        <ScoreBar dimensions={detail.dimensions} />
                      </div>
                      <div>
                        <Title level={5}>5 阶段推理溯源</Title>
                        <StageTimeline trace={detail.trace} />
                      </div>
                      <div>
                        <Title level={5}>
                          <AlertOutlined /> 异常审计警告列表
                        </Title>
                        <Space direction="vertical" size={8} style={{ width: '100%' }}>
                          {detail.anomalies.map((anomaly, idx) => (
                            <Alert
                              key={idx}
                              type={anomaly.level === 'danger' ? 'error' : 'warning'}
                              showIcon
                              message={
                                <Space>
                                  <Tag color={anomaly.level === 'danger' ? 'red' : 'orange'}>{anomaly.type}</Tag>
                                  {anomaly.desc}
                                </Space>
                              }
                            />
                          ))}
                        </Space>
                      </div>
                      <div>
                        <Title level={5}>
                          <QuestionCircleOutlined /> 复赛质询提示（3 个提问方向）
                        </Title>
                        <List
                          size="small"
                          dataSource={detail.questions}
                          renderItem={(question, idx) => (
                            <List.Item>
                              <Text>
                                <Text strong>Q{idx + 1}：</Text>
                                {question}
                              </Text>
                            </List.Item>
                          )}
                        />
                      </div>
                    </Space>
                  ),
                },
                // ---- 页签二：官方评判指标依据 ----
                {
                  key: 'standards',
                  label: (
                    <span>
                      <CheckCircleOutlined /> 官方评判指标依据 & 等级标准
                    </span>
                  ),
                  children: standards ? (
                    <Space direction="vertical" size={20} style={{ width: '100%' }}>
                      <div>
                        <Title level={5}>六维标准定义（含一票否决点）</Title>
                        <Table
                          rowKey="key"
                          size="small"
                          pagination={false}
                          columns={DIM_COLUMNS}
                          dataSource={standards.dimensions}
                        />
                      </div>
                      <div>
                        <Title level={5}>A/B/C/D 等级映射表</Title>
                        <Table
                          rowKey="key"
                          size="small"
                          pagination={false}
                          columns={GRADE_COLUMNS}
                          dataSource={standards.grades}
                        />
                      </div>
                      <div>
                        <Title level={5}>方向权重组表（%）</Title>
                        <Table
                          rowKey="group"
                          size="small"
                          pagination={false}
                          columns={[
                            { title: '方向', dataIndex: 'group', width: 140 },
                            ...standards.dimensionNames.map((name, idx) => ({
                              title: name,
                              dataIndex: 'weights',
                              width: 110,
                              render: (weights: number[]) => weights[idx],
                            })),
                          ]}
                          dataSource={standards.weightGroups}
                        />
                      </div>
                    </Space>
                  ) : (
                    <Empty description="评判标准加载失败" />
                  ),
                },
                // ---- 页签三：历史复核反馈记录 ----
                {
                  key: 'history',
                  label: (
                    <span>
                      <HistoryOutlined /> 历史复核反馈记录
                    </span>
                  ),
                  children:
                    history.length === 0 ? (
                      <Empty description="暂无复核记录" />
                    ) : (
                      <Timeline
                        items={history.map((record) => ({
                          color: record.verdict === 'A' ? 'green' : record.verdict === 'B' ? 'blue' : record.verdict === 'C' ? 'orange' : 'red',
                          children: (
                            <div>
                              <Space size={8}>
                                <Tag color={record.verdict === 'A' ? 'green' : record.verdict === 'B' ? 'blue' : record.verdict === 'C' ? 'orange' : 'red'}>
                                  裁定：{record.verdict} 类
                                </Tag>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  {record.createdAt}
                                </Text>
                              </Space>
                              <Paragraph style={{ margin: '4px 0 0' }}>{record.comment}</Paragraph>
                            </div>
                          ),
                        }))}
                      />
                    ),
                },
              ]}
            />
          </Card>
        </Col>

        {/* 右侧：复核工作舱（评委端） */}
        <Col xs={24} lg={7}>
          <Card
            title={
              <Space>
                <CloseCircleOutlined />
                复核工作舱
              </Space>
            }
            extra={<Text type="secondary" style={{ fontSize: 12 }}>评委端</Text>}
          >
            <Form form={form} layout="vertical" initialValues={{ verdict: 'B' }}>
              <Form.Item name="verdict" label="裁定结果" rules={[{ required: true, message: '请选择裁定结果' }]}>
                <Radio.Group options={VERDICT_OPTIONS} />
              </Form.Item>
              <Form.Item
                name="comment"
                label="评语（必填）"
                rules={[{ required: true, message: '评语必填' }, { min: 5, message: '评语不少于 5 个字' }]}
              >
                <Input.TextArea rows={5} placeholder="请填写复核评语，将作为训练样本同步记录…" showCount maxLength={200} />
              </Form.Item>
              <Alert
                type="info"
                showIcon
                style={{ marginBottom: 12 }}
                message="此内容将同步记录并训练神经网络"
              />
              <Space>
                <Button onClick={handleReset}>重置</Button>
                <Button type="primary" loading={submitting} onClick={handleSubmit}>
                  保存裁定
                </Button>
              </Space>
            </Form>
            <Divider style={{ margin: '16px 0 8px' }} />
            <Text type="secondary" style={{ fontSize: 12 }}>
              当前项目历史复核 {history.length} 条
            </Text>
          </Card>
        </Col>
      </Row>
    </Space>
  );
}
