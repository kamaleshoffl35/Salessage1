import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfitLoss } from "../../redux/profitlossSlice";
import ExportButtons from "../../components/ExportButtons";
const ProfitLossReport = () => {
  const dispatch = useDispatch();
  const { report } = useSelector((state) => state.profitloss);
  const [form, setForm] = useState({
    month: "",
  });
  const [search, setSearch] = useState("");
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.month) {
      alert("Please select a month");
      return;
    }
    const [year, month] = form.month.split("-");
    const fromDate = `${year}-${month}-01`;
    const toDate = new Date(year, month, 0).toISOString().split("T")[0];
    dispatch(fetchProfitLoss({ fromDate, toDate }));
  };

  const filteredDetails = (report?.details || []).filter((d) =>
    d.category.toLowerCase().includes(search.toLowerCase()),
  );

  const profitLossColumns = [
    {
      key: "category",
      header: "Category",
    },
    {
      key: "amount",
      header: "Amount (₹)",
    },
    {
      key: "notes",
      header: "Notes",
    },
  ];

  const exportData = report
    ? [
        { category: "Net Sales", amount: report.netSales, notes: "" },
        { category: "COGS", amount: report.cogs, notes: "" },
        { category: "Gross Profit", amount: report.grossProfit, notes: "" },
        { category: "Expenses", amount: report.expenses, notes: "" },
        { category: "Net Profit", amount: report.netProfit, notes: "" },
        { category: "", amount: "", notes: "" },
        { category: "Category", amount: "Amount", notes: "Notes" },
        ...(report.details || []).map((d) => ({
          category: d.category,
          amount: d.amount,
          notes: d.notes || "",
        })),
      ]
    : [];
  const printTable = () => {
    const printContent = document.getElementById("print-area");
    const win = window.open("", "", "width=900,height=650");
    win.document.write(printContent.innerHTML);
    win.document.close();
    win.print();
  };
  return (
    <div className="container mt-4">
      {report && (
        <ExportButtons
          data={exportData}
          columns={profitLossColumns}
          title="Profit & Loss Report"
        />
      )}
      <form className="row g-3" onSubmit={handleSubmit}>
        <div className="col-md-4">
          <label className="form-label">
            Select Month <span className="text-danger">*</span>
          </label>
          <input
            type="month"
            className="form-control bg-light"
            name="month"
            value={form.month}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-12">
          <button
            type="submit"
            className="btn text-white px-4"
            style={{ backgroundColor: "#182235" }}
          >
            Generate Report
          </button>
        </div>
      </form>
      <div id="print-area">
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
                <div
                  className={`card text-center p-3 ${report.netProfit >= 0 ? "bg-success text-white" : "bg-danger text-white"}`}
                >
                  <h6>Net Profit</h6>
                  <h5>₹{report.netProfit}</h5>
                </div>
              </div>
            </div>

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
                        d.category.toLowerCase().includes(search.toLowerCase()),
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
    </div>
  );
};

export default ProfitLossReport;
