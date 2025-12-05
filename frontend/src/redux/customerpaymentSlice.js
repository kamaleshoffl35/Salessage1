import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../api/axiosInstance";
const API_URL = "/cus_payments";
export const fetchpayments = createAsyncThunk(
  "cus_payments/fetchAll",
  async () => {
    const res = await API.get(API_URL);
    return res.data;
  }
);
export const addpayment = createAsyncThunk(
  "cus_payments/add",
  async (payment) => {
    const res = await API.post(API_URL, payment);
    return res.data;
  }
);
export const deletepayment = createAsyncThunk(
  "cus_payments/delete",
  async (id) => {
    await API.delete(`${API_URL}/${id}`);
    return id;
  }
);
export const updatePayment = createAsyncThunk(
  "cus_payments/update",
  async ({ id, updatedData }) => {
    const res = await API.put(`${API_URL}/${id}`, updatedData);
    return res.data;
  }
);

const customerPaymentSlice = createSlice({
  name: "cus_payments",
  initialState: {
    items: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(fetchpayments.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchpayments.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchpayments.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(addpayment.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(deletepayment.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p._id !== action.payload);
      })
      .addCase(updatePayment.fulfilled, (state, action) => {
        const index = state.items.findIndex((c) => c._id === action.payload);
        if (index !== -1) state.items[index] = action.payload;
      }),
});

export default customerPaymentSlice.reducer;
