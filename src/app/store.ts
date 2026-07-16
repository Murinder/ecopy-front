import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { coreApi } from '../services/coreApi';
import { projectApi } from '../services/projectApi';
import { eventApi } from '../services/eventApi';
import { reportApi } from '../services/reportApi';
import { ratingApi } from '../services/ratingApi';
import authReducer from '../features/auth/authSlice';

export const store = configureStore({
  reducer: {
    [coreApi.reducerPath]: coreApi.reducer,
    [projectApi.reducerPath]: projectApi.reducer,
    [eventApi.reducerPath]: eventApi.reducer,
    [reportApi.reducerPath]: reportApi.reducer,
    [ratingApi.reducerPath]: ratingApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      coreApi.middleware,
      projectApi.middleware,
      eventApi.middleware,
      reportApi.middleware,
      ratingApi.middleware,
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
