ShopZone — Full-Stack E-Commerce Platform

ShopZone is a full-stack e-commerce application built with React, Flask and MySQL. Customers can browse products, search and filter the catalogue, maintain a shopping cart, place orders and track order status. Administrators can manage products, upload product images, monitor stock, view customer orders and update delivery status.

Technologies Used

Frontend

React with Vite

React Router

React Context API

Axios

CSS3 responsive design

Browser localStorage for cart persistence

Backend

Python

Flask

Flask-CORS

Flask-Bcrypt

MySQL Connector

Flask session authentication

Database

MySQL

Tables: users, categories, products, orders, and order_items

Main Features

Customer Features

Registration, login and logout

Session-based authentication

Browse products with images

Product search, category filter and price sorting

Product detail page with quantity selection

Add, update and remove cart items

Cart persistence after browser refresh

Protected checkout page

Place an order with a delivery address

View previous orders and current status

Responsive desktop, tablet and mobile interface

Administrator Features

Role-protected administrator pages

View all products with image thumbnails

Add, edit and delete products

Upload PNG, JPG, JPEG and WEBP product images

Validate image type and 5 MB maximum size

Product image preview

In Stock, Low Stock and Out of Stock badges

View all customer orders

View order totals and customer delivery information

Filter orders by status

Update orders to Pending, Confirmed, Shipped, Delivered or Cancelled

Demo Login Credentials

Administrator

Field

Value

Email/User ID

admin@shop.com

Password

admin123

Role

admin

The administrator account is created by running backend/seed.py.

Customer

Create a customer using the Register page. A suggested testing account is:

Field

Value

Email/User ID

customer@test.com

Password

customer123

Role

customer

The customer credentials work only after registering this account in the application.

These credentials are for local development and demonstration only. Change them before deploying publicly.

Project Structure

ecommerce-app/
├── backend/
│   ├── app.py
│   ├── config.py
│   ├── seed.py
│   ├── requirements.txt
│   └── uploads/
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── AdminRoute.jsx
    │   │   ├── Navbar.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   └── CartContext.jsx
    │   ├── pages/
    │   │   ├── admin/
    │   │   │   ├── AdminOrders.jsx
    │   │   │   ├── AdminProducts.jsx
    │   │   │   └── ProductForm.jsx
    │   │   ├── Cart.jsx
    │   │   ├── Checkout.jsx
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── Orders.jsx
    │   │   ├── ProductDetail.jsx
    │   │   └── Register.jsx
    │   ├── api.js
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    └── package.json

Local Setup

1. Prerequisites

Install:

Python 3

Node.js and npm

MySQL Server and MySQL Workbench

VS Code

2. Create the database

Open MySQL Workbench and run:

CREATE DATABASE IF NOT EXISTS ecommerce;
USE ecommerce;

Make sure the required tables are created using the project database script or your existing ShopZone schema.

3. Configure MySQL

Open backend/config.py and update your local MySQL details:

import mysql.connector


def get_db():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="YOUR_MYSQL_PASSWORD",
        database="ecommerce"
    )

Do not publish your real database password on GitHub. For production, load it from environment variables.

4. Run the backend

cd backend
python -m venv venv
.\venv\Scripts\activate
pip install Flask flask-cors flask-bcrypt mysql-connector-python Werkzeug
python seed.py
python app.py

Backend URL:

http://localhost:5000

Health check:

http://localhost:5000/api/health

5. Run the frontend

Open a second terminal:

cd frontend
npm install
npm run dev

Frontend URL:

http://localhost:5173

Important API Endpoints

Method

Endpoint

Purpose

Access

POST

/api/register

Register a customer

Public

POST

/api/login

Log in

Public

GET

/api/logout

Log out

Logged-in user

GET

/api/me

Get current user

Logged-in user

GET

/api/categories

Get categories

Public

GET

/api/products

Search/filter products

Public

GET

/api/products/:id

Get one product

Public

POST

/api/products

Add a product

Admin

PUT

/api/products/:id

Update a product

Admin

DELETE

/api/products/:id

Delete a product

Admin

POST

/api/upload/product-image

Upload product image

