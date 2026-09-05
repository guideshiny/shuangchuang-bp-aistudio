import { useEffect, useState } from 'react';
import { Card, Col, Empty, Input, Row, Select, Space, Spin, Tag, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { fetchProjects } from '../../api/screen';
import ConfidenceTag from '../../components/ConfidenceTag';
import type { ProjectSummary } from '../../types';

const { Text, Title } = Typography;

/** 赛道分类选项 */
const TRACK_OPTIONS = ['创新', '创业', '竞赛', '策划', '创新+创业'].map((t) => ({ label: t, value: t }));
/** AI 置信风险归口选项 */
const RISK_OPTIONS = ['需人工复核', '合规异常查重警示'].map((t) => ({ label: t, value: t }));

/** 等级 → 颜色映射 */
const GRADE_COLORS: Record<string, string> = { A: 'green', B: 'blue', C: 'orange', D: 'red' };

/**
 * Scene1 项目分流列表：
 * - 筛选：赛道分类 / AI 置信风险归口（走后端筛选参数）
 * - 搜索：项目名 / 负责人 / 学校
 * - 项目卡：项目名、赛道、负责人（学校）、得分+等级、异常标签
 */
export default function ProjectList() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [track, setTrack] = useState<string | undefined>();
  const [risk, setRisk] = useState<string | undefined>();
  const [keyword, setKeyword] = useState('');

  // 筛选/搜索变化时重新请求后端（数据全部来自 API）
  useEffect(() => {
    setLoading(true);
    fetchProjects({ track, risk, q: keyword || undefined })
      .then(setProjects)
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, [track, risk, keyword]);

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <div>
        <Title level={4} style={{ margin: 0 }}>
          项目分流列表
        </Title>
        <Text type="secondary">按赛道与 AI 置信风险归口筛选，点击项目卡查看初筛详情</Text>
      </div>

      {/* 筛选区 */}
      <Card size="small">
        <Space wrap size={12}>
          <Select
            placeholder="赛道分类"
            allowClear
            options={TRACK_OPTIONS}
            value={track}
            onChange={setTrack}
            style={{ width: 160 }}
          />
          <Select
            placeholder="AI 置信风险归口"
            allowClear
            options={RISK_OPTIONS}
            value={risk}
            onChange={setRisk}
            style={{ width: 200 }}
          />
          <Input.Search
            placeholder="搜索项目名 / 负责人 / 学校"
            allowClear
            prefix={<SearchOutlined />}
            style={{ width: 280 }}
            onSearch={setKeyword}
          />
        </Space>
      </Card>

      {/* 项目卡列表 */}
      <Spin spinning={loading}>
        {projects.length === 0 ? (
          <Empty description="没有符合条件的项目" />
        ) : (
          <Row gutter={[16, 16]}>
            {projects.map((project) => (
              <Col key={project.id} xs={24} sm={24} md={12} lg={8}>
                <Card
                  hoverable
                  onClick={() => navigate(`/scene1/projects/${project.id}`)}
                  title={
                    <Space>
                      <Text strong>{project.name}</Text>
                      {Array.from(new Set(project.tags || [])).map((tag, idx) => (
                        <Tag key={`${project.id}-tag-${tag}-${idx}`} color={tag.includes('警报') || tag.includes('预警') ? 'orange' : 'red'}>
                          {tag}
                        </Tag>
                      ))}
                    </Space>
                  }
                  extra={<Tag color={GRADE_COLORS[project.grade]}>{project.grade} 级</Tag>}
                >
                  <Space direction="vertical" size={6}>
                    <Text type="secondary">
                      <Tag color="geekblue">{project.track}</Tag>
                      <Tag color="default">{project.source?.replace(/^\d+\./, '') || '—'}</Tag>
                    </Text>
                    <Space size={12}>
                      <Text strong style={{ fontSize: 18, color: '#1677ff' }}>
                        {project.score}
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          {' '}
                          分
                        </Text>
                      </Text>
                      <ConfidenceTag confidence={project.confidence} />
                    </Space>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Spin>
    </Space>
  );
}
