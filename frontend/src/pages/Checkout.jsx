import { useState } from "react";
import {
  useNavigate,
  Link,
} from "react-router-dom";

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


  // =====================================
  // STATES
  // =====================================

  const [address, setAddress] = useState("");

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [loading, setLoading] = useState(false);

  const [imageErrors, setImageErrors] =
    useState({});


  // =====================================
  // TOTALS
  // =====================================

  const grandTotal = cartItems.reduce(
    (total, item) =>
      total +
      Number(item.price) *
        Number(item.qty),
    0
  );


  const totalQuantity = cartItems.reduce(
    (total, item) =>
      total + Number(item.qty),
    0
  );


  // =====================================
  // IMAGE ERROR
  // =====================================

  const handleImageError = (id) => {
    setImageErrors((current) => ({
      ...current,
      [id]: true,
    }));
  };


  // =====================================
  // PLACE ORDER
  // =====================================

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");


    // Check cart

    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }


    // Check delivery address

    if (!address.trim()) {
      setError(
        "Delivery address is required."
      );

      return;
    }


    try {
      setLoading(true);


      // Convert CartContext items
      // into backend required format

      const orderItems =
        cartItems.map((item) => ({
          product_id: item.id,
          quantity: Number(item.qty),
        }));


      // JWT Authorization header is
      // automatically added by api.js

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


      // Clear cart after successful order

      clearCart();


      // Redirect to My Orders

      setTimeout(() => {
        navigate("/orders");
      }, 1500);

    } catch (err) {
      console.log(
        "Place Order Error:",
        err
      );


      setError(
        err.response?.data?.message ||
        err.response?.data?.msg ||
        "Unable to place order"
      );

    } finally {
      setLoading(false);
    }
  };


  // =====================================
  // EMPTY CART
  // =====================================

  if (
    cartItems.length === 0 &&
    !success
  ) {
    return (
      <div className="peach-checkout-page">

        <div className="checkout-bg-shape checkout-shape-one" />

        <div className="checkout-bg-shape checkout-shape-two" />


        <div className="peach-empty-checkout">

          <div className="empty-checkout-icon">
            🛍️
          </div>


          <span className="checkout-small-label">
            CHECKOUT
          </span>


          <h1>
            Your bag is
            <span> waiting for something.</span>
          </h1>


          <p>
            Your cart is currently empty.
            Explore our collection before
            continuing to checkout.
          </p>


          <Link
            to="/"
            className="checkout-shop-button"
          >
            ← Continue Shopping
          </Link>

        </div>

      </div>
    );
  }


  // =====================================
  // CHECKOUT PAGE
  // =====================================

  return (
    <div className="peach-checkout-page">


      {/* BACKGROUND */}

      <div className="checkout-bg-shape checkout-shape-one" />

      <div className="checkout-bg-shape checkout-shape-two" />


      {/* =================================
          PAGE HEADER
      ================================= */}

      <div className="peach-checkout-header">

        <div>

          <span className="checkout-small-label">
            SECURE CHECKOUT
          </span>


          <h1>
            Complete Your Order
          </h1>


          <p>
            Review your details and place
            your ShopZone order securely.
          </p>

        </div>


        <div className="checkout-step-status">

          <div className="checkout-step completed">

            <span>
              ✓
            </span>

            <p>
              Cart
            </p>

          </div>


          <div className="checkout-step-line" />


          <div className="checkout-step active">

            <span>
              2
            </span>

            <p>
              Checkout
            </p>

          </div>


          <div className="checkout-step-line" />


          <div className="checkout-step">

            <span>
              3
            </span>

            <p>
              Complete
            </p>

          </div>

        </div>

      </div>


      {/* =================================
          MAIN LAYOUT
      ================================= */}

      <div className="peach-checkout-layout">


        {/* =================================
            LEFT SIDE
        ================================= */}

        <section className="peach-checkout-form-card">


          {/* CARD HEADER */}

          <div className="checkout-card-heading">

            <span>
              01
            </span>


            <div>

              <small>
                DELIVERY DETAILS
              </small>

              <h2>
                Delivery Information
              </h2>

            </div>

          </div>


          {/* =================================
              CUSTOMER INFORMATION
          ================================= */}

          {user && (
            <div className="peach-checkout-user">

              <div className="checkout-user-avatar">

                {user.name
                  ? user.name
                      .charAt(0)
                      .toUpperCase()
                  : "U"
                }

              </div>


              <div className="checkout-user-info">

                <span>
                  ORDERING AS
                </span>


                <strong>
                  {user.name ||
                    "ShopZone Customer"}
                </strong>


                <p>
                  {user.email}
                </p>

              </div>


              <div className="checkout-user-check">
                ✓
              </div>

            </div>
          )}


          {/* =================================
              ERROR
          ================================= */}

          {error && (
            <div className="peach-checkout-error">

              <span>
                !
              </span>


              <div>

                <strong>
                  Please check your details
                </strong>

                <p>
                  {error}
                </p>

              </div>

            </div>
          )}


          {/* =================================
              SUCCESS
          ================================= */}

          {success && (
            <div className="peach-checkout-success">

              <span>
                ✓
              </span>


              <div>

                <strong>
                  Order confirmed!
                </strong>

                <p>
                  {success}
                </p>

              </div>

            </div>
          )}


          {/* =================================
              CHECKOUT FORM
          ================================= */}

          <form
            className="peach-checkout-form"
            onSubmit={handlePlaceOrder}
          >


            <div className="checkout-address-group">


              <div className="checkout-label-row">

                <label htmlFor="delivery-address">
                  Delivery Address
                </label>


                <span>
                  Required
                </span>

              </div>


              <div className="checkout-textarea-wrapper">

                <span className="checkout-address-icon">
                  ⌂
                </span>


                <textarea
                  id="delivery-address"
                  value={address}
                  onChange={(e) =>
                    setAddress(
                      e.target.value
                    )
                  }
                  placeholder={
                    "Enter house/flat number, street, area, city, state and PIN code"
                  }
                  rows="6"
                  required
                  disabled={loading}
                />

              </div>


              <div className="checkout-address-help">

                <span>
                  ◇
                </span>

                Please provide a complete
                address for accurate delivery.

              </div>

            </div>


            {/* =================================
                PAYMENT INFORMATION
            ================================= */}

            <div className="checkout-payment-section">


              <div className="checkout-label-row">

                <label>
                  Payment
                </label>

              </div>


              <div className="checkout-payment-card">

                <div className="payment-icon">
                  ₹
                </div>


                <div>

                  <strong>
                    Order Payment
                  </strong>

                  <p>
                    Payment will follow your
                    existing ShopZone order process.
                  </p>

                </div>


                <span className="payment-check">
                  ✓
                </span>

              </div>

            </div>


            {/* =================================
                PLACE ORDER
            ================================= */}

            <button
              type="submit"
              className="peach-place-order-button"
              disabled={
                loading ||
                Boolean(success)
              }
            >

              {loading ? (
                <>
                  <span className="checkout-button-loader" />

                  <span>
                    Placing Your Order...
                  </span>
                </>
              ) : success ? (
                <>
                  <span>
                    ✓ Order Placed
                  </span>
                </>
              ) : (
                <>
                  <span className="place-order-bag">
                    🛍
                  </span>

                  <span>
                    Place Order
                  </span>

                  <span className="place-order-arrow">
                    →
                  </span>
                </>
              )}

            </button>


            <div className="checkout-security-note">

              <span>
                ◇
              </span>

              Your order is protected by
              secure JWT authentication.

            </div>

          </form>


          {/* BACK TO CART */}

          <div className="checkout-back-cart">

            <Link to="/cart">
              ← Return to Cart
            </Link>

          </div>

        </section>


        {/* =================================
            RIGHT SIDE
            ORDER SUMMARY
        ================================= */}

        <aside className="peach-checkout-summary">


          <div className="checkout-summary-title">

            <div>

              <span>
                02
              </span>


              <div>

                <small>
                  YOUR ORDER
                </small>

                <h2>
                  Order Summary
                </h2>

              </div>

            </div>


            <strong>
              {totalQuantity}{" "}
              item
              {totalQuantity !== 1
                ? "s"
                : ""}
            </strong>

          </div>


          {/* =================================
              PRODUCTS
          ================================= */}

          <div className="checkout-products">

            {cartItems.map((item) => {

              const price =
                Number(item.price);

              const quantity =
                Number(item.qty);

              const subtotal =
                price * quantity;

              const showImage =
                item.image_url &&
                !imageErrors[item.id];


              return (
                <div
                  className="peach-checkout-item"
                  key={item.id}
                >


                  {/* IMAGE */}

                  <Link
                    to={`/products/${item.id}`}
                    className="checkout-item-image"
                  >

                    {showImage ? (

                      <img
                        src={item.image_url}
                        alt={item.name}
                        onError={() =>
                          handleImageError(
                            item.id
                          )
                        }
                      />

                    ) : (

                      <div className="checkout-image-fallback">
                        🛍️
                      </div>

                    )}

                  </Link>


                  {/* INFO */}

                  <div className="checkout-item-info">

                    <span>
                      {item.category_name ||
                        "ShopZone"}
                    </span>


                    <Link
                      to={`/products/${item.id}`}
                    >
                      {item.name}
                    </Link>


                    <p>
                      ₹{price.toFixed(2)}
                      {" × "}
                      {quantity}
                    </p>

                  </div>


                  {/* SUBTOTAL */}

                  <strong className="checkout-item-subtotal">
                    ₹{subtotal.toFixed(2)}
                  </strong>

                </div>
              );
            })}

          </div>


          {/* =================================
              SUMMARY CALCULATION
          ================================= */}

          <div className="checkout-price-details">

            <div>

              <span>
                Products
              </span>

              <strong>
                {cartItems.length}
              </strong>

            </div>


            <div>

              <span>
                Total Quantity
              </span>

              <strong>
                {totalQuantity}
              </strong>

            </div>


            <div>

              <span>
                Subtotal
              </span>

              <strong>
                ₹{grandTotal.toFixed(2)}
              </strong>

            </div>

          </div>


          {/* =================================
              GRAND TOTAL
          ================================= */}

          <div className="checkout-grand-total">

            <div>

              <span>
                Grand Total
              </span>

              <small>
                Final order amount
              </small>

            </div>


            <strong>
              <small>₹</small>

              {grandTotal.toFixed(2)}
            </strong>

          </div>


          {/* TRUST */}

          <div className="checkout-trust-box">

            <div>
              ✓
            </div>


            <p>

              <strong>
                Ready to order
              </strong>

              Your items and total have
              been reviewed.

            </p>

          </div>

        </aside>

      </div>

    </div>
  );
}


export default Checkout;