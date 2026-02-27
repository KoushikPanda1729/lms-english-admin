import api from '@/lib/api';

export interface CouponData {
  id: string;
  code: string;
  discountPercent: number;
  courseId: string | null;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export const couponService = {
  async listCoupons(params: { page?: number; limit?: number; isActive?: boolean }) {
    const { data } = await api.get('/admin/coupons', { params });
    return data.data as {
      coupons: CouponData[];
      total: number;
      page: number;
      limit: number;
    };
  },

  async createCoupon(body: {
    code: string;
    discountPercent: number;
    courseId?: string | null;
    maxUses?: number | null;
    expiresAt?: string | null;
  }) {
    const { data } = await api.post('/admin/coupons', body);
    return data.data as CouponData;
  },

  async updateCoupon(
    id: string,
    body: { isActive?: boolean; maxUses?: number | null; expiresAt?: string | null },
  ) {
    const { data } = await api.patch(`/admin/coupons/${id}`, body);
    return data.data as CouponData;
  },

  async deleteCoupon(id: string) {
    await api.delete(`/admin/coupons/${id}`);
  },
};
