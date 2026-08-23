import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../api";
import { useCart } from "../context/CartContext";


function Home() {
  const { addToCart } = useCart();


  const [products, setProducts] =
    useState([]);

  const [categories, setCategories] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [sort, setSort] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");


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
    const image =
      event.currentTarget;

    const fallback =
      image.nextElementSibling;

    image.style.display = "none";

    if (fallback) {
      fallback.style.display = "flex";
    }
  };


  return (
    <div className="home-page">

      {/* HEADER */}

      <div className="home-header">

        <div>
          <h1>ShopZone</h1>

          <p>
            Browse our latest products
          </p>
        </div>

      </div>


      {/* SUCCESS MESSAGE */}

      {message && (
        <div className="cart-success-message">
          {message}
        </div>
      )}


      {/* PRODUCT FILTERS */}

      <div className="product-filters">

        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />


        <select
          value={category}
          onChange={(event) =>
            setCategory(event.target.value)
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


        <select
          value={sort}
          onChange={(event) =>
            setSort(event.target.value)
          }
        >
          <option value="">
            Default Sort
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


      {/* LOADING */}

      {loading && (
        <div className="products-status">
          <p>Loading products...</p>
        </div>
      )}


      {/* ERROR */}

      {!loading && error && (
        <div className="error-message">
          {error}
        </div>
      )}


      {/* NO PRODUCTS */}

      {!loading &&
        !error &&
        products.length === 0 && (

          <div className="products-status">

            <span>🔍</span>

            <h2>
              No products found
            </h2>

            <p>
              Try changing your search or
              category filter.
            </p>

          </div>
        )}


      {/* PRODUCT GRID */}

      {!loading &&
        !error &&
        products.length > 0 && (

          <div className="product-grid">

            {products.map((product) => (

              <div
                className="product-card"
                key={product.id}
              >

                {/* PRODUCT IMAGE */}

                <div className="product-image-container">

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
                    <span>🛍️</span>

                    <p>
                      {product.name}
                    </p>
                  </div>

                </div>


                {/* PRODUCT INFORMATION */}

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
                      "No description available"}
                  </p>


                  <p className="product-price">
                    ₹
                    {Number(
                      product.price
                    ).toFixed(2)}
                  </p>


                  <p className="product-stock">

                    {Number(product.stock) > 0
                      ? `Stock: ${product.stock}`
                      : "Currently unavailable"
                    }

                  </p>


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
                        onClick={() =>
                          handleAddToCart(
                            product
                          )
                        }
                      >
                        Add to Cart
                      </button>

                    ) : (

                      <button
                        type="button"
                        disabled
                      >
                        Out of Stock
                      </button>

                    )}

                  </div>

                </div>

              </div>

            ))}

          </div>
        )}

    </div>
  );
}


export default Home;