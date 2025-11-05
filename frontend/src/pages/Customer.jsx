

import  { useEffect, useState } from 'react';
import { IoIosContact } from "react-icons/io";
import { FaRegSave} from "react-icons/fa";
import { MdClose, MdAdd } from "react-icons/md";
import 'react-phone-input-2/lib/style.css';
import PhoneInput from 'react-phone-input-2';
import { State, Country } from 'country-state-city';
import { useDispatch, useSelector } from 'react-redux';
import { addcustomer, deletecustomer, fetchcustomers, updatecustomer } from '../redux/customerSlice';
import ReusableTable, {createCustomRoleActions} from '../components/ReusableTable'; // Import the reusable table

const Customer = () => {
  const dispatch = useDispatch();
  const { items: customers, status } = useSelector((state) => state.customers);
  
const user = JSON.parse(localStorage.getItem("user"))
    const role = user?.role || "user"

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
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  useEffect(() => {
    dispatch(fetchcustomers());
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
      countryData?.code ||
      (countryData?.dialCode ? getCountryCodeFromDialCode(countryData.dialCode) : "");
    setForm(prev => ({
      ...prev,
      phone: phone,
      country: countryCode,
    }));
    updateStates(countryCode);
  };

  const getCountryCodeFromDialCode = (dialCode) => {
    const dialCodeMap = { '91': 'IN', '1': 'US', '44': 'GB', '61': 'AU' };
    return dialCodeMap[dialCode] || '';
  };

  const handleCountryChange = (countryCode) => {
    setForm(prev => ({ ...prev, country: countryCode }));
    updateStates(countryCode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await dispatch(updatecustomer({ id: editingCustomer, updatedData: form })).unwrap();
        setEditingCustomer(null);
      } else {
        await dispatch(addcustomer(form)).unwrap();
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
      setShowCustomerForm(false);
      dispatch(fetchcustomers());
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  const handleDelete = async (id) => {
    dispatch(deletecustomer(id));
  };

  const filteredCustomers = customers.filter(
    c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.toString().includes(search) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (customer) => {
    setEditingCustomer(customer._id);
    setForm({
      name: customer.name || "",
      phone: customer.phone?.toString() || "",
      country: customer.country || "",
      gstin: customer.gstin || "",
      email: customer.email || "",
      billing_address: customer.billing_address || "",
      shipping_address: customer.shipping_address || "",
      state_code: customer.state_code || "",
      credit_limit: customer.credit_limit || "",
      opening_balance: customer.opening_balance || "",
    });
    setShowCustomerForm(true);
  };

  const handleCloseForm = () => {
    setShowCustomerForm(false);
    setEditingCustomer(null);
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
  };
  const tableColumns = [
    {
      key: "name",
      header: "Customer Name",
      headerStyle: { width: "150px" }
    },
    {
      key: "phone",
      header: "Mobile Number",
      headerStyle: { width: "140px" }
    },
    {
      key: "state_code",
      header: "State",
      headerStyle: { width: "100px" }
    },
    {
      key: "gstin",
      header: "GSTIN",
      headerStyle: { width: "120px" },
      render: (customer) => customer.gstin || "-"
    },
    {
      key: "email",
      header: "Email",
      headerStyle: { width: "180px" },
      render: (customer) => customer.email || "-"
    },
    {
      key: "billing_address",
      header: "Address",
      headerStyle: { width: "200px" },
      render: (customer) => customer.billing_address || "-"
    },
    {
      key: "credit_limit",
      header: "Credit Limit",
      headerStyle: { width: "120px" },
      render: (customer) => customer.credit_limit ? `₹${customer.credit_limit}` : "-"
    },
    {
      key: "opening_balance",
      header: "Opening Balance",
      headerStyle: { width: "140px" },
      render: (customer) => customer.opening_balance ? `₹${customer.opening_balance}` : "-"
    }
  ];
  const tableActions = createCustomRoleActions({
  edit: { 
    show: () => ["super_admin", "admin", "user"].includes(role) 
  },
  delete: { 
    show: () => ["super_admin", "admin"].includes(role)
  }
});

    const handleTableAction = (actionType, category) => {
      if (actionType === "edit") {
        handleEdit(category);
      } else if (actionType === "delete") {
        handleDelete(category._id);
      }
    };
  return (
    <div className="container mt-4">
      <h2 className="mb-4 d-flex align-items-center fs-5">
        <span className="me-2 d-flex align-items-center" style={{ color: "#4d6f99ff" }}>
          <IoIosContact size={24} />
        </span>
        <b>CUSTOMER MASTER</b>
      </h2>
      <div className="row mb-4">
        <div className="col-12">
          <button
            className="btn add text-white d-flex align-items-center" 
            onClick={() => setShowCustomerForm(true)}
          >
            <MdAdd className="me-2" />
            Add Customer
          </button>
        </div>
      </div>
      {showCustomerForm && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header  text-white">
                <h5 className="modal-title">{editingCustomer ? "Edit Customer" : "Add New Customer"}</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={handleCloseForm}
                ></button>
              </div>
              <div className="modal-body">
                <form className="row g-3" onSubmit={handleSubmit}>
                  <div className="col-md-6">
                    <label className="form-label">Customer Name <span className="text-danger">*</span></label>
                    <input type="text" className="form-control bg-light" placeholder="Enter full name" onChange={handleChange} name="name" value={form.name} required pattern="[A-Za-z\s]+" />
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
                    <button
                      type="submit"
                      className="btn add text-white px-4 d-flex align-items-center justify-content-center"
                    >
                      <FaRegSave className="me-2 text-white" />
                      {editingCustomer ? "Update Customer" : "Add Customer"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary px-4 d-flex align-items-center justify-content-center"
                      onClick={handleCloseForm}
                    >
                      <MdClose className="me-2" />
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
        data={filteredCustomers}
        columns={tableColumns}
        loading={status === "loading"}
        searchable={true}
        searchTerm={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search Category code, Category name"
        actions={tableActions}
        onActionClick={handleTableAction}
        emptyMessage="No categories found."
        className="mt-4"
      />
    </div>
  );
};

export default Customer;
