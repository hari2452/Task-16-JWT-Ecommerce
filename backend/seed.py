from config import get_db
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()

db = get_db()
cursor = db.cursor()

# -------------------------
# Categories
# -------------------------

categories = [
    ("Electronics",),
    ("Fashion",),
    ("Home & Kitchen",),
    ("Books",)
]

for category in categories:
    cursor.execute(
        "INSERT IGNORE INTO categories (name) VALUES (%s)",
        category
    )

db.commit()


# -------------------------
# Products
# -------------------------

products = [
    (
        "Wireless Headphones",
        "Bluetooth wireless headphones with clear sound.",
        2499.00,
        15,
        1,
        "https://via.placeholder.com/300"
    ),

    (
        "Smart Watch",
        "Fitness tracking smart watch.",
        3999.00,
        12,
        1,
        "https://via.placeholder.com/300"
    ),

    (
        "Bluetooth Speaker",
        "Portable Bluetooth speaker.",
        1999.00,
        20,
        1,
        "https://via.placeholder.com/300"
    ),

    (
        "Wireless Mouse",
        "Ergonomic wireless mouse.",
        799.00,
        25,
        1,
        "https://via.placeholder.com/300"
    ),

    (
        "Mechanical Keyboard",
        "RGB mechanical keyboard.",
        3499.00,
        10,
        1,
        "https://via.placeholder.com/300"
    ),

    (
        "Men T-Shirt",
        "Comfortable cotton T-shirt.",
        699.00,
        30,
        2,
        "https://via.placeholder.com/300"
    ),

    (
        "Men Jeans",
        "Slim fit denim jeans.",
        1499.00,
        20,
        2,
        "https://via.placeholder.com/300"
    ),

    (
        "Women Kurti",
        "Traditional printed kurti.",
        1299.00,
        18,
        2,
        "https://via.placeholder.com/300"
    ),

    (
        "Casual Shoes",
        "Comfortable casual shoes.",
        1899.00,
        16,
        2,
        "https://via.placeholder.com/300"
    ),

    (
        "Backpack",
        "Water-resistant travel backpack.",
        1199.00,
        25,
        2,
        "https://via.placeholder.com/300"
    ),

    (
        "Mixer Grinder",
        "Powerful kitchen mixer grinder.",
        2999.00,
        10,
        3,
        "https://via.placeholder.com/300"
    ),

    (
        "Electric Kettle",
        "Fast boiling electric kettle.",
        1299.00,
        15,
        3,
        "https://via.placeholder.com/300"
    ),

    (
        "Cookware Set",
        "Non-stick cookware set.",
        2499.00,
        14,
        3,
        "https://via.placeholder.com/300"
    ),

    (
        "Table Lamp",
        "LED study table lamp.",
        899.00,
        20,
        3,
        "https://via.placeholder.com/300"
    ),

    (
        "Storage Box",
        "Multipurpose storage organizer.",
        599.00,
        35,
        3,
        "https://via.placeholder.com/300"
    ),

    (
        "Python Programming",
        "Beginner friendly Python programming book.",
        599.00,
        25,
        4,
        "https://via.placeholder.com/300"
    ),

    (
        "JavaScript Guide",
        "Complete JavaScript learning guide.",
        699.00,
        18,
        4,
        "https://via.placeholder.com/300"
    ),

    (
        "React Basics",
        "Learn React from fundamentals.",
        799.00,
        15,
        4,
        "https://via.placeholder.com/300"
    ),

    (
        "Flask Development",
        "Build Python web applications using Flask.",
        749.00,
        12,
        4,
        "https://via.placeholder.com/300"
    ),

    (
        "MySQL Handbook",
        "Database fundamentals using MySQL.",
        649.00,
        20,
        4,
        "https://via.placeholder.com/300"
    ),
]

query = """
INSERT INTO products
(name, description, price, stock, category_id, image_url)
VALUES (%s, %s, %s, %s, %s, %s)
"""

cursor.executemany(query, products)


# -------------------------
# Admin Account
# -------------------------

admin_password = bcrypt.generate_password_hash(
    "admin123"
).decode("utf-8")

cursor.execute(
    """
    INSERT IGNORE INTO users
    (name, email, password, role)
    VALUES (%s, %s, %s, %s)
    """,
    (
        "Admin",
        "admin@shop.com",
        admin_password,
        "admin"
    )
)

db.commit()

cursor.close()
db.close()

print("Seed data inserted successfully!")