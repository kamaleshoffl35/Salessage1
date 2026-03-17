import { useEffect, useState } from "react";
import API from "../api/axiosInstance";
import ReusableTable from "../components/ReusableTable";
import { getMe } from "../services/userService";
import useTableActions from "../components/useTableActions";
import { useNavigate } from "react-router-dom";
import HistoryModal from "../components/HistoryModal";

const OrdersPage = () => {

  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("idle");

  const [searchOrder, setSearchOrder] = useState("");
  const [searchCustomer, setSearchCustomer] = useState("");
  const [searchPayment, setSearchPayment] = useState("");

  const [selectedOrder, setSelectedOrder] = useState(null);

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyInfo, setHistoryInfo] = useState(null);

  const [user, setUser] = useState(null);

  const role = user?.role || "user";

  const tableActions = useTableActions(role);

  /* =============================
        FETCH ORDERS
  ============================= */

  const fetchOrders = async () => {
    try {

      setStatus("loading");

      const res = await API.get("/admin/orders");

      setOrders(res.data);

      setStatus("success");

    } catch (err) {

      console.error("Fetch orders error", err);

      setStatus("failed");

    }
  };

  useEffect(() => {

    getMe()
      .then((u) => setUser(u))
      .catch(() => navigate("/login"));

    fetchOrders();

  }, [navigate]);

  /* =============================
        UPDATE ORDER STATUS
  ============================= */

  const updateOrderStatus = async (id, status) => {

    try {

      await API.put(`/admin/orders/${id}/status`, { status });

      fetchOrders();

    } catch (err) {

      console.error("Order status update failed", err);

    }
  };

  /* =============================
        UPDATE PAYMENT STATUS
  ============================= */

  const updatePaymentStatus = async (id, status) => {

    try {

      await API.put(`/admin/orders/${id}/payment-status`, { status });

      fetchOrders();

    } catch (err) {

      console.error("Payment update failed", err);

    }
  };

  /* =============================
        DELETE ORDER
  ============================= */

  const deleteOrder = async (id) => {

    const confirmDelete = window.confirm("Are you sure you want to delete this order?");

    if (!confirmDelete) return;

    try {

      await API.delete(`/admin/orders/${id}`);

      fetchOrders();

    } catch (err) {

      console.error("Delete order failed", err);

    }

  };

  /* =============================
        EDIT ORDER
  ============================= */

  const editOrder = (order) => {

    navigate(`/admin/orders/edit/${order._id}`);

  };

  /* =============================
        STATUS BADGES
  ============================= */

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

  /* =============================
        FILTER ORDERS
  ============================= */

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

    return orderMatch && customerMatch && paymentMatch;

  });

  /* =============================
        TABLE COLUMNS
  ============================= */

  const tableColumns = [

    {
      key: "orderNumber",
      header: "Order ID",
      render: (order) => order.orderNumber,
    },

    {
      key: "customer",
      header: "Customer",
      render: (order) => order.user?.name || "-",
    },

    {
      key: "totalAmount",
      header: "Total",
      render: (order) => `₹${order.totalAmount}`,
    },

    {
      key: "orderStatus",
      header: "Order Status",
      render: (order) => orderBadge(order.orderStatus),
    },

    {
      key: "updateOrder",
      header: "Update Order",
      render: (order) => (
        <select
          className="form-select"
          value={order.orderStatus}
          onChange={(e) =>
            updateOrderStatus(order._id, e.target.value)
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

    {
      key: "paymentStatus",
      header: "Payment Status",
      render: (order) => paymentBadge(order.paymentStatus),
    },

    {
      key: "updatePayment",
      header: "Update Payment",
      render: (order) => (
        <select
          className="form-select"
          value={order.paymentStatus}
          onChange={(e) =>
            updatePaymentStatus(order._id, e.target.value)
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
      render: (order) => (
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setSelectedOrder(order)}
        >
          View
        </button>
      ),
    }

  ];

  /* =============================
        TABLE ACTIONS
  ============================= */

  const handleTableAction = (actionType, order) => {

    if (actionType === "edit") {
      editOrder(order);
    }

    if (actionType === "delete") {
      deleteOrder(order._id);
    }

    if (actionType === "history") {

      setHistoryInfo({
        createdAt: order.createdAt,
        createdBy: order.user?.name || "-",
      });

      setShowHistoryModal(true);

    }

  };

  return (

    <div className="container mt-4">

      <h2 className="mb-4">
        <b>Orders</b>
      </h2>

      <ReusableTable
        data={filteredOrders}
        columns={tableColumns}
        loading={status === "loading"}
        searchable={true}
        searchTerm1={searchOrder}
        searchTerm2={searchCustomer}
        searchTerm3={searchPayment}
        onSearchChange1={setSearchOrder}
        onSearchChange2={setSearchCustomer}
        onSearchChange3={setSearchPayment}
        searchPlaceholder1="Search by Order ID"
        searchPlaceholder2="Search by Customer"
        searchPlaceholder3="Search by Payment Status"
        showThirdSearch={true}
        actions={tableActions}
        onActionClick={handleTableAction}
        emptyMessage="No orders found."
        onResetSearch={() => {
          setSearchOrder("");
          setSearchCustomer("");
          setSearchPayment("");
        }}
      />

      {/* ORDER DETAILS MODAL */}

      {selectedOrder && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">

            <div className="modal-content">

              <div className="modal-header">

                <h5 className="modal-title">
                  Order Details
                </h5>

                <button
                  className="btn-close"
                  onClick={() => setSelectedOrder(null)}
                />

              </div>

              <div className="modal-body">

                <p><b>Order ID:</b> {selectedOrder.orderNumber}</p>

                <p><b>Customer:</b> {selectedOrder.user?.name}</p>

                <p><b>Total:</b> ₹{selectedOrder.totalAmount}</p>

                <p><b>Order Status:</b> {selectedOrder.orderStatus}</p>

                <p><b>Payment Status:</b> {selectedOrder.paymentStatus}</p>

              </div>

            </div>

          </div>
        </div>
      )}

      <HistoryModal
        open={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        data={historyInfo}
      />

    </div>

  );

};

export default OrdersPage;