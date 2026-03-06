import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfitLoss } from "../redux/profitlossSlice";
import { fetchcustomers } from "../redux/customerSlice";
import { fetchsuppliers } from "../redux/supplierSlice";
import { fetchpurchases } from "../redux/purchaseSlice";
import { fetchsales } from "../redux/saleSlice";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaCartShopping, FaUserGroup } from "react-icons/fa6";
import { GiBoxUnpacking, GiProfit } from "react-icons/gi";
import { MdWarehouse } from "react-icons/md";
import { BiSolidPurchaseTag } from "react-icons/bi";
import {BarChart,Bar,XAxis,YAxis,Tooltip,CartesianGrid,ResponsiveContainer,Legend,LineChart,Line,} from "recharts";
const DashboardSummary = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { report } = useSelector((state) => state.profitloss);
  const { items: customers = [] } = useSelector((state) => state.customers);
  const { items: suppliers = [] } = useSelector((state) => state.suppliers);
  const { items: purchases = [] } = useSelector((state) => state.purchases);
  const { items: sales = [] } = useSelector((state) => state.sales);
  useEffect(() => {
    dispatch(fetchProfitLoss());
    dispatch(fetchcustomers());
    dispatch(fetchsuppliers());
    dispatch(fetchpurchases());
    dispatch(fetchsales());
  }, [dispatch]);
  const totalPurchases = purchases.reduce(
    (acc, p) => acc + (Number(p.grand_total) || 0),
    0
  );
  const totalSales = sales.reduce(
  (acc, s) => acc + (Number(s.grand_total) || 0),
  0
);
  const topSellingProducts = useMemo(() => {
    const productCount = {};
    sales.forEach((sale) => {
      sale.items?.forEach((item) => {
        const name = item.product_id?.name || "Unknown Product";
        productCount[name] =
          (productCount[name] || 0) + (Number(item.qty) || 0);
      });
    }); 
    return Object.entries(productCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [sales]);

  const salesPurchaseData = useMemo(() => {
    const formatDate = (date) =>
      new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      });
    const salesByDate = {};
    const purchasesByDate = {};
    sales.forEach((s) => {
      const date = formatDate(s.invoice_date_time);
      const total = Number(s.grand_total) || 0;
      salesByDate[date] = (salesByDate[date] || 0) + total;
    });
    purchases.forEach((p) => {
      const date = formatDate(p.invoice_date);
      purchasesByDate[date] =
        (purchasesByDate[date] || 0) + (Number(p.grand_total) || 0);
    });
    return Array.from(
      new Set([...Object.keys(salesByDate), ...Object.keys(purchasesByDate)])
    ).map((date) => ({
      name: date,
      Sales: salesByDate[date] || 0,
      Purchases: purchasesByDate[date] || 0,
    }));
  }, [sales, purchases]);

  const goSale = () => navigate("/sales");
  const goCustomer = () => navigate("/customers");
  const goSupplier = () => navigate("/suppliers");
  const goPurchase = () => navigate("/purchases");

  return (
    <div className="container-fluid mt-4">
 
      <div className="row g-3">
        {[
          {
            title: "TOTAL SALES",
            value: `₹${totalSales.toFixed(2)}`,
            icon: <FaCartShopping />,
            onClick: goSale,
          },
          {
            title: "COGS",
            value: `₹${report?.cogs || 0}`,
            icon: <GiBoxUnpacking />,
          },
          {
            title: "GROSS PROFIT",
            value: `₹${report?.grossProfit || 0}`,
            icon: <GiProfit />,
          },
          {
            title: "TOTAL PURCHASES",
            value: `₹${totalPurchases.toFixed(2)}`,
            icon: <BiSolidPurchaseTag />,
            onClick: goPurchase,
          },
          {
            title: "TOTAL CUSTOMERS",
            value: customers.length,
            icon: <FaUserGroup />,
            onClick: goCustomer,
          },
          {
            title: "TOTAL SUPPLIERS",
            value: suppliers.length,
            icon: <MdWarehouse />,
            onClick: goSupplier,
          },
        ].map((card, index) => (
          <div key={index} className="col-xl-4 col-md-6 col-sm-12">
            <div
              className="card text-center h-100 shadow-lg rounded-4"
              style={{ minHeight: 150, cursor: "pointer" }}
              onClick={card.onClick}
            >
              <div className="card-body d-flex flex-column align-items-center justify-content-center">
                <span style={{ fontSize: 35, color: "#4d6f99ff" }}>
                  {card.icon}
                </span>
                <h6 className="mt-2">{card.title}</h6>
                <p
                  className="fw-bold mb-0"
                  style={{ fontSize: 20, color: "#4d6f99ff" }}
                >
                  {card.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

     
      <div className="card shadow-lg mt-4">
        <div className="card-body">
          <h5 className="fw-bold mb-3">📊 TOP SELLING PRODUCTS</h5>
         <ResponsiveContainer width="100%" height={window.innerWidth < 576 ? 220 : 300}>

            <BarChart data={topSellingProducts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#4d6f99ff" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card shadow-lg mt-4">
        <div className="card-body">
          <h5 className="fw-bold mb-3">📈 SALES vs PURCHASES</h5>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesPurchaseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="Sales"
                stroke="#4d6f99ff"
                strokeWidth={3}
              />
              <Line
                type="monotone"
                dataKey="Purchases"
                stroke="#82ca9d"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardSummary;
