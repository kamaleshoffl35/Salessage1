import 'bootstrap/dist/css/bootstrap.min.css';
import { MdDeleteForever } from 'react-icons/md';
import { GiMoneyStack } from "react-icons/gi";
import { MdOutlineInventory2 } from "react-icons/md";
import { FaSearch } from 'react-icons/fa';
import { FaRegSave } from "react-icons/fa";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from "react-redux";
import { MdEdit } from "react-icons/md";

import { fetchwarehouses } from '../redux/warehouseSlice';
import { addstock, deletestock, fetchstocks } from '../redux/stockledgerSlice';
import { addexpense, deleteexpense, fetchexpenses, updateexpense } from '../redux/expenseSlice';
import { setAuthToken } from '../services/userService';
const Expenses = () => {
    const dispatch = useDispatch()
    const { items: expenses, status } = useSelector((state) => state.expenses)

    const { items: warehouses } = useSelector((state) => state.warehouses)

    const user=JSON.parse(localStorage.getItem("user"))
    const role=user?.role
    const token=user?.token
    const [form, setForm] = useState({
        expenseDate:"",
        warehouseId:"",
         expenseHead:"",
         amount:"",
       notes:"",

    })
    useEffect(() => {
        const user=JSON.parse(localStorage.getItem("user"))
        if(!user || !user.token)
            console.error("No user found Please Login")
        const token=user?.token
        setAuthToken(token)
        dispatch(fetchwarehouses())
        dispatch(fetchexpenses())
    }, [dispatch])
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === "checkbox" ? checked : value });

    };
    const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        if(editingexpense){
            await dispatch(updateexpense({id:editingexpense,updatedData:form})).unwrap()
            setEditingexpense(null)
            console.log("Expense Updated Successfully")
        }else{
                await dispatch(addexpense(form)).unwrap()
                console.log("Expense Added Successfully")
        }
      
        dispatch(fetchexpenses()); 
        setForm({
            expenseDate: "",
            warehouseId: "",
            expenseHead: "",
            amount: "",
            notes: "",
        });
        dispatch(fetchexpenses())
    } catch (err) {
        console.error(err.response?.data || err.message);
    }
};

    const [search, setSearch] = useState("")

    const filteredexpenses = (expenses || []).filter((e) => {
        const warehousename =
            e.warehouseId?.store_name || warehouses.find((w) => w._id === e.warehouseId)?.store_name || "";

        return (
            warehousename.toLowerCase().includes(search.trim().toLowerCase())  ||
             e.txnDate?.toString().toLowerCase().includes(search.trim().toLowerCase())
           
        );
    });



    const handleDelete = async (id) => {
        dispatch(deleteexpense(id))
    };

    const [editingexpense,setEditingexpense]=useState(null)

    const handleEdit=(expense)=>{
        setEditingexpense(expense._id)
        setForm({
            expenseDate:expense.expenseDate || "",
            warehouseId:expense.warehouseId || "",
            expenseHead:expense.expenseHead || "",
            amount:expense.amount || "",
            notes:expense.notes || "",
        })
    }

    return (
        <div className="container mt-4">
            <h2 className="mb-4 d-flex align-items-center fs-5"><span className="  me-2 d-flex align-items-center" style={{ color: "#4d6f99ff" }}><GiMoneyStack size={24} /></span>{" "}<b >EXPENSES</b></h2>
            
            {["super_admin","admin"].includes(role) && (
            <form className="row g-3" onSubmit={handleSubmit}>

                <div className="col-md-6">
                    <label className="form-label">Date<span className="text-danger">*</span></label>
                   <input type="Date" className='form-control bg-light' name="expenseDate" value={form.expenseDate} onChange={handleChange} required/>
                </div>

                <div className="col-md-6">
                    <label className="form-label">Warehouse <span className="text-danger">*</span></label>
                    <select className="form-select bg-light" name="warehouseId" value={form.warehouseId} onChange={handleChange} required>
                        <option>-- Select Warehouse --</option>
                        {warehouses.map(w => (<option key={w._id} value={w._id}>{w.store_name}</option>))}

                    </select>
                </div>

                <div className="col-md-6">
                    <label className="form-label">Expense Head<span className="text-danger">*</span></label>
                    <select className="form-select bg-light" name="expenseHead" value={form.expenseHead} onChange={handleChange} required>
                        <option>-- Select Type --</option>
                        <option value="RENT">RENT</option>
                        <option value="EB BILL">EB BILL</option>
                        <option value="SALARY">SALARY</option>
                    </select>
                </div>

                <div className="col-md-6">
                    <label className="form-label">Amount <span className="text-danger">*</span></label>
                    <input type="number" className="form-control bg-light" name='amount' onChange={handleChange} value={form.amount} required />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Notes <span className="text-danger">*</span></label>
                    <input type="text" className="form-control bg-light" name='notes' value={form.notes} onChange={handleChange} required />
                </div>

               

                <div className="col-12">
                    <button type="submit" className="btn btn-primary px-4 d-flex align-center justify-center">
                        <span className="text-warning me-2 d-flex align-items-center"><FaRegSave />
                        </span>{editingexpense ? "Update Expense" :"Add Expense"}</button>
                </div>
            </form>)}<br />

            <div className=" card shadow-sm">
                <div className="card-body">
                    <h5 className="mb-3">Expenses Tree</h5>
                    <div className="mt-4 mb-2 input-group">
                        <input type="text" className="form-control" placeholder="Search warehouse name" value={search} onChange={(e) => setSearch(e.target.value)} />
                        <span className="input-group-text"><FaSearch /></span>
                    </div>
                    <table className="table table-bordered table-striped">
                        <thead className="table-dark">
                            <tr>
                                <th className="fw-bold">Date</th>
                                <th className="fw-bold">Warehouse</th>
                                <th className="fw-bold">Expense Head</th>
                                <th className="fw-bold">Amount</th>
                                <th className="fw-bold">Notes</th>
                               
                                <th className="fw-bold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredexpenses.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="text-center">No expenses found.</td>
                                </tr>
                            ) : (
                                filteredexpenses.map((e, index) => (
                                    <tr key={index}>
                                        <td>{new Date(e.expenseDate).toLocaleDateString()}</td>
                                         <td>{e.warehouseId?.store_name || "Unknown"}</td>
                                        <td>{e.expenseHead}</td>
                                        <td>{e.amount}</td>
                                        
                                        <td>{e.notes}</td>
                                        
                                        <td>
                                            {["super_admin"].includes(role) ? (
                                                <>
                                                <button className='btn btn-sm btn-warning' onClick={()=>handleEdit(e)}><MdEdit/>Edit</button>
                                            <button
                                                className="btn btn-danger btn-sm px-4 d-flex align-items-center justify-content-center"
                                                onClick={() => handleDelete(e._id)}
                                            ><span className="text-warning me-2 d-flex align-items-center">
                                                                                                                                            <MdDeleteForever />
                                                                                                                                          </span>
                                                Delete
                                            </button></>):(
                                                    <button className="btn btn-secondary btn-sm" disabled>
                                                        View Only
                                                    </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>


                    </table></div></div>

        </div>
    );
}

export default Expenses