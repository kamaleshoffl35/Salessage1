import { createSlice,createAsyncThunk, asyncThunkCreator } from "@reduxjs/toolkit";
import axios from "axios";


const API_URL = "http://localhost:5000/api/customers"

export const fetchcustomers = createAsyncThunk("customers/fetchAll",async () => {
    const res=await axios.get(API_URL)
    return res.data
})

export const addcustomer=createAsyncThunk("customers/add",async (customer) => {
    const res = await axios.post(API_URL,customer)
    return res.data
})

export const deletecustomer=createAsyncThunk("customers/delete",async (id) => {
    await axios.delete(`${API_URL}/${id}`)
    return id
})

export const updatecustomer=createAsyncThunk("customers/update",async({id,updatedData})=>{
    const user=JSON.parse(localStorage.getItem("user"))
    const token=user?.token
    if(!token)
        throw new Error("Token missing")
    const res = await axios.put(`${API_URL}/${id}`,updatedData,{headers:{Authorization:`Bearer ${token}`}})
    return res.data
})

const customerSlice=createSlice({
    name:"customers",
    initialState:{
        items:[],
        status:"idle",
        error:null,
    },
    reducers:{},
    extraReducers:(builder)=>{
        builder
        .addCase(fetchcustomers.pending,(state)=>{
            state.status="loading"
        })
        .addCase(fetchcustomers.fulfilled,(state,action)=>{
            state.status="succeeded"
            state.items=action.payload
        })
        .addCase(fetchcustomers.rejected,(state,action)=>{
            state.status="failed"
            state.error=action.error.message
    })
    .addCase(addcustomer.fulfilled,(state,action)=>{
        state.items.push(action.payload)
    })
    .addCase(deletecustomer.fulfilled,(state,action)=>{
        state.items=state.items.filter((c)=>c._id !== action.payload)
    })
    .addCase(updatecustomer.fulfilled,(state,action)=>{
        const index=state.items.findIndex((c)=>c._id === action.payload._id)
        if(index !== -1)
        {
            state.items[index]=action.payload
        }
    })
    }
        
})

export default customerSlice.reducer