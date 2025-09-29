import { createSlice,createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL="http://localhost:5000/api/sales"

export const fetchsales=createAsyncThunk("sales/fetchAll",async () => {
    const res=await axios.get(API_URL)
    return res.data
})

export const addSale=createAsyncThunk("sales/add",async (sale) => {
    const res=await axios.post(API_URL,sale)
    return res.data
})

export const deleteSale=createAsyncThunk("sales/delete",async (id) => {
    await axios.delete(`${API_URL}/${id}`)
    return id
})

const saleSlice =  createSlice({
    name:"sales",
    initialState:{
        items:[],
        status:"idle",
        error:null
    },
    reducers:{},
    extraReducers:
        (builder)=>{
            builder
            .addCase(fetchsales.pending,(state)=>{
                state.status="loading"
            })
            .addCase(fetchsales.fulfilled,(state,action)=>{
                state.status="succeeded"
                state.items=action.payload
            })
            .addCase(fetchsales.rejected,(state,action)=>{
                state.status="failed"
                state.error=action.error.message
            })
            .addCase(addSale.fulfilled,(state,action)=>{
                state.items.push(action.payload)
                
            })
            .addCase(deleteSale.fulfilled,(state,action)=>{
                state.items= state.items.filter((s)=>s._id  !== action.payload)
            })
        }
    
})

export default saleSlice.reducer