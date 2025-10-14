import React, { useState, useEffect } from "react";
import axios from "axios";
import { BiPurchaseTag } from "react-icons/bi";
import { MdDeleteForever } from "react-icons/md";
import { FaRegSave } from "react-icons/fa";
import { FaSearch } from "react-icons/fa";
import { useDispatch,useSelector } from "react-redux";
import { addpurchase, deletepurchase, fetchpurchases } from "../redux/purchaseSlice";
import { fetchProducts } from "../redux/productSlice";
import { fetchwarehouses } from "../redux/warehouseSlice";
import { fetchsuppliers } from "../redux/supplierSlice";
import { setAuthToken } from "../services/userService";


const Purchase = () => {
 
    const dispatch= useDispatch()
    const {items:purchases,status}=useSelector((state)=>state.purchases)
    const { items: suppliers } = useSelector((state) => state.suppliers)
    const {items:warehouses}=useSelector((state)=>state.warehouses)
    const {items:products}=useSelector((state)=>state.products)

    const user=JSON.parse(localStorage.getItem("user"))
    const role=user?.role || "user"
    const token=user?.token
    const [purchase, setPurchase] = useState({
        supplier_id: "",
        invoice_no: "",
        invoice_date: "",
        warehouse_id: "",
        items: [{ product_id: "", batch_no: "", mfg_date: "", exp_date: "", qty: 0, unit_price: 0, discount: 0, tax: 0, line_total: 0 }],
        subtotal: 0,
        discount_amount: 0,
        other_charges: 0,
        round_off: 0,
        grand_total: 0,
        paid_amount: 0,
        due_amount: 0,
        payment_mode: "",
        notes: ""
    });
  

    useEffect(() => {
      const user=JSON.parse(localStorage.getItem("user"))
      if(!user || !user.token)
        console.error("No user found Please Login")
      const token=user?.token
      setAuthToken(token)

       dispatch(fetchsuppliers())
       dispatch(fetchwarehouses())
       dispatch(fetchProducts())
        dispatch(fetchpurchases())
    }, [dispatch]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPurchase({ ...purchase, [name]: value });
    };

    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        const items = [...purchase.items];
        items[index][name] = value;
        setPurchase({ ...purchase, items });
    };

    const addItem = () => {
        setPurchase({
            ...purchase,
            items: [...purchase.items, { product_id: "", batch_no: "", mfg_date: "", exp_date: "", qty: 0, unit_price: 0, discount: 0, tax: 0, line_total: 0 }]
        });
    };

    const removeItem = (index) => {
        if (purchase.items.length === 1) {
            alert("At least one item is required.");
            return;
        }
        const items = [...purchase.items];
        items.splice(index, 1);
        setPurchase({ ...purchase, items });
    };

    const calculateTotals = () => {
        let subtotal = 0;
        purchase.items.forEach(item => {
            const lineTotal =
                (Number(item.qty) || 0) * (Number(item.unit_price) || 0) -
                (Number(item.discount) || 0) +
                (Number(item.tax) || 0);
            subtotal += lineTotal;
        });

        const discount_amount = Number(purchase.discount_amount || 0);
        const other_charges = Number(purchase.other_charges || 0);
        const round_off = Number(purchase.round_off || 0);
        const grand_total = subtotal - discount_amount + other_charges + round_off;

        const paid_amount = Number(purchase.paid_amount || 0);
        const due_amount = grand_total - paid_amount;

        setPurchase({
            ...purchase,
            subtotal,
            grand_total,
            due_amount
        });
    };

 const handleSubmit = async (e) => {
  e.preventDefault();

 
  let subtotal = 0;
  purchase.items.forEach(item => {
    const lineTotal =
      (Number(item.qty) || 0) * (Number(item.unit_price) || 0) -
      (Number(item.discount) || 0) +
      (Number(item.tax) || 0);
    subtotal += lineTotal;
  });

  const discount_amount = Number(purchase.discount_amount || 0);
  const other_charges = Number(purchase.other_charges || 0);
  const round_off = Number(purchase.round_off || 0);
  const grand_total = subtotal - discount_amount + other_charges + round_off;

  const paid_amount = Number(purchase.paid_amount || 0);
  const due_amount = grand_total - paid_amount;

  const purchaseData = {
    ...purchase,
    subtotal,
    grand_total,
    due_amount,
  };

  try {
    const res = await dispatch(addpurchase(purchaseData)).unwrap();
    
    setPurchase({
      supplier_id: "",
      invoice_no: "",
      invoice_date: "",
      warehouse_id: "",
      items: [{ product_id: "", batch_no: "", mfg_date: "", exp_date: "", qty: 0, unit_price: 0, discount: 0, tax: 0, line_total: 0 }],
      subtotal: 0,
      discount_amount: 0,
      other_charges: 0,
      round_off: 0,
      grand_total: 0,
      paid_amount: 0,
      due_amount: 0,
      payment_mode: "",
      notes: ""
    });
    dispatch(fetchpurchases())
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
};



    const [search, setSearch] = useState("");
    const filteredpurchase = purchases.filter((p) =>
        (p.supplier_id?.name || p.supplier_id || "").toString().toLowerCase().includes(search.toLowerCase()) ||
        (p.invoice_no || "").toString().toLowerCase().includes(search.toLowerCase()) ||
        (p.items?.some(item => products.find(prod => prod._id === item.product_id)?.name?.toLowerCase().includes(search.toLowerCase())))
    );
    const handleDelete = async (id) => {
  if (!id) return console.error("Purchase ID is undefined");
  try {
    await dispatch(deletepurchase(id)).unwrap();
    
  } catch (err) {
    console.error(err);
  }
};

    return (
        <div className="container mt-4 bg-gradient-warning">
            <h2 className="mb-4 d-flex align-items-center fs-5"><span className="  me-2 d-flex align-items-center" style={{color:"#4d6f99ff"}}><BiPurchaseTag size={24} /></span>{" "}<b >PURCHASE MASTER</b></h2>
            
            {["super_admin","admin"].includes(role) && (
            <form className="row g-3" onSubmit={handleSubmit}>
             <div className="col-md-6">
  <label className="form-label">Supplier<span className="text-danger">*</span></label>
  <select name="supplier_id" className="form-select bg-light" value={purchase.supplier_id} onChange={handleChange} required>
    <option value="">Select Supplier</option>
    {suppliers.map((s) => (<option key={s._id} value={s._id}>{s.name}</option>))}
  </select>
</div>

                <div className="col-md-6">
                    <label className="form-label">Invoice No<span className="text-danger">*</span></label>
                    <input type="text" name="invoice_no" className="form-control bg-light" value={purchase.invoice_no} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                    <label className="form-label">Invoice Date<span className="text-danger">*</span></label>
                    <input type="date" name="invoice_date" className="form-control bg-light" value={purchase.invoice_date} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                    <label className="form-label">Warehouse<span className="text-danger">*</span></label>
                    <select name="warehouse_id" className="form-select bg-light" value={purchase.warehouse_id} onChange={handleChange} required>
                        <option value="">Select Warehouse</option>
                        {warehouses.map(w => <option key={w._id} value={w._id}>{w.store_name}</option>)}
                    </select>
                </div>

                <div className="col-12">
                    <h5>Purchase Items</h5>
                    <table className="table table-bordered">
                        <thead className="table-dark">
                            <tr>
                                <th>Product</th>
                                <th>Batch No</th>
                                <th>MFG Date</th>
                                <th>EXP Date</th>
                                <th>Qty</th>
                                <th>Unit Price</th>
                                <th>Discount</th>
                                <th>Tax</th>
                                <th>Line Total</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
  {purchase.items.map((item, index) => (
    <tr key={index}>
      <td>
        <select name="product_id" value={item.product_id} className="form-select" onChange={(e) => handleItemChange(index, e)} required>
          <option value="">Select Product</option>
          {products.map((p) => (<option key={p._id} value={p._id}>{p.name}</option>))}
        </select>
      </td>
      <td><input name="batch_no" value={item.batch_no} onChange={(e) => handleItemChange(index, e)} className="form-control" /></td>
      <td><input type="date" name="mfg_date" value={item.mfg_date} onChange={(e) => handleItemChange(index, e)} className="form-control" /></td>
      <td><input type="date" name="exp_date" value={item.exp_date} onChange={(e) => handleItemChange(index, e)} className="form-control" /></td>
      <td><input type="number" name="qty" value={item.qty} onChange={(e) => handleItemChange(index, e)} className="form-control" /></td>
      <td><input type="number" name="unit_price" value={item.unit_price} onChange={(e) => handleItemChange(index, e)} className="form-control" /></td>
      <td><input type="number" name="discount" value={item.discount} onChange={(e) => handleItemChange(index, e)} className="form-control" /></td>
      <td><input type="number" name="tax" value={item.tax} onChange={(e) => handleItemChange(index, e)} className="form-control" /></td>
      <td>
        <input type="number" name="line_total" value={((Number(item.qty) || 0) * (Number(item.unit_price) || 0) -(Number(item.discount) || 0) +(Number(item.tax) || 0)  ).toFixed(2)} className="form-control" disabled />
      </td>
      <td>
        <button type="button" className="btn btn-danger btn-sm" onClick={() => removeItem(index)}>
          <span className="text-warning"><MdDeleteForever /></span>Delete
        </button>
      </td>
    </tr>
  ))}
</tbody>

                    </table>
                    <button type="button" className="btn btn-primary btn-sm" onClick={addItem}>+ Add Item</button>
                </div>

                <div className="col-md-6">
                    <label className="form-label">Subtotal</label>
                    <input type="number" className="form-control" value={purchase.subtotal} disabled />
                </div>
                <div className="col-md-6">
                    <label className="form-label">Discount Amount</label>
                    <input type="number" name="discount_amount" className="form-control bg-light" value={purchase.discount_amount} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                    <label className="form-label">Other Charges</label>
                    <input type="number" name="other_charges" className="form-control bg-light" value={purchase.other_charges} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                    <label className="form-label">Round Off</label>
                    <input type="number" name="round_off" className="form-control bg-light" value={purchase.round_off} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                    <label className="form-label">Grand Total</label>
                    <input type="number" className="form-control" value={purchase.grand_total} disabled />
                </div>
                <div className="col-md-6">
                    <label className="form-label">Paid Amount</label>
                    <input type="number" name="paid_amount" className="form-control bg-light" value={purchase.paid_amount} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                    <label className="form-label">Due Amount</label>
                    <input type="number" className="form-control" value={purchase.due_amount} disabled />
                </div>
                <div className="col-md-6">
                    <label className="form-label">Payment Mode</label>
                    <select name="payment_mode" className="form-select bg-light" value={purchase.payment_mode} onChange={handleChange}>
                        <option value="">Select Mode</option>
                        <option value="Cash">Cash</option>
                        <option value="UPI">UPI</option>
                        <option value="Card">Card</option>
                        <option value="Credit">Credit</option>
                    </select>
                </div>
                <div className="col-12">
                    <label className="form-label">Notes</label>
                    <textarea name="notes" className="form-control bg-light" rows="2" value={purchase.notes} onChange={handleChange}></textarea>
                </div>
                <div className="col-12 ">
                    <button type="submit" className="btn btn-primary px-4 d-flex align-items-center justify-content-center">
                        <span className="text-warning me-2 d-flex align-items-center"><FaRegSave /></span> Save Purchase
                    </button>
                </div>
            </form>)}<br />

            <div className=" card shadow-sm">
                <div className="card-body">
                    <h5 className="mb-3">Purchase Tree</h5>
                    <div className="mt-4 mb-2 input-group">
                        <input type="text" className="form-control" placeholder="Search Customer, name, email" value={search} onChange={(e) => setSearch(e.target.value)} />
                        <span className="input-group-text"><FaSearch /></span>
                    </div>
                    <table className="table table-bordered table-striped">
                        <thead className="table-dark">
                            <tr>
                                <th className="fw-bold">Supplier</th>
                                <th className="fw-bold">Invoice No</th>
                                <th className="fw-bold">Invoice Date</th>
                                <th className="fw-bold">Store Name</th>
                                <th className="fw-bold">Products</th>
                                <th className="fw-bold">Subtotal</th>
                                <th className="fw-bold">Other Charges</th>
                                <th className="fw-bold">Grand Total</th>
                                <th className="fw-bold">Paid</th>
                                <th className="fw-bold">Due</th>
                                <th className="fw-bold">Payment Mode</th>
                                <th className="fw-bold">Actions</th>
                            </tr>
                        </thead>
      <tbody>
  {filteredpurchase.map((p, index) => (
    <tr key={index}>
      <td>
        {typeof p.supplier_id === "object"
          ? p.supplier_id.name
          : suppliers.find(s => s._id === p.supplier_id)?.name || "Unknown Supplier"}
      </td>
      <td>{p.invoice_no}</td>
      <td>{p.invoice_date}</td>
      <td>
        {typeof p.warehouse_id === "object"
          ? p.warehouse_id.store_name
          : warehouses.find(w => w._id === p.warehouse_id)?.store_name || "Unknown Warehouse"}
      </td>
     <td>
  {p.items.map((item, idx) => {
   
    const productName =
      item.product_id && typeof item.product_id === 'object'
        ? item.product_id.name
        : products.find(prod => prod._id === item.product_id)?.name || 'Unknown Product';

    return (
      <div key={idx}>
        {productName} ({item.qty})
      </div>
    );
  })}
</td>


      <td>{p.subtotal ?? 0}</td>
      <td>{p.other_charges ?? 0}</td>
      <td>{p.grand_total ?? 0}</td>
      <td>{p.paid_amount}</td>
      <td>{p.due_amount ?? 0}</td>
      <td>{p.payment_mode}</td>
      <td>
        {["super_admin","admin"].includes(role) ? (
        <button
          className="btn btn-danger btn-sm"
          onClick={() => handleDelete(p._id)}
        >
          <span className="text-warning"><MdDeleteForever /></span> Delete
        </button>) :(
          <button className="btn btn-secondary btn-sm" disabled>
                                                        View Only
                                                    </button>
        )}
      </td>
    </tr>
  ))}
</tbody>



                    </table>
                </div>
            </div>
        </div>
    );
};

export default Purchase;
