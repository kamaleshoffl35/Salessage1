import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../api/axiosInstance";

/* ================================
        FETCH ORDERS
================================ */

export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get("/admin/orders");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Fetch failed");
    }
  }
);

/* ================================
        UPDATE ORDER STATUS
================================ */

export const updateOrderStatus = createAsyncThunk(
  "orders/updateOrderStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const res = await API.put(`/admin/orders/${id}/status`, { status });
      return { id, status, data: res.data };
    } catch (err) {
      return rejectWithValue(err.response?.data || "Update failed");
    }
  }
);

/* ================================
        UPDATE PAYMENT STATUS
================================ */

export const updatePaymentStatus = createAsyncThunk(
  "orders/updatePaymentStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const res = await API.put(`/admin/orders/${id}/payment-status`, { status });
      return { id, status, data: res.data };
    } catch (err) {
      return rejectWithValue(err.response?.data || "Payment update failed");
    }
  }
);

/* ================================
        DELETE ORDER
================================ */

export const deleteOrder = createAsyncThunk(
  "orders/deleteOrder",
  async (id, { rejectWithValue }) => {
    try {
      await API.delete(`/admin/orders/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Delete failed");
    }
  }
);

/* ================================
        SLICE
================================ */

const orderSlice = createSlice({
  name: "orders",
  initialState: {
    items: [],
    status: "idle",
    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder

      /* FETCH */

      .addCase(fetchOrders.pending, (state) => {
        state.status = "loading";
      })

      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.status = "success";
        state.items = action.payload;
      })

      .addCase(fetchOrders.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      /* UPDATE ORDER STATUS */

      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const order = state.items.find((o) => o._id === action.payload.id);
        if (order) {
          order.orderStatus = action.payload.status;
        }
      })

      /* UPDATE PAYMENT STATUS */

      .addCase(updatePaymentStatus.fulfilled, (state, action) => {
        const order = state.items.find((o) => o._id === action.payload.id);
        if (order) {
          order.paymentStatus = action.payload.status;
        }
      })

      /* DELETE */

      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.items = state.items.filter((o) => o._id !== action.payload);
      });
  },
});

export default orderSlice.reducer;