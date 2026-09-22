import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


function Login() {

  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] =
    useState(false);


  // =====================================
  // HANDLE INPUT CHANGE
  // =====================================

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

  };


  // =====================================
  // HANDLE LOGIN
  // =====================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");
    setLoading(true);

    try {

      const result = await login(
        formData.email,
        formData.password
      );


      // ADMIN
      if (result.user.role === "admin") {

        navigate("/admin/products");

      } else {

        // CUSTOMER
        navigate("/");
      }

    } catch (err) {

      setError(
        err.response?.data?.message ||
        err.response?.data?.msg ||
        "Login failed"
      );

    } finally {

      setLoading(false);
    }
  };


  return (

    <div className="peach-auth-page">


      {/* DECORATIVE BACKGROUND */}

      <div className="auth-decoration auth-decoration-one" />

      <div className="auth-decoration auth-decoration-two" />

      <div className="auth-decoration auth-decoration-three" />



      {/* =====================================
          MAIN LOGIN CARD
      ===================================== */}

      <div className="peach-auth-container">


        {/* =====================================
            LEFT DESIGN PANEL
        ===================================== */}

        <div className="peach-auth-showcase">


          <div className="auth-showcase-shine" />


          {/* BRAND */}

          <Link
            to="/"
            className="auth-brand"
          >

            <div className="auth-brand-logo">
              S
            </div>

            <div>

              <strong>
                ShopZone
              </strong>

              <span>
                Beautiful Shopping
              </span>

            </div>

          </Link>



          {/* MAIN CONTENT */}

          <div className="auth-showcase-content">

            <span className="auth-small-title">
              ✦ WELCOME BACK
            </span>


            <h1>
              Find something
              <span>
                {" "}you love.
              </span>
            </h1>


            <p>
              Sign in and continue exploring
              beautiful products selected for
              your everyday lifestyle.
            </p>


            <div className="auth-feature-list">


              <div className="auth-feature">

                <div>
                  ♡
                </div>

                <span>
                  <strong>
                    Beautiful Products
                  </strong>

                  Carefully selected for you
                </span>

              </div>


              <div className="auth-feature">

                <div>
                  ✓
                </div>

                <span>
                  <strong>
                    Secure Shopping
                  </strong>

                  Safe and simple experience
                </span>

              </div>


              <div className="auth-feature">

                <div>
                  ✦
                </div>

                <span>
                  <strong>
                    Easy Ordering
                  </strong>

                  Shop without the hassle
                </span>

              </div>

            </div>

          </div>



          {/* FLOATING CARD */}

          <div className="auth-floating-card">

            <span>
              🛍️
            </span>

            <div>

              <small>
                SHOPZONE
              </small>

              <strong>
                Happy Shopping!
              </strong>

            </div>

          </div>

        </div>



        {/* =====================================
            RIGHT LOGIN FORM
        ===================================== */}

        <div className="peach-auth-form-side">


          <div className="peach-auth-form">


            {/* HEADING */}

            <div className="auth-form-heading">

              <span className="auth-form-small">
                WELCOME BACK
              </span>


              <h2>
                Hello again!
              </h2>


              <p>
                Enter your details to access
                your ShopZone account.
              </p>

            </div>



            {/* ERROR */}

            {error && (

              <div className="peach-auth-error">

                <span>
                  !
                </span>

                <div>

                  <strong>
                    Login unsuccessful
                  </strong>

                  <p>
                    {error}
                  </p>

                </div>

              </div>

            )}



            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="peach-login-form"
            >


              {/* EMAIL */}

              <div className="peach-form-group">

                <label htmlFor="login-email">
                  Email Address
                </label>


                <div className="peach-input-wrapper">

                  <span className="peach-input-icon">
                    @
                  </span>


                  <input
                    id="login-email"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                  />

                </div>

              </div>



              {/* PASSWORD */}

              <div className="peach-form-group">

                <div className="password-label-row">

                  <label htmlFor="login-password">
                    Password
                  </label>

                  <span className="secure-text">
                    Secure Login
                  </span>

                </div>


                <div className="peach-input-wrapper">

                  <span className="peach-input-icon">
                    ◇
                  </span>


                  <input
                    id="login-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    required
                  />


                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >

                    {showPassword
                      ? "Hide"
                      : "Show"
                    }

                  </button>

                </div>

              </div>



              {/* LOGIN BUTTON */}

              <button
                type="submit"
                className="peach-auth-button"
                disabled={loading}
              >

                {loading ? (

                  <>
                    <span className="auth-button-loader" />

                    Signing you in...
                  </>

                ) : (

                  <>
                    Sign In

                    <span className="auth-button-arrow">
                      →
                    </span>
                  </>

                )}

              </button>

            </form>



            {/* DIVIDER */}

            <div className="auth-divider">

              <span />

              <p>
                New to ShopZone?
              </p>

              <span />

            </div>



            {/* REGISTER */}

            <Link
              to="/register"
              className="create-account-button"
            >
              Create an Account
            </Link>



            {/* FOOTER */}

            <p className="auth-security-note">
              🔒 Your login is protected with
              secure authentication.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}


export default Login;