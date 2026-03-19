import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../api/axiosInstance";

export const fetchConfirmedOrders = createAsyncThunk(
  "confirmedOrders/fetch",
  async () => {
    const res = await API.get("/orders/confirmed-orders");
    return res.data;
  }
);

const slice = createSlice({
  name: "confirmedOrders",
  initialState: {
    items: [],
    status: "idle",
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConfirmedOrders.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchConfirmedOrders.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      });
  },
});

export default slice.reducer;