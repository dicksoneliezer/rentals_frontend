import { useMemo } from 'react';

/**
 * Turn a stored video link into an embeddable URL. YouTube/Vimeo become iframe
 * embeds; anything else (a direct MP4/WebM upload or file link) is played by a
 * native <video> element. Returns null when the URL is not an obvious embed.
 *
 * The autoplay/muted/loop flags shape the embed so the same link can be shown
 * as a silent background preview or as a full player with controls.
 */
function toEmbed(url, { autoplay, muted, loop, controls }) {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
      return youtubeEmbed(u.pathname.slice(1), { autoplay, muted, loop, controls });
    }
    if (host.endsWith('youtube.com')) {
      if (u.pathname.startsWith('/embed/')) {
        return youtubeEmbed(u.pathname.split('/')[2], { autoplay, muted, loop, controls });
      }
      if (u.pathname.startsWith('/shorts/')) {
        return youtubeEmbed(u.pathname.split('/')[2], { autoplay, muted, loop, controls });
      }
      const v = u.searchParams.get('v');
      return v ? youtubeEmbed(v, { autoplay, muted, loop, controls }) : null;
    }
    if (host.endsWith('vimeo.com')) {
      const id = u.pathname.split('/').filter(Boolean)[0];
      return id ? vimeoEmbed(id, { autoplay, muted, loop, controls }) : null;
    }
  } catch {
    return null;
  }
  return null;
}

function youtubeEmbed(id, { autoplay, muted, loop, controls }) {
  if (!id) return null;
  const params = new URLSearchParams();
  params.set('autoplay', autoplay ? '1' : '0');
  params.set('playsinline', '1');
  if (muted) params.set('mute', '1');
  if (loop) {
    params.set('loop', '1');
    // YouTube only honours loop when the video is repeated via `playlist`.
    params.set('playlist', id);
  }
  if (!controls) {
    params.set('controls', '0');
    params.set('modestbranding', '1');
  }
  return `https://www.youtube.com/embed/${id}?${params.toString()}`;
}

function vimeoEmbed(id, { autoplay, muted, loop, controls }) {
  if (!id) return null;
  const params = new URLSearchParams();
  params.set('autoplay', autoplay ? '1' : '0');
  if (muted) params.set('muted', '1');
  if (loop) params.set('loop', '1');
  if (!controls) params.set('background', '1');
  return `https://player.vimeo.com/video/${id}?${params.toString()}`;
}

/**
 * Renders an uploaded video file or a YouTube/Vimeo embed.
 *
 * `variant="preview"` autoplays silently on loop with no controls (a tiny
 * background clip); `variant="full"` is the normal player with controls.
 */
export default function VideoEmbed({
  url,
  variant = 'full',
  autoPlay,
  muted,
  loop,
  controls,
  poster,
  style,
  className,
}) {
  const isPreview = variant === 'preview';
  const shouldAutoplay = autoPlay ?? isPreview;
  const shouldMute = muted ?? isPreview;
  const shouldLoop = loop ?? isPreview;
  const showControls = controls ?? !isPreview;

  const embed = useMemo(
    () =>
      url
        ? toEmbed(url, {
            autoplay: shouldAutoplay,
            muted: shouldMute,
            loop: shouldLoop,
            controls: showControls,
          })
        : null,
    [url, shouldAutoplay, shouldMute, shouldLoop, showControls],
  );

  if (!url) return null;

  if (embed) {
    return (
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 9',
          borderRadius: 8,
          overflow: 'hidden',
          background: '#000',
          ...style,
        }}
      >
        <iframe
          src={embed}
          title="Listing video"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen={showControls}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            border: 0,
            pointerEvents: isPreview ? 'none' : 'auto',
          }}
        />
      </div>
    );
  }

  return (
    <video
      src={url}
      controls={showControls}
      autoPlay={shouldAutoplay}
      muted={shouldMute}
      loop={shouldLoop}
      playsInline
      preload="metadata"
      poster={poster}
      className={className}
      style={{ width: '100%', borderRadius: 8, display: 'block', ...style }}
    />
  );
}
