import { Rate, Tag } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { getSession } from '../../api/auth';
import { DIMENSION_TAGS, listAvailabilities, listMentors, recommendMentors } from '../../api/mentor';
import {
  Availability,
  MENTOR_STATUS_LABEL,
  Mentor,
  MentorStatus,
} from '../../types/mentor';
import { User } from '../../types/auth';
import { Button, Card, Empty, Select, Space, Spin, Table, Typography } from 'antd';

const { Title, Text } = Typography;

/**
 * 导师库：检索筛选 + 规则版匹配推荐（短板标签）+ 发起预约入口
 */
export default function MentorList() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [filterStatus, setFilterStatus] = useState<MentorStatus>('active');
  const [weakTags, setWeakTags] = useState<string[]>([]);
  const [recommended, setRecommended] = useState<Array<Mentor & { matchScore: number }> | null>(null);

  useEffect(() => {
    getSession().then(setUser);
    refresh();
  }, []);

  const refresh = async () => {
    setMentors(await listMentors());
    setAvailabilities(await listAvailabilities());
  };

  const openSlotsOf = (mentorId: number): number =>
    availabilities.filter((a) => a.mentorId === mentorId && a.booked < a.capacity && a.status === 'open').length;

  const onRecommend = async () => {
    if (weakTags.length === 0) return;
    setRecommended(await recommendMentors(weakTags));
  };

  const columns: ColumnsType<Mentor> = [
    {
      title: '导师',
      key: 'name',
      render: (_, m) => (
        <Space direction="vertical" size={0}>
          <Space>
            <Text strong>{m.name}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>{m.title}</Text>
          </Space>
          <Text type="secondary" style={{ fontSize: 12 }}>{m.bio}</Text>
        </Space>
      ),
    },
    {
      title: '专长标签',
      key: 'tags',
      render: (_, m) => (
        <Space wrap size={[4, 4]}>
          {Array.from(new Set(m.tags || [])).map((t, idx) => (
            <Tag key={`${m.id}-tag-${t}-${idx}`} color={DIMENSION_TAGS.includes(t) ? 'blue' : 'default'}>{t}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '评价',
      key: 'rating',
      width: 150,
      render: (_, m) =>
        m.reviewCount > 0 ? (
          <Space size={4}>
            <Rate disabled value={Math.round(m.rating)} style={{ fontSize: 13 }} />
            <Text type="secondary" style={{ fontSize: 12 }}>{m.rating}（{m.reviewCount}）</Text>
          </Space>
        ) : (
          <Text type="secondary">暂无评价</Text>
        ),
    },
    {
      title: '可约时段',
      key: 'slots',
      width: 90,
      align: 'center',
      render: (_, m) => {
        const n = openSlotsOf(m.id);
        return <Tag color={n > 0 ? 'green' : 'default'}>{n} 个</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (s: MentorStatus) => <Tag>{MENTOR_STATUS_LABEL[s]}</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, m) => (
        <Button
          type="link"
          size="small"
          disabled={openSlotsOf(m.id) === 0}
          onClick={() => navigate(`/mentor/book?mentorId=${m.id}`)}
        >
          预约
        </Button>
      ),
    },
  ];

  if (user === undefined) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }
  if (user === null) return <Navigate to="/login" replace />;

  const filteredMentors = mentors.filter((m) => !filterStatus || m.status === filterStatus);

  return (
    <div>
      <Title level={4}>导师库（5.2 常态化辅导与资源调度）</Title>

      <Card title="匹配推荐（规则版：按项目短板标签）" style={{ marginBottom: 16 }}>
        <Space wrap>
          <Select
            mode="multiple"
            placeholder="选择项目当前短板（六维）"
            style={{ minWidth: 360 }}
            value={weakTags}
            onChange={setWeakTags}
            options={DIMENSION_TAGS.map((t) => ({ label: t, value: t }))}
          />
          <Button type="primary" onClick={onRecommend} disabled={weakTags.length === 0}>
            推荐导师
          </Button>
        </Space>
        {recommended && (
          <div style={{ marginTop: 12 }}>
            {recommended.length === 0 ? (
              <Empty description="没有匹配的导师，请调整短板标签" />
            ) : (
              recommended.map((m) => (
                <Card key={m.id} size="small" style={{ marginBottom: 8 }}>
                  <Space wrap>
                    <Text strong>{m.name}</Text>
                    <Text type="secondary">{m.title}</Text>
                    <Tag color="gold">匹配度 {m.matchScore}</Tag>
                    <Tag color="blue">评分 {m.rating}</Tag>
                    <Text type="secondary" style={{ fontSize: 12 }}>专长：{m.tags.join(' / ')}</Text>
                    <Button type="link" size="small" onClick={() => navigate(`/mentor/book?mentorId=${m.id}`)}>
                      去预约
                    </Button>
                  </Space>
                </Card>
              ))
            )}
          </div>
        )}
      </Card>

      <Card
        title="全部导师"
        extra={
          <Select
            value={filterStatus}
            onChange={(v) => setFilterStatus(v)}
            style={{ width: 120 }}
            options={[
              { label: '已上架', value: 'active' },
              { label: '待审核', value: 'pending' },
              { label: '已停用', value: 'disabled' },
              { label: '全部', value: undefined as unknown as MentorStatus },
            ]}
          />
        }
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredMentors}
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );
}
