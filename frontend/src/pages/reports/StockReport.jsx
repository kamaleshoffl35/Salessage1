import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaRegSave } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { FaSearch } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../../redux/productSlice";
import { fetchwarehouses } from "../../redux/warehouseSlice";
import { fetchCategories } from "../../redux/categorySlice";
import { addstockreport, deletestockreport, fetchstockreports } from "../../redux/stockreportSlice";


const StockReport = () => {
  const dispatch=useDispatch()
  const {items:stockreports,status}=useSelector((state)=>state.stockreports)
  const {items:products}=useSelector((state)=>state.products)
  const {items:warehouses}=useSelector((state)=>state.warehouses)
  const {items:categories}=useSelector((state)=>state.categories)
  
  
  const [form,setForm] = useState({
    product_id:"",
    warehouse_id:"",
    category_id:"",
  })

  useEffect(()=>{
    dispatch(fetchProducts())

   dispatch(fetchwarehouses())

   dispatch(fetchCategories())
  dispatch(fetchstockreports())
  },[])
  const handleChange=(e)=>{
    const {name,value}=e.target
    setForm({...form,[name]:value})
  }
  const handleSubmit=async (e) => {
    e.preventDefault()
    try{
      dispatch(addstockreport(form))
      setForm({
        product_id:"",
        warehouse_id:"",
        category_id:"",
      })
    }
    catch(err){
      console.error(err.response?.data || err.message)
    }
  }

  const [search, setSearch] = useState("");
    const filteredreports = stockreports.filter((s) => {
  const ProductName = s.product_id?.name || s.product_id?.toString() || "";
  const WarehouseName =s.warehouse_id?.name ||s.warehouse_id?.store_name ||s.warehouse_id?.warehouse_name ||(typeof s.warehouse_id === "string" ? s.warehouse_id : s.warehouse_id?.toString?.()) ||"";
  const CategoryName = s.category_id?.name || s.category_id?.toString() || "";

  

  return (
    ProductName.toLowerCase().includes(search.toLowerCase()) ||
    WarehouseName.toLowerCase().includes(search.toLowerCase()) ||
    CategoryName.toLowerCase().includes(search.toLowerCase())
  );
});

const handleDelete = async (id) => {
    dispatch(deletestockreport(id))
  };

  return (
    
    <div className="container mt-4 bg-gradient-warning">
      
    
        <form className="row g-3" onSubmit={handleSubmit}>
        <div className="col-md-6">
          <label className="form-label">Product<span className="text-danger">*</span></label>
          <select className="form-select bg-light" name="product_id" value={form.product_id} onChange={handleChange}>
           <option>-- Select Product --</option>
            {products.map(p=>(<option key={p._id} value={p._id}>{p.name}</option>))}
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label">Warehouse<span className="text-danger">*</span></label>
          <select className="form-select bg-light" name="warehouse_id" value={form.warehouse_id} onChange={handleChange}>
            <option value="">-- Select Warehouse --</option>
           {warehouses.map(w=>(<option key={w._id} value={w._id}>{w.name || w.store_name}</option>))}
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label">Category<span className="text-danger">*</span></label>
          <select className="form-select bg-light" name="category_id" value={form.category_id} onChange={handleChange}>
            <option>-- Select Category --</option>
          {categories.map(c=>(<option key={c._id} value={c._id}>{c.name}</option>))}
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
          <h5 className="mb-3">StockReport Tree</h5>
          <div className="mt-4 mb-2 input-group">
                      <input type="text" className="form-control" placeholder="Search Product, Warehouse name" value={search} onChange={(e) => setSearch(e.target.value)} />
                      <span className="input-group-text"><FaSearch /></span>
                    </div>
        <table className="table table-bordered table-striped mt-4">
            <thead className="table-dark">
              <tr>
                <th className="fw-bold">Product</th>
                <th className="fw-bold">Warehouse</th>
                <th className="fw-bold">Category</th>
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

                  <td>{s.product_id?.name }</td>
                  <td>{s.warehouse_id?.name || s.warehouse_id?.store_name || s.warehouse_id?.warehouse_name}</td>


                  <td>{s.category_id?.name}</td>
                  <td>
                                        <button
                                          className="btn btn-danger btn-sm"
                                          onClick={() => handleDelete(s._id)}
                                        >
                                          <span className="text-warning">
                                            <MdDeleteForever />
                                          </span>
                                          Delete
                                        </button>
                                      </td>
                  

                </tr>
              )))}
            </tbody>
          </table></div></div>
      
    </div>
  );
};

export default StockReport;