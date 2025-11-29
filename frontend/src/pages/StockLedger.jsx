

import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect } from 'react';
import { MdOutlineInventory2, MdClose, MdAdd } from 'react-icons/md';
import {  FaRegSave } from 'react-icons/fa';
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from '../redux/productSlice';
import { fetchwarehouses } from '../redux/warehouseSlice';
import { addstock, deletestock, fetchstocks, updatestock } from '../redux/stockledgerSlice';
import { setAuthToken } from '../services/userService';
import ReusableTable,{createCustomRoleActions} from '../components/ReusableTable'; 

const StockLedger = () => {
  const dispatch = useDispatch();
  const { items: stocks, status } = useSelector((state) => state.stockss);
  const { items: products } = useSelector((state) => state.products);
  const { items: warehouses } = useSelector((state) => state.warehouses);

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role || "user";
  const token = user?.token;

  const [form, setForm] = useState({
    productId: "",
    warehouseId: "",
    txnType: "",
    txnId: "",
    txnDate: "",
    inQty: "",
    outQty: "",
    rate: "",
    balanceQty: "",
  });

  const [editingStockLedger, setEditingStockLedger] = useState(null);
const [searchproduct,setSearchproduct]=useState("")
const [searchWarehouse,setSearchWarehouse]=useState("")
const [searchType,setSearchType]=useState("")
  const [showModal, setShowModal] = useState(false);

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
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStockLedger) {
        await dispatch(updatestock({ id: editingStockLedger, updatedData: form })).unwrap();
        console.log("Stock Ledger Updated Successfully");
      } else {
        await dispatch(addstock(form)).unwrap();
        console.log("Stock Ledger Added Successfully");
      }

      setForm({
        productId: "",
        warehouseId: "",
        txnType: "",
        txnId: "",
        txnDate: "",
        inQty: "",
        outQty: "",
        rate: "",
        balanceQty: "",
      });
      setEditingStockLedger(null);
      setShowModal(false);
      dispatch(fetchstocks());
    } catch (err) {
      console.error(err.response?.data || err.message);
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
      outQty: stock.outQty || "",
      rate: stock.rate || "",
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
      outQty: "",
      rate: "",
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

  const matchwarehouse = searchWarehouse.trim() === "" || warehousename.includes(searchWarehouse.toLowerCase());
  const matchproduct = searchproduct.trim() === "" || productname.includes(searchproduct.toLowerCase());
  const matchtype = searchType.trim() === "" || type.includes(searchType.toLowerCase());

  return matchwarehouse && matchproduct && matchtype;
});


  const getProductName = (stock) => {
    if (typeof stock.productId === "object" && stock.productId !== null) {
      return stock.productId?.name || "Unknown Product";
    }
    return products.find((p) => p._id === stock.productId)?.name || "Unknown Product";
  };

 
  const getWarehouseName = (stock) => {
    if (typeof stock.warehouseId === "object" && stock.warehouseId !== null) {
      return stock.warehouseId?.store_name || "Unknown Warehouse";
    }
    return warehouses.find((w) => w._id === stock.warehouseId)?.store_name || "Unknown Warehouse";
  };

 
  const tableColumns = [
    {
      key: "product",
      header: "Product",
      headerStyle: { width: "150px" },
      render: (stock) => getProductName(stock)
    },
    {
      key: "warehouse",
      header: "Warehouse",
      headerStyle: { width: "150px" },
      render: (stock) => getWarehouseName(stock)
    },
    {
      key: "txnType",
      header: "Type",
      headerStyle: { width: "100px" },
      render: (stock) => stock.txnType || "N/A"
    },
    {
      key: "txnId",
      header: "Transaction ID",
      headerStyle: { width: "120px" },
      render: (stock) => stock.txnId || "N/A"
    },
    {
      key: "txnDate",
      header: "Date",
      headerStyle: { width: "100px" },
      render: (stock) => stock.txnDate ? new Date(stock.txnDate).toLocaleDateString() : "N/A"
    },
    {
      key: "inQty",
      header: "In Qty",
      headerStyle: { width: "80px" },
      render: (stock) => stock.inQty || "0"
    },
    {
      key: "outQty",
      header: "Out Qty",
      headerStyle: { width: "80px" },
      render: (stock) => stock.outQty || "0"
    },
    {
      key: "rate",
      header: "Rate",
      headerStyle: { width: "80px" },
      render: (stock) => stock.rate ? `₹${stock.rate}` : "₹0"
    },
    {
      key: "balanceQty",
      header: "Balance Qty",
      headerStyle: { width: "100px" },
      render: (stock) => stock.balanceQty || "0"
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
        
        <b>Stock Ledger</b>
      </h2>

      <div className="row mb-4">
        <div className="col-12">
          {["super_admin"].includes(role) && (
            <button 
              className="btn add text-white d-flex align-items-center" 
              onClick={openModal}
            >Add Ledger
            </button>
          )}
        </div>
      </div>

      
      <div
        className={`modal fade ${showModal ? "show d-block" : ""}`}
        style={{ backgroundColor: showModal ? "rgba(0,0,0,0.5)" : "transparent" }}
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
                    <label className="form-label">Product *</label>
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
                    <label className="form-label">Warehouse *</label>
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
                    <label className="form-label">Type *</label>
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
                    <label className="form-label">Transaction ID *</label>
                    <input
                      type="text"
                      className="form-control bg-light"
                      name="txnId"
                      value={form.txnId}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Date *</label>
                    <input
                      type="date"
                      className="form-control bg-light"
                      name="txnDate"
                      value={form.txnDate}
                      onChange={handleChange}
                      required
                    />
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
                      name="outQty"
                      value={form.outQty}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Rate</label>
                    <input
                      type="number"
                      className="form-control bg-light"
                      name="rate"
                      value={form.rate}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Balance Qty</label>
                    <input
                      type="number"
                      className="form-control bg-light"
                      name="balanceQty"
                      value={form.balanceQty}
                      onChange={handleChange}
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
        onResetSearch={()=>{
          setSearchproduct("")
          setSearchWarehouse("")
          setSearchType("")
        }}
      />
    </div>
  );
};

export default StockLedger;