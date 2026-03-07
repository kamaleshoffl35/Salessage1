  import { useState, useEffect } from "react";
  import { useDispatch, useSelector } from "react-redux";
  import {fetchProducts,addProduct,deleteProduct, updateProduct,} from "../redux/productSlice";
  import API from "../api/axiosInstance";
  import { fetchwarehouses } from "../redux/warehouseSlice";
  import { variants } from "../data/variants";
  import HistoryModal from "../components/HistoryModal";
  import ReusableTable, {createCustomRoleActions,} from "../components/ReusableTable";
  import { useNavigate } from "react-router-dom";
  import useTableActions from "../components/useTableActions";
  import AddButton from "../components/AddButton";
  import ImportExcelButton from "../components/ImportExcelButton";
  import { bulkAddProducts } from "../redux/productSlice";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { EditorState, convertToRaw } from "draft-js";

import draftToHtml from "draftjs-to-html";
import htmlToDraft from "html-to-draftjs";
  const Product = () => {
    const dispatch = useDispatch();
    const { items: products, status } = useSelector((state) => state.products);
    const { items: warehouses } = useSelector((state) => state.warehouses);
    const [role, setRole] = useState("user");
    const [showProductForm, setShowProductForm] = useState(false);
    const [importedProducts, setImportedProducts] = useState([]);
    const navigate = useNavigate();
   const [form, setForm] = useState({
  name: "",
  image: null,
  description: "",
  short_description: "",
  features: "",
  spiritual_significance: "",
  ideal_placement: "",
  care_instructions: "",
  tags: "",
  sku: "",
  category_id: "",
  subcategory_id: "",
  brand_name: "",
  unit_id: "Kg",
  warehouse: "",
  hsn_code: "",
  tax_rate_id: "18%",
  mrp: "",
  purchase_price: "",
  sale_price: "",
  dimension: "",
   dimensions: [
    { size: "", mrp: "", purchase_price: "", sale_price: "" }
  ],
  status: true,
});
    const [searchNameSku, setSearchNameSku] = useState("");
    const [searchCategory, setSearchCategory] = useState("");
    const [searchMRP, setSearchMRP] = useState("");
    const [subcategories, setSubcategories] = useState([]);
    const [editingProduct, setEditingProduct] = useState(null);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [historyInfo, setHistoryInfo] = useState(null);
    const [featuresEditor, setFeaturesEditor] = useState(EditorState.createEmpty());
const [spiritualEditor, setSpiritualEditor] = useState(EditorState.createEmpty());
const [placementEditor, setPlacementEditor] = useState(EditorState.createEmpty());
const [careEditor, setCareEditor] = useState(EditorState.createEmpty());
const [tagsEditor, setTagsEditor] = useState(EditorState.createEmpty());
    const tableActions = useTableActions(role);
    useEffect(() => {
      API.get("/users/me")
        .then((res) => {
          setRole(res.data.role);
        })
        .catch(() => {
          navigate("/login");
        });
    }, [navigate]);
  
    useEffect(() => {
      dispatch(fetchProducts());
      dispatch(fetchwarehouses());
    }, [dispatch]);
    useEffect(() => {
      const checkProduct = async () => {
        const name = form.name.trim();
        if (!name) {
          setForm((prev) => ({ ...prev, status: false }));
          return;
        }
        try {
          const res = await API.get(
            `/products/check-exists?name=${encodeURIComponent(name)}`,
          );
          setForm((prev) => ({ ...prev, status: res.data.exists }));
        } catch (err) {
          console.error("Error checking product:", err);
          setForm((prev) => ({ ...prev, status: false }));
        }
      };
    const delayDebounce = setTimeout(checkProduct, 400);
      return () => clearTimeout(delayDebounce);
    }, [form.name]);
    
    const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      setForm({
        ...form,
        [name]: type === "checkbox" ? checked : value,
      });
    };
    const staticCategories = [
  {
    id: "paintings",
    name: "Paintings",
    subcategories: ["Hindu Deities – Rama", "Hindu Deities – Vishnu", "Hindu Deities – Shiva", "Hindu Deities – Krishna","Hindu Deities – Sridevi","Hindu Deities – Saraswathi","Hindu Deities – Annapoorani","Hindu Deities – Krishna edited testing",""],
  },
  {
    id: "sculptures",
    name: "Sculptures",
    subcategories: ["Small", "Medium", "Large"],
  },
];
const handleCategoryChange = (e) => {
  const selectedId = e.target.value;

  const selectedCategory = staticCategories.find(
    (cat) => cat.id === selectedId
  );

  setForm((prev) => ({
    ...prev,
    category_id: selectedId,
    subcategory_id: "",
    variant:"",
 dimension: "",
  }));

  if (selectedCategory) {
    setSubcategories(selectedCategory.subcategories);
  } else {
    setSubcategories([]);
  }
};
const handleDimensionChange = (index, field, value) => {
  const updated = [...form.dimensions];
  updated[index][field] = value;

  setForm((prev) => ({
    ...prev,
    dimensions: updated
  }));
};

