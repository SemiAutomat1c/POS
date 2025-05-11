import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Customer } from '@/lib/models/Customer';
import { 
  getCustomers, 
  addCustomer, 
  updateCustomer, 
  deleteCustomer 
} from '@/lib/db-models';

interface CustomerState {
  items: Customer[];
  currentCustomer: Customer | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: CustomerState = {
  items: [],
  currentCustomer: null,
  status: 'idle',
  error: null,
};

// Async thunks
export const fetchCustomers = createAsyncThunk(
  'customers/fetchCustomers',
  async () => {
    try {
      return await getCustomers();
    } catch (error) {
      throw new Error('Failed to fetch customers');
    }
  }
);

export const createCustomer = createAsyncThunk(
  'customers/createCustomer',
  async (customer: Omit<Customer, 'id'>) => {
    try {
      const id = await addCustomer(customer);
      return { ...customer, id } as Customer;
    } catch (error) {
      throw new Error('Failed to create customer');
    }
  }
);

export const modifyCustomer = createAsyncThunk(
  'customers/modifyCustomer',
  async (customer: Customer) => {
    try {
      await updateCustomer(customer);
      return customer;
    } catch (error) {
      throw new Error('Failed to update customer');
    }
  }
);

export const removeCustomer = createAsyncThunk(
  'customers/removeCustomer',
  async (id: number) => {
    try {
      await deleteCustomer(id);
      return id;
    } catch (error) {
      throw new Error('Failed to delete customer');
    }
  }
);

const customerSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    setCurrentCustomer: (state, action: PayloadAction<Customer | null>) => {
      state.currentCustomer = action.payload;
    },
    clearCustomers: (state) => {
      state.items = [];
      state.currentCustomer = null;
      state.status = 'idle';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch customers
      .addCase(fetchCustomers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch customers';
      })
      
      // Create customer
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.currentCustomer = action.payload;
        state.error = null;
      })
      
      // Update customer
      .addCase(modifyCustomer.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentCustomer?.id === action.payload.id) {
          state.currentCustomer = action.payload;
        }
        state.error = null;
      })
      
      // Delete customer
      .addCase(removeCustomer.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
        if (state.currentCustomer?.id === action.payload) {
          state.currentCustomer = null;
        }
        state.error = null;
      });
  },
});

export const { setCurrentCustomer, clearCustomers } = customerSlice.actions;
export default customerSlice.reducer; 