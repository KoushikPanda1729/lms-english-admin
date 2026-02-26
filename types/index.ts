// ==========================================
// Shared TypeScript Types
// ==========================================

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  status: 'active' | 'inactive' | 'banned';
  enrolledCourses: number;
  joinedAt: string;
  lastActive: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  lessonsCount: number;
  enrolledStudents: number;
  status: 'published' | 'draft' | 'archived';
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  type: 'vocabulary' | 'grammar' | 'speaking' | 'listening' | 'reading' | 'writing';
  duration: number; // in minutes
  order: number;
  status: 'published' | 'draft';
  completionRate: number;
  createdAt: string;
}

export interface StatsCardData {
  title: string;
  value: string | number;
  change: number; // percentage change
  changeType: 'increase' | 'decrease';
  icon: React.ReactNode;
  color: string;
}

export interface ActivityItem {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
  type: 'enrollment' | 'completion' | 'achievement' | 'registration';
}

export interface AdminUser {
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'super_admin' | 'moderator';
}

export interface SidebarMenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}
