import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../api/axiosInstance";

const API_URL = "/categories";
export const fetchCategories = createAsyncThunk("categories/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const res = await API.get(API_URL);
    return res.data;
  } catch (error) {
    console.error("Fetch categories error:", error.response?.data || error.message);
    return rejectWithValue(error.response?.data || error.message);
  }
});


export const addCategory = createAsyncThunk("categories/add", async (category, { rejectWithValue }) => {
  try {
    const res = await API.post(API_URL, category);
    return res.data;
  } catch (error) {
    console.error("Add category error:", error.response?.data || error.message);
    return rejectWithValue(error.response?.data || error.message);
  }
});


export const deleteCategory = createAsyncThunk("categories/delete", async (id, { rejectWithValue }) => {
  try {
    await API.delete(`${API_URL}/${id}`);
    return id;
  } catch (error) {
    console.error("Delete category error:", error.response?.data || error.message);
    return rejectWithValue(error.response?.data || error.message);
  }
});


export const updateCategory = createAsyncThunk("categories/update", async ({ id, updatedData }, { rejectWithValue }) => {
  try {
    const res = await API.put(`${API_URL}/${id}`, updatedData);
    return res.data;
  } catch (error) {
    console.error("Update category error:", error.response?.data || error.message);
    return rejectWithValue(error.response?.data || error.message);
  }
});


const categorySlice = createSlice({
  name: "categories",
  initialState: {
    items: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })
      .addCase(addCategory.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.items = state.items.filter((c) => c._id !== action.payload);
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.items.findIndex((c) => c._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  },
});

export default categorySlice.reducer;
