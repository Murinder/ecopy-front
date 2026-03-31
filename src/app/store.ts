import { configureStore } from '@reduxjs/toolkit';
import { coreApi } from '../services/coreApi';
import { projectApi } from '../services/projectApi';
import authReducer from '../features/auth/authSlice';

export const store = configureStore({
  reducer: {
    [coreApi.reducerPath]: coreApi.reducer,
    [projectApi.reducerPath]: projectApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(coreApi.middleware, projectApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
