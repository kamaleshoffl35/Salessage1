
// import React, { useEffect, useState } from "react";
// import { FaRegSave } from "react-icons/fa";
// import { GrPowerReset } from "react-icons/gr";
// import { GiTakeMyMoney } from "react-icons/gi";
// import { MdDeleteForever, MdEdit, MdClose, MdAdd } from "react-icons/md";
// import { FaSearch } from "react-icons/fa";
// import axios from "axios";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchsuppliers } from "../redux/supplierSlice";
// import {
//   addpayment,
//   deletepayment,
//   fetchpayments,
//   updatepayment,
// } from "../redux/supplierpaymentSlice";
// import { setAuthToken } from "../services/userService";
// import ReusableTable, { createCustomRoleActions } from "../components/ReusableTable";

// const Supplier_Payment = () => {
//   const dispatch = useDispatch();
//   const { items: sup_payments, status } = useSelector((state) => state.sup_payments);
//   const { items: suppliers } = useSelector((state) => state.suppliers);

//   const user = JSON.parse(localStorage.getItem("user"));
//   const role = user?.role || "user";
//   const token = user?.token;

//   const [showModal, setShowModal] = useState(false);
//   const [editingPayment, setEditingPayment] = useState(null);
//   const [search, setSearch] = useState("");

//   const [form, setForm] = useState({
//     supplier_id: "",
//     date: new Date().toISOString().slice(0, 16),
//     amount: "",
//     mode: "",
//     reference_no: "",
//     applied_purchase_id: "",
//     notes: "",
//   });

//   useEffect(() => {
//     const user = JSON.parse(localStorage.getItem("user"));
//     if (!user || !user.token) console.error("No user found. Please login.");
//     setAuthToken(user?.token);
//     dispatch(fetchsuppliers());
//     dispatch(fetchpayments());
//   }, [dispatch]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm({ ...form, [name]: value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       if (editingPayment) {
//         await dispatch(
//           updatepayment({ id: editingPayment, updatedData: form })
//         ).unwrap();
//         console.log("Payment Updated Successfully");
//       } else {
//         await dispatch(addpayment(form)).unwrap();
//         console.log("Payment Added Successfully");
//       }

//       resetForm();
//       setShowModal(false);
//       dispatch(fetchpayments());
//     } catch (err) {
//       console.error(err.response?.data || err.message);
//     }
//   };

//   const resetForm = () => {
//     setForm({
//       supplier_id: "",
//       date: new Date().toISOString().slice(0, 16),
//       amount: "",
//       mode: "",
//       reference_no: "",
//       applied_purchase_id: "",
//       notes: "",
//     });
//     setEditingPayment(null);
//   };

//   const handleDelete = async (id) => {
//     dispatch(deletepayment(id));
//   };

//   const handleEdit = (payment) => {
//     setEditingPayment(payment._id);
//     setForm({
//       supplier_id: payment.supplier_id?._id || "",
//       date: payment.date || new Date().toISOString().slice(0, 16),
//       amount: payment.amount || "",
//       mode: payment.mode || "",
//       reference_no: payment.reference_no || "",
//       applied_purchase_id: payment.applied_purchase_id || "",
//       notes: payment.notes || "",
//     });
//     setShowModal(true);
//   };

//   const filteredpayments = sup_payments.filter((s) => {
//     const supplierName = s.supplier_id?.name || "";
//     return (
//       supplierName.toLowerCase().includes(search.toLowerCase()) ||
//       s.date.toString().toLowerCase().includes(search.toLowerCase()) ||
//       s.mode?.toLowerCase().includes(search.toLowerCase()) ||
//       s.reference_no?.toLowerCase().includes(search.toLowerCase())
//     );
//   });

//   // Helper function to get supplier name
//   const getSupplierName = (payment) => {
//     if (typeof payment.supplier_id === "object" && payment.supplier_id !== null) {
//       return payment.supplier_id?.name || "Unknown Supplier";
//     }
//     return suppliers.find((s) => s._id === payment.supplier_id)?.name || "Unknown Supplier";
//   };

