import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../context/CartContext";


function Cart() {
  const navigate = useNavigate();

  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCart();

  const [imageErrors, setImageErrors] = useState({});


  // =====================================
  // TOTALS
  // =====================================

  const grandTotal = cartItems.reduce(
    (total, item) =>
      total +
      Number(item.price) * Number(item.qty),
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
  // DECREASE QUANTITY
  // =====================================

  const decreaseQuantity = (item) => {
    if (Number(item.qty) <= 1) {
      return;
    }

    updateQuantity(
      item.id,
      Number(item.qty) - 1
    );
  };


  // =====================================
  // INCREASE QUANTITY
  // =====================================

  const increaseQuantity = (item) => {
    const stock = Number(item.stock);
    const currentQuantity = Number(item.qty);

    if (currentQuantity < stock) {
      updateQuantity(
        item.id,
        currentQuantity + 1
      );
    }
  };


  // =====================================
  // EMPTY CART
  // =====================================

  if (cartItems.length === 0) {
    return (
      <div className="peach-cart-page">

        {/* BACKGROUND DECORATION */}

        <div className="cart-bg-circle cart-bg-one" />
        <div className="cart-bg-circle cart-bg-two" />


        {/* EMPTY CART */}

        <div className="peach-empty-cart">

          <div className="empty-cart-icon">
            <span>🛍️</span>
          </div>


          <span className="empty-cart-label">
            YOUR SHOPPING BAG
          </span>


          <h1>
            Your cart feels
            <span> a little empty.</span>
          </h1>


          <p>
            Discover something you love and
            add it to your ShopZone collection.
          </p>


          <Link
            to="/"
            className="empty-cart-shop-button"
          >
            Explore Products

            <span>→</span>
          </Link>

        </div>

      </div>
    );
  }


  // =====================================
  // MAIN CART PAGE
  // =====================================

  return (
    <div className="peach-cart-page">


      {/* =================================
          TEMPORARY TEST
          DELETE AFTER CONFIRMING
      ================================= */}

      <div
        style={{
          position: "relative",
          zIndex: 999,
          textAlign: "center",
          color: "#b96f52",
          fontSize: "13px",
          fontWeight: "800",
          marginBottom: "10px",
          letterSpacing: "2px",
        }}
      >
        STEP 7 NEW CART
      </div>


      {/* =================================
          BACKGROUND
      ================================= */}

      <div className="cart-bg-circle cart-bg-one" />
      <div className="cart-bg-circle cart-bg-two" />


      {/* =================================
          CART HEADER
      ================================= */}

      <div className="peach-cart-top">

        <div>

          <span className="cart-page-label">
            YOUR SHOPPING BAG
          </span>


          <h1>
            Shopping Cart
          </h1>


          <p>
            You have{" "}

            <strong>
              {totalQuantity}
            </strong>

            {" "}item
            {totalQuantity !== 1 ? "s" : ""}

            {" "}across{" "}

            <strong>
              {cartItems.length}
            </strong>

            {" "}product
            {cartItems.length !== 1 ? "s" : ""}.
          </p>

        </div>


        <button
          type="button"
          className="peach-clear-cart"
          onClick={clearCart}
        >
          <span>×</span>

          Clear Cart
        </button>

      </div>


      {/* =================================
          MAIN CART LAYOUT
      ================================= */}

      <div className="peach-cart-layout">


        {/* =================================
            LEFT SIDE
        ================================= */}

        <section className="peach-cart-items">


          {/* SECTION HEADING */}

          <div className="cart-section-heading">

            <div>

              <span>
                01
              </span>


              <div>

                <h2>
                  Your Items
                </h2>

                <p>
                  Review and adjust your products.
                </p>

              </div>

            </div>


            <span className="cart-product-count">
              {cartItems.length}{" "}
              product
              {cartItems.length !== 1
                ? "s"
                : ""}
            </span>

          </div>


          {/* =================================
              CART PRODUCTS
          ================================= */}

          <div className="peach-cart-list">

            {cartItems.map((item, index) => {

              const price =
                Number(item.price);

              const stock =
                Number(item.stock);

              const quantity =
                Number(item.qty);

              const subtotal =
                price * quantity;

              const showImage =
                item.image_url &&
                !imageErrors[item.id];


              return (
                <article
                  className="peach-cart-item"
                  key={item.id}
                  style={{
                    animationDelay:
                      `${index * 0.07}s`,
                  }}
                >


                  {/* =========================
                      PRODUCT IMAGE
                  ========================= */}

                  <Link
                    to={`/products/${item.id}`}
                    className="peach-cart-image"
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

                      <div className="cart-image-fallback">
                        <span>🛍️</span>
                      </div>

                    )}

                  </Link>


                  {/* =========================
                      PRODUCT INFORMATION
                  ========================= */}

                  <div className="peach-cart-product-info">


                    <span className="peach-cart-category">
                      {item.category_name ||
                        "ShopZone"}
                    </span>


                    <Link
                      to={`/products/${item.id}`}
                      className="peach-cart-product-name"
                    >
                      {item.name}
                    </Link>


                    <div className="cart-item-price">

                      <span>
                        Price
                      </span>

                      <strong>
                        ₹{price.toFixed(2)}
                      </strong>

                    </div>


                    <div className="cart-stock-info">

                      <span />

                      {stock > 0
                        ? `${stock} available`
                        : "Out of stock"
                      }

                    </div>

                  </div>


                  {/* =========================
                      QUANTITY
                  ========================= */}

                  <div className="peach-cart-quantity-area">

                    <span className="cart-control-label">
                      Quantity
                    </span>


                    <div className="peach-cart-quantity">

                      <button
                        type="button"
                        onClick={() =>
                          decreaseQuantity(item)
                        }
                        disabled={quantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>


                      <span>
                        {quantity}
                      </span>


                      <button
                        type="button"
                        onClick={() =>
                          increaseQuantity(item)
                        }
                        disabled={
                          quantity >= stock ||
                          stock <= 0
                        }
                        aria-label="Increase quantity"
                      >
                        +
                      </button>

                    </div>


                    {quantity >= stock &&
                      stock > 0 && (

                      <small>
                        Maximum stock
                      </small>

                    )}

                  </div>


                  {/* =========================
                      SUBTOTAL
                  ========================= */}

                  <div className="peach-cart-subtotal">

                    <span>
                      Subtotal
                    </span>

                    <strong>
                      ₹{subtotal.toFixed(2)}
                    </strong>

                  </div>


                  {/* =========================
                      REMOVE BUTTON
                  ========================= */}

                  <button
                    type="button"
                    className="peach-remove-item"
                    onClick={() =>
                      removeFromCart(item.id)
                    }
                    aria-label={`Remove ${item.name}`}
                    title="Remove item"
                  >
                    ×
                  </button>

                </article>
              );
            })}

          </div>


          {/* =================================
              CONTINUE SHOPPING
          ================================= */}

          <div className="cart-bottom-navigation">

            <Link to="/">
              <span>←</span>

              Continue Shopping
            </Link>

          </div>

        </section>


        {/* =================================
            RIGHT SIDE
            ORDER SUMMARY
        ================================= */}

        <aside className="peach-cart-summary">


          {/* SUMMARY HEADING */}

          <div className="cart-summary-heading">

            <span className="summary-number">
              02
            </span>


            <div>

              <span>
                ORDER DETAILS
              </span>

              <h2>
                Order Summary
              </h2>

            </div>

          </div>


          {/* =================================
              SUMMARY VALUES
          ================================= */}

          <div className="peach-summary-list">

            <div className="peach-summary-row">

              <span>
                Products
              </span>

              <strong>
                {cartItems.length}
              </strong>

            </div>


            <div className="peach-summary-row">

              <span>
                Total Quantity
              </span>

              <strong>
                {totalQuantity}
              </strong>

            </div>


            <div className="peach-summary-row">

              <span>
                Subtotal
              </span>

              <strong>
                ₹{grandTotal.toFixed(2)}
              </strong>

            </div>

          </div>


          {/* =================================
              MESSAGE
          ================================= */}

          <div className="cart-delivery-note">

            <div>
              ✦
            </div>


            <p>

              <strong>
                Almost there!
              </strong>

              Complete checkout to place
              your ShopZone order.

            </p>

          </div>


          {/* =================================
              GRAND TOTAL
          ================================= */}

          <div className="peach-grand-total">

            <div>

              <span>
                Grand Total
              </span>

              <small>
                Final order amount
              </small>

            </div>


            <strong>

              <small>
                ₹
              </small>

              {grandTotal.toFixed(2)}

            </strong>

          </div>


          {/* =================================
              CHECKOUT BUTTON
          ================================= */}

          <button
            type="button"
            className="peach-checkout-button"
            onClick={() =>
              navigate("/checkout")
            }
          >

            <span>
              Proceed to Checkout
            </span>

            <span className="checkout-arrow">
              →
            </span>

          </button>


          {/* =================================
              SECURITY MESSAGE
          ================================= */}

          <div className="cart-secure-note">

            <span>
              ◇
            </span>

            Secure checkout & protected ordering

          </div>

        </aside>

      </div>

    </div>
  );
}


export default Cart;