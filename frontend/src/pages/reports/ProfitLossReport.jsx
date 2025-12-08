import  { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfitLoss } from "../../redux/profitlossSlice";
import { fetchwarehouses } from "../../redux/warehouseSlice";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; 
import ExportButtons from "../../components/ExportButtons";

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

const filteredDetails = (report?.details || []).filter((d) =>
  d.category.toLowerCase().includes(search.toLowerCase())
);
  

const handleExportExcel=()=> {
  if (!filteredDetails || filteredDetails.length === 0) {
    alert("No data available to export.");
    return;
  }

  const worksheetData = filteredDetails.map((d) => ({
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

const handleExportPdf = () => {
  if (!filteredDetails || filteredDetails.length === 0) {
    alert("No data available to export.");
    return;
  }
  try {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    doc.setFontSize(16);
    doc.text("Profit & Loss Report", 14, 15);

    if (form.from_date || form.to_date) {
      doc.setFontSize(11);
      doc.text(`Period: ${form.from_date || "—"} to ${form.to_date || "—"}`, 14, 22);
    }

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
      styles: { fontSize: 10 },
    });

    const tableData = filteredDetails.map((d) => [
      d.category,
      `₹${d.amount}`,
      d.notes || "-",
    ]);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Category", "Amount (₹)", "Notes"]],
      body: tableData,
      theme: "striped",
      styles: { fontSize: 9 },
    });

    doc.save("Profit_Loss_Report.pdf");
  } catch (error) {
    console.error("PDF export failed:", error);
    alert("An error occurred while exporting the PDF. Check console for details.");
  }
};

const handlePrint = () => {
          window.print();
        };

  return (
    <div className="container mt-4">
      <ExportButtons onExcel={handleExportExcel} onPdf={handleExportPdf} onPrint={handlePrint}/>
     
      <form className="row g-3" onSubmit={handleSubmit}>
        <div className="col-md-4">
          <label className="form-label">From Date</label>
          <input type="date" className="form-control bg-light" name="from_date" value={form.from_date}  onChange={handleChange} />
        </div>
        <div className="col-md-4">
          <label className="form-label">To Date</label>
          <input type="date" className="form-control bg-light"name="to_date"value={form.to_date} onChange={handleChange}/>
        </div>
        <div className="col-md-4">
          <label className="form-label">Warehouse</label>
          <select className="form-select bg-light"  name="warehouse_id" value={form.warehouse_id} onChange={handleChange}  >
            <option value="">All Warehouses</option>
            {warehouses.map((w) => (<option key={w._id} value={w._id}>{w.store_name}</option>))}
          </select>
        </div>
        <div className="col-12">
          <button type="submit" className="btn text-white px-4" style={{backgroundColor:"#182235"}}>Generate Report</button>
        </div>
      </form>

      {report && (
        <>
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
              <div className={`card text-center p-3 ${ report.netProfit >= 0 ? "bg-success text-white" : "bg-danger text-white" }`} >
                <h6>Net Profit</h6>
                <h5>₹{report.netProfit}</h5>
              </div>
            </div>
          </div>

    
          <div className="card shadow-sm mt-4">
            <div className="card-body">
              <h5 className="mb-3">Profit & Loss Breakdown</h5>

              <div className="mt-2 mb-2 input-group">
                <input type="text" className="form-control" placeholder="Search category..."  value={search} onChange={(e) => setSearch(e.target.value)}/>
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

              
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfitLossReport;
