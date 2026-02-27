import api from '@/lib/api';

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  type: 'video' | 'pdf' | 'text' | 'quiz';
  content: string | null;
  videoUrl: string | null;
  pdfUrl: string | null;
  order: number;
  durationMinutes: number | null;
  createdAt: string;
  updatedAt: string;
}

export const lessonService = {
  async list(courseId: string): Promise<Lesson[]> {
    const { data } = await api.get(`/admin/courses/${courseId}/lessons`);
    return data.data as Lesson[];
  },

  async create(
    courseId: string,
    body: {
      title: string;
      type: 'video' | 'pdf' | 'text' | 'quiz';
      content?: string | null;
      videoUrl?: string | null;
      order?: number;
      durationMinutes?: number | null;
    },
  ): Promise<Lesson> {
    const { data } = await api.post(`/admin/courses/${courseId}/lessons`, body);
    return data.data as Lesson;
  },

  async update(
    courseId: string,
    lessonId: string,
    body: {
      title?: string;
      content?: string | null;
      videoUrl?: string | null;
      order?: number;
      durationMinutes?: number | null;
    },
  ): Promise<Lesson> {
    const { data } = await api.patch(`/admin/courses/${courseId}/lessons/${lessonId}`, body);
    return data.data as Lesson;
  },

  async delete(courseId: string, lessonId: string): Promise<void> {
    await api.delete(`/admin/courses/${courseId}/lessons/${lessonId}`);
  },

  async uploadVideo(courseId: string, lessonId: string, file: File): Promise<Lesson> {
    const form = new FormData();
    form.append('video', file);
    const { data } = await api.post(`/admin/courses/${courseId}/lessons/${lessonId}/video`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data as Lesson;
  },

  async uploadPdf(courseId: string, lessonId: string, file: File): Promise<Lesson> {
    const form = new FormData();
    form.append('pdf', file);
    const { data } = await api.post(`/admin/courses/${courseId}/lessons/${lessonId}/pdf`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data as Lesson;
  },

  async getQuiz(courseId: string, lessonId: string) {
    const { data } = await api.get(`/admin/courses/${courseId}/lessons/${lessonId}/quiz`);
    return data.data as {
      id: string;
      title: string;
      passingScore: number;
      questions: {
        id: string;
        question: string;
        type: 'single' | 'multiple';
        order: number;
        options: { id: string; text: string; isCorrect: boolean }[];
      }[];
    };
  },

  async createQuiz(
    courseId: string,
    lessonId: string,
    body: {
      title: string;
      passingScore?: number;
      questions: {
        question: string;
        type: 'single' | 'multiple';
        order?: number;
        options: { text: string; isCorrect: boolean }[];
      }[];
    },
  ) {
    const { data } = await api.post(`/admin/courses/${courseId}/lessons/${lessonId}/quiz`, body);
    return data.data;
  },
};
