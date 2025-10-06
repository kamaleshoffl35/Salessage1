import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <div className="container-fluid mt-0 px-3 ">
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
      <Link className="navbar-brand" to="/">Inventory</Link>
      <div className="collapse navbar-collapse">
        <ul className="navbar-nav me-auto gap-2">
          <li className="nav-item"><Link className="nav-link" to="/products">Products</Link></li>
          <li className="nav-item"><Link className="nav-link" to="/categories">Categories</Link></li>
          <li className="nav-item"><Link className="nav-link" to="/units">Units</Link></li>
          <li className="nav-item"><Link className="nav-link" to="/taxes">Taxes</Link></li>
          <li className="nav-item"><Link className="nav-link" to="/customers">Customers</Link></li>
          <li className="nav-item"><Link className="nav-link" to="/suppliers">Suppliers</Link></li>
          <li className="nav-item"><Link className="nav-link" to="/warehouses">Warehouses</Link></li>
          <li className="nav-item"><Link className="nav-link" to="/purchases">Purchases</Link></li>
          <li className="nav-item"><Link className="nav-link" to="/sales">Sales</Link></li>
          <li className="nav-item"><Link className="nav-link" to="/cus_receipts">Customer Receipt</Link></li>
          <li className="nav-item"><Link className="nav-link" to="/sub_receipts">Supplier Receipt</Link></li>
           <li className="nav-item"><Link className="nav-link" to="/stocks">Stocks Adjustment</Link></li>
           <li className="nav-item"><Link className="nav-link" to="/stockledger">StockLedger</Link></li>
           <li className="nav-item"><Link className="nav-link" to="/reports">Reports</Link></li>
        </ul>
      </div>
    </nav>
    </div>
  );
}

export default Navbar;
