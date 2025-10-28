import React, { useEffect, useState } from 'react';
import { IoIosContact } from "react-icons/io";
import { FaRegSave, FaSearch } from "react-icons/fa";
import { FcCancel } from "react-icons/fc";
import { MdDeleteForever } from "react-icons/md";
import axios from 'axios';
import 'react-phone-input-2/lib/style.css';
import PhoneInput from 'react-phone-input-2';
import { State, Country } from 'country-state-city';
import { useDispatch,useSelector } from 'react-redux';
import { addcustomer, deletecustomer, fetchcustomers, updatecustomer } from '../redux/customerSlice';
import { MdEdit } from "react-icons/md";

const Customer = () => {
   const dispatch=useDispatch()
   const {items:customers,status} = useSelector((state)=>state.customers)
    
    const [form, setForm] = useState({
        name: "",
        phone: "",
        country: "",
        gstin: "",
        email: "",
        billing_address: "",
        shipping_address: "",
        state_code: "",
        credit_limit: "",
        opening_balance: "",
    });
    const [states, setStates] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        dispatch(fetchcustomers())
    }, []);

    // Function to update states based on country code
    const updateStates = (countryCode) => {
        console.log("Updating states for country:", countryCode); 
        if (countryCode) {
            try {
                const stateList = State.getStatesOfCountry(countryCode.toUpperCase());
                console.log("States found:", stateList.length); // Debug log
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

        if (name === "country") {
            updateStates(value);
        }
    };

    const handlePhoneChange = (phone, countryData) => {
        console.log("Phone changed:", phone, countryData); // Debug log
        
        // Extract country code correctly - try different possible properties
        const countryCode = countryData?.countryCode || 
                           countryData?.code || 
                           (countryData?.dialCode ? getCountryCodeFromDialCode(countryData.dialCode) : "");
        
        console.log("Extracted country code:", countryCode); // Debug log
        
        setForm(prev => ({
            ...prev,
            phone: phone,
            country: countryCode
        }));

        // Update states based on the selected country
        updateStates(countryCode);
    };

    // Helper function to get country code from dial code (fallback)
    const getCountryCodeFromDialCode = (dialCode) => {
        const dialCodeMap = {
            '91': 'IN', // India
            '1': 'US',  // USA
            '44': 'GB', // UK
            '61': 'AU', // Australia
            // Add more mappings as needed
        };
        return dialCodeMap[dialCode] || '';
    };

    // Alternative approach: Use the onCountryChange event
    const handleCountryChange = (countryCode, countryData) => {
        console.log("Country changed to:", countryCode, countryData); // Debug log
        setForm(prev => ({
            ...prev,
            country: countryCode
        }));
        updateStates(countryCode);
    };

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if(editingCustomer){
                await dispatch(updatecustomer({id:editingCustomer,updatedData:form})).unwrap()
                setEditingCustomer(null)
                console.log("Customer Updated Successfully")
            }
            else{
                  await dispatch(addcustomer(form)).unwrap()
                  console.log("Customer Added Successfully")
            }
           
            setForm({
                name: "",
                phone: "",
                country: "",
                gstin: "",
                email: "",
                billing_address: "",
                shipping_address: "",
                state_code: "",
                credit_limit: "",
                opening_balance: "",
            });
            setStates([]);
        } catch (err) {
            console.error(err.response?.data || err.message);
        }
    };

    const handleDelete = async (id) => {
        dispatch(deletecustomer(id))
    };

    const filteredCustomers = customers.filter(
        c =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.phone.toString().includes(search) ||
            c.email.toLowerCase().includes(search.toLowerCase())
    );

    const [editingCustomer,setEditingCustomer]=useState(null)

    const handleEdit =(customer)=>{
        setEditingCustomer(customer._id)
        setForm({
             name: customer.name || "",
                phone: customer.PhoneInput || "",
                country:customer.country ||  "",
                gstin: customer.gstin || "",
                email: customer.email || "",
                billing_address: customer.billing_address|| "",
                shipping_address: customer.shipping_address || "",
                state_code: customer.state_code || "",
                credit_limit:customer.credit_limit || "",
                opening_balance: customer.opening_balance || "",
        })
    }

    return (
        <div className="container mt-4 bg-gradient-warning">
            <h2 className="mb-4 d-flex align-items-center fs-5">
                <span className="me-2 d-flex align-items-center" style={{ color: "#4d6f99ff" }}>
                    <IoIosContact size={24} />
                </span>
                <b>CUSTOMER MASTER</b>
            </h2>

            <form className="row g-3" onSubmit={handleSubmit}>
                <div className="col-md-6">
                    <label className="form-label">Customer Name <span className="text-danger">*</span></label>
                    <input type="text" className="form-control bg-light" placeholder="Enter full name" onChange={handleChange} name="name"  value={form.name} required pattern="[A-Za-z\s]+"/>
                </div>

                <div className="col-md-6">
                    <label className="form-label">Mobile Number <span className="text-danger">*</span></label>
                    <PhoneInput country={'in'} value={form.phone} onChange={handlePhoneChange} onCountryChange={handleCountryChange} // Add this line
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
                    <label className="form-label">State <span className="text-danger">*</span></label>
                    <select
                        className="form-select bg-light"
                        onChange={handleChange}
                        name="state_code"
                        value={form.state_code}
                        required
                        disabled={!form.country}
                    >
                        <option value="">Select State</option>
                        {states.map(s => (
                            <option key={s.isoCode} value={s.isoCode}>
                                {s.name} ({s.isoCode})
                            </option>
                        ))}
                    </select>
                    {form.country && (
                        <small className="form-text text-muted">
                            States for {Country.getCountryByCode(form.country)?.name || form.country}: {states.length} states available
                        </small>
                    )}
                </div>

                <div className="col-md-6">
                    <label className="form-label">GSTIN (Optional)</label>
                    <input type="text" className="form-control bg-light" placeholder="Optional GSTIN" onChange={handleChange} name="gstin" value={form.gstin} />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Email (Optional)</label>
                    <input type="email" className="form-control bg-light" placeholder="example@mail.com" onChange={handleChange} name="email" value={form.email} />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Billing Address <span className="text-danger">*</span></label>
                    <textarea className="form-control bg-light" rows="2" placeholder="Enter billing address" onChange={handleChange} name="billing_address" value={form.billing_address} required></textarea>
                </div>

                <div className="col-md-6">
                    <label className="form-label">Shipping Address (Optional)</label>
                    <textarea className="form-control bg-light" rows="2" placeholder="Enter shipping address" onChange={handleChange} name="shipping_address" value={form.shipping_address}></textarea>
                </div>

                <div className="col-md-6">
                    <label className="form-label">Credit Limit (Optional)</label>
                    <input type="number" className="form-control bg-light" placeholder="e.g. 50000" onChange={handleChange} name="credit_limit" value={form.credit_limit} />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Opening Balance (Optional)</label>
                    <input type="number" className="form-control bg-light" placeholder="e.g. 1000" onChange={handleChange} value={form.opening_balance} name="opening_balance" />
                </div>

                <div className="col-12 d-flex gap-2">
                    <button type="button" className=" btn btn-secondary px-4 d-flex align-items-center justify-content-center"><span className='me-2 d-flex align-items-center'><FcCancel /></span> Cancel</button>
                    <button type="submit" className="btn btn-primary px-4 d-flex align-items-center justify-content-center"><span className='text-warning me-2 d-flex align-items-center'><FaRegSave /> </span>{editingCustomer ? "Update Customer " :"Add Customer"}</button>
                </div>
            </form><br />

            <div className=" card shadow-sm">
                   <div className="card-body">
                     <h5 className="mb-3">Customer Tree</h5>
                     <div className="mt-4 mb-2 input-group">
                                             <input type="text" className="form-control" placeholder="Search customer name" value={search} onChange={(e) => setSearch(e.target.value)} />
                                             <span className="input-group-text"><FaSearch /></span>
                                         </div>
                     <table className="table table-bordered table-striped">
                       <thead className="table-dark">
                         <tr>
                           <th className="fw-bold">Customer Name</th>
                           <th className="fw-bold">Mobile Number</th>
                           <th className="fw-bold">State</th>
                           <th className="fw-bold">GSTIN</th>
                           <th className="fw-bold">Email</th>
                           <th className="fw-bold">Address</th>
                            <th className="fw-bold">Credit Limit</th>
                             <th className="fw-bold">Opening Balance</th>
                              {/* <th className="fw-bold">Status</th> */}
                           <th className="fw-bold">Actions</th>
                         </tr>
                       </thead>
                       <tbody>{filteredCustomers.length === 0 ? (
                                           <tr>
                                               <td colSpan="11" className="text-center">
                                                   No customers found.
                                               </td>
                                           </tr>
                                       ) : (
                         filteredCustomers.map((c) => (
                           <tr key={c._id}>
                             <td>{c.name}</td>
                             <td>{c.phone}</td>
                             <td>{c.state_code}</td>
                             <td>{c.gstin}</td>
                             <td>{c.email}</td>
                             <td>{c.billing_address}</td>
                             <td>{c.credit_limit}</td>
                             <td>{c.opening_balance}</td>
                             {/* <td className={c.status ? "text-success" : "text-danger"}>
                               {c.status ? "Active" : "Inactive"}
                             </td> */}
                             <td>
                                <button className='btn btn-warning btn-sm me-2' onClick={()=>handleEdit(c)}><MdEdit/>Edit</button>
                               <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c._id)}><span className="text-warning"><MdDeleteForever /></span>Delete</button>
                             </td>
                           </tr>)
                         ))
           } 
           </tbody>
                     </table>
                   </div>
                 </div>
        </div>
    );
};

export default Customer;