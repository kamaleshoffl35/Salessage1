import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUnits,
  addUnit,
  deleteUnit,
  updateUnit,
} from "../redux/unitSlice";
import ReusableTable from "../components/ReusableTable";
import AddButton from "../components/AddButton";
import HistoryModal from "../components/HistoryModal";
import API from "../api/axiosInstance";
import useTableActions from "../components/useTableActions";
import { useNavigate } from "react-router-dom";
import { getMe } from "../services/userService";

const UnitMaster = () => {
  const dispatch = useDispatch();
  const { items: units, status } = useSelector((state) => state.units);

  const [form, setForm] = useState({
    unit_name: "",
    unit_symbol: "",
  });

  const [searchName, setSearchName] = useState("");
  const [searchSymbol, setSearchSymbol] = useState("");

  const [showUnitForm, setShowUnitForm] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyInfo, setHistoryInfo] = useState(null);

  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const role = user?.role || "user";

  const tableActions = useTableActions(role);

  useEffect(() => {
    getMe()
      .then((u) => setUser(u))
      .catch(() => navigate("/login"));

    dispatch(fetchUnits());
  }, [dispatch, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingUnit) {
        await dispatch(
          updateUnit({ id: editingUnit, updatedData: form })
        ).unwrap();
        setEditingUnit(null);
      } else {
        await dispatch(addUnit(form)).unwrap();
      }

      setForm({
        unit_name: "",
        unit_symbol: "",
      });

      setShowUnitForm(false);
      dispatch(fetchUnits());
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = (id) => {
    dispatch(deleteUnit(id));
  };

  const handleEdit = (unit) => {
    setEditingUnit(unit._id);

    setForm({
      unit_name: unit.unit_name,
      unit_symbol: unit.unit_symbol,
    });

    setShowUnitForm(true);
  };

  const handleCloseForm = () => {
    setShowUnitForm(false);
    setEditingUnit(null);

    setForm({
      unit_name: "",
      unit_symbol: "",
    });
  };

  const filteredUnits = units.filter((u) => {
    const name = u.unit_name?.toLowerCase() || "";
    const symbol = u.unit_symbol?.toLowerCase() || "";

    return (
      (searchName === "" || name.includes(searchName.toLowerCase())) &&
      (searchSymbol === "" || symbol.includes(searchSymbol.toLowerCase()))
    );
  });

  const tableColumns = [
    {
      key: "unit_name",
      header: "Unit Name",
      headerStyle: { width: "200px" },
    },
    {
      key: "unit_symbol",
      header: "Unit Symbol",
      headerStyle: { width: "150px" },
    },
  ];

 const handleTableAction = (actionType, unit) => {
  if (actionType === "edit") handleEdit(unit);

  if (actionType === "delete") handleDelete(unit._id);

  if (actionType === "history") {
    setHistoryInfo({
      createdBy: unit.created_by?.name || "Admin",
      createdAt: unit.createdAt,
      updatedBy: unit.updated_by?.name || "-",
      updatedAt: unit.updatedAt,
    });

    setShowHistoryModal(true);
  }
};
  return (
    <div className="container mt-4">
      <h2 className="mb-4 fs-3">
        <b>Unit Master</b>
      </h2>

 <div className="mb-3">
  <AddButton text="Add Unit" onClick={() => setShowUnitForm(true)} />
</div>

      {showUnitForm && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-md modal-dialog-centered">
            <div className="modal-content">

              <div className="modal-header text-white">
                <h5 className="modal-title">
                  {editingUnit ? "Edit Unit" : "Add Unit"}
                </h5>

                <button
                  className="btn-close btn-close-white"
                  onClick={handleCloseForm}
                ></button>
              </div>

              <div className="modal-body">
                <form onSubmit={handleSubmit} className="row g-3">

                  <div className="col-md-12">
                    <label className="form-label">
                      Unit Name <span className="text-danger">*</span>
                    </label>

                    <input
                      type="text"
                      className="form-control bg-light"
                      name="unit_name"
                      value={form.unit_name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-12">
                    <label className="form-label">
                      Unit Symbol <span className="text-danger">*</span>
                    </label>

                    <input
                      type="text"
                      className="form-control bg-light"
                      name="unit_symbol"
                      value={form.unit_symbol}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-12 d-flex gap-2">

                    <button className="btn add text-white px-4">
                      {editingUnit ? "Update" : "Add"}
                    </button>

                    <button
                      type="button"
                      className="btn btn-secondary px-4"
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
        data={filteredUnits}
        columns={tableColumns}
        loading={status === "loading"}
        searchable={true}
        searchTerm1={searchName}
        searchTerm2={searchSymbol}
        onSearchChange1={setSearchName}
        onSearchChange2={setSearchSymbol}
        searchPlaceholder1="Search Unit Name"
        searchPlaceholder2="Search Symbol"
        actions={tableActions}
        onActionClick={handleTableAction}
        className="mt-4"
        onResetSearch={() => {
          setSearchName("");
          setSearchSymbol("");
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

export default UnitMaster;