import { createSlice,createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL="http://localhost:5000/api/stockledger"

export const fetchstocks=createAsyncThunk("stockledger/fetchAll",async () => {
    const user=JSON.parse(localStorage.getItem("user"))
    const token=user?.token
    if(!token)
        throw new Error("Token Missing")
    const res=await axios.get(API_URL,{headers:{Authorization:`Bearer ${token}`},})
    return res.data
})

export const addstock=createAsyncThunk("stockledger/add",async (stock) => {
    const user=JSON.parse(localStorage.getItem("user"))
    const token=user?.token
    if(!token)
        throw new Error("Token Missing")
    const res=await axios.post(API_URL,stock,{headers:{Authorization:`Bearer ${token}`},})
    return res.data
})

export const deletestock=createAsyncThunk("stockledger/delete",async (id) => {
    const user=JSON.parse(localStorage.getItem("user"))
    const token=user?.token
    if(!token)
        throw new Error("Token Missing")
    await axios.delete(`${API_URL}/${id}`,{headers:{Authorization:`Bearer ${token}`},})
    return id
})

export const updatestock=createAsyncThunk("stockledger/update",async ({id,updatedData}) => {
    const user=JSON.parse(localStorage.getItem("user"))
    const token=user?.token
    if(!token)
        throw new Error("Token Missing")
    const res=await axios.put(`${API_URL}/${id}`,updatedData,{headers:{Authorization:`Bearer ${token}`}})
    return res.data
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
       .addCase(updatestock.fulfilled,(state,action)=>{
               const index=state.items.findIndex((s)=>s._id === action.payload._id)
               if(index !== -1){
                   state.items[index]=action.payload
               }
           })
       }
  
})

export default stockledgerSlice.reducer