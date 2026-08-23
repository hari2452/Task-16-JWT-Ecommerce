from flask import Flask, jsonify, request, session, send_from_directory
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from config import get_db
from mysql.connector import Error

import os
import uuid

from werkzeug.utils import secure_filename


app = Flask(__name__)

app.secret_key = "ecommerce-secret-key"


CORS(
    app,
    supports_credentials=True,
    origins=["http://localhost:5173"]
)


bcrypt = Bcrypt(app)


# =========================================
# PRODUCT IMAGE UPLOAD CONFIGURATION
# =========================================

UPLOAD_FOLDER = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "uploads"
)

ALLOWED_EXTENSIONS = {
    "png",
    "jpg",
    "jpeg",
    "webp"
}

MAX_IMAGE_SIZE = 5 * 1024 * 1024

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = MAX_IMAGE_SIZE

os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)


def allowed_file(filename):
    """Return True only when the uploaded file has an allowed image extension."""
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
    )


# ------------------------------------------------
# HEALTH CHECK
# ------------------------------------------------

@app.route("/api/health", methods=["GET"])
def health():

    db = get_db()

    if db.is_connected():

        db.close()

        return jsonify({
            "success": True,
            "message": "Flask and MySQL connected successfully"
        })

    return jsonify({
        "success": False,
        "message": "Database connection failed"
    }), 500


# ------------------------------------------------
# REGISTER
# ------------------------------------------------

@app.route("/api/register", methods=["POST"])
def register():

    db = None
    cursor = None

    try:

        # Get JSON data from Postman / React
        data = request.get_json()

        name = data.get("name")
        email = data.get("email")
        password = data.get("password")


        # -----------------------------------------
        # 1. Validate required fields
        # -----------------------------------------

        if not name or not email or not password:

            return jsonify({
                "success": False,
                "message": "Name, email and password are required"
            }), 400


        # -----------------------------------------
        # 2. Connect to MySQL
        # -----------------------------------------

        db = get_db()

        cursor = db.cursor(dictionary=True)


        # -----------------------------------------
        # 3. Check whether email already exists
        # -----------------------------------------

        cursor.execute(
            "SELECT id FROM users WHERE email = %s",
            (email,)
        )

        existing_user = cursor.fetchone()


        if existing_user:

            return jsonify({
                "success": False,
                "message": "Email already registered"
            }), 409


        # -----------------------------------------
        # 4. Hash the password
        # -----------------------------------------

        hashed_password = bcrypt.generate_password_hash(
            password
        ).decode("utf-8")


        # -----------------------------------------
        # 5. Insert user into database
        # -----------------------------------------

        cursor.execute(
            """
            INSERT INTO users
            (name, email, password, role)
            VALUES (%s, %s, %s, %s)
            """,
            (
                name,
                email,
                hashed_password,
                "customer"
            )
        )


        # -----------------------------------------
        # 6. Save database changes
        # -----------------------------------------

        db.commit()


        # -----------------------------------------
        # 7. Return success response
        # -----------------------------------------

        return jsonify({
            "success": True,
            "message": "Registration successful"
        }), 201


    except Error as e:

        print("Register Error:", e)

        return jsonify({
            "success": False,
            "message": "Database error"
        }), 500


    finally:

        if cursor:
            cursor.close()

        if db:
            db.close()



# ------------------------------------------------
# LOGIN
# ------------------------------------------------

@app.route("/api/login", methods=["POST"])
def login():

    db = None
    cursor = None

    try:

        # Get JSON data from Postman / React
        data = request.get_json()

        email = data.get("email")
        password = data.get("password")


        # -----------------------------------------
        # 1. Validate fields
        # -----------------------------------------

        if not email or not password:

            return jsonify({
                "success": False,
                "message": "Email and password are required"
            }), 400


        # -----------------------------------------
        # 2. Connect to database
        # -----------------------------------------

        db = get_db()

        cursor = db.cursor(dictionary=True)


        # -----------------------------------------
        # 3. Find user using email
        # -----------------------------------------

        cursor.execute(
            """
            SELECT id, name, email, password, role
            FROM users
            WHERE email = %s
            """,
            (email,)
        )

        user = cursor.fetchone()


        # -----------------------------------------
        # 4. Check whether user exists
        # -----------------------------------------

        if not user:

            return jsonify({
                "success": False,
                "message": "Invalid email or password"
            }), 401


        # -----------------------------------------
        # 5. Check password
        # -----------------------------------------

        password_correct = bcrypt.check_password_hash(
            user["password"],
            password
        )

        if not password_correct:

            return jsonify({
                "success": False,
                "message": "Invalid email or password"
            }), 401


        # -----------------------------------------
        # 6. Create login session
        # -----------------------------------------

        session["user_id"] = user["id"]
        session["name"] = user["name"]
        session["email"] = user["email"]
        session["role"] = user["role"]


        # -----------------------------------------
        # 7. Return success response
        # -----------------------------------------

        return jsonify({
            "success": True,
            "message": "Login successful",
            "user": {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"],
                "role": user["role"]
            }
        }), 200


    except Error as e:

        print("Login Error:", e)

        return jsonify({
            "success": False,
            "message": "Database error"
        }), 500


    finally:

        if cursor:
            cursor.close()

        if db:
            db.close()
            
# ------------------------------------------------
# CURRENT LOGGED-IN USER
# ------------------------------------------------

@app.route("/api/me", methods=["GET"])
def get_current_user():

    # Check whether user is logged in
    if "user_id" not in session:

        return jsonify({
            "success": False,
            "message": "Not logged in"
        }), 401

    # Return logged-in user information
    return jsonify({
        "success": True,
        "user": {
            "id": session["user_id"],
            "name": session["name"],
            "email": session["email"],
            "role": session["role"]
        }
    }), 200            

# =========================================
# 5. LOGOUT API
# =========================================

@app.route("/api/logout", methods=["GET"])
def logout():

    session.clear()

    return jsonify({
        "success": True,
        "message": "Logout successful"
    }), 200


# =========================================
# 6. GET ALL CATEGORIES
# =========================================

@app.route("/api/categories", methods=["GET"])
def get_categories():

    db = None
    cursor = None

    try:

        # Connect to MySQL
        db = get_db()

        # Dictionary format result
        cursor = db.cursor(dictionary=True)

        # Get all categories
        cursor.execute("""
            SELECT id, name
            FROM categories
            ORDER BY name ASC
        """)

        categories = cursor.fetchall()

        return jsonify({
            "success": True,
            "data": categories
        }), 200

    except Error as e:

        print("Categories Error:", e)

        return jsonify({
            "success": False,
            "message": "Unable to fetch categories"
        }), 500

    finally:

        if cursor:
            cursor.close()

        if db:
            db.close()

# =========================================
# 7. GET ALL PRODUCTS + SEARCH + FILTER + SORT
# =========================================

@app.route("/api/products", methods=["GET"])
def get_products():

    db = None
    cursor = None

    try:

        db = get_db()

        cursor = db.cursor(dictionary=True)

        # Get values from URL query parameters
        search = request.args.get("search", "")
        category = request.args.get("category", "")
        sort = request.args.get("sort", "")

        # Basic query
        query = """
            SELECT
                p.id,
                p.name,
                p.description,
                p.price,
                p.stock,
                p.category_id,
                c.name AS category_name,
                p.image_url,
                p.created_at
            FROM products p
            LEFT JOIN categories c
                ON p.category_id = c.id
            WHERE 1=1
        """

        params = []

        # --------------------------------
        # SEARCH
        # --------------------------------
        if search:

            query += """
                AND (
                    p.name LIKE %s
                    OR p.description LIKE %s
                )
            """

            search_value = f"%{search}%"

            params.append(search_value)
            params.append(search_value)

        # --------------------------------
        # CATEGORY FILTER
        # --------------------------------
        if category:

            query += " AND p.category_id = %s"

            params.append(category)

        # --------------------------------
        # SORTING
        # --------------------------------
        if sort == "price_asc":

            query += " ORDER BY p.price ASC"

        elif sort == "price_desc":

            query += " ORDER BY p.price DESC"

        elif sort == "newest":

            query += " ORDER BY p.created_at DESC"

        else:

            query += " ORDER BY p.id DESC"

        # Execute final query
        cursor.execute(
            query,
            tuple(params)
        )

        products = cursor.fetchall()

        return jsonify({
            "success": True,
            "data": products
        }), 200

    except Error as e:

        print("Products Error:", e)

        return jsonify({
            "success": False,
            "message": "Unable to fetch products"
        }), 500

    finally:

        if cursor:
            cursor.close()

        if db:
            db.close()

