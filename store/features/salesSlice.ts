import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SaleItem {
  productId: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface Sale {
  id: string;
  items: SaleItem[];
  total: number;
  timestamp: string;
  status: 'pending' | 'completed' | 'cancelled';
}

interface SalesState {
  items: Sale[];
  loading: boolean;
  error: string | null;
  currentSale: Sale | null;
}

const initialState: SalesState = {
  items: [],
  loading: false,
  error: null,
  currentSale: null,
};

export const salesSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    setSales: (state, action: PayloadAction<Sale[]>) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    addSale: (state, action: PayloadAction<Sale>) => {
      state.items.push(action.payload);
    },
    updateSale: (state, action: PayloadAction<Sale>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteSale: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    setCurrentSale: (state, action: PayloadAction<Sale | null>) => {
      state.currentSale = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setSales,
  addSale,
  updateSale,
  deleteSale,
  setCurrentSale,
  setLoading,
  setError,
} = salesSlice.actions;

export default salesSlice.reducer; 