Admin

POST

/api/orders

Place an order

Customer

GET

/api/orders/my

Get customer orders

Customer

GET

/api/orders

Get every order

Admin

PUT

/api/orders/:id/status

Update order status

Admin

Product Image Upload Flow

Admin selects image
        ↓
React sends multipart FormData
        ↓
Flask validates and saves it in backend/uploads
        ↓
Flask returns a public image URL
        ↓
React sends product information with image_url
        ↓
MySQL stores the URL in products.image_url

Mentor Write-Up

1. What is React Context API, and why is it better than prop drilling for the cart?

React Context API allows shared data and functions to be made available to many components without manually passing them through every intermediate component.

Without Context API, the cart state would need to be passed from App to Navbar, Home, ProductDetail, Cart and Checkout through props. Components that do not use the cart might still have to forward those props. This is called prop drilling.

ShopZone keeps the cart inside CartContext. The provider exposes the cart and its actions:

<CartContext.Provider
  value={{
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
  }}
>
  {children}
</CartContext.Provider>

For example, Home.jsx directly gets addToCart:

const { addToCart } = useCart();

addToCart(product, 1);

Navbar.jsx independently gets cartCount:

const { cartCount } = useCart();

Therefore, Home does not have to pass the cart through App and Navbar. All components receive the same current cart state directly from the provider.

2. Why does order_items store unit_price instead of reading the current product price when displaying an order?

unit_price stores the product price at the exact time the customer placed the order. Product prices can change later, but an old invoice or order history must retain its original amount.

Example:

Customer orders a mouse for ₹799
Later the administrator changes its price to ₹999
The old order must still display ₹799

During checkout, the backend reads the trusted product price from MySQL and saves it in the validated item:

validated_items.append({
    "product_id": product["id"],
    "product_name": product["name"],
    "quantity": quantity,
    "unit_price": product["price"]
})

It then inserts this historical price into order_items:

cursor.execute(
    """
    INSERT INTO order_items
    (order_id, product_id, quantity, unit_price)
    VALUES (%s, %s, %s, %s)
    """,
    (
        order_id,
        item["product_id"],
        item["quantity"],
        item["unit_price"]
    )
)

This protects order history from later product-price changes and makes totals reliable.

3. What happens if a customer orders 10 units when only 3 are in stock?

The backend rejects the complete order with HTTP status 400. It returns an insufficient-stock message, does not create the order, and does not reduce any stock.

Exact validation from app.py:

# Check stock
if product["stock"] < quantity:

    return jsonify({
        "success": False,
        "message":
            f"Insufficient stock for {product['name']}. "
            f"Available stock: {product['stock']}"
    }), 400

For 10 requested units and 3 available units, the condition is:

3 < 10 → True

The response will be similar to:

{
  "success": false,
  "message": "Insufficient stock for Wireless Mouse. Available stock: 3"
}

All products are validated before the order is inserted. Only after every item passes validation does the backend create the order and reduce stock.

4. What is the difference between ProtectedRoute and AdminRoute?

ProtectedRoute allows any authenticated user. It is used for customer pages such as Checkout and My Orders.

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;

AdminRoute first checks login and then checks whether the authenticated user has the admin role. A logged-in customer is redirected to the Home page.

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default AdminRoute;

Route component

Login required

Admin role required

Example pages

ProtectedRoute

Yes

No

Checkout, My Orders

AdminRoute

Yes

Yes

Admin Products, Product Form, Admin Orders

Frontend route protection improves the user experience, but the Flask backend also checks the session and administrator role before performing protected database operations.

Security Notes

Passwords are hashed using Flask-Bcrypt.

SQL queries use parameterized placeholders to prevent SQL injection.

Flask sessions track authenticated users.

Customer and administrator access are separated.

Product-image extensions and sizes are validated.

Product price and stock are checked using trusted database values during checkout.

Database passwords and Flask secret keys should be loaded from environment variables before production deployment.

Future Improvements

Payment gateway integration

Cloud product-image storage

Email order confirmations

Product reviews and ratings

Wishlist support

Pagination

Environment-based configuration

Automated backend and frontend tests