# =========================================
# 8. GET SINGLE PRODUCT BY ID
# =========================================

@app.route("/api/products/<int:product_id>", methods=["GET"])
def get_product(product_id):

    db = None
    cursor = None

    try:

        db = get_db()

        cursor = db.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT
                p.id,
                p.name,
                p.description,
                p.price,
                p.stock,
                p.category_id,
                c.name AS category_name,
                p.image_url,
                p.created_at
            FROM products p
            LEFT JOIN categories c
                ON p.category_id = c.id
            WHERE p.id = %s
            """,
            (product_id,)
        )

        product = cursor.fetchone()

        if not product:

            return jsonify({
                "success": False,
                "message": "Product not found"
            }), 404

        return jsonify({
            "success": True,
            "data": product
        }), 200

    except Error as e:

        print("Product Detail Error:", e)

        return jsonify({
            "success": False,
            "message": "Unable to fetch product"
        }), 500

    finally:

        if cursor:
            cursor.close()

        if db:
            db.close() 
            
# =========================================
# 9. ADMIN - ADD PRODUCT
# =========================================

@app.route("/api/products", methods=["POST"])
def add_product():

    # -------------------------------
    # 1. Check login
    # -------------------------------
    if "user_id" not in session:
        return jsonify({
            "success": False,
            "message": "Login required"
        }), 401

    # -------------------------------
    # 2. Check admin role
    # -------------------------------
    if session.get("role") != "admin":
        return jsonify({
            "success": False,
            "message": "Admin access required"
        }), 403

    db = None
    cursor = None

    try:

        data = request.get_json()

        name = data.get("name")
        description = data.get("description")
        price = data.get("price")
        stock = data.get("stock")
        category_id = data.get("category_id")
        image_url = data.get("image_url")

        # -------------------------------
        # 3. Validate required fields
        # -------------------------------
        if not name or price is None or stock is None:
            return jsonify({
                "success": False,
                "message": "Name, price and stock are required"
            }), 400

        # Basic numeric validation
        if float(price) < 0:
            return jsonify({
                "success": False,
                "message": "Price cannot be negative"
            }), 400

        if int(stock) < 0:
            return jsonify({
                "success": False,
                "message": "Stock cannot be negative"
            }), 400

        # -------------------------------
        # 4. Connect to database
        # -------------------------------
        db = get_db()
        cursor = db.cursor()

        # -------------------------------
        # 5. Insert product
        # -------------------------------
        cursor.execute(
            """
            INSERT INTO products
            (
                name,
                description,
                price,
                stock,
                category_id,
                image_url
            )
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (
                name,
                description,
                price,
                stock,
                category_id,
                image_url
            )
        )

        db.commit()

        new_product_id = cursor.lastrowid

        return jsonify({
            "success": True,
            "message": "Product added successfully",
            "product_id": new_product_id
        }), 201

    except (Error, ValueError, TypeError) as e:

        print("Add Product Error:", e)

        return jsonify({
            "success": False,
            "message": "Unable to add product"
        }), 500

    finally:

        if cursor:
            cursor.close()

        if db:
            db.close()      
            
# =========================================
# 10. ADMIN - UPDATE PRODUCT
# =========================================

