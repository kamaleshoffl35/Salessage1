import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ExportButtons from "../components/ExportButtons";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

import { fetchCancelledOrders } from "../redux/cancelledOrderSlice";
import { GrFormView } from "react-icons/gr";
ModuleRegistry.registerModules([AllCommunityModule]);

const CancelledOrdersPage = () => {

  const dispatch = useDispatch();

  const { items: orders, status } = useSelector(
    (state) => state.cancelledOrders
  );

  const [selectedOrder, setSelectedOrder] = useState(null);

  const [searchOrder, setSearchOrder] = useState("");
  const [searchCustomer, setSearchCustomer] = useState("");
  const [searchPayment, setSearchPayment] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
const [fromDate, setFromDate] = useState("");
const [toDate, setToDate] = useState("");
  useEffect(() => {
    dispatch(fetchCancelledOrders());
  }, [dispatch]);
 const filteredOrders = orders.filter((o) => {

  const orderMatch =
    searchOrder.trim() === "" ||
    o.orderNumber?.toLowerCase().includes(searchOrder.toLowerCase());

  const customerMatch =
    searchCustomer.trim() === "" ||
    o.customer?.name?.toLowerCase().includes(searchCustomer.toLowerCase()) ||
    o.customer?.phone?.toLowerCase().includes(searchCustomer.toLowerCase());

  const paymentMatch =
    searchPayment.trim() === "" ||
    o.paymentStatus?.toLowerCase().includes(searchPayment.toLowerCase());

  const statusMatch =
    searchStatus.trim() === "" ||
    o.orderStatus?.toLowerCase().includes(searchStatus.toLowerCase());

  // DATE FILTER
  let dateMatch = true;

  if (fromDate || toDate) {
    const orderDate = new Date(o.createdAt);

    if (fromDate) {
      dateMatch = dateMatch && orderDate >= new Date(fromDate);
    }

    if (toDate) {
      const endDate = new Date(toDate);
      endDate.setHours(23, 59, 59, 999);
      dateMatch = dateMatch && orderDate <= endDate;
    }
  }

  return orderMatch && customerMatch && paymentMatch && statusMatch && dateMatch;

});
  const columnDefs = [

    {
      headerName: "Order ID",
      field: "orderNumber",
      flex: 1,
    },

   {
  headerName: "Customer",
  flex: 1,
  valueGetter: (p) =>
    `${p.data.customer?.name || "-"} (${p.data.customer?.phone || "-"})`,
},
    {
      headerName: "Total Amount",
      field: "totalAmount",
      flex: 1,
      valueFormatter: (p) => `₹${p.value}`,
    },

    {
      headerName: "Order Status",
      field: "orderStatus",
      flex: 1,
      cellRenderer: (p) => (
        <span className="badge bg-danger">{p.value}</span>
      ),
    },

    {
      headerName: "Payment Status",
      field: "paymentStatus",
      flex: 1,
      cellRenderer: (p) => {

        const map = {
          SUCCESS: "badge bg-success",
          PENDING: "badge bg-warning",
          FAILED: "badge bg-danger",
          CANCELLED: "badge bg-secondary",
        };

        return (
          <span className={map[p.value] || "badge bg-secondary"}>
            {p.value}
          </span>
        );
      },
    },

    {
      headerName: "Products",
      flex: 1,
      valueGetter: (p) => p.data.products?.length || 0,
    },

    {
      headerName: "View",
      flex: 1,
      cellRenderer: (p) => (
        <button
          className="btn  btn-sm"
          onClick={() => setSelectedOrder(p.data)}
        >
          <span className="text-primary"><GrFormView /></span>
        </button>
      ),
    },

  ];
  const defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };
  const exportColumns = [
  { header: "Order ID", key: "orderNumber" },

  {
    header: "Customer",
    render: (row) =>
      `${row.customer?.name || "-"} (${row.customer?.phone || "-"})`,
  },

  {
    header: "Total Amount",
    render: (row) => `₹${row.totalAmount}`,
  },

  { header: "Order Status", key: "orderStatus" },

  { header: "Payment Status", key: "paymentStatus" },

  {
    header: "Products",
    render: (row) => row.products?.length || 0,
  },
];

  return (

    <div className="container mt-4">

      <h2 className="mb-4 d-flex align-items-center fs-3">
        <b>Cancelled Orders</b>
      </h2>
    
      <ExportButtons
  data={filteredOrders}
  columns={exportColumns}
  title="Cancelled Orders"
/>

     <div className="row mb-3 g-3">
        <div className="col-md-3">
          <input
            type="text"
            className="form-control bg-light"
            placeholder="Search Order ID"
            value={searchOrder}
            onChange={(e) => setSearchOrder(e.target.value)}
          />
        </div>

        <div className="col-md-3">
          <input
            type="text"
            className="form-control bg-light"
            placeholder="Search Customer"
            value={searchCustomer}
            onChange={(e) => setSearchCustomer(e.target.value)}
          />
        </div>

        <div className="col-md-3">
          <input
            type="text"
            className="form-control bg-light"
            placeholder="Search Payment Status"
            value={searchPayment}
            onChange={(e) => setSearchPayment(e.target.value)}
          />
        </div>

        <div className="col-md-2">
          <input
            type="text"
            className="form-control bg-light"
            placeholder="Search Order Status"
            value={searchStatus}
            onChange={(e) => setSearchStatus(e.target.value)}
          />
        </div>
  <div className="row mb-3 g-3">

  <div className="col-md-3">
    <label><b>From Date</b></label>
    <input
      type="date"
      className="form-control"
      value={fromDate}
      onChange={(e) => setFromDate(e.target.value)}
    />
  </div>

  <div className="col-md-3">
    <label><b>To Date</b></label>
    <input
      type="date"
      className="form-control"
      value={toDate}
      onChange={(e) => setToDate(e.target.value)}
    />
  </div>


</div>
        <div className="col-md-1">
          <button
            className="btn btn-danger w-100"
            onClick={() => {
              setSearchOrder("");
              setSearchCustomer("");
              setSearchPayment("");
              setSearchStatus("");
                setFromDate("");
        setToDate("");
            }}
          >
            Reset
          </button>
        </div>

      </div>

      {status === "loading" && (
        <p>Loading cancelled orders...</p>
      )}

      <div
        className="ag-theme-alpine"
        style={{
          height: 500,
          width: "100%",
          borderRadius: "10px",
          overflow: "hidden"
        }}
      >

        <AgGridReact
          rowData={filteredOrders}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination={true}
          paginationPageSize={10}
          animateRows={true}
            rowHeight={50} 
        />

      </div>


      {selectedOrder && (

        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >

          <div className="modal-dialog modal-lg modal-dialog-centered">

            <div className="modal-content">

              <div className="modal-header">

                <h5 className="modal-title text-white">
                  Cancelled Order Details
                </h5>

                <button
                  className="btn-close"
                  onClick={() => setSelectedOrder(null)}
                />

              </div>

              <div className="modal-body">

                <p><b>Order ID:</b> {selectedOrder.orderNumber}</p>
                <p><b>Customer:</b> {selectedOrder.customer?.name}</p>
<p><b>Phone:</b> {selectedOrder.customer?.phone}</p>
                <p><b>Total:</b> ₹{selectedOrder.totalAmount}</p>
                <p><b>Order Status:</b> {selectedOrder.orderStatus}</p>
                <p><b>Payment Status:</b> {selectedOrder.paymentStatus}</p>

                <hr />

                <h5>Products</h5>

                {(selectedOrder.products || []).map((p) => (

                  <div
                    key={p.product_item_id}
                    className="d-flex align-items-center mb-3 border rounded p-2"
                  >

                    <img
                      src={p.image}
                      alt=""
                      width="70"
                      height="70"
                      style={{
                        objectFit: "cover",
                        marginRight: 12,
                        borderRadius: "6px"
                      }}
                    />

                    <div>

                      <p className="mb-1">
                        <b>{p.title}</b>
                      </p>

                      <p className="mb-1">
                        Qty: {p.qty}
                      </p>

                      <p className="mb-1">
                        Price: ₹{p.price}
                      </p>

                      <p className="mb-0">
                        Size: {p.dimension}
                      </p>

                    </div>

                  </div>

                ))}

              </div>

            </div>

          </div>

        </div>

      )}

    </div>

  );

};

export default CancelledOrdersPage;