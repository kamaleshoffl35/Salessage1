import React, { useEffect, useState } from 'react'
import { FaRegSave } from "react-icons/fa";
import { GrPowerReset } from "react-icons/gr";
import { GiTakeMyMoney } from "react-icons/gi";
import { MdDeleteForever } from "react-icons/md";
import { FaSearch } from "react-icons/fa";
import axios from 'axios';
import { useDispatch,useSelector } from 'react-redux';
import { fetchsuppliers } from '../redux/supplierSlice';

import { addpayment, deletepayment, fetchpayments, updatepayment } from '../redux/supplierpaymentSlice';
import { setAuthToken } from '../services/userService';
import { MdEdit } from "react-icons/md";

const Supplier_Payment = () => {
  const dispatch=useDispatch()
  const {items:sup_payments,status}=useSelector((state)=>state.sup_payments)
 const {items:suppliers}=useSelector((state)=>state.suppliers)

 const user=JSON.parse(localStorage.getItem("user"))
 const role=user?.role
 const token=user?.token
  
  const [form, setForm] = useState({
    supplier_id: "",

    date: new Date().toISOString().slice(0, 16),
    amount: "",
    mode: "",
    reference_no: "",
    applied_purchase_id: "",
    notes: "",
  })
  useEffect(() => {

    const user=JSON.parse(localStorage.getItem("user"))
    if(!user || !user.token)
      console.error("No user found Please Login")
    const token=user?.token
    setAuthToken(token)
    dispatch(fetchsuppliers())

    dispatch(fetchpayments())
  }, [dispatch])
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if(editingPayment){
        await dispatch(updatepayment({id:editingPayment,updatedData:form})).unwrap()
        setEditingPayment(null)
        console.log("Payment Updated Successfully")
      }
      else{
           await dispatch(addpayment(form)).unwrap()
           console.log("Payment Added Successfully")

      }
  
      setForm({
        supplier_id: "",

        date: new Date().toISOString().slice(0, 16),
        amount: "",
        mode: "",
        reference_no: "",
        applied_purchase_id: "",
        notes: "",
      })
      dispatch(fetchpayments())
    }
    catch (err) {
      console.error(err.response?.data || err.message)
    }
  }

  const [search, setSearch] = useState("");
  const filteredpayments = sup_payments.filter((s) => {
    const supplierName = s.supplier_id?.name || s.supplier_id?.toString() || "";
    return (
      supplierName.toLowerCase().includes(search.toLowerCase()) ||
      s.date.toString().toLowerCase().includes(search.toLowerCase())
    );`1`
  });

  const handleDelete = async (id) => {
   dispatch(deletepayment(id))
  };

  const [editingPayment,setEditingPayment]=useState(null)

  const handleEdit=(payment)=>{
    setEditingPayment(payment._id)
    setForm({
      supplier_id: payment.supplier_id || "",

        date: payment.date || new Date().toISOString().slice(0, 16),
        amount: payment.amount ||"",
        mode:payment.mode || "",
        reference_no: payment.reference_no ||"",
        applied_purchase_id:payment.applied_purchase_id || "",
        notes:payment.notes || "",
    })
  }


  return (
    <div className="container mt-4">
     <h2 className="mb-4 d-flex align-items-center fs-5"><span className="  me-2 d-flex align-items-center" style={{color:"#4d6f99ff"}}><GiTakeMyMoney size={24} /></span>{" "}<b >SUPPLIER PAYMENT RECEIPT</b></h2>
      <form className="row g-3" onSubmit={handleSubmit}>
        <div className="col-md-6">
          <label className="form-label">Supplier <span className="text-danger">*</span></label>
          <select className="form-select bg-light" name="supplier_id" value={form.supplier_id} onChange={handleChange}>
            <option value="">-- Select Supplier --</option>
            {suppliers.map(s => (<option key={s._id} value={s._id}>{s.name}</option>))}

          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label">Date <span className="text-danger">*</span></label>
          <input type="datetime-local" className="form-control bg-light" name="date" value={form.date} onChange={handleChange} />
        </div>

        <div className="col-md-6">
          <label className="form-label">Amount (₹) <span className="text-danger">*</span></label>
          <div className="input-group">
            <span className="input-group-text">₹</span>
            <input type="number" className="form-control bg-light" placeholder="Enter amount" name="amount" value={form.amount} onChange={handleChange} />
          </div>
        </div>

       
        <div className="col-md-6">
          <label className="form-label">Payment Mode <span className="text-danger">*</span></label>
          <select className="form-select bg-light" name="mode" value={form.mode} onChange={handleChange}>
            <option value="">-- Select Mode --</option>
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
            <option value="bank">Bank Transfer</option>
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label">Reference No (UTR / Cheque)</label>
          <input type="text" className="form-control bg-light" placeholder="Enter reference no" name="reference_no" value={form.reference_no} onChange={handleChange} />
        </div>

        <div className="col-md-6">
          <label className="form-label">Purchase Invoice to Adjust</label>
          <select className="form-select bg-light" name="applied_purchase_id" value={form.applied_purchase_id} onChange={handleChange}>
            <option value="">-- Optional --</option>
            <option value="PUR-2001">PUR-2001</option>
            <option value="PUR-2002">PUR-2002</option>
            <option value="PUR-2003">PUR-2003</option>
          </select>
        </div>

      
        <div className="col-12">
          <label className="form-label">Notes</label>
          <textarea className="form-control bg-light" rows="2" placeholder="Enter notes" name="notes" value={form.notes} onChange={handleChange}></textarea>
        </div>

 
        <div className="col-12 d-flex gap-2">
          <button
            type="submit"
            className="btn btn-primary px-4 d-flex align-items-center justify-content-center"
          >
            <span className="text-warning me-2 d-flex align-items-center">
              <FaRegSave />
            </span>
            {editingPayment ? "Update Payment" :"Save Payment"}
          </button>
          <button type="reset" className="btn btn-secondary px-4 d-flex align-items-center justify-content-center">
            <span className="text-danger me-2 d-flex align-items-center"><GrPowerReset /></span>Reset
          </button>
        </div>
      </form>
      <br />
      <div className=" card shadow-sm">
        <div className="card-body">
          <h5 className="mb-3">Payment Tree</h5>
          <div className="mt-4 mb-2 input-group">
            <input type="text" className="form-control" placeholder="Search Customer name" value={search} onChange={(e) => setSearch(e.target.value)} />
            <span className="input-group-text"><FaSearch /></span>
          </div>
          <table className="table table-bordered table-striped mt-4">
            <thead className="table-dark">
              <tr>
                <th className="fw-bold">Supplier</th>
                <th className="fw-bold">Date</th>
                <th className="fw-bold">Amount</th>

                <th className="fw-bold">Payment Mode</th>
                <th className="fw-bold">Ref No</th>
                <th className="fw-bold">Invoice</th>
                <th className="fw-bold">Notes</th>
                  <th className="fw-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredpayments.length === 0 ? (
                <tr>
                  <td colSpan="11" className="text-center">
                    No payments found.
                  </td>
                </tr>
              ) : (
                sup_payments.map(p => (
                  <tr key={p._id}>
                    <td>{p.supplier_id?.name}</td>
                    <td>{p.date}</td>
                    <td>{p.amount}</td>
                    <td>{p.mode}</td>
                    <td>{p.reference_no}</td>
                    <td>{p.applied_purchase_id}</td>
                    <td>{p.notes}</td>
                    <td>
                      {["super_admin"].includes(role) ? (
                        <><button className='btn btn-sm btn-warning' onClick={()=>handleEdit(p)}><MdEdit/>Edit</button>
                                                <button
                                                  className="btn btn-danger btn-sm px-4 d-flex align-items-center justify-content-center"
                                                  onClick={() => handleDelete(p._id)}
                                                >
                                                  <span className="text-warning me-2 d-flex align-items-center">
                                                    <MdDeleteForever />
                                                  </span>
                                                  Delete
                                                </button></>) : (
                                                     <button className="btn btn-secondary btn-sm" disabled>
                                                        View Only
                                                    </button>
                                                )}
                                              </td>
                  </tr>
                )))}
            </tbody>
          </table></div></div>
    </div>

  )
}

export default Supplier_Payment