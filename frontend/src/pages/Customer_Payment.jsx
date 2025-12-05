import { useEffect, useState } from "react";
import { MdReceipt } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { fetchcustomers } from "../redux/customerSlice";
import { fetchpayments } from "../redux/customerpaymentSlice";
import { fetchsales } from "../redux/saleSlice";
import { setAuthToken } from "../services/userService";
import ReusableTable, {
  createRoleBasedActions,
} from "../components/ReusableTable";
const Customer_Payment = () => {
  const dispatch = useDispatch();
  const { items: cus_payments, status } = useSelector(
    (state) => state.cus_payments
  );
  const { items: customers } = useSelector((state) => state.customers);
  const { items: sales } = useSelector((state) => state.sales);
  const { items: products } = useSelector((state) => state.products);
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role || "user";
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [customerSales, setCustomerSales] = useState([]);
  const [form, setForm] = useState();
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.token) console.error("No user found Please Login");
    const token = user?.token;
    setAuthToken(token);
    dispatch(fetchcustomers());
    dispatch(fetchpayments());
    dispatch(fetchsales());
  }, [dispatch]);
  useEffect(() => {
    if (selectedCustomer) {
      const filtered = sales.filter((sale) => {
        const saleCustomerId =
          typeof sale.customer_id === "object"
            ? sale.customer_id._id
            : sale.customer_id;
        return saleCustomerId === selectedCustomer;
      });
      setCustomerSales(filtered);
    } else {
      setCustomerSales([]);
    }
  }, [selectedCustomer, sales]);
  const totalGrandTotal = customerSales.reduce((total, sale) => {
    return total + (sale.grand_total || 0);
  }, 0);

  const totalDueAmount = customerSales.reduce((total, sale) => {
    return total + (sale.due_amount || 0);
  }, 0);

  const totalPaidAmount = totalGrandTotal - totalDueAmount;

  const handleCustomerChange = (e) => {
    const customerId = e.target.value;
    setSelectedCustomer(customerId);
    setForm({ ...form, customer_id: customerId });
  };

  const getCustomerName = (payment) => {
    if (
      typeof payment.customer_id === "object" &&
      payment.customer_id !== null
    ) {
      return payment.customer_id?.name || "Unknown Customer";
    }
    return (
      customers.find((c) => c._id === payment.customer_id)?.name ||
      "Unknown Customer"
    );
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

  const salesTableColumns = [
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

  return (
    <div className="container mt-4">
      <h2 className="mb-4 d-flex align-items-center fs-3">
        <b>Customer Receipts</b>
      </h2>

      <div className="row mb-4">
        <div className="col-md-6">
          <label className="form-label">
            Select Customer <span className="text-danger">*</span>
          </label>
          <select
            className="form-select bg-light"
            value={selectedCustomer}
            onChange={handleCustomerChange}
          >
            <option value="">-- Select Customer --</option>
            {customers.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label">Select Phone(Optional)</label>
          <select
            className="form-select bg-light"
            value={selectedCustomer}
            onChange={handleCustomerChange}
          >
            <option value="">-- Select Phone No--</option>
            {customers.map((c) => (
              <option key={c._id} value={c._id}>
                {c.phone}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedCustomer && customerSales.length > 0 && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header add text-white">
                <h5 className="mb-0 d-flex align-items-center">
                  <MdReceipt className="me-2" />
                  Customer Payment Summary
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-3 mb-3">
                    <div className="card border-primary">
                      <div className="card-body text-center py-3">
                        <h6 className="card-title text-muted mb-2">
                          Total Sales
                        </h6>
                        <h4 className=" fw-bold" style={{ color: "#4D9AD4" }}>
                          ₹{totalGrandTotal.toFixed(2)}
                        </h4>
                        <small className="text-muted">Grand Total</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="card border-primary">
                      <div className="card-body text-center py-3">
                        <h6 className="card-title text-muted mb-2">
                          Total Paid
                        </h6>
                        <h4 className=" fw-bold" style={{ color: "#4D9AD4" }}>
                          ₹{totalPaidAmount.toFixed(2)}
                        </h4>
                        <small className="text-muted">Amount Received</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="card border-primary">
                      <div className="card-body text-center py-3">
                        <h6 className="card-title text-muted mb-2">
                          Total Due
                        </h6>
                        <h4 className=" fw-bold" style={{ color: "#4D9AD4" }}>
                          ₹{totalDueAmount.toFixed(2)}
                        </h4>
                        <small className="text-muted">Pending Payment</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="card border-primary">
                      <div className="card-body text-center py-3">
                        <h6 className="card-title text-muted mb-2">
                          Total Invoices
                        </h6>
                        <h4 className=" fw-bold" style={{ color: "#4D9AD4" }}>
                          {customerSales.length}
                        </h4>
                        <small className="text-muted">Sales Count</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {selectedCustomer && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header add text-white">
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
  );
};

export default Customer_Payment;
