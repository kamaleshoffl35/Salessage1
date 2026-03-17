import React, { useEffect, useState } from "react";
import axios from "axios";
import API from "../api/axiosInstance";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);

 const fetchOrders = async () => {
  try {
    const res = await API.get("/admin/orders")
    setOrders(res.data);
  } catch (err) {
    console.error("Fetch orders error", err);
  }
};

const updateStatus = async (id, status) => {
  try {
    await API.put(`/admin/orders/${id}/status`, { status });
    fetchOrders();
  } catch (err) {
    console.error("Update failed", err);
  }
};

const updatePaymentStatus = async (id, status) => {
  try {
    await API.put(`/admin/orders/${id}/payment-status`, { status });
    fetchOrders();
  } catch (err) {
    console.error("Payment update failed", err);
  }
};

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div>
      <h2>Manage Orders</h2>

      <table border="1">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>User</th>
            <th>Total</th>
            <th>Order Status</th>
           
            <th>Update Order</th>
             <th>Payment Status</th>
<th>Update Payment</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td>{order.orderNumber}</td>
              <td>{order.user?.name}</td>
              <td>₹{order.totalAmount}</td>

              <td>{order.orderStatus}</td>

              <td>
                <select
                  value={order.orderStatus}
                  onChange={(e) =>
                    updateStatus(order._id, e.target.value)
                  }
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </td>
              <td>{order.paymentStatus}</td>

<td>
  <select
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
</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersPage;