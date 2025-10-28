import { createSlice,createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:5000/api/stocks"

export const fetchstocks= createAsyncThunk("stocks/fetchAll",async () => {
    const user=JSON.parse(localStorage.getItem("user"))
    const token=user?.token
    if(!token)
        throw new Error("Token Missing")
    const res=await axios.get(API_URL,{headers:{Authorization:`Bearer ${token}`},})
    
    return res.data
})

export const addstock=createAsyncThunk("stocks/add",async (stock) => {
    const user=JSON.parse(localStorage.getItem("user"))
    const token=user?.token
    if(!token)
        throw new Error("Token Missing")
    const res=await axios.post(API_URL,stock,{headers:{Authorization:`Bearer ${token}`},})
    return res.data
})

export const deletestock=createAsyncThunk("stocks/delete",async (id) => {
    const user=JSON.parse(localStorage.getItem("user"))
     const token=user?.token
     if(!token)
        throw new Error("Token Missing")
    await axios.delete(`${API_URL}/${id}`,{headers:{Authorization:`Bearer ${token}`},})
    return id
})


export const updateStock=createAsyncThunk("stocks/update",async ({id,updatedData}) => {
    const user=JSON.parse(localStorage.getItem("user"))
    const token=user?.token
    if(!token)
        throw new Error("Token Missing")
    const res=await axios.put(`${API_URL}/${id}`,updatedData,{headers:{Authorization:`Bearer ${token}`}})
    return res.data
})
const stockadjSlice=createSlice({
    name:"stocks",
    initialState:{
        items:[],
        status:"idle",
        error:null,
    },
    reducers:{},
    extraReducers:(builder)=>{
        builder
        .addCase(fetchstocks.pending,(state)=>{
            state.status="loading"
        })
        .addCase(fetchstocks.fulfilled,(state,action)=>{
            state.status="fulfilled"
            state.items=action.payload
        })
        .addCase(fetchstocks.rejected,(state,action)=>{
            state.status="rejected"
            state.error=action.error.message
        })
        .addCase(addstock.fulfilled,(state,action)=>{
            state.items.push(action.payload)
        })
        .addCase(deletestock.fulfilled,(state,action)=>{
            state.items=state.items.filter((s)=>s._id !== action.payload)
        })
        .addCase(updateStock.fulfilled,(state,action)=>{
            const index=state.items.findIndex((s)=>s._id === action.payload._id)
            if(index !== -1){
                state.items[index]=action.payload
            }
        })
    }
})

export default stockadjSlice.reducer
