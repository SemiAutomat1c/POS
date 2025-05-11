import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Return } from '@/lib/models/Return';
import { 
  getReturns, 
  getReturnById, 
  addReturn, 
  updateReturn, 
  deleteReturn,
  getReturnsByCustomer,
  getReturnsBySale
} from '@/lib/db-models';

interface ReturnsState {
  items: Return[];
  currentReturn: Return | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ReturnsState = {
  items: [],
  currentReturn: null,
  status: 'idle',
  error: null
};

// Async thunks
export const fetchReturns = createAsyncThunk(
  'returns/fetchAll',
  async () => {
    return await getReturns();
  }
);

export const fetchReturnById = createAsyncThunk(
  'returns/fetchById',
  async (id: number) => {
    return await getReturnById(id);
  }
);

export const fetchReturnsByCustomer = createAsyncThunk(
  'returns/fetchByCustomer',
  async (customerId: number) => {
    return await getReturnsByCustomer(customerId);
  }
);

export const fetchReturnsBySale = createAsyncThunk(
  'returns/fetchBySale',
  async (saleId: number) => {
    return await getReturnsBySale(saleId);
  }
);

export const createReturn = createAsyncThunk(
  'returns/create',
  async (returnData: Omit<Return, 'id'>) => {
    return await addReturn(returnData);
  }
);

export const modifyReturn = createAsyncThunk(
  'returns/update',
  async (returnData: Return) => {
    return await updateReturn(returnData);
  }
);

export const removeReturn = createAsyncThunk(
  'returns/delete',
  async (id: number) => {
    await deleteReturn(id);
    return id;
  }
);

// The returns slice
const returnsSlice = createSlice({
  name: 'returns',
  initialState,
  reducers: {
    setCurrentReturn: (state, action: PayloadAction<Return | null>) => {
      state.currentReturn = action.payload;
    },
    clearReturnErrors: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all returns
      .addCase(fetchReturns.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchReturns.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchReturns.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch returns';
      })
      
      // Fetch return by ID
      .addCase(fetchReturnById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchReturnById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentReturn = action.payload;
      })
      .addCase(fetchReturnById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch return';
      })
      
      // Fetch returns by customer
      .addCase(fetchReturnsByCustomer.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      
      // Fetch returns by sale
      .addCase(fetchReturnsBySale.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      
      // Create return
      .addCase(createReturn.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createReturn.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items.push(action.payload);
        state.currentReturn = action.payload;
      })
      .addCase(createReturn.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to create return';
      })
      
      // Update return
      .addCase(modifyReturn.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(modifyReturn.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.currentReturn = action.payload;
      })
      .addCase(modifyReturn.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to update return';
      })
      
      // Delete return
      .addCase(removeReturn.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(removeReturn.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = state.items.filter(item => item.id !== action.payload);
        if (state.currentReturn && state.currentReturn.id === action.payload) {
          state.currentReturn = null;
        }
      })
      .addCase(removeReturn.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to delete return';
      });
  }
});

export const { setCurrentReturn, clearReturnErrors } = returnsSlice.actions;
export default returnsSlice.reducer; 