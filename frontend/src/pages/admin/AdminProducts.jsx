import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import api from "../../api";


function AdminProducts() {

  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [deletingId, setDeletingId] =
    useState(null);

  const [search, setSearch] =
    useState("");


  // =====================================
  // LOAD PRODUCTS
  // =====================================

  const loadProducts = async () => {

    try {

      setLoading(true);
      setError("");

      const response =
        await api.get("/api/products");

      setProducts(
        response.data.data || []
      );

    } catch (err) {

      console.log(
        "Admin Products Error:",
        err
      );

      setError(
        err.response?.data?.message ||
        err.response?.data?.msg ||
        "Unable to load products"
      );

    } finally {

      setLoading(false);
    }
  };


  useEffect(() => {

    loadProducts();

  }, []);


  // =====================================
  // DELETE PRODUCT
  // =====================================

  const handleDelete = async (
    id,
    name
  ) => {

    const confirmDelete =
      window.confirm(
        `Are you sure you want to delete "${name}"?`
      );


    if (!confirmDelete) {
      return;
    }


    try {

      setDeletingId(id);

      setError("");
      setMessage("");


      await api.delete(
        `/api/products/${id}`
      );


      setProducts(
        (currentProducts) =>
          currentProducts.filter(
            (product) =>
              product.id !== id
          )
      );


      setMessage(
        `"${name}" deleted successfully`
      );


      setTimeout(() => {
        setMessage("");
      }, 3000);

    } catch (err) {

      console.log(
        "Delete Error:",
        err
      );


      setError(
        err.response?.data?.message ||
        err.response?.data?.msg ||
        "Unable to delete product"
      );

    } finally {

      setDeletingId(null);
    }
  };


  // =====================================
  // IMAGE ERROR
  // =====================================

  const handleImageError = (event) => {

    const image =
      event.currentTarget;

    const fallback =
      image.nextElementSibling;


    image.style.display = "none";


    if (fallback) {

      fallback.style.display =
        "flex";
    }
  };


  // =====================================
  // PRODUCT STATISTICS
  // =====================================

  const totalProducts =
    products.length;


  const inStockCount =
    products.filter(
      (product) =>
        Number(product.stock) >= 5
    ).length;


  const lowStockCount =
    products.filter(
      (product) =>
        Number(product.stock) > 0 &&
        Number(product.stock) < 5
    ).length;


  const outOfStockCount =
    products.filter(
      (product) =>
        Number(product.stock) === 0
    ).length;


  // =====================================
  // SEARCH
  // =====================================

  const filteredProducts =
    useMemo(() => {

      const searchValue =
        search.trim().toLowerCase();


      if (!searchValue) {
        return products;
      }


      return products.filter(
        (product) => {

          const name =
            product.name
              ?.toLowerCase() || "";

          const category =
            product.category_name
              ?.toLowerCase() || "";

          const description =
            product.description
              ?.toLowerCase() || "";


          return (
            name.includes(searchValue) ||
            category.includes(searchValue) ||
            description.includes(searchValue)
          );
        }
      );

    }, [products, search]);


  // =====================================
  // LOADING
  // =====================================

  if (loading) {

    return (

      <div className="peach-admin-page">

        <div className="admin-bg-shape admin-shape-one" />
        <div className="admin-bg-shape admin-shape-two" />


        <div className="peach-admin-loading">

          <div className="admin-loader-ring">
            <span />
          </div>


          <h2>
            Loading Products
          </h2>


          <p>
            Preparing your ShopZone catalogue...
          </p>

        </div>

      </div>
    );
  }


  // =====================================
  // PAGE
  // =====================================

  return (

    <div className="peach-admin-page">


      {/* BACKGROUND */}

      <div className="admin-bg-shape admin-shape-one" />
      <div className="admin-bg-shape admin-shape-two" />


      {/* =================================
          HEADER
      ================================= */}

      <header className="peach-admin-header">


        <div className="admin-header-content">

          <span className="admin-page-label">
            SHOPZONE ADMIN
          </span>


          <h1>
            Product Management
          </h1>


          <p>
            Manage products, prices,
            stock and your store catalogue.
          </p>

        </div>


        <div className="peach-admin-header-actions">


          <button
            type="button"
            className="peach-admin-refresh"
            onClick={loadProducts}
          >

            <span>
              ↻
            </span>

            Refresh

          </button>


          <Link
            to="/admin/products/add"
            className="peach-admin-add"
          >

            <span>
              +
            </span>

            Add New Product

          </Link>

        </div>

      </header>


      {/* =================================
          MESSAGES
      ================================= */}

      {error && (

        <div className="peach-admin-message admin-message-error">

          <span>
            !
          </span>


          <div>

            <strong>
              Something went wrong
            </strong>

            <p>
              {error}
            </p>

          </div>

        </div>
      )}


      {message && (

        <div className="peach-admin-message admin-message-success">

          <span>
            ✓
          </span>


          <div>

            <strong>
              Success
            </strong>

            <p>
              {message}
            </p>

          </div>

        </div>
      )}


      {/* =================================
          STATISTICS
      ================================= */}

      <section className="peach-admin-stats">


        {/* TOTAL */}

        <div className="peach-admin-stat-card">

          <div className="admin-stat-icon">
            ◇
          </div>


          <div>

            <span>
              TOTAL PRODUCTS
            </span>

            <strong>
              {totalProducts}
            </strong>

            <p>
              Store catalogue
            </p>

          </div>

        </div>


        {/* IN STOCK */}

        <div className="peach-admin-stat-card">

          <div className="admin-stat-icon admin-stat-green">
            ✓
          </div>


          <div>

            <span>
              IN STOCK
            </span>

            <strong>
              {inStockCount}
            </strong>

            <p>
              Ready for orders
            </p>

          </div>

        </div>


        {/* LOW STOCK */}

        <div className="peach-admin-stat-card">

          <div className="admin-stat-icon admin-stat-orange">
            !
          </div>


          <div>

            <span>
              LOW STOCK
            </span>

            <strong>
              {lowStockCount}
            </strong>

            <p>
              Needs attention
            </p>

          </div>

        </div>


        {/* OUT OF STOCK */}

        <div className="peach-admin-stat-card">

          <div className="admin-stat-icon admin-stat-red">
            ×
          </div>


          <div>

            <span>
              OUT OF STOCK
            </span>

            <strong>
              {outOfStockCount}
            </strong>

            <p>
              Unavailable items
            </p>

          </div>

        </div>

      </section>


      {/* =================================
          PRODUCT MANAGEMENT CARD
      ================================= */}

      <section className="peach-admin-products-card">


        {/* TOOLBAR */}

        <div className="peach-admin-toolbar">


          <div>

            <span className="admin-section-number">
              01
            </span>


            <div>

              <span className="admin-section-label">
                CATALOGUE
              </span>

              <h2>
                Your Products
              </h2>

              <p>
                Manage your ShopZone inventory.
              </p>

            </div>

          </div>


          <div className="admin-toolbar-right">


            {/* SEARCH */}

            <div className="peach-admin-search">

              <span>
                ⌕
              </span>


              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search products..."
              />


              {search && (

                <button
                  type="button"
                  onClick={() =>
                    setSearch("")
                  }
                  aria-label="Clear search"
                >
                  ×
                </button>

              )}

            </div>


            <span className="admin-result-count">

              {filteredProducts.length}

              {" "}

              product
              {filteredProducts.length !== 1
                ? "s"
                : ""}

            </span>

          </div>

        </div>


        {/* =================================
            EMPTY PRODUCTS
        ================================= */}

        {products.length === 0 ? (

          <div className="peach-admin-empty">

            <div className="admin-empty-icon">
              📦
            </div>


            <h2>
              Your catalogue is empty.
            </h2>


            <p>
              Add your first product to
              start building your ShopZone store.
            </p>


            <Link
              to="/admin/products/add"
              className="peach-admin-add"
            >
              + Add First Product
            </Link>

          </div>

        ) : filteredProducts.length === 0 ? (

          <div className="peach-admin-empty">

            <div className="admin-empty-icon">
              ⌕
            </div>


            <h2>
              No products found.
            </h2>


            <p>
              No products match
              "{search}".
            </p>


            <button
              type="button"
              className="admin-clear-search"
              onClick={() =>
                setSearch("")
              }
            >
              Clear Search
            </button>

          </div>

        ) : (

          /* =================================
             PRODUCT TABLE
          ================================= */

          <div className="peach-admin-table-wrapper">


            <table className="peach-admin-table">


              <thead>

                <tr>

                  <th>
                    ID
                  </th>

                  <th>
                    Product
                  </th>

                  <th>
                    Category
                  </th>

                  <th>
                    Price
                  </th>

                  <th>
                    Stock
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredProducts.map(
                  (product) => {

                    const stock =
                      Number(product.stock);

                    const price =
                      Number(product.price);


                    return (

                      <tr key={product.id}>


                        {/* ID */}

                        <td>

                          <span className="admin-product-id">
                            #{product.id}
                          </span>

                        </td>


                        {/* PRODUCT */}

                        <td>

                          <div className="peach-admin-product">


                            {/* IMAGE */}

                            <div className="peach-admin-product-image">

                              {product.image_url && (

                                <img
                                  src={product.image_url}
                                  alt={product.name}
                                  loading="lazy"
                                  onError={
                                    handleImageError
                                  }
                                />

                              )}


                              <div
                                className="peach-admin-image-fallback"
                                style={{
                                  display:
                                    product.image_url
                                      ? "none"
                                      : "flex",
                                }}
                              >
                                🛍️
                              </div>

                            </div>


                            {/* INFORMATION */}

                            <div className="peach-admin-product-info">

                              <strong>
                                {product.name}
                              </strong>


                              <p>
                                {product.description ||
                                  "No description available"}
                              </p>

                            </div>

                          </div>

                        </td>


                        {/* CATEGORY */}

                        <td>

                          <span className="peach-admin-category">

                            {product.category_name ||
                              "Uncategorized"}

                          </span>

                        </td>


                        {/* PRICE */}

                        <td>

                          <strong className="peach-admin-price">

                            ₹
                            {price.toFixed(2)}

                          </strong>

                        </td>


                        {/* STOCK */}

                        <td>

                          <div className="peach-admin-stock">

                            <strong>
                              {stock}
                            </strong>

                            <span>
                              units
                            </span>

                          </div>

                        </td>


                        {/* STATUS */}

                        <td>

                          {stock === 0 ? (

                            <span className="peach-stock-badge peach-stock-out">

                              <i />

                              Out of Stock

                            </span>

                          ) : stock < 5 ? (

                            <span className="peach-stock-badge peach-stock-low">

                              <i />

                              Low Stock

                            </span>

                          ) : (

                            <span className="peach-stock-badge peach-stock-in">

                              <i />

                              In Stock

                            </span>

                          )}

                        </td>


                        {/* ACTIONS */}

                        <td>

                          <div className="peach-admin-actions">


                            <Link
                              to={
                                `/admin/products/edit/${product.id}`
                              }
                              className="peach-edit-button"
                            >

                              <span>
                                ✎
                              </span>

                              Edit

                            </Link>


                            <button
                              type="button"
                              className="peach-delete-button"
                              disabled={
                                deletingId ===
                                product.id
                              }
                              onClick={() =>
                                handleDelete(
                                  product.id,
                                  product.name
                                )
                              }
                            >

                              {deletingId ===
                              product.id ? (

                                <>
                                  <span className="admin-delete-loader" />

                                  Deleting
                                </>

                              ) : (

                                <>
                                  <span>
                                    ×
                                  </span>

                                  Delete
                                </>

                              )}

                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>
        )}


        {/* =================================
            FOOTER
        ================================= */}

        {products.length > 0 && (

          <div className="peach-admin-table-footer">

            <p>

              Showing{" "}

              <strong>
                {filteredProducts.length}
              </strong>

              {" "}of{" "}

              <strong>
                {products.length}
              </strong>

              {" "}products

            </p>


            <Link
              to="/admin/products/add"
            >
              + Add another product
            </Link>

          </div>
        )}

      </section>

    </div>
  );
}


export default AdminProducts;