const addDimensionRow = () => {
  setForm((prev) => ({
    ...prev,
    dimensions: [
      ...prev.dimensions,
      { size: "", mrp: "", purchase_price: "", sale_price: "" }
    ]
  }));
};

const removeDimensionRow = (index) => {
  const updated = form.dimensions.filter((_, i) => i !== index);

  setForm((prev) => ({
    ...prev,
    dimensions: updated
  }));
};
const cleanEditorHtml = (html) => {
  if (!html) return "";
  const stripped = html.replace(/<[^>]*>/g, "").trim();
  return stripped ? html : "";
};
    const handleSubmit = async (e) => {
      e.preventDefault();
        console.log("FORM DATA", form);
      if (!form.name.trim() || !form.sku.trim() || !form.category_id || !form.tax_rate_id) {
  alert("Please fill in all required fields before submitting!");
  return;
}

// validation for paintings
if (form.category_id === "paintings") {
  const validDimensions = form.dimensions.filter(
    (d) => d.size && d.mrp && d.purchase_price && d.sale_price
  );

  if (validDimensions.length === 0) {
    alert("Please fill at least one dimension with price.");
    return;
  }
}

// validation for other categories
if (form.category_id !== "paintings") {
  if (!form.mrp || !form.purchase_price || !form.sale_price) {
    alert("Please fill in MRP, Purchase Price and Sale Price.");
    return;
  }
}
// Fix price for paintings
if (form.category_id === "paintings" && form.dimensions.length > 0) {
  const firstDimension = form.dimensions.find(
    (d) => d.size && d.mrp && d.purchase_price && d.sale_price
  );

  if (firstDimension) {
    form.mrp = firstDimension.mrp;
    form.purchase_price = firstDimension.purchase_price;
    form.sale_price = firstDimension.sale_price;
  }
}
      try {
        if (editingProduct) {
        const formData = new FormData();
if (form.category_id === "paintings" && form.dimensions.length > 0) {
  form.mrp = form.dimensions[0].mrp;
  form.purchase_price = form.dimensions[0].purchase_price;
  form.sale_price = form.dimensions[0].sale_price;
}
const cleanForm = {
  sku: form.sku,
  name: form.name,
  description: form.description,

  short_description: form.short_description,
  features: form.features,
  spiritual_significance: form.spiritual_significance,
  ideal_placement: form.ideal_placement,
  care_instructions: form.care_instructions,
  tags: form.tags,

  category_name:
    staticCategories.find((c) => c.id === form.category_id)?.name || "",
  subcategory_name: form.subcategory_id || "",

  brand_name: form.brand_name,
  variant: form.variant,
  dimension: form.dimension,
   dimensions: JSON.stringify(form.dimensions),

  unit_id: form.unit_id,
  warehouse: form.warehouse,
  hsn_code: form.hsn_code,
  tax_rate_id: form.tax_rate_id,
  mrp: form.mrp,
  purchase_price: form.purchase_price,
  sale_price: form.sale_price,
  status: form.status,
   created_by_role: role 
};
Object.entries(cleanForm).forEach(([key, value]) => {
  if (value !== null && value !== undefined) {
    formData.append(key, value);
  }
});

if (form.image instanceof File) {
  formData.append("image", form.image);
}

await dispatch(
  updateProduct({ id: editingProduct, updatedData: formData })
).unwrap();
          setEditingProduct(null);
          console.log("Product Updated Successfully");
        } else {
 const cleanForm = {
  sku: form.sku,
  name: form.name,
  description: form.description,

  short_description: form.short_description,
  features: form.features,
  spiritual_significance: form.spiritual_significance,
  ideal_placement: form.ideal_placement,
  care_instructions: form.care_instructions,
  tags: form.tags,

  category_name:
    staticCategories.find((c) => c.id === form.category_id)?.name || "",

  subcategory_name: form.subcategory_id || "",
  brand_name: form.brand_name,
  variant: form.variant,
  dimension: form.dimension,
 dimensions: JSON.stringify(form.dimensions),

  unit_id: form.unit_id,
  warehouse: form.warehouse,
  hsn_code: form.hsn_code,
  tax_rate_id: form.tax_rate_id,

  mrp: form.mrp,
  purchase_price: form.purchase_price,
  sale_price: form.sale_price,

  status: form.status,
   created_by_role: role 
};
        const formData = new FormData();

// append everything EXCEPT image
Object.entries(cleanForm).forEach(([key, value]) => {
  if (key !== "image" && value !== null && value !== undefined) {
    formData.append(key, value);
  }
});

// append image ONLY once
if (form.image instanceof File) {
  formData.append("image", form.image);
}
        await dispatch(addProduct(formData)).unwrap();
        }
        setForm({
  name: "",
  image: null,
  description: "",
  short_description: "",
  features: "",
  spiritual_significance: "",
  ideal_placement: "",
  care_instructions: "",
  tags: "",
  sku: "",
  category_id: "",
  subcategory_id: "",
  brand_name: "",
  unit_id: "Kg",
  warehouse: "",
  hsn_code: "",
  tax_rate_id: "18%",
  mrp: "",
  purchase_price: "",
  sale_price: "",
  dimension: "",
  dimensions: [
  { size: "", mrp: "", purchase_price: "", sale_price: "" }
],
  status: true,
});
        setSubcategories([]);
        setShowProductForm(false);
        dispatch(fetchProducts());
      } catch (err) {
        console.error("Error adding product:", err.response?.data || err.message);
      }
    };

    const handleDelete = (id) => {
      if (window.confirm("Are you sure you want to delete this product?")) {
        dispatch(deleteProduct(id));
      }
    };
   const filteredProducts = products.filter((p) => {
  const name = (p.name || "").toLowerCase();
  const sku = (p.sku || "").toLowerCase();
  const categoryName = (p.category_name || "").toLowerCase();
  const subcategoryName = (p.subcategory_name || "").toLowerCase();

  const nameSkuSearch = searchNameSku.toLowerCase().trim();
  const categorySearch = searchCategory.toLowerCase().trim();
  const mrpSearch = searchMRP.trim();

  const matchNameSku =
    !nameSkuSearch ||
    name.includes(nameSkuSearch) ||
    sku.includes(nameSkuSearch);

  const matchCategory =
    !categorySearch ||
    categoryName.includes(categorySearch) ||
    subcategoryName.includes(categorySearch);

  const matchMRP =
    !mrpSearch || Number(p.mrp) === Number(mrpSearch);

  return matchNameSku && matchCategory && matchMRP;
});
    const handleCloseForm = () => {
      setShowProductForm(false);
      setEditingProduct(null);
      setForm({
        name: "",
        sku: "",
        description:"",
        category_id: "",
        brand_name: "",
        unit_id: "Kg",
        warehouse: "",
        hsn_code: "",
        tax_rate_id: "18%",
        mrp: "",
        purchase_price: "",
         dimension: "", 
         dimensions: [
  { size: "", mrp: "", purchase_price: "", sale_price: "" }
],
        sale_price: "",
      status: true,
      });
      setSubcategories([]);
    };
    const paintingDimensions = ["1", "2", "3", "4"];
