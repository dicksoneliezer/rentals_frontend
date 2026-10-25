import { Typography, Descriptions, Divider } from 'antd'
import dayjs from 'dayjs'
import CurrencyDisplay from './CurrencyDisplay'
import { BRAND } from '../../config/brand'
import { resolveApiAsset } from '../../api/assets'

const { Title, Text } = Typography

// The API returns the configured receipt branding alongside the receipt. For a
// multi-owner system the name/contact come from the landlord's own settings,
// falling back to the platform brand.
const getBranding = (receipt) => ({
  companyName: receipt?.branding?.company_name || BRAND.name,
  slogan: receipt?.branding?.company_slogan,
  phone: receipt?.branding?.company_phone,
  address: receipt?.branding?.company_address,
  logoUrl: resolveApiAsset(receipt?.branding?.logo_url),
  signatureUrl: resolveApiAsset(receipt?.branding?.signature_url),
})

export function ReceiptSignature({ name, companyName = BRAND.name, signatureUrl }) {
  return (
    <div style={{ marginTop: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24 }}>
      <div>
        <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase' }}>Recipient</Text>
        <div><Text strong>{companyName}</Text></div>
      </div>
      <div style={{ textAlign: 'center' }}>
        {signatureUrl ? (
          <img
            src={signatureUrl}
            alt="Authorized signature"
            style={{ height: 60, maxWidth: 200, objectFit: 'contain', display: 'block', margin: '0 auto 4px' }}
          />
        ) : (
          <div style={{ width: 180, borderTop: '1px solid #999', marginBottom: 8 }} />
        )}
        <Text strong>{name || companyName}</Text>
        <div>
          <Text type="secondary" style={{ fontSize: 12 }}>Authorized Signature</Text>
        </div>
      </div>
    </div>
  )
}

export default function ReceiptView({ receipt }) {
  const amount = receipt.amount_paid ?? receipt.amount
  const balance = receipt.balance_after
  const houseName = receipt.room?.house?.name || receipt.house_name || '-'
  const tenantName = receipt.tenant?.full_name || receipt.tenant_name || '-'
  const { companyName, slogan, phone, address, logoUrl, signatureUrl } = getBranding(receipt)
  const contact = [address, phone].filter(Boolean).join(' | ')

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        {logoUrl && (
          <img
            src={logoUrl}
            alt={`${companyName} logo`}
            style={{ maxHeight: 72, maxWidth: 160, objectFit: 'contain', marginBottom: 8 }}
          />
        )}
        <Title level={4} style={{ margin: 0, letterSpacing: 2 }}>{companyName}</Title>
        <Text type="secondary" style={{ letterSpacing: 3, textTransform: 'uppercase', fontSize: 12 }}>
          Payment Receipt
        </Text>
        {slogan && (
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>{slogan}</Text>
          </div>
        )}
        {contact && (
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>{contact}</Text>
          </div>
        )}
        <Divider style={{ margin: '12px 0' }} />
        <Text type="secondary">
          Receipt No: <Text strong>{receipt.receipt_number}</Text>
        </Text>
        <div>
          <Text type="secondary">
            Date of Payment: {receipt.payment_date ? dayjs(receipt.payment_date).format('MMMM D, YYYY') : '-'}
          </Text>
        </div>
      </div>
      <Descriptions column={2} size="small">
        <Descriptions.Item label="Tenant Name">{tenantName}</Descriptions.Item>
        <Descriptions.Item label="Tenant Number">
          {receipt.tenant?.phone || receipt.tenant_phone || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="House">{houseName}</Descriptions.Item>
        <Descriptions.Item label="Room">
          {receipt.room?.name || receipt.room_name || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="Rent Period">{receipt.rent_period || '-'}</Descriptions.Item>
        <Descriptions.Item label="Payment Method">
          {receipt.payment_method?.replace(/_/g, ' ').toUpperCase() || '-'}
        </Descriptions.Item>
      </Descriptions>
      <Divider style={{ margin: '12px 0' }} />
      <Descriptions column={2} size="small">
        <Descriptions.Item label="Amount Paid">
          <Text strong style={{ color: '#52c41a', fontSize: 16 }}>
            <CurrencyDisplay amount={amount} />
          </Text>
        </Descriptions.Item>
        <Descriptions.Item label="Balance After">
          <CurrencyDisplay amount={balance} />
        </Descriptions.Item>
      </Descriptions>
      <ReceiptSignature
        name={receipt.signatory_name || receipt.room?.house?.owner?.name}
        companyName={companyName}
        signatureUrl={signatureUrl}
      />
    </div>
  )
}