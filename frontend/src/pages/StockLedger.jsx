import 'bootstrap/dist/css/bootstrap.min.css';
import { MdAttachMoney } from "react-icons/md";
import { PiShippingContainer } from 'react-icons/pi';
import { MdOutlineInventory2 } from "react-icons/md";
import { FaSearch } from 'react-icons/fa';
import { FaRegSave } from "react-icons/fa";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from '../redux/productSlice';
import { fetchwarehouses } from '../redux/warehouseSlice';
import { addstock, deletestock, fetchstocks } from '../redux/stockledgerSlice';
const StockLedger = () => {
    const dispatch = useDispatch()
    const { items: stocks, status } = useSelector((state) => state.stockss)
    const { items: products } = useSelector((state) => state.products)
    const { items: warehouses } = useSelector((state) => state.warehouses)
    const [form, setForm] = useState({
        productId: "",
        warehouseId: "",
        txnType: "SALE" | "PURCHASE" | "ADJUSTMENT",
        txnId: "",
        txnDate: "",
        inQty: "",
        outQty: "",
        rate: "",
        balanceQty: "",
    })
    useEffect(() => {
        dispatch(fetchProducts())
        dispatch(fetchwarehouses())
        dispatch(fetchstocks())
    }, [])
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === "checkbox" ? checked : value });

    };
    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            dispatch(addstock(form))
            setForm({
                productId: "",
                warehouseId: "",
                txnType: "SALE" | "PURCHASE" | "ADJUSTMENT",
                txnId: "",
                txnDate: "",
                inQty: "",
                outQty: "",
                rate: "",
                balanceQty: "",
            })
        }
        catch (err) {
            console.error(err.response?.data || err.message);
        }

    }
    const [search, setSearch] = useState("")

    const filteredstockss = (stocks || []).filter((s) => {
        const warehousename =
            s.warehouseId?.store_name ||
            warehouses.find((w) => w._id === s.warehouseId)?.store_name ||
            "";

        const productName =
            s.productId?.name ||
            products.find((p) => p._id === s.productId)?.name ||
            "Unknown";

        return (
            warehousename.toLowerCase().includes(search.trim().toLowerCase()) ||
            productName.toLowerCase().includes(search.trim().toLowerCase()) ||
            s.txnId?.toLowerCase().includes(search.trim().toLowerCase()) ||
            s.txnDate?.toString().toLowerCase().includes(search.trim().toLowerCase())
        );
    });



    const handleDelete = async (id) => {
        dispatch(deletestock(id))
    };

    return (
        <div className="container mt-4">
            <h2 className="mb-4 d-flex align-items-center fs-5"><span className="  me-2 d-flex align-items-center" style={{ color: "#4d6f99ff" }}><MdOutlineInventory2 size={24} /></span>{" "}<b >STOCK LEDGER</b></h2>
            <form className="row g-3" onSubmit={handleSubmit}>

                <div className="col-md-6">
                    <label className="form-label">Product <span className="text-danger">*</span></label>
                    <select className="form-select bg-light" name="productId" value={form.productId} onChange={handleChange} required>
                        <option>-- Select Product --</option>
                        {products.map(p => (<option key={p._id} value={p._id}>{p.name}</option>))}


                    </select>
                </div>

                <div className="col-md-6">
                    <label className="form-label">Warehouse <span className="text-danger">*</span></label>
                    <select className="form-select bg-light" name="warehouseId" value={form.warehouseId} onChange={handleChange} required>
                        <option>-- Select Warehouse --</option>
                        {warehouses.map(w => (<option key={w._id} value={w._id}>{w.store_name}</option>))}

                    </select>
                </div>

                <div className="col-md-6">
                    <label className="form-label">Type <span className="text-danger">*</span></label>
                    <select className="form-select bg-light" name="txnType" value={form.txnType} onChange={handleChange} required>
                        <option>-- Select Type--</option>
                        <option value="SALE">SALE</option>
                        <option value="PURCHASE">PURCHASE</option>
                        <option value="ADJUSTMENT">ADJUSTMENT</option>
                    </select>
                </div>

                <div className="col-md-6">
                    <label className="form-label">Transaction Id <span className="text-danger">*</span></label>
                    <input type="text" className="form-control bg-light" name='txnId' onChange={handleChange} value={form.txnId} required />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Date <span className="text-danger">*</span></label>
                    <input type="Date" className="form-control bg-light" name='txnDate' value={form.txnDate} onChange={handleChange} required />
                </div>

                <div className="col-md-6">
                    <label className="form-label bg-light">inQty <span className="text-danger">*</span></label>
                    <input type="text" className="form-control bg-light" name='inQty' value={form.inQty} onChange={handleChange} required />
                </div>

                <div className="col-md-6">
                    <label className="form-label">outQty <span className="text-danger">*</span></label>
                    <input type="text" className="form-control bg-light" name='outQty' value={form.outQty} onChange={handleChange} required />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Rate <span className="text-danger">*</span></label>
                    <input type="text" className="form-control bg-light" name='rate' value={form.rate} onChange={handleChange} required />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Balance Qty <span className="text-danger">*</span></label>
                    <input type="text" className="form-control bg-light" name='balanceQty' value={form.balanceQty} onChange={handleChange} required />
                </div>

                <div className="col-12">
                    <button type="submit" className="btn btn-primary px-4 d-flex align-center justify-center">
                        <span className="text-warning me-2 d-flex align-items-center"><FaRegSave />
                        </span>Save</button>
                </div>
            </form><br />

            <div className=" card shadow-sm">
                <div className="card-body">
                    <h5 className="mb-3">StockLedger Tree</h5>
                    <div className="mt-4 mb-2 input-group">
                        <input type="text" className="form-control" placeholder="Search warehouse name" value={search} onChange={(e) => setSearch(e.target.value)} />
                        <span className="input-group-text"><FaSearch /></span>
                    </div>
                    <table className="table table-bordered table-striped">
                        <thead className="table-dark">
                            <tr>
                                <th className="fw-bold">Product</th>
                                <th className="fw-bold">Warehouse</th>
                                <th className="fw-bold">Type</th>
                                <th className="fw-bold">Transaction id</th>
                                <th className="fw-bold">Date</th>
                                <th className="fw-bold">inQty</th>
                                <th className="fw-bold">outQty</th>
                                <th className="fw-bold">Rate</th>
                                <th className="fw-bold">BalanceQty</th>
                                <th className="fw-bold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredstockss.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="text-center">No stocks found.</td>
                                </tr>
                            ) : (
                                filteredstockss.map((s, index) => (
                                    <tr key={index}>
                                        <td>{s.productId?.name || "Unknown"}</td>
                                        <td>{s.warehouseId?.store_name || "Unknown"}</td>
                                        <td>{s.txnType}</td>
                                        <td>{s.txnId}</td>
                                        <td>{new Date(s.txnDate).toLocaleDateString()}</td>
                                        <td>{s.inQty}</td>
                                        <td>{s.outQty}</td>
                                        <td>{s.rate}</td>
                                        <td>{s.balanceQty}</td>
                                        <td>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleDelete(s._id)}
                                            >
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
}

export default StockLedger;