//   // Define table columns for reusable table
//   const tableColumns = [
//     {
//       key: "supplier",
//       header: "Supplier",
//       headerStyle: { width: "150px" },
//       render: (payment) => getSupplierName(payment)
//     },
//     {
//       key: "date",
//       header: "Date",
//       headerStyle: { width: "160px" },
//       render: (payment) => payment.date ? new Date(payment.date).toLocaleString() : "N/A"
//     },
//     {
//       key: "amount",
//       header: "Amount",
//       headerStyle: { width: "100px" },
//       render: (payment) => payment.amount ? `₹${payment.amount}` : "₹0"
//     },
//     {
//       key: "mode",
//       header: "Payment Mode",
//       headerStyle: { width: "120px" },
//       render: (payment) => payment.mode || "N/A"
//     },
//     {
//       key: "reference_no",
//       header: "Ref No",
//       headerStyle: { width: "120px" },
//       render: (payment) => payment.reference_no || "-"
//     },
//     {
//       key: "applied_purchase_id",
//       header: "Invoice",
//       headerStyle: { width: "100px" },
//       render: (payment) => payment.applied_purchase_id || "-"
//     },
//     {
//       key: "notes",
//       header: "Notes",
//       headerStyle: { width: "150px" },
//       render: (payment) => payment.notes || "-"
//     }
//   ];

//   // Use custom role actions (only super_admin can edit/delete)
//   const tableActions = createCustomRoleActions({
//     edit: { show: () => ["super_admin"].includes(role) },
//     delete: { show: () => ["super_admin"].includes(role) }
//   });

//   // Handle table actions
//   const handleTableAction = (actionType, payment) => {
//     if (actionType === "edit") {
//       handleEdit(payment);
//     } else if (actionType === "delete") {
//       if (window.confirm("Are you sure you want to delete this supplier payment?")) {
//         handleDelete(payment._id);
//       }
//     }
//   };

//   return (
//     <div className="container mt-4">
//       <h2 className="mb-4 d-flex align-items-center fs-5">
//         <span
//           className="me-2 d-flex align-items-center"
//           style={{ color: "#4d6f99ff" }}
//         >
//           <GiTakeMyMoney size={24} />
//         </span>
//         <b>SUPPLIER PAYMENT RECEIPT</b>
//       </h2>

//       {/* Action Buttons */}
//       <div className="row mb-4">
//         <div className="col-12">
//           {["super_admin"].includes(role) && (
//             <button
//               className="btn btn-primary d-flex align-items-center"
//               onClick={() => {
//                 resetForm();
//                 setShowModal(true);
//               }}
//             >
//               <MdAdd className="me-2" />
//               Add Payment
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Reusable Table Component - Replaces the old table */}
//       <ReusableTable
//         data={filteredpayments}
//         columns={tableColumns}
//         loading={status === "loading"}
//         searchable={true}
//         searchTerm={search}
//         onSearchChange={setSearch}
//         searchPlaceholder="Search Supplier, Date, Mode, or Reference No"
//         actions={tableActions}
//         onActionClick={handleTableAction}
//         emptyMessage="No supplier payments found."
//         className="mt-4"
//       />

//       {/* Modal Form */}
//       {showModal && (
//         <div
//           className="modal fade show d-block"
//           style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
//           tabIndex="-1"
//         >
//           <div className="modal-dialog modal-lg modal-dialog-centered">
//             <div className="modal-content">
//               <div className="modal-header bg-primary text-white">
//                 <h5 className="modal-title">
//                   {editingPayment ? "Edit Supplier Payment" : "Add Supplier Payment"}
//                 </h5>
//                 <button
//                   type="button"
//                   className="btn-close btn-close-white"
//                   onClick={() => setShowModal(false)}
//                 >
//                   <MdClose />
//                 </button>
//               </div>

//               <form onSubmit={handleSubmit}>
//                 <div className="modal-body">
//                   <div className="row g-3">
//                     <div className="col-md-6">
//                       <label className="form-label">
//                         Supplier <span className="text-danger">*</span>
//                       </label>
//                       <select
//                         className="form-select bg-light"
//                         name="supplier_id"
//                         value={form.supplier_id}
//                         onChange={handleChange}
//                         required
//                       >
//                         <option value="">-- Select Supplier --</option>
//                         {suppliers.map((s) => (
//                           <option key={s._id} value={s._id}>
//                             {s.name}
//                           </option>
//                         ))}
//                       </select>
//                     </div>

