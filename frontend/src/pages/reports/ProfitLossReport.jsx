import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { MdPictureAsPdf } from "react-icons/md";
import { FaFileExcel } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfitLoss } from "../../redux/profitlossSlice";
import { fetchwarehouses } from "../../redux/warehouseSlice";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // ✅ Correct import only once

const ProfitLossReport = () => {
  const dispatch = useDispatch();
  const { report } = useSelector((state) => state.profitloss);
  const { items: warehouses } = useSelector((state) => state.warehouses);

  const [form, setForm] = useState({
    from_date: "",
    to_date: "",
    warehouse_id: "",
  });

  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchwarehouses());
  }, [dispatch]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(fetchProfitLoss(form));
  };

  // ✅ Excel Export
  const handleExportExcel = () => {
    if (!report || !report.details?.length) {
      alert("No data available to export.");
      return;
    }

    const worksheetData = report.details.map((d) => ({
      Category: d.category,
      Amount: d.amount,
      Notes: d.notes || "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ProfitLossReport");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "Profit_Loss_Report.xlsx");
  };

  // ✅ PDF Export — fixed
  const handleExportPdf = () => {
    if (!report || !report.details?.length) {
      alert("No data available to export.");
      return;
    }

    try {
      const doc = new jsPDF();

      // Title
      doc.setFontSize(16);
      doc.text("Profit & Loss Report", 14, 15);

      // Period
      if (form.from_date || form.to_date) {
        doc.setFontSize(11);
        doc.text(
          `Period: ${form.from_date || "—"} to ${form.to_date || "—"}`,
          14,
          22
        );
      }

      // Summary
      const summary = [
        ["Net Sales", `₹${report.netSales}`],
        ["COGS", `₹${report.cogs}`],
        ["Gross Profit", `₹${report.grossProfit}`],
        ["Expenses", `₹${report.expenses}`],
        ["Net Profit", `₹${report.netProfit}`],
      ];

      autoTable(doc, {
        startY: 28,
        head: [["Metric", "Amount"]],
        body: summary,
        theme: "grid",
        styles: { fontSize: 11 },
      });

      // Details table
      const tableData = report.details.map((d) => [
        d.category,
        d.amount,
        d.notes || "-",
      ]);

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 10,
        head: [["Category", "Amount (₹)", "Notes"]],
        body: tableData,
        theme: "striped",
        styles: { fontSize: 10 },
      });

      // ✅ Save
      doc.save("Profit_Loss_Report.pdf");
    } catch (error) {
      console.error("PDF export failed:", error);
      alert("Error exporting PDF. Check console for details.");
    }
  };

  const handlePrint = () => {
    window.print();
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
                {w.store_name}
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
        <>
          {/* Summary Cards */}
          <div className="row mt-4">
            {[
              ["Net Sales", report.netSales],
              ["COGS", report.cogs],
              ["Gross Profit", report.grossProfit],
              ["Expenses", report.expenses],
              ["Net Profit", report.netProfit],
            ].map(([label, value], i) => (
              <div className="col-md-2" key={i}>
                <div
                  className={`card text-center p-3 ${
                    label === "Net Profit"
                      ? value >= 0
                        ? "bg-success text-white"
                        : "bg-danger text-white"
                      : "bg-light"
                  }`}
                >
                  <h6>{label}</h6>
                  <h5>₹{value}</h5>
                </div>
              </div>
            ))}
          </div>

          {/* Details */}
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
                <button
                  className="btn btn-danger me-2"
                  onClick={handleExportPdf}
                >
                  <MdPictureAsPdf /> Export PDF
                </button>
                <button
                  className="btn btn-success me-2"
                  onClick={handleExportExcel}
                >
                  <FaFileExcel /> Export Excel
                </button>
                <button className="btn btn-secondary" onClick={handlePrint}>
                  🖨️ Print
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfitLossReport;
