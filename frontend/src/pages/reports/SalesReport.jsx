
 

import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { fetchsalereports } from "../../redux/salereportSlice";
import { setAuthToken } from "../../services/userService";
import ExportButtons from "../../components/ExportButtons";
import ReusableTable from "../../components/ReusableTable";

const SalesReport = () => {
  const dispatch = useDispatch();
  const { items: salereports, status } = useSelector(
    (state) => state.salereports
  );

  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.token;

  const [form, setForm] = useState({
    from_date: "",
    to_date: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.from_date || !form.to_date) {
      alert("Please select From & To date");
      return;
    }

    setAuthToken(token);
    dispatch(fetchsalereports(form));
  };
const totalSalesAmount = salereports.reduce(
  (sum, sale) => sum + (sale.grand_total || 0),
  0
);

const totalCustomers = new Set(
  salereports
    .map((sale) =>
      typeof sale.customer_id === "object"
        ? sale.customer_id?._id
        : sale.customer_id
    )
    .filter(Boolean)
).size;

const productQtyMap = {};

salereports.forEach((sale) => {
  sale.items?.forEach((item) => {
    const productName =
      item.product_id?.name || "Unknown Product";
    const qty = item.qty || 0;

    productQtyMap[productName] =
      (productQtyMap[productName] || 0) + qty;
  });
});

let topProduct = "N/A";
let topProductQty = 0;

Object.entries(productQtyMap).forEach(([product, qty]) => {
  if (qty > topProductQty) {
    topProduct = product;
    topProductQty = qty;
  }
});

  const salesReportColumns = [
  
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
    key: "invoice_no",
    header: "Invoice No",
    headerStyle: { width: "120px" },
    render: (sale) => sale.invoice_no || "N/A",
  },
  {
    key: "customer",
    header: "Customer",
    headerStyle: { width: "140px" },
    render: (sale) => sale.customer_id?.name || "Walk-in",
  },
  {
    key: "counter",
    header: "Counter",
    headerStyle: { width: "90px" },
    render: (sale) => sale.counter_id || "-",
  },
  {
    key: "items",
    header: "Items",
    headerStyle: { width: "220px" },
    render: (sale) =>
      sale.items
        ?.map(
          (i) => `${i.product_id?.name ?? "Unknown"} (${i.qty ?? 0})`
        )
        .join(", "),
  },
  {
    key: "grand_total",
    header: "Total Amount",
    headerStyle: { width: "120px" },
    render: (sale) => `₹${sale.grand_total?.toFixed(2) || "0.00"}`,
  },
  {
    key: "due_amount",
    header: "Due Amount",
    headerStyle: { width: "120px" },
    render: (sale) => `₹${sale.due_amount?.toFixed(2) || "0.00"}`,
  },
  {
    key: "payment_mode",
    header: "Payment Mode",
    headerStyle: { width: "120px" },
    render: (sale) => sale.payment_mode || "-",
  },
];


  return (
    <div className="container mt-4 bg-white p-4 rounded shadow">
      <h4 className="mb-3">Sales Report</h4>
<ExportButtons
  data={salereports}
  columns={salesReportColumns}
  title="Sales Report"
/>


      <form className="row g-3 mb-4" onSubmit={handleSubmit}>
        <div className="col-md-4">
          <label>From Date <span className="text-danger">*</span></label>
          <input
            type="date"
            className="form-control"
            name="from_date"
            value={form.from_date}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-4">
          <label>To Date <span className="text-danger">*</span></label>
          <input
            type="date"
            className="form-control"
            name="to_date"
            value={form.to_date}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-4 d-flex align-items-end">
          <button className="btn  w-100 text-white" style={{backgroundColor:"#182235"}}>
            Search
          </button>
        </div>
      </form>


{salereports.length > 0 && (
  <div className="row mb-4">
    <div className="col-12">
      <div className="card">
        <div className="card-header add text-white">
          <h5 className="mb-0">Sales Summary</h5>
        </div>

        <div className="card-body">
          <div className="row">

            <div className="col-md-4 mb-3">
              <div className="card border-primary">
                <div className="card-body text-center py-3">
                  <h6 className="card-title text-muted mb-2">
                    Total Sales
                  </h6>
                  <h4 className="fw-bold" style={{ color: "#4D9AD4" }}>
                    ₹{totalSalesAmount.toFixed(2)}
                  </h4>
                  <small className="text-muted">Grand Total</small>
                </div>
              </div>
            </div>


            <div className="col-md-4 mb-3">
              <div className="card border-primary">
                <div className="card-body text-center py-3">
                  <h6 className="card-title text-muted mb-2">
                    Total Customers
                  </h6>
                  <h4 className="fw-bold" style={{ color: "#4D9AD4" }}>
                    {totalCustomers}
                  </h4>
                  <small className="text-muted">Unique Customers</small>
                </div>
              </div>
            </div>

    
            <div className="col-md-4 mb-3">
              <div className="card border-primary">
                <div className="card-body text-center py-3">
                  <h6 className="card-title text-muted mb-2">
                    Top Product
                  </h6>
                  <h5 className="fw-bold" style={{ color: "#4D9AD4" }}>
                    {topProduct}
                  </h5>
                  <small className="text-muted">
                    Qty Sold: {topProductQty}
                  </small>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
)}

      <div className="card">
  <div className="card-header add text-white">
    <h5 className="mb-0">Sales Report</h5>
  </div>

  <div className="card-body">
    <ReusableTable
      data={salereports}
      columns={salesReportColumns}
      loading={status === "loading"}
      searchable={false}
      emptyMessage="No sales found for selected date range."
    />
  </div>
</div>

    </div>
  );
};

export default SalesReport;
