import { Typography } from 'antd';

const { Text } = Typography;

export default function CurrencyDisplay({ amount, showSign = false }) {
  const num = Number(amount) || 0;
  const formatted = num.toLocaleString('en-TZ');
  const sign = showSign && num > 0 ? '+' : '';

  return (
    <Text>
      {sign}TZS {formatted}
    </Text>
  );
}
