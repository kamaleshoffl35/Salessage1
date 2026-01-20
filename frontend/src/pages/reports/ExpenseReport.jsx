import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchexpenses } from "../../redux/expenseSlice";
import { setAuthToken } from "../../services/userService";
import ReusableTable from "../../components/ReusableTable";
import ExportButtons from "../../components/ExportButtons";
const ExpenseReport = () => {
  const dispatch = useDispatch();
  const { items: expenses, status } = useSelector((state) => state.expenses);
  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.token;
  const [form, setForm] = useState({
    month: "",
  });

  useEffect(() => {
    setAuthToken(token);
    dispatch(fetchexpenses());
  }, [dispatch, token]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.month) {
      alert("Please select a month");
      return;
    }
  };
  const filteredExpenses = expenses.filter((e) => {
    if (!form.month) 
      return true;
    const expenseMonth = new Date(e.expenseDate).toISOString().slice(0, 7);
    return expenseMonth === form.month;
  });

  const totalExpenseAmount = filteredExpenses.reduce(
    (sum, e) => sum + Number(e.amount || 0),
    0,
  );

  const totalExpenses = filteredExpenses.length;
  const expenseHeadMap = {};
  filteredExpenses.forEach((e) => {
    const head = e.expenseHead || "Unknown";
    expenseHeadMap[head] = (expenseHeadMap[head] || 0) + Number(e.amount || 0);
  });
  let topExpenseHead = "N/A";
  let topExpenseAmount = 0;
  Object.entries(expenseHeadMap).forEach(([head, amt]) => {
    if (amt > topExpenseAmount) {
      topExpenseHead = head;
      topExpenseAmount = amt;
    }
  });
  const expenseReportColumns = [
    {
      key: "date",
      header: "Date",
      headerStyle: { width: "120px" },
      render: (e) =>
        e.expenseDate ? new Date(e.expenseDate).toLocaleDateString() : "N/A",
    },
    {
      key: "warehouse",
      header: "Warehouse",
      headerStyle: { width: "160px" },
      render: (e) =>
        typeof e.warehouseId === "object" ? e.warehouseId?.store_name : "N/A",
    },
    {
      key: "expenseHead",
      header: "Expense Head",
      headerStyle: { width: "140px" },
    },
    {
      key: "amount",
      header: "Amount",
      headerStyle: { width: "120px" },
      render: (e) => `₹${Number(e.amount || 0).toFixed(2)}`,
    },
    {
      key: "notes",
      header: "Notes",
      headerStyle: { width: "220px" },
      render: (e) => e.notes || "-",
    },
  ];

  return (
    <div className="container mt-4 bg-white p-4 rounded shadow">
      <h4 className="mb-3">Expense Report (Month Wise)</h4>
      <ExportButtons
        data={filteredExpenses}
        columns={expenseReportColumns}
        title="Monthly Expense Report"
      />

      <form className="row g-3 mb-4" onSubmit={handleSubmit}>
        <div className="col-md-4">
          <label>
            Select Month <span className="text-danger">*</span>
          </label>
          <input
            type="month"
            className="form-control"
            name="month"
            value={form.month}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-4 d-flex align-items-end">
          <button
            className="btn w-100 text-white"
            style={{ backgroundColor: "#182235" }}
          >
            Search
          </button>
        </div>
      </form>
      {filteredExpenses.length > 0 && (
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="card border-primary h-100">
              <div className="card-body d-flex flex-column justify-content-center align-items-center text-center">
                <h6 className="text-muted">Total Expense</h6>
                <h4 className="fw-bold" style={{ color: "#4D9AD4" }}>
                  ₹{totalExpenseAmount.toFixed(2)}
                </h4>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-primary h-100">
              <div className="card-body d-flex flex-column justify-content-center align-items-center text-center">
                <h6 className="text-muted">Total Entries</h6>
                <h4 className="fw-bold" style={{ color: "#4D9AD4" }}>
                  {totalExpenses}
                </h4>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-primary h-100">
              <div className="card-body d-flex flex-column justify-content-center align-items-center text-center">
                <h6 className="text-muted">Top Expense Head</h6>
                <h5 className="fw-bold" style={{ color: "#4D9AD4" }}>
                  {topExpenseHead}
                </h5>
                <small className="text-muted">
                  ₹{topExpenseAmount.toFixed(2)}
                </small>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header add text-white">
          <h5 className="mb-0">Expense Report</h5>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <ReusableTable
              data={filteredExpenses}
              columns={expenseReportColumns}
              loading={status === "loading"}
              searchable={false}
              emptyMessage="No expenses found for selected month."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseReport;
