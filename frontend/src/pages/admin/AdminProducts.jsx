import {
  useEffect,
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


  // =====================================
  // LOAD PRODUCTS
  // =====================================

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/api/products"
      );

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


      // Remove deleted product
      // immediately from React state.

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
        "Unable to delete product"
      );

    } finally {
      setDeletingId(null);
    }
  };


  // =====================================
  // HANDLE BROKEN IMAGE
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
  // LOADING
  // =====================================

  if (loading) {
    return (
      <div className="admin-page">

        <div className="admin-products-status">
          <p>Loading products...</p>
        </div>

      </div>
    );
  }


  return (
    <div className="admin-page">

      {/* PAGE HEADER */}

      <div className="admin-page-header">

        <div>

          <h1>
            Product Management
          </h1>


          <p>
            Add, edit and manage store products
          </p>

        </div>


        <div className="admin-header-actions">

          <button
            type="button"
            className="admin-refresh-button"
            onClick={loadProducts}
          >
            Refresh
          </button>


          <Link
            to="/admin/products/add"
            className="admin-add-button"
          >
            + Add New Product
          </Link>

        </div>

      </div>


      {/* ERROR MESSAGE */}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}


      {/* SUCCESS MESSAGE */}

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}


      {/* PRODUCT COUNT */}

      <div className="admin-product-summary">

        <p>
          Total Products:{" "}

          <strong>
            {products.length}
          </strong>
        </p>


        <p>
          Low Stock:{" "}

          <strong>
            {
              products.filter(
                (product) =>
                  Number(product.stock) > 0 &&
                  Number(product.stock) < 5
              ).length
            }
          </strong>
        </p>


        <p>
          Out of Stock:{" "}

          <strong>
            {
              products.filter(
                (product) =>
                  Number(product.stock) === 0
              ).length
            }
          </strong>
        </p>

      </div>


      {/* EMPTY PRODUCT LIST */}

      {products.length === 0 ? (

        <div className="admin-products-empty">

          <span>📦</span>

          <h2>
            No products available
          </h2>

          <p>
            Add your first product to the store.
          </p>


          <Link
            to="/admin/products/add"
            className="admin-add-button"
          >
            + Add Product
          </Link>

        </div>

      ) : (

        /* PRODUCT TABLE */

        <div className="admin-table-wrapper">

          <table className="admin-table">

            <thead>

              <tr>

                <th>ID</th>

                <th>Photo</th>

                <th>Product</th>

                <th>Category</th>

                <th>Price</th>

                <th>Stock</th>

                <th>Status</th>

                <th>Actions</th>

              </tr>

            </thead>


            <tbody>

              {products.map(
                (product) => {

                  const stock =
                    Number(product.stock);


                  return (
                    <tr key={product.id}>

                      {/* PRODUCT ID */}

                      <td>
                        {product.id}
                      </td>


                      {/* PRODUCT PHOTO */}

                      <td>

                        <div className="admin-product-image">

                          {product.image_url && (

                            <img
                              src={
                                product.image_url
                              }
                              alt={
                                product.name
                              }
                              loading="lazy"
                              onError={
                                handleImageError
                              }
                            />

                          )}


                          <div
                            className="admin-image-fallback"

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

                      </td>


                      {/* PRODUCT INFORMATION */}

                      <td>

                        <strong className="admin-product-name">
                          {product.name}
                        </strong>


                        <p className="admin-product-description">

                          {product.description ||
                            "No description"}

                        </p>

                      </td>


                      {/* CATEGORY */}

                      <td>

                        {product.category_name ||
                          "Uncategorized"}

                      </td>


                      {/* PRICE */}

                      <td className="admin-product-price">

                        ₹
                        {Number(
                          product.price
                        ).toFixed(2)}

                      </td>


                      {/* STOCK */}

                      <td>
                        {stock}
                      </td>


                      {/* STOCK STATUS */}

                      <td>

                        {stock === 0 ? (

                          <span className="stock-badge out-stock">
                            Out of Stock
                          </span>

                        ) : stock < 5 ? (

                          <span className="stock-badge low-stock">
                            Low Stock
                          </span>

                        ) : (

                          <span className="stock-badge in-stock">
                            In Stock
                          </span>

                        )}

                      </td>


                      {/* ACTION BUTTONS */}

                      <td>

                        <div className="admin-actions">

                          <Link
                            to={
                              `/admin/products/edit/${product.id}`
                            }
                            className="edit-button"
                          >
                            Edit
                          </Link>


                          <button
                            type="button"
                            className="delete-button"

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
                            product.id
                              ? "Deleting..."
                              : "Delete"
                            }

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

    </div>
  );
}


export default AdminProducts;