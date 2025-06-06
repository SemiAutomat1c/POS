import { configureStore } from '@reduxjs/toolkit';
import productsReducer from './features/productsSlice';
import salesReducer from './features/salesSlice';
import customersReducer from './features/customersSlice';
import notificationsReducer from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    products: productsReducer,
    sales: salesReducer,
    customers: customersReducer,
    notifications: notificationsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
