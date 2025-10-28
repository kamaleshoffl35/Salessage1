import axios from "axios";
import React, { useEffect, useState } from "react";
import { MdOutlineCategory } from "react-icons/md";
import { RiFunctionAddLine } from "react-icons/ri";
import { MdDeleteForever } from "react-icons/md";
import { FaSearch } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories,addCategory,deleteCategory } from "../redux/categorySlice";
import { setAuthToken } from "../services/userService";
import { updateCategory } from "../redux/categorySlice";
import { MdEdit } from "react-icons/md";


const Category = () => {
  const dispatch=useDispatch()
  const {items:categories,status}=useSelector((state)=>state.categories)

const user = JSON.parse(localStorage.getItem("user"))
const role = user?.role || "user"
const token = user?.token

   const [form, setForm] = useState({
    parental_id: "",
    name: "",
    code: "",
    subcategory: "",
    brand: "",
    status: false,
  });
  const categoryData = {
    Electronics: {
      Mobiles: ["Samsung", "Apple", "OnePlus"],
      Laptops: ["Dell", "HP", "Lenovo"],
      Televisions: ["Sony", "LG", "Samsung"],
    },
    Clothing: {
      Men: ["Nike", "Adidas", "Puma"],
      Women: ["Zara", "H&M", "Levis"],
      Kids: ["Mothercare", "Disney", "Gap"],
    },
    Furniture: {
      Sofa: ["Godrej", "IKEA", "Urban Ladder"],
      Table: ["Pepperfry", "IKEA"],
      Chair: ["Durian", "Nilkamal"],
    },
  };
const [subcategories, setSubcategories] = useState([]);
const [brands, setBrands] = useState([]);

 useEffect(()=>{
 const user=JSON.parse(localStorage.getItem("user"))
 if(!user || !user.token ){
  console.error("No user found Please Login")
 }

 const token = user.token
 setAuthToken(token)
 dispatch(fetchCategories())
 },[dispatch])

 const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
if (name === "name") {
      setSubcategories(Object.keys(categoryData[value] || {}));
      setBrands([]);
      setForm({ ...form, name: value, subcategory: "", brand: "" });
    } else if (name === "subcategory") {
      setBrands(categoryData[form.name][value] || []);
      setForm({ ...form, subcategory: value, brand: "" });
    } else {
      setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    }
  };