@app.route("/api/products/<int:product_id>", methods=["PUT"])
def update_product(product_id):

    # --------------------------------
    # 1. Check whether user logged in
    # --------------------------------
    if "user_id" not in session:

        return jsonify({
            "success": False,
            "message": "Login required"
        }), 401

    # --------------------------------
    # 2. Check admin role
    # --------------------------------
    if session.get("role") != "admin":

        return jsonify({
            "success": False,
            "message": "Admin access required"
        }), 403

    db = None
    cursor = None

    try:

        # --------------------------------
        # 3. Get JSON data
        # --------------------------------
        data = request.get_json()

        name = data.get("name")
        description = data.get("description")
        price = data.get("price")
        stock = data.get("stock")
        category_id = data.get("category_id")
        image_url = data.get("image_url")

        # --------------------------------
        # 4. Validate required fields
        # --------------------------------
        if not name or price is None or stock is None:

            return jsonify({
                "success": False,
                "message": "Name, price and stock are required"
            }), 400

        try:
            price_value = float(price)
            stock_value = int(stock)
        except (ValueError, TypeError):

            return jsonify({
                "success": False,
                "message": "Price and stock must be valid numbers"
            }), 400

        if price_value < 0:

            return jsonify({
                "success": False,
                "message": "Price cannot be negative"
            }), 400

        if stock_value < 0:

            return jsonify({
                "success": False,
                "message": "Stock cannot be negative"
            }), 400

        # --------------------------------
        # 5. Connect to MySQL
        # --------------------------------
        db = get_db()

        cursor = db.cursor(dictionary=True)

        # --------------------------------
        # 6. Check product exists
        # --------------------------------
        cursor.execute(
            "SELECT id FROM products WHERE id = %s",
            (product_id,)
        )

        existing_product = cursor.fetchone()

        if not existing_product:

            return jsonify({
                "success": False,
                "message": "Product not found"
            }), 404

        # --------------------------------
        # 7. Update product
        # --------------------------------
        cursor.execute(
            """
            UPDATE products

            SET
                name = %s,
                description = %s,
                price = %s,
                stock = %s,
                category_id = %s,
                image_url = %s

            WHERE id = %s
            """,
            (
                name,
                description,
                price_value,
                stock_value,
                category_id,
                image_url,
                product_id
            )
        )

        # --------------------------------
        # 8. Save changes
        # --------------------------------
        db.commit()

        return jsonify({
            "success": True,
            "message": "Product updated successfully"
        }), 200

    except Error as e:

        print("Update Product Error:", e)

        return jsonify({
            "success": False,
            "message": "Unable to update product"
        }), 500

    finally:

        if cursor:
            cursor.close()

        if db:
            db.close()   
            
# =========================================
# 11. ADMIN - DELETE PRODUCT
# =========================================

@app.route("/api/products/<int:product_id>", methods=["DELETE"])
def delete_product(product_id):

    # --------------------------------
    # 1. Check login
    # --------------------------------
    if "user_id" not in session:

        return jsonify({
            "success": False,
            "message": "Login required"
        }), 401


    # --------------------------------
    # 2. Check admin role
    # --------------------------------
    if session.get("role") != "admin":

        return jsonify({
            "success": False,
            "message": "Admin access required"
        }), 403


    db = None
    cursor = None

    try:

        # --------------------------------
        # 3. Connect to MySQL
        # --------------------------------
        db = get_db()

        cursor = db.cursor(dictionary=True)


        # --------------------------------
        # 4. Check product exists
        # --------------------------------
        cursor.execute(
            "SELECT id, name FROM products WHERE id = %s",
            (product_id,)
        )

        product = cursor.fetchone()


        if not product:

            return jsonify({
                "success": False,
                "message": "Product not found"
            }), 404


        # --------------------------------
        # 5. Delete product
        # --------------------------------
        cursor.execute(
            "DELETE FROM products WHERE id = %s",
            (product_id,)
        )


        # --------------------------------
        # 6. Save database change
        # --------------------------------
        db.commit()


        return jsonify({
            "success": True,
            "message": "Product deleted successfully"
        }), 200


    except Error as e:

        print("Delete Product Error:", e)

        return jsonify({
            "success": False,
            "message": "Unable to delete product"
        }), 500


    finally:

        if cursor:
            cursor.close()

        if db:
            db.close()    
            
# =========================================
# 12. CUSTOMER - PLACE ORDER
# =========================================

@app.route("/api/orders", methods=["POST"])
def place_order():

    # --------------------------------
    # 1. Check login
    # --------------------------------
    if "user_id" not in session:

        return jsonify({
            "success": False,
            "message": "Login required"
        }), 401

    db = None
    cursor = None

    try:

        # --------------------------------
        # 2. Read request data
        # --------------------------------
        data = request.get_json()

        items = data.get("items")
        address = data.get("address")


        # --------------------------------
        # 3. Basic validation
        # --------------------------------
        if not items or not isinstance(items, list):

            return jsonify({
                "success": False,
                "message": "Order items are required"
            }), 400

        if not address:

            return jsonify({
                "success": False,
                "message": "Delivery address is required"
            }), 400


        # --------------------------------
        # 4. Connect to database
        # --------------------------------
        db = get_db()

        cursor = db.cursor(dictionary=True)


        # --------------------------------
        # 5. Validate ALL products first
        # --------------------------------
        validated_items = []

        total_amount = 0


        for item in items:

            product_id = item.get("product_id")
            quantity = item.get("quantity")


            if not product_id or not quantity:

                return jsonify({
                    "success": False,
                    "message": "Product ID and quantity are required"
                }), 400


            try:
                quantity = int(quantity)

            except (ValueError, TypeError):

                return jsonify({
                    "success": False,
                    "message": "Quantity must be a valid number"
                }), 400


            if quantity <= 0:

                return jsonify({
                    "success": False,
                    "message": "Quantity must be greater than zero"
                }), 400


            # Get product from database
            cursor.execute(
                """
                SELECT id, name, price, stock
                FROM products
                WHERE id = %s
                """,
                (product_id,)
            )

            product = cursor.fetchone()


            # Product does not exist
            if not product:

                return jsonify({
                    "success": False,
                    "message": f"Product ID {product_id} not found"
                }), 404


            # Check stock
            if product["stock"] < quantity:

                return jsonify({
                    "success": False,
                    "message":
                        f"Insufficient stock for {product['name']}. "
                        f"Available stock: {product['stock']}"
                }), 400


            # Calculate subtotal
            subtotal = product["price"] * quantity

            total_amount += subtotal


            # Save validated data temporarily
            validated_items.append({
                "product_id": product["id"],
                "product_name": product["name"],
                "quantity": quantity,
                "unit_price": product["price"]
            })


        # --------------------------------
        # IMPORTANT:
        # All items are now validated.
        # Only NOW do we create order and
        # reduce stock.
        # --------------------------------


        # --------------------------------
        # 6. Create order
        # --------------------------------
        cursor.execute(
            """
            INSERT INTO orders
            (
                user_id,
                total_amount,
                address
            )
            VALUES (%s, %s, %s)
            """,
            (
                session["user_id"],
                total_amount,
                address
            )
        )

        order_id = cursor.lastrowid


        # --------------------------------
        # 7. Add order items
        # --------------------------------
        for item in validated_items:

            cursor.execute(
                """
                INSERT INTO order_items
                (
                    order_id,
                    product_id,
                    quantity,
                    unit_price
                )
                VALUES (%s, %s, %s, %s)
                """,
                (
                    order_id,
                    item["product_id"],
                    item["quantity"],
                    item["unit_price"]
                )
            )


            # --------------------------------
            # 8. Reduce product stock
            # --------------------------------
            cursor.execute(
                """
                UPDATE products
                SET stock = stock - %s
                WHERE id = %s
                """,
                (
                    item["quantity"],
                    item["product_id"]
                )
            )


        # --------------------------------
        # 9. Save everything
        # --------------------------------
        db.commit()


        return jsonify({
            "success": True,
            "message": "Order placed successfully",
            "order_id": order_id,
            "total_amount": float(total_amount)
        }), 201


    except Error as e:

        if db:
            db.rollback()

        print("Place Order Error:", e)

        return jsonify({
            "success": False,
            "message": "Unable to place order"
        }), 500


    finally:

        if cursor:
            cursor.close()

        if db:
            db.close()      
            
