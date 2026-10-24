import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Form, Input, InputNumber, Button, Card, Select, message, Divider } from 'antd'
import * as roomsApi from '../../../api/rooms'
import * as housesApi from '../../../api/houses'
import * as mediaApi from '../../../api/media'
import PageHeader from '../../../components/common/PageHeader'
import MediaUploader from '../../../components/common/MediaUploader'

let seq = 0
const uid = () => `pending-${Date.now()}-${seq++}`

export default function RoomForm() {
  const navigate = useNavigate()
  const { id, houseId } = useParams()
  const isEdit = Boolean(id)
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [houses, setHouses] = useState([])
  const [media, setMedia] = useState([])
  const [pendingImages, setPendingImages] = useState([])
  const [pendingVideo, setPendingVideo] = useState(null)

  useEffect(() => {
    if (!houseId) {
      housesApi.getAll({ per_page: 100 }).then((res) => {
        const data = res.data.data || res.data
        setHouses(Array.isArray(data) ? data : data.houses || [])
      })
    }
  }, [houseId])

  useEffect(() => {
    if (isEdit) {
      setFetching(true)
      roomsApi
        .getById(id)
        .then((res) => {
          const room = res.data.data || res.data
          form.setFieldsValue(room)
          setMedia(
            (room.media || []).map((m) => ({ id: m.id, type: m.type, url: m.display_url || m.url }))
          )
        })
        .catch(() => message.error('Failed to load room'))
        .finally(() => setFetching(false))
    }
  }, [id, isEdit, form])

  const uploadImage = async (file) => {
    if (isEdit) {
      const fd = new FormData()
      fd.append('type', 'image')
      fd.append('file', file)
      const res = await mediaApi.uploadRoomMedia(id, fd)
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
      const res = await mediaApi.uploadRoomMedia(id, fd)
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
      const res = await mediaApi.uploadRoomMedia(id, fd)
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

  const uploadPending = async (roomId) => {
    for (const img of pendingImages) {
      const fd = new FormData()
      fd.append('type', 'image')
      fd.append('file', img.file)
      await mediaApi.uploadRoomMedia(roomId, fd)
    }
    if (pendingVideo) {
      const fd = new FormData()
      fd.append('type', 'video')
      if (pendingVideo.file) fd.append('file', pendingVideo.file)
      else fd.append('url', pendingVideo.url)
      await mediaApi.uploadRoomMedia(roomId, fd)
    }
  }

  const onFinish = async (values) => {
    setLoading(true)
    try {
      const payload = { ...values }
      if (isEdit) {
        await roomsApi.update(id, payload)
        message.success('Room updated successfully')
        navigate(`/owner/rooms/${id}`)
      } else {
        const targetHouseId = houseId || payload.house_id
        if (!targetHouseId) {
          message.error('Please select a house')
          setLoading(false)
          return
        }
        delete payload.house_id
        const res = await roomsApi.create(targetHouseId, payload)
        const newRoom = res.data.data || res.data
        await uploadPending(newRoom.id)
        message.success('Room created successfully')
        navigate(`/owner/houses/${targetHouseId}`)
      }
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
        title={isEdit ? 'Edit Room' : 'Add Room'}
        onBack={() => navigate(-1)}
      />
      <Card loading={fetching}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          style={{ maxWidth: 600 }}
        >
          {!isEdit && !houseId && (
            <Form.Item
              name="house_id"
              label="House"
              rules={[{ required: true, message: 'Please select a house' }]}
            >
              <Select
                placeholder="Select a house"
                options={houses.map((h) => ({ value: h.id, label: h.name }))}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
          )}
          <Form.Item
            name="name"
            label="Room Name"
            rules={[{ required: true, message: 'Please enter room name' }]}
          >
            <Input placeholder="e.g. Room 101" />
          </Form.Item>
          <Form.Item
            name="rent_amount"
            label="Rent Amount (TZS)"
            rules={[{ required: true, message: 'Please enter rent amount' }]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              placeholder="e.g. 150000"
              formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(val) => val.replace(/,/g, '')}
            />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Optional description" />
          </Form.Item>

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
              {isEdit ? 'Update Room' : 'Create Room'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
