import React, { useEffect, useState } from 'react'
import { MdAttachMoney, MdDeleteForever } from "react-icons/md";
import { FaRegSave, FaSearch } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import { fetchcustomers } from '../redux/customerSlice';
import { addpayment, deletepayment, fetchpayments, updatePayment } from '../redux/customerpaymentSlice';
import { setAuthToken } from '../services/userService';
import { MdEdit } from "react-icons/md";

const Customer_Payment = () => {
  const dispatch = useDispatch()
  const { items: cus_payments } = useSelector((state) => state.cus_payments)
  const { items: customers } = useSelector((state) => state.customers)

  const user=JSON.parse(localStorage.getItem("user"))
  const role=user?.role || "user"
  const token=user?.token

  const [form, setForm] = useState({
    customer_id: "",
    date: new Date().toISOString().slice(0, 16),
    amount: "",
    mode: "",
    reference_no: "",
    applied_invoice_id: "",
    notes: "",
  })

  const [search, setSearch] = useState("");

  useEffect(() => {
    const user=JSON.parse(localStorage.getItem("user"))
    if(!user || !user.token)
      console.error("No user found Please Login")
    const token=user?.token
    setAuthToken(token)
    dispatch(fetchcustomers())
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
        await dispatch(updatePayment({id:editingPayment,updatedData:form})).unwrap()
        setEditingPayment(null)
        console.log("Payment Updated Successfully")
      }else{
        await dispatch(addpayment(form)).unwrap()
        console.log("Payment Added Successfully")
      }
        setForm({
          customer_id: "",
          date: new Date().toISOString().slice(0, 16),
          amount: "",
          mode: "",
          reference_no: "",
          applied_invoice_id: "",
          notes: "",
        })
        dispatch(fetchpayments())
      
      }
      
     catch (err) {
      console.error(err.response?.data || err.message)
    }
  }

  const handleDelete = async (id) => {
    dispatch(deletepayment(id))
  }

  const filteredpayments = cus_payments.filter((p) => {
    const customerName = p.customer_id?.name || (customers.find(c => c._id === p.customer_id)?.name) || ""
    return (
      customerName.toLowerCase().includes(search.toLowerCase()) ||
      new Date(p.date).toLocaleString().toLowerCase().includes(search.toLowerCase())
    )
  })

const [editingPayment, setEditingPayment]=useState(null)

  const handleEdit=(payment)=>{
    setEditingPayment(payment._id)
    setForm({
      customer_id:payment.customer_id || "",
          date: payment.date || new Date().toISOString().slice(0, 16),
          amount: payment.amount ||"",
          mode: payment.mode ||"",
          reference_no:payment.reference_no || "",
          applied_invoice_id:payment.applied_invoice_id || "",
          notes: payment.notes || "",
    })
  }
  return (
    <div className="container mt-4">
      <h2 className="mb-4 d-flex align-items-center fs-5">
        <span className="me-2 d-flex align-items-center" style={{ color: "#4d6f99ff" }}>
          <MdAttachMoney size={24} />
        </span>
        <b>CUSTOMER PAYMENT RECEIPT</b>
      </h2>
      <form className="row g-3" onSubmit={handleSubmit}>
        <div className="col-md-6">
          <label className="form-label">Customer <span className="text-danger">*</span></label>
          <select className="form-select bg-light" name="customer_id" value={form.customer_id} onChange={handleChange} required >
            <option value="">-- Select Customer --</option>
            {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label">Date <span className="text-danger">*</span></label>
          <input type="datetime-local" className="form-control bg-light" name="date" value={form.date} onChange={handleChange} required />
        </div>

        <div className="col-md-6">
          <label className="form-label">Amount (₹) <span className="text-danger">*</span></label>
          <input type="number" className="form-control bg-light" name="amount" value={form.amount} onChange={handleChange} placeholder="Enter amount" required />
        </div>

        <div className="col-md-6">
          <label className="form-label">Payment Mode <span className="text-danger">*</span></label>
          <select className="form-select bg-light" name="mode" value={form.mode} onChange={handleChange} required>
            <option value="">-- Select Mode --</option>
            <option>Cash</option>
            <option>UPI</option>
            <option>Bank Transfer</option>
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label">Reference No (UTR/Cheque)</label>
          <input type="text" className="form-control bg-light" name="reference_no" value={form.reference_no} onChange={handleChange} placeholder="Enter reference no" />
        </div>

        <div className="col-md-6">
          <label className="form-label">Invoice to Adjust</label>
          <select className="form-select bg-light" name="applied_invoice_id" value={form.applied_invoice_id} onChange={handleChange}>
            <option value="">-- Optional --</option>
            <option>INV-1001</option>
            <option>INV-1002</option>
            <option>INV-1003</option>
          </select>
        </div>

        <div className="col-12">
          <label className="form-label">Notes</label>
          <textarea className="form-control bg-light" rows="2" placeholder="Enter notes" name="notes" value={form.notes} onChange={handleChange}></textarea>
        </div>

        <div className="col-12">
          <button type="submit" className="btn btn-primary px-4 d-flex align-center justify-center">
            <span className="text-warning me-2 d-flex align-items-center"><FaRegSave /></span> {editingPayment ? "Update Payment" : "Save Payment"}
          </button>
        </div>
      </form>

      <div className="card shadow-sm mt-4">
        <div className="card-body">
          <h5 className="mb-3">Payment Tree</h5>
          <div className="mt-4 mb-2 input-group">
            <input type="text" className="form-control" placeholder="Search Customer name" value={search} onChange={(e) => setSearch(e.target.value)} />
            <span className="input-group-text"><FaSearch /></span>
          </div>

          <table className="table table-bordered table-striped mt-4">
            <thead className="table-dark">
              <tr>
                <th>Customer</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Payment Mode</th>
                <th>Ref No</th>
                <th>Invoice</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredpayments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center">No payments found.</td>
                </tr>
              ) : (
                filteredpayments.map((p) => {
                  const customerName = p.customer_id?.name || (customers.find(c => c._id === p.customer_id)?.name) || "Unknown Customer"
                  const formattedDate = p.date ? new Date(p.date).toLocaleString() : ""
                  return (
                    <tr key={p._id}>
                      <td>{customerName}</td>
                      <td>{formattedDate}</td>
                      <td>{p.amount}</td>
                      <td>{p.mode}</td>
                      <td>{p.reference_no}</td>
                      <td>{p.applied_invoice_id}</td>
                      <td>{p.notes}</td>
                      <td>
                        {["super_admin","admin"].includes(role) ? (
                          <>
                          <button className='btn btn-sm btn-warning' onClick={()=>handleEdit(p)}><MdEdit/>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p._id)}>
                          <MdDeleteForever className="text-warning" /> Delete
                        </button></>):(
                          <button className="btn btn-secondary btn-sm" disabled>
                                                        View Only
                                                    </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Customer_Payment
