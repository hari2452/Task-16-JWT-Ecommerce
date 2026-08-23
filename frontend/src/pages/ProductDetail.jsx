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

        const response = await api.get(
          `/api/products/${id}`
        );

        setProduct(
          response.data.data
        );

      } catch (err) {
        console.log(
          "Product Detail Error:",
          err
        );

        setError(
          err.response?.data?.message ||
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
    setQuantity((currentQuantity) =>
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

    setQuantity((currentQuantity) =>
      Math.min(
        Number(product.stock),
        currentQuantity + 1
      )
    );
  };


  // =====================================
  // MANUAL QUANTITY CHANGE
  // =====================================

  const handleQuantityChange = (event) => {
    const enteredQuantity =
      Number(event.target.value);

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
        Number(product.stock)
      )
    );
  };


  // =====================================
  // ADD PRODUCT TO CART
  // =====================================

  const handleAddToCart = () => {
    if (!product) {
      return;
    }

    if (Number(product.stock) <= 0) {
      setError(
        "This product is out of stock"
      );
      return;
    }

    addToCart(
      product,
      quantity
    );

    setMessage(
      `${quantity} × ${product.name} added to cart`
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
      <div className="product-detail-page">

        <div className="product-detail-status">
          <p>Loading product...</p>
        </div>

      </div>
    );
  }


  // =====================================
  // ERROR
  // =====================================

  if (error && !product) {
    return (
      <div className="product-detail-page">

        <div className="product-detail-status">

          <h1>Product unavailable</h1>

          <p>{error}</p>

          <Link to="/">
            Return to Shop
          </Link>

        </div>

      </div>
    );
  }


  if (!product) {
    return null;
  }


  const isOutOfStock =
    Number(product.stock) <= 0;


  return (
    <div className="product-detail-page">

      {/* BREADCRUMB */}

      <div className="product-breadcrumb">

        <Link to="/">
          Home
        </Link>

        <span>›</span>

        <span>
          {product.name}
        </span>

      </div>


      {/* SUCCESS MESSAGE */}

      {message && (
        <div className="cart-success-message">
          {message}
        </div>
      )}


      {/* ERROR MESSAGE */}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}


      <div className="product-detail-layout">

        {/* PRODUCT IMAGE */}

        <div className="product-detail-image-card">

          {product.image_url &&
          !imageFailed ? (

            <img
              src={product.image_url}
              alt={product.name}
              onError={() =>
                setImageFailed(true)
              }
            />

          ) : (

            <div className="product-detail-fallback">

              <span>🛍️</span>

              <p>
                No product image available
              </p>

            </div>

          )}

        </div>


        {/* PRODUCT INFORMATION */}

        <div className="product-detail-info">

          <span className="product-detail-category">

            {product.category_name ||
              "Uncategorized"}

          </span>


          <h1>
            {product.name}
          </h1>


          <p className="product-detail-price">

            ₹
            {Number(
              product.price
            ).toFixed(2)}

          </p>


          <div className="product-detail-stock">

            {isOutOfStock ? (

              <span className="detail-out-stock">
                Out of Stock
              </span>

            ) : Number(product.stock) < 5 ? (

              <span className="detail-low-stock">
                Only {product.stock} remaining
              </span>

            ) : (

              <span className="detail-in-stock">
                In Stock
              </span>

            )}

          </div>


          <div className="product-detail-description">

            <h3>
              Product Description
            </h3>

            <p>
              {product.description ||
                "No product description available."}
            </p>

          </div>


          {!isOutOfStock && (

            <div className="product-purchase-section">

              <div className="quantity-section">

                <label htmlFor="quantity">
                  Quantity
                </label>


                <div className="quantity-selector">

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


                  <input
                    id="quantity"
                    type="number"
                    value={quantity}
                    min="1"
                    max={product.stock}
                    onChange={
                      handleQuantityChange
                    }
                  />


                  <button
                    type="button"
                    onClick={
                      increaseQuantity
                    }
                    disabled={
                      quantity >=
                      Number(product.stock)
                    }
                    aria-label="Increase quantity"
                  >
                    +
                  </button>

                </div>

              </div>


              <button
                type="button"
                className="detail-add-cart-button"
                onClick={
                  handleAddToCart
                }
              >
                Add to Cart
              </button>

            </div>

          )}


          {isOutOfStock && (

            <button
              type="button"
              className="detail-add-cart-button"
              disabled
            >
              Currently Unavailable
            </button>

          )}


          <div className="product-detail-actions">

            <Link
              to="/"
              className="continue-shopping-link"
            >
              ← Continue Shopping
            </Link>


            <Link
              to="/cart"
              className="go-to-cart-link"
            >
              View Cart
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
}


export default ProductDetail;