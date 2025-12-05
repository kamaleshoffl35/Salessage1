import { useState, useEffect } from "react";
import { MdDelete,} from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { fetchwarehouses } from "../redux/warehouseSlice";
import { fetchProducts } from "../redux/productSlice";
import { addstock, deletestock, fetchstocks, updateStock } from "../redux/stockadjSlice";
import { setAuthToken } from "../services/userService";
import ReusableTable, {createCustomRoleActions,} from '../components/ReusableTable';
import API from "../api/axiosInstance";
import HistoryModal from "../components/HistoryModal";

const StockAdjustment = () => {
  const dispatch = useDispatch();
  const { items: stocks, status } = useSelector((state) => state.stocks);
  const { items: warehouses } = useSelector((state) => state.warehouses);
  const { items: products } = useSelector((state) => state.products);
const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role || "user";
 const [form, setForm] = useState({
    warehouse_id: "",
    reason: "",
    date: new Date().toISOString().slice(0, 16),
    notes: "",
    items: [{ product_id: "", batch: "", qty: "", remarks: "" }],
  });
const [showModal, setShowModal] = useState(false);
  const [editingStockAdjustment, setEditingStockAdjustment] = useState(null);
 const [searchName,setSearchName]=useState("")
 const [searchdate,setSearchDate]=useState("")
 const [searchreason,setSearchreason]=useState("")
 const [showHistoryModal,setShowHistoryModal]=useState(false)
 const [historyInfo,setHistoryInfo]=useState(null)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.token) console.error("No user found. Please Login");
    const token = user?.token;
    setAuthToken(token);
    dispatch(fetchwarehouses());
    dispatch(fetchProducts());
    dispatch(fetchstocks());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const items = [...form.items];
    items[index][name] = value;
    setForm({ ...form, items });
  };

  const addItem = () => {
    setForm({
      ...form,
      items: [
        ...form.items,
        { product_id: "", batch: "", qty: "", remarks: "" },
      ],
    });
  };

  const removeItem = (index) => {
    if (form.items.length === 1) {
      alert("At least one item is required.");
      return;
    }
    const items = [...form.items];
    items.splice(index, 1);
    setForm({ ...form, items });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStockAdjustment) {
        await dispatch(
          updateStock({ id: editingStockAdjustment, updatedData: form })
        ).unwrap();
        console.log("Stock Adjustment Updated Successfully");
      } else {
        await dispatch(addstock(form)).unwrap();
        console.log("Stock Adjustment Added Successfully");
      }
      setShowModal(false);
      setEditingStockAdjustment(null);
      setForm({
        warehouse_id: "",
        reason: "",
        date: new Date().toISOString().slice(0, 16),
        notes: "",
        items: [{ product_id: "", batch: "", qty: "", remarks: "" }],
      });
      dispatch(fetchstocks());
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  const handleEdit = (stockadjustment) => {
    setEditingStockAdjustment(stockadjustment._id);
    setForm({
      warehouse_id: stockadjustment.warehouse_id || "",
      reason: stockadjustment.reason || "",
      date:
        stockadjustment.date || new Date().toISOString().slice(0, 16),
      notes: stockadjustment.notes || "",
      items:
        stockadjustment.items?.length > 0
          ? stockadjustment.items.map((i) => ({
              product_id: i.product_id || "",
              batch: i.batch || "",
              qty: i.qty || "",
              remarks: i.remarks || "",
            }))
          : [{ product_id: "", batch: "", qty: "", remarks: "" }],
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    dispatch(deletestock(id));
  };

  const filteredstocks = stocks.filter((s) => {
  let name = "";
if (typeof s.warehouse_id === "string") {
  name = s.warehouse_id.toLowerCase();
} else if (typeof s.warehouse_id === "object" && s.warehouse_id !== null) {
  name = (s.warehouse_id.store_name || "").toLowerCase();
}

    const Date = String(s.date || "").toLowerCase()
    const reason = s.reason?.toLowerCase() || ""
    const matchname=searchName.trim() === "" || name.includes(searchName.toLowerCase())
    const matchdate=searchdate.trim() === "" || Date.includes(searchdate.toLowerCase())
    const matchreason=searchreason.trim() === "" || reason.includes(searchreason.toLowerCase()) 
  return matchname && matchdate && matchreason
    
  });

  const getWarehouseName = (stock) => {
    if (typeof stock.warehouse_id === "object" && stock.warehouse_id !== null) {
      return stock.warehouse_id?.store_name || "Unknown Warehouse";
    }
    return warehouses.find((w) => w._id === stock.warehouse_id)?.store_name || "Unknown Warehouse";
  };

  const getProductDetails = (stock) => {
    if (!Array.isArray(stock.items) || stock.items.length === 0) {
      return "No Items";
    }

    return stock.items.map((item, idx) => {
      let productName = "Unknown Product";
      if (item?.product_id) {
        if (typeof item.product_id === "object" && item.product_id !== null) {
          productName = item.product_id?.name || "Unknown Product";
        } else {
          const matchedProduct = products.find((prod) => prod._id === item.product_id);
          productName = matchedProduct?.name || "Unknown Product";
        }
      }
      return `${productName} - Qty: ${item.qty}${item.batch ? ` (Batch: ${item.batch})` : ''}`;
    }).join("; ");
  };

  const tableColumns = [
    {
      key: "warehouse",
      header: "Warehouse",
      headerStyle: { width: "150px" },
      render: (stock) => getWarehouseName(stock)
    },
    {
      key: "reason",
      header: "Reason",
      headerStyle: { width: "120px" },
      render: (stock) => stock.reason || "N/A"
    },
    {
      key: "date",
      header: "Date",
      headerStyle: { width: "160px" },
      render: (stock) => stock.date ? new Date(stock.date).toLocaleString() : "N/A"
    },
    {
      key: "notes",
      header: "Notes",
      headerStyle: { width: "150px" },
      render: (stock) => stock.notes || "-"
    },
    {
      key: "items",
      header: "Items",
      headerStyle: { width: "250px" },
      render: (stock) => getProductDetails(stock)
    }
  ];
 const tableActions = createCustomRoleActions({
    edit: { 
      show: () => ["super_admin", "admin",].includes(role) 
    },
    delete: { 
      show: () => ["super_admin", "admin"].includes(role) 
    },
    history:{
      show:()=>["super_admin","admin","user"].includes(role)
    }
  })
 
    const handleTableAction = (actionType, stockadj) => {
      if (actionType === "edit") {
        handleEdit(stockadj);
      } else if (actionType === "delete") {
        handleDelete(stockadj._id);
      }else if(actionType === "history"){
        handleHistory(stockadj)
      }
    };
 

    const handleHistory=async (stockadj) => {
      if(!stockadj._id){
        console.error("StockAdj id Missing",stockadj)
        setHistoryInfo({
          createdBy:stockadj?.created_by?.name || stockadj?.created_by?.username || stockadj?.created_by?.email || "Unknown",
          createdAt:stockadj?.createdAt || null,
          updatedBy:"-",
          updatedAt:null,
        })
      }
      try{
        const res=await API.get(`/stocks/${stockadj._id}`,{
          headers:{Authorization:`Bearer ${user?.token}`}
        })
        const s = res.data
        const createdByUser=s?.created_by?.name || s?.created_by?.username || s?.created_by?.email || "Unknown"
        const updatedByUser=s?.updated_by?.name || s?.updated_by?.username || s?.updated_by?.email || "-"
        setHistoryInfo({
          createdBy:createdByUser,
          createdAt:s?.createdAt || stockadj?.createdAt || null,
          updatedBy:updatedByUser,
          updatedAt:s?.updatedAt || stockadj?.updatedAt || null,
          oldValue:s?.history?.oldValue || null,
          newValue:s?.history?.newValue || null,
        })
      }
      catch(err){
        console.warn(`Failed to fetch stock history ${stockadj._id}`)
        setHistoryInfo({
          createdBy:stockadj?.created_by?.name || stockadj?.created_by?.username || stockadj?.created_by?.email || "Unknown",
          createdAt:stockadj?.createdAt || null,
          updatedBy:stockadj?.updated_by?.username || stockadj?.updated_by?.email || stockadj?.updated_by?.name || "-",
          updatedAt:stockadj?.updatedAt || null,
          oldValue:null,
          newValue:stockadj,
        })
      }
      finally{
        setShowHistoryModal(true)
      }
    }
  return (
    <div className="container mt-4">
      <h2 className="mb-4 d-flex align-items-center fs-3">
        
        <b>Stock Adjustment</b>
      </h2>

      <div className="row mb-4">
        <div className="col-12">
          {["super_admin", "admin"].includes(role) && (
            <button
              className="btn add text-white d-flex align-items-center" 
              onClick={() => {
                setEditingStockAdjustment(null);
                setForm({
                  warehouse_id: "",
                  reason: "",
                  date: new Date().toISOString().slice(0, 16),
                  notes: "",
                  items: [{ product_id: "", batch: "", qty: "", remarks: "" }],
                });
                setShowModal(true);
              }}
            >
   
              Add Stock Adjustment
            </button>
          )}
        </div>
      </div>

     
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header  text-white">
                <h5 className="modal-title">
                  {editingStockAdjustment ? "Edit Stock Adjustment" : "Add Stock Adjustment"}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                >
                 
                </button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label">
                        Warehouse <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select bg-light"
                        name="warehouse_id"
                        value={form.warehouse_id}
                        onChange={handleChange}
                        required
                      >
                        <option value="">-- Select --</option>
                        {warehouses.map((w) => (
                          <option key={w._id} value={w._id}>
                            {w.store_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">
                        Reason <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select bg-light"
                        name="reason"
                        value={form.reason}
                        onChange={handleChange}
                        required
                      >
                        <option value="">-- Select --</option>
                        <option value="Damage">Damage</option>
                        <option value="Count Diff">Count Diff</option>
                        <option value="Write-off">Write-off</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">
                        Date <span className="text-danger">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        className="form-control bg-light"
                        name="date"
                        value={form.date}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Notes</label>
                      <input
                        type="text"
                        className="form-control bg-light"
                        name="notes"
                        value={form.notes}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <table className="table table-bordered align-middle">
                    <thead className="table-dark">
                      <tr>
                        <th>Product *</th>
                        <th>Batch No</th>
                        <th>Qty Change *</th>
                        <th>Remarks</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.items.map((item, index) => (
                        <tr key={index}>
                          <td>
                            <select
                              name="product_id"
                              value={item.product_id}
                              className="form-select"
                              onChange={(e) => handleItemChange(index, e)}
                              required
                            >
                              <option value="">Select Product</option>
                              {products.map((p) => (
                                <option key={p._id} value={p._id}>
                                  {p.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <input
                              type="number"
                              name="batch"
                              value={item.batch}
                              className="form-control"
                              placeholder="Batch No"
                              onChange={(e) => handleItemChange(index, e)}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              name="qty"
                              value={item.qty}
                              className="form-control"
                              placeholder="± Qty"
                              onChange={(e) => handleItemChange(index, e)}
                              required
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              name="remarks"
                              value={item.remarks}
                              className="form-control"
                              placeholder="Remarks"
                              onChange={(e) => handleItemChange(index, e)}
                            />
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn text-danger btn-sm"
                              onClick={() => removeItem(index)}
                            >
                              <MdDelete />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button
                    type="button"
                    className="btn add text-white mb-3"
                    onClick={addItem}
                  >
                    Add Row
                  </button>

                  <div className="d-flex justify-content-end gap-2">
                    <button
                      type="button"
                      className="btn btn-secondary d-flex align-items-center"
                      onClick={() => setShowModal(false)}
                    >
             
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn add text-white d-flex align-items-center"
                    >
                     
                      {editingStockAdjustment ? "Update Adjustment" : "Save Adjustment"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

     
      <ReusableTable
        data={filteredstocks}
        columns={tableColumns}
        loading={status === "loading"}
        searchable={true}
        searchTerm1={searchName}
        searchTerm2={searchdate}
        searchTerm3={searchreason}
        onSearchChange1={setSearchName}
        onSearchChange2={setSearchDate}
        onSearchChange3={setSearchreason}
        searchPlaceholder1="Search by Name"
        searchPlaceholder2="Search by Date"
        searchPlaceholder3="Search by Reason"
        showThirdSearch={true}
        actions={tableActions}
        onActionClick={handleTableAction}
        emptyMessage="No stock adjustments found."
        className="mt-4"
        onResetSearch={()=>{
          setSearchName("")
          setSearchDate("")
          setSearchreason("")
        }}
      />
      <HistoryModal open={showHistoryModal} onClose={()=>setShowHistoryModal(false)} data={historyInfo}/>
    </div>
  );
};

export default StockAdjustment;