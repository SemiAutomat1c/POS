import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Product } from '@/lib/models/Product';
import { getProducts, addProduct, updateProduct, deleteProduct } from '../../lib/db-models';

interface ProductState {
  items: Product[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ProductState = {
  items: [],
  status: 'idle',
  error: null,
};

// Async thunks
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async () => {
    try {
      const products = await getProducts();
      return products;
    } catch (error) {
      throw new Error('Failed to fetch products');
    }
  }
);

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (product: Omit<Product, 'id'>, { rejectWithValue }) => {
    try {
      console.log("Creating product in Redux slice:", product);
      
      // Validate required fields
      if (!product.name) {
        return rejectWithValue('Product name is required');
      }
      
      if (typeof product.price !== 'number' || product.price < 0) {
        return rejectWithValue('Valid product price is required');
      }
      
      // Normalize data to prevent constraint violations
      const normalizedProduct: Omit<Product, 'id'> = {
        ...product,
        serialNumber: product.serialNumber || undefined,
        sku: product.sku || undefined,
        barcode: product.barcode || undefined,
        brand: product.brand || undefined,
        model: product.model || undefined,
        color: product.color || undefined,
        storage: product.storage || undefined,
        condition: product.condition || 'new',
      };
      
      const id = await addProduct(normalizedProduct);
      return { ...normalizedProduct, id } as Product;
    } catch (error) {
      console.error("Error in createProduct thunk:", error);
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to create product'
      );
    }
  }
);

export const modifyProduct = createAsyncThunk(
  'products/modifyProduct',
  async (product: Product) => {
    try {
      await updateProduct(product);
      return product;
    } catch (error) {
      throw new Error('Failed to update product');
    }
  }
);

export const removeProduct = createAsyncThunk(
  'products/removeProduct',
  async (id: number) => {
    try {
      await deleteProduct(id);
      return id;
    } catch (error) {
      throw new Error('Failed to delete product');
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    // Additional synchronous reducers can be added here
    setLowStockThreshold: (state, action: PayloadAction<number>) => {
      // This is just an example of a synchronous reducer
      // We'd implement appropriate logic here
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch products';
      })
      // Create product
      .addCase(createProduct.pending, (state) => {
        console.log("Creating product - pending");
        state.status = 'loading';
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        console.log("Creating product - fulfilled:", action.payload);
        state.status = 'succeeded';
        state.items.push(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        console.log("Creating product - rejected:", action.error);
        state.status = 'failed';
        state.error = action.error.message || 'Failed to create product';
      })
      // Update product
      .addCase(modifyProduct.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      // Delete product
      .addCase(removeProduct.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

export const { setLowStockThreshold } = productSlice.actions;
export default productSlice.reducer; 