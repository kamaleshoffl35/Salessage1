import { useEffect, useState } from "react";
import { MdReceipt } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { fetchcustomers } from "../redux/customerSlice";
import { fetchpayments } from "../redux/customerpaymentSlice";
import { fetchsales } from "../redux/saleSlice";

import ReusableTable, {
  createRoleBasedActions,
} from "../components/ReusableTable";
import API from "../api/axiosInstance";

const SalesReturn = () => {
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
  const [stockSummary, setStockSummary] = useState([]);

const [form, setForm] = useState({
  invoice_no: "",
  product_id: "",
  quantity: "",
  reason: "",
    return_amount: 0,
});

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.token) console.error("No user found Please Login");
    const token = user?.token;
  
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

  useEffect(() => {
  const fetchStockSummary = async () => {
    try {
      const res = await API.get("/stock/summary");
      setStockSummary(res.data || []);
    } catch (err) {
      console.error("Failed to load stock summary", err);
    }
  };

  fetchStockSummary();
}, []);



  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const selectedSale = customerSales.find(
  (s) => s._id === form.invoice_no
);


const saleProducts = selectedSale?.items || [];

const selectedSaleItem = saleProducts.find(
  (i) => i.product_id?._id === form.product_id
);

useEffect(() => {
  if (!selectedSale || !selectedSaleItem || !form.quantity) {
    setForm((prev) => ({ ...prev, return_amount: 0 }));
    return;
  }

  const totalInvoiceAmount = Number(selectedSale.grand_total || 0);

  const totalProductQty = Number(
    selectedSaleItem.qty ||
    selectedSaleItem.quantity ||
    0
  );

  const returnQty = Number(form.quantity);

  if (totalInvoiceAmount <= 0 || totalProductQty <= 0 || returnQty <= 0) {
    setForm((prev) => ({ ...prev, return_amount: 0 }));
    return;
  }

  // ✅ NET per-unit price from invoice total
  const perUnitAmount = totalInvoiceAmount / totalProductQty;

  const returnAmount = perUnitAmount * returnQty;

  setForm((prev) => ({
    ...prev,
    return_amount: returnAmount.toFixed(2),
  }));
}, [form.quantity, form.product_id, selectedSale]);





  const totalDueAmount = customerSales.reduce((total, sale) => {
    return total + (sale.due_amount || 0);
  }, 0);

  const totalPaidAmount = totalGrandTotal - totalDueAmount;

  const handleCustomerChange = (e) => {
    const customerId = e.target.value;
    setSelectedCustomer(customerId);
    setForm({ ...form, customer_id: customerId });
  };


  const getAvailableStock = (productId) => {
  if (!productId) return 0;

  const record = stockSummary.find(
    (s) => s.productId === productId
  );

  return record?.availableQty || 0;
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

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!form.invoice_no || !form.product_id || !form.quantity || !form.reason) {
    alert("Please fill all required fields");
    return;
  }

  if (!selectedSaleItem) {
    alert("Invalid product selection");
    return;
  }

  if (Number(form.quantity) > Number(selectedSaleItem.qty)) {
    alert("Return quantity cannot exceed sold quantity");
    return;
  }

  try {
    await API.post("/sales-returns", {
      invoice_no: form.invoice_no,
      customer_id: selectedSale.customer_id?._id || selectedSale.customer_id,
      items: [
        {
          product_id: form.product_id,
          quantity: Number(form.quantity),
          return_amount: Number(form.return_amount),
        },
      ],
      reason: form.reason,
    });

    alert("Sales Return Created Successfully");

    setForm({
      invoice_no: "",
      product_id: "",
      quantity: "",
      reason: "",
      return_amount: 0,
    });

    dispatch(fetchsales());
  } catch (err) {
    console.error("Sales return error:", err);
    alert(err.response?.data?.message || "Sales return failed");
  }
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
        <b>Sales Return</b>
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

     
      {selectedCustomer && (
  <>
    {/* ================= Sales History Table ================= */}
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

    {/* ================= Sales Return Form ================= */}
    <form onSubmit={handleSubmit}>
      <div className="row">
        <div className="col-md-6">
          <label className="form-label">Invoice No</label>
          <select
            className="form-select bg-light"
            name="invoice_no"
            value={form.invoice_no}
            onChange={handleChange}
          >
            <option value="">-- Select Invoice --</option>
            {customerSales.map((sale) => (
              <option key={sale._id} value={sale._id}>
                {sale.invoice_no}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label">Product</label>
          <select
            className="form-select bg-light"
            name="product_id"
            value={form.product_id}
            onChange={handleChange}
            disabled={!form.invoice_no}
          >
            <option value="">-- Select Product --</option>
            {saleProducts.map((item) => (
              <option
                key={item.product_id?._id}
                value={item.product_id?._id}
              >
                {item.product_id?.name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-6">
  <label className="form-label">Quantity</label>
  <input
    type="number"
    className="form-control bg-light"
    name="quantity"
    value={form.quantity}
    min="1"
    max={
      Math.min(
        selectedSaleItem?.qty || 0,
        getAvailableStock(form.product_id) + (selectedSaleItem?.qty || 0)
      )
    }
    onChange={handleChange}
  />
  <small className="text-muted">
    Sold Qty: {selectedSaleItem?.qty || 0} |  
    Available Stock: {getAvailableStock(form.product_id)}
  </small>
</div>


        <div className="col-md-6">
          <label className="form-label">Return Amount</label>
          <input
            type="text"
            className="form-control bg-light"
            value={`₹ ${form.return_amount}`}
            readOnly
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Reason</label>
          <input
            type="text"
            className="form-control bg-light"
            name="reason"
            onChange={handleChange}
          />
        </div>

        <div className="col-12 d-flex gap-2 mt-3">
          <button type="submit" className="btn add text-white">
            Submit
          </button>
        </div>
      </div>
    </form>
  </>
)}

    </div>
    
  );
};

export default SalesReturn;
