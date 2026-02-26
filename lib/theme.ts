import type { ThemeConfig } from 'antd';
import type { ThemeMode } from '@/store/slices/themeSlice';

// ==========================================
// Dark Theme
// ==========================================
const darkTheme: ThemeConfig = {
  token: {
    colorPrimary: '#6C5CE7',
    colorInfo: '#6C5CE7',
    colorSuccess: '#00B894',
    colorWarning: '#FDCB6E',
    colorError: '#FF7675',

    colorBgBase: '#0F0F1A',
    colorBgContainer: '#1A1A2E',
    colorBgElevated: '#1E1E35',
    colorBgLayout: '#0F0F1A',
    colorBgSpotlight: '#2D2D4A',

    colorText: '#E8E8F0',
    colorTextSecondary: '#9D9DB5',
    colorTextTertiary: '#6B6B85',
    colorTextQuaternary: '#4A4A65',

    colorBorder: '#2D2D4A',
    colorBorderSecondary: '#232340',

    borderRadius: 10,
    borderRadiusLG: 14,
    borderRadiusSM: 6,

    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: 14,
    controlHeight: 40,

    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(108, 92, 231, 0.05)',
    boxShadowSecondary: '0 8px 32px rgba(0, 0, 0, 0.35)',
  },
  components: {
    Layout: {
      headerBg: '#1A1A2E',
      siderBg: '#12122A',
      bodyBg: '#0F0F1A',
      headerHeight: 64,
    },
    Menu: {
      darkItemBg: 'transparent',
      darkItemSelectedBg: 'rgba(108, 92, 231, 0.15)',
      darkItemHoverBg: 'rgba(108, 92, 231, 0.08)',
      darkItemSelectedColor: '#6C5CE7',
      darkItemColor: '#9D9DB5',
      itemBorderRadius: 10,
      iconSize: 18,
      itemMarginBlock: 4,
      itemMarginInline: 8,
      itemPaddingInline: 16,
    },
    Card: {
      colorBgContainer: '#1A1A2E',
      colorBorderSecondary: '#2D2D4A',
      paddingLG: 24,
    },
    Table: {
      colorBgContainer: '#1A1A2E',
      headerBg: '#16162E',
      headerColor: '#9D9DB5',
      rowHoverBg: 'rgba(108, 92, 231, 0.06)',
      borderColor: '#2D2D4A',
    },
    Button: {
      primaryShadow: '0 4px 14px rgba(108, 92, 231, 0.35)',
      defaultBg: '#1A1A2E',
      defaultBorderColor: '#2D2D4A',
      defaultColor: '#E8E8F0',
    },
    Input: {
      colorBgContainer: '#16162E',
      colorBorder: '#2D2D4A',
      activeBorderColor: '#6C5CE7',
      hoverBorderColor: '#6C5CE7',
    },
    Select: {
      colorBgContainer: '#16162E',
      colorBorder: '#2D2D4A',
      optionSelectedBg: 'rgba(108, 92, 231, 0.15)',
    },
    Tag: {
      defaultBg: 'rgba(108, 92, 231, 0.1)',
      defaultColor: '#B8B0E8',
    },
    Badge: {
      colorBgContainer: '#1A1A2E',
    },
    Modal: {
      contentBg: '#1A1A2E',
      headerBg: '#1A1A2E',
    },
    Tooltip: {
      colorBgSpotlight: '#2D2D4A',
    },
  },
};

