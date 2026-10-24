import { PlayCircleFilled } from '@ant-design/icons';
import VideoEmbed from './VideoEmbed';

/**
 * A small autoplaying, muted video tile used inside galleries and editors. The
 * clip fills the square (object-fit: cover) and a play glyph marks it as a
 * video; clicking the tile invokes onClick (e.g. to open the full lightbox).
 */
export default function VideoThumb({ url, size = 120, onClick, style }) {
  if (!url) return null;

  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative',
        width: size,
        height: size,
        flex: '0 0 auto',
        borderRadius: 8,
        overflow: 'hidden',
        background: '#000',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      <VideoEmbed
        url={url}
        variant="preview"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: 0,
        }}
      />
      {onClick && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.12)',
          }}
        >
          <PlayCircleFilled style={{ fontSize: Math.max(24, size * 0.3), color: 'rgba(255, 255, 255, 0.92)' }} />
        </div>
      )}
    </div>
  );
}
