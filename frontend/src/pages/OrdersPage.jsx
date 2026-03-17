import React, { useEffect, useState } from "react";
import axios from "axios";
import API from "../api/axiosInstance";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get("https://your-backend-url/api/admin/orders", {
        withCredentials: true,
      });
      setOrders(res.data);
    } catch (err) {
      console.error("Fetch orders error", err);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(
        `https://your-backend-url/api/admin/orders/${id}/status`,
        { status },
        { withCredentials: true }
      );

      fetchOrders(); // refresh
    } catch (err) {
      console.error("Update failed", err);
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
            <th>Status</th>
            <th>Update</th>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersPage;