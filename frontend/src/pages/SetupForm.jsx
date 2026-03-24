import { useEffect, useState } from "react";
import API from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";

const SetupForm = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    tagline: "",
    description: "",
    logo: "",
    phone: "",
    email: "",
    address: "",
    socialLinks: {
      instagram: "",
      whatsapp: "",
      facebook: "",
    },
    footerDescription: "",
    footerCardImage: "",
    quickLinks: [],
    customerCare: { phone: "", email: "" },
    categories: [],
    extraFields: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/setup")
      .then((res) => {
        if (res.data) setForm(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleNestedChange = (section, key, value) => {
    setForm({
      ...form,
      [section]: { ...form[section], [key]: value },
    });
  };

  // QUICK LINKS
  const addQuickLink = () => {
    setForm({
      ...form,
      quickLinks: [...form.quickLinks, { name: "", url: "" }],
    });
  };

  const handleQuickLinkChange = (i, key, value) => {
    const updated = [...form.quickLinks];
    updated[i][key] = value;
    setForm({ ...form, quickLinks: updated });
  };

  // CATEGORIES
  const addCategory = () => {
    setForm({
      ...form,
      categories: [...form.categories, ""],
    });
  };

  const handleCategoryChange = (i, value) => {
    const updated = [...form.categories];
    updated[i] = value;
    setForm({ ...form, categories: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await API.post("/setup", form);
    navigate("/");
  };

  if (loading) return <p className="text-center mt-5">Loading...</p>;

  return (
    <div className="d-flex justify-content-center" style={{ background: "#eef2f7", minHeight: "100vh" }}>
      <div className="card p-4 shadow-lg mt-4 mb-4" style={{ width: "700px" }}>

        <h3 className="text-center fw-bold">Company Setup & Branding</h3>

        <form onSubmit={handleSubmit}>

          {/* 🏢 COMPANY */}
          <h5 className="mt-3 text-primary">Company</h5>
          <input className="form-control mb-2" name="title" placeholder="Company Name"
            value={form.title} onChange={handleChange} required />

          <input className="form-control mb-2" name="tagline" placeholder="Tagline"
            value={form.tagline} onChange={handleChange} />

          <input className="form-control mb-2" name="logo" placeholder="Logo URL"
            value={form.logo} onChange={handleChange} />

          <textarea className="form-control mb-3" name="description"
            placeholder="Description"
            value={form.description} onChange={handleChange} />

          {/* 📞 CONTACT */}
          <h5 className="text-primary">Contact</h5>
          <input className="form-control mb-2" name="phone" placeholder="Phone"
            value={form.phone} onChange={handleChange} />

          <input className="form-control mb-2" name="email" placeholder="Email"
            value={form.email} onChange={handleChange} />

          <input className="form-control mb-3" name="address" placeholder="Address"
            value={form.address} onChange={handleChange} />

          {/* 🌐 SOCIAL */}
          <h5 className="text-primary">Social Media</h5>
          <input className="form-control mb-2" placeholder="Instagram"
            value={form.socialLinks.instagram}
            onChange={(e) => handleNestedChange("socialLinks", "instagram", e.target.value)} />

          <input className="form-control mb-2" placeholder="WhatsApp"
            value={form.socialLinks.whatsapp}
            onChange={(e) => handleNestedChange("socialLinks", "whatsapp", e.target.value)} />

          <input className="form-control mb-3" placeholder="Facebook"
            value={form.socialLinks.facebook}
            onChange={(e) => handleNestedChange("socialLinks", "facebook", e.target.value)} />

          {/* 🦶 FOOTER */}
          <h5 className="text-primary">Footer</h5>
          <textarea className="form-control mb-2" name="footerDescription"
            placeholder="Footer Description"
            value={form.footerDescription} onChange={handleChange} />

          <input className="form-control mb-3" name="footerCardImage"
            placeholder="Footer Card Image URL"
            value={form.footerCardImage} onChange={handleChange} />

          {/* 🔗 QUICK LINKS */}
          <h5 className="text-primary">Quick Links</h5>
          {form.quickLinks.map((l, i) => (
            <div key={i} className="d-flex gap-2 mb-2">
              <input className="form-control" placeholder="Name"
                value={l.name}
                onChange={(e) => handleQuickLinkChange(i, "name", e.target.value)} />

              <input className="form-control" placeholder="URL"
                value={l.url}
                onChange={(e) => handleQuickLinkChange(i, "url", e.target.value)} />
            </div>
          ))}
          <button type="button" className="btn btn-outline-secondary mb-3" onClick={addQuickLink}>
            + Add Link
          </button>

          {/* 🛒 CATEGORIES */}
          <h5 className="text-primary">Categories</h5>
          {form.categories.map((c, i) => (
            <input key={i} className="form-control mb-2"
              value={c}
              placeholder="Category"
              onChange={(e) => handleCategoryChange(i, e.target.value)} />
          ))}
          <button type="button" className="btn btn-outline-secondary mb-3" onClick={addCategory}>
            + Add Category
          </button>

          {/* 👩‍💼 CUSTOMER CARE */}
          <h5 className="text-primary">Customer Care</h5>
          <input className="form-control mb-2" placeholder="Care Phone"
            value={form.customerCare.phone}
            onChange={(e) => handleNestedChange("customerCare", "phone", e.target.value)} />

          <input className="form-control mb-3" placeholder="Care Email"
            value={form.customerCare.email}
            onChange={(e) => handleNestedChange("customerCare", "email", e.target.value)} />

          <button className="btn btn-primary w-100">Save</button>
        </form>
      </div>
    </div>
  );
};

export default SetupForm;