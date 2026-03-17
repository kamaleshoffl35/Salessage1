// import { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import ReusableTable from "../components/ReusableTable";
// import { getMe } from "../services/userService";
// import useTableActions from "../components/useTableActions";
// import { useNavigate } from "react-router-dom";
// import HistoryModal from "../components/HistoryModal";

// import {
//   fetchOrders,
//   updateOrderStatus,
//   updatePaymentStatus,
//   deleteOrder,
// } from "../redux/orderSlice";

// const OrdersPage = () => {

//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const { items: orders, status } = useSelector((state) => state.orders);

//   const [searchOrder, setSearchOrder] = useState("");
//   const [searchCustomer, setSearchCustomer] = useState("");
//   const [searchPayment, setSearchPayment] = useState("");
//   const [searchOrderStatus, setSearchOrderStatus] = useState("");
// const [editingOrder, setEditingOrder] = useState(null);
//   const [selectedOrder, setSelectedOrder] = useState(null);

//   const [showHistoryModal, setShowHistoryModal] = useState(false);
//   const [historyInfo, setHistoryInfo] = useState(null);

//   const [user, setUser] = useState(null);

//   const role = user?.role || "user";

// const tableActions = useTableActions(role).filter(
//   (action) => action.type !== "edit"
// );

//   /* =============================
//         LOAD DATA
//   ============================= */

//   useEffect(() => {

//     getMe()
//       .then((u) => setUser(u))
//       .catch(() => navigate("/login"));

//     dispatch(fetchOrders());

//   }, [dispatch, navigate]);

//   /* =============================
//         STATUS BADGES
//   ============================= */

//   const orderBadge = (status) => {

//     const map = {
//       pending: "badge bg-warning",
//       confirmed: "badge bg-info",
//       processing: "badge bg-primary",
//       shipped: "badge bg-dark",
//       delivered: "badge bg-success",
//       cancelled: "badge bg-danger",
//     };

//     return <span className={map[status] || "badge bg-secondary"}>{status}</span>;
//   };

//   const paymentBadge = (status) => {

//     const map = {
//       SUCCESS: "badge bg-success",
//       PENDING: "badge bg-warning",
//       FAILED: "badge bg-danger",
//       CANCELLED: "badge bg-secondary",
//     };

//     return <span className={map[status] || "badge bg-secondary"}>{status}</span>;
//   };

//   /* =============================
//         FILTER ORDERS
//   ============================= */

//   const filteredOrders = orders.filter((o) => {

//     const orderMatch =
//       searchOrder.trim() === "" ||
//       o.orderNumber?.toLowerCase().includes(searchOrder.toLowerCase());

//     const customerMatch =
//       searchCustomer.trim() === "" ||
//       o.user?.name?.toLowerCase().includes(searchCustomer.toLowerCase());

//     const paymentMatch =
//       searchPayment.trim() === "" ||
//       o.paymentStatus?.toLowerCase().includes(searchPayment.toLowerCase());
//        const orderStatusMatch =
//     searchOrderStatus.trim() === "" ||
//     o.orderStatus?.toLowerCase().includes(searchOrderStatus.toLowerCase());

//     return orderMatch && customerMatch && paymentMatch && orderStatusMatch

//   });

//   /* =============================
//         TABLE COLUMNS
//   ============================= */

//   const tableColumns = [

//     {
//       key: "orderNumber",
//       header: "Order ID",
//       render: (order) => order.orderNumber,
//     },

//     {
//       key: "customer",
//       header: "Customer",
//       render: (order) => order.user?.name || "-",
//     },

//     {
//       key: "totalAmount",
//       header: "Total",
//       render: (order) => `₹${order.totalAmount}`,
//     },

//     {
//       key: "orderStatus",
//       header: "Order Status",
//       render: (order) => orderBadge(order.orderStatus),
//     },

