// ==========================================
// App-wide Constants
// ==========================================

export const APP_NAME = 'SpeakEasy Admin';
export const APP_DESCRIPTION = 'Admin portal for managing the English Speaking App';

// Route paths
export const ROUTES = {
  DASHBOARD: '/dashboard',
  USERS: '/users',
  COURSES: '/courses',
  LESSONS: '/lessons',
  REPORTS: '/reports',
  COUPONS: '/coupons',
  NOTIFICATIONS: '/notifications',
  ANALYTICS: '/analytics',
  SETTINGS: '/settings',
  LOGIN: '/login',
} as const;

// Sidebar menu keys (match route segments)
export const MENU_KEYS = {
  DASHBOARD: 'dashboard',
  USERS: 'users',
  COURSES: 'courses',
  LESSONS: 'lessons',
  REPORTS: 'reports',
  COUPONS: 'coupons',
  NOTIFICATIONS: 'notifications',
  ANALYTICS: 'analytics',
  SETTINGS: 'settings',
} as const;

// Level colors
export const LEVEL_COLORS: Record<string, string> = {
  beginner: '#00B894',
  intermediate: '#FDCB6E',
  advanced: '#FF7675',
};

// Status colors
export const STATUS_COLORS: Record<string, string> = {
  active: '#00B894',
  inactive: '#9D9DB5',
  banned: '#FF7675',
  published: '#00B894',
  draft: '#FDCB6E',
  archived: '#9D9DB5',
  pending: '#FDCB6E',
  reviewed: '#00B894',
  dismissed: '#9D9DB5',
};

// Lesson type colors
export const LESSON_TYPE_COLORS: Record<string, string> = {
  vocabulary: '#6C5CE7',
  grammar: '#00B894',
  speaking: '#FDCB6E',
  listening: '#74B9FF',
  reading: '#A29BFE',
  writing: '#FF7675',
};
