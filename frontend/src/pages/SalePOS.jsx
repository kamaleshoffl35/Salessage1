import { useState, useEffect } from "react";
import { MdAdd, MdClose, MdDeleteForever } from "react-icons/md";

import { useDispatch, useSelector } from "react-redux";
import {
  addSale,
  deleteSale,
  fetchsales,
  updateSale,
} from "../redux/saleSlice";
import { fetchtaxes } from "../redux/taxSlice";
import { fetchProducts } from "../redux/productSlice";
import { fetchcustomers } from "../redux/customerSlice";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../assets/img/image_360.png";
import ReusableTable, {
  createRoleBasedActions,
} from "../components/ReusableTable";
import API from "../api/axiosInstance";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import HistoryModal from "../components/HistoryModal";
ModuleRegistry.registerModules([AllCommunityModule]);

const SalePOS = () => {
  const dispatch = useDispatch();
  const { items: sales, status } = useSelector((state) => state.sales);
  const { items: customers } = useSelector((state) => state.customers);
  const { items: products } = useSelector((state) => state.products);
  const { items: taxes } = useSelector((state) => state.taxes);

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;

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
    items: [],
  });

  const [searchName, setSearchName] = useState("");
  const [searchinvoice, setSearchInvoice] = useState("");
  const [searchdate, setSearchDate] = useState("");
  const [editingSale, setEditingSale] = useState(null);
  const [showSaleForm, setShowSaleForm] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyInfo, setHistoryInfo] = useState(null);
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

    if (name === "customer_id") {
      const selectedCustomer = customers.find((c) => c._id === value);
      setForm((prev) => ({
        ...prev,
        customer_id: value,
        customer_phone: selectedCustomer ? selectedCustomer.phone : "",
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;

    const items = [...form.items];

    let updatedItem = {
      ...items[index],
      [name]: value,
    };

    // Auto-fill unit price when product changes
    if (name === "product_id") {
      const product = products.find((p) => p._id === value);
      updatedItem.unit_price = product ? product.sale_price : 0;
    }

    // ⭐ FIX: Always use returned updated object
    updatedItem = calculateLineTotal(updatedItem);

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
    const price = Number(item.unit_price) || 0;
    const qty = Number(item.qty) || 0;
    const discount = Number(item.discount_percent) || 0;

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

    return {
      ...item,
      cgst_amount: cgst,
      sgst_amount: sgst,
      igst_amount: igst,
      line_total: taxableAmount + cgst + sgst + igst,
    };
  };

  const calculateTotals = () => {
    const subtotal = form.items.reduce((sum, item) => {
      if (!item) return sum; // <-- IMPORTANT FIX
      return sum + (Number(item.qty) || 0) * (Number(item.unit_price) || 0);
    }, 0);

    const discount_amount = form.items.reduce((sum, item) => {
      if (!item) return sum;
      const sub = (Number(item.qty) || 0) * (Number(item.unit_price) || 0);
      return sum + sub * ((Number(item.discount_percent) || 0) / 100);
    }, 0);

    const tax_amount = form.items.reduce((sum, item) => {
      if (!item) return sum;
      return (
        sum +
        (Number(item.cgst_amount) || 0) +
        (Number(item.sgst_amount) || 0) +
        (Number(item.igst_amount) || 0)
      );
    }, 0);

    const grand_total = subtotal - discount_amount + tax_amount;
    const due_amount = grand_total - (Number(form.paid_amount) || 0);

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
    console.log("Submitting form data:", form);

    try {
      let savedSale;
      if (editingSale) {
        savedSale = await dispatch(
          updateSale({ id: editingSale, updatedData: form })
        ).unwrap();
        setEditingSale(null);
        console.log("Sale Updated Successfully");
      } else {
        savedSale = await dispatch(addSale(form)).unwrap();
        console.log("Sale Added Successfully");
      }

      generateInvoicePDF(savedSale || form);
      await dispatch(fetchsales());

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
    const Name =
      typeof s.customer_id === "object"
        ? s.customer_id?.name?.toLowerCase() || ""
        : String(s.customer_id || "").toLowerCase();

    const invno = String(s.invoice_no || "").toLowerCase();
    const date = String(s.invoice_date_time || "").toLowerCase();

    const matchname =
      searchName.trim() === "" || Name.includes(searchName.toLowerCase());

    const matchinvno =
      searchinvoice.trim() === "" ||
      invno.includes(searchinvoice.toLowerCase());

    const matchdate =
      searchdate.trim() === "" || date.includes(searchdate.toLowerCase());

    return matchname && matchinvno && matchdate;
  });

  const handleDelete = async (id) => {
    dispatch(deleteSale(id));
  };

  const handleEdit = (sale) => {
    setEditingSale(sale._id);
    setForm({
      invoice_no:
        sale.invoice_no || "INV" + Math.floor(1000 + Math.random() * 9000),
      invoice_date_time:
        sale.invoice_date_time || new Date().toISOString().slice(0, 10),
      customer_id: sale.customer_id || "",
      customer_phone: sale.customer_phone || "",
      counter_id: sale.counter_id || "",
      payment_mode: sale.payment_mode || "Cash",
      subtotal: sale.subtotal || 0,
      discount_amount: sale.discount_amount || 0,
      tax_amount: sale.tax_amount || 0,
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

    doc.setFontSize(11);
    doc.text(`Subtotal: ₹${saleData.subtotal.toFixed(2)}`, 140, finalY);
    doc.text(
      `Discount: ₹${saleData.discount_amount.toFixed(2)}`,
      140,
      finalY + 6
    );
    doc.text(`Tax: ₹${saleData.tax_amount.toFixed(2)}`, 140, finalY + 12);
    doc.setFont("helvetica", "bold");
    doc.text(
      `Grand Total: ₹${saleData.grand_total.toFixed(2)}`,
      140,
      finalY + 20
    );
    doc.setFont("helvetica", "normal");
    doc.text(`Paid: ₹${saleData.paid_amount.toFixed(2)}`, 140, finalY + 26);
    doc.text(`Due: ₹${saleData.due_amount.toFixed(2)}`, 140, finalY + 32);

    const footerY = finalY + 50;
    doc.setFontSize(10);
    doc.text("Thank you for choosing Vyoobam Pharmacy!", 105, footerY, {
      align: "center",
    });
    doc.text("** Medicines once sold cannot be returned **", 105, footerY + 6, {
      align: "center",
    });

    doc.save(`${saleData.invoice_no}.pdf`);
  };

  const getCustomerName = (sale) => {
    if (typeof sale.customer_id === "object" && sale.customer_id !== null) {
      return sale.customer_id?.name || "Unknown Customer";
    }
    return (
      customers.find((c) => c._id === sale.customer_id)?.name ||
      "Unknown Customer"
    );
  };

  const getCustomerPhone = (sale) => {
    return sale.customer_phone || sale.customer_id?.phone || "N/A";
  };

  const getProductNames = (sale) => {
    if (!Array.isArray(sale.items) || sale.items.length === 0) {
      return "No Items";
    }

    return sale.items
      .map((item, idx) => {
        let productName = "Unknown Product";
        if (item?.product_id) {
          if (typeof item.product_id === "object" && item.product_id !== null) {
            productName = item.product_id?.name || "Unknown Product";
          } else {
            const matchedProduct = products.find(
              (prod) => prod._id === item.product_id
            );
            productName = matchedProduct?.name || "Unknown Product";
          }
        }
        return `${productName} (${item?.qty || 0})`;
      })
      .join(", ");
  };

  const tableColumns = [
    {
      key: "customer",
      header: "Customer",
      headerStyle: { width: "150px" },
      render: (sale) => getCustomerName(sale),
    },
    {
      key: "phone",
      header: "Phone",
      headerStyle: { width: "120px" },
      render: (sale) => getCustomerPhone(sale),
    },
    {
      key: "invoice_no",
      header: "Invoice No",
      headerStyle: { width: "120px" },
      render: (sale) => sale.invoice_no || "N/A",
    },
    {
      key: "date",
      header: "Date",
      headerStyle: { width: "100px" },
      render: (sale) =>
        sale.invoice_date_time
          ? new Date(sale.invoice_date_time).toLocaleDateString()
          : "N/A",
    },
    {
      key: "counter",
      header: "Counter",
      headerStyle: { width: "80px" },
      render: (sale) => sale.counter_id || "N/A",
    },
    {
      key: "payment_mode",
      header: "Mode",
      headerStyle: { width: "80px" },
      render: (sale) => sale.payment_mode || "N/A",
    },
    {
      key: "products",
      header: "Products",
      headerStyle: { width: "200px" },
      render: (sale) => getProductNames(sale),
    },
    {
      key: "subtotal",
      header: "Subtotal",
      headerStyle: { width: "100px" },
      render: (sale) => `₹${sale.subtotal?.toFixed(2) || "0.00"}`,
    },
    {
      key: "discount",
      header: "Discount",
      headerStyle: { width: "100px" },
      render: (sale) => `₹${sale.discount_amount?.toFixed(2) || "0.00"}`,
    },
    {
      key: "tax",
      header: "Tax",
      headerStyle: { width: "100px" },
      render: (sale) => `₹${sale.tax_amount?.toFixed(2) || "0.00"}`,
    },
    {
      key: "grand_total",
      header: "Grand Total",
      headerStyle: { width: "120px" },
      render: (sale) => `₹${sale.grand_total?.toFixed(2) || "0.00"}`,
    },
    {
      key: "due_amount",
      header: "Due Amount",
      headerStyle: { width: "100px" },
      render: (sale) => `₹${sale.due_amount?.toFixed(2) || "0.00"}`,
    },
  ];

  const tableActions = Object.values(createRoleBasedActions(role));

  const handleTableAction = (actionType, sale) => {
    if (actionType === "edit") {
      handleEdit(sale);
    } else if (actionType === "delete") {
      handleDelete(sale._id);
    } else if (actionType === "history") {
      handleHistory(sale);
    }
  };

  const removeItem = (index) => {
    if (form.items.length === 1) {
      alert("At least one item is required.");
      return;
    }
    const items = [...form.items];
    items.splice(index, 1);
    setForm((prev) => ({ ...prev, items })); // <-- FIXED
  };

  const saleItemColumns = [
    {
      headerName: "Product",
      field: "product_id",
      editable: true,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: { values: products.map((p) => p._id) },
      valueFormatter: (params) => {
        const prod = products.find((p) => p._id === params.value);
        return prod ? prod.name : "Select Product";
      },
    },
    {
      headerName: "Qty",
      field: "qty",
      editable: true,
      valueParser: (v) => Number(v) || 0,
      width: 100,
    },
    {
      headerName: "Unit Price",
      field: "unit_price",
      editable: true,
      valueParser: (v) => Number(v) || 0,
      width: 140,
    },
    {
      headerName: "Discount %",
      field: "discount_percent",
      editable: true,
      valueParser: (v) => Number(v) || 0,
      width: 140,
    },
    {
      headerName: "Tax",
      field: "tax_rate_id",
      editable: true,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: { values: taxes.map((t) => t._id) },
      valueFormatter: (params) => {
        const tax = taxes.find((t) => t._id === params.value);
        return tax ? tax.name : "Select Tax";
      },
      width: 160,
    },
    {
      headerName: "Line Total",
      field: "line_total",
      valueGetter: (params) => {
        const d = params.data || {};
        const qty = Number(d.qty) || 0;
        const price = Number(d.unit_price) || 0;
        const discount = Number(d.discount_percent) || 0;
        const subtotal = qty * price;
        const discountAmount = subtotal * (discount / 100);
        const taxableAmount = subtotal - discountAmount;
        let cgst = 0,
          sgst = 0,
          igst = 0;
        if (d.tax_rate_id) {
          const tax = taxes.find((t) => t._id === d.tax_rate_id);
          if (tax) {
            cgst = taxableAmount * (tax.cgst_percent / 100);
            sgst = taxableAmount * (tax.sgst_percent / 100);
            igst = taxableAmount * (tax.igst_percent / 100);
          }
        }
        const total = taxableAmount + cgst + sgst + igst;
        return Number.isFinite(total) ? total.toFixed(2) : "0.00";
      },
      width: 140,
    },
    {
      headerName: "Action",
      field: "action",
      cellRenderer: (params) => {
        return (
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => {
              const idx = params.node.rowIndex;
              const items = [...form.items];
              items.splice(idx, 1);
              setForm((prev) => ({ ...prev, items }));
            }}
          >
            <MdDeleteForever className="text-danger" />
          </button>
        );
      },
      width: 110,
    },
  ];

  const onSaleItemCellChanged = (params) => {
    const rowIndex = params.node.rowIndex;
    const updatedRow = { ...params.data };
    if (params.colDef.field === "product_id") {
      const prod = products.find((p) => p._id === updatedRow.product_id);
      if (prod) {
        updatedRow.unit_price = Number(prod.sale_price || 0);
      }
    }
    const recalculated = calculateLineTotal({
      ...updatedRow,
      qty: Number(updatedRow.qty) || 0,
      unit_price: Number(updatedRow.unit_price) || 0,
      discount_percent: Number(updatedRow.discount_percent) || 0,
      tax_rate_id: updatedRow.tax_rate_id,
    });
    const updatedItems = [...form.items];
    updatedItems[rowIndex] = recalculated;
    setForm((prev) => ({ ...prev, items: updatedItems }));
  };

  const handleHistory = async (sale) => {
    if (!sale._id) {
      console.error("Sale Id missing:", sale);
      setHistoryInfo({
        createdBy:
          sale?.created_by?.name ||
          sale?.created_by?.username ||
          sale?.created_by?.email ||
          "Unknown",
        createdAt: sale?.createdAt || null,
        updatedBy: "-",
        updatedAt: null,
      });
      setShowHistoryModal(true);
      return;
    }
    try {
      const res = await API.get(`/sales/${sale._id}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      const s = res.data;
      const createdByUser =
        s?.created_by?.name ||
        s?.created_by?.username ||
        s?.created_by?.email ||
        "Unknown";
      const updatedByUser =
        s?.updated_by?.name ||
        s?.updated_by?.username ||
        s?.updated_by?.email ||
        "-";
      setHistoryInfo({
        createdBy: createdByUser,
        createdAt: s?.createdAt || sale?.createdAt || null,
        updatedBy: updatedByUser,
        updatedAt: s?.updatedAt || null,
        oldValues: s?.history?.oldValue || null,
        newValues: s?.history?.newValue || null,
      });
    } catch (err) {
      console.warn(`Failed to fetch sale history ${sale._id}`);
      setHistoryInfo({
        createdBy:
          sale?.created_by?.name ||
          sale?.created_by?.username ||
          sale?.created_by?.email ||
          "Unknown",
        createdAt: sale?.createdAt || null,
        updatedBy:
          sale?.updated_by?.name ||
          sale?.updated_by?.username ||
          sale?.updated_by?.email ||
          "-",
        updatedAt: sale?.updatedAt || null,
        oldValues: null,
        newValues: sale,
      });
    } finally {
      setShowHistoryModal(true);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4 d-flex align-items-center fs-3">
        <b>Sales</b>
      </h2>
      <div className="row mb-4">
        <div className="col-12">
          <button
            className="btn add text-white d-flex align-items-center"
            onClick={() => setShowSaleForm(true)}
          >
            New Sale
          </button>
        </div>
      </div>

      {showSaleForm && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-xl modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header text-white">
                <h5 className="modal-title">
                  {editingSale ? "Edit Sale" : "New Sale"}
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
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label>
                        Customer <span className="text-danger">*</span>
                      </label>
                      <select
                        name="customer_id"
                        value={form.customer_id}
                        onChange={handleChange}
                        className="form-select bg-light"
                        required
                      >
                        <option value="">Select Customer</option>
                        {customers.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name} - {c.phone}
                          </option>
                        ))}
                      </select>
                    </div>

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
                      <input
                        type="date"
                        name="invoice_date_time"
                        value={form.invoice_date_time}
                        onChange={handleChange}
                        className="form-control bg-light"
                        required
                      />
                    </div>
                    <div className="col-md-3">
                      <label>Counter</label>
                      <select
                        name="counter_id"
                        value={form.counter_id}
                        onChange={handleChange}
                        className="form-select bg-light"
                        required
                      >
                        <option value="">Select Counter</option>
                        <option value="POS-1">POS-1</option>
                        <option value="POS-2">POS-2</option>
                        <option value="POS-3">POS-3</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label>Payment Mode</label>
                      <select
                        name="payment_mode"
                        value={form.payment_mode}
                        onChange={handleChange}
                        className="form-select bg-light"
                        required
                      >
                        <option value="Cash">Cash</option>
                        <option value="Card">Card</option>
                        <option value="UPI">UPI</option>
                        <option value="Credit">Credit</option>
                        <option value="Mixed">Mixed</option>
                      </select>
                    </div>
                  </div>

                  <h5 className="mt-4">Sale Items</h5>
                  <div className="table-responsive mt-3">
                    <table className="table table-bordered table-striped">
                      <thead
                        className="table-dark"
                        style={{ position: "sticky", top: 0, zIndex: 1 }}
                      >
                        <tr>
                          <th style={{ width: "180px" }}>Product</th>
                          <th style={{ width: "90px" }}>Qty</th>
                          <th style={{ width: "120px" }}>Unit Price</th>
                          <th style={{ width: "120px" }}>Discount %</th>
                          <th style={{ width: "150px" }}>Tax</th>
                          <th style={{ width: "140px" }}>Line Total</th>
                          <th style={{ width: "80px" }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {form.items.map((item, index) => (
                          <tr key={index}>
                            <td>
                              <select
                                name="product_id"
                                value={item.product_id}
                                onChange={(e) => handleItemChange(index, e)}
                                className="form-control"
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
                                type="number"
                                name="qty"
                                value={item.qty}
                                onChange={(e) => handleItemChange(index, e)}
                                className="form-control"
                                min="1"
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                name="unit_price"
                                value={item.unit_price}
                                onChange={(e) => handleItemChange(index, e)}
                                className="form-control"
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                name="discount_percent"
                                value={item.discount_percent}
                                onChange={(e) => handleItemChange(index, e)}
                                className="form-control"
                                min="0"
                                max="100"
                              />
                            </td>
                            <td>
                              <select
                                name="tax_rate_id"
                                value={item.tax_rate_id}
                                onChange={(e) => handleItemChange(index, e)}
                                className="form-control"
                              >
                                <option value="">Select Tax</option>
                                {taxes.map((t) => (
                                  <option key={t._id} value={t._id}>
                                    {t.name}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="text-right">
                              ₹ {(item.line_total || 0).toFixed(2)}
                            </td>
                            <td className="text-center">
                              <button
                                type="button"
                                className="btn btn-sm btn-danger"
                                onClick={() => removeItem(index)}
                              >
                                <MdDeleteForever size={20} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button
                    type="button"
                    onClick={addItem}
                    className="btn add text-white mt-2"
                  >
                    Add Item{" "}
                  </button>

                  <div className="mt-4 row">
                    <div className="col-md-6">
                      <div className="card">
                        <div className="card-body">
                          <h6 className="card-title">Order Summary</h6>
                          <p>
                            <strong>Subtotal:</strong> ₹
                            {form.subtotal.toFixed(2)}
                          </p>
                          <p>
                            <strong>Discount:</strong> ₹
                            {form.discount_amount.toFixed(2)}
                          </p>
                          <p>
                            <strong>Tax:</strong> ₹{form.tax_amount.toFixed(2)}
                          </p>
                          <p>
                            <strong>Grand Total:</strong> ₹
                            {form.grand_total.toFixed(2)}
                          </p>
                          <p>
                            <strong>Due Amount:</strong> ₹
                            {form.due_amount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex flex-wrap gap-2 mt-4">
                    <button
                      type="submit"
                      className="btn  add text-white px-4 d-flex align-items-center justify-content-center"
                    >
                      {editingSale ? "Update Sale" : "Save & Print"}
                    </button>
                    <button
                      type="button"
                      className="btn add text-white  px-4 d-flex align-items-center justify-content-center"
                    >
                      Save & WhatsApp
                    </button>
                    <button
                      type="button"
                      className="btn add text-white px-4 d-flex align-items-center justify-content-center text-white"
                    >
                      Hold Bill
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
        data={filteredsales}
        columns={tableColumns}
        loading={status === "loading"}
        searchable={true}
        searchTerm1={searchName}
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
        emptyMessage="No sales records found."
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

export default SalePOS;
