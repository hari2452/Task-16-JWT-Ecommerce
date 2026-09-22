import {
  useEffect,
  useMemo,
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

  const [search, setSearch] =
    useState("");


  // =====================================
  // LOAD ORDERS
  // =====================================

  const loadOrders = async () => {

    try {

      setLoading(true);
      setError("");

      const response =
        await api.get("/api/orders");

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
        err.response?.data?.msg ||
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
  // UPDATE STATUS
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


      setOrders(
        (currentOrders) =>
          currentOrders.map(
            (order) =>
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
        err.response?.data?.msg ||
        "Unable to update order status"
      );

    } finally {

      setUpdatingOrderId(null);
    }
  };


  // =====================================
  // STATISTICS
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
          Number(
            order.total_amount || 0
          ),
        0
      );


  // =====================================
  // FILTER + SEARCH
  // =====================================

  const filteredOrders =
    useMemo(() => {

      const searchValue =
        search.trim().toLowerCase();


      return orders.filter(
        (order) => {

          const matchesStatus =
            !statusFilter ||
            order.status === statusFilter;


          const matchesSearch =
            !searchValue ||
            String(order.id)
              .includes(searchValue) ||
            String(
              order.customer_name || ""
            )
              .toLowerCase()
              .includes(searchValue) ||
            String(
              order.customer_email || ""
            )
              .toLowerCase()
              .includes(searchValue);


          return (
            matchesStatus &&
            matchesSearch
          );
        }
      );

    }, [
      orders,
      statusFilter,
      search,
    ]);


  // =====================================
  // FORMAT DATE
  // =====================================

  const formatOrderDate = (
    value
  ) => {

    if (!value) {
      return "Date unavailable";
    }


    const date =
      new Date(value);


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return value;
    }


    return date.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };


  // =====================================
  // STATUS CLASS
  // =====================================

  const getStatusClass = (
    status
  ) => {

    return String(
      status || ""
    )
      .toLowerCase()
      .replace(/\s+/g, "-");
  };


  // =====================================
  // LOADING
  // =====================================

  if (loading) {

    return (

      <div className="peach-admin-orders-page">

        <div className="admin-orders-loading">

          <div className="admin-orders-loader" />

          <h2>
            Loading Orders
          </h2>

          <p>
            Preparing customer orders...
          </p>

        </div>

      </div>
    );
  }


  return (

    <div className="peach-admin-orders-page">


      {/* DECORATION */}

      <div className="orders-decoration orders-decoration-one" />

      <div className="orders-decoration orders-decoration-two" />


      {/* =================================
          HEADER
      ================================= */}

      <header className="peach-admin-orders-header">

        <div>

          <span className="admin-orders-label">
            SHOPZONE ADMIN
          </span>

          <h1>
            Order Management
          </h1>

          <p>
            Review customer orders,
            delivery details and update
            order status.
          </p>

        </div>


        <button
          type="button"
          className="peach-orders-refresh"
          onClick={loadOrders}
        >
          <span>
            ↻
          </span>

          Refresh Orders
        </button>

      </header>


      {/* =================================
          MESSAGES
      ================================= */}

      {error && (

        <div className="peach-order-admin-message order-admin-error">

          <span>
            !
          </span>

          <div>

            <strong>
              Something went wrong
            </strong>

            <p>
              {error}
            </p>

          </div>

        </div>
      )}


      {message && (

        <div className="peach-order-admin-message order-admin-success">

          <span>
            ✓
          </span>

          <div>

            <strong>
              Status Updated
            </strong>

            <p>
              {message}
            </p>

          </div>

        </div>
      )}


      {/* =================================
          STATISTICS
      ================================= */}

      <section className="peach-order-admin-stats">


        <div className="peach-order-stat-card">

          <div className="order-stat-icon">
            ◇
          </div>

          <div>

            <span>
              TOTAL ORDERS
            </span>

            <strong>
              {totalOrders}
            </strong>

            <p>
              All customer orders
            </p>

          </div>

        </div>


        <div className="peach-order-stat-card">

          <div className="order-stat-icon stat-pending">
            ◷
          </div>

          <div>

            <span>
              PENDING
            </span>

            <strong>
              {pendingOrders}
            </strong>

            <p>
              Waiting for action
            </p>

          </div>

        </div>


        <div className="peach-order-stat-card">

          <div className="order-stat-icon stat-shipped">
            →
          </div>

          <div>

            <span>
              SHIPPED
            </span>

            <strong>
              {shippedOrders}
            </strong>

            <p>
              On the way
            </p>

          </div>

        </div>


        <div className="peach-order-stat-card">

          <div className="order-stat-icon stat-delivered">
            ✓
          </div>

          <div>

            <span>
              DELIVERED
            </span>

            <strong>
              {deliveredOrders}
            </strong>

            <p>
              Completed orders
            </p>

          </div>

        </div>


        <div className="peach-order-stat-card revenue-order-card">

          <div className="order-stat-icon stat-revenue">
            ₹
          </div>

          <div>

            <span>
              TOTAL REVENUE
            </span>

            <strong>
              ₹{totalRevenue.toFixed(2)}
            </strong>

            <p>
              Excluding cancelled
            </p>

          </div>

        </div>

      </section>


      {/* =================================
          TOOLBAR
      ================================= */}

      <section className="peach-orders-admin-toolbar">


        <div className="admin-orders-toolbar-title">

          <span>
            01
          </span>

          <div>

            <small>
              CUSTOMER ORDERS
            </small>

            <h2>
              Recent Orders
            </h2>

          </div>

        </div>


        <div className="admin-orders-toolbar-controls">


          {/* SEARCH */}

          <div className="admin-order-search">

            <span>
              ⌕
            </span>

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search order or customer..."
            />

            {search && (

              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
              >
                ×
              </button>

            )}

          </div>


          {/* STATUS FILTER */}

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
            aria-label="Filter orders by status"
          >

            <option value="">
              All Status
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


          <span className="admin-orders-result">

            {filteredOrders.length}

            {" "}

            order
            {filteredOrders.length !== 1
              ? "s"
              : ""}

          </span>

        </div>

      </section>


      {/* =================================
          EMPTY
      ================================= */}

      {filteredOrders.length === 0 ? (

        <div className="peach-admin-orders-empty">

          <div>
            📦
          </div>

          <h2>
            No orders found
          </h2>

          <p>
            No customer orders match
            your current search or filter.
          </p>

          {(statusFilter ||
            search) && (

            <button
              type="button"
              onClick={() => {

                setStatusFilter("");
                setSearch("");
              }}
            >
              Clear Filters
            </button>

          )}

        </div>

      ) : (

        /* =================================
           ORDERS
        ================================= */

        <section className="peach-admin-orders-list">


          {filteredOrders.map(
            (order) => {

              const orderDate =
                formatOrderDate(
                  order.ordered_at
                );


              const items =
                Array.isArray(
                  order.items
                )
                  ? order.items
                  : [];


              return (

                <article
                  className="peach-admin-order-card"
                  key={order.id}
                >


                  {/* =========================
                      CARD HEADER
                  ========================= */}

                  <div className="peach-admin-order-card-header">


                    <div className="admin-order-number">

                      <span>
                        ORDER
                      </span>

                      <h2>
                        #{order.id}
                      </h2>

                      <p>
                        {orderDate}
                      </p>

                    </div>


                    <span
                      className={
                        `peach-admin-order-status status-${getStatusClass(
                          order.status
                        )}`
                      }
                    >

                      <i />

                      {order.status}

                    </span>

                  </div>


                  {/* =========================
                      CUSTOMER
                  ========================= */}

                  <div className="peach-admin-customer-section">


                    <div className="admin-order-section-heading">

                      <span>
                        01
                      </span>

                      <div>

                        <small>
                          CUSTOMER
                        </small>

                        <h3>
                          Delivery Details
                        </h3>

                      </div>

                    </div>


                    <div className="peach-customer-grid">


                      <div className="peach-customer-detail">

                        <span>
                          Customer Name
                        </span>

                        <strong>
                          {order.customer_name ||
                            "Customer"}
                        </strong>

                      </div>


                      <div className="peach-customer-detail">

                        <span>
                          Email Address
                        </span>

                        <strong>
                          {order.customer_email ||
                            "Not available"}
                        </strong>

                      </div>


                      <div className="peach-customer-detail customer-address">

                        <span>
                          Delivery Address
                        </span>

                        <strong>
                          {order.address ||
                            "Address unavailable"}
                        </strong>

                      </div>

                    </div>

                  </div>


                  {/* =========================
                      ITEMS
                  ========================= */}

                  <div className="peach-admin-order-items-section">


                    <div className="admin-order-section-heading">

                      <span>
                        02
                      </span>

                      <div>

                        <small>
                          ORDER DETAILS
                        </small>

                        <h3>
                          Order Items
                        </h3>

                      </div>


                      <span className="admin-item-count">

                        {items.length}

                        {" "}

                        item
                        {items.length !== 1
                          ? "s"
                          : ""}

                      </span>

                    </div>


                    {items.length > 0 ? (

                      <div className="peach-admin-order-items">


                        {items.map(
                          (
                            item,
                            index
                          ) => {

                            const price =
                              Number(
                                item.unit_price ||
                                0
                              );


                            const quantity =
                              Number(
                                item.quantity ||
                                0
                              );


                            const subtotal =
                              price *
                              quantity;


                            return (

                              <div
                                className="peach-admin-order-item"
                                key={
                                  `${order.id}-${item.product_id}-${index}`
                                }
                              >


                                <div className="admin-item-number">
                                  {index + 1}
                                </div>


                                <div className="admin-item-info">

                                  <strong>

                                    {item.product_name ||
                                      "Deleted Product"}

                                  </strong>


                                  <p>

                                    ₹
                                    {price.toFixed(2)}

                                    {" × "}

                                    {quantity}

                                  </p>

                                </div>


                                <div className="admin-item-quantity">

                                  <span>
                                    QTY
                                  </span>

                                  <strong>
                                    {quantity}
                                  </strong>

                                </div>


                                <div className="admin-item-subtotal">

                                  <span>
                                    SUBTOTAL
                                  </span>

                                  <strong>
                                    ₹
                                    {subtotal.toFixed(2)}
                                  </strong>

                                </div>

                              </div>
                            );
                          }
                        )}

                      </div>

                    ) : (

                      <p className="admin-no-items">
                        No item information available.
                      </p>

                    )}

                  </div>


                  {/* =========================
                      FOOTER
                  ========================= */}

                  <div className="peach-admin-order-footer">


                    {/* STATUS */}

                    <div className="peach-admin-status-update">

                      <label
                        htmlFor={
                          `status-${order.id}`
                        }
                      >
                        UPDATE ORDER STATUS
                      </label>


                      <div className="admin-status-select-wrapper">

                        <select
                          id={
                            `status-${order.id}`
                          }
                          value={
                            order.status
                          }
                          disabled={
                            updatingOrderId ===
                            order.id
                          }
                          onChange={
                            (event) =>
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

                          <span className="admin-status-updating">

                            <i />

                            Updating...

                          </span>

                        )}

                      </div>

                    </div>


                    {/* TOTAL */}

                    <div className="peach-admin-order-total">

                      <span>
                        ORDER TOTAL
                      </span>

                      <strong>
                        ₹
                        {Number(
                          order.total_amount ||
                          0
                        ).toFixed(2)}
                      </strong>

                      <small>
                        Customer order #{order.id}
                      </small>

                    </div>

                  </div>

                </article>
              );
            }
          )}

        </section>
      )}

    </div>
  );
}


export default AdminOrders;