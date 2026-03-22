import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../api/axiosInstance";

export const fetchPaymentSettings = createAsyncThunk(
  "paymentSettings/fetch",
  async () => {
    const res = await API.get("/payment-settings");
    return res.data;
  }
);

export const savePaymentSettings = createAsyncThunk(
  "paymentSettings/save",
  async (formData) => {
    const res = await API.post("/payment-settings", formData);
    return res.data;
  }
);

const paymentSettingsSlice = createSlice({
  name: "paymentSettings",
  initialState: {
    settings: null,
    loading: false
  },

  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchPaymentSettings.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchPaymentSettings.fulfilled, (state, action) => {
        state.settings = action.payload;
        state.loading = false;
      })

      .addCase(savePaymentSettings.fulfilled, (state, action) => {
        state.settings = action.payload;
      });
  }
});

export default paymentSettingsSlice.reducer;