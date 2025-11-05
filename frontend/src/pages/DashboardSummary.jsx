import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfitLoss } from "../redux/profitlossSlice"; 
import "bootstrap/dist/css/bootstrap.min.css";
import { FaCartShopping } from "react-icons/fa6";
import { GiBoxUnpacking } from "react-icons/gi";
import { GiProfit } from "react-icons/gi";
import { FaUserGroup } from "react-icons/fa6";
import { MdWarehouse } from "react-icons/md";
import { BiSolidPurchaseTag } from "react-icons/bi";
import { fetchcustomers } from "../redux/customerSlice";
import { fetchsuppliers } from "../redux/supplierSlice";
import { fetchpurchases } from "../redux/purchaseSlice";
import { fetchsales } from "../redux/saleSlice";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,Legend } from "recharts";
import { LineChart, Line } from "recharts";

import { useMemo } from "react";


const DashboardSummary = () => {
  const dispatch = useDispatch();
  const navigate=useNavigate()
  const { report } = useSelector((state) => state.profitloss);
  const { items: customers } = useSelector((state) => state.customers);
  const { items: suppliers}=useSelector((state)=>state.suppliers)
  const {items:purchases}=useSelector((state)=>state.purchases)
  const {items:sales}=useSelector((state)=>state.sales)

  useEffect(() => {
    dispatch(fetchProfitLoss());
    dispatch(fetchcustomers())
    dispatch(fetchsuppliers())
    dispatch(fetchpurchases())
    dispatch(fetchsales())
  }, [dispatch]);

  const totalPurchases = purchases.reduce((acc, p) => acc + (Number(p.grand_total) || 0), 0);

  const totalSales = sales.reduce(
  (acc, s) => acc + ((Number(s.grand_total) || 0) - (Number(s.discount_amount) || 0)),
  0
);



   const topSellingProducts = useMemo(() => {
    const productCount = {};
 sales.forEach((sale) => {
      sale.items?.forEach((item) => {
        const name = item.product_id?.name || "Unknown Product";
        productCount[name] = (productCount[name] || 0) + (Number(item.qty) || 0);
      });
    });

    const sortedProducts = Object.entries(productCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return sortedProducts;
  }, [sales]);

  const goSale=()=>{
    navigate("/sales")
  }
  const goCustomer=()=>{
    navigate("/customers")
  }
  const getSupplier=()=>{
    navigate("/suppliers")
  }
  const getpurchase=()=>{
    navigate("/purchases")
  }
 
   const recentSales = useMemo(() => {
    return [...sales]
      .sort((a, b) => new Date(b.invoice_date_time) - new Date(a.invoice_date_time))
      .slice(0, 5);
  }, [sales]);

  const recentpurchases=useMemo(()=>{
    return[...purchases]
    .sort((a,b)=>new Date(b.invoice_date_time)-new Date(a.invoice_date_time))
    .slice(0,5)
  },[purchases])

const salesPurchaseData = useMemo(()=>{
  const formatDate=(date)=>{
    const d=new Date(date);
    return d.toLocaleDateString("en-IN",{day:"2-digit",month:"short"}); 
  };
  const salesByDate = {};
  sales.forEach((s) => {
    const date = formatDate(s.invoice_date_time);
    const total = (Number(s.grand_total) || 0) - (Number(s.discount_amount) || 0);
    salesByDate[date] = (salesByDate[date] || 0) + total;
  });

  const purchasesByDate = {};
  purchases.forEach((p) => {
    const date = formatDate(p.invoice_date);
    const total = Number(p.grand_total) || 0;
    purchasesByDate[date] = (purchasesByDate[date] || 0) + total;
  });
  const allDates=Array.from(new Set([...Object.keys(salesByDate),...Object.keys(purchasesByDate)])).sort(
    (a, b) => new Date(a) - new Date(b)    ///   If result < 0 → a comes before b
  );
  return allDates.map((date) => ({
    name: date,
    Sales: salesByDate[date] || 0,
    Purchases: purchasesByDate[date] || 0,
  }));
}, [sales, purchases]);
 
  return (
    <div className="container mt-4">
  <div className="row g-3">
    <div className="col-md-4">
    <div className="card mt-0 text-center hovers shadow-lg " style={{ width:"80%",minHeight:150,cursor:"pointer",  borderRadius: "20px"}} onClick={goSale}>
      <div className="card-body d-flex flex-column align-items-center justify-content-center">
        <span className=" mb-1" style={{ fontSize: 35,color:"#4d6f99ff" }}><FaCartShopping /></span>
        <h5 className="card-title mb-0">TOTAL SALES</h5>
        <p className=" fw-bold mb-0" style={{fontSize:20,color:"#4d6f99ff"}}> ₹{totalSales.toFixed(2)}
        </p>
      </div>
    </div>
    </div>
    <div className="col-md-4">
    <div className="card mt-0 text-center hovers shadow-lg" style={{width:"80%",minHeight:150,cursor:"pointer",borderRadius:"20px"}}>
      <div className="card-body d-flex flex-column align-items-center justify-content-center">
        <span className=" mb-2" style={{ fontSize: 35,color:"#4d6f99ff" }}><GiBoxUnpacking/></span>
        <h5 className="card-title mb-1">COGS</h5>
        <p className=" fw-bold mb-0" style={{fontSize:20,color:"#4d6f99ff"}}> ₹{report?.cogs || 0}
        </p>
      </div>
    </div>
    </div>
    <div className="col-md-4">
    <div className="card mt-0 text-center hovers shadow-lg" style={{ width:"80%",minHeight:150 ,cursor:"pointer",borderRadius:"20px"}}>
      <div className="card-body d-flex flex-column align-items-center justify-content-center">
        <span className=" mb-2" style={{ fontSize: 35,color:'#4d6f99ff' }}><GiProfit /></span>
        <h5 className="card-title mb-1">GROSS PROFIT</h5>
        <p className=" fw-bold mb-0" style={{fontSize:20,color:"#4d6f99ff"}}> ₹{report?.grossProfit || 0}
        </p>
      </div>
    </div>
    </div>
    <div className="col-md-4">
    <div className="card mt-0 text-center hovers shadow-lg" style={{ width:"80%",minHeight:150, cursor:"pointer",borderRadius:"20px" }} onClick={getpurchase}>
      <div className="card-body d-flex flex-column align-items-center justify-content-center">
        <span className=" mb-2" style={{ fontSize: 35,color:"#4d6f99ff" }}><BiSolidPurchaseTag /></span>
        <h5 className="card-title mb-1">TOTAL PURCHASES</h5>
        <p className=" fw-bold mb-0" style={{fontSize:20,color:"#4d6f99ff"}}> ₹{totalPurchases.toFixed(2)}
        </p>
      </div>
    </div>
    </div>
    <div className="col-md-4">
    <div className="card mt-0 text-center hovers shadow-lg" style={{ width:"80%",minHeight:150,cursor:"pointer",borderRadius:"20px"}} onClick={goCustomer}>
      <div className="card-body d-flex flex-column align-items-center justify-content-center">
        <span className=" mb-2" style={{ fontSize: 35,color:"#4d6f99ff" }}><FaUserGroup/></span>
        <h5 className="card-title mb-1">TOTAL CUSTOMERS</h5>
        <p className=" fw-bold mb-0" style={{fontSize:20,color:"#4d6f99ff"}}> ₹{customers?.length || 0}
        </p>
      </div>
    </div>
    </div>
    <div className="col-md-4">
    <div className="card mt-0 text-center hovers shadow-lg" style={{ width:"80%",minHeight:150,cursor:"pointer",borderRadius:"20px"}} onClick={getSupplier}>
      <div className="card-body d-flex flex-column align-items-center justify-content-center">
        <span className=" mb-2" style={{ fontSize: 35,color:"#4d6f99ff" }}><MdWarehouse /></span>
        <h5 className="card-title mb-1">TOTAL SUPPLIERS</h5>
        <p className=" fw-bold mb-0" style={{fontSize:20,color:"#4d6f99ff"}}> ₹{suppliers?.length || 0}
        </p>
      </div>
    </div>
    </div>
  </div>
   <div className="card shadow-lg mt-4">
        <div className="card-body">
          <h5 className="fw-bold mb-3" > 📊 TOP SELLING PRODUCTS</h5>
          {topSellingProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={300} >
              <BarChart data={topSellingProducts} margin={{ top: 10, right: 20, bottom: 10, left: 0 }} onClick={goSale}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#4d6f99ff" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted text-center mt-3">No sales data available to display.</p>
          )}
        </div>
      </div>

      <div className="card shadow-lg mt-4">
        <div className="card-body">
          <h5 className="fw-bold mb-3">🧾 RECENT SALES</h5>
          <table className="table table-bordered table-striped">
            <thead className="table-dark">
              <tr>
                <th>CUSTOMER</th>
                <th>INVOICE NO</th>
                <th>DATE</th>
                <th>PRODUCTS</th>
                <th>GRAND TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {recentSales.map((s) => (
                <tr key={s._id}>
                  <td>{s.customer_id?.name || "Unknown Customer"}</td>
                  <td>{s.invoice_no || "N/A"}</td>
                  <td>{s.invoice_date_time ? new Date(s.invoice_date_time).toLocaleDateString() : "N/A"}</td>
                  <td>
                    {s.items?.map((item, idx) => (
                      <div key={idx}>
                        {item.product_id?.name || "Unknown Product"} ({item.qty})
                      </div>
                    ))}
                  </td>
                  <td>₹{s.grand_total?.toFixed(2) || "0.00"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

     <div className="card shadow-lg mt-4">
  <div className="card-body">
    <h5 className="fw-bold mb-3">🧾 RECENT PURCHASES</h5>
    <table className="table table-bordered table-striped">
      <thead className="table-dark">
        <tr>
          <th>SUPPLIER</th>
          <th>INVOICE NO</th>
          <th>DATE</th>
          <th>STORE NAME</th>
          <th>PRODUCTS</th>
          <th>GRAND TOTAL</th>
        </tr>
      </thead>
      <tbody>
        {recentpurchases.map((p) => (
          <tr key={p._id}>
            
             <td>
  {p.supplier_id && typeof p.supplier_id === "object"
    ? p.supplier_id.name
    : suppliers.find(s => s._id === p.supplier_id)?.name || "Unknown Supplier"}
</td>

            
            <td>{p.invoice_no || "N/A"}</td>
            <td>{p.invoice_date ? new Date(p.invoice_date).toLocaleDateString() : "N/A"}</td>
            <td>
              {p.warehouse_id && typeof p.warehouse_id === "object"
    ? p.warehouse_id.store_name
    : warehouses.find(w => w._id === p.warehouse_id)?.store_name || "Unknown Warehouse"}
            </td>
            <td>
             {p.items?.map((item, idx) => {
  let productName = "Unknown Product";

  if (item?.product_id && typeof item.product_id === "object") {
    productName = item.product_id.name || "Unknown Product";
  } else if (item?.product_id && Array.isArray(products)) {
    const foundProduct = products.find(
      (prod) => prod._id === item.product_id
    );
    productName = foundProduct?.name || "Unknown Product";
  }

  return (
    <div key={idx}>
      {productName} ({item.qty || 0})
    </div>
  );
})}

            </td>
            <td>₹{p.grand_total?.toFixed(2) || "0.00"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>

<div className="card shadow-lg mt-4">
  
  <div className="card shadow-lg mt-4">
        <div className="card-body">
          <h5 className="fw-bold mb-3">📈 SALES vs PURCHASES</h5>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesPurchaseData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name"label={{ value: "DATE", position: "insideBottom", offset: -5 }}/>
              <YAxis label={{value: "AMOUNT (₹)",angle: -90,position: "insideLeft", }}/>
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Sales" stroke="#4d6f99ff" strokeWidth={3} dot={{ r: 5 }}
                activeDot={{ r: 8 }}
              />
              <Line type="monotone"
                dataKey="Purchases"
                stroke="#82ca9d"
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
</div>

 
</div>

  );
};

export default DashboardSummary;
