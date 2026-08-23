import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Cart() {
  const navigate = useNavigate();

  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCart();

  // Grand total
  const grandTotal = cartItems.reduce(
    (total, item) =>
      total + Number(item.price) * item.qty,
    0
  );

  // If cart is empty
  if (cartItems.length === 0) {
    return (
      <div className="cart-page">

        <div className="empty-cart">

          <h1>Your Cart</h1>

          <p>Your cart is currently empty.</p>

          <Link to="/">
            Continue Shopping
          </Link>

        </div>

      </div>
    );
  }

  return (
    <div className="cart-page">

      <div className="cart-header">

        <div>
          <h1>Shopping Cart</h1>

          <p>
            {cartItems.length} product(s) in your cart
          </p>
        </div>

        <button
          className="clear-cart-button"
          onClick={clearCart}
        >
          Clear Cart
        </button>

      </div>


      <div className="cart-layout">

        {/* LEFT SIDE - CART ITEMS */}

        <div className="cart-items">

          {cartItems.map((item) => {

            const subtotal =
              Number(item.price) * item.qty;

            return (
              <div
                className="cart-item"
                key={item.id}
              >

                {/* PRODUCT PLACEHOLDER */}

                <div className="cart-item-image">
                  <span>🛍️</span>
                </div>


                {/* PRODUCT DETAILS */}

                <div className="cart-item-details">

                  <span className="cart-category">
                    {item.category_name}
                  </span>

                  <h3>
                    {item.name}
                  </h3>

                  <p>
                    Price: ₹
                    {Number(item.price).toFixed(2)}
                  </p>

                  <p>
                    Available Stock: {item.stock}
                  </p>

                </div>


                {/* QUANTITY */}

                <div className="cart-quantity">

                  <button
                    onClick={() =>
                      updateQuantity(
                        item.id,
                        item.qty - 1
                      )
                    }
                  >
                    −
                  </button>


                  <span>
                    {item.qty}
                  </span>


                  <button
                    onClick={() => {
                      if (item.qty < item.stock) {
                        updateQuantity(
                          item.id,
                          item.qty + 1
                        );
                      }
                    }}
                    disabled={
                      item.qty >= item.stock
                    }
                  >
                    +
                  </button>

                </div>


                {/* SUBTOTAL */}

                <div className="cart-subtotal">

                  <p>Subtotal</p>

                  <strong>
                    ₹{subtotal.toFixed(2)}
                  </strong>

                </div>


                {/* REMOVE */}

                <button
                  className="remove-button"
                  onClick={() =>
                    removeFromCart(item.id)
                  }
                >
                  Remove
                </button>

              </div>
            );
          })}

        </div>


        {/* RIGHT SIDE - SUMMARY */}

        <div className="cart-summary">

          <h2>Order Summary</h2>


          <div className="summary-row">

            <span>
              Products
            </span>

            <span>
              {cartItems.length}
            </span>

          </div>


          <div className="summary-row">

            <span>
              Total Quantity
            </span>

            <span>
              {cartItems.reduce(
                (total, item) =>
                  total + item.qty,
                0
              )}
            </span>

          </div>


          <hr />


          <div className="summary-row total-row">

            <span>
              Grand Total
            </span>

            <span>
              ₹{grandTotal.toFixed(2)}
            </span>

          </div>


          <button
            className="checkout-button"
            onClick={() =>
              navigate("/checkout")
            }
          >
            Proceed to Checkout
          </button>


          <Link
            to="/"
            className="continue-shopping"
          >
            Continue Shopping
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Cart;