import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Dashboard from "./pages/Dashboard";
import Product from "./pages/Product";
// import Category from "./pages/Category";
import Tax from "./pages/Tax";
import Customer from "./pages/Customer";
import Supplier from "./pages/Supplier";
import Warehouse from "./pages/Warehouse";
import Purchase from "./pages/Purchase";
import SalePOS from "./pages/SalePOS";
import Customer_Payment from "./pages/Customer_Payment";
import Supplier_Payment from "./pages/Supplier_Payment";
import SalesReturn from "./pages/SalesReturn";
import StockLedger from "./pages/StockLedger";
import Expenses from "./pages/Expenses";
import Profile from "./pages/Profile";
import Reports from "./pages/Reports";
import SalesReport from "./pages/reports/SalesReport";
import PurchaseReport from "./pages/reports/PurchaseReport";
import SalesReturnReport from "./pages/reports/SalesReturnReport";
import ExpenseReport from "./pages/reports/ExpenseReport";
import ProfitLossReport from "./pages/reports/ProfitLossReport";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import API from "./api/axiosInstance";
import { Outlet } from "react-router-dom";
const ProtectedRoute = ({ roles }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/users/me")
      .then((res) => {
        setUser(res.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
function App() {
  return (
    <div className="container-fluid w-100 p-0">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route element={<ProtectedRoute roles={["super_admin", "admin", "user"]} />}>
          <Route path="/" element={<Dashboard />}>
            <Route path="products" element={<Product />} />
            {/* <Route path="categories" element={<Category />} /> */}
            <Route path="taxes" element={<Tax />} />
            <Route path="customers" element={<Customer />} />
            <Route path="suppliers" element={<Supplier />} />
            <Route path="warehouses" element={<Warehouse />} />
            <Route path="purchases" element={<Purchase />} />
            <Route path="sales" element={<SalePOS />} />
            <Route path="sales-returns" element={<SalesReturn />} />
            <Route path="cus_receipts" element={<Customer_Payment />} />
            <Route path="sub_receipts" element={<Supplier_Payment />} />
            <Route path="stockledger" element={<StockLedger />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="profile" element={<Profile />} />
            <Route path="reports" element={<Reports />}>
              <Route index element={<SalesReport />} />
              <Route path="sales" element={<SalesReport />} />
              <Route path="purchase" element={<PurchaseReport />} />
              <Route path="stock" element={<SalesReturnReport />} />
              <Route path="gst" element={<ExpenseReport />} />
              <Route path="profitloss" element={<ProfitLossReport />} />
            </Route>

          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;
