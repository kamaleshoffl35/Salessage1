import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { MdPictureAsPdf } from "react-icons/md";
import { FaFileExcel } from "react-icons/fa6";

const ProfitLossReport = () => {
  const [form, setForm] = useState({
    from_date: "",
    to_date: "",
    warehouse_id: "",
  });

  const [report, setReport] = useState(null); 
  const [search, setSearch] = useState("");

  const warehouses = [
    { _id: "1", name: "Main Warehouse" },
    { _id: "2", name: "Branch Warehouse" },
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const query = new URLSearchParams({
        fromDate: form.from_date,
        toDate: form.to_date,
        warehouseId: form.warehouse_id,
      });
      const res = await fetch(`http://localhost:5000/api/reports/profitloss?${query}`);
      const data = await res.json();

      // Ensure 'details' always exists
      setReport({
        ...data,
        details: data.details || [],
      });
    } catch (err) {
      console.error(err);
      alert("Error loading report");
    }
  };

  return (
    <div className="container mt-4">
      <form className="row g-3" onSubmit={handleSubmit}>
        <div className="col-md-4">
          <label className="form-label">From Date</label>
          <input
            type="date"
            className="form-control bg-light"
            name="from_date"
            value={form.from_date}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">To Date</label>
          <input
            type="date"
            className="form-control bg-light"
            name="to_date"
            value={form.to_date}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">Warehouse</label>
          <select
            className="form-select bg-light"
            name="warehouse_id"
            value={form.warehouse_id}
            onChange={handleChange}
          >
            <option value="">All Warehouses</option>
            {warehouses.map((w) => (
              <option key={w._id} value={w._id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-12">
          <button type="submit" className="btn btn-primary px-4">
            Generate Report
          </button>
        </div>
      </form>

      {report && (
        <div className="row mt-4">
          <div className="col-md-2">
            <div className="card text-center p-3 bg-light">
              <h6>Net Sales</h6>
              <h5>₹{report.netSales}</h5>
            </div>
          </div>
          <div className="col-md-2">
            <div className="card text-center p-3 bg-light">
              <h6>COGS</h6>
              <h5>₹{report.cogs}</h5>
            </div>
          </div>
          <div className="col-md-2">
            <div className="card text-center p-3 bg-light">
              <h6>Gross Profit</h6>
              <h5>₹{report.grossProfit}</h5>
            </div>
          </div>
          <div className="col-md-2">
            <div className="card text-center p-3 bg-light">
              <h6>Expenses</h6>
              <h5>₹{report.expenses}</h5>
            </div>
          </div>
          <div className="col-md-2">
            <div
              className={`card text-center p-3 ${
                report.netProfit >= 0 ? "bg-success text-white" : "bg-danger text-white"
              }`}
            >
              <h6>Net Profit</h6>
              <h5>₹{report.netProfit}</h5>
            </div>
          </div>
        </div>
      )}

      {report && (
        <div className="card shadow-sm mt-4">
          <div className="card-body">
            <h5 className="mb-3">Profit & Loss Breakdown</h5>

            <div className="mt-2 mb-2 input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Search category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <span className="input-group-text">
                <FaSearch />
              </span>
            </div>

            <table className="table table-bordered table-striped mt-3">
              <thead className="table-dark">
                <tr>
                  <th>Category</th>
                  <th>Amount (₹)</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {(report.details || [])
                  .filter((d) =>
                    d.category.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((d, idx) => (
                    <tr key={idx}>
                      <td>{d.category}</td>
                      <td>{d.amount}</td>
                      <td>{d.notes || "-"}</td>
                    </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-3">
              <button className="btn btn-danger me-2">
                <MdPictureAsPdf /> Export PDF
              </button>
              <button className="btn btn-success">
                <FaFileExcel /> Export Excel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfitLossReport;
