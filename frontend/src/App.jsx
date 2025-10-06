import React from "react";
import { Routes, Route, Router } from "react-router-dom";
import { Navigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Product from "./pages/Product";
import Category from "./pages/Category";
import Units from "./pages/Units";
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
import Login from "./pages/Login"
import Profile from "./pages/Profile"
import Register from "./pages/Register"
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ProfitLossReport from "./pages/reports/ProfitLossReport";
import StockLedger from "./pages/StockLedger";
import { setAuthToken } from "./services/userService";

const token = localStorage.getItem("token");
if (token) setAuthToken(token);

const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem("user"); 
  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <>
      
      <div className="container-fluid w-100 p-0">
        
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword/>}/>
          <Route path="/reset-password/:token" element={<ResetPassword/>}/>
          <Route path="/" element={<ProtectedRoute>{<Dashboard/>}</ProtectedRoute>}>
          
          <Route path="/products" element={<Product />} />
          <Route path="/categories" element={<Category />} />
          <Route path="/units" element={<Units/>} />
          <Route path="/taxes" element={<Tax/>} />
          <Route path="/customers" element={<Customer/>} />
          <Route path="/suppliers" element={<Supplier/>} />
          <Route path="/warehouses" element={<Warehouse/>} />
          <Route path="/purchases" element={<Purchase/>} />
           <Route path="/sales" element={<SalePOS/>} />
           <Route path="/cus_receipts" element={<Customer_Payment/>} />
           <Route path="/sub_receipts" element={<Supplier_Payment/>} />
             <Route path="/stocks" element={<StockAdjustment/>} />
             <Route path="/stockledger" element={<StockLedger/>} />
             <Route path="/profile" element={<Profile/>}/>
              <Route path="/reports" element={<Reports />}>
              <Route index element={<SalesReport/>}/>
            <Route path="sales" element={<SalesReport />} />
             <Route path="/reports/purchase" element={<PurchaseReport />}/>
             <Route path="/reports/stock" element={<StockReport />}/>
             <Route path="/reports/gst" element={<GstReport />}/>
              <Route path="/reports/profitloss" element={<ProfitLossReport/>}/>
            </Route>
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        
      </div>
    </>
  );
}

export default App;
