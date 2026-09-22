import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";


function Orders() {

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // =====================================
  // LOAD CUSTOMER ORDERS
  // =====================================

  useEffect(() => {

    const loadOrders = async () => {

      try {

        setLoading(true);
        setError("");

        const response =
          await api.get("/api/orders/my");

        setOrders(
          response.data.data || []
        );

      } catch (err) {

        console.log(
          "Orders Error:",
          err
        );

        setError(
          err.response?.data?.message ||
          err.response?.data?.msg ||
          "Unable to load orders"
        );

      } finally {

        setLoading(false);
      }
    };


    loadOrders();

  }, []);


  // =====================================
  // FORMAT DATE
  // =====================================

  const formatOrderDate = (date) => {

    if (!date) {
      return "Date unavailable";
    }


    return new Date(date).toLocaleString(
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

  const getStatusClass = (status) => {

    if (!status) {
      return "peach-status-default";
    }


    const normalizedStatus =
      status
        .toLowerCase()
        .replace(/\s+/g, "-");


    if (
      normalizedStatus.includes("delivered") ||
      normalizedStatus.includes("completed")
    ) {
      return "peach-status-success";
    }


    if (
      normalizedStatus.includes("cancel")
    ) {
      return "peach-status-cancelled";
    }


    if (
      normalizedStatus.includes("ship") ||
      normalizedStatus.includes("out-for-delivery")
    ) {
      return "peach-status-shipping";
    }


    if (
      normalizedStatus.includes("processing") ||
      normalizedStatus.includes("confirmed")
    ) {
      return "peach-status-processing";
    }


    if (
      normalizedStatus.includes("pending")
    ) {
      return "peach-status-pending";
    }


    return "peach-status-default";
  };


  // =====================================
  // LOADING
  // =====================================

  if (loading) {

    return (

      <div className="peach-orders-page">

        <div className="orders-bg-circle orders-circle-one" />
        <div className="orders-bg-circle orders-circle-two" />


        <div className="peach-orders-loading">

          <div className="orders-loader">
            <span />
            <span />
            <span />
          </div>


          <h2>
            Finding your orders
          </h2>


          <p>
            Loading your ShopZone order history...
          </p>

        </div>

      </div>
    );
  }


  // =====================================
  // ERROR
  // =====================================

  if (error) {

    return (

      <div className="peach-orders-page">

        <div className="orders-bg-circle orders-circle-one" />


        <div className="peach-orders-error">

          <div className="orders-error-icon">
            !
          </div>


          <span>
            ORDER HISTORY
          </span>


          <h1>
            We couldn't load your orders.
          </h1>


          <p>
            {error}
          </p>


          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
          >
            Try Again
          </button>

        </div>

      </div>
    );
  }


  // =====================================
  // EMPTY ORDERS
  // =====================================

  if (orders.length === 0) {

    return (

      <div className="peach-orders-page">

        <div className="orders-bg-circle orders-circle-one" />
        <div className="orders-bg-circle orders-circle-two" />


        <div className="peach-empty-orders">

          <div className="empty-orders-icon">
            ♡
          </div>


          <span className="orders-page-label">
            YOUR ORDERS
          </span>


          <h1>
            Your order story
            <span> starts here.</span>
          </h1>


          <p>
            You haven't placed any orders yet.
            Explore ShopZone and discover something
            you love.
          </p>


          <Link
            to="/"
            className="empty-orders-button"
          >
            Explore Products

            <span>
              →
            </span>
          </Link>

        </div>

      </div>
    );
  }


  // =====================================
  // MAIN ORDERS PAGE
  // =====================================

  return (

    <div className="peach-orders-page">


      {/* BACKGROUND */}

      <div className="orders-bg-circle orders-circle-one" />
      <div className="orders-bg-circle orders-circle-two" />


      {/* =================================
          HEADER
      ================================= */}

      <div className="peach-orders-header">

        <div>

          <span className="orders-page-label">
            YOUR SHOPPING JOURNEY
          </span>


          <h1>
            My Orders
          </h1>


          <p>
            View your previous orders,
            products and current order status.
          </p>

        </div>


        <div className="orders-count-card">

          <span>
            {orders.length}
          </span>


          <div>

            <strong>
              Total Orders
            </strong>

            <small>
              ShopZone history
            </small>

          </div>

        </div>

      </div>


      {/* =================================
          ORDER LIST
      ================================= */}

      <div className="peach-orders-list">

        {orders.map(
          (order, orderIndex) => {

            const items =
              Array.isArray(order.items)
                ? order.items
                : [];


            return (

              <article
                className="peach-order-card"
                key={order.id}
                style={{
                  animationDelay:
                    `${orderIndex * 0.08}s`,
                }}
              >


                {/* =========================
                    ORDER HEADER
                ========================= */}

                <div className="peach-order-header">


                  <div className="order-number-section">


                    <div className="order-bag-icon">
                      🛍
                    </div>


                    <div>

                      <span>
                        ORDER NUMBER
                      </span>


                      <h2>
                        #{order.id}
                      </h2>


                      <p>
                        {formatOrderDate(
                          order.ordered_at
                        )}
                      </p>

                    </div>

                  </div>


                  <div
                    className={`peach-order-status ${getStatusClass(
                      order.status
                    )}`}
                  >
                    <span />

                    {order.status ||
                      "Pending"}
                  </div>

                </div>


                {/* =========================
                    ORDER BODY
                ========================= */}

                <div className="peach-order-body">


                  {/* =======================
                      DELIVERY
                  ======================= */}

                  <div className="peach-order-address">


                    <div className="order-section-title">

                      <span>
                        01
                      </span>


                      <div>

                        <small>
                          DELIVERY
                        </small>

                        <h3>
                          Delivery Address
                        </h3>

                      </div>

                    </div>


                    <div className="order-address-content">

                      <div>
                        ⌂
                      </div>


                      <p>
                        {order.address ||
                          "Delivery address unavailable"}
                      </p>

                    </div>

                  </div>


                  {/* =======================
                      ITEMS
                  ======================= */}

                  <div className="peach-order-items">


                    <div className="order-section-title">

                      <span>
                        02
                      </span>


                      <div>

                        <small>
                          PRODUCTS
                        </small>

                        <h3>
                          Order Items
                        </h3>

                      </div>


                      <strong className="order-item-count">
                        {items.length}{" "}
                        item
                        {items.length !== 1
                          ? "s"
                          : ""}
                      </strong>

                    </div>


                    <div className="peach-order-items-list">

                      {items.map(
                        (item, itemIndex) => {

                          const unitPrice =
                            Number(
                              item.unit_price
                            ) || 0;


                          const quantity =
                            Number(
                              item.quantity
                            ) || 0;


                          const subtotal =
                            unitPrice *
                            quantity;


                          return (

                            <div
                              className="peach-order-item"
                              key={
                                item.id ||
                                item.product_id ||
                                `${order.id}-${itemIndex}`
                              }
                            >


                              {/* PRODUCT ICON */}

                              <div className="order-product-icon">

                                <span>
                                  🛍️
                                </span>

                              </div>


                              {/* PRODUCT INFO */}

                              <div className="order-product-info">

                                <span>
                                  SHOPZONE ITEM
                                </span>


                                <strong>
                                  {item.product_name ||
                                    "Product"}
                                </strong>


                                <p>
                                  ₹
                                  {unitPrice.toFixed(2)}

                                  {" × "}

                                  {quantity}
                                </p>

                              </div>


                              {/* QUANTITY */}

                              <div className="order-product-quantity">

                                <span>
                                  Qty
                                </span>

                                <strong>
                                  {quantity}
                                </strong>

                              </div>


                              {/* SUBTOTAL */}

                              <div className="order-product-subtotal">

                                <span>
                                  Subtotal
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

                  </div>

                </div>


                {/* =========================
                    ORDER FOOTER
                ========================= */}

                <div className="peach-order-footer">


                  <div className="order-secure-message">

                    <span>
                      ✓
                    </span>


                    <div>

                      <strong>
                        ShopZone Order
                      </strong>

                      <p>
                        Order details securely
                        linked to your account.
                      </p>

                    </div>

                  </div>


                  <div className="peach-order-total">

                    <div>

                      <span>
                        Order Total
                      </span>

                      <small>
                        Final amount
                      </small>

                    </div>


                    <strong>

                      <small>
                        ₹
                      </small>

                      {Number(
                        order.total_amount
                      ).toFixed(2)}

                    </strong>

                  </div>

                </div>

              </article>
            );
          }
        )}

      </div>


      {/* =================================
          BOTTOM SHOP BUTTON
      ================================= */}

      <div className="orders-bottom-action">

        <Link to="/">

          ← Continue Shopping

        </Link>

      </div>

    </div>
  );
}


export default Orders;