const handleExcelImport = async (rows) => {
  try {
    const mapped = rows.map((r) => ({
      name: r["Name"] || "",
      sku: r["SKU"] || "",
      category_name: r["Category"] || "",
      subcategory_name: r["Subcategory"] || "",
      brand_name: r["Brand"] || "",
      unit_id: r["UoM"] || "Kg",
      tax_rate_id: r["Tax"] || "18%",
      mrp: Number(r["MRP"]) || 0,
      purchase_price: Number(r["Purchase"]) || 0,
      sale_price: Number(r["Sale"]) || 0,
      warehouse: r["Warehouse"],
      status: true,
    }));
    setImportedProducts(mapped);
    await dispatch(bulkAddProducts(mapped)).unwrap();
    dispatch(fetchProducts());
  } catch (err) {
    console.error(err);
  }
};

const combinedProducts = [...filteredProducts, ...importedProducts];
const tableColumns = [
      { key: "sku", header: "SKU", width: 120 },
      { key: "name", header: "Name", width: 200 },
      {
  key: "description",
  header: "Description",
  render: (p) =>
    p.description ? (
      <span title={p.description}>
        {p.description.length > 40
          ? p.description.substring(0, 40) + "..."
          : p.description}
      </span>
    ) : "-",
},
      {
      key: "image",
      header: "Image",
      render: (p) =>
        p.image ? (
          <img src={p.image} alt={p.name} width="50" />
        ) : (
          "No Image"
        ),
       },
      {
        key: "category",
        header: "Category",
        render: (p) => p.category_name || "-",
      },
      {
        key: "subcategory",
        header: "Subcategory",
        render: (p) => p.subcategory_name || "-",
      },
      { key: "brand_name", header: "Brand", render: (p) => p.brand_name || "-" },
      {
        key: "warehouse",
        header: "Warehouse",
        render: (p) => typeof p.warehouse === "object"? p.warehouse?.store_name: p.warehouse || "",
      },
      { key: "unit_id", header: "UoM", width: 80 },
      { key: "tax_rate_id", header: "Tax", width: 80 },
      { key: "mrp", header: "MRP", render: (p) => `₹${p.mrp}` },
      {
        key: "purchase_price",
        header: "Purchase",
        render: (p) => `₹${p.purchase_price}`,
      },
      { key: "sale_price", header: "Sale", render: (p) => `₹${p.sale_price}` },
    ];

    const handleTableAction = (actionType, product) => {
      if (actionType === "edit") handleEdit(product);
      else if (actionType === "delete") handleDelete(product._id);
      else if (actionType === "history") handleHistory(product);
    };

    const handlereset = () => {
      setSearchNameSku("");
      setSearchCategory("");
      setSearchMRP("");
    };
    const handleHistory = async (product) => {
      if (!product?._id) {
        console.error("Product ID is missing:", product);
        setHistoryInfo({
          createdBy:
            product?.created_by?.name ||
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
        const res = await API.get(`/products/${product._id}`);

        const p = res.data;
        const createdByUser =
          p?.created_by?.name ||
          p?.created_by?.username ||
          p?.created_by?.email ||
          "Unknown";
        const updatedByUser =
          p?.updated_by?.name ||
          p?.updated_by?.username ||
          p?.updated_by?.email ||
          "-";
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
          createdBy:
            product?.created_by?.name ||
            product?.created_by?.username ||
            product?.created_by?.email ||
            "Unknown",
          createdAt: product?.createdAt || null,
          updatedBy:
            product?.updated_by?.name ||
            product?.updated_by?.username ||
            product?.updated_by?.email ||
            "-",
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
                <div className="d-flex gap-2">
  <AddButton text="Add Product" onClick={() => setShowProductForm(true)} />
  <ImportExcelButton onImport={handleExcelImport} />
</div>

              )}
            </div>
          </div>
        </div>
        {showProductForm && (
          <div
            className="modal show d-block"
            tabIndex="-1"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header  text-white">
                  <h5 className="modal-title">
                    {editingProduct ? "Edit Product" : "Add New Product"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={handleCloseForm}
                  ></button>
                </div>
                <div
                  className="modal-body"
                  style={{ maxHeight: "70vh", overflowY: "auto" }}
                >
                  <form className="row g-3" onSubmit={handleSubmit}>
                    <div className="col-md-6">
                      <label className="form-label">
                        Product Name <span className="text-danger">*</span>
                      </label>
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
  <label className="form-label">Product Image</label>
  <input
    type="file"
    className="form-control"
    name="image"
    accept="image/*"
    onChange={(e) =>
      setForm({ ...form, image: e.target.files[0] })
    }
  />
</div>

                    <div className="col-md-6">
                      <label className="form-label">
                        SKU / Item Code <span className="text-danger">*</span>
                      </label>
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
                      <label className="form-label">
                        Category <span className="text-danger">*</span>
                      </label>
                     <select
  className="form-select bg-light"
  value={form.category_id}
  onChange={handleCategoryChange}
  required
>
  <option value="">Select Category</option>
  {staticCategories.map((cat) => (
    <option key={cat.id} value={cat.id}>
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
      value={form.subcategory_id || ""}
      onChange={(e) =>
        setForm((prev) => ({
          ...prev,
          subcategory_id: e.target.value,
        }))
      }
    >
      <option value="">Select Subcategory</option>
      {subcategories.map((sub, index) => (
        <option key={index} value={sub}>
          {sub}
        </option>
      ))}
    </select>
  </div>
)}
<div className="mb-3">
  <label>Description</label>
  <textarea
    name="description"
    className="form-control"
    rows="4"
    value={form.description}
    onChange={handleChange}
  />
</div>
<div className="mb-3">
  <label>Short Description</label>
  <textarea
    name="short_description"
    className="form-control"
    rows="2"
    value={form.short_description}
    onChange={handleChange}
  />
</div>
<div className="mb-3">
  <label>Features</label>

  <Editor
    editorState={featuresEditor}
    onEditorStateChange={(state) => {
      setFeaturesEditor(state);

      const html = draftToHtml(
  convertToRaw(state.getCurrentContent())
);

      setForm((prev) => ({
        ...prev,
        features: html
      }));
    }}
    toolbar={{
      options: ["inline", "list", "textAlign", "history"],
      list: { options: ["unordered", "ordered"] },
      textAlign: { options: ["left", "center", "right"] }
    }}
  />
</div>
<div className="mb-3">
  <label>Spiritual Significance</label>

  <Editor
    editorState={spiritualEditor}
    onEditorStateChange={(state) => {
      setSpiritualEditor(state);

      const html = draftToHtml(
  convertToRaw(state.getCurrentContent())
);

      setForm((prev) => ({
        ...prev,
        spiritual_significance: html
      }));
    }}
    toolbar={{
      options: ["inline", "list", "textAlign", "history"],
      list: { options: ["unordered", "ordered"] },
      textAlign: { options: ["left", "center", "right"] }
    }}
  />
</div>

<div className="mb-3">
  <label>Ideal Placement</label>

  <Editor
    editorState={placementEditor}
    onEditorStateChange={(state) => {
      setPlacementEditor(state);

      const html = draftToHtml(
  convertToRaw(state.getCurrentContent())
);
      setForm((prev) => ({
        ...prev,
        ideal_placement: html
      }));
    }}
    toolbar={{
      options: ["inline", "list", "textAlign", "history"],
      list: { options: ["unordered", "ordered"] },
      textAlign: { options: ["left", "center", "right"] }
    }}
  />
</div>


<div className="mb-3">
  <label>Care Instructions</label>

  <Editor
    editorState={careEditor}
    onEditorStateChange={(state) => {
      setCareEditor(state);
const html = draftToHtml(
  convertToRaw(state.getCurrentContent())
);
      setForm((prev) => ({
        ...prev,
        care_instructions: html
      }));
    }}
    toolbar={{
      options: ["inline", "list", "textAlign", "history"],
      list: { options: ["unordered", "ordered"] },
      textAlign: { options: ["left", "center", "right"] }
    }}
  />
</div>


<div className="mb-3">
  <label>Tags</label>

  <Editor
    editorState={tagsEditor}
    onEditorStateChange={(state) => {
      setTagsEditor(state);

     const html = draftToHtml(
  convertToRaw(state.getCurrentContent())
);

      setForm((prev) => ({
        ...prev,
      tags: html
      }));
    }}
    toolbar={{
      options: ["inline", "list", "textAlign", "history"],
      list: { options: ["unordered", "ordered"] },
      textAlign: { options: ["left", "center", "right"] }
    }}
  />
</div>

                    <div className="col-md-6">
                      <label className="form-label">Brand (Optional)</label>
                      <input
                        type="text"
                        className="form-control bg-light"
                        name="brand_name"
                        value={form.brand_name}
                        onChange={handleChange}
                        placeholder="Enter Brand Name"
                      />
                    </div>

                 {/* Show Dimension ONLY for Paintings */}


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
{form.category_id === "paintings" ? (
  <div className="col-md-12">
   
  <div className="col-md-12">
    <label className="form-label">Dimensions & Prices</label>

    {form.dimensions.map((d, index) => (
      <div className="row mb-2" key={index}>

        <div className="col-md-3">
          <input
            type="text"
            className="form-control"
            placeholder="Size (12x18)"
            value={d.size}
            onChange={(e) =>
              handleDimensionChange(index, "size", e.target.value)
            }
          />
        </div>

        <div className="col-md-2">
          <input
            type="number"
            className="form-control"
            placeholder="MRP"
            value={d.mrp}
            onChange={(e) =>
              handleDimensionChange(index, "mrp", e.target.value)
            }
          />
        </div>

        <div className="col-md-3">
          <input
            type="number"
            className="form-control"
            placeholder="Purchase"
            value={d.purchase_price}
            onChange={(e) =>
              handleDimensionChange(index, "purchase_price", e.target.value)
            }
          />
        </div>

        <div className="col-md-3">
          <input
            type="number"
            className="form-control"
            placeholder="Sale"
            value={d.sale_price}
            onChange={(e) =>
              handleDimensionChange(index, "sale_price", e.target.value)
            }
          />
        </div>

        <div className="col-md-1">
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => removeDimensionRow(index)}
          >
            ✕
          </button>
        </div>

      </div>
    ))}

    <button
      type="button"
      className="btn btn-sm btn-primary mt-2"
      onClick={addDimensionRow}
    >
      + Add Size
    </button>
  </div>

  </div>
) : (
  <div className="col-md-6">
    <label className="form-label">Variant</label>
    <select
      className="form-select bg-light"
      name="variant"
      value={form.variant}
      onChange={handleChange}
    >
      <option value="">Select Variant</option>
      {Object.keys(variants).map((group) => (
        <optgroup
          key={group}
          label={group.replace(/([A-Z])/g, " $1")}
        >
          {variants[group].map((v) => (
            <option key={v.value} value={v.value}>
              {v.label}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  </div>
)}
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
                      <label className="form-label">
                        Tax Rate <span className="text-danger">*</span>
                      </label>
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

                    {form.category_id !== "paintings" && (
<>
<div className="col-md-6">
  <label className="form-label">
    MRP <span className="text-danger">*</span>
  </label>
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
  <label className="form-label">
    Purchase Price <span className="text-danger">*</span>
  </label>
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
  <label className="form-label">
    Sale Price <span className="text-danger">*</span>
  </label>
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
</>
)}

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
        <div className="row mb-3">
  
</div>
       <ReusableTable
  data={combinedProducts}
  columns={tableColumns}
  loading={status === "loading"}
  searchable={true}

  searchTerm1={searchNameSku}
  searchTerm2={searchCategory}
  searchTerm3={searchMRP}

  onSearchChange1={setSearchNameSku}
  onSearchChange2={setSearchCategory}
  onSearchChange3={setSearchMRP}

  searchPlaceholder1="Search by Name or SKU"
  searchPlaceholder2="Search by Category or Subcategory"
  searchPlaceholder3="Search by MRP"

  actions={tableActions}
  onActionClick={handleTableAction}
  emptyMessage="No products found."
  onResetSearch={handlereset}
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
