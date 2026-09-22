import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import api from "../../api";


const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  stock: "",
  category_id: "",
  image_url: "",
};


function ProductForm() {

  const navigate = useNavigate();

  const { id } = useParams();

  const isEditMode =
    Boolean(id);


  const [categories, setCategories] =
    useState([]);

  const [formData, setFormData] =
    useState(EMPTY_FORM);

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [filePreviewUrl, setFilePreviewUrl] =
    useState("");

  const [imageFailed, setImageFailed] =
    useState(false);

  const [pageLoading, setPageLoading] =
    useState(isEditMode);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");


  const previewUrl =
    filePreviewUrl ||
    formData.image_url;


  // =====================================
  // LOAD CATEGORIES
  // =====================================

  useEffect(() => {

    const loadCategories = async () => {

      try {

        const response =
          await api.get(
            "/api/categories"
          );


        setCategories(
          response.data.data || []
        );

      } catch (err) {

        console.error(
          "Category loading error:",
          err
        );


        setError(
          err.response?.data?.message ||
          err.response?.data?.msg ||
          "Unable to load product categories"
        );
      }
    };


    loadCategories();

  }, []);


  // =====================================
  // LOAD PRODUCT IN EDIT MODE
  // =====================================

  useEffect(() => {

    if (!isEditMode) {

      setPageLoading(false);

      return;
    }


    const loadProduct = async () => {

      try {

        setPageLoading(true);

        setError("");


        const response =
          await api.get(
            `/api/products/${id}`
          );


        const product =
          response.data.data;


        setFormData({

          name:
            product.name || "",

          description:
            product.description || "",

          price:
            product.price ?? "",

          stock:
            product.stock ?? "",

          category_id:
            product.category_id ?? "",

          image_url:
            product.image_url || "",
        });


        setImageFailed(false);

      } catch (err) {

        console.error(
          "Product loading error:",
          err
        );


        setError(
          err.response?.data?.message ||
          err.response?.data?.msg ||
          "Unable to load product"
        );

      } finally {

        setPageLoading(false);
      }
    };


    loadProduct();

  }, [id, isEditMode]);


  // =====================================
  // CLEAN PREVIEW URL
  // =====================================

  useEffect(() => {

    return () => {

      if (filePreviewUrl) {

        URL.revokeObjectURL(
          filePreviewUrl
        );
      }
    };

  }, [filePreviewUrl]);


  // =====================================
  // FORM CHANGE
  // =====================================

  const handleChange = (event) => {

    const {
      name,
      value,
    } = event.target;


    setFormData(
      (previous) => ({

        ...previous,

        [name]: value,
      })
    );


    if (name === "image_url") {

      setImageFailed(false);


      if (selectedFile) {

        setSelectedFile(null);

        setFilePreviewUrl("");
      }
    }
  };


  // =====================================
  // IMAGE SELECTION
  // =====================================

  const handleImageSelect = (
    event
  ) => {

    const file =
      event.target.files?.[0];


    if (!file) {
      return;
    }


    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/webp",
    ];


    if (
      !allowedTypes.includes(
        file.type
      )
    ) {

      setError(
        "Please choose a PNG, JPG, JPEG or WEBP image"
      );

      event.target.value = "";

      return;
    }


    if (
      file.size >
      5 * 1024 * 1024
    ) {

      setError(
        "Image size must be 5 MB or less"
      );

      event.target.value = "";

      return;
    }


    setError("");


    if (filePreviewUrl) {

      URL.revokeObjectURL(
        filePreviewUrl
      );
    }


    setSelectedFile(file);


    setFormData(
      (previous) => ({

        ...previous,

        image_url: "",
      })
    );


    setFilePreviewUrl(
      URL.createObjectURL(file)
    );


    setImageFailed(false);
  };


  // =====================================
  // REMOVE SELECTED IMAGE
  // =====================================

  const removeSelectedImage = () => {

    if (filePreviewUrl) {

      URL.revokeObjectURL(
        filePreviewUrl
      );
    }


    setSelectedFile(null);

    setFilePreviewUrl("");

    setFormData(
      (previous) => ({

        ...previous,

        image_url: "",
      })
    );

    setImageFailed(false);


    const fileInput =
      document.getElementById(
        "product-image-file"
      );


    if (fileInput) {
      fileInput.value = "";
    }
  };


  // =====================================
  // UPLOAD IMAGE
  // =====================================

  const uploadSelectedImage =
    async () => {

      if (!selectedFile) {

        return (
          formData.image_url.trim()
        );
      }


      const imageData =
        new FormData();


      imageData.append(
        "image",
        selectedFile
      );


      const response =
        await api.post(
          "/api/upload/product-image",
          imageData
        );


      return (
        response.data.image_url
      );
    };


  // =====================================
  // SUBMIT
  // =====================================

  const handleSubmit = async (
    event
  ) => {

    event.preventDefault();

    setError("");


    const price =
      Number(formData.price);


    const stock =
      Number(formData.stock);


    // PRODUCT NAME

    if (!formData.name.trim()) {

      setError(
        "Product name is required"
      );

      return;
    }


    // PRICE

    if (
      formData.price === "" ||
      !Number.isFinite(price) ||
      price < 0
    ) {

      setError(
        "Enter a valid product price"
      );

      return;
    }


    // STOCK

    if (
      formData.stock === "" ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {

      setError(
        "Stock must be a whole number of zero or more"
      );

      return;
    }


    // CATEGORY

    if (!formData.category_id) {

      setError(
        "Please select a product category"
      );

      return;
    }


    try {

      setSaving(true);


      const finalImageUrl =
        await uploadSelectedImage();


      const productData = {

        name:
          formData.name.trim(),

        description:
          formData.description.trim(),

        price,

        stock,

        category_id:
          Number(
            formData.category_id
          ),

        image_url:
          finalImageUrl || null,
      };


      if (isEditMode) {

        await api.put(
          `/api/products/${id}`,
          productData
        );

      } else {

        await api.post(
          "/api/products",
          productData
        );
      }


      navigate(
        "/admin/products",
        {
          replace: true,
        }
      );

    } catch (err) {

      console.error(
        "Product saving error:",
        err
      );


      setError(
        err.response?.data?.message ||
        err.response?.data?.msg ||
        "Unable to save product"
      );

    } finally {

      setSaving(false);
    }
  };


  // =====================================
  // LOADING
  // =====================================

  if (pageLoading) {

    return (

      <div className="peach-product-form-page">

        <div className="product-form-loading">

          <div className="product-form-loader" />


          <h2>
            Loading Product
          </h2>


          <p>
            Preparing product information...
          </p>

        </div>

      </div>
    );
  }


  // =====================================
  // PAGE
  // =====================================

  return (

    <div className="peach-product-form-page">


      {/* DECORATIONS */}

      <div className="product-form-decoration form-decoration-one" />

      <div className="product-form-decoration form-decoration-two" />


      {/* =================================
          BREADCRUMB
      ================================= */}

      <div className="peach-product-form-breadcrumb">

        <Link to="/admin/products">
          Admin Products
        </Link>

        <span>
          /
        </span>

        <strong>
          {isEditMode
            ? "Edit Product"
            : "Add Product"}
        </strong>

      </div>


      {/* =================================
          HEADER
      ================================= */}

      <header className="peach-product-form-header">


        <div>

          <span>
            SHOPZONE ADMIN
          </span>


          <h1>

            {isEditMode
              ? "Edit Product"
              : "Add New Product"}

          </h1>


          <p>

            {isEditMode
              ? "Update product information, inventory and product photo."
              : "Create a beautiful new product for your ShopZone catalogue."}

          </p>

        </div>


        <button
          type="button"
          className="product-form-back-button"
          onClick={() =>
            navigate(
              "/admin/products"
            )
          }
        >
          ← Back to Products
        </button>

      </header>


      {/* =================================
          MAIN LAYOUT
      ================================= */}

      <div className="peach-product-form-layout">


        {/* =================================
            FORM
        ================================= */}

        <form
          className="peach-product-form-card"
          onSubmit={handleSubmit}
        >


          {/* ERROR */}

          {error && (

            <div className="peach-product-form-error">

              <span>
                !
              </span>


              <div>

                <strong>
                  Please check the form
                </strong>

                <p>
                  {error}
                </p>

              </div>

            </div>

          )}


          {/* =================================
              BASIC INFORMATION
          ================================= */}

          <section className="peach-form-section">


            <div className="peach-form-section-heading">

              <span>
                01
              </span>


              <div>

                <small>
                  PRODUCT DETAILS
                </small>

                <h2>
                  Basic Information
                </h2>

                <p>
                  Enter the main information
                  customers will see.
                </p>

              </div>

            </div>


            {/* NAME */}

            <div className="peach-product-field">

              <label htmlFor="product-name">

                Product Name

                <span>
                  *
                </span>

              </label>


              <div className="peach-product-input">

                <span>
                  ◇
                </span>


                <input
                  id="product-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Example: Wireless Keyboard"
                  required
                />

              </div>

            </div>


            {/* DESCRIPTION */}

            <div className="peach-product-field">

              <label htmlFor="product-description">
                Description
              </label>


              <textarea
                id="product-description"
                name="description"
                value={
                  formData.description
                }
                onChange={handleChange}
                placeholder="Tell customers about this product..."
                rows="6"
              />


              <small>
                Add useful product details,
                features and information.
              </small>

            </div>

          </section>


          {/* =================================
              PRICE + INVENTORY
          ================================= */}

          <section className="peach-form-section">


            <div className="peach-form-section-heading">

              <span>
                02
              </span>


              <div>

                <small>
                  PRICING & INVENTORY
                </small>

                <h2>
                  Price & Stock
                </h2>

                <p>
                  Set the selling price,
                  inventory and category.
                </p>

              </div>

            </div>


            <div className="peach-product-form-row">


              {/* PRICE */}

              <div className="peach-product-field">

                <label htmlFor="product-price">

                  Price

                  <span>
                    *
                  </span>

                </label>


                <div className="peach-product-input">

                  <span>
                    ₹
                  </span>


                  <input
                    id="product-price"
                    type="number"
                    name="price"
                    value={
                      formData.price
                    }
                    onChange={
                      handleChange
                    }
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    required
                  />

                </div>

              </div>


              {/* STOCK */}

              <div className="peach-product-field">

                <label htmlFor="product-stock">

                  Stock Quantity

                  <span>
                    *
                  </span>

                </label>


                <div className="peach-product-input">

                  <span>
                    #
                  </span>


                  <input
                    id="product-stock"
                    type="number"
                    name="stock"
                    value={
                      formData.stock
                    }
                    onChange={
                      handleChange
                    }
                    min="0"
                    step="1"
                    placeholder="0"
                    required
                  />

                </div>

              </div>

            </div>


            {/* CATEGORY */}

            <div className="peach-product-field">

              <label htmlFor="product-category">

                Category

                <span>
                  *
                </span>

              </label>


              <select
                id="product-category"
                name="category_id"
                value={
                  formData.category_id
                }
                onChange={handleChange}
                required
              >

                <option value="">
                  Select a category
                </option>


                {categories.map(
                  (category) => (

                    <option
                      key={
                        category.id
                      }
                      value={
                        category.id
                      }
                    >
                      {category.name}
                    </option>

                  )
                )}

              </select>

            </div>

          </section>


          {/* =================================
              PRODUCT IMAGE
          ================================= */}

          <section className="peach-form-section">


            <div className="peach-form-section-heading">

              <span>
                03
              </span>


              <div>

                <small>
                  PRODUCT MEDIA
                </small>

                <h2>
                  Product Photo
                </h2>

                <p>
                  Upload an image or use
                  an external image URL.
                </p>

              </div>

            </div>


            {/* FILE UPLOAD */}

            <div className="peach-image-upload-area">


              <div className="peach-upload-icon">
                ↑
              </div>


              <div>

                <strong>
                  Upload product photo
                </strong>


                <p>
                  PNG, JPG, JPEG or WEBP
                  up to 5 MB.
                </p>

              </div>


              <label
                htmlFor="product-image-file"
                className="peach-upload-button"
              >
                Choose Photo
              </label>


              <input
                id="product-image-file"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={
                  handleImageSelect
                }
              />

            </div>


            {selectedFile && (

              <div className="peach-selected-file">

                <div>

                  <span>
                    ✓
                  </span>


                  <div>

                    <strong>
                      {selectedFile.name}
                    </strong>


                    <small>

                      {(
                        selectedFile.size /
                        1024 /
                        1024
                      ).toFixed(2)}

                      {" MB"}

                    </small>

                  </div>

                </div>


                <button
                  type="button"
                  onClick={
                    removeSelectedImage
                  }
                >
                  Remove
                </button>

              </div>

            )}


            {/* DIVIDER */}

            <div className="peach-image-divider">

              <span />

              <strong>
                OR
              </strong>

              <span />

            </div>


            {/* URL */}

            <div className="peach-product-field">

              <label htmlFor="product-image-url">
                Image URL
              </label>


              <div className="peach-product-input">

                <span>
                  ↗
                </span>


                <input
                  id="product-image-url"
                  type="url"
                  name="image_url"
                  value={
                    formData.image_url
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="https://example.com/product.jpg"
                />

              </div>


              <small>
                Adding an image URL will
                replace the selected local file.
              </small>

            </div>

          </section>


          {/* =================================
              ACTIONS
          ================================= */}

          <div className="peach-product-form-actions">


            <button
              type="button"
              className="peach-product-cancel"
              onClick={() =>
                navigate(
                  "/admin/products"
                )
              }
              disabled={saving}
            >
              Cancel
            </button>


            <button
              type="submit"
              className="peach-product-save"
              disabled={saving}
            >

              {saving ? (

                <>
                  <span className="product-save-loader" />

                  Saving Product...
                </>

              ) : (

                <>

                  <span>
                    {isEditMode
                      ? "✓"
                      : "+"}
                  </span>


                  {isEditMode
                    ? "Update Product"
                    : "Add Product"}

                </>

              )}

            </button>

          </div>

        </form>


        {/* =================================
            PREVIEW
        ================================= */}

        <aside className="peach-product-preview">


          <div className="peach-preview-header">

            <div>

              <span>
                LIVE PREVIEW
              </span>

              <h2>
                Product Preview
              </h2>

            </div>


            <span className="preview-live-badge">

              <i />

              Live

            </span>

          </div>


          {/* IMAGE */}

          <div className="peach-preview-image">


            {previewUrl &&
            !imageFailed ? (

              <img
                src={previewUrl}
                alt={
                  formData.name ||
                  "Product preview"
                }
                onError={() =>
                  setImageFailed(true)
                }
              />

            ) : (

              <div className="peach-preview-placeholder">

                <span>
                  🛍️
                </span>


                <strong>

                  {imageFailed
                    ? "Image unavailable"
                    : "Your product image"}

                </strong>


                <p>

                  {imageFailed
                    ? "Please check the image URL or choose another photo."
                    : "Upload a photo to preview it here."}

                </p>

              </div>

            )}

          </div>


          {/* PRODUCT INFORMATION */}

          <div className="peach-preview-content">


            <span className="peach-preview-category">

              {
                categories.find(
                  (category) =>
                    String(
                      category.id
                    ) ===
                    String(
                      formData.category_id
                    )
                )?.name ||
                "Product Category"
              }

            </span>


            <h3>

              {formData.name ||
                "Product Name"}

            </h3>


            <p>

              {formData.description ||
                "Your product description will appear here."}

            </p>


            <div className="peach-preview-price">

              <strong>

                ₹
                {formData.price &&
                Number.isFinite(
                  Number(
                    formData.price
                  )
                )
                  ? Number(
                      formData.price
                    ).toFixed(2)
                  : "0.00"}

              </strong>


              <span
                className={
                  Number(
                    formData.stock
                  ) > 0
                    ? "preview-stock-available"
                    : "preview-stock-empty"
                }
              >

                {Number(
                  formData.stock
                ) > 0
                  ? `${formData.stock} in stock`
                  : "Out of stock"}

              </span>

            </div>

          </div>


          {/* PREVIEW NOTE */}

          <div className="peach-preview-note">

            <span>
              ✦
            </span>


            <p>
              This preview updates automatically
              while you edit the product.
            </p>

          </div>

        </aside>

      </div>

    </div>
  );
}


export default ProductForm;