

import { useEffect, useState } from 'react';
import { MdOutlineWarehouse, MdAdd, MdClose, } from "react-icons/md";
import { FaRegSave,  } from "react-icons/fa";
import PhoneInput from 'react-phone-input-2';
import { State, Country } from 'country-state-city';
import { useDispatch, useSelector } from 'react-redux';
import { addwarehouse, deletewarehouse, fetchwarehouses, updateWarehouse } from '../redux/warehouseSlice';
import { setAuthToken } from '../services/userService';
import ReusableTable, {createCustomRoleActions,} from '../components/ReusableTable'; // Import the reusable table

const Warehouse = () => {
  const dispatch = useDispatch();
  const { items: warehouses, status } = useSelector((state) => state.warehouses);

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role || "user";
  const token = user?.token;

  const [form, setForm] = useState({
    store_name: "",
    code: "",
    address: "",
    country: "",
    state_code: "",
    contact: "",
    phone: "",
    email: "",
    status: false
  });

  const [states, setStates] = useState([]);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [showWarehouseForm, setShowWarehouseForm] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.token) console.error("No user found Please Login");
    const token = user?.token;
    setAuthToken(token);
    dispatch(fetchwarehouses());
  }, [dispatch]);


  const updateStates = (countryCode) => {
    if (countryCode) {
      try {
        const stateList = State.getStatesOfCountry(countryCode.toUpperCase());
        setStates(stateList);
        setForm((prev) => ({ ...prev, state_code: "" }));
      } catch (error) {
        console.error("Error fetching states:", error);
        setStates([]);
      }
    } else {
      setStates([]);
      setForm((prev) => ({ ...prev, state_code: "" }));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));

    if (name === "country") {
      updateStates(value);
    }
  };

  const handlePhoneChange = (phone, countryData) => {
    const countryCode =
      countryData?.countryCode ||
      countryData?.iso2 ||
      (countryData?.dialCode === '91' ? 'IN' : '');
    setForm((prev) => ({
      ...prev,
      phone: phone,
      country: countryCode
    }));
    updateStates(countryCode);
  };

  const handleCountryChange = (countryCode, countryData) => {
    setForm((prev) => ({
      ...prev,
      country: countryCode
    }));
    updateStates(countryCode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingWarehouse) {
        await dispatch(updateWarehouse({ id: editingWarehouse, updatedData: form })).unwrap();
        setEditingWarehouse(null);
        console.log("Warehouse updated Successfully");
      } else {
        await dispatch(addwarehouse(form)).unwrap();
        console.log("Warehouse added Successfully");
      }

      setForm({
        store_name: "",
        code: "",
        address: "",
        country: "",
        state_code: "",
        contact: "",
        phone: "",
        email: "",
        status: false
      });
      setShowWarehouseForm(false);
      setStates([]);
      dispatch(fetchwarehouses());
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  const handleDelete = async (id) => {
    dispatch(deletewarehouse(id));
  };

  const handleEdit = (warehouse) => {
    setEditingWarehouse(warehouse._id);
    setForm({
      store_name: warehouse.store_name || "",
      code: warehouse.code || "",
      address: warehouse.address || "",
      country: warehouse.country || "",
      state_code: warehouse.state_code || "",
      contact: warehouse.contact || "",
      phone: warehouse.phone?.toString() || "",
      email: warehouse.email || "",
      status: warehouse.status || false
    });
    setShowWarehouseForm(true);
  };

  const handleCloseForm = () => {
    setShowWarehouseForm(false);
    setEditingWarehouse(null);
    setForm({
      store_name: "",
      code: "",
      address: "",
      country: "",
      state_code: "",
      contact: "",
      phone: "",
      email: "",
      status: false
    });
  };

  const filteredwarehouse = warehouses.filter(
    (w) =>
      w.store_name.toLowerCase().includes(search.toLowerCase()) ||
      w.phone.toString().includes(search) ||
      w.email.toLowerCase().includes(search.toLowerCase())
  );

  const tableColumns = [
    {
      key: "store_name",
      header: "Warehouse / Store Name",
      headerStyle: { width: "180px" }
    },
    {
      key: "code",
      header: "Code",
      headerStyle: { width: "100px" }
    },
    {
      key: "address",
      header: "Address",
      headerStyle: { width: "200px" },
      render: (warehouse) => warehouse.address || "-"
    },
    {
      key: "state_code",
      header: "State",
      headerStyle: { width: "100px" }
    },
    {
      key: "contact",
      header: "Contact",
      headerStyle: { width: "150px" },
      render: (warehouse) => warehouse.contact || "-"
    },
    {
      key: "phone",
      header: "Phone",
      headerStyle: { width: "130px" }
    },
    {
      key: "email",
      header: "Email",
      headerStyle: { width: "180px" },
      render: (warehouse) => warehouse.email || "-"
    },
    {
      key: "status",
      header: "Status",
      headerStyle: { width: "100px" },
      render: (warehouse) => (
        <span className={warehouse.status ? "text-success fw-bold" : "text-danger"}>
          {warehouse.status ? "Active" : "Inactive"}
        </span>
      )
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
      <h2 className="mb-4 d-flex align-items-center fs-5">
        <span className="me-2 d-flex align-items-center" style={{ color: "#4d6f99ff" }}>
          <MdOutlineWarehouse size={24} />
        </span>
        <b>WAREHOUSE MASTER</b>
      </h2>

  
      <div className="row mb-4">
        <div className="col-12">
          {["super_admin", "admin"].includes(role) && (
            <button
              className="btn add text-white d-flex align-items-center" 
              onClick={() => setShowWarehouseForm(true)}
            >
              <MdAdd className="me-2" />
              Add Warehouse
            </button>
          )}
        </div>
      </div>

      {showWarehouseForm && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header  text-white">
                <h5 className="modal-title">
                  {editingWarehouse ? "Edit Warehouse" : "Add New Warehouse"}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={handleCloseForm}
                ></button>
              </div>
              <div className="modal-body">
                <form className="row g-3" onSubmit={handleSubmit}>
                  
                  <div className="col-md-6">
                    <label className="form-label">Warehouse / Store Name <span className="text-danger">*</span></label>
                    <input type="text" className="form-control bg-light" placeholder="Enter warehouse/store name" name="store_name" value={form.store_name} onChange={handleChange} required />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Code <span className="text-danger">*</span></label>
                    <input type="text" className="form-control bg-light" placeholder="Unique code" name="code" value={form.code} onChange={handleChange} required />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Location / Address</label>
                    <textarea className="form-control bg-light" rows="2" placeholder="Enter address" name="address" value={form.address} onChange={handleChange}></textarea>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Contact Person</label>
                    <input type="text" className="form-control bg-light" placeholder="Enter contact person" name="contact" value={form.contact} onChange={handleChange} required />
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
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control bg-light" placeholder="example@mail.com" name="email" value={form.email} onChange={handleChange} />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">State <span className="text-danger">*</span></label>
                    <select
                      className="form-select bg-light"
                      name="state_code"
                      value={form.state_code}
                      onChange={handleChange}
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
                    <label className="form-label">Status</label>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="statusToggle"
                        name="status"
                        checked={form.status}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor="statusToggle">
                        Active
                      </label>
                    </div>
                  </div>

                  <div className="col-12 d-flex gap-2">
                    <button type="submit" className="btn add text-white px-4 d-flex align-items-center justify-content-center" >
                      <span className=" me-2 d-flex align-items-center" ><FaRegSave /></span>
                      {editingWarehouse ? "Update Warehouse" : "Save Warehouse"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary px-4 d-flex align-items-center justify-content-center"
                      onClick={handleCloseForm}
                    >
                      <MdClose className="me-2" /> Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      <ReusableTable
        data={filteredwarehouse}
        columns={tableColumns}
        loading={status === "loading"}
        searchable={true}
        searchTerm={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search Warehouse name, email, phone"
        actions={tableActions}
        onActionClick={handleTableAction}
        emptyMessage="No warehouses found."
        className="mt-4"
      />
    </div>
  );
};

export default Warehouse;
