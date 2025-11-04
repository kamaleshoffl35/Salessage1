
import React, { useState, useEffect } from "react";
import axios from "axios";
import { BiPurchaseTag } from "react-icons/bi";
import { MdDeleteForever, MdAdd, MdClose, MdEdit } from "react-icons/md";
import { FaRegSave, FaSearch } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { addpurchase, deletepurchase, fetchpurchases, updatePurchase } from "../redux/purchaseSlice";
import { fetchProducts } from "../redux/productSlice";
import { fetchwarehouses } from "../redux/warehouseSlice";
import { fetchsuppliers } from "../redux/supplierSlice";
import { setAuthToken } from "../services/userService";
import ReusableTable,{createCustomRoleActions, createRoleBasedActions} from "../components/ReusableTable"; // Import the reusable table

const Purchase = () => {
  const dispatch = useDispatch()
  const { items: purchases, status } = useSelector((state) => state.purchases)
  const { items: suppliers } = useSelector((state) => state.suppliers)
  const { items: warehouses } = useSelector((state) => state.warehouses)
  const { items: products } = useSelector((state) => state.products)

  const user = JSON.parse(localStorage.getItem("user"))
  const role = user?.role || "user"
  const token = user?.token

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

  const [search, setSearch] = useState("");
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"))
    if (!user || !user.token)
      console.error("No user found Please Login")
    const token = user?.token
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
    try {
      // 🧮 Calculate totals
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

      // ✅ Add or Update logic
      if (editingPurchase) {
        await dispatch(updatePurchase({ id: editingPurchase, updatedData: purchaseData })).unwrap();
        setEditingPurchase(null);
        console.log("✅ Purchase updated successfully!");
      } else {
        await dispatch(addpurchase(purchaseData)).unwrap();
        console.log("✅ Purchase added successfully!");
      }

      // 🧹 Reset form
      setPurchase({
        supplier_id: "",
        invoice_no: "",
        invoice_date: "",
        warehouse_id: "",
        items: [
          {
            product_id: "",
            batch_no: "",
            mfg_date: "",
            exp_date: "",
            qty: 0,
            unit_price: 0,
            discount: 0,
            tax: 0,
            line_total: 0,
          },
        ],
        subtotal: 0,
        discount_amount: 0,
        other_charges: 0,
        round_off: 0,
        grand_total: 0,
        paid_amount: 0,
        due_amount: 0,
        payment_mode: "",
        notes: "",
      });

      setShowPurchaseForm(false);
      // 🔁 Refresh table
      dispatch(fetchpurchases());
    } catch (err) {
      console.error("❌ Error saving purchase:", err.response?.data || err.message);
    }
  };

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

  const handleEdit = (purchase) => {
    setEditingPurchase(purchase._id);
    setPurchase({
      supplier_id: purchase.supplier_id || "",
      invoice_no: purchase.invoice_no || "",
      invoice_date: purchase.invoice_date || "",
      warehouse_id: purchase.warehouse_id || "",
      items: purchase.items?.map(item => ({
        product_id: item.product_id || "",
        batch_no: item.batch_no || "",
        mfg_date: item.mfg_date || "",
        exp_date: item.exp_date || "",
        qty: item.qty || 0,
        unit_price: item.unit_price || 0,
        discount: item.discount || 0,
        tax: item.tax || 0,
        line_total: item.line_total || 0
      })) || [{ product_id: "", batch_no: "", mfg_date: "", exp_date: "", qty: 0, unit_price: 0, discount: 0, tax: 0, line_total: 0 }],
      subtotal: purchase.subtotal || 0,
      discount_amount: purchase.discount_amount || 0,
      other_charges: purchase.other_charges || 0,
      round_off: purchase.round_off || 0,
      grand_total: purchase.grand_total || 0,
      paid_amount: purchase.paid_amount || 0,
      due_amount: purchase.due_amount || 0,
      payment_mode: purchase.payment_mode || "",
      notes: purchase.notes || ""
    });
    setShowPurchaseForm(true);
  };

  const handleCloseForm = () => {
    setShowPurchaseForm(false);
    setEditingPurchase(null);
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
  };

  // Helper function to get supplier name
  const getSupplierName = (purchase) => {
    if (typeof purchase.supplier_id === "object" && purchase.supplier_id !== null) {
      return purchase.supplier_id?.name || "Unnamed Supplier";
    }
    return suppliers.find((s) => s._id === purchase.supplier_id)?.name || "Unknown Supplier";
  };

  // Helper function to get warehouse name
  const getWarehouseName = (purchase) => {
    if (typeof purchase.warehouse_id === "object" && purchase.warehouse_id !== null) {
      return purchase.warehouse_id?.store_name || "Unnamed Warehouse";
    }
    return warehouses.find((w) => w._id === purchase.warehouse_id)?.store_name || "Unknown Warehouse";
  };

  // Helper function to get product names
  const getProductNames = (purchase) => {
    if (!Array.isArray(purchase.items) || purchase.items.length === 0) {
      return "No Items";
    }

    return purchase.items.map((item, idx) => {
      let productName = "No Product";
      if (item?.product_id) {
        if (typeof item.product_id === "object" && item.product_id !== null) {
          productName = item.product_id?.name || "Unnamed Product";
        } else {
          const matchedProduct = products.find((prod) => prod._id === item.product_id);
          productName = matchedProduct?.name || "Unknown Product";
        }
      }
      return `${productName} (${item?.qty ?? 0})`;
    }).join(", ");
  };

  // Define table columns for reusable table
  const tableColumns = [
    {
      key: "supplier",
      header: "Supplier",
      headerStyle: { width: "150px" },
      render: (purchase) => getSupplierName(purchase)
    },
    {
      key: "invoice_no",
      header: "Invoice No",
      headerStyle: { width: "120px" },
      render: (purchase) => purchase.invoice_no || "N/A"
    },
    {
      key: "invoice_date",
      header: "Invoice Date",
      headerStyle: { width: "120px" },
      render: (purchase) => purchase.invoice_date ? new Date(purchase.invoice_date).toLocaleDateString() : "N/A"
    },
    {
      key: "warehouse",
      header: "Store Name",
      headerStyle: { width: "150px" },
      render: (purchase) => getWarehouseName(purchase)
    },
    {
      key: "products",
      header: "Products",
      headerStyle: { width: "200px" },
      render: (purchase) => getProductNames(purchase)
    },
    {
      key: "subtotal",
      header: "Subtotal",
      headerStyle: { width: "100px" },
      render: (purchase) => `₹${purchase.subtotal ?? 0}`
    },
    {
      key: "other_charges",
      header: "Other Charges",
      headerStyle: { width: "120px" },
      render: (purchase) => `₹${purchase.other_charges ?? 0}`
    },
    {
      key: "grand_total",
      header: "Grand Total",
      headerStyle: { width: "120px" },
      render: (purchase) => `₹${purchase.grand_total ?? 0}`
    },
    {
      key: "paid_amount",
      header: "Paid",
      headerStyle: { width: "100px" },
      render: (purchase) => `₹${purchase.paid_amount ?? 0}`
    },
    {
      key: "due_amount",
      header: "Due",
      headerStyle: { width: "100px" },
      render: (purchase) => `₹${purchase.due_amount ?? 0}`
    },
    {
      key: "payment_mode",
      header: "Payment Mode",
      headerStyle: { width: "120px" },
      render: (purchase) => purchase.payment_mode || "N/A"
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
          <BiPurchaseTag size={24} />
        </span>
        <b>PURCHASE MASTER</b>
      </h2>

      {/* Add Button */}
      <div className="row mb-4">
        <div className="col-12">
          {["super_admin", "admin"].includes(role) && (
            <button
              className="btn btn-primary d-flex align-items-center"
              onClick={() => setShowPurchaseForm(true)}
            >
              <MdAdd className="me-2" />
              Add Purchase
            </button>
          )}
        </div>
      </div>

      {/* Purchase Modal */}
      {showPurchaseForm && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  {editingPurchase ? "Edit Purchase" : "Add New Purchase"}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={handleCloseForm}
                ></button>
              </div>
              <div className="modal-body" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
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
                    <div className="table-responsive">
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
                                <input type="number" name="line_total" value={((Number(item.qty) || 0) * (Number(item.unit_price) || 0) - (Number(item.discount) || 0) + (Number(item.tax) || 0)).toFixed(2)} className="form-control" disabled />
                              </td>
                              <td>
                                <button type="button" className="btn btn-danger btn-sm" onClick={() => removeItem(index)}>
                                  <MdDeleteForever /> Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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
                  <div className="col-12 d-flex gap-2">
                    <button type="submit" className="btn btn-primary px-4 d-flex align-items-center justify-content-center">
                      <FaRegSave className="me-2 text-warning" />
                      {editingPurchase ? "Update Purchase" : "Save Purchase"}
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
        data={filteredpurchase}
        columns={tableColumns}
        loading={status === "loading"}
        searchable={true}
        searchTerm={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search Customer, name, email"
        actions={tableActions}
        onActionClick={handleTableAction}
        emptyMessage="No purchases found."
        className="mt-4"
      />
    </div>
  );
};

export default Purchase;