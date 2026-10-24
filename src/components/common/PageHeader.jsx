import { Space, Typography, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function PageHeader({ title, subtitle, extra, onBack }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 12,
        flexWrap: 'wrap',
        marginBottom: 24,
      }}
    >
      <Space align="start" size={12}>
        {onBack && (
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={onBack}
            style={{ marginTop: 2 }}
            aria-label="Go back"
          />
        )}
        <div>
          <Title level={4} style={{ margin: 0 }}>
            {title}
          </Title>
          {subtitle && (
            <Text type="secondary" style={{ fontSize: 14 }}>
              {subtitle}
            </Text>
          )}
        </div>
      </Space>
      {extra && <Space wrap>{extra}</Space>}
    </div>
  );
}