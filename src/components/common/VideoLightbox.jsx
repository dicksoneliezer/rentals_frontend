import { Modal } from 'antd';
import VideoEmbed from './VideoEmbed';

/**
 * Full-size video viewer opened from a VideoThumb. Plays with controls so the
 * visitor can scrub, adjust volume and go fullscreen.
 */
export default function VideoLightbox({ open, url, onClose, title = 'Video' }) {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      destroyOnHidden
      title={title}
      width={880}
      styles={{ body: { padding: 0, background: '#000' } }}
    >
      {url ? <VideoEmbed url={url} variant="full" style={{ borderRadius: 0 }} /> : null}
    </Modal>
  );
}
