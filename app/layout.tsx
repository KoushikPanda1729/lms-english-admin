'use client';

import { ConfigProvider } from 'antd';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { GoogleOAuthProvider } from '@react-oauth/google';
import StoreProvider from '@/store/StoreProvider';
import { useAppSelector } from '@/store/hooks';
import { getThemeConfig } from '@/lib/theme';
import './globals.css';

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const mode = useAppSelector((state) => state.theme.mode);
  const themeConfig = getThemeConfig(mode);

  return (
    <ConfigProvider theme={themeConfig}>
      <div className={mode === 'dark' ? 'theme-dark' : 'theme-light'}>{children}</div>
    </ConfigProvider>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>SpeakEasy Admin | English Speaking App</title>
        <meta
          name="description"
          content="Admin portal for managing the English Speaking application"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
          <StoreProvider>
            <AntdRegistry>
              <ThemeWrapper>{children}</ThemeWrapper>
            </AntdRegistry>
          </StoreProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
