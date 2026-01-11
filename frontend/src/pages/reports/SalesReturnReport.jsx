import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { fetchsalereports } from "../../redux/salereportSlice";
import { setAuthToken } from "../../services/userService";
import ExportButtons from "../../components/ExportButtons";
import ReusableTable from "../../components/ReusableTable";
import { fetchsalereturnreports } from "../../redux/salereturnreportSlice";

const SalesReturnReport = () => {
  const dispatch = useDispatch();
  const { items: salereturnreports, status } = useSelector(
    (state) => state.salereturnreports
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
dispatch(fetchsalereturnreports(form));

  };

  const salesReturnColumns = [
  {
    key: "date",
    header: "Return Date",
    headerStyle: { width: "110px" },
    render: (sr) =>
      sr.invoice_date_time
        ? new Date(sr.invoice_date_time).toLocaleDateString()
        : "N/A",
  },
  {
    key: "invoice_number",
    header: "Invoice No",
    headerStyle: { width: "130px" },
    render: (sr) => sr.invoice_number || "N/A",
  },
  {
    key: "customer",
    header: "Customer",
    headerStyle: { width: "160px" },
    render: (sr) => sr.customer_name || "N/A",
  },
  {
    key: "phone",
    header: "Phone",
    headerStyle: { width: "130px" },
    render: (sr) => sr.customer_phone || "-",
  },
  {
    key: "items",
    header: "Returned Items",
    headerStyle: { width: "240px" },
    render: (sr) =>
      sr.items
        ?.map(
          (i) =>
            `${i.product_name} (${i.quantity})`
        )
        .join(", "),
  },
  {
    key: "amount",
    header: "Return Amount",
    headerStyle: { width: "130px" },
    render: (sr) =>
      `₹${sr.items?.reduce(
        (sum, i) => sum + (i.return_amount || 0),
        0
      ).toFixed(2)}`,
  },
  {
    key: "reason",
    header: "Reason",
    headerStyle: { width: "180px" },
    render: (sr) => sr.reason || "-",
  },
];

  return (
    <div className="container mt-4 bg-white p-4 rounded shadow">
      <h4 className="mb-3">SalesReturn Report</h4>
<ExportButtons
  data={salereturnreports}
  columns={salesReturnColumns}
  title="Sales Return Report"
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
      

      <div className="row mb-4">
  <div className="col-12">
    <div className="card">
      <div className="card-header add text-white">
        <h5 className="mb-0">Sales Return History</h5>
      </div>

      <div className="card-body">
        <ReusableTable
          data={salereturnreports}
          columns={salesReturnColumns}
          loading={status === "loading"}
          searchable={false}
          emptyMessage="No sales returns found for selected date range."
          className="mt-0"
        />
      </div>
    </div>
  </div>
</div>





     

</div>

    
  );
};

export default SalesReturnReport;
