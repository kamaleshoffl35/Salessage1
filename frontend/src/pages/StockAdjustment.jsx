import React, { useState, useEffect } from "react";
import axios from "axios";
import { PiShippingContainer } from "react-icons/pi";
import { MdDelete } from "react-icons/md";
import { FaSave } from "react-icons/fa";
import { FaSearch } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { useDispatch,useSelector } from "react-redux";
import { fetchwarehouses } from "../redux/warehouseSlice";
import { fetchProducts } from "../redux/productSlice";
import { addstock, deletestock, fetchstocks } from "../redux/stockadjSlice";

const StockAdjustment = () => {
    const dispatch=useDispatch()
    const {items:stocks,status}= useSelector((state)=>state.stocks)
    const {items:warehouses}=useSelector((state)=>state.warehouses)
    const {items:products}=useSelector((state)=>state.products)
    
    const [form, setForm] = useState({
        warehouse_id: "",
        reason: "",
        date: new Date().toISOString().slice(0, 16),
        notes: "",
        items: [{ product_id: "", batch: "", qty: "", remarks: "" }]
    });

    useEffect(() => {
       dispatch(fetchwarehouses())

       dispatch(fetchProducts())
dispatch(fetchstocks())
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        const items = [...form.items];
        items[index][name] = value;
        setForm({ ...form, items });
    };

    const addItem = () => {
        setForm({
            ...form,
            items: [...form.items, { product_id: "", batch: "", qty: "", remarks: "" }]
        });
    };

    const removeItem = (index) => {
        if (form.items.length === 1) {
            alert("At least one item is required.");
            return;
        }
        const items = [...form.items];
        items.splice(index, 1);
        setForm({ ...form, items });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            dispatch(addstock(form))
            setForm({
                warehouse_id: "",
                reason: "",
                date: new Date().toISOString().slice(0, 16),
                notes: "",
                items: [{ product_id: "", batch: "", qty: "", remarks: "" }]
            });
        } catch (err) {
            console.error(err.response?.data || err.message);
        }
    };

    const [search, setSearch] = useState("")

    const filteredstocks = stocks.filter((s) => {
        const warehousename = s.warehouse_id?.store_name || warehouses.find((w) => w._id === s.warehouse_id)?.store_name || "";
        const productNames = s.items.map((item) =>
            products.find((p) => p._id === item.product_id)?.name || "Unknown"
        )
            .join(" ");

        return (
            warehousename.toLowerCase().includes(search.trim().toLowerCase()) ||
            productNames.toLowerCase().includes(search.trim().toLowerCase()) ||
            s.reason?.toLowerCase().includes(search.trim().toLowerCase()) ||
            s.date?.toString().toLowerCase().includes(search.trim().toLowerCase())
        );
    });

    const handleDelete = async (id) => {
      dispatch(deletestock(id))
    };


    return (
        <div className="container mt-4">
            <h2 className="mb-4 d-flex align-items-center fs-5"><span className="  me-2 d-flex align-items-center" style={{color:"#4d6f99ff"}}><PiShippingContainer size={24} /></span>{" "}<b >STOCK ADJUSTMENT</b></h2>
            <form onSubmit={handleSubmit}>
                <div className="row g-3 mb-3">
                    <div className="col-md-6">
                        <label className="form-label">Warehouse <span className="text-danger">*</span></label>
                        <select className="form-select bg-light" name="warehouse_id" value={form.warehouse_id} onChange={handleChange} required>
                            <option value="">-- Select --</option>
                            {warehouses.map(w => (
                                <option key={w._id} value={w._id}>{w.store_name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Reason <span className="text-danger">*</span></label>
                        <select className="form-select bg-light" name="reason" value={form.reason} onChange={handleChange} required>
                            <option value="">-- Select --</option>
                            <option value="Damage">Damage</option>
                            <option value="Count Diff">Count Diff</option>
                            <option value="Write-off">Write-off</option>
                        </select>
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Date <span className="text-danger">*</span></label>
                        <input type="datetime-local" className="form-control bg-light" name="date" value={form.date} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Notes</label>
                        <input type="text" className="form-control bg-light" name="notes" value={form.notes} onChange={handleChange} />
                    </div>
                </div>

                <table className="table table-bordered align-middle">
                    <thead className="table-dark">
                        <tr>
                            <th style={{ width: "25%" }}>Product *</th>
                            <th style={{ width: "15%" }}>Batch No</th>
                            <th style={{ width: "15%" }}>Qty Change *</th>
                            <th style={{ width: "25%" }}>Remarks</th>
                            <th style={{ width: "10%" }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {form.items.map((item, index) => (
                            <tr key={index}>
                                <td>
                                    <select name="product_id" value={item.product_id} className="form-select" onChange={(e) => handleItemChange(index, e)} required>
                                        <option value="">Select Product</option>
                                        {products.map(p => (
                                            <option key={p._id} value={p._id}>{p.name}</option>
                                        ))}
                                    </select>
                                </td>
                                <td>
                                    <input type="number" name="batch" value={item.batch} className="form-control" placeholder="Batch No" onChange={(e) => handleItemChange(index, e)} />
                                </td>
                                <td>
                                    <input type="number" name="qty" value={item.qty} className="form-control" placeholder="± Qty" onChange={(e) => handleItemChange(index, e)} required />
                                </td>
                                <td>
                                    <input type="text" name="remarks" value={item.remarks} className="form-control" placeholder="Remarks" onChange={(e) => handleItemChange(index, e)} />
                                </td>
                                <td>
                                    <button type="button" className="btn btn-danger btn-sm" onClick={() => removeItem(index)}>
                                        <MdDelete />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button type="button" className="btn btn-secondary mb-3" onClick={addItem}>+ Add Row</button>
                <br />
                <button type="submit" className="btn btn-primary">
                    <FaSave /> Save Adjustment
                </button>
            </form><br />

            <div className=" card shadow-sm">
                <div className="card-body">
                    <h5 className="mb-3">Adjustment Tree</h5>
                    <div className="mt-4 mb-2 input-group">
                        <input type="text" className="form-control" placeholder="Search warehouse name" value={search} onChange={(e) => setSearch(e.target.value)} />
                        <span className="input-group-text"><FaSearch /></span>
                    </div>
                    <table className="table table-bordered table-striped">
                        <thead className="table-dark">
                            <tr>
                                <th className="fw-bold">Warehouse</th>
                                <th className="fw-bold">Reason</th>
                                <th className="fw-bold">Date</th>
                                <th className="fw-bold">Notes</th>
                                <th className="fw-bold">Items</th>
                                <th className="fw-bold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredstocks.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center">
                                        No stocks found.
                                    </td>
                                </tr>
                            ) : (
                                filteredstocks.map((s, index) => (
                                    <tr key={index}>
                                        <td>
                                            {s.warehouse_id?.store_name || warehouses.find((w) => w._id === s.warehouse_id)?.store_name || "Unknown"}
                                        </td>
                                        <td>{s.reason}</td>
                                        <td>{new Date(s.date).toLocaleString()}</td>
                                        <td>{s.notes}</td>
                                        <td>
                                            {s.items.map((item, idx) => (
                                                <div key={idx}>
                                                    {products.find((p) => p._id === item.product_id)?.name ||
                                                        "Unknown"}{" "}
                                                    — Qty: {item.qty}
                                                </div>

                                            ))}
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleDelete(s._id)}
                                            >
                                                <span className="text-warning">
                                                    <MdDeleteForever />
                                                </span>
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>

                    </table></div></div>
        </div>
    );
};

export default StockAdjustment;