//     {
//       key: "updateOrder",
//       header: "Update Order",
//       render: (order) => (
//         <select
//           className="form-select"
//           value={order.orderStatus}
//           onChange={(e) =>
//             dispatch(
//               updateOrderStatus({
//                 id: order._id,
//                 status: e.target.value,
//               })
//             )
//           }
//         >
//           <option value="pending">Pending</option>
//           <option value="confirmed">Confirmed</option>
//           <option value="processing">Processing</option>
//           <option value="shipped">Shipped</option>
//           <option value="delivered">Delivered</option>
//           <option value="cancelled">Cancelled</option>
//         </select>
//       ),
//     },

//     {
//       key: "paymentStatus",
//       header: "Payment Status",
//       render: (order) => paymentBadge(order.paymentStatus),
//     },

//     {
//       key: "updatePayment",
//       header: "Update Payment",
//       render: (order) => (
//         <select
//           className="form-select"
//           value={order.paymentStatus}
//           onChange={(e) =>
//             dispatch(
//               updatePaymentStatus({
//                 id: order._id,
//                 status: e.target.value,
//               })
//             )
//           }
//         >
//           <option value="PENDING">Pending</option>
//           <option value="SUCCESS">Success</option>
//           <option value="FAILED">Failed</option>
//           <option value="CANCELLED">Cancelled</option>
//         </select>
//       ),
//     },

//     {
//       key: "view",
//       header: "View",
//       render: (order) => (
//         <button
//           className="btn btn-primary btn-sm"
//           onClick={() => setSelectedOrder(order)}
//         >
//           View
//         </button>
//       ),
//     },

//   ];

//   /* =============================
//         TABLE ACTIONS
//   ============================= */

//   const handleTableAction = (actionType, order) => {

//   if (actionType === "edit") {
//   setEditingOrder(order);
// }

//     if (actionType === "delete") {

//       const confirmDelete = window.confirm(
//         "Are you sure you want to delete this order?"
//       );

//       if (confirmDelete) {
//         dispatch(deleteOrder(order._id));
//       }
//     }

//     if (actionType === "history") {

//       setHistoryInfo({
//         createdAt: order.createdAt,
//         createdBy: order.user?.name || "-",
//       });

//       setShowHistoryModal(true);
//     }
//   };

//   return (

//     <div className="container mt-4">

//       <h2 className="mb-4">
//         <b>Orders</b>
//       </h2>

//       <ReusableTable
//         data={filteredOrders}
//         columns={tableColumns}
//         loading={status === "loading"}
//         searchable={true}
//         searchTerm1={searchOrder}
//         searchTerm2={searchCustomer}
//         searchTerm3={searchPayment}
//           searchTerm4={searchOrderStatus} // new
//         onSearchChange1={setSearchOrder}
//         onSearchChange2={setSearchCustomer}
//         onSearchChange3={setSearchPayment}
//         onSearchChange4={setSearchOrderStatus} // new
//         searchPlaceholder1="Search by Order ID"
//         searchPlaceholder2="Search by Customer"
//         searchPlaceholder3="Search by Payment Status"
//         searchPlaceholder4="Search by Order Status" // new
//         showThirdSearch={true}
//          showFourthSearch={true}
//         actions={tableActions}
//         onActionClick={handleTableAction}
//         emptyMessage="No orders found."
//         onResetSearch={() => {
//           setSearchOrder("");
//           setSearchCustomer("");
//           setSearchPayment("");
//            setSearchOrderStatus("");
//         }}
//       />

//       {selectedOrder && (
//         <div
//           className="modal show d-block"
//           style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
//         >
//           <div className="modal-dialog modal-dialog-centered">

//             <div className="modal-content">

//               <div className="modal-header">

//                 <h5 className="modal-title">
//                   Order Details
//                 </h5>

//                 <button
//                   className="btn-close"
//                   onClick={() => setSelectedOrder(null)}
//                 />

//               </div>

//               <div className="modal-body">

//                 <p><b>Order ID:</b> {selectedOrder.orderNumber}</p>
//                 <p><b>Customer:</b> {selectedOrder.user?.name}</p>
//                 <p><b>Total:</b> ₹{selectedOrder.totalAmount}</p>
//                 <p><b>Order Status:</b> {selectedOrder.orderStatus}</p>
//                 <p><b>Payment Status:</b> {selectedOrder.paymentStatus}</p>

