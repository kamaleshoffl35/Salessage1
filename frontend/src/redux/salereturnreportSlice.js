import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../api/axiosInstance";

export const fetchsalereturnreports = createAsyncThunk(
  "salereturnreports/fetch",
  async ({ from_date, to_date }, { rejectWithValue }) => {
    try {
      const res = await API.get(
  `/reports/salesreturns?from_date=${from_date}&to_date=${to_date}`
)

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const salereturnreportSlice = createSlice({
  name: "salereturnreports",
  initialState: {
    items: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchsalereturnreports.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchsalereturnreports.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchsalereturnreports.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default salereturnreportSlice.reducer;
