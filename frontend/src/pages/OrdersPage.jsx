import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ReusableTable from "../components/ReusableTable";
import { getMe } from "../services/userService";
import useTableActions from "../components/useTableActions";
import { useNavigate } from "react-router-dom";
import HistoryModal from "../components/HistoryModal";
import { GrFormView } from "react-icons/gr";
import ExportButtons from "../components/ExportButtons";
import {
  fetchOrders,
  updateOrderStatus,
  updatePaymentStatus,
  deleteOrder,
} from "../redux/orderSlice";

const OrdersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: orders, status } = useSelector((state) => state.orders);
const [fromDate, setFromDate] = useState("");
const [toDate, setToDate] = useState("");
  const [searchOrder, setSearchOrder] = useState("");
  const [searchCustomer, setSearchCustomer] = useState("");
  const [searchPayment, setSearchPayment] = useState("");
  const [searchOrderStatus, setSearchOrderStatus] = useState("");

  const [editingOrder, setEditingOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyInfo, setHistoryInfo] = useState(null);
  const [user, setUser] = useState(null);

  const role = user?.role || "user";
  const tableActions = useTableActions(role).filter((a) => a.type !== "edit");

  useEffect(() => {
    getMe()
      .then((u) => setUser(u))
      .catch(() => navigate("/login"));
    dispatch(fetchOrders());
  }, [dispatch, navigate]);

  const orderBadge = (status) => {
    const map = {
      pending: "badge bg-warning",
      confirmed: "badge bg-info",
      processing: "badge bg-primary",
      shipped: "badge bg-dark",
      delivered: "badge bg-success",
      cancelled: "badge bg-danger",
    };
    return <span className={map[status] || "badge bg-secondary"}>{status}</span>;
  };

  const paymentBadge = (status) => {
    const map = {
      SUCCESS: "badge bg-success",
      PENDING: "badge bg-warning",
      FAILED: "badge bg-danger",
      CANCELLED: "badge bg-secondary",
    };
    return <span className={map[status] || "badge bg-secondary"}>{status}</span>;
  };

 const filteredOrders = orders.filter((o) => {
  const orderMatch =
    searchOrder.trim() === "" ||
    o.orderNumber?.toLowerCase().includes(searchOrder.toLowerCase());

  const customerMatch =
    searchCustomer.trim() === "" ||
    o.user?.name?.toLowerCase().includes(searchCustomer.toLowerCase());

  const paymentMatch =
    searchPayment.trim() === "" ||
    o.paymentStatus?.toLowerCase().includes(searchPayment.toLowerCase());

  const orderStatusMatch =
    searchOrderStatus.trim() === "" ||
    o.orderStatus?.toLowerCase().includes(searchOrderStatus.toLowerCase());

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

  return orderMatch && customerMatch && paymentMatch && orderStatusMatch && dateMatch;
});

  const tableColumns = [
    { key: "orderNumber", header: "Order ID", render: (o) => o.orderNumber },
    { key: "customer", header: "Customer", render: (o) => o.user?.name || "-" },
    { key: "totalAmount", header: "Total", render: (o) => `₹${o.totalAmount}` },
    { key: "orderStatus", header: "Order Status", render: (o) => orderBadge(o.orderStatus) },
    {
      key: "updateOrder",
      header: "Update Order",
      render: (o) => (
        <select
          className="form-select"
          value={o.orderStatus}
          onChange={(e) =>
            dispatch(updateOrderStatus({ id: o._id, status: e.target.value }))
          }
        >
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      ),
    },
    { key: "paymentStatus", header: "Payment Status", render: (o) => paymentBadge(o.paymentStatus) },
    {
      key: "updatePayment",
      header: "Update Payment",
      render: (o) => (
        <select
          className="form-select"
          value={o.paymentStatus}
          onChange={(e) =>
            dispatch(updatePaymentStatus({ id: o._id, status: e.target.value }))
          }
        >
          <option value="PENDING">Pending</option>
          <option value="SUCCESS">Success</option>
          <option value="FAILED">Failed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      ),
    },
    {
      key: "view",
      header: "View",
      render: (o) => (
        <button className="btn btn-sm" onClick={() => setSelectedOrder(o)}>
          <span className="text-danger"><GrFormView/></span>
        </button>
      ),
    },
  ];

  const handleTableAction = (actionType, order) => {
    if (actionType === "edit") setEditingOrder(order);
    if (actionType === "delete") {
      if (window.confirm("Are you sure you want to delete this order?")) {
        dispatch(deleteOrder(order._id));
      }
    }
    if (actionType === "history") {
      setHistoryInfo({ createdAt: order.createdAt, createdBy: order.user?.name || "-" });
      setShowHistoryModal(true);
    }
  };

  const exportColumns = [
  { header: "Order ID", key: "orderNumber" },

  {
    header: "Customer",
    render: (o) => o.user?.name || "-"
  },

  {
    header: "Total Amount",
    render: (o) => `₹${o.totalAmount}`
  },

  {
    header: "Order Status",
    key: "orderStatus"
  },

  {
    header: "Payment Status",
    key: "paymentStatus"
  }
];

  return (
    <div className="container mt-4">
      <h2 className="mb-4"><b>Orders</b></h2>
      <div className="row mb-3">

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

  <div className="col-md-2 d-flex align-items-end">
    <button
      className="btn btn-secondary"
      onClick={() => {
        setFromDate("");
        setToDate("");
      }}
    >
      Reset Date
    </button>
  </div>

</div>
<ExportButtons
  data={filteredOrders}
  columns={exportColumns}
  title="Orders Report"
/>
      <ReusableTable
        data={filteredOrders}
        columns={tableColumns}
        loading={status === "loading"}
        searchable={true}
        searchTerm1={searchOrder}
        searchTerm2={searchCustomer}
        searchTerm3={searchPayment}
        searchTerm4={searchOrderStatus}
        onSearchChange1={setSearchOrder}
        onSearchChange2={setSearchCustomer}
        onSearchChange3={setSearchPayment}
        onSearchChange4={setSearchOrderStatus}
        searchPlaceholder1="Search by Order ID"
        searchPlaceholder2="Search by Customer"
        searchPlaceholder3="Search by Payment Status"
        searchPlaceholder4="Search by Order Status"
        showThirdSearch={true}
        showFourthSearch={true}
        actions={tableActions}
        onActionClick={handleTableAction}
        emptyMessage="No orders found."
        onResetSearch={() => {
          setSearchOrder(""); setSearchCustomer(""); setSearchPayment(""); setSearchOrderStatus("");
        }}
      />

      {selectedOrder && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Order Details</h5>
                <button className="btn-close" onClick={() => setSelectedOrder(null)} />
              </div>
      <div className="modal-body">
  <div className="row">

    {/* LEFT SIDE - ORDER DETAILS */}
    <div className="col-md-6 border-end">

      <p><b>Order ID:</b> {selectedOrder.orderNumber}</p>
<p><b>Order Date:</b> {selectedOrder.orderDate}</p>
      <p><b>Customer:</b> {selectedOrder.user?.name}</p>
      <p><b>Email:</b> {selectedOrder.user?.email}</p>
      <p><b>Phone:</b> {selectedOrder.user?.phone}</p>

      <p>
        <b>Address:</b><br/>
        {selectedOrder.user?.addressLine1}<br/>
        {selectedOrder.user?.city}, {selectedOrder.user?.state}<br/>
        {selectedOrder.user?.postalCode}, {selectedOrder.user?.country}
      </p>

      <p><b>Payment Mode:</b> {selectedOrder.paymentMode}</p>

      <p><b>Total:</b> ₹{selectedOrder.totalAmount}</p>

      <p><b>Order Status:</b> {selectedOrder.orderStatus}</p>

      <p><b>Payment Status:</b> {selectedOrder.paymentStatus}</p>

    </div>


    {/* RIGHT SIDE - PRODUCT DETAILS */}
    <div className="col-md-6">

      <h6 className="mb-3"><b>Products</b></h6>

      {selectedOrder.products?.map((p, index) => (
        <div key={index} className="border rounded p-2 mb-3 d-flex">

          <img
            src={p.productDetails?.image}
            alt=""
            width="70"
            height="70"
            style={{ objectFit: "cover", marginRight: "10px" }}
          />

          <div>
            <p className="mb-1"><b>{p.productDetails?.title}</b></p>
            <p className="mb-1">Category: {p.productDetails?.category}</p>
            <p className="mb-1">Size: {p.selectedSize?.dimension}</p>
            <p className="mb-1">Qty: {p.qty}</p>
            <p className="mb-0">Price: ₹{p.price}</p>
          </div>

        </div>
      ))}

    </div>

  </div>
</div>
            </div>
          </div>
        </div>
      )}

      {editingOrder && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Order</h5>
                <button className="btn-close" onClick={() => setEditingOrder(null)} />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label>Order Status</label>
                  <select
                    className="form-select"
                    value={editingOrder.orderStatus}
                    onChange={(e) =>
                      setEditingOrder({ ...editingOrder, orderStatus: e.target.value })
                    }
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label>Payment Status</label>
                  <select
                    className="form-select"
                    value={editingOrder.paymentStatus}
                    onChange={(e) =>
                      setEditingOrder({ ...editingOrder, paymentStatus: e.target.value })
                    }
                  >
                    <option value="PENDING">Pending</option>
                    <option value="SUCCESS">Success</option>
                    <option value="FAILED">Failed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={() => {
                    dispatch(updateOrderStatus({ id: editingOrder._id, status: editingOrder.orderStatus }));
                    dispatch(updatePaymentStatus({ id: editingOrder._id, status: editingOrder.paymentStatus }));
                    setEditingOrder(null);
                  }}
                >
                  Update Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <HistoryModal open={showHistoryModal} onClose={() => setShowHistoryModal(false)} data={historyInfo} />
    </div>
  );
};

export default OrdersPage;