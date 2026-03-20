// import { createSlice,createAsyncThunk } from "@reduxjs/toolkit";
// import axios from "axios";


// const API_URL ="http://localhost:5000/api/units"

// export const fetchUnits=createAsyncThunk("units/fetchAll",async()=>{
//     const res=await axios.get(API_URL)
//     return res.data
// })

// export const addUnit=createAsyncThunk("units/add",async(unit)=>{
//     const res=await axios.post(API_URL,unit)
//     return res.data
// })

// export const deleteUnit=createAsyncThunk("units/delete",async(id)=>{
//     await axios.delete(`${API_URL}/${id}`)
//     return id
// })

// const unitSlice= createSlice({
//     name:"units",
//     initialState:{
//         items:[],
//         status:"idle",
//         error:null,
//     },
//         reducers:{},
//         extraReducers:(builder)=>{
//             builder
//             .addCase(fetchUnits.pending,(state)=>{
//                 state.status="loading"
//             })
//             .addCase(fetchUnits.fulfilled,(state,action)=>{
//                 state.status="succeeded"
//                 state.items=action.payload
//             })
//             .addCase(fetchUnits.rejected,(state,action)=>{
//                 state.status="failed"
//                 state.items=action.error.message
//             })
//             .addCase(addUnit.fulfilled,(state,action)=>{
//                 state.items.push(action.payload)
//             })
//             .addCase(deleteUnit.fulfilled,(state,action)=>{
//                 state.items = state.items.filter((u)=>u._id !== action.payload)
//             })
//         }
    
// })

// export default unitSlice.reducer

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../api/axiosInstance";

const API_URL = "/units";

export const fetchUnits = createAsyncThunk("units/fetchAll", async () => {
  const res = await API.get(API_URL);
  return res.data;
});

export const addUnit = createAsyncThunk("units/add", async (unit) => {
  const res = await API.post(API_URL, unit);
  return res.data;
});

export const deleteUnit = createAsyncThunk("units/delete", async (id) => {
  await API.delete(`${API_URL}/${id}`);
  return id;
});

export const updateUnit = createAsyncThunk(
  "units/update",
  async ({ id, updatedData }) => {
    const res = await API.put(`${API_URL}/${id}`, updatedData);
    return res.data;
  }
);

const unitSlice = createSlice({
  name: "units",
  initialState: {
    items: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUnits.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUnits.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(addUnit.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(deleteUnit.fulfilled, (state, action) => {
        state.items = state.items.filter((u) => u._id !== action.payload);
      })
      .addCase(updateUnit.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (u) => u._id === action.payload._id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  },
});

export default unitSlice.reducer;