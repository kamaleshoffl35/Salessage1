import "bootstrap/dist/css/bootstrap.min.css";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../redux/productSlice";
import { fetchwarehouses } from "../redux/warehouseSlice";
import { addstock, deletestock, fetchstocks } from "../redux/stockledgerSlice";
import { setAuthToken } from "../services/userService";
import ReusableTable, {createCustomRoleActions,} from "../components/ReusableTable";
import API from "../api/axiosInstance";
import HistoryModal from "../components/HistoryModal";
import { fetchSalesReturns } from "../redux/salesReturnSlice";
const StockLedger = () => {
  const dispatch = useDispatch();
  const { items: stocks, status } = useSelector((state) => state.stockss);
  const { items: products } = useSelector((state) => state.products);
  const { items: warehouses } = useSelector((state) => state.warehouses);
  const {items: salesReturn}=useSelector((state)=>state.salesReturn)
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role || "user";
  const token = user?.token;

  const [form, setForm] = useState({
    productId: "",
    warehouseId: "",
    inQty: "",
  });

  const [editingStockLedger, setEditingStockLedger] = useState(null);
  const [searchproduct, setSearchproduct] = useState("");
  const [searchWarehouse, setSearchWarehouse] = useState("");
  const [searchType, setSearchType] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyInfo, setHistoryInfo] = useState(null);
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.token) console.error("No user found. Please login.");
    setAuthToken(token);
    dispatch(fetchProducts());
    dispatch(fetchwarehouses());
    dispatch(fetchstocks());
  }, [dispatch, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      if (["inQty", "outQty","quantity"].includes(name)) {
        updated.balanceQty =
          Number(updated.oldQty || 0) + Number(updated.inQty || 0);
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.productId) {
      alert("Please select a product");
      return;
    }
    if (!form.warehouseId) {
      alert("Please select a warehouse");
      return;
    }
    const qty = Number(form.inQty);
    if (!qty || qty <= 0) {
      alert("In Qty must be greater than 0");
      return;
    }
    try {
      await dispatch(
        addstock({
          productId: form.productId,
          warehouseId: form.warehouseId,
          inQty: qty,
        })
      ).unwrap();
      setForm({
        productId: "",
        warehouseId: "",
        inQty: "",
      });
      setShowModal(false);
      dispatch(fetchstocks());
    } catch (err) {
      console.error("Stock add failed:", err);
    }
  };

  const handleDelete = async (id) => {
    dispatch(deletestock(id));
  };

  const handleEdit = (stock) => {
    setEditingStockLedger(stock._id);
    setForm({
      productId: stock.productId || "",
      warehouseId: stock.warehouseId || "",
      txnType: stock.txnType || "",
      txnId: stock.txnId || "",
      txnDate: stock.txnDate ? stock.txnDate.slice(0, 10) : "",
      inQty: stock.inQty || "",
      outQty: stock.outQty || 0,
      quantity: stock.quantity || 0,
            balanceQty: stock.balanceQty || "",
    });
    setShowModal(true);
  };

  const openModal = () => {
    setEditingStockLedger(null);
    setForm({
      productId: "",
      warehouseId: "",
      txnType: "",
      txnId: "",
      txnDate: "",
      inQty: "",
      balanceQty: "",
    });
    setShowModal(true);
  };

  const filteredStocks = (stocks || []).filter((s) => {
    let productname = "";
    if (typeof s.productId === "string") {
      productname = s.productId.toLowerCase();
    } else if (typeof s.productId === "object" && s.productId !== null) {
      productname = (s.productId.name || "").toLowerCase();
    }

    let warehousename = "";
    if (typeof s.warehouseId === "string") {
      warehousename = s.warehouseId.toLowerCase();
    } else if (typeof s.warehouseId === "object" && s.warehouseId !== null) {
      warehousename = (s.warehouseId.store_name || "").toLowerCase();
    }

    const type = s.txnType?.toLowerCase() || "";

    const matchwarehouse =
      searchWarehouse.trim() === "" ||
      warehousename.includes(searchWarehouse.toLowerCase());
    const matchproduct =
      searchproduct.trim() === "" ||
      productname.includes(searchproduct.toLowerCase());
    const matchtype =
      searchType.trim() === "" || type.includes(searchType.toLowerCase());

    return matchwarehouse && matchproduct && matchtype;
  });

  const getProductName = (stock) => {
    if (typeof stock.productId === "object" && stock.productId !== null) {
      return stock.productId?.name || "Unknown Product";
    }
    return (
      products.find((p) => p._id === stock.productId)?.name || "Unknown Product"
    );
  };

  const getWarehouseName = (stock) => {
    if (typeof stock.warehouseId === "object" && stock.warehouseId !== null) {
      return stock.warehouseId?.store_name || "Unknown Warehouse";
    }
    return (
      warehouses.find((w) => w._id === stock.warehouseId)?.store_name ||
      "Unknown Warehouse"
    );
  };

  useEffect(() => {
    if (!form.productId || !form.warehouseId) return;
    const lastLedger = stocks
      .filter(
        (s) =>
          String(s.productId?._id || s.productId) === String(form.productId) &&
          String(s.warehouseId?._id || s.warehouseId) ===
            String(form.warehouseId)
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
    const oldQty = lastLedger ? Number(lastLedger.balanceQty) : 0;
    const inQty = Number(form.inQty || 0);
    const lastreturnquantity = salesReturn.filter(
      (s)=>String(s.productId?._id || s.productId) === String(form.productId) &&
          String(s.warehouseId?._id || s.warehouseId) ===
            String(form.warehouseId)
    ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
    setForm((prev) => ({
      ...prev,
      oldQty,
      outQty: lastLedger ? Number(lastLedger.outQty || 0) : 0,
      quantity: lastreturnquantity ? Number(lastreturnquantity.quantity || 0) : 0,
      balanceQty: oldQty + inQty,
    }));
  }, [form.productId, form.warehouseId, form.inQty, stocks]);

  const tableColumns = [
    {
      key: "product",
      header: "Product",
      headerStyle: { width: "150px" },
      render: (stock) => getProductName(stock),
    },
    {
      key: "warehouse",
      header: "Warehouse",
      headerStyle: { width: "150px" },
      render: (stock) => getWarehouseName(stock),
    },
    {
      key: "txnType",
      header: "Type",
      headerStyle: { width: "100px" },
      render: (stock) => stock.txnType || "N/A",
    },
    {
      key: "txnId",
      header: "Transaction ID",
      headerStyle: { width: "120px" },
      render: (stock) => stock.txnId || "N/A",
    },
    {
      key: "txnDate",
      header: "Date",
      headerStyle: { width: "100px" },
      render: (stock) =>
        stock.txnDate ? new Date(stock.txnDate).toLocaleDateString() : "N/A",
    },
    {
      key: "inQty",
      header: "In Qty",
      headerStyle: { width: "80px" },
      render: (stock) => stock.inQty || "0",
    },
    {
      key: "outQty",
      header: "Out Qty",
      headerStyle: { width: "80px" },
      render: (stock) => stock.outQty || "0",
    },
{
      key: "quantity",
      header: "Return Qty",
      headerStyle: { width: "80px" },
      render: (stock) => stock.quantity || "0",
    },
    {
      key: "balanceQty",
      header: "Balance Qty",
      headerStyle: { width: "100px" },
      render: (stock) => stock.balanceQty || "0",
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

  const handleTableAction = (actionType, stock) => {
    if (actionType === "edit") {
      handleEdit(stock);
    } else if (actionType === "delete") {
      handleDelete(stock._id);
    } else if (actionType === "history") {
      handleHistory(stock);
    }
  };

  const handleHistory = async (stockledger) => {
    if (!stockledger._id) {
      console.error("Stockledger id is missing", stockledger);
      setHistoryInfo({
        createdBy:
          stockledger.created_by?.name ||
          stockledger?.created_by?.username ||
          stockledger?.created_by?.name ||
          "Unknown",
        createdAt: stockledger.createdAt || null,
        updatedBy: "-",
        updatedAt: null,
      });
    }
    try {
      const res = await API.get(`/stockledger/${stockledger._id}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      const s = res.data;
      const createdByUser =
        s?.created_by?.name ||
        s?.created_by?.username ||
        s?.created_by?.email ||
        "Unknown";
      const updatedByUser =
        s?.updated_by?.name ||
        s?.updated_by?.username ||
        s?.updated_by?.email ||
        "-";
      setHistoryInfo({
        createdBy: createdByUser,
        createdAt: s?.createdAt || stockledger?.createdAt || null,
        updatedBy: updatedByUser,
        updatedAt: s?.updatedAt || stockledger?.updatedAt || null,
        oldValue: s?.history?.oldValue || null,
        newValue: s?.history?.newValue || null,
      });
    } catch (err) {
      console.warn(`Failed to fetch stock ledger history ${stockledger._id}`);
      setHistoryInfo({
        createdBy:
          stockledger?.created_by?.name ||
          stockledger?.created_by?.username ||
          stockledger?.created_by?.email ||
          "Unknown",
        createdAt: stockledger?.createdAt || null,
        updatedBy:
          stockledger?.updated_by?.username ||
          stockledger?.updated_by?.email ||
          stockledger?.updated_by?.name ||
          "-",
        updatedAt: stockledger?.updatedAt || null,
        oldValue: null,
        newValue: stockledger,
      });
    } finally {
      setShowHistoryModal(true);
    }
  };
  return (
    <div className="container mt-4">
      <h2 className="mb-4 d-flex align-items-center fs-3">
        <b>Stock Ledger</b>
      </h2>

      <div className="row mb-4">
        <div className="col-12">
          {["super_admin"].includes(role) && (
            <button
              className="btn add text-white d-flex align-items-center"
              onClick={openModal}
            >
              Add Ledger
            </button>
          )}
        </div>
      </div>

      <div
        className={`modal fade ${showModal ? "show d-block" : ""}`}
        style={{
          backgroundColor: showModal ? "rgba(0,0,0,0.5)" : "transparent",
        }}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header  text-white">
              <h5 className="modal-title">
                {editingStockLedger ? "Edit Stock Ledger" : "Add Stock Ledger"}
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={() => setShowModal(false)}
              ></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">
                      Product <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select bg-light"
                      name="productId"
                      value={form.productId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">-- Select Product --</option>
                      {products.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">
                      Warehouse <span className="text-danger">*</span>
                    </label>
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
                    <label className="form-label">
                      Type <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select bg-light"
                      name="txnType"
                      value={form.txnType}
                      onChange={handleChange}
                      required
                    >
                      <option value="">-- Select Type --</option>
                      <option value="SALE">SALE</option>
                      <option value="PURCHASE">PURCHASE</option>
                      <option value="ADJUSTMENT">ADJUSTMENT</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">In Qty</label>
                    <input
                      type="number"
                      className="form-control bg-light"
                      name="inQty"
                      value={form.inQty}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Out Qty</label>
                    <input
                      type="number"
                      className="form-control bg-light"
                      value={form.outQty}
                      readOnly
                    />
                  </div>

                    <div className="col-md-6">
                    <label className="form-label">Return Qty</label>
                    <input
                      type="number"
                      className="form-control bg-light"
                      value={form.quantity}
                      readOnly
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Old Qty</label>
                    <input
                      type="number"
                      className="form-control bg-light"
                      value={form.oldQty}
                      readOnly
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Balance Qty</label>
                    <input
                      type="number"
                      className="form-control bg-light"
                      value={form.balanceQty}
                      readOnly
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer mt-3 pt-3 border-top">
                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn add text-white px-4 d-flex align-items-center justify-content-center"
                  >
                    {editingStockLedger ? "Update Ledger" : "Save Ledger"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary px-4 d-flex align-items-center justify-content-center"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <ReusableTable
        data={filteredStocks}
        columns={tableColumns}
        loading={status === "loading"}
        searchable={true}
        searchTerm1={searchproduct}
        searchTerm2={searchWarehouse}
        searchTerm3={searchType}
        onSearchChange1={setSearchproduct}
        onSearchChange2={setSearchWarehouse}
        onSearchChange3={setSearchType}
        searchPlaceholder1="Search by Product"
        searchPlaceholder2="Search by Warehouse"
        searchPlaceholder3="Search by Type "
        showThirdSearch={true}
        actions={tableActions}
        onActionClick={handleTableAction}
        emptyMessage="No stock ledger records found."
        className="mt-4"
        onResetSearch={() => {
          setSearchproduct("");
          setSearchWarehouse("");
          setSearchType("");
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

export default StockLedger;
