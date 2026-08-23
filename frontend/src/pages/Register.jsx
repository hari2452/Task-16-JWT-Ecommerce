import {
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import api from "../api";


function Register() {
  const navigate = useNavigate();


  const [formData, setFormData] =
    useState({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });


  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  // =====================================
  // HANDLE INPUT CHANGE
  // =====================================

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;


    setFormData(
      (currentData) => ({
        ...currentData,
        [name]: value,
      })
    );
  };


  // =====================================
  // REGISTER CUSTOMER
  // =====================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");


    const name =
      formData.name.trim();

    const email =
      formData.email
        .trim()
        .toLowerCase();


    if (!name) {
      setError(
        "Name is required"
      );

      return;
    }


    if (!email) {
      setError(
        "Email is required"
      );

      return;
    }


    if (
      formData.password.length < 6
    ) {
      setError(
        "Password must contain at least 6 characters"
      );

      return;
    }


    if (
      formData.password !==
      formData.confirmPassword
    ) {
      setError(
        "Passwords do not match"
      );

      return;
    }


    try {
      setLoading(true);


      await api.post(
        "/api/register",
        {
          name,
          email,
          password:
            formData.password,
        }
      );


      setSuccess(
        "Registration successful! Redirecting to login..."
      );


      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });


      setTimeout(() => {
        navigate(
          "/login",
          {
            replace: true,
          }
        );
      }, 1500);


    } catch (err) {
      console.log(
        "Registration Error:",
        err
      );


      setError(
        err.response?.data?.message ||
        "Unable to register. Please try again."
      );


    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="auth-page">

      <div className="auth-card">

        <div className="auth-brand">
          <span>🛍️</span>

          <p>
            Join ShopZone
          </p>
        </div>


        <h1>
          Create Account
        </h1>


        <p>
          Register to start shopping and
          track your orders.
        </p>


        {error && (
          <div className="error-message">
            {error}
          </div>
        )}


        {success && (
          <div className="success-message">
            {success}
          </div>
        )}


        <form onSubmit={handleSubmit}>

          {/* NAME */}

          <div className="form-group">

            <label htmlFor="register-name">
              Full Name
            </label>


            <input
              id="register-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              autoComplete="name"
              disabled={loading}
              required
            />

          </div>


          {/* EMAIL */}

          <div className="form-group">

            <label htmlFor="register-email">
              Email Address
            </label>


            <input
              id="register-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              autoComplete="email"
              disabled={loading}
              required
            />

          </div>


          {/* PASSWORD */}

          <div className="form-group">

            <label htmlFor="register-password">
              Password
            </label>


            <div className="password-input-wrapper">

              <input
                id="register-password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                autoComplete="new-password"
                disabled={loading}
                minLength="6"
                required
              />


              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(
                    (current) =>
                      !current
                  )
                }
              >
                {showPassword
                  ? "Hide"
                  : "Show"}
              </button>

            </div>

          </div>


          {/* CONFIRM PASSWORD */}

          <div className="form-group">

            <label htmlFor="confirm-password">
              Confirm Password
            </label>


            <input
              id="confirm-password"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              name="confirmPassword"
              value={
                formData.confirmPassword
              }
              onChange={handleChange}
              placeholder="Enter password again"
              autoComplete="new-password"
              disabled={loading}
              required
            />

          </div>


          {/* SUBMIT */}

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >

            {loading
              ? "Creating Account..."
              : "Create Account"}

          </button>

        </form>


        <div className="auth-footer">

          <p>
            Already have an account?{" "}

            <Link to="/login">
              Login
            </Link>
          </p>

        </div>

      </div>

    </div>
  );
}


export default Register;