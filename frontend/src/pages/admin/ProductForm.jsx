import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  const isEditMode = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState("");
  const [imageFailed, setImageFailed] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const previewUrl = filePreviewUrl || formData.image_url;

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await api.get("/api/categories");
        setCategories(response.data.data || []);
      } catch (err) {
        console.error("Category loading error:", err);
        setError(
          err.response?.data?.message || "Unable to load product categories"
        );
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    if (!isEditMode) {
      setPageLoading(false);
      return;
    }

    const loadProduct = async () => {
      try {
        setPageLoading(true);
        setError("");

        const response = await api.get(`/api/products/${id}`);
        const product = response.data.data;

        setFormData({
          name: product.name || "",
          description: product.description || "",
          price: product.price ?? "",
          stock: product.stock ?? "",
          category_id: product.category_id ?? "",
          image_url: product.image_url || "",
        });
        setImageFailed(false);
      } catch (err) {
        console.error("Product loading error:", err);
        setError(err.response?.data?.message || "Unable to load product");
      } finally {
        setPageLoading(false);
      }
    };

    loadProduct();
  }, [id, isEditMode]);

  useEffect(() => {
    return () => {
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
      }
    };
  }, [filePreviewUrl]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (name === "image_url") {
      setImageFailed(false);

      if (selectedFile) {
        setSelectedFile(null);
        setFilePreviewUrl("");
      }
    }
  };

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = ["image/png", "image/jpeg", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Please choose a PNG, JPG, JPEG or WEBP image");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be 5 MB or less");
      event.target.value = "";
      return;
    }

    setError("");
    setSelectedFile(file);
    setFormData((previous) => ({ ...previous, image_url: "" }));
    setFilePreviewUrl(URL.createObjectURL(file));
    setImageFailed(false);
  };

  const uploadSelectedImage = async () => {
    if (!selectedFile) {
      return formData.image_url.trim();
    }

    const imageData = new FormData();
    imageData.append("image", selectedFile);

    const response = await api.post(
      "/api/upload/product-image",
      imageData
    );

    return response.data.image_url;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const price = Number(formData.price);
    const stock = Number(formData.stock);

    if (!formData.name.trim()) {
      setError("Product name is required");
      return;
    }

    if (formData.price === "" || !Number.isFinite(price) || price < 0) {
      setError("Enter a valid product price");
      return;
    }

    if (
      formData.stock === "" ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      setError("Stock must be a whole number of zero or more");
      return;
    }

    if (!formData.category_id) {
      setError("Please select a product category");
      return;
    }

    try {
      setSaving(true);

      const finalImageUrl = await uploadSelectedImage();

      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price,
        stock,
        category_id: Number(formData.category_id),
        image_url: finalImageUrl || null,
      };

      if (isEditMode) {
        await api.put(`/api/products/${id}`, productData);
      } else {
        await api.post("/api/products", productData);
      }

      navigate("/admin/products", { replace: true });
    } catch (err) {
      console.error("Product saving error:", err);
      setError(err.response?.data?.message || "Unable to save product");
    } finally {
      setSaving(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="product-form-page">
        <p>Loading product...</p>
      </div>
    );
  }

  return (
    <div className="product-form-page">
      <div className="product-form-header">
        <h1>{isEditMode ? "Edit Product" : "Add New Product"}</h1>
        <p>
          {isEditMode
            ? "Update the product information and photo"
            : "Create a new product for your store"}
        </p>
      </div>

      <div className="product-form-layout">
        <form className="product-form-card" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="product-name">Product Name</label>
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

          <div className="form-group">
            <label htmlFor="product-description">Description</label>
            <textarea
              id="product-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter product description"
              rows="5"
            />
          </div>

          <div className="product-form-row">
            <div className="form-group">
              <label htmlFor="product-price">Price</label>
              <input
                id="product-price"
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="0.00"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="product-stock">Stock</label>
              <input
                id="product-stock"
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                step="1"
                placeholder="0"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="product-category">Category</label>
            <select
              id="product-category"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="product-photo-section">
            <h3>Product Photo</h3>
            <p>Choose a photo from your computer or paste an image URL.</p>

            <div className="form-group">
              <label htmlFor="product-image-file">Upload Photo</label>
              <input
                id="product-image-file"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleImageSelect}
              />
              <small>PNG, JPG, JPEG or WEBP — maximum 5 MB</small>
            </div>

            <div className="image-option-divider">OR</div>

            <div className="form-group">
              <label htmlFor="product-image-url">Image URL</label>
              <input
                id="product-image-url"
                type="url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                placeholder="https://example.com/product.jpg"
              />
            </div>
          </div>

          <div className="product-form-actions">
            <button
              type="button"
              onClick={() => navigate("/admin/products")}
              disabled={saving}
            >
              Cancel
            </button>

            <button type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : isEditMode
                  ? "Update Product"
                  : "Add Product"}
            </button>
          </div>
        </form>

        <aside className="product-preview-card">
          <h2>Product Preview</h2>

          {previewUrl && !imageFailed ? (
            <img
              src={previewUrl}
              alt={formData.name || "Product preview"}
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="preview-placeholder">
              <span>🛍️</span>
              <p>{imageFailed ? "Unable to display image" : "No image selected"}</p>
            </div>
          )}

          <h3>{formData.name || "Product Name"}</h3>
          <p>
            {formData.description || "Product description will appear here."}
          </p>
          <strong>
            ₹
            {formData.price && Number.isFinite(Number(formData.price))
              ? Number(formData.price).toFixed(2)
              : "0.00"}
          </strong>
          <p>Stock: {formData.stock === "" ? "0" : formData.stock}</p>
        </aside>
      </div>
    </div>
  );
}

export default ProductForm;