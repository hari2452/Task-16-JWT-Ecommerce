import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
});

// ======================================================
// REQUEST INTERCEPTOR
// Automatically attach access token to every API request
// ======================================================

api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("access_token");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


// ======================================================
// RESPONSE INTERCEPTOR
// If access token expires, use refresh token
// to get a new access token and retry the request
// ======================================================

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Access token expired / unauthorized
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/api/login") &&
      !originalRequest.url?.includes("/api/refresh")
    ) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refresh_token");

      if (!refreshToken) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        return Promise.reject(error);
      }

      try {
        // Use normal axios here to avoid interceptor loop
        const response = await axios.post(
          "http://localhost:5000/api/refresh",
          {},
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          }
        );

        const newAccessToken = response.data.access_token;

        // Store new access token
        localStorage.setItem("access_token", newAccessToken);

        // Add new token to failed request
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        // Retry original request
        return api(originalRequest);

      } catch (refreshError) {
        // Refresh token also expired / invalid
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        window.location.href = "/login";

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;