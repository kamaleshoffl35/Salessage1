import { useState, useEffect } from "react";
import { MdDeleteForever } from "react-icons/md";
import { useDispatch, useSelector,  } from "react-redux";
import { addpurchase,deletepurchase,fetchpurchases, updatePurchase,} from "../redux/purchaseSlice";
import { fetchProducts } from "../redux/productSlice";
import { fetchwarehouses } from "../redux/warehouseSlice";
import { fetchsuppliers } from "../redux/supplierSlice";
import ReusableTable, {createCustomRoleActions,} from "../components/ReusableTable";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import API from "../api/axiosInstance";
import HistoryModal from "../components/HistoryModal";
import { useNavigate } from "react-router-dom";
ModuleRegistry.registerModules([AllCommunityModule]);

const Purchase = () => {
  const dispatch = useDispatch();
  const { items: purchases, status } = useSelector((state) => state.purchases);
  const { items: suppliers } = useSelector((state) => state.suppliers);
  const { items: warehouses } = useSelector((state) => state.warehouses);
  const { items: products } = useSelector((state) => state.products);
  const [role, setRole] = useState("user");

const navigate = useNavigate();
  const [purchase, setPurchase] = useState({
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

  const [searchname, setSearchName] = useState("");
  const [searchinvoice, setSearchInvoice] = useState("");
  const [searchdate, setSearchDate] = useState("");
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyInfo, setHistoryInfo] = useState(null);

useEffect(() => {
  API.get("/users/me")
    .then((res) => {
      setRole(res.data.role);
    })
    .catch(() => {
      navigate("/login");
    });
}, [navigate]);

useEffect(() => {
  dispatch(fetchsuppliers());
  dispatch(fetchwarehouses());
  dispatch(fetchProducts());
  dispatch(fetchpurchases());
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
      items: [
        ...purchase.items,
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
    purchase.items.forEach((item) => {
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
      due_amount,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let subtotal = 0;
      purchase.items.forEach((item) => {
        const lineTotal =
          (Number(item.qty) || 0) * (Number(item.unit_price) || 0) -
          (Number(item.discount) || 0) +
          (Number(item.tax) || 0);
        subtotal += lineTotal;
      });

      const discount_amount = Number(purchase.discount_amount || 0);
      const other_charges = Number(purchase.other_charges || 0);
      const round_off = Number(purchase.round_off || 0);

      const grand_total =
        subtotal - discount_amount + other_charges + round_off;
      const paid_amount = Number(purchase.paid_amount || 0);
      const due_amount = grand_total - paid_amount;

      const purchaseData = {
        ...purchase,
        subtotal,
        grand_total,
        due_amount,
      };

      if (editingPurchase) {
        await dispatch(
          updatePurchase({ id: editingPurchase, updatedData: purchaseData })
        ).unwrap();
        console.log("Purchase updated successfully!");
      } else {
        await dispatch(addpurchase(purchaseData)).unwrap();
        console.log("Purchase added successfully!");
      }

      // Reset form
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
      dispatch(fetchpurchases());
    } catch (err) {
      console.error(
        "Error saving purchase:",
        err.response?.data || err.message
      );
    }
  };

  const filteredpurchase = purchases.filter((p) => {
    const supplierName =
      typeof p.supplier_id === "object"
        ? p.supplier_id?.name?.toLowerCase() || ""
        : String(p.supplier_id || "").toLowerCase();

    const invno = String(p.invoice_no || "").toLowerCase();
    const date = String(p.invoice_date || "").toLowerCase();

    const matchname =
      searchname.trim() === "" ||
      supplierName.includes(searchname.toLowerCase());

    const matchinvno =
      searchinvoice.trim() === "" ||
      invno.includes(searchinvoice.toLowerCase());

    const matchdate =
      searchdate.trim() === "" || date.includes(searchdate.toLowerCase());

    return matchname && matchinvno && matchdate;
  });

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
      items: purchase.items?.map((item) => ({
        product_id: item.product_id || "",
        batch_no: item.batch_no || "",
        mfg_date: item.mfg_date || "",
        exp_date: item.exp_date || "",
        qty: item.qty || 0,
        unit_price: item.unit_price || 0,
        discount: item.discount || 0,
        tax: item.tax || 0,
        line_total: item.line_total || 0,
      })) || [
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
      subtotal: purchase.subtotal || 0,
      discount_amount: purchase.discount_amount || 0,
      other_charges: purchase.other_charges || 0,
      round_off: purchase.round_off || 0,
      grand_total: purchase.grand_total || 0,
      paid_amount: purchase.paid_amount || 0,
      due_amount: purchase.due_amount || 0,
      payment_mode: purchase.payment_mode || "",
      notes: purchase.notes || "",
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
  };
  const getSupplierName = (purchase) => {
    if (
      typeof purchase.supplier_id === "object" &&
      purchase.supplier_id !== null
    ) {
      return purchase.supplier_id?.name || "Unnamed Supplier";
    }
    return (
      suppliers.find((s) => s._id === purchase.supplier_id)?.name ||
      "Unknown Supplier"
    );
  };
  const getWarehouseName = (purchase) => {
    if (
      typeof purchase.warehouse_id === "object" &&
      purchase.warehouse_id !== null
    ) {
      return purchase.warehouse_id?.store_name || "Unnamed Warehouse";
    }
    return (
      warehouses.find((w) => w._id === purchase.warehouse_id)?.store_name ||
      "Unknown Warehouse"
    );
  };

  const getProductNames = (purchase) => {
    if (!Array.isArray(purchase.items) || purchase.items.length === 0) {
      return "No Items";
    }

    return purchase.items
      .map((item, idx) => {
        let productName = "No Product";
        if (item?.product_id) {
          if (typeof item.product_id === "object" && item.product_id !== null) {
            productName = item.product_id?.name || "Unnamed Product";
          } else {
            const matchedProduct = products.find(
              (prod) => prod._id === item.product_id
            );
            productName = matchedProduct?.name || "Unknown Product";
          }
        }
        return `${productName} (${item?.qty ?? 0})`;
      })
      .join(", ");
  };


  const calculateTotalsFromItems = (items) => {
    let subtotal = 0;

    items.forEach((item) => {
      const lineTotal =
        (Number(item.qty) || 0) * (Number(item.unit_price) || 0) -
        (Number(item.discount) || 0) +
        (Number(item.tax) || 0);

      item.line_total = lineTotal;
      subtotal += lineTotal;
    });

    const grand_total =
      subtotal -
      (Number(purchase.discount_amount) || 0) +
      (Number(purchase.other_charges) || 0) +
      (Number(purchase.round_off) || 0);

    const due_amount = grand_total - (Number(purchase.paid_amount) || 0);

    setPurchase((prev) => ({
      ...prev,
      items,
      subtotal,
      grand_total,
      due_amount,
    }));
  };

  const tableColumns = [
    {
      key: "supplier",
      header: "Supplier",
      headerStyle: { width: "150px" },
      render: (purchase) => getSupplierName(purchase),
    },
    {
      key: "invoice_no",
      header: "Invoice No",
      headerStyle: { width: "120px" },
      render: (purchase) => purchase.invoice_no || "N/A",
    },
    {
      key: "invoice_date",
      header: "Invoice Date",
      headerStyle: { width: "120px" },
      render: (purchase) =>
        purchase.invoice_date
          ? new Date(purchase.invoice_date).toLocaleDateString()
          : "N/A",
    },
    {
      key: "warehouse",
      header: "Store Name",
      headerStyle: { width: "150px" },
      render: (purchase) => getWarehouseName(purchase),
    },
    {
      key: "products",
      header: "Products",
      headerStyle: { width: "200px" },
      render: (purchase) => getProductNames(purchase),
    },
    {
      key: "subtotal",
      header: "Subtotal",
      headerStyle: { width: "100px" },
      render: (purchase) => `₹${purchase.subtotal ?? 0}`,
    },
    {
      key: "other_charges",
      header: "Other Charges",
      headerStyle: { width: "120px" },
      render: (purchase) => `₹${purchase.other_charges ?? 0}`,
    },
    {
      key: "grand_total",
      header: "Grand Total",
      headerStyle: { width: "120px" },
      render: (purchase) => `₹${purchase.grand_total ?? 0}`,
    },
    {
      key: "paid_amount",
      header: "Paid",
      headerStyle: { width: "100px" },
      render: (purchase) => `₹${purchase.paid_amount ?? 0}`,
    },
    {
      key: "due_amount",
      header: "Due",
      headerStyle: { width: "100px" },
      render: (purchase) => `₹${purchase.due_amount ?? 0}`,
    },
    {
      key: "payment_mode",
      header: "Payment Mode",
      headerStyle: { width: "120px" },
      render: (purchase) => purchase.payment_mode || "N/A",
    },
  ];

  const tableActions = createCustomRoleActions({
    edit: {
      show: () => ["super_admin", "admin"].includes(role),
    },
    delete: {
      show: () => ["super_admin", "admin"].includes(role),
    },
    history: {
      show: () => ["super_admin", "admin", "user"].includes(role),
    },
  });

  const handleTableAction = (actionType, purchase) => {
    if (actionType === "edit") {
      handleEdit(purchase);
    } else if (actionType === "delete") {
      handleDelete(purchase._id);
    } else if (actionType === "history") {
      handleHistory(purchase);
    }
  };

  const purchaseItemColumns = [
    {
      headerName: "Product",
      field: "product_id",
      editable: true,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: products.map((p) => p._id), // values stored internally
        formatValue: (id) => {
          const product = products.find((p) => p._id === id);
          return product ? product.name : "";
        },
      },
      valueFormatter: (params) => {
        const product = products.find((p) => p._id === params.value);
        return product ? product.name : "Select Product";
      },
    },
    { headerName: "Batch No", field: "batch_no", editable: true },
    { headerName: "MFG Date", field: "mfg_date", editable: true },
    { headerName: "EXP Date", field: "exp_date", editable: true },
    {
      headerName: "Qty",
      field: "qty",
      editable: true,
      valueParser: (v) => Number(v) || 0,
    },
    {
      headerName: "Unit Price",
      field: "unit_price",
      editable: true,
      valueParser: (v) => Number(v) || 0,
    },
    {
      headerName: "Discount",
      field: "discount",
      editable: true,
      valueParser: (v) => Number(v) || 0,
    },
    {
      headerName: "Tax",
      field: "tax",
      editable: true,
      valueParser: (v) => Number(v) || 0,
    },
    {
      headerName: "Line Total",
      field: "line_total",
      valueGetter: (params) => {
        const { qty, unit_price, discount, tax } = params.data;
        const total =
          (qty || 0) * (unit_price || 0) - (discount || 0) + (tax || 0);
        return Number.isFinite(total) ? total.toFixed(2) : "0.00";
      },
    },
    {
      headerName: "Action",
      field: "action",
      cellRenderer: (params) => (
        <button
          className="btn btn-sm"
          onClick={() => removeItem(params.node.rowIndex)}
        >
          <MdDeleteForever className="text-danger" />
        </button>
      ),
      width: 110,
    },
  ];

  const handleHistory = async (purchase) => {
    if (!purchase._id) {
      console.error("Purchase Id missing:", purchase);
      setHistoryInfo({
        createdBy:
          purchase?.created_by?.name ||
          purchase?.created_by?.username ||
          purchase?.created_by?.email ||
          "Unknown",
        createdAt: purchase?.createdAt || null,
        updatedBy: "-",
        updatedAt: null,
      });
    }
    try {
      const res = await API.get(`/purchases/${purchase._id}`);

      const p = res.data;
      const createdByUser =
        p?.created_by?.name ||
        p?.created_by?.username ||
        p?.created_by?.email ||
        "Unknown";
      const updatedByUser =
        p?.updated_by?.name ||
        p?.updated_by?.username ||
        p?.updated_by?.email ||
        "-";
      setHistoryInfo({
        createdBy: createdByUser,
        createdAt: p?.createdAt || purchase?.createdAt || null,
        updatedBy: updatedByUser,
        updatedAt: p?.updatedAt || purchase?.updatedAt || null,
        oldValue: p?.history?.oldValue || null,
        newValue: p?.history?.newValue || null,
      });
    } catch (err) {
      console.warn(`Failed to fetch purchase history ${purchase._id}`);
      setHistoryInfo({
        createdBy:
          purchase?.created_by?.name ||
          purchase?.created_by?.username ||
          purchase?.created_by?.email ||
          "Unknown",
        createdAt: purchase?.createdAt || null,
        updatedBy:
          purchase?.updated_by?.name ||
          purchase?.updated_by?.username ||
          purchase?.updated_by?.email ||
          "-",
        updatedAt: purchase?.updatedAt || null,
        oldValue: null,
        newValue: purchase,
      });
    } finally {
      setShowHistoryModal(true);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4 d-flex align-items-center fs-3">
        <b>Purchases</b>
      </h2>

      <div className="row mb-4">
        <div className="col-12">
          {["super_admin", "admin"].includes(role) && (
            <button
              className="btn add text-white d-flex align-items-center"
              onClick={() => setShowPurchaseForm(true)}
            >
              Add Purchase
            </button>
          )}
        </div>
      </div>

      {showPurchaseForm && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-xl modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header text-white">
                <h5 className="modal-title">
                  {editingPurchase ? "Edit Purchase" : "Add New Purchase"}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={handleCloseForm}
                ></button>
              </div>
              <div
                className="modal-body"
                style={{ maxHeight: "80vh", overflowY: "auto" }}
              >
                <form className="row g-3" onSubmit={handleSubmit}>
                  <div className="col-md-6">
                    <label className="form-label">
                      Supplier <span className="text-danger">*</span>
                    </label>
                    <select
                      name="supplier_id"
                      className="form-select bg-light"
                      value={purchase.supplier_id}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Supplier</option>
                      {suppliers.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* <div className="col-md-6">
                    <label className="form-label">
                      Invoice No <span className="text-danger">*</span>
                    </label>
                <input
  type="text"
  name="invoice_no"
  className="form-control bg-light"
  value={purchase.invoice_no}
  disabled
/>


                  </div> */}
                  <div className="col-md-6">
                    <label className="form-label">
                      Invoice Date <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      name="invoice_date"
                      className="form-control bg-light"
                      value={purchase.invoice_date}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">
                      Warehouse <span className="text-danger">*</span>
                    </label>
                    <select
                      name="warehouse_id"
                      className="form-select bg-light"
                      value={purchase.warehouse_id}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Warehouse</option>
                      {warehouses.map((w) => (
                        <option key={w._id} value={w._id}>
                          {w.store_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-12">
                    <h5>Purchase Items</h5>
                    <div className="table-responsive">
                      <table className="table table-bordered table-sm align-middle">
                        <thead className="table-dark">
                          <tr>
                            <th style={{ width: "180px" }}>Product</th>
                            <th>Batch No</th>
                            <th>MFG Date</th>
                            <th>EXP Date</th>
                            <th style={{ width: "80px" }}>Qty</th>
                            <th style={{ width: "120px" }}>Unit Price</th>
                            <th style={{ width: "100px" }}>Discount</th>
                            <th style={{ width: "80px" }}>Tax</th>
                            <th style={{ width: "120px" }}>Line Total</th>
                            <th style={{ width: "80px" }}>Action</th>
                          </tr>
                        </thead>

                        <tbody>
                          {purchase.items.map((item, index) => (
                            <tr key={index}>
                              <td>
                                <select
                                  className="form-select form-select-sm"
                                  name="product_id"
                                  value={item.product_id}
                                  onChange={(e) => handleItemChange(index, e)}
                                >
                                  <option value="">Select Product</option>
                                  {products.map((p) => (
                                    <option key={p._id} value={p._id}>
                                      {p.name}
                                    </option>
                                  ))}
                                </select>
                              </td>

                              <td>
                                <input
                                  type="text"
                                  name="batch_no"
                                  className="form-control form-control-sm"
                                  value={item.batch_no}
                                  onChange={(e) => handleItemChange(index, e)}
                                />
                              </td>

                              <td>
                                <input
                                  type="date"
                                  name="mfg_date"
                                  className="form-control form-control-sm"
                                  value={item.mfg_date}
                                  onChange={(e) => handleItemChange(index, e)}
                                />
                              </td>

                              <td>
                                <input
                                  type="date"
                                  name="exp_date"
                                  className="form-control form-control-sm"
                                  value={item.exp_date}
                                  onChange={(e) => handleItemChange(index, e)}
                                />
                              </td>

                              <td>
                                <input
                                  type="number"
                                  name="qty"
                                  min="0"
                                  className="form-control form-control-sm"
                                  value={item.qty}
                                  onChange={(e) => {
                                    handleItemChange(index, e);
                                    calculateTotals();
                                  }}
                                />
                              </td>

                              <td>
                                <input
                                  type="number"
                                  name="unit_price"
                                  min="0"
                                  className="form-control form-control-sm"
                                  value={item.unit_price}
                                  onChange={(e) => {
                                    handleItemChange(index, e);
                                    calculateTotals();
                                  }}
                                />
                              </td>

                              <td>
                                <input
                                  type="number"
                                  name="discount"
                                  min="0"
                                  className="form-control form-control-sm"
                                  value={item.discount}
                                  onChange={(e) => {
                                    handleItemChange(index, e);
                                    calculateTotals();
                                  }}
                                />
                              </td>

                              <td>
                                <input
                                  type="number"
                                  name="tax"
                                  min="0"
                                  className="form-control form-control-sm"
                                  value={item.tax}
                                  onChange={(e) => {
                                    handleItemChange(index, e);
                                    calculateTotals();
                                  }}
                                />
                              </td>

                              <td className="text-end fw-bold">
                                ₹
                                {(
                                  (Number(item.qty) || 0) *
                                    (Number(item.unit_price) || 0) -
                                  (Number(item.discount) || 0) +
                                  (Number(item.tax) || 0)
                                ).toFixed(2)}
                              </td>

                              <td className="text-center">
                                <button
                                  type="button"
                                  className="btn btn-sm text-danger"
                                  onClick={() => removeItem(index)}
                                >
                                  <MdDeleteForever />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <button
                      type="button"
                      className="btn add btn-sm text-white"
                      onClick={addItem}
                    >
                      + Add Item
                    </button>

                    
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Subtotal</label>
                    <input
                      type="number"
                      className="form-control"
                      value={purchase.subtotal}
                      disabled
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Discount Amount</label>
                    <input
                      type="number"
                      name="discount_amount"
                      className="form-control bg-light"
                      value={purchase.discount_amount}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Other Charges</label>
                    <input
                      type="number"
                      name="other_charges"
                      className="form-control bg-light"
                      value={purchase.other_charges}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Round Off</label>
                    <input
                      type="number"
                      name="round_off"
                      className="form-control bg-light"
                      value={purchase.round_off}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Grand Total</label>
                    <input
                      type="number"
                      className="form-control"
                      value={purchase.grand_total}
                      disabled
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Paid Amount</label>
                    <input
                      type="number"
                      name="paid_amount"
                      className="form-control bg-light"
                      value={purchase.paid_amount}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Due Amount</label>
                    <input
                      type="number"
                      className="form-control"
                      value={purchase.due_amount}
                      disabled
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Payment Mode</label>
                    <select
                      name="payment_mode"
                      className="form-select bg-light"
                      value={purchase.payment_mode}
                      onChange={handleChange}
                    >
                      <option value="">Select Mode</option>
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI</option>
                      <option value="Card">Card</option>
                      <option value="Credit">Credit</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Notes</label>
                    <textarea
                      name="notes"
                      className="form-control bg-light"
                      rows="2"
                      value={purchase.notes}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                  <div className="col-12 d-flex gap-2">
                    <button
                      type="submit"
                      className="btn add text-white px-4 d-flex align-items-center justify-content-center"
                    >
                      {editingPurchase ? "Update Purchase" : "Save Purchase"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary px-4 d-flex align-items-center justify-content-center"
                      onClick={handleCloseForm}
                    >
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
        data={filteredpurchase}
        columns={tableColumns}
        loading={status === "loading"}
        searchable={true}
        searchTerm1={searchname}
        searchTerm2={searchinvoice}
        searchTerm3={searchdate}
        onSearchChange1={setSearchName}
        onSearchChange2={setSearchInvoice}
        onSearchChange3={setSearchDate}
        searchPlaceholder1="Search by Name"
        searchPlaceholder2="Search by Invoice no"
        searchPlaceholder3="Search by Date"
        showThirdSearch={true}
        actions={tableActions}
        onActionClick={handleTableAction}
        emptyMessage="No purchases found."
        className="mt-4"
        onResetSearch={() => {
          setSearchName("");
          setSearchInvoice("");
          setSearchDate("");
        }}
      />
      <HistoryModal
        open={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        data={historyInfo}
      />
    </div>
  );
};

export default Purchase;