# =========================================
# 13. CUSTOMER - MY ORDERS
# =========================================

@app.route("/api/orders/my", methods=["GET"])
def my_orders():

    # --------------------------------
    # 1. Check login
    # --------------------------------
    if "user_id" not in session:

        return jsonify({
            "success": False,
            "message": "Login required"
        }), 401

    db = None
    cursor = None

    try:

        # --------------------------------
        # 2. Connect to database
        # --------------------------------
        db = get_db()

        cursor = db.cursor(dictionary=True)

        # --------------------------------
        # 3. Get orders for logged-in user
        # --------------------------------
        cursor.execute(
            """
            SELECT
                id,
                total_amount,
                status,
                address,
                ordered_at
            FROM orders
            WHERE user_id = %s
            ORDER BY ordered_at DESC
            """,
            (session["user_id"],)
        )

        orders = cursor.fetchall()

        # --------------------------------
        # 4. Get items for every order
        # --------------------------------
        for order in orders:

            cursor.execute(
                """
                SELECT
                    oi.id,
                    oi.product_id,
                    p.name AS product_name,
                    oi.quantity,
                    oi.unit_price
                FROM order_items oi
                LEFT JOIN products p
                    ON oi.product_id = p.id
                WHERE oi.order_id = %s
                """,
                (order["id"],)
            )

            items = cursor.fetchall()

            # Attach items to this order
            order["items"] = items

        return jsonify({
            "success": True,
            "data": orders
        }), 200

    except Error as e:

        print("My Orders Error:", e)

        return jsonify({
            "success": False,
            "message": "Unable to fetch orders"
        }), 500

    finally:

        if cursor:
            cursor.close()

        if db:
            db.close()                                                    

# =========================================
# 14. ADMIN - GET ALL ORDERS
# =========================================

@app.route("/api/orders", methods=["GET"])
def get_all_orders():

    # --------------------------------
    # 1. Check login
    # --------------------------------
    if "user_id" not in session:

        return jsonify({
            "success": False,
            "message": "Login required"
        }), 401

    # --------------------------------
    # 2. Check admin role
    # --------------------------------
    if session.get("role") != "admin":

        return jsonify({
            "success": False,
            "message": "Admin access required"
        }), 403

    db = None
    cursor = None

    try:

        # --------------------------------
        # 3. Connect to database
        # --------------------------------
        db = get_db()

        cursor = db.cursor(dictionary=True)

        # --------------------------------
        # 4. Get all orders with customer name
        # --------------------------------
        cursor.execute(
            """
            SELECT
                o.id,
                o.user_id,
                u.name AS customer_name,
                u.email AS customer_email,
                o.total_amount,
                o.status,
                o.address,
                o.ordered_at

            FROM orders o

            JOIN users u
                ON o.user_id = u.id

            ORDER BY o.ordered_at DESC
            """
        )

        orders = cursor.fetchall()

        # --------------------------------
        # 5. Get items for every order
        # --------------------------------
        for order in orders:

            cursor.execute(
                """
                SELECT
                    oi.product_id,
                    p.name AS product_name,
                    oi.quantity,
                    oi.unit_price

                FROM order_items oi

                LEFT JOIN products p
                    ON oi.product_id = p.id

                WHERE oi.order_id = %s
                """,
                (order["id"],)
            )

            items = cursor.fetchall()

            order["items"] = items

        return jsonify({
            "success": True,
            "data": orders
        }), 200

    except Error as e:

        print("Admin Orders Error:", e)

        return jsonify({
            "success": False,
            "message": "Unable to fetch orders"
        }), 500

    finally:

        if cursor:
            cursor.close()

        if db:
            db.close()
            
# =========================================
# 15. ADMIN - UPDATE ORDER STATUS
# =========================================

