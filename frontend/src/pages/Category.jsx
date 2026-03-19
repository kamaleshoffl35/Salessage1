import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from "../redux/categorySlice";

import ReusableTable from "../components/ReusableTable";
import AddButton from "../components/AddButton";
import useTableActions from "../components/useTableActions";

const Category = () => {
  const dispatch = useDispatch();

  const { items } = useSelector((state) => state.categories);

  const role = "admin";
  const actions = useTableActions(role);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const [search1, setSearch1] = useState("");
  const [search2, setSearch2] = useState("");
  const [search3, setSearch3] = useState("");

  const [form, setForm] = useState({
    category_name: "",
    subcategory: "",
    subcategory1: [],
    status: true,
  });

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editing) {
      await dispatch(updateCategory({ id: editing, data: form }));
    } else {
      await dispatch(addCategory(form));
    }

    setShowForm(false);
    setEditing(null);

    setForm({
      category_name: "",
      subcategory: "",
      subcategory1: [],
      status: true,
    });
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete Category?")) {
      dispatch(deleteCategory(id));
    }
  };

  const handleEdit = (cat) => {
    setEditing(cat._id);

    setForm({
      category_name: cat.category_name,
      subcategory: cat.subcategory,
      subcategory1: cat.subcategory1 || [],
      status: cat.status,
    });

    setShowForm(true);
  };

  const handleActionClick = (type, data) => {
    if (type === "edit") handleEdit(data);
    if (type === "delete") handleDelete(data._id);
  };

  const handleReset = () => {
    setSearch1("");
    setSearch2("");
    setSearch3("");
  };

  const filteredData = items.filter((c) => {
    return (
      c.category_name?.toLowerCase().includes(search1.toLowerCase()) &&
      c.subcategory?.toLowerCase().includes(search2.toLowerCase()) &&
      (c.subcategory1?.join(",").toLowerCase() || "").includes(
        search3.toLowerCase()
      )
    );
  });

  const columns = [
    { key: "category_name", header: "Category" },
    { key: "subcategory", header: "Subcategory" },
    {
      key: "subcategory1",
      header: "Subcategory 1",
      flex: 5,
      render: (c) => c.subcategory1?.join(", "),
    },
  ];

  return (
    <div className="container mt-4">
      <h2 className="mb-4 d-flex align-items-center fs-3">
        <b>Categories</b>
      </h2>
      <div className="mb-3">
        <AddButton text="Add Category" onClick={() => setShowForm(true)} />
      </div>

      <ReusableTable
        data={filteredData}
        columns={columns}
        actions={actions}
        onActionClick={handleActionClick}

        searchable={true}

        searchTerm1={search1}
        searchTerm2={search2}
        searchTerm3={search3}

        onSearchChange1={setSearch1}
        onSearchChange2={setSearch2}
        onSearchChange3={setSearch3}

        searchPlaceholder1="Search Category"
        searchPlaceholder2="Search Subcategory"
        searchPlaceholder3="Search Subcategory1"

        showThirdSearch={true}

        onResetSearch={handleReset}
      />

      {showForm && (
        <div className="modal show d-block">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">

              <div className="modal-header text-white" style={{ background: "#1e293b" }}>
                <h5 className="modal-title">
                  {editing ? "Edit Category" : "Add Category"}
                </h5>

                <button
                  className="btn-close btn-close-white"
                  onClick={() => setShowForm(false)}
                />
              </div>

              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">

                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Category Name *
                      </label>

                      <input
                        type="text"
                        className="form-control"
                        name="category_name"
                        value={form.category_name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Subcategory</label>

                      <input
                        type="text"
                        className="form-control"
                        name="subcategory"
                        value={form.subcategory}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Subcategory 1
                      </label>

                      <input
                        type="text"
                        className="form-control"
                        placeholder="comma separated"
                        onChange={(e) =>
                          setForm({
                            ...form,
                            subcategory1: e.target.value.split(","),
                          })
                        }
                      />
                    </div>

                    <div className="col-md-6 mb-3 d-flex align-items-end">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          name="status"
                          checked={form.status}
                          onChange={handleChange}
                        />

                        <label className="form-check-label">
                          Active Status
                        </label>
                      </div>
                    </div>

                  </div>

                  <div className="d-flex justify-content-end gap-2">
                    <button className="btn btn-dark">
                      {editing ? "Update" : "Add"}
                    </button>

                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowForm(false)}
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
    </div>
  );
};

export default Category;