

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, addProduct, deleteProduct, updateProduct } from "../redux/productSlice";
import { MdProductionQuantityLimits, MdDeleteForever, MdClose, MdAdd } from "react-icons/md";
import { FaCartPlus, FaSearch } from "react-icons/fa";
import API from "../api/axiosInstance";
import { fetchCategories } from "../redux/categorySlice";
import { variants } from "../data/variants";
import { setAuthToken } from "../services/userService";
import { MdEdit } from "react-icons/md";
import ReusableTable , {createCustomRoleActions, createRoleBasedActions} from "../components/ReusableTable"; // Import the reusable table

const Product = () => {
  const dispatch = useDispatch();
  const { items: products, status } = useSelector((state) => state.products);
  const { items: categories } = useSelector((state) => state.categories);

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role || "user";
  const token = user?.token;

  // State for modal/popup
  const [showProductForm, setShowProductForm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    sku: "",
    category_id: "",
    category_name: "",
    brand_name: "",
    unit_id: "Kg",
    hsn_code: "",
    tax_rate_id: "18%",
    mrp: "",
    purchase_price: "",
    sale_price: "",
    min_stock: "",
    barcode: "",
    is_batch_tracked: false,
    is_serial_tracked: false,
    status: false,
  });

  const [subcategories, setSubcategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [search, setSearch] = useState("");
  const [uniqueCategories, setUniqueCategories] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);

  // Get unique categories
  useEffect(() => {
    if (categories.length > 0) {
      const unique = categories.reduce((acc, category) => {
        if (!acc.find(item => item.name === category.name)) {
          acc.push({
            _id: category._id,
            name: category.name,
            subcategories: [],
            brands: category.brands || []
          });
        }
        return acc;
      }, []);
      setUniqueCategories(unique);
    }
  }, [categories]);

  useEffect(() => {
    if (!user || !user.token) {
      console.error("No token found in user object. Please login again.");
      return;
    }
    setAuthToken(token);
    dispatch(fetchCategories());
    dispatch(fetchProducts());
  }, [dispatch]);

  // Check product existence
  useEffect(() => {
    const checkProduct = async () => {
      const name = form.name.trim();
      if (!name) {
        setForm((prev) => ({ ...prev, status: false }));
        return;
      }
      try {
        const res = await API.get(`/products/check-exists?name=${encodeURIComponent(name)}`);
        setForm((prev) => ({ ...prev, status: res.data.exists }));
      } catch (err) {
        console.error("Error checking product:", err);
        setForm((prev) => ({ ...prev, status: false }));
      }
    };

    const delayDebounce = setTimeout(checkProduct, 400);
    return () => clearTimeout(delayDebounce);
  }, [form.name]);

  // Handle category change
  const handleCategoryChange = async (e) => {
    const selectedCategoryId = e.target.value;
    const selectedCategory = uniqueCategories.find(cat => cat._id === selectedCategoryId);
    
    if (selectedCategory) {
      const categorySubcategories = categories
        .filter(cat => cat.name === selectedCategory.name)
        .map(cat => cat.subcategory)
        .filter(sub => sub && sub.trim() !== "");

      const categoryBrands = categories
        .filter(cat => cat.name === selectedCategory.name)
        .flatMap(cat => cat.brands || [])
        .filter(brand => brand && brand.trim() !== "");

      const uniqueSubcategories = [...new Set(categorySubcategories)];
      const uniqueBrands = [...new Set(categoryBrands)];

      setSubcategories(uniqueSubcategories);
      setBrands(uniqueBrands);

      setForm({
        ...form,
        category_id: selectedCategoryId,
        category_name: selectedCategory.name,
        subcategory: "",
        brand_name: ""
      });
    } else {
      setSubcategories([]);
      setBrands([]);
      setForm({
        ...form,
        category_id: selectedCategoryId,
        category_name: "",
        subcategory: "",
        brand_name: ""
      });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await dispatch(updateProduct({ id: editingProduct, updatedData: form })).unwrap();
        setEditingProduct(null);
        console.log("Product Updated Successfully");
      } else {
        await dispatch(addProduct(form)).unwrap();
        console.log("Product added Successfully");
      }

      // Reset form and close popup
      setForm({
        name: "",
        sku: "",
        category_id: "",
        category_name: "",
        brand_name: "",
        unit_id: "Kg",
        hsn_code: "",
        tax_rate_id: "18%",
        mrp: "",
        purchase_price: "",
        sale_price: "",
        min_stock: "",
        barcode: "",
        is_batch_tracked: false,
        is_serial_tracked: false,
        status: true,
      });
      
      setSubcategories([]);
      setBrands([]);
      setShowProductForm(false);
      
      // Refresh products to show the newly added product in table
      dispatch(fetchProducts());
    } catch (err) {
      console.error("Error adding product:", err.response?.data || err.message);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product._id);
    
    const productCategory = categories.find(cat => cat._id === product.category_id);
    if (productCategory) {
      const categorySubcategories = categories
        .filter(cat => cat.name === productCategory.name)
        .map(cat => cat.subcategory)
        .filter(sub => sub && sub.trim() !== "");

      const categoryBrands = categories
        .filter(cat => cat.name === productCategory.name)
        .flatMap(cat => cat.brands || [])
        .filter(brand => brand && brand.trim() !== "");

      setSubcategories([...new Set(categorySubcategories)]);
      setBrands([...new Set(categoryBrands)]);
    }

    setForm({
      name: product.name || "",
      sku: product.sku || "",
      category_id: product.category_id?._id || product.category_id || "",
      category_name: productCategory?.name || "",
      brand_name: product.brand_name || "",
      unit_id: product.unit_id || "Kg",
      hsn_code: product.hsn_code || "",
      tax_rate_id: product.tax_rate_id || "18%",
      mrp: product.mrp || "",
      purchase_price: product.purchase_price || "",
      sale_price: product.sale_price || "",
      min_stock: product.min_stock || "",
      barcode: product.barcode || "",
      is_batch_tracked: product.is_batch_tracked || false,
      is_serial_tracked: product.is_serial_tracked || false,
      status: product.status || false,
    });

    setShowProductForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      dispatch(deleteProduct(id));
    }
  };

  

  const filteredProducts = products.filter((p) => {
    const categoryName = typeof p.category_id === "object"
      ? p.category_id?.name || ""
      : p.category_id || "";

    return (
      (p.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.sku || "").toLowerCase().includes(search.toLowerCase()) ||
      categoryName.toLowerCase().includes(search.toLowerCase())
    );
  });

  // Reset form when closing popup
  const handleCloseForm = () => {
    setShowProductForm(false);
    setEditingProduct(null);
    setForm({
      name: "",
      sku: "",
      category_id: "",
      category_name: "",
      brand_name: "",
      unit_id: "Kg",
      hsn_code: "",
      tax_rate_id: "18%",
      mrp: "",
      purchase_price: "",
      sale_price: "",
      min_stock: "",
      barcode: "",
      is_batch_tracked: false,
      is_serial_tracked: false,
      status: true,
    });
    setSubcategories([]);
    setBrands([]);
  };

  // Define table columns for reusable table
  const tableColumns = [
    {
      key: "sku",
      header: "SKU",
      headerStyle: { width: "120px" }
    },
    {
      key: "name",
      header: "Name",
      headerStyle: { width: "200px" }
    },
    {
      key: "category",
      header: "Category",
      render: (product) => product.category_id?.name || product.category_id || ""
    },
    {
      key: "brand_name",
      header: "Brand",
      render: (product) => product.brand_name || "-"
    },
    {
      key: "unit_id",
      header: "UoM",
      headerStyle: { width: "80px" }
    },
    {
      key: "tax_rate_id",
      header: "Tax",
      headerStyle: { width: "80px" }
    },
    {
      key: "mrp",
      header: "MRP",
      headerStyle: { width: "100px" },
      render: (product) => `₹${product.mrp}`
    },
    {
      key: "purchase_price",
      header: "Purchase",
      headerStyle: { width: "100px" },
      render: (product) => `₹${product.purchase_price}`
    },
    {
      key: "sale_price",
      header: "Sale",
      headerStyle: { width: "100px" },
      render: (product) => `₹${product.sale_price}`
    }
  ];

  // Use common actions with role-based access
 const tableActions = createCustomRoleActions({
   edit: { 
     show: () => ["super_admin", "admin",].includes(role) // User can edit
   },
   delete: { 
     show: () => ["super_admin", "admin"].includes(role) // Only admin/super_admin can delete
   }})

  // Handle table actions
  const handleTableAction = (actionType, product) => {
    if (actionType === "edit") {
      handleEdit(product);
    } else if (actionType === "delete") {
      handleDelete(product._id);
    }
  };
  return (
    <div className="container mt-4">
      <h2 className="mb-4 d-flex align-items-center fs-5">
        <span className="me-2 d-flex align-items-center" style={{ color: "#4d6f99ff" }}>
          <MdProductionQuantityLimits size={24} />
        </span>
        <b>PRODUCT MASTER</b>
      </h2>
      
      {/* Action Buttons - Above the product area */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex gap-2">
            {["super_admin", "admin"].includes(role) && (
              <button
                className="btn  d-flex align-items-center text-white " style={{backgroundColor:"#182235"}}
                onClick={() => setShowProductForm(true)}
              >
                <MdAdd className="me-2" />
                Add Product
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Product Form Popup/Modal */}
      {showProductForm && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header  text-white" style={{backgroundColor:"#182235"}}>
                <h5 className="modal-title">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={handleCloseForm}
                ></button>
              </div>
              <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <form className="row g-3" onSubmit={handleSubmit}>
                  <div className="col-md-6">
                    <label className="form-label">Product Name <span className="text-danger">*</span></label>
                    <input 
                      type="text" 
                      className="form-control bg-light" 
                      name="name" 
                      value={form.name} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">SKU / Item Code <span className="text-danger">*</span></label>
                    <input 
                      type="text" 
                      className="form-control bg-light" 
                      name="sku" 
                      value={form.sku} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Category <span className="text-danger">*</span></label>
                    <select 
                      className="form-select bg-light" 
                      name="category_id" 
                      value={form.category_id} 
                      onChange={handleCategoryChange} 
                      required
                    >
                      <option value="">Select Category</option>
                      {uniqueCategories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {subcategories.length > 0 && (
                    <div className="col-md-6">
                      <label className="form-label">Subcategory</label>
                      <select 
                        className="form-select bg-light" 
                        name="subcategory" 
                        value={form.subcategory} 
                        onChange={handleChange}
                      >
                        <option value="">-- Select Subcategory --</option>
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
                      <label className="form-label">Brand (Optional)</label>
                      <select 
                        className="form-select bg-light" 
                        name="brand_name" 
                        value={form.brand_name} 
                        onChange={handleChange}
                      >
                        <option value="">Select Brand</option>
                        {brands.map((brand, index) => (
                          <option key={index} value={brand}>
                            {brand}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="col-md-6">
                    <label className="form-label">Variant</label>
                    <select className="form-select bg-light" name="variant" value={form.variant} onChange={handleChange}>
                      <option value="">Select Variant</option>
                      {Object.keys(variants).map((group) => (
                        <optgroup key={group} label={group.replace(/([A-Z])/g, " $1")}>
                          {variants[group].map((v) => (
                            <option key={v.value} value={v.value}>{v.label}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">HSN Code (Optional)</label>
                    <input 
                      type="number" 
                      className="form-control bg-light" 
                      name="hsn_code" 
                      value={form.hsn_code} 
                      onChange={handleChange} 
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Tax Rate <span className="text-danger">*</span></label>
                    <select 
                      className="form-select bg-light" 
                      name="tax_rate_id" 
                      value={form.tax_rate_id} 
                      onChange={handleChange} 
                      required
                    >
                      <option>0%</option>
                      <option>5%</option>
                      <option>12%</option>
                      <option>18%</option>
                      <option>28%</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">MRP <span className="text-danger">*</span></label>
                    <input 
                      type="number" 
                      step="0.01" 
                      className="form-control bg-light" 
                      name="mrp" 
                      value={form.mrp} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Purchase Price <span className="text-danger">*</span></label>
                    <input 
                      type="number" 
                      className="form-control bg-light" 
                      name="purchase_price" 
                      value={form.purchase_price} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Sale Price <span className="text-danger">*</span></label>
                    <input 
                      type="number" 
                      step="0.01" 
                      className="form-control bg-light" 
                      name="sale_price" 
                      value={form.sale_price} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Min Stock / Reorder Level</label>
                    <input 
                      type="number" 
                      className="form-control bg-light" 
                      name="min_stock" 
                      value={form.min_stock} 
                      onChange={handleChange} 
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Barcode (Optional)</label>
                    <input 
                      type="text" 
                      className="form-control bg-light" 
                      name="barcode" 
                      value={form.barcode} 
                      onChange={handleChange} 
                    />
                  </div>

                  <div className="col-md-4 form-check">
                    <input 
                      type="checkbox" 
                      className="form-check-input" 
                      name="is_batch_tracked" 
                      checked={form.is_batch_tracked} 
                      onChange={handleChange} 
                    />
                    <label className="form-check-label">Batch Tracking</label>
                  </div>

                  <div className="col-md-4 form-check">
                    <input 
                      type="checkbox" 
                      className="form-check-input" 
                      name="is_serial_tracked" 
                      checked={form.is_serial_tracked} 
                      onChange={handleChange} 
                    />
                    <label className="form-check-label">Serial Tracking</label>
                  </div>

                  <div className="col-md-4 form-check">
                    <input 
                      type="checkbox" 
                      className="form-check-input" 
                      name="status" 
                      checked={form.status} 
                      onChange={handleChange} 
                    />
                    <label className="form-check-label">Active Status</label>
                  </div>

                  <div className="col-12 d-flex justify-content-end gap-2 mt-3">
                    <button
                      type="submit"
                      className="btn text-white d-flex align-items-center" style={{backgroundColor:"#182235"}}
                    >
                      <FaCartPlus className="me-2 text-white" />
                      {editingProduct ? "Update Product" : "Add Product"}
                    </button>

                    <button
                      type="button"
                      className="btn btn-secondary d-flex align-items-center"
                      onClick={handleCloseForm}
                    >
                      <MdClose className="me-2" />
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reusable Table Component - Replaces the old table */}
      <ReusableTable
        data={filteredProducts}
        columns={tableColumns}
        
        loading={status === "loading"}
        searchable={true}
        searchTerm={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by Name, SKU, Category"
        actions={tableActions}
        onActionClick={handleTableAction}
        emptyMessage="No products found."
        className="mt-4"
          headerClassName="table-dark"
      />
    </div>
  );
};

export default Product;