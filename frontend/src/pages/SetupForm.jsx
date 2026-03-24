import { useEffect, useState } from "react";
import API from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";

const SetupForm = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    phone: "",
    email: "",
    address: "",
    extraFields: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/setup")
      .then((res) => {
        if (res.data) {
          setForm(res.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const addField = () => {
    setForm({
      ...form,
      extraFields: [...form.extraFields, { label: "", value: "" }],
    });
  };

  const handleExtraChange = (index, key, value) => {
    const updated = [...form.extraFields];
    updated[index][key] = value;
    setForm({ ...form, extraFields: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await API.post("/setup", form);
    navigate("/");
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="container mt-4">
      <div className="card p-4">
        <h4 className="mb-3">Setup Details</h4>

        <form onSubmit={handleSubmit}>
          <input className="form-control mb-2" name="title" placeholder="Title"
            value={form.title} onChange={handleChange} required />

          <textarea className="form-control mb-2" name="description"
            placeholder="Description"
            value={form.description} onChange={handleChange} />

          <input className="form-control mb-2" name="phone"
            placeholder="Phone"
            value={form.phone} onChange={handleChange} />

          <input className="form-control mb-2" name="email"
            placeholder="Email"
            value={form.email} onChange={handleChange} />

          <input className="form-control mb-2" name="address"
            placeholder="Address"
            value={form.address} onChange={handleChange} />

          <h6>Extra Fields</h6>

          {form.extraFields.map((f, i) => (
            <div key={i} className="d-flex gap-2 mb-2">
              <input
                className="form-control"
                placeholder="Label"
                value={f.label}
                onChange={(e) =>
                  handleExtraChange(i, "label", e.target.value)
                }
              />
              <input
                className="form-control"
                placeholder="Value"
                value={f.value}
                onChange={(e) =>
                  handleExtraChange(i, "value", e.target.value)
                }
              />
            </div>
          ))}

          <button type="button" className="btn btn-secondary mb-3" onClick={addField}>
            + Add Field
          </button>

          <button className="btn btn-primary w-100">Save</button>
        </form>
      </div>
    </div>
  );
};

export default SetupForm;