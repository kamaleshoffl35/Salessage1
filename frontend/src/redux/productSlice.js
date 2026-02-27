import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../api/axiosInstance";
const API_URL = "/products"; 
export const fetchProducts = createAsyncThunk("products/fetchAll", async () => {
  const res = await API.get(API_URL);
  return res.data;
});
export const addProduct = createAsyncThunk(
  "products/addProduct",
  async (product) => {
    const res = await API.post(API_URL, product);
    return res.data;
  }
);
export const deleteProduct = createAsyncThunk("products/delete", async (id) => {
  await API.delete(`${API_URL}/${id}`);
  return id;
});
export const updateProduct = createAsyncThunk(
  "products/update",
  async ({ id, updatedData }) => {
    const res = await API.put(`${API_URL}/${id}`, updatedData);
    return res.data;
  }
);
export const bulkAddProducts = createAsyncThunk("products/bulkAdd",async (products) => {
    const res = await API.post("/products/bulk", { products });
    return res.data;
  }
);
const productSlice = createSlice({
  name: "products",
  initialState: {
    items: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p._id !== action.payload);
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (p) => p._id === action.payload._id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  },
});
export default productSlice.reducer;
