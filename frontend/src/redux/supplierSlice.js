import { createSlice,createAsyncThunk, buildCreateSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL="http://localhost:5000/api/suppliers"

export const fetchsuppliers=createAsyncThunk("suppliers/fetchAll",async () => {
    const user=JSON.parse(localStorage.getItem("user"))
    const token=user?.token
    if(!token)
        throw new Error("Token missing")
    const res = await axios.get(API_URL,{headers:{Authorization:`Bearer ${token}`},})
    return res.data
})

export const addSupplier=createAsyncThunk("suppliers/add",async (supplier) => {
    const user=JSON.parse(localStorage.getItem("user"))
    const token=user?.token
    if(!token)
        throw new Error("Token Missing")
    const res = await axios.post(API_URL,supplier,{headers:{Authorization:`Bearer ${token}`},})
    return res.data
})

export const deleteSupplier=createAsyncThunk("suppliers/delete",async (id) => {
    const user=JSON.parse(localStorage.getItem("user"))
    const token=user?.token
    if(!token)
        throw new Error("Token missing")
    await axios.delete(`${API_URL}/${id}`,{headers:{Authorization:`Bearer ${token}`},})
    return id
})

export const updateSupplier=createAsyncThunk("suppliers/update",async({id, updatedData})=>{
    const user=JSON.parse(localStorage.getItem("user"))
    const token=user?.token
    if(!token)
        throw new Error("Token missing")
    const res = await axios.put(`${API_URL}/${id}`,updatedData,{headers:{Authorization:`Bearer ${token}`}})
    return res.data
})

const supplierSlice=createSlice({
    name:"suppliers",
    initialState:{
        items:[],
    status:"idle",
error:null,
    },
    reducers:{},
    extraReducers:(builder)=>{
        builder
        .addCase(fetchsuppliers.pending,(state)=>{
            state.status="loading"
        })
        .addCase(fetchsuppliers.fulfilled,(state,action)=>{
            state.status="succeeded"
            state.items=action.payload || action.payload.suppliers
        })
        .addCase(fetchsuppliers.rejected,(state,action)=>{
            state.status="failed"
            state.error=action.error.message
        })
        .addCase(addSupplier.fulfilled,(state,action)=>{
            state.items.push(action.payload)
        })
        .addCase(deleteSupplier.fulfilled,(state,action)=>{
            state.items=state.items.filter((s)=>s._id !== action.payload)
        })
        .addCase(updateSupplier.fulfilled,(state,action)=>{
            const index=state.items.findIndex((s)=>s._id === action.payload)
            if(index !== -1){
                state.items[index]=action.payload
            }
        })
    }
})

export default supplierSlice.reducer