//               </div>

//             </div>

//           </div>
//         </div>
//       )}

//       {editingOrder && (
//   <div
//     className="modal show d-block"
//     style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
//   >
//     <div className="modal-dialog modal-dialog-centered">
//       <div className="modal-content">

//         <div className="modal-header">
//           <h5 className="modal-title">Edit Order</h5>
//           <button
//             className="btn-close"
//             onClick={() => setEditingOrder(null)}
//           />
//         </div>

//         <div className="modal-body">

//           <div className="mb-3">
//             <label>Order Status</label>

//             <select
//               className="form-select"
//               value={editingOrder.orderStatus}
//               onChange={(e) =>
//                 setEditingOrder({
//                   ...editingOrder,
//                   orderStatus: e.target.value,
//                 })
//               }
//             >
//               <option value="pending">Pending</option>
//               <option value="confirmed">Confirmed</option>
//               <option value="processing">Processing</option>
//               <option value="shipped">Shipped</option>
//               <option value="delivered">Delivered</option>
//               <option value="cancelled">Cancelled</option>
//             </select>
//           </div>

//           <div className="mb-3">
//             <label>Payment Status</label>

//             <select
//               className="form-select"
//               value={editingOrder.paymentStatus}
//               onChange={(e) =>
//                 setEditingOrder({
//                   ...editingOrder,
//                   paymentStatus: e.target.value,
//                 })
//               }
//             >
//               <option value="PENDING">Pending</option>
//               <option value="SUCCESS">Success</option>
//               <option value="FAILED">Failed</option>
//               <option value="CANCELLED">Cancelled</option>
//             </select>
//           </div>

//           <button
//             className="btn btn-primary"
//             onClick={() => {
//               dispatch(
//                 updateOrderStatus({
//                   id: editingOrder._id,
//                   status: editingOrder.orderStatus,
//                 })
//               );

//               dispatch(
//                 updatePaymentStatus({
//                   id: editingOrder._id,
//                   status: editingOrder.paymentStatus,
//                 })
//               );

//               setEditingOrder(null);
//             }}
//           >
//             Update Order
//           </button>

//         </div>
//       </div>
//     </div>
//   </div>
// )}

//       <HistoryModal
//         open={showHistoryModal}
//         onClose={() => setShowHistoryModal(false)}
//         data={historyInfo}
//       />

//     </div>
//   );
// };

// export default OrdersPage;


import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ReusableTable from "../components/ReusableTable";
import { getMe } from "../services/userService";
import useTableActions from "../components/useTableActions";
import { useNavigate } from "react-router-dom";
import HistoryModal from "../components/HistoryModal";

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
    const orderMatch = searchOrder.trim() === "" || o.orderNumber?.toLowerCase().includes(searchOrder.toLowerCase());
    const customerMatch = searchCustomer.trim() === "" || o.user?.name?.toLowerCase().includes(searchCustomer.toLowerCase());
    const paymentMatch = searchPayment.trim() === "" || o.paymentStatus?.toLowerCase().includes(searchPayment.toLowerCase());
    const orderStatusMatch = searchOrderStatus.trim() === "" || o.orderStatus?.toLowerCase().includes(searchOrderStatus.toLowerCase());
    return orderMatch && customerMatch && paymentMatch && orderStatusMatch;
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
        <button className="btn btn-primary btn-sm" onClick={() => setSelectedOrder(o)}>
          View
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

  return (
    <div className="container mt-4">
      <h2 className="mb-4"><b>Orders</b></h2>

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
                <p><b>Order ID:</b> {selectedOrder.orderNumber}</p>
                <p><b>Customer:</b> {selectedOrder.user?.name}</p>
                <p><b>Address:</b> {selectedOrder.user?.address || "-"}</p> {/* preserved */}
                <p><b>Total:</b> ₹{selectedOrder.totalAmount}</p>
                <p><b>Order Status:</b> {selectedOrder.orderStatus}</p>
                <p><b>Payment Status:</b> {selectedOrder.paymentStatus}</p>
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