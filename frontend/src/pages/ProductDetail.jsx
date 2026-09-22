import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import api from "../api";
import { useCart } from "../context/CartContext";


function ProductDetail() {

  const { id } = useParams();

  const { addToCart } = useCart();


  // =====================================
  // STATES
  // =====================================

  const [product, setProduct] =
    useState(null);

  const [quantity, setQuantity] =
    useState(1);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [imageFailed, setImageFailed] =
    useState(false);


  // =====================================
  // LOAD PRODUCT DETAILS
  // =====================================

  useEffect(() => {

    const loadProduct = async () => {

      try {

        setLoading(true);
        setError("");
        setImageFailed(false);

        const response =
          await api.get(
            `/api/products/${id}`
          );

        setProduct(
          response.data.data
        );

        setQuantity(1);

      } catch (err) {

        console.log(
          "Product Detail Error:",
          err
        );

        setError(
          err.response?.data?.message ||
          err.response?.data?.msg ||
          "Unable to load product"
        );

      } finally {

        setLoading(false);
      }
    };


    loadProduct();

  }, [id]);


  // =====================================
  // DECREASE QUANTITY
  // =====================================

  const decreaseQuantity = () => {

    setQuantity(
      (currentQuantity) =>
        Math.max(
          1,
          currentQuantity - 1
        )
    );
  };


  // =====================================
  // INCREASE QUANTITY
  // =====================================

  const increaseQuantity = () => {

    if (!product) {
      return;
    }


    const stock =
      Number(product.stock);


    setQuantity(
      (currentQuantity) =>
        Math.min(
          stock,
          currentQuantity + 1
        )
    );
  };


  // =====================================
  // MANUAL QUANTITY CHANGE
  // =====================================

  const handleQuantityChange = (event) => {

    if (!product) {
      return;
    }


    const enteredQuantity =
      Number(event.target.value);

    const stock =
      Number(product.stock);


    if (
      !Number.isInteger(enteredQuantity) ||
      enteredQuantity < 1
    ) {

      setQuantity(1);

      return;
    }


    setQuantity(
      Math.min(
        enteredQuantity,
        stock
      )
    );
  };


  // =====================================
  // ADD TO CART
  // =====================================

  const handleAddToCart = () => {

    if (!product) {
      return;
    }


    const stock =
      Number(product.stock);


    if (stock <= 0) {

      setError(
        "This product is out of stock"
      );

      return;
    }


    if (quantity > stock) {

      setError(
        `Only ${stock} item(s) are available`
      );

      return;
    }


    setError("");


    addToCart(
      product,
      quantity
    );


    setMessage(
      `${quantity} × ${product.name} added to your cart`
    );


    setTimeout(() => {

      setMessage("");

    }, 2500);
  };


  // =====================================
  // LOADING
  // =====================================

  if (loading) {

    return (

      <div className="peach-detail-page">


        {/* BACKGROUND */}

        <div
          className="
            detail-background-circle
            detail-circle-one
          "
        />

        <div
          className="
            detail-background-circle
            detail-circle-two
          "
        />


        {/* LOADER */}

        <div className="peach-detail-loading">


          <div className="detail-loader">

            <span />
            <span />
            <span />

          </div>


          <h2>
            Preparing something beautiful
          </h2>


          <p>
            Loading product details...
          </p>

        </div>

      </div>
    );
  }


  // =====================================
  // PRODUCT LOAD ERROR
  // =====================================

  if (error && !product) {

    return (

      <div className="peach-detail-page">


        <div
          className="
            detail-background-circle
            detail-circle-one
          "
        />


        <div className="peach-detail-error-card">


          <div className="detail-error-icon">
            !
          </div>


          <span className="detail-small-label">
            PRODUCT UNAVAILABLE
          </span>


          <h1>
            We couldn't find this product.
          </h1>


          <p>
            {error}
          </p>


          <Link
            to="/"
            className="detail-return-button"
          >
            ← Return to Shop
          </Link>

        </div>

      </div>
    );
  }


  // =====================================
  // PRODUCT NOT FOUND
  // =====================================

  if (!product) {

    return null;
  }


  // =====================================
  // PRODUCT VALUES
  // =====================================

  const stock =
    Number(product.stock) || 0;

  const price =
    Number(product.price) || 0;


  const isOutOfStock =
    stock <= 0;


  const isLowStock =
    stock > 0 &&
    stock < 5;


  // =====================================
  // MAIN PAGE
  // =====================================

  return (

    <div className="peach-detail-page">


      {/* =================================
          BACKGROUND DECORATIONS
      ================================= */}

      <div
        className="
          detail-background-circle
          detail-circle-one
        "
      />


      <div
        className="
          detail-background-circle
          detail-circle-two
        "
      />


      {/* =================================
          BREADCRUMB
      ================================= */}

      <div className="peach-detail-breadcrumb">


        <Link to="/">
          Home
        </Link>


        <span>
          /
        </span>


        <Link to="/">
          Shop
        </Link>


        <span>
          /
        </span>


        <strong>
          {product.name}
        </strong>

      </div>


      {/* =================================
          SUCCESS TOAST
      ================================= */}

      {message && (

        <div className="peach-detail-toast">


          <div className="detail-toast-icon">
            ✓
          </div>


          <div>

            <strong>
              Added to cart
            </strong>

            <p>
              {message}
            </p>

          </div>

        </div>

      )}


      {/* =================================
          ERROR MESSAGE
      ================================= */}

      {error && (

        <div className="peach-detail-inline-error">

          <span>
            !
          </span>

          <p>
            {error}
          </p>

        </div>

      )}


      {/* =================================
          MAIN PRODUCT CARD
      ================================= */}

      <section className="peach-product-detail-card">


        {/* =================================
            LEFT SIDE
            PRODUCT IMAGE
        ================================= */}

        <div className="peach-product-gallery">


          {/* GALLERY HEADER */}

          <div className="detail-gallery-top">


            <span className="detail-gallery-label">
              ✦ SHOPZONE SELECT
            </span>


            <button
              type="button"
              className="detail-heart-button"
              aria-label="Favorite product"
              title="Wishlist"
            >
              ♡
            </button>

          </div>


          {/* PRODUCT IMAGE AREA */}

          <div className="peach-product-image-area">


            <div
              className="
                image-decoration
                image-decoration-one
              "
            />


            <div
              className="
                image-decoration
                image-decoration-two
              "
            />


            {product.image_url &&
            !imageFailed ? (

              <img
                src={product.image_url}
                alt={product.name}
                className="peach-detail-product-image"
                onError={() =>
                  setImageFailed(true)
                }
              />

            ) : (

              <div className="peach-detail-image-fallback">


                <div>
                  🛍️
                </div>


                <strong>
                  {product.name}
                </strong>


                <p>
                  Product image coming soon
                </p>

              </div>

            )}

          </div>


          {/* =================================
              IMAGE FOOTER
          ================================= */}

          <div className="detail-image-footer">


            <div>

              <span>
                ✓
              </span>

              <p>

                Quality

                <strong>
                  Assured
                </strong>

              </p>

            </div>


            <div>

              <span>
                ♡
              </span>

              <p>

                Carefully

                <strong>
                  Selected
                </strong>

              </p>

            </div>


            <div>

              <span>
                ✦
              </span>

              <p>

                ShopZone

                <strong>
                  Choice
                </strong>

              </p>

            </div>

          </div>

        </div>


        {/* =================================
            RIGHT SIDE
            PRODUCT INFORMATION
        ================================= */}

        <div className="peach-product-info">


          {/* CATEGORY + ID */}

          <div className="detail-info-top">


            <span className="peach-detail-category">

              {product.category_name ||
                "Uncategorized"}

            </span>


            <span className="detail-product-code">

              PRODUCT #{product.id}

            </span>

          </div>


          {/* =================================
              PRODUCT NAME
          ================================= */}

          <h1 className="peach-detail-title">

            {product.name}

          </h1>


          <p className="detail-product-tagline">

            A beautiful choice from our
            ShopZone collection.

          </p>


          {/* =================================
              PRICE
          ================================= */}

          <div className="detail-price-section">


            <span className="detail-price-label">
              Price
            </span>


            <div className="detail-price">

              <small>
                ₹
              </small>

              <span>
                {price.toFixed(2)}
              </span>

            </div>

          </div>


          {/* =================================
              STOCK
          ================================= */}

          <div className="detail-stock-section">


            {isOutOfStock ? (

              <div
                className="
                  peach-stock-badge
                  peach-stock-out
                "
              >

                <span />

                Out of Stock

              </div>

            ) : isLowStock ? (

              <div
                className="
                  peach-stock-badge
                  peach-stock-low
                "
              >

                <span />

                Only {stock} remaining

              </div>

            ) : (

              <div
                className="
                  peach-stock-badge
                  peach-stock-available
                "
              >

                <span />

                In Stock

              </div>

            )}


            {!isOutOfStock && (

              <span className="detail-stock-count">

                {stock} items available

              </span>

            )}

          </div>


          {/* =================================
              DESCRIPTION
          ================================= */}

          <div className="peach-detail-description">


            <div className="detail-section-heading">

              <span>
                01
              </span>


              <h3>
                Product Description
              </h3>

            </div>


            <p>

              {product.description ||
                "No product description available."}

            </p>

          </div>


          {/* =================================
              PURCHASE AREA
          ================================= */}

          {!isOutOfStock ? (

            <div className="peach-purchase-area">


              {/* QUANTITY */}

              <div className="peach-quantity-section">


                <label htmlFor="quantity">
                  Quantity
                </label>


                <div className="peach-quantity-selector">


                  {/* MINUS */}

                  <button
                    type="button"
                    onClick={
                      decreaseQuantity
                    }
                    disabled={
                      quantity <= 1
                    }
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>


                  {/* QUANTITY INPUT */}

                  <input
                    id="quantity"
                    type="number"
                    value={quantity}
                    min="1"
                    max={stock}
                    onChange={
                      handleQuantityChange
                    }
                  />


                  {/* PLUS */}

                  <button
                    type="button"
                    onClick={
                      increaseQuantity
                    }
                    disabled={
                      quantity >= stock
                    }
                    aria-label="Increase quantity"
                  >
                    +
                  </button>

                </div>

              </div>


              {/* =================================
                  ADD TO CART
              ================================= */}

              <button
                type="button"
                className="peach-detail-cart-button"
                onClick={
                  handleAddToCart
                }
              >


                <span className="detail-cart-icon">
                  🛍
                </span>


                <span>
                  Add to Cart
                </span>


                <span className="detail-cart-arrow">
                  →
                </span>

              </button>

            </div>

          ) : (

            /* OUT OF STOCK BUTTON */

            <button
              type="button"
              className="
                peach-detail-cart-button
                unavailable
              "
              disabled
            >

              Currently Unavailable

            </button>

          )}


          {/* =================================
              BENEFITS
          ================================= */}

          <div className="detail-benefits">


            <div>

              <span>
                ◇
              </span>


              <p>

                <strong>
                  Secure Shopping
                </strong>

                Protected checkout

              </p>

            </div>


            <div>

              <span>
                ✓
              </span>


              <p>

                <strong>
                  Easy Ordering
                </strong>

                Simple purchase flow

              </p>

            </div>

          </div>


          {/* =================================
              BOTTOM LINKS
          ================================= */}

          <div className="peach-detail-actions">


            <Link
              to="/"
              className="detail-continue-link"
            >
              ← Continue Shopping
            </Link>


            <Link
              to="/cart"
              className="detail-cart-link"
            >

              View Cart

              <span>
                →
              </span>

            </Link>

          </div>

        </div>

      </section>

    </div>
  );
}


export default ProductDetail;