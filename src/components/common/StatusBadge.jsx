import { Tag } from 'antd';

const statusConfig = {
  active: { color: 'green', label: 'Active' },
  available: { color: 'green', label: 'Available' },
  paid: { color: 'green', label: 'Paid' },
  inactive: { color: 'default', label: 'Inactive' },
  unavailable: { color: 'default', label: 'Unavailable' },
  occupied: { color: 'blue', label: 'Occupied' },
  maintenance: { color: 'gold', label: 'Maintenance' },
  expired: { color: 'red', label: 'Expired' },
  overdue: { color: 'red', label: 'Overdue' },
  terminated: { color: 'red', label: 'Terminated' },
  partial: { color: 'orange', label: 'Partial' },
  expiring_soon: { color: 'orange', label: 'Expiring Soon' },
  unpaid: { color: 'yellow', label: 'Unpaid' },
  pending: { color: 'gold', label: 'Pending' },
  reserved: { color: 'purple', label: 'Reserved' },
  accepted: { color: 'green', label: 'Accepted' },
  declined: { color: 'red', label: 'Declined' },
  cancelled: { color: 'default', label: 'Cancelled' },
  draft: { color: 'default', label: 'Draft' },
  sent: { color: 'blue', label: 'Sent' },
  signed: { color: 'green', label: 'Signed' },
  voided: { color: 'red', label: 'Voided' },
};

export default function StatusBadge({ status }) {
  const key = status?.toLowerCase().replace(/\s+/g, '_');
  const config = statusConfig[key] || { color: 'default', label: status };

  return (
    <Tag color={config.color}>
      {config.label}
    </Tag>
  );
}
