// import { useState } from "react";
// import "./register.scss";
// import { Link, useNavigate } from "react-router-dom";
// import axios from "axios";
// import apiRequest from "../../lib/apiRequest";

// function Register() {
//   const [error, setError] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const navigate = useNavigate();
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError("");
//     const formData = new FormData(e.target);

//     const username = formData.get("username");
//     const email = formData.get("email");
//     const password = formData.get("password");

//     try {
//       const res = await apiRequest.post("/auth/register", {
//         username,
//         email,
//         password,
//       });
//       console.log(res.data);
//       navigate("/login");
//     } catch (error) {
//       console.log(error);
//       setError(error.response.data.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };
//   return (
//     <div className="register">
//       <div className="formContainer">
//         <form onSubmit={handleSubmit}>
//           <h1>Create an Account</h1>
//           <input
//             name="username"
//             type="text"
//             minLength={3}
//             maxLength={20}
//             placeholder="Username"
//           />
//           <input name="email" type="email" placeholder="Email" />
//           <input
//             name="password"
//             type="password"
//             placeholder="Password"
//             minLength={6}
//           />
//           <button disabled={isLoading}>Register</button>
//           {error && <span>{error}</span>}
//           <Link to="/login">Do you have an account?</Link>
//         </form>
//       </div>
//       <div className="imgContainer">
//         <img src="/bg.png" alt="" />
//       </div>
//     </div>
//   );
// }

// export default Register;

import { useState } from "react";
import "./register.scss";
import { Link, useNavigate } from "react-router-dom";
import apiRequest from "../../lib/apiRequest";

function Register() {
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validate = (username, email, password) => {
    const errors = {};

    if (!username) errors.username = "Username is required.";
    else if (username.length < 3) errors.username = "Username is too short.";
    else if (username.length > 20) errors.username = "Username is too long.";

    if (!email) errors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email))
      errors.email = "Invalid email format.";

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
    const email = formData.get("email").trim();
    const password = formData.get("password").trim();

    const errors = validate(username, email, password);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsLoading(false);
      return;
    }

    try {
      const res = await apiRequest.post("/auth/register", {
        username,
        email,
        password,
      });
      console.log(res.data);
      navigate("/login");
    } catch (err) {
      console.log(err);
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register">
      <div className="formContainer">
        <form onSubmit={handleSubmit}>
          <h1>Create an Account</h1>

          <input name="username" type="text" placeholder="Username" />
          {formErrors.username && (
            <span className="error">{formErrors.username}</span>
          )}

          <input name="email" type="email" placeholder="Email" />
          {formErrors.email && (
            <span className="error">{formErrors.email}</span>
          )}

          <input name="password" type="password" placeholder="Password" />
          {formErrors.password && (
            <span className="error">{formErrors.password}</span>
          )}

          <button disabled={isLoading}>Register</button>
          {error && <span className="error">{error}</span>}
          <Link to="/login">Do you have an account?</Link>
        </form>
      </div>
      <div className="imgContainer">
        <img src="/bg.png" alt="" />
      </div>
    </div>
  );
}

export default Register;
