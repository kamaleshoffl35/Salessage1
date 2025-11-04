

import React, { useEffect, useState } from 'react'
import { MdAttachMoney, MdAdd, MdClose } from "react-icons/md";
import { FaRegSave, FaSearch } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import { fetchcustomers } from '../redux/customerSlice';
import { addpayment, deletepayment, fetchpayments, updatePayment } from '../redux/customerpaymentSlice';
import { fetchsales } from '../redux/saleSlice'; // Import sales slice
import { setAuthToken } from '../services/userService';
import ReusableTable, { createRoleBasedActions } from '../components/ReusableTable';

const Customer_Payment = () => {
  const dispatch = useDispatch()
  const { items: cus_payments, status } = useSelector((state) => state.cus_payments)
  const { items: customers } = useSelector((state) => state.customers)
  const { items: sales } = useSelector((state) => state.sales) // Get sales data

  const user = JSON.parse(localStorage.getItem("user"))
  const role = user?.role || "user"
  const token = user?.token

  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [editingPayment, setEditingPayment] = useState(null)
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(""); // Selected customer from dropdown
  const [customerSales, setCustomerSales] = useState([]); // Filtered sales for selected customer

  const [form, setForm] = useState({
    customer_id: "",
    date: new Date().toISOString().slice(0, 16),
    amount: "",
    mode: "",
    reference_no: "",
    applied_invoice_id: "",
    notes: "",
  })

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"))
    if (!user || !user.token)
      console.error("No user found Please Login")
    const token = user?.token
    setAuthToken(token)
    dispatch(fetchcustomers())
    dispatch(fetchpayments())
    dispatch(fetchsales()) // Fetch sales data
  }, [dispatch])

  // Filter sales when customer is selected
  useEffect(() => {
    if (selectedCustomer) {
      const filtered = sales.filter(sale => {
        // Handle both object and string customer_id formats
        const saleCustomerId = typeof sale.customer_id === 'object' 
          ? sale.customer_id._id 
          : sale.customer_id;
        return saleCustomerId === selectedCustomer;
      });
      setCustomerSales(filtered);
    } else {
      setCustomerSales([]);
    }
  }, [selectedCustomer, sales])

  const handleCustomerChange = (e) => {
    const customerId = e.target.value;
    setSelectedCustomer(customerId);
    setForm({ ...form, customer_id: customerId });
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingPayment) {
        await dispatch(updatePayment({ id: editingPayment, updatedData: form })).unwrap()
        setEditingPayment(null)
        console.log("Payment Updated Successfully")
      } else {
        await dispatch(addpayment(form)).unwrap()
        console.log("Payment Added Successfully")
      }
      setForm({
        customer_id: "",
        date: new Date().toISOString().slice(0, 16),
        amount: "",
        mode: "",
        reference_no: "",
        applied_invoice_id: "",
        notes: "",
      })
      setSelectedCustomer(""); // Reset customer selection
      setShowPaymentForm(false)
      dispatch(fetchpayments())
    }
    catch (err) {
      console.error(err.response?.data || err.message)
    }
  }

  const handleDelete = async (id) => {
    dispatch(deletepayment(id))
  }

  const filteredpayments = cus_payments.filter((p) => {
    const customerName = p.customer_id?.name || (customers.find(c => c._id === p.customer_id)?.name) || ""
    return (
      customerName.toLowerCase().includes(search.toLowerCase()) ||
      new Date(p.date).toLocaleString().toLowerCase().includes(search.toLowerCase())
    )
  })

  const handleEdit = (payment) => {
    setEditingPayment(payment._id)
    setSelectedCustomer(payment.customer_id || "");
    setForm({
      customer_id: payment.customer_id || "",
      date: payment.date || new Date().toISOString().slice(0, 16),
      amount: payment.amount || "",
      mode: payment.mode || "",
      reference_no: payment.reference_no || "",
      applied_invoice_id: payment.applied_invoice_id || "",
      notes: payment.notes || "",
    })
    setShowPaymentForm(true)
  }

  const handleCloseForm = () => {
    setShowPaymentForm(false)
    setEditingPayment(null)
    setSelectedCustomer(""); // Reset customer selection
    setForm({
      customer_id: "",
      date: new Date().toISOString().slice(0, 16),
      amount: "",
      mode: "",
      reference_no: "",
      applied_invoice_id: "",
      notes: "",
    })
  }

  // Helper function to get customer name
  const getCustomerName = (payment) => {
    if (typeof payment.customer_id === "object" && payment.customer_id !== null) {
      return payment.customer_id?.name || "Unknown Customer";
    }
    return customers.find((c) => c._id === payment.customer_id)?.name || "Unknown Customer";
  };

  // Helper function to get customer name for sales
  const getSaleCustomerName = (sale) => {
    if (typeof sale.customer_id === "object" && sale.customer_id !== null) {
      return sale.customer_id?.name || "Unknown Customer";
    }
    return customers.find((c) => c._id === sale.customer_id)?.name || "Unknown Customer";
  };

  // Helper function to get product names for sales
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
          const matchedProduct = useSelector(state => state.products.items).find((prod) => prod._id === item.product_id);
          productName = matchedProduct?.name || "Unknown Product";
        }
      }
      return `${productName} (${item?.qty || 0})`;
    }).join(", ");
  };

  // Define table columns for customer sales
  const salesTableColumns = [
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

  // Define table columns for payments
  const paymentTableColumns = [
    {
      key: "customer",
      header: "Customer",
      headerStyle: { width: "150px" },
      render: (payment) => getCustomerName(payment)
    },
    {
      key: "date",
      header: "Date",
      headerStyle: { width: "160px" },
      render: (payment) => payment.date ? new Date(payment.date).toLocaleString() : "N/A"
    },
    {
      key: "amount",
      header: "Amount",
      headerStyle: { width: "100px" },
      render: (payment) => payment.amount ? `₹${payment.amount}` : "₹0"
    },
    {
      key: "mode",
      header: "Payment Mode",
      headerStyle: { width: "120px" },
      render: (payment) => payment.mode || "N/A"
    },
    {
      key: "reference_no",
      header: "Ref No",
      headerStyle: { width: "120px" },
      render: (payment) => payment.reference_no || "-"
    },
    {
      key: "applied_invoice_id",
      header: "Invoice",
      headerStyle: { width: "100px" },
      render: (payment) => payment.applied_invoice_id || "-"
    },
    {
      key: "notes",
      header: "Notes",
      headerStyle: { width: "150px" },
      render: (payment) => payment.notes || "-"
    }
  ];

  // Use common actions with role-based access
  const tableActions = Object.values(createRoleBasedActions(role));

  // Handle table actions
  const handleTableAction = (actionType, payment) => {
    if (actionType === "edit") {
      handleEdit(payment);
    } else if (actionType === "delete") {
      if (window.confirm("Are you sure you want to delete this payment?")) {
        handleDelete(payment._id);
      }
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4 d-flex align-items-center fs-5">
        <span className="me-2 d-flex align-items-center" style={{ color: "#4d6f99ff" }}>
          <MdAttachMoney size={24} />
        </span>
        <b>CUSTOMER RECEIPTS</b>
      </h2>

      {/* Customer Selection Dropdown */}
      <div className="row mb-4">
        <div className="col-md-6">
          <label className="form-label">Select Customer</label>
          <select 
            className="form-select bg-light" 
            value={selectedCustomer} 
            onChange={handleCustomerChange}
          >
            <option value="">-- Select Customer --</option>
            {customers.map(c => (
              <option key={c._id} value={c._id}>
                {c.name} - {c.phone}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Customer Sales Table - Only show when customer is selected */}
      {selectedCustomer && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">Customer Sales History</h5>
              </div>
              <div className="card-body">
                <ReusableTable
                  data={customerSales}
                  columns={salesTableColumns}
                  loading={status === "loading"}
                  searchable={false}
                  emptyMessage="No sales found for this customer."
                  className="mt-0"
                />
              </div>
            </div>
          </div>
        </div>
      )}
      
    </div>
  )
}

export default Customer_Payment