import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/Logo.png";
import { AiOutlineDashboard } from "react-icons/ai";
import {MdProductionQuantityLimits,MdOutlineCategory,MdOutlineAttachMoney,MdOutlineWarehouse,MdAttachMoney,MdOutlineInventory2,} from "react-icons/md";
import { IoIosContact } from "react-icons/io";
import { BiPurchaseTag } from "react-icons/bi";
import { TbFileInvoice, TbReportSearch } from "react-icons/tb";
import { GiTakeMyMoney, GiMoneyStack } from "react-icons/gi";
import { FaArrowLeft } from "react-icons/fa";
import UserProfile from "../components/UserProfile";
import DashboardSummary from "./DashboardSummary";
import API from "../api/axiosInstance";
export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const currentYear = new Date().getFullYear();
  const [dateTime, setDateTime] = useState(() => {
    const now = new Date();
    return now.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "medium",
      hour12: false,
    });
  });
useEffect(() => {
  API.get("/users/me")
    .then((res) => setUser(res.data))
    .catch(() => navigate("/login"));
}, [navigate]);

  useEffect(() => {
    const id = setInterval(() => {
      const now = new Date();
      setDateTime(
        now.toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "medium",
          hour12: false,
        })
      );
    }, 1000);

    return () => clearInterval(id);
  }, []);
  const modules = [
    { name: "Dashboard", path: "/", icon: <AiOutlineDashboard />, roles: ["super_admin", "admin", "user"] },
    { name: "Products", path: "/products", icon: <MdProductionQuantityLimits />, roles: ["super_admin", "admin", "user"] },
    // { name: "Categories", path: "/categories", icon: <MdOutlineCategory />, roles: ["super_admin", "admin", "user"] },
    { name: "Tax Rates", path: "/taxes", icon: <MdOutlineAttachMoney />, roles: ["super_admin", "admin", "user"] },
    { name: "Customers", path: "/customers", icon: <IoIosContact />, roles: ["super_admin", "admin", "user"] },
    { name: "Suppliers", path: "/suppliers", icon: <IoIosContact />, roles: ["super_admin", "admin", "user"] },
    { name: "Warehouses", path: "/warehouses", icon: <MdOutlineWarehouse />, roles: ["super_admin", "admin", "user"] },
    { name: "Purchases", path: "/purchases", icon: <BiPurchaseTag />, roles: ["super_admin", "admin", "user"] },
    { name: "Sales", path: "/sales", icon: <TbFileInvoice />, roles: ["super_admin", "admin", "user"] },
    { name: "Sales Return", path: "/sales-returns", icon: <TbFileInvoice />, roles: ["super_admin", "admin", "user"] },
    { name: "Customer Receipts", path: "/cus_receipts", icon: <MdAttachMoney />, roles: ["super_admin", "admin"] },
    { name: "Supplier Receipts", path: "/sub_receipts", icon: <GiTakeMyMoney />, roles: ["super_admin", "admin"] },
    { name: "Stock Ledger", path: "/stockledger", icon: <MdOutlineInventory2 />, roles: ["super_admin", "admin", "user"] },
    { name: "Expense", path: "/expenses", icon: <GiMoneyStack />, roles: ["super_admin", "admin", "user"] },
    { name: "Reports", path: "/reports", icon: <TbReportSearch />, roles: ["super_admin", "admin", "user"] },
  ];
 const userRole = user?.role;

  const toggleSidebar = () => setSidebarOpen((o) => !o);
  const handleMenuClick = (path) => navigate(path);
  return (
    <div className="d-flex flex-column vh-100">
      <nav className="navbar navbar-expand-lg bg-white shadow-sm">
        <div className="container-fluid">
          <button className="btn me-3" onClick={toggleSidebar}>
            {sidebarOpen ? <FaArrowLeft /> : "☰"}
          </button>

          <div className="d-flex align-items-center gap-3">
            <img src={logo} alt="Logo" style={{ height: 50 }} />
            <span className="fw-bold fs-4">SALESSAGE</span>
          </div>

          <div className="ms-auto d-flex align-items-center gap-3">
            <span className="text-muted small">{dateTime}</span>
            <UserProfile />
          </div>
        </div>
      </nav>
      <div className="d-flex flex-grow-1">
        {sidebarOpen && userRole && (
          <aside
            style={{
              width: "18rem",
              background: "linear-gradient(180deg, #1e293b, #0f172a)",
              color: "white",
            }}
            className="p-3"
          >
            <div className="list-group list-group-flush">
              {modules
                .filter((m) => m.roles.includes(userRole))
                .map((m) => (
                  <div
                    key={m.path}
                    onClick={() => handleMenuClick(m.path)}
                    className="list-group-item list-group-item-action bg-transparent text-light border-0 d-flex align-items-center gap-2"
                    style={{ cursor: "pointer" }}
                  >
                    <span style={{ width: 24 }}>{m.icon}</span>
                    {m.name}
                  </div>
                ))}
            </div>
          </aside>
        )}
        <main className="flex-grow-1 p-4 overflow-auto" style={{ background: "#3d4e6e" }}>
          <div
            className={
              location.pathname === "/"
                ? "p-0 bg-transparent"
                : "bg-white rounded shadow-sm p-4 h-100"
            }
          >
            {location.pathname === "/" && <DashboardSummary />}
            <Outlet />
          </div>
        </main>
      </div>
      <footer className="bg-light py-2 text-center small border-top">
        &copy; {currentYear} Vyoobam Tech. All rights reserved.
      </footer>
    </div>
  );
}
