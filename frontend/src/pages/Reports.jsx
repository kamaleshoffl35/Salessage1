import { NavLink, Outlet, useLocation } from "react-router-dom";

const Reports = () => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;
  const reports = [
    { path: "sales", label: "Sales Report", roles: ["super_admin", "admin", "user"] },
    { path: "purchase", label: "Purchase Report", roles: ["super_admin"] },
    { path: "stock", label: "SalesReturn Report", roles: ["super_admin", "admin"] },
    { path: "gst", label: "Expense Report", roles: ["super_admin"] },
    { path: "profitloss", label: "Profit/Loss Report", roles: ["super_admin"] },
  ];

  return (
    <div className="container mt-4">
      <h2 className="mb-4 fs-3">
        <b>Reports</b>
      </h2>

      <ul className="nav nav-tabs mb-3">
        {reports
          .filter((r) => r.roles.includes(role))
          .map((r, index) => {
            const isDefaultActive =
              location.pathname === "/reports" && index === 0;

            return (
              <li className="nav-item" key={r.path}>
                <NavLink
                  to={r.path}
                  className="nav-link"
                  style={({ isActive }) => ({
                    backgroundColor:
                      isActive || isDefaultActive ? "#182235" : "#f8f9fa",
                    color:
                      isActive || isDefaultActive ? "#fff" : "#000",
                    fontWeight: "500",
                  })}
                >
                  {r.label}
                </NavLink>
              </li>
            );
          })}
      </ul>

      <Outlet />
    </div>
  );
};

export default Reports;
