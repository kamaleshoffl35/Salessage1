import  { useEffect, useState } from "react";
import { GiTakeMyMoney, } from "react-icons/gi";
import {  MdReceipt } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { fetchsuppliers } from "../redux/supplierSlice";
import {
  fetchpayments,
} from "../redux/supplierpaymentSlice";
import { fetchpurchases } from "../redux/purchaseSlice";
import { setAuthToken } from "../services/userService";
import ReusableTable from "../components/ReusableTable";

const Supplier_Payment = () => {
  const dispatch = useDispatch();
  const { items: sup_payments, status } = useSelector((state) => state.sup_payments);
  const { items: suppliers } = useSelector((state) => state.suppliers);
  const { items: purchases } = useSelector((state) => state.purchases);
  const { items: products } = useSelector((state) => state.products);

  const user = JSON.parse(localStorage.getItem("user"));

  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [supplierPurchases, setSupplierPurchases] = useState([]);

  const [form, setForm] = useState();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.token) console.error("No user found. Please login.");
    setAuthToken(user?.token);
    dispatch(fetchsuppliers());
    dispatch(fetchpayments());
    dispatch(fetchpurchases());
  }, [dispatch]);


  useEffect(() => {
    if (selectedSupplier) {
      const filtered = purchases.filter(purchase => {
        const purchaseSupplierId =
          typeof purchase.supplier_id === "object"
            ? purchase.supplier_id?._id
            : purchase.supplier_id || "";
        return purchaseSupplierId === selectedSupplier;
      });
      setSupplierPurchases(filtered);
    } else {
      setSupplierPurchases([]);
    }
  }, [selectedSupplier, purchases]);


  const totalGrandTotal = supplierPurchases.reduce((total, purchase) => {
    return total + (purchase.grand_total || 0);
  }, 0);

  const totalDueAmount = supplierPurchases.reduce((total, purchase) => {
    return total + (purchase.due_amount || 0);
  }, 0);

  const totalPaidAmount = supplierPurchases.reduce((total, purchase) => {
    return total + (purchase.paid_amount || 0);
  }, 0);

  const totalPurchases = supplierPurchases.length;

  const handleSupplierChange = (e) => {
    const supplierId = e.target.value;
    setSelectedSupplier(supplierId);
    setForm({ ...form, supplier_id: supplierId });
  }


  const getSupplierName = (payment) => {
    if (typeof payment.supplier_id === "object" && payment.supplier_id !== null) {
      return payment.supplier_id?.name || "Unknown Supplier";
    }
    return suppliers.find((s) => s._id === payment.supplier_id)?.name || "Unknown Supplier";
  };


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
          const matchedProduct = products.find((prod) => prod._id === item.product_id);
          productName = matchedProduct?.name || "Unknown Product";
        }
      }
      return `${productName} (${item?.qty || 0})`;
    }).join(", ");
  };

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

    
      <div className="row mb-4">
        <div className="col-md-6">
          <label className="form-label">Select Supplier</label>
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

     
      {selectedSupplier && supplierPurchases.length > 0 && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header add text-white">
                <h5 className="mb-0 d-flex align-items-center">
                  <MdReceipt className="me-2" />
                  Supplier Payment Summary
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
               
                  <div className="col-md-3 mb-3">
                    <div className="card border-primary">
                      <div className="card-body text-center py-3">
                        <h6 className="card-title text-muted mb-2">Total Purchases</h6>
                        <h4 className="fw-bold" style={{color:"#4D9AD4"}}>₹{totalGrandTotal.toFixed(2)}</h4>
                        <small className="text-muted">Grand Total</small>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-3 mb-3">
                    <div className="card border-primary">
                      <div className="card-body text-center py-3">
                        <h6 className="card-title text-muted mb-2">Total Paid</h6>
                    <h4 className=" fw-bold" style={{color:"#4D9AD4"}}>₹{totalPaidAmount.toFixed(2)}</h4>
                        <small className="text-muted">Amount Paid</small>
                      </div>
                    </div>
                  </div>

               
                  <div className="col-md-3 mb-3">
                    <div className="card border-primary">
                      <div className="card-body text-center py-3">
                        <h6 className="card-title text-muted mb-2">Total Due</h6>
                        <h4 className=" fw-bold" style={{color:"#4D9AD4"}}>₹{totalDueAmount.toFixed(2)}</h4>
                        <small className="text-muted">Pending Payment</small>
                      </div>
                    </div>
                  </div>

               
                  <div className="col-md-3 mb-3">
                    <div className="card border-primary">
                      <div className="card-body text-center py-3">
                        <h6 className="card-title text-muted mb-2">Total Invoices</h6>
                        <h4 className=" fw-bold" style={{color:"#4D9AD4"}}>{totalPurchases}</h4>
                        <small className="text-muted">Purchase Count</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedSupplier && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header add text-white">
                <h5 className="mb-0">Purchase History</h5>
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