import React, { useState, useEffect } from 'react';
import { TbFileInvoice } from "react-icons/tb";
import { FaRegSave, FaWhatsapp } from "react-icons/fa";
import { TfiHandStop } from "react-icons/tfi";
import { MdDeleteForever } from "react-icons/md";
import { FaSearch } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import { addSale, deleteSale, fetchsales, updateSale } from '../redux/saleSlice';
import { fetchtaxes } from '../redux/taxSlice';
import { fetchProducts } from '../redux/productSlice';
import { fetchcustomers } from '../redux/customerSlice';
import { MdEdit } from "react-icons/md";

const SalePOS = () => {
  const dispatch = useDispatch();
  const { items: sales } = useSelector((state) => state.sales);
  const { items: customers } = useSelector((state) => state.customers);
  const { items: products } = useSelector((state) => state.products);
  const { items: taxes } = useSelector((state) => state.taxes);

  const [form, setForm] = useState({
    invoice_no: "",
    invoice_date_time: new Date().toISOString().slice(0, 10),
    customer_id: "",
    counter_id: "",
    payment_mode: "Cash",
    subtotal: 0,
    discount_amount: 0,
    tax_amount: 0,
    grand_total: 0,
    paid_amount: 0,
    due_amount: 0,
    notes: "",
    items: []
  });

  useEffect(() => {
    dispatch(fetchcustomers());
    dispatch(fetchProducts());
    dispatch(fetchtaxes());
    dispatch(fetchsales());

    setForm((prev) => ({
      ...prev,
      invoice_no: "INV" + Math.floor(1000 + Math.random() * 9000),
    }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, e) => {
  const { name, value } = e.target;
  const items = form.items.map((item, i) =>
    i === index ? { ...item, [name]: value } : { ...item }
  );
  if (name === "product_id") {
    const product = products.find((p) => p._id === value);
    if (product) {
      items[index].unit_price = product.sale_price || 0;
    }
  }

  const updatedItem = { ...items[index] };
  calculateLineTotal(updatedItem);
  items[index] = updatedItem;

  setForm((prev) => ({ ...prev, items }));
};

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          product_id: "",
          qty: 1,
          unit_price: 0,
          discount_percent: 0,
          tax_rate_id: "",
          cgst_amount: 0,
          sgst_amount: 0,
          igst_amount: 0,
          line_total: 0,
        },
      ],
    }));
  };

  const calculateLineTotal = (item) => {
    const price = parseFloat(item.unit_price) || 0;
    const qty = parseFloat(item.qty) || 0;
    const discount = parseFloat(item.discount_percent) || 0;

    const subtotal = price * qty;
    const discountAmount = subtotal * (discount / 100);
    const taxableAmount = subtotal - discountAmount;

    let cgst = 0,
      sgst = 0,
      igst = 0;
    if (item.tax_rate_id) {
      const tax = taxes.find((t) => t._id === item.tax_rate_id);
      if (tax) {
        cgst = taxableAmount * (tax.cgst_percent / 100);
        sgst = taxableAmount * (tax.sgst_percent / 100);
        igst = taxableAmount * (tax.igst_percent / 100);
      }
    }

    item.cgst_amount = cgst;
    item.sgst_amount = sgst;
    item.igst_amount = igst;
    item.line_total = taxableAmount + cgst + sgst + igst;
  };

  const calculateTotals = () => {
    const subtotal = form.items.reduce(
      (sum, item) => sum + item.qty * item.unit_price,
      0
    );
    const discount_amount = form.items.reduce((sum, item) => {
      const subtotal = item.qty * item.unit_price;
      return sum + subtotal * (item.discount_percent / 100);
    }, 0);
    const tax_amount = form.items.reduce(
      (sum, item) => sum + item.cgst_amount + item.sgst_amount + item.igst_amount,
      0
    );
    const grand_total = subtotal - discount_amount + tax_amount;
    const due_amount = grand_total - parseFloat(form.paid_amount || 0);

    setForm((prev) => ({
      ...prev,
      subtotal,
      discount_amount,
      tax_amount,
      grand_total,
      due_amount,
    }));
  };

  useEffect(() => {
    calculateTotals();
  }, [form.items, form.paid_amount]);

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    if(editingSale){
      await dispatch(updateSale({id:editingSale,updatedData:form})).unwrap()
      setEditingSale(null)
      console.log("Sale Updated Successfully")
    }else{
      await dispatch(addSale(form)).unwrap()
      console.log("Sale Added Successfully")
    }
    
    await dispatch(fetchsales()); 
    setForm({
      invoice_no: "INV" + Math.floor(1000 + Math.random() * 9000),
      invoice_date_time: new Date().toISOString().slice(0, 10),
      customer_id: "",
      counter_id: "",
      payment_mode: "Cash",
      subtotal: 0,
      discount_amount: 0,
      tax_amount: 0,
      grand_total: 0,
      paid_amount: 0,
      due_amount: 0,
      notes: "",
      items: [],
    });
  } catch (err) {
    console.error(err);
    alert("Error saving sale.");
  }
};

  const [search, setSearch] = useState("");
  const filteredsales = sales.filter((s) => {
    const customerName = s.customer_id?.name || s.customer_id || "";
    const counter = s.counter_id || "";
    return (
      customerName.toString().toLowerCase().includes(search.toLowerCase()) ||
      counter.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleDelete = async (id) => {
    dispatch(deleteSale(id));
  };


  const [editingSale,setEditingSale]=useState(null)

  const handleEdit=(sale)=>{
    setEditingSale(sale._id)
    setForm({
       invoice_no: sale.invoice_no || "INV" + Math.floor(1000 + Math.random() * 9000),
      invoice_date_time: sale.invoice_date_time || new Date().toISOString().slice(0, 10),
      customer_id:sale.customer_id || "",
      counter_id: sale.counter_id || "",
      payment_mode:sale.payment_mode || "Cash",
      subtotal:sale.subtotal || 0,
      discount_amount:sale.discount_amount || 0,
      tax_amount:sale.tax_amount  || 0,
      grand_total:sale.grand_total || 0,
      paid_amount: sale.paid_amount || 0,
      due_amount: sale.due_amount || 0,
      notes:sale.notes || "",
      items: sale.items || [],
    })
  }
  return (
    <div className="container mt-4 bg-gradient-warning">
      <h2 className="mb-4 d-flex align-items-center fs-5">
        <span className="me-2 d-flex align-items-center" style={{ color: "#4d6f99ff" }}><TbFileInvoice size={24} /></span><b>SALES/INVOICE MASTER</b>
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-md-6">
            <label>Customer <span className="text-danger">*</span></label>
            <select name="customer_id" value={form.customer_id} onChange={handleChange} className="form-select bg-light" required>
              <option value="">Select Customer</option>
              {customers.map((c) => (<option key={c._id} value={c._id}>{c.name}</option>))}
            </select>
          </div>
          <div className="col-md-3">
            <label>Invoice Date</label>
            <input type="date" name="invoice_date_time" value={form.invoice_date_time} onChange={handleChange} className="form-control bg-light"  required/>
          </div>
          <div className="col-md-3">
            <label>Counter</label>
            <select name="counter_id" value={form.counter_id} onChange={handleChange} className="form-select bg-light" required >
              <option value="">Select Counter</option>
              <option value="POS-1">POS-1</option>
              <option value="POS-2">POS-2</option>
              <option value="POS-3">POS-3</option>
            </select>
          </div>
          <div className="col-md-6">
            <label>Payment Mode</label>
            <select name="payment_mode" value={form.payment_mode} onChange={handleChange} className="form-select bg-light" required>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="UPI">UPI</option>
              <option value="Credit">Credit</option>
              <option value="Mixed">Mixed</option>
            </select>
          </div>
        </div>

        <h5 className="mt-4">Sale Items</h5>
        <table className="table table-bordered table-striped">
          <thead className="table-dark">
            <tr>
              <th>Product</th>
              <th style={{ width: "80px" }}>Qty</th>
              <th style={{ width: "120px" }}>Unit Price</th>
              <th style={{ width: "120px" }}>Discount %</th>
              <th style={{ width: "150px" }}>Tax</th>
              <th style={{ width: "120px" }}>Line Total</th>
            </tr>
          </thead>
          <tbody>
            {form.items.map((item, index) => (
              <tr key={index}>
                <td>
                  <select name="product_id" value={item.product_id} onChange={(e) => handleItemChange(index, e)} className="form-select bg-light" >
                    <option value="">Select Product</option>
                    {products.map((p) => ( <option key={p._id} value={p._id}>{p.name}</option> ))}
                  </select>
                </td>
                <td>
                  <input type="number"  name="qty" value={item.qty} onChange={(e) => handleItemChange(index, e)} className="form-control bg-light" />
                </td>
                <td>
                  <input type="number" name="unit_price" value={item.unit_price} onChange={(e) => handleItemChange(index, e)}  className="form-control bg-light"/>
                </td>
                <td>
                  <input type="number" name="discount_percent" value={item.discount_percent} onChange={(e) => handleItemChange(index, e)} className="form-control bg-light"/>
                </td>
                <td>
                  <select name="tax_rate_id" value={item.tax_rate_id} onChange={(e) => handleItemChange(index, e)} className="form-select bg-light" >
                    <option value="">Select Tax</option>
                    {taxes.map((t) => ( <option key={t._id} value={t._id}>{t.name}</option> ))}
                  </select>
                </td>
                <td>
                  <input type="text" value={item.line_total.toFixed(2)} readOnly className="form-control bg-light"/>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" onClick={addItem} className="btn btn-outline-primary mt-2">+ Add Item </button>
        <div className="mt-4">
          <p><strong>Subtotal:</strong> {form.subtotal.toFixed(2)}</p>
          <p><strong>Discount:</strong> {form.discount_amount.toFixed(2)}</p>
          <p><strong>Tax:</strong> {form.tax_amount.toFixed(2)}</p>
          <p><strong>Grand Total:</strong> {form.grand_total.toFixed(2)}</p>
          <p><strong>Due Amount:</strong> {form.due_amount.toFixed(2)}</p>
        </div>

        <div className="d-flex flex-wrap gap-2 mt-4">
          <button type="submit" className="btn btn-primary px-4 d-flex align-items-center justify-content-center "><span className='me-2 d-flex align-items-center' ><FaRegSave /></span> {editingSale ? "Update Sale" : "Save & Print"}</button>
          <button type="button" className="btn btn-success px-4 d-flex align-items-center justify-content-center"><span className='me-2 d-flex align-items-center'><FaWhatsapp /></span> Save & WhatsApp</button>
          <button type="button" className="btn btn-warning px-4 d-flex align-items-center justify-content-center text-white"><span className='me-2 d-flex align-items-center'><TfiHandStop /></span> Hold Bill</button>
        </div>
      </form>
      <br />


      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="mb-3">Sales Records</h5>
          <div className="mt-4 mb-2 input-group">
            <input type="text" className="form-control" placeholder="Search Customer name, Counter" value={search} onChange={(e) => setSearch(e.target.value)}/>
            <span className="input-group-text"><FaSearch /></span>
          </div>

          <table className="table table-bordered table-striped mt-4">
            <thead className="table-dark">
              <tr>
                <th>Customer</th>
                <th>Invoice No</th>
                <th>Date</th>
                <th>Counter</th>
                <th>Mode</th>
                <th>Products</th>
                <th>Subtotal</th>
                <th>Discount</th>
                <th>Tax</th>
                <th>Grand Total</th>
                <th>Due Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredsales.map((s) => (
                <tr key={s._id}>
                  <td>{s.customer_id?.name || "Unknown Customer"}</td>
                  <td>{s.invoice_no || "N/A"}</td>
                  <td>
                    {s.invoice_date_time
                      ? new Date(s.invoice_date_time).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td>{s.counter_id || "N/A"}</td>
                  <td>{s.payment_mode || "N/A"}</td>
                  <td>
                    {(s.items || []).map((item, idx) => (
                      <div key={idx}>
                        {item.product_id?.name || "Unknown Product"} ({item.qty || 0})
                      </div>
                    ))}
                  </td>
                  <td>{s.subtotal?.toFixed(2) || "0.00"}</td>
                  <td>{s.discount_amount?.toFixed(2) || "0.00"}</td>
                  <td>{s.tax_amount?.toFixed(2) || "0.00"}</td>
                  <td>{s.grand_total?.toFixed(2) || "0.00"}</td>
                  <td>{s.due_amount?.toFixed(2) || "0.00"}</td>
                  <td>
                    <>
                    <button className='btn btn-sm btn-warning' onClick={()=>handleEdit(s)}><MdEdit/>Edit</button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(s._id)}
                    >
                      <MdDeleteForever /> Delete
                    </button>
                    </>
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

export default SalePOS;
