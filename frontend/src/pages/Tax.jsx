import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addtax, deletetax, fetchtaxes, updatetax } from "../redux/taxSlice";
import { setAuthToken } from "../services/userService";
import HistoryModal from "../components/HistoryModal";
import ReusableTable, {
  createCustomRoleActions,
} from "../components/ReusableTable"; // Import the reusable table
import API from "../api/axiosInstance";
const Tax = () => {
  const dispatch = useDispatch();
  const { items: taxes, status } = useSelector((state) => state.taxes);
  const [searchTaxname, setSearchTaxname] = useState("");
  const [searchcgst, setSearchcgst] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role || "user";

  const [showTaxForm, setShowTaxForm] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyInfo, setHistoryInfo] = useState(null);
  const [form, setForm] = useState({
    name: "",
    cgst_percent: "",
    sgst_percent: "",
    igst_percent: "",
    cess_percent: "",
    is_inclusive: false,
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.token) console.error("No user found Please Login");
    const token = user.token;
    setAuthToken(token);
    dispatch(fetchtaxes());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTax) {
        await dispatch(
          updatetax({ id: editingTax, updatedData: form })
        ).unwrap();
        setEditingTax(null);
        console.log("Tax Updated Successfully");
      } else {
        await dispatch(addtax(form)).unwrap();
        console.log("Tax added Successfully");
      }

      setForm({
        name: "",
        cgst_percent: "",
        sgst_percent: "",
        igst_percent: "",
        cess_percent: "",
        is_inclusive: false,
      });
      setShowTaxForm(false);
      dispatch(fetchtaxes());
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  const filteredtaxes = taxes.filter((t) => {
    const name = t.name?.toLowerCase() || "";
    const cgst_percent = String(t.cgst_percent || "").toLowerCase();
    const matchName =
      searchTaxname.trim() === "" || name.includes(searchTaxname.toLowerCase());
    const matchcgst =
      searchcgst.trim() === "" ||
      cgst_percent.includes(searchcgst.toLowerCase());
    return matchName && matchcgst;
  });

  const handleDelete = async (id) => {
    dispatch(deletetax(id));
  };

  const [editingTax, setEditingTax] = useState(null);

  const handleEdit = (tax) => {
    setEditingTax(tax._id);
    setForm({
      name: tax.name || "",
      cgst_percent: tax.cgst_percent || "",
      sgst_percent: tax.sgst_percent || "",
      igst_percent: tax.igst_percent || "",
      cess_percent: tax.cess_percent || "",
      is_inclusive: tax.is_inclusive || false,
    });
    setShowTaxForm(true);
  };

  const handleCloseForm = () => {
    setShowTaxForm(false);
    setEditingTax(null);
    setForm({
      name: "",
      cgst_percent: "",
      sgst_percent: "",
      igst_percent: "",
      cess_percent: "",
      is_inclusive: false,
    });
  };

  const tableColumns = [
    {
      key: "name",
      header: "Tax Name/Value",
      headerStyle: { width: "150px" },
    },
    {
      key: "cgst_percent",
      header: "CGST",
      headerStyle: { width: "100px" },
      render: (tax) => `${tax.cgst_percent}%`,
    },
    {
      key: "sgst_percent",
      header: "SGST",
      headerStyle: { width: "100px" },
      render: (tax) => `${tax.sgst_percent}%`,
    },
    {
      key: "igst_percent",
      header: "IGST",
      headerStyle: { width: "100px" },
      render: (tax) => `${tax.igst_percent}%`,
    },
    {
      key: "cess_percent",
      header: "CESS",
      headerStyle: { width: "100px" },
      render: (tax) => (tax.cess_percent ? `${tax.cess_percent}%` : "-"),
    },
    {
      key: "is_inclusive",
      header: "Inclusive Tax",
      headerStyle: { width: "120px" },
      render: (tax) => (
        <span
          className={tax.is_inclusive ? "text-success fw-bold" : "text-danger"}
        >
          {tax.is_inclusive ? "Yes" : "No"}
        </span>
      ),
    },
  ];

  const tableActions = createCustomRoleActions({
    edit: {
      show: () => ["super_admin", "admin"].includes(role),
    },
    delete: {
      show: () => ["super_admin", "admin"].includes(role),
    },
    history: {
      show: () => ["super_admin", "admin", "user"].includes(role),
    },
  });

  const handleTableAction = (actionType, tax) => {
    if (actionType === "edit") {
      handleEdit(tax);
    } else if (actionType === "delete") {
      handleDelete(tax._id);
    } else if (actionType === "history") {
      handleHistory(tax);
    }
  };

  const handleHistory = async (tax) => {
    if (!tax._id) {
      console.error("Tax Id missing:", tax);
      setHistoryInfo({
        createdBy:
          tax?.created_by?.name ||
          tax?.created_by?.username ||
          tax?.created_by?.email ||
          "Unknown",
        createdAt: tax?.createdAt || null,
        updatedBy: "-",
        updatedAt: null,
      });
      setShowHistoryModal(true);
      return;
    }
    try {
      const res = await API.get(`/taxes/${tax._id}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      const t = res.data;
      const createdByUser =
        t?.created_by?.name ||
        t?.created_by?.username ||
        t?.created_by?.email ||
        "Unknown";
      const updatedByUser =
        t?.updated_by?.name ||
        t?.updated_by?.username ||
        t?.updated_by?.email ||
        "-";
      setHistoryInfo({
        createdBy: createdByUser,
        createdAt: t?.createdAt || tax?.createdAt || null,
        updatedBy: updatedByUser,
        updatedAt: t?.updatedAt || null,
        oldValues: t?.history?.oldValue || null,
        newValues: t?.history?.newValue || null,
      });
    } catch (err) {
      console.warn(`Failed to fetch tax history ${tax._id}`);
      setHistoryInfo({
        createdBy:
          tax?.created_by?.name ||
          tax?.created_by?.username ||
          tax?.created_by?.email ||
          "Unknown",
        createdAt: tax?.createdAt || null,
        updatedBy:
          tax?.updated_by?.name ||
          tax?.updated_by?.username ||
          tax?.updated_by?.email ||
          "-",
        updatedAt: tax?.updatedAt || null,
        oldValues: null,
        newValues: tax,
      });
    } finally {
      setShowHistoryModal(true);
    }
  };
  return (
    <div className="container mt-4">
      <h2 className="mb-4 d-flex align-items-center fs-3">
        <b>Taxes</b>
      </h2>

      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex gap-2">
            {["super_admin", "admin"].includes(role) && (
              <button
                className="btn add text-white d-flex align-items-center"
                onClick={() => setShowTaxForm(true)}
              >
                Add Tax
              </button>
            )}
          </div>
        </div>
      </div>

      {showTaxForm && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div
                className="modal-header  text-white"
                style={{ backgroundColor: "#182235" }}
              >
                <h5 className="modal-title">
                  {editingTax ? "Edit Tax" : "Add New Tax"}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={handleCloseForm}
                ></button>
              </div>
              <div className="modal-body">
                <form className="row g-3" onSubmit={handleSubmit}>
                  <div className="col-md-6">
                    <label className="form-label">Tax Name</label>
                    <input
                      type="text"
                      className="form-control bg-light"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="e.g, GST 18%"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">CGST %</label>
                    <input
                      type="number"
                      className="form-control bg-light"
                      name="cgst_percent"
                      value={form.cgst_percent}
                      onChange={handleChange}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">SGST %</label>
                    <input
                      type="number"
                      className="form-control bg-light"
                      name="sgst_percent"
                      value={form.sgst_percent}
                      onChange={handleChange}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">IGST %</label>
                    <input
                      type="number"
                      name="igst_percent"
                      value={form.igst_percent}
                      onChange={handleChange}
                      className="form-control bg-light"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">CESS % (Optional)</label>
                    <input
                      type="number"
                      className="form-control bg-light"
                      name="cess_percent"
                      value={form.cess_percent}
                      onChange={handleChange}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="col-md-6 form-check d-flex align-items-center">
                    <input
                      type="checkbox"
                      className="form-check-input me-2"
                      name="is_inclusive"
                      checked={form.is_inclusive}
                      onChange={handleChange}
                    />
                    <label className="form-check-label">Inclusive Tax</label>
                  </div>
                  <div className="col-12 d-flex gap-2">
                    <button
                      type="submit"
                      className="btn add text-white px-4 d-flex align-items-center justify-content-center"
                    >
                      {editingTax ? "Update Tax" : "Add Tax"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary px-4 d-flex align-items-center justify-content-center"
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
        data={filteredtaxes}
        columns={tableColumns}
        loading={status === "loading"}
        searchable={true}
        searchTerm1={searchTaxname}
        searchTerm2={searchcgst}
        onSearchChange1={setSearchTaxname}
        onSearchChange2={setSearchcgst}
        searchPlaceholder1="Search by Tax Name"
        searchPlaceholder2="Search by CGST"
        showThirdSearch={false}
        actions={tableActions}
        onActionClick={handleTableAction}
        emptyMessage="No taxes found."
        className="mt-4"
        onResetSearch={() => {
          setSearchTaxname("");
          setSearchcgst("");
        }}
      />
      <HistoryModal
        open={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        data={historyInfo}
      />
    </div>
  );
};

export default Tax;
