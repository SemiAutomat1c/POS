import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Sale } from '@/lib/models/Sale';
import type { Product } from '@/lib/models/Product';
import { 
  getSales, 
  getSaleById, 
  addSale, 
  updateSale, 
  deleteSale, 
  getSalesByCustomer,
  getRecentSales
} from '@/lib/db-models';
import { getProducts, updateProduct } from '@/lib/db-models';

interface SalesState {
  items: Sale[];
  currentSale: Sale | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: SalesState = {
  items: [],
  currentSale: null,
  status: 'idle',
  error: null,
};

// Async thunks
export const fetchSales = createAsyncThunk(
  'sales/fetchSales',
  async () => {
    try {
      return await getSales();
    } catch (error) {
      throw new Error('Failed to fetch sales');
    }
  }
);

export const fetchSaleById = createAsyncThunk(
  'sales/fetchSaleById',
  async (id: number) => {
    try {
      const sale = await getSaleById(id);
      if (!sale) throw new Error(`Sale with id ${id} not found`);
      return sale;
    } catch (error) {
      throw new Error('Failed to fetch sale');
    }
  }
);

export const fetchSalesByCustomer = createAsyncThunk(
  'sales/fetchSalesByCustomer',
  async (customerId: number) => {
    try {
      return await getSalesByCustomer(customerId);
    } catch (error) {
      throw new Error('Failed to fetch customer sales');
    }
  }
);

export const fetchRecentSales = createAsyncThunk(
  'sales/fetchRecentSales',
  async (days: number = 30) => {
    try {
      return await getRecentSales(days);
    } catch (error) {
      throw new Error('Failed to fetch recent sales');
    }
  }
);

export const createSale = createAsyncThunk(
  'sales/createSale',
  async (sale: Omit<Sale, 'id'>, { getState, dispatch }) => {
    try {
      // First, get all products to update inventory
      const products = await getProducts();
      
      // Get sale items to update inventory
      const saleItems = sale.items || [];
      
      // For each sale item, find the corresponding product and update its quantity
      const productUpdates = saleItems.map(item => {
        const product = products.find(p => p.id === item.productId);
        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }
        
        // Calculate new quantity after sale
        const newQuantity = Math.max(0, product.quantity - item.quantity);
        
        // Create updated product
        const updatedProduct: Product = {
          ...product,
          quantity: newQuantity
        };
        
        // Update product in database
        return updateProduct(updatedProduct);
      });
      
      // Wait for all product updates to complete
      await Promise.all(productUpdates);
      
      // Then create the sale
      const id = await addSale(sale);
      
      // Return the sale with the new ID
      return { ...sale, id } as Sale;
    } catch (error) {
      console.error('Sale creation error:', error);
      throw new Error('Failed to create sale');
    }
  }
);

export const modifySale = createAsyncThunk(
  'sales/modifySale',
  async (sale: Sale) => {
    try {
      await updateSale(sale);
      return sale;
    } catch (error) {
      throw new Error('Failed to update sale');
    }
  }
);

export const removeSale = createAsyncThunk(
  'sales/removeSale',
  async (id: number) => {
    try {
      await deleteSale(id);
      return id;
    } catch (error) {
      throw new Error('Failed to delete sale');
    }
  }
);

const salesSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    setCurrentSale: (state, action: PayloadAction<Sale | null>) => {
      state.currentSale = action.payload;
    },
    clearSales: (state) => {
      state.items = [];
      state.currentSale = null;
      state.status = 'idle';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch sales
      .addCase(fetchSales.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSales.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchSales.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch sales';
      })
      
      // Fetch sale by ID
      .addCase(fetchSaleById.fulfilled, (state, action) => {
        state.currentSale = action.payload;
        state.error = null;
      })
      
      // Fetch sales by customer
      .addCase(fetchSalesByCustomer.fulfilled, (state, action) => {
        state.items = action.payload;
        state.error = null;
      })
      
      // Fetch recent sales
      .addCase(fetchRecentSales.fulfilled, (state, action) => {
        state.items = action.payload;
        state.error = null;
      })
      
      // Create sale
      .addCase(createSale.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.currentSale = action.payload;
        state.error = null;
      })
      
      // Update sale
      .addCase(modifySale.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentSale?.id === action.payload.id) {
          state.currentSale = action.payload;
        }
        state.error = null;
      })
      
      // Delete sale
      .addCase(removeSale.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
        if (state.currentSale?.id === action.payload) {
          state.currentSale = null;
        }
        state.error = null;
      });
  },
});

export const { setCurrentSale, clearSales } = salesSlice.actions;
export default salesSlice.reducer; 