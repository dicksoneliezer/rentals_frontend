import { PlayCircleFilled } from '@ant-design/icons';
import VideoEmbed from './VideoEmbed';

/**
 * Tiny video preview overlaid on listing cards. It is pointer-events: none so
 * the whole card stays clickable, and it only mounts the clip when `active`
 * (typically while the card is hovered) to keep grid pages light. When idle it
 * shows a play glyph instead.
 */
export default function VideoBadge({ url, active = false, style }) {
  if (!url) return null;

  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: '#000',
        pointerEvents: 'none',
        ...style,
      }}
    >
      {active ? (
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
      ) : (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.4)',
          }}
        >
          <PlayCircleFilled style={{ fontSize: 20, color: '#fff' }} />
        </div>
      )}
    </div>
  );
}
