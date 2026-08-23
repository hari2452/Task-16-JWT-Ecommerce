import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import api from "../api";

import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

function Checkout() {
  const navigate = useNavigate();

  const { user } = useAuth();

  const {
    cartItems,
    clearCart,
  } = useCart();

  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);


  // Calculate total
  const grandTotal = cartItems.reduce(
    (total, item) =>
      total + Number(item.price) * item.qty,
    0
  );


  // Place order
  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");


    // Check cart
    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }


    // Check address
    if (!address.trim()) {
      setError("Delivery address is required.");
      return;
    }


    try {
      setLoading(true);


      // Convert CartContext items
      // into backend required format
      const orderItems = cartItems.map((item) => ({
        product_id: item.id,
        quantity: item.qty,
      }));


      const response = await api.post(
        "/api/orders",
        {
          items: orderItems,
          address: address.trim(),
        }
      );


      setSuccess(
        `Order #${response.data.order_id} placed successfully!`
      );


      // Remove everything from cart
      clearCart();


      // Redirect after short delay
      setTimeout(() => {
        navigate("/orders");
      }, 1500);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to place order"
      );

    } finally {
      setLoading(false);
    }
  };


  // Empty cart
  if (cartItems.length === 0 && !success) {
    return (
      <div className="checkout-page">

        <div className="empty-checkout">

          <h1>Checkout</h1>

          <p>
            Your cart is empty.
          </p>

          <Link to="/">
            Continue Shopping
          </Link>

        </div>

      </div>
    );
  }


  return (
    <div className="checkout-page">

      <div className="checkout-header">

        <h1>Checkout</h1>

        <p>
          Complete your order
        </p>

      </div>


      <div className="checkout-layout">

        {/* LEFT SIDE */}

        <div className="checkout-form-card">

          <h2>Delivery Information</h2>


          {user && (
            <div className="checkout-user">

              <p>
                <strong>Name:</strong>{" "}
                {user.name}
              </p>

              <p>
                <strong>Email:</strong>{" "}
                {user.email}
              </p>

            </div>
          )}


          {error && (
            <div className="error-message">
              {error}
            </div>
          )}


          {success && (
            <div className="success-message">
              {success}
            </div>
          )}


          <form onSubmit={handlePlaceOrder}>

            <div className="form-group">

              <label>
                Delivery Address
              </label>

              <textarea
                value={address}
                onChange={(e) =>
                  setAddress(e.target.value)
                }
                placeholder="Enter your complete delivery address"
                rows="6"
                required
              />

            </div>


            <button
              type="submit"
              className="place-order-button"
              disabled={loading}
            >
              {loading
                ? "Placing Order..."
                : "Place Order"
              }
            </button>

          </form>

        </div>


        {/* RIGHT SIDE */}

        <div className="checkout-summary">

          <h2>Order Summary</h2>


          {cartItems.map((item) => {

            const subtotal =
              Number(item.price) * item.qty;

            return (
              <div
                className="checkout-item"
                key={item.id}
              >

                <div>

                  <strong>
                    {item.name}
                  </strong>

                  <p>
                    ₹{Number(item.price).toFixed(2)}
                    {" × "}
                    {item.qty}
                  </p>

                </div>


                <strong>
                  ₹{subtotal.toFixed(2)}
                </strong>

              </div>
            );
          })}


          <hr />


          <div className="checkout-total">

            <span>
              Grand Total
            </span>

            <span>
              ₹{grandTotal.toFixed(2)}
            </span>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Checkout;