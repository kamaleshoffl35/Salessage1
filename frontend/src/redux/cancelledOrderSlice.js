import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import API from "../api/axiosInstance";

const API_URL = "/orders";
export const fetchCancelledOrders = createAsyncThunk(
  "cancelledOrders/fetchCancelledOrders",
  async () => {
    const res = await API.get(`${API_URL}/cancelled-orders`, {
      headers: {
        "x-tenant-id": "chakkarapani",
      },
      withCredentials: true,
    });

    return res.data;
  }
);

const cancelledOrderSlice = createSlice({
  name: "cancelledOrders",
  initialState: {
    items: [],
    status: "idle",
    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchCancelledOrders.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCancelledOrders.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchCancelledOrders.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export default cancelledOrderSlice.reducer;