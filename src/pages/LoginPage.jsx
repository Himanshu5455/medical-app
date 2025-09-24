import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from '../services/api'; 

const LoginPage = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     console.log("Payload:", {
//   username: formData.username,
//   password: formData.password,
// });

//     try {
//       const result = await loginUser({
//         username: formData.username,
//         password: formData.password,
//       });

//       console.log("Login success:", result);

//       if (result.success) {
//         // Optional: store token if returned
//         // localStorage.setItem("token", result.token);

//         navigate("/login/dashboard");
//       } else {
//         setError(result.message || "Invalid username or password");
//       }
//     } catch (err) {
//       console.error("Login error:", err);
//       setError(err.message || "Something went wrong");
//     }
//      finally {
//       setLoading(false);
//     }
//   };


const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const result = await loginUser(
      {
        username: formData.username,
        password: formData.password,
      },
      true // 👈 change to false if backend expects JSON
    );

    console.log("Login response:", result);

    if (result?.access_token) {
      localStorage.setItem("token", result.access_token);
      navigate("/login/dashboard");
    } else {
      setError("Invalid username or password");
    }
  } catch (err) {
    console.error("Login error:", err);
    setError(err.message || "Something went wrong");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-[600px]">
        <h1 className="text-center text-[35px] font-bold mb-4">MFC Admin Dashboard</h1>

        <div className="bg-white shadow-xl rounded-xl p-8">
          <h2 className="mb-4 text-[25px] font-bold">Staff Login</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              className="w-full py-3 px-4 border rounded-md focus:ring-2 focus:ring-blue-400"
            />

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full py-3 px-4 border rounded-md focus:ring-2 focus:ring-blue-400"
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-900 text-white py-3 font-semibold rounded-md hover:bg-blue-700 transition"
            >
              {loading ? "Logging in..." : "LOGIN"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

