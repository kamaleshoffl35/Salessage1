import React, { useState, useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";
import { getMe, setUserHeader } from "../services/userService";
import { useNavigate } from "react-router-dom";
import Profile from "../pages/Profile";
import { useRef } from "react";
const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef();
  useEffect(() => {
    const stored = localStorage.getItem("user");
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    if (stored && token) {
      setUser(JSON.parse(stored));
      setUserHeader(token);
    } else if (token) {
      (async () => {
        try {
          const fetched = await getMe();
          setUser(fetched);
          setUserHeader(token);
          localStorage.setItem("user", JSON.stringify(fetched));
        } catch (err) {
          console.error("Could not fetch user:", err);
        }
      })();
    }

    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    setUserHeader(null);
    setUser(null);
    navigate("/login");
  };

  const [showProfile, setShowProfile] = useState(false);

  return (
    <div ref={ref} className="position-relative">
      <button
        className="btn d-flex align-items-center gap-2 text-black"
        onClick={() => setOpen((o) => !o)}
        style={{
          background: "transparent",
          border: "none",
          color: "#072141",
          cursor: "pointer",
        }}
      >
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt="avatar"
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
        ) : (
          <FaUserCircle size={28} />
        )}
        <span className="d-none d-md-inline text-black">
          {user?.name || "User"}
        </span>
      </button>

      {open && (
        <div
          className="card shadow border-0"
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 8px)",
            zIndex: 999,
            width: "230px",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          <div className="card-body p-3" style={{ backgroundColor: "#ffffff" }}>
            <div className="d-flex gap-2 align-items-center mb-2">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="avatar"
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <FaUserCircle size={46} />
              )}
              <div>
                <div className="fw-bold">{user?.name}</div>
                <div className="text-muted" style={{ fontSize: 12 }}>
                  {user?.email}
                </div>
              </div>
            </div>
            <hr />
            <div
              className="d-flex flex-column gap-2"
              style={{ width: "200px" }}
            >
              <button
                className="btn  w-100 text-white "
                style={{ backgroundColor: "#182235" }}
                onClick={() => setShowProfile(true)}
              >
                View Profile
              </button>
              <button
                className="btn btn-sm btn-outline-danger w-100"
                onClick={handleLogout}
              >
                Logout
              </button>

              <Profile
                show={showProfile}
                onClose={() => setShowProfile(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
