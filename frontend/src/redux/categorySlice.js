import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:5000/api/categories";

export const fetchCategories=createAsyncThunk("categories/fetchAll",async () => {
    const user=JSON.parse(localStorage.getItem("user"))
    const token=user?.token
    if(!token)
        throw new error("Token is missing")
    const res=await axios.get(API_URL,{headers:{Authorization :`Bearer ${token}`},})
    return res.data
})

export const addCategory=createAsyncThunk("categories/add",async (category) => {
    try{
        const user=JSON.parse(localStorage.getItem("user"))
        const token=user?.token
        if(!token)
            throw new error("Token missing")
        const res =await axios.post(API_URL,category,{headers:{Authorization :`Bearer ${token}`},})
    return res.data
    }
    catch(error){
        console.error("Add category error:",error.response?.data || error.message)
        
    }
    
})

export const deleteCategory=createAsyncThunk("categories/delete",async (id) => {
    const user=JSON.parse(localStorage.getItem("user"))
    const token=user?.token
    if(!token)
            throw new error("Token missing")
    await axios.delete(`${API_URL}/${id}`,{headers:{Authorization :`Bearer ${token}`},})
    return id
})

export const updateCategory=createAsyncThunk("categories/update",async({id,updatedData})=>{
    const user=JSON.parse(localStorage.getItem("user"))
    const token=user?.token
    if(!token)
        throw new error("Token Missing")
    const res=await axios.put(`${API_URL}/${id}`,updatedData,{headers:{Authorization:`Bearer ${token}`}})
    return res.data
})

const categorySlice=createSlice({
    name:"categories",
    initialState:{
        items:[],
        status:"idle",
        error:null
    },
    reducers:{},
    extraReducers:(builder)=>{
        builder
        .addCase(fetchCategories.pending,(state)=>{
            state.status="loading"
        })
        .addCase(fetchCategories.fulfilled,(state,action)=>{
            state.status="succeeded"
            state.items=action.payload
        })
        .addCase(fetchCategories.rejected,(state,action)=>{
           state.status="failed"
           state.error=action.error.message
        })
        .addCase(addCategory.fulfilled,(state,action)=>{
            state.items.push(action.payload)
        })
        .addCase(deleteCategory.fulfilled,(state,action)=>{
            state.items=state.items.filter((c)=>c._id !== action.payload )
        })
        .addCase(updateCategory.fulfilled,(state,action)=>{
            const index=state.items.findIndex((c)=>c._id === action.payload._id)
            if(index !== -1){
                state.items[index]=action.payload
            }
        })
        
    }
})
export default categorySlice.reducer