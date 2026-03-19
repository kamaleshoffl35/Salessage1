import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../api/axiosInstance";

const API_URL = "/categories";

export const fetchCategories = createAsyncThunk(
  "categories/fetch",
  async () => {
    const res = await API.get(API_URL);
    return res.data;
  }
);

export const addCategory = createAsyncThunk(
  "categories/add",
  async (data) => {
    const res = await API.post(API_URL, data);
    return res.data;
  }
);

export const updateCategory = createAsyncThunk(
  "categories/update",
  async ({ id, data }) => {
    const res = await API.put(`${API_URL}/${id}`, data);
    return res.data;
  }
);

export const deleteCategory = createAsyncThunk(
  "categories/delete",
  async (id) => {
    await API.delete(`${API_URL}/${id}`);
    return id;
  }
);

const categorySlice = createSlice({
  name: "categories",

  initialState: {
    items: [],
    status: "idle",
  },

  reducers: {},

  extraReducers: (builder) => {

    builder

    .addCase(fetchCategories.fulfilled,(state,action)=>{
      state.items = action.payload
    })

    .addCase(addCategory.fulfilled,(state,action)=>{
      state.items.push(action.payload)
    })

    .addCase(updateCategory.fulfilled,(state,action)=>{
      const index = state.items.findIndex(
        c => c._id === action.payload._id
      )

      if(index !== -1){
        state.items[index] = action.payload
      }
    })

    .addCase(deleteCategory.fulfilled,(state,action)=>{
      state.items = state.items.filter(
        c => c._id !== action.payload
      )
    })

  }

});

export default categorySlice.reducer;