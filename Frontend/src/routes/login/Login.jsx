// import { useState } from "react";
// import "./login.scss";
// import { Link, useNavigate } from "react-router-dom";
// import axios from "axios";
// import apiRequest from "../../lib/apiRequest";
// import { useContext } from "react";
// import { AuthContext } from "../../context/AuthContext";

// function Login() {
//   const [error, setError] = useState("");
//   const [isLoading, setIsLoading] = useState(false);

//   const { updateUser } = useContext(AuthContext);
//   const navigate = useNavigate();
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError("");
//     const formData = new FormData(e.target);

//     const username = formData.get("username");
//     const password = formData.get("password");

//     try {
//       const res = await apiRequest.post("/auth/login", {
//         username,
//         password,
//       });
//       // localStorage.setItem("user", JSON.stringify(res.data));
//       updateUser(res.data);
//       navigate("/");
//     } catch (error) {
//       console.log(error);
//       setError(error.response.data.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };
//   return (
//     <div className="login">
//       <div className="formContainer">
//         <form onSubmit={handleSubmit}>
//           <h1>Welcome back</h1>
//           <input
//             name="username"
//             required
//             minLength={3}
//             maxLength={20}
//             type="text"
//             placeholder="Username"
//           />
//           <input
//             name="password"
//             type="password"
//             required
//             placeholder="Password"
//           />
//           <button disabled={isLoading}>Login</button>
//           {error && <span>{error}</span>}
//           <Link to="/register">{"Don't"} you have an account?</Link>
//         </form>
//       </div>
//       <div className="imgContainer">
//         <img src="/bg.png" alt="" />
//       </div>
//     </div>
//   );
// }

// export default Login;

import { useState, useContext } from "react";
import "./login.scss";
import { Link, useNavigate } from "react-router-dom";
import apiRequest from "../../lib/apiRequest";
import { AuthContext } from "../../context/AuthContext";

function Login() {
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { updateUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const validate = (username, password) => {
    const errors = {};
    if (!username) errors.username = "Username is required.";
    else if (username.length < 3) errors.username = "Username is too short.";
    else if (username.length > 20) errors.username = "Username is too long.";

    if (!password) errors.password = "Password is required.";
    else if (password.length < 6)
      errors.password = "Password must be at least 6 characters.";

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFormErrors({});
    setIsLoading(true);

    const formData = new FormData(e.target);
    const username = formData.get("username").trim();
    const password = formData.get("password").trim();

    const errors = validate(username, password);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsLoading(false);
      return;
    }

    try {
      const res = await apiRequest.post("/auth/login", { username, password });
      updateUser(res.data);
      navigate("/");
    } catch (err) {
      console.log(err);
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="formContainer">
        <form onSubmit={handleSubmit}>
          <h1>Welcome back</h1>

          <input
            name="username"
            type="text"
            placeholder="Username"
            autoComplete="username"
          />
          {formErrors.username && (
            <span className="error">{formErrors.username}</span>
          )}

          <input
            name="password"
            type="password"
            placeholder="Password"
            autoComplete="current-password"
          />
          {formErrors.password && (
            <span className="error">{formErrors.password}</span>
          )}

          <button disabled={isLoading}>Login</button>
          {error && <span className="error">{error}</span>}
          <Link to="/register">{"Don't"} you have an account?</Link>
        </form>
      </div>
      <div className="imgContainer">
        <img src="/bg.png" alt="" />
      </div>
    </div>
  );
}

export default Login;
