import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Alert, Button, Card, Empty, List, Space, Spin, Tag, Typography, message } from 'antd'
import { FileTextOutlined, SignatureOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import * as contractsApi from '../../api/contracts'

const STATUS = {
  draft: { color: 'default', label: 'Inaandikwa' },
  pending_signature: { color: 'processing', label: 'Inasubiri saini yako' },
  viewed: { color: 'warning', label: 'Umefungua, inasubiri saini yako' },
  signed: { color: 'success', label: 'Imesainiwa' },
  declined: { color: 'error', label: ' hukukubali' },
  void: { color: 'default', label: 'Imesitishwa' },
}

export default function MyContracts() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await contractsApi.getMyContracts()
      setRows(data.data || [])
    } catch {
      message.error('Imeshindwa kupakua mikatataba yako.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const awaiting = rows.filter((r) => r.signing_url)

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-800 mb-1">Mikatataba Yangu</h1>
      <Typography.Paragraph type="secondary" className="!mb-4">
        Mikatataba ya pango la chumba yako. Fungua kila mkatataba ili kuisoma kwa makini
        kabla ya kuusaini.
      </Typography.Paragraph>

      {awaiting.length > 0 && (
        <Alert
          type="warning"
          showIcon
          className="mb-4"
          message={`Una mikatataba ${awaiting.length} inayohitaji saini yako.`}
          description="Ili kuiambia mwenyewe umekubali, fungua mkatataba husika na uweke saini yako chini."
        />
      )}

      {loading ? (
        <Spin className="block mx-auto mt-16" />
      ) : rows.length === 0 ? (
        <Empty description="Hakuna mikatataba bado." className="mt-16" />
      ) : (
        <List
          dataSource={rows}
          renderItem={(row) => {
            const s = STATUS[row.status] || { color: 'default', label: row.status }
            return (
              <List.Item key={row.id}>
                <Card size="small" className="w-full">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <Space size={8} wrap>
                        <FileTextOutlined className="text-blue-700" />
                        <Link to={`/tenant/contracts/${row.id}`} className="font-semibold">
                          {row.contract_number}
                        </Link>
                        <Tag color={s.color}>{s.label.trim()}</Tag>
                      </Space>
                      <div className="text-sm text-gray-600 mt-1">
                        {[row.house, row.room].filter(Boolean).join(' - ')}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {dayjs(row.start_date).format('DD MMM YYYY')} -{' '}
                        {dayjs(row.end_date).format('DD MMM YYYY')} ({row.period_months} miezi)
                      </div>
                      <div className="text-sm mt-1">
                        Jumla: <strong>{row.currency} {Number(row.total_amount).toLocaleString()}</strong>
                        {' '}({row.currency} {Number(row.rent_amount).toLocaleString()} kwa mwezi)
                      </div>
                      {row.status === 'declined' && row.declined_reason && (
                        <div className="text-xs text-red-600 mt-1">
                          Sababu: {row.declined_reason}
                        </div>
                      )}
                      {row.status === 'void' && row.voided_reason && (
                        <div className="text-xs text-gray-500 mt-1">
                          Sababu: {row.voided_reason}
                        </div>
                      )}
                    </div>

                    <Space direction="vertical" align="end">
                      {row.signing_url ? (
                        <>
                          <Button
                            type="primary"
                            icon={<SignatureOutlined />}
                            onClick={() => navigate(`/contracts/sign/${row.signing_url.split('/').pop()}`)}
                          >
                            Soma na saini
                          </Button>
                          {row.token_expires_at && (
                            <span className="text-xs text-gray-500">
                              Mwisho {dayjs(row.token_expires_at).format('DD MMM YYYY')}
                            </span>
                          )}
                        </>
                      ) : (
                        <Button onClick={() => navigate(`/tenant/contracts/${row.id}`)}>
                          {row.signed_at ? 'Ona mkatataba' : 'Fungua'}
                        </Button>
                      )}
                    </Space>
                  </div>
                </Card>
              </List.Item>
            )
          }}
        />
      )}
    </div>
  )
}