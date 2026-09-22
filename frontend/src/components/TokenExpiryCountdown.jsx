import { useEffect, useState } from "react";

function TokenExpiryCountdown() {

  const [timeLeft, setTimeLeft] = useState("");
  const [isExpired, setIsExpired] = useState(false);


  // ============================================
  // DECODE JWT PAYLOAD
  // ============================================
  const decodeToken = (token) => {

    try {

      const base64Url = token.split(".")[1];

      if (!base64Url) {
        return null;
      }

      // Convert Base64URL → Base64
      let base64 = base64Url
        .replace(/-/g, "+")
        .replace(/_/g, "/");


      // Add required padding
      while (base64.length % 4) {
        base64 += "=";
      }


      const decodedPayload =
        decodeURIComponent(
          atob(base64)
            .split("")
            .map((character) => {

              return (
                "%" +
                ("00" +
                  character
                    .charCodeAt(0)
                    .toString(16)
                ).slice(-2)
              );

            })
            .join("")
        );


      return JSON.parse(decodedPayload);

    } catch (error) {

      console.log(
        "JWT decode error:",
        error
      );

      return null;
    }
  };


  // ============================================
  // UPDATE COUNTDOWN
  // ============================================
  useEffect(() => {

    const updateCountdown = () => {

      // Read token every second.
      // This is useful because api.js may replace
      // access_token after automatic refresh.

      const token =
        localStorage.getItem("access_token");


      if (!token) {

        setTimeLeft("");
        setIsExpired(false);

        return;
      }


      const decodedToken =
        decodeToken(token);


      if (!decodedToken?.exp) {

        setTimeLeft("");
        return;
      }


      // JWT exp is stored in seconds.
      // Date.now() uses milliseconds.

      const expiryTime =
        decodedToken.exp * 1000;


      const currentTime =
        Date.now();


      const remaining =
        expiryTime - currentTime;


      // Token has expired
      if (remaining <= 0) {

        setTimeLeft("00:00");
        setIsExpired(true);

        return;
      }


      setIsExpired(false);


      // Convert milliseconds → seconds
      const totalSeconds =
        Math.floor(remaining / 1000);


      const minutes =
        Math.floor(totalSeconds / 60);


      const seconds =
        totalSeconds % 60;


      // Example:
      // 14:05 instead of 14:5

      const formattedSeconds =
        seconds
          .toString()
          .padStart(2, "0");


      setTimeLeft(
        `${minutes}:${formattedSeconds}`
      );

    };


    // Run immediately
    updateCountdown();


    // Update every second
    const interval =
      setInterval(
        updateCountdown,
        1000
      );


    // Cleanup interval
    return () => {

      clearInterval(interval);

    };

  }, []);


  // Don't show anything when logged out
  if (!timeLeft) {
    return null;
  }


  return (

    <div
      className={
        isExpired
          ? "token-expiry token-expired"
          : "token-expiry"
      }
    >

      <span className="token-expiry-label">
        Session
      </span>

      <span className="token-expiry-time">
        {isExpired
          ? "Expired"
          : timeLeft}
      </span>

    </div>

  );
}

export default TokenExpiryCountdown;