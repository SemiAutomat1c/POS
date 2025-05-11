import { configureStore } from '@reduxjs/toolkit';
import productReducer from './slices/productSlice';
import customerReducer from './slices/customerSlice';
import salesReducer from './slices/saleSlice';
import returnsReducer from './slices/returnSlice';
import notificationsReducer from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    products: productReducer,
    customers: customerReducer,
    sales: salesReducer,
    returns: returnsReducer,
    notifications: notificationsReducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: false, // Needed for Date objects
    })
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 