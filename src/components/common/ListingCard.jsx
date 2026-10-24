import { useState } from 'react';
import { Button, Card, Space, Tag, Typography } from 'antd';
import {
  CheckCircleOutlined,
  CloseOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  PlayCircleFilled,
  TeamOutlined,
} from '@ant-design/icons';
import CurrencyDisplay from './CurrencyDisplay';
import VideoEmbed from './VideoEmbed';

const { Title, Text } = Typography;

const NAVY = '#0a2a4d';
const GREEN = '#0d6e3f';

const DEFAULT_LABELS = {
  viewRooms: 'View Rooms',
  playVideo: 'Play video',
  rentFrom: 'Rent from',
  addressFallback: 'Address not provided',
  roomsAvailable: (n) => `${n} room${n === 1 ? '' : 's'} available`,
  ownerLabel: 'Owner',
  verifiedOwner: 'Verified owner',
};

/**
 * Shared house card for the landing page and the public listings grid. The
 * cover shows the first photo with an inline "Play video" button that swaps the
 * cover for the clip in place (with a close button to restore it). The whole
 * card navigates to the house detail page, except while a video is playing.
 *
 * `labels` overrides the default (English) copy so pages can localise it;
 * `showOwner` hides the owner row where it is not relevant (e.g. the landing page).
 */
export default function ListingCard({ house, labels, showOwner = true, onClick }) {
  const t = { ...DEFAULT_LABELS, ...(labels || {}) };
  const [playing, setPlaying] = useState(false);

  const cover = house.images?.[0];
  const hasVideo = Boolean(house.video);

  const open = () => {
    if (playing) return;
    if (onClick) onClick();
  };

  return (
    <Card
      hoverable
      style={{ borderRadius: 12, height: '100%' }}
      onClick={open}
      cover={
        <div
          style={{ position: 'relative', height: 180, background: '#f0f2f5', overflow: 'hidden' }}
        >
          {playing && hasVideo ? (
            <>
              <VideoEmbed
                url={house.video}
                variant="full"
                style={{ height: 180, objectFit: 'cover', borderRadius: 0 }}
              />
              <Button
                type="primary"
                shape="circle"
                size="small"
                icon={<CloseOutlined />}
                aria-label="Close video"
                onClick={(e) => {
                  e.stopPropagation();
                  setPlaying(false);
                }}
                style={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}
              />
            </>
          ) : (
            <>
              {cover ? (
                <img
                  alt={house.name}
                  src={cover}
                  style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }}
                />
              ) : (
                <div
                  style={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#bfbfbf',
                  }}
                >
                  <HomeOutlined style={{ fontSize: 40 }} />
                </div>
              )}
              {hasVideo && (
                <Button
                  type="primary"
                  icon={<PlayCircleFilled />}
                  onClick={(e) => {
                    e.stopPropagation();
                    setPlaying(true);
                  }}
                  style={{ position: 'absolute', left: 12, bottom: 12, zIndex: 2 }}
                >
                  {t.playVideo}
                </Button>
              )}
            </>
          )}
        </div>
      }
    >
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <Title level={4} style={{ margin: 0, color: NAVY }}>
          {house.name}
        </Title>
        <Text type="secondary">
          <EnvironmentOutlined /> {house.address || t.addressFallback}
        </Text>
        <Tag color="green">{t.roomsAvailable(house.available_rooms)}</Tag>
        {showOwner && (
          <Space size={6} wrap>
            <Text type="secondary" style={{ fontSize: 12 }}>
              <TeamOutlined /> {t.ownerLabel}: {house.owner?.name || 'N/A'}
            </Text>
            {house.owner?.verified && (
              <Tag color="green" icon={<CheckCircleOutlined />}>
                {t.verifiedOwner}
              </Tag>
            )}
          </Space>
        )}
        <div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {t.rentFrom}
          </Text>
          <div style={{ fontSize: 20, fontWeight: 700, color: GREEN }}>
            <CurrencyDisplay amount={house.min_rent} />
          </div>
        </div>
        <Button
          type="primary"
          block
          style={{ marginTop: 8 }}
          onClick={(e) => {
            e.stopPropagation();
            if (onClick) onClick();
          }}
        >
          {t.viewRooms}
        </Button>
      </Space>
    </Card>
  );
}
