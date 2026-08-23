import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

function Navbar() {
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const { cartCount } = useCart();

  const handleLogout = async () => {
    try {
      await logout();

      navigate("/login");
    } catch (error) {
      console.log("Logout Error:", error);
    }
  };

  return (
    <nav className="navbar">

      <div className="navbar-left">

        <Link to="/" className="logo">
          ShopZone
        </Link>

      </div>


      <div className="navbar-links">

        <Link to="/">
          Home
        </Link>

        <Link to="/cart">
          Cart ({cartCount})
        </Link>


        {user && (
          <Link to="/orders">
            My Orders
          </Link>
        )}


        {user?.role === "admin" && (
          <>
            <Link to="/admin/products">
              Admin Products
            </Link>

            <Link to="/admin/orders">
              Admin Orders
            </Link>
          </>
        )}

      </div>


      <div className="navbar-right">

        {!user ? (
          <>
            <Link to="/login">
              Login
            </Link>

            <Link to="/register">
              Register
            </Link>
          </>
        ) : (
          <>
            <span>
              Hi, {user.name}
            </span>

            <button onClick={handleLogout}>
              Logout
            </button>
          </>
        )}

      </div>

    </nav>
  );
}

export default Navbar;