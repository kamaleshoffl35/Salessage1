import { createSlice,createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL="http://localhost:5000/api/reports/purchase"

export const fetchpurchasereports=createAsyncThunk("reports/purchase/fetchAll",async () => {
    const res=await axios.get(API_URL)
    return res.data
})

export const addpurchasereport=createAsyncThunk("reports/purchase/add",async (purchasereport) => {
    const res=await axios.post(API_URL,purchasereport)
    return res.data
})

export const deletepurchasereport=createAsyncThunk("reports/purchase/delete",async (id) => {
    await axios.delete(`${API_URL}/${id}`)
    return id
})

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
        .addCase(addpurchasereport.fulfilled,(state,action)=>{
            state.items.push(action.payload)
        })
        .addCase(deletepurchasereport.fulfilled,(state,action)=>{
            state.items=state.items.filter((p)=>p._id !== action.payload)
        })
    }
})

export default purchasereportSlice.reducer