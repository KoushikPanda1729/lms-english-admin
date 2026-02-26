import { configureStore } from '@reduxjs/toolkit';
import sidebarReducer from './slices/sidebarSlice';
import userReducer from './slices/userSlice';
import themeReducer from './slices/themeSlice';

export const store = configureStore({
  reducer: {
    sidebar: sidebarReducer,
    user: userReducer,
    theme: themeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