// ==========================================
// Light Theme
// ==========================================
const lightTheme: ThemeConfig = {
  token: {
    colorPrimary: '#6C5CE7',
    colorInfo: '#6C5CE7',
    colorSuccess: '#00B894',
    colorWarning: '#F39C12',
    colorError: '#E74C3C',

    colorBgBase: '#F5F6FA',
    colorBgContainer: '#FFFFFF',
    colorBgElevated: '#FFFFFF',
    colorBgLayout: '#F5F6FA',
    colorBgSpotlight: '#EEF0F6',

    colorText: '#1A1A2E',
    colorTextSecondary: '#3D3D5C',
    colorTextTertiary: '#5C5C78',
    colorTextQuaternary: '#7A7A96',

    colorBorder: '#E2E4EC',
    colorBorderSecondary: '#ECEDF2',

    borderRadius: 10,
    borderRadiusLG: 14,
    borderRadiusSM: 6,

    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: 14,
    controlHeight: 40,

    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(108, 92, 231, 0.04)',
    boxShadowSecondary: '0 4px 20px rgba(0, 0, 0, 0.08)',
  },
  components: {
    Layout: {
      headerBg: '#FFFFFF',
      siderBg: '#FFFFFF',
      bodyBg: '#F5F6FA',
      headerHeight: 64,
    },
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: 'rgba(108, 92, 231, 0.08)',
      itemHoverBg: 'rgba(108, 92, 231, 0.04)',
      itemSelectedColor: '#6C5CE7',
      itemColor: '#3D3D5C',
      itemBorderRadius: 10,
      iconSize: 18,
      itemMarginBlock: 4,
      itemMarginInline: 8,
      itemPaddingInline: 16,
    },
    Card: {
      colorBgContainer: '#FFFFFF',
      colorBorderSecondary: '#E2E4EC',
      paddingLG: 24,
    },
    Table: {
      colorBgContainer: '#FFFFFF',
      headerBg: '#FAFBFD',
      headerColor: '#3D3D5C',
      rowHoverBg: 'rgba(108, 92, 231, 0.03)',
      borderColor: '#ECEDF2',
    },
    Button: {
      primaryShadow: '0 4px 14px rgba(108, 92, 231, 0.25)',
      defaultBg: '#FFFFFF',
      defaultBorderColor: '#E2E4EC',
      defaultColor: '#1A1A2E',
    },
    Input: {
      colorBgContainer: '#FAFBFD',
      colorBorder: '#E2E4EC',
      activeBorderColor: '#6C5CE7',
      hoverBorderColor: '#6C5CE7',
    },
    Select: {
      colorBgContainer: '#FAFBFD',
      colorBorder: '#E2E4EC',
      optionSelectedBg: 'rgba(108, 92, 231, 0.08)',
    },
    Tag: {
      defaultBg: 'rgba(108, 92, 231, 0.06)',
      defaultColor: '#6C5CE7',
    },
    Badge: {
      colorBgContainer: '#FFFFFF',
    },
    Modal: {
      contentBg: '#FFFFFF',
      headerBg: '#FFFFFF',
    },
    Tooltip: {
      colorBgSpotlight: '#1A1A2E',
    },
  },
};

// ==========================================
// Theme Tokens (for inline styles)
// ==========================================
export const themeTokens = {
  dark: {
    bgPrimary: '#0F0F1A',
    bgCard: '#1A1A2E',
    bgSidebar: '#12122A',
    bgHeader: 'rgba(26, 26, 46, 0.85)',
    bgInput: '#16162E',
    bgHover: 'rgba(108, 92, 231, 0.08)',
    bgSelected: 'rgba(108, 92, 231, 0.15)',
    textPrimary: '#E8E8F0',
    textSecondary: '#9D9DB5',
    textMuted: '#6B6B85',
    border: '#2D2D4A',
    borderLight: '#232340',
    siderTheme: 'dark' as const,
    gradient: 'linear-gradient(135deg, #6C5CE7, #A29BFE)',
    logoBg: 'linear-gradient(135deg, #6C5CE7, #A29BFE)',
    logoColor: '#fff',
    toggleBg: '#1A1A2E',
  },
  light: {
    bgPrimary: '#F5F6FA',
    bgCard: '#FFFFFF',
    bgSidebar: '#FFFFFF',
    bgHeader: 'rgba(255, 255, 255, 0.9)',
    bgInput: '#FAFBFD',
    bgHover: 'rgba(108, 92, 231, 0.04)',
    bgSelected: 'rgba(108, 92, 231, 0.08)',
    textPrimary: '#1A1A2E',
    textSecondary: '#3D3D5C',
    textMuted: '#5C5C78',
    border: '#E2E4EC',
    borderLight: '#ECEDF2',
    siderTheme: 'light' as const,
    gradient: 'linear-gradient(135deg, #6C5CE7, #A29BFE)',
    logoBg: 'linear-gradient(135deg, #6C5CE7, #A29BFE)',
    logoColor: '#fff',
    toggleBg: '#FAFBFD',
  },
};

export function getThemeConfig(mode: ThemeMode): ThemeConfig {
  return mode === 'dark' ? darkTheme : lightTheme;
}

export function getTokens(mode: ThemeMode) {
  return themeTokens[mode];
}

export default darkTheme;
