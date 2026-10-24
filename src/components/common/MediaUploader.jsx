import { useState } from 'react';
import { Upload, Button, Input, Space, Image, Typography, message } from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  VideoCameraOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import VideoThumb from './VideoThumb';
import VideoLightbox from './VideoLightbox';

const { Text } = Typography;

const MAX_IMAGE_MB = 5;
const MAX_VIDEO_MB = 20;

const tileStyle = {
  width: 96,
  height: 96,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px dashed #d9d9d9',
  borderRadius: 8,
  background: '#fafafa',
  color: '#666',
  cursor: 'pointer',
};

/**
 * Owner-facing editor for listing media. Photos are uploaded inline; a video is
 * either an uploaded file or an external YouTube/Vimeo/MP4 link (one per item).
 * The parent owns the async work via the on* handlers so both the create flow
 * (buffer until the record exists) and the edit flow (upload immediately) can
 * share this component.
 */
export default function MediaUploader({
  images = [],
  video = null,
  onAddImage,
  onAddVideoFile,
  onAddVideoUrl,
  onRemoveImage,
  onRemoveVideo,
  disabled = false,
}) {
  const [videoUrl, setVideoUrl] = useState('');
  const [working, setWorking] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);

  const run = async (fn) => {
    setWorking(true);
    try {
      await fn();
    } catch (err) {
      message.error(err?.response?.data?.message || 'Upload failed');
    } finally {
      setWorking(false);
    }
  };

  const busy = disabled || working;

  return (
    <div>
      <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
        Photos
      </Text>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {(images || []).map((img) => (
          <div key={img.key || img.id} style={{ position: 'relative' }}>
            <Image
              src={img.url}
              width={96}
              height={96}
              style={{ objectFit: 'cover', borderRadius: 8 }}
            />
            {!disabled && (
              <Button
                size="small"
                danger
                shape="circle"
                icon={<DeleteOutlined />}
                disabled={busy}
                onClick={() => run(() => onRemoveImage(img))}
                style={{ position: 'absolute', top: -6, right: -6 }}
              />
            )}
          </div>
        ))}

        <Upload
          accept="image/*"
          multiple
          showUploadList={false}
          disabled={busy}
          beforeUpload={(file) => {
            if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
              message.error(`Photo must be ${MAX_IMAGE_MB} MB or smaller.`);
              return false;
            }
            run(() => onAddImage(file));
            return false;
          }}
        >
          <div style={tileStyle}>
            <PlusOutlined />
            <div style={{ marginTop: 4, fontSize: 12 }}>Photo</div>
          </div>
        </Upload>
      </div>

      <Text type="secondary" style={{ display: 'block', margin: '20px 0 8px' }}>
        Video (optional)
      </Text>

      {video ? (
        <div>
          <VideoThumb url={video.url} size={200} onClick={() => setVideoOpen(true)} />
          {!disabled && (
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              disabled={busy}
              onClick={() => run(() => onRemoveVideo(video))}
              style={{ marginTop: 8, display: 'block' }}
            >
              Remove video
            </Button>
          )}
          <VideoLightbox open={videoOpen} url={video.url} onClose={() => setVideoOpen(false)} />
        </div>
      ) : (
        <Space direction="vertical" style={{ width: '100%', maxWidth: 480 }}>
          <Upload
            accept="video/*"
            showUploadList={false}
            disabled={busy}
            beforeUpload={(file) => {
              if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
                message.error(`Video must be ${MAX_VIDEO_MB} MB or smaller.`);
                return false;
              }
              run(() => onAddVideoFile(file));
              return false;
            }}
          >
            <Button icon={<VideoCameraOutlined />} disabled={busy} loading={working}>
              Upload a video file
            </Button>
          </Upload>
          <Space.Compact style={{ width: '100%' }}>
            <Input
              placeholder="…or paste a YouTube / Vimeo / MP4 link"
              value={videoUrl}
              disabled={busy}
              onChange={(e) => setVideoUrl(e.target.value)}
              onPressEnter={() => {
                if (!videoUrl.trim()) return;
                run(() => onAddVideoUrl(videoUrl.trim())).then(() => setVideoUrl(''));
              }}
            />
            <Button
              icon={<LinkOutlined />}
              disabled={busy || !videoUrl.trim()}
              onClick={() => run(() => onAddVideoUrl(videoUrl.trim())).then(() => setVideoUrl(''))}
            >
              Add
            </Button>
          </Space.Compact>
        </Space>
      )}
    </div>
  );
}
