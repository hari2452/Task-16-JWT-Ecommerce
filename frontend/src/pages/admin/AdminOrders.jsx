import {
  useEffect,
  useState,
} from "react";

import api from "../../api";


const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Cancelled",
];


function AdminOrders() {
  const [orders, setOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [updatingOrderId, setUpdatingOrderId] =
    useState(null);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("");


  // =====================================
  // LOAD ALL CUSTOMER ORDERS
  // =====================================

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/api/orders"
      );

      setOrders(
        response.data.data || []
      );

    } catch (err) {
      console.log(
        "Admin Orders Error:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Unable to load customer orders"
      );

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadOrders();
  }, []);


  // =====================================
  // UPDATE ORDER STATUS
  // =====================================

  const handleStatusChange = async (
    orderId,
    newStatus
  ) => {
    try {
      setUpdatingOrderId(orderId);
      setError("");
      setMessage("");

      await api.put(
        `/api/orders/${orderId}/status`,
        {
          status: newStatus,
        }
      );


      // Update only the changed order
      // inside React state.

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: newStatus,
              }
            : order
        )
      );


      setMessage(
        `Order #${orderId} status updated to ${newStatus}`
      );


      setTimeout(() => {
        setMessage("");
      }, 3000);

    } catch (err) {
      console.log(
        "Status Update Error:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Unable to update order status"
      );

    } finally {
      setUpdatingOrderId(null);
    }
  };


  // =====================================
  // FILTER ORDERS
  // =====================================

  const filteredOrders =
    statusFilter
      ? orders.filter(
          (order) =>
            order.status === statusFilter
        )
      : orders;


  // =====================================
  // ORDER STATISTICS
  // =====================================

  const totalOrders =
    orders.length;


  const pendingOrders =
    orders.filter(
      (order) =>
        order.status === "Pending"
    ).length;


  const shippedOrders =
    orders.filter(
      (order) =>
        order.status === "Shipped"
    ).length;


  const deliveredOrders =
    orders.filter(
      (order) =>
        order.status === "Delivered"
    ).length;


  const totalRevenue =
    orders
      .filter(
        (order) =>
          order.status !== "Cancelled"
      )
      .reduce(
        (total, order) =>
          total +
          Number(order.total_amount),
        0
      );


  // =====================================
  // LOADING
  // =====================================

  if (loading) {
    return (
      <div className="admin-orders-page">

        <div className="admin-orders-status">
          <p>Loading customer orders...</p>
        </div>

      </div>
    );
  }


  return (
    <div className="admin-orders-page">

      {/* PAGE HEADER */}

      <div className="admin-orders-header">

        <div>
          <h1>Order Management</h1>

          <p>
            View customer orders and update
            their delivery status
          </p>
        </div>


        <button
          type="button"
          className="refresh-orders-button"
          onClick={loadOrders}
        >
          Refresh Orders
        </button>

      </div>


      {/* ERROR */}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}


      {/* SUCCESS MESSAGE */}

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}


      {/* ORDER STATISTICS */}

      <div className="admin-order-statistics">

        <div className="admin-stat-card">

          <span>
            Total Orders
          </span>

          <strong>
            {totalOrders}
          </strong>

        </div>


        <div className="admin-stat-card pending-stat">

          <span>
            Pending
          </span>

          <strong>
            {pendingOrders}
          </strong>

        </div>


        <div className="admin-stat-card shipped-stat">

          <span>
            Shipped
          </span>

          <strong>
            {shippedOrders}
          </strong>

        </div>


        <div className="admin-stat-card delivered-stat">

          <span>
            Delivered
          </span>

          <strong>
            {deliveredOrders}
          </strong>

        </div>


        <div className="admin-stat-card revenue-stat">

          <span>
            Total Revenue
          </span>

          <strong>
            ₹
            {totalRevenue.toFixed(2)}
          </strong>

        </div>

      </div>


      {/* FILTER */}

      <div className="admin-orders-toolbar">

        <div>
          <label htmlFor="order-status-filter">
            Filter by status
          </label>

          <select
            id="order-status-filter"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
          >
            <option value="">
              All Orders
            </option>

            {ORDER_STATUSES.map(
              (status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>
              )
            )}

          </select>
        </div>


        <p>
          Showing{" "}
          <strong>
            {filteredOrders.length}
          </strong>{" "}
          order(s)
        </p>

      </div>


      {/* EMPTY ORDERS */}

      {filteredOrders.length === 0 && (

        <div className="admin-orders-empty">

          <span>📦</span>

          <h2>
            No orders found
          </h2>

          <p>
            No customer orders match the
            selected status.
          </p>

        </div>

      )}


      {/* ORDERS */}

      <div className="admin-orders-list">

        {filteredOrders.map((order) => {

          const orderDate =
            order.ordered_at
              ? new Date(
                  order.ordered_at
                ).toLocaleString()
              : "Date unavailable";


          return (
            <article
              className="admin-order-card"
              key={order.id}
            >

              {/* ORDER HEADER */}

              <div className="admin-order-card-header">

                <div>

                  <h2>
                    Order #{order.id}
                  </h2>

                  <p>
                    {orderDate}
                  </p>

                </div>


                <span
                  className={
                    `admin-order-status status-${
                      String(
                        order.status
                      ).toLowerCase()
                    }`
                  }
                >
                  {order.status}
                </span>

              </div>


              {/* CUSTOMER DETAILS */}

              <div className="admin-customer-details">

                <div>

                  <span>
                    Customer
                  </span>

                  <strong>
                    {order.customer_name}
                  </strong>

                </div>


                <div>

                  <span>
                    Email
                  </span>

                  <strong>
                    {order.customer_email}
                  </strong>

                </div>


                <div>

                  <span>
                    Delivery Address
                  </span>

                  <strong>
                    {order.address}
                  </strong>

                </div>

              </div>


              {/* ORDER ITEMS */}

              <div className="admin-order-items">

                <h3>
                  Order Items
                </h3>


                {order.items?.length > 0 ? (

                  order.items.map(
                    (item, index) => {

                      const subtotal =
                        Number(
                          item.unit_price
                        ) *
                        Number(
                          item.quantity
                        );


                      return (
                        <div
                          className="admin-order-item"
                          key={
                            `${order.id}-${item.product_id}-${index}`
                          }
                        >

                          <div>

                            <strong>
                              {item.product_name ||
                                "Deleted Product"}
                            </strong>

                            <p>
                              ₹
                              {Number(
                                item.unit_price
                              ).toFixed(2)}
                              {" × "}
                              {item.quantity}
                            </p>

                          </div>


                          <strong>
                            ₹
                            {subtotal.toFixed(2)}
                          </strong>

                        </div>
                      );
                    }
                  )

                ) : (

                  <p>
                    No item information available.
                  </p>

                )}

              </div>


              {/* ORDER FOOTER */}

              <div className="admin-order-footer">

                <div className="admin-order-total">

                  <span>
                    Order Total
                  </span>

                  <strong>
                    ₹
                    {Number(
                      order.total_amount
                    ).toFixed(2)}
                  </strong>

                </div>


                <div className="admin-status-update">

                  <label
                    htmlFor={
                      `status-${order.id}`
                    }
                  >
                    Update Status
                  </label>


                  <select
                    id={
                      `status-${order.id}`
                    }
                    value={order.status}
                    disabled={
                      updatingOrderId ===
                      order.id
                    }
                    onChange={(event) =>
                      handleStatusChange(
                        order.id,
                        event.target.value
                      )
                    }
                  >
                    {ORDER_STATUSES.map(
                      (status) => (
                        <option
                          key={status}
                          value={status}
                        >
                          {status}
                        </option>
                      )
                    )}

                  </select>


                  {updatingOrderId ===
                    order.id && (

                    <span className="updating-status-text">
                      Updating...
                    </span>

                  )}

                </div>

              </div>

            </article>
          );
        })}

      </div>

    </div>
  );
}


export default AdminOrders;