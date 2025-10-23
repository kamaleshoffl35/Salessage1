import React, { useEffect, useState } from 'react'
import { IoIosContact } from "react-icons/io";
import { FaRegSave } from "react-icons/fa";
import { FaSearch } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import axios from 'axios';
import 'react-phone-input-2/lib/style.css';
import PhoneInput from 'react-phone-input-2';
import { State, Country } from 'country-state-city';
import { useDispatch, useSelector } from 'react-redux';
import { addSupplier, deleteSupplier, fetchsuppliers, updateSupplier } from '../redux/supplierSlice';
import { setAuthToken } from '../services/userService';

const Supplier = () => {
  const dispatch=useDispatch()
  const {items:suppliers,status}=useSelector((state)=>state.suppliers)

  const user=JSON.parse(localStorage.getItem("user"))
  const role=user?.role || "user"
  const token=user?.token
  
  const [form, setForm] = useState({
    name: "",
    phone: "",
    country: "",
    gstin: "",
    email: "",
    address: "",
    state_code: "",
    opening_balance: "",
  })
  const [states, setStates] = useState([]);

  useEffect(() => {
    const user=JSON.parse(localStorage.getItem("user"))
    if(!user || !user.token)
      console.error("Token missing")
    const token=user?.token
    setAuthToken(token)
    dispatch(fetchsuppliers())
  }, [dispatch])

  // Function to update states based on country code
  const updateStates = (countryCode) => {
    console.log("Updating states for country:", countryCode);
    if (countryCode) {
      try {
        const stateList = State.getStatesOfCountry(countryCode.toUpperCase());
        console.log("States found:", stateList.length);
        setStates(stateList);
        setForm(prev => ({ ...prev, state_code: "" }));
      } catch (error) {
        console.error("Error fetching states:", error);
        setStates([]);
      }
    } else {
      setStates([]);
      setForm(prev => ({ ...prev, state_code: "" }));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }))

    if (name === "country") {
      updateStates(value);
    }
  }

  const handlePhoneChange = (phone, countryData) => {
    console.log("Phone changed:", phone, countryData);
    
    // Extract country code correctly
    const countryCode = countryData?.countryCode || 
                       countryData?.iso2 || 
                       (countryData?.dialCode === '91' ? 'IN' : '');
    
    console.log("Extracted country code:", countryCode);
    
    setForm(prev => ({
      ...prev,
      phone: phone,
      country: countryCode
    }));

    // Update states based on the selected country
    updateStates(countryCode);
  };

  // Handle country change separately (more reliable)
  const handleCountryChange = (countryCode, countryData) => {
    console.log("Country changed to:", countryCode, countryData);
    setForm(prev => ({
      ...prev,
      country: countryCode
    }));
    updateStates(countryCode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if(editingSupplier){
        await dispatch(updateSupplier({id:editingSupplier,updatedData:form})).unwrap()
        setEditingSupplier(null)
        console.log("Supplier Updated Successfully")
      }
      else{
       await dispatch(addSupplier(form)).unwrap()
       console.log("Supplier added Successfully")
      }

      setForm({
        name: "",
        phone: "",
        country: "",
        gstin: "",
        email: "",
        address: "",
        state_code: "",
        opening_balance: "",
      })

      dispatch(fetchsuppliers())
      setStates([]);
    }
    catch (err) {
      console.error(err.response?.data || err.message)
    }
  }

  const [search, setSearch] = useState("");
  const filteredsuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.toString().includes(search) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id) => {
    dispatch(deleteSupplier(id))
  };

  const [editingSupplier,setEditingSupplier]=useState(null)

  const handleEdit=(supplier)=>{
    setEditingSupplier(supplier._id)
    setForm({
      name:supplier.name || "",
        phone:supplier.PhoneInput || "",
        country: supplier.country  || "",
        gstin: supplier.gstin || "",
        email: supplier.email ||"",
        address: supplier.address || "",
        state_code: supplier.state_code ||"",
        opening_balance: supplier.opening_balance ||"",
    })
  }
  return (
    <div className="container mt-4 bg-gradient-warning">
      <h2 className="mb-4 d-flex align-items-center fs-5">
        <span className="me-2 d-flex align-items-center" style={{ color: "#4d6f99ff" }}>
          <IoIosContact size={24} />
        </span>
        <b>SUPPLIER MASTER</b>
      </h2>
      
      {["super_admin","admin"].includes(role) && (
      <form className="row g-3" onSubmit={handleSubmit}>
        <div className="col-md-6">
          <label className="form-label">Supplier Name <span className="text-danger">*</span></label>
          <input type="text" className="form-control bg-light" placeholder="Enter Supplier Name" name="name" value={form.name} onChange={handleChange} required />
        </div>
        
        <div className="col-md-6">
          <label className="form-label">
            Mobile Number <span className="text-danger">*</span>
          </label>
          <PhoneInput
            country={'in'}
            value={form.phone}
            onChange={handlePhoneChange}
            onCountryChange={handleCountryChange}
            inputProps={{
              name: 'phone',
              required: true,
              autoFocus: true,
                 pattern: "^[0-9\\-\\+\\s]{7,15}$",
              className: 'form-control bg-light',
            }}
            containerStyle={{ width: '100%' }}
            inputStyle={{
              width: '100%',
              height: '38px',
              padding: '6px 12px',
              fontSize: '1rem',
            }}
            buttonStyle={{
              border: '1px solid #ced4da',
              height: '38px',
            }}
          />
          <small className="text-muted">Selected country: {form.country || 'None'}</small>
        </div>

        <div className="col-md-6">
          <label className="form-label">GSTIN (Optional)</label>
          <input type="text" className="form-control bg-light" placeholder="Enter GSTIN" name="gstin" value={form.gstin} onChange={handleChange} />
        </div>
        
        <div className="col-md-6">
          <label className="form-label">Email (Optional)</label>
          <input type="email" className="form-control bg-light" placeholder="example@mail.com" name="email" value={form.email} onChange={handleChange} />
        </div>

        <div className="col-md-6">
          <label className="form-label">Address</label>
          <textarea className="form-control bg-light" rows="2" placeholder="Enter supplier address" name="address" value={form.address} onChange={handleChange}></textarea>
        </div>
        
        <div className="col-md-6">
          <label className="form-label">State <span className="text-danger">*</span></label>
          <select  className="form-select bg-light" name="state_code"  value={form.state_code} onChange={handleChange} required disabled={!form.country} >
            <option value="">Select State</option>
            {states.map(s => (<option key={s.isoCode} value={s.isoCode}> {s.name} ({s.isoCode})</option>  ))}
          </select>
          {form.country && (
            <small className="form-text text-muted">States for {Country.getCountryByCode(form.country)?.name || form.country}: {states.length} states available
            </small>
          )}
        </div>

        <div className="col-md-6">
          <label className="form-label">Opening Balance</label>
          <input className="form-control bg-light" type="number" placeholder="0.00" name="opening_balance" value={form.opening_balance} onChange={handleChange} />
        </div>
        
        <div className="col-12">
          <button type="submit" className="btn btn-primary px-4 d-flex align-items-center justify-content-center">
            <span className="text-warning me-2 d-flex align-items-center"><FaRegSave /></span> {editingSupplier ? "Update Supplier"  : "Add Supplier"}
          </button>
        </div>
      </form>)}
      
      <br />
      
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="mb-3">Supplier Tree</h5>
          <div className="mt-4 mb-2 input-group">
            <input type="text" className="form-control" placeholder="Search supplier name, email, phone" value={search} onChange={(e) => setSearch(e.target.value)} />
            <span className="input-group-text"><FaSearch /></span>
          </div>
          
          <table className="table table-bordered table-striped">
            <thead className="table-dark">
              <tr>
                <th className="fw-bold">Supplier Name</th>
                <th className="fw-bold">Mobile Number</th>
                <th className="fw-bold">GSTIN</th>
                <th className="fw-bold">Email</th>
                <th className="fw-bold">Address</th>
                <th className="fw-bold">State</th>
                <th className="fw-bold">Opening Balance</th>
                <th className="fw-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredsuppliers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center">
                    No suppliers found.
                  </td>
                </tr>
              ) : (
                filteredsuppliers.map((s) => (
                  <tr key={s._id}>
                    <td>{s.name}</td>
                    <td>{s.phone}</td>
                    <td>{s.gstin}</td>
                    <td>{s.email}</td>
                    <td>{s.address}</td>
                    <td>{s.state_code}</td>
                    <td>{s.opening_balance}</td>
                    <td>
                      {["super_admin","admin"].includes(role) ? (
                        <>
                        <button className='btn btn-warning btn-sm me-2' onClick={()=>handleEdit(s)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s._id)}>
                        <span className="text-warning">
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
          </table>
        </div>
      </div>
    </div>
  )
}

export default Supplier