//                     <div className="col-md-6">
//                       <label className="form-label">
//                         Date <span className="text-danger">*</span>
//                       </label>
//                       <input
//                         type="datetime-local"
//                         className="form-control bg-light"
//                         name="date"
//                         value={form.date}
//                         onChange={handleChange}
//                         required
//                       />
//                     </div>

//                     <div className="col-md-6">
//                       <label className="form-label">
//                         Amount (₹) <span className="text-danger">*</span>
//                       </label>
//                       <div className="input-group">
//                         <span className="input-group-text">₹</span>
//                         <input
//                           type="number"
//                           className="form-control bg-light"
//                           placeholder="Enter amount"
//                           name="amount"
//                           value={form.amount}
//                           onChange={handleChange}
//                           required
//                         />
//                       </div>
//                     </div>

//                     <div className="col-md-6">
//                       <label className="form-label">
//                         Payment Mode <span className="text-danger">*</span>
//                       </label>
//                       <select
//                         className="form-select bg-light"
//                         name="mode"
//                         value={form.mode}
//                         onChange={handleChange}
//                         required
//                       >
//                         <option value="">-- Select Mode --</option>
//                         <option value="cash">Cash</option>
//                         <option value="upi">UPI</option>
//                         <option value="bank">Bank Transfer</option>
//                       </select>
//                     </div>

//                     <div className="col-md-6">
//                       <label className="form-label">Reference No (UTR / Cheque)</label>
//                       <input
//                         type="text"
//                         className="form-control bg-light"
//                         placeholder="Enter reference no"
//                         name="reference_no"
//                         value={form.reference_no}
//                         onChange={handleChange}
//                       />
//                     </div>

//                     <div className="col-md-6">
//                       <label className="form-label">Purchase Invoice to Adjust</label>
//                       <select
//                         className="form-select bg-light"
//                         name="applied_purchase_id"
//                         value={form.applied_purchase_id}
//                         onChange={handleChange}
//                       >
//                         <option value="">-- Optional --</option>
//                         <option value="PUR-2001">PUR-2001</option>
//                         <option value="PUR-2002">PUR-2002</option>
//                         <option value="PUR-2003">PUR-2003</option>
//                       </select>
//                     </div>

//                     <div className="col-12">
//                       <label className="form-label">Notes</label>
//                       <textarea
//                         className="form-control bg-light"
//                         rows="2"
//                         placeholder="Enter notes"
//                         name="notes"
//                         value={form.notes}
//                         onChange={handleChange}
//                       ></textarea>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="modal-footer d-flex justify-content-between">
//                   <button
//                     type="button"
//                     className="btn btn-secondary d-flex align-items-center"
//                     onClick={() => {
//                       resetForm();
//                       setShowModal(false);
//                     }}
//                   >
//                     <GrPowerReset className="me-2" />
//                     Cancel
//                   </button>
//                   <button
//                     type="submit"
//                     className="btn btn-primary d-flex align-items-center"
//                   >
//                     <FaRegSave className="me-2" />
//                     {editingPayment ? "Update Payment" : "Save Payment"}
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Supplier_Payment;


import React, { useEffect, useState } from "react";
import { FaRegSave } from "react-icons/fa";
import { GrPowerReset } from "react-icons/gr";
import { GiTakeMyMoney } from "react-icons/gi";
import { MdDeleteForever, MdEdit, MdClose, MdAdd } from "react-icons/md";
import { FaSearch } from "react-icons/fa";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { fetchsuppliers } from "../redux/supplierSlice";
import {
  addpayment,
  deletepayment,
  fetchpayments,
  updatepayment,
} from "../redux/supplierpaymentSlice";
import { fetchpurchases } from "../redux/purchaseSlice"; // Import purchases slice
import { setAuthToken } from "../services/userService";
import ReusableTable, { createCustomRoleActions } from "../components/ReusableTable";

