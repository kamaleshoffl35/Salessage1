// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import axios from "axios";

// // API base
// const API_URL = "http://localhost:5000/api/products";

// // Async thunks
// // export const fetchProducts = createAsyncThunk("products/fetchAll", async () => {
// //   const token = JSON.parse(localStorage.getItem("token"));
// //   const res = await axios.get(API_URL, {
// //     headers: {
// //       Authorization: `Bearer ${token}`
// //     }
// //   });
// //   return res.data;
// // });

// export const fetchProducts = createAsyncThunk("products/fetchAll", async () => {
//   const user = JSON.parse(localStorage.getItem("user")); // get the whole user object
//   const token = user?.token;  // get the token
//   try {
//     const res = await axios.get(API_URL, {
//       headers: { Authorization: `Bearer ${token}` }
//     });
//     return res.data;
//   } catch (err) {
//     throw err;
//   }
// });

// export const addProduct = createAsyncThunk("products/add", async (product) => {
//   const user = JSON.parse(localStorage.getItem("user"));
//   const token = user?.token;
//   const res = await axios.post(API_URL, product, {
//     headers: { Authorization: `Bearer ${token}` },
//   });
//   return res.data;
// });

// export const deleteProduct = createAsyncThunk("products/delete", async (id) => {
//   const user = JSON.parse(localStorage.getItem("user"));
//   const token = user?.token;
//   await axios.delete(`${API_URL}/${id}`, {
//     headers: { Authorization: `Bearer ${token}` },
//   });
//   return id;
// });


// const productSlice = createSlice({
//   name: "products",
//   initialState: {
//     items: [],
//     status: "idle",
//     error: null,
//   },
//   reducers: {},
//   extraReducers: (builder) => {
//     builder
//       // Fetch
//       .addCase(fetchProducts.pending, (state) => {
//         state.status = "loading";
//       })
//       .addCase(fetchProducts.fulfilled, (state, action) => {
//         state.status = "succeeded";
//         state.items = action.payload;
//       })
//       .addCase(fetchProducts.rejected, (state, action) => {
//         state.status = "failed";
//         state.error = action.error.message;
//       })
//       // Add
//       .addCase(addProduct.fulfilled, (state, action) => {
//         state.items.push(action.payload);
//       })
//       // Delete
//       .addCase(deleteProduct.fulfilled, (state, action) => {
//         state.items = state.items.filter((p) => p._id !== action.payload);
//       });
//   },
// });

// export default productSlice.reducer;
 
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:5000/api/products";

// ---------------------- ASYNC THUNKS ----------------------

// Fetch all products
export const fetchProducts = createAsyncThunk("products/fetchAll", async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.token;
  if (!token) throw new Error("Token missing");

  const res = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
});

// Add a new product
export const addProduct = createAsyncThunk(
  "products/addProduct",
  async (product, thunkAPI) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = user?.token;
      if (!token) throw new Error("Token missing");

      const res = await axios.post(
        "http://localhost:5000/api/products",
        product,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return res.data;
    } catch (error) {
      console.error("Add product error:", error.response?.data || error.message);
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);




// Delete a product
export const deleteProduct = createAsyncThunk("products/delete", async (id) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.token;
  if (!token) throw new Error("Token missing");

  await axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return id;
});

// ---------------------- SLICE ----------------------
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
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      // Add product
      .addCase(addProduct.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      // Delete product
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p._id !== action.payload);
      });
  },
});

export default productSlice.reducer;
