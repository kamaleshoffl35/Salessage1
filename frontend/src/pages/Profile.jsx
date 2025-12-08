import React, { useState, useEffect } from "react";
import { getMe, setUserHeader } from "../services/userService";
import axios from "axios";
import { FaUser } from "react-icons/fa";

export default function Profile({ show, onClose }) {
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!show) return;
    const stored = localStorage.getItem("user");
    if (stored) {
      setUser(JSON.parse(stored));
    } else {
      const id = localStorage.getItem("userId");
      if (id) {
        (async () => {
          const u = await getMe(id);
          setUser(u);
          localStorage.setItem("user", JSON.stringify(u));
          setUserHeader(id);
        })();
      }
    }
  }, [show]);

  const handleChange = (e) =>
    setUser({ ...user, [e.target.name]: e.target.value });

  const save = async () => {
    try {
      setSaving(true);
      const res = await axios.put(
        `http://localhost:5000/api/users/${user._id}`,
        user
      );
      localStorage.setItem("user", JSON.stringify(res.data));
      setUser(res.data);
      alert("Saved");
      onClose();
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!show) return null;
  if (!user)
    return (
      <div className="modal d-block" tabIndex="-1">
        <div className="modal-dialog modal-sm modal-dialog-centered">
          <div className="modal-content p-3">Loading...</div>
        </div>
      </div>
    );

  return (
    <div className="modal d-block" tabIndex="-1">
      <div className="modal-dialog modal-sm modal-dialog-centered ">
        <div
          className="modal-content p-3"
          style={{ }}
        >
          <div className="modal-header" style={{backgroundColor:"#182235"}}>
            <h5 className="modal-title text-white mb-4 d-flex align-items-center fs-5">
              <span className="me-2 d-flex align-items-center">
                <FaUser size={24} />
              </span>{" "}
              User Profile
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <div className="mb-2">
              <label className="form-label">Name</label>
              <input
                className="form-control"
                name="name"
                value={user.name}
                onChange={handleChange}
              />
            </div>
            <div className="mb-2">
              <label className="form-label">Email</label>
              <input
                className="form-control"
                name="email"
                value={user.email}
                onChange={handleChange}
              />
            </div>
            <div className="mb-2">
              <label className="form-label">Phone</label>
              <input
                className="form-control"
                name="phone"
                value={user.phone || ""}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
            <button
              className="btn text-white" style={{backgroundColor:"#182235"}}
              onClick={save}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
