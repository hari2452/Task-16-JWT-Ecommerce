import { useEffect, useState } from "react";
import api from "../api";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/api/orders/my");

        setOrders(response.data.data);

      } catch (err) {
        console.log("Orders Error:", err);

        setError(
          err.response?.data?.message ||
          "Unable to load orders"
        );

      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);


  if (loading) {
    return (
      <div className="orders-page">
        <p>Loading orders...</p>
      </div>
    );
  }


  if (error) {
    return (
      <div className="orders-page">

        <div className="error-message">
          {error}
        </div>

      </div>
    );
  }


  if (orders.length === 0) {
    return (
      <div className="orders-page">

        <div className="empty-orders">

          <h1>My Orders</h1>

          <p>
            You have not placed any orders yet.
          </p>

        </div>

      </div>
    );
  }


  return (
    <div className="orders-page">

      <div className="orders-header">

        <h1>My Orders</h1>

        <p>
          View your previous orders and current status
        </p>

      </div>


      <div className="orders-list">

        {orders.map((order) => (

          <div
            className="order-card"
            key={order.id}
          >

            {/* ORDER HEADER */}

            <div className="order-card-header">

              <div>
                <h2>
                  Order #{order.id}
                </h2>

                <p>
                  {new Date(
                    order.ordered_at
                  ).toLocaleString()}
                </p>
              </div>


              <span
                className={`status-badge status-${order.status.toLowerCase()}`}
              >
                {order.status}
              </span>

            </div>


            {/* DELIVERY ADDRESS */}

            <div className="order-address">

              <strong>
                Delivery Address
              </strong>

              <p>
                {order.address}
              </p>

            </div>


            {/* ORDER ITEMS */}

            <div className="order-items">

              <h3>Items</h3>

              {order.items.map((item) => {

                const subtotal =
                  Number(item.unit_price) *
                  item.quantity;

                return (

                  <div
                    className="order-item"
                    key={item.id || item.product_id}
                  >

                    <div>

                      <strong>
                        {item.product_name}
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
                      ₹{subtotal.toFixed(2)}
                    </strong>

                  </div>
                );
              })}

            </div>


            {/* TOTAL */}

            <div className="order-total">

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

          </div>

        ))}

      </div>

    </div>
  );
}

export default Orders;