

import React from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import ExportButtons from "../components/ExportButtons";
import { TbFileReport } from "react-icons/tb";

const Reports = () => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;

  const handleExcel = () => alert("Export to Excel");
  const handlePdf = () => alert("Export to PDF");
  const handlePrint = () => alert("Print Report");

  const reports = [
    { path: "sales", label: "Sales Report", roles: ["super_admin", "admin", "user"] },
    { path: "purchase", label: "Purchase Report", roles: ["super_admin"] },
    { path: "stock", label: "Stock Report", roles: ["super_admin", "admin"] },
    { path: "gst", label: "GST Report", roles: ["super_admin"] },
    { path: "profitloss", label: "Profit/Loss Report", roles: ["super_admin"] },
  ];

  return (
    <div className="container mt-4">
      <h2 className="mb-4 d-flex align-items-center fs-5">
        <span className="me-2 d-flex align-items-center" style={{ color: "#4d6f99ff" }}>
          <TbFileReport size={24} />
        </span>
        <b>REPORTS</b>
      </h2>

      <ul className="nav nav-tabs mb-3">
        {reports.filter((r) => r.roles.includes(role)).map((r) => (
            <li className="nav-item" key={r.path}>
              <NavLink to={r.path} className={({ isActive }) =>  `nav-link ${isActive || location.pathname === "/reports" ? "bg-primary text-white" : "bg-light text-dark"}`}>
                {r.label}
              </NavLink>
            </li>
          ))}
      </ul>

      <ExportButtons onExcel={handleExcel} onPdf={handlePdf} onPrint={handlePrint} />

      
      <Outlet />
    </div>
  );
};

export default Reports;
