
 
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:5000/api/products";


export const fetchProducts=createAsyncThunk("products/fetchAll", async () => {
  const user=JSON.parse(localStorage.getItem("user"));
  const token=user?.token;
  if (!token) 
    throw new Error("Token missing");
   const res=await axios.get(API_URL,{headers:{ Authorization:`Bearer ${token}` },});
  return res.data;
});

export const addProduct = createAsyncThunk("products/addProduct",async (product) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = user?.token;
      if (!token) 
        throw new Error("Token missing");
     const res = await axios.post(API_URL,product,{headers: { Authorization: `Bearer ${token}` },});
 return res.data;
    } catch (error) {
      console.error("Add product error:", error.response?.data || error.message);
      
    }
  }
);



export const deleteProduct = createAsyncThunk("products/delete", async (id) => {
  const user=JSON.parse(localStorage.getItem("user"));
  const token=user?.token;
  if (!token) 
    throw new Error("Token missing");
   await axios.delete(`${API_URL}/${id}`, {headers: { Authorization: `Bearer ${token}` },
  });
  return id;
});

export const updateProduct = createAsyncThunk(
  "products/update",
  async ({ id, updatedData }) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = user?.token;
    if (!token) throw new Error("Token missing");
    const res = await axios.put(`${API_URL}/${id}`, updatedData, {
      headers: { Authorization: `Bearer ${token}` },
    });
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
        state.status="loading";
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status="succeeded";
        state.items=action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status="failed";
        state.error=action.error.message;
      })
      
      .addCase(addProduct.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p._id !== action.payload);
      })

      .addCase(updateProduct.fulfilled, (state, action) => {
  const index = state.items.findIndex((p) => p._id === action.payload._id);
  if (index !== -1) {
    state.items[index] = action.payload;
  }
});
  },
});

export default productSlice.reducer;
