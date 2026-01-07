import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, addProduct, deleteProduct, updateProduct } from "../redux/productSlice";
import API from "../api/axiosInstance";
import { fetchCategories } from "../redux/categorySlice";
import { fetchwarehouses } from "../redux/warehouseSlice";
import { variants } from "../data/variants";
import { setAuthToken } from "../services/userService";
import HistoryModal from "../components/HistoryModal";
import ReusableTable , {createCustomRoleActions} from "../components/ReusableTable"; 
const Product = () => {
  const dispatch = useDispatch();
  const { items: products, status } = useSelector((state) => state.products);
  const { items: categories } = useSelector((state) => state.categories);
  const {items:warehouses}=useSelector((state)=>state.warehouses)
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role || "user";
  const token = user?.token;
  const [showProductForm, setShowProductForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    sku: "",
    category_id: "",
    category_name: "",
    brand_name: "",
    unit_id: "Kg",
    warehouse:"",
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
  const [searchNameSku, setSearchNameSku] = useState("");
   const [searchCategory, setSearchCategory] = useState("");
   const [uniqueCategories, setUniqueCategories] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
const [historyInfo, setHistoryInfo] = useState(null);

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
    dispatch(fetchwarehouses())
  }, [dispatch]);

 
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

  if (
    !form.name.trim() ||
    !form.sku.trim() ||
    !form.category_id ||
    !form.tax_rate_id ||
    !form.mrp ||
    !form.purchase_price ||
    !form.sale_price
  ) {
    alert("Please fill in all required fields before submitting!");
    return; 
  }

  try {
    if (editingProduct) {
      await dispatch(updateProduct({ id: editingProduct, updatedData: form })).unwrap();
      setEditingProduct(null);
      console.log("Product Updated Successfully");
    } else {
      await dispatch(addProduct(form)).unwrap();
      console.log("Product added Successfully");
    }

  
    setForm({
      name: "",
      sku: "",
      category_id: "",
      category_name: "",
      brand_name: "",
      unit_id: "Kg",
      warehouse:"",
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
    warehouse: product.warehouse?._id || product.warehouse || "",

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
  const name = (p.name || "").toLowerCase();
  const sku = (p.sku || "").toLowerCase();
  const categoryName = typeof p.category_id === "object" ? p.category_id?.name?.toLowerCase() || "" : (p.category_id || "").toLowerCase();
  const matchNameSku = searchNameSku.trim() === "" || name.includes(searchNameSku.toLowerCase()) || sku.includes(searchNameSku.toLowerCase());
  const matchCategory = searchCategory.trim() === "" ||categoryName.includes(searchCategory.toLowerCase());
return matchNameSku && matchCategory;
});
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
      warehouse:"",
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

   const tableColumns = [
    { key: "sku", header: "SKU", width: 120 },
    { key: "name", header: "Name", width: 200 },
    { key: "category", header: "Category", render: (p) => p.category_id?.name || p.category_id || "" },
    { key: "brand_name", header: "Brand", render: (p) => p.brand_name || "-" },
    {key: "warehouse", header:"Warehouse",render:(p)=>p.warehouse?.store_name || ""},
    { key: "unit_id", header: "UoM", width: 80 },
    { key: "tax_rate_id", header: "Tax", width: 80 },
    { key: "mrp", header: "MRP", render: (p) => `₹${p.mrp}` },
    { key: "purchase_price", header: "Purchase", render: (p) => `₹${p.purchase_price}` },
    { key: "sale_price", header: "Sale", render: (p) => `₹${p.sale_price}` }
  ];

  const tableActions = createCustomRoleActions({
    edit: { show: () => ["super_admin", "admin"].includes(role) },
    delete: { show: () => ["super_admin", "admin"].includes(role) },
    history:{ show : () => ["super_admin","admin","user"].includes(role)}
  });

  const handleTableAction = (actionType, product) => {
    if (actionType === "edit") handleEdit(product);
    else if (actionType === "delete") handleDelete(product._id);
    else if (actionType === "history") handleHistory(product)
  };

  const handlereset=()=>{
    setSearchNameSku("")
    setSearchCategory("")
  }
const handleHistory = async (product) => {
  if (!product?._id) {
    console.error("Product ID is missing:", product);
    setHistoryInfo({
      createdBy: product?.created_by?.name ||
                 product?.created_by?.username ||
                 product?.created_by?.email ||
                 "Unknown",
      createdAt: product?.createdAt || null,
      updatedBy: "-",
      updatedAt: null,
    });
    setShowHistoryModal(true);
    return;
  }
try {
    const res = await API.get(`/products/${product._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
const p = res.data;
const createdByUser = p?.created_by?.name || p?.created_by?.username || p?.created_by?.email || "Unknown";
const updatedByUser = p?.updated_by?.name || p?.updated_by?.username || p?.updated_by?.email || "-";
const oldValues = p?.oldValues || null;
const newValues = p?.newValues || p;
setHistoryInfo({
      createdBy: createdByUser,
      createdAt: p?.createdAt || product?.createdAt || null,
      updatedBy: updatedByUser,
      updatedAt: p?.updatedAt || null,
      oldValues,
      newValues,
    });
  } catch (err) {

    console.warn(`Failed to fetch history for product ${product._id}:`, err);

    setHistoryInfo({
      createdBy: product?.created_by?.name || product?.created_by?.username || product?.created_by?.email ||"Unknown",
      createdAt: product?.createdAt || null,
      updatedBy: product?.updated_by?.name || product?.updated_by?.username || product?.updated_by?.email || "-",
      updatedAt: product?.updatedAt || null,
    });
  } finally {
    setShowHistoryModal(true);
  }
};

return (
    <div className="container mt-4">
      <h2 className="mb-4 d-flex align-items-center fs-3">
        <b>Products</b>
      </h2>
    
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex gap-2">
            {["super_admin", "admin"].includes(role) && (
              <button
                className="btn add  d-flex align-items-center text-white " 
                onClick={() => setShowProductForm(true)}
              >Add Product
              </button>
            )}
          </div>
        </div>
      </div>
      {showProductForm && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header  text-white" >
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
                      <label>
                        Warehouse <span className="text-danger">*</span>
                      </label>
                      <select
                        name="warehouse"
                        value={form.warehouse}
                        onChange={handleChange}
                        className="form-select bg-light"
                        required
                      >
                        <option value="">Select Warehouse</option>
                        {warehouses.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.store_name} 
                          </option>
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
                      className="btn add text-white d-flex align-items-center"
                    >
                     
                      {editingProduct ? "Update Product" : "Add Product"}
                    </button>

                    <button
                      type="button"
                      className="btn btn-secondary d-flex align-items-center"
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
        data={filteredProducts}
        columns={tableColumns}
        loading={status === "loading"}
        searchable={true}
        searchTerm1={searchNameSku}
        searchTerm2={searchCategory}
        onSearchChange1={setSearchNameSku}
        onSearchChange2={setSearchCategory}
        searchPlaceholder1="Search by Name or Sku"
        searchPlaceholder2="Search by Category"
        actions={tableActions}
        onActionClick={handleTableAction}
        emptyMessage="No products found."
        onResetSearch={handlereset}
        // className="mt-4"
      
      />
<HistoryModal
  open={showHistoryModal}
  onClose={() => setShowHistoryModal(false)}
  data={historyInfo}
/>
</div>
  );
};

export default Product;