import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {fetchCategories,addCategory,deleteCategory,} from "../redux/categorySlice";
import { setAuthToken } from "../services/userService";
import { updateCategory } from "../redux/categorySlice";
import HistoryModal from "../components/HistoryModal";
import ReusableTable, { createCustomRoleActions,} from "../components/ReusableTable"; 
import API from "../api/axiosInstance";
const Category = () => {
  const dispatch = useDispatch();
  const { items: categories, status } = useSelector(
    (state) => state.categories
  );
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role || "user";
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [form, setForm] = useState({
    parental_id: "",
    name: "",
    code: "",
    subcategory: "",
    brand: "",
    status: false,
  });
  const categoryData = {
    Pharmacy: {
      Medicines: [
        "Cipla",
        "Sun Pharma",
        "Dr. Reddy's",
        "Torrent",
        "Lupin",
        "Zydus",
        "Glenmark",
        "Mankind",
        "Intas",
        "Alkem",
      ],
      BabyCare: [
        "Johnson's Baby",
        "Himalaya Baby",
        "Sebamed",
        "Pigeon",
        "Mee Mee",
      ],
      PersonalCare: [
        "Nivea",
        "Dove",
        "Himalaya",
        "Garnier",
        "Pond's",
        "Vaseline",
        "Fiama",
      ],
    },
  };
  const [subcategories, setSubcategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [searchCode, setSearchCode] = useState("");
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyInfo, setHistoryInfo] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.token) {
      console.error("No user found Please Login");
    }
    const token = user.token;
    setAuthToken(token);
    dispatch(fetchCategories());
  }, [dispatch]);
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
    const payload = { ...form, brands: form.brand ? [form.brand] : [] };
    try {
      if (editingCategory) {
        await dispatch(
          updateCategory({ id: editingCategory, updatedData: payload })
        ).unwrap();
        setEditingCategory(null);
        console.log("Category Updated Successfully");
      } else {
        await dispatch(addCategory(payload)).unwrap();
        console.log("Category Added Successfully");
      }
      dispatch(fetchCategories());
      setForm({
        parental_id: "",
        name: "",
        code: "",
        subcategory: "",
        brand: "",
        status: false,
      });
      setSubcategories([]);
      setBrands([]);
      setShowCategoryForm(false);
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };
  const filteredCategories = categories.filter((c) => {
    const name = c.name?.toLowerCase() || "";
    const code = c.code?.toLowerCase() || "";
    const matchName =
      searchName.trim() === "" || name.includes(searchName.toLowerCase());
    const matchCode =
      searchCode.trim() === "" || code.includes(searchCode.toLowerCase());
    return matchName && matchCode;
  });
  const uniqueCategories = filteredCategories.filter(
    (c, index, self) => index === self.findIndex((obj) => obj._id === c._id)
  );

  const handleDelete = async (id) => {
    dispatch(deleteCategory(id));
  };

  const handleEdit = (category) => {
    setEditingCategory(category._id);
    setForm({
      parental_id: category.parental_id || "",
      name: category.name || "",
      code: category.code || "",
      subcategory: category.subcategory || "",
      brand: category.brand || "",
      status: category.status || false,
    });

    if (category.name && categoryData[category.name]) {
      setSubcategories(Object.keys(categoryData[category.name]));
      if (
        category.subcategory &&
        categoryData[category.name][category.subcategory]
      ) {
        setBrands(categoryData[category.name][category.subcategory]);
      }
    }
    setShowCategoryForm(true);
  };

  const handleCloseForm = () => {
    setShowCategoryForm(false);
    setEditingCategory(null);
    setForm({
      parental_id: "",
      name: "",
      code: "",
      subcategory: "",
      brand: "",
      status: false,
    });
    setSubcategories([]);
    setBrands([]);
  };

  const tableColumns = [
    {
      key: "parental_id",
      header: "Category ID",
      headerStyle: { width: "120px" },
    },
    {
      key: "name",
      header: "Category Name",
      headerStyle: { width: "150px" },
    },
    {
      key: "subcategory",
      header: "Subcategory",
      render: (category) => category.subcategory || "-",
    },
    {
      key: "brands",
      header: "Brand",
      render: (category) => category.brands?.join(", ") || "-",
    },
    {
      key: "code",
      header: "Category Code",
      headerStyle: { width: "120px" },
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

  const handleTableAction = (actionType, category) => {
    if (actionType === "edit") {
      handleEdit(category);
    } else if (actionType === "delete") {
      handleDelete(category._id);
    } else if (actionType === "history") handleHistory(category);
  };

  const handleHistory = async (category) => {
    if (!category?._id) {
      console.error("Category ID missing:", category);
      setHistoryInfo({
        createdBy:
          category?.created_by?.name ||
          category?.created_by?.username ||
          category?.created_by?.email ||
          "Unknown",
        createdAt: category?.createdAt || null,
        updatedBy: "-",
        updatedAt: null,
        oldValues: null,
        newValues: category,
      });
      setShowHistoryModal(true);
      return;
    }
    try {
      const res = await API.get(`/categories/${category._id}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });

      const c = res.data;
      const createdByUser =
        c?.created_by?.name ||
        c?.created_by?.username ||
        c?.created_by?.email ||
        "Unknown";
      const updatedByUser =
        c?.updated_by?.name ||
        c?.updated_by?.username ||
        c?.updated_by?.email ||
        "-";
      setHistoryInfo({
        createdBy: createdByUser,
        createdAt: c?.createdAt || category?.createdAt || null,
        updatedBy: updatedByUser,
        updatedAt: c?.updatedAt || null,
        oldValues: c?.oldValues || null,
        newValues: c?.newValues || c,
      });
    } catch (err) {
      console.warn(`Failed to fetch category history ${category._id}:`, err);
      setHistoryInfo({
        createdBy:
          category?.created_by?.name ||
          category?.created_by?.username ||
          category?.created_by?.email ||
          "Unknown",
        createdAt: category?.createdAt || null,
        updatedBy:
          category?.updated_by?.name ||
          category?.updated_by?.username ||
          category?.updated_by?.email ||
          "-",
        updatedAt: category?.updatedAt || null,
        oldValues: null,
        newValues: category,
      });
    } finally {
      setShowHistoryModal(true);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4 d-flex align-items-center fs-3">
        <b>Categories</b>
      </h2>
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex gap-2">
            {["super_admin", "admin"].includes(role) && (
              <button
                className="btn add text-white d-flex align-items-center"
                onClick={() => setShowCategoryForm(true)}
              >
                Add Category
              </button>
            )}
          </div>
        </div>
      </div>
      {showCategoryForm && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header  text-white">
                <h5 className="modal-title">
                  {editingCategory ? "Edit Category" : "Add New Category"}
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
                      Category ID<span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      className="form-control bg-light"
                      name="parental_id"
                      value={form.parental_id}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">
                      Category Name<span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-control"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                    >
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
                    <input
                      type="text"
                      className="form-control bg-light"
                      name="code"
                      value={form.code}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  {subcategories.length > 0 && (
                    <div className="col-md-6">
                      <label className="form-label">
                        Subcategory<span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-control"
                        name="subcategory"
                        value={form.subcategory}
                        onChange={handleChange}
                        required
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
                  {brands.length > 0 && (
                    <div className="col-md-6">
                      <label className="form-label">Brand</label>
                      <select
                        className="form-control"
                        name="brand"
                        value={form.brand}
                        onChange={handleChange}
                      >
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
                    <input
                      type="checkbox"
                      className="form-check-input"
                      name="status"
                      checked={form.status}
                      onChange={handleChange}
                    />
                    <label className="form-check-label">Status</label>
                  </div>
                  <div className="col-12 d-flex justify-content-end gap-2 mt-3">
                    <button
                      type="submit"
                      className="btn add text-white d-flex align-items-center"
                    >
                      {editingCategory ? "Update Category" : "Add Category"}
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
        data={filteredCategories}
        columns={tableColumns}
        loading={status === "loading"}
        searchable={true}
        searchTerm1={searchName}
        searchTerm2={searchCode}
        onSearchChange1={setSearchName}
        onSearchChange2={setSearchCode}
        searchPlaceholder1="Search by Category Name"
        searchPlaceholder2="Search by Category Code"
        actions={tableActions}
        onActionClick={handleTableAction}
        emptyMessage="No categories found."
        onResetSearch={() => {
          setSearchName("");
          setSearchCode("");
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

export default Category;
