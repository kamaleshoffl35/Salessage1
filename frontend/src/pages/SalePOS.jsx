

import React, { useState, useEffect } from 'react';
import {  MdAdd, MdClose, MdEdit, MdDeleteForever } from "react-icons/md";
import { TbFileInvoice } from "react-icons/tb";
import { FaRegSave, FaWhatsapp, FaSearch } from "react-icons/fa";
import { TfiHandStop } from "react-icons/tfi";
import { useDispatch, useSelector } from 'react-redux';
import { addSale, deleteSale, fetchsales, updateSale } from '../redux/saleSlice';
import { fetchtaxes } from '../redux/taxSlice';
import { fetchProducts } from '../redux/productSlice';
import { fetchcustomers } from '../redux/customerSlice';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../assets/img/image_360.png";
import ReusableTable, {createRoleBasedActions} from '../components/ReusableTable'; // Import the reusable table

const SalePOS = () => {
  const dispatch = useDispatch();
  const { items: sales, status } = useSelector((state) => state.sales);
  const { items: customers } = useSelector((state) => state.customers);
  const { items: products } = useSelector((state) => state.products);
  const { items: taxes } = useSelector((state) => state.taxes);

  const user = JSON.parse(localStorage.getItem("user"))
  const role = user?.role
  const token=user?.token

  const [form, setForm] = useState({
    invoice_no: "",
    invoice_date_time: new Date().toISOString().slice(0, 10),
    customer_id: "",
    customer_phone: "",
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

  const [search, setSearch] = useState("");
  const [editingSale, setEditingSale] = useState(null);
  const [showSaleForm, setShowSaleForm] = useState(false);

  useEffect(() => {
    dispatch(fetchcustomers());
    dispatch(fetchProducts());
    dispatch(fetchtaxes());
    dispatch(fetchsales());

    setForm((prev) => ({
      ...prev,
      invoice_no: "INV" + Math.floor(1000 + Math.random() * 9000),
    }));
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // When customer is selected, automatically populate the phone number
    if (name === "customer_id") {
      const selectedCustomer = customers.find(c => c._id === value);
      setForm((prev) => ({ 
        ...prev, 
        customer_id: value,
        customer_phone: selectedCustomer ? selectedCustomer.phone : ""
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
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
    
    // Debug: Check what data is being sent
    console.log("Submitting form data:", form);
    
    try {
      let savedSale;
      if(editingSale){
        savedSale = await dispatch(updateSale({id: editingSale, updatedData: form})).unwrap();
        setEditingSale(null);
        console.log("Sale Updated Successfully");
      } else {
        savedSale = await dispatch(addSale(form)).unwrap();
        console.log("Sale Added Successfully");
      }
      
      generateInvoicePDF(savedSale || form);
      await dispatch(fetchsales()); 
      
      // Reset form
      setForm({
        invoice_no: "INV" + Math.floor(1000 + Math.random() * 9000),
        invoice_date_time: new Date().toISOString().slice(0, 10),
        customer_id: "",
        customer_phone: "",
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
      
      setShowSaleForm(false);
    } catch (err) {
      console.error("Error saving sale:", err);
      console.error("Error details:", err.response?.data);
      alert(`Error saving sale: ${err.response?.data?.message || err.message}`);
    }
  };

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

  const handleEdit = (sale) => {
    setEditingSale(sale._id);
    setForm({
      invoice_no: sale.invoice_no || "INV" + Math.floor(1000 + Math.random() * 9000),
      invoice_date_time: sale.invoice_date_time || new Date().toISOString().slice(0, 10),
      customer_id: sale.customer_id || "",
      customer_phone: sale.customer_phone || "",
      counter_id: sale.counter_id || "",
      payment_mode: sale.payment_mode || "Cash",
      subtotal: sale.subtotal || 0,
      discount_amount: sale.discount_amount || 0,
      tax_amount: sale.tax_amount  || 0,
      grand_total: sale.grand_total || 0,
      paid_amount: sale.paid_amount || 0,
      due_amount: sale.due_amount || 0,
      notes: sale.notes || "",
      items: sale.items || [],
    });
    setShowSaleForm(true);
  };

  const handleCloseForm = () => {
    setShowSaleForm(false);
    setEditingSale(null);
    setForm({
      invoice_no: "INV" + Math.floor(1000 + Math.random() * 9000),
      invoice_date_time: new Date().toISOString().slice(0, 10),
      customer_id: "",
      customer_phone: "",
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
  };

  const generateInvoicePDF = (saleData) => {
    const doc = new jsPDF();

    // ======= Pharmacy Header =======
    const pharmacyName = "Vyoobam Pharmacy";
    const pharmacyAddress = "No.12, Main Road, Kumbakonam, Tamil Nadu - 641001";
    const pharmacyContact = "+91 98765 43210  |  Reg No: TN-PH-04567";
    const pharmacyEmail = "vyoobampharmacy@gmail.com";

    doc.addImage(logo, "PNG", 14, 10, 25, 25);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(pharmacyName, 105, 20, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(pharmacyAddress, 105, 26, { align: "center" });
    doc.text(pharmacyContact, 105, 31, { align: "center" });
    doc.text(pharmacyEmail, 105, 36, { align: "center" });

    // ======= Invoice Info =======
    doc.setFontSize(12);
    doc.text(`Invoice No: ${saleData.invoice_no}`, 14, 50);
    doc.text(
      `Date: ${new Date(saleData.invoice_date_time).toLocaleDateString()}`,
      150,
      50
    );

    const customer =
      typeof saleData.customer_id === "object"
        ? saleData.customer_id
        : customers.find((c) => c._id === saleData.customer_id);

    doc.text(`Customer Name: ${customer?.name || "N/A"}`, 14, 58);

    const customerPhone = saleData.customer_phone || customer?.phone || "N/A";
    doc.text(`Phone: ${customerPhone}`, 150, 58);

    // ======= Items Table =======
    const tableData = saleData.items.map((item, i) => {
      const product =
        typeof item.product_id === "object"
          ? item.product_id
          : products.find((p) => p._id === item.product_id);

      return [
        i + 1,
        product?.name || "Unknown Product",
        item.qty,
        item.unit_price.toFixed(2),
        item.discount_percent + "%",
        item.line_total.toFixed(2),
      ];
    });

    autoTable(doc, {
      startY: 75,
      head: [["#", "Product", "Qty", "Price", "Discount", "Total"]],
      body: tableData,
      theme: "grid",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    const finalY = doc.lastAutoTable.finalY + 10;

    // ======= Totals Section =======
    doc.setFontSize(11);
    doc.text(`Subtotal: ₹${saleData.subtotal.toFixed(2)}`, 140, finalY);
    doc.text(`Discount: ₹${saleData.discount_amount.toFixed(2)}`, 140, finalY + 6);
    doc.text(`Tax: ₹${saleData.tax_amount.toFixed(2)}`, 140, finalY + 12);
    doc.setFont("helvetica", "bold");
    doc.text(`Grand Total: ₹${saleData.grand_total.toFixed(2)}`, 140, finalY + 20);
    doc.setFont("helvetica", "normal");
    doc.text(`Paid: ₹${saleData.paid_amount.toFixed(2)}`, 140, finalY + 26);
    doc.text(`Due: ₹${saleData.due_amount.toFixed(2)}`, 140, finalY + 32);

    // ======= Footer Section =======
    const footerY = finalY + 50;
    doc.setFontSize(10);
    doc.text("Thank you for choosing Vyoobam Pharmacy!", 105, footerY, {
      align: "center",
    });
    doc.text("** Medicines once sold cannot be returned **", 105, footerY + 6, {
      align: "center",
    });

    // Save the PDF
    doc.save(`${saleData.invoice_no}.pdf`);
  };

  // Helper function to get customer name
  const getCustomerName = (sale) => {
    if (typeof sale.customer_id === "object" && sale.customer_id !== null) {
      return sale.customer_id?.name || "Unknown Customer";
    }
    return customers.find((c) => c._id === sale.customer_id)?.name || "Unknown Customer";
  };

  // Helper function to get customer phone
  const getCustomerPhone = (sale) => {
    return sale.customer_phone || sale.customer_id?.phone || "N/A";
  };

  // Helper function to get product names
  const getProductNames = (sale) => {
    if (!Array.isArray(sale.items) || sale.items.length === 0) {
      return "No Items";
    }

    return sale.items.map((item, idx) => {
      let productName = "Unknown Product";
      if (item?.product_id) {
        if (typeof item.product_id === "object" && item.product_id !== null) {
          productName = item.product_id?.name || "Unknown Product";
        } else {
          const matchedProduct = products.find((prod) => prod._id === item.product_id);
          productName = matchedProduct?.name || "Unknown Product";
        }
      }
      return `${productName} (${item?.qty || 0})`;
    }).join(", ");
  };

  // Define table columns for reusable table
  const tableColumns = [
    {
      key: "customer",
      header: "Customer",
      headerStyle: { width: "150px" },
      render: (sale) => getCustomerName(sale)
    },
    {
      key: "phone",
      header: "Phone",
      headerStyle: { width: "120px" },
      render: (sale) => getCustomerPhone(sale)
    },
    {
      key: "invoice_no",
      header: "Invoice No",
      headerStyle: { width: "120px" },
      render: (sale) => sale.invoice_no || "N/A"
    },
    {
      key: "date",
      header: "Date",
      headerStyle: { width: "100px" },
      render: (sale) => sale.invoice_date_time ? new Date(sale.invoice_date_time).toLocaleDateString() : "N/A"
    },
    {
      key: "counter",
      header: "Counter",
      headerStyle: { width: "80px" },
      render: (sale) => sale.counter_id || "N/A"
    },
    {
      key: "payment_mode",
      header: "Mode",
      headerStyle: { width: "80px" },
      render: (sale) => sale.payment_mode || "N/A"
    },
    {
      key: "products",
      header: "Products",
      headerStyle: { width: "200px" },
      render: (sale) => getProductNames(sale)
    },
    {
      key: "subtotal",
      header: "Subtotal",
      headerStyle: { width: "100px" },
      render: (sale) => `₹${sale.subtotal?.toFixed(2) || "0.00"}`
    },
    {
      key: "discount",
      header: "Discount",
      headerStyle: { width: "100px" },
      render: (sale) => `₹${sale.discount_amount?.toFixed(2) || "0.00"}`
    },
    {
      key: "tax",
      header: "Tax",
      headerStyle: { width: "100px" },
      render: (sale) => `₹${sale.tax_amount?.toFixed(2) || "0.00"}`
    },
    {
      key: "grand_total",
      header: "Grand Total",
      headerStyle: { width: "120px" },
      render: (sale) => `₹${sale.grand_total?.toFixed(2) || "0.00"}`
    },
    {
      key: "due_amount",
      header: "Due Amount",
      headerStyle: { width: "100px" },
      render: (sale) => `₹${sale.due_amount?.toFixed(2) || "0.00"}`
    }
  ];

   const tableActions = Object.values(createRoleBasedActions(role));
    
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
          <TbFileInvoice size={24} />
        </span>
        <b>SALES/INVOICE MASTER</b>
      </h2>

      {/* Add Button */}
      <div className="row mb-4">
        <div className="col-12">
          <button
            className="btn btn-primary d-flex align-items-center"
            onClick={() => setShowSaleForm(true)}
          >
            <MdAdd className="me-2" />
            New Sale
          </button>
        </div>
      </div>

      {/* Sale Modal */}
      {showSaleForm && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  {editingSale ? "Edit Sale" : "New Sale"}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={handleCloseForm}
                ></button>
              </div>
              <div className="modal-body" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label>Customer <span className="text-danger">*</span></label>
                      <select name="customer_id" value={form.customer_id} onChange={handleChange} className="form-select bg-light" required>
                        <option value="">Select Customer</option>
                        {customers.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name} - {c.phone}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Display customer phone number */}
                    <div className="col-md-6">
                      <label>Customer Phone</label>
                      <input 
                        type="text" 
                        className="form-control bg-light" 
                        value={form.customer_phone} 
                        readOnly 
                        placeholder="Phone will appear when customer is selected"
                      />
                    </div>
                    
                    <div className="col-md-3">
                      <label>Invoice Date</label>
                      <input type="date" name="invoice_date_time" value={form.invoice_date_time} onChange={handleChange} className="form-control bg-light" required />
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

                  {/* Sale Items */}
                  <h5 className="mt-4">Sale Items</h5>
                  <div className="table-responsive">
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
                  </div>
                  <button type="button" onClick={addItem} className="btn btn-outline-primary mt-2">+ Add Item </button>
                  
                  {/* Totals Section */}
                  <div className="mt-4 row">
                    <div className="col-md-6">
                      <div className="card">
                        <div className="card-body">
                          <h6 className="card-title">Order Summary</h6>
                          <p><strong>Subtotal:</strong> ₹{form.subtotal.toFixed(2)}</p>
                          <p><strong>Discount:</strong> ₹{form.discount_amount.toFixed(2)}</p>
                          <p><strong>Tax:</strong> ₹{form.tax_amount.toFixed(2)}</p>
                          <p><strong>Grand Total:</strong> ₹{form.grand_total.toFixed(2)}</p>
                          <p><strong>Due Amount:</strong> ₹{form.due_amount.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="d-flex flex-wrap gap-2 mt-4">
                    <button type="submit" className="btn btn-primary px-4 d-flex align-items-center justify-content-center">
                      <FaRegSave className="me-2" />
                      {editingSale ? "Update Sale" : "Save & Print"}
                    </button>
                    <button type="button" className="btn btn-success px-4 d-flex align-items-center justify-content-center">
                      <FaWhatsapp className="me-2" />
                      Save & WhatsApp
                    </button>
                    <button type="button" className="btn btn-warning px-4 d-flex align-items-center justify-content-center text-white">
                      <TfiHandStop className="me-2" />
                      Hold Bill
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

      {/* Reusable Table Component - Replaces the old table */}
      <ReusableTable
        data={filteredsales}
        columns={tableColumns}
        loading={status === "loading"}
        searchable={true}
        searchTerm={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search Customer name, Counter"
        actions={tableActions}
        onActionClick={handleTableAction}
        emptyMessage="No sales records found."
        className="mt-4"
      />
    </div>
  );
};

export default SalePOS;