
import React, { useEffect, useState } from "react";
import { FaRegSave } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { FaSearch } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { fetchsuppliers } from "../../redux/supplierSlice";
import { addpurchasereport, deletepurchasereport, fetchpurchasereports } from "../../redux/purchasereportSlice";
import ExportButtons from "../../components/ExportButtons";
import * as XLSX from "xlsx"
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
const PurchaseReport = () => {
  const dispatch = useDispatch()
  const { items: purchasereports, status } = useSelector((state) => state.purchasereports)
  const { items: suppliers } = useSelector((state) => state.suppliers)


  const [form, setForm] = useState({
    from_date: "",
    to_date: "",
    supplier_id: "",
  })

  useEffect(() => {
    dispatch(fetchsuppliers())

    dispatch(fetchpurchasereports())
  }, [])
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      dispatch(addpurchasereport(form))
      setForm({
        from_date: "",
        to_date: "",
        supplier_id: "",
      })
    }
    catch (err) {
      console.error(err.response?.data || err.message)
    }
  }
  const [search, setSearch] = useState("");
  const filteredreports = purchasereports.filter((p) => {
    const supplierName = p.supplier_id?.name || p.supplier_id?.toString() || "";
    return (
      supplierName.toLowerCase().includes(search.toLowerCase()) ||
      p.from_date.toString().toLowerCase().includes(search.toLowerCase())
    );
  });


  const handleDelete = async (id) => {
    dispatch(deletepurchasereport(id))
  };
  const handleExportExcel = () => {
      const data = filteredreports.map((r) => ({
        "From Date": r.from_date ? new Date(r.from_date).toISOString().split("T")[0] : "-",
        "To Date": r.to_date ? new Date(r.to_date).toISOString().split("T")[0] : "-",
        Supplier: r.supplier_id?.name || r.supplier_id,
      
      }));
  
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "PurchaseReport");
  
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), "PurchaseReport.xlsx");
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.text("Sales Report", 14, 15);
    
        const tableData = filteredreports.map((r) => [
          r.from_date ? new Date(r.from_date).toISOString().split("T")[0] : "-",
          r.to_date ? new Date(r.to_date).toISOString().split("T")[0] : "-",
        r.supplier_id?.name || r.supplier_id,
     
        ]);
    
         autoTable(doc, {
        startY: 20,
        head: [["From Date", "To Date", "Supplier", ]],
        body: tableData,
      });
    
        doc.save("PurchaseReport.pdf");
      };
    const handlePrint = () => {
    window.print();
  };


  return (
    <div className="container mt-4 bg-gradient-warning">

<ExportButtons onExcel={handleExportExcel}  onPdf={handleExportPDF} onPrint={handlePrint}/>
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
          <label className="form-label">Supplier<span className="text-danger">*</span></label>
          <select className="form-select bg-light" name="supplier_id" value={form.supplier_id} onChange={handleChange}>
            <option value="">-- Select Supplier --</option>
            {suppliers.map(s => (<option key={s._id} value={s._id}>{s.name}</option>))}
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
          <h5 className="mb-3">PurchaseReport Tree</h5>
          <div className="mt-4 mb-2 input-group">
            <input type="text" className="form-control" placeholder="Search Supplier name" value={search} onChange={(e) => setSearch(e.target.value)} />
            <span className="input-group-text"><FaSearch /></span>
          </div>
          <table className="table table-bordered table-striped mt-4">
            <thead className="table-dark">
              <tr>
                <th className="fw-bold">From Date</th>
                <th className="fw-bold">To Date</th>
                <th className="fw-bold">Supplier</th>
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
  filteredreports.map((p) => (

                  <tr key={p._id}>

                    <td>{p.from_date ? new Date(p.from_date).toISOString().split('T')[0]:"-"}</td>
                    <td>{p.to_date ? new Date(p.to_date).toISOString().split("T")[0]:"-"}</td>
                    <td>{p.supplier_id?.name || p.supplier_id || "-"}</td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm px-4 d-flex align-items-center justify-content-center"
                        onClick={() => handleDelete(p._id)}
                      >
                        <span className="text-warning me-2 d-flex align-items-center">
                          <MdDeleteForever />
                        </span>
                        Delete
                      </button>
                    </td>


                  </tr>
                )))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default PurchaseReport;