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
    modules: [],
    socialLinks: {
      instagram: "",
      whatsapp: "",
      facebook: "",
    },
    footerDescription: "",
    footerCardImage: "",
     developedBy: "",   
  copyright: "", 
  offers: [],
    quickLinks: [],
  customerCare: [],
    categories: [],
    extraFields: [],
  });

  const [loading, setLoading] = useState(true);
const [isEdit, setIsEdit] = useState(false);
  useEffect(() => {
    API.get("/setup")
      .then((res) => {
        if (res.data) 
            setForm(res.data);
        setIsEdit(true)
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

  const addQuickLink = () => {
    setForm({
      ...form,
      quickLinks: [...form.quickLinks, { name: ""}],
    });
  };

const handleQuickLinkChange = (i, value) => {
  const updated = [...form.quickLinks];
  updated[i].name = value;
  setForm({ ...form, quickLinks: updated });
};

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

  const formData = new FormData();

  Object.keys(form).forEach((key) => {
    if (key === "logo" || key === "footerCardImage") {
      if (form[key] instanceof File) {
        formData.append(key, form[key]); 
      }
    } else {
      formData.append(key, JSON.stringify(form[key]));
    }
  });

  if (isEdit) {
    await API.post("/setup", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  } else {
    await API.post("/setup", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
  navigate("/");
};

  const addModule = () => {
  setForm({
    ...form,
    modules: [...form.modules, { name: "", subModules: [] }],
  });
};

const handleModuleChange = (i, key, value) => {
  const updated = [...form.modules];
  updated[i][key] = value;
  setForm({ ...form, modules: updated });
};
const addSubModule = (i) => {
  const updated = [...form.modules];
  updated[i].subModules.push({ name: "" });
  setForm({ ...form, modules: updated });
};

const handleSubModuleChange = (i, j, value) => {
  const updated = [...form.modules];
  updated[i].subModules[j].name = value;
  setForm({ ...form, modules: updated });
};

const addOffer = () => {
  setForm({
    ...form,
    offers: [...form.offers, { description: "" }],
  });
};

const handleOfferChange = (i, value) => {
  const updated = [...form.offers];
  updated[i].description = value;
  setForm({ ...form, offers: updated });
};
  if (loading) return <p className="text-center mt-5">Loading...</p>;

  const addCustomerCare = () => {
  setForm({
    ...form,
    customerCare: [...form.customerCare, { phone: "", email: "" }],
  });
};

const handleCustomerCareChange = (i, key, value) => {
  const updated = [...form.customerCare];
  updated[i][key] = value;
  setForm({ ...form, customerCare: updated });
};
 return (
  <div className="container-fluid px-4 mt-3">
    <div className="card shadow-lg p-4">
      <h3 className="fw-bold mb-4">Company Setup & Branding</h3>
      <form className="row g-4" onSubmit={handleSubmit}>
        <div className="col-md-4">
          <label>Company Name</label>
          <input
            className="form-control bg-light"
            name="title"
            value={form.title}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-4">
          <label>Tagline</label>
          <input
            className="form-control bg-light"
            name="tagline"
            value={form.tagline}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-4">
          <label>Logo</label>
          <input
            type="file"
            className="form-control bg-light"
            onChange={(e) =>
              setForm({ ...form, logo: e.target.files[0] })
            }
          />
        </div>
        <div className="col-12">
          <label>Description</label>
          <textarea
            className="form-control bg-light"
            rows="3"
            name="description"
            value={form.description}
            onChange={handleChange}
          />
        </div>
 <label>Contact Details</label>
        <div className="col-md-4">
             
          <input className="form-control bg-light" placeholder="Phone" name="phone"
            value={form.phone} onChange={handleChange} />
        </div>

        <div className="col-md-4">
          <input className="form-control bg-light" placeholder="Email" name="email"
            value={form.email} onChange={handleChange} />
        </div>

        <div className="col-md-4">
          <input className="form-control bg-light" placeholder="Address" name="address"
            value={form.address} onChange={handleChange} />
        </div>
 <label>Social Links</label>
        <div className="col-md-4">
          <input className="form-control bg-light" placeholder="Instagram"
            value={form.socialLinks.instagram}
            onChange={(e) =>
              handleNestedChange("socialLinks", "instagram", e.target.value)
            }
          />
        </div>

        <div className="col-md-4">
          <input className="form-control bg-light" placeholder="WhatsApp"
            value={form.socialLinks.whatsapp}
            onChange={(e) =>
              handleNestedChange("socialLinks", "whatsapp", e.target.value)
            }
          />
        </div>

        <div className="col-md-4">
          <input className="form-control bg-light" placeholder="Facebook"
            value={form.socialLinks.facebook}
            onChange={(e) =>
              handleNestedChange("socialLinks", "facebook", e.target.value)
            }
          />
        </div>
<div className="col-12">
  <div className="row">
    <div className="col-md-4">
      <label>Quick Links</label>

      {form.quickLinks.map((l, i) => (
        <div key={i} className="mb-2">
          <input
            className="form-control bg-light"
            placeholder="Quick Link Name"
            value={l.name}
            onChange={(e) =>
              handleQuickLinkChange(i, e.target.value)
            }
          />
        </div>
      ))}

      <button
        type="button"
        className="btn btn-sm btn-outline-secondary"
        onClick={addQuickLink}
      >
    Add Link
      </button>
    </div>
    <div className="col-md-4">
      <label>Modules</label>

      {form.modules.map((mod, i) => (
        <div key={i} className="border p-2 mb-2 rounded">

          <input
            className="form-control bg-light mb-2"
            placeholder="Module Name"
            value={mod.name}
            onChange={(e) =>
              handleModuleChange(i, "name", e.target.value)
            }
          />

          {mod.subModules.map((sub, j) => (
            <input
              key={j}
              className="form-control bg-light mb-1"
              placeholder="Sub Module"
              value={sub.name}
              onChange={(e) =>
                handleSubModuleChange(i, j, e.target.value)
              }
            />
          ))}

          <button
            type="button"
            className="btn btn-sm btn-outline-secondary mt-1"
            onClick={() => addSubModule(i)}
          >
            Sub
          </button>
        </div>
      ))}

      <button
        type="button"
        className="btn btn-sm btn-outline-secondary"
        onClick={addModule}
      >
        Add Module
      </button>
    </div>

    <div className="col-md-4">
      <label>Offers</label>

      {form.offers.map((offer, i) => (
        <textarea
          key={i}
          className="form-control bg-light mb-2"
          placeholder="Offer Description"
          value={offer.description}
          onChange={(e) =>
            handleOfferChange(i, e.target.value)
          }
        />
      ))}

      <button
        type="button"
        className="btn btn-sm btn-outline-secondary"
        onClick={addOffer}
      >
        Add Offer
      </button>
    </div>

  </div>
</div>
        <div className="col-md-6">
          <input className="form-control bg-light" placeholder="Developed By"
            name="developedBy"
            value={form.developedBy}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-6">
          <input className="form-control bg-light" placeholder="Copyright"
            name="copyright"
            value={form.copyright}
            onChange={handleChange}
          />
        </div>
<div className="col-md-6">
  <label>Footer Description</label>
  <textarea
    className="form-control bg-light"
    rows="2"
    name="footerDescription"
    value={form.footerDescription}
    onChange={handleChange}
  />
</div>
<div className="col-md-6">
  <label>Footer Card Image</label>
  <input
    type="file"
    className="form-control bg-light"
    onChange={(e) =>
      setForm({ ...form, footerCardImage: e.target.files[0] })
    }
  />
</div>
        <div className="col-12 text-end">
          <button className="btn add text-white px-4">
  {isEdit ? "Update Setup" : "Save Setup"}
</button>
        </div>

      </form>
    </div>
  </div>
);
};

export default SetupForm;