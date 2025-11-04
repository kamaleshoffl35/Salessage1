


import React, { useEffect, useState } from 'react'
import { MdOutlineAttachMoney, MdAdd, MdClose } from "react-icons/md";
import { FaRegSave } from "react-icons/fa";
import axios from 'axios';
import { MdDeleteForever } from "react-icons/md";
import { FaSearch } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import { addtax, deletetax, fetchtaxes, updatetax } from '../redux/taxSlice';
import { setAuthToken } from '../services/userService';
import { MdEdit } from "react-icons/md";
import ReusableTable, {createCustomRoleActions, createRoleBasedActions} from '../components/ReusableTable'; // Import the reusable table

const Tax = () => {
    const dispatch = useDispatch()
    const { items: taxes, status } = useSelector((state) => state.taxes)

    const user = JSON.parse(localStorage.getItem("user"))
    const role = user?.role || "user"
    const token = user?.token

    const [showTaxForm, setShowTaxForm] = useState(false)
    const [form, setForm] = useState({
        name: "",
        cgst_percent: "",
        sgst_percent: "",
        igst_percent: "",
        cess_percent: "",
        is_inclusive: false,
    })

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"))
        if (!user || !user.token)
            console.error("No user found Please Login")
        const token = user.token
        setAuthToken(token)
        dispatch(fetchtaxes())
    }, [dispatch])

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setForm({ ...form, [name]: type === "checkbox" ? checked : value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (editingTax) {
                await dispatch(updatetax({ id: editingTax, updatedData: form })).unwrap()
                setEditingTax(null)
                console.log("Tax Updated Successfully")
            } else {
                await dispatch(addtax(form)).unwrap()
                console.log("Tax added Successfully")
            }

            setForm({
                name: "",
                cgst_percent: "",
                sgst_percent: "",
                igst_percent: "",
                cess_percent: "",
                is_inclusive: false,
            })
            setShowTaxForm(false)
            dispatch(fetchtaxes())

        }
        catch (err) {
            console.error(err.response?.data || err.message)
        }
    }

    const [search, setSearch] = useState("");
    const filteredtaxes = taxes.filter(
        (t) =>
            t.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = async (id) => {
        dispatch(deletetax(id))
    };

    const [editingTax, setEditingTax] = useState(null)

    const handleEdit = (tax) => {
        setEditingTax(tax._id)
        setForm({
            name: tax.name || "",
            cgst_percent: tax.cgst_percent || "",
            sgst_percent: tax.sgst_percent || "",
            igst_percent: tax.igst_percent || "",
            cess_percent: tax.cess_percent || "",
            is_inclusive: tax.is_inclusive || false,
        })
        setShowTaxForm(true)
    }

    const handleCloseForm = () => {
        setShowTaxForm(false)
        setEditingTax(null)
        setForm({
            name: "",
            cgst_percent: "",
            sgst_percent: "",
            igst_percent: "",
            cess_percent: "",
            is_inclusive: false,
        })
    }

    // Define table columns for reusable table
    const tableColumns = [
        {
            key: "name",
            header: "Tax Name/Value",
            headerStyle: { width: "150px" }
        },
        {
            key: "cgst_percent",
            header: "CGST",
            headerStyle: { width: "100px" },
            render: (tax) => `${tax.cgst_percent}%`
        },
        {
            key: "sgst_percent",
            header: "SGST",
            headerStyle: { width: "100px" },
            render: (tax) => `${tax.sgst_percent}%`
        },
        {
            key: "igst_percent",
            header: "IGST",
            headerStyle: { width: "100px" },
            render: (tax) => `${tax.igst_percent}%`
        },
        {
            key: "cess_percent",
            header: "CESS",
            headerStyle: { width: "100px" },
            render: (tax) => tax.cess_percent ? `${tax.cess_percent}%` : "-"
        },
        {
            key: "is_inclusive",
            header: "Inclusive Tax",
            headerStyle: { width: "120px" },
            render: (tax) => (
                <span className={tax.is_inclusive ? "text-success fw-bold" : "text-danger"}>
                    {tax.is_inclusive ? "Yes" : "No"}
                </span>
            )
        }
    ];

    const tableActions = createCustomRoleActions({
       edit: { 
         show: () => ["super_admin", "admin",].includes(role) // User can edit
       },
       delete: { 
         show: () => ["super_admin", "admin"].includes(role) // Only admin/super_admin can delete
       }})

  // Handle table actions
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
                    <MdOutlineAttachMoney size={24} />
                </span>
                <b>TAX MASTER</b>
            </h2>

            {/* Action Buttons - Above the tax area */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex gap-2">
                        {["super_admin", "admin"].includes(role) && (
                            <button
                                className="btn btn-primary d-flex align-items-center"
                                onClick={() => setShowTaxForm(true)}
                            >
                                <MdAdd className="me-2" />
                                Add Tax
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Tax Form Popup/Modal */}
            {showTaxForm && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title">
                                    {editingTax ? "Edit Tax" : "Add New Tax"}
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
                                        <label className="form-label">Tax Name</label>
                                        <input type="text"
                                            className="form-control bg-light"
                                            name="name" value={form.name} onChange={handleChange}
                                            placeholder='e.g, GST 18%' />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">CGST %</label>
                                        <input type="number"
                                            className="form-control bg-light" name="cgst_percent" value={form.cgst_percent} onChange={handleChange}
                                            placeholder='0.00' />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">SGST %</label>
                                        <input type="number"
                                            className="form-control bg-light" name="sgst_percent" value={form.sgst_percent} onChange={handleChange}
                                            placeholder='0.00' />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">IGST %</label>
                                        <input type="number" name="igst_percent" value={form.igst_percent} onChange={handleChange}
                                            className="form-control bg-light"
                                            placeholder='0.00' />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">CESS % (Optional)</label>
                                        <input type="number"
                                            className="form-control bg-light" name="cess_percent" value={form.cess_percent} onChange={handleChange}
                                            placeholder='0.00' />
                                    </div>
                                    <div className="col-md-6 form-check d-flex align-items-center">
                                        <input type="checkbox" className="form-check-input me-2" name="is_inclusive" checked={form.is_inclusive} onChange={handleChange} />
                                        <label className="form-check-label">Inclusive Tax</label>
                                    </div>
                                    <div className="col-12 d-flex gap-2">
                                        <button type="submit" className="btn btn-primary px-4 d-flex align-items-center justify-content-center">
                                            <span className="text-warning me-2 d-flex align-items-center">
                                                <FaRegSave />
                                            </span>
                                            {editingTax ? "Update Tax" : "Add Tax"}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-secondary px-4 d-flex align-items-center justify-content-center"
                                            onClick={handleCloseForm}
                                        >
                                            <span className='me-2 d-flex align-items-center'>
                                                <MdClose />
                                            </span>
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reusable Table Component - Replaces the old table */}
           <ReusableTable
        data={filteredtaxes}
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
    )
}

export default Tax