const Supplier_Payment = () => {
  const dispatch = useDispatch();
  const { items: sup_payments, status } = useSelector((state) => state.sup_payments);
  const { items: suppliers } = useSelector((state) => state.suppliers);
  const { items: purchases } = useSelector((state) => state.purchases); // Get purchases data

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role || "user";
  const token = user?.token;

  const [showModal, setShowModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState(""); // Selected supplier from dropdown
  const [supplierPurchases, setSupplierPurchases] = useState([]); // Filtered purchases for selected supplier

  const [form, setForm] = useState({
    supplier_id: "",
    date: new Date().toISOString().slice(0, 16),
    amount: "",
    mode: "",
    reference_no: "",
    applied_purchase_id: "",
    notes: "",
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.token) console.error("No user found. Please login.");
    setAuthToken(user?.token);
    dispatch(fetchsuppliers());
    dispatch(fetchpayments());
    dispatch(fetchpurchases()); // Fetch purchases data
  }, [dispatch]);

  // Filter purchases when supplier is selected
  useEffect(() => {
  if (selectedSupplier) {
    const filtered = purchases.filter(purchase => {
      const purchaseSupplierId =
        typeof purchase.supplier_id === "object"
          ? purchase.supplier_id?._id // ✅ safe access
          : purchase.supplier_id || ""; // ✅ fallback empty string
      return purchaseSupplierId === selectedSupplier;
    });
    setSupplierPurchases(filtered);
  } else {
    setSupplierPurchases([]);
  }
}, [selectedSupplier, purchases]);


  const handleSupplierChange = (e) => {
    const supplierId = e.target.value;
    setSelectedSupplier(supplierId);
    setForm({ ...form, supplier_id: supplierId });
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPayment) {
        await dispatch(
          updatepayment({ id: editingPayment, updatedData: form })
        ).unwrap();
        console.log("Payment Updated Successfully");
      } else {
        await dispatch(addpayment(form)).unwrap();
        console.log("Payment Added Successfully");
      }

      resetForm();
      setShowModal(false);
      dispatch(fetchpayments());
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  const resetForm = () => {
    setForm({
      supplier_id: "",
      date: new Date().toISOString().slice(0, 16),
      amount: "",
      mode: "",
      reference_no: "",
      applied_purchase_id: "",
      notes: "",
    });
    setSelectedSupplier(""); // Reset supplier selection
    setEditingPayment(null);
  };

  const handleDelete = async (id) => {
    dispatch(deletepayment(id));
  };

  const handleEdit = (payment) => {
    setEditingPayment(payment._id);
    setSelectedSupplier(payment.supplier_id || "");
    setForm({
      supplier_id: payment.supplier_id?._id || "",
      date: payment.date || new Date().toISOString().slice(0, 16),
      amount: payment.amount || "",
      mode: payment.mode || "",
      reference_no: payment.reference_no || "",
      applied_purchase_id: payment.applied_purchase_id || "",
      notes: payment.notes || "",
    });
    setShowModal(true);
  };

  const filteredpayments = sup_payments.filter((s) => {
    const supplierName = s.supplier_id?.name || "";
    return (
      supplierName.toLowerCase().includes(search.toLowerCase()) ||
      s.date.toString().toLowerCase().includes(search.toLowerCase()) ||
      s.mode?.toLowerCase().includes(search.toLowerCase()) ||
      s.reference_no?.toLowerCase().includes(search.toLowerCase())
    );
  });

  // Helper function to get supplier name
  const getSupplierName = (payment) => {
    if (typeof payment.supplier_id === "object" && payment.supplier_id !== null) {
      return payment.supplier_id?.name || "Unknown Supplier";
    }
    return suppliers.find((s) => s._id === payment.supplier_id)?.name || "Unknown Supplier";
  };

  // Helper function to get supplier name for purchases
  const getPurchaseSupplierName = (purchase) => {
    if (typeof purchase.supplier_id === "object" && purchase.supplier_id !== null) {
      return purchase.supplier_id?.name || "Unknown Supplier";
    }
    return suppliers.find((s) => s._id === purchase.supplier_id)?.name || "Unknown Supplier";
  };

  // Helper function to get product names for purchases
  const getPurchaseProductNames = (purchase) => {
    if (!Array.isArray(purchase.items) || purchase.items.length === 0) {
      return "No Items";
    }

    return purchase.items.map((item, idx) => {
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

  // Define table columns for supplier purchases
  const purchaseTableColumns = [
    {
      key: "invoice_no",
      header: "Invoice No",
      headerStyle: { width: "120px" },
      render: (purchase) => purchase.invoice_no || "N/A"
    },
    {
      key: "invoice_date",
      header: "Invoice Date",
      headerStyle: { width: "100px" },
      render: (purchase) => purchase.invoice_date ? new Date(purchase.invoice_date).toLocaleDateString() : "N/A"
    },
    {
      key: "products",
      header: "Products",
      headerStyle: { width: "200px" },
      render: (purchase) => getPurchaseProductNames(purchase)
    },
    {
      key: "subtotal",
      header: "Subtotal",
      headerStyle: { width: "100px" },
      render: (purchase) => `₹${purchase.subtotal?.toFixed(2) || "0.00"}`
    },
    {
      key: "discount_amount",
      header: "Discount",
      headerStyle: { width: "100px" },
      render: (purchase) => `₹${purchase.discount_amount?.toFixed(2) || "0.00"}`
    },
    {
      key: "grand_total",
      header: "Grand Total",
      headerStyle: { width: "120px" },
      render: (purchase) => `₹${purchase.grand_total?.toFixed(2) || "0.00"}`
    },
    {
      key: "paid_amount",
      header: "Paid",
      headerStyle: { width: "100px" },
      render: (purchase) => `₹${purchase.paid_amount?.toFixed(2) || "0.00"}`
    },
    {
      key: "due_amount",
      header: "Due Amount",
      headerStyle: { width: "100px" },
      render: (purchase) => `₹${purchase.due_amount?.toFixed(2) || "0.00"}`
    },
    {
      key: "payment_mode",
      header: "Payment Mode",
      headerStyle: { width: "120px" },
      render: (purchase) => purchase.payment_mode || "N/A"
    }
  ];

  // Define table columns for payments
  const paymentTableColumns = [
    {
      key: "supplier",
      header: "Supplier",
      headerStyle: { width: "150px" },
      render: (payment) => getSupplierName(payment)
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
      key: "applied_purchase_id",
      header: "Invoice",
      headerStyle: { width: "100px" },
      render: (payment) => payment.applied_purchase_id || "-"
    },
    {
      key: "notes",
      header: "Notes",
      headerStyle: { width: "150px" },
      render: (payment) => payment.notes || "-"
    }
  ];

  // Use custom role actions (only super_admin can edit/delete)
  const tableActions = createCustomRoleActions({
    edit: { show: () => ["super_admin"].includes(role) },
    delete: { show: () => ["super_admin"].includes(role) }
  });

  // Handle table actions
  const handleTableAction = (actionType, payment) => {
    if (actionType === "edit") {
      handleEdit(payment);
    } else if (actionType === "delete") {
      if (window.confirm("Are you sure you want to delete this supplier payment?")) {
        handleDelete(payment._id);
      }
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4 d-flex align-items-center fs-5">
        <span
          className="me-2 d-flex align-items-center"
          style={{ color: "#4d6f99ff" }}
        >
          <GiTakeMyMoney size={24} />
        </span>
        <b>SUPPLIER PAYMENT RECEIPT</b>
      </h2>

      {/* Supplier Selection Dropdown */}
      <div className="row mb-4">
        <div className="col-md-6">
          <label className="form-label ">Select Supplier</label>
          <select 
            className="form-select bg-light" 
            value={selectedSupplier} 
            onChange={handleSupplierChange}
          >
            <option value="">-- Select Supplier --</option>
            {suppliers.map(s => (
              <option key={s._id} value={s._id}>
                {s.name} - {s.phone}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Supplier Purchases Table - Only show when supplier is selected */}
      {selectedSupplier && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">Supplier Purchase History</h5>
              </div>
              <div className="card-body">
                <ReusableTable
                  data={supplierPurchases}
                  columns={purchaseTableColumns}
                  loading={status === "loading"}
                  searchable={false}
                  emptyMessage="No purchases found for this supplier."
                  className="mt-0"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      

      

      
    </div>
  );
};

export default Supplier_Payment;