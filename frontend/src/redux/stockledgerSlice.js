import { createSlice,createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL="http://localhost:5000/api/stockledger"

export const fetchstocks=createAsyncThunk("stockledger/fetchAll",async () => {
    const res=await axios.get(API_URL)
    return res.data
})

export const addstock=createAsyncThunk("stockledger/add",async (stock) => {
    const res=await axios.post(API_URL,stock)
    return res.data
})

export const deletestock=createAsyncThunk("stockledger/delete",async (id) => {
    await axios.delete(`${API_URL}/${id}`)
    return id
})

const stockledgerSlice=createSlice({
  name:"stockss",
  initialState:{
    items:[],
    status:"idle",
    error:null,
  },
  reducers:{},
  extraReducers:
       (builder)=>{
        builder
        .addCase(fetchstocks.pending,(state)=>{
            state.status="loading"
        })
        .addCase(fetchstocks.fulfilled,(state,action)=>{
            state.status="succeeded"
            state.items=action.payload
        })
        .addCase(fetchstocks.rejected,(state,action)=>{
            state.status="failed"
            state.error=action.error.message
        })
        .addCase(addstock.fulfilled,(state,action)=>{
            state.items.push(action.payload)
        })
        .addCase(deletestock.fulfilled,(state,action)=>{
            state.items=state.items.filter((p)=>p._id !== action.payload)
        })
       }
  
})

export default stockledgerSlice.reducer