import { Card, Space, Typography } from 'antd';

const { Text, Title } = Typography;

export default function StatsCard({ title, value, icon, color = '#1890ff', suffix, prefix }) {
  return (
    <Card bordered={false} style={{ borderRadius: 8 }}>
      <Space align="center" size={16}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 12,
            backgroundColor: `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            color,
          }}
        >
          {icon}
        </div>
        <div>
          <Text type="secondary" style={{ fontSize: 13 }}>
            {title}
          </Text>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            {prefix && <Text style={{ fontSize: 14, color: '#8c8c8c' }}>{prefix}</Text>}
            <Title level={3} style={{ margin: 0 }}>
              {value}
            </Title>
            {suffix && <Text type="secondary" style={{ fontSize: 13 }}>{suffix}</Text>}
          </div>
        </div>
      </Space>
    </Card>
  );
}
