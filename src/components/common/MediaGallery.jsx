import { useState } from 'react';
import { Image, Empty } from 'antd';
import VideoThumb from './VideoThumb';
import VideoLightbox from './VideoLightbox';

/**
 * Read-only viewer for a listing's photos and optional video. Images open in a
 * shared preview lightbox; the video shows as a small autoplaying muted tile in
 * the same row and opens full-size (with controls) when clicked.
 */
export default function MediaGallery({ images = [], video, thumbSize = 120, emptyText = 'No photos yet' }) {
  const [videoOpen, setVideoOpen] = useState(false);
  const valid = (images || []).filter(Boolean);

  if (valid.length === 0 && !video) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={emptyText} />;
  }

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'flex-start' }}>
        {valid.length > 0 && (
          <Image.PreviewGroup>
            {valid.map((src, i) => (
              <Image
                key={i}
                src={src}
                width={thumbSize}
                height={thumbSize}
                style={{ objectFit: 'cover', borderRadius: 8 }}
              />
            ))}
          </Image.PreviewGroup>
        )}
        {video && <VideoThumb url={video} size={thumbSize} onClick={() => setVideoOpen(true)} />}
      </div>
      <VideoLightbox open={videoOpen} url={video} onClose={() => setVideoOpen(false)} />
    </div>
  );
}
