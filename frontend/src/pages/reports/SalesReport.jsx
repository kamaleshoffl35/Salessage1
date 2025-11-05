
import { useEffect, useState } from "react";
import { FaRegSave } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { FaSearch } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { addsalereport, deletesalereport, fetchsalereports } from "../../redux/salereportSlice";
import { fetchcustomers } from "../../redux/customerSlice";
import { setAuthToken } from "../../services/userService";
import * as XLSX from "xlsx"
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExportButtons from "../../components/ExportButtons";


const SalesReport = () => {
  const dispatch=useDispatch()
  const {items:salereports,status}=useSelector((state)=>state.salereports)
  const {items:customers}=useSelector((state)=>state.customers)
 
  const user=JSON.parse(localStorage.getItem("user"))
  const role=user?.role || "user"
  const token=user?.token
  
  const [form, setForm] = useState({
    from_date: "",
    to_date: "",
    customer_id: "",
    invoice_type: "",
    payment_mode: "",
    invoice_no: ""
  })

  useEffect(() => {
    const user=JSON.parse(localStorage.getItem("user"))
    if(!user || !user.token)
      console.error("No user found Please Login")
    const token=user?.token
    setAuthToken(token)
    dispatch(fetchcustomers())
    dispatch(fetchsalereports())


  }, [dispatch])
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
     await dispatch(addsalereport(form)).unwrap()
      setForm({
        from_date: "",
        to_date: "",
        customer_id: "",
        invoice_type: "",
        payment_mode: "",
        invoice_no: ""
      });
      dispatch(fetchsalereports())
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  }

  const [search, setSearch] = useState("");
  const filteredreports = salereports.filter((s) => {
    const customerName = s.customer_id?.name || s.customer_id?.toString() || "";
    return (
      customerName.toLowerCase().includes(search.toLowerCase()) ||
      s.from_date.toString().toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleDelete = async (id) => {
    dispatch(deletesalereport(id))
  };

  const handleExportExcel = () => {
    const data = filteredreports.map((r) => ({
      "From Date": r.from_date ? new Date(r.from_date).toISOString().split("T")[0] : "-",
      "To Date": r.to_date ? new Date(r.to_date).toISOString().split("T")[0] : "-",
      Customer: r.customer_id?.name || r.customer_id,
      "Invoice Type": r.invoice_type,
      "Payment Mode": r.payment_mode,
      "Invoice No": r.invoice_no,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "SalesReport");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), "SalesReport.xlsx");
  };


  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Sales Report", 14, 15);

    const tableData = filteredreports.map((r) => [
      r.from_date ? new Date(r.from_date).toISOString().split("T")[0] : "-",
      r.to_date ? new Date(r.to_date).toISOString().split("T")[0] : "-",
      r.customer_id?.name || r.customer_id,
      r.invoice_type,
      r.payment_mode,
      r.invoice_no,
    ]);

     autoTable(doc, {
    startY: 20,
    head: [["From Date", "To Date", "Customer", "Invoice Type", "Payment Mode", "Invoice No"]],
    body: tableData,
  });

    doc.save("SalesReport.pdf");
  };
const handlePrint = () => {
    window.print();
  };
  return (
    <div className="container mt-4 bg-gradient-warning">

<ExportButtons onExcel={handleExportExcel} onPdf={handleExportPDF} onPrint={handlePrint} />

      <form className="row g-3" onSubmit={handleSubmit}>
        <div className="col-md-6">
          <label className="form-label">From Date<span className="text-danger">*</span></label>
          <input type="date" className="form-control bg-light" name="from_date" value={form.from_date} onChange={handleChange} />
        </div>
        <div className="col-md-6">
          <label className="form-label">To Date<span className="text-danger">*</span></label>
          <input type="date" className="form-control bg-light" name="to_date" value={form.to_date} onChange={handleChange} />
        </div>
        <div className="col-md-6">
          <label className="form-label">Customer<span className="text-danger">*</span></label>
          <select className="form-select bg-light" name="customer_id" value={form.customer_id} onChange={handleChange}>
            <option>-- Select Customer --</option>
            {customers.map(c => (<option key={c._id} value={c._id}>{c.name}</option>))}
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label">Invoice Type</label>
          <select className="form-select bg-light" name="invoice_type" value={form.invoice_type} onChange={handleChange}>
            <option>All</option>
            <option>Cash</option>
            <option>Credit</option>
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label">Invoice No</label>
          <input type="text" className="form-control bg-light"  name="invoice_no" value={form.invoice_no}  onChange={handleChange}/>
        </div>

        <div className="col-md-6">
          <label className="form-label">Payment Mode</label>
          <select className="form-select bg-light" name="payment_mode" value={form.payment_mode} onChange={handleChange}  >
            <option>-- Select Payment Mode --</option>
            <option>Cash</option>
            <option>Card</option>
            <option>UPI</option>
            <option>Credit</option>
          </select>
        </div>

        <div className="col-12">
          <button type="submit" className="btn btn-primary px-4 d-flex align-center justify-center">
            <span className="text-warning me-2 d-flex align-items-center"><FaRegSave />
            </span>Save </button>
        </div>
      </form><br />
      <div className=" card shadow-sm">
        <div className="card-body">
          <h5 className="mb-3">SalesReport Tree</h5>
          <div className="mt-4 mb-2 input-group">
            <input type="text" className="form-control" placeholder="Search Customer name" value={search} onChange={(e) => setSearch(e.target.value)} />
            <span className="input-group-text"><FaSearch /></span>
          </div>
          <table className="table table-bordered table-striped mt-4">
            <thead className="table-dark">
              <tr>
                <th className="fw-bold">From Date</th>
                <th className="fw-bold">To Date</th>
                <th className="fw-bold">Customer</th>

                <th className="fw-bold">Invoice Type</th>
                <th className="fw-bold">Actions</th>


              </tr>
            </thead>
            <tbody>
  {filteredreports.length === 0 ? (
    <tr>
      <td colSpan="11" className="text-center">
        No reports found.
      </td>
    </tr>
  ) : (
    filteredreports.map((s) => (
      <tr key={s._id}>
        <td>{s.from_date ? new Date(s.from_date).toISOString().split('T')[0] : "-"}</td>
<td>{s.to_date ? new Date(s.to_date).toISOString().split('T')[0] : "-"}</td>
        
        <td>{s.customer_id && typeof s.customer_id === "object" ? s.customer_id.name : s.customer_id}</td>
        <td>{s.invoice_type}</td>
        <td>
          {["super_admin"].includes(role) ? (
          <button
            className="btn btn-danger btn-sm  px-4 d-flex align-items-center justify-content-center"
            onClick={() => handleDelete(s._id)}
          >
            <span className="text-warning me-2 d-flex align-items-center">
              <MdDeleteForever />
            </span>
            Delete
          </button>) : (
             <button className="btn btn-secondary btn-sm" disabled>
                                                        View Only
                                                    </button>
          )}
        </td>
      </tr>
    ))
  )}
</tbody>

          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesReport;