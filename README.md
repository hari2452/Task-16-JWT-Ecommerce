# ShopZone — Full-Stack E-Commerce Platform
## Task 16 — JWT Authentication Upgrade

ShopZone is a full-stack e-commerce application built with React, Flask, and MySQL.

Customers can register, log in, browse products, search and filter products, maintain a shopping cart, place orders, and track order status.

Administrators can manage products, upload product images, monitor stock, view customer orders, and update delivery status.

In Task 16, the original Flask session authentication was upgraded to JWT authentication using access tokens and refresh tokens.

---

# Technologies Used

## Frontend

- React with Vite
- React Router
- React Context API
- Axios
- CSS3
- Responsive Design
- Browser localStorage
- JWT Authentication

## Backend

- Python
- Flask
- Flask-CORS
- Flask-Bcrypt
- Flask-JWT-Extended
- MySQL Connector

## Database

MySQL

Main tables:

- users
- categories
- products
- orders
- order_items
- revoked_tokens

---

# Task 16 — JWT Authentication

The application now uses JWT authentication instead of Flask session authentication.

Two JWT tokens are generated during login:

### Access Token

The access token is used to access protected API routes.

Example:

```text
Authorization: Bearer ACCESS_TOKEN
```

The access token expires after:

```text
15 minutes
```

### Refresh Token

The refresh token is used to generate a new access token when the current access token expires.

The refresh token expires after:

```text
7 days
```

---

# JWT Authentication Flow

```text
User Login
    ↓
Flask verifies email and password
    ↓
Access Token + Refresh Token generated
    ↓
React stores both tokens in localStorage
    ↓
Axios adds Access Token to protected requests
    ↓
Flask verifies JWT
    ↓
Protected API response returned
```

---

# Login Flow

The user enters:

```text
Email
Password
```

React sends:

```text
POST /api/login
```

If the credentials are correct, Flask returns:

```json
{
  "access_token": "ACCESS_TOKEN",
  "refresh_token": "REFRESH_TOKEN",
  "user": {
    "id": 1,
    "name": "User",
    "email": "user@example.com",
    "role": "customer"
  }
}
```

React stores the tokens:

```javascript
localStorage.setItem(
  "access_token",
  access_token
);

localStorage.setItem(
  "refresh_token",
  refresh_token
);
```

---

# Axios Request Interceptor

Axios automatically attaches the access token to protected requests.

Example:

```javascript
api.interceptors.request.use(
  (config) => {

    const accessToken =
      localStorage.getItem(
        "access_token"
      );

    if (accessToken) {

      config.headers.Authorization =
        `Bearer ${accessToken}`;

    }

    return config;
  }
);
```

The backend receives:

```text
Authorization: Bearer ACCESS_TOKEN
```

This means individual React components do not need to manually attach the JWT for every protected request.

---

# Automatic Token Refresh

The access token has a short expiry time.

When it expires:

```text
Protected API Request
        ↓
Access Token Expired
        ↓
Backend returns 401
        ↓
Axios Response Interceptor
        ↓
POST /api/refresh
        ↓
Refresh Token sent
        ↓
New Access Token generated
        ↓
New Access Token saved
        ↓
Original request retried
        ↓
Request succeeds
```

The user does not need to log in again every time the short-lived access token expires.

---

# Refresh Endpoint

Endpoint:

```text
POST /api/refresh
```

The refresh token is sent as:

```text
Authorization: Bearer REFRESH_TOKEN
```

The backend validates the refresh token and generates a new access token.

---

# Restore Login After Browser Refresh

When React starts, `AuthContext` checks whether JWT tokens are available.

It then calls:

```text
GET /api/me
```

If the access token is valid, the backend returns the authenticated user.

If the access token has expired, the Axios interceptor can use the refresh token to obtain a new access token.

Therefore, refreshing the browser does not immediately log the user out while valid authentication tokens remain available.

---

# JWT Token Blacklisting

JWTs are normally stateless.

Simply removing a token from localStorage does not invalidate a copied token before its expiry.

To improve logout security, ShopZone uses a token blacklist.

The database contains:

```text
revoked_tokens
```

The table stores information such as:

```text
id
jti
token_type
user_id
revoked_at
```

Every JWT contains a unique identifier called:

```text
jti
```

During logout, ShopZone revokes both the access token and refresh token.

---

# Secure Logout Flow

```text
User clicks Logout
        ↓
Access Token sent to /api/logout
        ↓
Access JTI stored in revoked_tokens
        ↓
Refresh Token sent to /api/logout/refresh
        ↓
Refresh JTI stored in revoked_tokens
        ↓
Access Token removed from localStorage
        ↓
Refresh Token removed from localStorage
        ↓
React user state cleared
        ↓
User redirected to Login
```

After logout:

```text
Old Access Token
      ↓
Blacklist check
      ↓
401 Unauthorized
```

And:

```text
Old Refresh Token
      ↓
Blacklist check
      ↓
401 Unauthorized
```

Therefore, the revoked refresh token cannot be used to generate another access token.

---

# JWT Blacklist Check

Before accepting a protected JWT, Flask checks its JTI against the `revoked_tokens` table.

Conceptually:

```text
Incoming JWT
    ↓
Read JTI
    ↓
Search revoked_tokens
    ↓
JTI exists?
   /      \
 YES       NO
  ↓         ↓
401       Continue
```

---

# JWT Expiry Countdown

ShopZone also displays the remaining lifetime of the current access token.

Example:

```text
Session
14:59
```

The timer decreases every second:

```text
14:59
14:58
14:57
14:56
...
```

The countdown reads the JWT `exp` claim.

JWT expiration is stored as a Unix timestamp.

The frontend calculates:

```text
JWT Expiration Time
        -
Current Time
        ↓
Remaining Session Time
```

When Axios automatically obtains a new access token, the countdown reads the new token and updates to its new expiry time.

---

# Authentication Context

`AuthContext.jsx` manages:

- Logged-in user
- Login
- Logout
- Authentication restoration
- Access token storage
- Refresh token storage

This makes authentication state available throughout the React application.

---

# Role-Based Access

ShopZone supports:

```text
customer
admin
```

JWT claims contain user information required by the backend for authorization.

Administrator endpoints verify that the authenticated user has the `admin` role.

Frontend route protection is also used to improve navigation and user experience.

---

# ProtectedRoute

`ProtectedRoute` allows authenticated users to access customer-protected pages.

Example:

```jsx
import {
  Navigate
} from "react-router-dom";

import {
  useAuth
} from "../context/AuthContext";

function ProtectedRoute({
  children
}) {

  const {
    user,
    loading
  } = useAuth();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {

    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}

export default ProtectedRoute;
```

Example protected pages:

- Checkout
- My Orders

---

# AdminRoute

`AdminRoute` requires:

1. User must be logged in.
2. User must have the `admin` role.

```jsx
import {
  Navigate
} from "react-router-dom";

import {
  useAuth
} from "../context/AuthContext";

function AdminRoute({
  children
}) {

  const {
    user,
    loading
  } = useAuth();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {

    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (user.role !== "admin") {

    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
}

export default AdminRoute;
```

Example admin pages:

- Admin Products
- Add Product
- Edit Product
- Admin Orders

Frontend route protection improves the user experience, while the Flask backend performs the actual JWT and role validation for protected API operations.

---

# Customer Features

- Customer registration
- JWT login
- Secure logout
- Access and refresh tokens
- Automatic token refresh
- Persistent authentication after page refresh
- JWT expiry countdown
- Browse products
- Product images
- Search products
- Category filtering
- Price sorting
- Product detail page
- Quantity selection
- Add to cart
- Update cart quantity
- Remove cart items
- Cart persistence
- Protected checkout
- Place orders
- View order history
- View order status
- Responsive interface

---

# Administrator Features

- JWT-protected administrator access
- Role-based authorization
- View all products
- Product image thumbnails
- Add products
- Edit products
- Delete products
- Upload product images
- Product image preview
- Stock management
- In Stock badge
- Low Stock badge
- Out of Stock badge
- View customer orders
- View delivery information
- Filter orders by status
- Update order status
- Responsive admin interface

---

# Product Image Upload

Supported image types:

```text
PNG
JPG
JPEG
WEBP
```

Maximum image size:

```text
5 MB
```

Image upload flow:

```text
Admin selects image
        ↓
React creates FormData
        ↓
multipart/form-data request
        ↓
Flask validates image
        ↓
Unique filename generated
        ↓
Image saved in backend/uploads
        ↓
Public image URL returned
        ↓
Product information saved
        ↓
image_url stored in MySQL
```

---

# Cart Management

Cart state is managed globally using React Context API.

`CartContext` provides:

```text
cartItems
addToCart
removeFromCart
updateQuantity
clearCart
cartCount
```

Cart data is also stored in browser localStorage so the cart remains available after refreshing the page.

---

# Why Use React Context API?

React Context API allows shared data to be available to multiple components without passing props through every intermediate component.

Without Context API:

```text
App
 ↓
Home
 ↓
Product
 ↓
Cart
```

Data may need to be passed repeatedly using props.

This is called:

```text
Prop Drilling
```

With Context API:

```text
CartContext
   ↓
 ┌─┼────────────┐
 ↓ ↓            ↓
Home Navbar    Cart
```

Each component can directly access the current cart state.

---

# Why Does order_items Store unit_price?

The `unit_price` stores the product price at the exact time the order was placed.

Example:

```text
Customer purchases product = ₹799

Later admin changes price = ₹999

Old order should remain = ₹799
```

Therefore, the historical price is stored in:

```text
order_items.unit_price
```

instead of using the product's current price.

---

# Stock Validation

The backend validates stock before creating an order.

Example:

```text
Available stock = 3

Customer requests = 10
```

Backend checks:

```python
if product["stock"] < quantity:

    return jsonify({
        "success": False,
        "message":
            f"Insufficient stock for "
            f"{product['name']}. "
            f"Available stock: "
            f"{product['stock']}"
    }), 400
```

Because:

```text
3 < 10 = True
```

the order is rejected.

The order is created only after all requested products pass validation.

---

# Important API Endpoints

## Public

```text
POST  /api/register
POST  /api/login

GET   /api/categories
GET   /api/products
GET   /api/products/:id
```

## JWT Authentication

```text
GET   /api/me
POST  /api/refresh
POST  /api/logout
POST  /api/logout/refresh
```

## Customer Protected

```text
POST  /api/orders
GET   /api/orders/my
```

## Administrator Protected

```text
POST    /api/products
PUT     /api/products/:id
DELETE  /api/products/:id

POST    /api/upload/product-image

GET     /api/orders
PUT     /api/orders/:id/status
```

---

# Project Structure

```text
ecommerce-app/
│
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
    │   │   ├── ProtectedRoute.jsx
    │   │   └── TokenExpiryCountdown.jsx
    │   │
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   └── CartContext.jsx
    │   │
    │   ├── pages/
    │   │   ├── admin/
    │   │   │   ├── AdminOrders.jsx
    │   │   │   ├── AdminProducts.jsx
    │   │   │   └── ProductForm.jsx
    │   │   │
    │   │   ├── Cart.jsx
    │   │   ├── Checkout.jsx
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── Orders.jsx
    │   │   ├── ProductDetail.jsx
    │   │   └── Register.jsx
    │   │
    │   ├── api.js
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    │
    └── package.json
```

---

# Local Setup

## 1. Requirements

Install:

- Python 3
- Node.js
- npm
- MySQL Server
- MySQL Workbench
- VS Code

---

## 2. Create Database

```sql
CREATE DATABASE IF NOT EXISTS ecommerce;

USE ecommerce;
```

Use the existing ShopZone schema to create the required tables.

For JWT logout blacklisting, the project also requires the `revoked_tokens` table.

Example:

```sql
CREATE TABLE revoked_tokens (

    id INT AUTO_INCREMENT PRIMARY KEY,

    jti VARCHAR(255)
        NOT NULL
        UNIQUE,

    token_type VARCHAR(20)
        NOT NULL,

    user_id INT
        NOT NULL,

    revoked_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_revoked_jti (jti)
);
```

---

# Run Backend

Open terminal:

```powershell
cd backend
```

Create virtual environment:

```powershell
python -m venv venv
```

Activate:

```powershell
.\venv\Scripts\Activate.ps1
```

Install dependencies:

```powershell
pip install Flask flask-cors flask-bcrypt flask-jwt-extended mysql-connector-python Werkzeug
```

Run:

```powershell
python app.py
```

Backend:

```text
http://localhost:5000
```

---

# Run Frontend

Open another terminal:

```powershell
cd frontend
```

Install packages:

```powershell
npm install
```

Start Vite:

```powershell
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# JWT Testing

## Test 1 — Login

```text
POST /api/login
```

Expected:

```text
200 OK
access_token
refresh_token
user
```

---

## Test 2 — Protected Route Without Token

```text
GET /api/me
```

without Authorization header.

Expected:

```text
401 Unauthorized
```

---

## Test 3 — Protected Route With Access Token

```text
GET /api/me

Authorization:
Bearer ACCESS_TOKEN
```

Expected:

```text
200 OK
```

---

## Test 4 — Refresh Access Token

```text
POST /api/refresh

Authorization:
Bearer REFRESH_TOKEN
```

Expected:

```text
200 OK

New access_token
```

---

## Test 5 — Page Refresh Persistence

1. Login.
2. Refresh the browser using F5.
3. User remains authenticated.
4. `/api/me` restores the current user.

---

## Test 6 — Automatic Refresh

For testing, temporarily reduce access-token expiry.

Wait until the access token expires.

Make a protected request.

Expected flow:

```text
Protected request
      ↓
401
      ↓
Axios interceptor
      ↓
/api/refresh
      ↓
200
      ↓
New access token
      ↓
Original request retried
      ↓
200
```

Restore the normal access-token expiry after testing.

---

## Test 7 — Token Blacklist

Login and copy the access and refresh tokens.

Logout.

Check MySQL:

```sql
SELECT
    id,
    token_type,
    user_id,
    revoked_at
FROM revoked_tokens
ORDER BY id DESC;
```

The logout should create entries for:

```text
access
refresh
```

Using either revoked token again should fail authentication.

---

# Task 16 Mentor Write-Up

## 1. What is the difference between an access token and a refresh token?

An access token is a short-lived JWT used to access protected API endpoints.

Example:

```text
GET /api/me
Authorization: Bearer ACCESS_TOKEN
```

In ShopZone, the access token expires after 15 minutes.

A refresh token lasts longer and is used only to request a new access token.

Example:

```text
POST /api/refresh
Authorization: Bearer REFRESH_TOKEN
```

ShopZone uses a 7-day refresh-token lifetime.

Using a short-lived access token limits how long that token can be used if it is exposed.

---

## 2. How does the Axios interceptor work?

ShopZone uses two Axios interceptors.

### Request Interceptor

Before a protected request is sent, Axios reads:

```text
access_token
```

from localStorage.

It automatically adds:

```text
Authorization: Bearer ACCESS_TOKEN
```

to the request.

### Response Interceptor

If the backend returns:

```text
401 Unauthorized
```

because the access token has expired, the interceptor uses the refresh token.

It calls:

```text
POST /api/refresh
```

If successful:

1. A new access token is received.
2. The new token replaces the old token in localStorage.
3. The original request is retried.

This allows the user to continue using the application without manually logging in again after every access-token expiry.

---

## 3. What happens when the access token expires?

```text
Access Token Expires
        ↓
Protected Request
        ↓
Backend returns 401
        ↓
Axios catches 401
        ↓
Refresh Token sent
        ↓
Flask validates Refresh Token
        ↓
New Access Token generated
        ↓
React saves New Access Token
        ↓
Original request retried
        ↓
Request succeeds
```

The JWT countdown also detects the newly stored access token and updates to the new expiry time.

---

## 4. JWT vs Flask Session Authentication

### Previous Flask Session Approach

The earlier ShopZone version used Flask sessions to track authenticated users.

The browser sent a session cookie with requests, and Flask used the session to identify the current user.

### Current JWT Approach

Task 16 uses access and refresh JWTs.

The frontend sends:

```text
Authorization: Bearer TOKEN
```

with protected API requests.

JWT authentication fits an API-based React frontend because authentication information can be sent explicitly in the Authorization header.

JWT also introduces additional responsibilities such as:

- Secure token storage
- Token expiration
- Refresh-token handling
- Logout revocation
- Protection against token theft

Therefore, JWT is not automatically more secure than session authentication. Its security depends on the implementation.

---

# Security Features

ShopZone currently includes:

- Password hashing using Flask-Bcrypt
- JWT access tokens
- JWT refresh tokens
- Short-lived access tokens
- Protected Flask endpoints
- Role-based administrator authorization
- Automatic access-token refresh
- Access-token blacklisting
- Refresh-token blacklisting
- JTI-based token revocation
- Parameterized SQL queries
- Product stock validation
- Trusted server-side product pricing
- Image extension validation
- Image-size validation
- Frontend route protection

---

# Security Notes

JWT tokens are currently stored in browser localStorage for this learning project.

This is convenient for demonstrating JWT authentication, but localStorage tokens can be exposed if an application has a successful Cross-Site Scripting (XSS) attack.

For a production application, token storage and authentication architecture should be chosen based on the application's security requirements. Secure HttpOnly cookies are another common approach.

Secrets and database passwords should not be committed to a public GitHub repository.

---

# UI Design

ShopZone includes a responsive shopping-style interface with:

- Peach and cream visual theme
- Responsive navigation
- Product cards
- Search controls
- Category filtering
- Cart interface
- Checkout interface
- Customer order history
- Admin product management
- Admin order management
- Loading states
- Hover effects
- Responsive mobile layouts
- JWT session countdown

---

# Hardest Part

The most challenging part of Task 16 was connecting JWT authentication across the React frontend and Flask backend.

The application needed to correctly handle:

```text
Login
↓
Token storage
↓
Authorization header
↓
Protected backend route
↓
Access-token expiry
↓
Automatic refresh
↓
Original request retry
↓
Logout
↓
Token revocation
```

A particularly important part was ensuring that the access token and refresh token were used for the correct endpoints.

For example:

```text
/api/me
→ Access Token

/api/refresh
→ Refresh Token

/api/logout
→ Access Token

/api/logout/refresh
→ Refresh Token
```

The issue was solved by testing each API separately, checking Authorization headers in the browser Network panel and Postman, and verifying revoked JWT JTIs in MySQL.

---

# What I Learned

Through this project I learned:

- How JWT authentication works
- Difference between access and refresh tokens
- How to protect Flask API routes
- How to use JWT claims
- How to implement role-based authorization
- How Axios interceptors work
- How to automatically refresh an expired access token
- How to retry an API request
- How to restore authentication after browser refresh
- How JWT logout differs from session logout
- How JTI token blacklisting works
- How to revoke access and refresh tokens
- How to decode JWT expiry information
- How to display a live token-expiry countdown
- How React and Flask authentication work together

---

# Final Result

The completed ShopZone project demonstrates a full React + Flask + MySQL e-commerce workflow with JWT authentication.

The application now supports:

```text
Registration
      ↓
JWT Login
      ↓
Access + Refresh Tokens
      ↓
Protected Routes
      ↓
Product Browsing
      ↓
Cart
      ↓
Checkout
      ↓
Order Placement
      ↓
Order History

Admin Login
      ↓
Role Verification
      ↓
Product Management
      ↓
Image Upload
      ↓
Stock Management
      ↓
Order Management
```

Authentication additionally supports:

```text
JWT Login
   ↓
Automatic Authorization Header
   ↓
Access Token Expiry
   ↓
Automatic Refresh
   ↓
Session Countdown
   ↓
Secure Logout
   ↓
Access + Refresh Token Blacklisting
```

---

# Author

**Hariharan B**

Full-Stack E-Commerce Project  
React + Flask + MySQL  
Task 16 — JWT Authentication Upgrade
