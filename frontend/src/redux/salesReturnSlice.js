import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../api/axiosInstance";

export const createSalesReturn = createAsyncThunk(
  "salesReturn/create",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await API.post("/sales-returns", payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Sales return failed"
      );
    }
  }
);

export const fetchSalesReturns = createAsyncThunk(
  "salesReturn/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get("/sales-returns");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch sales returns"
      );
    }
  }
);

const salesReturnSlice = createSlice({
  name: "salesReturn",
  initialState: {
    items: [],
    status: "idle",
    error: null,
    createStatus: "idle",
  },
  reducers: {
    resetSalesReturnStatus: (state) => {
      state.createStatus = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createSalesReturn.pending, (state) => {
        state.createStatus = "loading";
      })
      .addCase(createSalesReturn.fulfilled, (state, action) => {
        state.createStatus = "succeeded";
        state.items.unshift(action.payload); 
      })
      .addCase(createSalesReturn.rejected, (state, action) => {
        state.createStatus = "failed";
        state.error = action.payload;
      })

      .addCase(fetchSalesReturns.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchSalesReturns.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchSalesReturns.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { resetSalesReturnStatus } = salesReturnSlice.actions;
export default salesReturnSlice.reducer;
