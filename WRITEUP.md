# Task 16 – JWT Authentication Write-up

## 1. What is the difference between an access token and a refresh token? Why are they different expiry lengths?

An **access token** is a short-lived JWT used to access protected backend API routes.

After the user successfully logs in, the Flask backend generates an access token and a refresh token.

In my ShopZone project, the access token is valid for:

```text
15 minutes
```

The access token is sent with protected API requests using the Authorization header.

Example:

```text
GET /api/me

Authorization: Bearer ACCESS_TOKEN
```

Other protected routes such as My Orders, Checkout, Admin Products, and Admin Orders also require a valid access token.

A **refresh token** is a longer-lived JWT. It is not normally used to access regular protected APIs. Its main purpose is to generate a new access token when the current access token expires.

In my project, the refresh token is valid for:

```text
7 days
```

It is sent to:

```text
POST /api/refresh
```

using:

```text
Authorization: Bearer REFRESH_TOKEN
```

The backend verifies the refresh token and generates a new access token.

### Why do they have different expiry lengths?

The access token has a short expiry because it is sent frequently to protected APIs.

If an access token is exposed, the short expiry limits how long it can normally be used.

The refresh token has a longer expiry because it allows the user to remain logged in without entering their email and password every 15 minutes.

The basic idea is:

```text
Access Token
→ Short lifetime
→ Used for protected API requests
→ 15 minutes


Refresh Token
→ Longer lifetime
→ Used to generate a new access token
→ 7 days
```

In my project, both access and refresh tokens are also revoked during logout.

Their unique JWT identifiers (`jti`) are stored in the `revoked_tokens` MySQL table.

This prevents a revoked token from being accepted again after logout.

---

## 2. What is an Axios interceptor and why is it better than manually adding the token to every API call?

An **Axios interceptor** is a function that automatically runs before an HTTP request is sent or after an HTTP response is received.

In my ShopZone project, I use two Axios interceptors:

1. Request interceptor
2. Response interceptor

### Request Interceptor

The request interceptor runs before an API request is sent.

It reads the access token from localStorage:

```javascript
const accessToken =
  localStorage.getItem("access_token");
```

If an access token exists, the interceptor automatically adds it to the Authorization header:

```javascript
config.headers.Authorization =
  `Bearer ${accessToken}`;
```

Therefore, my React components can simply make a request like:

```javascript
api.get("/api/me");
```

Instead of manually writing:

```javascript
api.get("/api/me", {
  headers: {
    Authorization: `Bearer ${token}`
  }
});
```

for every protected API call.

### Why is this better?

Without an interceptor, I would have to manually add the Authorization header in many components.

For example:

```text
Orders
Checkout
Admin Products
Admin Orders
Product Form
User Authentication
```

This would create repeated code and make token management harder.

With the Axios interceptor, authentication logic is handled in one central place:

```text
React Component
      ↓
Axios Request
      ↓
Request Interceptor
      ↓
Read access_token
      ↓
Add Authorization Header
      ↓
Flask API
```

This makes the code cleaner, easier to maintain, and less likely to miss the token on a protected API request.

### Response Interceptor

I also use a response interceptor.

Its job is to detect when an API request fails because the access token has expired.

If Flask returns:

```text
401 Unauthorized
```

the response interceptor attempts to use the refresh token to obtain a new access token.

---

## 3. What happens in the app when the access token expires mid-session?

The access token in my project expires after 15 minutes.

The user does not immediately need to log in again when this happens.

My Axios response interceptor automatically handles the expired access token.

### Exact sequence

First, the user performs an action that requires a protected API.

For example:

```text
My Orders
```

React sends the request:

```text
GET /api/orders/my
```

The Axios request interceptor automatically adds:

```text
Authorization: Bearer ACCESS_TOKEN
```

The complete sequence is:

```text
User makes protected request
        ↓
Axios request interceptor runs
        ↓
Access token added to Authorization header
        ↓
Request sent to Flask
        ↓
Flask checks access token
        ↓
Access token has expired
        ↓
Flask returns 401
        ↓
Axios response interceptor catches 401
        ↓
Interceptor checks _retry
        ↓
Refresh token read from localStorage
        ↓
POST /api/refresh
        ↓
Refresh token sent in Authorization header
        ↓
Flask validates refresh token
        ↓
Flask generates new access token
        ↓
React receives new access token
        ↓
New access token saved in localStorage
        ↓
Original request Authorization header updated
        ↓
Original failed request retried
        ↓
Flask accepts new access token
        ↓
Request returns 200 OK
```

### Preventing repeated retries

My interceptor uses `_retry` to make sure the same failed request is not continuously retried.

Example:

```javascript
if (
  error.response?.status === 401 &&
  !originalRequest._retry
) {
  originalRequest._retry = true;
}
```

This marks the request as already retried.

### Reading the refresh token

The interceptor gets the refresh token from localStorage:

```javascript
const refreshToken =
  localStorage.getItem("refresh_token");
```

It then sends the refresh token to:

```text
POST /api/refresh
```

using:

```text
Authorization: Bearer REFRESH_TOKEN
```

### Saving the new access token

If the refresh request succeeds, Flask returns a new access token.

The frontend saves it:

```javascript
localStorage.setItem(
  "access_token",
  newAccessToken
);
```

The interceptor then updates the failed request:

```javascript
originalRequest.headers.Authorization =
  `Bearer ${newAccessToken}`;
```

Finally, the original request is retried:

```javascript
return api(originalRequest);
```

Therefore, the user can continue using the application without manually logging in again every time the 15-minute access token expires.

### What if the refresh token is invalid or expired?

If the refresh token is invalid, expired, or revoked, the application cannot generate another access token.

In that case, the authentication tokens are removed and the user is redirected to the Login page.

---

## JWT Token Expiry Countdown

I also added a live access-token expiry countdown to the ShopZone navigation bar.

Example:

```text
Session
14:59
```

It updates every second:

```text
14:59
14:58
14:57
14:56
...
```

The component reads the `exp` claim from the access JWT.

It calculates:

```text
JWT Expiration Time
        -
Current Time
        ↓
Remaining Time
```

When the access token expires and Axios successfully gets a new access token using the refresh token, the countdown reads the new token from localStorage.

Therefore, the countdown automatically updates to the expiry time of the newly generated access token.

---

## 4. What is the difference between JWT authentication and Flask session authentication? Why is JWT better for a React single-page application?

My original ShopZone project used **Flask session authentication**.

In Task 16, I upgraded it to **JWT authentication**.

### Flask Session Authentication

With Flask session authentication, the application uses a session cookie to maintain authentication.

A simplified flow is:

```text
User Login
     ↓
Flask creates/updates session
     ↓
Browser receives session cookie
     ↓
Browser sends cookie with requests
     ↓
Flask reads session
     ↓
User identified
```

The frontend mainly depends on the browser sending the session cookie.

### JWT Authentication

With JWT authentication, the backend generates tokens after successful login.

My application receives:

```text
Access Token
Refresh Token
```

React stores these tokens in localStorage.

For protected API calls, Axios sends the access token using:

```text
Authorization: Bearer ACCESS_TOKEN
```

The flow is:

```text
User Login
     ↓
Flask verifies credentials
     ↓
Access Token + Refresh Token
     ↓
React stores tokens
     ↓
Axios reads access token
     ↓
Authorization: Bearer TOKEN
     ↓
Flask validates JWT
     ↓
Protected API accessed
```

### Why is JWT useful for my React SPA?

My frontend is a React single-page application and my backend is a separate Flask REST API.

JWT works well with this architecture because React can explicitly authenticate API requests using the Authorization header.

Axios can also centrally manage the JWT using interceptors.

For example:

```text
React
   ↓
Axios
   ↓
Authorization: Bearer JWT
   ↓
Flask REST API
```

JWT also makes it straightforward to implement:

- Access tokens
- Refresh tokens
- Automatic token refresh
- Authorization headers
- Role claims
- API authentication
- Token expiry handling
- Token revocation

However, JWT is **not automatically more secure than Flask sessions**.

JWT authentication requires proper handling of:

```text
Token storage
Token expiration
Refresh tokens
Logout
Token revocation
XSS protection
```

For my learning project, JWT is useful because it demonstrates how a separate React frontend can authenticate with a Flask REST API using access and refresh tokens.

---

# Additional Security Feature – JWT Blacklisting

JWTs are stateless, so simply deleting a JWT from localStorage does not necessarily prevent a copied token from being used before it expires.

To improve logout security, I implemented JWT token blacklisting.

My MySQL database contains a table:

```text
revoked_tokens
```

It stores:

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

When the user logs out, both the access token and refresh token are revoked.

The logout flow is:

```text
Click Logout
      ↓
Access Token sent to backend
      ↓
Access JTI stored in revoked_tokens
      ↓
Refresh Token sent to backend
      ↓
Refresh JTI stored in revoked_tokens
      ↓
Both tokens removed from localStorage
      ↓
React user state cleared
      ↓
Redirect to Login
```

After logout:

```text
Old Access Token
      ↓
Backend checks JTI
      ↓
Found in revoked_tokens
      ↓
401 Unauthorized
```

The same protection applies to the old refresh token:

```text
Old Refresh Token
      ↓
Backend checks JTI
      ↓
Found in revoked_tokens
      ↓
401 Unauthorized
```

This means a revoked refresh token cannot be used to generate another access token after logout.

---

# Complete Authentication Flow

The final Task 16 authentication flow in my ShopZone project is:

```text
REGISTER
   ↓
LOGIN
   ↓
Flask verifies bcrypt password
   ↓
Access Token + Refresh Token generated
   ↓
Tokens stored in localStorage
   ↓
AuthContext stores logged-in user
   ↓
Axios automatically attaches Access Token
   ↓
Protected Flask APIs
   ↓
Access Token expires
   ↓
401 response
   ↓
Axios Response Interceptor
   ↓
Refresh Token sent
   ↓
New Access Token generated
   ↓
Original request retried
   ↓
User continues normally
   ↓
LOGOUT
   ↓
Access Token revoked
   ↓
Refresh Token revoked
   ↓
JTIs stored in MySQL blacklist
   ↓
Tokens removed from localStorage
   ↓
User redirected to Login
```

---

# Short Explanation for Mentor

I upgraded my ShopZone project from Flask session authentication to JWT authentication.

After login, Flask generates a short-lived access token and a longer-lived refresh token. The access token is used for protected API requests, while the refresh token is used to generate a new access token when the current one expires.

I created an Axios request interceptor that automatically attaches the access token to protected API requests. I also created a response interceptor that catches a 401 response, sends the refresh token to `/api/refresh`, stores the new access token, and retries the original request.

I implemented persistent authentication using `AuthContext` and `/api/me`, so refreshing the browser does not immediately log out an authenticated user.

For logout security, I added a `revoked_tokens` table in MySQL. Both the access token and refresh token JTIs are stored in this blacklist during logout, so the old tokens cannot be reused.

I also added a live JWT expiry countdown in the navigation bar. It displays the remaining access-token lifetime and automatically updates when Axios obtains a new access token.

The main thing I learned from Task 16 was how the React frontend and Flask backend work together for JWT authentication, including token creation, Authorization headers, protected routes, automatic refresh, token expiry, role-based authorization, and secure token revocation.
