import { Routes, Route, Navigate, BrowserRouter as Router } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Product from "./pages/Product";
import Category from "./pages/Category";
// import Units from "./pages/Units";
import Tax from "./pages/Tax";
import Customer from "./pages/Customer";
import Supplier from "./pages/Supplier";
import Warehouse from "./pages/Warehouse";
import Purchase from "./pages/Purchase";
import SalePOS from "./pages/SalePOS";
import Customer_Payment from "./pages/Customer_Payment";
import Supplier_Payment from "./pages/Supplier_Payment";
// import StockAdjustment from "./pages/StockAdjustment";
import SalesReport from "./pages/reports/SalesReport";
import Reports from "./pages/Reports";
import PurchaseReport from "./pages/reports/PurchaseReport";


import ProfitLossReport from "./pages/reports/ProfitLossReport";
import StockLedger from "./pages/StockLedger";
import Expenses from "./pages/Expenses";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import { setAuthToken } from "./services/userService";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { isTokenExpired } from "./utils/Tokenexp";
import  SalesReturn  from "./pages/SalesReturn";
import SalesReturnReport from "./pages/reports/SalesReturnReport";
import ExpenseReport from "./pages/reports/ExpenseReport";

const token = localStorage.getItem("token");
if (token) setAuthToken(token);

const PrivateRoute=({children,roles }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const userRole = user?.role;
  if (!userRole)
     return <Navigate to="/login" replace />;
  if (roles && !roles.includes(userRole)) 
    return <Navigate to="/" replace />;
  return children;
};

function App() {
   const navigate = useNavigate();

  useEffect(() => {
  const publicPaths = ["/login", "/register", "/forgot-password", "/reset-password"];
  const currentPath = window.location.pathname;
  if (publicPaths.some((p) => currentPath.startsWith(p))) 
    return;

  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.token;

  if (!token || isTokenExpired(token)) {
    localStorage.removeItem("user");
    navigate("/login");
  } else {
    const decoded = JSON.parse(atob(token.split(".")[1]));
    const remainingTime = decoded.exp * 1000 - Date.now();

    setTimeout(() => {
      localStorage.removeItem("user");
      navigate("/login");
    }, remainingTime);
  }
}, [navigate]);

  return (

    <div className="container-fluid w-100 p-0">
      <Routes>
    
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

  
        <Route path="/" element={<PrivateRoute roles={["super_admin", "admin", "user"]}> <Dashboard /></PrivateRoute>} >
         
          <Route path="products" element={<PrivateRoute roles={["super_admin", "admin", "user"]}><Product /></PrivateRoute>} />
          <Route path="categories" element={<PrivateRoute roles={["super_admin", "admin","user"]}><Category /></PrivateRoute>} />
          <Route path="taxes" element={<PrivateRoute roles={["super_admin", "admin","user"]}><Tax /></PrivateRoute>} />
          <Route path="customers" element={<PrivateRoute roles={["super_admin", "admin", "user"]}><Customer /></PrivateRoute>} />
          <Route path="suppliers" element={<PrivateRoute roles={["super_admin", "admin","user"]}><Supplier /></PrivateRoute>} />
          <Route path="warehouses" element={<PrivateRoute roles={["super_admin", "admin","user"]}><Warehouse /></PrivateRoute>} />
          <Route path="purchases" element={<PrivateRoute roles={["super_admin", "admin","user"]}><Purchase /></PrivateRoute>} />
          <Route path="sales" element={<PrivateRoute roles={["super_admin", "admin", "user"]}><SalePOS /></PrivateRoute>} />
            <Route path="sales-returns" element={<PrivateRoute roles={["super_admin", "admin", "user"]}><SalesReturn/></PrivateRoute>} />
          <Route path="cus_receipts" element={<PrivateRoute roles={["super_admin", "admin", ]}><Customer_Payment /></PrivateRoute>} />
          <Route path="sub_receipts" element={<PrivateRoute roles={["super_admin", "admin",]}><Supplier_Payment /></PrivateRoute>} />
          {/* <Route path="stocks" element={<PrivateRoute roles={["super_admin", "admin","user"]}><StockAdjustment /></PrivateRoute>} /> */}
          <Route path="stockledger" element={<PrivateRoute roles={["super_admin", "admin","user"]}><StockLedger /></PrivateRoute>} />
          <Route path="expenses" element={<PrivateRoute roles={["super_admin", "admin","user"]}><Expenses /></PrivateRoute>} />
          <Route path="profile" element={<PrivateRoute roles={["super_admin", "admin", "entry_user"]}><Profile /></PrivateRoute>} />

          <Route path="reports" element={<PrivateRoute roles={["super_admin", "admin","user"]}><Reports /></PrivateRoute>}>
            <Route index element={<SalesReport />} />
            <Route path="sales" element={<SalesReport />} />
            <Route path="purchase" element={<PurchaseReport />} />
            <Route path="stock" element={<SalesReturnReport />} />
            <Route path="gst" element={<ExpenseReport />} />
            <Route path="profitloss" element={<ProfitLossReport />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>

  );
}

export default App;