const handleSubmit = async (e) => {
    e.preventDefault();
     const payload={...form,brands:form.brand ?[form.brand]:[],};
    try {
      if(editingCategory){
        await dispatch(updateCategory({id:editingCategory,updatedData:form})).unwrap()
        setEditingCategory(null)
        console.log("Category Updated Successfully")
      }else{
         await dispatch(addCategory(payload)).unwrap()
         console.log("Category Added Successfully")
      }
     
     
      setForm({
        parental_id: "",
        name: "",
        code: "",
        subcategory: "",
        brand: "",
        status: false,
      });
      dispatch(fetchCategories())
      setSubcategories([]);
      setBrands([]);
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };
  const [search, setSearch] = useState("");

  const filteredCategories = categories.filter(
        (c) =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.code.toLowerCase().includes(search.toLowerCase()) ||
            c.parental_id.toLowerCase().includes(search.toLowerCase())
    );

const handleDelete = async (id) => {
    dispatch(deleteCategory(id))
  };

  const [editingCategory, setEditingCategory]=useState(null)

  const handleEdit=(category)=>{
    setEditingCategory(category._id)
    setForm({
      parental_id:category.parental_id || "",
      name: category.name || "",
        code: category.code || "",
        subcategory: category.subcategory || "",
        brand: category.brand || "",
        status: category.status || false,
    })
  }
  
 return (
    <div className="container mt-4 bg-gradient-warning">
      <h2 className="mb-4 d-flex align-items-center fs-5"><span className="  me-2 d-flex align-items-center" style={{color:"#4d6f99ff"}}><MdOutlineCategory size={24} /></span>{" "}<b >CATEGORY MASTER</b></h2>
      
      {["super_admin","admin"].includes(role) && (
      <form className="row g-3" onSubmit={handleSubmit}>
        <div className="col-md-6">
          <label className="form-label text-dark">Category ID<span className="text-danger">*</span></label>
          <input type="number" className="form-control bg-light" name="parental_id" value={form.parental_id} onChange={handleChange} required/>
        </div>
        <div className="col-md-6">
          <label className="form-label">Category Name<span className="text-danger">*</span></label>
          <select className="form-control" name="name" value={form.name} onChange={handleChange} required>
            <option value="">-- Select Category --</option>
            {Object.keys(categoryData).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label">Category Code</label>
          <input type="text" className="form-control bg-light" name="code" value={form.code} onChange={handleChange} required/>
        </div>
        {subcategories.length > 0 && (
          <div className="col-md-6">
            <label className="form-label">Subcategory<span className="text-danger">*</span></label>
            <select className="form-control" name="subcategory" value={form.subcategory} onChange={handleChange} required>
              <option value="">Select Subcategory</option>
              {subcategories.map((sub, index) => (
                <option key={index} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>
        )}
        {brands.length > 0 && (
          <div className="col-md-6">
            <label className="form-label">Brand</label>
            <select className="form-control" name="brand" value={form.brand} onChange={handleChange}>
              <option value="">-- Select Brand --</option>
              {brands.map((b, index) => (
                <option key={index} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="col-md-4 form-check">
          <label className="form-check-label">Status</label>
          <input type="checkbox" className="form-check-input" name="status" checked={form.status} onChange={handleChange}/>
        </div>
       <div className="col-12">
          <button type="submit" className="btn btn-primary px-4 d-flex align-items-center justify-content-center"><span className="text-warning me-2 d-flex align-items-center "><RiFunctionAddLine /></span>
            {editingCategory ? "Update Category": "Add Category"}
          </button>
        </div>
      </form>)}
      <br />
      <div className=" card shadow-sm">
        <div className="card-body">
          <h5 className="mb-3">Category Tree</h5>
          <div className="mt-4 mb-2 input-group">
                                  <input type="text" className="form-control" placeholder="Search Category code, Category name" value={search} onChange={(e) => setSearch(e.target.value)} />
                                  <span className="input-group-text"><FaSearch /></span>
                              </div>
          <table className="table table-bordered table-striped">
            <thead className="table-dark">
              <tr>
                <th className="fw-bold">Category ID</th>
                <th className="fw-bold">Category Name</th>
                <th className="fw-bold">Subcategory</th>
                <th className="fw-bold">Brand</th>
                <th className="fw-bold">Category Code</th>
                <th className="fw-bold">Status</th>
                <th className="fw-bold">Actions</th>
              </tr>
            </thead>
            <tbody>{filteredCategories.length === 0 ? (
                                <tr>
                                    <td colSpan="11" className="text-center">
                                        No categories found.
                                    </td>
                                </tr>
                            ) : (
              filteredCategories.map((c) => (
                <tr key={c._id}>
                  <td>{c.parental_id}</td>
                  <td>{c.name}</td>
                  <td>{c.subcategory || "-"}</td>
                  <td>{c.brand || "-"}</td>
                  <td>{c.code}</td>
                  <td className={c.status ? "text-success" : "text-danger"}>
                    {c.status ? "Active" : "Inactive"}
                  </td>
                  <td>
                    {["super_admin","admin"].includes(role) ? (
                      <>
                      <button  className="btn btn-warning btn-sm me-2" onClick={()=>handleEdit(c)}><MdEdit/>Edit</button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(c._id)}
                    >
                      <span className="text-warning">
                        <MdDeleteForever />
                      </span>
                      Delete
                    </button></>):(
                       <button className="btn btn-secondary btn-sm" disabled>
                                                        View Only
                                                    </button>
                    )}
                  </td>
                </tr>)
              ))
} 
</tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Category;
