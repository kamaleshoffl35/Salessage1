import { useEffect, useState } from "react";
import { FaRegSave } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { FaSearch } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { fetchcustomers } from "../../redux/customerSlice";
import { fetchsuppliers } from "../../redux/supplierSlice";
import {
  addgstreport,
  deletegstreport,
  fetchgstreports,
} from "../../redux/gstreportSlice";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExportButtons from "../../components/ExportButtons";
const GstReport = () => {
  const dispatch = useDispatch();
  const { items: gstreports, status } = useSelector(
    (state) => state.gstreports
  );
  const { items: customers } = useSelector((state) => state.customers);
  const { items: suppliers } = useSelector((state) => state.suppliers);
  const [form, setForm] = useState({
    report_type: "",
    from_date: "",
    to_date: "",
    customer_id: "",
    supplier_id: "",
    hsn: "",
    state: "",
  });
  useEffect(() => {
    dispatch(fetchcustomers());
    dispatch(fetchsuppliers());
    dispatch(fetchgstreports());
  }, []);
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "customer_id" && form.report_type === "Sales") {
      const selectedCustomer = customers.find((c) => c._id === value);
      setForm({
        ...form,
        customer_id: value,
        supplier_id: "",
        state: selectedCustomer ? selectedCustomer.state_code : "",
      });
    } else if (name === "supplier_id" && form.report_type === "Purchase") {
      const selectedSupplier = suppliers.find((s) => s._id === value);
      setForm({
        ...form,
        supplier_id: value,
        customer_id: "",
        state: selectedSupplier ? selectedSupplier.state_code : "",
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (!payload.customer_id) delete payload.customer_id;
      if (!payload.supplier_id) delete payload.supplier_id;
      dispatch(addgstreport(payload));
      setForm({
        report_type: "",
        from_date: "",
        to_date: "",
        customer_id: "",
        supplier_id: "",
        hsn: "",
        state: "",
      });
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };
  const isSales = form.report_type === "Sales";
  const dropdownLabel = isSales ? "Customer" : "Supplier";
  const dropdownData = isSales ? customers : suppliers;
  const [search, setSearch] = useState("");
  const filteredreports = gstreports.filter((s) => {
    const supplierName = s.supplier_id?.name || s.supplier_id?.toString() || "";
    const customerName = s.customer_id?.name || s.customer_id?.toString() || "";
    return (
      s.report_type.toLowerCase().includes(search.toLowerCase()) ||
      supplierName.toLowerCase().includes(search.toLowerCase()) ||
      customerName.toLowerCase().includes(search.toLowerCase()) ||
      s.from_date.toString().toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleDelete = async (id) => {
    dispatch(deletegstreport(id));
  };

  const handleExportExcel = () => {
    const data = filteredreports.map((r) => ({
      "Report Type": r.report_type,
      "From Date": r.from_date
        ? new Date(r.from_date).toISOString().split("T")[0]
        : "-",
      "To Date": r.to_date
        ? new Date(r.to_date).toISOString().split("T")[0]
        : "-",
      Supplier: r.supplier_id?.name || r.supplier_id,
      Customer: r.customer_id?.name || r.customer_id,
      HSN: r.hsn,
      State: r.state,
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "GSTReport");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    saveAs(
      new Blob([excelBuffer], { type: "application/octet-stream" }),
      "GSTReport.xlsx"
    );
  };
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Sales Report", 14, 15);
    const tableData = filteredreports.map((r) => [
      r.report_type,
      r.from_date ? new Date(r.from_date).toISOString().split("T")[0] : "-",
      r.to_date ? new Date(r.to_date).toISOString().split("T")[0] : "-",
      r.supplier_id?.name || r.supplier_id,
      r.customer_id?.name || r.customer_id,
      r.hsn,
      r.state,
    ]);

    autoTable(doc, {
      startY: 20,
      head: [
        [
          "Report Type",
          "From Date",
          "To Date",
          "Supplier",
          "Customer",
          "HSN",
          "State",
        ],
      ],
      body: tableData,
    });

    doc.save("GSTReport.pdf");
  };
  const handlePrint = () => {
    window.print();
  };
  return (
    <div className="container mt-4 bg-gradient-warning">
      <ExportButtons
        onExcel={handleExportExcel}
        onPdf={handleExportPDF}
        onPrint={handlePrint}
      />

      <form className="row g-3" onSubmit={handleSubmit}>
        <div className="col-md-6">
          <label className="form-label">Report Type</label>
          <select
            className="form-control bg-light"
            name="report_type"
            value={form.report_type}
            onChange={handleChange}
          >
            <option value="">Select Type</option>
            <option value="Sales">Sales</option>
            <option value="Purchase">Purchase</option>
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label">From Date</label>
          <input
            type="date"
            className="form-control bg-light"
            name="from_date"
            value={form.from_date}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">To Date</label>
          <input
            type="date"
            className="form-control bg-light"
            name="to_date"
            value={form.to_date}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">{dropdownLabel}</label>
          <select
            className="form-select bg-light"
            name={isSales ? "customer_id" : "supplier_id"}
            value={isSales ? form.customer_id : form.supplier_id}
            onChange={handleChange}
          >
            <option value="">{dropdownLabel}</option>
            {dropdownData.map((item) => (
              <option key={item._id} value={item._id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label">HSN</label>
          <input
            type="text"
            className="form-control bg-light"
            name="hsn"
            value={form.hsn}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">State</label>
          <input
            type="text"
            className="form-control bg-light"
            name="state"
            value={form.state}
            onChange={handleChange}
            disabled
          />
        </div>
        <div className="col-12">
          <button
            type="submit"
            className="btn btn-primary px-4 d-flex align-center justify-center"
          >
            <span className="text-warning me-2 d-flex align-items-center">
              <FaRegSave />
            </span>
            Save{" "}
          </button>
        </div>
      </form>
      <br />
      <div className=" card shadow-sm">
        <div className="card-body">
          <h5 className="mb-3">StockReport Tree</h5>
          <div className="mt-4 mb-2 input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Search Product, Warehouse name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="input-group-text">
              <FaSearch />
            </span>
          </div>
          <table className="table table-bordered table-striped mt-4">
            <thead className="table-dark">
              <tr>
                <th className="fw-bold">Report Type</th>
                <th className="fw-bold">From Date</th>
                <th className="fw-bold">To Date</th>
                <th className="fw-bold">{dropdownLabel}</th>
                <th className="fw-bold">HSN</th>
                <th className="fw-bold">State</th>
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
                filteredreports.map((g) => (
                  <tr key={g._id}>
                    <td>{g.report_type}</td>
                    <td>{new Date(g.from_date).toLocaleDateString()}</td>
                    <td>{new Date(g.to_date).toLocaleDateString()}</td>
                    <td>
                      {g.report_type === "Sales"
                        ? g.customer_id?.name
                        : g.supplier_id?.name}
                    </td>
                    <td>{g.hsn}</td>
                    <td>
                      {g.report_type === "Sales"
                        ? g.customer_id?.state_code
                        : g.supplier_id?.state_code}
                    </td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm px-4 d-flex align-items-center justify-content-center"
                        onClick={() => handleDelete(g._id)}
                      >
                        <span className="text-warning me-2 d-flex align-items-center">
                          <MdDeleteForever />
                        </span>
                        Delete
                      </button>
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

export default GstReport;
