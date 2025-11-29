
import { MdClose, MdAdd } from 'react-icons/md';
import { GiMoneyStack } from "react-icons/gi";
import { FaRegSave } from 'react-icons/fa';
import { useState, useEffect } from 'react';

import { useDispatch, useSelector } from "react-redux";
import { fetchwarehouses } from '../redux/warehouseSlice';
import { addexpense, deleteexpense, fetchexpenses, updateexpense } from '../redux/expenseSlice';
import { setAuthToken } from '../services/userService';
import ReusableTable, {createCustomRoleActions} from '../components/ReusableTable'; // Import the reusable table

const Expenses = () => {
  const dispatch = useDispatch();
  const { items: expenses, status } = useSelector((state) => state.expenses);
  const { items: warehouses } = useSelector((state) => state.warehouses);

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;

  const [form, setForm] = useState({
    expenseDate: "",
    warehouseId: "",
    expenseHead: "",
    amount: "",
    notes: "",
  });

  const [editingExpense, setEditingExpense] = useState(null);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [searchDate,setSearchDate]=useState("")
  const [searchWarehouse,setSearchWarehouse]=useState("")
  const [searchExpense,setSearchExpense]=useState("")
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.token) console.error("No user found. Please login.");
    setAuthToken(user?.token);
    dispatch(fetchwarehouses());
    dispatch(fetchexpenses());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingExpense) {
        await dispatch(updateexpense({ id: editingExpense, updatedData: form })).unwrap();
        console.log("Expense Updated Successfully");
      } else {
        await dispatch(addexpense(form)).unwrap();
        console.log("Expense Added Successfully");
      }
      setForm({
        expenseDate: "",
        warehouseId: "",
        expenseHead: "",
        amount: "",
        notes: "",
      });
      setEditingExpense(null);
      setShowExpenseForm(false);
      dispatch(fetchexpenses());
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense._id);
    setForm({
      expenseDate: expense.expenseDate || "",
      warehouseId: expense.warehouseId || "",
      expenseHead: expense.expenseHead || "",
      amount: expense.amount || "",
      notes: expense.notes || "",
    });
    setShowExpenseForm(true);
  };

  const handleDelete = async (id) => {
    dispatch(deleteexpense(id));
  };

  const handleCloseForm = () => {
    setShowExpenseForm(false);
    setEditingExpense(null);
    setForm({
      expenseDate: "",
      warehouseId: "",
      expenseHead: "",
      amount: "",
      notes: "",
    });
  };

  const filteredExpenses = (expenses || []).filter((e) => {
    const date = String(e.expenseDate || "").toLowerCase()
    const name = e.warehouseId?.toLowerCase() || ""
    const expense = e.expenseHead?.toLowerCase() || ""
    const matchdate = searchDate.trim() === "" || date.includes(searchDate.toLowerCase())
    const matchname = searchWarehouse.trim() === " " || name.includes(searchWarehouse.toLowerCase())
    const matchexpense = searchExpense.trim() === " " || expense.includes(searchExpense.toLowerCase())
    return matchdate && matchname && matchexpense
   
  });

 
  const getWarehouseName = (expense) => {
    if (typeof expense.warehouseId === "object" && expense.warehouseId !== null) {
      return expense.warehouseId?.store_name || "Unknown Warehouse";
    }
    return warehouses.find((w) => w._id === expense.warehouseId)?.store_name || "Unknown Warehouse";
  };


  const tableColumns = [
    {
      key: "expenseDate",
      header: "Date",
      headerStyle: { width: "100px" },
      render: (expense) => expense.expenseDate ? new Date(expense.expenseDate).toLocaleDateString() : "N/A"
    },
    {
      key: "warehouse",
      header: "Warehouse",
      headerStyle: { width: "150px" },
      render: (expense) => getWarehouseName(expense)
    },
    {
      key: "expenseHead",
      header: "Expense Head",
      headerStyle: { width: "120px" },
      render: (expense) => expense.expenseHead || "N/A"
    },
    {
      key: "amount",
      header: "Amount",
      headerStyle: { width: "100px" },
      render: (expense) => expense.amount ? `₹${expense.amount}` : "₹0"
    },
    {
      key: "notes",
      header: "Notes",
      headerStyle: { width: "200px" },
      render: (expense) => expense.notes || "-"
    }
  ];

  const tableActions = createCustomRoleActions({
     edit: { 
       show: () => ["super_admin", "admin",].includes(role) 
     },
     delete: { 
       show: () => ["super_admin", "admin"].includes(role)
     }})
      const handleTableAction = (actionType, category) => {
        if (actionType === "edit") {
          handleEdit(category);
        } else if (actionType === "delete") {
          handleDelete(category._id);
        }
      };

  return (
    <div className="container mt-4">
      <h2 className="mb-4 d-flex align-items-center fs-3">
       
        <b>Expense</b>
      </h2>
      <div className="row mb-4">
        <div className="col-12">
          {["super_admin", "admin"].includes(role) && (
            <button
              className="btn add text-white d-flex align-items-center"
              onClick={() => setShowExpenseForm(true)}
            >
              Add Expense
            </button>
          )}
        </div>
      </div>
      {showExpenseForm && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header  text-white">
                <h5 className="modal-title">{editingExpense ? "Edit Expense" : "Add Expense"}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={handleCloseForm}></button>
              </div>
              <div className="modal-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>
                <form className="row g-3" onSubmit={handleSubmit}>
                  <div className="col-md-6">
                    <label className="form-label">Date <span className="text-danger">*</span></label>
                    <input
                      type="date"
                      className="form-control bg-light"
                      name="expenseDate"
                      value={form.expenseDate}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Warehouse <span className="text-danger">*</span></label>
                    <select
                      className="form-select bg-light"
                      name="warehouseId"
                      value={form.warehouseId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">-- Select Warehouse --</option>
                      {warehouses.map((w) => (
                        <option key={w._id} value={w._id}>
                          {w.store_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Expense Head <span className="text-danger">*</span></label>
                    <select
                      className="form-select bg-light"
                      name="expenseHead"
                      value={form.expenseHead}
                      onChange={handleChange}
                      required
                    >
                      <option value="">-- Select Type --</option>
                      <option value="RENT">RENT</option>
                      <option value="EB BILL">EB BILL</option>
                      <option value="SALARY">SALARY</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Amount <span className="text-danger">*</span></label>
                    <input
                      type="number"
                      className="form-control bg-light"
                      name="amount"
                      value={form.amount}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-12">
                    <label className="form-label">Notes <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control bg-light"
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-12 d-flex justify-content-end gap-2 mt-3">
                    <button type="submit" className="btn add text-white d-flex align-items-center">
                    
                      {editingExpense ? "Update Expense" : "Add Expense"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary d-flex align-items-center"
                      onClick={handleCloseForm}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      <ReusableTable
        data={filteredExpenses}
        columns={tableColumns}
        loading={status === "loading"}
        searchable={true}
        searchTerm1={searchDate}
        searchTerm2={searchWarehouse}
        searchTerm3={searchExpense}
        onSearchChange1={setSearchDate}
        onSearchChange2={setSearchWarehouse}
        onSearchChange3={setSearchExpense}
        searchPlaceholder1="Search by Date"
        searchPlaceholder2='Search by Warehouse'
        searchPlaceholder3='Search by Expense'
        showThirdSearch={true}
        actions={tableActions}
        onActionClick={handleTableAction}
        emptyMessage="No expenses found."
        className="mt-4"
        onResetSearch={()=>{
          setSearchDate("")
          setSearchWarehouse("")
          setSearchExpense("")
        }}
      />
    </div>
  );
};

export default Expenses;