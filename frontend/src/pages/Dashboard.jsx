// import React, { useState, useEffect } from "react";
// import { Outlet, useNavigate, useLocation } from "react-router-dom";
// import logo from "../assets/Logo.png";
// import { AiOutlineDashboard } from "react-icons/ai";
// import { MdProductionQuantityLimits, MdOutlineCategory, MdOutlineAttachMoney, MdOutlineWarehouse, MdAttachMoney } from "react-icons/md";
// import { LiaWeightSolid } from "react-icons/lia";
// import { IoIosContact } from "react-icons/io";
// import { BiPurchaseTag } from "react-icons/bi";
// import { TbFileInvoice, TbReportSearch } from "react-icons/tb";
// import { GiTakeMyMoney } from "react-icons/gi";
// import { PiShippingContainer } from "react-icons/pi";
// import { FaArrowLeft } from "react-icons/fa";
// import { MdOutlineInventory2 } from "react-icons/md";
// import { GiMoneyStack } from "react-icons/gi";
// import UserProfile from "../components/UserProfile";

// export default function Dashboard() {
//   const modules = [
//     { name: "Dashboard", path: "/", icon: <AiOutlineDashboard /> },
//     { name: "Products", path: "/products", icon: <MdProductionQuantityLimits /> },
//     { name: "Categories", path: "/categories", icon: <MdOutlineCategory /> },
//     // { name: "Units", path: "/units", icon: <LiaWeightSolid /> },
//     { name: "Tax Rates", path: "/taxes", icon: <MdOutlineAttachMoney /> },
//     { name: "Customers", path: "/customers", icon: <IoIosContact /> },
//     { name: "Suppliers", path: "/suppliers", icon: <IoIosContact /> },
//     { name: "Warehouses", path: "/warehouses", icon: <MdOutlineWarehouse /> },
//     { name: "Purchases", path: "/purchases", icon: <BiPurchaseTag /> },
//     { name: "Sales", path: "/sales", icon: <TbFileInvoice /> },
//     { name: "Customer Receipts", path: "/cus_receipts", icon: <MdAttachMoney /> },
//     { name: "Supplier Payments", path: "/sub_receipts", icon: <GiTakeMyMoney /> },
//     { name: "Stock Adjustments", path: "/stocks", icon: <PiShippingContainer /> },
//     {name: "Stock Ledger", path: "/stockledger", icon:<MdOutlineInventory2/>},
//     {name: "Expense", path:"/expenses", icon:<GiMoneyStack/>},
//     { name: "Reports", path: "/reports", icon: <TbReportSearch /> },
//   ];

//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const navigate = useNavigate();
//   const location = useLocation();

//   // Force redirect to Dashboard on refresh
//   // useEffect(() => {
//   //   if (location.pathname !== "/") {
//   //     navigate("/");
//   //   }
//   // }, []);

//   const toggleSidebar = () => {
//     if (sidebarOpen) {
//       navigate("/");
//       setSidebarOpen(false);
//     } else {
//       setSidebarOpen(true);
//     }
//   };

//   const handleMenuClick = (path) => {
//     navigate(path);
//   };

//   return (
//     <div className="d-flex flex-column vh-100">
      
//       <nav className="navbar navbar-expand-lg navbar-dark bg-white shadow">
//         <div className="container-fluid">
//           <button
//             className="btn btn-outline-light me-3 text-success"
//             onClick={toggleSidebar}
//           >
//             {sidebarOpen ? <FaArrowLeft className="text-dark" /> : "☰"}
//           </button>

//           <a className="navbar-brand d-flex align-items-center gap-3" href="#">
//             <img src={logo} alt="Logo" className="me-2" style={{ height: "50px" }} />
//             <span className="fw-bold fs-4" style={{ color: "#072141ff" }}>
//               Billing & Inventory
//             </span>
//           </a>

//           <div className="ms-auto d-flex align-items-center gap-2">
//             <UserProfile />
//           </div>
//         </div>
//       </nav>

//       <div className="d-flex flex-grow-1">
      
//         {sidebarOpen && (
//           <div
//             className="p-3"
//             style={{
//               width: "280px",
//               background: "linear-gradient(180deg, #1e293b, #0f172a)",
//               color: "white",
//               transition: "width 0.3s ease",
//             }}
//           >
//             <div className="list-group list-group-flush text-center">
//               {modules.map((m) => (
//                 <div
//   key={m.path}
//   onClick={() => handleMenuClick(m.path)}
//   className="list-group-item border-0 list-group-item-action bg-transparent text-light hover-bg-light d-flex align-items-center gap-2"
//   style={{ cursor: "pointer", padding: "0.75rem 1rem" }}
// >
//                   <div className="d-flex align-items-center gap-2">
//   <span style={{ width: "24px" }}>{m.icon}</span>
//   <span>{m.name}</span>
// </div>

//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

    
//         <div className="flex-grow-1 p-4 overflow-auto" style={{ backgroundColor: "#c9d9ecff" }}>
//           <div className="bg-white border rounded shadow-sm p-4 h-100">
//             <Outlet />
//           </div>
//         </div>
//       </div>