@app.route("/api/orders/<int:order_id>/status", methods=["PUT"])
def update_order_status(order_id):

    # --------------------------------
    # 1. Check login
    # --------------------------------
    if "user_id" not in session:

        return jsonify({
            "success": False,
            "message": "Login required"
        }), 401

    # --------------------------------
    # 2. Check admin role
    # --------------------------------
    if session.get("role") != "admin":

        return jsonify({
            "success": False,
            "message": "Admin access required"
        }), 403

    db = None
    cursor = None

    try:

        # --------------------------------
        # 3. Read JSON body
        # --------------------------------
        data = request.get_json()

        status = data.get("status")

        # --------------------------------
        # 4. Allowed status values
        # --------------------------------
        allowed_statuses = [
            "Pending",
            "Confirmed",
            "Shipped",
            "Delivered",
            "Cancelled"
        ]

        # --------------------------------
        # 5. Validate status
        # --------------------------------
        if not status:

            return jsonify({
                "success": False,
                "message": "Status is required"
            }), 400

        if status not in allowed_statuses:

            return jsonify({
                "success": False,
                "message": "Invalid order status"
            }), 400

        # --------------------------------
        # 6. Connect to database
        # --------------------------------
        db = get_db()

        cursor = db.cursor(dictionary=True)

        # --------------------------------
        # 7. Check order exists
        # --------------------------------
        cursor.execute(
            """
            SELECT id, status
            FROM orders
            WHERE id = %s
            """,
            (order_id,)
        )

        order = cursor.fetchone()

        if not order:

            return jsonify({
                "success": False,
                "message": "Order not found"
            }), 404

        # --------------------------------
        # 8. Update status
        # --------------------------------
        cursor.execute(
            """
            UPDATE orders
            SET status = %s
            WHERE id = %s
            """,
            (
                status,
                order_id
            )
        )

        # --------------------------------
        # 9. Save changes
        # --------------------------------
        db.commit()

        return jsonify({
            "success": True,
            "message": "Order status updated successfully",
            "order_id": order_id,
            "status": status
        }), 200

    except Error as e:

        print("Order Status Error:", e)

        return jsonify({
            "success": False,
            "message": "Unable to update order status"
        }), 500

    finally:

        if cursor:
            cursor.close()

        if db:
            db.close()            

# =========================================
# 16. ADMIN - UPLOAD PRODUCT IMAGE
# =========================================

@app.route("/api/upload/product-image", methods=["POST"])
def upload_product_image():

    # Only a logged-in administrator may upload product photos.
    if "user_id" not in session:
        return jsonify({
            "success": False,
            "message": "Login required"
        }), 401

    if session.get("role") != "admin":
        return jsonify({
            "success": False,
            "message": "Admin access required"
        }), 403

    # The React FormData field must be named "image".
    if "image" not in request.files:
        return jsonify({
            "success": False,
            "message": "Image file is required"
        }), 400

    image = request.files["image"]

    if not image.filename:
        return jsonify({
            "success": False,
            "message": "Please select an image"
        }), 400

    if not allowed_file(image.filename):
        return jsonify({
            "success": False,
            "message": "Only PNG, JPG, JPEG and WEBP images are allowed"
        }), 400

    safe_name = secure_filename(image.filename)
    extension = safe_name.rsplit(".", 1)[1].lower()
    unique_name = f"{uuid.uuid4().hex}.{extension}"

    image_path = os.path.join(
        app.config["UPLOAD_FOLDER"],
        unique_name
    )

    try:
        image.save(image_path)
    except OSError as error:
        print("Image Upload Error:", error)
        return jsonify({
            "success": False,
            "message": "Unable to save image"
        }), 500

    image_url = (
        f"{request.host_url.rstrip('/')}"
        f"/uploads/{unique_name}"
    )

    return jsonify({
        "success": True,
        "message": "Image uploaded successfully",
        "image_url": image_url
    }), 201


# =========================================
# 17. DISPLAY UPLOADED PRODUCT IMAGE
# =========================================

@app.route("/uploads/<path:filename>", methods=["GET"])
def display_uploaded_image(filename):
    return send_from_directory(
        app.config["UPLOAD_FOLDER"],
        filename
    )


@app.errorhandler(413)
def image_too_large(error):
    return jsonify({
        "success": False,
        "message": "Image size must be 5 MB or less"
    }), 413


if __name__ == "__main__":
    app.run(debug=True)