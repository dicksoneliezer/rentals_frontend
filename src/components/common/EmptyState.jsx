import { Empty } from 'antd';

export default function EmptyState({ title = 'No Data', description, icon }) {
  return (
    <Empty
      image={icon || Empty.PRESENTED_IMAGE_SIMPLE}
      description={
        <span>
          <strong>{title}</strong>
          {description && <div style={{ marginTop: 4, color: '#8c8c8c' }}>{description}</div>}
        </span>
      }
    />
  );
}
