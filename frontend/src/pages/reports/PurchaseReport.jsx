import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { fetchpurchasereports } from "../../redux/purchasereportSlice";
import { setAuthToken } from "../../services/userService";
import ExportButtons from "../../components/ExportButtons";
import ReusableTable from "../../components/ReusableTable";
const PurchaseReport = () => {
  const dispatch = useDispatch();
  const { items: purchasereports, status } = useSelector(
    (state) => state.purchasereports
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
    dispatch(fetchpurchasereports(form));
  };

const totalPurchaseAmount = purchasereports.reduce(
  (sum, purchase) => sum + (purchase.grand_total || 0),
  0
);


const totalSuppliers = new Set(
  purchasereports
    .map((purchase) =>
      typeof purchase.supplier_id === "object"
        ? purchase.supplier_id?._id
        : purchase.supplier_id
    )
    .filter(Boolean)
).size;

const productQtyMap = {};

purchasereports.forEach((purchase) => {
  purchase.items?.forEach((item) => {
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

  const purchaseReportColumns = [
  {
    key: "date",
    header: "Date",
    headerStyle: { width: "110px" },
    render: (purchase) =>
      purchase.invoice_date
        ? new Date(purchase.invoice_date).toLocaleDateString()
        : "N/A",
  },
  {
    key: "invoice_no",
    header: "Invoice No",
    headerStyle: { width: "130px" },
    render: (purchase) => purchase.invoice_no || "N/A",
  },
  {
    key: "supplier",
    header: "Supplier",
    headerStyle: { width: "160px" },
    render: (purchase) => purchase.supplier_id?.name || "N/A",
  },
  {
    key: "items",
    header: "Items",
    headerStyle: { width: "240px" },
    render: (purchase) =>
      purchase.items
        ?.map(
          (i) =>
            `${i.product_id?.name ?? "Unknown"} (${i.qty ?? 0})`
        )
        .join(", "),
  },
  {
    key: "warehouse",
    header: "Warehouse",
    headerStyle: { width: "140px" },
    render: (purchase) =>
      purchase.warehouse_id?.store_name ||
      purchase.warehouse_id?.name ||
      "-",
  },
  {
    key: "total",
    header: "Total Amount",
    headerStyle: { width: "120px" },
    render: (purchase) =>
      `₹${purchase.grand_total?.toFixed(2) || "0.00"}`,
  },
  {
    key: "payment_mode",
    header: "Payment Mode",
    headerStyle: { width: "120px" },
    render: (purchase) => purchase.payment_mode || "-",
  },
];


  return (
    <div className="container mt-4 bg-white p-4 rounded shadow">
      <h4 className="mb-3">Purchase Report</h4>

     <ExportButtons
  data={purchasereports}
  columns={purchaseReportColumns}
  title="Purchase Report"
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
          <button className="btn text-white w-100"  style={{backgroundColor:"#182235"}}>
           Search
          </button>
        </div>
      </form>
{purchasereports.length > 0 && (
  <div className="row mb-4">
    <div className="col-12">
      <div className="card">
        <div className="card-header add text-white">
          <h5 className="mb-0">Purchase Summary</h5>
        </div>

        <div className="card-body">
          <div className="row">

            <div className="col-md-4 mb-3">
              <div className="card border-primary">
                <div className="card-body text-center py-3">
                  <h6 className="card-title text-muted mb-2">
                    Total Purchases
                  </h6>
                  <h4 className="fw-bold" style={{ color: "#4D9AD4" }}>
                    ₹{totalPurchaseAmount.toFixed(2)}
                  </h4>
                  <small className="text-muted">Grand Total</small>
                </div>
              </div>
            </div>

           
            <div className="col-md-4 mb-3">
              <div className="card border-primary">
                <div className="card-body text-center py-3">
                  <h6 className="card-title text-muted mb-2">
                    Total Suppliers
                  </h6>
                  <h4 className="fw-bold" style={{ color: "#4D9AD4" }}>
                    {totalSuppliers}
                  </h4>
                  <small className="text-muted">Unique Suppliers</small>
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
                    Qty Purchased: {topProductQty}
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

<div className="row mb-4">
  <div className="col-12">
    <div className="card">
      <div className="card-header add text-white">
        <h5 className="mb-0">Purchase History</h5>
      </div>

      <div className="card-body">
        <ReusableTable
          data={purchasereports}
          columns={purchaseReportColumns}
          loading={status === "loading"}
          searchable={false}
          emptyMessage="No purchases found for selected date range."
          className="mt-0"
        />
      </div>
    </div>
  </div>
</div>

    </div>
  );
};

export default PurchaseReport;
