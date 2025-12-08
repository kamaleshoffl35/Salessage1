import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import logo from "../assets/Logo.png";
import { AiOutlineDashboard } from "react-icons/ai";
import { MdProductionQuantityLimits, MdOutlineCategory, MdOutlineAttachMoney, MdOutlineWarehouse, MdAttachMoney, MdOutlineInventory2 } from "react-icons/md";
import { IoIosContact } from "react-icons/io";
import { BiPurchaseTag } from "react-icons/bi";
import { TbFileInvoice, TbReportSearch } from "react-icons/tb";
import { GiTakeMyMoney, GiMoneyStack } from "react-icons/gi";
import { PiShippingContainer } from "react-icons/pi";
import { FaArrowLeft } from "react-icons/fa";
import UserProfile from "../components/UserProfile";

import DashboardSummary from "./DashboardSummary";

export default function Dashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false); 
  const currentYear = new Date().getFullYear();

const [dateTime, setDateTime] = useState(() => {
    const now = new Date();
    return now.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "medium",
      hour12: false
    });
  });

  useEffect(() => {
    const id = setInterval(() => {
      const now = new Date();
      setDateTime(
        now.toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "medium",
          hour12: false
        })
      );
    }, 1000);

    return () => clearInterval(id);
  }, []);

  
  const modules = [
    { name: "Dashboard", path: "/", icon: <AiOutlineDashboard />, roles: ["super_admin", "admin", "user"] },
    // { name: "Manage Users", path: "/users", icon: <AiOutlineDashboard />, roles: ["super_admin"] },
    { name: "Products", path: "/products", icon: <MdProductionQuantityLimits />, roles: ["super_admin", "admin", "user"] },
    { name: "Categories", path: "/categories", icon: <MdOutlineCategory />, roles: ["super_admin", "admin", "user"] },
    // { name: "Units", path: "/units", icon: <LiaWeightSolid />, roles: ["super_admin", "admin"] },
    { name: "Tax Rates", path: "/taxes", icon: <MdOutlineAttachMoney />, roles: ["super_admin", "admin", "user"] },
    { name: "Customers", path: "/customers", icon: <IoIosContact />, roles: ["super_admin", "admin", "user"] },
    { name: "Suppliers", path: "/suppliers", icon: <IoIosContact />, roles: ["super_admin", "admin", "user"] },
    { name: "Warehouses", path: "/warehouses", icon: <MdOutlineWarehouse />, roles: ["super_admin", "admin", "user"] },
    { name: "Purchases", path: "/purchases", icon: <BiPurchaseTag />, roles: ["super_admin", "admin", "user"] },
    { name: "Sales", path: "/sales", icon: <TbFileInvoice />, roles: ["super_admin", "admin", "user"] },
    { name: "Customer Receipts", path: "/cus_receipts", icon: <MdAttachMoney />, roles: ["super_admin", "admin",] },
    { name: "Supplier Receipts", path: "/sub_receipts", icon: <GiTakeMyMoney />, roles: ["super_admin", "admin",] },
    { name: "Stock Adjustments", path: "/stocks", icon: <PiShippingContainer />, roles: ["super_admin", "admin", "user"] },
    { name: "Stock Ledger", path: "/stockledger", icon: <MdOutlineInventory2 />, roles: ["super_admin", "admin", "user"] },
    { name: "Expense", path: "/expenses", icon: <GiMoneyStack />, roles: ["super_admin", "admin", "user"] },
    { name: "Reports", path: "/reports", icon: <TbReportSearch />, roles: ["super_admin", "admin", "user"] },
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleMenuClick = (path) => {
    navigate(path);
  };

  const userRole = JSON.parse(localStorage.getItem("user"))?.role;

  return (
    <div className="d-flex flex-column vh-100">
      <nav className="navbar navbar-expand-lg navbar-dark bg-white shadow" >
        <div className="container-fluid">
          <button className="btn btn-outline-light me-3 text-success" onClick={toggleSidebar}>
            {sidebarOpen ? <FaArrowLeft className="text-dark" /> : "☰"}
          </button>

          <a className="navbar-brand d-flex align-items-center gap-3" href="#">
            <img src={logo} alt="Logo" className="me-2" style={{ height: "50px" }} />
            <span className="fw-bold fs-4 text-black" >SALESSAGE</span>
          </a>

          <div className="ms-auto d-flex align-items-center gap-2">

              <div className="d-flex align-items-center me-2">
  <span
    className="text-muted small"
    style={{ whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}
  >
    {dateTime}
  </span>
</div>
            <UserProfile />

          </div>
        </div>
      </nav>

      <div className="d-flex flex-grow-1">
        {sidebarOpen && (
          <div className="p-3"
            style={{
              width: "280px",
              background: "linear-gradient(180deg, #1e293b, #0f172a)",
              color: "white",
              transition: "width 0.3s ease",
            }}
          >
            <div className="list-group list-group-flush text-center">
              {modules.filter((m) => m.roles.includes(userRole)).map((m) => (
                <div
                  key={m.path}
                  onClick={() => handleMenuClick(m.path)}
                  className="list-group-item border-0 list-group-item-action bg-transparent text-light hover-bg-light d-flex align-items-center gap-2"
                  style={{ cursor: "pointer", padding: "0.75rem 1rem" }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <span style={{ width: "24px" }}>{m.icon}</span>
                    <span >{m.name}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>

        )}

        <div className="flex-grow-1 p-4 overflow-auto" style={{ backgroundColor: "#3d4e6eff" }}>

          <div className={`${window.location.pathname === "/" ? "p-0 border-0 shadow-none bg-transparent" : "bg-white border rounded shadow-sm p-4 h-100"}`}>
            {window.location.pathname === "/" && <DashboardSummary />}
            <Outlet />
          </div>
        </div>
      </div>

      <footer className="footer bg-light py-2 shadow-sm mt-auto" style={{ borderTop: "1px solid #dee2e6" }}>
        <div className="container-fluid text-center">
          <p className="mb-0 text-muted small">
            &copy; {currentYear} Vyoobam Tech. All rights reserved. | Empowering Digital Solutions
          </p>
        </div>
      </footer>

      <style>{`
        .hover-bg-light:hover {
          background-color: rgba(255, 255, 255, 0.1) !important;
          color: #f8fafc !important;
          border-radius: 0.5rem;
          transition: background-color 0.2s ease, color 0.2s ease;
        }
      `}</style>

    </div>
  );
}
