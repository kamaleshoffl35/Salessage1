import { createSlice,createAsyncThunk } from "@reduxjs/toolkit";
import API from "../api/axiosInstance";

export const fetchpurchasereports=createAsyncThunk("purchasereports/fetch",async ({from_date,to_date},{rejectWithValue}) => {
    try {
        const res=await API.get( `/reports/purchase?from_date=${from_date}&to_date=${to_date}`)
    return res.data
}
  catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }})

const purchasereportSlice=createSlice({
    name:"purchasereports",
    initialState:{
        items:[],
        status:"idle",
        error:null,
    },
    reducers:{},
    extraReducers:(builder)=>{
        builder
        .addCase(fetchpurchasereports.pending,(state)=>{
            state.status="loading"
        })
        .addCase(fetchpurchasereports.fulfilled,(state,action)=>{
            state.status="succeeded"
            state.items=action.payload
        })
        .addCase(fetchpurchasereports.rejected,(state,action)=>{
            state.status="failed"
            state.error=action.error.message
        })
        
    }
})

export default purchasereportSlice.reducer