'use client';

import { Card, Typography } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { useAppSelector } from '@/store/hooks';
import { getTokens } from '@/lib/theme';
import type { StatsCardData } from '@/types';

const { Text, Title } = Typography;

export default function StatsCard({ data }: { data: StatsCardData }) {
  const isIncrease = data.changeType === 'increase';
  const mode = useAppSelector((state) => state.theme.mode);
  const t = getTokens(mode);

  return (
    <Card
      className="stats-card"
      style={{
        borderRadius: 14,
        background: t.bgCard,
        overflow: 'hidden',
        position: 'relative',
      }}
      styles={{ body: { padding: 24 } }}
    >
      {/* Accent glow */}
      <div
        style={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: data.color,
          opacity: mode === 'dark' ? 0.08 : 0.12,
          filter: 'blur(20px)',
        }}
      />

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <div>
          <Text
            style={{
              color: t.textMuted,
              fontSize: 13,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              display: 'block',
              marginBottom: 8,
            }}
          >
            {data.title}
          </Text>
          <Title
            level={2}
            style={{
              margin: 0,
              color: t.textPrimary,
              fontWeight: 700,
              fontSize: 28,
            }}
          >
            {data.value}
          </Title>
          {data.change !== undefined && (
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              {isIncrease ? (
                <ArrowUpOutlined style={{ color: '#00B894', fontSize: 12 }} />
              ) : (
                <ArrowDownOutlined style={{ color: '#FF7675', fontSize: 12 }} />
              )}
              <Text
                style={{
                  color: isIncrease ? '#00B894' : '#FF7675',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {data.change}%
              </Text>
              <Text style={{ color: t.textMuted, fontSize: 12 }}>vs last month</Text>
            </div>
          )}
        </div>

        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: `${data.color}18`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            color: data.color,
          }}
        >
          {data.icon}
        </div>
      </div>
    </Card>
  );
}
