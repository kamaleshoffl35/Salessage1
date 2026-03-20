import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchcustomers } from "../redux/customerSlice";
import { fetchpayments } from "../redux/customerpaymentSlice";
import { fetchsales } from "../redux/saleSlice";
import { createSalesReturn } from "../redux/salesReturnSlice";
import ReusableTable from "../components/ReusableTable";
import API from "../api/axiosInstance";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import { MdEdit, MdDeleteForever } from "react-icons/md";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

ModuleRegistry.registerModules([AllCommunityModule]);
const SalesReturn = () => {
  const dispatch = useDispatch();
  const { items: cus_payments, status } = useSelector(
    (state) => state.cus_payments,
  );
  const { items: customers } = useSelector((state) => state.customers);
  const { items: sales } = useSelector((state) => state.sales);
  const { items: products } = useSelector((state) => state.products);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [customerSales, setCustomerSales] = useState([]);
  const [stockSummary, setStockSummary] = useState([]);
  const [cancelledOrders, setCancelledOrders] = useState([]);
const [salesReturns, setSalesReturns] = useState([]);
  const [form, setForm] = useState({
    invoice_no: "",
    invoice_date_time: new Date().toISOString().slice(0, 10),
    product_id: "",
    quantity: "",
    reason: "",
    return_amount: 0,
  });
  const [qtyError, setQtyError] = useState("");
  useEffect(() => {
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

  useEffect(() => {
  const fetchReturns = async () => {
    try {
      const res = await API.get("/sales-returns");
      setSalesReturns(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCancelledOrders = async () => {
    try {
      const res = await API.get("/orders/cancelled-orders-returns");
      setCancelledOrders(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  fetchReturns();
  fetchCancelledOrders();
}, []);
const combinedReturns = [
  ...salesReturns.map((r) => ({ ...r, source: "Sales Return" })),
  ...cancelledOrders.map((o) => ({ ...o, source: "Cancelled Order" })),
];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "quantity") {
      const qty = Number(value);
      const soldQty = Number(selectedSaleItem?.qty || 0);
      if (qty > soldQty) {
        setQtyError(
          `Customer bought only ${soldQty} item(s), but you are trying to return ${qty}.`,
        );
      } else {
        setQtyError("");
      }
    }
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };
  const selectedSale = customerSales.find((s) => s._id === form.invoice_no);
  const saleProducts = selectedSale?.items || [];
  const selectedSaleItem = saleProducts.find((i) => i.product_id?._id === form.product_id,);
  useEffect(() => {
    if (!selectedSale || !selectedSaleItem || !form.quantity) {
      setForm((prev) => ({ ...prev, return_amount: 0 }));
      return;
    }
    const totalInvoiceAmount = Number(selectedSale.grand_total || 0);
    const totalProductQty = Number(selectedSaleItem.qty || selectedSaleItem.quantity || 0, );
    const returnQty = Number(form.quantity);
    if (totalInvoiceAmount <= 0 || totalProductQty <= 0 || returnQty <= 0) {
      setForm((prev) => ({ ...prev, return_amount: 0 }));
      return;
    }
    const perUnitAmount = totalInvoiceAmount / totalProductQty;
    const returnAmount = perUnitAmount * returnQty;
    setForm((prev) => ({
      ...prev,
      return_amount: returnAmount.toFixed(2),
    }));
  }, [form.quantity, form.product_id, selectedSale]);

  const handleCustomerChange = (e) => {
    const customerId = e.target.value;
    setSelectedCustomer(customerId);
    setForm({ ...form, customer_id: customerId });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !form.invoice_no ||
      !form.product_id ||
      !form.quantity ||
      !form.reason
    ) {
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
      await dispatch(
        createSalesReturn({
          invoice_no: form.invoice_no,
          customer_id:
            selectedSale.customer_id?._id || selectedSale.customer_id,
          items: [
            {
              product_id: form.product_id,
              quantity: Number(form.quantity),
              return_amount: Number(form.return_amount),
            },
          ],
          reason: form.reason,
        }),
      ).unwrap();
      setForm({
        invoice_no: "",
        invoice_date_time: new Date().toISOString().slice(0, 10),
        product_id: "",
        quantity: "",
        reason: "",
        return_amount: 0,
      });
      dispatch(fetchsales());
    } catch (err) {
      console.error("Sales return error:", err);
      alert(err);
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
              (prod) => prod._id === item.product_id,
            );
            productName = matchedProduct?.name || "Unknown Product";
          }
        }
        return `${productName} (${item?.qty || 0})`;
      })
      .join(", ");
  };

  const handleDeleteReturn = async (id) => {
  if (!window.confirm("Are you sure you want to delete this return?")) return;

  try {
    await API.delete(`/sales-returns/${id}`);

    setSalesReturns((prev) => prev.filter((r) => r._id !== id));

    alert("Sales return deleted successfully");
  } catch (err) {
    console.error(err);
    alert("Failed to delete sales return");
  }
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
  const returnColumns = [
    {
  headerName: "Actions",
  flex: 1,
  cellRenderer: (p) => (
    <div className="d-flex gap-2">

      <button
        className="btn btn-sm"
        onClick={() => console.log("Edit", p.data)}
      >
        <MdEdit />
      </button>

      <button
        className="btn btn-sm"
        onClick={() => handleDeleteReturn(p.data._id)}
      >
        <MdDeleteForever className="text-danger" />
      </button>

    </div>
  ),
},
  {
    headerName: "Invoice No",
    field: "invoice_number",
    flex: 1,
  },
  {
    headerName: "Date",
    field: "invoice_date_time",
    flex: 1,
    valueFormatter: (p) =>
      new Date(p.value).toLocaleDateString(),
  },
  {
    headerName: "Customer",
    field: "customer_name",
    flex: 1,
  },
  {
    headerName: "Phone",
    field: "customer_phone",
    flex: 1,
  },
  {
    headerName: "Items",
    flex: 1,
    valueGetter: (p) => p.data.items?.length || 0,
  },
  {
    headerName: "Reason",
    field: "reason",
    flex: 1,
  },
  {
  headerName: "Source",
  field: "source",
  flex: 1,
},
];

const defaultColDef = {
  sortable: true,
  filter: true,
  resizable: true,
};
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

          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6">
                <label className="form-label">
                  Invoice No <span className="text-danger">*</span>
                </label>
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
                <label>
                  Invoice Date <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  name="invoice_date_time"
                  value={form.invoice_date_time}
                  onChange={handleChange}
                  className="form-control bg-light"
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">
                  Product <span className="text-danger">*</span>
                </label>
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
                <label className="form-label">
                  Quantity <span className="text-danger">*</span>
                </label>

                <input
                  type="number"
                  className={`form-control bg-light ${qtyError ? "is-invalid" : ""}`}
                  name="quantity"
                  value={form.quantity}
                  min="1"
                  max={selectedSaleItem?.qty || 0}
                  onChange={handleChange}
                />

                <small className="text-muted">
                  Sold Qty: {selectedSaleItem?.qty || 0}
                </small>

                {qtyError && (
                  <div className="invalid-feedback d-block">{qtyError}</div>
                )}
              </div>

              <div className="col-md-6">
                <label className="form-label">
                  Return Amount <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control bg-light"
                  value={`₹ ${form.return_amount}`}
                  readOnly
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">
                  Reason <span className="text-danger">*</span>
                </label>
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
              <div className="mt-5">
    <h2 className="mb-4 d-flex align-items-center fs-3">
        <b>Sales Return History</b>
      </h2>

 <div
  className="ag-theme-alpine"
  style={{
    height: 500,
    width: "100%",
    borderRadius: "10px",
    overflow: "hidden",
  }}
>
    <AgGridReact
  rowData={combinedReturns}
  columnDefs={returnColumns}
  defaultColDef={defaultColDef}
  pagination={true}
  paginationPageSize={10}
  animateRows={true}
  rowHeight={50}
/>
  </div>
</div>
    </div>
  );
};

export default SalesReturn;
