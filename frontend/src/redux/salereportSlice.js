import { createSlice,createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL="http://localhost:5000/api/reports/sales"

export const fetchsalereports=createAsyncThunk("reports/sales/fetchAll",async () => {
    const res=await axios.get(API_URL)
    return res.data
})

export const addsalereport=createAsyncThunk("reports/sales/add",async (salereport) => {
    const res=await axios.post(API_URL,salereport)
    return res.data
})

export const deletesalereport=createAsyncThunk("reports/sales/delete",async (id) => {
    await axios.delete(`${API_URL}/${id}`)
    return id
})

const salereportSlice = createSlice({
    name:"salereports",
    initialState:{
        items:[],
        status:"idle",
        error:null
    },
    reducers:{},
    extraReducers:(builder)=>{
        builder
        .addCase(fetchsalereports.pending,(state)=>{
            state.status="loading"
        })
        .addCase(fetchsalereports.fulfilled,(state,action)=>{
            state.status="succeeded"
            state.items=action.payload
        })
        .addCase(fetchsalereports.rejected,(state,action)=>{
            state.status="failed"
            state.error=action.error.message
        })
        .addCase(addsalereport.fulfilled,(state,action)=>{
            state.items.push(action.payload)
        })
        .addCase(deletesalereport.fulfilled,(state,action)=>{
            state.items=state.items.filter((s)=>s._id !== action.payload)
        })
    }
    

})

export default salereportSlice.reducer
