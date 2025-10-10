// import React from "react";
// import { Routes, Route, Router } from "react-router-dom";
// import { Navigate } from "react-router-dom";

// import Dashboard from "./pages/Dashboard";
// import Product from "./pages/Product";
// import Category from "./pages/Category";
// // import Units from "./pages/Units";
// import Tax from "./pages/Tax";
// import Customer from "./pages/Customer";
// import Supplier from "./pages/Supplier";
// import Warehouse from "./pages/Warehouse";
// import Purchase from "./pages/Purchase";
// import SalePOS from "./pages/SalePOS";
// import Customer_Payment from "./pages/Customer_Payment";
// import Supplier_Payment from "./pages/Supplier_Payment";
// import StockAdjustment from "./pages/StockAdjustment";
// import SalesReport from "./pages/reports/SalesReport";
// import Reports from "./pages/Reports";
// import PurchaseReport from "./pages/reports/PurchaseReport";
// import StockReport from "./pages/reports/StockReport";
// import GstReport from "./pages/reports/GSTReport";
// import Login from "./pages/Login"
// import Profile from "./pages/Profile"
// import Register from "./pages/Register"
// import ForgotPassword from "./pages/ForgotPassword";
// import ResetPassword from "./pages/ResetPassword";
// import ProfitLossReport from "./pages/reports/ProfitLossReport";
// import StockLedger from "./pages/StockLedger";
// import Expenses from "./pages/Expenses";
// import { setAuthToken } from "./services/userService";

// const token = localStorage.getItem("token");
// if (token) setAuthToken(token);

// const ProtectedRoute = ({ children }) => {
//   const user = localStorage.getItem("user"); 
//   return user ? children : <Navigate to="/login" replace />;
// };

// function App() {
//   return (
//     <>

//       <div className="container-fluid w-100 p-0">

//         <Routes>
//           <Route path="/login" element={<Login />} />
//           <Route path="/register" element={<Register />} />
//           <Route path="/forgot-password" element={<ForgotPassword/>}/>
//           <Route path="/reset-password/:token" element={<ResetPassword/>}/>
//           <Route path="/" element={<ProtectedRoute>{<Dashboard/>}</ProtectedRoute>}>

//           <Route path="/products" element={<Product />} />
//           <Route path="/categories" element={<Category />} />
//           {/* <Route path="/units" element={<Units/>} /> */}
//           <Route path="/taxes" element={<Tax/>} />
//           <Route path="/customers" element={<Customer/>} />
//           <Route path="/suppliers" element={<Supplier/>} />
//           <Route path="/warehouses" element={<Warehouse/>} />
//           <Route path="/purchases" element={<Purchase/>} />
//            <Route path="/sales" element={<SalePOS/>} />
//            <Route path="/cus_receipts" element={<Customer_Payment/>} />
//            <Route path="/sub_receipts" element={<Supplier_Payment/>} />
//              <Route path="/stocks" element={<StockAdjustment/>} />
//              <Route path="/stockledger" element={<StockLedger/>} />
//              <Route path="/expenses" element={<Expenses />} />
//              <Route path="/profile" element={<Profile/>}/>
//               <Route path="/reports" element={<Reports />}>
//               <Route index element={<SalesReport/>}/>
//             <Route path="sales" element={<SalesReport />} />
//              <Route path="/reports/purchase" element={<PurchaseReport />}/>
//              <Route path="/reports/stock" element={<StockReport />}/>
//              <Route path="/reports/gst" element={<GstReport />}/>
//               <Route path="/reports/profitloss" element={<ProfitLossReport/>}/>
//             </Route>
//             </Route>
//             <Route path="*" element={<Navigate to="/login" replace />} />
//         </Routes>

//       </div>
//     </>
//   );
// }

// export default App;


import React from "react";
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
import StockAdjustment from "./pages/StockAdjustment";
import SalesReport from "./pages/reports/SalesReport";
import Reports from "./pages/Reports";
import PurchaseReport from "./pages/reports/PurchaseReport";
import StockReport from "./pages/reports/StockReport";
import GstReport from "./pages/reports/GSTReport";
import ProfitLossReport from "./pages/reports/ProfitLossReport";
import StockLedger from "./pages/StockLedger";
import Expenses from "./pages/Expenses";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import { setAuthToken } from "./services/userService";
import { isSuperAdmin, isAdmin, isEntryUser } from "./utils/auth";

// Set token for API calls
const token = localStorage.getItem("token");
if (token) setAuthToken(token);

// ---------------- ROLE-BASED PRIVATE ROUTE ----------------
const PrivateRoute = ({ children, roles }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const userRole = user?.role;
  if (!userRole) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(userRole)) return <Navigate to="/" replace />;
  return children;
};

function App() {
  return (

    <div className="container-fluid w-100 p-0">
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* DASHBOARD - ALL LOGGED IN USERS */}
        <Route
          path="/"
          element={
            <PrivateRoute roles={["super_admin", "admin", "user"]}>
              <Dashboard />
            </PrivateRoute>
          }
        >
          {/* CHILD PAGES - RELATIVE PATHS */}
          <Route path="products" element={<PrivateRoute roles={["super_admin", "admin", "user"]}><Product /></PrivateRoute>} />
          <Route path="categories" element={<PrivateRoute roles={["super_admin", "admin"]}><Category /></PrivateRoute>} />
          <Route path="taxes" element={<PrivateRoute roles={["super_admin", "admin"]}><Tax /></PrivateRoute>} />
          <Route path="customers" element={<PrivateRoute roles={["super_admin", "admin", "entry_user"]}><Customer /></PrivateRoute>} />
          <Route path="suppliers" element={<PrivateRoute roles={["super_admin", "admin"]}><Supplier /></PrivateRoute>} />
          <Route path="warehouses" element={<PrivateRoute roles={["super_admin", "admin"]}><Warehouse /></PrivateRoute>} />
          <Route path="purchases" element={<PrivateRoute roles={["super_admin", "admin"]}><Purchase /></PrivateRoute>} />
          <Route path="sales" element={<PrivateRoute roles={["super_admin", "admin", "entry_user"]}><SalePOS /></PrivateRoute>} />
          <Route path="cus_receipts" element={<PrivateRoute roles={["super_admin", "admin", "entry_user"]}><Customer_Payment /></PrivateRoute>} />
          <Route path="sub_receipts" element={<PrivateRoute roles={["super_admin", "admin"]}><Supplier_Payment /></PrivateRoute>} />
          <Route path="stocks" element={<PrivateRoute roles={["super_admin", "admin"]}><StockAdjustment /></PrivateRoute>} />
          <Route path="stockledger" element={<PrivateRoute roles={["super_admin", "admin"]}><StockLedger /></PrivateRoute>} />
          <Route path="expenses" element={<PrivateRoute roles={["super_admin", "admin"]}><Expenses /></PrivateRoute>} />
          <Route path="profile" element={<PrivateRoute roles={["super_admin", "admin", "entry_user"]}><Profile /></PrivateRoute>} />

          {/* REPORTS */}
          <Route path="reports" element={<PrivateRoute roles={["super_admin", "admin"]}><Reports /></PrivateRoute>}>
            <Route index element={<SalesReport />} />
            <Route path="sales" element={<SalesReport />} />
            <Route path="purchase" element={<PurchaseReport />} />
            <Route path="stock" element={<StockReport />} />
            <Route path="gst" element={<GstReport />} />
            <Route path="profitloss" element={<ProfitLossReport />} />
          </Route>
        </Route>


        {/* CATCH ALL */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>

  );
}

export default App;

