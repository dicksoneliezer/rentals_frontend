import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Form, Input, Select, Button, Card, message, Divider } from 'antd'
import * as housesApi from '../../../api/houses'
import * as mediaApi from '../../../api/media'
import PageHeader from '../../../components/common/PageHeader'
import MediaUploader from '../../../components/common/MediaUploader'

let seq = 0
const uid = () => `pending-${Date.now()}-${seq++}`

export default function HouseForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [media, setMedia] = useState([])
  const [pendingImages, setPendingImages] = useState([])
  const [pendingVideo, setPendingVideo] = useState(null)

  useEffect(() => {
    if (isEdit) {
      setFetching(true)
      housesApi
        .getById(id)
        .then((res) => {
          const house = res.data.data || res.data
          form.setFieldsValue(house)
          setMedia(
            (house.media || []).map((m) => ({ id: m.id, type: m.type, url: m.display_url || m.url }))
          )
        })
        .catch(() => message.error('Failed to load house'))
        .finally(() => setFetching(false))
    }
  }, [id, isEdit, form])

  const uploadImage = async (file) => {
    if (isEdit) {
      const fd = new FormData()
      fd.append('type', 'image')
      fd.append('file', file)
      const res = await mediaApi.uploadHouseMedia(id, fd)
      const m = res.data.data
      setMedia((prev) => [...prev, { id: m.id, type: 'image', url: m.url }])
    } else {
      setPendingImages((prev) => [...prev, { key: uid(), file, url: URL.createObjectURL(file) }])
    }
  }

  const uploadVideoFile = async (file) => {
    if (isEdit) {
      const fd = new FormData()
      fd.append('type', 'video')
      fd.append('file', file)
      const res = await mediaApi.uploadHouseMedia(id, fd)
      const m = res.data.data
      setMedia((prev) => [...prev.filter((x) => x.type !== 'video'), { id: m.id, type: 'video', url: m.url }])
    } else {
      setPendingVideo({ key: uid(), file, url: URL.createObjectURL(file) })
    }
  }

  const uploadVideoUrl = async (url) => {
    if (isEdit) {
      const fd = new FormData()
      fd.append('type', 'video')
      fd.append('url', url)
      const res = await mediaApi.uploadHouseMedia(id, fd)
      const m = res.data.data
      setMedia((prev) => [...prev.filter((x) => x.type !== 'video'), { id: m.id, type: 'video', url: m.url }])
    } else {
      setPendingVideo({ key: uid(), url })
    }
  }

  const removeMedia = async (item) => {
    if (item.id) {
      await mediaApi.deleteMedia(item.id)
      setMedia((prev) => prev.filter((m) => m.id !== item.id))
    } else if (item.type === 'video') {
      setPendingVideo(null)
    } else {
      setPendingImages((prev) => prev.filter((p) => p.key !== item.key))
    }
  }

  const uploadPending = async (houseId) => {
    for (const img of pendingImages) {
      const fd = new FormData()
      fd.append('type', 'image')
      fd.append('file', img.file)
      await mediaApi.uploadHouseMedia(houseId, fd)
    }
    if (pendingVideo) {
      const fd = new FormData()
      fd.append('type', 'video')
      if (pendingVideo.file) fd.append('file', pendingVideo.file)
      else fd.append('url', pendingVideo.url)
      await mediaApi.uploadHouseMedia(houseId, fd)
    }
  }

  const onFinish = async (values) => {
    setLoading(true)
    try {
      if (isEdit) {
        await housesApi.update(id, values)
        message.success('House updated successfully')
      } else {
        const res = await housesApi.create(values)
        const house = res.data.data || res.data
        await uploadPending(house.id)
        message.success('House created successfully')
      }
      navigate('/owner/houses')
    } catch (err) {
      message.error(err?.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const images = [...media.filter((m) => m.type === 'image'), ...pendingImages]
  const video = media.find((m) => m.type === 'video') || pendingVideo

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit House' : 'Add House'}
        onBack={() => navigate(-1)}
      />
      <Card loading={fetching}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ status: 'active' }}
          style={{ maxWidth: 600 }}
        >
          <Form.Item
            name="name"
            label="House Name"
            rules={[{ required: true, message: 'Please enter house name' }]}
          >
            <Input placeholder="e.g. Sunrise Apartments" />
          </Form.Item>
          <Form.Item
            name="address"
            label="Address"
            rules={[{ required: true, message: 'Please enter address' }]}
          >
            <Input.TextArea rows={2} placeholder="Full physical address" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Optional description" />
          </Form.Item>
          <Form.Item name="contact_info" label="Contact Info">
            <Input placeholder="Phone or email for this house" />
          </Form.Item>
          {isEdit && (
            <Form.Item name="status" label="Status">
              <Select
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                ]}
              />
            </Form.Item>
          )}

          <Divider />
          <MediaUploader
            images={images}
            video={video}
            onAddImage={uploadImage}
            onAddVideoFile={uploadVideoFile}
            onAddVideoUrl={uploadVideoUrl}
            onRemoveImage={removeMedia}
            onRemoveVideo={removeMedia}
          />
          <Divider />

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              {isEdit ? 'Update House' : 'Create House'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
