import api from '@/lib/api';

export const adminService = {
  async getStats() {
    const { data } = await api.get('/admin/stats');
    return data.data as {
      totalUsers: number;
      bannedUsers: number;
      totalSessions: number;
      sessionsToday: number;
      activeReports: number;
      newUsersThisWeek: number;
      totalCourses: number;
      publishedCourses: number;
      avgSessionMinutes: number;
    };
  },

  async listUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    isBanned?: boolean;
    role?: string;
  }) {
    const { data } = await api.get('/admin/users', { params });
    return data.data as {
      users: Array<{
        user: { id: string; email: string; role: string; isBanned: boolean; createdAt: string };
        profile: {
          displayName: string | null;
          username: string | null;
          avatarUrl: string | null;
        } | null;
        pendingReportsCount: number;
      }>;
      total: number;
      page: number;
      limit: number;
    };
  },

  async getUserDetail(id: string) {
    const { data } = await api.get(`/admin/users/${id}`);
    return data.data;
  },

  async banUser(id: string, banned: boolean) {
    const { data } = await api.patch(`/admin/users/${id}/ban`, { banned });
    return data.data;
  },

  async setUserRole(id: string, role: string) {
    const { data } = await api.patch(`/admin/users/${id}/role`, { role });
    return data.data;
  },

  async getUserCourses(userId: string) {
    const { data } = await api.get(`/admin/users/${userId}/courses`);
    return data.data as Array<{
      courseId: string;
      title: string;
      level: string | null;
      isPremium: boolean;
      totalLessons: number;
      progressPercent: number;
      completedLessons: number;
      enrolledAt: string;
      completedAt: string | null;
      payment: { status: string; amount: number } | null;
    }>;
  },

  async getCourseStudents(courseId: string, page = 1, limit = 20) {
    const { data } = await api.get(`/admin/courses/${courseId}/students`, {
      params: { page, limit },
    });
    return data.data as {
      students: Array<{
        userId: string;
        email: string;
        displayName: string | null;
        avatarUrl: string | null;
        progressPercent: number;
        completedLessons: number;
        enrolledAt: string;
        completedAt: string | null;
        payment: { status: string; amount: number } | null;
      }>;
      total: number;
      page: number;
      limit: number;
    };
  },

  async listReports(params: { page?: number; limit?: number; status?: string }) {
    const { data } = await api.get('/admin/reports', { params });
    return data.data as {
      reports: Array<{
        id: string;
        reporterId: string;
        reportedId: string;
        reason: string;
        description: string | null;
        status: string;
        createdAt: string;
      }>;
      total: number;
      page: number;
      limit: number;
    };
  },

  async updateReport(id: string, status: string, adminNote?: string) {
    const { data } = await api.patch(`/admin/reports/${id}`, {
      status,
      adminNote: adminNote || null,
    });
    return data.data;
  },
};
