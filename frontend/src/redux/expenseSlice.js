import { createSlice,createAsyncThunk,  } from "@reduxjs/toolkit";
import axios from "axios";


const API_URL = "http://localhost:5000/api/expenses"

export const fetchexpenses = createAsyncThunk("expenses/fetchAll",async () => {
    const user=JSON.parse(localStorage.getItem("user"))
    const token=user?.token
    if(!token)
        throw new Error("Token Missing")
    const res=await axios.get(API_URL,{headers:{Authorization:`Bearer ${token}`},})
    return res.data
})

export const addexpense=createAsyncThunk("expenses/add",async (expense) => {
     const user=JSON.parse(localStorage.getItem("user"))
    const token=user?.token
    if(!token)
        throw new Error("Token Missing")
    const res = await axios.post(API_URL,expense,{headers:{Authorization:`Bearer ${token}`},})
    return res.data
})

export const deleteexpense=createAsyncThunk("expenses/delete",async (id) => {
     const user=JSON.parse(localStorage.getItem("user"))
    const token=user?.token
    if(!token)
        throw new Error("Token Missing")
    await axios.delete(`${API_URL}/${id}`,{headers:{Authorization:`Bearer ${token}`},})
    return id
})

export const updateexpense=createAsyncThunk("expenses/update",async ({id,updatedData}) => {
    const user=JSON.parse(localStorage.getItem("user"))
    const token=user?.token
    if(!token)
        throw new Error("Token Missing")
    const res=await axios.put(`${API_URL}/${id}`,updatedData,{headers:{Authorization:`Bearer ${token}`}})
    return res.data
})


const expenseSlice=createSlice({
    name:"expenses",
    initialState:{
        items:[],
        status:"idle",
        error:null,
    },
    reducers:{},
    extraReducers:(builder)=>{
        builder
        .addCase(fetchexpenses.pending,(state)=>{
            state.status="loading"
        })
        .addCase(fetchexpenses.fulfilled,(state,action)=>{
            state.status="succeeded"
            state.items=action.payload
        })
        .addCase(fetchexpenses.rejected,(state,action)=>{
            state.status="failed"
            state.error=action.error.message
    })
    .addCase(addexpense.fulfilled,(state,action)=>{
        state.items.push(action.payload)
    })
    .addCase(deleteexpense.fulfilled,(state,action)=>{
        state.items=state.items.filter((c)=>c._id !== action.payload)
    })
    .addCase(updateexpense.fulfilled,(state,action)=>{
        const index=state.items.findIndex((e)=>e._id === action.payload._id)
        if(index !== -1){
            state.items[index]=action.payload
        }
    })
    }
        
})

export default expenseSlice.reducer