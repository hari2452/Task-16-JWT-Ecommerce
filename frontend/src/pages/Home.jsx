import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../api";
import { useCart } from "../context/CartContext";


function Home() {
  const { addToCart } = useCart();


  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");


  // =====================================
  // LOAD CATEGORIES
  // =====================================

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await api.get(
          "/api/categories"
        );

        setCategories(
          response.data.data || []
        );

      } catch (err) {
        console.log(
          "Category Error:",
          err
        );
      }
    };

    loadCategories();
  }, []);


  // =====================================
  // LOAD PRODUCTS
  // =====================================

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          "/api/products",
          {
            params: {
              search,
              category,
              sort,
            },
          }
        );

        setProducts(
          response.data.data || []
        );

      } catch (err) {
        console.log(
          "Product Error:",
          err
        );

        setError(
          err.response?.data?.message ||
          "Unable to load products"
        );

      } finally {
        setLoading(false);
      }
    };

    loadProducts();

  }, [search, category, sort]);


  // =====================================
  // ADD PRODUCT TO CART
  // =====================================

  const handleAddToCart = (product) => {
    addToCart(product, 1);

    setMessage(
      `${product.name} added to cart`
    );

    setTimeout(() => {
      setMessage("");
    }, 2000);
  };


  // =====================================
  // HANDLE BROKEN PRODUCT IMAGE
  // =====================================

  const handleImageError = (event) => {
    const image = event.currentTarget;

    const fallback =
      image.nextElementSibling;

    image.style.display = "none";

    if (fallback) {
      fallback.style.display = "flex";
    }
  };


  return (
    <div className="home-page">


      {/* ==================================================
          HERO SECTION
      ================================================== */}

      <section className="peach-hero">


        {/* LEFT CONTENT */}

        <div className="peach-hero-content">

          <span className="hero-small-title">
            ✦ NEW COLLECTION
          </span>


          <h1>
            Shopping made
            <span className="hero-highlight">
              {" "}beautiful.
            </span>
          </h1>


          <p className="hero-description">
            Discover carefully selected products
            made for your everyday lifestyle.
            Simple, beautiful and effortless
            shopping with ShopZone.
          </p>


          <div className="hero-actions">

            <a
              href="#shop-products"
              className="hero-shop-button"
            >
              Shop Collection

              <span>
                →
              </span>
            </a>


            <div className="hero-trust">

              <strong>
                100%
              </strong>

              <span>
                Secure
                <br />
                Shopping
              </span>

            </div>

          </div>

        </div>


        {/* RIGHT VISUAL */}

        <div className="peach-hero-visual">

          <div className="hero-circle hero-circle-one" />

          <div className="hero-circle hero-circle-two" />


          {/* MAIN DISPLAY CARD */}

          <div className="hero-main-card">

            <div className="hero-card-shine" />


            <span className="hero-bag-icon">
              🛍️
            </span>


            <span className="hero-card-small">
              SHOPZONE
            </span>


            <h2>
              Find something
              <br />
              you love.
            </h2>


            <div className="hero-card-line" />


            <p>
              New arrivals waiting for you
            </p>

          </div>


          {/* FLOATING CARD */}

          <div className="hero-floating-card floating-one">

            <span>
              ✨
            </span>

            <div>

              <small>
                NEW
              </small>

              <strong>
                Fresh Picks
              </strong>

            </div>

          </div>


          {/* FLOATING CARD */}

          <div className="hero-floating-card floating-two">

            <span>
              ♡
            </span>

            <div>

              <small>
                MADE FOR
              </small>

              <strong>
                You
              </strong>

            </div>

          </div>

        </div>

      </section>



      {/* ==================================================
          SUCCESS TOAST
      ================================================== */}

      {message && (

        <div className="cart-success-message">
          ✓ {message}
        </div>

      )}



      {/* ==================================================
          SHOP SECTION
      ================================================== */}

      <section
        className="peach-shop-section"
        id="shop-products"
      >


        {/* SHOP TITLE */}

        <div className="peach-shop-heading">

          <div>

            <span className="shop-small-title">
              OUR COLLECTION
            </span>


            <h2>
              Find your
              <span>
                {" "}perfect pick
              </span>
            </h2>


            <p>
              Browse our latest products and
              find something you'll love.
            </p>

          </div>


          <div className="shop-product-count">

            <strong>
              {products.length}
            </strong>

            <span>
              Products
            </span>

          </div>

        </div>



        {/* ==================================================
            SEARCH + FILTERS
        ================================================== */}

        <div className="peach-filter-bar">


          {/* SEARCH */}

          <div className="peach-search-box">

            <span className="search-icon">
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search something beautiful..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

          </div>



          {/* CATEGORY */}

          <div className="peach-select-wrapper">

            <span>
              ♡
            </span>

            <select
              value={category}
              onChange={(event) =>
                setCategory(
                  event.target.value
                )
              }
            >

              <option value="">
                All Categories
              </option>


              {categories.map((item) => (

                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.name}
                </option>

              ))}

            </select>

          </div>



          {/* SORT */}

          <div className="peach-select-wrapper">

            <span>
              ↕
            </span>

            <select
              value={sort}
              onChange={(event) =>
                setSort(
                  event.target.value
                )
              }
            >

              <option value="">
                Featured
              </option>

              <option value="price_asc">
                Price: Low to High
              </option>

              <option value="price_desc">
                Price: High to Low
              </option>

              <option value="newest">
                Newest
              </option>

            </select>

          </div>

        </div>



        {/* ==================================================
            LOADING
        ================================================== */}

        {loading && (

          <div className="products-status">

            <div className="peach-loading-spinner" />

            <h3>
              Finding beautiful products...
            </h3>

            <p>
              Just a moment
            </p>

          </div>

        )}



        {/* ==================================================
            ERROR
        ================================================== */}

        {!loading && error && (

          <div className="error-message">
            {error}
          </div>

        )}



        {/* ==================================================
            NO PRODUCTS
        ================================================== */}

        {!loading &&
          !error &&
          products.length === 0 && (

            <div className="products-status">

              <span className="empty-search-icon">
                🔍
              </span>

              <h2>
                No products found
              </h2>

              <p>
                Try changing your search,
                category or sort filter.
              </p>

            </div>

          )}



        {/* ==================================================
            PRODUCT GRID
        ================================================== */}

        {!loading &&
          !error &&
          products.length > 0 && (

            <div className="product-grid">

              {products.map(
                (product, index) => (

                  <div
                    className="product-card"
                    key={product.id}
                    style={{
                      animationDelay:
                        `${index * 70}ms`,
                    }}
                  >


                    {/* PRODUCT IMAGE */}

                    <div className="product-image-container">


                      {/* CATEGORY BADGE */}

                      <span className="product-image-category">
                        {product.category_name ||
                          "Featured"}
                      </span>


                      {/* DECORATIVE HEART */}

                      <button
                        type="button"
                        className="product-heart"
                        aria-label="Favorite product"
                      >
                        ♡
                      </button>


                      {product.image_url && (

                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="product-image"
                          loading="lazy"
                          onError={
                            handleImageError
                          }
                        />

                      )}


                      {/* IMAGE FALLBACK */}

                      <div
                        className="product-image-fallback"
                        style={{
                          display:
                            product.image_url
                              ? "none"
                              : "flex",
                        }}
                      >

                        <span>
                          🛍️
                        </span>

                        <p>
                          {product.name}
                        </p>

                      </div>


                      {/* STOCK BADGE */}

                      <div
                        className={
                          Number(product.stock) > 0
                            ? "product-stock-badge in-stock"
                            : "product-stock-badge out-stock"
                        }
                      >

                        {Number(product.stock) > 0
                          ? "In Stock"
                          : "Sold Out"
                        }

                      </div>

                    </div>



                    {/* PRODUCT CONTENT */}

                    <div className="product-card-content">


                      <span className="product-category">
                        {product.category_name ||
                          "Uncategorized"}
                      </span>


                      <Link
                        to={`/products/${product.id}`}
                        className="product-name-link"
                      >

                        <h3>
                          {product.name}
                        </h3>

                      </Link>


                      <p className="product-description">

                        {product.description ||
                          "Discover this beautiful product from our ShopZone collection."}

                      </p>



                      {/* PRICE + STOCK */}

                      <div className="product-price-row">

                        <div>

                          <span className="price-label">
                            Price
                          </span>

                          <p className="product-price">
                            ₹
                            {Number(
                              product.price
                            ).toFixed(2)}
                          </p>

                        </div>


                        {Number(product.stock) > 0 && (

                          <div className="product-stock-small">

                            <span>
                              {product.stock}
                            </span>

                            <small>
                              available
                            </small>

                          </div>

                        )}

                      </div>



                      {/* ACTION BUTTONS */}

                      <div className="product-card-actions">


                        <Link
                          to={`/products/${product.id}`}
                          className="view-product-button"
                        >
                          View Details
                        </Link>


                        {Number(product.stock) > 0 ? (

                          <button
                            type="button"
                            className="add-cart-button"
                            onClick={() =>
                              handleAddToCart(
                                product
                              )
                            }
                          >
                            <span>
                              +
                            </span>

                            Add to Cart
                          </button>

                        ) : (

                          <button
                            type="button"
                            className="add-cart-button disabled"
                            disabled
                          >
                            Out of Stock
                          </button>

                        )}

                      </div>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

      </section>

    </div>
  );
}


export default Home;