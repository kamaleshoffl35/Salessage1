import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/Logo.png";
import { AiOutlineDashboard } from "react-icons/ai";
import { MdProductionQuantityLimits, MdOutlineCategory, MdOutlineAttachMoney, MdOutlineWarehouse, MdAttachMoney } from "react-icons/md";
import { LiaWeightSolid } from "react-icons/lia";
import { IoIosContact } from "react-icons/io";
import { BiPurchaseTag } from "react-icons/bi";
import { TbFileInvoice, TbReportSearch } from "react-icons/tb";
import { GiTakeMyMoney } from "react-icons/gi";
import { PiShippingContainer } from "react-icons/pi";
import { FaArrowLeft } from "react-icons/fa";
import { MdOutlineInventory2 } from "react-icons/md";
import UserProfile from "../components/UserProfile";

export default function Dashboard() {
  const modules = [
    { name: "Dashboard", path: "/", icon: <AiOutlineDashboard /> },
    { name: "Products", path: "/products", icon: <MdProductionQuantityLimits /> },
    { name: "Categories", path: "/categories", icon: <MdOutlineCategory /> },
    { name: "Units", path: "/units", icon: <LiaWeightSolid /> },
    { name: "Tax Rates", path: "/taxes", icon: <MdOutlineAttachMoney /> },
    { name: "Customers", path: "/customers", icon: <IoIosContact /> },
    { name: "Suppliers", path: "/suppliers", icon: <IoIosContact /> },
    { name: "Warehouses", path: "/warehouses", icon: <MdOutlineWarehouse /> },
    { name: "Purchases", path: "/purchases", icon: <BiPurchaseTag /> },
    { name: "Sales", path: "/sales", icon: <TbFileInvoice /> },
    { name: "Customer Receipts", path: "/cus_receipts", icon: <MdAttachMoney /> },
    { name: "Supplier Payments", path: "/sub_receipts", icon: <GiTakeMyMoney /> },
    { name: "Stock Adjustments", path: "/stocks", icon: <PiShippingContainer /> },
    {name: "Stock Ledger", path: "/stockledger", icon:<MdOutlineInventory2/>},
    { name: "Reports", path: "/reports", icon: <TbReportSearch /> },
  ];

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Force redirect to Dashboard on refresh
  // useEffect(() => {
  //   if (location.pathname !== "/") {
  //     navigate("/");
  //   }
  // }, []);

  const toggleSidebar = () => {
    if (sidebarOpen) {
      navigate("/");
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  };

  const handleMenuClick = (path) => {
    navigate(path);
  };

  return (
    <div className="d-flex flex-column vh-100">
      
      <nav className="navbar navbar-expand-lg navbar-dark bg-white shadow">
        <div className="container-fluid">
          <button
            className="btn btn-outline-light me-3 text-success"
            onClick={toggleSidebar}
          >
            {sidebarOpen ? <FaArrowLeft className="text-dark" /> : "☰"}
          </button>

          <a className="navbar-brand d-flex align-items-center gap-3" href="#">
            <img src={logo} alt="Logo" className="me-2" style={{ height: "50px" }} />
            <span className="fw-bold fs-4" style={{ color: "#072141ff" }}>
              Billing & Inventory
            </span>
          </a>

          <div className="ms-auto d-flex align-items-center gap-2">
            <UserProfile />
          </div>
        </div>
      </nav>

      <div className="d-flex flex-grow-1">
      
        {sidebarOpen && (
          <div
            className="p-3"
            style={{
              width: "80px",
              background: "linear-gradient(180deg, #1e293b, #0f172a)",
              color: "white",
              transition: "width 0.3s ease",
            }}
          >
            <div className="list-group list-group-flush text-center">
              {modules.map((m) => (
                <div
                  key={m.path}
                  onClick={() => handleMenuClick(m.path)}
                  className="list-group-item border-0 list-group-item-action bg-transparent text-light hover-bg-light d-flex justify-content-center"
                  style={{ cursor: "pointer" }}
                >
                  <span className="fs-5">{m.icon}</span>
                </div>
              ))}
            </div>
          </div>
        )}

    
        <div className="flex-grow-1 p-4 overflow-auto" style={{ backgroundColor: "#c9d9ecff" }}>
          <div className="bg-white border rounded shadow-sm p-4 h-100">
            <Outlet />
          </div>
        </div>
      </div>


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
