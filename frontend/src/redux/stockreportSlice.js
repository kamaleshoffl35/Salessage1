import { createSlice,createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";


const API_URL="http://localhost:5000/api/reports/stock"

export const fetchstockreports=createAsyncThunk("reports/stock/fetchAll",async () => {
    const res=await axios.get(API_URL)
    return res.data
})

export const addstockreport=createAsyncThunk("reports/stock/add",async (stockreport) => {
    const res=await axios.post(API_URL,stockreport)
    return res.data
})

export const deletestockreport=createAsyncThunk("reports/stock/delete",async (id) => {
    await axios.delete(`${API_URL}/${id}`)
    return id
})

const stockreportSlice=createSlice({
    name:"stockreports",
    initialState:{
        items:[],
        status:"idle",
        error:null,
    },
    reducers:{},
    extraReducers:(builder)=>{
        builder
        .addCase(fetchstockreports.pending,(state)=>{
            state.status="loading"
        })
        .addCase(fetchstockreports.fulfilled,(state,action)=>{
            state.status="succeeded"
            state.items=action.payload
        })
        .addCase(fetchstockreports.rejected,(state,action)=>{
            state.status="failed"
            state.error=action.error.message
        })
        .addCase(addstockreport.fulfilled,(state,action)=>{
            state.items.push(action.payload)
        })
        .addCase(deletestockreport.fulfilled,(state,action)=>{
            state.items=state.items.filter((s)=>s._id !== (action.payload))
        })
    }
})

export default stockreportSlice.reducer