import api from '@/lib/api';

export const courseService = {
  async listCourses(params: { page?: number; limit?: number; isPremium?: boolean }) {
    const { data } = await api.get('/admin/courses', { params });
    return data.data as {
      courses: Array<{
        id: string;
        title: string;
        description: string | null;
        level: string | null;
        isPremium: boolean;
        price: number;
        isPublished: boolean;
        totalLessons: number;
        createdAt: string;
        updatedAt: string;
      }>;
      total: number;
      page: number;
      limit: number;
    };
  },

  async createCourse(body: {
    title: string;
    description?: string;
    level?: string;
    isPremium?: boolean;
    price?: number;
  }) {
    const { data } = await api.post('/admin/courses', body);
    return data.data;
  },

  async updateCourse(
    id: string,
    body: {
      title?: string;
      description?: string;
      level?: string;
      isPremium?: boolean;
      isPublished?: boolean;
      price?: number;
    },
  ) {
    const { data } = await api.patch(`/admin/courses/${id}`, body);
    return data.data;
  },
};
