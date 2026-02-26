import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AdminUser } from '@/types';

interface UserState {
  currentUser: AdminUser | null;
}

const initialState: UserState = {
  currentUser: {
    name: 'Admin User',
    email: 'admin@speakeasy.app',
    role: 'super_admin',
  },
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<AdminUser>) => {
      state.currentUser = action.payload;
    },
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
  },
});

export const { setCurrentUser, clearCurrentUser } = userSlice.actions;
export default userSlice.reducer;
