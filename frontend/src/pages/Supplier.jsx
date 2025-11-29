// import React, { useEffect, useState } from 'react';
import { IoIosContact } from "react-icons/io";
import { FaRegSave,} from "react-icons/fa";
import { MdClose, MdAdd,  } from "react-icons/md";

import 'react-phone-input-2/lib/style.css';
import PhoneInput from 'react-phone-input-2';
import { State, Country } from 'country-state-city';
import { useDispatch, useSelector } from 'react-redux';
import { addSupplier, deleteSupplier, fetchsuppliers, updateSupplier } from '../redux/supplierSlice';
import { setAuthToken } from '../services/userService';
import ReusableTable, {createCustomRoleActions, } from '../components/ReusableTable'; // Import the reusable table
import { useState,useEffect } from "react";

const Supplier = () => {
  const dispatch = useDispatch();
  const { items: suppliers, status } = useSelector((state) => state.suppliers);

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role || "user";
 

  const [form, setForm] = useState({
    name: "",
    phone: "",
    country: "",
    gstin: "",
    email: "",
    address: "",
    state_code: "",
    opening_balance: "",
  });

  const [states, setStates] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [searchMobile,setSearchMobile]=useState("")
  const [searchEmail,setSearchEmail]=useState("")
 
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [showSupplierForm, setShowSupplierForm] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.token) console.error("Token missing");
    setAuthToken(user?.token);
    dispatch(fetchsuppliers());
  }, [dispatch]);

  const updateStates = (countryCode) => {
    if (countryCode) {
      try {
        const stateList = State.getStatesOfCountry(countryCode.toUpperCase());
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
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === "country") updateStates(value);
  };

  const handlePhoneChange = (phone, countryData) => {
    const countryCode =
      countryData?.countryCode ||
      countryData?.iso2 ||
      (countryData?.dialCode === '91' ? 'IN' : '');
    setForm(prev => ({ ...prev, phone: phone, country: countryCode }));
    updateStates(countryCode);
  };

  const handleCountryChange = (countryCode) => {
    setForm(prev => ({ ...prev, country: countryCode }));
    updateStates(countryCode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSupplier) {
        await dispatch(updateSupplier({ id: editingSupplier, updatedData: form })).unwrap();
        setEditingSupplier(null);
      } else {
        await dispatch(addSupplier(form)).unwrap();
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
      });
      setStates([]);
      setShowSupplierForm(false);
      dispatch(fetchsuppliers());
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier._id);
    setForm({
      name: supplier.name || "",
      phone: supplier.phone?.toString() || "",
      country: supplier.country || "",
      gstin: supplier.gstin || "",
      email: supplier.email || "",
      address: supplier.address || "",
      state_code: supplier.state_code || "",
      opening_balance: supplier.opening_balance || "",
    });
    setShowSupplierForm(true);
  };

  const handleDelete = (id) => {
    dispatch(deleteSupplier(id));
  };

  const handleCloseForm = () => {
    setShowSupplierForm(false);
    setEditingSupplier(null);
    setForm({
      name: "",
      phone: "",
      country: "",
      gstin: "",
      email: "",
      address: "",
      state_code: "",
      opening_balance: "",
    });
  };

  const filteredSuppliers = suppliers.filter(
    (s) =>{
      const name = s.name?.toLowerCase() || ""
      const mobile = String(s.phone || "").toLowerCase()
      const email = String(s.email || "").toLowerCase()
      const matchname=searchName.trim() === "" || name.includes(searchName.toLowerCase())
      const matchmobile=searchMobile.trim() === "" || mobile.includes(searchMobile.toLowerCase())
      const matchemail=searchEmail.trim() === "" || email.includes(searchEmail.toLowerCase())
      return matchname && matchmobile && matchemail
    }
     
  );

  const tableColumns = [
    {
      key: "name",
      header: "Supplier Name",
      headerStyle: { width: "150px" }
    },
    {
      key: "phone",
      header: "Mobile",
      headerStyle: { width: "130px" }
    },
    {
      key: "gstin",
      header: "GSTIN",
      headerStyle: { width: "120px" },
      render: (supplier) => supplier.gstin || "-"
    },
    {
      key: "email",
      header: "Email",
      headerStyle: { width: "180px" },
      render: (supplier) => supplier.email || "-"
    },
    {
      key: "address",
      header: "Address",
      headerStyle: { width: "200px" },
      render: (supplier) => supplier.address || "-"
    },
    {
      key: "state_code",
      header: "State",
      headerStyle: { width: "100px" }
    },
    {
      key: "opening_balance",
      header: "Opening Balance",
      headerStyle: { width: "140px" },
      render: (supplier) => supplier.opening_balance ? `₹${supplier.opening_balance}` : "-"
    }
  ];

   const tableActions = createCustomRoleActions({
      edit: { 
        show: () => ["super_admin", "admin",].includes(role)
      },
      delete: { 
        show: () => ["super_admin", "admin"].includes(role) 
      }})
    
      
      const handleTableAction = (actionType, category) => {
        if (actionType === "edit") {
          handleEdit(category);
        } else if (actionType === "delete") {
          handleDelete(category._id);
        }
      };

  return (
    <div className="container mt-4">
      <h2 className="mb-4 d-flex align-items-center fs-3">
        
        <b>Suppliers</b>
      </h2>

      {["super_admin", "admin"].includes(role) && (
        <div className="row mb-4">
          <div className="col-12">
            <button
              className="btn add text-white d-flex align-items-center" 
              onClick={() => setShowSupplierForm(true)}
            >
              
              Add Supplier
            </button>
          </div>
        </div>
      )}

      {showSupplierForm && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header  text-white">
                <h5 className="modal-title">{editingSupplier ? "Edit Supplier" : "Add New Supplier"}</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={handleCloseForm}
                ></button>
              </div>
              <div className="modal-body">
                <form className="row g-3" onSubmit={handleSubmit}>
                  <div className="col-md-6">
                    <label className="form-label">Supplier Name <span className="text-danger">*</span></label>
                    <input type="text" className="form-control bg-light" name="name" value={form.name} onChange={handleChange} required placeholder="Enter Supplier Name" />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Mobile Number <span className="text-danger">*</span></label>
                    <PhoneInput
                      country={'in'}
                      value={form.phone}
                      onChange={handlePhoneChange}
                      onCountryChange={handleCountryChange}
                      inputProps={{
                        name: 'phone',
                        required: true,
                        className: 'form-control bg-light',
                      }}
                      containerStyle={{ width: '100%' }}
                      inputStyle={{ width: '100%', height: '38px' }}
                    />
                    <small className="text-muted">Selected country: {form.country || 'None'}</small>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">GSTIN (Optional)</label>
                    <input type="text" className="form-control bg-light" name="gstin" value={form.gstin} onChange={handleChange} placeholder="Enter GSTIN" />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Email (Optional)</label>
                    <input type="email" className="form-control bg-light" name="email" value={form.email} onChange={handleChange} placeholder="example@mail.com" />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Address</label>
                    <textarea className="form-control bg-light" rows="2" name="address" value={form.address} onChange={handleChange} placeholder="Enter supplier address"></textarea>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">State <span className="text-danger">*</span></label>
                    <select className="form-select bg-light" name="state_code" value={form.state_code} onChange={handleChange} required disabled={!form.country}>
                      <option value="">Select State</option>
                      {states.map(s => (
                        <option key={s.isoCode} value={s.isoCode}>
                          {s.name} ({s.isoCode})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Opening Balance</label>
                    <input type="number" className="form-control bg-light" name="opening_balance" value={form.opening_balance} onChange={handleChange} placeholder="0.00" />
                  </div>

                  <div className="col-12 d-flex gap-2">
                     <button type="submit" className="btn add text-white px-4" >
              
                      {editingSupplier ? "Update Supplier" : "Add Supplier"}
                    </button>
                    <button type="button" className="btn btn-secondary px-4" onClick={handleCloseForm}>
                       Cancel
                    </button>
                   
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      <ReusableTable
        data={filteredSuppliers}
        columns={tableColumns}
        loading={status === "loading"}
        searchable={true}
        searchTerm1={searchName}
        searchTerm2={searchMobile}
        searchTerm3={searchEmail}
        onSearchChange1={setSearchName}
        onSearchChange2={setSearchMobile}
        onSearchChange3={setSearchEmail}
        searchPlaceholder1="Search Name"
        searchPlaceholder2="Search Mobile"
        searchPlaceholder3="Search Email"
        showThirdSearch={true}
        actions={tableActions}
        onActionClick={handleTableAction}
        emptyMessage="No suppliers found."
        className="mt-4"
        onResetSearch={()=>{
          setSearchName("")
          setSearchMobile("")
          setSearchEmail("")
        }}
      />
    </div>
  );
};

export default Supplier;