//       <style>{`
//         .hover-bg-light:hover {
//           background-color: rgba(255, 255, 255, 0.1) !important;
//           color: #f8fafc !important;
//           border-radius: 0.5rem;
//           transition: background-color 0.2s ease, color 0.2s ease;
//         }
//       `}</style>
//     </div>
//   );
// }


import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import logo from "../assets/Logo.png";
import { AiOutlineDashboard } from "react-icons/ai";
import { MdProductionQuantityLimits, MdOutlineCategory, MdOutlineAttachMoney, MdOutlineWarehouse, MdAttachMoney, MdOutlineInventory2 } from "react-icons/md";
import { LiaWeightSolid } from "react-icons/lia";
import { IoIosContact } from "react-icons/io";
import { BiPurchaseTag } from "react-icons/bi";
import { TbFileInvoice, TbReportSearch } from "react-icons/tb";
import { GiTakeMyMoney, GiMoneyStack } from "react-icons/gi";
import { PiShippingContainer } from "react-icons/pi";
import { FaArrowLeft } from "react-icons/fa";
import UserProfile from "../components/UserProfile";
import { isSuperAdmin, isAdmin, isEntryUser } from "../utils/auth";

export default function Dashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Define modules with role-based visibility
  const modules = [
    { name: "Dashboard", path: "/", icon: <AiOutlineDashboard />, roles: ["super_admin", "admin", "entry_user"] },
    // { name: "Manage Users", path: "/users", icon: <AiOutlineDashboard />, roles: ["super_admin"] },
    { name: "Products", path: "/products", icon: <MdProductionQuantityLimits />, roles: ["super_admin", "admin"] },
    { name: "Categories", path: "/categories", icon: <MdOutlineCategory />, roles: ["super_admin", "admin"] },
    // { name: "Units", path: "/units", icon: <LiaWeightSolid />, roles: ["super_admin", "admin"] },
    { name: "Tax Rates", path: "/taxes", icon: <MdOutlineAttachMoney />, roles: ["super_admin", "admin"] },
    { name: "Customers", path: "/customers", icon: <IoIosContact />, roles: ["super_admin", "admin", "entry_user"] },
    { name: "Suppliers", path: "/suppliers", icon: <IoIosContact />, roles: ["super_admin", "admin"] },
    { name: "Warehouses", path: "/warehouses", icon: <MdOutlineWarehouse />, roles: ["super_admin", "admin"] },
    { name: "Purchases", path: "/purchases", icon: <BiPurchaseTag />, roles: ["super_admin", "admin"] },
    { name: "Sales", path: "/sales", icon: <TbFileInvoice />, roles: ["super_admin", "admin", "entry_user"] },
    { name: "Customer Receipts", path: "/cus_receipts", icon: <MdAttachMoney />, roles: ["super_admin", "admin", "entry_user"] },
    { name: "Supplier Payments", path: "/sub_receipts", icon: <GiTakeMyMoney />, roles: ["super_admin", "admin"] },
    { name: "Stock Adjustments", path: "/stocks", icon: <PiShippingContainer />, roles: ["super_admin", "admin"] },
    { name: "Stock Ledger", path: "/stockledger", icon: <MdOutlineInventory2 />, roles: ["super_admin", "admin"] },
    { name: "Expense", path: "/expenses", icon: <GiMoneyStack />, roles: ["super_admin", "admin"] },
    { name: "Reports", path: "/reports", icon: <TbReportSearch />, roles: ["super_admin", "admin"] },
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleMenuClick = (path) => {
    navigate(path);
  };

  // Get user role once
  const userRole = JSON.parse(localStorage.getItem("user"))?.role;

  return (
    <div className="d-flex flex-column vh-100">
      <nav className="navbar navbar-expand-lg navbar-dark bg-white shadow">
        <div className="container-fluid">
          <button className="btn btn-outline-light me-3 text-success" onClick={toggleSidebar}>
            {sidebarOpen ? <FaArrowLeft className="text-dark" /> : "☰"}
          </button>

          <a className="navbar-brand d-flex align-items-center gap-3" href="#">
            <img src={logo} alt="Logo" className="me-2" style={{ height: "50px" }} />
            <span className="fw-bold fs-4" style={{ color: "#072141ff" }}>Billing & Inventory</span>
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
              width: "280px",
              background: "linear-gradient(180deg, #1e293b, #0f172a)",
              color: "white",
              transition: "width 0.3s ease",
            }}
          >
            <div className="list-group list-group-flush text-center">
              {modules
                .filter((m) => m.roles.includes(userRole)) // Filter modules based on role
                .map((m) => (
                  <div
                    key={m.path}
                    onClick={() => handleMenuClick(m.path)}
                    className="list-group-item border-0 list-group-item-action bg-transparent text-light hover-bg-light d-flex align-items-center gap-2"
                    style={{ cursor: "pointer", padding: "0.75rem 1rem" }}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <span style={{ width: "24px" }}>{m.icon}</span>
                      <span>{m.name}</span>
                    </div>
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
