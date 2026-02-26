'use client';

import { Typography } from 'antd';
import { useAppSelector } from '@/store/hooks';
import { getTokens } from '@/lib/theme';

const { Title, Text } = Typography;

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  const mode = useAppSelector((state) => state.theme.mode);
  const t = getTokens(mode);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 28,
      }}
    >
      <div>
        <Title level={3} style={{ margin: 0, color: t.textPrimary, fontWeight: 700 }}>
          {title}
        </Title>
        {subtitle && (
          <Text
            style={{
              color: t.textMuted,
              fontSize: 14,
              marginTop: 4,
              display: 'block',
            }}
          >
            {subtitle}
          </Text>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
